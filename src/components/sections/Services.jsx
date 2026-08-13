import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* "Our Work" — left column lists deliverable categories. The right column
   shows a realistic 3D iPhone in the centre with two floating cards on either
   side. The whole carousel is scroll-driven (no auto cycling): as the user
   scrolls, the strip glides right-to-left smoothly, blurring and fading the
   outer cards. Each category declares its own `type` so the card aspect ratio
   matches the format (post = 1:1, reel/story = 9:16). */
const WORK = [
  {
    id: "01",
    title: "Instagram Posts",
    type: "post",
    tagline: "Single-frame creatives engineered to stop the scroll.",
    images: [
      "/portfolio/posts/1.avif",
      "/portfolio/posts/2.avif",
      "/portfolio/posts/3.avif",
      "/portfolio/posts/4.avif",
      "/portfolio/posts/5.avif",
      "/portfolio/posts/6.avif",
    ],
  },
  {
    id: "02",
    title: "Instagram Stories",
    type: "story",
    tagline: "Vertical narratives that keep audiences swiping forward.",
    images: [
      "/portfolio/stories/1.avif",
      "/portfolio/stories/2.avif",
      "/portfolio/stories/3.avif",
      "/portfolio/stories/4.avif",
      "/portfolio/stories/5.avif",
    ],
  },
  {
    id: "03",
    title: "Curated Feeds",
    type: "post",
    tagline: "Cohesive grids that read like a magazine cover.",
    images: [
      "/portfolio/feed/1.avif",
      "/portfolio/feed/2.avif",
      "/portfolio/feed/3.avif",
      "/portfolio/feed/4.avif",
      "/portfolio/feed/5.avif",
      "/portfolio/feed/6.avif",
    ],
  },
  {
    id: "04",
    title: "Reels & Short Video",
    type: "reel",
    tagline: "Short-form video built for the algorithm.",
    images: [
      "/portfolio/posts/7.avif",
      "/portfolio/posts/8.avif",
      "/portfolio/posts/9.avif",
      "/portfolio/posts/10.avif",
      "/portfolio/posts/11.avif",
    ],
  },
  {
    id: "05",
    title: "Brand Identity",
    type: "post",
    tagline: "Identity systems with a voice you'll recognise anywhere.",
    images: [
      "/portfolio/feed/7.avif",
      "/portfolio/feed/8.avif",
      "/portfolio/feed/9.avif",
      "/portfolio/feed/10.avif",
    ],
  },
  {
    id: "06",
    title: "Analytics Dashboards",
    type: "dashboard",
    tagline: "Reporting frames that make growth measurable at a glance.",
    images: ["/portfolio/analytics/1.avif", "/portfolio/analytics/2.avif"],
  },
];

export default function Services() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const listRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  // Up to 3 images per category, flattened in category order. The carousel
  // walks through every card linearly; the title list still steps category
  // by category, with the active title held while all 3 of its cards pass
  // through the centre.
  const categoryCards = useMemo(() => {
    const cards = [];
    WORK.forEach((w, ci) => {
      w.images.slice(0, 3).forEach((img) => {
        cards.push({ category: w, image: img, ci });
      });
    });
    return cards;
  }, []);

  // Where each category begins in the flat card list, and how many cards
  // it owns. Used to convert a continuous card-position into a continuous
  // category-position (so the list scrolls smoothly across category
  // boundaries rather than jumping every 3 cards).
  const catRanges = useMemo(() => {
    const ranges = [];
    let acc = 0;
    WORK.forEach((w) => {
      const count = Math.min(3, w.images.length);
      ranges.push({ start: acc, count });
      acc += count;
    });
    return ranges;
  }, []);

  const cardPosToCatFloat = (cardPos) => {
    for (let i = 0; i < catRanges.length; i++) {
      const { start, count } = catRanges[i];
      if (cardPos < start + count) {
        return i + Math.max(0, (cardPos - start)) / count;
      }
    }
    return WORK.length - 1;
  };

  // Lay the cards out horizontally before the first paint so the user
  // never sees them stacked at the centre point. Without this, there's a
  // brief frame where every absolutely-positioned card sits at left:50%
  // top:50% before ScrollTrigger.onRefresh fires applyCarousel(0).
  useLayoutEffect(() => {
    applyCarousel(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const list = listRef.current;
    if (!root || !stage || !list) return;

    const items = Array.from(list.querySelectorAll(".work-list-item"));
    if (!items.length) return;

    const itemH = items[0].getBoundingClientRect().height;
    const totalCats = WORK.length;

    gsap.set(list, { y: 0 });

    // Total scroll distance: ~0.4 viewport-heights per card so each frame
    // gets enough time to read while the carousel still feels alive.
    const scrollLengthPx = () =>
      window.innerHeight * Math.max(2, categoryCards.length * 0.4);

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: () => `+=${scrollLengthPx()}`,
      pin: stage,
      pinType: "transform",
      pinSpacing: true,
      // Higher scrub = smoother lerp between the user's actual scroll
      // and the carousel position. 0.5 felt "too tight" — scroll deltas
      // mapped almost 1:1 to card positions which read as jittery on
      // mobile. 1.2 gives a softer glide without lagging the input.
      scrub: 1.2,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        // Continuous card index 0 → cards.length-1. Drives the carousel
        // image-by-image. The list scrolls in category units, derived from
        // which category the current card belongs to.
        const cardPos = p * (categoryCards.length - 1);
        const catFloat = cardPosToCatFloat(cardPos);

        gsap.set(list, { y: -catFloat * itemH });

        const ci = Math.min(totalCats - 1, Math.max(0, Math.round(catFloat)));
        if (ci !== activeRef.current) {
          activeRef.current = ci;
          setActive(ci);
        }

        applyCarousel(cardPos);
      },
      onRefresh: () => {
        gsap.set(list, { y: 0 });
        activeRef.current = 0;
        setActive(0);
        applyCarousel(0);
      },
    });

    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Per scroll frame, slide the flex track inside the carousel window so
  // the active card sits at the window's centre. catPos is the continuous
  // category index. Each card also gets a per-frame scale / blur / z-index
  // based on its distance from the centre slot, giving the cylindrical
  // depth feel without breaking the guaranteed horizontal flex layout.
  const applyCarousel = (catPos) => {
    const track = trackRef.current;
    if (!track) return;
    const cyl = track.parentElement;
    if (!cyl) return;

    const firstCard = cardRefs.current.find(Boolean);
    if (!firstCard) return;

    const cardW = firstCard.offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    const STEP_X = cardW + gap;

    // Slide the track so card[catPos]'s centre aligns with the carousel
    // window's centre — that's the "locked at one place" effect.
    const cylW = cyl.offsetWidth;
    const naturalTx = cylW / 2 - cardW / 2 - catPos * STEP_X;
    // Clamp the right end of the track to the right edge of the window.
    // Without this, the last card stays at centre and a second card off
    // the right falls off the page — only 2 cards would be in frame at
    // the end. With the clamp, once the last card reaches the right edge
    // the track stops sliding and the active card simply walks rightward
    // through the window, keeping the last 3 cards all in frame.
    const totalTrackW = (cardRefs.current.length - 1) * STEP_X + cardW;
    const endLockTx = cylW - totalTrackW;
    const tx = Math.max(endLockTx, naturalTx);
    track.style.transform = `translateX(${tx}px)`;

    // Disable filter:blur on mobile — it's the dominant paint cost on
    // mobile GPUs and makes the carousel scroll jitter on low-end phones.
    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth <= 819 ||
        window.matchMedia("(hover: none) and (pointer: coarse)").matches);

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const pos = i - catPos;
      const ap = Math.abs(pos);
      const scale = Math.max(0.7, 1 - ap * 0.08);
      const op = ap < 2.6 ? (ap < 1.6 ? 1 : Math.max(0, 1 - (ap - 1.6) / 1.0)) : 0;
      const zi = Math.round(20 - ap * 4);
      // Cache last-written values per card — skip the inline-style write
      // when nothing changed. Avoids hundreds of redundant DOM writes per
      // scroll frame.
      const cache = el._workCardCache || (el._workCardCache = {});
      const opStr = String(op);
      if (cache.op !== opStr) { el.style.opacity = opStr; cache.op = opStr; }
      const ziStr = String(zi);
      if (cache.zi !== ziStr) { el.style.zIndex = ziStr; cache.zi = ziStr; }
      const tfStr = `translateZ(${-ap * 80}px) scale(${scale})`;
      if (cache.tf !== tfStr) { el.style.transform = tfStr; cache.tf = tfStr; }
      if (!isMobile) {
        const blur = ap > 1 ? (ap - 1) * 1.5 : 0;
        const flStr = blur > 0.05 ? `blur(${blur}px)` : "";
        if (cache.fl !== flStr) { el.style.filter = flStr; cache.fl = flStr; }
      } else if (cache.fl !== "") {
        el.style.filter = "";
        cache.fl = "";
      }
    });
  };

  // Active category drives the type tag on the phone wrapper (so the screen
  // layout adopts the right format — square for posts, full-bleed for
  // stories / reels).
  const cat = WORK[active];

  return (
    <section className="work-scroll" ref={rootRef}>
      <div className="work-stage" ref={stageRef}>
        <div className="work-label">
          <p>[Our Work]</p>
          <p>The work we're proud of</p>
        </div>

        <div className="work-grid">
          <div className="work-list-col">
            <div className="work-list-viewport">
              <ul className="work-list" ref={listRef}>
                {WORK.map((w, i) => (
                  <li
                    key={w.id}
                    className={`work-list-item ${i === active ? "is-active" : ""}`}
                  >
                    {w.title}
                  </li>
                ))}
              </ul>
            </div>

            <div className="work-tagline">
              {WORK.map((w, i) => (
                <p
                  key={w.id}
                  className={`work-tagline-line ${i === active ? "is-active" : ""}`}
                  aria-hidden={i !== active}
                >
                  {w.tagline}
                </p>
              ))}
            </div>
          </div>

          <div className={`work-phone-col is-${cat.type}`}>
            {/* Phone silhouette — sits BEHIND the carousel as a static
                backdrop, so the cards visually feel like they're scrolling
                across a phone screen. Empty screen by design. */}
            <div className="work-phone" aria-hidden="true">
              <div className="work-phone-frame">
                <span className="work-phone-btn work-phone-btn-mute" />
                <span className="work-phone-btn work-phone-btn-vol-up" />
                <span className="work-phone-btn work-phone-btn-vol-dn" />
                <span className="work-phone-btn work-phone-btn-power" />
                <div className="work-phone-bezel">
                  <div className="work-phone-screen">
                    <div className="work-phone-island" />
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed carousel window on the right. The window itself stays
                locked in place; the inner track slides on scroll so the
                active category card sits at the window's centre. Each
                card also gets a scale / blur / z-index based on its
                distance from centre for the cylindrical depth. */}
            <div className="work-cards-cyl" aria-hidden="true">
              <div className="work-cards-track" ref={trackRef}>
                {categoryCards.map((c, i) => (
                  <div
                    key={`${c.category.id}-${c.image}`}
                    ref={(el) => (cardRefs.current[i] = el)}
                    className={`work-card is-${c.category.type}`}
                  >
                    <img src={c.image} alt={c.category.title} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="work-counter">
          <span className="current">{String(active + 1).padStart(2, "0")}</span>
          <span className="divider">/</span>
          <span className="total">{String(WORK.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}
