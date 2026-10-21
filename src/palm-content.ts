import type { Ring } from "./palm-geo";
import { crescent, fronds, trunk } from "./palm-geo";

/** One column: a gold pin, a serif title and a bedroom range. */
export type Block = { title: string; range: string };

export type Carousel = {
  areaName: string;
  /** Letterspaced gold line under the area name. */
  subtitle: string;
  blocks: Block[];
  /** Position in the 1-2-3 timeline at the foot of the slide. */
  step: 1 | 2 | 3;
  area: Ring[];
  zoom?: number;
  tilt?: number;
  /** The area the previous carousel ended on, for a continuous camera. */
  prevArea?: Ring[];
};

export const MASTHEAD = "Palm Jumeirah";
export const STEPS = ["Trunk", "Fronds", "Crescent"] as const;

export const theme = {
  /** Sampled from the approved template. */
  bg: "#EFE6D6",
  ink: "#13110D",
  gold: "#A07637",
  maroon: "#5C171E",
  rule: "#CFC4B0",
  pale: "#E5DED0",
  /** Highlight on the map. */
  hi: "#F3CE86",
  display: '"Didot", "Bodoni 72", "Playfair Display", Georgia, "Liberation Serif", serif',
  text: 'Georgia, "Liberation Serif", "Times New Roman", serif',
} as const;

/** All copy below is taken verbatim from the supplied template artwork. */
export const TRUNK: Carousel = {
  areaName: "The Trunk",
  subtitle: "APARTMENTS & PENTHOUSES",
  blocks: [
    { title: "Waterfront Apartments", range: "STUDIOS – 3 BEDROOMS" },
    { title: "Penthouses & Duplexes", range: "4 BEDROOMS" },
  ],
  step: 1,
  area: trunk,
};

export const FRONDS: Carousel = {
  areaName: "The Fronds",
  subtitle: "PRIVATE BEACHFRONT VILLAS",
  blocks: [
    { title: "Garden Homes", range: "4–5 BEDROOMS" },
    { title: "Signature Villas & Custom Mansions", range: "5–7+ BEDROOMS" },
  ],
  step: 2,
  area: fronds,
  prevArea: trunk,
};

export const CRESCENT: Carousel = {
  areaName: "The Crescent",
  subtitle: "BRANDED RESIDENCES & PENTHOUSES",
  blocks: [
    { title: "Branded Apartments", range: "2–4 BEDROOMS" },
    { title: "Penthouses & Sky Villas", range: "4–6+ BEDROOMS" },
  ],
  step: 3,
  area: crescent,
  prevArea: fronds,
};
