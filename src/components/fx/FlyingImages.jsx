import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Parallax flying images.
 *
 * Two modes:
 *   layout="grid"  — original 3-column grid where each tile drifts as it scrolls (default).
 *   layout="sides" — `left` flies in from the left edge, `right` from the right, with an optional
 *                    `center` image floating between them. Use this for the services page
 *                    "left & right service" composition.
 *
 * For `layout="sides"`, pass { left, right, center? } via the `sides` prop instead of `images`.
 */
export default function FlyingImages({
  images = [],
  sides = null,
  layout = "grid",
  className = "",
}) {
  const container = useRef(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const tiles = Array.from(el.querySelectorAll(".flyer"));

    const trigs = tiles.map((t, i) => {
      const sideAttr = t.dataset.side;
      const isSides = layout === "sides" && sideAttr;
      const dir = isSides
        ? (sideAttr === "left" ? -1 : sideAttr === "right" ? 1 : 0)
        : (i % 2 === 0 ? 1 : -1);

      const xFrom = isSides ? dir * 220 : (i % 3 - 1) * 140;
      const yFrom = isSides ? 80 : 120 * dir;

      gsap.set(t, {
        xPercent: xFrom,
        yPercent: yFrom,
        opacity: 0,
        filter: "blur(18px)",
      });

      const trig = ScrollTrigger.create({
        trigger: t,
        start: "top 95%",
        end: "bottom 5%",
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(t, {
            xPercent: gsap.utils.interpolate(xFrom, 0, Math.min(1, p * 2)),
            yPercent: gsap.utils.interpolate(
              yFrom,
              isSides ? -20 : -30 * dir,
              p
            ),
            opacity: gsap.utils.interpolate(0, 1, Math.min(1, p * 3)),
            filter: `blur(${gsap.utils.interpolate(18, 0, Math.min(1, p * 3))}px)`,
          });
        },
      });
      return trig;
    });

    return () => trigs.forEach((t) => t.kill());
  }, [images, sides, layout]);

  if (layout === "sides" && sides) {
    return (
      <div ref={container} className={`flying-sides ${className}`}>
        <div className="flyer flyer-side flyer-left" data-side="left">
          <img src={sides.left} alt="" loading="lazy" />
        </div>
        {sides.center && (
          <div className="flyer flyer-side flyer-center" data-side="center">
            <img src={sides.center} alt="" loading="lazy" />
          </div>
        )}
        <div className="flyer flyer-side flyer-right" data-side="right">
          <img src={sides.right} alt="" loading="lazy" />
        </div>
        <style>{`
          .flying-sides {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1.4fr 1fr;
            gap: 2rem;
            align-items: center;
            padding: 5rem 1.25rem 6rem;
            max-width: 1500px;
            margin: 0 auto;
          }
          .flying-sides .flyer-side {
            position: relative;
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 4px;
            will-change: transform, opacity, filter;
          }
          .flying-sides .flyer-left,
          .flying-sides .flyer-right {
            aspect-ratio: 4 / 5;
          }
          .flying-sides .flyer-center {
            aspect-ratio: 4 / 5;
            transform-origin: center;
          }
          .flying-sides .flyer-left  { justify-self: start; width: 100%; }
          .flying-sides .flyer-right { justify-self: end;   width: 100%; }
          @media (max-width: 820px) {
            .flying-sides {
              grid-template-columns: 1fr;
              gap: 1rem;
              padding: 3rem 1rem 4rem;
            }
            .flying-sides .flyer-center { display: none; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div ref={container} className={`flying-grid ${className}`}>
      {images.map((src, i) => (
        <div className="flyer" key={i}>
          <img src={src} alt="" loading="lazy" />
        </div>
      ))}
      <style>{`
        .flying-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          padding: 4rem 1.25rem;
        }
        .flying-grid .flyer {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg);
          will-change: transform, opacity, filter;
        }
        .flying-grid .flyer img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .flying-grid .flyer:nth-child(3n+2) {
          margin-top: 6rem;
        }
        /* Lift image 2 (5th tile, middle of row 2) further up relative to
           its row siblings. Uses top so it doesn't conflict with the GSAP
           translate-based scroll animation. */
        .flying-grid .flyer:nth-child(5) {
          top: -6rem;
        }
        /* If the last row has only one tile (i.e. last child lands in
           column 1), center it in column 2 so it doesn't sit alone on the
           left. */
        .flying-grid .flyer:last-child:nth-child(3n+1) {
          grid-column: 2;
        }
        /* Mobile keeps the desktop 3-col layout — just bigger drop on the
           middle column so the parallax-down feel reads more on a phone. */
        @media (max-width: 820px) {
          .flying-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            padding: 12rem 1rem 5rem;
          }
          .flying-grid .flyer { margin-top: 6rem; }
          .flying-grid .flyer:nth-child(3n+2) { margin-top: 22rem; }
          .flying-grid .flyer:nth-child(5) { top: -16rem; }
        }
        @media (max-width: 480px) {
          .flying-grid {
            gap: 0.55rem;
            padding: 9rem 0.85rem 4rem;
          }
          .flying-grid .flyer { margin-top: 4rem; }
          .flying-grid .flyer:nth-child(3n+2) { margin-top: 14rem; }
          .flying-grid .flyer:nth-child(5) { top: -10rem; }
        }
      `}</style>
    </div>
  );
}
