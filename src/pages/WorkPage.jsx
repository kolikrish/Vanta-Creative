import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BlurInText from "../components/fx/BlurInText.jsx";
import HandwriteText from "../components/fx/HandwriteText.jsx";
import CarouselMarquee from "../components/fx/CarouselMarquee.jsx";
import Footer from "../components/sections/Footer.jsx";
import "../styles/work-sections.css";

gsap.registerPlugin(ScrollTrigger);

const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

/* ----------------------------------------------------------------------
   The Work page mirrors the Circle Media brochure as a vertical sequence
   of sections — each one a different format the studio ships, each with
   its own scroll animation so the page reads like flipping through the
   brochure. The list:

     1. Hero
     2. Carousel       — coverflow of carousel cards crossing a phone
     3. Statics        — phone with cards stacking/falling around it
     4. Stories        — three vertical phones tilt up on scroll
     5. Reels          — three phones rise + UGC / Influencer / Motion subgrid
     6. Reel Insights  — analytics phones with stats counting up
     7. Shoots         — aerial photos drift on a parallax with a drone hint
     8. Amazon Ads     — line charts that draw themselves on enter
     9. Listing        — marketplace phones tilt on a 3D row
    10. E-Commerce     — partner logo grid staggers in
    11. Brand Store    — tablet hero rotates & a+ content reveals
    12. SEO / SEM      — Google Maps phone with a dropping pin
    13. Website Dev    — laptop + mobile mockup parallax
    14. Together CTA   — closing "Let's work together"
   ---------------------------------------------------------------------- */

export default function WorkPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // 1. Generic "rise + blur in" for every .anim-rise child of any section.
    const rises = root.querySelectorAll(".anim-rise");
    const riseTrigs = Array.from(rises).map((el) => {
      gsap.set(el, { y: 50, autoAlpha: 0, filter: "blur(10px)" });
      return ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(el, {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "power3.out",
          }),
      });
    });

    // 2. Stagger reveal — children of any .anim-stagger container fade up
    //    in sequence as the container enters the viewport.
    const staggers = root.querySelectorAll(".anim-stagger");
    const staggerTrigs = Array.from(staggers).map((parent) => {
      const kids = parent.children;
      gsap.set(kids, { y: 40, autoAlpha: 0 });
      return ScrollTrigger.create({
        trigger: parent,
        start: "top 80%",
        once: true,
        onEnter: () =>
          gsap.to(kids, {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
          }),
      });
    });

    // 3. Carousel — cards drift in from off-stage right and settle into the
    //    coverflow lineup as the section reaches mid-viewport.
    const carousel = root.querySelector(".w-sec-carousel");
    let carouselTrig;
    if (carousel) {
      const cards = carousel.querySelectorAll(".w-carousel-card");
      gsap.set(cards, { x: 200, autoAlpha: 0 });
      carouselTrig = ScrollTrigger.create({
        trigger: carousel,
        start: "top 70%",
        once: true,
        onEnter: () =>
          gsap.to(cards, {
            x: 0,
            autoAlpha: 1,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.12,
          }),
      });
    }

    // 4. Statics — image cards rise into a clean grid (no rotation).
    const statics = root.querySelector(".w-sec-statics");
    let staticsTrig;
    if (statics) {
      const cards = statics.querySelectorAll(".w-static-card");
      gsap.set(cards, { y: 60, autoAlpha: 0 });
      staticsTrig = ScrollTrigger.create({
        trigger: statics,
        start: "top 75%",
        once: true,
        onEnter: () =>
          gsap.to(cards, {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
          }),
      });
    }

    // 5. Stories — three phones rise into an aligned row (no tilt).
    const stories = root.querySelector(".w-sec-stories");
    let storiesTrig;
    if (stories) {
      const phones = stories.querySelectorAll(".w-story-phone");
      gsap.set(phones, { y: 80, autoAlpha: 0 });
      storiesTrig = ScrollTrigger.create({
        trigger: stories,
        start: "top 75%",
        once: true,
        onEnter: () =>
          gsap.to(phones, {
            y: 0,
            autoAlpha: 1,
            duration: 1.0,
            ease: "power3.out",
            stagger: 0.14,
          }),
      });
    }

    // 6. Reels — three phones rise out of the floor in sequence.
    const reels = root.querySelector(".w-sec-reels");
    let reelsTrig;
    if (reels) {
      const phones = reels.querySelectorAll(".w-reel-phone");
      gsap.set(phones, { yPercent: 30, autoAlpha: 0 });
      reelsTrig = ScrollTrigger.create({
        trigger: reels,
        start: "top 75%",
        once: true,
        onEnter: () =>
          gsap.to(phones, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.12,
          }),
      });
    }

    // 7. Insights — phones scale + fade in (no tilt), stats count from 0.
    const insights = root.querySelector(".w-sec-insights");
    let insightsTrig;
    if (insights) {
      const phones = insights.querySelectorAll(".w-insight-phone");
      gsap.set(phones, { autoAlpha: 0, y: 40, scale: 0.94 });
      const counts = insights.querySelectorAll("[data-count]");
      insightsTrig = ScrollTrigger.create({
        trigger: insights,
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(phones, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            ease: "power3.out",
            stagger: 0.18,
          });
          counts.forEach((el) => {
            const target = Number(el.dataset.count);
            const obj = { v: 0 };
            gsap.to(obj, {
              v: target,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = Math.round(obj.v).toLocaleString();
              },
            });
          });
        },
      });
    }

    // 8. Shoots — aerial frames rise into a clean grid, then a gentle
    //    parallax-on-scroll keeps them feeling alive (kept subtle so they
    //    stay visually aligned).
    const shoots = root.querySelector(".w-sec-shoots");
    let shootsTween;
    if (shoots) {
      const frames = shoots.querySelectorAll(".w-shoot-frame");
      shootsTween = gsap.to(frames, {
        y: (i) => (i % 2 ? -20 : 20),
        ease: "none",
        scrollTrigger: {
          trigger: shoots,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }

    // 9. Amazon Ads — chart paths "draw" by animating stroke-dashoffset
    //    from full length down to 0 when the section enters.
    const ads = root.querySelector(".w-sec-ads");
    let adsTrig;
    if (ads) {
      const paths = ads.querySelectorAll(".w-chart path");
      paths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      });
      adsTrig = ScrollTrigger.create({
        trigger: ads,
        start: "top 75%",
        once: true,
        onEnter: () =>
          gsap.to(paths, {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: "power2.out",
            stagger: 0.2,
          }),
      });
    }

    // 10. Listing — marketplace phones rise into an aligned row.
    const listing = root.querySelector(".w-sec-listing");
    let listingTrig;
    if (listing) {
      const phones = listing.querySelectorAll(".w-listing-phone");
      gsap.set(phones, { autoAlpha: 0, y: 60 });
      listingTrig = ScrollTrigger.create({
        trigger: listing,
        start: "top 75%",
        once: true,
        onEnter: () =>
          gsap.to(phones, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.1,
          }),
      });
    }

    // 11. SEO — the map pin drops in and the radar pulse fades up.
    const seo = root.querySelector(".w-sec-seo");
    let seoTrig;
    if (seo) {
      const pin = seo.querySelector(".w-seo-pin");
      const pulse = seo.querySelector(".w-seo-pulse");
      gsap.set(pin, { y: -120, autoAlpha: 0 });
      gsap.set(pulse, { scale: 0, autoAlpha: 0 });
      seoTrig = ScrollTrigger.create({
        trigger: seo,
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(pin, {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "bounce.out",
          });
          gsap.to(pulse, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power2.out",
            delay: 0.4,
          });
        },
      });
    }

    // 12. Website Dev — the laptop slides in from the left and the
    //     companion phone floats up from the right.
    const web = root.querySelector(".w-sec-web");
    let webTrig;
    if (web) {
      const laptop = web.querySelector(".w-web-laptop");
      const phone = web.querySelector(".w-web-phone");
      gsap.set(laptop, { x: -120, autoAlpha: 0 });
      gsap.set(phone, { x: 80, y: 60, autoAlpha: 0 });
      webTrig = ScrollTrigger.create({
        trigger: web,
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(laptop, {
            x: 0,
            autoAlpha: 1,
            duration: 1.1,
            ease: "power3.out",
          });
          gsap.to(phone, {
            x: 0,
            y: 0,
            autoAlpha: 1,
            duration: 1.0,
            ease: "power3.out",
            delay: 0.3,
          });
        },
      });
    }

    return () => {
      riseTrigs.forEach((t) => t.kill());
      staggerTrigs.forEach((t) => t.kill());
      carouselTrig?.kill();
      staticsTrig?.kill();
      storiesTrig?.kill();
      reelsTrig?.kill();
      insightsTrig?.kill();
      shootsTween?.scrollTrigger?.kill();
      shootsTween?.kill();
      adsTrig?.kill();
      listingTrig?.kill();
      seoTrig?.kill();
      webTrig?.kill();
    };
  }, []);

  return (
    <>
      <div className="work-page" ref={rootRef}>
        {/* ---------------- HERO ---------------- */}
        <section className="work-hero">
          <div className="work-hero-grid">
            <div className="work-hero-left">
              {/* Hero title removed per request. */}
            </div>

            <div className="work-hero-right">
              {/* Mirrors the Brands hero — one BlurInText copy +
                  one mute "Scroll for…" cue, no nav, no extra
                  paragraph. */}
              <BlurInText as="p" split="words" stagger={0.02} blur={10} className="work-hero-copy">
                From engaging social media strategies to powerful website
                solutions, we do it all: creative, consistent, and result-driven.
              </BlurInText>

              <p className="work-hero-copy work-hero-copy-mute">
                Scroll for the receipts.
              </p>
            </div>
          </div>
          <HandwriteText className="page-signature">Work</HandwriteText>
        </section>

        {/* ---------------- 1. CAROUSEL ---------------- */}
        <section className="w-sec w-sec-carousel">
          <p className="w-sec-eye anim-rise">[01] Social Media · Carousel</p>
          <h2 className="w-sec-title anim-rise">Carousel.</h2>
          <p className="w-sec-copy anim-rise">
            Multi-frame creatives that earn the swipe: story arcs designed for
            the scroll, not the press kit.
          </p>
          <CarouselMarquee />

          {/* Phone mockup kept below for reference but hidden —
              the marquee replaces the old phone + card layout. */}
          <div className="w-carousel-stage" style={{ display: "none" }}>
            <div className="w-rp" aria-hidden="true">
              <div className="w-rp-frame">
                <span className="w-rp-btn w-rp-btn-mute" />
                <span className="w-rp-btn w-rp-btn-vol-up" />
                <span className="w-rp-btn w-rp-btn-vol-dn" />
                <span className="w-rp-btn w-rp-btn-power" />
                <div className="w-rp-bezel">
                  <div className="w-rp-screen">
                    <div className="w-rp-island" />

                    {/* Status bar */}
                    <div className="w-rp-status">
                      <span className="w-rp-time">9:41</span>
                      <span className="w-rp-status-icons">
                        <i className="w-rp-signal" />
                        <i className="w-rp-wifi" />
                        <i className="w-rp-battery" />
                      </span>
                    </div>

                    {/* Profile top bar */}
                    <div className="w-rp-topbar">
                      <span className="w-rp-handle">
                        circle.media <span className="w-rp-caret">▾</span>
                      </span>
                      <span className="w-rp-actions">
                        <i className="w-rp-icon-plus" />
                        <i className="w-rp-icon-menu" />
                      </span>
                    </div>

                    {/* Profile header — avatar + stats */}
                    <div className="w-rp-profile">
                      <div className="w-rp-pf-av" />
                      <div className="w-rp-pf-stats">
                        <div><b>128</b><span>posts</span></div>
                        <div><b>24.5k</b><span>followers</span></div>
                        <div><b>312</b><span>following</span></div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="w-rp-bio">
                      <p className="w-rp-bio-name">Circle Media Solutions</p>
                      <p className="w-rp-bio-tag">Marketing studio · Bangalore</p>
                    </div>

                    {/* Action buttons */}
                    <div className="w-rp-buttons">
                      <span className="w-rp-btn-pill">Edit profile</span>
                      <span className="w-rp-btn-pill">Share profile</span>
                    </div>

                    {/* Tab row */}
                    <div className="w-rp-tabs">
                      <i className="w-rp-tab-icon w-rp-tab-grid is-active" />
                      <i className="w-rp-tab-icon w-rp-tab-r" />
                      <i className="w-rp-tab-icon w-rp-tab-tag" />
                    </div>

                    {/* 3x3 grid — empty placeholder tiles (the carousel
                        cards in front of the phone are the actual posts). */}
                    <div className="w-rp-grid">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div className="w-rp-grid-tile" key={i} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-carousel-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <div className="w-carousel-card" key={n}>
                  <img src={`/portfolio/posts/${n}.avif`} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- 2. STATICS ---------------- */}
        <section className="w-sec w-sec-statics">
          <p className="w-sec-eye anim-rise">[02] Static Posts</p>
          <h2 className="w-sec-title anim-rise">Statics.</h2>
          <p className="w-sec-copy anim-rise">
            Sometimes one powerful visual says it all. Clean. Creative.
            On-brand. Static posts that speak volumes.
          </p>
          <div className="w-static-stage">
            {[6, 7, 8, 9, 10, 11].map((n, i) => (
              <div className={`w-static-card s-${i}`} key={n}>
                <img src={`/portfolio/posts/${n}.avif`} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- 3. STORIES ---------------- */}
        <section className="w-sec w-sec-stories">
          <p className="w-sec-eye anim-rise">[03] Instagram · Stories</p>
          <h2 className="w-sec-title anim-rise">Stories.</h2>
          <p className="w-sec-copy anim-rise">
            Real-time magic, every day. From concepts to execution, we craft
            stories that connect instantly.
          </p>
          <div className="w-story-row">
            {[1, 2, 3].map((n) => (
              <div className="w-story-phone" key={n}>
                <img src={`/portfolio/stories/${n}.avif`} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- 4. REELS ---------------- */}
        <section className="w-sec w-sec-reels">
          <p className="w-sec-eye anim-rise">[04] Reels · Short Video</p>
          <h2 className="w-sec-title anim-rise">Reels.</h2>
          <p className="w-sec-copy anim-rise">
            We don&apos;t just make Reels, we tell stories in seconds. Fast.{" "}
            <span className="w-accent">Engaging.</span> Scroll-stopping.
          </p>

          <div className="w-reel-row">
            {[12, 13, 14].map((n) => (
              <div className="w-reel-phone" key={n}>
                <img src={`/portfolio/posts/${n}.avif`} alt="" loading="lazy" />
              </div>
            ))}
          </div>

          <div className="w-reel-subgrid anim-stagger">
            {[
              { k: "UGC", img: "/portfolio/posts/15.avif" },
              { k: "Influencer", img: "/portfolio/posts/16.avif" },
              { k: "Motion Graphics", img: "/portfolio/posts/17.avif" },
            ].map((s) => (
              <div className="w-reel-sub" key={s.k}>
                <span className="w-reel-sub-tag">{s.k}</span>
                <img src={s.img} alt={s.k} loading="lazy" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- 5. REEL INSIGHTS ---------------- */}
        <section className="w-sec w-sec-insights">
          <p className="w-sec-eye anim-rise">[05] Reel · Insights</p>
          <h2 className="w-sec-title anim-rise">Reel Insights.</h2>
          <p className="w-sec-copy anim-rise">
            Numbers that prove the creative. Watch time, view rate, profile
            activity: every reel reports back.
          </p>

          <div className="w-insight-stage">
            {/* PHONE A — overview screen with watch-time, view-rate bar
                and an interactions donut chart. */}
            <div className="w-insight-phone w-insight-a">
              <div className="w-insight-screen">
                <div className="w-insight-status">
                  <span>2:20</span>
                  <span className="w-insight-status-icons">
                    <i /><i /><i className="bat" />
                  </span>
                </div>

                <div className="w-insight-head">
                  <span className="w-insight-back">‹</span>
                  <span className="w-insight-title">Reel insights</span>
                </div>

                <div className="w-insight-block">
                  <div className="w-insight-row">
                    <span className="w-insight-k">Watch time</span>
                    <span className="w-insight-v-sm">6d 1h 27m 14s</span>
                  </div>
                  <p className="w-insight-sub">Average watch time · 6 sec</p>
                </div>

                <div className="w-insight-block">
                  <p className="w-insight-k">View rate past first 3 seconds</p>
                  <div className="w-insight-pills">
                    <span className="is-active">All</span>
                    <span>Followers</span>
                    <span>Non-followers</span>
                  </div>
                  <div className="w-insight-bar">
                    <span className="w-insight-bar-fill" style={{ width: "65%" }} />
                  </div>
                  <div className="w-insight-legend">
                    <span><i className="dot pink" /> This reel <b>65.3%</b></span>
                    <span><i className="dot mute" /> Typical <b>30.9%</b></span>
                  </div>
                </div>

                <div className="w-insight-block">
                  <p className="w-insight-k">Interactions</p>
                  <div className="w-insight-donut-row">
                    <div className="w-insight-donut" style={{ "--p": "97" }}>
                      <span className="w-insight-donut-center">
                        <span data-count="8346">0</span>
                      </span>
                    </div>
                    <div className="w-insight-donut-legend">
                      <span><i className="dot mute" /> Followers <b>2.9%</b></span>
                      <span><i className="dot pink" /> Non-followers <b>97.1%</b></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PHONE B — single reel insights screen with action grid +
                overview list + a second donut for views. */}
            <div className="w-insight-phone w-insight-b">
              <div className="w-insight-screen">
                <div className="w-insight-status">
                  <span>5:03</span>
                  <span className="w-insight-status-icons">
                    <i /><i /><i className="bat" />
                  </span>
                </div>

                <div className="w-insight-head">
                  <span className="w-insight-back">‹</span>
                  <span className="w-insight-title">
                    Reel insights
                    <span className="w-insight-subtitle">Tag that gunehgaar dost</span>
                  </span>
                </div>

                <div className="w-insight-actions">
                  <span><i className="ic-h" /><b data-count="84000">0</b></span>
                  <span><i className="ic-c" /><b data-count="73">0</b></span>
                  <span><i className="ic-s" /><b data-count="84000">0</b></span>
                  <span><i className="ic-b" /><b data-count="6400">0</b></span>
                </div>

                <div className="w-insight-block">
                  <p className="w-insight-k">Overview</p>
                  <div className="w-insight-list">
                    <span>Views <b data-count="1059475">0</b></span>
                    <span>Watch time <b>77d 23h</b></span>
                    <span>Interactions <b data-count="175281">0</b></span>
                    <span>Profile activity <b data-count="201">0</b></span>
                  </div>
                </div>

                <div className="w-insight-block">
                  <p className="w-insight-k">Views</p>
                  <div className="w-insight-donut-row">
                    <div className="w-insight-donut" style={{ "--p": "91" }}>
                      <span className="w-insight-donut-center">
                        <span data-count="1059401">0</span>
                      </span>
                    </div>
                    <div className="w-insight-donut-legend">
                      <span><i className="dot mute" /> Followers <b>8.8%</b></span>
                      <span><i className="dot pink" /> Non-followers <b>91.2%</b></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 6. SHOOTS ---------------- */}
        <section className="w-sec w-sec-shoots">
          <p className="w-sec-eye anim-rise">[06] Shoots · Aerial</p>
          <h2 className="w-sec-title anim-rise">Shoots.</h2>
          <p className="w-sec-copy anim-rise">
            From sky to screen, we capture stories with a{" "}
            <span className="w-accent">bird&apos;s eye view.</span> Framing
            perfection, one ground shot at a time.
          </p>
          <div className="w-shoot-stage">
            <div className="w-shoot-frame anim-rise">
              <img src="/portfolio/feed/2.avif" alt="" loading="lazy" />
            </div>
            <div className="w-shoot-frame anim-rise">
              <img src="/portfolio/feed/3.avif" alt="" loading="lazy" />
            </div>
            <div className="w-shoot-frame anim-rise">
              <img src="/portfolio/feed/4.avif" alt="" loading="lazy" />
            </div>
          </div>
        </section>

        {/* ---------------- 7. AMAZON ADS ---------------- */}
        <section className="w-sec w-sec-ads">
          <p className="w-sec-eye anim-rise">[07] Performance · Amazon Ads</p>
          <h2 className="w-sec-title anim-rise">Amazon Ads.</h2>
          <p className="w-sec-copy anim-rise">
            Verified Amazon Ads partner. Daily optimisation, weekly read-outs,
            ROAS that compounds.
          </p>

          <div className="w-ads-row">
            <div className="w-chart anim-rise">
              <div className="w-chart-stats">
                <span><b>7.23</b> ROAS</span>
                <span><b>13.84%</b> ACOS</span>
                <span><b>332</b> NTB</span>
                <span><b>11,321</b> Clicks</span>
              </div>
              <svg viewBox="0 0 600 200" preserveAspectRatio="none">
                <path
                  d="M0,170 L40,150 L80,135 L120,125 L160,140 L200,118 L240,108 L280,90 L320,98 L360,82 L400,75 L440,68 L480,60 L520,55 L560,50 L600,52"
                  fill="none"
                  stroke="var(--c-pink)"
                  strokeWidth="2.4"
                />
              </svg>
            </div>

            <div className="w-chart anim-rise">
              <div className="w-chart-stats">
                <span><b>10,005</b> Clicks</span>
                <span><b>₹11.08</b> CPC</span>
                <span><b>1,214</b> Orders</span>
                <span><b>3.25</b> ROAS</span>
              </div>
              <svg viewBox="0 0 600 200" preserveAspectRatio="none">
                <path d="M0,90 L60,80 L120,100 L180,75 L240,95 L300,70 L360,85 L420,95 L480,80 L540,90 L600,85" fill="none" stroke="var(--c-blue)" strokeWidth="2.4" />
                <path d="M0,160 L60,140 L120,150 L180,120 L240,135 L300,110 L360,125 L420,115 L480,100 L540,118 L600,108" fill="none" stroke="var(--c-mint)" strokeWidth="2.4" />
                <path d="M0,40 L60,55 L120,38 L180,60 L240,42 L300,58 L360,45 L420,55 L480,40 L540,50 L600,42" fill="none" stroke="var(--c-pink)" strokeWidth="2.4" />
              </svg>
            </div>
          </div>
        </section>

        {/* ---------------- 8. LISTING ---------------- */}
        <section className="w-sec w-sec-listing">
          <p className="w-sec-eye anim-rise">[08] Listing · Marketplaces</p>
          <h2 className="w-sec-title anim-rise">Listing.</h2>
          <p className="w-sec-copy anim-rise">
            Catalogue, copy, imagery and storefront tuning that lifts
            discoverability, add-to-cart and lifetime value.
          </p>

          <div className="w-listing-row">
            {[
              { k: "Swiggy Instamart", img: "/portfolio/posts/3.avif" },
              { k: "Zepto", img: "/portfolio/posts/4.avif" },
              { k: "Amazon Launchpad", img: "/portfolio/posts/5.avif" },
              { k: "Cred", img: "/portfolio/posts/6.avif" },
              { k: "Flipkart Minutes", img: "/portfolio/posts/7.avif" },
            ].map((p) => (
              <div className="w-listing-phone" key={p.k}>
                <img src={p.img} alt={p.k} loading="lazy" />
                <span className="w-listing-tag">{p.k}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- 9. E-COMMERCE PARTNERS ---------------- */}
        <section className="w-sec w-sec-ecom">
          <p className="w-sec-eye anim-rise">[09] E-Commerce · Account Management</p>
          <h2 className="w-sec-title anim-rise">E-Commerce.</h2>
          <p className="w-sec-copy anim-rise">
            Account management across the marketplaces that move volume in
            India.
          </p>

          {(() => {
            const PARTNERS = [
              "Amazon",
              "Flipkart Minutes",
              "Amazon Fresh",
              "Blinkit",
              "Zepto",
              "Instamart",
              "JioMart",
              "CRED",
              "Bigbasket",
            ];
            // Three different orderings so each row reads as its own loop.
            const rows = [
              PARTNERS,
              [...PARTNERS.slice(3), ...PARTNERS.slice(0, 3)],
              [...PARTNERS.slice(6), ...PARTNERS.slice(0, 6)],
            ];
            return (
              <div className="w-ecom-loops">
                {rows.map((row, ri) => (
                  <div
                    className={`w-ecom-loop ${ri % 2 ? "is-right" : "is-left"}`}
                    key={ri}
                  >
                    <div className="w-ecom-loop-track">
                      {/* Duplicate the items so the marquee loops seamlessly. */}
                      {[...row, ...row].map((k, i) => (
                        <span className="w-ecom-tile" key={`${ri}-${i}`}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* ---------------- 10. BRAND STORE / A+ CONTENT ---------------- */}
        <section className="w-sec w-sec-store">
          <p className="w-sec-eye anim-rise">[10] Storefront · A+ Content</p>
          <h2 className="w-sec-title anim-rise">Brand Store &amp; A+ Content.</h2>
          <p className="w-sec-copy anim-rise">
            Storefronts that read like the brand and A+ modules that earn the
            click further down the page.
          </p>

          <div className="w-store-row">
            <div className="w-store-tablet anim-rise">
              <img src="/portfolio/feed/5.avif" alt="" loading="lazy" />
              <span className="w-store-tag">Brand Store</span>
            </div>
            <div className="w-store-tablet anim-rise w-store-tablet-b">
              <img src="/portfolio/feed/6.avif" alt="" loading="lazy" />
              <span className="w-store-tag">A+ Content</span>
            </div>
          </div>
        </section>

        {/* ---------------- 11. SEO / SEM ---------------- */}
        <section className="w-sec w-sec-seo">
          <p className="w-sec-eye anim-rise">[11] Search · SEO &amp; SEM</p>
          <h2 className="w-sec-title anim-rise">SEO &amp; SEM.</h2>
          <p className="w-sec-copy anim-rise">
            Organic visibility paired with paid search: long game and short
            game, on one engine. Plus Google My Business that closes the loop.
          </p>

          <div className="w-seo-stage">
            {/* PHONE A — Conscious Food map listing with directions UI */}
            <div className="w-seo-phone">
              <div className="w-seo-screen">
                <div className="w-seo-status">
                  <span>5:43</span>
                  <span className="w-seo-status-icons">
                    <i /><i /><i className="bat" />
                  </span>
                </div>
                <div className="w-seo-search">
                  <i className="w-seo-search-icon" />
                  <span>Conscious Food Private Limited</span>
                  <i className="w-seo-search-x" />
                </div>

                <div className="w-seo-map">
                  {/* Roads */}
                  <span className="w-seo-road r1" />
                  <span className="w-seo-road r2" />
                  <span className="w-seo-road r3" />
                  {/* Other place pins */}
                  <span className="w-seo-poi p1" />
                  <span className="w-seo-poi p2" />
                  <span className="w-seo-poi p3" />
                  {/* Active result with pulse + pin */}
                  <span className="w-seo-pulse" />
                  <span className="w-seo-pin">
                    <i />
                  </span>
                </div>

                <div className="w-seo-card">
                  <div className="w-seo-card-head">
                    <p className="w-seo-card-name">Conscious Food Pvt Ltd</p>
                    <i className="w-seo-card-share" />
                  </div>
                  <p className="w-seo-card-meta">
                    <b>4.5</b>
                    <span className="w-seo-stars">★★★★★</span>
                    <span>(359)</span>
                    <span className="w-seo-dot" />
                    <span>13 hr 38 min</span>
                  </p>
                  <p className="w-seo-card-tag">
                    Organic food store · <b className="w-seo-closed">Closes soon</b> · 6 pm · Opens 10 am Mon
                  </p>
                  <p className="w-seo-card-manage">
                    <i className="w-seo-verified" /> You manage this Business Profile
                  </p>
                  <p className="w-seo-card-stat">
                    <i className="w-seo-bars" /> 1,632 customer interactions
                  </p>
                  <div className="w-seo-cta-row">
                    <span className="w-seo-cta primary">
                      <i className="w-seo-cta-ico ic-dir" /> Directions
                    </span>
                    <span className="w-seo-cta">
                      <i className="w-seo-cta-ico ic-start" /> Start
                    </span>
                    <span className="w-seo-cta">
                      <i className="w-seo-cta-ico ic-call" /> Call
                    </span>
                    <span className="w-seo-cta save">
                      <i className="w-seo-cta-ico ic-save" />
                    </span>
                  </div>
                  <div className="w-seo-photos">
                    <div className="w-seo-photo">
                      <img src="/portfolio/feed/2.avif" alt="" />
                    </div>
                    <div className="w-seo-photo">
                      <img src="/portfolio/feed/3.avif" alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PHONE B — Monu Gyaniji Ka Dhaba listing + a review card */}
            <div className="w-seo-phone">
              <div className="w-seo-screen">
                <div className="w-seo-status">
                  <span>10:28</span>
                  <span className="w-seo-status-icons">
                    <i /><i /><i className="bat" />
                  </span>
                </div>
                <div className="w-seo-search">
                  <i className="w-seo-search-icon" />
                  <span>Search here</span>
                </div>

                <div className="w-seo-map alt">
                  <span className="w-seo-road r1" />
                  <span className="w-seo-road r2" />
                  <span className="w-seo-road r3" />
                  <span className="w-seo-poi p1" />
                  <span className="w-seo-poi p2" />
                  <span className="w-seo-pulse" />
                  <span className="w-seo-pin">
                    <i />
                  </span>
                </div>

                <div className="w-seo-card">
                  <div className="w-seo-card-head">
                    <p className="w-seo-card-name">Monu Gyaniji Ka Dhaba</p>
                    <i className="w-seo-card-share" />
                  </div>
                  <p className="w-seo-card-meta">
                    <b>4.2</b>
                    <span className="w-seo-stars">★★★★★</span>
                    <span>(1,615)</span>
                    <span className="w-seo-dot" />
                    <span>25 min</span>
                  </p>
                  <p className="w-seo-card-tag">
                    Punjabi restaurant · ₹200–400 · <b className="w-seo-open">Open</b> · Closes 1 am
                  </p>
                  <p className="w-seo-card-manage">
                    <i className="w-seo-verified" /> You manage this Business Profile
                  </p>
                  <p className="w-seo-card-stat">
                    <i className="w-seo-bars" /> 1,062 customer interactions
                  </p>

                  {/* Review snippet */}
                  <div className="w-seo-review">
                    <div className="w-seo-review-head">
                      <span className="w-seo-review-av" />
                      <span className="w-seo-review-name">Aarav K.</span>
                      <span className="w-seo-review-stars">★★★★★</span>
                    </div>
                    <p className="w-seo-review-body">
                      "Outstanding butter chicken, the lassi tops it off. Service moves fast even at peak hours."
                    </p>
                  </div>

                  <div className="w-seo-cta-row">
                    <span className="w-seo-cta primary">
                      <i className="w-seo-cta-ico ic-dir" /> Directions
                    </span>
                    <span className="w-seo-cta">
                      <i className="w-seo-cta-ico ic-start" /> Start
                    </span>
                    <span className="w-seo-cta">
                      <i className="w-seo-cta-ico ic-cal" /> Reserve
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="w-seo-caption anim-rise">
            Google My Business · listings, reviews and ranking that closes the
            loop on local search.
          </p>
        </section>

        {/* Website Development section removed per request. */}

      </div>
      <Footer />
    </>
  );
}
