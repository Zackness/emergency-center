import {
  extractMaxPage,
  fetchHuellascanHtml,
  parseHuellascanPage,
} from "./huellascan";
import { inferPetSpecies } from "./species";

const PAGE_BATCH_SIZE = 8;
const DELAY_MS = 150;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMissingPetsSnapshot() {
  const firstHtml = await fetchHuellascanHtml(1);
  const maxPage = extractMaxPage(firstHtml);
  const byId = new Map<string, ReturnType<typeof parseHuellascanPage>[number]>();

  const ingest = (html: string) => {
    for (const item of parseHuellascanPage(html)) {
      byId.set(item.externalId, item);
    }
  };

  ingest(firstHtml);

  for (let page = 2; page <= maxPage; page++) {
    if (page % 10 === 0) {
      await sleep(DELAY_MS);
    }
    const html = await fetchHuellascanHtml(page);
    ingest(html);
  }

  const items = [...byId.values()]
    .map((item) => ({
      ...item,
      pet_type: inferPetSpecies(item),
    }))
    .sort((a, b) => Number(b.externalId) - Number(a.externalId));

  return {
    source: "https://www.huellascan.com/terremoto",
    fetched_at: new Date().toISOString(),
    count: items.length,
    items,
  };
}
