import { useState, useEffect, useCallback } from "react";

const CAROUSELS = [
  {
    name: "Brand Carousel",
    cover: "/assets/work/carousels/1/Split-1.png",
    slides: Array.from({ length: 7 }, (_, i) => `/assets/work/carousels/1/Split-${i + 1}.png`),
  },
  {
    name: "Boba Bob",
    cover: "/assets/work/carousels/2/01.png",
    slides: Array.from({ length: 6 }, (_, i) => `/assets/work/carousels/2/${String(i + 1).padStart(2, "0")}.png`),
  },
  {
    name: "GDP: India vs Japan",
    cover: "/assets/work/carousels/3/01.png",
    slides: Array.from({ length: 9 }, (_, i) => `/assets/work/carousels/3/${String(i + 1).padStart(2, "0")}.png`),
  },
  {
    name: "Indore Metro Guide",
    cover: "/assets/work/carousels/4/01.png",
    slides: Array.from({ length: 10 }, (_, i) => `/assets/work/carousels/4/${String(i + 1).padStart(2, "0")}.png`),
  },
  {
    name: "Why Indore for Real Estate",
    cover: "/assets/work/carousels/5/01.png",
    slides: Array.from({ length: 9 }, (_, i) => `/assets/work/carousels/5/${String(i + 1).padStart(2, "0")}.png`),
  },
];

/* Coverflow viewer — when a marquee card is clicked, this overlay
   opens with the active slide painted CRISPLY on top of a phone
   mockup, while the phone's screen shows a blurred+dim copy of the
   same slide as its background. Two preview cards flank each side
   (near + far). Clicking a side card or pressing arrows slides
   every card smoothly to its new position via CSS transitions on
   transform/opacity — slides physically move left/right rather
   than just swapping. */
function CoverflowViewer({ data, onClose }) {
  const slides = data.slides;
  const n = slides.length;
  const [idx, setIdx] = useState(0);
  const wrap = (i) => ((i % n) + n) % n;

  const next = useCallback(() => setIdx((i) => wrap(i + 1)), [n]);
  const prev = useCallback(() => setIdx((i) => wrap(i - 1)), [n]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  // Per-slide signed distance from the active index, wrapped to the
  // nearest shortest path so a slide moves the short way around the
  // loop instead of across the whole ring.
  const signedDelta = (i) => {
    let d = i - idx;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <div className="cm-overlay" onClick={onClose}>
      {/* Blurred backdrop image that follows the active slide. */}
      <div
        className="cm-backdrop"
        style={{ backgroundImage: `url(${slides[idx]})` }}
        aria-hidden="true"
      />
      <div className="cm-backdrop-tint" aria-hidden="true" />

      <button
        type="button"
        className="cm-close"
        aria-label="Close carousel"
        onClick={onClose}
      >
        ×
      </button>

      <div className="cm-stage" onClick={(e) => e.stopPropagation()}>
        {/* Glow circle behind the phone. */}
        <div className="cm-stage-circle" aria-hidden="true" />

        {/* Phone mockup — fixed centre. Its screen is filled with a
            BLURRED + dimmed copy of the active slide so the active
            card on top reads as the focal element while the phone
            provides ambient colour. */}
        <div className="cm-phone" aria-hidden="true">
          <div className="cm-phone-frame">
            {/* Side hardware buttons — visible on the metal rail. */}
            <span className="cm-phone-btn cm-phone-btn-mute" />
            <span className="cm-phone-btn cm-phone-btn-vol-up" />
            <span className="cm-phone-btn cm-phone-btn-vol-dn" />
            <span className="cm-phone-btn cm-phone-btn-power" />
            <div className="cm-phone-bezel">
              <div className="cm-phone-screen">
                <span className="cm-phone-island" />
                <span className="cm-phone-cam" />
                <span className="cm-phone-speaker" />
                <img
                  className="cm-phone-screen-img"
                  src={slides[idx]}
                  alt=""
                  draggable={false}
                />
                <div className="cm-phone-screen-tint" />
                <span className="cm-phone-homebar" />
              </div>
            </div>
          </div>
        </div>

        {/* Every slide rendered as a sliding card. Each card's
            position is computed live from its signed-distance to
            the active index, so when `idx` changes, all cards
            transition smoothly to their new slots. Active card
            lands on top of the phone; near + far cards step
            outward with reduced scale, opacity and brightness. */}
        <div className="cm-track">
          {slides.map((src, i) => {
            const d = signedDelta(i);
            const abs = Math.abs(d);
            const visible = abs <= 2;
            return (
              <button
                key={i}
                type="button"
                className={`cm-slide${d === 0 ? " is-active" : ""}`}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  "--d": d,
                  "--abs": abs,
                  pointerEvents: visible ? "auto" : "none",
                  visibility: visible ? "visible" : "hidden",
                }}
              >
                <img src={src} alt="" draggable={false} loading="lazy" />
              </button>
            );
          })}
        </div>

        {/* Arrow nav. */}
        <button
          type="button"
          className="cm-arrow cm-arrow-prev"
          aria-label="Previous slide"
          onClick={prev}
        >
          ‹
        </button>
        <button
          type="button"
          className="cm-arrow cm-arrow-next"
          aria-label="Next slide"
          onClick={next}
        >
          ›
        </button>

        {/* Dots. */}
        <div className="cm-dots" onClick={(e) => e.stopPropagation()}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`cm-dot${i === idx ? " is-active" : ""}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CarouselMarquee() {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Duplicate the items for seamless infinite loop
  const items = [...CAROUSELS, ...CAROUSELS];

  return (
    <>
      <div className="cm-marquee">
        <div className="cm-track-marquee">
          {items.map((c, i) => (
            <button
              key={`${c.name}-${i}`}
              type="button"
              className="cm-card"
              onClick={() => setOpen(c)}
              aria-label={`Open ${c.name} carousel`}
            >
              <img
                src={c.cover}
                alt={c.name}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <span className="cm-card-label">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {open && <CoverflowViewer data={open} onClose={() => setOpen(null)} />}
    </>
  );
}
