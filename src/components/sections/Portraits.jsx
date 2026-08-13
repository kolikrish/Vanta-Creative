import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Portraits() {
  useEffect(() => {
    const t1 = ScrollTrigger.create({
      trigger: ".portraits",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(".portrait.p-1", {
          yPercent: gsap.utils.interpolate(40, 30, self.progress),
        });
        gsap.set(".portrait.p-2", {
          yPercent: gsap.utils.interpolate(25, -75, self.progress),
        });
        gsap.set(".portrait.p-3", {
          yPercent: gsap.utils.interpolate(100, 0, self.progress),
        });
      },
    });
    return () => t1.kill();
  }, []);

  return (
    <section className="portraits">
      <div className="wrapper">
        <div className="portrait p-1">
          <img src="/assets/portraits/portrait-1.jpg" alt="" />
        </div>
        <div className="portrait p-2">
          <img src="/assets/portraits/portrait-2.jpg" alt="" />
        </div>
        <div className="portrait p-3">
          <img src="/assets/portraits/portrait-3.jpg" alt="" />
        </div>
      </div>
    </section>
  );
}
