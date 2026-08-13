import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BlurInText from "../components/fx/BlurInText.jsx";
import Dissolve from "../components/fx/Dissolve.jsx";
import HandwriteText from "../components/fx/HandwriteText.jsx";
import Testimonials from "../components/sections/Testimonials.jsx";
import Footer from "../components/sections/Footer.jsx";

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    id: "01",
    title: "The brief is a hypothesis, not a contract.",
    copy: "We pressure-test every assumption before a pixel ships. The strongest insight beats the loudest stakeholder.",
  },
  {
    id: "02",
    title: "Creative is a performance lever.",
    copy: "Beauty without numbers is decoration. We design for resonance and ROAS in the same brief.",
  },
  {
    id: "03",
    title: "Dashboards beat decks.",
    copy: "Every campaign reports in real time. If it does not move the dial, we kill it, and learn.",
  },
  {
    id: "04",
    title: "The best work outlives the calendar.",
    copy: "Brand systems, content engines, retention loops, built to compound long after the launch sprint.",
  },
];

/* Canonical site-wide stat set — same order, same numbers, same
   labels as the home Reveal stats and the /brands BrandsShowcase.
   Was reordered to lead with "Clients Onboard" to match the rest
   of the site. */
const STATS = [
  { v: "40",  suf: "+", k: "Clients Onboard" },
  { v: "12",  suf: "+", k: "Industries Served" },
  { v: "800", suf: "+", k: "Performance Campaigns" },
  { v: "6",   suf: "+", k: "Years of Experience" },
];

const VALUES = [
  "Measured",
  "Accountable",
  "Senior-only",
  "Always-on",
  "Outcome-led",
  "Compounding",
  "Honest",
  "Fast-moving",
];

export default function AboutPage() {
  const statsRef = useRef(null);

  useEffect(() => {
    const root = statsRef.current;
    if (!root) return;
    const counters = Array.from(root.querySelectorAll(".about-stat-count"));
    const trigs = counters.map((el) => {
      const target = Number(el.dataset.target || 0);
      const obj = { v: 0 };
      return gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = Math.round(obj.v);
        },
      });
    });
    return () => trigs.forEach((t) => t?.scrollTrigger?.kill());
  }, []);

  return (
    <>
      <div className="about-page">
        <section className="about-hero">
        <div className="about-hero-grid">
          <div className="about-hero-left">
            {/* Hero title removed per request. */}
          </div>

          <div className="about-hero-right">
            {/* Mirrors the Brands hero — one BlurInText copy +
                one mute "Scroll for…" cue. */}
            <BlurInText
              as="p"
              split="words"
              stagger={0.02}
              blur={10}
              className="about-hero-copy"
            >
              Circle is a full-service marketing studio for ambitious brands.
              Strategy, creative and performance under one roof, run by
              operators, not account managers.
            </BlurInText>

            <p className="about-hero-copy about-hero-copy-mute">
              Scroll for the philosophy.
            </p>
          </div>
        </div>

        <HandwriteText className="page-signature">Studio</HandwriteText>
      </section>

      <section className="about-stats" ref={statsRef}>
        <p className="label">[Receipts / 2019-2025]</p>
        <div className="about-stats-grid">
          {STATS.map((s) => (
            <div key={s.k}>
              <span className="v">
                <span className="about-stat-count" data-target={s.v}>0</span>
                <sup>{s.suf}</sup>
              </span>
              <span className="k">{s.k}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-origin">
        <Dissolve>
          <div className="about-origin-inner">
            <p className="label">[Origin / 2019]</p>
            <h2 className="about-origin-title">
              We started Circle because agencies were built for briefs,
              <em>not outcomes.</em>
            </h2>
            <div className="about-origin-grid">
              <p>
                Brands needed a partner that could move from brand platform to
                campaign to retention loop without losing the plot. So we
                stitched the disciplines back together: strategy, creative,
                media, data, into a single team.
              </p>
              <p>
                Circle is that team. Measured against your number, not scope
                documents. Six years in, the model holds: the deeper the
                integration, the bigger the compounding.
              </p>
            </div>
          </div>
        </Dissolve>
      </section>

      <section className="about-principles">
        <div className="about-principles-head">
          <p className="label">[Principles / 01-04]</p>
          <BlurInText
            as="h2"
            split="words"
            stagger={0.04}
            blur={12}
            className="about-principles-title"
          >
            Four things we do not compromise on.
          </BlurInText>
        </div>
        <div className="about-principles-grid">
          {PRINCIPLES.map((p) => (
            <article className="about-principle" key={p.id}>
              <span className="num">[{p.id}]</span>
              <h3>{p.title}</h3>
              <p>{p.copy}</p>
            </article>
          ))}
        </div>
        <div className="about-shape about-shape-sq" aria-hidden="true" />
        <div className="about-shape about-shape-ring" aria-hidden="true" />
      </section>

      <section className="about-marquee" aria-hidden="true">
        <div className="about-marquee-track">
          {[0, 1].map((row) => (
            <div className="about-marquee-row" key={row}>
              {[...VALUES, ...VALUES].map((v, idx) => (
                <span className="about-marquee-item" key={`${row}-${idx}`}>
                  <em className="about-marquee-bullet">★</em>
                  {v}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
      </div>
      <Footer />
    </>
  );
}
