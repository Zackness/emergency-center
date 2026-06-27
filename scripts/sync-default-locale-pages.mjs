#!/usr/bin/env node
/**
 * Generates Spanish (default) pages at src/pages/ from src/pages/[lang]/ templates.
 * Also updates [lang] pages to only build en, pt, it.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LANG_DIR = path.join(ROOT, "src/pages/[lang]");
const PAGES_DIR = path.join(ROOT, "src/pages");

const STATIC_PATHS_BLOCK =
  /export function getStaticPaths\(\) \{[\s\S]*?\}\n\n?/;

const LANG_RESOLUTION_BLOCK =
  /const \{ lang \} = Astro\.params;\nif \(!isValidLocale\(lang\)\) return Astro\.redirect\([^)]+\);\n\nconst locale = lang as Locale;\n/;

const LOCALE_ES = 'const locale = "es" satisfies Locale;\n';

function transformForSpanish(content) {
  let out = content.replace(STATIC_PATHS_BLOCK, "");
  out = out.replace(LANG_RESOLUTION_BLOCK, LOCALE_ES);
  out = out.replace(
    /import \{ isValidLocale, type Locale \}/,
    "import type { Locale }"
  );
  return out;
}

function transformForSecondary(content, spanishRedirectPath) {
  let out = content.replace(
    STATIC_PATHS_BLOCK,
    `export function getStaticPaths() {
  return secondaryLocaleStaticPaths();
}

`
  );
  out = out.replace(
    /import \{ isValidLocale, type Locale \}/,
    "import { isValidLocale, secondaryLocaleStaticPaths, type Locale }"
  );
  out = out.replace(
    LANG_RESOLUTION_BLOCK,
    `const { lang } = Astro.params;
if (!isValidLocale(lang) || lang === "es") return Astro.redirect("${spanishRedirectPath}");

const locale = lang as Locale;
`
  );
  return out;
}

function spanishPathFromRel(relPath) {
  if (!relPath || relPath === "index.astro") return "/";
  const withoutExt = relPath.replace(/\.astro$/, "");
  return `/${withoutExt}`;
}

function walk(dir, rel = "") {
  for (const entry of fs.readdirSync(dir)) {
    const relPath = rel ? `${rel}/${entry}` : entry;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walk(full, relPath);
      continue;
    }
    if (!entry.endsWith(".astro")) continue;

    const content = fs.readFileSync(full, "utf8");
    const spanishRedirect = spanishPathFromRel(relPath);

    const spanishDest = path.join(PAGES_DIR, relPath);
    fs.mkdirSync(path.dirname(spanishDest), { recursive: true });
    fs.writeFileSync(spanishDest, transformForSpanish(content));

    fs.writeFileSync(
      full,
      transformForSecondary(content, spanishRedirect)
    );

    console.log(`Synced ${relPath}`);
  }
}

walk(LANG_DIR);
console.log("Done.");
