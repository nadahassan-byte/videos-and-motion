import type { Ring } from "./palm-geo";
import { crescent, fronds, trunk } from "./palm-geo";

/** A bedroom-type line: optional bold lead-in, then the rest of the sentence. */
export type Bullet = { label?: string; text: string };

export type Carousel = {
  /** Small letterspaced line in the top-right corner. */
  tagline: [string, string];
  areaName: string;
  propertyTypes: string[];
  bedroomTypes: Bullet[];
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
  bg: "#E8DED1",
  ink: "#13110D",
  red: "#661A1B",
  gold: "#B39F74",
  sans: '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif',
} as const;

export const TRUNK: Carousel = {
  tagline: ["ICONIC DESTINATION.", "TIMELESS APPEAL."],
  areaName: "The Trunk",
  propertyTypes: [
    "Waterfront apartments, luxury residential towers, duplexes and penthouses.",
    "Notable developments include Shoreline Apartments, Golden Mile, Oceana, Tiara and The Palm Tower.",
  ],
  bedroomTypes: [
    { text: "Studios to 3-bedroom apartments." },
    {
      text: "4-bedroom penthouses and duplexes, offering larger layouts and premium views.",
    },
  ],
  area: trunk,
};

export const FRONDS: Carousel = {
  tagline: ["ICONIC DESTINATION.", "TIMELESS APPEAL."],
  areaName: "The Fronds",
  propertyTypes: [
    "Private beachfront villas across 16 gated residential fronds, comprising Garden Homes, Signature Villas and custom-built mansions.",
  ],
  bedroomTypes: [
    {
      label: "Garden Homes:",
      text: " 4–5-bedroom villas with private gardens and swimming pools.",
    },
    {
      label: "Signature Villas:",
      text: " 5–7-bedroom luxury villas on larger waterfront plots.",
    },
    {
      label: "Custom Mansions:",
      text: " Typically 6+ bedrooms, including bespoke residences on prime frond locations.",
    },
  ],
  area: fronds,
  prevArea: trunk,
};

export const CRESCENT: Carousel = {
  tagline: ["ICONIC DESTINATION.", "TIMELESS APPEAL."],
  areaName: "The Crescent",
  propertyTypes: [
    "Ultra-luxury branded residences, resort apartments, penthouses, sky villas and select beachfront mansions.",
    "Notable residences include Atlantis The Royal Residences and XXI Carat.",
  ],
  bedroomTypes: [
    {
      label: "Branded Apartments:",
      text: " Typically 2–4 bedrooms with access to luxury resort amenities.",
    },
    {
      label: "Penthouses & Sky Villas:",
      text: " Typically 4–6+ bedrooms, featuring expansive layouts and panoramic sea views.",
    },
  ],
  area: crescent,
  prevArea: fronds,
};
