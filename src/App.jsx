import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// On iOS Safari and Android Chrome, the address bar grows/shrinks during
// scroll, which triggers a ScrollTrigger.refresh() and causes pinned/scrubbed
// sections to recalculate mid-scroll — the visible result is jitter and
// "bouncing". Telling ScrollTrigger to ignore those resizes is the single
// biggest mobile-stability win.
ScrollTrigger.config({ ignoreMobileResize: true });

// On touch devices, normalize the scroll: ScrollTrigger samples the touch
// input through its own RAF loop and feeds the *exact rendered scroll
// position* to every pin transform. Without this, pins read Lenis's
// smoothed/synced position which drifts from the native momentum scroll
// — that drift is what reads as "bouncing past the footer / horizontal
// section overshooting" on phones.
if (
  typeof window !== "undefined" &&
  (window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
    window.innerWidth <= 900)
) {
  ScrollTrigger.normalizeScroll(true);
}

// Detect low-end devices once at module load and tag <html> with classes
// that the rest of the app (CSS + JS) can use to disable expensive
// effects. The thresholds are intentionally conservative — we'd rather
// downgrade visuals on a borderline device than ship jittery scroll on it.
if (typeof window !== "undefined") {
  const dm = navigator.deviceMemory ?? 8;       // RAM in GB (fallback: assume OK)
  const hc = navigator.hardwareConcurrency ?? 8; // logical cores
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
import ServicesPage from "./pages/ServicesPage.jsx";
import WorkPage from "./pages/WorkPage.jsx";
import WorkDetailPage from "./pages/WorkDetailPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import BrandsPage from "./pages/BrandsPage.jsx";

let lenisInstance = null;
export const getLenis = () => lenisInstance;

export default function App() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  // Mobile-only safety net: hard-reload sometimes leaves the body / html with
  // a stale lock (overflow:hidden from a previous mobile-menu open, or a
  // leftover `lenis-stopped` class from a prior desktop session served from
  // the same SW cache). On iOS this manifests as "scroll stuck after every
  // reload". Clear those once on mount, defensively, so native scroll is
  // guaranteed to work.
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
    // Touch / mobile: native iOS Safari and Android scroll is hardware-
    // accelerated and is the single source of scroll truth. Pin transforms
    // are kept in sync with native momentum via ScrollTrigger.normalizeScroll
    // (configured at module-load above). Adding Lenis on top would
    // introduce a second, lagged scroll position and is what was causing
    // the pins to bounce / overshoot the footer.
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
      // Hero stops Lenis during its entrance animation. If the user
      // clicks an in-app <Link> before Hero's unlock() fires (its 6s
      // safety net hasn't expired yet), Lenis stays stopped and the
      // NEXT page renders but can't scroll — looks like a blank screen
      // because content below the fold is unreachable. Force-start
      // Lenis on every route change so this can't happen.
      lenisInstance.start();
      lenisInstance.scrollTo(0, { immediate: true, force: true });
    }
    // Same belt-and-suspenders for any leftover body locks (mobile menu
    // close races, page-loader cleanup races, etc.) — clear them so
    // the new page is always interactive on first paint.
    document.body.classList.remove("chrome-hidden");
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.documentElement.style.overflow = "";
  }, [location.pathname]);

  useEffect(() => {
    // After paint: let Lenis recompute bounds for the new page, then
    // refresh ScrollTriggers so any newly-mounted ones evaluate against
    // scroll=0.
    //
    // Refresh runs in TWO passes (rAF + 60ms timeout). On first SPA
    // navigation to a route with sticky / pinned children (/brands had
    // the Clients honeycomb's sticky stage; old pages had pin spacers)
    // the single-rAF refresh could fire before the new page's children
    // had committed their useEffects, leaving the page rendered but
    // invisible until the next user-driven scroll forced a refresh —
    // the "blank until reload" symptom the user hit. The deferred
    // second refresh catches that case.
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
  }, [location.pathname]);

  return (
    <>
      <PageLoader />
      <Transition pathname={location.pathname} />
      <CursorFX />
      <div className="app">
        <TopNav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<WorkDetailPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
    </>
  );
}
