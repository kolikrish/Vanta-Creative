/* "Verified Ads Partners" — sits between the work carousel and the
   testimonials. Two stacked dashboard cards (Amazon Ads, Meta Ads) with
   stylised metric chips and decorative SVG line charts that mirror the
   look of the real partner consoles. */

const AMAZON_METRICS = [
  { label: "ROAS",       value: "7.23",    color: "var(--text-dim)" },
  { label: "ACOS",       value: "13.84%",  color: "var(--text-dim)" },
  { label: "NTB orders", value: "332",     color: "var(--c-pink)" },
  { label: "Clicks",     value: "11,321",  color: "var(--text-dim)" },
];

const META_METRICS = [
  { label: "Reach",     value: "2.41M",  color: "var(--c-blue)" },
  { label: "CTR",       value: "3.18%",  color: "var(--c-mint)" },
  { label: "Spend",     value: "₹4.6L",  color: "var(--c-pink)" },
  { label: "ROAS",      value: "5.84",   color: "var(--c-yellow)" },
];

// Hand-tuned points so the chart looks plausible without real data.
const AMAZON_PATH =
  "M 0 78 L 60 64 L 120 70 L 180 42 L 240 50 L 300 36 L 360 32 L 420 56 L 480 86 L 540 50 L 600 30 L 660 24 L 720 28 L 780 18 L 840 14 L 900 38";

const META_LINES = [
  { color: "var(--c-blue)",   d: "M 0 60 L 60 26 L 120 32 L 180 50 L 240 30 L 300 64 L 360 28 L 420 50 L 480 56 L 540 24 L 600 36 L 660 50 L 720 44 L 780 40 L 840 30 L 900 34" },
  { color: "var(--c-mint)",   d: "M 0 70 L 60 78 L 120 64 L 180 80 L 240 56 L 300 40 L 360 70 L 420 26 L 480 86 L 540 60 L 600 70 L 660 50 L 720 56 L 780 64 L 840 60 L 900 44" },
  { color: "var(--c-pink)",   d: "M 0 76 L 60 82 L 120 70 L 180 90 L 240 66 L 300 78 L 360 72 L 420 92 L 480 70 L 540 80 L 600 74 L 660 88 L 720 72 L 780 84 L 840 78 L 900 82" },
];

function MetricChip({ label, value, color }) {
  return (
    <div className="ap-metric">
      <span className="ap-metric-label">{label}</span>
      <span className="ap-metric-value" style={{ color }}>
        <span className="ap-metric-dot" style={{ background: color }} />
        {value}
      </span>
    </div>
  );
}

export default function AdsPartners() {
  return (
    <section className="ads-partners">
      <div className="ap-head">
        <p className="label">[Partners]</p>
        <h3>
          Verified by the platforms that shape modern commerce: performance
          partners we run, measure, and ship with every day.
        </h3>
      </div>

      <div className="ap-stack">
        {/* Amazon Ads ------------------------------------------------ */}
        <article className="ap-card ap-card--amazon">
          <header className="ap-card-head">
            <div className="ap-platform">
              <span className="ap-platform-name">Amazon Ads</span>
              <span className="ap-platform-tag">Sponsored Products · Brands · Display</span>
            </div>
            <div className="ap-badge">
              <span className="ap-badge-mark">amazon ads</span>
              <span className="ap-badge-line">
                <strong>Verified</strong> partner
              </span>
            </div>
          </header>

          <div className="ap-dash">
            <div className="ap-dash-row">
              {AMAZON_METRICS.map((m) => (
                <MetricChip key={m.label} {...m} />
              ))}
            </div>
            <svg
              className="ap-chart"
              viewBox="0 0 900 110"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ap-amz-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="var(--c-pink)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--c-pink)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[20, 40, 60, 80].map((y) => (
                <line key={y} x1="0" x2="900" y1={y} y2={y}
                  stroke="rgba(255,255,255,0.05)" strokeDasharray="3 5" />
              ))}
              <path d={`${AMAZON_PATH} L 900 110 L 0 110 Z`} fill="url(#ap-amz-fill)" />
              <path d={AMAZON_PATH} fill="none" stroke="var(--c-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="ap-dash-axis">
              {["Jun 01","Jun 07","Jun 13","Jun 19","Jun 25","Jun 30"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </article>

        {/* Meta Ads -------------------------------------------------- */}
        <article className="ap-card ap-card--meta">
          <header className="ap-card-head">
            <div className="ap-platform">
              <span className="ap-platform-name">Meta Ads</span>
              <span className="ap-platform-tag">Facebook · Instagram · Reels · Audience Network</span>
            </div>
            <div className="ap-badge ap-badge--meta">
              <span className="ap-badge-mark">Meta Business Partner</span>
              <span className="ap-badge-line">
                <strong>Verified</strong> creative agency
              </span>
            </div>
          </header>

          <div className="ap-dash">
            <div className="ap-dash-row">
              {META_METRICS.map((m) => (
                <MetricChip key={m.label} {...m} />
              ))}
            </div>
            <svg
              className="ap-chart"
              viewBox="0 0 900 110"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {[20, 40, 60, 80].map((y) => (
                <line key={y} x1="0" x2="900" y1={y} y2={y}
                  stroke="rgba(255,255,255,0.05)" strokeDasharray="3 5" />
              ))}
              {META_LINES.map((ln, i) => (
                <path
                  key={i}
                  d={ln.d}
                  fill="none"
                  stroke={ln.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
              ))}
            </svg>
            <div className="ap-dash-axis">
              {["May 01","May 07","May 13","May 19","May 25","May 31"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
