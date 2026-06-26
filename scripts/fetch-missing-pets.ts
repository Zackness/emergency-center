#!/usr/bin/env npx tsx
/**
 * Descarga reportes de mascotas desde HuellasCAN /terremoto.
 *
 * Uso: npm run fetch:pets
 */
import { writeFile } from "node:fs/promises";
import {
  extractMaxPage,
  fetchHuellascanHtml,
  parseHuellascanPage,
} from "../src/lib/missing-pets/huellascan";

const OUTPUT = new URL("../src/data/missing-pets.json", import.meta.url);
const DELAY_MS = 150;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Descargando mascotas desde HuellasCAN…");
  const firstHtml = await fetchHuellascanHtml(1);
  const maxPage = extractMaxPage(firstHtml);
  console.log(`Páginas detectadas: ${maxPage}`);

  const byId = new Map<string, ReturnType<typeof parseHuellascanPage>[number]>();

  const ingest = (html: string) => {
    for (const item of parseHuellascanPage(html)) {
      byId.set(item.externalId, item);
    }
  };

  ingest(firstHtml);

  for (let page = 2; page <= maxPage; page++) {
    if (page % 10 === 0) console.log(`  página ${page}/${maxPage}…`);
    await sleep(DELAY_MS);
    const html = await fetchHuellascanHtml(page);
    ingest(html);
  }

  const items = [...byId.values()].sort((a, b) => Number(b.externalId) - Number(a.externalId));
  const payload = {
    source: "https://www.huellascan.com/terremoto",
    fetched_at: new Date().toISOString(),
    count: items.length,
    items,
  };

  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Guardadas ${items.length} mascotas en src/data/missing-pets.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
