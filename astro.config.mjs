import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

const site =
  process.env.PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://startupven.com");

const noIndexPrefixes = [
  "/admin",
  "/centros-ayuda/panel",
  "/centros-ayuda/acceso",
  "/centros-ayuda/restablecer-contrasena",
  "/api/",
];

function sitemapFilter(page) {
  try {
    const pathname = new URL(page).pathname.replace(/\/$/, "") || "/";
    return !noIndexPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  } catch {
    return true;
  }
}

export default defineConfig({
  site,
  output: "static",
  adapter: vercel(),
  trailingSlash: "never",
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      i18n: {
        defaultLocale: "es",
        locales: {
          es: "es-VE",
          en: "en-US",
          pt: "pt-BR",
          it: "it-IT",
        },
      },
      filter: (page) => sitemapFilter(page),
    }),
  ],
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
