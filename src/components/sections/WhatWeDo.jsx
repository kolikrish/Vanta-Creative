import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "../../App.jsx";

gsap.registerPlugin(ScrollTrigger);

/* Each card is drawn in a 160×100 "core" viewBox, then inflated to 186×126 so
   tab bumps (extending 13 units past the core edge) stay inside the SVG. The
   shape spec for each piece is [top, right, bottom, left] — each side is one
   of "flat", "tab" (bulges out), or "slot" (cuts in). The 3×2 layout is laid
   out so every shared edge has one tab + matching slot, so the pieces
   interlock cleanly when spread. */
const SHAPES = [
  ["flat", "tab",  "tab",  "flat"], // 0 — TL corner
  ["flat", "slot", "slot", "slot"], // 1 — top middle
  ["flat", "flat", "tab",  "tab" ], // 2 — TR corner
  ["slot", "tab",  "flat", "flat"], // 3 — BL corner
  ["tab",  "slot", "flat", "slot"], // 4 — bottom middle
  ["slot", "flat", "flat", "tab" ], // 5 — BR corner
];

/* Mobile shapes — carved for the 2×3 layout (2 cols, 3 rows). Every shared
   edge has a tab on one side and a matching slot on the other. */
const SHAPES_MOBILE = [
  ["flat", "tab",  "tab",  "flat"], // 0 — TL corner
  ["flat", "flat", "slot", "slot"], // 1 — TR corner
  ["slot", "tab",  "tab",  "flat"], // 2 — row 1 left
  ["tab",  "flat", "slot", "slot"], // 3 — row 1 right
  ["slot", "tab",  "flat", "flat"], // 4 — BL corner
  ["tab",  "flat", "flat", "slot"], // 5 — BR corner
];

/* Puzzle path with a parametric corner radius. Stack phase renders with R=5
   so each card looks like a rounded post-it; as the spread phase advances,
   ScrollTrigger drives R → 0 so the assembled grid reads as a single clean
   geometric block. Tabs/slots stay curved either way — that's what makes
   adjacent pieces interlock. */
const buildPath = ([t, r, b, l], R = 5) => {
  const v = {
    top:    { flat: "60 0 100 0 100 0",        tab: "60 -13 100 -13 100 0",    slot: "60 13 100 13 100 0"   },
    right:  { flat: "160 35 160 65 160 65",    tab: "173 35 173 65 160 65",    slot: "147 35 147 65 160 65" },
    bottom: { flat: "100 100 60 100 60 100",   tab: "100 113 60 113 60 100",   slot: "100 87 60 87 60 100"  },
    left:   { flat: "0 65 0 35 0 35",          tab: "-13 65 -13 35 0 35",      slot: "13 65 13 35 0 35"     },
  };
  return (
    `M${R} 0 H60 C${v.top[t]} H${160 - R} Q160 0 160 ${R} ` +
    `V35 C${v.right[r]} V${100 - R} Q160 100 ${160 - R} 100 ` +
    `H100 C${v.bottom[b]} H${R} Q0 100 0 ${100 - R} ` +
    `V65 C${v.left[l]} V${R} Q0 0 ${R} 0 Z`
  );
};

const CARDS = [
  {
    id: "01",
    title: "Branding & Content Planning",
    color: "var(--c-yellow)",
    desc: "Identity systems and editorial calendars that turn your voice into a steady publishing rhythm across every channel.",
  },
  {
    id: "02",
    title: "Social Media & Performance Marketing",
    color: "var(--c-mint)",
    desc: "Content, community, and paid media run as one engine, daily presence on socials with campaigns built around CAC, ROAS and the funnel.",
  },
  {
    id: "03",
    title: "Website Development",
    color: "var(--c-pink)",
    desc: "Fast, accessible, considered websites, built to convert today and crafted to scale as your business grows.",
  },
  {
    id: "04",
    title: "E-Commerce Listings & Optimisation",
    color: "var(--c-blue)",
    desc: "Catalogue copy, imagery, and storefront tuning that lifts discoverability, add-to-cart, and lifetime value.",
  },
  {
    id: "05",
    title: "SEO / SEM",
    color: "var(--c-red)",
    desc: "Organic visibility paired with paid search: the long game and the short game, working as one engine.",
  },
  {
    id: "06",
    title: "Production Shoot",
    color: "var(--c-yellow)",
    desc: "On-location and studio shoots, briefed to the channel, captured for the brief and edited for performance.",
  },
].map((c, i) => ({ ...c, shape: SHAPES[i], path: buildPath(SHAPES[i], 5) }));

const START_RADIUS = 5;
const END_RADIUS = 0;

// Slight rotation/offset per card while stacked — keeps the post-it look.
const RESTING = [
  { rot: -4, x: -4, y:  2 },
  { rot:  3, x:  3, y: -1 },
  { rot: -2, x: -2, y:  3 },
  { rot:  2, x:  2, y:  0 },
  { rot: -3, x:  4, y: -2 },
  { rot:  4, x: -3, y:  1 },
];

/* Final spread positions in xPercent / yPercent (of card's own size). The
   3×2 grid is offset from stage centre. Column step = 86% of card width
   (160/186 — neighbours' cores touch, with 13/186 of overlap on each side
   so tabs and slots interpenetrate). Row step = 79.4% of card height. */
const COL_STEP = 86;
const ROW_STEP = 79.4;
const SPREAD = [
  { x: -50 - 1.0 * COL_STEP, y: -50 - 0.5 * ROW_STEP },
  { x: -50 + 0.0 * COL_STEP, y: -50 - 0.5 * ROW_STEP },
  { x: -50 + 1.0 * COL_STEP, y: -50 - 0.5 * ROW_STEP },
  { x: -50 - 1.0 * COL_STEP, y: -50 + 0.5 * ROW_STEP },
  { x: -50 + 0.0 * COL_STEP, y: -50 + 0.5 * ROW_STEP },
  { x: -50 + 1.0 * COL_STEP, y: -50 + 0.5 * ROW_STEP },
];

/* Mobile spread — re-flow the 3×2 layout into a 2×3 grid (2 wide, 3 tall)
   so the assembled puzzle fits the narrower viewport. */
const SPREAD_MOBILE = [
  { x: -50 - 0.5 * COL_STEP, y: -50 - 1.0 * ROW_STEP },
  { x: -50 + 0.5 * COL_STEP, y: -50 - 1.0 * ROW_STEP },
  { x: -50 - 0.5 * COL_STEP, y: -50 + 0.0 * ROW_STEP },
  { x: -50 + 0.5 * COL_STEP, y: -50 + 0.0 * ROW_STEP },
  { x: -50 - 0.5 * COL_STEP, y: -50 + 1.0 * ROW_STEP },
  { x: -50 + 0.5 * COL_STEP, y: -50 + 1.0 * ROW_STEP },
];

/* The stage shrinks while the cards spread so the assembled puzzle stays
   inside the viewport. The narrower 3×2 grid lets us keep cards a bit
   larger than the previous 4×2; mobile 2×3 still needs a heavy shrink. */
const STAGE_SCALE_SPREAD = 0.88;
const STAGE_SCALE_SPREAD_MOBILE = 0.62;
const isMobileWWD = () =>
  typeof window !== "undefined" && window.innerWidth <= 900;

export default function WhatWeDo() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);

  /* See the long comment on the matching useLayoutEffect in Reveal.jsx.
     Same fix here — WhatWeDo also pins with pinSpacing:true, which
     wraps its trigger in a pin-spacer div. Killing the ScrollTriggers
     BEFORE React removes the trigger DOM prevents the cross-page
     "Failed to execute removeChild" crash that left /brands blank
     after navigating away from home. */
  useLayoutEffect(() => {
    const root = rootRef.current;
    return () => {
      if (!root) return;
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger && (t.trigger === root || root.contains(t.trigger))) {
          t.kill(true);
        }
      });
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const cards = cardRefs.current.filter(Boolean);
    if (!root || !stage || cards.length === 0) return;

    gsap.set(stage, { scale: 1, transformOrigin: "50% 50%" });

    // Capture once at start; we don't try to recompute on resize because
    // the timeline is already pinned + scrubbed. invalidateOnRefresh below
    // gives us a clean restart on orientation change.
    const mobile = isMobileWWD();
    const spread = mobile ? SPREAD_MOBILE : SPREAD;
    const stageScale = mobile ? STAGE_SCALE_SPREAD_MOBILE : STAGE_SCALE_SPREAD;
    // Bigger initial offset on mobile so the bottom card is fully off-screen
    // — at 4×2 desktop sizing 160% was enough; for the smaller 2×4 cards
    // and shorter mobile viewports we push it further.
    const initialY = mobile ? 220 : 160;

    cards.forEach((card, i) => {
      gsap.set(card, {
        xPercent: -50,
        yPercent: initialY,
        rotation: RESTING[i].rot * 0.3,
      });
    });

    /* Per-card rise tuning. Card 1 is animated by a pre-pin
       one-shot trigger (see further down) so it lands before the
       pin engages. The remaining (cards.length - 1) cards rise
       during the pinned timeline at RISE_STEP intervals each
       lasting RISE_DUR units, so the in-pin stack phase covers
       (cards.length - 1) × RISE_STEP units of scroll. */
    const RISE_DUR = 0.4;
    const RISE_STEP = 0.4;
    const stackPhases = (cards.length - 1) * RISE_STEP;
    const spreadPhase = 1.5;            // pieces fan out
    const holdPhase   = 0.6;            // hold final layout
    const totalPhases = stackPhases + spreadPhase + holdPhase;

    // Scroll-progress windows where the corner radius transitions from
    // rounded → sharp (mapped onto the same range as the spread tween).
    const radiusStart = stackPhases / totalPhases;
    const radiusEnd   = (stackPhases + spreadPhase) / totalPhases;

    const paths = cards.map((card) => card.querySelector(".wwd-card-shape path"));
    // Pick the shape set that matches the active spread layout so vertical
    // and horizontal neighbours interlock cleanly (CARDS[i].shape is the
    // 4×2 desktop set; mobile needs a different carve for 2×4).
    const activeShapes = mobile ? SHAPES_MOBILE : SHAPES;

    const setRadius = (R) => {
      paths.forEach((p, i) => {
        if (p) p.setAttribute("d", buildPath(activeShapes[i], R));
      });
    };

    // On mobile, the JSX path still encodes the desktop shape — rewrite
    // each card's path immediately on mount so the stack already matches
    // the mobile interlock pattern before any scroll happens.
    if (mobile) setRadius(START_RADIUS);

    let locked = false;
    let lastRq = null;

    // Dedicated pin trigger — owns the pinning + spacer for the section's
    // entire scroll range. Stays alive forever so scrolling back through the
    // section keeps it correctly pinned even after the animation locks.
    const pinDistance = `+=${totalPhases * 100}%`;

    const pinTrigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: pinDistance,
      pin: true,
      pinType: "transform",
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });

    // Separate scrub trigger — drives the timeline + radius. Disabled once
    // the spread completes, but the pinTrigger above is left untouched so
    // scrolling back up never reveals empty pinSpacer space.
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: pinDistance,
        scrub: true,
        invalidateOnRefresh: true,
        // Drive the corner radius alongside the spread tween: rounded while
        // stacking, easing to sharp by the time pieces lock together.
        onUpdate: (self) => {
          if (locked) return;
          const p = self.progress;
          let R;
          if (p <= radiusStart) R = START_RADIUS;
          else if (p >= radiusEnd) R = END_RADIUS;
          else {
            const t = (p - radiusStart) / (radiusEnd - radiusStart);
            R = START_RADIUS + (END_RADIUS - START_RADIUS) * t;
          }
          // Quantize to half-units. Rebuilding 8 SVG <path d="…"> strings
          // and firing 8 setAttribute() calls every micro-scroll frame is
          // the hottest cost in this section; sub-half-unit changes are
          // imperceptible visually so we skip the work.
          const Rq = Math.round(R * 2) / 2;
          if (Rq === lastRq) return;
          lastRq = Rq;
          setRadius(Rq);
        },
        // Once past the spread, freeze the cards in the connected
        // layout, stop the scrub, and release the pin so the section
        // becomes a regular block in flow. After this point scroll-up
        // and scroll-down are both normal — no long pinned re-traversal
        // when the user goes back to Reveal.
        onLeave: (self) => {
          if (locked) return;
          locked = true;
          gsap.set(stage, { scale: stageScale });
          cards.forEach((card, i) => {
            gsap.set(card, {
              xPercent: spread[i].x,
              yPercent: spread[i].y,
              rotation: 0,
            });
          });
          setRadius(END_RADIUS);
          lastRq = END_RADIUS;
          stage.classList.add("is-locked");
          self.disable(false, false);

          // Release the pin so the section becomes a regular 100vh
          // block in flow — afterwards scroll-up and scroll-down are
          // both normal (no long re-traversal of the pin).
          //
          // On touch devices the previous version of this routine
          // raced with ScrollTrigger.normalizeScroll() (installed in
          // App.jsx for touch) and the post-kill scroll snap failed,
          // leaving the user dropped near the footer. Fix: disable
          // the normalizer for the duration of kill + scrollTo +
          // refresh, then re-enable it. With the normalizer paused
          // the scroll snap actually takes effect and the section
          // collapses cleanly into a regular 100vh block.
          const isTouch =
            typeof window !== "undefined" &&
            (window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
              window.innerWidth <= 900);

          const sectionStart = pinTrigger.start;
          const normalizer = isTouch ? ScrollTrigger.normalizeScroll() : null;
          if (normalizer) normalizer.disable();

          pinTrigger.kill();

          const lenis = getLenis();
          if (lenis) {
            lenis.scrollTo(sectionStart, { immediate: true, force: true });
          } else {
            window.scrollTo(0, sectionStart);
          }
          ScrollTrigger.refresh();

          if (normalizer) {
            // Re-enable on the next frame so the scroll position has
            // settled before the normalizer takes back control.
            requestAnimationFrame(() => normalizer.enable());
          }
        },
      },
    });

    /* Card 1 rises EARLIER — fires once via a non-scrubbed
       scrollTrigger as the section enters the viewport (top 85%),
       so by the time the user has scrolled far enough for the pin
       to engage, card 1 is already on the stack. `once: true` +
       `overwrite: "auto"` keeps the one-shot from fighting the
       main pinned timeline (the previous attempt with `scrub: true`
       kept reapplying card 1's rest position after the spread
       phase, leaving the top-left puzzle slot empty). */
    const firstCard = cards[0];
    const firstRest = RESTING[0];
    const card1Rise = gsap.to(firstCard, {
      xPercent: -50 + firstRest.x,
      yPercent: -50 + firstRest.y,
      rotation: firstRest.rot,
      duration: 0.75,
      ease: "power3.out",
      overwrite: "auto",
      scrollTrigger: {
        trigger: root,
        start: "top 85%",
        once: true,
      },
    });

    // Phase 1 — cards rise into the centre stack one by one.
    // Card 1 has already been animated above (via the pre-pin
    // one-shot), so the pinned timeline only animates cards 2-N.
    cards.forEach((card, i) => {
      if (i === 0) return;
      const rest = RESTING[i];
      tl.to(card, {
        xPercent: -50 + rest.x,
        yPercent: -50 + rest.y,
        rotation: rest.rot,
        duration: RISE_DUR,
      }, (i - 1) * RISE_STEP);
    });

    // Phase 2 — once the last card has landed, the stack segregates and the
    // pieces glide out to their puzzle slots, snapping to zero rotation so
    // they interlock cleanly.
    cards.forEach((card, i) => {
      const target = spread[i];
      tl.to(card, {
        xPercent: target.x,
        yPercent: target.y,
        rotation: 0,
        duration: spreadPhase,
        ease: "power2.inOut",
      }, stackPhases);
    });

    // Shrink the whole stage in lockstep with the spread so the assembled
    // grid stays comfortably inside the viewport.
    tl.to(stage, {
      scale: stageScale,
      duration: spreadPhase,
      ease: "power2.inOut",
    }, stackPhases);

    // Hold the connected puzzle on screen before the pin releases.
    tl.to({}, { duration: holdPhase });

    return () => {
      // pinTrigger may already be killed by onLeave; guard with a flag.
      try { pinTrigger.kill(); } catch { /* already killed */ }
      // Pre-pin one-shot for card 1.
      try { card1Rise.scrollTrigger?.kill(); } catch { /* already killed */ }
      try { card1Rise.kill(); } catch { /* already killed */ }
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="wwd" ref={rootRef}>
      <div className="wwd-bg" aria-hidden="true">
        <span>OUR</span>
        <span>SERVICES</span>
      </div>

      <img
        className="wwd-arrow"
        src="/arrow-logo.png"
        alt=""
        aria-hidden="true"
      />

      <div className="wwd-stage" ref={stageRef}>
        {CARDS.map((card, i) => (
          <article
            key={card.id}
            className={`wwd-card wwd-card-${i}`}
            ref={(el) => (cardRefs.current[i] = el)}
            style={{ zIndex: 10 + i }}
          >
            <svg
              className="wwd-card-shape"
              viewBox="-13 -13 186 126"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d={card.path} fill={card.color} />
            </svg>

            <div className="wwd-card-content">
              <span className="wwd-card-id">{card.id}</span>
              <h3 className="wwd-card-title">{card.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
