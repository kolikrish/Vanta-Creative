import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
  {
    id: "01",
    kicker: "Who",
    title: ["We are", "Circle."],
    copy: "A social-first studio for brands that would rather build something true than shout something loud. Strategy, content, and performance: one team, one operating system.",
  },
  {
    id: "02",
    kicker: "Belief",
    title: ["Craft over", "noise."],
    copy: "Attention is cheap. Attention that compounds is not. We design work that earns the second look, and the third, across feeds, formats, and funnels.",
  },
  {
    id: "03",
    kicker: "Approach",
    title: ["Stories that", "ship."],
    copy: "We start where the brand already makes sense, then translate it into the channels where it has to move. Brief, build, test, tune, on repeat, on the record.",
  },
  {
    id: "04",
    kicker: "Today",
    title: ["Always", "in motion."],
    copy: "Platforms shift weekly. So do we. The work is never done, just dated. That is the whole point of a Circle: keep going, keep closing the loop.",
  },
];

export default function AboutScroll() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () => `+=${distance()}`,
        // scrub: true (no smoothing) + pinType: transform (GPU translate
        // instead of position:fixed) is what makes the horizontal scrub
        // sit still during iOS momentum scroll instead of "bouncing".
        // Default pin uses position:fixed which Safari paints out-of-sync
        // with the momentum scroll — that's the bounce the user reports.
        scrub: true,
        pin: true,
        pinSpacing: true,
        pinType: "transform",
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section className="about-h" ref={rootRef}>
      <div className="about-h-header">
        <span className="about-h-eyebrow">
          <span>[07]</span>
          <span className="about-h-eyebrow-line" />
          <span>About Us</span>
        </span>
        <span className="about-h-hint">
          Keep scrolling
          <span className="about-h-hint-arrow" aria-hidden="true" />
        </span>
      </div>

      <div className="about-h-viewport">
        <div className="about-h-track" ref={trackRef}>
          {PANELS.map((p) => (
            <article className="about-h-panel" key={p.id}>
              <div className="about-h-panel-meta">
                <span className="about-h-num">{p.id}</span>
                <span className="about-h-kick">{p.kicker}</span>
              </div>
              <h2 className="about-h-title">
                {p.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p className="about-h-copy">{p.copy}</p>
            </article>
          ))}

          <article className="about-h-panel about-h-panel-end">
            <div className="about-h-panel-meta">
              <span className="about-h-num">/</span>
              <span className="about-h-kick">Circle</span>
            </div>
            <h2 className="about-h-title about-h-title-end">
              <span>Expand your</span>
              <span>radius</span>
              <span>with circle.</span>
            </h2>
          </article>
        </div>
      </div>
    </section>
  );
}
