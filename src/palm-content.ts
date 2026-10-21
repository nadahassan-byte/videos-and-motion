import type { Ring } from "./palm-geo";
import { crescent, fronds, trunk } from "./palm-geo";

/** One column: a gold pin, a serif title, a bedroom range and a paragraph. */
export type Block = {
  title: string;
  range?: string;
  body: string;
};

export type Carousel = {
  /** Area name at the top of the card, e.g. "The Trunk". */
  areaName: string;
  /** Letterspaced line under the rule, e.g. "APARTMENTS & PENTHOUSES". */
  subtitle: string;
  blocks: Block[];
  area: Ring[];
  /** Overrides the auto-computed camera push when set. */
  zoom?: number;
  /**
   * Degrees the map is laid back into perspective. 0 is flat top-down, ~52
   * reads like an oblique aerial photograph.
   */
  tilt?: number;
  /**
   * The area the previous carousel ended on. When set, this slide opens on
   * that exact camera and highlight and moves on from it, so the three read
   * as one continuous journey rather than three separate zoom-ins.
   */
  prevArea?: Ring[];
};

export const MASTHEAD = "Palm Jumeirah";

export const theme = {
  /** Sampled from the approved template. */
  card: "#EDE0D0",
  ink: "#1F1F1F",
  body: "#6B5D4F",
  gold: "#A8895F",
  circle: "#DCCBB6",
  rule: "#C8AA8E",
  /** Highlight on the map. */
  hi: "#E8C07A",
  display: '"Didot", "Bodoni 72", "Playfair Display", Georgia, "Liberation Serif", serif',
  text: 'Georgia, "Liberation Serif", "Times New Roman", serif',
} as const;

/** Copy taken verbatim from the supplied template artwork. */
export const TRUNK: Carousel = {
  areaName: "The Trunk",
  subtitle: "APARTMENTS & PENTHOUSES",
  blocks: [
    {
      title: "Waterfront Apartments",
      range: "STUDIOS – 3 BEDROOMS",
      body: "A mix of contemporary residences across developments such as Shoreline Apartments, Golden Mile, Oceana and Tiara.",
    },
    {
      title: "Penthouses & Duplexes",
      range: "4 BEDROOMS",
      body: "Spacious residences offering generous layouts, elevated views and access to the island's lifestyle amenities.",
    },
  ],
  area: trunk,
};

/** Copy taken verbatim from the written brief. */
export const FRONDS: Carousel = {
  areaName: "The Fronds",
  subtitle: "VILLAS & MANSIONS",
  blocks: [
    {
      title: "Garden Homes",
      range: "4–5 BEDROOMS",
      body: "4–5-bedroom villas with private gardens and swimming pools.",
    },
    {
      title: "Signature Villas",
      range: "5–7 BEDROOMS",
      body: "5–7-bedroom luxury villas on larger waterfront plots.",
    },
    {
      title: "Custom Mansions",
      range: "6+ BEDROOMS",
      body: "Typically 6+ bedrooms, including bespoke residences on prime frond locations.",
    },
  ],
  area: fronds,
  prevArea: trunk,
};

/** Copy taken verbatim from the written brief. */
export const CRESCENT: Carousel = {
  areaName: "The Crescent",
  subtitle: "BRANDED RESIDENCES",
  blocks: [
    {
      title: "Branded Apartments",
      range: "2–4 BEDROOMS",
      body: "Typically 2–4 bedrooms with access to luxury resort amenities.",
    },
    {
      title: "Penthouses & Sky Villas",
      range: "4–6+ BEDROOMS",
      body: "Typically 4–6+ bedrooms, featuring expansive layouts and panoramic sea views.",
    },
  ],
  area: crescent,
  prevArea: fronds,
};
