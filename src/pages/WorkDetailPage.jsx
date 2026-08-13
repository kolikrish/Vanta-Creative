import { useEffect, useRef } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BlurInText from "../components/fx/BlurInText.jsx";
import Footer from "../components/sections/Footer.jsx";
import StoryCarousel from "../components/sections/StoryCarousel.jsx";

gsap.registerPlugin(ScrollTrigger);

const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

const COLLECTIONS = {
  "instagram-posts": {
    eyebrow: "[01] Instagram · Posts",
    title: "Instagram Posts",
    script: "Posts",
    intro:
      "Single-frame creatives engineered to stop the scroll. Every frame earns its place: a hook, a turn, a payoff, then we ship at the cadence the algorithm rewards.",
    bullets: [
      "Hook-first concepting, scroll-tested copy",
      "Carousel architecture with a payoff per slide",
      "Always-on shooting + studio-grade design",
      "Native to platform, never recycled",
    ],
    images: range(20).map((n) => `/portfolio/posts/${n}.avif`),
    layout: "grid-4",
  },
  "instagram-stories": {
    eyebrow: "[02] Instagram · Stories",
    title: "Instagram Stories",
    script: "Stories",
    intro:
      "Vertical narratives that keep audiences swiping forward. Sequences built to move people from a tap to a click: motion, polls and stickers that feel like the brand, not like a template.",
    bullets: [
      "Sequenced narratives, not one-off frames",
      "Polls, quizzes and stickers that earn reach",
      "Motion design tuned for vertical & sound-on",
      "Highlights as a permanent shop window",
    ],
    images: range(5).map((n) => `/portfolio/stories/${n}.avif`),
    layout: "cylinder",
  },
  "curated-feeds": {
    eyebrow: "[03] Instagram · Feed",
    title: "Curated Feeds",
    script: "Feeds",
    intro:
      "Cohesive grids that read like a magazine cover. Every nine squares compose at a glance and reward a longer scroll: typography, palette and pacing tuned so the feed becomes the brand.",
    bullets: [
      "Grid systems built for nine-tile rhythm",
      "Brand-true typography and palette",
      "Templated foundations, hand-tuned hero posts",
      "Refreshed monthly, measured weekly",
    ],
    images: range(14).map((n) => `/portfolio/feed/${n}.avif`),
    layout: "cylinder",
  },
  "reels-short-video": {
    eyebrow: "[04] Reels · Short Video",
    title: "Reels & Short Video",
    script: "Reels",
    intro:
      "Short-form video built for the algorithm. Hook in three seconds, payoff in fifteen: concepted, shot and cut for the platforms that decide the next scroll.",
    bullets: [
      "Concepts shaped by hook and platform native",
      "On-set direction, edit and motion in-house",
      "Sound-design and captions baked in",
      "Cut-downs, alts and A/B variants per launch",
    ],
    images: range(11).map((n) => `/portfolio/posts/${n}.avif`),
    layout: "grid-4",
  },
  "brand-identity": {
    eyebrow: "[05] Brand · Identity",
    title: "Brand Identity",
    script: "Identity",
    intro:
      "Identity systems with a voice you'll recognise anywhere. From naming and logo to type, tone and templates: the kit that makes every touchpoint sound like one brand.",
    bullets: [
      "Naming, logo, mark and wordmark",
      "Type system + colour with usage rules",
      "Brand voice and editorial guidelines",
      "Templates and components for the in-house team",
    ],
    images: range(10).map((n) => `/portfolio/feed/${n}.avif`),
    layout: "cylinder",
  },
  "analytics-dashboards": {
    eyebrow: "[06] Analytics · Dashboards",
    title: "Analytics Dashboards",
    script: "Analytics",
    intro:
      "Reporting frames that make growth measurable at a glance. We pair creative with the numbers that prove it: dashboards, weekly read-outs and the next decision, on one page.",
    bullets: [
      "20+ clients across D2C, retail and services",
      "5+ social handles managed end-to-end",
      "META + Google ads, full-funnel reporting",
      "Weekly performance read-outs, monthly retunes",
    ],
    images: ["/portfolio/analytics/1.avif", "/portfolio/analytics/2.avif"],
    layout: "grid-analytics",
    stats: [
      { v: "20+", k: "Clients" },
      { v: "5+", k: "Social handles" },
      { v: "META", k: "Facebook & Instagram ads" },
    ],
  },
};

export default function WorkDetailPage() {
  const { slug } = useParams();
  const data = COLLECTIONS[slug];
  const galleryRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const root = heroRef.current;
    if (!root) return;
    const items = root.querySelectorAll("[data-hero-reveal]");
    gsap.set(items, { opacity: 0, y: 28, filter: "blur(14px)" });
    const tl = gsap.timeline({ delay: 0.35 });
    tl.to(items, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.09,
    });
    return () => tl.kill();
  }, [slug]);

  useEffect(() => {
    const wrap = galleryRef.current;
    if (!wrap) return;
    const tiles = Array.from(wrap.querySelectorAll(".work-detail-tile"));
    const trigs = tiles.map((t) => {
      gsap.set(t, { autoAlpha: 0, y: 50 });
      return ScrollTrigger.create({
        trigger: t,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.to(t, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }),
      });
    });
    return () => trigs.forEach((t) => t.kill());
  }, [slug]);

  if (!data) return <Navigate to="/work" replace />;

  return (
    <>
      <div className="work-detail-page">
        <section className="work-detail-hero" ref={heroRef}>
          <div className="work-detail-hero-top">
            <p className="work-detail-crumb" data-hero-reveal>
              <span>{data.eyebrow}</span>
              <span className="work-detail-crumb-line" />
            </p>
            <nav className="work-detail-nav" data-hero-reveal>
              <Link to="/work">← All work</Link>
              <Link to="/services">Services</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Create with us</Link>
            </nav>
          </div>

          <h1 className="work-detail-title">
            <span className="line" data-hero-reveal>
              {data.title.split(" ")[0]}
            </span>
            <span className="line" data-hero-reveal>
              <em className="work-detail-script">{data.script}</em>
            </span>
          </h1>

          <BlurInText
            as="p"
            split="words"
            stagger={0.025}
            blur={12}
            duration={1.1}
            className="work-detail-copy"
          >
            {data.intro}
          </BlurInText>

          <ul className="work-detail-bullets" data-hero-reveal>
            {data.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          {data.stats && (
            <div className="work-detail-stats">
              {data.stats.map((s) => (
                <div key={s.k} className="work-detail-stat">
                  <span className="work-detail-stat-v">{s.v}</span>
                  <span className="work-detail-stat-k">{s.k}</span>
                </div>
              ))}
            </div>
          )}

          <p className="work-detail-scroll">[Scroll the work ↓]</p>
        </section>

        {data.layout === "cylinder" ? (
          <section className="work-detail-cylinder" ref={galleryRef}>
            <StoryCarousel images={data.images} alt={data.title} />
          </section>
        ) : (
          <section
            className={`work-detail-gallery work-detail-gallery-${data.layout}`}
            ref={galleryRef}
          >
            {data.images.map((src, i) => (
              <figure className="work-detail-tile" key={src} style={{ "--i": i }}>
                <img src={src} alt={`${data.title} ${i + 1}`} loading="lazy" />
              </figure>
            ))}
          </section>
        )}

      </div>
      <Footer />
    </>
  );
}
