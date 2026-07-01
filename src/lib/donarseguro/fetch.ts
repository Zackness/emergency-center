import type {
  DonarSeguroCategory,
  DonarSeguroOrganization,
  DonarSeguroSnapshot,
} from "./types";
import { DONARSEGURO_SOURCE_URL } from "./types";

const FETCH_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent":
    "Mozilla/5.0 (compatible; EmergencyCenter/1.0; +https://startupven.com) AppleWebKit/537.36",
};

const SKIP_SLUGS = new Set(["dentro", "fuera", "seguridad", "seguridad", "confianza"]);

const CONCURRENCY = 6;

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTagContent(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1]?.trim() ? decodeHtml(match[1].trim()) : null;
}

function parseJsonLd(html: string): {
  name?: string;
  description?: string;
  sameAs?: string[];
} | null {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as {
      name?: string;
      description?: string;
      sameAs?: string[];
    };
  } catch {
    return null;
  }
}

function pickDonateUrl(html: string, sameAs: string[] | undefined): string | null {
  const cta = html.match(/class="donate__cta"[^>]+href="([^"]+)"/i);
  if (cta?.[1]) return cta[1];

  const donateLike = (sameAs ?? []).find(
    (url) =>
      /donate|donar|dona\.|give|gofundme|globalgiving|paypal/i.test(url) &&
      !url.includes("donarseguro.com")
  );
  return donateLike ?? sameAs?.[0] ?? null;
}

function parseOrgPage(
  html: string,
  url: string,
  category: DonarSeguroCategory
): DonarSeguroOrganization | null {
  const slugMatch = url.match(/\/(dinero|voluntariado|insumos)\/([^/?#]+)/i);
  if (!slugMatch) return null;

  const slug = slugMatch[2];
  if (SKIP_SLUGS.has(slug) || slug.endsWith("/confianza")) return null;

  const jsonLd = parseJsonLd(html);
  const name =
    extractTagContent(html, /<h1 class="ficha__name"[^>]*>([\s\S]*?)<\/h1>/i) ??
    jsonLd?.name ??
    slug;
  const verdict =
    extractTagContent(html, /<p class="ficha__verdict"[^>]*>([\s\S]*?)<\/p>/i) ??
    jsonLd?.description ??
    null;
  const orgType = extractTagContent(html, /<p class="label"[^>]*>([\s\S]*?)<\/p>/i);
  const themesRaw = extractTagContent(
    html,
    /<p class="ficha__themes[^"]*"[^>]*>([\s\S]*?)<\/p>/i
  );
  const themes = themesRaw
    ? themesRaw
        .split("·")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const sameAs = jsonLd?.sameAs ?? [];
  const donateUrl = pickDonateUrl(html, sameAs);
  const verificationUrls = sameAs.filter(
    (link) => link !== donateUrl && !link.includes("donarseguro.com")
  );

  return {
    slug,
    category,
    name: name.replace(/\s+/g, " ").trim(),
    org_type: orgType,
    verdict,
    themes,
    donate_url: donateUrl,
    verification_urls: verificationUrls,
    source_url: url,
    locale: url.includes("/en/") ? "en" : "es",
  };
}

export async function fetchDonarSeguroSitemapUrls(): Promise<string[]> {
  const res = await fetch(`${DONARSEGURO_SOURCE_URL}/sitemap-0.xml`, {
    headers: FETCH_HEADERS,
  });
  if (!res.ok) throw new Error(`DonarSeguro sitemap: HTTP ${res.status}`);
  const xml = await res.text();

  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urls.filter((url) => {
    if (!url.startsWith(DONARSEGURO_SOURCE_URL)) return false;
    if (url.includes("/en/")) return false;
    if (url.includes("/confianza") || url.includes("/trust")) return false;
    return /\/(dinero|voluntariado|insumos)\/[^/]+$/.test(url);
  });
}

async function fetchOrg(url: string): Promise<DonarSeguroOrganization | null> {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) return null;
  const html = await res.text();
  const categoryMatch = url.match(/\/(dinero|voluntariado|insumos)\//);
  const category = (categoryMatch?.[1] ?? "dinero") as DonarSeguroCategory;
  return parseOrgPage(html, url, category);
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

export async function fetchDonarSeguroSnapshot(): Promise<DonarSeguroSnapshot> {
  const urls = await fetchDonarSeguroSitemapUrls();
  const orgs = (
    await mapPool(urls, CONCURRENCY, async (url) => {
      try {
        return await fetchOrg(url);
      } catch {
        return null;
      }
    })
  ).filter((org): org is DonarSeguroOrganization => org !== null);

  const bySlug = new Map<string, DonarSeguroOrganization>();
  for (const org of orgs) {
    const key = `${org.category}:${org.slug}`;
    if (!bySlug.has(key)) bySlug.set(key, org);
  }

  const organizations = [...bySlug.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "es")
  );

  return {
    source: DONARSEGURO_SOURCE_URL,
    fetched_at: new Date().toISOString(),
    count: organizations.length,
    organizations,
  };
}

export async function loadDonarSeguroSnapshotFromFile(
  raw: string
): Promise<DonarSeguroSnapshot> {
  return JSON.parse(raw) as DonarSeguroSnapshot;
}
