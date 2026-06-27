import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

const site =
  process.env.PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://startupven.com");

export default defineConfig({
  site,
  output: "static",
  adapter: vercel(),
  trailingSlash: "never",
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  redirects: {
    "/es": "/",
    "/es/:path*": "/:path*",
  },
  vite: {
    ssr: {
      noExternal: ["react-leaflet"],
      external: ["@prisma/client", ".prisma/client", "ws"],
    },
  },
});
