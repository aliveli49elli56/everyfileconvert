import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Shield, Zap, Lock } from "lucide-react";
import UniversalDropzone from "@/components/UniversalDropzone";
import { getDictionary, getHreflangLinks } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const meta = dict.meta as Record<string, string>;
  const hreflangs = getHreflangLinks("/ebook-converter");

  return {
    title: meta?.ebookConverterTitle || "Free Online E-Book Converter — EPUB, MOBI, AZW3, PDF | EveryFileConvert",
    description: meta?.ebookConverterDesc || "Convert eBooks online for free. Transform EPUB, MOBI, AZW3 to PDF, TXT, HTML and more directly in your browser. 100% private.",
    keywords: "ebook converter online, epub to pdf online, mobi to epub online, azw3 converter online, kindle converter online, free ebook converter",
    openGraph: {
      title: meta?.ebookConverterTitle || "Free Online E-Book Converter",
      description: meta?.ebookConverterDesc || "Convert EPUB, MOBI, AZW3 eBooks online for free.",
      type: "website",
      url: `https://everyfileconvert.com/${locale}/ebook-converter`,
    },
    twitter: { card: "summary_large_image", title: meta?.ebookConverterTitle, description: meta?.ebookConverterDesc },
    alternates: {
      canonical: `https://everyfileconvert.com/${locale}/ebook-converter`,
      languages: Object.fromEntries(hreflangs.map(({ locale: l, href }) => [l, href])),
    },
  };
}

export async function generateStaticParams() {
  const locales = ["en","tr","de","fr","es","it","pt","ru","ja","zh","ar","hi","nl","pl","id","ko","sv","vi"];
  return locales.map((locale) => ({ locale }));
}

const formats = [
  { from: "EPUB", to: "PDF" },
  { from: "MOBI", to: "EPUB" },
  { from: "AZW3", to: "PDF" },
  { from: "EPUB", to: "TXT" },
  { from: "PDF", to: "EPUB" },
];

const trustFeatures = [
  { icon: Shield, label: "100% Private", desc: "Files never leave your device" },
  { icon: Zap, label: "Instant", desc: "No upload wait time" },
  { icon: Lock, label: "No Account", desc: "No sign-up required" },
];

export default async function LocaleEbookConverterPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="py-14 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Badge variant="secondary" className="mb-4 px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
              E-Book Converter
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight flex items-center justify-center gap-3">
              <BookOpen className="h-10 w-10 text-blue-500" />
              E-Book Converter
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Convert EPUB, MOBI, AZW3, PDF and more eBook formats online for free. 100% private — files never leave your device.
            </p>
          </div>

          <UniversalDropzone mode="all" allowedTypes={['.epub', '.mobi', '.azw3', '.pdf', '.txt', '.html']} />

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {trustFeatures.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-sm text-slate-500">
                <f.icon className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-slate-700">{f.label}</span>
                <span className="hidden sm:inline text-slate-400">— {f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold text-slate-700 text-center mb-6">Popular E-Book Conversions</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {formats.map((conv) => (
              <Link key={`${conv.from}-${conv.to}`} href={`/${locale}/${conv.from.toLowerCase()}-to-${conv.to.toLowerCase()}`}>
                <div className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm">
                  <span className="font-mono font-semibold text-slate-600 group-hover:text-blue-700">.{conv.from}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className="font-mono font-semibold text-slate-600 group-hover:text-blue-700">.{conv.to}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
