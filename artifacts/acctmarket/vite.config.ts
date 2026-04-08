import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Clean config for Vercel - no Replit-specific stuff
export default defineConfig({
  plugins: [react()],

  // For static hosting on Vercel
  base: "./",

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
