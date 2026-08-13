# Vanta Creative

A modern, highly interactive, and visually stunning web experience for **Vanta Creative**, a forward-thinking creative marketing agency. This project is built using React and Vite, emphasizing smooth scroll physics, high-performance animations, and immersive WebGL 3D elements.

## Features

- **Fluid Smooth Scrolling**: Integrated with [Lenis](https://lenis.studiofreight.com/) for a buttery-smooth scrolling experience across all devices.
- **Complex UI Animations**: Uses [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform) and `split-type` for dynamic text reveals, parallax effects, and scroll-triggered animations.
- **WebGL Integrations**: Uses [Three.js](https://threejs.org/) to render real-time interactive 3D components like the dynamic globe in the Global Reach section.
- **Glassmorphic & Minimalist Aesthetics**: Features a modern dark-theme UI with frosted glass overlays, clean typography, and a highly polished bottom call-to-action (CTA) section.
- **Responsive Design**: Meticulously designed for all screen sizes, dynamically adapting grid structures and scaling typographies.

## Tech Stack

- **Core**: React 18, Vite
- **Animations**: GSAP, Split-Type
- **3D Engine**: Three.js
- **Scrolling Physics**: Lenis
- **Styling**: Vanilla CSS with modern custom properties (CSS variables)

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd vanta-creative
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the local development server:

```bash
npm run dev
```

This will run Vite and make your project available (typically at `http://localhost:5173`).

### Build for Production

To build an optimized, production-ready bundle:

```bash
npm run build
```

To preview the built project locally before deployment:

```bash
npm run preview
```

## Structure

- `/src/components/sections/`: Contains the main building blocks of the page (e.g., `Hero.jsx`, `Process.jsx`, `Reach.jsx`, `Footer.jsx`).
- `/src/fx/`: Holds the visual effects and 3D scenes (e.g., `GlobeWebGL.jsx`).
- `/src/styles/`: Contains all the custom CSS files broken down by component and global styles.

## License

© 2026 Vanta Creative. All rights reserved.
