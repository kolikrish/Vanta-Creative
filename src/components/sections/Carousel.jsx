import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { carouselItems } from "../../data/content.js";

gsap.registerPlugin(ScrollTrigger);

export default function Carousel() {
  useEffect(() => {
    const carouselSectionPinnedHeight =
      window.innerHeight * carouselItems.length;

    gsap.set(`#project-${carouselItems[0].id}`, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
    });

    const trigs = [];

    carouselItems.slice(1).forEach((item, index) => {
      const trig = ScrollTrigger.create({
        trigger: ".carousel",
        start: `top+=${(index + 1) * window.innerHeight}px top`,
        end: `top+=${(index + 2) * window.innerHeight}px top`,
        scrub: 1,
        onUpdate: (self) => {
          const clipPath = gsap.utils.interpolate(
            "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
            self.progress
          );
          gsap.set(`#project-${item.id}`, { clipPath });
        },
      });
      trigs.push(trig);
    });

    const pin = ScrollTrigger.create({
      trigger: ".carousel",
      start: "top top",
      end: `+=${carouselSectionPinnedHeight}`,
      pin: true,
      pinSpacing: true,
      pinType: "transform",
      anticipatePin: 1,
    });
    trigs.push(pin);

    return () => trigs.forEach((t) => t.kill());
  }, []);

  return (
    <section className="carousel">
      {carouselItems.map((item) => (
        <article
          className="project"
          id={`project-${item.id}`}
          key={item.id}
        >
          <div className="project-inner">
            <header className="project-header">
              <p className="project-index">Project {item.id}</p>
              <h2>{item.title}</h2>
              {item.tagline && (
                <p className="project-tagline">{item.tagline}</p>
              )}
            </header>

            <div className="project-body">
              {item.stats && (
                <div className="project-stats">
                  {item.stats.map((s) => (
                    <div className="project-stat" key={s.k}>
                      <span className="project-stat-v">{s.v}</span>
                      <span className="project-stat-k">{s.k}</span>
                    </div>
                  ))}
                </div>
              )}

              {item.services && (
                <ul className="project-services">
                  {item.services.map((svc) => (
                    <li key={svc}>{svc}</li>
                  ))}
                </ul>
              )}

              {item.clients && (
                <ul className="project-clients">
                  {item.clients.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="project-info">
              <div className="project-tags">
                {item.tags[0].split(", ").map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <div className="project-url">
                <span>View Project →</span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
