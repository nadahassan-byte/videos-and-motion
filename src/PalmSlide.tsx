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
import type { Carousel } from "./palm-content";
import { theme } from "./palm-content";
import type { Ring } from "./palm-geo";

/* ---------- layout (1080 x 1350) ---------- */
const RULE_X = 72;
const COL_X = 118;
const COL_W = 880;
const MAP_Y = 258;
const MAP_H = 616;
const BOX_Y = 910;
const BOX_H = 380;
const BOX_PAD = 32;

/* The map image, in its own aspect. Normalised geometry maps onto this box. */
const IMG_W = 1499;
const IMG_H = 1049;

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

/** Bounding box of every ring, used to aim and size the camera push. */
const bounds = (rings: Ring[]) => {
  const xs = rings.flat().map((p) => p[0]);
  const ys = rings.flat().map((p) => p[1]);
  return {
    x0: Math.min(...xs),
    x1: Math.max(...xs),
    y0: Math.min(...ys),
    y1: Math.max(...ys),
  };
};

export const PalmSlide: React.FC<Carousel> = ({
  areaName,
  propertyTypes,
  bedroomTypes,
  area,
  zoom,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => sec * fps;

  const b = bounds(area);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  // Push in until the area fills ~88% of the frame, never past legibility.
  const target =
    zoom ??
    Math.min(Math.max(Math.min(0.88 / (b.x1 - b.x0), 0.88 / (b.y1 - b.y0)), 1.05), 4);

  const scale = ease(frame, s(1), s(2.5), 1, target);
  const travel = ease(frame, s(1), s(2.5), 0, 1);
  // Never pan further than the zoom has overhang, or background shows through
  // at the edge of the viewport.
  const clamp = (v: number, limit: number) =>
    Math.max(-limit, Math.min(limit, v));
  const tx = clamp((0.5 - cx) * COL_W * travel, ((scale - 1) * COL_W) / 2);
  const ty = clamp((0.5 - cy) * MAP_H * travel, ((scale - 1) * MAP_H) / 2);

  const draw = ease(frame, s(2.5), s(3.7), 1, 0);
  const fill = ease(frame, s(3.7), s(4.5), 0, 0.4);
  const dim = ease(frame, s(3.7), s(4.5), 0, 0.6);

  const paths = area.map(toPath);
  const maskId = `keep-${areaName.replace(/\s+/g, "")}`;

  /** Content blocks rise and fade, one after another. */
  const reveal = (at: number) => ({
    opacity: ease(frame, s(at), s(at + 0.55), 0, 1),
    translate: `0px ${ease(frame, s(at), s(at + 0.6), 22, 0)}px`,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: theme.serif }}>
      {/* decorative arc, behind everything */}
      <svg width={1080} height={1350} style={{ position: "absolute" }}>
        <circle
          cx={660}
          cy={720}
          r={596}
          fill="none"
          stroke={theme.gold}
          strokeWidth={1}
          opacity={0.3}
        />
      </svg>

      {/* left rule */}
      <div
        style={{
          position: "absolute",
          left: RULE_X,
          top: 0,
          width: 1,
          height: 1350,
          backgroundColor: theme.gold,
          opacity: 0.42,
        }}
      />

      {/* heading */}
      <div
        style={{
          position: "absolute",
          left: COL_X,
          top: 84,
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.06,
          color: theme.text,
          letterSpacing: 0.5,
          opacity: ease(frame, 0, s(0.8), 0, 1),
        }}
      >
        Palm
        <br />
        Jumeirah
      </div>

      {/* map viewport */}
      <div
        style={{
          position: "absolute",
          left: COL_X,
          top: MAP_Y,
          width: COL_W,
          height: MAP_H,
          borderRadius: 14,
          border: `1.5px solid ${theme.gold}`,
          overflow: "hidden",
          backgroundColor: theme.bg,
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
            src={staticFile("masterplan.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(0.4) sepia(0.32) brightness(0.68) contrast(1.1)",
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
            </defs>

            {/* everything outside the selection sinks back */}
            <rect
              width={IMG_W}
              height={IMG_H}
              fill={theme.bg}
              opacity={dim}
              mask={`url(#${maskId})`}
            />

            {paths.map((d, i) => (
              <path key={`f${i}`} d={d} fill={theme.gold} opacity={fill} />
            ))}

            {/* keeps the bright sand from washing the gold out to cream */}
            {paths.map((d, i) => (
              <path
                key={`t${i}`}
                d={d}
                fill="#3A2A18"
                opacity={fill * 0.55}
                style={{ mixBlendMode: "multiply" }}
              />
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
                  // fronds draw in a quick cascade rather than all at once
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

      {/* information box - the box itself never moves, only its contents */}
      <div
        style={{
          position: "absolute",
          left: COL_X,
          top: BOX_Y,
          width: COL_W,
          height: BOX_H,
          borderRadius: 14,
          border: `1.5px solid ${theme.gold}`,
          backgroundColor: theme.panel,
          padding: BOX_PAD,
          boxSizing: "border-box",
          color: theme.text,
          overflow: "hidden",
        }}
      >
        <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.1, ...reveal(4.5) }}>
          {areaName}
        </div>

        <div style={reveal(4.9)}>
          <div style={sectionLabel}>Property Types</div>
          {propertyTypes.map((p, i) => (
            <div key={i} style={{ ...bodyText, marginTop: i === 0 ? 0 : 6 }}>
              {p}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, ...reveal(5.3) }}>
          <div style={sectionLabel}>Bedroom Types</div>
          {bedroomTypes.map((b2, i) => (
            <div
              key={i}
              style={{ ...bodyText, marginTop: i === 0 ? 0 : 7, display: "flex" }}
            >
              <span style={{ color: theme.gold, marginRight: 10 }}>—</span>
              <span>
                {b2.label ? <strong>{b2.label}</strong> : null}
                {b2.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const sectionLabel: React.CSSProperties = {
  fontSize: 15,
  letterSpacing: 2.6,
  textTransform: "uppercase",
  color: "#B39F74",
  marginTop: 14,
  marginBottom: 8,
};

const bodyText: React.CSSProperties = {
  fontSize: 20,
  lineHeight: 1.42,
  color: "#D3C1A3",
};
