import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { navLinks } from "../data/content.js";

export default function TopNav() {
  const headerRef = useRef(null);
  const innerRef = useRef(null);
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isActive = (to) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        })
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useLayoutEffect(() => {
    const el = headerRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    const logo = inner.querySelector(".topnav-logo");
    const links = inner.querySelector(".topnav-links");
    const cta = inner.querySelector(".topnav-cta");

    // Entry animation only on the home (index) route. On other pages, the nav
    // appears in its final state immediately — clicking a nav link does a full
    // reload (anchor tags), so without this gate the header would re-animate
    // on every page.
    if (pathname !== "/") {
      inner.classList.remove("is-compact");
      gsap.set(el, { opacity: 1 });
      gsap.set([logo, links, cta], { opacity: 1, y: 0, x: 0 });
      return;
    }

    // Match the CSS breakpoints so the animation lands at the same dimensions
    // CSS would render — otherwise clearProps causes a visible jump.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isXSmall = vw <= 480;
    const isMobile = vw <= 900;

    const targetW = isMobile
      ? vw - (isXSmall ? 16 : 24)         // calc(100vw - 1rem | 1.5rem)
      : Math.min(vw - 32, 1200);
    const targetH = isXSmall ? 46 : isMobile ? 52 : 58;
    const targetTop = isXSmall ? 5.6 : 16; // 0.35rem | 1rem
    const targetLeft = (vw - targetW) / 2;

    const startW = isMobile ? Math.min(160, targetW) : 200;

    inner.classList.add("is-compact");
    gsap.set(el, {
      position: "fixed",
      left: vw / 2 - startW / 2,
      top: targetTop,
      width: startW,
      height: targetH,
      borderRadius: 999,
      x: 0,
      y: 0,
      xPercent: 0,
      yPercent: 0,
      opacity: 0,
    });
    gsap.set(logo, { opacity: 0, y: 6 });
    gsap.set([links, cta], { opacity: 0, y: 6 });

    const tl = gsap.timeline({ delay: 0.2 });

    tl.to(el, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0)
      .to(
        logo,
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        0.5
      )
      .to({}, { duration: 0.45 })
      .to(el, {
        width: targetW,
        left: targetLeft,
        duration: 1.9,
        ease: "expo.inOut",
      })
      .add(() => {
        const r1 = logo.getBoundingClientRect();
        inner.classList.remove("is-compact");
        const r2 = logo.getBoundingClientRect();
        const dx = r1.left - r2.left;
        gsap.fromTo(
          logo,
          { x: dx },
          { x: 0, duration: 1.0, ease: "expo.inOut" }
        );
        gsap.to([links, cta], {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          delay: 1.0,
        });
      }, ">-0.2")
      .to({}, { duration: 2.0 })
      .add(() => {
        const prev = el.style.transition;
        el.style.transition = "none";
        gsap.set(el, {
          clearProps:
            "left,top,width,height,transform,borderRadius,opacity",
        });
        gsap.set([logo, links, cta], { clearProps: "opacity,transform" });
        void el.offsetWidth;
        requestAnimationFrame(() => {
          el.style.transition = prev;
        });
      });

    return () => tl.kill();
  }, []);

  return (
    <>
    <header className="topnav" ref={headerRef}>
      <div className="topnav-inner" ref={innerRef}>
        <a href="/" className="tn-item topnav-logo">
          <img src="/newlogo.png" alt="Circle" className="tn-logo-img" />
          <span className="tn-logo-word">Circle</span>
        </a>
        <nav className="tn-item topnav-links">
          {navLinks.map((n) => (
            <a
              key={n.to}
              href={n.to}
              className={`topnav-link ${isActive(n.to) ? "is-active" : ""}`}
            >
              <span className="n">{n.num}</span>
              <span className="l">{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="tn-item topnav-cta">
          <span className="tn-time">
            <span className="tn-pulse" />
            <span>{time} IST</span>
          </span>
        </div>
        <button
          type="button"
          className={`tn-burger ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
    <div
      className={`tn-mobile-overlay ${menuOpen ? "is-open" : ""}`}
      onClick={() => setMenuOpen(false)}
      aria-hidden={!menuOpen}
    />
    <nav
      className={`tn-mobile-menu ${menuOpen ? "is-open" : ""}`}
      aria-hidden={!menuOpen}
    >
      <button
        type="button"
        className="tn-mobile-close"
        aria-label="Close menu"
        onClick={() => setMenuOpen(false)}
      >
        <span />
        <span />
      </button>
      {navLinks.map((n) => (
        <a
          key={n.to}
          href={n.to}
          className={`tn-mobile-link ${isActive(n.to) ? "is-active" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          <span className="tn-mobile-num">{n.num}</span>
          <span className="tn-mobile-label">{n.label}</span>
        </a>
      ))}
      <div className="tn-mobile-foot">
        <span className="tn-pulse" />
        <span>{time} IST</span>
      </div>
    </nav>
    </>
  );
}
