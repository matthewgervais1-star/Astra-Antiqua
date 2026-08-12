import type { Culture } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";

/**
 * The four whole-sign house groups every culture's voice names (work &
 * substance / home & kin / words & errands / inner court), in the fixed
 * order CultureVoice.houseGroups declares them. Same grouping the home
 * page's "where the day falls" module uses (2,6,10 / 4,8 / 3,7,11 / 1,5,9,12).
 */
const GROUP_HOUSES: readonly (readonly number[])[] = [
  [2, 6, 10],
  [4, 8],
  [3, 7, 11],
  [1, 5, 9, 12],
];

export function groupIndexForHouse(house: number): 0 | 1 | 2 | 3 {
  for (let i = 0; i < GROUP_HOUSES.length; i += 1) {
    if (GROUP_HOUSES[i]?.includes(house)) return i as 0 | 1 | 2 | 3;
  }
  return 3;
}

export function houseGroupName(culture: Culture, house: number): string {
  const groups = CULTURE_VOICES[culture].houseGroups;
  const idx = groupIndexForHouse(house);
  return groups[idx]?.name ?? groups[3]?.name ?? "";
}
