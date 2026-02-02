import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import TanStackRouterVite from "@tanstack/router-plugin/vite";

import tailwindVite from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite({target: "react", autoCodeSplitting: true}),
    react(),
    tailwindVite(),
  ],

  server: {
    port: 5173,
  },
});
