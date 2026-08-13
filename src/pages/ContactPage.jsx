import { useEffect, useRef, useState } from "react";
import BlurInText from "../components/fx/BlurInText.jsx";
import Footer from "../components/sections/Footer.jsx";

const ACTS = [
  { id: "act-i",   label: "ACT I",   title: "The Spark",        subtitle: "Say Hello" },
  { id: "act-ii",  label: "ACT II",  title: "The Idea",         subtitle: "What's it about?" },
  { id: "act-iii", label: "ACT III", title: "The Conversation", subtitle: "Tell us more" },
  { id: "finale",  label: "FINALE",  title: "The Handshake",    subtitle: "Send it over" },
];

const SOCIALS = [
  { k: "IG", label: "Instagram", handle: "@marketingbycircle", href: "https://www.instagram.com/marketingbycircle/" },
  { k: "IN", label: "LinkedIn",  handle: "marketingbycircle",  href: "https://www.linkedin.com/company/marketingbycircle/" },
  { k: "WA", label: "WhatsApp",  handle: "+91 88899 77666",    href: "https://wa.me/918889977666" },
];

export default function ContactPage() {
  const [act, setAct] = useState(0);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const stageRef = useRef(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const next = () => setAct((a) => Math.min(a + 1, ACTS.length - 1));
  const prev = () => setAct((a) => Math.max(a - 1, 0));
  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  // Re-trigger the stage animation on act change
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    el.classList.remove("is-in");
    void el.offsetWidth;
    el.classList.add("is-in");
  }, [act]);

  const current = ACTS[act];

  return (
    <>
      <div className="subpage contact-page">
        <section className="cw-stage">
          <div className="cw-stage-inner" ref={stageRef}>
            <p className="cw-eyebrow">[05] Get in touch</p>
            <BlurInText
              as="h1"
              split="chars"
              stagger={0.018}
              blur={18}
              key={current.id}
              className="cw-stage-title"
            >
              {act === 0 ? "Start your growth journey with us." : current.title}
            </BlurInText>
            <p className="cw-stage-sub">
              {act === 0 && "Whether it's a fresh idea or an old brand asking for a second wind, we're listening. Drop your details and we'll write back."}
              {act === 1 && "Give us the headline. One line is enough: what's the project, the launch or the growth target?"}
              {act === 2 && "Now the long version. Goals, timelines, what's worked, what hasn't. The more honest, the better."}
              {act === 3 && "That's all we need. Hit send and we'll reply within one business day."}
            </p>

            <form className="cw-form" onSubmit={submit}>
              {act === 0 && (
                <>
                  <div className="cw-field">
                    <label className="cw-label">Your name</label>
                    <input
                      className="cw-input"
                      type="text"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="cw-field">
                    <label className="cw-label">Your email</label>
                    <input
                      className="cw-input"
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {act === 1 && (
                <div className="cw-field">
                  <label className="cw-label">Subject</label>
                  <input
                    className="cw-input"
                    type="text"
                    placeholder="Enter your subject"
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    required
                  />
                </div>
              )}

              {act === 2 && (
                <div className="cw-field">
                  <label className="cw-label">Your message</label>
                  <textarea
                    className="cw-input cw-textarea"
                    placeholder="Enter your message"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    required
                  />
                </div>
              )}

              {act === 3 && (
                <>
                  <div className="cw-recap">
                    <div className="cw-recap-row">
                      <span className="cw-recap-k">Name</span>
                      <span className="cw-recap-v">{form.name || "…"}</span>
                    </div>
                    <div className="cw-recap-row">
                      <span className="cw-recap-k">Email</span>
                      <span className="cw-recap-v">{form.email || "…"}</span>
                    </div>
                    <div className="cw-recap-row">
                      <span className="cw-recap-k">Subject</span>
                      <span className="cw-recap-v">{form.subject || "…"}</span>
                    </div>
                    <div className="cw-recap-row">
                      <span className="cw-recap-k">Message</span>
                      <span className="cw-recap-v cw-recap-msg">{form.message || "…"}</span>
                    </div>
                  </div>

                  {sent && (
                    <div className="cw-thanks">
                      <p className="cw-thanks-eyebrow">[Brief received]</p>
                      <h3 className="cw-thanks-title">Thank you.</h3>
                      <p className="cw-thanks-copy">
                        We'll write back within one business day. In the meantime, find us at the channels below.
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="cw-actions">
                {act > 0 && !sent && (
                  <button type="button" className="cw-btn cw-btn-ghost" onClick={prev}>
                    ← Back
                  </button>
                )}
                {act < ACTS.length - 1 && (
                  <button type="button" className="cw-btn" onClick={next}>
                    Next →
                  </button>
                )}
                {act === ACTS.length - 1 && (
                  <button type="submit" className="cw-btn cw-btn-send">
                    {sent ? "Sent ✓" : "Send →"}
                  </button>
                )}
              </div>
            </form>

            <aside className="cw-direct">
              <div className="cw-direct-block">
                <p className="cw-direct-k">Email</p>
                <a className="cw-direct-v" href="mailto:info@marketingbycircle.com">
                  info@marketingbycircle.com
                </a>
              </div>
              <div className="cw-direct-block">
                <p className="cw-direct-k">Phone</p>
                <a className="cw-direct-v" href="tel:+918889977666">
                  +91 88899 77666
                </a>
              </div>
              <div className="cw-direct-block">
                <p className="cw-direct-k">Studio</p>
                <p className="cw-direct-v">Made in India</p>
              </div>
              <div className="cw-direct-block cw-direct-socials">
                <p className="cw-direct-k">Follow</p>
                <div className="cw-direct-row">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.k}
                      href={s.href}
                      className="cw-social"
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${s.label}: ${s.handle}`}
                    >
                      <span className="cw-social-k">{s.k}</span>
                      <span className="cw-social-h">{s.handle}</span>
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="cw-corner cw-corner-tl">[{String(act + 1).padStart(2, "0")} / 04]</div>
          <div className="cw-corner cw-corner-tr">marketing by circle</div>
        </section>
      </div>
      <Footer />
    </>
  );
}
