import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WavyImage({
  src,
  alt = "",
  amp = 0.025,
  freq = 5.5,
  speed = 1.4,
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;

    let aspect = 1;

    const setSize = () => {
      const width = container.clientWidth;
      if (!width) return;
      const height = width / aspect;
      container.style.height = `${height}px`;
      renderer.setSize(width, height, false);
    };

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uTime: { value: 0 },
        uAmp: { value: amp },
        uFreq: { value: freq },
        uSpeed: { value: speed },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uAmp;
        uniform float uFreq;
        uniform float uSpeed;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          // Wave traveling right -> left along x axis, displacing vertically
          uv.y += sin(uv.x * uFreq + uTime * uSpeed) * uAmp;
          // Smaller perpendicular ripple for richer motion
          uv.x += sin(uv.y * (uFreq * 0.8) + uTime * (uSpeed * 0.7)) * (uAmp * 0.45);

          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            discard;
          }

          gl_FragColor = texture2D(uTexture, uv);
        }
      `,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const loader = new THREE.TextureLoader();
    let texture;
    loader.load(src, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      aspect = tex.image.width / tex.image.height;
      material.uniforms.uTexture.value = tex;
      texture = tex;
      setSize();
    });

    /* PERF: pause the WebGL render loop when the canvas is off-screen.
       WavyImage is used in multiple places on the About page; each
       instance was running its own rAF + Three.js render every frame
       even when miles off-screen, summing to a large continuous CPU
       drain that made the rest of the page jitter on mobile. */
    let raf;
    let inView = false;
    const start = performance.now();
    const tick = () => {
      material.uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
      if (inView) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const wasInView = inView;
        inView = entry.isIntersecting;
        if (inView && !wasInView) raf = requestAnimationFrame(tick);
        else if (!inView && wasInView) cancelAnimationFrame(raf);
      },
      { rootMargin: "150px 0px" }
    );
    io.observe(container);
    // Initial render so the first paint is correct before IO callback.
    renderer.render(scene, camera);

    const ro = new ResizeObserver(() => setSize());
    ro.observe(container);

    return () => {
      io.disconnect();
      inView = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      if (texture) texture.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [src, amp, freq, speed]);

  return (
    <div
      ref={containerRef}
      className={`wavy-image ${className}`.trim()}
      role="img"
      aria-label={alt}
    />
  );
}
