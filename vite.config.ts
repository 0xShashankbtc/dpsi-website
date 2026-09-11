import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import { sentryVitePlugin } from "@sentry/vite-plugin"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devServer({ entry: "server/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.ico",
        "favicon.png",
        "apple-touch-icon.png",
        "images/**/*",
      ],
      manifest: {
        name: "DPS Indirapuram",
        short_name: "DPSI",
        description: "Delhi Public School Indirapuram - Premier CBSE School in Ghaziabad",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "any",
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
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff,woff2,ttf}"],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    }),
    // Sentry source maps — uploads to Sentry at build time for readable stack traces
    // Only active when SENTRY_AUTH_TOKEN is set (skip in dev)
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: "orangefuturetech",
            project: "javascript-react-router",
            authToken: process.env.SENTRY_AUTH_TOKEN,
          }),
        ]
      : []),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
      "next/link": path.resolve(__dirname, "./src/lib/next-link-shim.tsx"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: "hidden", // Hidden sourcemaps: uploaded to Sentry, not served publicly
    rollupOptions: {
      output: {
        manualChunks: {
          spline: ["@splinetool/react-spline", "@splinetool/runtime"],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          charts: ["recharts"],
          icons: ["lucide-react"],
          vendor: ["react", "react-dom", "react-router", "framer-motion"],
        },
      },
    },
  },
});
