import { useEffect, useState } from "react";
import { services } from "../data/content.js";
import BlurInText from "../components/fx/BlurInText.jsx";
import Dissolve from "../components/fx/Dissolve.jsx";
import FlyingImages from "../components/fx/FlyingImages.jsx";
import HandwriteText from "../components/fx/HandwriteText.jsx";
import LogoGlobe from "../components/fx/LogoGlobe.jsx";
import Footer from "../components/sections/Footer.jsx";

export default function ServicesPage() {
  const [globe, setGlobe] = useState(null);

  // Lock scroll, blur the underlying page, and close on Escape
  // while the globe overlay is open.
  useEffect(() => {
    if (!globe) return;
    const onKey = (e) => e.key === "Escape" && setGlobe(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("is-globe-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      document.body.classList.remove("is-globe-open");
    };
  }, [globe]);

  return (
    <>
      <div className="services-page">
        <section className="services-hero">
        <div className="services-hero-grid">
          <div className="services-hero-left">
            {/* Hero title removed per request — page leads straight
                with the right-column copy / nav. */}
          </div>

          <div className="services-hero-right">
            {/* Same compact two-paragraph layout as the Brands hero —
                one BlurInText description + one mute "Scroll for…"
                cue. The page-name nav, the second copy block and
                the decorative shapes are all removed so every
                subpage hero shares the identical structure. */}
            <BlurInText
              as="p"
              split="words"
              stagger={0.02}
              blur={10}
              className="services-hero-copy"
            >
              Six disciplines, one team, one operating system. We plug into
              your stack or run standalone. Either way, the output is
              measured, accountable and compounding.
            </BlurInText>

            <p className="services-hero-copy services-hero-copy-mute">
              Scroll for the disciplines.
            </p>
          </div>
        </div>

        <HandwriteText className="page-signature">Service</HandwriteText>
      </section>

      <section className="services-body services-list-page">
        {services.map((s, i) => {
          const open = () => setGlobe({ service: s });
          const onKey = (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          };
          return (
            <Dissolve key={s.id}>
              <article
                className={`svc-card svc-card-${(i % 5) + 1} ${
                  i % 2 ? "svc-card-flip" : ""
                }`}
                role="button"
                tabIndex={0}
                aria-label={`Open the platform globe for ${s.title}`}
                onClick={open}
                onKeyDown={onKey}
              >
                <span className="svc-card-num">{s.id}</span>
                <div className="svc-card-body">
                  <p className="svc-card-tag">{s.tagline}</p>
                  <h3 className="svc-card-title">{s.title}</h3>
                  <p className="svc-card-copy">{s.copy}</p>
                </div>
                {s.platforms && s.platforms.length > 0 && (
                  <div
                    className="svc-card-platforms"
                    aria-label={`Platforms and tools for ${s.title}`}
                  >
                    <div className="svc-card-platforms-grid">
                      {s.platforms.slice(0, 6).map((p, idx) => (
                        <span
                          key={p.name}
                          className="svc-card-platform-item"
                          style={{ "--i": idx }}
                          title={p.name}
                        >
                          <img
                            src={p.logo}
                            alt={p.name}
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <span className="svc-card-cta" aria-hidden="true">
                  <svg
                    className="svc-card-cta-arrow"
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M13 5l7 7-7 7" />
                  </svg>
                </span>
              </article>
            </Dissolve>
          );
        })}
      </section>

      <section className="services-flight">
        <FlyingImages
          layout="grid"
          images={[
            "/assets/services/service-left.jpeg",
            "/assets/services/service-1.jpeg",
            "/assets/services/service-right.jpeg",
            "/assets/services/s1.jpg",
            "/assets/services/s2.jpg",
            "/assets/services/s3.jpg",
          ]}
        />
      </section>
      </div>
      <Footer />

      {globe && (
        <div
          className={`logo-globe-overlay svc-card-${(parseInt(globe.service.id, 10) - 1) % 5 + 1}`}
          role="dialog"
          aria-modal="true"
          aria-label={`${globe.service.title} — platform globe`}
          onClick={() => setGlobe(null)}
        >
          <button
            className="logo-globe-close"
            type="button"
            aria-label="Close globe"
            onClick={() => setGlobe(null)}
          >
            ×
          </button>
          <div className="logo-globe-stack" onClick={(e) => e.stopPropagation()}>
            <p className="logo-globe-eyebrow">{globe.service.id} · {globe.service.platforms.length} platforms</p>
            <h2 className="logo-globe-title">{globe.service.title}</h2>
            <div className="logo-globe-ring">
              <LogoGlobe items={globe.service.platforms} />
            </div>
            <p className="logo-globe-hint">Drag to spin · Esc to close</p>
          </div>
        </div>
      )}
    </>
  );
}
