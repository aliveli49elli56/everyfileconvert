import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';
import SidebarAds from '@/components/ads/sidebar-ads';
import LeaderboardAd from '@/components/ads/leaderboard-ad';
import { locales, defaultLocale, getDictionary, isRTL, getHreflangLinks } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const meta = dict.meta as Record<string, string>;
  const hreflangs = getHreflangLinks('');

  return {
    title: meta?.homeTitle || 'EveryFileConvert - Free Online File Converter',
    description: meta?.homeDesc || 'Convert any file format instantly in your browser.',
    keywords: 'file converter, video converter, audio converter, image converter, pdf converter, free converter, online converter',
    authors: [{ name: 'EveryFileConvert' }],
    creator: 'EveryFileConvert',
    publisher: 'EveryFileConvert',
    robots: 'index, follow',
    openGraph: {
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ar' ? 'ar_SA' : `${locale}_${locale.toUpperCase()}`,
      url: `https://everyfileconvert.com/${locale}`,
      siteName: 'EveryFileConvert',
      title: meta?.homeTitle || 'EveryFileConvert - Free Online File Converter',
      description: meta?.homeDesc || 'Convert any file format instantly in your browser.',
      images: [{
        url: 'https://images.pexels.com/photo/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1200',
        width: 1200,
        height: 630,
        alt: 'EveryFileConvert - Free Online File Converter',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta?.homeTitle || 'EveryFileConvert - Free Online File Converter',
      description: meta?.homeDesc || 'Convert any file format instantly in your browser.',
      images: ['https://images.pexels.com/photo/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    },
    alternates: {
      canonical: `https://everyfileconvert.com/${locale}`,
      languages: Object.fromEntries(hreflangs.map(({ locale: l, href }) => [l, href])),
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const rtl = isRTL(locale as Locale);
  const hreflangs = getHreflangLinks('');

  return (
    <html lang={locale} dir={rtl ? 'rtl' : 'ltr'}>
      <head>
        {hreflangs.map(({ locale: l, href }) => (
          <link key={l} rel="alternate" hrefLang={l} href={href} />
        ))}
        <link rel="alternate" hrefLang="x-default" href="https://everyfileconvert.com/en" />
      </head>
      <body className="min-h-screen flex flex-col xl:px-44">
        <SidebarAds />
        <Navbar locale={locale as Locale} />
        <div className="flex-1">
          <LeaderboardAd />
          {children}
        </div>
        <Footer locale={locale as Locale} />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
