import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  entrypointsDir: "src/entrypoints",
  manifest: {
    name: "transf",
    description: "A browser extension for page rotation",
    version: "0.0.1",
    permissions: ["storage", "activeTab", "tabs", "scripting"],
    host_permissions: ["http://*/*", "https://*/*"],
    action: {
      default_popup: "src/entrypoints/popup/index.html",
    },
  },
  dev: {
    server: {
      host: "localhost",
      port: 3000,
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
    server: {
      host: "localhost",
      port: 3000,
      strictPort: true,
      hmr: {
        port: 3000,
      },
    },
  }),
  webExt: {
    binaries: {
      chrome: "google-chrome",
    },
  },
});
