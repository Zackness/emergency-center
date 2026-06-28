import { readFileSync } from "node:fs";
for (const f of ["en.json", "es.json", "pt.json", "it.json"]) {
  try {
    JSON.parse(readFileSync(`src/i18n/locales/${f}`, "utf8"));
    console.log(`${f}: OK`);
  } catch (e) {
    console.error(`${f}: ${e.message}`);
  }
}
