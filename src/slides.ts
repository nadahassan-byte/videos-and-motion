import { z } from "zod";

/** A boundary point, normalised 0-1 against the masterplan box. */
const pointSchema = z.object({ x: z.number(), y: z.number() });

export const slideSchema = z.object({
  /** Filename of the masterplan image inside public/. */
  masterplanSrc: z.string(),
  brandLine1: z.string(),
  brandLine2: z.string(),
  slideIndex: z.number().int().min(1),
  slideTotal: z.number().int().min(1),
  title: z.string(),
  subtitle: z.string(),
  body: z.string(),
  status: z.string(),
  /** The community outline drawn over the masterplan. */
  boundary: z.array(pointSchema).min(3),
});

export type SlideProps = z.infer<typeof slideSchema>;

/** Trunk + marina district, traced against public/masterplan.jpg. */
const trunkBoundary = [
  { x: 0.455, y: 0.52 },
  { x: 0.545, y: 0.52 },
  { x: 0.575, y: 0.6 },
  { x: 0.588, y: 0.7 },
  { x: 0.585, y: 0.83 },
  { x: 0.52, y: 0.862 },
  { x: 0.47, y: 0.862 },
  { x: 0.412, y: 0.83 },
  { x: 0.415, y: 0.7 },
  { x: 0.428, y: 0.6 },
];

export const auraGardens: SlideProps = {
  masterplanSrc: "masterplan.jpg",
  brandLine1: "TILAL",
  brandLine2: "TRAVIS",
  slideIndex: 4,
  slideTotal: 16,
  title: "AURA GARDENS",
  subtitle: "3-4 bed townhouses & 4-5 bed twin villas",
  body: "Townhouses of 2,175-2,460 sq ft, and the same twin villas found in Aura 1 & 2.",
  status: "READY",
  boundary: trunkBoundary,
};

/** Second registration, to show the same template driven by different data. */
export const auraRidge: SlideProps = {
  ...auraGardens,
  slideIndex: 5,
  title: "AURA RIDGE",
  subtitle: "4-6 bed signature villas",
  body: "Elevated plots of 3,400-4,900 sq ft overlooking the central park.",
  status: "LAUNCHING",
  boundary: [
    { x: 0.22, y: 0.16 },
    { x: 0.7, y: 0.2 },
    { x: 0.86, y: 0.48 },
    { x: 0.74, y: 0.82 },
    { x: 0.34, y: 0.86 },
    { x: 0.14, y: 0.55 },
  ],
};
