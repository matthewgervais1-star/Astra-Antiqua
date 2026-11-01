import type { Culture } from "@/data/cultures";

/** One printed string per culture. Every culture must be present (the exporter fails otherwise). */
export type PerCulture = Readonly<Record<Culture, string>>;

/** A catalog value: one string for every culture, or one per culture. */
export type CatalogValue = string | PerCulture;

/** A screen's catalog: `<screen>.<slot>` keys to their printed form. */
export type Catalog = Readonly<Record<string, CatalogValue>>;

/**
 * A row of the ruled table whose text is composed by web's reading code
 * rather than stored in the catalog ("web's words win for composed prose").
 * The value names the composer, so the other surfaces know where the words
 * come from (most already reach them through shared/content).
 */
export type ComposedRows = Readonly<Record<string, string>>;
