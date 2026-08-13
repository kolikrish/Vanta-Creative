import GlobeWebGL from "../fx/GlobeWebGL.jsx";

/* Global Reach — sits below the Brands marquee. Highlights that Circle works
   with both domestic and international clients across quick-commerce, with a
   real WebGL globe (auto-rotating, drag-interactive) on the right and copy
   on the left. */

const REGIONS = [
  { flag: "🇮🇳", name: "India"  },
  { flag: "🇦🇪", name: "Dubai"  },
  { flag: "🇺🇸", name: "USA"    },
  { flag: "🇨🇦", name: "Canada" },
];

export default function Reach() {
  return (
    <section className="reach">
      <div className="reach-inner">
        <header className="reach-head">
          <p className="reach-eyebrow">[Global reach]</p>
          <h2 className="reach-title">
            Domestic and international clients,{" "}
            <span className="reach-accent">working in 4+ countries.</span>
          </h2>
          <p className="reach-sub">
            We help brands grow across quick commerce and cross-border
            marketplaces, with strategy, listings and performance built
            for every region we ship into.
          </p>
        </header>

        <div className="reach-grid">
          <div className="reach-left">
            <ul className="reach-pills">
              {REGIONS.map((r) => (
                <li className="reach-pill" key={r.name}>
                  <span className="reach-pill-flag" aria-hidden="true">
                    {r.flag}
                  </span>
                  <span className="reach-pill-text">
                    <span className="reach-pill-name">{r.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="reach-right">
            <GlobeWebGL />
          </div>
        </div>
      </div>
    </section>
  );
}
