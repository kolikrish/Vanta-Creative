import { Link } from "react-router-dom";

const PHONE = "+918889977666";
const PHONE_DISPLAY = "+91 88899 77666";
const WHATSAPP = `https://wa.me/${PHONE.replace(/\D/g, "")}?text=${encodeURIComponent(
  "Hi Circle, I'd like to talk about a project."
)}`;

const socials = [
  {
    k: "Instagram",
    href: "https://instagram.com/marketingbycircle",
    color: "var(--c-pink)",
  },
  {
    k: "Facebook",
    href: "https://facebook.com/marketingbycircle",
    color: "var(--c-blue)",
  },
  {
    k: "LinkedIn",
    href: "https://linkedin.com/company/marketingbycircle",
    color: "var(--c-mint)",
  },
  {
    k: "WhatsApp",
    href: WHATSAPP,
    color: "var(--c-yellow)",
  },
];

const navLinks = [
  { to: "/",         label: "Index",    num: "01" },
  { to: "/services", label: "Services", num: "02" },
  { to: "/work",     label: "Work",     num: "03" },
  { to: "/about",    label: "Studio",   num: "04" },
  { to: "/contact",  label: "Contact",  num: "05" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="f-top">
          <div className="f-top-left">
            <p className="f-eyebrow">[Start something]</p>

            <h2 className="f-cta-title">
              Let&apos;s <em>collaborate.</em>
            </h2>

            <div className="f-cta-actions">
              <a className="f-cta-btn f-cta-btn-primary" href={WHATSAPP} target="_blank" rel="noreferrer">
                Message us on WhatsApp
                <span aria-hidden="true">↗</span>
              </a>
              <a className="f-cta-btn f-cta-btn-ghost" href={`tel:${PHONE}`}>
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="f-top-right">
            <p className="f-col-label">Navigate</p>
            <nav className="f-nav">
              {navLinks.map((n) => (
                <Link key={n.to} to={n.to} className="f-nav-link">
                  <span className="f-nav-num">{n.num}</span> {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Compact bottom strip — address on the left, socials on the right.
            Phone + WhatsApp are already in the CTA buttons above, so we
            don't repeat them here. */}
        <div className="f-bottom">
          <span className="f-bottom-addr">Indore · Bombay · India</span>

          <nav className="f-bottom-socials">
            {socials.map((s) => (
              <a
                key={s.k}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="f-bottom-social"
                style={{ "--soc-color": s.color }}
              >
                {s.k}
              </a>
            ))}
          </nav>
        </div>

        <p className="f-credit">
          © 2026 Circle <span className="f-credit-dot" /> Indore · Bombay
        </p>
      </div>
    </footer>
  );
}
