import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

export default function BlurInText({
  as: Tag = "h2",
  children,
  className = "",
  split = "words",
  stagger = 0.06,
  y = 40,
  blur = 18,
  duration = 1.1,
  start = "top 80%",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight * 0.95;

    // Above-the-fold path: skip SplitType and GSAP entirely. The text is
    // already in the DOM and visible — just leave it alone. This guarantees
    // subpage hero content is never stuck at opacity:0 on route change.
    if (alreadyInView) {
      return;
    }

    const s = new SplitType(el, {
      types: split === "chars" ? "chars" : "words",
      wordClass: "bi-word",
      charClass: "bi-char",
    });
    const targets = split === "chars" ? s.chars : s.words;

    gsap.set(targets, {
      opacity: 0,
      y,
      filter: `blur(${blur}px)`,
      display: "inline-block",
      willChange: "transform, opacity, filter",
    });
    const playIn = () => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration,
        ease: "power3.out",
        stagger,
      });
    };
    const trig = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: playIn,
    });
    // Safety: force-show after 1.5s if the element is on-screen but the
    // trigger somehow hasn't fired (route-change edge cases).
    const safety = setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) playIn();
    }, 1500);

    return () => {
      trig.kill();
      clearTimeout(safety);
      s.revert();
    };
  }, [split, stagger, y, blur, duration, start]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
