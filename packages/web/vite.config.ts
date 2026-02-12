import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import TanStackRouterVite from "@tanstack/router-plugin/vite";

import tailwindVite from "@tailwindcss/vite";

function csvEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

export default defineConfig({
  server: {
    allowedHosts: Array.from(
      new Set([
        ...csvEnv(process.env.VITE_ALLOWED_HOSTS),
        ...csvEnv(process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS),
        process.env.RAILWAY_PUBLIC_DOMAIN ?? "",
      ]),
    ).filter(Boolean),
  },
  plugins: [
    tailwindVite(),
    TanStackRouterVite({target: "react", autoCodeSplitting: true}),
    react(),
  ],
});
