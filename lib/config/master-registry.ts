import {
  FileImage,
  Film,
  Music,
  FileText,
  Cuboid,
  Layers,
  type LucideIcon,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CORE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Top-level grouping of a format — drives category pages, SEO, and converter routing. */
export type FormatCategory =
  | "image"     // Raster images (PNG, JPG, WebP, …)
  | "raw"       // Camera RAW files (CR2, NEF, ARW, …)
  | "vector"    // Vector & design files (SVG, AI, PSD, …)
  | "icon"      // Icon formats (ICO, ICNS)
  | "cad"       // CAD / 3D models (DWG, STL, OBJ, …)
  | "video"     // Video files (MP4, WebM, MKV, …)
  | "audio"     // Audio files (MP3, WAV, FLAC, …)
  | "document"; // Documents, spreadsheets, eBooks (PDF, DOCX, EPUB, …)

/**
 * The client-side or server-side engine used to perform the conversion.
 * Used to show the correct engine badge in the UI and to route conversion logic.
 */
export type ProcessingEngine =
  | "canvas"     // Browser Canvas API — raster image operations
  | "ffmpeg"     // FFmpeg.wasm — video & audio transcoding
  | "web-audio"  // Web Audio API — audio manipulation
  | "pdf-lib"    // pdf-lib — PDF creation / manipulation
  | "jszip"      // JSZip — EPUB / archive operations
  | "native"     // Pass-through / browser-native (no transformation)
  | "server";    // Requires server-side processing (not available client-only)

/**
 * Controls how a format surfaces in converter dropdowns.
 *   popular  → top group, always visible
 *   standard → main list
 *   advanced → collapsed "More formats" section
 */
export type FormatTier = "popular" | "standard" | "advanced";

/** Which converter page this format belongs to. */
export type ConverterType = "image" | "video" | "audio" | "document" | "ebook";

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT ENTRY INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface FormatEntry {
  /** Lowercase file extension without the dot — e.g. "mp4", "jpg" */
  ext: string;

  /** Human-readable display name — e.g. "MP4 Video" */
  name: string;

  /** Primary format category */
  category: FormatCategory;

  /** Primary MIME type */
  mime: string;

  /** Additional MIME types the browser or server may send for this format */
  altMimes?: string[];

  /**
   * Dropdown tier:
   *   popular  → appears first, always visible
   *   standard → visible in default list
   *   advanced → hidden under "More formats" toggle
   */
  tier: FormatTier;

  /** Client-side (or server-side) engine needed to convert this format */
  engine: ProcessingEngine;

  /**
   * Whether modern browsers can natively render or play this format
   * without a conversion step — enables live preview in the UI.
   */
  browserNative?: boolean;

  /**
   * Short one-liner used in SEO meta descriptions and format tooltips.
   * Keep under 100 characters.
   */
  description?: string;

  /**
   * Optional semantic tags for cross-cutting concerns that don't warrant
   * a separate category — e.g. "ebook", "legacy", "lossless".
   * Used by converter routing and UI filtering.
   */
  tags?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY METADATA
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryMeta {
  /** Human-readable label used in headings and filters */
  label: string;

  /** Lucide icon component */
  icon: LucideIcon;

  /** Tailwind text-color utility class */
  color: string;

  /** Tailwind background-color utility class */
  bgColor: string;

  /** [from, to] Tailwind gradient utility classes for gradient badges / icons */
  gradient: [string, string];

  /** Label used in pSEO page titles and meta descriptions */
  seoLabel: string;
}

export const CATEGORY_META: Record<FormatCategory, CategoryMeta> = {
  image: {
    label:    "Raster Image",
    icon:     FileImage,
    color:    "text-emerald-600",
    bgColor:  "bg-emerald-50",
    gradient: ["from-emerald-500", "to-teal-500"],
    seoLabel: "Image",
  },
  raw: {
    label:    "Camera RAW",
    icon:     FileImage,
    color:    "text-amber-600",
    bgColor:  "bg-amber-50",
    gradient: ["from-amber-500", "to-orange-500"],
    seoLabel: "Camera RAW",
  },
  vector: {
    label:    "Vector / Design",
    icon:     Layers,
    color:    "text-blue-600",
    bgColor:  "bg-blue-50",
    gradient: ["from-blue-500", "to-cyan-500"],
    seoLabel: "Vector",
  },
  icon: {
    label:    "Icon",
    icon:     FileImage,
    color:    "text-slate-600",
    bgColor:  "bg-slate-50",
    gradient: ["from-slate-500", "to-slate-700"],
    seoLabel: "Icon",
  },
  cad: {
    label:    "CAD / 3D",
    icon:     Cuboid,
    color:    "text-cyan-600",
    bgColor:  "bg-cyan-50",
    gradient: ["from-cyan-500", "to-blue-500"],
    seoLabel: "CAD",
  },
  video: {
    label:    "Video",
    icon:     Film,
    color:    "text-violet-600",
    bgColor:  "bg-violet-50",
    gradient: ["from-violet-500", "to-purple-500"],
    seoLabel: "Video",
  },
  audio: {
    label:    "Audio",
    icon:     Music,
    color:    "text-rose-600",
    bgColor:  "bg-rose-50",
    gradient: ["from-rose-500", "to-pink-500"],
    seoLabel: "Audio",
  },
  document: {
    label:    "Document",
    icon:     FileText,
    color:    "text-amber-600",
    bgColor:  "bg-amber-50",
    gradient: ["from-amber-500", "to-orange-500"],
    seoLabel: "Document",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MASTER FORMAT REGISTRY
// Single source of truth for every format supported across the platform.
//
// New formats added in this registry:
//   Video → mpeg, mpg, m4v, 3gp, asf, vob, ogv, ts, f4v
//   Audio → opus, ac3, amr, ra, caf
// ─────────────────────────────────────────────────────────────────────────────

export const FORMAT_REGISTRY: FormatEntry[] = [

  // ── Raster Image ────────────────────────────────────────────────────────────
  { ext: "png",  name: "PNG Image",           category: "image",    mime: "image/png",                tier: "popular",  engine: "canvas",    browserNative: true,  description: "Lossless raster image with full transparency support" },
  { ext: "jpg",  name: "JPEG Image",          category: "image",    mime: "image/jpeg",               tier: "popular",  engine: "canvas",    browserNative: true,  description: "Widely-supported lossy compressed photo format" },
  { ext: "jpeg", name: "JPEG Image",          category: "image",    mime: "image/jpeg",               tier: "standard", engine: "canvas",    browserNative: true,  description: "Full extension alias for the JPG format" },
  { ext: "webp", name: "WebP Image",          category: "image",    mime: "image/webp",               tier: "popular",  engine: "canvas",    browserNative: true,  description: "Modern web format with superior compression over JPEG/PNG" },
  { ext: "gif",  name: "GIF Image",           category: "image",    mime: "image/gif",                tier: "popular",  engine: "canvas",    browserNative: true,  description: "Supports animation; limited 256-color palette" },
  { ext: "bmp",  name: "Bitmap Image",        category: "image",    mime: "image/bmp",                tier: "standard", engine: "canvas",    browserNative: true,  description: "Uncompressed raster format — large file size" },
  { ext: "tiff", name: "TIFF Image",          category: "image",    mime: "image/tiff",               tier: "standard", engine: "canvas",                          description: "High-quality image format favored in print and publishing" },
  { ext: "heic", name: "HEIC Image",          category: "image",    mime: "image/heic",               tier: "popular",  engine: "canvas",                          description: "Apple High Efficiency Image Container — default on iOS" },
  { ext: "heif", name: "HEIF Image",          category: "image",    mime: "image/heif",               tier: "standard", engine: "canvas",                          description: "High Efficiency Image File — HEVC-compressed container" },

  // ── Camera RAW ──────────────────────────────────────────────────────────────
  { ext: "raw",  name: "RAW Image",           category: "raw",      mime: "image/raw",                tier: "standard", engine: "canvas",                          description: "Generic unprocessed camera sensor data file" },
  { ext: "cr2",  name: "Canon RAW",           category: "raw",      mime: "image/x-canon-cr2",        tier: "popular",  engine: "canvas",                          description: "Canon Camera RAW 2 format" },
  { ext: "nef",  name: "Nikon RAW",           category: "raw",      mime: "image/x-nikon-nef",        tier: "popular",  engine: "canvas",                          description: "Nikon Electronic Format — RAW sensor data" },
  { ext: "arw",  name: "Sony RAW",            category: "raw",      mime: "image/x-sony-arw",         tier: "popular",  engine: "canvas",                          description: "Sony Alpha RAW format" },
  { ext: "dng",  name: "Adobe DNG",           category: "raw",      mime: "image/x-adobe-dng",        tier: "standard", engine: "canvas",                          description: "Adobe Digital Negative — open universal RAW standard" },

  // ── Vector & Design ─────────────────────────────────────────────────────────
  { ext: "svg",  name: "SVG Vector",          category: "vector",   mime: "image/svg+xml",            tier: "popular",  engine: "canvas",    browserNative: true,  description: "Scalable Vector Graphics — XML-based, resolution-independent" },
  { ext: "ai",   name: "Adobe Illustrator",   category: "vector",   mime: "application/postscript",   tier: "standard", engine: "server",                          description: "Adobe Illustrator native vector format" },
  { ext: "eps",  name: "EPS Vector",          category: "vector",   mime: "application/postscript",   tier: "standard", engine: "server",                          description: "Encapsulated PostScript — universal vector interchange" },
  { ext: "psd",  name: "Photoshop Document",  category: "vector",   mime: "image/vnd.adobe.photoshop",tier: "popular",  engine: "server",                          description: "Adobe Photoshop layered document" },
  { ext: "cdr",  name: "CorelDRAW",           category: "vector",   mime: "application/x-cdr",        tier: "advanced", engine: "server",                          description: "CorelDRAW native vector format" },
  { ext: "indd", name: "InDesign Document",   category: "vector",   mime: "application/x-indesign",   tier: "advanced", engine: "server",                          description: "Adobe InDesign page-layout document" },

  // ── Icons ───────────────────────────────────────────────────────────────────
  { ext: "ico",  name: "Windows Icon",        category: "icon",     mime: "image/x-icon",             tier: "popular",  engine: "canvas",    browserNative: true,  description: "Windows multi-resolution icon format" },
  { ext: "icns", name: "Apple Icon",          category: "icon",     mime: "image/x-icns",             tier: "standard", engine: "canvas",                          description: "macOS multi-resolution icon format" },

  // ── CAD / 3D ────────────────────────────────────────────────────────────────
  { ext: "dwg",  name: "AutoCAD Drawing",     category: "cad",      mime: "application/acad",         tier: "popular",  engine: "server",                          description: "AutoCAD native binary drawing format" },
  { ext: "dxf",  name: "CAD Exchange Format", category: "cad",      mime: "application/dxf",          tier: "popular",  engine: "server",                          description: "Drawing Exchange Format — universal CAD interchange" },
  { ext: "step", name: "STEP 3D Model",       category: "cad",      mime: "application/step",         tier: "popular",  engine: "server",                          description: "ISO 10303 STEP — industry-standard 3D exchange format" },
  { ext: "stp",  name: "STEP 3D Model",       category: "cad",      mime: "application/step",         tier: "standard", engine: "server",                          description: "Alternate .stp extension for STEP 3D files" },
  { ext: "stl",  name: "STL 3D Model",        category: "cad",      mime: "model/stl",                tier: "popular",  engine: "server",                          description: "Stereolithography format — 3D printing standard" },
  { ext: "obj",  name: "OBJ 3D Model",        category: "cad",      mime: "model/obj",                tier: "standard", engine: "server",                          description: "Wavefront OBJ — widely-supported 3D mesh format" },
  { ext: "fbx",  name: "FBX 3D Model",        category: "cad",      mime: "application/octet-stream", tier: "standard", engine: "server",                          description: "Autodesk FBX — animation-capable 3D interchange" },

  // ── Video — Existing ────────────────────────────────────────────────────────
  { ext: "mp4",  name: "MP4 Video",           category: "video",    mime: "video/mp4",                tier: "popular",  engine: "ffmpeg",    browserNative: true,  description: "H.264/MPEG-4 — the universal video container standard" },
  { ext: "webm", name: "WebM Video",          category: "video",    mime: "video/webm",               tier: "popular",  engine: "ffmpeg",    browserNative: true,  description: "Open web video format optimized for streaming" },
  { ext: "avi",  name: "AVI Video",           category: "video",    mime: "video/x-msvideo",          tier: "popular",  engine: "ffmpeg",                          description: "Audio Video Interleave — classic Windows container" },
  { ext: "mov",  name: "QuickTime Movie",     category: "video",    mime: "video/quicktime",          tier: "popular",  engine: "ffmpeg",                          description: "Apple QuickTime video container" },
  { ext: "mkv",  name: "Matroska Video",      category: "video",    mime: "video/x-matroska",         tier: "popular",  engine: "ffmpeg",                          description: "Open multimedia container supporting all codecs" },
  { ext: "wmv",  name: "Windows Media Video", category: "video",    mime: "video/x-ms-wmv",           tier: "standard", engine: "ffmpeg",                          description: "Microsoft Windows Media Video format" },
  { ext: "flv",  name: "Flash Video",         category: "video",    mime: "video/x-flv",              tier: "standard", engine: "ffmpeg",                          description: "Adobe Flash Video — legacy streaming format", tags: ["legacy"] },

  // ── Video — NEW formats ─────────────────────────────────────────────────────
  { ext: "mpeg", name: "MPEG Video",          category: "video",    mime: "video/mpeg",               tier: "standard", engine: "ffmpeg",                          description: "MPEG-1/2 video — classic DVD and VCD format", tags: ["legacy"] },
  { ext: "mpg",  name: "MPG Video",           category: "video",    mime: "video/mpeg",               tier: "standard", engine: "ffmpeg",                          description: "Short-extension alias for MPEG-1/2 video", tags: ["legacy"] },
  { ext: "m4v",  name: "M4V Video",           category: "video",    mime: "video/x-m4v",              tier: "popular",  engine: "ffmpeg",                          description: "iTunes video format — optional DRM variant of MP4" },
  { ext: "3gp",  name: "3GP Video",           category: "video",    mime: "video/3gpp",               tier: "standard", engine: "ffmpeg",                          description: "3GPP mobile video — designed for older mobile phones" },
  { ext: "asf",  name: "ASF Video",           category: "video",    mime: "video/x-ms-asf",           tier: "advanced", engine: "ffmpeg",                          description: "Microsoft Advanced Systems Format — legacy streaming", tags: ["legacy"] },
  { ext: "vob",  name: "VOB Video",           category: "video",    mime: "video/dvd",                tier: "advanced", engine: "ffmpeg",                          description: "DVD Video Object — raw DVD video stream" },
  { ext: "ogv",  name: "OGV Video",           category: "video",    mime: "video/ogg",                tier: "standard", engine: "ffmpeg",    browserNative: true,  description: "Ogg Video — open-source Theora video in Ogg container" },
  { ext: "ts",   name: "MPEG-TS Video",       category: "video",    mime: "video/mp2t",               tier: "advanced", engine: "ffmpeg",                          description: "MPEG Transport Stream — broadcast and HLS segment format" },
  { ext: "f4v",  name: "F4V Video",           category: "video",    mime: "video/x-f4v",              tier: "advanced", engine: "ffmpeg",                          description: "Flash MP4 Video — H.264 inside a Flash container", tags: ["legacy"] },

  // ── Audio — Existing ────────────────────────────────────────────────────────
  { ext: "mp3",  name: "MP3 Audio",           category: "audio",    mime: "audio/mpeg",               tier: "popular",  engine: "ffmpeg",    browserNative: true,  description: "MPEG Layer 3 — the universal compressed audio format" },
  { ext: "wav",  name: "WAV Audio",           category: "audio",    mime: "audio/wav",                tier: "popular",  engine: "ffmpeg",    browserNative: true,  description: "Uncompressed PCM audio — bit-perfect quality" },
  { ext: "ogg",  name: "Ogg Vorbis",          category: "audio",    mime: "audio/ogg",                tier: "popular",  engine: "ffmpeg",    browserNative: true,  description: "Open-source compressed audio with excellent quality/size" },
  { ext: "flac", name: "FLAC Audio",          category: "audio",    mime: "audio/flac",               tier: "popular",  engine: "ffmpeg",    browserNative: true,  description: "Free Lossless Audio Codec — perfect reconstruction",       tags: ["lossless"] },
  { ext: "aac",  name: "AAC Audio",           category: "audio",    mime: "audio/aac",                tier: "popular",  engine: "ffmpeg",    browserNative: true,  description: "Advanced Audio Coding — successor to MP3 at lower bitrates" },
  { ext: "m4a",  name: "M4A Audio",           category: "audio",    mime: "audio/mp4",                tier: "popular",  engine: "ffmpeg",    browserNative: true,  description: "AAC audio in MPEG-4 container — iTunes and Apple default" },
  { ext: "wma",  name: "Windows Media Audio", category: "audio",    mime: "audio/x-ms-wma",           tier: "standard", engine: "ffmpeg",                          description: "Microsoft Windows Media Audio format" },
  { ext: "aiff", name: "AIFF Audio",          category: "audio",    mime: "audio/aiff",               tier: "standard", engine: "ffmpeg",                          description: "Apple Interchange File Format — uncompressed audio",        tags: ["lossless"] },

  // ── Audio — NEW formats ─────────────────────────────────────────────────────
  { ext: "opus", name: "Opus Audio",          category: "audio",    mime: "audio/opus",               tier: "popular",  engine: "ffmpeg",    browserNative: true,  description: "Modern low-latency codec by Xiph — best quality-to-size ratio" },
  { ext: "ac3",  name: "AC3 Audio",           category: "audio",    mime: "audio/ac3",                tier: "standard", engine: "ffmpeg",                          description: "Dolby Digital — multichannel surround sound for DVD/Blu-ray" },
  { ext: "amr",  name: "AMR Audio",           category: "audio",    mime: "audio/amr",                tier: "standard", engine: "ffmpeg",                          description: "Adaptive Multi-Rate — mobile voice recording codec" },
  { ext: "ra",   name: "RealAudio",           category: "audio",    mime: "audio/x-realaudio",        tier: "advanced", engine: "ffmpeg",                          description: "RealNetworks streaming audio — legacy format", tags: ["legacy"] },
  { ext: "caf",  name: "Core Audio Format",   category: "audio",    mime: "audio/x-caf",              tier: "standard", engine: "ffmpeg",                          description: "Apple Core Audio Format — supports files over 4 GB" },

  // ── Document ────────────────────────────────────────────────────────────────
  { ext: "pdf",  name: "PDF Document",          category: "document", mime: "application/pdf",                                                                           tier: "popular",  engine: "pdf-lib", browserNative: true,  description: "Portable Document Format — universal fixed-layout document" },
  { ext: "doc",  name: "Word Document",         category: "document", mime: "application/msword",                                                                        tier: "popular",  engine: "native",                        description: "Microsoft Word 97–2003 binary format" },
  { ext: "docx", name: "Word Document (OOXML)", category: "document", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",                   tier: "popular",  engine: "native",                        description: "Microsoft Word Open XML — current default format" },
  { ext: "xls",  name: "Excel Spreadsheet",     category: "document", mime: "application/vnd.ms-excel",                                                                  tier: "popular",  engine: "native",                        description: "Microsoft Excel 97–2003 binary spreadsheet" },
  { ext: "xlsx", name: "Excel (OOXML)",          category: "document", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",                        tier: "popular",  engine: "native",                        description: "Microsoft Excel Open XML — current default format" },
  { ext: "ppt",  name: "PowerPoint",            category: "document", mime: "application/vnd.ms-powerpoint",                                                             tier: "popular",  engine: "native",                        description: "Microsoft PowerPoint 97–2003 binary format" },
  { ext: "pptx", name: "PowerPoint (OOXML)",    category: "document", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",                 tier: "popular",  engine: "native",                        description: "Microsoft PowerPoint Open XML format" },
  { ext: "txt",  name: "Plain Text",            category: "document", mime: "text/plain",                                                                                tier: "popular",  engine: "native",  browserNative: true,  description: "Unformatted plain text — universally readable" },
  { ext: "rtf",  name: "Rich Text Format",      category: "document", mime: "application/rtf",                                                                           tier: "standard", engine: "native",                        description: "Rich Text Format — cross-application formatted text" },
  { ext: "odt",  name: "OpenDocument Text",     category: "document", mime: "application/vnd.oasis.opendocument.text",                                                   tier: "standard", engine: "native",                        description: "LibreOffice / OpenOffice Writer text document" },
  { ext: "ods",  name: "OpenDocument Sheet",    category: "document", mime: "application/vnd.oasis.opendocument.spreadsheet",                                            tier: "standard", engine: "native",                        description: "LibreOffice / OpenOffice Calc spreadsheet" },
  { ext: "odp",  name: "OpenDocument Slides",   category: "document", mime: "application/vnd.oasis.opendocument.presentation",                                           tier: "standard", engine: "native",                        description: "LibreOffice / OpenOffice Impress presentation" },
  { ext: "html", name: "HTML Document",         category: "document", mime: "text/html",                                                                                 tier: "standard", engine: "native",  browserNative: true,  description: "HyperText Markup Language — web page source" },
  { ext: "epub", name: "EPUB eBook",            category: "document", mime: "application/epub+zip",                                                                      tier: "popular",  engine: "jszip",                         description: "Open eBook standard — compatible with most e-readers", tags: ["ebook"] },
  { ext: "mobi", name: "Mobipocket eBook",      category: "document", mime: "application/x-mobipocket-ebook",                                                            tier: "standard", engine: "native",                        description: "Mobipocket eBook — used by older Kindle devices", tags: ["ebook"] },
  { ext: "azw3", name: "Kindle eBook",          category: "document", mime: "application/vnd.amazon.ebook",                                                              tier: "popular",  engine: "native",                        description: "Amazon Kindle Format 8 — modern Kindle default", tags: ["ebook"] },
  { ext: "md",   name: "Markdown Document",     category: "document", mime: "text/markdown",                                                                             tier: "standard", engine: "native",                        description: "Lightweight markup language for formatted plain text" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSION MATRIX
// Defines which target formats each source format can be converted to.
// This is the authoritative source — replaces conversion-matrix.json and
// imageConversionMatrix.ts.
// ─────────────────────────────────────────────────────────────────────────────

export const CONVERSION_MATRIX: Record<string, string[]> = {

  // ── Raster Image ────────────────────────────────────────────────────────────
  png:  ["jpg", "jpeg", "webp", "gif", "bmp", "tiff", "ico", "icns", "svg", "pdf"],
  jpg:  ["png", "jpeg", "webp", "gif", "bmp", "tiff", "ico", "icns", "pdf"],
  jpeg: ["png", "jpg",  "webp", "gif", "bmp", "tiff", "ico", "icns", "pdf"],
  webp: ["png", "jpg",  "jpeg", "gif", "bmp", "tiff", "pdf"],
  gif:  ["png", "jpg",  "jpeg", "webp", "bmp", "tiff", "pdf"],
  bmp:  ["png", "jpg",  "jpeg", "webp", "gif", "tiff", "ico", "pdf"],
  tiff: ["png", "jpg",  "jpeg", "webp", "gif", "bmp", "pdf"],
  heic: ["png", "jpg",  "jpeg", "webp", "tiff", "pdf"],
  heif: ["png", "jpg",  "jpeg", "webp", "tiff", "pdf"],

  // ── Camera RAW ──────────────────────────────────────────────────────────────
  raw:  ["png", "jpg", "jpeg", "webp", "tiff", "pdf"],
  cr2:  ["png", "jpg", "jpeg", "webp", "tiff", "pdf"],
  nef:  ["png", "jpg", "jpeg", "webp", "tiff", "pdf"],
  arw:  ["png", "jpg", "jpeg", "webp", "tiff", "pdf"],
  dng:  ["png", "jpg", "jpeg", "webp", "tiff", "pdf"],

  // ── Vector & Design ─────────────────────────────────────────────────────────
  svg:  ["png", "jpg", "jpeg", "webp", "bmp", "ico", "pdf"],
  ai:   ["png", "jpg", "jpeg", "webp", "svg", "eps", "pdf"],
  eps:  ["png", "jpg", "jpeg", "webp", "svg", "ai",  "pdf"],
  psd:  ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "svg", "pdf"],
  cdr:  ["png", "jpg", "jpeg", "webp", "svg", "eps", "pdf"],
  indd: ["png", "jpg", "jpeg", "eps", "pdf"],

  // ── Icons ───────────────────────────────────────────────────────────────────
  ico:  ["png", "jpg", "jpeg", "bmp", "icns"],
  icns: ["png", "jpg", "jpeg", "ico"],

  // ── CAD / 3D ────────────────────────────────────────────────────────────────
  dwg:  ["dxf", "pdf", "svg"],
  dxf:  ["dwg", "pdf", "svg"],
  step: ["stl", "obj", "fbx"],
  stp:  ["stl", "obj", "fbx"],
  stl:  ["obj", "fbx", "step"],
  obj:  ["stl", "fbx", "step"],
  fbx:  ["obj", "stl"],

  // ── Video — Existing ────────────────────────────────────────────────────────
  mp4:  ["webm", "avi", "mov", "mkv", "wmv", "flv", "m4v", "mpeg", "3gp", "ogv", "gif", "mp3", "wav", "ogg", "aac", "m4a"],
  webm: ["mp4",  "avi", "mov", "mkv", "ogv", "gif", "mp3", "wav", "ogg", "aac"],
  avi:  ["mp4",  "webm", "mov", "mkv", "wmv", "flv", "gif", "mp3", "wav"],
  mov:  ["mp4",  "webm", "avi", "mkv", "m4v", "gif", "mp3", "wav", "aac"],
  mkv:  ["mp4",  "webm", "avi", "mov", "ogv", "gif", "mp3", "wav", "ogg", "flac"],
  wmv:  ["mp4",  "webm", "avi", "mov", "flv", "asf", "gif", "mp3", "wav"],
  flv:  ["mp4",  "webm", "avi", "mov", "gif", "mp3", "wav"],

  // ── Video — NEW ─────────────────────────────────────────────────────────────
  mpeg: ["mp4",  "webm", "avi", "mov", "mkv", "wmv", "flv", "gif", "mp3", "wav", "ogg", "aac"],
  mpg:  ["mp4",  "webm", "avi", "mov", "mkv", "wmv", "flv", "gif", "mp3", "wav", "ogg", "aac"],
  m4v:  ["mp4",  "webm", "avi", "mov", "mkv", "gif", "mp3", "wav", "aac", "m4a"],
  "3gp":["mp4",  "webm", "avi", "mov", "gif", "mp3", "wav", "aac"],
  asf:  ["mp4",  "webm", "avi", "mov", "wmv", "gif", "mp3", "wav"],
  vob:  ["mp4",  "webm", "avi", "mov", "mkv", "flv", "gif", "mp3", "wav", "aac"],
  ogv:  ["mp4",  "webm", "avi", "mov", "mkv", "gif", "mp3", "wav", "ogg"],
  ts:   ["mp4",  "webm", "avi", "mov", "mkv", "gif", "mp3", "wav", "aac"],
  f4v:  ["mp4",  "webm", "avi", "mov", "flv", "gif", "mp3", "wav"],

  // ── Audio — Existing ────────────────────────────────────────────────────────
  mp3:  ["wav",  "ogg", "flac", "aac", "m4a", "wma", "aiff", "opus"],
  wav:  ["mp3",  "ogg", "flac", "aac", "m4a", "wma", "aiff", "opus"],
  ogg:  ["mp3",  "wav", "flac", "aac", "m4a", "opus"],
  flac: ["mp3",  "wav", "ogg", "aac", "m4a", "aiff"],
  aac:  ["mp3",  "wav", "ogg", "flac", "m4a", "opus"],
  m4a:  ["mp3",  "wav", "ogg", "flac", "aac", "aiff"],
  wma:  ["mp3",  "wav", "ogg", "aac", "flac"],
  aiff: ["mp3",  "wav", "ogg", "flac", "aac", "m4a"],

  // ── Audio — NEW ─────────────────────────────────────────────────────────────
  opus: ["mp3",  "wav", "ogg", "flac", "aac", "m4a"],
  ac3:  ["mp3",  "wav", "ogg", "flac", "aac", "m4a"],
  amr:  ["mp3",  "wav", "aac", "ogg",  "m4a"],
  ra:   ["mp3",  "wav", "ogg", "aac"],
  caf:  ["mp3",  "wav", "ogg", "flac", "aac", "m4a", "aiff"],

  // ── Document ────────────────────────────────────────────────────────────────
  pdf:  ["jpg",  "png", "webp", "svg", "txt", "docx", "dwg", "dxf"],
  doc:  ["docx", "pdf", "txt",  "rtf", "odt", "html"],
  docx: ["doc",  "pdf", "txt",  "rtf", "odt", "html"],
  xls:  ["xlsx", "pdf", "ods"],
  xlsx: ["xls",  "pdf", "ods"],
  ppt:  ["pptx", "pdf", "odp"],
  pptx: ["ppt",  "pdf", "odp"],
  txt:  ["pdf",  "docx", "html", "rtf", "md"],
  rtf:  ["pdf",  "docx", "txt",  "html"],
  odt:  ["docx", "pdf", "txt",  "html"],
  ods:  ["xlsx", "pdf"],
  odp:  ["pptx", "pdf"],
  html: ["pdf",  "txt", "docx", "md"],
  epub: ["pdf",  "txt", "html", "mobi", "azw3"],
  mobi: ["epub", "pdf", "txt",  "html", "azw3"],
  azw3: ["epub", "pdf", "txt",  "html", "mobi"],
  md:   ["pdf",  "html", "txt", "docx"],
};

// ─────────────────────────────────────────────────────────────────────────────
// FORMAT CATEGORIES MAP
// Flat list per category — used by pSEO slug parser and related-conversion logic.
// ─────────────────────────────────────────────────────────────────────────────

export const FORMAT_CATEGORIES: Record<FormatCategory, string[]> = {
  image:    ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "heic", "heif"],
  raw:      ["raw", "cr2", "nef", "arw", "dng"],
  vector:   ["svg", "ai", "eps", "psd", "cdr", "indd"],
  icon:     ["ico", "icns"],
  cad:      ["dwg", "dxf", "step", "stp", "stl", "obj", "fbx"],
  video:    ["mp4", "webm", "avi", "mov", "mkv", "wmv", "flv",
             "mpeg", "mpg", "m4v", "3gp", "asf", "vob", "ogv", "ts", "f4v"],
  audio:    ["mp3", "wav", "ogg", "flac", "aac", "m4a", "wma", "aiff",
             "opus", "ac3", "amr", "ra", "caf"],
  document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt",
             "rtf", "odt", "ods", "odp", "html", "epub", "mobi", "azw3", "md"],
};

// ─────────────────────────────────────────────────────────────────────────────
// CONVERTER TYPE CONFIGURATION
// Maps each converter page type to the categories it accepts as input.
// ─────────────────────────────────────────────────────────────────────────────

export const CONVERTER_SOURCE_CATEGORIES: Record<ConverterType, FormatCategory[]> = {
  image:    ["image", "raw", "vector", "icon", "cad"],
  video:    ["video"],
  audio:    ["audio"],
  document: ["document"],
  ebook:    ["document"],
};

// Formats that are valid inputs for the dedicated eBook converter.
const EBOOK_SOURCE_EXTS = new Set(["epub", "mobi", "azw3", "pdf", "txt", "html"]);

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Internal fast-lookup map — built once at module init.
const _registryMap = new Map<string, FormatEntry>(
  FORMAT_REGISTRY.map((f) => [f.ext, f])
);

/** Look up a format by its extension. Returns undefined for unknown extensions. */
export function getFormatEntry(ext: string): FormatEntry | undefined {
  return _registryMap.get(ext.toLowerCase());
}

/** Return all registered formats that belong to the given category. */
export function getFormatsByCategory(category: FormatCategory): FormatEntry[] {
  return FORMAT_REGISTRY.filter((f) => f.category === category);
}

/**
 * Return all valid target FormatEntry objects for a given source extension.
 * Returns an empty array if the source is unknown or has no conversion targets.
 */
export function getTargetsForSource(sourceExt: string): FormatEntry[] {
  const targets = CONVERSION_MATRIX[sourceExt.toLowerCase()] ?? [];
  return targets
    .map((ext) => _registryMap.get(ext))
    .filter((e): e is FormatEntry => e !== undefined);
}

/** Check whether a specific source → target conversion pair is defined. */
export function isConversionValid(source: string, target: string): boolean {
  return CONVERSION_MATRIX[source.toLowerCase()]?.includes(target.toLowerCase()) ?? false;
}

/**
 * Return source formats available for a given converter type.
 * For the "ebook" type only the subset of document formats relevant to
 * eBook conversion is returned.
 */
export function getSourcesForConverterType(type: ConverterType): FormatEntry[] {
  const cats = CONVERTER_SOURCE_CATEGORIES[type];
  const base = FORMAT_REGISTRY.filter(
    (f) => cats.includes(f.category) && CONVERSION_MATRIX[f.ext] !== undefined
  );
  if (type === "ebook") return base.filter((f) => EBOOK_SOURCE_EXTS.has(f.ext));
  return base;
}

/**
 * Return formats grouped by tier for a given list — used to populate
 * categorised dropdowns (Popular / Standard / Advanced).
 */
export function groupFormatsByTier(formats: FormatEntry[]): {
  popular:  FormatEntry[];
  standard: FormatEntry[];
  advanced: FormatEntry[];
} {
  return {
    popular:  formats.filter((f) => f.tier === "popular"),
    standard: formats.filter((f) => f.tier === "standard"),
    advanced: formats.filter((f) => f.tier === "advanced"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO / pSEO HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate every valid "source-to-target" slug from the conversion matrix.
 * Used by generateStaticParams to pre-render all pSEO conversion pages.
 */
export function getAllConversionSlugs(): string[] {
  const slugs: string[] = [];
  for (const [source, targets] of Object.entries(CONVERSION_MATRIX)) {
    for (const target of targets) {
      slugs.push(`${source}-to-${target}`);
    }
  }
  return slugs;
}

/** Return the human-readable display name for an extension. Falls back to uppercase ext. */
export function getFormatDisplayName(ext: string): string {
  return _registryMap.get(ext.toLowerCase())?.name ?? ext.toUpperCase();
}

/** Return the category string for an extension, or "unknown" if not found. */
export function getFormatCategory(ext: string): string {
  return _registryMap.get(ext.toLowerCase())?.category ?? "unknown";
}

export interface ParsedSlug {
  inputFormat:    string;
  outputFormat:   string | null;
  inputName:      string;
  outputName:     string | null;
  inputCategory:  string;
  outputCategory: string | null;
  inputMime:      string;
  outputMime:     string | null;
  isValid:        boolean;
  isSingleFormat: boolean;
}

/**
 * Parse a URL slug into a structured conversion descriptor.
 * Handles both "[source]-to-[target]" and single-format slugs.
 * Returns null for malformed or unrecognised slugs.
 */
export function parseConversionSlug(slug: string): ParsedSlug | null {
  if (!slug || typeof slug !== "string") return null;

  const lower = slug.toLowerCase();
  const parts = lower.split("-to-");

  if (parts.length === 2 && parts[0] && parts[1]) {
    const inputFormat  = parts[0];
    const outputFormat = parts[1];
    const inputEntry   = _registryMap.get(inputFormat);
    const outputEntry  = _registryMap.get(outputFormat);

    if (!inputEntry || !outputEntry) return null;
    if (!CONVERSION_MATRIX[inputFormat]?.includes(outputFormat)) return null;

    return {
      inputFormat,
      outputFormat,
      inputName:      inputEntry.name,
      outputName:     outputEntry.name,
      inputCategory:  inputEntry.category,
      outputCategory: outputEntry.category,
      inputMime:      inputEntry.mime,
      outputMime:     outputEntry.mime,
      isValid:        true,
      isSingleFormat: false,
    };
  }

  // Single-format slug (e.g. "/mp4")
  const entry = _registryMap.get(lower);
  if (!entry || !CONVERSION_MATRIX[lower]) return null;

  return {
    inputFormat:    lower,
    outputFormat:   null,
    inputName:      entry.name,
    outputName:     null,
    inputCategory:  entry.category,
    outputCategory: null,
    inputMime:      entry.mime,
    outputMime:     null,
    isValid:        true,
    isSingleFormat: true,
  };
}

export interface RelatedConversion {
  slug:         string;
  inputFormat:  string;
  outputFormat: string;
  inputName:    string;
  outputName:   string;
  category:     string;
  relationLabel: string;
}

/**
 * Return up to `limit` related conversion suggestions for a given pair.
 * Priority order:
 *   1. Same input → different outputs
 *   2. Reverse conversion
 *   3. Output → other targets
 *   4. Same-category cross-links
 */
export function getRelatedConversions(
  inputFormat:  string,
  outputFormat: string | null,
  limit: number = 6,
): RelatedConversion[] {
  if (!outputFormat) return [];

  const related: RelatedConversion[] = [];
  const seen = new Set<string>();
  const currentSlug = `${inputFormat}-to-${outputFormat}`;

  const push = (from: string, to: string, label: string) => {
    const slug = `${from}-to-${to}`;
    if (slug === currentSlug || seen.has(slug)) return;
    if (!CONVERSION_MATRIX[from]?.includes(to)) return;
    const fromEntry = _registryMap.get(from);
    const toEntry   = _registryMap.get(to);
    if (!fromEntry || !toEntry) return;
    seen.add(slug);
    related.push({
      slug,
      inputFormat:  from,
      outputFormat: to,
      inputName:    fromEntry.name,
      outputName:   toEntry.name,
      category:     fromEntry.category,
      relationLabel: label,
    });
  };

  for (const out of CONVERSION_MATRIX[inputFormat] ?? []) {
    if (related.length >= limit) break;
    if (out !== outputFormat) push(inputFormat, out, "Same input");
  }

  push(outputFormat, inputFormat, "Reverse");

  for (const out of CONVERSION_MATRIX[outputFormat] ?? []) {
    if (related.length >= limit) break;
    if (out !== inputFormat) push(outputFormat, out, "From output");
  }

  const inputCategory = _registryMap.get(inputFormat)?.category as FormatCategory | undefined;
  if (inputCategory) {
    for (const fmt of FORMAT_CATEGORIES[inputCategory] ?? []) {
      if (related.length >= limit) break;
      if (fmt === inputFormat || fmt === outputFormat) continue;
      for (const target of CONVERSION_MATRIX[fmt] ?? []) {
        if (related.length >= limit) break;
        push(fmt, target, "Related format");
      }
    }
  }

  return related.slice(0, limit);
}

/**
 * Return available output formats for a given input extension as plain objects.
 * Matches the shape previously returned by getAvailableOutputFormats in parse-slug.ts.
 */
export function getAvailableOutputFormats(
  inputExt: string,
): { ext: string; name: string; mime: string; category: string }[] {
  return (CONVERSION_MATRIX[inputExt.toLowerCase()] ?? []).reduce<
    { ext: string; name: string; mime: string; category: string }[]
  >((acc, ext) => {
    const e = _registryMap.get(ext);
    if (e) acc.push({ ext: e.ext, name: e.name, mime: e.mime, category: e.category });
    return acc;
  }, []);
}

/** Deterministic 0–2 variant index from a slug string — used to vary pSEO page copy. */
export function getDescriptionVariant(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 3;
}
