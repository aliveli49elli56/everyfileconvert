import type { MetadataRoute } from "next"; 
import { getAllConversionSlugs } from "@/lib/config/master-registry";

// ── Constants ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://www.everyfileconvert.com";

const LOCALES = [
  "en", "tr", "de", "fr", "es", "it", "pt", "ru",
  "ja", "zh", "ar", "hi", "nl", "pl", "id", "ko", "sv", "vi",
] as const;

// Vercel / Netlify üzerinde build süresinin şişmemesi ve timeout yememesi için ideal bölme limiti
const CHUNK_SIZE = 1000;

// ── Core standalone tool pages ─────────────────────────────────────────────────
const CORE_TOOLS = [
  "/",
  "/image-converter",
  "/audio-converter",
  "/video-converter",
  "/document",
  "/pdf-tools",
  "/ebook-converter",
  "/background-remover",
  "/image-crop",
  "/image-resizer",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
] as const;

// ── Build hreflang alternates ─────────────────────────────────────────────────
function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${BASE_URL}/${locale}${path === "/" ? "" : path}`;
  }
  return { languages };
}

// ── Generate all URLs (Master Registry ile %100 Senkronize pSEO) ───────────────
function generateAllUrls(): MetadataRoute.Sitemap {
  const now = new Date();
  const allSitemapEntries: MetadataRoute.Sitemap = [];

  // Sistemindeki tüm pSEO slug'larını (ikili ve tekil formatların hepsini) master-registry'den çekiyoruz
  const dynamicSlugs = getAllConversionSlugs();

  // Her bir dil için (18 dil) döngü başlatıyoruz
  LOCALES.forEach((locale) => {
    
    // 1. O dile ait Core Sayfalar (Örn: /tr, /tr/image-converter)
    CORE_TOOLS.forEach((path) => {
      const fullPath = path === "/" ? `/${locale}` : `/${locale}${path}`;
      allSitemapEntries.push({
        url: `${BASE_URL}${fullPath}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: path === "/" ? 1.0 : 0.9,
        alternates: buildAlternates(path),
      });
    });

    // 2. O dile ait pSEO Sayfaları (Örn: /tr/png-to-jpg veya /tr/png)
    dynamicSlugs.forEach((slug) => {
      const fullPath = `/${locale}/${slug}`;
      allSitemapEntries.push({
        url: `${BASE_URL}${fullPath}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: buildAlternates(`/${slug}`),
      });
    });
  });

  return allSitemapEntries;
}

let cachedUrls: MetadataRoute.Sitemap | null = null;
function getAllUrls(): MetadataRoute.Sitemap {
  if (!cachedUrls) cachedUrls = generateAllUrls();
  return cachedUrls;
}

// ── Sitemap Pagination (Dinamik Bölme) ────────────────────────────────────────
export async function generateSitemaps(): Promise<{ id: number }[]> {
  const totalUrls = getAllUrls().length;
  const count = Math.ceil(totalUrls / CHUNK_SIZE);
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const allUrls = getAllUrls();
  const start = id * CHUNK_SIZE;
  const end = Math.min(start + CHUNK_SIZE, allUrls.length);
  return allUrls.slice(start, end);
}
