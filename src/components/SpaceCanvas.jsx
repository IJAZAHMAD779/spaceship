import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SUN_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewDir;

  void main() {
    vPosition = position;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const SUN_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewDir;

  // Compact 3D value noise for solar convection cells
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.06 + vec3(0.17, 0.31, 0.11);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vPosition) * 3.4;
    float n1 = fbm(p + vec3(uTime * 0.06, -uTime * 0.04, uTime * 0.03));
    float n2 = fbm(p * 2.3 - vec3(uTime * 0.09, uTime * 0.05, 0.0) + n1 * 1.15);
    float plasma = clamp(n1 * 0.55 + n2 * 0.55, 0.0, 1.0);

    float ndotv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
    float limb = pow(ndotv, 0.42);
    float rim = pow(1.0 - ndotv, 2.8);

    vec3 deepRed = vec3(0.45, 0.08, 0.01);
    vec3 solarAmber = vec3(0.96, 0.48, 0.05);
    vec3 whiteHot = vec3(1.0, 0.93, 0.72);

    vec3 col = mix(deepRed, solarAmber, smoothstep(0.22, 0.68, plasma));
    col = mix(col, whiteHot, smoothstep(0.66, 0.96, plasma));
    col *= (0.45 + 0.75 * limb);
    col += vec3(1.0, 0.62, 0.18) * rim * (0.65 + 0.55 * uIntensity);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const CORONA_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const CORONA_FRAG = /* glsl */ `
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float ndotv = abs(dot(normalize(vNormal), normalize(vViewDir)));
    float glow = pow(clamp(1.0 - ndotv, 0.0, 1.0), 3.4);
    float alpha = glow * (0.55 + 0.45 * uIntensity);
    vec3 color = mix(vec3(0.95, 0.35, 0.04), vec3(1.0, 0.80, 0.35), glow);
    gl_FragColor = vec4(color, alpha);
  }
`;

const STAR_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  uniform float uWarp;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Slight size boost during scroll warp
    gl_PointSize = aSize * uPixelRatio * (1.0 + uWarp * 0.8) * (160.0 / max(-mvPosition.z, 10.0));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const STAR_FRAG = /* glsl */ `
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, soft * 0.92);
  }
`;

export default function SpaceCanvas({ scrollStateRef, activeSubsystem }) {
  const mountRef = useRef(null);
  const subsystemRef = useRef(activeSubsystem);

  useEffect(() => {
    subsystemRef.current = activeSubsystem;
  }, [activeSubsystem]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050608, 0.0045);

    const camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / container.clientHeight,
      0.1,
      400
    );
    camera.position.set(3.2, 1.3, 8.8);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      return undefined;
    }
    renderer.setClearColor(0x050608, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1d2638, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffb454, 4.5, 160, 1.3);
    sunLight.position.set(-14, 2, -26);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x56b4ff, 1.15);
    rimLight.position.set(8, 6, 10);
    scene.add(rimLight);

    // -----------------------------------------------------------------------
    // 1. STARFIELD
    // -----------------------------------------------------------------------
    const starCount = 3200;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starColors = new Float32Array(starCount * 3);
    const palette = [
      new THREE.Color('#E8EEFF'),
      new THREE.Color('#FFF1D6'),
      new THREE.Color('#B5D8FF'),
      new THREE.Color('#FFD29D'),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 35 + Math.random() * 145;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi) - 20;
      starSizes[i] = 0.8 + Math.random() * 2.2;
      const c = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
    starGeo.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uWarp: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // -----------------------------------------------------------------------
    // 2. PROCEDURAL GLSL SUN & CORONA
    // -----------------------------------------------------------------------
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-14, 1.8, -34);
    scene.add(sunGroup);

    const sunMat = new THREE.ShaderMaterial({
      vertexShader: SUN_VERT,
      fragmentShader: SUN_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.4 },
      },
    });
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(9.5, 64, 64), sunMat);
    sunGroup.add(sunMesh);

    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: CORONA_VERT,
      fragmentShader: CORONA_FRAG,
      uniforms: {
        uIntensity: { value: 0.4 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(new THREE.SphereGeometry(12.6, 48, 48), coronaMat);
    sunGroup.add(coronaMesh);

    // Subtle prominence arc loops on the solar limb
    const prominenceMat = new THREE.MeshBasicMaterial({
      color: 0xff8a2b,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    });
    const prominenceCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(6.2, 6.2, 2.2),
        new THREE.Vector3(9.4, 8.8, 3.4),
        new THREE.Vector3(10.6, 4.9, 1.8),
        new THREE.Vector3(8.1, 2.6, 1.2),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(7.4, -3.5, 4.5),
        new THREE.Vector3(10.2, -2.1, 5.8),
        new THREE.Vector3(9.1, 1.3, 4.4),
      ]),
    ];
    prominenceCurves.forEach((curve) => {
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.11, 8, false), prominenceMat);
      sunGroup.add(tube);
    });

    // Subtle orbital path spline
    const orbitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(12, -3, 18),
      new THREE.Vector3(4, -1.2, 4),
      new THREE.Vector3(-4.5, 0.2, -12),
      new THREE.Vector3(-8.5, 1.4, -21),
    ]);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitCurve.getPoints(90));
    const orbitLine = new THREE.Line(
      orbitGeo,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22 })
    );
    scene.add(orbitLine);

    // -----------------------------------------------------------------------
    // 3. PROCEDURAL ASTRAL CRUISER 5000 (4 EXPLODABLE SUBSYSTEMS)
    // -----------------------------------------------------------------------
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // Shared materials
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x222834,
      metalness: 0.72,
      roughness: 0.34,
    });
    const darkAlloyMat = new THREE.MeshStandardMaterial({
      color: 0x11151d,
      metalness: 0.85,
      roughness: 0.28,
    });
    const goldShieldMat = new THREE.MeshStandardMaterial({
      color: 0xd99b26,
      metalness: 0.9,
      roughness: 0.22,
      emissive: 0x3b1e00,
      emissiveIntensity: 0.35,
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x17191e,
      metalness: 0.35,
      roughness: 0.65,
    });
    const cyanEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });
    const amberEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.1,
      roughness: 0.3,
    });

    // Central spine (always stays centered)
    const spineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.4, 16), darkAlloyMat);
    spineMesh.rotation.z = Math.PI / 2;
    shipGroup.add(spineMesh);

    // Sub-assembly 1: Carbon-Composite Heat Shield (+X forward)
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(2.15, 0, 0);
    const shieldBody = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.42, 0.26, 6), carbonMat);
    shieldBody.rotation.z = Math.PI / 2;
    shieldGroup.add(shieldBody);

    const shieldFrontFace = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.06, 6), goldShieldMat);
    shieldFrontFace.rotation.z = Math.PI / 2;
    shieldFrontFace.position.x = 0.13;
    shieldGroup.add(shieldFrontFace);

    const shieldRim = new THREE.Mesh(new THREE.TorusGeometry(1.56, 0.035, 8, 6), amberEmissiveMat);
    shieldRim.rotation.y = Math.PI / 2;
    shieldRim.position.x = 0.1;
    shieldGroup.add(shieldRim);
    shipGroup.add(shieldGroup);

    // Sub-assembly 2: Centrifugal 1-G Habitation Ring (center)
    const habGroup = new THREE.Group();
    habGroup.position.set(0.25, 0, 0);
    const habSpinGroup = new THREE.Group();
    const habRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.18, 16, 48), hullMat);
    habRing.rotation.y = Math.PI / 2;
    habSpinGroup.add(habRing);

    // Spokes & window bays on ring
    for (let i = 0; i < 4; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.24, 0.1), darkAlloyMat);
      spoke.rotation.x = (i * Math.PI) / 4;
      habSpinGroup.add(spoke);
    }
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const bay = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.16), amberEmissiveMat);
      bay.position.set(0.12, Math.cos(angle) * 1.15, Math.sin(angle) * 1.15);
      bay.rotation.x = angle;
      habSpinGroup.add(bay);
    }
    habGroup.add(habSpinGroup);
    shipGroup.add(habGroup);

    // Sub-assembly 3: Dual-Phase Ion Fusion Drive (-X aft)
    const engineGroup = new THREE.Group();
    engineGroup.position.set(-2.05, 0, 0);
    const aftBlock = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 1.15, 12), hullMat);
    aftBlock.rotation.z = Math.PI / 2;
    engineGroup.add(aftBlock);

    const plumeMeshes = [];
    const nozzleOffsets = [
      [0.34, 0.34],
      [0.34, -0.34],
      [-0.34, 0.34],
      [-0.34, -0.34],
    ];
    nozzleOffsets.forEach(([ny, nz]) => {
      const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 0.45, 16), darkAlloyMat);
      bell.rotation.z = Math.PI / 2;
      bell.position.set(-0.7, ny, nz);
      engineGroup.add(bell);

      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const plume = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.5, 16), plumeMat);
      plume.rotation.z = -Math.PI / 2;
      plume.position.set(-1.58, ny, nz);
      engineGroup.add(plume);
      plumeMeshes.push(plume);
    });
    shipGroup.add(engineGroup);

    // Sub-assembly 4: Coronal Plasma Collector & Magnetometer Booms (radial Y/Z)
    const collectorGroup = new THREE.Group();
    collectorGroup.position.set(-0.65, 0, 0);

    const finTop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, 0.05), darkAlloyMat);
    finTop.position.set(0, 0.72, 0);
    finTop.rotation.z = 0.28;
    collectorGroup.add(finTop);

    const finBottom = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, 0.05), darkAlloyMat);
    finBottom.position.set(0, -0.72, 0);
    finBottom.rotation.z = -0.28;
    collectorGroup.add(finBottom);

    const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.08), cyanEmissiveMat);
    railTop.position.set(-0.1, 1.15, 0);
    railTop.rotation.z = 0.28;
    collectorGroup.add(railTop);

    const railBottom = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.08), cyanEmissiveMat);
    railBottom.position.set(-0.1, -1.15, 0);
    railBottom.rotation.z = -0.28;
    collectorGroup.add(railBottom);

    shipGroup.add(collectorGroup);

    // Selection wireframe cage that snaps around whichever subsystem is active in Chapter 2
    const cageGeo = new THREE.BoxGeometry(1, 1, 1);
    const cageMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0,
    });
    const highlightCage = new THREE.LineSegments(new THREE.EdgesGeometry(cageGeo), cageMat);
    shipGroup.add(highlightCage);

    // Orient ship toward the Sun along forward vector
    shipGroup.rotation.set(0.18, -0.45, -0.06);

    // Mouse pointer parallax
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation loop
    let rafId = 0;
    const clock = new THREE.Clock();

    const targetCamPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3(0, 0, 0);

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      const s = scrollStateRef.current;
      const p = s.progress; // 0 .. 1
      const explode = s.explodeAmount; // 0 .. 1
      const warp = Math.min(Math.abs(s.velocity) * 0.04, 1.5);

      // Update shaders
      sunMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      const solarIntensity = 0.25 + p * 0.95;
      sunMat.uniforms.uIntensity.value = solarIntensity;
      coronaMat.uniforms.uIntensity.value = solarIntensity;
      starMat.uniforms.uWarp.value = reducedMotion ? 0 : warp;

      // Rotate sun & habitation ring
      if (!reducedMotion) {
        sunMesh.rotation.y = elapsed * 0.025;
        habSpinGroup.rotation.x = elapsed * 0.55;
        starPoints.rotation.y = elapsed * 0.006;
      }

      // Pulse thruster plumes based on velocity & approach
      const thrustScale = 0.75 + Math.sin(elapsed * 18) * 0.08 + warp * 0.45;
      plumeMeshes.forEach((plume) => {
        plume.scale.set(1, reducedMotion ? 0.9 : thrustScale, 1);
      });

      // Subsystem explode separation along local axes
      shieldGroup.position.x = 2.15 + explode * 1.45;
      habGroup.position.x = 0.25;
      habGroup.position.y = explode * 0.45;
      engineGroup.position.x = -2.05 - explode * 1.4;
      collectorGroup.position.y = explode * 0.85;

      // Highlight wireframe cage around active subsystem during engineering chapter
      const sub = subsystemRef.current;
      const cageAlpha = explode > 0.15 ? Math.min((explode - 0.15) * 1.3, 0.75) : 0;
      cageMat.opacity = cageAlpha;

      if (sub === 'shield') {
        highlightCage.position.copy(shieldGroup.position);
        highlightCage.scale.set(0.7, 3.6, 3.6);
      } else if (sub === 'hab') {
        highlightCage.position.copy(habGroup.position);
        highlightCage.scale.set(0.85, 2.8, 2.8);
      } else if (sub === 'engine') {
        highlightCage.position.copy(engineGroup.position);
        highlightCage.scale.set(2.3, 1.7, 1.7);
      } else {
        highlightCage.position.copy(collectorGroup.position);
        highlightCage.scale.set(1.6, 2.9, 0.9);
      }

      // Pointer easing
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // Scroll-driven camera choreography across the 5 chapters:
      // 0.00 - 0.20 : LEO departure & hull hero
      // 0.20 - 0.45 : Close-up lateral engineering inspection (ship centered-right)
      // 0.45 - 0.70 : Solar corona dive (camera plunges toward Sun)
      // 0.70 - 1.00 : Panoramic solar limb vista
      if (p < 0.22) {
        const t = p / 0.22;
        targetCamPos.set(
          THREE.MathUtils.lerp(2.6, 4.2, t),
          THREE.MathUtils.lerp(1.1, 1.55, t),
          THREE.MathUtils.lerp(8.4, 7.2, t)
        );
        targetLookAt.set(-1.1, 0.1, -2.0);
        shipGroup.position.set(1.25, -0.15, 0);
        shipGroup.rotation.set(0.16, -0.42 + t * 0.15, -0.05);
      } else if (p < 0.48) {
        const t = (p - 0.22) / 0.26;
        targetCamPos.set(
          THREE.MathUtils.lerp(4.2, 0.6, t),
          THREE.MathUtils.lerp(1.55, 1.25, t),
          THREE.MathUtils.lerp(7.2, 6.4, t)
        );
        targetLookAt.set(0.8, 0.15, 0);
        shipGroup.position.set(1.35, 0.0, 0);
        shipGroup.rotation.set(0.22, -0.25 + t * 0.55, -0.04);
      } else if (p < 0.74) {
        const t = (p - 0.48) / 0.26;
        targetCamPos.set(
          THREE.MathUtils.lerp(0.6, -4.6, t),
          THREE.MathUtils.lerp(1.25, 0.65, t),
          THREE.MathUtils.lerp(6.4, -7.2, t)
        );
        targetLookAt.set(
          THREE.MathUtils.lerp(0.8, -11.0, t),
          THREE.MathUtils.lerp(0.15, 1.4, t),
          THREE.MathUtils.lerp(0.0, -26.0, t)
        );
        shipGroup.position.set(
          THREE.MathUtils.lerp(1.35, -5.2, t),
          THREE.MathUtils.lerp(0.0, 0.35, t),
          THREE.MathUtils.lerp(0.0, -13.5, t)
        );
        shipGroup.rotation.set(0.14, 0.35, -0.03);
      } else {
        const t = (p - 0.74) / 0.26;
        targetCamPos.set(
          THREE.MathUtils.lerp(-4.6, -1.8, t),
          THREE.MathUtils.lerp(0.65, 2.2, t),
          THREE.MathUtils.lerp(-7.2, -2.5, t)
        );
        targetLookAt.set(-10.5, 1.3, -24.0);
        shipGroup.position.set(-5.2, 0.35, -13.5);
        shipGroup.rotation.set(0.12, 0.45 + t * 0.2, -0.02);
      }

      // Subtle pointer offset
      if (!reducedMotion) {
        targetCamPos.x += pointer.x * 0.38;
        targetCamPos.y -= pointer.y * 0.26;
      }

      camera.position.lerp(targetCamPos, 0.08);
      currentLookAt.lerp(targetLookAt, 0.08);
      camera.lookAt(currentLookAt);

      // Sun scale/proximity light intensity
      sunLight.intensity = 4.2 + p * 3.5;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollStateRef]);

  return <div ref={mountRef} className="space-canvas-stage" aria-hidden="true" />;
}
