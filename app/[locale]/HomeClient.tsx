"use client";

import { useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileVideo,
  FileAudio,
  Image,
  FileText,
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Maximize2,
  Eraser,
  BookOpen,
  Film,
  Music,
  FileType,
  FileImage,
} from "lucide-react";
import UniversalDropzone from "@/components/UniversalDropzone";
import {
  CONVERSION_MATRIX,
  FORMAT_REGISTRY,
} from "@/lib/config/master-registry";
import type { Locale } from "@/lib/i18n/config";

type DictType = Record<string, unknown>;

export default function HomeClient({ dict, locale }: { dict: DictType; locale: Locale }) {
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const scrollToDropzone = () => {
    dropzoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const totalFormats = FORMAT_REGISTRY.length;
  const totalConversions = Object.values(CONVERSION_MATRIX).reduce((sum, convs) => sum + convs.length, 0);

  const categories = [
    { nameKey: "imageConverter", descKey: "imageConverterDesc", icon: FileImage, href: `/${locale}/image-converter`, color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50", features: ["Format conversion", "Batch processing", "Quality control"] },
    { nameKey: "videoConverter", descKey: "videoConverterDesc", icon: Film, href: `/${locale}/video-converter`, color: "from-violet-500 to-purple-500", bgColor: "bg-violet-50", features: ["HD support", "Fast encoding", "No quality loss"] },
    { nameKey: "audioConverter", descKey: "audioConverterDesc", icon: Music, href: `/${locale}/audio-converter`, color: "from-rose-500 to-pink-500", bgColor: "bg-rose-50", features: ["Bitrate control", "ID3 tags", "Fast processing"] },
    { nameKey: "pdfTools", descKey: "pdfToolsDesc", icon: FileType, href: `/${locale}/pdf-tools`, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50", features: ["Merge PDFs", "Split pages", "Compress files"] },
    { nameKey: "imageResizer", descKey: "imageResizerDesc", icon: Maximize2, href: `/${locale}/image-resizer`, color: "from-cyan-500 to-blue-500", bgColor: "bg-cyan-50", features: ["Custom dimensions", "Aspect ratio", "Batch resize"] },
    { nameKey: "backgroundRemover", descKey: "backgroundRemoverDesc", icon: Eraser, href: `/${locale}/background-remover`, color: "from-indigo-500 to-slate-500", bgColor: "bg-indigo-50", features: ["AI-powered", "Transparent PNG", "Batch mode"] },
    { nameKey: "ebookConverter", descKey: "ebookConverterDesc", icon: BookOpen, href: `/${locale}/ebook-converter`, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50", features: ["EPUB", "MOBI", "AZW3"] },
  ];

  const features = [
    { icon: Shield, titleKey: "private", descKey: "privateDesc" },
    { icon: Zap, titleKey: "fast", descKey: "fastDesc" },
    { icon: Lock, titleKey: "secure", descKey: "secureDesc" },
  ];

  const cats = dict.categories as Record<string, string>;
  const feats = dict.features as Record<string, string>;
  const hero = dict.hero as Record<string, string>;

  return (
    <div className="min-h-screen">
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container relative mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-white/80 backdrop-blur border border-slate-200">
                {totalFormats} {hero?.badge || "Formats - Conversions"} {totalConversions}+
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                {hero?.title || "Convert Any File"}{" "}
                <span className="gradient-text">{hero?.titleHighlight || "Instantly"}</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                {hero?.subtitle || "Transform videos, audio, images, and documents directly in your browser. No uploads, complete privacy."}
              </p>
            </div>

          </div>

          {/* UniversalDropzone with glassmorphism design */}
          <div ref={dropzoneRef} className="mt-10 max-w-2xl mx-auto">
            <UniversalDropzone mode="all" />

            {/* Trust badge — below the dropzone */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <div className="flex -space-x-2.5">
                {["bg-emerald-500", "bg-violet-500", "bg-rose-500", "bg-amber-500"].map((color, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${color} border-2 border-white flex items-center justify-center shadow-sm`}>
                    {i === 0 && <Image className="h-3 w-3 text-white" />}
                    {i === 1 && <FileVideo className="h-3 w-3 text-white" />}
                    {i === 2 && <FileAudio className="h-3 w-3 text-white" />}
                    {i === 3 && <FileText className="h-3 w-3 text-white" />}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 px-3.5 py-1.5 shadow-sm">
                <span className="text-xs font-bold text-slate-900">100M+</span>
                <span className="text-xs text-slate-500">{hero?.filesConverted || "files converted"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {typeof dict.allInOne === "string" ? dict.allInOne : "All-In-One File Tools"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {typeof dict.allInOneDesc === "string" ? dict.allInOneDesc : "Choose from our comprehensive suite of file conversion and editing tools"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {categories.map((category) => (
              <Link key={category.nameKey} href={category.href}>
                <div className="category-card h-full group">
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-110`}>
                      <category.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {cats?.[category.nameKey] || category.nameKey}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {cats?.[category.descKey] || category.descKey}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className={`text-xs ${category.bgColor} border border-slate-200`}>
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-blue-600 font-medium text-sm mt-4 group-hover:translate-x-1 transition-transform">
                      {cats?.getStarted || "Get Started"}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.titleKey} className="text-center p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 mb-4">
                  <feature.icon className="h-7 w-7 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feats?.[feature.titleKey] || feature.titleKey}
                </h3>
                <p className="text-sm text-slate-600">{feats?.[feature.descKey] || feature.descKey}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {typeof dict.supportedFormats === "string" ? dict.supportedFormats : "Supported Formats"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {(typeof dict.supportedFormatsDesc === "string" ? dict.supportedFormatsDesc : "We support {count} different file formats").replace("{count}", String(totalFormats))}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
            {FORMAT_REGISTRY.map((format) => (
                <div key={format.ext} className="group relative px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-default">
                  <div className="text-center">
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">.{format.ext.toUpperCase()}</span>
                    <p className="text-xs text-slate-400 mt-1 truncate">{format.name.split(" ")[0]}</p>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            }
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {typeof dict.readyToConvert === "string" ? dict.readyToConvert : "Ready to Convert?"}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            {typeof dict.readyToConvertDesc === "string" ? dict.readyToConvertDesc : "Start converting your files now. No registration required, no limits."}
          </p>
          <button
            onClick={scrollToDropzone}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            <Upload className="h-5 w-5" />
            {hero?.uploadBtn || "Upload a File"}
          </button>
        </div>
      </section>
    </div>
  );
}
