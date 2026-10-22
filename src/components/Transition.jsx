import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Transition() {
  const ref = useRef(null);
  const first = useRef(true);
  const tlRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const blocks = ref.current.querySelectorAll(".block");
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }

    if (first.current) {
      first.current = false;
      gsap.set(blocks, { scaleY: 0 });
      return;
      gsap.set(blocks, { scaleY: 1, transformOrigin: "top" });
      gsap.to(blocks, {
        scaleY: 0,
        duration: 0.85,
        stagger: 0.02,
        ease: "power2.inOut",
      });
      return;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(blocks, { scaleY: 0 });
        tlRef.current = null;
      },
    });
    tlRef.current = tl;
    tl.set(blocks, { scaleY: 0, transformOrigin: "top" });
    tl.to(blocks, {
      scaleY: 1,
      duration: 0.32,
      stagger: 0.018,
      ease: "power2.in",
    });
    tl.set(blocks, { transformOrigin: "bottom" });
    tl.to(blocks, {
      scaleY: 0,
      duration: 0.32,
      stagger: 0.018,
      ease: "power2.out",
    });
  }, []);

  return (
    <div className="transition" ref={ref}>
      <div className="transition-row row-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="block" key={"a" + i}></div>
        ))}
      </div>
      <div className="transition-row row-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="block" key={"b" + i}></div>
        ))}
      </div>
    </div>
  );
}
