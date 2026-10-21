import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Block, Carousel } from "./palm-content";
import { MASTHEAD, theme } from "./palm-content";
import type { Ring } from "./palm-geo";

/* ---------- layout (1080 x 1350) ----------
 * Positions measured off the supplied template (1122x1402) and scaled by
 * 1080/1122 = 0.9626.
 */
const W = 1080;
const H = 1350;
const MARGIN = 77;

const HEAD_TOP = 88;
const HEAD_SIZE = 132;

const BAND_T0 = 358; // photo band, left edge of the top curve
const BAND_T1 = 250; // right edge of the top curve
const BAND_B0 = 810; // left edge of the bottom curve
const BAND_B1 = 945; // right edge of the bottom curve

const AREA_TOP = 862;
const AREA_SIZE = 104;
const HAIRLINE_Y = 1016;
const PIN_Y = 1058;
const PIN_D = 11;

/* The widened map image: 1499x1049 source, extended with mirrored, blurred
 * sea to 1907x1049. Geometry is normalised against the ORIGINAL, so ring
 * x-coordinates are remapped into the widened frame here. */
const IMG_W = 1907;
const IMG_H = 1049;
const PAD_X = 0.106974;
const SCALE_X = 0.786051;
const wide = (rings: Ring[] | undefined): Ring[] | undefined =>
  rings?.map((r) => r.map(([x, y]) => [PAD_X + x * SCALE_X, y] as [number, number]));

const CONTENT_W = 1400;
const CONTENT_H = Math.round(CONTENT_W / (IMG_W / IMG_H));

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const ease = (frame: number, from: number, to: number, a: number, b: number) =>
  interpolate(frame, [from, to], [a, b], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

const toPath = (ring: Ring) =>
  ring
    .map(
      ([x, y], i) =>
        `${i === 0 ? "M" : "L"}${(x * IMG_W).toFixed(1)} ${(y * IMG_H).toFixed(1)}`,
    )
    .join(" ") + "Z";

const cameraFor = (rings: Ring[] | undefined, zoom?: number) => {
  if (!rings || rings.length === 0) return { cx: 0.5, cy: 0.5, scale: 1 };
  const xs = rings.flat().map((p) => p[0]);
  const ys = rings.flat().map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const scale =
    zoom ?? Math.min(Math.max(Math.min(0.68 / (x1 - x0), 0.68 / (y1 - y0)), 1.04), 1.45);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, scale };
};

/**
 * The photo band: a curve sweeping up from the left along the top, down the
 * right edge, then a second curve back along the bottom.
 */
const BAND_PATH =
  `M0 ${BAND_T0} ` +
  `Q ${W * 0.34} 214 ${W} ${BAND_T1} ` +
  `L ${W} ${BAND_B1} ` +
  `Q ${W * 0.46} ${BAND_B0 - 6} 0 ${BAND_B0} Z`;

export const PalmSlide: React.FC<Carousel> = ({
  areaName,
  blocks,
  area,
  zoom,
  prevArea,
  tilt = 52,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => sec * fps;

  const from = cameraFor(wide(prevArea));
  const to = cameraFor(wide(area), zoom);
  const scale = ease(frame, s(1), s(2.5), from.scale, to.scale);
  const cx = ease(frame, s(1), s(2.5), from.cx, to.cx);
  const cy = ease(frame, s(1), s(2.5), from.cy, to.cy);
  const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
  const tx = clamp((0.5 - cx) * CONTENT_W, Math.max(0, (CONTENT_W * scale - W) / 2));
  const ty = (0.5 - cy) * CONTENT_H;

  // Foreshortening eats vertical extent, so scale up and nudge down to keep
  // the island filling the band.
  const tiltNow = ease(frame, s(0.6), s(2.6), tilt * 0.72, tilt);
  const tiltZoom = (1 / Math.cos((tiltNow * Math.PI) / 180)) * 1.16;
  const tiltShift = tiltNow * 0.3;

  const prevPaths = (wide(prevArea) ?? []).map(toPath);
  const prevFade = ease(frame, s(0.4), s(1.5), 1, 0);
  const draw = ease(frame, s(2.5), s(3.7), 1, 0);
  const fill = ease(frame, s(3.7), s(4.5), 0, 0.4);
  const dim = ease(frame, s(3.7), s(4.5), 0, 0.5);
  const paths = (wide(area) as Ring[]).map(toPath);
  const maskId = `keep-${areaName.replace(/\s+/g, "")}`;
  const prevMaskId = `keep-prev-${areaName.replace(/\s+/g, "")}`;

  const rise = (at: number, dur = 0.26, dist = 14) => ({
    opacity: ease(frame, s(at), s(at + dur), 0, 1),
    translate: `0px ${ease(frame, s(at), s(at + dur + 0.04), dist, 0)}px`,
  });

  /* Columns: the pin lands first, then the words follow straight after. */
  const COLS = blocks.length;
  const gutter = 34;
  const colW = (W - MARGIN * 2 - gutter * (COLS - 1)) / COLS;
  const colX = (i: number) => MARGIN + i * (colW + gutter);
  const PIN_AT = (i: number) => 4.0 + i * 0.3;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      {/* soft palm shadows, top-right and bottom-right */}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <filter id="blur18">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <clipPath id="band">
            <path d={BAND_PATH} />
          </clipPath>
        </defs>
        <g filter="url(#blur18)" opacity={0.1}>
          {[0, 24, 48, 72, 96].map((a, i) => (
            <path
              key={`a${i}`}
              d={`M1140 -40 Q ${900 - i * 40} ${80 + i * 26} ${760 - i * 58} ${
                200 + i * 40
              } Q ${920 - i * 30} ${90 + i * 20} 1140 -40 Z`}
              fill={theme.ink}
              transform={`rotate(${a} 1140 -40)`}
            />
          ))}
          {[0, 30, 60].map((a, i) => (
            <path
              key={`b${i}`}
              d={`M1150 1420 Q ${900 - i * 40} ${1300 - i * 26} ${790 - i * 54} ${
                1180 - i * 36
              } Q ${930 - i * 30} ${1300 - i * 18} 1150 1420 Z`}
              fill={theme.ink}
              transform={`rotate(${a} 1150 1420)`}
            />
          ))}
        </g>
      </svg>

      {/* masthead */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: HEAD_TOP,
          width: W - MARGIN * 2,
          fontFamily: theme.display,
          fontSize: HEAD_SIZE,
          lineHeight: 1,
          letterSpacing: -1,
          color: theme.ink,
          ...rise(0, 0.5, 16),
        }}
      >
        {MASTHEAD}
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 250,
          height: 3,
          backgroundColor: theme.maroon,
          width: ease(frame, s(0.4), s(1.0), 0, 168),
        }}
      />

      {/* maroon inlay following the band's lower curve */}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <path
          d={
            `M0 ${BAND_B0} ` +
            `Q ${W * 0.46} ${BAND_B0 - 6} ${W} ${BAND_B1} ` +
            `L ${W} ${BAND_B1 + 74} ` +
            `Q ${W * 0.46} ${BAND_B0 + 36} 0 ${BAND_B0 + 8} Z`
          }
          fill={theme.maroon}
        />
      </svg>

      {/* photo band */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `path('${BAND_PATH}')`,
          WebkitClipPath: `path('${BAND_PATH}')`,
          // Where the tilted plane recedes, this reads as horizon haze rather
          // than an empty corner.
          background:
            "linear-gradient(to bottom, #C3CFD6 0%, #8AA3B2 26%, #3E6376 58%, #16202A 100%)",
        }}
      >
        {/*
          * Laid back into perspective so the flat satellite reads as an
          * oblique aerial. The highlight lives inside this wrapper, so it
          * tilts with the land instead of floating over it.
          */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            perspective: 1150,
            perspectiveOrigin: "50% 44%",
          }}
        >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotateX(${tiltNow}deg) scale(${tiltZoom}) translateY(${tiltShift}px)`,
            transformOrigin: "50% 50%",
          }}
        >
        <div
          style={{
            position: "absolute",
            left: (W - CONTENT_W) / 2,
            top: (BAND_T0 + BAND_B1) / 2 - CONTENT_H / 2,
            width: CONTENT_W,
            height: CONTENT_H,
            transformOrigin: `${cx * 100}% ${cy * 100}%`,
            scale,
            translate: `${tx}px ${ty}px`,
          }}
        >
          <CanvasImage
            src={staticFile("masterplan-wide.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(0.9) contrast(1.04) brightness(1.0)",
            }}
          />
          <svg
            viewBox={`0 0 ${IMG_W} ${IMG_H}`}
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <defs>
              <mask id={maskId}>
                <rect width={IMG_W} height={IMG_H} fill="white" />
                {paths.map((d, i) => (
                  <path key={i} d={d} fill="black" />
                ))}
              </mask>
              {prevPaths.length ? (
                <mask id={prevMaskId}>
                  <rect width={IMG_W} height={IMG_H} fill="white" />
                  {prevPaths.map((d, i) => (
                    <path key={i} d={d} fill="black" />
                  ))}
                </mask>
              ) : null}
            </defs>
            {prevPaths.length ? (
              <g opacity={prevFade}>
                <rect
                  width={IMG_W}
                  height={IMG_H}
                  fill="#1C1510"
                  opacity={0.5}
                  mask={`url(#${prevMaskId})`}
                />
                {prevPaths.map((d, i) => (
                  <path key={`pf${i}`} d={d} fill={theme.hi} opacity={0.4} />
                ))}
                {prevPaths.map((d, i) => (
                  <path
                    key={`ps${i}`}
                    d={d}
                    fill="none"
                    stroke={theme.hi}
                    strokeWidth={2.4 / scale}
                    strokeLinejoin="round"
                    style={{ filter: `drop-shadow(0 0 ${3 / scale}px ${theme.hi})` }}
                  />
                ))}
              </g>
            ) : null}
            <rect
              width={IMG_W}
              height={IMG_H}
              fill="#1C1510"
              opacity={dim}
              mask={`url(#${maskId})`}
            />
            {paths.map((d, i) => (
              <path key={`f${i}`} d={d} fill={theme.hi} opacity={fill} />
            ))}
            {paths.map((d, i) => (
              <path
                key={`s${i}`}
                d={d}
                fill="none"
                stroke={theme.hi}
                strokeWidth={2.4 / scale}
                strokeLinejoin="round"
                pathLength={1}
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: Math.max(0, Math.min(1, draw * (1 + (i % 4) * 0.12))),
                  filter: `drop-shadow(0 0 ${3 / scale}px ${theme.hi})`,
                }}
              />
            ))}
          </svg>
        </div>
        </div>
        </div>
      </div>

      {/* area name */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: AREA_TOP,
          fontFamily: theme.display,
          fontSize: AREA_SIZE,
          lineHeight: 1,
          color: theme.ink,
          ...rise(3.4, 0.4, 14),
        }}
      >
        {areaName}
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 971,
          height: 3,
          backgroundColor: theme.maroon,
          width: ease(frame, s(3.7), s(4.1), 0, 101),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: HAIRLINE_Y,
          height: 1,
          backgroundColor: theme.rule,
          width: ease(frame, s(3.8), s(4.5), 0, W - MARGIN * 2),
        }}
      />

      {/* columns */}
      {blocks.map((b: Block, i) => {
        const at = PIN_AT(i);
        return (
          <React.Fragment key={i}>
            {/* the vertical hairline, drawn down from the pin */}
            <div
              style={{
                position: "absolute",
                left: colX(i),
                top: PIN_Y,
                width: 1,
                backgroundColor: theme.rule,
                height: ease(frame, s(at + 0.1), s(at + 0.45), 0, 212),
              }}
            />
            {/* the pin lands first */}
            <div
              style={{
                position: "absolute",
                left: colX(i) - PIN_D / 2,
                top: PIN_Y - PIN_D / 2,
                width: PIN_D,
                height: PIN_D,
                borderRadius: 999,
                backgroundColor: theme.gold,
                opacity: ease(frame, s(at), s(at + 0.1), 0, 1),
                scale: interpolate(
                  frame,
                  [s(at), s(at + 0.16), s(at + 0.28)],
                  [0, 1.5, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
                ),
              }}
            />
            {/* then the words, quickly */}
            <div
              style={{
                position: "absolute",
                left: colX(i) + 39,
                top: PIN_Y - 18,
                width: colW - 39,
              }}
            >
              <div
                style={{
                  fontFamily: theme.display,
                  fontSize: COLS > 2 ? 30 : 35,
                  lineHeight: 1.12,
                  color: theme.ink,
                  ...rise(at + 0.18, 0.2, 10),
                }}
              >
                {b.title}
              </div>
              {b.range ? (
                <div
                  style={{
                    marginTop: 12,
                    fontFamily: theme.text,
                    fontSize: COLS > 2 ? 14 : 15.5,
                    letterSpacing: 3,
                    color: theme.maroon,
                    ...rise(at + 0.28, 0.2, 10),
                  }}
                >
                  {b.range}
                </div>
              ) : null}
              <div
                style={{
                  marginTop: 20,
                  fontFamily: theme.text,
                  fontSize: COLS > 2 ? 18 : 20,
                  lineHeight: 1.55,
                  color: theme.body,
                  ...rise(at + 0.36, 0.22, 10),
                }}
              >
                {b.body}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
