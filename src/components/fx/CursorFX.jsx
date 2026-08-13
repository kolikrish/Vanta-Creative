import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CursorFX() {
  const ring = useRef(null);
  const dot = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 900px)").matches) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const tRing = { x: pos.x, y: pos.y };

    const move = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      }
    };

    const over = (e) => {
      if (e.target.closest("a, button, .hero-card, .work-tile, .marquee-item, .nav-item")) {
        ring.current?.classList.add("hover");
      }
    };
    const out = (e) => {
      if (e.target.closest("a, button, .hero-card, .work-tile, .marquee-item, .nav-item")) {
        ring.current?.classList.remove("hover");
      }
    };

    const raf = () => {
      tRing.x += (pos.x - tRing.x) * 0.15;
      tRing.y += (pos.y - tRing.y) * 0.15;
      if (ring.current) {
        ring.current.style.transform = `translate(${tRing.x}px, ${tRing.y}px) translate(-50%, -50%)`;
      }
      id = requestAnimationFrame(raf);
    };
    let id = requestAnimationFrame(raf);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
    };
  }, []);

  return (
    <>
      <div className="cursor" ref={ring}></div>
      <div className="cursor-dot" ref={dot}></div>
    </>
  );
}
