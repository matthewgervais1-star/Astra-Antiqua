import type { Catalog } from "@/strings/types";

/**
 * Chrome and navigation names: one name per destination (rules N1 to N5).
 * The bars themselves (web's Lintel and HorizonControl, the ports' tab bars)
 * stay layout; the names they print come from here.
 */
export const NAV = {
  // P1.
  "chrome.wordmark": "ASTRA ANTIQVA",
  // P3. name: common.culture.name.
  "chrome.cultureChip.a11y": "Culture: {name}. Change culture",
  // P2.
  "chrome.horizon.day": "DAY",
  "chrome.horizon.week": "WEEK",
  "chrome.horizon.season": "SEASON",
  "chrome.horizon.year": "YEAR",
  // P55. destination: a nav.* name.
  "chrome.back.a11y": "Back to {destination}",
  // N1 to N5: destination names.
  "nav.sky": "SKY",
  "nav.chart": "CHART",
  "nav.transits": "TRANSITS",
  "nav.more": "MORE",
  "nav.learn": "LEARN",
  "nav.voices": "THE FIVE VOICES",
  "nav.matrix": "THE MATRIX",
  "nav.method": "THE METHOD",
  "nav.forecast": "THE YEAR AHEAD",
  "nav.account": "ACCOUNT",
  // Footer links, web's form (hidden on the board), one name per destination (N3, N4).
  "chrome.footer.toDay": "← THE DAY",
  "chrome.footer.week": "THE WEEK",
  "chrome.footer.toWeek": "THE WEEK →",
  "chrome.footer.toSeason": "THE SEASON →",
  "chrome.footer.backSeason": "← THE SEASON",
  "chrome.footer.toYear": "THE YEAR →",
  "chrome.footer.backYear": "← THE YEAR",
  "chrome.footer.toTransits": "THE LONG TRANSITS →",
  "chrome.footer.forecast": "THE YEAR AHEAD",
  "chrome.footer.toForecast": "THE YEAR AHEAD →",
  // Feedback row, web's words. noun: a *.feedback.noun value.
  "chrome.feedback.lead": "AGAINST THIS {noun} →",
  "chrome.feedback.so": "IT WAS SO",
  "chrome.feedback.notSo": "IT WAS NOT SO",
  "chrome.feedback.kept": "KEPT ON THIS DEVICE",
} as const satisfies Catalog;
