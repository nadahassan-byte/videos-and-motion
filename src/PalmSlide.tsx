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
import { theme } from "./palm-content";
import type { Ring } from "./palm-geo";

/* ---------- layout (1080 x 1350) ---------- */
const RULE_X = 56;
const COL_X = 104;
const COL_W = 360;
const MAP_X = 372;
const MAP_W = 1080 - MAP_X;
/*
 * The aerial is wide and short; this column is tall and narrow. Filling the
 * column would crop the island down to a strip, so the map is laid in at a
 * size where the whole island reads, and the column fades it into the cream
 * at top and bottom instead.
 */
const CONTENT_W = 1140;
const CONTENT_H = 1350;

/*
 * The map is served widened (public/masterplan-wide.jpg): the source is
 * 1499x1049, extended with mirrored, blurred sea to 1907x1049. Geometry in
 * palm-geo.ts is normalised against the ORIGINAL image, so ring x-coordinates
 * are remapped into the widened frame here.
 */
const IMG_W = 1907;
const IMG_H = 2257;
const PAD_X = 0.106974;
const SCALE_X = 0.786051;
const PAD_Y = 0.267612;
const SCALE_Y = 0.464776;
const wide = (rings: Ring[] | undefined): Ring[] | undefined =>
  rings?.map((r) =>
    r.map(([x, y]) => [PAD_X + x * SCALE_X, PAD_Y + y * SCALE_Y] as [number, number]),
  );

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
    zoom ?? Math.min(Math.max(Math.min(0.62 / (x1 - x0), 0.62 / (y1 - y0)), 1.05), 1.4);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, scale };
};

/** Line-art tower, as in the template's circular badges. */
const TowerIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="9" y="11" width="13" height="22" stroke={theme.ink} strokeWidth="1.4" />
    <rect x="22" y="17" width="9" height="16" stroke={theme.ink} strokeWidth="1.4" />
    {[15, 20, 25].map((y) => (
      <React.Fragment key={y}>
        <line x1="12" y1={y} x2="15" y2={y} stroke={theme.ink} strokeWidth="1.2" />
        <line x1="17" y1={y} x2="20" y2={y} stroke={theme.ink} strokeWidth="1.2" />
      </React.Fragment>
    ))}
    {[21, 26].map((y) => (
      <line key={y} x1="25" y1={y} x2="28" y2={y} stroke={theme.ink} strokeWidth="1.2" />
    ))}
  </svg>
);

export const PalmSlide: React.FC<Carousel> = ({
  areaName,
  subtitle,
  intro,
  blocks,
  area,
  zoom,
  prevArea,
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
  const tx = clamp(
    (0.5 - cx) * CONTENT_W,
    Math.max(0, (CONTENT_W * scale - MAP_W) / 2),
  );
  const ty = (0.5 - cy) * CONTENT_H;

  const prevPaths = (wide(prevArea) ?? []).map(toPath);
  const prevFade = ease(frame, s(0.4), s(1.5), 1, 0);

  const draw = ease(frame, s(2.5), s(3.7), 1, 0);
  const fill = ease(frame, s(3.7), s(4.5), 0, 0.42);
  const dim = ease(frame, s(3.7), s(4.5), 0, 0.5);

  const paths = (wide(area) as Ring[]).map(toPath);
  const maskId = `keep-${areaName.join("")}`;
  const prevMaskId = `keep-prev-${areaName.join("")}`;

  const rise = (at: number) => ({
    opacity: ease(frame, s(at), s(at + 0.32), 0, 1),
    translate: `0px ${ease(frame, s(at), s(at + 0.38), 20, 0)}px`,
  });

  // Three blocks need to breathe less than two.
  const tight = blocks.length > 2;
  const iconD = tight ? 46 : 54;
  const blockGap = tight ? 30 : 52;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: theme.sans }}>
      {/* soft palm shadow falling across the top-left, as in the template */}
      <svg width={1080} height={1350} style={{ position: "absolute" }}>
        <defs>
          <filter id="soften">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <g filter="url(#soften)" opacity={0.12}>
          {[-28, -8, 12, 34, 58, 84].map((a, i) => (
            <path
              key={i}
              d={`M-40 -30 Q ${120 + i * 26} ${40 + i * 18} ${250 + i * 34} ${
                150 + i * 46
              } Q ${110 + i * 22} ${60 + i * 20} -40 -30 Z`}
              fill={theme.ink}
              transform={`rotate(${a} -40 -30)`}
            />
          ))}
        </g>
        <line
          x1={RULE_X}
          y1={120}
          x2={RULE_X}
          y2={1236}
          stroke={theme.ink}
          strokeWidth={1}
          opacity={0.35}
        />
      </svg>

      {/* map: bleeds off the right and bottom, fading in from the cream */}
      <div
        style={{
          position: "absolute",
          left: MAP_X,
          top: 0,
          width: MAP_W,
          height: 1350,
          overflow: "hidden",
          maskImage:
            "linear-gradient(to right, transparent 0px, black 210px, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0px, black 210px, black 100%)",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            left: (MAP_W - CONTENT_W) / 2,
            top: (1350 - CONTENT_H) / 2,
            width: CONTENT_W,
            height: CONTENT_H,
            transformOrigin: `${cx * 100}% ${cy * 100}%`,
            scale,
            translate: `${tx}px ${ty}px`,
          }}
        >
          <CanvasImage
            src={staticFile("masterplan-tall.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(0.86) contrast(1.05) brightness(1.02)",
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
                  fill="#2A2115"
                  opacity={0.5}
                  mask={`url(#${prevMaskId})`}
                />
                {prevPaths.map((d, i) => (
                  <path key={`pf${i}`} d={d} fill={theme.gold} opacity={0.42} />
                ))}
                {prevPaths.map((d, i) => (
                  <path
                    key={`ps${i}`}
                    d={d}
                    fill="none"
                    stroke={theme.glow}
                    strokeWidth={2.4 / scale}
                    strokeLinejoin="round"
                    style={{
                      filter: `drop-shadow(0 0 ${3 / scale}px ${theme.glow})`,
                    }}
                  />
                ))}
              </g>
            ) : null}

            <rect
              width={IMG_W}
              height={IMG_H}
              fill="#2A2115"
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
                stroke={theme.glow}
                strokeWidth={2.4 / scale}
                strokeLinejoin="round"
                pathLength={1}
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: Math.max(
                    0,
                    Math.min(1, draw * (1 + (i % 4) * 0.12)),
                  ),
                  filter: `drop-shadow(0 0 ${3 / scale}px ${theme.glow})`,
                }}
              />
            ))}
          </svg>
        </div>
        </div>
      </div>

      {/* thin arc sweeping across the map, as in the template */}
      <svg width={1080} height={1350} style={{ position: "absolute", pointerEvents: "none" }}>
        <circle
          cx={726}
          cy={742}
          r={602}
          fill="none"
          stroke={theme.ink}
          strokeWidth={1}
          opacity={0.22}
        />
      </svg>

      {/* left column */}
      <div style={{ position: "absolute", left: COL_X, top: 136, width: COL_W }}>
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 0.94,
            letterSpacing: -2.4,
            color: theme.ink,
            ...rise(0),
          }}
        >
          {areaName[0]}
          <br />
          {areaName[1]}
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: 4.2,
            color: theme.ink,
            ...rise(0.3),
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            marginTop: 26,
            height: 1,
            backgroundColor: theme.rule,
            width: ease(frame, s(0.55), s(1.15), 0, 68),
          }}
        />

        <div
          style={{
            marginTop: 24,
            fontSize: 17.5,
            lineHeight: 1.62,
            color: theme.body,
            ...rise(0.7),
          }}
        >
          {intro}
        </div>

        {blocks.map((b: Block, i) => (
          <div key={i} style={{ marginTop: blockGap, ...rise(4.0 + i * 0.3) }}>
            {i > 0 ? (
              <div
                style={{
                  width: 68,
                  height: 1,
                  backgroundColor: theme.rule,
                  marginBottom: blockGap,
                }}
              />
            ) : null}
            <div
              style={{
                width: iconD,
                height: iconD,
                borderRadius: 999,
                backgroundColor: theme.circle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TowerIcon size={iconD * 0.56} />
            </div>
            <div
              style={{
                marginTop: 20,
                fontSize: tight ? 17 : 18,
                fontWeight: 700,
                letterSpacing: 2.6,
                lineHeight: 1.35,
                color: theme.ink,
                whiteSpace: "pre-line",
              }}
            >
              {b.title}
            </div>
            {b.range ? (
              <div
                style={{
                  marginTop: 9,
                  fontSize: 13.5,
                  letterSpacing: 2.4,
                  color: theme.body,
                }}
              >
                {b.range}
              </div>
            ) : null}
            <div
              style={{
                marginTop: 12,
                fontSize: tight ? 15.5 : 16.5,
                lineHeight: 1.58,
                color: theme.body,
              }}
            >
              {b.body}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
