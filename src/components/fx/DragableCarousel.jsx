import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

/**
 * DragableCarousel — 3D perspective draggable image carousel.
 * React port of the Framer DragableCarousel module (the active
 * slide sits centred and large; flanking slides recede in Z with
 * a Y rotation and reduced scale/opacity). Drag with mouse or
 * touch; release snaps to the nearest slide via GSAP.
 *
 * Props mirror the original (with sensible defaults). Pass an
 * array of image URL strings as `images`.
 */
export default function DragableCarousel({
  images = [],
  slideWidth = 320,
  slideHeight = 400,
  gap = 20,
  borderRadius = 12,
  objectFit = "cover",
  perspective = 1000,
  rotateY = 45,
  depth = 150,
  activeScale = 1,
  inactiveScale = 0.85,
  inactiveOpacity = 0.5,
  snapDuration = 0.6,
  snapEase = "power3.out",
  showArrows = true,
  arrowColor = "#ffffff",
  arrowSize = 44,
  showDots = true,
  dotColor = "#ffffff",
  dotSize = 8,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = true,
  className = "",
}) {
  const slides = images.length > 0 ? images : [];
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const stepRef = useRef(slideWidth + gap);
  const offsetRef = useRef(0);
  const dragRef = useRef(null);
  const autoplayRef = useRef(null);
  const hoverRef = useRef(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Keep the step in a ref so resize updates don't trigger renders.
  useEffect(() => {
    stepRef.current = slideWidth + gap;
  }, [slideWidth, gap]);

  const wrapIndex = useCallback(
    (i) => {
      if (!loop) return Math.max(0, Math.min(slides.length - 1, i));
      const n = slides.length;
      return ((i % n) + n) % n;
    },
    [loop, slides.length]
  );

  // Apply per-slide 3D transform based on its distance from the
  // active offset. Distance 0 = active (centre, full scale); larger
  // distances rotate, recede in Z, scale and fade.
  const render = useCallback(() => {
    const step = stepRef.current;
    const offset = offsetRef.current;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const pos = i * step + offset;
      const dist = Math.abs(pos);
      const t = Math.min(1, dist / step);
      const sign = pos < 0 ? -1 : 1;
      const ry = -sign * rotateY * t;
      const tz = -depth * t;
      const scale = activeScale + (inactiveScale - activeScale) * t;
      const op = 1 + (inactiveOpacity - 1) * t;
      const zIdx = slides.length - Math.round(dist);
      el.style.transform = `translate3d(${pos}px, 0, ${tz}px) rotateY(${ry}deg) scale(${scale})`;
      el.style.opacity = String(op);
      el.style.zIndex = String(zIdx);
    });
  }, [rotateY, depth, activeScale, inactiveScale, inactiveOpacity, slides.length]);

  // Animate to a specific index — eases the offset value to
  // -(index * step) over `snapDuration`.
  const goTo = useCallback(
    (target, animated = true) => {
      const idx = wrapIndex(target);
      const step = stepRef.current;
      const targetOffset = -idx * step;
      const proxy = { v: offsetRef.current };
      gsap.killTweensOf(proxy);
      if (animated) {
        gsap.to(proxy, {
          v: targetOffset,
          duration: snapDuration,
          ease: snapEase,
          onUpdate: () => {
            offsetRef.current = proxy.v;
            render();
          },
          onComplete: () => {
            offsetRef.current = targetOffset;
            render();
            setActiveIdx(idx);
          },
        });
      } else {
        offsetRef.current = targetOffset;
        render();
        setActiveIdx(idx);
      }
    },
    [render, snapDuration, snapEase, wrapIndex]
  );

  // Snap to nearest slide based on current offset.
  const snapNearest = useCallback(
    (velocity = 0) => {
      const step = stepRef.current;
      const raw = -offsetRef.current / step;
      let target = Math.round(raw + velocity * 0.3);
      goTo(target);
    },
    [goTo]
  );

  // Pointer / touch drag handlers.
  const pt = (e) => {
    if (e.touches?.length) return { x: e.touches[0].clientX };
    if (e.changedTouches?.length) return { x: e.changedTouches[0].clientX };
    return { x: e.clientX };
  };

  const onDown = (e) => {
    const p = pt(e);
    dragRef.current = {
      startX: p.x,
      lastX: p.x,
      lastT: performance.now(),
      baseOffset: offsetRef.current,
      vX: 0,
    };
    if (wrapperRef.current) wrapperRef.current.style.cursor = "grabbing";
  };

  const onMove = (e) => {
    if (!dragRef.current) return;
    const p = pt(e);
    const now = performance.now();
    const dt = Math.max(1, now - dragRef.current.lastT);
    dragRef.current.vX = (p.x - dragRef.current.lastX) / dt;
    dragRef.current.lastX = p.x;
    dragRef.current.lastT = now;
    const dx = p.x - dragRef.current.startX;
    offsetRef.current = dragRef.current.baseOffset + dx;
    render();
    if (e.cancelable) e.preventDefault();
  };

  const onUp = () => {
    if (!dragRef.current) return;
    const vX = dragRef.current.vX;
    dragRef.current = null;
    if (wrapperRef.current) wrapperRef.current.style.cursor = "grab";
    // velocity-aware snap: a quick flick advances one extra slide
    // in the throw direction.
    const flickVel = vX * 60; // px per frame
    snapNearest(-flickVel / stepRef.current);
  };

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    node.addEventListener("mousedown", onDown);
    node.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      node.removeEventListener("mousedown", onDown);
      node.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First paint + window resize re-renders.
  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [render]);

  // Autoplay.
  useEffect(() => {
    if (!autoplay) return undefined;
    const tick = () => {
      if (pauseOnHover && hoverRef.current) return;
      goTo(wrapIndex(activeIdx + 1));
    };
    autoplayRef.current = setInterval(tick, autoplayDelay);
    return () => clearInterval(autoplayRef.current);
  }, [autoplay, autoplayDelay, pauseOnHover, activeIdx, wrapIndex, goTo]);

  if (slides.length === 0) return null;

  const wrapperStyle = {
    width: "100%",
    height: `${slideHeight + 24}px`,
    perspective: `${perspective}px`,
    perspectiveOrigin: "50% 50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "grab",
    userSelect: "none",
    position: "relative",
    touchAction: "pan-y",
  };
  const trackStyle = {
    position: "relative",
    width: `${slideWidth}px`,
    height: `${slideHeight}px`,
    transformStyle: "preserve-3d",
  };
  const slideStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: `${slideWidth}px`,
    height: `${slideHeight}px`,
    borderRadius: `${borderRadius}px`,
    overflow: "hidden",
    willChange: "transform, opacity",
    transformStyle: "preserve-3d",
    backgroundColor: "#000",
  };
  const arrowBtnStyle = (side) => ({
    position: "absolute",
    top: "50%",
    [side]: 16,
    transform: "translateY(-50%)",
    zIndex: 200,
    width: arrowSize,
    height: arrowSize,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
    cursor: "pointer",
    color: arrowColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: arrowSize * 0.45,
  });

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={wrapperStyle}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      <div ref={trackRef} style={trackStyle}>
        {slides.map((src, i) => (
          <div
            key={i}
            ref={(el) => (slideRefs.current[i] = el)}
            style={slideStyle}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit,
                userSelect: "none",
                WebkitUserDrag: "none",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            aria-label="Previous"
            style={arrowBtnStyle("left")}
            onClick={() => goTo(activeIdx - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            style={arrowBtnStyle("right")}
            onClick={() => goTo(activeIdx + 1)}
          >
            ›
          </button>
        </>
      )}

      {showDots && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            zIndex: 200,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: dotColor,
                opacity: i === activeIdx ? 1 : 0.4,
                transition: "opacity 0.25s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
