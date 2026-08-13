import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  brandsStats,
  brandIndustries,
  featuredBrands,
} from "../../data/content.js";

gsap.registerPlugin(ScrollTrigger);

/* Brands page showcase — sits ABOVE the honeycomb. Three blocks:
     1. Roster-level numbers (40+ brands, 12+ industries, etc.)
     2. Industry pills — breadth at a glance
     3. Featured brand cards — logo + scope + a headline metric per brand,
        so the page reads as case-study work, not just a logo wall.
*/
export default function BrandsShowcase() {
  const statsRef = useRef(null);

  // Count-up animation on the stat numbers — single trigger when the
  // grid first enters the viewport. Keeps the page reading as a live
  // showcase instead of a static block of numerals.
  useEffect(() => {
    const root = statsRef.current;
    if (!root) return;

    const nums = root.querySelectorAll(".bsx-stat-num");
    const trigs = [];
    nums.forEach((el) => {
      const target = Number(el.dataset.target || 0);
      const obj = { v: 0 };
      const t = gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
        onUpdate: () => {
          el.textContent = Math.round(obj.v);
        },
      });
      trigs.push(t);
    });

    return () => {
      trigs.forEach((t) => t.scrollTrigger?.kill());
      trigs.forEach((t) => t.kill());
    };
  }, []);

  return (
    <section className="bsx">
      <div className="bsx-inner">
        {/* ---- Roster numbers ---- */}
        <header className="bsx-head">
          <p className="bsx-eyebrow">[Roster · Industries · Work shipped]</p>
          <h2 className="bsx-title">
            The numbers behind <span>the logos.</span>
          </h2>
          <p className="bsx-sub">
            Six years of work across India, Dubai, the US and Canada. Below
            the headline metrics — what each brand actually ships with us.
          </p>
        </header>

        <div className="bsx-stats" ref={statsRef}>
          {brandsStats.map((s) => (
            <div className="bsx-stat" key={s.k}>
              <span className="bsx-stat-v">
                <span className="bsx-stat-num" data-target={s.v}>0</span>
                <sup>{s.sup}</sup>
              </span>
              <span className="bsx-stat-k">{s.k}</span>
            </div>
          ))}
        </div>

        {/* ---- Industry pills ---- */}
        <div className="bsx-industries">
          <p className="bsx-industries-label">Industries we run with</p>
          <ul className="bsx-industries-list">
            {brandIndustries.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>

        {/* ---- Featured case-study cards ---- */}
        <div className="bsx-cards-head">
          <p className="bsx-eyebrow">[Selected work]</p>
          <h3 className="bsx-cards-title">
            A few brands, what we ship, and the number we&rsquo;re measured on.
          </h3>
        </div>

        <ul className="bsx-cards">
          {featuredBrands.map((b) => (
            <li
              className="bsx-card"
              key={b.name}
              style={{ "--bsx-accent": b.accent }}
            >
              <div className="bsx-card-head">
                <div
                  className={`bsx-card-mark${b.mod ? ` bsx-card-mark--${b.mod}` : ""}`}
                  aria-hidden="true"
                >
                  <img
                    src={b.logo}
                    alt={b.name}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="bsx-card-meta">
                  <p className="bsx-card-industry">{b.industry}</p>
                  <h4 className="bsx-card-name">{b.name}</h4>
                </div>
              </div>

              <div className="bsx-card-stat">
                <span className="bsx-card-stat-v">{b.stat.v}</span>
                <span className="bsx-card-stat-k">{b.stat.k}</span>
              </div>

              <ul className="bsx-card-scope" aria-label="Scope of work">
                {b.scope.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>

              <p className="bsx-card-note">{b.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
