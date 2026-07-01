#!/usr/bin/env npx tsx
import { writeFile } from "node:fs/promises";
import { fetchDonarSeguroSnapshot } from "@/lib/donarseguro/fetch";

const OUTPUT = new URL("../src/data/donarseguro.json", import.meta.url);

async function main() {
  console.log("Scraping donarseguro.com (sitemap + fichas)…");
  const snapshot = await fetchDonarSeguroSnapshot();
  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `Guardado → src/data/donarseguro.json | ${snapshot.count} organizaciones` +
      ` (dinero: ${snapshot.organizations.filter((o) => o.category === "dinero").length},` +
      ` voluntariado: ${snapshot.organizations.filter((o) => o.category === "voluntariado").length},` +
      ` insumos: ${snapshot.organizations.filter((o) => o.category === "insumos").length})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
