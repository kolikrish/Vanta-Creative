import { useEffect, useState } from "react";

/* Page loader — shown over the whole viewport on first paint while the
   critical above-the-fold assets are warming up (logo, hero font, the
   particle WebGL initialising). Hides as soon as either:
     1. window.load fires (everything reachable from the HTML has loaded)
     2. A 2.2s safety timeout — so the user never sees the loader for
        more than that even if a slow third-party asset hangs.
   Once hidden, dispatches a `pageloader:done` event that the Hero
   listens to so it can start its entrance animation immediately
   afterwards instead of running underneath the loader. */

const CRITICAL_IMAGES = [
  "/newlogo.png",
  "/arrow-logo.png",
];

export default function PageLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeoutId;
    let cancelled = false;

    const finish = () => {
      if (cancelled || done) return;
      // Brief delay so the fade-out plays even on near-instant loads.
      requestAnimationFrame(() => {
        if (cancelled) return;
        setDone(true);
        // Tell the Hero (and anything else listening) that it's safe to
        // fire entrance animations now.
        window.dispatchEvent(new CustomEvent("pageloader:done"));
      });
    };

    // Pre-fetch the critical images in parallel — we resolve as soon as
    // either each one loads OR fails (don't block on a missing asset).
    const imagePromises = CRITICAL_IMAGES.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        })
    );

    const docReady =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) => {
            window.addEventListener("load", resolve, { once: true });
          });

    Promise.all([...imagePromises, docReady]).then(finish);

    // Safety net — never let the loader stick longer than 2.2s.
    timeoutId = setTimeout(finish, 2200);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [done]);

  return (
    <div
      className={`page-loader ${done ? "is-done" : ""}`}
      aria-hidden={done}
      role="status"
    >
      <div className="page-loader-inner">
        <img
          src="/newlogo.png"
          alt=""
          className="page-loader-logo"
          aria-hidden="true"
        />
        <div className="page-loader-bar" aria-hidden="true">
          <span className="page-loader-bar-fill" />
        </div>
        <p className="page-loader-text">Circle</p>
      </div>
    </div>
  );
}
