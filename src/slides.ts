import { z } from "zod";

/** A boundary point, normalised 0-1 against the masterplan box. */
const pointSchema = z.object({ x: z.number(), y: z.number() });

export const slideSchema = z.object({
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

/** The outline traced over the masterplan. Replace with the real plot shape. */
const auraGardensBoundary = [
  { x: 0.17, y: 0.2 },
  { x: 0.56, y: 0.14 },
  { x: 0.84, y: 0.22 },
  { x: 0.87, y: 0.62 },
  { x: 0.63, y: 0.66 },
  { x: 0.58, y: 0.88 },
  { x: 0.3, y: 0.84 },
  { x: 0.13, y: 0.52 },
];

export const auraGardens: SlideProps = {
  brandLine1: "TILAL",
  brandLine2: "TRAVIS",
  slideIndex: 4,
  slideTotal: 16,
  title: "AURA GARDENS",
  subtitle: "3-4 bed townhouses & 4-5 bed twin villas",
  body: "Townhouses of 2,175-2,460 sq ft, and the same twin villas found in Aura 1 & 2.",
  status: "READY",
  boundary: auraGardensBoundary,
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
