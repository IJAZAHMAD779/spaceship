import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const EARTH_VERT = /* glsl */ `
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

const EARTH_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewDir;

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
      p = p * 2.04 + vec3(0.13, 0.27, 0.19);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vPosition);
    float landNoise = fbm(p * 3.1 + vec3(0.4, 0.1, 0.7));
    float clouds = fbm(p * 5.2 + vec3(uTime * 0.015, 0.0, -uTime * 0.008));

    vec3 deepOcean = vec3(0.015, 0.075, 0.24);
    vec3 shallowSea = vec3(0.04, 0.28, 0.58);
    vec3 continent = vec3(0.09, 0.22, 0.24);

    vec3 surface = mix(deepOcean, shallowSea, smoothstep(0.32, 0.54, landNoise));
    surface = mix(surface, continent, smoothstep(0.54, 0.68, landNoise));

    // Cloud bands
    surface = mix(surface, vec3(0.82, 0.92, 1.0), smoothstep(0.52, 0.78, clouds) * 0.72);

    // Directional terminator from upper-right solar/star key light
    vec3 lightDir = normalize(vec3(0.55, 0.72, 0.42));
    float diff = clamp(dot(normalize(vNormal), lightDir), 0.0, 1.0);
    float nightMask = smoothstep(0.12, -0.15, dot(normalize(vNormal), lightDir));

    // City lights along populated coastal bands on night side
    float cityNoise = noise(p * 26.0);
    float cities = smoothstep(0.76, 0.88, cityNoise) * smoothstep(0.48, 0.62, landNoise) * nightMask;

    vec3 lit = surface * (0.08 + diff * 1.12);
    lit += vec3(1.0, 0.72, 0.32) * cities * 0.65;

    // Electric Rayleigh atmospheric limb glow
    float ndotv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
    float fresnel = pow(1.0 - ndotv, 3.2);
    lit += vec3(0.18, 0.68, 1.0) * fresnel * (0.45 + 0.75 * diff);

    gl_FragColor = vec4(lit, 1.0);
  }
`;

const ATMOS_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float ndotv = abs(dot(normalize(vNormal), normalize(vViewDir)));
    float rim = pow(clamp(1.0 - ndotv, 0.0, 1.0), 3.6);
    gl_FragColor = vec4(vec3(0.18, 0.68, 1.0), rim * 0.85);
  }
`;

const SUN_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewDir;

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
    vec3 p = normalize(vPosition) * 3.5;
    float n1 = fbm(p + vec3(uTime * 0.05, -uTime * 0.03, uTime * 0.02));
    float n2 = fbm(p * 2.2 - vec3(uTime * 0.08, uTime * 0.04, 0.0) + n1);
    float plasma = clamp(n1 * 0.5 + n2 * 0.55, 0.0, 1.0);

    float ndotv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
    float rim = pow(1.0 - ndotv, 2.6);

    vec3 deep = vec3(0.42, 0.07, 0.01);
    vec3 mid = vec3(0.96, 0.45, 0.05);
    vec3 hot = vec3(1.0, 0.94, 0.72);

    vec3 col = mix(deep, mid, smoothstep(0.24, 0.68, plasma));
    col = mix(col, hot, smoothstep(0.68, 0.96, plasma));
    col += vec3(1.0, 0.62, 0.18) * rim * (0.6 + 0.5 * uIntensity);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const CORONA_FRAG = /* glsl */ `
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float ndotv = abs(dot(normalize(vNormal), normalize(vViewDir)));
    float glow = pow(clamp(1.0 - ndotv, 0.0, 1.0), 3.4);
    gl_FragColor = vec4(vec3(1.0, 0.55, 0.12), glow * (0.45 + 0.45 * uIntensity));
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
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 + uWarp * 0.75) * (150.0 / max(-mvPos.z, 10.0));
    gl_Position = projectionMatrix * mvPos;
  }
`;

const STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.08, d) * 0.85);
  }
`;

export default function CosmicStage({ scrollStateRef, activeModule }) {
  const hostRef = useRef(null);
  const moduleRef = useRef(activeModule);

  useEffect(() => {
    moduleRef.current = activeModule;
  }, [activeModule]);

  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return undefined;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      44,
      container.clientWidth / container.clientHeight,
      0.1,
      400
    );
    camera.position.set(0, 0.35, 9.2);

    // Studio aerospace lighting
    scene.add(new THREE.AmbientLight(0x3a527a, 0.95));

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.4);
    keyLight.position.set(7, 8, 6);
    scene.add(keyLight);

    const earthBounce = new THREE.DirectionalLight(0x38bdf8, 1.35);
    earthBounce.position.set(-2, -9, 3);
    scene.add(earthBounce);

    const solarBacklight = new THREE.PointLight(0xff8c24, 3.2, 120);
    solarBacklight.position.set(-12, 3, -24);
    scene.add(solarBacklight);

    // -----------------------------------------------------------------------
    // 1. STARFIELD
    // -----------------------------------------------------------------------
    const starCount = 2600;
    const starPos = new Float32Array(starCount * 3);
    const starSize = new Float32Array(starCount);
    const starCol = new Float32Array(starCount * 3);
    const starPalette = [
      new THREE.Color('#E8EEFF'),
      new THREE.Color('#B8DCFF'),
      new THREE.Color('#FFF0D4'),
    ];
    for (let i = 0; i < starCount; i++) {
      const r = 34 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi) - 18;
      starSize[i] = 0.8 + Math.random() * 1.9;
      const c = starPalette[i % starPalette.length];
      starCol[i * 3] = c.r;
      starCol[i * 3 + 1] = c.g;
      starCol[i * 3 + 2] = c.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSize, 1));
    starGeo.setAttribute('aColor', new THREE.BufferAttribute(starCol, 3));

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
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // -----------------------------------------------------------------------
    // 2. EARTH ATMOSPHERIC HORIZON SPHERE (Act I & II Anchor)
    // -----------------------------------------------------------------------
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -10.8, -4.5);
    scene.add(earthGroup);

    const earthMat = new THREE.ShaderMaterial({
      vertexShader: EARTH_VERT,
      fragmentShader: EARTH_FRAG,
      uniforms: { uTime: { value: 0 } },
    });
    const earthSphere = new THREE.Mesh(new THREE.SphereGeometry(8.6, 64, 64), earthMat);
    earthGroup.add(earthSphere);

    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: EARTH_VERT,
      fragmentShader: ATMOS_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const earthAtmos = new THREE.Mesh(new THREE.SphereGeometry(9.02, 48, 48), atmosMat);
    earthGroup.add(earthAtmos);

    // -----------------------------------------------------------------------
    // 3. SOLAR CORONA SPHERE (Rises in Act III)
    // -----------------------------------------------------------------------
    const sunGroup = new THREE.Group();
    sunGroup.position.set(0, -18, -32);
    scene.add(sunGroup);

    const sunMat = new THREE.ShaderMaterial({
      vertexShader: EARTH_VERT,
      fragmentShader: SUN_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.4 },
      },
    });
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(9.2, 64, 64), sunMat);
    sunGroup.add(sunMesh);

    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: EARTH_VERT,
      fragmentShader: CORONA_FRAG,
      uniforms: { uIntensity: { value: 0.4 } },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(new THREE.SphereGeometry(12.2, 48, 48), coronaMat);
    sunGroup.add(coronaMesh);

    // -----------------------------------------------------------------------
    // 4. ORBITER AC-5000 (4 Detailed Explodable Sub-Assemblies)
    // -----------------------------------------------------------------------
    const orbiterGroup = new THREE.Group();
    scene.add(orbiterGroup);

    const brushedAlloy = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.82,
      roughness: 0.28,
    });
    const darkTitanium = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      metalness: 0.78,
      roughness: 0.35,
    });
    const whiteCeramic = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.22,
      roughness: 0.42,
    });
    const copperWingMat = new THREE.MeshStandardMaterial({
      color: 0x9c5a2b,
      metalness: 0.85,
      roughness: 0.24,
      emissive: 0x261004,
      emissiveIntensity: 0.35,
    });
    const goldFoilMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.92,
      roughness: 0.2,
      emissive: 0x3b1f00,
      emissiveIntensity: 0.28,
    });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.5,
    });

    // Module 1: Forward Umbra Capsule + Heat Shield (+X)
    const capsuleGroup = new THREE.Group();
    capsuleGroup.position.set(1.55, 0, 0);

    const capsuleCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.74, 1.05, 24),
      brushedAlloy
    );
    capsuleCone.rotation.z = -Math.PI / 2;
    capsuleGroup.add(capsuleCone);

    const dockingNose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.42, 0.32, 20),
      darkTitanium
    );
    dockingNose.rotation.z = -Math.PI / 2;
    dockingNose.position.x = 0.68;
    capsuleGroup.add(dockingNose);

    const shieldDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.02, 0.14, 6),
      darkTitanium
    );
    shieldDisc.rotation.z = Math.PI / 2;
    shieldDisc.position.x = 0.92;
    capsuleGroup.add(shieldDisc);

    const shieldGoldFace = new THREE.Mesh(
      new THREE.CylinderGeometry(1.14, 1.14, 0.04, 6),
      goldFoilMat
    );
    shieldGoldFace.rotation.z = Math.PI / 2;
    shieldGoldFace.position.x = 0.99;
    capsuleGroup.add(shieldGoldFace);

    const cockpitWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.12, 0.34),
      cyanGlowMat
    );
    cockpitWindow.position.set(0.22, 0.52, 0);
    capsuleGroup.add(cockpitWindow);
    orbiterGroup.add(capsuleGroup);

    // Module 2: Pressurized Habitation Core + 1-G Centrifuge Ring (Center)
    const habGroup = new THREE.Group();
    const coreCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.76, 1.85, 28),
      brushedAlloy
    );
    coreCylinder.rotation.z = Math.PI / 2;
    habGroup.add(coreCylinder);

    // Ribbed structural collars
    [-0.65, 0, 0.65].forEach((rx) => {
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.78, 0.045, 10, 32),
        darkTitanium
      );
      collar.rotation.y = Math.PI / 2;
      collar.position.x = rx;
      habGroup.add(collar);
    });

    // Outer 1-G centrifuge ring
    const centrifugeSpin = new THREE.Group();
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.24, 0.12, 14, 48),
      whiteCeramic
    );
    outerRing.rotation.y = Math.PI / 2;
    centrifugeSpin.add(outerRing);

    for (let i = 0; i < 4; i++) {
      const strut = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 2.38, 0.08),
        darkTitanium
      );
      strut.rotation.x = (i * Math.PI) / 4;
      centrifugeSpin.add(strut);
    }
    habGroup.add(centrifugeSpin);
    orbiterGroup.add(habGroup);

    // Module 3: 4 Copper-Gold Solar / Radiator Wings (ORBITA-1 style!)
    const arraysGroup = new THREE.Group();
    const makeWing = (yDir, xOffset, tilt) => {
      const wingHolder = new THREE.Group();
      wingHolder.position.set(xOffset, yDir * 0.85, 0);
      wingHolder.rotation.x = tilt;

      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 1.38, 0.03),
        copperWingMat
      );
      panel.position.y = yDir * 0.72;
      wingHolder.add(panel);

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.42, 0.015),
        darkTitanium
      );
      frame.position.y = yDir * 0.72;
      wingHolder.add(frame);

      // Structural mast
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.45, 8),
        brushedAlloy
      );
      mast.position.y = yDir * 0.7;
      wingHolder.add(mast);

      return wingHolder;
    };

    const wingTopFront = makeWing(1, 0.3, 0.25);
    const wingTopAft = makeWing(1, -0.65, -0.2);
    const wingBotFront = makeWing(-1, 0.3, -0.25);
    const wingBotAft = makeWing(-1, -0.65, 0.2);
    arraysGroup.add(wingTopFront, wingTopAft, wingBotFront, wingBotAft);
    orbiterGroup.add(arraysGroup);

    // Module 4: Aft Service Cone & Quad Ion Drive (-X)
    const driveGroup = new THREE.Group();
    driveGroup.position.set(-1.5, 0, 0);

    const serviceHull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.74, 0.48, 1.25, 24),
      whiteCeramic
    );
    serviceHull.rotation.z = Math.PI / 2;
    driveGroup.add(serviceHull);

    const plumes = [];
    [
      [0.24, 0.24],
      [0.24, -0.24],
      [-0.24, 0.24],
      [-0.24, -0.24],
    ].forEach(([ny, nz]) => {
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.18, 0.36, 16),
        darkTitanium
      );
      nozzle.rotation.z = Math.PI / 2;
      nozzle.position.set(-0.74, ny, nz);
      driveGroup.add(nozzle);

      const plume = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 1.25, 16),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
        })
      );
      plume.rotation.z = -Math.PI / 2;
      plume.position.set(-1.46, ny, nz);
      driveGroup.add(plume);
      plumes.push(plume);
    });
    orbiterGroup.add(driveGroup);

    // Module highlight wireframe box for Act II
    const focusMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
    });
    const focusBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      focusMat
    );
    orbiterGroup.add(focusBox);

    // Pointer state
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const targetCamPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();
    const curLook = new THREE.Vector3(0, 0, 0);
    let rafId = 0;

    const animate = () => {
      const t = clock.getElapsedTime();
      const s = scrollStateRef.current;
      const p = s.progress; // 0 .. 1
      const explode = s.explodeAmount; // 0 .. 1
      const warp = Math.min(Math.abs(s.velocity) * 0.04, 1.4);

      earthMat.uniforms.uTime.value = reducedMotion ? 0 : t;
      sunMat.uniforms.uTime.value = reducedMotion ? 0 : t;
      sunMat.uniforms.uIntensity.value = 0.3 + p * 0.9;
      coronaMat.uniforms.uIntensity.value = 0.3 + p * 0.9;
      starMat.uniforms.uWarp.value = reducedMotion ? 0 : warp;

      if (!reducedMotion) {
        earthSphere.rotation.y = t * 0.018;
        sunMesh.rotation.y = t * 0.028;
        centrifugeSpin.rotation.x = t * 0.55;
        stars.rotation.y = t * 0.005;
      }

      // Thrust pulse
      const thrustScale = 0.72 + Math.sin(t * 16) * 0.08 + warp * 0.5;
      plumes.forEach((pl) => {
        pl.scale.set(1, reducedMotion ? 0.8 : thrustScale, 1);
      });

      // Explode modules in Act II
      capsuleGroup.position.x = 1.55 + explode * 0.95;
      driveGroup.position.x = -1.5 - explode * 0.95;
      wingTopFront.position.y = 0.85 + explode * 0.45;
      wingTopAft.position.y = 0.85 + explode * 0.45;
      wingBotFront.position.y = -0.85 - explode * 0.45;
      wingBotAft.position.y = -0.85 - explode * 0.45;

      // Focus wireframe in Act II
      focusMat.opacity = explode > 0.12 ? Math.min((explode - 0.12) * 0.9, 0.55) : 0;
      const mod = moduleRef.current;
      if (mod === 'capsule') {
        focusBox.position.set(capsuleGroup.position.x + 0.3, 0, 0);
        focusBox.scale.set(1.6, 2.5, 2.5);
      } else if (mod === 'hab') {
        focusBox.position.set(0, 0, 0);
        focusBox.scale.set(2.0, 2.75, 2.75);
      } else if (mod === 'arrays') {
        focusBox.position.set(-0.18, 0, 0);
        focusBox.scale.set(2.1, 4.4 + explode * 0.9, 1.3);
      } else {
        focusBox.position.set(driveGroup.position.x - 0.3, 0, 0);
        focusBox.scale.set(2.1, 1.4, 1.4);
      }

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // Scroll-choreographed stage positions across Acts I–V
      // Act I  (0.00 - 0.20): Centered orbiter slicing through ASTRAL-5 text over Earth horizon
      // Act II (0.20 - 0.46): Close-up ORBITA-style 3D blueprint rotation & module split over Earth rim
      // Act III(0.46 - 0.72): Earth drops away, Sun rises dramatically for Corona Plunge
      // Act IV (0.72 - 1.00): Craft silhouettes near glowing Sun limb & recedes cleanly for Finale
      if (p < 0.20) {
        const k = p / 0.20;
        orbiterGroup.position.set(0, 0.35 - k * 0.15, 0);
        orbiterGroup.rotation.set(0.32, -0.58 + k * 0.35, 0.24 - k * 0.08);
        orbiterGroup.scale.setScalar(1.0);
        earthGroup.position.set(0, -10.5 - k * 0.9, -4.5);
        sunGroup.position.set(0, -24, -36);
        targetCamPos.set(0, 0.2, 8.8 - k * 0.8);
        targetLook.set(0, 0.05, 0);
      } else if (p < 0.46) {
        const k = (p - 0.20) / 0.26;
        orbiterGroup.position.set(0, 0.18, 0.4);
        orbiterGroup.rotation.set(0.28 + Math.sin(k * Math.PI) * 0.18, -0.23 + k * 1.15, 0.16);
        orbiterGroup.scale.setScalar(1.12);
        earthGroup.position.set(0, -11.4 - k * 3.5, -5.2);
        sunGroup.position.set(0, -22 + k * 10, -34);
        targetCamPos.set(0, 0.45, 7.6);
        targetLook.set(0, 0.1, 0);
      } else if (p < 0.72) {
        const k = (p - 0.46) / 0.26;
        orbiterGroup.position.set(-1.6 * k, 0.25 + k * 0.4, -1.5 * k);
        orbiterGroup.rotation.set(0.18, 0.92 + k * 0.7, 0.05);
        orbiterGroup.scale.setScalar(1.0 - k * 0.25);
        earthGroup.position.set(0, -15 - k * 12, -8);
        sunGroup.position.set(3.5 * k, -12 + k * 12.2, -32 + k * 11);
        targetCamPos.set(0, 0.3, 7.6 - k * 1.2);
        targetLook.set(1.2 * k, 0.1, -6 * k);
      } else {
        const k = (p - 0.72) / 0.28;
        orbiterGroup.position.set(-1.6 - k * 3.2, 0.65 + k * 1.6, -1.5 - k * 4);
        orbiterGroup.rotation.set(0.15, 1.62 + k * 0.4, 0.04);
        orbiterGroup.scale.setScalar(0.75 * (1 - k * 0.35));
        earthGroup.position.set(0, -28, -12);
        sunGroup.position.set(3.5 - k * 3.5, 0.2 - k * 13.5, -21 - k * 4);
        targetCamPos.set(0, 0.35, 6.4 + k * 2.5);
        targetLook.set(0, -0.4 * k, -8);
      }

      if (!reducedMotion) {
        targetCamPos.x += pointer.x * 0.42;
        targetCamPos.y -= pointer.y * 0.26;
      }

      camera.position.lerp(targetCamPos, 0.08);
      curLook.lerp(targetLook, 0.08);
      camera.lookAt(curLook);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    animate();

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

  return <div ref={hostRef} className="cosmic-stage" aria-hidden="true" />;
}
