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
import type { Bullet, Carousel } from "./palm-content";
import { theme } from "./palm-content";
import type { Ring } from "./palm-geo";

/* ---------- layout (1080 x 1350) ---------- */
const RULE_X = 62;
const COL_X = 130;
const MAP_Y = 300;
const MAP_H = 560;
const MAP_W = 1080 - RULE_X; // bleeds off the right edge
const DIVIDER_X = 556;
const C1_W = 386;
const C2_X = 600;
const C2_W = 408;

/*
 * The map is served widened (public/masterplan-wide.jpg): the source is
 * 1499x1049 but the map area is far wider than that, so the canvas is extended
 * with mirrored sea to 1907x1049 - matching the viewport's aspect exactly, so
 * the whole island is visible at rest instead of being cropped.
 *
 * Geometry in palm-geo.ts is normalised against the ORIGINAL image, so ring
 * x-coordinates are remapped into the widened frame once, here.
 */
const IMG_W = 1907;
const IMG_H = 1049;
const PAD_X = 0.106974;
const SCALE_X = 0.786051;
const wide = (rings: Ring[] | undefined): Ring[] | undefined =>
  rings?.map((r) => r.map(([x, y]) => [PAD_X + x * SCALE_X, y] as [number, number]));

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

/** Where the camera sits to frame a set of rings: centre point and zoom. */
const cameraFor = (rings: Ring[] | undefined, zoom?: number) => {
  if (!rings || rings.length === 0) return { cx: 0.5, cy: 0.5, scale: 1 };
  const xs = rings.flat().map((p) => p[0]);
  const ys = rings.flat().map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const scale =
    zoom ?? Math.min(Math.max(Math.min(0.88 / (x1 - x0), 0.88 / (y1 - y0)), 1.05), 4);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, scale };
};

/** Hand-drawn feeling underline, as in the template. */
const Swoosh: React.FC<{ x: number; y: number; w: number; grow: number }> = ({
  x,
  y,
  w,
  grow,
}) => (
  <svg
    width={w}
    height={28}
    viewBox={`0 0 ${w} 28`}
    style={{ position: "absolute", left: x, top: y, overflow: "visible" }}
  >
    <path
      d={`M2 6 Q ${w * 0.45} 26 ${w - 2} 9`}
      fill="none"
      stroke={theme.red}
      strokeWidth={5}
      strokeLinecap="round"
      pathLength={1}
      style={{ strokeDasharray: 1, strokeDashoffset: 1 - grow }}
    />
  </svg>
);

export const PalmSlide: React.FC<Carousel> = ({
  tagline,
  areaName,
  propertyTypes,
  bedroomTypes,
  area,
  zoom,
  prevArea,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => sec * fps;

  // The camera starts where the previous carousel left off - or on the whole
  // island for the first one - and moves to frame this slide's area.
  const from = cameraFor(wide(prevArea));
  const to = cameraFor(wide(area), zoom);

  const scale = ease(frame, s(1), s(2.5), from.scale, to.scale);
  const cx = ease(frame, s(1), s(2.5), from.cx, to.cx);
  const cy = ease(frame, s(1), s(2.5), from.cy, to.cy);

  const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
  const tx = clamp((0.5 - cx) * MAP_W, ((scale - 1) * MAP_W) / 2);
  const ty = clamp((0.5 - cy) * MAP_H, ((scale - 1) * MAP_H) / 2);

  const prevPaths = (wide(prevArea) ?? []).map(toPath);
  const prevFade = ease(frame, s(0.4), s(1.5), 1, 0);

  const draw = ease(frame, s(2.5), s(3.7), 1, 0);
  const fill = ease(frame, s(3.7), s(4.5), 0, 0.4);
  const dim = ease(frame, s(3.7), s(4.5), 0, 0.52);

  const paths = (wide(area) as Ring[]).map(toPath);
  const maskId = `keep-${areaName.replace(/\s+/g, "")}`;
  const prevMaskId = `keep-prev-${areaName.replace(/\s+/g, "")}`;

  const reveal = (at: number) => ({
    opacity: ease(frame, s(at), s(at + 0.3), 0, 1),
    translate: `0px ${ease(frame, s(at), s(at + 0.34), 18, 0)}px`,
  });

  const para = (b: Bullet, i: number) => (
    <div key={i} style={{ ...body, marginTop: i === 0 ? 0 : 10 }}>
      {b.label ? <strong>{b.label}</strong> : null}
      {b.text}
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: theme.sans }}>
      {/* left margin rule, with the template's slight hand-drawn waver */}
      <svg width={1080} height={1350} style={{ position: "absolute" }}>
        <path
          d="M62 36 C70 120 54 190 62 262 C67 300 59 320 62 344"
          fill="none"
          stroke={theme.ink}
          strokeWidth={1.6}
          opacity={0.75}
        />
        <line
          x1={62}
          y1={MAP_Y + MAP_H + 36}
          x2={62}
          y2={1316}
          stroke={theme.ink}
          strokeWidth={1}
          opacity={0.45}
        />
        {/* decorative arc, bottom right */}
        <circle
          cx={1142}
          cy={1432}
          r={226}
          fill="none"
          stroke={theme.red}
          strokeWidth={7}
          opacity={0.95}
        />
      </svg>

      {/* masthead */}
      <div
        style={{
          position: "absolute",
          left: COL_X,
          top: 74,
          fontSize: 92,
          fontWeight: 900,
          letterSpacing: -2.6,
          lineHeight: 0.99,
          color: theme.ink,
          opacity: ease(frame, 0, s(0.7), 0, 1),
        }}
      >
        Palm
        <br />
        Jumeirah
      </div>

      {/* tagline */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 92,
          textAlign: "right",
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: 3.1,
          lineHeight: 1.75,
          color: theme.ink,
          opacity: ease(frame, s(0.25), s(0.95), 0, 1),
        }}
      >
        {tagline[0]}
        <br />
        {tagline[1]}
      </div>
      <Swoosh x={812} y={178} w={208} grow={ease(frame, s(0.6), s(1.3), 0, 1)} />

      {/* map, bleeding off the right edge */}
      <div
        style={{
          position: "absolute",
          left: RULE_X,
          top: MAP_Y,
          width: MAP_W,
          height: MAP_H,
          overflow: "hidden",
          backgroundColor: theme.ink,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
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
              filter: "saturate(0.92) contrast(1.06) brightness(0.96)",
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

            {/* the previous carousel's highlight, carried in and cleared */}
            {prevPaths.length ? (
              <g opacity={prevFade}>
                <rect
                  width={IMG_W}
                  height={IMG_H}
                  fill={theme.ink}
                  opacity={0.6}
                  mask={`url(#${prevMaskId})`}
                />
                {prevPaths.map((d, i) => (
                  <path key={`pf${i}`} d={d} fill={theme.gold} opacity={0.4} />
                ))}
                {prevPaths.map((d, i) => (
                  <path
                    key={`ps${i}`}
                    d={d}
                    fill="none"
                    stroke={theme.gold}
                    strokeWidth={2.4 / scale}
                    strokeLinejoin="round"
                    style={{
                      filter: `drop-shadow(0 0 ${2.5 / scale}px ${theme.gold}B0)`,
                    }}
                  />
                ))}
              </g>
            ) : null}

            <rect
              width={IMG_W}
              height={IMG_H}
              fill={theme.ink}
              opacity={dim}
              mask={`url(#${maskId})`}
            />

            {paths.map((d, i) => (
              <path key={`f${i}`} d={d} fill={theme.gold} opacity={fill} />
            ))}

            {paths.map((d, i) => (
              <path
                key={`s${i}`}
                d={d}
                fill="none"
                stroke={theme.gold}
                strokeWidth={2.4 / scale}
                strokeLinejoin="round"
                pathLength={1}
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: Math.max(
                    0,
                    Math.min(1, draw * (1 + (i % 4) * 0.12)),
                  ),
                  filter: `drop-shadow(0 0 ${2.5 / scale}px ${theme.gold}B0)`,
                }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* area title */}
      <div
        style={{
          position: "absolute",
          left: COL_X,
          top: 898,
          fontSize: 58,
          fontWeight: 900,
          letterSpacing: -1.5,
          color: theme.ink,
          ...reveal(4.0),
        }}
      >
        {areaName}
      </div>
      <Swoosh x={COL_X} y={972} w={262} grow={ease(frame, s(4.25), s(4.8), 0, 1)} />

      {/* column divider */}
      <div
        style={{
          position: "absolute",
          left: DIVIDER_X,
          top: 1018,
          width: 1,
          height: 268,
          backgroundColor: theme.ink,
          opacity: ease(frame, s(4.3), s(4.8), 0, 0.28),
        }}
      />

      {/* property types */}
      <div style={{ position: "absolute", left: COL_X, top: 1018, width: C1_W, ...reveal(4.22) }}>
        <div style={label}>Property Types</div>
        {propertyTypes.map((p, i) => (
          <div key={i} style={{ ...body, marginTop: i === 0 ? 0 : 10 }}>
            {p}
          </div>
        ))}
      </div>

      {/* bedroom types */}
      <div style={{ position: "absolute", left: C2_X, top: 1018, width: C2_W, ...reveal(4.44) }}>
        <div style={label}>Bedroom Types</div>
        {bedroomTypes.map(para)}
      </div>
    </AbsoluteFill>
  );
};

const label: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  letterSpacing: 2.7,
  textTransform: "uppercase",
  color: "#661A1B",
  marginBottom: 14,
};

const body: React.CSSProperties = {
  fontSize: 20,
  lineHeight: 1.44,
  color: "#13110D",
};
