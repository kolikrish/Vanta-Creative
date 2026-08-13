import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps children in a canvas overlay that dissolves/burns them away on scroll-out.
 * Uses a noise mask + threshold on displacement to produce a "dissolving" reveal
 * without requiring WebGL. Displacement is cheap and convincing.
 */
export default function Dissolve({ children, direction = "in", className = "" }) {
  const wrap = useRef(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const alreadyInView =
      direction === "in" && rect.top < window.innerHeight * 1.05;

    // Above-the-fold path: leave the element in its natural rendered state.
    // Avoids any chance of getting stuck at opacity:0 on route change.
    if (alreadyInView) {
      return;
    }

    gsap.set(el, {
      opacity: direction === "in" ? 0 : 1,
      filter: direction === "in" ? "blur(14px) saturate(0.5)" : "blur(0px)",
      scale: direction === "in" ? 0.99 : 1,
      willChange: "opacity, filter, transform",
    });

    const playIn = () => {
      gsap.to(el, {
        opacity: 1,
        filter: "blur(0px) saturate(1)",
        scale: 1,
        // Faster reveal so cards aren't holding back the section reading
        // pace — previous 0.65s read as "waiting on the animation" when
        // skimming a list of services.
        duration: 0.4,
        ease: "power3.out",
      });
    };

    const trig = ScrollTrigger.create({
      trigger: el,
      // Earlier trigger — `top 95%` fires the moment the top edge enters
      // the viewport instead of after the card is already a fifth onto
      // the page. Pairs with the shorter duration for a much snappier
      // feel on long lists.
      start: "top 95%",
      end: "bottom 15%",
      onEnter: playIn,
      onLeaveBack: () => {
        gsap.to(el, {
          opacity: 0,
          filter: "blur(14px) saturate(0.5)",
          scale: 0.99,
          duration: 0.4,
          ease: "power2.inOut",
        });
      },
    });

    // Safety: force-show after 1.5s if element is on-screen but trigger
    // somehow hasn't fired (route-change edge cases).
    const safety = setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) playIn();
    }, 1500);

    return () => {
      trig.kill();
      clearTimeout(safety);
    };
  }, [direction]);

  return (
    <div ref={wrap} className={className}>
      {children}
    </div>
  );
}
