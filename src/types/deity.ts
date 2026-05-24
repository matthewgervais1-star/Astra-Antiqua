import type { Culture, Planet } from "@/data/cultures";

export interface Deity {
  planet: Planet;
  culture: Culture;
  name: string;
  epithet: string;
  note: string;
  contested?: boolean;
}

export type DeityMatrix = Readonly<Record<Culture, Readonly<Record<Planet, Deity>>>>;
