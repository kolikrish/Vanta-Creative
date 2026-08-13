import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/sections/Hero.jsx";
import Process from "../components/sections/Process.jsx";
import Reveal from "../components/sections/Reveal.jsx";
import Tagline from "../components/sections/Tagline.jsx";
import WhatWeDo from "../components/sections/WhatWeDo.jsx";
import PlatformsWorkedWith from "../components/sections/PlatformsWorkedWith.jsx";
import Testimonials from "../components/sections/Testimonials.jsx";
import Clients from "../components/sections/Clients.jsx";
import { homeClients } from "../data/content.js";

/* Reach pulls in Three.js (~600KB) for the WebGL globe — too heavy to
   ship in the initial bundle. Footer is also deferred since it's well
   below the fold. The home page renders the SAME Clients honeycomb
   component as /brands, just with a curated subset of brands so the
   landing surface stays light. */
const Reach        = lazy(() => import("../components/sections/Reach.jsx"));
const Footer       = lazy(() => import("../components/sections/Footer.jsx"));

export default function Home() {
  return (
    <>
      <Hero />
      <Process />
      <Reveal />
      <Tagline />
      <WhatWeDo />
      <PlatformsWorkedWith />
      <Testimonials />
      <Clients
        brands={homeClients}
        eyebrow="[Few brands we have worked with]"
        cta={
          <Link to="/brands" className="brands-head-cta">
            See all brands <span aria-hidden="true">↗</span>
          </Link>
        }
      />
      <Suspense fallback={null}>
        <Reach />
        <Footer />
      </Suspense>
    </>
  );
}
