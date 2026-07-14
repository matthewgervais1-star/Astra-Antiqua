import type { Culture } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * The single source of truth for the five cultures' aspect verbs: the phrase
 * that joins two deity names into a sentence ("Apollo {verb} Ares"). Every
 * reading surface imports from here, so the register can be tuned in one
 * place. Each verb must read as a sentence a person wrote, with any pair of
 * names on either side.
 */
export const ASPECT_VERBS: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  egypt: {
    conjunction: "joins the barque of",
    sextile: "offers a steady hand to",
    square: "tips the scales against",
    trine: "rows in time with",
    opposition: "stands across the river from",
  },
  greece: {
    conjunction: "stands shoulder to shoulder with",
    sextile: "offers fair counsel to",
    square: "challenges",
    trine: "moves in accord with",
    opposition: "stands across the agora from",
  },
  canaan: {
    conjunction: "shares the council seat with",
    sextile: "exchanges tribute with",
    square: "draws the bow against",
    trine: "speaks favor over",
    opposition: "convenes the council against",
  },
  carthage: {
    conjunction: "sails under one banner with",
    sextile: "trades safe passage with",
    square: "raises a hand against",
    trine: "lights the harbor for",
    opposition: "demands a price of",
  },
  rome: {
    conjunction: "marches under the same eagle as",
    sextile: "offers a treaty to",
    square: "raises the spear against",
    trine: "clasps the right hand of",
    opposition: "stands across the forum from",
  },
};

/**
 * The culture-neutral aspect verbs, for surfaces rendered before any pantheon
 * is chosen. Same composition contract as ASPECT_VERBS: "{name} {verb} {name}"
 * must read as a sentence a person wrote.
 */
export const PLAIN_ASPECT_VERBS: Readonly<Record<AspectKind, string>> = {
  conjunction: "joins",
  sextile: "steadies",
  square: "grinds against",
  trine: "flows with",
  opposition: "pulls against",
};

/**
 * The verb that places the Moon's deity in a sign for the week strip:
 * "{deity} {verb} {sign image}". Must compose cleanly with every entry in
 * SIGN_REGISTERS.
 */
export const PLACEMENT_VERBS: Readonly<Record<Culture, string>> = {
  egypt: "stands in",
  greece: "walks in",
  canaan: "is seated in",
  carthage: "carries the standard into",
  rome: "keeps the watch in",
};
