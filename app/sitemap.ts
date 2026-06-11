export const dynamic = 'force-dynamic';
import type { MetadataRoute } from "next";

// ── Constants ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://www.everyfileconvert.com";

const LOCALES = [
  "en", "tr", "de", "fr", "es", "it", "pt", "ru",
  "ja", "zh", "ar", "hi", "nl", "pl", "id", "ko", "sv", "vi",
] as const;

// Vercel'in şişmemesi ve 404 vermemesi için limiti küçültüyoruz.
// Bu sayede Next.js ortalama 9 adet ayrı sitemap oluşturacak.
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

// ── Conversion compatibility matrix ───────────────────────────────────────────
const CONVERSIONS: Record<string, string[]> = {
  png:  ["jpg", "jpeg", "webp", "gif", "bmp", "tiff", "ico", "svg", "pdf"],
  jpg:  ["png", "jpeg", "webp", "gif", "bmp", "tiff", "ico", "pdf"],
  jpeg: ["png", "jpg", "webp", "gif", "bmp", "tiff", "ico", "pdf"],
  webp: ["png", "jpg", "jpeg", "gif", "bmp", "tiff", "pdf"],
  gif:  ["png", "jpg", "jpeg", "webp", "bmp", "tiff", "pdf"],
  bmp:  ["png", "jpg", "jpeg", "webp", "gif", "tiff", "ico", "pdf"],
  tiff: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "pdf"],
  heic: ["png", "jpg", "jpeg", "webp", "tiff", "pdf"],
  heif: ["png", "jpg", "jpeg", "webp", "tiff", "pdf"],
  raw:  ["png", "jpg", "jpeg", "webp", "tiff", "pdf"],
  cr2:  ["png", "jpg", "jpeg", "webp", "tiff", "pdf"],
  svg:  ["png", "jpg", "jpeg", "webp", "bmp", "ico", "pdf"],
  ai:   ["png", "jpg", "jpeg", "webp", "svg", "eps", "pdf"],
  eps:  ["png", "jpg", "jpeg", "webp", "svg", "ai", "pdf"],
  psd:  ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "svg", "pdf"],
  ico:  ["png", "jpg", "jpeg", "bmp"],
  dwg:  ["dxf", "pdf", "svg"],
  dxf:  ["dwg", "pdf", "svg"],
  step: ["stl", "obj", "fbx"],
  stl:  ["obj", "fbx", "step"],
  obj:  ["stl", "fbx", "step"],
  fbx:  ["obj", "stl"],
  mp3:  ["wav", "ogg", "aac", "m4a"],
  wav:  ["mp3", "ogg", "aac", "m4a"],
  ogg:  ["mp3", "wav", "aac", "m4a"],
  aac:  ["mp3", "wav", "ogg", "m4a"],
  m4a:  ["mp3", "wav", "ogg", "aac"],
  mp4:  ["webm", "avi", "mov", "mkv", "mp3", "wav", "ogg", "aac", "m4a"],
  webm: ["mp4", "avi", "mov", "mkv", "mp3", "wav", "ogg", "aac"],
  avi:  ["mp4", "webm", "mov", "mkv", "mp3", "wav"],
  mov:  ["mp4", "webm", "avi", "mkv", "mp3", "wav", "aac"],
  mkv:  ["mp4", "webm", "avi", "mov", "mp3", "wav", "ogg"],
  pdf:  ["jpg", "png", "webp", "svg", "docx", "dwg", "dxf"],
  docx: ["pdf"],
  xlsx: ["pdf"],
  epub: ["pdf", "mobi"],
  mobi: ["epub", "pdf"],
};

// ── Build hreflang alternates ─────────────────────────────────────────────────
function buildAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${BASE_URL}/${locale}${path === "/" ? "" : path}`;
  }
  return { languages };
}

// ── Generate all URLs ─────────────────────────────────────────────────────────
function generateAllUrls(): MetadataRoute.Sitemap {
  const now = new Date();

  const coreUrls: MetadataRoute.Sitemap = CORE_TOOLS.map((path) => ({
    url: `${BASE_URL}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1.0 : 0.9,
    alternates: buildAlternates(path),
  }));

  const conversionPaths: string[] = [];
  Object.keys(CONVERSIONS).forEach((source) => {
    CONVERSIONS[source].forEach((target) => {
      conversionPaths.push(`/${source}-to-${target}`);
    });
  });

  const conversionUrls: MetadataRoute.Sitemap = conversionPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: buildAlternates(path),
  }));

  return [...coreUrls, ...conversionUrls];
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
