import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { archive } from "../../data/content.js";

gsap.registerPlugin(ScrollTrigger);

export default function Archive() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll(".archive-item"));
    const splits = [];

    items.forEach((item) => {
      const split = new SplitType(item.querySelector(".archive-title h3"), {
        types: "chars",
        charClass: "char",
      });
      splits.push(split);

      gsap.set(item.querySelectorAll(".archive-shots .img"), {
        opacity: 0,
        y: 40,
        filter: "blur(12px)",
      });
      gsap.set(item.querySelectorAll(".archive-title .char"), {
        opacity: 0,
        y: 20,
        display: "inline-block",
        filter: "blur(10px)",
      });
      gsap.set(item.querySelector(".archive-year p"), { opacity: 0 });

      ScrollTrigger.create({
        trigger: item,
        start: "top 92%",
        once: true,
        onEnter: () => {
          gsap.to(item.querySelectorAll(".archive-shots .img"), {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            stagger: { amount: 0.15 },
          });
          gsap.to(item.querySelectorAll(".archive-title .char"), {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: { amount: 0.3 },
            ease: "power3.out",
            delay: 0.1,
          });
          gsap.to(item.querySelector(".archive-year p"), {
            opacity: 1,
            duration: 0.5,
            delay: 0.2,
          });
        },
      });
    });

    return () => splits.forEach((s) => s.revert());
  }, []);

  // Use a deterministic fallback image (reuse archive imagery we do not have on disk)
  // Since we only have portraits/hero/carousel, use carousel bgs cyclically so nothing 404s.
  const fallback = (n) => {
    const idx = ((parseInt(String(n).replace(/\D/g, ""), 10) - 1) % 5) + 1;
    return `/assets/carousel/bg-${idx}.jpg`;
  };

  return (
    <section className="archive" ref={root}>
      <div className="wrapper">
        {archive.map((item, i) => (
          <div className="archive-item" key={i}>
            <div className="archive-col archive-shots">
              {item.images.map((im, k) => (
                <div className="img" key={k}>
                  <img src={fallback(im)} alt="" loading="lazy" />
                </div>
              ))}
            </div>
            <div className="archive-col archive-info">
              <div className="archive-title">
                <h3>{item.name}</h3>
              </div>
              <div className="archive-year">
                <p>{item.year}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
