import { useEffect, useRef, useState } from "react";

export default function StoryCarousel({ images, alt }) {
  const stageRef = useRef(null);
  const ringRef = useRef(null);

  const rotRef = useRef(0);
  const targetRotRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velRef = useRef(0);
  const stepRef = useRef(360 / Math.max(images.length, 1));
  const rafRef = useRef(0);

  const [active, setActive] = useState(0);

  useEffect(() => {
    stepRef.current = 360 / Math.max(images.length, 1);
  }, [images.length]);

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!stage || !ring) return;

    const compute = () => {
      const w = stage.clientWidth || window.innerWidth;
      const tileW = Math.max(180, Math.min(280, w * 0.22));
      const n = Math.max(images.length, 6);
      // Tiles touching exactly at: r = (tileW/2) / tan(PI/n).
      // Multiply by ~1.45 for breathing room between tiles.
      const r = Math.max(420, (tileW / 2) / Math.tan(Math.PI / n) * 1.45);
      ring.style.setProperty("--tile-w", `${tileW}px`);
      ring.style.setProperty("--radius", `${r}px`);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [images.length]);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const tick = () => {
      if (!draggingRef.current) {
        const cur = rotRef.current;
        const tgt = targetRotRef.current;
        const next = cur + (tgt - cur) * 0.12;
        rotRef.current = Math.abs(tgt - next) < 0.02 ? tgt : next;
      }
      ring.style.setProperty("--rot", `${rotRef.current}deg`);

      const step = stepRef.current;
      const idx = ((Math.round(-rotRef.current / step) % images.length) + images.length) % images.length;
      setActive((prev) => (prev === idx ? prev : idx));

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [images.length]);

  const goTo = (i) => {
    const step = stepRef.current;
    const targetBase = -i * step;
    const cur = rotRef.current;
    const diff = (((targetBase - cur) % 360) + 540) % 360 - 180;
    targetRotRef.current = cur + diff;
  };

  const onPointerDown = (e) => {
    draggingRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    velRef.current = 0;
    stageRef.current?.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dx = e.clientX - lastXRef.current;
    const dt = Math.max(1, now - lastTRef.current);
    lastXRef.current = e.clientX;
    lastTRef.current = now;
    if (Math.abs(e.clientX - startXRef.current) > 6) movedRef.current = true;
    const sensitivity = 0.32;
    rotRef.current += dx * sensitivity;
    targetRotRef.current = rotRef.current;
    velRef.current = (dx / dt) * 16;
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e?.pointerId != null) {
      stageRef.current?.releasePointerCapture?.(e.pointerId);
    }
    const step = stepRef.current;
    const projected = rotRef.current + velRef.current * 8;
    targetRotRef.current = Math.round(projected / step) * step;
  };

  const onTileClick = (i) => (e) => {
    if (movedRef.current) {
      e.preventDefault();
      return;
    }
    goTo(i);
  };

  return (
    <div className="story-carousel">
      <div
        className="story-carousel-stage"
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          className="story-carousel-ring"
          ref={ringRef}
          style={{ "--n": images.length }}
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`story-carousel-tile ${i === active ? "is-active" : ""}`}
              style={{ "--i": i }}
              onClick={onTileClick(i)}
              aria-label={`${alt} ${i + 1}`}
            >
              <img src={src} alt="" draggable="false" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      <div className="story-carousel-meta">
        <span className="story-carousel-count">
          {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
        <span className="story-carousel-hint">Drag to rotate · Click a frame to focus</span>
      </div>
    </div>
  );
}
