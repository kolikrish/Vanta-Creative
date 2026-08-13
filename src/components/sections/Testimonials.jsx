import { useEffect, useRef, useState } from "react";
import { testimonials } from "../../data/content.js";
import BlurInText from "../fx/BlurInText.jsx";

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/* Auto-rotation interval — every CYCLE_MS the active testimonial
   advances to the next. Hovering the carousel pauses the rotation
   so the user can finish reading; lifting the cursor resumes it. */
const CYCLE_MS = 6000;

/* Minimum horizontal swipe distance to count as a deliberate
   navigation gesture on touch devices. Smaller deltas (taps,
   scroll fidgets) are ignored. */
const SWIPE_THRESHOLD_PX = 50;

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const total = testimonials.length;

  /* `pausedRef` is a ref instead of state so the interval below
     can react to pause/resume WITHOUT being torn down and
     re-armed on every change — that was the auto-rotation bug
     (the interval kept resetting before it could ever fire). */
  const pausedRef = useRef(false);

  /* Auto-advance — single interval, set up once on mount, lives
     until unmount. It reads pausedRef and idx via closure, so
     interaction state changes don't restart it. */
  useEffect(() => {
    const tick = setInterval(() => {
      if (pausedRef.current) return;
      setIdx((i) => (i + 1) % total);
    }, CYCLE_MS);
    return () => clearInterval(tick);
  }, [total]);

  /* Touch-swipe — record where the finger touched down, compare
     to where it lifted. Threshold-gated so accidental wiggles
     don't fire. Touch start also pauses auto-rotation while the
     finger is on the carousel; touchend resumes it. */
  const touchStartXRef = useRef(null);
  const onTouchStart = (e) => {
    pausedRef.current = true;
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchMove = (e) => {
    // Just keep paused; navigation happens on touchend so a slow
    // swipe doesn't trigger mid-drag.
    pausedRef.current = true;
    if (touchStartXRef.current == null) return;
    // Track latest X via the event so onTouchEnd has it via
    // closure; we don't need to update state per move.
  };
  const onTouchEnd = (e) => {
    pausedRef.current = false;
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX == null) return;
    const endX = e.changedTouches[0]?.clientX ?? startX;
    const dx = endX - startX;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    // Swipe LEFT (negative dx) → next testimonial.
    // Swipe RIGHT (positive dx) → previous.
    setIdx((i) => {
      if (dx < 0) return (i + 1) % total;
      return (i - 1 + total) % total;
    });
  };

  const t = testimonials[idx];

  return (
    <section className="testimonials">
      <h2 className="testimonials-title">
        Voices <span className="testimonials-title-em">from our partners.</span>
      </h2>
      <div className="testimonials-head">
        <p className="label">[Voices / Clients]</p>
        <h3>
          Selected words from partners we have grown alongside over the years.
        </h3>
      </div>

      <div
        className="t-carousel"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {/* Card has a fixed min-height so the rotating content
            doesn't shrink/grow the layout as the quote length
            changes between testimonials. */}
        <article className="t-card t-card--featured">
          <span className="t-glyph">“</span>
          <span className="t-index">{String(idx + 1).padStart(2, "0")}</span>
          {/* The blockquote uses idx as its key so React remounts
              the content on each rotation — that re-fires the
              BlurInText word-by-word entrance for a clean fade-in.
              Critically the WRAPPING article does NOT key off idx,
              so the card's min-height + paddings stay constant
              and the layout doesn't shift. */}
          <BlurInText
            key={`q-${idx}`}
            as="blockquote"
            split="words"
            stagger={0.04}
            blur={14}
          >
            {t.quote}
          </BlurInText>
          <div className="t-meta" key={`m-${idx}`}>
            <div className="t-avatar">{initialsOf(t.author)}</div>
            <div>
              <p className="t-author">{t.author}</p>
              <p className="t-role">{t.role}</p>
            </div>
          </div>
        </article>

        {/* Dot navigation — click any dot to jump to that
            testimonial. */}
        <div className="t-dots" role="tablist" aria-label="Testimonials">
          {testimonials.map((_, i) => (
            <button
              type="button"
              key={i}
              className={`t-dot${i === idx ? " is-active" : ""}`}
              aria-label={`Show testimonial ${i + 1}`}
              aria-selected={i === idx}
              role="tab"
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
