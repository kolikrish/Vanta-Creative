import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Five parallax accents — Amazon, IG and Blinkit in three corners,
   WhatsApp and Facebook on the side edges. Twitter/X, Snapchat and
   Meta are removed. All tiles are rendered with a rounded card shape
   and a soft black overlay so they read as themed accents. */
const PARALLAX_IMAGES = [
  { src: "/assets/socials/amazon.png",    cls: "tagline-img tagline-img-1", speed: -90 },
  { src: "/assets/socials/ig.png",        cls: "tagline-img tagline-img-2", speed: 70 },
  { src: "/assets/socials/blinkit.png",   cls: "tagline-img tagline-img-3", speed: -130 },
  { src: "/assets/socials/facebook.jpeg", cls: "tagline-img tagline-img-8", speed: 60 },
];

export default function Tagline() {
  const rootRef = useRef(null);
  const headingRef = useRef(null);
  const imagesRef = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    const heading = headingRef.current;
    if (!root || !heading) return;

    heading.style.setProperty("--fill", "0%");

    const fillTrig = ScrollTrigger.create({
      trigger: root,
      // Tighter scroll window + ease-in curve: fill stays slow at the start
      // (so each line is readable as the wave-front passes), accelerates
      // toward the end, and locks at 100% well BEFORE the heading scrolls
      // out of the viewport. The previous 220% range pushed completion
      // past the section's exit, so the last line never visibly filled.
      start: "top bottom",
      end: "+=130%",
      scrub: 1.2,
      onUpdate: (self) => {
        // Boost to 1.05 then clamp so the fill reliably reaches 100% even
        // if scrub smoothing leaves us a hair short at the end of the range.
        const linear = Math.min(1, self.progress * 1.05);
        const eased = Math.pow(linear, 1.7);
        heading.style.setProperty("--fill", `${eased * 100}%`);
      },
    });

    const imgTrigs = imagesRef.current.map((el) => {
      if (!el) return null;
      const speed = Number(el.dataset.speed || 0);
      return gsap.to(el, {
        y: speed,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => {
      fillTrig.kill();
      imgTrigs.forEach((t) => t?.scrollTrigger?.kill());
    };
  }, []);

  return (
    <section className="tagline" ref={rootRef}>
      <div className="tagline-bg" aria-hidden="true" />

      {PARALLAX_IMAGES.map((img, i) => (
        <div
          key={i}
          className={img.cls}
          data-speed={img.speed}
          ref={(el) => (imagesRef.current[i] = el)}
        >
          <img src={img.src} alt="" />
        </div>
      ))}

      <div className="tagline-inner">
        <h2 ref={headingRef} className="tagline-heading">
          We offer tailored social media services to boost your online presence and engagement. Our expertise includes content creation,{" "}
          <span className="tagline-nowrap">account management</span>, and{" "}
          <span className="tagline-accent">data-driven strategies.</span>{" "}
          This will increase brand growth, traffic, and conversions.
        </h2>
      </div>
    </section>
  );
}
