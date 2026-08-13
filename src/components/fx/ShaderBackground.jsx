import { useEffect, useRef } from "react";
import * as THREE from "three";

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;

  // Simplex-ish noise (classic iq hash)
  float hash(vec2 p){ p = fract(p*vec2(123.34, 345.45)); p += dot(p, p+34.345); return fract(p.x*p.y); }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0; float a = 0.5;
    for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 p = uv * 3.0;
    p += uTime * 0.04;
    float n = fbm(p + vec2(fbm(p + uTime*0.05)));
    float m = length(uv - (uMouse*0.5+0.5));
    n += smoothstep(0.6, 0.0, m) * 0.25;
    vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.8, n));
    col *= uIntensity;
    // subtle grain
    col += (hash(uv*uResolution + uTime) - 0.5) * 0.03;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function ShaderBackground({
  colorA = [0.02, 0.02, 0.04],
  colorB = [0.13, 0.08, 0.22],
  intensity = 1.0,
  className = "",
}) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const w = el.clientWidth || window.innerWidth;
    const h = el.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w, h);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(w, h) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Vector3(...colorA) },
      uColorB: { value: new THREE.Vector3(...colorB) },
      uIntensity: { value: intensity },
    };

    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
    });
    const geo = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      uniforms.uMouse.value.set(x, y);
    };
    window.addEventListener("mousemove", onMove);

    /* PERF: pause render loop when off-screen. */
    let id;
    let inView = false;
    const t0 = performance.now();
    const tick = () => {
      uniforms.uTime.value = (performance.now() - t0) / 1000;
      renderer.render(scene, camera);
      if (inView) id = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasInView = inView;
        inView = entry.isIntersecting;
        if (inView && !wasInView) id = requestAnimationFrame(tick);
        else if (!inView && wasInView) cancelAnimationFrame(id);
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    renderer.render(scene, camera);

    const onResize = () => {
      const rw = el.clientWidth || window.innerWidth;
      const rh = el.clientHeight || window.innerHeight;
      renderer.setSize(rw, rh);
      uniforms.uResolution.value.set(rw, rh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      inView = false;
      cancelAnimationFrame(id);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      mesh.geometry.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [colorA, colorB, intensity]);

  return <div ref={host} className={`noise-bg ${className}`} aria-hidden="true" />;
}
