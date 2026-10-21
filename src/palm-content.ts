import type { Ring } from "./palm-geo";
import { crescent, fronds, trunk } from "./palm-geo";

export type Block = { title: string; range: string; body: string };

export type Carousel = {
  /** Shown lowercase on two lines, e.g. "the" / "trunk". */
  areaName: [string, string];
  category: string;
  blocks: [Block, Block];
  step: 1 | 2 | 3;
  area: Ring[];
  /**
   * The sharp window, as [x0, y0, x1, y1] normalised against the ORIGINAL
   * satellite image. Everything outside it stays soft.
   */
  focus: [number, number, number, number];
  prevFocus?: [number, number, number, number];
};

export const MASTHEAD = "PALM JUMEIRAH";
export const STEPS = ["The Trunk", "The Fronds", "The Crescent"] as const;

export const theme = {
  /** Sampled from the approved artwork. */
  light: "#FFFFFF",
  body: "#CBD6DC",
  muted: "#91AAB6",
  gold: "#F6D3A1",
  deep: "#0A2230",
  sans: '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif',
} as const;

const TRUNK_FOCUS: [number, number, number, number] = [0.405, 0.13, 0.6, 0.8];
const FRONDS_FOCUS: [number, number, number, number] = [0.18, 0.16, 0.62, 0.58];
const CRESCENT_FOCUS: [number, number, number, number] = [0.52, 0.02, 0.94, 0.46];

/** Copy taken verbatim from the supplied artwork. */
export const TRUNK: Carousel = {
  areaName: ["the", "trunk"],
  category: "APARTMENTS &\nPENTHOUSES",
  blocks: [
    {
      title: "Waterfront Apartments",
      range: "STUDIOS – 3 BEDROOMS",
      body: "A mix of contemporary residences across Shoreline Apartments, Golden Mile, Oceana and Tiara.",
    },
    {
      title: "Penthouses & Duplexes",
      range: "4 BEDROOMS",
      body: "Spacious residences offering generous layouts and elevated sea views.",
    },
  ],
  step: 1,
  area: trunk,
  focus: TRUNK_FOCUS,
};

export const FRONDS: Carousel = {
  areaName: ["the", "fronds"],
  category: "PRIVATE\nBEACHFRONT VILLAS",
  blocks: [
    {
      title: "Garden Homes",
      range: "4 – 5 BEDROOMS",
      body: "Private waterfront villas with gardens, swimming pools and direct beach access.",
    },
    {
      title: "Signature Villas &\nCustom Mansions",
      range: "5 – 7+ BEDROOMS",
      body: "Larger residences on generous waterfront plots, including individually designed mansions.",
    },
  ],
  step: 2,
  area: fronds,
  focus: FRONDS_FOCUS,
  prevFocus: TRUNK_FOCUS,
};

export const CRESCENT: Carousel = {
  areaName: ["the", "crescent"],
  category: "BRANDED RESIDENCES\n& PENTHOUSES",
  blocks: [
    {
      title: "Branded Apartments",
      range: "2 – 4 BEDROOMS",
      body: "Luxury resort residences offering private beaches and access to five-star hospitality amenities.",
    },
    {
      title: "Penthouses & Sky Villas",
      range: "4 – 6+ BEDROOMS",
      body: "Expansive luxury residences with panoramic views of the Arabian Gulf and Dubai skyline.",
    },
  ],
  step: 3,
  area: crescent,
  focus: CRESCENT_FOCUS,
  prevFocus: FRONDS_FOCUS,
};
