import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  let pwaPlugin: unknown = null;
  try {
    const { VitePWA } = await import("vite-plugin-pwa");
    pwaPlugin = VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "placeholder.svg"],
      manifest: {
        name: "Duoos",
        short_name: "Duoos",
        start_url: "/",
        display: "standalone",
        background_color: "#0a1717",
        theme_color: "#0a1717",
        icons: [
          { src: "/placeholder.svg", sizes: "any", type: "image/svg+xml" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"]
      }
    });
  } catch {
    pwaPlugin = null;
  }
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      pwaPlugin,
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
