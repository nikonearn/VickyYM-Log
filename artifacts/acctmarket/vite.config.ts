import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss"; // keep if you use Tailwind

// Minimal config that works on Vercel (removes Replit-specific parts)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // keep this line if your project uses Tailwind
    // Removed: runtimeErrorOverlay, cartographer, devBanner — they cause the BASE_PATH error
  ],

  // Optional: helps with routing if you use React Router
  build: {
    outDir: "dist",
  },

  // Safe base path (Vercel usually handles this)
  base: "./",
});
