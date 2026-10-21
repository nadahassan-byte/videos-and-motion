import { z } from "zod";

/** A boundary point, normalised 0-1 against the masterplan box. */
const pointSchema = z.object({ x: z.number(), y: z.number() });

export const slideSchema = z.object({
  /** Filename of the masterplan image inside public/. */
  masterplanSrc: z.string(),
  slideIndex: z.number().int().min(1),
  slideTotal: z.number().int().min(1),
  title: z.string(),
  subtitle: z.string(),
  body: z.string(),
  status: z.string(),
  /** How far the camera pushes into the boundary. 1 = no zoom. */
  zoom: z.number().min(1),
  /** The community outline drawn over the masterplan. */
  boundary: z.array(pointSchema).min(3),
});

export type SlideProps = z.infer<typeof slideSchema>;

/** Frond A, traced against public/masterplan.jpg (top-left frond). */
const frondABoundary = [
  { x: 0.352, y: 0.218 },
  { x: 0.372, y: 0.208 },
  { x: 0.4, y: 0.224 },
  { x: 0.432, y: 0.245 },
  { x: 0.462, y: 0.264 },
  { x: 0.488, y: 0.278 },
  { x: 0.486, y: 0.292 },
  { x: 0.456, y: 0.28 },
  { x: 0.424, y: 0.261 },
  { x: 0.394, y: 0.241 },
  { x: 0.368, y: 0.236 },
  { x: 0.35, y: 0.232 },
];

export const auraGardens: SlideProps = {
  masterplanSrc: "masterplan.jpg",
  slideIndex: 1,
  slideTotal: 16,
  title: "FROND A",
  subtitle: "3-4 bedroom townhouses",
  body: "",
  status: "READY",
  zoom: 3.5,
  boundary: frondABoundary,
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
