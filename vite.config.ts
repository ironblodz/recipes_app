import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Receitas da Joana",
        short_name: "Receitas",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ef4444",
        icons: [
          {
            src: "./vite.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "./vite.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  server: {
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://*.firebasestorage.googleapis.com; font-src 'self' data:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;",
    },
  },
});
