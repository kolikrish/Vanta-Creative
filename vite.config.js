import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: {
    // Split vendor libraries into their own chunks so the initial bundle
    // is smaller and Three.js / GSAP can be cached independently across
    // deploys. Big perf win on slow Windows reloads where JS parse is
    // the bottleneck.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          gsap: ["gsap"],
          "react-vendor": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
