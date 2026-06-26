import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://startupven.com",
  output: "static",
  adapter: node({ mode: "standalone" }),
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  vite: {
    ssr: {
      noExternal: ["react-leaflet"],
      external: ["@prisma/client", ".prisma/client"],
    },
  },
});
