import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  parseConversionSlug,
  getAllConversionSlugs,
  getDescriptionVariant,
  getRelatedConversions,
  getAvailableOutputFormats,
} from "@/lib/config/master-registry";
import { getDictionary, getHreflangLinks, pickVariant } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import ConversionPageClient from "./ConversionPageClient";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const parsed = parseConversionSlug(slug);
  if (!parsed) return {};

  const dict = await getDictionary(locale as Locale);
  const meta = dict.meta as Record<string, string>;
  const converterTitles = (dict.converters as Record<string, string[]>)?.titles || [];
  const converterFeatures = (dict.converters as Record<string, string[]>)?.features || [];

  const inputUpper = parsed.inputFormat.toUpperCase();
  const hreflangs = getHreflangLinks(`/${slug}`);

  if (parsed.isSingleFormat) {
    const titleTemplate = meta?.singleTitle || "{IN} Converter - Convert to Multiple Formats Online | EveryFileConvert";
    const descTemplate = meta?.singleDesc || "Best online {inputName} converter. 100% private, secure and free.";

    const titleVariant = pickVariant(converterTitles, slug) || "Converter";
    const featureVariant = pickVariant(converterFeatures, slug) || "Free & Online";

    const title = titleTemplate
      .replace("{IN}", inputUpper)
      .replace("{inputName}", parsed.inputName)
      .replace("{converterTitle}", titleVariant)
      .replace("{feature}", featureVariant);
    const description = descTemplate
      .replace("{IN}", inputUpper)
      .replace("{inputName}", parsed.inputName);

    return {
      title,
      description,
      keywords: `${inputUpper} converter, convert ${inputUpper}, ${inputUpper} online converter`,
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://everyfileconvert.com/${locale}/${slug}`,
      },
      twitter: { card: "summary_large_image", title, description },
      alternates: {
        canonical: `https://everyfileconvert.com/${locale}/${slug}`,
        languages: Object.fromEntries(hreflangs.map(({ locale: l, href }) => [l, href])),
      },
    };
  }

  const outputUpper = parsed.outputFormat!.toUpperCase();
  const variant = getDescriptionVariant(slug);

  const titleVariant = pickVariant(converterTitles, slug) || "Converter";
  const featureVariant = pickVariant(converterFeatures, slug + "f") || "Free & Online";

  const descKey = `conversionDesc${variant + 1}` as keyof typeof meta;
  const descTemplate = meta?.[descKey] || meta?.conversionDesc1 || "Free online {IN} to {OUT} converter.";
  const titleTemplate = meta?.conversionTitle || "Convert {IN} to {OUT} Online - Free & Secure | EveryFileConvert";

  const title = titleTemplate
    .replace(/{IN}/g, inputUpper)
    .replace(/{OUT}/g, outputUpper)
    .replace("{converterTitle}", titleVariant)
    .replace("{feature}", featureVariant);

  const description = descTemplate
    .replace(/{IN}/g, inputUpper)
    .replace(/{OUT}/g, outputUpper)
    .replace(/{inputName}/g, parsed.inputName)
    .replace(/{outputName}/g, parsed.outputName || "");

  return {
    title,
    description,
    keywords: `${inputUpper} to ${outputUpper}, convert ${inputUpper} to ${outputUpper} online, free ${inputUpper} to ${outputUpper} converter`,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://everyfileconvert.com/${locale}/${slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: {
      canonical: `https://everyfileconvert.com/${locale}/${slug}`,
      languages: Object.fromEntries(hreflangs.map(({ locale: l, href }) => [l, href])),
    },
  };
}

export async function generateStaticParams() {
  const slugs = getAllConversionSlugs();
  const locales = ["en", "tr", "de", "fr", "es", "it", "pt", "ru", "ja", "zh", "ar", "hi", "nl", "pl", "id", "ko", "sv", "vi"];
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function ConversionPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const parsed = parseConversionSlug(slug);

  if (!parsed) notFound();

  const dict = await getDictionary(locale as Locale);

  const relatedConversions = parsed.isSingleFormat
    ? []
    : getRelatedConversions(parsed.inputFormat, parsed.outputFormat, 6);

  const availableOutputs = parsed.isSingleFormat
    ? getAvailableOutputFormats(parsed.inputFormat)
    : [];

  const IN = parsed.inputFormat.toUpperCase();
  const OUT = parsed.outputFormat ? parsed.outputFormat.toUpperCase() : null;

  const jsonLd = parsed.isSingleFormat
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `https://everyfileconvert.com/${locale}/${slug}`,
            url: `https://everyfileconvert.com/${locale}/${slug}`,
            name: `${IN} Converter - Convert to Multiple Formats Online`,
            inLanguage: locale,
          },
          {
            "@type": "SoftwareApplication",
            name: `${IN} Converter`,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            url: `https://everyfileconvert.com/${locale}/${slug}`,
          },
        ],
      }
    : {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `https://everyfileconvert.com/${locale}/${slug}`,
            url: `https://everyfileconvert.com/${locale}/${slug}`,
            name: `Convert ${IN} to ${OUT} Online - Free & Secure`,
            inLanguage: locale,
          },
          {
            "@type": "SoftwareApplication",
            name: `${IN} to ${OUT} Online Converter`,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            url: `https://everyfileconvert.com/${locale}/${slug}`,
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: (dict.faq as Record<string, string>)?.q1?.replace(/{IN}/g, IN).replace(/{OUT}/g, OUT || "") || `How do I convert ${IN} to ${OUT}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: (dict.faq as Record<string, string>)?.a1?.replace(/{IN}/g, IN).replace(/{OUT}/g, OUT || "").replace(/{inputName}/g, parsed.inputName).replace(/{outputName}/g, parsed.outputName || "") || "",
                },
              },
            ],
          },
        ],
      };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ConversionPageClient
        parsed={parsed}
        slug={slug}
        locale={locale as Locale}
        dict={dict}
        relatedConversions={parsed.isSingleFormat ? [] : relatedConversions}
        availableOutputFormats={parsed.isSingleFormat ? availableOutputs : []}
      />
    </>
  );
}
