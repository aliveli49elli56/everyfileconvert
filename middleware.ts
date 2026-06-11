import { NextRequest, NextResponse } from "next/server";

export const locales = ["en", "tr", "de", "fr", "es", "it", "pt", "ru", "ja", "zh", "ar", "hi", "nl", "pl", "id", "ko", "sv", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const localeLanguageMap: Record<string, Locale> = {
  en: "en",
  "en-US": "en",
  "en-GB": "en",
  "en-AU": "en",
  "en-CA": "en",
  tr: "tr",
  "tr-TR": "tr",
  de: "de",
  "de-DE": "de",
  "de-AT": "de",
  "de-CH": "de",
  fr: "fr",
  "fr-FR": "fr",
  "fr-BE": "fr",
  "fr-CA": "fr",
  es: "es",
  "es-ES": "es",
  "es-MX": "es",
  "es-AR": "es",
  it: "it",
  "it-IT": "it",
  pt: "pt",
  "pt-BR": "pt",
  "pt-PT": "pt",
  ru: "ru",
  "ru-RU": "ru",
  ja: "ja",
  "ja-JP": "ja",
  zh: "zh",
  "zh-CN": "zh",
  "zh-TW": "zh",
  "zh-HK": "zh",
  ar: "ar",
  "ar-SA": "ar",
  "ar-AE": "ar",
  hi: "hi",
  "hi-IN": "hi",
  nl: "nl",
  "nl-NL": "nl",
  pl: "pl",
  "pl-PL": "pl",
  id: "id",
  "id-ID": "id",
  ko: "ko",
  "ko-KR": "ko",
  sv: "sv",
  "sv-SE": "sv",
  vi: "vi",
  "vi-VN": "vi",
};

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const tags = acceptLanguage
    .split(",")
    .map((tag) => {
      const [lang, q] = tag.trim().split(";q=");
      return { lang: lang.trim(), q: q ? parseFloat(q) : 1.0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of tags) {
    // Exact match
    if (localeLanguageMap[lang]) return localeLanguageMap[lang];
    // Language-only match (e.g. "en" from "en-US")
    const base = lang.split("-")[0];
    if (localeLanguageMap[base]) return localeLanguageMap[base];
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, _next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if the path already starts with a locale prefix
  const segments = pathname.split("/");
  const firstSegment = segments[1];
  if (locales.includes(firstSegment as Locale)) {
    // Already has locale prefix, continue
    return NextResponse.next();
  }

  // Determine locale from Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language");
  const locale = getLocaleFromAcceptLanguage(acceptLanguage);

  // Redirect to locale-prefixed URL
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, { status: 307 });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
