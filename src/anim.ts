import { Easing, interpolate } from "remotion";

/**
 * One slow, asymmetric curve used everywhere: a gentle departure and a long
 * settle, with no overshoot anywhere in the piece.
 */
export const EASE = Easing.bezier(0.33, 0, 0.1, 1);

/** Interpolate between two times given in seconds. */
export const at = (
  frame: number,
  fps: number,
  from: number,
  to: number,
  a: number,
  b: number,
) =>
  interpolate(frame, [from * fps, to * fps], [a, b], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

/** Fade up while sliding a few pixels. Never bounces. */
export const rise = (
  frame: number,
  fps: number,
  start: number,
  dur = 0.7,
  dist = 18,
) => ({
  opacity: at(frame, fps, start, start + dur * 0.8, 0, 1),
  translate: `0px ${at(frame, fps, start, start + dur, dist, 0)}px`,
});
