import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ATMOS_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const EARTH_ATMOS_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float ndotv = abs(dot(normalize(vNormal), normalize(vViewDir)));
    float rim = pow(clamp(1.0 - ndotv, 0.0, 1.0), 3.4);
    gl_FragColor = vec4(vec3(0.22, 0.72, 1.0), rim * 0.9);
  }
`;

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
    vec3 p = normalize(vPosition) * 3.6;
    float n1 = fbm(p + vec3(uTime * 0.05, -uTime * 0.03, uTime * 0.02));
    float n2 = fbm(p * 2.2 - vec3(uTime * 0.08, uTime * 0.04, 0.0) + n1);
    float plasma = clamp(n1 * 0.5 + n2 * 0.55, 0.0, 1.0);

    float ndotv = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
    float rim = pow(1.0 - ndotv, 2.5);

    vec3 deep = vec3(0.42, 0.07, 0.01);
    vec3 mid = vec3(0.95, 0.44, 0.05);
    vec3 hot = vec3(1.0, 0.93, 0.72);

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
    gl_FragColor = vec4(vec3(1.0, 0.54, 0.12), glow * (0.45 + 0.45 * uIntensity));
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

function normalizeRootToSize(root, targetSize) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetSize / maxDim;
  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
}

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
    let disposed = false;

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
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      44,
      container.clientWidth / container.clientHeight,
      0.1,
      400
    );
    camera.position.set(0, 0.25, 9.0);

    // Cinematic dark-space lighting rig
    scene.add(new THREE.AmbientLight(0x3b4d6b, 1.1));

    const sunKey = new THREE.DirectionalLight(0xfff5e4, 2.7);
    sunKey.position.set(8, 7, 7);
    scene.add(sunKey);

    const earthRim = new THREE.DirectionalLight(0x38bdf8, 1.45);
    earthRim.position.set(-3, -8, 4);
    scene.add(earthRim);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.75);
    fillLight.position.set(-7, 4, -5);
    scene.add(fillLight);

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
      const r = 36 + Math.random() * 140;
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
    // 2. REAL NASA TEXTURED 3D EARTH + CLOUD LAYER + RAYLEIGH ATMOSPHERE
    // -----------------------------------------------------------------------
    const texLoader = new THREE.TextureLoader();
    const earthDayTex = texLoader.load('./textures/earth_atmos.webp');
    earthDayTex.colorSpace = THREE.SRGBColorSpace;
    const earthNormTex = texLoader.load('./textures/earth_normal.webp');
    const earthSpecTex = texLoader.load('./textures/earth_specular.webp');
    const earthCloudTex = texLoader.load('./textures/earth_clouds.webp');

    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -10.5, -4.5);
    scene.add(earthGroup);

    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(8.6, 64, 64),
      new THREE.MeshPhongMaterial({
        map: earthDayTex,
        normalMap: earthNormTex,
        specularMap: earthSpecTex,
        specular: new THREE.Color(0x3878a8),
        shininess: 18,
      })
    );
    earthMesh.rotation.y = 1.95;
    earthGroup.add(earthMesh);

    const cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(8.68, 64, 64),
      new THREE.MeshLambertMaterial({
        map: earthCloudTex,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      })
    );
    earthGroup.add(cloudMesh);

    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: ATMOS_VERT,
      fragmentShader: EARTH_ATMOS_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(9.06, 48, 48), atmosMat));

    // -----------------------------------------------------------------------
    // 3. SOLAR CORONA SPHERE (Act III)
    // -----------------------------------------------------------------------
    const sunGroup = new THREE.Group();
    sunGroup.position.set(0, -24, -36);
    scene.add(sunGroup);

    const sunMat = new THREE.ShaderMaterial({
      vertexShader: SUN_VERT,
      fragmentShader: SUN_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.4 },
      },
    });
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(9.2, 64, 64), sunMat);
    sunGroup.add(sunMesh);

    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: ATMOS_VERT,
      fragmentShader: CORONA_FRAG,
      uniforms: { uIntensity: { value: 0.4 } },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    sunGroup.add(new THREE.Mesh(new THREE.SphereGeometry(12.2, 48, 48), coronaMat));

    // -----------------------------------------------------------------------
    // 4. REAL NASA 3D MODELS (.glb via GLTFLoader)
    // -----------------------------------------------------------------------
    const gltfLoader = new GLTFLoader();

    // Hero Act I: Real NASA EVA Astronaut
    const astronautHolder = new THREE.Group();
    scene.add(astronautHolder);

    gltfLoader.load('./models/astronaut.glb', (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      normalizeRootToSize(model, 3.6);
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.roughness = 0.55;
          child.material.metalness = 0.2;
        }
      });
      astronautHolder.add(model);
    });

    // Act II & III: Real NASA Parker Solar Probe (14 named sub-meshes!)
    const probeHolder = new THREE.Group();
    scene.add(probeHolder);

    const probeParts = []; // { obj, basePos, explodeVec, groupKey }
    const focusBoxMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
    });
    const focusBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      focusBoxMat
    );
    probeHolder.add(focusBox);

    gltfLoader.load('./models/parker_solar_probe.glb', (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      normalizeRootToSize(model, 4.6);

      model.traverse((node) => {
        if (!node.name) return;
        if (node.isMesh && node.material) {
          node.material.envMapIntensity = 1.25;
        }

        const n = node.name.toLowerCase();
        let groupKey = 'bus';
        const explodeVec = new THREE.Vector3(0, 0, 0);

        if (n.includes('heatshield') || n.includes('cooling')) {
          groupKey = 'shield';
          explodeVec.set(0, 0.65, -0.55);
        } else if (n.includes('solarwing_left')) {
          groupKey = 'arrays';
          explodeVec.set(-0.75, 0, 0);
        } else if (n.includes('solarwing_right')) {
          groupKey = 'arrays';
          explodeVec.set(0.75, 0, 0);
        } else if (n.includes('solararray')) {
          groupKey = 'arrays';
          explodeVec.set(0, -0.35, 0);
        } else if (n.includes('boom') || n.includes('magnetometer') || n.includes('hga') || n.includes('antenna')) {
          groupKey = 'boom';
          explodeVec.set(0, -0.35, 0.75);
        } else if (n.includes('bus') || n.includes('instrument') || n.includes('vent')) {
          groupKey = 'bus';
          explodeVec.set(0, 0.08, 0);
        } else {
          return;
        }

        probeParts.push({
          obj: node,
          basePos: node.position.clone(),
          explodeVec,
          groupKey,
        });
      });

      probeHolder.add(model);
    });

    // Pointer parallax
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
      const p = s.progress;
      const explode = s.explodeAmount;
      const warp = Math.min(Math.abs(s.velocity) * 0.04, 1.4);

      sunMat.uniforms.uTime.value = reducedMotion ? 0 : t;
      sunMat.uniforms.uIntensity.value = 0.3 + p * 0.9;
      coronaMat.uniforms.uIntensity.value = 0.3 + p * 0.9;
      starMat.uniforms.uWarp.value = reducedMotion ? 0 : warp;

      if (!reducedMotion) {
        earthMesh.rotation.y = 1.95 + t * 0.012;
        cloudMesh.rotation.y = 1.95 + t * 0.017;
        sunMesh.rotation.y = t * 0.028;
        stars.rotation.y = t * 0.005;
      }

      // Explode real NASA Parker Solar Probe meshes along their physical axes
      probeParts.forEach((part) => {
        part.obj.position.copy(part.basePos).addScaledVector(part.explodeVec, explode);
      });

      // Highlight cage around selected Parker Solar Probe sub-assembly in Act II
      const activeMod = moduleRef.current;
      focusBoxMat.opacity = explode > 0.12 ? Math.min((explode - 0.12) * 0.85, 0.52) : 0;
      if (activeMod === 'capsule') {
        focusBox.position.set(0, 0.72 + explode * 0.35, -0.5);
        focusBox.scale.set(2.4, 1.35, 2.1);
      } else if (activeMod === 'hab') {
        focusBox.position.set(0, -0.05, 0);
        focusBox.scale.set(1.5, 1.75, 1.6);
      } else if (activeMod === 'arrays') {
        focusBox.position.set(0, -0.25, 0);
        focusBox.scale.set(3.8 + explode * 1.1, 1.1, 1.4);
      } else {
        focusBox.position.set(0, -0.35, 1.2 + explode * 0.55);
        focusBox.scale.set(1.4, 1.4, 2.3);
      }

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      const floatY = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.12;
      const floatRot = reducedMotion ? 0 : Math.sin(t * 0.6) * 0.06;

      // Cross-choreography between Astronaut (Act I) -> Parker Solar Probe (Act II & III)
      if (p < 0.17) {
        const k = p / 0.17;
        astronautHolder.visible = true;
        astronautHolder.position.set(0.15 - k * 1.4, 0.48 + floatY + k * 2.8, 0.4 - k * 2.2);
        astronautHolder.rotation.set(0.28 + floatRot, -0.45 + k * 0.4, -0.36 + floatRot * 0.5);
        astronautHolder.scale.setScalar(1.0 - k * 0.35);

        probeHolder.visible = k > 0.55;
        probeHolder.position.set(0, -3.2 + k * 2.5, -2.5);
        probeHolder.rotation.set(0.35, -0.7, 0.18);
        probeHolder.scale.setScalar(0.5 + k * 0.4);

        earthGroup.position.set(0, -10.5 - k * 0.8, -4.5);
        sunGroup.position.set(0, -25, -36);
        targetCamPos.set(0, 0.25, 8.9 - k * 0.7);
        targetLook.set(0, 0.05, 0);
      } else if (p < 0.46) {
        const k = (p - 0.17) / 0.29;
        astronautHolder.visible = false;

        probeHolder.visible = true;
        probeHolder.position.set(0, 0.1 + floatY * 0.5, 0.35);
        probeHolder.rotation.set(0.34 + Math.sin(k * Math.PI) * 0.2, -0.6 + k * 2.2, 0.16);
        probeHolder.scale.setScalar(1.05);

        earthGroup.position.set(0, -11.3 - k * 3.8, -5.2);
        sunGroup.position.set(0, -23 + k * 11, -34);
        targetCamPos.set(0, 0.4, 7.6);
        targetLook.set(0, 0.05, 0);
      } else if (p < 0.72) {
        const k = (p - 0.46) / 0.26;
        astronautHolder.visible = false;

        probeHolder.visible = true;
        probeHolder.position.set(-1.7 * k, 0.15 + k * 0.45, -1.6 * k);
        probeHolder.rotation.set(0.24, 1.6 + k * 0.65, 0.08);
        probeHolder.scale.setScalar(1.05 - k * 0.35);

        earthGroup.position.set(0, -16 - k * 12, -8);
        sunGroup.position.set(3.2 * k, -12 + k * 12.2, -32 + k * 11);
        targetCamPos.set(0, 0.3, 7.6 - k * 1.2);
        targetLook.set(1.1 * k, 0.1, -6 * k);
      } else {
        const k = (p - 0.72) / 0.28;
        astronautHolder.visible = false;
        probeHolder.visible = k < 0.55;
        probeHolder.position.set(-1.7 - k * 3.5, 0.6 + k * 1.8, -1.6 - k * 4);
        probeHolder.scale.setScalar(Math.max(0.1, 0.7 * (1 - k)));

        earthGroup.position.set(0, -28, -12);
        sunGroup.position.set(3.2 - k * 3.2, 0.2 - k * 14.5, -21 - k * 4);
        targetCamPos.set(0, 0.35, 6.4 + k * 2.4);
        targetLook.set(0, -0.4 * k, -8);
      }

      if (!reducedMotion) {
        targetCamPos.x += pointer.x * 0.4;
        targetCamPos.y -= pointer.y * 0.25;
      }

      camera.position.lerp(targetCamPos, 0.08);
      curLook.lerp(targetLook, 0.08);
      camera.lookAt(curLook);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      [earthDayTex, earthNormTex, earthSpecTex, earthCloudTex].forEach((tx) => tx.dispose());
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
