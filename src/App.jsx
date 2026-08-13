import { useEffect, useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
if (
  typeof window !== "undefined" &&
  (window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
    window.innerWidth <= 900)
) {
  ScrollTrigger.normalizeScroll(true);
}

if (typeof window !== "undefined") {
  const dm = navigator.deviceMemory ?? 8;       
  const hc = navigator.hardwareConcurrency ?? 8; 
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isLowPerf = reduceMotion || dm < 4 || hc < 4;
  document.documentElement.classList.toggle("is-low-perf", isLowPerf);
  document.documentElement.classList.toggle("prefers-reduced-motion", reduceMotion);
}

import TopNav from "./components/TopNav.jsx";
import Transition from "./components/Transition.jsx";
import PageLoader from "./components/PageLoader.jsx";
import CursorFX from "./components/fx/CursorFX.jsx";

import Home from "./pages/Home.jsx";

let lenisInstance = null;
export const getLenis = () => lenisInstance;

export default function App() {
  const isFirstRender = useRef(true);

  useEffect(() => {
    const isTouch =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      window.innerWidth <= 900;
    if (!isTouch) return;
    document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.height = "";
    document.documentElement.style.overflow = "";
  }, []);

  useEffect(() => {
    const isTouch =
      window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      window.innerWidth <= 900;

    let lastY = 0;
    let dirAnchor = 0;
    let currentDir = 0;
    const handleY = (y) => {
      const delta = y - lastY;
      lastY = y;
      if (y < 80) {
        document.body.classList.remove("chrome-hidden");
        dirAnchor = y;
        currentDir = 0;
        return;
      }
      if (Math.abs(delta) < 0.5) return;
      const dir = delta > 0 ? 1 : -1;
      if (dir !== currentDir) {
        currentDir = dir;
        dirAnchor = y;
      }
      const moved = Math.abs(y - dirAnchor);
      if (dir === 1 && moved > 90) {
        document.body.classList.add("chrome-hidden");
      } else if (dir === -1 && moved > 60) {
        document.body.classList.remove("chrome-hidden");
      }
    };

    if (isTouch) {
      const onScroll = () => handleY(window.scrollY);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        document.body.classList.remove("chrome-hidden");
      };
    }

    // Desktop only: Lenis for smooth wheel scroll.
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.09,
      duration: 1.05,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", ({ scroll }) => handleY(scroll));
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Re-enable lag smoothing (was 0 = disabled). GSAP detects when frames
    // are dropped (e.g. tab backgrounded, slow GPU stalls) and re-syncs the
    // animation timeline so dropped frames don't accumulate into jumpy,
    // jittery scrub. Default thresholds.
    gsap.ticker.lagSmoothing(500, 33);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
      document.body.classList.remove("chrome-hidden");
    };
  }, []);

  // Reset scroll BEFORE paint and before children mount their effects.
  // useLayoutEffect runs synchronously after DOM commit, so the new page's
  // BlurInText/Dissolve effects see scroll=0 when measuring rects.
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (lenisInstance) {
      lenisInstance.start();
      lenisInstance.scrollTo(0, { immediate: true, force: true });
    }
    document.body.classList.remove("chrome-hidden");
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.documentElement.style.overflow = "";
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (lenisInstance) {
        lenisInstance.resize();
        lenisInstance.scrollTo(0, { immediate: true, force: true });
      }
      ScrollTrigger.refresh();
    });
    const t = setTimeout(() => {
      if (lenisInstance) lenisInstance.resize();
      ScrollTrigger.refresh();
      // Also force a layout read so any sub-pixel scroll snapping
      // applied by ScrollTrigger.normalizeScroll commits before the
      // user's first interaction.
      void document.body.offsetHeight;
    }, 60);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <PageLoader />
      <Transition />
      <CursorFX />
      <div className="app">
        <TopNav />
        <Home />
      </div>
    </>
  );
}
