import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "../../App.jsx";

gsap.registerPlugin(ScrollTrigger);

const PLATFORMS = [
  {
    id: "amazon",
    name: "Amazon Ads",
    /* `logo` is the clean wordmark used on the home-page card (small,
       neutral, fits the card grid). `modalLogo` is the full
       "Verified Partner" badge — the real Amazon-issued artwork —
       shown inside the modal where there's enough room for it to read
       at full size. */
    /* User-supplied partner badge dropped at
       public/assets/socials/amazon-partner.png (from ~/Desktop/logos/).
       Used both on the home card and inside the modal. */
    logo: "/assets/socials/amazon-partner.png",
    modalLogo: "/assets/socials/amazon-partner.png",
    role: "Verified Advertising Partner",
    blurb: "Sponsored Products, Brands and DSP, tuned for ROAS.",
    accent: "var(--c-yellow)",
    accentRgb: "255, 197, 92",
    modal: {
      headline: "Built to scale on Amazon.",
      lead: "We run the full Amazon Ads stack as a verified partner, Sponsored Products, Brands, Display and DSP, tuned around ROAS, ACOS and new-to-brand growth.",
      stats: [
        { v: "7.2x", k: "Average ROAS",            note: "Across managed Sponsored Products accounts" },
        { v: "13%",  k: "Median ACOS",             note: "Down from 28% category baseline" },
        { v: "+42%", k: "New-to-brand orders",     note: "First-90-day uplift on launched listings" },
        { v: "3.4x", k: "Click-to-conversion lift", note: "After listing + creative optimisation" },
      ],
      capabilities: [
        "Sponsored Products",
        "Sponsored Brands",
        "Sponsored Display",
        "DSP & Programmatic",
        "Listing Optimisation",
        "A+ & Brand Stores",
      ],
      curve: "M 0 76 L 60 70 L 120 64 L 180 58 L 240 50 L 300 44 L 360 36 L 420 30 L 480 24 L 540 20 L 600 16 L 660 14 L 720 10 L 780 8 L 840 6 L 900 4",
    },
  },
  {
    id: "meta",
    name: "Meta Business Partner",
    /* User-supplied partner badge dropped at
       public/assets/socials/meta-partner.png (from ~/Desktop/logos/).
       Used both on the home card and inside the modal. */
    logo: "/assets/socials/meta-partner.png",
    modalLogo: "/assets/socials/meta-partner.png",
    role: "Verified Creative Agency",
    blurb: "Facebook, Instagram and Reels, full-funnel creative + media.",
    accent: "var(--c-blue)",
    accentRgb: "96, 165, 250",
    modal: {
      headline: "Built to scale on Meta.",
      lead: "Verified Meta Business Partner running full-funnel creative and media buying across Facebook, Instagram, Reels and the Audience Network.",
      stats: [
        { v: "2.4M+", k: "Monthly reach",          note: "Across managed creator + brand accounts" },
        { v: "3.2%",  k: "Average CTR",            note: "Vs 1.1% Meta category benchmark" },
        { v: "5.8x",  k: "Blended ROAS",           note: "On 90-day always-on retainers" },
        { v: "−38%",  k: "CPA reduction",          note: "After creative refresh + audience tuning" },
      ],
      capabilities: [
        "Facebook & Instagram Ads",
        "Reels & Story Placements",
        "Audience Network",
        "Catalog & Advantage+",
        "Creator Collabs",
        "Pixel & CAPI Setup",
      ],
      curve: "M 0 78 L 60 68 L 120 72 L 180 56 L 240 60 L 300 42 L 360 48 L 420 32 L 480 38 L 540 22 L 600 28 L 660 16 L 720 20 L 780 10 L 840 14 L 900 6",
    },
  },
];

function PlatformModal({ platform, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    /* THE ACTUAL ROOT CAUSE of "modal won't scroll" was app-level scroll
       hijacking: this app installs Lenis (smooth-wheel scroller) on
       desktop and ScrollTrigger.normalizeScroll(true) on touch devices.
       Both intercept wheel/touch events at the document level and
       prevent native overflow:auto on children from receiving them.
       Pause both while the modal is open, and resume on close. */
    const lenis = getLenis?.();
    const lenisWasRunning = lenis && !lenis.isStopped;
    if (lenisWasRunning) lenis.stop();

    const normalizer = ScrollTrigger.normalizeScroll();
    if (normalizer) normalizer.disable();

    /* iOS Safari body scroll-lock: just `overflow: hidden` on body
       breaks momentum scrolling INSIDE fixed-position descendants
       (the overlay/modal here). The fix is to make the body itself
       position:fixed at the saved scroll position. */
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.left = prev.left;
      document.body.style.right = prev.right;
      document.body.style.width = prev.width;
      document.body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
      if (normalizer) normalizer.enable();
      if (lenisWasRunning) lenis.start();
    };
  }, [onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    /* Opacity-only fade-in. The previous translate+scale enter animation
       left a `transform` value on the panel after completion, which on
       iOS Safari was preventing the parent overlay's overflow:auto from
       initiating native momentum scroll on touch. Fade-only keeps the
       panel free of any leftover transform. */
    gsap.fromTo(
      panel,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out", clearProps: "transform" }
    );
    const path = panel.querySelector(".pww-modal-curve path");
    if (path) {
      const len = path.getTotalLength();
      gsap.fromTo(
        path,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 1.4, ease: "power2.out", delay: 0.2 }
      );
    }
  }, [platform.id]);

  /* Render to a portal at document.body so the modal escapes any
     ancestor that might have `transform`, `filter`, or `perspective`
     applied (e.g. GSAP-animated wrappers, ScrollTrigger pin transforms).
     Such ancestors create a containing block for `position: fixed`
     descendants, which traps the overlay inside that ancestor's box and
     can break native overflow scroll on iOS Safari. */
  return createPortal(
    <div
      className="pww-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${platform.name} growth details`}
      data-lenis-prevent
    >
      <div
        className="pww-modal"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        style={{
          "--pww-accent": platform.accent,
          "--pww-accent-rgb": platform.accentRgb,
        }}
      >
        <button
          type="button"
          className="pww-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <span />
          <span />
        </button>

        <div className="pww-modal-head">
          <div className="pww-modal-logo">
            <img
              src={platform.modalLogo || platform.logo}
              alt={`${platform.name} logo`}
            />
          </div>
          <span className="pww-modal-badge">
            <span className="pww-modal-dot" />
            {platform.role}
          </span>
        </div>

        <h3 className="pww-modal-title">{platform.modal.headline}</h3>
        <p className="pww-modal-lead">{platform.modal.lead}</p>

        <div className="pww-modal-stats">
          {platform.modal.stats.map((s) => (
            <div key={s.k} className="pww-modal-stat">
              <span className="pww-modal-stat-v">{s.v}</span>
              <span className="pww-modal-stat-k">{s.k}</span>
              <span className="pww-modal-stat-n">{s.note}</span>
            </div>
          ))}
        </div>

        <div className="pww-modal-graph">
          <p className="pww-modal-graph-label">
            <span>Growth trajectory</span>
            <span>90-day window</span>
          </p>
          <svg
            className="pww-modal-curve"
            viewBox="0 0 900 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`pww-fill-${platform.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor={platform.accent} stopOpacity="0.32" />
                <stop offset="100%" stopColor={platform.accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[20, 40, 60, 80].map((y) => (
              <line
                key={y}
                x1="0"
                x2="900"
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 6"
              />
            ))}
            <path
              d={`${platform.modal.curve} L 900 100 L 0 100 Z`}
              fill={`url(#pww-fill-${platform.id})`}
            />
            <path
              d={platform.modal.curve}
              fill="none"
              stroke={platform.accent}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="pww-modal-caps">
          <p className="pww-modal-caps-label">What we run</p>
          <ul>
            {platform.modal.capabilities.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function PlatformsWorkedWith() {
  const rootRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = root.querySelectorAll(".pww-card");
    const trig = ScrollTrigger.batch(cards, {
      start: "top 85%",
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.15 }
        ),
      once: true,
    });

    return () => trig.forEach((t) => t.kill());
  }, []);

  const activePlatform = PLATFORMS.find((p) => p.id === activeId);

  return (
    <section className="pww" ref={rootRef}>
      <div className="pww-inner">
        <header className="pww-head">
          <p className="pww-eyebrow">[Verified partners]</p>
          <h2 className="pww-title">
            Platforms <span className="pww-title-em">we work with.</span>
          </h2>
          <p className="pww-sub">
            Officially verified by the platforms that shape modern commerce.
            Tap a card to see the analytics and growth we drive on each.
          </p>
        </header>

        <div className="pww-grid">
          {PLATFORMS.map((p) => (
            <button
              type="button"
              key={p.id}
              className={`pww-card pww-card--${p.id}`}
              style={{ "--pww-accent": p.accent }}
              onClick={() => setActiveId(p.id)}
              aria-haspopup="dialog"
            >
              <div className="pww-card-mark">
                <img
                  src={p.modalLogo || p.logo}
                  alt={`${p.name} logo`}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="pww-card-body">
                <span className="pww-card-badge">
                  <span className="pww-card-dot" />
                  {p.role}
                </span>
                <p className="pww-card-blurb">{p.blurb}</p>
              </div>

              <div className="pww-card-foot">
                <span>View growth analytics</span>
                <span className="pww-card-arrow" aria-hidden="true">↗</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activePlatform && (
        <PlatformModal
          platform={activePlatform}
          onClose={() => setActiveId(null)}
        />
      )}
    </section>
  );
}
