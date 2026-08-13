import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* Renders text as inline SVG and animates it like a brush writing the word.
   - Filled letter (bottom layer) is revealed left → right via an animated
     clip-path rectangle, so it never appears as a hollow outline.
   - Stroked letter (top layer) traces along its outlines via stroke-dashoffset
     at the same pace, giving the visible "pen drawing" feel.
   Font is Yellowtail (bold brush cursive) to match the orange "Referrals"
   reference image. */

let uid = 0;

export default function HandwriteText({
  children,
  className = "",
  delay = 0.5,
  drawDuration = 2.2,
  strokeWidth = 1.4,
  ...rest
}) {
  // Display font reads better in uppercase for the big drawn page-signature
  // word ("Studio", "Work", "Services"). The Prestige Script fallback ran
  // lowercase; we don't need that anymore now that we render in sans-serif.
  const text =
    typeof children === "string" ? children.toUpperCase() : children;
  const textRef = useRef(null);
  const [box, setBox] = useState(null);
  const idRef = useRef(`hw-${++uid}`);

  const measure = () => {
    const node = textRef.current;
    if (!node) return;
    try {
      const b = node.getBBox();
      const padX = b.height * 0.18;
      const padY = b.height * 0.22;
      setBox({
        x: b.x - padX,
        y: b.y - padY,
        w: b.width + padX * 2,
        h: b.height + padY * 2,
      });
    } catch {
      /* font not yet ready — retried once fonts.ready resolves */
    }
  };

  useLayoutEffect(() => {
    measure();
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const id = idRef.current;
  const viewBox = box ? `${box.x} ${box.y} ${box.w} ${box.h}` : "0 0 800 240";
  const clipId = `${id}-clip`;

  return (
    <svg
      className={`hw-svg ${className}`.trim()}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      {...rest}
    >
      <style>{`
        .${id} { font-family: "Neue Haas Grotesk Display Pro", "Satoshi", sans-serif;
                 font-size: 260px; font-weight: 500; letter-spacing: -0.04em;
                 text-transform: uppercase; }
        .${id}-fill   { fill: currentColor; }
        .${id}-stroke {
          fill: none;
          stroke: currentColor;
          stroke-width: ${strokeWidth};
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 4000;
          stroke-dashoffset: 4000;
          animation: ${id}-draw ${drawDuration}s cubic-bezier(.55,.08,.4,.97) ${delay}s forwards;
        }
        @keyframes ${id}-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .${id}-stroke { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <defs>
        <clipPath id={clipId}>
          {/* Left-anchored rect; width grows 0 → box.w in lockstep with the
              stroke trace, so the fill is exposed only where the pen has been. */}
          <rect
            x={box ? box.x : 0}
            y={box ? box.y : 0}
            width="0"
            height={box ? box.h : 240}
          >
            {box && (
              <animate
                attributeName="width"
                from="0"
                to={box.w}
                dur={`${drawDuration}s`}
                begin={`${delay}s`}
                fill="freeze"
                calcMode="spline"
                keyTimes="0;1"
                keySplines="0.55 0.08 0.4 0.97"
              />
            )}
          </rect>
        </clipPath>
      </defs>

      {/* Hidden measuring text — used once to compute bbox, then we render the
          real layered version. */}
      {!box && (
        <text
          ref={textRef}
          className={`${id} ${id}-fill`}
          x="0"
          y="0"
          dominantBaseline="hanging"
          style={{ visibility: "hidden" }}
        >
          {text}
        </text>
      )}

      {box && (
        <>
          {/* Bottom: filled glyphs, revealed left-to-right via clip-rect */}
          <text
            ref={textRef}
            className={`${id} ${id}-fill`}
            x="0"
            y="0"
            dominantBaseline="hanging"
            clipPath={`url(#${clipId})`}
          >
            {text}
          </text>
          {/* Top: outline strokes traced by stroke-dashoffset (the "pen") */}
          <text
            className={`${id} ${id}-stroke`}
            x="0"
            y="0"
            dominantBaseline="hanging"
          >
            {text}
          </text>
        </>
      )}
    </svg>
  );
}
