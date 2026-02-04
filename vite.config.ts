import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "favicon.ico", "og-image.jpg", "hero-bg.jpg"],
      manifest: {
        name: "TryRamadan.app",
        short_name: "TryRamadan",
        description: "Fast like a Muslim for the holy month of Ramadan. Prayer times, suhoor & iftar, cultural education, progressive fasting.",
        theme_color: "#1a3d2e",
        background_color: "#f8f6f1",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/favicon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        categories: ["health", "lifestyle", "education"],
        shortcuts: [
          {
            name: "Fasting Timer",
            short_name: "Timer",
            description: "Check your fasting countdown",
            url: "/#programs",
            icons: [{ src: "/favicon.png", sizes: "192x192" }]
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "prayer-times-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "nominatim-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 }, // 24h
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/ipapi\.co\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "ipapi-cache",
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 }, // 24h
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/timeapi\.io\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "timeapi-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.quran\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "api-quran-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
