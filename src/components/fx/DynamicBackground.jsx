import { useEffect, useRef } from "react";
import gsap from "gsap";

// WebGL particle field that forms a logo image. Particles scatter off the
// left/right edges of the canvas, then lerp into the alpha-mask pixels of
// the source PNG. After formation they react to mouse/touch with a soft
// spring that pulls them back to their origin pixel.
//
// Sizes off its parent element, not the window — so it can live inside a
// half-width hero column without stretching.
const DynamicBackground = ({ logoPath = "/newlogo.png", bgColor = "#050506" }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const programRef = useRef(null);
  const glRef = useRef(null);
  const geometryRef = useRef(null);
  const particleGridRef = useRef([]);
  const posArrayRef = useRef(null);
  const colorArrayRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const execCountRef = useRef(0);
  const isCleanedUpRef = useRef(false);
  const isMobileRef = useRef(false);
  const isVisibleRef = useRef(true);
  const formationRef = useRef({ progress: 0, done: false });
  const formationTweenRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const checkMobile = () => window.innerWidth < 1000;
    isMobileRef.current = checkMobile();
    isCleanedUpRef.current = false;

    const CONFIG = {
      particleGap: isMobileRef.current ? 3 : 2,
      distortionRadius: isMobileRef.current ? 2000 : 3000,
      forceStrength: 0.003,
      maxDisplacement: isMobileRef.current ? 60 : 100,
      returnForce: 0.025,
    };

    const getDpr = () =>
      isMobileRef.current
        ? Math.min(window.devicePixelRatio || 1, 2)
        : window.devicePixelRatio || 1;

    const sizeCanvas = () => {
      // Back the canvas with its parent's box so the image is never stretched.
      const parent = canvas.parentElement;
      const cssW = parent ? parent.clientWidth : window.innerWidth;
      const cssH = parent ? parent.clientHeight : window.innerHeight;
      const dpr = getDpr();
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };

    sizeCanvas();

    const gl = canvas.getContext("webgl", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    glRef.current = gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
          }
        : { r: 0, g: 0, b: 0 };
    }

    const vertexShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      attribute vec2 a_position;
      attribute vec4 a_color;
      varying vec4 v_color;
      void main() {
         vec2 zeroToOne = a_position / u_resolution;
         vec2 clipSpace = (zeroToOne * 2.0 - 1.0);
         v_color = a_color;
         gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
         gl_PointSize = 3.5;
     }
    `;

    const fragmentShaderSource = `
      precision highp float;
      varying vec4 v_color;
      void main() {
          if (v_color.a < 0.01) discard;
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
      }
    `;

    function createShader(gl, type, source) {
      if (!gl || isCleanedUpRef.current) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
      if (!gl || !vertexShader || !fragmentShader || isCleanedUpRef.current) return null;
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Error linking program:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;
    programRef.current = program;

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

    const loadLogo = () => {
      const image = new Image();
      /* No crossOrigin attribute for same-origin images. On iOS Safari,
         requesting the same image with crossOrigin set produces a
         different cache key from the preload <link> in index.html and
         can fail outright on first load — visible as a blank black
         hero instead of the particle logo. */
      image.decoding = "async";

      image.onload = () => {
        if (isCleanedUpRef.current) return;

        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        tempCanvas.width = w;
        tempCanvas.height = h;
        tempCtx.clearRect(0, 0, w, h);

        const imgRatio = image.width / image.height;
        const canvasRatio = w / h;
        // Scale the logo to "contain" inside the column with breathing room,
        // so the entire mark forms without clipping against the edge.
        const targetFill = isMobileRef.current ? 0.72 : 0.78;
        let drawW, drawH;
        if (imgRatio > canvasRatio) {
          drawW = w * targetFill;
          drawH = drawW / imgRatio;
        } else {
          drawH = h * targetFill;
          drawW = drawH * imgRatio;
        }
        const drawX = Math.round((w - drawW) / 2);
        const drawY = Math.round((h - drawH) / 2);

        tempCtx.drawImage(image, drawX, drawY, drawW, drawH);
        const imageData = tempCtx.getImageData(0, 0, w, h);

        initParticleSystem(imageData.data, w, h);
      };

      image.onerror = () => {
        console.error("Failed to load logo image:", logoPath);
      };

      image.src = logoPath;
    };

    function initParticleSystem(pixels, w, h) {
      if (isCleanedUpRef.current) return;

      particleGridRef.current = [];
      const validParticles = [];
      const validPositions = [];
      const validColors = [];
      const gap = CONFIG.particleGap;

      // Gentle brightness lift, no saturation boost — back to the
      // logo's original look with just a touch more glow than the
      // source PNG. SAT=1.0 is identity (keeps original chroma);
      // BRI=1.05 lifts overall brightness ~5%.
      const SAT = 1.0;
      const BRI = 1.05;
      const boost = (c, gray) => Math.min(1, (gray + (c - gray) * SAT) * BRI);

      for (let i = 0; i < h; i += gap) {
        for (let j = 0; j < w; j += gap) {
          const pixelIndex = (i * w + j) * 4;
          const alpha = pixels[pixelIndex + 3];

          if (alpha > 10) {
            const x = j;
            const y = i;

            validPositions.push(x, y);
            const r = pixels[pixelIndex] / 255;
            const g = pixels[pixelIndex + 1] / 255;
            const b = pixels[pixelIndex + 2] / 255;
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            validColors.push(
              Math.min(1, boost(r, gray)),
              Math.min(1, boost(g, gray)),
              Math.min(1, boost(b, gray)),
              pixels[pixelIndex + 3] / 255
            );

            // Each particle starts at a random angle around the centre, well
            // outside the canvas, so the whole field converges inward from
            // every direction to assemble the mark.
            const cx = w / 2;
            const cy = h / 2;
            const angle = Math.random() * Math.PI * 2;
            const maxDim = Math.max(w, h);
            const radius = maxDim * (0.7 + Math.random() * 0.7);
            const sx = cx + Math.cos(angle) * radius;
            const sy = cy + Math.sin(angle) * radius;

            validParticles.push({ ox: x, oy: y, sx, sy, vx: 0, vy: 0 });
          }
        }
      }

      particleGridRef.current = validParticles;
      posArrayRef.current = new Float32Array(validPositions);
      colorArrayRef.current = new Float32Array(validColors);

      for (let i = 0; i < validParticles.length; i++) {
        posArrayRef.current[i * 2] = validParticles[i].sx;
        posArrayRef.current[i * 2 + 1] = validParticles[i].sy;
      }

      // Re-use buffers across reloads (resize regenerates everything).
      if (geometryRef.current) {
        if (geometryRef.current.positionBuffer) gl.deleteBuffer(geometryRef.current.positionBuffer);
        if (geometryRef.current.colorBuffer) gl.deleteBuffer(geometryRef.current.colorBuffer);
      }

      const positionBuffer = gl.createBuffer();
      const colorBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, posArrayRef.current, gl.DYNAMIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colorArrayRef.current, gl.STATIC_DRAW);

      geometryRef.current = {
        positionBuffer,
        colorBuffer,
        vertexCount: validParticles.length,
      };

      if (formationTweenRef.current) formationTweenRef.current.kill();
      formationRef.current = { progress: 0, done: false };
      formationTweenRef.current = gsap.to(formationRef.current, {
        progress: 1,
        duration: 4,
        ease: "power3.out",
        delay: 0.3,
        onComplete: () => {
          if (isCleanedUpRef.current || !posArrayRef.current) return;
          formationRef.current.done = true;
          for (let i = 0; i < validParticles.length; i++) {
            posArrayRef.current[i * 2] = validParticles[i].ox;
            posArrayRef.current[i * 2 + 1] = validParticles[i].oy;
          }
        },
      });

      startAnimation();
    }

    function startAnimation() {
      const bg = hexToRgb(bgColor);
      function animate() {
        if (
          isCleanedUpRef.current ||
          !gl ||
          !programRef.current ||
          !geometryRef.current
        ) {
          return;
        }

        if (!formationRef.current.done) {
          const fp = formationRef.current.progress;
          for (let i = 0, len = particleGridRef.current.length; i < len; i++) {
            const d = particleGridRef.current[i];
            posArrayRef.current[i * 2] = d.sx + (d.ox - d.sx) * fp;
            posArrayRef.current[i * 2 + 1] = d.sy + (d.oy - d.sy) * fp;
          }
          gl.bindBuffer(gl.ARRAY_BUFFER, geometryRef.current.positionBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, posArrayRef.current);
        } else if (execCountRef.current > 0) {
          execCountRef.current -= 1;

          const rad = CONFIG.distortionRadius * CONFIG.distortionRadius;
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;

          for (let i = 0, len = particleGridRef.current.length; i < len; i++) {
            const x = posArrayRef.current[i * 2];
            const y = posArrayRef.current[i * 2 + 1];
            const d = particleGridRef.current[i];

            const dx = mx - x;
            const dy = my - y;
            const dis = dx * dx + dy * dy;

            if (dis < rad && dis > 0) {
              const f = -rad / dis;
              const t = Math.atan2(dy, dx);
              const distFromOrigin = Math.sqrt(
                (x - d.ox) * (x - d.ox) + (y - d.oy) * (y - d.oy)
              );
              const forceMultiplier = Math.max(
                0.1,
                1 - distFromOrigin / (CONFIG.maxDisplacement * 2)
              );
              d.vx += f * Math.cos(t) * CONFIG.forceStrength * forceMultiplier;
              d.vy += f * Math.sin(t) * CONFIG.forceStrength * forceMultiplier;
            }

            const newX = x + (d.vx *= 0.82) + (d.ox - x) * CONFIG.returnForce;
            const newY = y + (d.vy *= 0.82) + (d.oy - y) * CONFIG.returnForce;

            const dxO = newX - d.ox;
            const dyO = newY - d.oy;
            const distFromOrigin = Math.sqrt(dxO * dxO + dyO * dyO);

            if (distFromOrigin > CONFIG.maxDisplacement) {
              const excess = distFromOrigin - CONFIG.maxDisplacement;
              const scale = CONFIG.maxDisplacement / distFromOrigin;
              const dampedScale = scale + (1 - scale) * Math.exp(-excess * 0.02);
              posArrayRef.current[i * 2] = d.ox + dxO * dampedScale;
              posArrayRef.current[i * 2 + 1] = d.oy + dyO * dampedScale;
              d.vx *= 0.7;
              d.vy *= 0.7;
            } else {
              posArrayRef.current[i * 2] = newX;
              posArrayRef.current[i * 2 + 1] = newY;
            }
          }

          gl.bindBuffer(gl.ARRAY_BUFFER, geometryRef.current.positionBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, posArrayRef.current);
        }

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(bg.r, bg.g, bg.b, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(programRef.current);
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

        gl.bindBuffer(gl.ARRAY_BUFFER, geometryRef.current.positionBuffer);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, geometryRef.current.colorBuffer);
        gl.enableVertexAttribArray(colorAttributeLocation);
        gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, geometryRef.current.vertexCount);

        const needsLoop = !formationRef.current.done || execCountRef.current > 0;
        if (isVisibleRef.current && needsLoop) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animationFrameRef.current = null;
        }
      }
      animate();
    }

    const pointerToCanvas = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouseRef.current.x = (clientX - rect.left) * scaleX;
      mouseRef.current.y = (clientY - rect.top) * scaleY;
      execCountRef.current = 300;
      if (!animationFrameRef.current && geometryRef.current && isVisibleRef.current) {
        startAnimation();
      }
    };

    const handleMouseMove = (event) => {
      if (isCleanedUpRef.current) return;
      pointerToCanvas(event.clientX, event.clientY);
    };

    const handleTouchMove = (event) => {
      if (isCleanedUpRef.current || !event.touches[0]) return;
      pointerToCanvas(event.touches[0].clientX, event.touches[0].clientY);
    };

    let resizeRaf = 0;
    const handleResize = () => {
      if (isCleanedUpRef.current) return;
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        isMobileRef.current = checkMobile();
        sizeCanvas();
        loadLogo();
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !animationFrameRef.current && geometryRef.current) {
          startAnimation();
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    /* PARENT-SIZE observer.
       The canvas's internal width/height come from its PARENT's
       clientWidth/clientHeight. On iOS Safari, the address bar
       grows and shrinks as the user scrolls — that changes
       `100vh / 55vh` values without firing a window `resize`
       event. The parent (`.hero-split-particles`) silently
       changes height; the canvas's CSS size follows (it's
       width/height:100%), but its internal buffer doesn't. Result:
       the canvas internal aspect ratio drifts from its CSS aspect
       ratio and the rendered particles look squished. A
       ResizeObserver on the parent re-runs sizeCanvas + loadLogo
       whenever its box actually changes size, regardless of what
       triggered it. */
    let resizeObsRaf = 0;
    const parent = canvas.parentElement;
    let resizeObs;
    if (parent && typeof ResizeObserver !== "undefined") {
      resizeObs = new ResizeObserver(() => {
        if (isCleanedUpRef.current) return;
        if (resizeObsRaf) cancelAnimationFrame(resizeObsRaf);
        resizeObsRaf = requestAnimationFrame(() => {
          if (isCleanedUpRef.current) return;
          sizeCanvas();
          loadLogo();
        });
      });
      resizeObs.observe(parent);
    }

    /* Mouse + touch distortion handlers — re-enabled, but bound to
       the canvas's PARENT container instead of `document`. Before:
       any cursor movement anywhere on the page was firing the
       distortion (particles got pulled even when the cursor was
       far from the logo). Now: the wavy effect only triggers when
       the cursor is over the hero particle column. The canvas
       itself has pointer-events:none so we listen on the parent.
       mouseLeave/touchEnd both park the mouse far offscreen so
       in-flight particle inertia winds back to origin instead of
       staying drawn toward the last cursor position. */
    mouseRef.current.x = -100000;
    mouseRef.current.y = -100000;
    const interactionHost = canvas.parentElement || canvas;
    const parkMouse = () => {
      mouseRef.current.x = -100000;
      mouseRef.current.y = -100000;
    };
    interactionHost.addEventListener("mousemove", handleMouseMove);
    interactionHost.addEventListener("mouseleave", parkMouse);
    interactionHost.addEventListener("touchmove", handleTouchMove, { passive: true });
    interactionHost.addEventListener("touchend", parkMouse);
    window.addEventListener("resize", handleResize);

    loadLogo();

    return () => {
      isCleanedUpRef.current = true;
      if (formationTweenRef.current) formationTweenRef.current.kill();
      observer.disconnect();
      if (resizeObs) resizeObs.disconnect();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (resizeObsRaf) cancelAnimationFrame(resizeObsRaf);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      /* Listeners are bound to the canvas's parent (interactionHost
         in the registration block). Remove them by reference so
         we don't leak listeners on hot-reload / route change. */
      if (interactionHost) {
        interactionHost.removeEventListener("mousemove", handleMouseMove);
        interactionHost.removeEventListener("mouseleave", parkMouse);
        interactionHost.removeEventListener("touchmove", handleTouchMove);
        interactionHost.removeEventListener("touchend", parkMouse);
      }
      window.removeEventListener("resize", handleResize);

      if (gl && !gl.isContextLost()) {
        try {
          if (geometryRef.current) {
            if (geometryRef.current.positionBuffer) gl.deleteBuffer(geometryRef.current.positionBuffer);
            if (geometryRef.current.colorBuffer) gl.deleteBuffer(geometryRef.current.colorBuffer);
            geometryRef.current = null;
          }
          if (programRef.current) {
            const shaders = gl.getAttachedShaders(programRef.current);
            if (shaders) {
              shaders.forEach((shader) => {
                gl.detachShader(programRef.current, shader);
                gl.deleteShader(shader);
              });
            }
            gl.deleteProgram(programRef.current);
            programRef.current = null;
          }
        } catch (error) {
          console.warn("Error during WebGL cleanup:", error);
        }
      }

      particleGridRef.current = [];
      posArrayRef.current = null;
      colorArrayRef.current = null;
      mouseRef.current = { x: 0, y: 0 };
      execCountRef.current = 0;
    };
  }, [logoPath, bgColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        // Match the WebGL clearColor so the brief moment between canvas
        // mount and the first WebGL frame doesn't paint a white box where
        // the logo is supposed to be.
        backgroundColor: bgColor,
        mixBlendMode: "normal",
        display: "block",
      }}
    />
  );
};

export default DynamicBackground;
