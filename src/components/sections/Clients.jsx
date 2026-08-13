import { useEffect, useRef, useState } from "react";

/* "Brands we've worked with" — Apple-Watch-style honeycomb of circular logos.
   Section scrolls naturally (no pin, no scroll-jack). Each icon's scale +
   opacity is driven by its distance from the viewport centre, so icons grow
   as they pass through the middle of the screen — the fish-eye effect from
   the watchOS home screen. Hover smoothly enlarges any single icon.

   Renders on BOTH the home page (curated subset via `brands` prop) and the
   /brands page (full roster, default export of FULL_BRANDS). The honeycomb
   layout adapts to the row count automatically — the row-pattern arrays
   wrap once the brand list runs out. */

// Full default roster — used when no `brands` prop is passed (i.e., on
// the /brands page). User-specified order at the top (most well-known
// brands first), then the rest mixed so no single category clusters.
const FULL_BRANDS = [
  // Brands updated to use the new client-supplied logos in
  // /public/logos/new-clients/ wherever a matching asset exists.
  // Brands without a new logo keep their original path; three
  // additional brands (Vaayu, Cosmafood UAE, Shree Balaji Bhumi
  // Solution) supplied in the new asset set are appended.
  { name: "Adam's Ale",                   logo: "/logos/new-clients/adams-ale.png" },
  { name: "DNS Hospitals",                logo: "/logos/healthcare/2.png" },
  { name: "Park Avenue",                  logo: "/logos/park-avenue.png" },
  { name: "Agrawal Namkeen",              logo: "/logos/new-clients/aggarwal-namkeen.png" },
  { name: "Madmix",                       logo: "/logos/new-clients/madmix.png" },
  { name: "Urban Theka",                  logo: "/logos/new-clients/urban-theka.png" },
  // Line 2 starts here:
  { name: "Pro Brew Republic",            logo: "/logos/new-clients/pro-brew-republic.png" },
  { name: "Round Table India",            logo: "/logos/new-clients/round-table-india.png" },
  { name: "Indore Management Association",logo: "/logos/new-clients/indore-management-association.png" },
  { name: "Zawaa",                        logo: "/logos/new-clients/zawaa.png" },
  { name: "CamPure",                      logo: "/logos/new-clients/campure.png" },
  { name: "FICCI Flo",                    logo: "/logos/new-clients/ficci-flo.png" },
  { name: "Swastik Habitates",            logo: "/logos/new-clients/swastik-habitates.png" },
  // Mixed-order tail (no category clustering)
  { name: "The Indian Krunch",            logo: "/logos/fmcg/4.png" },
  { name: "Investitute",                  logo: "/logos/education/2.png" },
  { name: "Coloron Yarns",                logo: "/logos/fashion/1.png" },
  { name: "Conscious Food",               logo: "/logos/new-clients/conscious-food.png" },
  { name: "NM Group",                     logo: "/logos/real-estate/1.png" },
  { name: "Currygram",                    logo: "/logos/fmcg/5.png" },
  { name: "Whites of London",             logo: "/logos/new-clients/whites-of-london.png" },
  { name: "Park Avenue Beer Shampoo",     logo: "/logos/new-clients/park-avenue-beer-shampoo.png" },
  { name: "Tushar Enterprises",           logo: "/logos/management/3.png" },
  { name: "Bamboosa",                     logo: "/logos/fmcg/6.png" },
  { name: "Eduvest Connect",              logo: "/logos/education/1.png" },
  { name: "Mr. Elite",                    logo: "/logos/fashion/2.png" },
  { name: "Granny's Omlette",             logo: "/logos/hospitality/4.png" },
  { name: "Om Biomedic",                  logo: "/logos/healthcare/1.png" },
  { name: "The Coffee Clique",            logo: "/logos/fmcg/7.png" },
  { name: "Evara Weddings",               logo: "/logos/management/4.png" },
  { name: "Terra Actives",                logo: "/logos/personal-care/1.png" },
  { name: "Exprto",                       logo: "/logos/education/3.png" },
  { name: "HFL",                          logo: "/logos/real-estate/3.png" },
  { name: "Evora Greens",                 logo: "/logos/fmcg/8.png" },
  { name: "Shreeji Cotfab",               logo: "/logos/fashion/3.png" },
  { name: "Regain",                       logo: "/logos/healthcare/3.png" },
  { name: "Brew Saga",                    logo: "/logos/fmcg/9.png" },
  // New brands shipped with the latest client-logo set — not in
  // any prior list, added at the end of the roster.
  { name: "Vaayu",                        logo: "/logos/new-clients/vaayu.png" },
  { name: "Cosmafood UAE",                logo: "/logos/new-clients/cosmafood-uae.png" },
  { name: "Shree Balaji Bhumi Solution",  logo: "/logos/new-clients/shree-balaji-bhumi.png" },
];

// Honeycomb row pattern: strictly alternating, centred by flexbox.
// Desktop fits 5/4 across 8 rows = 36 slots. Mobile narrows to 4/3 across
// 10 rows = 35 slots so the larger mobile orbs don't get clipped at the
// section edges. The user-facing count says "40+" — that's the brand
// count we've actually worked with, not the orbs visible at once.
const ROW_PATTERN_DESKTOP = [5, 4, 5, 4, 5, 4, 5, 4];
const ROW_PATTERN_MOBILE = [4, 3, 4, 3, 4, 3, 4, 3, 4, 3];

// Per-orb tint cycles through the brand palette so the honeycomb picks up
// the same colour language as the rest of the site.
const ORB_COLORS = [
  "var(--c-blue)",
  "var(--c-yellow)",
  "var(--c-pink)",
  "var(--c-mint)",
  "var(--c-red)",
];

function buildRows(brands, pattern) {
  const rows = [];
  let cursor = 0;
  for (const count of pattern) {
    if (cursor >= brands.length) break;
    rows.push(brands.slice(cursor, cursor + count));
    cursor += count;
  }
  return rows;
}

export default function Clients({ brands, heading, eyebrow, cta }) {
  /* Default to the full roster when no brands prop is passed — keeps
     the /brands page working without changes. The home page passes a
     curated subset so the honeycomb shows ~8 main marques.
     `cta` (optional) renders inside the section header — used on home
     to inline the "see all brands" link beside the eyebrow instead of
     putting it in a separate section below. */
  const data = brands && brands.length > 0 ? brands : FULL_BRANDS;
  const rootRef = useRef(null);

  // Mobile uses a narrower 4/3 row pattern so the larger mobile orbs
  // don't overflow the viewport. Track viewport width via matchMedia so
  // a rotation/resize re-renders into the right pattern.
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 900px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const rows = buildRows(
    data,
    isMobile ? ROW_PATTERN_MOBILE : ROW_PATTERN_DESKTOP
  );

  // Apple-Watch fish-eye.
  // Desktop: sticky "stage" + honeycomb translate via rAF.
  // Mobile:  no sticky stage / no internal scroll — the honeycomb
  //          flows in normal page scroll, but the rAF still drives
  //          per-orb scale so each orb grows as it passes through
  //          the viewport centre (the watchOS lift effect, just
  //          synced to natural page scroll instead of an internal
  //          runway).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const orbs = Array.from(root.querySelectorAll(".brand-orb"));
    if (orbs.length === 0) return;

    let raf = 0;
    let inView = false;

    /* Lerp-smoothed per-orb scale + opacity. Each orb's render
       value eases toward its target by SMOOTH per frame. */
    const SMOOTH = 0.12;
    const orbScale = new WeakMap();
    const orbOp = new WeakMap();

    const update = () => {
      const vh = window.innerHeight;

      /* Both desktop and mobile now flow the section as a normal
         block — no sticky-stage translation. Per-orb fish-eye
         scale anchors to the VIEWPORT centre, so every row pops
         smoothly as it passes through the middle of the screen
         while staying in its natural-flow position. All rows
         remain visible together while the user scrolls past. */
      const centre = vh / 2;
      const range  = vh * 0.55;
      const cullTop    = -200;
      const cullBottom = vh + 200;

      // Mobile narrows the fish-eye scale curve so per-frame visual
      // change is less dramatic — feels less "snappy" during scroll.
      // Bumped floors (was 0.55 desktop / 0.65 mobile) so corner orbs
      // stay legible on first paint instead of shrinking into tiny
      // dots — the previous lows read as "the section is small" on
      // the home page where the honeycomb sits below richer content.
      // maxScale capped at 1.0 on phones — previous 1.08 grew the
      // centre orb past its layout box, which on a 4-orb row sized
      // to fill the viewport pushed neighbouring orbs visually off
      // the screen edge.
      const minScale = isMobile ? 0.82 : 0.78;
      const maxScale = isMobile ? 1.0  : 1.15;
      const minOp    = isMobile ? 0.7  : 0.6;
      const maxOp    = 1.0;

      for (const orb of orbs) {
        const rect = orb.getBoundingClientRect();
        if (rect.bottom < cullTop || rect.top > cullBottom) {
          orb.style.setProperty("--orb-scale", String(minScale));
          orb.style.setProperty("--orb-op", String(minOp));
          orbScale.delete(orb);
          orbOp.delete(orb);
          continue;
        }
        const iconCentre = rect.top + rect.height / 2;
        const dist = Math.abs(iconCentre - centre);
        const t = Math.max(0, 1 - dist / range);
        const eased = t * t * (3 - 2 * t);
        const targetScale = minScale + (maxScale - minScale) * eased;
        const targetOp    = minOp    + (maxOp    - minOp)    * eased;

        let s = orbScale.get(orb);
        let o = orbOp.get(orb);
        if (s === undefined) s = targetScale;
        if (o === undefined) o = targetOp;
        s += (targetScale - s) * SMOOTH;
        o += (targetOp    - o) * SMOOTH;
        orbScale.set(orb, s);
        orbOp.set(orb, o);

        orb.style.setProperty("--orb-scale", s.toFixed(3));
        orb.style.setProperty("--orb-op", o.toFixed(3));
      }

      if (inView) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const wasInView = inView;
        inView = entries[0].isIntersecting;
        if (inView && !wasInView) {
          raf = requestAnimationFrame(update);
        } else if (!inView && wasInView) {
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(root);

    update();

    return () => {
      inView = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [isMobile]);

  return (
    <section className="brands" ref={rootRef}>
      <div className="brands-stage">
        <div className="brands-head">
          <p>{eyebrow || "[Brands we've worked with, 40+]"}</p>
          {cta ? cta : <p>{heading || "Circle ↻ 2018–2026"}</p>}
        </div>

        <div className="brands-edge brands-edge-top" aria-hidden="true" />
        <div className="brands-edge brands-edge-bottom" aria-hidden="true" />

        <div className="brands-honeycomb" aria-label="Brands we've worked with">
          {rows.map((row, ri) => {
            let cursor = 0;
            for (let i = 0; i < ri; i++) cursor += rows[i].length;
            return (
              <div
                className={`brands-honeycomb-row ${ri % 2 === 1 ? "is-offset" : ""}`}
                key={ri}
              >
                {row.map((b, ci) => {
                  const flatIdx = cursor + ci;
                  const color = ORB_COLORS[flatIdx % ORB_COLORS.length];
                  return (
                    <div
                      className={`brand-orb${b.mod ? ` brand-orb--${b.mod}` : ""}`}
                      key={b.name}
                      title={b.name}
                      style={{ "--orb-color": color }}
                    >
                      <div className="brand-orb-inner">
                        <img
                          src={b.logo}
                          alt={b.name}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
