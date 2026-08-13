import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CSS3DRenderer, CSS3DSprite } from "three/examples/jsm/renderers/CSS3DRenderer.js";

/**
 * LogoGlobe — a real 3D sphere of logos powered by Three.js +
 * CSS3DRenderer. Each logo is a DOM <img> attached to a CSS3DSprite
 * placed on the surface of a sphere. Sprites auto-billboard toward
 * the camera every frame, so every logo stays readable regardless
 * of which side of the sphere it lives on — but their 3D positions
 * still get foreshortening, depth and parallax, so the globe reads
 * as a real sphere rather than a flat icon grid.
 *
 * Items are positioned on a latitude/longitude grid (parallels +
 * meridians, alternating rings phase-shifted by a half step) so the
 * surface reads as a structured globe, not a Fibonacci cloud.
 *
 * Entry animation: every logo starts collapsed at the sphere centre
 * and spreads outward to its surface point with a per-logo stagger.
 *
 * Drag with mouse / touch to spin; release to keep momentum; an idle
 * baseline rotation resumes once drag velocity decays.
 */
export default function LogoGlobe({ items, radius: radiusProp, tileSize: tileSizeProp }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const width = host.clientWidth || 560;
    const height = host.clientHeight || 560;

    // Responsive sizing — when no explicit props are passed, scale the
    // sphere radius and tile size off the container width so the globe
    // fills the available room on both desktop and mobile rather than
    // shrinking to a thumbnail on small screens. On compact viewports
    // we use a larger tile-to-sphere ratio so the logos read at a
    // comfortable thumb-tap size on a phone.
    const baseDim = Math.min(width, height);
    const radius = radiusProp ?? Math.round(baseDim * 0.36);
    const tileSize = tileSizeProp ?? Math.round(baseDim * 0.14);

    // ---- Three.js scene + renderer ------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 5000);
    camera.position.z = radius * 2.85;

    const renderer = new CSS3DRenderer();
    renderer.setSize(width, height);
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
    });
    host.appendChild(renderer.domElement);

    // The sphere is a rotating group containing every logo CSS3DObject.
    const group = new THREE.Group();
    scene.add(group);

    // ---- Lat/lon grid distribution ------------------------------------
    const n = items.length;
    const bands = Math.max(3, Math.round(Math.sqrt(n * 0.9)));
    const latitudes = [];
    for (let b = 0; b < bands; b++) {
      const t = (b + 0.5) / bands;
      latitudes.push((t - 0.5) * Math.PI * 0.94);
    }
    const weights = latitudes.map((lat) => Math.max(0.18, Math.cos(lat)));
    const wSum = weights.reduce((a, b) => a + b, 0);
    const counts = weights.map((w) => Math.max(1, Math.round((w / wSum) * n)));
    let total = counts.reduce((a, b) => a + b, 0);
    while (total !== n) {
      const idx = counts.indexOf(Math.max(...counts));
      counts[idx] += total > n ? -1 : 1;
      total += total > n ? -1 : 1;
    }

    const targets = [];
    for (let b = 0; b < bands; b++) {
      const lat = latitudes[b];
      const count = counts[b];
      const ringR = radius * Math.cos(lat);
      const y = radius * Math.sin(lat);
      const phase = (b % 2) * (Math.PI / count);
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + phase;
        targets.push(new THREE.Vector3(ringR * Math.cos(ang), y, ringR * Math.sin(ang)));
      }
    }

    // ---- Build CSS3DSprites -------------------------------------------
    // CSS3DSprite billboards every tile toward the camera each frame,
    // so every logo on the sphere stays readable from any rotation —
    // but its 3D position still produces foreshortening, parallax and
    // depth scaling, so the cluster reads as a real sphere.
    const objects = items.map((it, i) => {
      const el = document.createElement("div");
      el.className = "logo-globe-3d-tile";
      el.style.width = `${tileSize}px`;
      el.style.height = `${tileSize}px`;
      const img = document.createElement("img");
      img.src = it.logo;
      img.alt = it.name;
      img.draggable = false;
      img.loading = "lazy";
      img.decoding = "async";
      el.appendChild(img);

      const sprite = new CSS3DSprite(el);
      const target = targets[i];

      // Start collapsed at the centre for the spread entry.
      sprite.position.set(0, 0, 0);
      sprite.scale.setScalar(0.15);
      sprite.userData.target = target;
      sprite.userData.delay = i * 26;

      group.add(sprite);
      return sprite;
    });

    // ---- Rotation + drag state ----------------------------------------
    const rot = { x: -0.18, y: 0 };
    const vel = { x: 0, y: 0.0042 };
    const drag = { active: false, lastX: 0, lastY: 0, lastT: 0, vX: 0, vY: 0 };

    const pt = (e) => {
      if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    };

    const onDown = (e) => {
      const p = pt(e);
      drag.active = true;
      drag.lastX = p.x;
      drag.lastY = p.y;
      drag.lastT = performance.now();
      drag.vX = 0;
      drag.vY = 0;
      host.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!drag.active) return;
      const p = pt(e);
      const now = performance.now();
      const dt = Math.max(1, now - drag.lastT);
      const dx = p.x - drag.lastX;
      const dy = p.y - drag.lastY;
      rot.y += dx * 0.006;
      rot.x = Math.max(-Math.PI / 2 + 0.25, Math.min(Math.PI / 2 - 0.25, rot.x + dy * 0.006));
      drag.vY = (dx / dt) * 16 * 0.006;
      drag.vX = (dy / dt) * 16 * 0.006;
      drag.lastX = p.x;
      drag.lastY = p.y;
      drag.lastT = now;
      if (e.cancelable) e.preventDefault();
    };
    const onUp = () => {
      if (!drag.active) return;
      drag.active = false;
      vel.x = drag.vX;
      vel.y = drag.vY;
      host.style.cursor = "grab";
    };

    host.addEventListener("mousedown", onDown);
    host.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    // ---- Animation loop -----------------------------------------------
    const startTime = performance.now();
    const spreadDur = 950;
    const baseSpinY = 0.0028;
    let rafId = 0;

    const animate = (now) => {
      const elapsed = now - startTime;

      // Spread-from-centre entry.
      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        if (obj.userData.spreadDone) continue;
        const t = Math.min(1, Math.max(0, (elapsed - obj.userData.delay) / spreadDur));
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        obj.position.copy(obj.userData.target).multiplyScalar(eased);
        obj.scale.setScalar(0.15 + 0.85 * eased);
        if (t >= 1) obj.userData.spreadDone = true;
      }

      // Auto-spin + inertia decay when not actively dragging.
      if (!drag.active) {
        rot.y += vel.y;
        rot.x = Math.max(-Math.PI / 2 + 0.25, Math.min(Math.PI / 2 - 0.25, rot.x + vel.x));
        vel.x *= 0.94;
        if (Math.abs(vel.y) > baseSpinY) {
          vel.y *= 0.94;
        } else {
          vel.y = baseSpinY;
        }
      }
      group.rotation.x = rot.x;
      group.rotation.y = rot.y;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    host.style.cursor = "grab";
    rafId = requestAnimationFrame(animate);

    // ---- Resize handling ---------------------------------------------
    const ro = new ResizeObserver(() => {
      const w = host.clientWidth || width;
      const h = host.clientHeight || height;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(host);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      host.removeEventListener("mousedown", onDown);
      host.removeEventListener("touchstart", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      while (host.firstChild) host.removeChild(host.firstChild);
    };
  }, [items, radiusProp, tileSizeProp]);

  return <div ref={hostRef} className="logo-globe" aria-label="3D logo globe — drag to spin." />;
}
