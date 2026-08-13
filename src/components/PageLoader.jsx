import { useEffect, useState } from "react";

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
      requestAnimationFrame(() => {
        if (cancelled) return;
        setDone(true);
        window.dispatchEvent(new CustomEvent("pageloader:done"));
      });
    };

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
        <p className="page-loader-text">Vanta Creative</p>
      </div>
    </div>
  );
}
