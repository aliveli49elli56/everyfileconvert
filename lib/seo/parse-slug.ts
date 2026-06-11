/**
 * Phase 2 migration shim.
 *
 * lib/seo/parse-slug.ts now re-exports everything from the canonical
 * lib/config/master-registry.ts.  Any file that still imports from this
 * path continues to work without changes; the old conversion-matrix.json
 * and fragmented helpers are no longer consulted.
 *
 * Phase 4 will delete this file once all consumers have been updated to
 * import directly from master-registry.
 */
export type {
  ParsedSlug,
  RelatedConversion,
  FormatCategory,
  FormatEntry,
} from "@/lib/config/master-registry";

export {
  parseConversionSlug,
  getAllConversionSlugs,
  getDescriptionVariant,
  getRelatedConversions,
  getAvailableOutputFormats,
  getFormatDisplayName,
  getFormatCategory,
  getFormatEntry,
  getTargetsForSource,
  FORMAT_REGISTRY,
  CONVERSION_MATRIX,
  FORMAT_CATEGORIES,
  CATEGORY_META,
} from "@/lib/config/master-registry";
