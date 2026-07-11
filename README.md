# 🌍 radio.garden

An immersive, interactive 3D WebGL web application that lets users rotate a realistic Earth globe, click on cities, and immediately stream live local radio feeds. Built with a modern, high-performance React + Vite stack, the project leverages Three.js for rendering and HLS.js for worldwide audio compatibility.

---
**App Link** - https://kaleidoscopic-smakager-1234c2.netlify.app/


## ✨ Features

- **🌐 Interactive 3D Globe:** Renders a realistic Earth with high-resolution satellite imagery, bump-mapped terrain topography, and a glowing atmospheric scattering effect.
- **⚡ Smooth Camera Glide:** Auto-rotates on load. Dragging or clicking a coordinate smoothly glides, aligns, and zooms the camera to focus on the selected city.
- **📻 Global Station Plotting:** Pre-loads coordinates of over 2000+ of the most popular radio stations globally, grouping nearby feeds into single clickable coordinates representing cities.
- **🔍 Auto-Focusing Search:** Search dynamically by station name, city, country, or genre. Selecting a search result automatically flies the globe camera directly to that station's city.
- **🎧 HLS & Standard Streaming:** Integrates standard HTML5 audio with `hls.js` under the hood to play live streams (such as `.m3u8` live feeds), maximizing compatibility with global broadcasters.
- **🌊 Simulated Equalizer Visualizer:** Features a smooth, lightweight CSS/SVG audio visualizer that animates cleanly to represent active audio streams without triggering browser CORS errors.
- **🎨 Glassmorphic Split-Pane UI:** A modern sidebar layout crafted with pure Vanilla CSS, featuring frosted-glass elements, glowing borders, custom scrollbars, and high responsiveness.
- **🛡️ Server Failover Resilience:** Implements client-side mirror switching. If one Radio Browser API server goes offline, it seamlessly rolls over to fallback servers.

---

## 🛠️ Tech Stack & Dependencies

- **Framework:** React 18+ (scaffolded with Vite for instantaneous hot-reloading)
- **WebGL Rendering:** [three.js](https://threejs.org/) & [react-globe.gl](https://github.com/vasturiano/react-globe.gl) (for canvas visualization)
- **Audio Decoding:** [hls.js](https://github.com/video-dev/hls.js/) (for HTTP Live Streaming `.m3u8` formats)
- **Icons:** [lucide-react](https://lucide.dev/) (modern, pixel-perfect SVGs)
- **Styling:** Vanilla CSS (CSS Custom Properties, Backdrop-blur, Keyframe Animations)
- **Data Source:** [Radio Browser API](https://www.radio-browser.info/) (Free, open-source community-driven wiki of radio stations)

---

## 📂 Project Structure

```text
radio.garden/
├── netlify.toml          # Netlify build, SPA routing, and security headers
├── index.html            # Entry HTML document
├── package.json          # Dependency manifest
├── vite.config.js        # Vite compilation settings
└── src/
    ├── main.jsx          # ReactDOM mounting
    ├── App.jsx           # Main orchestrator (loads data, binds globe and sidebar states)
    ├── index.css         # Global variables, space backgrounds, and tooltip designs
    ├── components/
    │   ├── GlobeView.jsx       # 3D WebGL Globe, camera movements, and points plotting
    │   ├── Sidebar.jsx         # Search handler, city details, volume, and playback UI
    │   ├── AudioVisualizer.jsx # Bouncing simulated audio visualizer bars
    │   └── AudioVisualizer.css # Visualizer keyframes and glow effects
    ├── hooks/
    │   └── useAudioPlayer.js   # Audio and Hls.js instance playback controller hook
    └── services/
        └── radioApi.js         # API client with multi-server failover logic
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js (LTS)](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/radio.garden.git
   cd radio.garden
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to **`http://localhost:5173`** to test the app.

4. **Build the production bundle:**
   ```bash
   npm run build
   ```
   This will output optimized, minified static assets to the `dist/` directory.

---

## ☁️ Deployment

This project is fully pre-configured for deployment on **Netlify**.

The included `netlify.toml` file automatically:
- Instructs Netlify to build the app using `npm run build` and serve the static files from the `dist/` directory.
- Rewrites all incoming path requests to `/index.html` to support SPA routing.
- Configures HTTP response security headers (like frame-restrictions, sniff prevention, and a custom Content Security Policy to allow connection and media streaming from global endpoints).

To deploy:
1. Push your code to a GitHub repository.
2. Link the repository to Netlify via the Netlify Dashboard.
3. Netlify will read the configurations and deploy the site automatically.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
