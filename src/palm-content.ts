import type { Ring } from "./palm-geo";
import { crescent, fronds, trunk } from "./palm-geo";

/** One column: title, bedroom range, one line of detail. */
export type Block = { title: string; range: string; body: string };

export type Carousel = {
  areaName: string;
  category: string;
  blocks: [Block, Block];
  /** Position in the 01-02-03 timeline. */
  step: 1 | 2 | 3;
  area: Ring[];
  zoom?: number;
  /** The area the previous carousel ended on, for a continuous camera. */
  prevArea?: Ring[];
};

export const MASTHEAD = "PALM JUMEIRAH";
export const SUBHEAD = "DUBAI, UAE";
export const STEPS = ["Trunk", "Fronds", "Crescent"] as const;

/**
 * Landmark pins over the establishing shot, in coordinates normalised against
 * the ORIGINAL satellite image. Positions are read off the island by eye:
 * Atlantis, the Crescent, the Fronds, the Trunk and Nakheel Mall are
 * confident; The Pointe and Palm West Beach are placed as the template draws
 * them and are worth checking.
 */
export type Pin = {
  label: string;
  at: [number, number];
  /** Where the label sits relative to the pin. */
  side: "left" | "right" | "above";
};

export const PINS: Pin[] = [
  { label: "ATLANTIS\nTHE PALM", at: [0.497, 0.052], side: "above" },
  { label: "THE CRESCENT", at: [0.213, 0.252], side: "left" },
  { label: "THE POINTE", at: [0.792, 0.330], side: "right" },
  { label: "THE FRONDS", at: [0.330, 0.405], side: "left" },
  { label: "NAKHEEL MALL", at: [0.556, 0.600], side: "right" },
  { label: "PALM\nWEST BEACH", at: [0.163, 0.610], side: "left" },
  { label: "THE TRUNK", at: [0.520, 0.730], side: "right" },
];

/** Every area outlined at once, for the opening beat. */
export const WHOLE_ISLAND: Ring[] = [...trunk, ...fronds, ...crescent];

export const theme = {
  /** Sampled from the approved artwork. */
  light: "#F7F3EA",
  body: "#CFD3D2",
  gold: "#F0CE9A",
  goldDim: "#B79A6B",
  /**
   * Area highlight. Red rather than gold: gold sat too close to the sand and
   * the warm light in the satellite image to read clearly.
   */
  hi: "#D1273A",
  oxblood: "#73222D",
  display: '"Didot", "Bodoni 72", "Playfair Display", Georgia, "Liberation Serif", serif',
  text: '"Avenir Next", Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif',
} as const;

/** Copy taken verbatim from the brief. */
export const TRUNK: Carousel = {
  areaName: "The Trunk",
  category: "APARTMENTS & PENTHOUSES",
  blocks: [
    {
      title: "Waterfront Apartments",
      range: "STUDIOS–3 BEDROOMS",
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
};

export const FRONDS: Carousel = {
  areaName: "The Fronds",
  category: "PRIVATE BEACHFRONT VILLAS",
  blocks: [
    {
      title: "Garden Homes",
      range: "4–5 BEDROOMS",
      body: "Private waterfront villas with gardens, swimming pools and direct beach access.",
    },
    {
      title: "Signature Villas & Custom Mansions",
      range: "5–7+ BEDROOMS",
      body: "Larger residences on generous waterfront plots, including individually designed mansions.",
    },
  ],
  step: 2,
  area: fronds,
  prevArea: trunk,
};

/**
 * The brief was truncated mid-sentence for this slide, so its copy is taken
 * from the supplied artwork instead.
 */
export const CRESCENT: Carousel = {
  areaName: "The Crescent",
  category: "BRANDED RESIDENCES & PENTHOUSES",
  blocks: [
    {
      title: "Branded Apartments",
      range: "2–4 BEDROOMS",
      body: "Private beaches and five-star resort living.",
    },
    {
      title: "Penthouses & Sky Villas",
      range: "4–6+ BEDROOMS",
      body: "Expansive homes with panoramic sea views.",
    },
  ],
  step: 3,
  area: crescent,
  prevArea: fronds,
};
