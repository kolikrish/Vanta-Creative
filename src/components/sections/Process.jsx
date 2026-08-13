import { useEffect, useRef, useState } from "react";
import BlurInText from "../fx/BlurInText.jsx";

/* Each piece is drawn in a 100x100 viewBox. All four silhouettes share the
   IDENTICAL SVG command sequence (M H C H Q V C V Q H C H Q V C V Q Z) so
   the `d` attribute can be interpolated smoothly between them — only the
   C-curve control points differ to express tab / slot / flat on each side.
     • Tab  → control points pushed OUT past the edge (e.g. y = -13 for top)
     • Slot → control points pulled IN past the edge (e.g. y =  13 for top)
     • Flat → control points lie ON the edge */
const TL_PATH =
  "M5 0 H38 C38 0 62 0 62 0 H95 Q100 0 100 5 V38 C113 38 113 62 100 62 V95 Q100 100 95 100 H62 C62 113 38 113 38 100 H5 Q0 100 0 95 V62 C0 62 0 38 0 38 V5 Q0 0 5 0 Z";
const TR_PATH =
  "M5 0 H38 C38 0 62 0 62 0 H95 Q100 0 100 5 V38 C100 38 100 62 100 62 V95 Q100 100 95 100 H62 C62 113 38 113 38 100 H5 Q0 100 0 95 V62 C13 62 13 38 0 38 V5 Q0 0 5 0 Z";
const BL_PATH =
  "M5 0 H38 C38 13 62 13 62 0 H95 Q100 0 100 5 V38 C113 38 113 62 100 62 V95 Q100 100 95 100 H62 C62 100 38 100 38 100 H5 Q0 100 0 95 V62 C0 62 0 38 0 38 V5 Q0 0 5 0 Z";
const BR_PATH =
  "M5 0 H38 C38 13 62 13 62 0 H95 Q100 0 100 5 V38 C100 38 100 62 100 62 V95 Q100 100 95 100 H62 C62 100 38 100 38 100 H5 Q0 100 0 95 V62 C13 62 13 38 0 38 V5 Q0 0 5 0 Z";

/* Each piece carries its HOME shape (resting position in the 2x2) plus a
   MORPH shape — the silhouette it needs when it slides into a neighbour's
   slot, so it still interlocks with whoever stays put. The morphValues /
   morphTimes lists feed an SVG <animate> that linearly interpolates the
   path's `d` attribute, producing a smooth tab→slot reshape mid-slide. */
const PUZZLE_PIECES = [
  {
    className: "pp pp-1",
    color: "var(--c-mint)",
    path: TL_PATH,
    morphValues: `${TL_PATH};${TL_PATH};${BL_PATH};${BL_PATH};${TL_PATH};${TL_PATH}`,
    morphTimes: "0;0.8;0.85;0.9;0.95;1",
  },
  {
    className: "pp pp-2",
    color: "var(--c-blue)",
    path: TR_PATH,
    morphValues: `${TR_PATH};${TR_PATH};${TL_PATH};${TL_PATH};${TR_PATH};${TR_PATH}`,
    morphTimes: "0;0.05;0.1;0.15;0.2;1",
  },
  {
    className: "pp pp-3",
    color: "var(--c-pink)",
    path: BL_PATH,
    morphValues: `${BL_PATH};${BL_PATH};${BR_PATH};${BR_PATH};${BL_PATH};${BL_PATH}`,
    morphTimes: "0;0.55;0.6;0.65;0.7;1",
  },
  {
    className: "pp pp-4",
    color: "var(--c-yellow)",
    path: BR_PATH,
    morphValues: `${BR_PATH};${BR_PATH};${TR_PATH};${TR_PATH};${BR_PATH};${BR_PATH}`,
    morphTimes: "0;0.3;0.35;0.4;0.45;1",
  },
];

export default function Process() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(true);

  // Pause the puzzle's SVG SMIL `<animate>` elements + the CSS keyframe
  // sliding when the section isn't on screen. Continuously running them
  // in the background is what was eating mobile CPU and causing scroll
  // jitter on the sections below.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      className={`process ${inView ? "" : "is-offscreen"}`}
      ref={sectionRef}
    >
      <div className="process-head">
        <BlurInText
          as="h2"
          split="words"
          stagger={0.035}
          duration={0.55}
          blur={12}
        >
          A measured system that turns ideas into outcomes, then tunes itself.
        </BlurInText>
        <div className="process-puzzle" aria-hidden="true">
          {PUZZLE_PIECES.map((p) => (
            <span key={p.className} className={p.className}>
              <svg
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: "visible" }}
              >
                <path d={p.path} fill={p.color}>
                  <animate
                    attributeName="d"
                    dur="20s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    values={p.morphValues}
                    keyTimes={p.morphTimes}
                    keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                  />
                </path>
              </svg>
            </span>
          ))}
        </div>

        {/* Second smaller puzzle, mobile-only — sits on the LEFT side
            below the main puzzle. Hidden on desktop via CSS. */}
        <div className="process-puzzle process-puzzle-mini" aria-hidden="true">
          {PUZZLE_PIECES.map((p) => (
            <span key={p.className} className={p.className}>
              <svg
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: "visible" }}
              >
                <path d={p.path} fill={p.color}>
                  <animate
                    attributeName="d"
                    dur="20s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    values={p.morphValues}
                    keyTimes={p.morphTimes}
                    keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                  />
                </path>
              </svg>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
