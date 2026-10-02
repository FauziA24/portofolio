import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["6954-103-165-40-253.ngrok-free.app"]
  },
  build: {
    // Three.js is isolated in scene-vendor; warn again if it grows past this budget.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three") || id.includes("node_modules/@react-three")) return "scene-vendor";
          if (id.includes("node_modules/framer-motion")) return "motion-vendor";
        }
      }
    }
  }
});
