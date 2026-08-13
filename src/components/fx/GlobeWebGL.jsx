import { useEffect, useRef } from "react";
import * as THREE from "three";

/* Real WebGL globe — wireframe + dotted earth surface, glowing pins on the
   served countries, auto-rotates continuously, and supports pointer / touch
   drag to rotate manually. Drag inertia carries the spin a little after
   release before easing back to the constant idle rotation. */

// Pin positions tuned for VISUAL spread on the rendered globe — not just
// the geographic centroid of each country. India sits in the south so it
// reads clearly below Dubai; USA is anchored on the east coast (NY) and
// Canada on the west coast (Vancouver), so the two North-American pins
// are diagonally across the continent instead of stacked over each other.
// PINS[0] (India) is the home pin — all connection arcs are drawn from
// it to PINS[1..N]. Pins after that are decorative "served markets" that
// fill the otherwise empty regions of the globe (Africa, Oceania, SE
// Asia, South America, Western Europe) so the planet reads as a live
// activity map instead of a sparse four-pin scene.
const PINS = [
  { lat: 12.97,  lon: 77.59,    label: "India"  },     // Bangalore (home)
  { lat: 25.20,  lon: 55.27,    label: "Dubai"  },     // UAE
  { lat: 40.71,  lon: -74.00,   label: "USA"    },     // New York
  { lat: 49.28,  lon: -123.12,  label: "Canada" },     // Vancouver
  // Decorative reach points — no connection arcs, just glowing dots so
  // the globe doesn't have huge empty quadrants when the user rotates it.
  { lat: 51.51,  lon:  -0.13,   label: "UK",      decorative: true }, // London
  { lat: 1.35,   lon: 103.82,   label: "Singapore", decorative: true },
  { lat: -33.87, lon: 151.21,   label: "Australia", decorative: true }, // Sydney
  { lat: -23.55, lon: -46.63,   label: "Brazil",  decorative: true }, // São Paulo
  { lat: 35.68,  lon: 139.69,   label: "Japan",   decorative: true }, // Tokyo
  { lat: -1.29,  lon: 36.82,    label: "Kenya",   decorative: true }, // Nairobi
  { lat: 52.52,  lon: 13.40,    label: "Germany", decorative: true }, // Berlin
];

const latLonToVec3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
};

export default function GlobeWebGL() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const getSize = () => ({
      w: mount.clientWidth || 400,
      h: mount.clientHeight || 400,
    });

    let { w, h } = getSize();

    /* Mobile profile — phones can't carry the same dot/arc weight as
       desktop without dropping frames, so every density-related
       constant downgrades below this width. Decided at init (not
       per-frame) so the geometry can be sized correctly when the
       buffer is first uploaded. */
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 820;

    const scene = new THREE.Scene();
    // Wider vertical FOV + slightly further camera so the lifted flight
    // arcs (mid-points pushed out to ~2.2× the planet radius) sit fully
    // inside the camera frustum instead of being clipped at the top of
    // the canvas. The taller canvas aspect (3:4) then renders that
    // headroom as visible canvas space above the planet.
    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 100);
    camera.position.z = 6.4;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w, h);
    /* Mobile pixel ratio is capped lower than desktop — most phones
       run at DPR 3 which means rendering 9× the pixels for the same
       physical canvas. The dotted globe doesn't benefit from that
       resolution, so 1.5 is the sweet spot for sharpness vs. fps. */
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)
    );
    mount.appendChild(renderer.domElement);

    // Container group — drag rotation applies to this so pins spin with the
    // surface and stay stuck to their lat/lon.
    const group = new THREE.Group();
    scene.add(group);

    const radius = 1.7;

    // Solid filled sphere (the planet's "body") — slightly inset so dots /
    // pins read as raised on its surface.
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.985, 64, 48),
      new THREE.MeshBasicMaterial({
        color: 0x0a0a0e,
        transparent: true,
        opacity: 0.92,
      })
    );
    group.add(planet);

    // Wireframe — latitude / longitude grid. White, slightly
    // brighter than the dot base so the grid lines read as the
    // planet's structure underneath the data points.
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(radius, 36, 24)),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.22,
      })
    );
    group.add(wire);

    // Equator + tropics as bolder standalone rings so the planet has a
    // clear horizon line and a couple of "banding" cues.
    const ringRefs = [];
    const addRing = (latDeg, opacity, colour) => {
      const points = [];
      const segs = 96;
      const r = radius * 1.001;
      const phi = (90 - latDeg) * (Math.PI / 180);
      for (let i = 0; i <= segs; i++) {
        const theta = (i / segs) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            -r * Math.sin(phi) * Math.cos(theta),
             r * Math.cos(phi),
             r * Math.sin(phi) * Math.sin(theta)
          )
        );
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
      const ring = new THREE.Line(
        ringGeo,
        new THREE.LineBasicMaterial({
          color: colour,
          transparent: true,
          opacity,
        })
      );
      group.add(ring);
      ringRefs.push(ring);
    };
    addRing(0,    0.55, 0xffffff); // equator
    addRing(23,   0.30, 0xffffff); // tropic of cancer
    addRing(-23,  0.30, 0xffffff); // tropic of capricorn

    // Vertical meridians (every 30°) — visible longitude lines.
    const meridianRefs = [];
    for (let m = 0; m < 12; m++) {
      const lonDeg = -180 + m * 30;
      const points = [];
      const segs = 64;
      const r = radius * 1.001;
      for (let i = 0; i <= segs; i++) {
        const lat = -90 + (180 * i) / segs;
        points.push(latLonToVec3(lat, lonDeg, r));
      }
      const meridianGeo = new THREE.BufferGeometry().setFromPoints(points);
      const meridian = new THREE.Line(
        meridianGeo,
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.18,
        })
      );
      group.add(meridian);
      meridianRefs.push(meridian);
    }

    // Dot grid covering the globe.
    //   PASS A — dense base grid in WHITE with slight tonal variation,
    //   so the planet's surface reads as a real constellation rather
    //   than a flat mesh. The white grid is the "planet body".
    //   PASS B — ~240 RED "lit" points scattered evenly via Fibonacci
    //   sphere sampling, sitting slightly proud of the base grid so
    //   they pop as bright red data nodes against the white surface.
    // Single THREE.Points cloud with per-vertex colour so the two
    // passes can render in the same draw call.
    const ACCENT_RED = [1.0, 0.32, 0.32];
    const dotPositions = [];
    const dotColors = [];

    // --- Pass A: dense white base grid. 48 × 16 on desktop, halved
    // on mobile so the upload + per-frame draw stays cheap. */
    const N_LAT = isMobile ? 30 : 48;
    const LON_MUL = isMobile ? 10 : 16;
    for (let i = 1; i < N_LAT; i++) {
      const lat = -90 + (180 * i) / N_LAT;
      const numLon = Math.max(
        6,
        Math.round(2 * Math.PI * Math.cos((lat * Math.PI) / 180) * LON_MUL)
      );
      for (let j = 0; j < numLon; j++) {
        const lon = -180 + (360 * j) / numLon;
        const v = latLonToVec3(lat, lon, radius * 1.005);
        dotPositions.push(v.x, v.y, v.z);
        const tint = 0.65 + 0.35 * Math.abs(Math.sin(i * 1.7 + j * 2.3));
        dotColors.push(tint, tint, tint);
      }
    }

    // --- Pass B: red accent points via Fibonacci sampling. Mobile
    // gets ~half the count — still reads as a full red layer because
    // the connection arcs above carry most of the "red" weight. ---
    const ACCENT_COUNT = isMobile ? 280 : 600;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let n = 0; n < ACCENT_COUNT; n++) {
      const y = 1 - (n / (ACCENT_COUNT - 1)) * 2; // -1..1
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * n;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const surf = radius * 1.012;
      dotPositions.push(x * surf, y * surf, z * surf);
      dotColors.push(ACCENT_RED[0], ACCENT_RED[1], ACCENT_RED[2]);
    }

    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(dotPositions, 3)
    );
    dotsGeo.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(dotColors, 3)
    );
    const dots = new THREE.Points(
      dotsGeo,
      new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.028,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
      })
    );
    group.add(dots);

    // Atmosphere — outer translucent shell to suggest a soft glow.
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.06, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
      })
    );
    group.add(atmosphere);

    // Country pins — every marker now renders in a single red tone
    // (matching the accent dot grid and the connection lines), so the
    // globe reads as a coherent red network instead of a multi-hued
    // scene. Real (non-decorative) pins keep two halo rings + the
    // pulse animation; decorative pins are smaller and calmer
    // (single dot + soft halo, no animated outer ring).
    const PIN_RED = 0xff3d3d;
    const colorFor = () => PIN_RED;
    const PIN_PINK = PIN_RED; // legacy alias retained for kill-disposal refs
    // Helper that promotes a pin mesh to always-on-top so it stays
    // visible even when the planet hemisphere it sits on rotates to
    // the back of the camera — same overlay rule as the connection
    // arcs below.
    const promoteOverlay = (mesh) => {
      mesh.material.depthTest = false;
      mesh.material.depthWrite = false;
      mesh.renderOrder = 11;
    };
    const pinObjs = [];
    PINS.forEach((p, idx) => {
      const pos = latLonToVec3(p.lat, p.lon, radius * 1.015);
      const c = colorFor(idx);

      if (p.decorative) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 16, 16),
          new THREE.MeshBasicMaterial({
            color: c,
            transparent: true,
            opacity: 0.95,
          })
        );
        dot.position.copy(pos);
        promoteOverlay(dot);
        group.add(dot);

        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(0.085, 16, 16),
          new THREE.MeshBasicMaterial({
            color: c,
            transparent: true,
            opacity: 0.35,
          })
        );
        halo.position.copy(pos);
        promoteOverlay(halo);
        group.add(halo);

        pinObjs.push({ dot, halo, basePos: pos.clone(), decorative: true, color: c });
        return;
      }

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 24, 24),
        new THREE.MeshBasicMaterial({ color: c })
      );
      dot.position.copy(pos);
      promoteOverlay(dot);
      group.add(dot);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 24, 24),
        new THREE.MeshBasicMaterial({
          color: c,
          transparent: true,
          opacity: 0.42,
        })
      );
      halo.position.copy(pos);
      promoteOverlay(halo);
      group.add(halo);

      // Outer ring picks up the pulse animation in the render loop and
      // gives the marker an actively-pinging look.
      const halo2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.21, 20, 20),
        new THREE.MeshBasicMaterial({
          color: c,
          transparent: true,
          opacity: 0.2,
        })
      );
      halo2.position.copy(pos);
      promoteOverlay(halo2);
      group.add(halo2);

      pinObjs.push({ dot, halo, halo2, basePos: pos.clone(), color: c });
    });

    // Connection arcs — two layers:
    //
    //   PRIMARY (pink, bright, lifted high) — every PAIR of real served
    //   pins connects to every other real served pin (full mesh) so the
    //   network reads as "we run between these places", not just "from
    //   home to spokes". With 4 real pins (India, Dubai, US, Canada)
    //   that's C(4,2) = 6 primary arcs.
    //
    //   SECONDARY (soft pink, lower, thinner) — each decorative pin
    //   connects to its nearest real pin. Looks like a quieter
    //   regional sub-network feeding into the primary arcs.
    const arcRefs = [];

    const buildArc = (a, b, opts = {}) => {
      const lift = opts.lift ?? 1.55;
      const liftBoost = opts.liftBoost ?? 0.7;
      const segs = opts.segments ?? 64;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const liftFactor = lift + liftBoost * (a.distanceTo(b) / (radius * 2));
      mid.normalize().multiplyScalar(radius * liftFactor);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const points = curve.getPoints(segs);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arc = new THREE.Line(
        arcGeo,
        new THREE.LineBasicMaterial({
          color: opts.color ?? PIN_PINK,
          transparent: true,
          opacity: opts.opacity ?? 0.95,
          /* Always render arcs as an OVERLAY on top of the planet so
             rotating the globe never hides the connection network
             behind the back hemisphere. depthTest:false makes the
             material ignore the depth buffer; depthWrite:false keeps
             it from occluding other transparent layers. Combined
             with renderOrder=10 below, every arc paints last and
             stays visible regardless of its world-space Z. */
          depthTest: false,
          depthWrite: false,
        })
      );
      arc.renderOrder = 10;
      group.add(arc);
      arcRefs.push(arc);
    };

    // HUB-AND-SPOKE NETWORK: full mesh between the 4 real served-
    // markets (India / Dubai / USA / Canada) = C(4,2) = 6 bright
    // primary arcs, plus one softer arc from each decorative reach
    // point back to the India home pin = 7 secondary arcs. Total 13
    // arcs instead of the previous full-mesh 55 — the globe still
    // reads as a connected world network but with far less red
    // weight cluttering every rotation angle.
    //
    // Mobile keeps the same topology with lower curve segment counts.
    const PRIMARY_SEG  = isMobile ? 28 : 64;
    const SECONDARY_SEG = isMobile ? 20 : 44;
    const realPins = pinObjs.filter((p) => !p.decorative);
    const homePin = realPins[0]; // India — anchors the spoke arcs
    // 1. Real-to-real full mesh (bright, lifted).
    for (let i = 0; i < realPins.length; i++) {
      for (let j = i + 1; j < realPins.length; j++) {
        buildArc(realPins[i].basePos, realPins[j].basePos, {
          color: PIN_RED,
          opacity: 0.92,
          lift: 1.55,
          liftBoost: 0.7,
          segments: PRIMARY_SEG,
        });
      }
    }
    // 2. Each decorative reach point connects only to the home pin.
    for (const p of pinObjs) {
      if (!p.decorative) continue;
      buildArc(homePin.basePos, p.basePos, {
        color: PIN_RED,
        opacity: 0.55,
        lift: 1.32,
        liftBoost: 0.5,
        segments: SECONDARY_SEG,
      });
    }

    // ---- Interaction: drag rotates the group, idle spin always present ----
    let isDragging = false;
    let lastX = 0,
      lastY = 0;
    let velX = 0, // x-axis pitch velocity from drag inertia
      velY = 0; // y-axis yaw velocity from drag inertia
    const IDLE_SPIN = 0.0028;
    const DAMP = 0.94;
    const SENSITIVITY = 0.005;

    group.rotation.y = 0.6; // start with a flattering view of Asia / India

    const onPointerDown = (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      mount.style.cursor = "grabbing";
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {/* ignore */}
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      group.rotation.y += dx * SENSITIVITY;
      group.rotation.x += dy * SENSITIVITY;
      // clamp pitch so the user can't flip the globe upside-down
      group.rotation.x = Math.max(
        -Math.PI / 2.4,
        Math.min(Math.PI / 2.4, group.rotation.x)
      );

      velY = dx * SENSITIVITY;
      velX = dy * SENSITIVITY;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      mount.style.cursor = "grab";
      try {
        e.target.releasePointerCapture?.(e.pointerId);
      } catch {/* ignore */}
    };

    mount.style.cursor = "grab";
    mount.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    // ---- Resize ----
    const onResize = () => {
      const sz = getSize();
      w = sz.w;
      h = sz.h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ---- Animation loop ----
    /* PERF: pause the loop when the canvas is off-screen. The globe
       used to spin its rAF (Three.js render + halo pulse + matrix
       updates) every frame regardless of where the user was on the
       page — a constant CPU/GPU drain that contributed to the rest
       of the page jittering on mobile. IntersectionObserver gates
       the rAF so it only ticks while in view, with a 200px margin so
       the scene is rendered before the user actually sees it. */
    let raf;
    let t = 0;
    let inView = false;
    const animate = () => {
      t += 1;

      if (!isDragging) {
        // Inertia from drag fades, idle yaw spin always continues.
        group.rotation.y += IDLE_SPIN + velY;
        group.rotation.x += velX;
        velX *= DAMP;
        velY *= DAMP;
        // Pitch eases back toward 0 so the camera doesn't end stuck off-axis.
        group.rotation.x *= 0.985;
      }

      // Pin halo pulse — gentle scale breathing on the inner halo, plus a
      // wider outward ping on the outer halo so the marker visibly throbs.
      // Decorative pins only have the inner halo, no animated outer ring.
      const pulse = 1 + Math.sin(t * 0.04) * 0.22;
      const ping = 1 + (Math.sin(t * 0.05) * 0.5 + 0.5) * 0.6;
      pinObjs.forEach((pin, i) => {
        const phase = pulse + (i % 2) * 0.05;
        pin.halo.scale.setScalar(phase);
        if (pin.halo2) {
          pin.halo2.scale.setScalar(ping + (i % 2) * 0.08);
          pin.halo2.material.opacity =
            0.22 - (Math.sin(t * 0.05) * 0.5 + 0.5) * 0.18;
        }
      });

      renderer.render(scene, camera);
      if (inView) raf = requestAnimationFrame(animate);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const wasInView = inView;
        inView = entry.isIntersecting;
        if (inView && !wasInView) {
          raf = requestAnimationFrame(animate);
        } else if (!inView && wasInView) {
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(mount);
    // Initial render (one frame) so the globe is painted immediately
    // when first scrolled into view, even before the IO callback fires.
    renderer.render(scene, camera);

    return () => {
      io.disconnect();
      inView = false;
      cancelAnimationFrame(raf);
      mount.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);

      // Dispose every geometry / material to release GPU memory.
      planet.geometry.dispose();
      planet.material.dispose();
      wire.geometry.dispose();
      wire.material.dispose();
      dotsGeo.dispose();
      dots.material.dispose();
      atmosphere.geometry.dispose();
      atmosphere.material.dispose();
      pinObjs.forEach(({ dot, halo, halo2 }) => {
        dot.geometry.dispose();
        dot.material.dispose();
        halo.geometry.dispose();
        halo.material.dispose();
        if (halo2) {
          halo2.geometry.dispose();
          halo2.material.dispose();
        }
      });
      ringRefs.forEach((r) => {
        r.geometry.dispose();
        r.material.dispose();
      });
      meridianRefs.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
      arcRefs.forEach((a) => {
        a.geometry.dispose();
        a.material.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="reach-globe-3d" ref={mountRef} aria-hidden="true" />;
}
