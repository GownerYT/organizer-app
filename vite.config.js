import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Electron loads the packaged renderer with file://, so assets must be
  // resolved relative to dist/index.html rather than the drive root.
  base: "./",
  build: {
    outDir: "dist",
  },
});
