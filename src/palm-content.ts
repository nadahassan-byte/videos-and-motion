import type { Ring } from "./palm-geo";
import { crescent, fronds, trunk } from "./palm-geo";

/** One of the icon-led blocks down the left column. */
export type Block = {
  title: string;
  /** Small caps line under the title, e.g. "STUDIOS – 3 BEDROOMS". */
  range?: string;
  body: string;
};

export type Carousel = {
  areaName: [string, string];
  subtitle: string;
  intro: string;
  blocks: Block[];
  area: Ring[];
  /** Overrides the auto-computed camera push when set. */
  zoom?: number;
  /**
   * The area the previous carousel ended on. When set, this slide opens on
   * that exact camera and highlight and moves on from it, so the three read
   * as one continuous journey rather than three separate zoom-ins.
   */
  prevArea?: Ring[];
};

export const theme = {
  /** Sampled from the approved template. */
  bg: "#F2E9DC",
  ink: "#111111",
  body: "#56514A",
  rule: "#C6BCAC",
  circle: "#DDCEB8",
  gold: "#E0B472",
  glow: "#FCCE8B",
  sans: '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif',
} as const;

/** Copy taken verbatim from the supplied template artwork. */
export const TRUNK: Carousel = {
  areaName: ["The", "Trunk"],
  subtitle: "APARTMENTS & PENTHOUSES",
  intro:
    "The Trunk serves as the central artery of Palm Jumeirah and is primarily dedicated to mid-rise to high-rise residential buildings.",
  blocks: [
    {
      title: "WATERFRONT\nAPARTMENTS",
      range: "STUDIOS – 3 BEDROOMS",
      body: "A mix of contemporary residences across developments such as Shoreline Apartments, Golden Mile, Oceana and Tiara.",
    },
    {
      title: "PENTHOUSES\n& DUPLEXES",
      range: "4 BEDROOMS",
      body: "Spacious residences offering generous layouts, elevated views and access to the island's lifestyle amenities.",
    },
  ],
  area: trunk,
};

/** Copy taken verbatim from the written brief. */
export const FRONDS: Carousel = {
  areaName: ["The", "Fronds"],
  subtitle: "VILLAS & MANSIONS",
  intro:
    "Private beachfront villas across 16 gated residential fronds, comprising Garden Homes, Signature Villas and custom-built mansions.",
  blocks: [
    {
      title: "GARDEN HOMES",
      body: "4–5-bedroom villas with private gardens and swimming pools.",
    },
    {
      title: "SIGNATURE VILLAS",
      body: "5–7-bedroom luxury villas on larger waterfront plots.",
    },
    {
      title: "CUSTOM MANSIONS",
      body: "Typically 6+ bedrooms, including bespoke residences on prime frond locations.",
    },
  ],
  area: fronds,
  prevArea: trunk,
};

/** Copy taken verbatim from the written brief. */
export const CRESCENT: Carousel = {
  areaName: ["The", "Crescent"],
  subtitle: "BRANDED RESIDENCES",
  intro:
    "Ultra-luxury branded residences, resort apartments, penthouses, sky villas and select beachfront mansions. Notable residences include Atlantis The Royal Residences and XXI Carat.",
  blocks: [
    {
      title: "BRANDED APARTMENTS",
      body: "Typically 2–4 bedrooms with access to luxury resort amenities.",
    },
    {
      title: "PENTHOUSES\n& SKY VILLAS",
      body: "Typically 4–6+ bedrooms, featuring expansive layouts and panoramic sea views.",
    },
  ],
  area: crescent,
  prevArea: fronds,
};
