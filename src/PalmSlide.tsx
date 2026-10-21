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
import { MASTHEAD, STEPS, theme } from "./palm-content";
import type { Ring } from "./palm-geo";

/* ---------- layout (1080 x 1350) ----------
 * Measured off the template (1122x1402) and scaled by 1080/1122 = 0.9626.
 */
const W = 1080;
const H = 1350;
const MARGIN = 77;

const HEAD_TOP = 72;
const HEAD_SIZE = 130;
const HEAD_RULE_Y = 223;
const AREA_TOP = 878;
const AREA_SIZE = 88;
const SUB_TOP = 1002;
const HAIRLINE_Y = 1050;
const COL_TITLE_Y = 1078;
const COL_RANGE_Y = 1134;
const DIVIDER_X = 575;
const PIN_X = [MARGIN, 600];
const TEXT_X = [125, 648];
const DOT_CY = 1234;
const DOT_D = 58;
const DOT_CX = [129, 489, 818];
const LABEL_Y = 1270;

/* The widened map: 1499x1049 source extended with mirrored, blurred sea to
 * 1907x1049. Rings are normalised against the ORIGINAL, so remap here. */
const IMG_W = 1907;
const IMG_H = 1049;
const PAD_X = 0.106974;
const SCALE_X = 0.786051;
const inFrame = (rings: Ring[] | undefined): Ring[] | undefined =>
  rings?.map((r) => r.map(([x, y]) => [PAD_X + x * SCALE_X, y] as [number, number]));

const CONTENT_W = 1270;
const CONTENT_H = Math.round(CONTENT_W / (IMG_W / IMG_H));
const PHOTO_CY = 578;

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
    zoom ?? Math.min(Math.max(Math.min(0.72 / (x1 - x0), 0.72 / (y1 - y0)), 1.03), 1.32);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, scale };
};

export const PalmSlide: React.FC<Carousel> = ({
  areaName,
  subtitle,
  blocks,
  step,
  area,
  zoom,
  prevArea,
  tilt = 16,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => sec * fps;

  const from = cameraFor(inFrame(prevArea));
  const to = cameraFor(inFrame(area), zoom);
  const scale = ease(frame, s(1), s(2.5), from.scale, to.scale);
  const cx = ease(frame, s(1), s(2.5), from.cx, to.cx);
  const cy = ease(frame, s(1), s(2.5), from.cy, to.cy);
  const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
  const tx = clamp((0.5 - cx) * CONTENT_W, Math.max(0, (CONTENT_W * scale - W) / 2));
  const ty = (0.5 - cy) * CONTENT_H;

  const tiltNow = ease(frame, s(0.6), s(2.6), tilt * 0.6, tilt);
  const tiltZoom = (1 / Math.cos((tiltNow * Math.PI) / 180)) * 1.06;

  const prevPaths = (inFrame(prevArea) ?? []).map(toPath);
  const prevFade = ease(frame, s(0.4), s(1.5), 1, 0);
  const draw = ease(frame, s(2.5), s(3.7), 1, 0);
  const fill = ease(frame, s(3.7), s(4.5), 0, 0.42);
  const dim = ease(frame, s(3.7), s(4.5), 0, 0.42);
  const paths = (inFrame(area) as Ring[]).map(toPath);
  const maskId = `keep-${areaName.replace(/\s+/g, "")}`;
  const prevMaskId = `keep-prev-${areaName.replace(/\s+/g, "")}`;

  const rise = (at: number, dur = 0.26, dist = 14) => ({
    opacity: ease(frame, s(at), s(at + dur), 0, 1),
    translate: `0px ${ease(frame, s(at), s(at + dur + 0.04), dist, 0)}px`,
  });

  const PIN_AT = (i: number) => 4.0 + i * 0.3;
  const FEATHER =
    "radial-gradient(ellipse 58% 52% at 50% 50%, #000 46%, rgba(0,0,0,0.7) 72%, transparent 100%)";

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      {/* soft palm shadow, top-right */}
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <filter id="soft">
            <feGaussianBlur stdDeviation="17" />
          </filter>
        </defs>
        <g filter="url(#soft)" opacity={0.11}>
          {[0, 26, 52, 78].map((a, i) => (
            <path
              key={i}
              d={`M1150 -30 Q ${880 - i * 44} ${110 + i * 30} ${720 - i * 62} ${
                250 + i * 44
              } Q ${910 - i * 32} ${120 + i * 22} 1150 -30 Z`}
              fill={theme.ink}
              transform={`rotate(${a} 1150 -30)`}
            />
          ))}
        </g>
      </svg>

      {/* the aerial, feathered into the cream */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: PHOTO_CY - CONTENT_H / 2 - 40,
          width: W,
          height: CONTENT_H + 80,
          maskImage: FEATHER,
          WebkitMaskImage: FEATHER,
          perspective: 1600,
          perspectiveOrigin: "50% 45%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotateX(${tiltNow}deg) scale(${tiltZoom})`,
            transformOrigin: "50% 50%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: (W - CONTENT_W) / 2,
              top: 40,
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
                filter: "saturate(0.95) contrast(1.05) brightness(1.02) sepia(0.08)",
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
                    fill="#14100A"
                    opacity={0.42}
                    mask={`url(#${prevMaskId})`}
                  />
                  {prevPaths.map((d, i) => (
                    <path key={`pf${i}`} d={d} fill={theme.hi} opacity={0.42} />
                  ))}
                  {prevPaths.map((d, i) => (
                    <path
                      key={`ps${i}`}
                      d={d}
                      fill="none"
                      stroke={theme.hi}
                      strokeWidth={2.6 / scale}
                      strokeLinejoin="round"
                      style={{ filter: `drop-shadow(0 0 ${5 / scale}px ${theme.hi})` }}
                    />
                  ))}
                </g>
              ) : null}
              <rect
                width={IMG_W}
                height={IMG_H}
                fill="#14100A"
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
                  strokeWidth={2.6 / scale}
                  strokeLinejoin="round"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: Math.max(
                      0,
                      Math.min(1, draw * (1 + (i % 4) * 0.12)),
                    ),
                    filter: `drop-shadow(0 0 ${5 / scale}px ${theme.hi})`,
                  }}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

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
          letterSpacing: -2,
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
          top: HEAD_RULE_Y,
          height: 3,
          backgroundColor: theme.gold,
          width: ease(frame, s(0.4), s(1.0), 0, 150),
        }}
      />

      {/* area name + subtitle */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: AREA_TOP,
          fontFamily: theme.display,
          fontSize: AREA_SIZE,
          lineHeight: 1,
          color: theme.ink,
          ...rise(3.3, 0.4, 14),
        }}
      >
        {areaName}
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: SUB_TOP,
          fontFamily: theme.text,
          fontSize: 17,
          letterSpacing: 4.6,
          color: theme.gold,
          ...rise(3.6, 0.3, 10),
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: HAIRLINE_Y,
          height: 1,
          backgroundColor: theme.rule,
          width: ease(frame, s(3.8), s(4.4), 0, W - MARGIN * 2),
        }}
      />

      {/* columns */}
      {blocks.map((b: Block, i) => {
        const at = PIN_AT(i);
        return (
          <React.Fragment key={i}>
            {i > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: DIVIDER_X,
                  top: COL_TITLE_Y - 8,
                  width: 1,
                  backgroundColor: theme.rule,
                  height: ease(frame, s(at), s(at + 0.4), 0, 96),
                }}
              />
            ) : null}
            {/* the pin lands first */}
            <div
              style={{
                position: "absolute",
                left: PIN_X[i],
                top: COL_TITLE_Y + 8,
                width: 13,
                height: 13,
                borderRadius: 999,
                backgroundColor: theme.gold,
                opacity: ease(frame, s(at), s(at + 0.1), 0, 1),
                scale: interpolate(
                  frame,
                  [s(at), s(at + 0.16), s(at + 0.3)],
                  [0, 1.5, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
                ),
              }}
            />
            <div
              style={{
                position: "absolute",
                left: PIN_X[i] + 6,
                top: COL_TITLE_Y + 26,
                width: 1,
                backgroundColor: theme.gold,
                opacity: 0.5,
                height: ease(frame, s(at + 0.08), s(at + 0.4), 0, 62),
              }}
            />
            {/* then the words - stacked, so a two-line title pushes the
                bedroom range down instead of colliding with it */}
            <div
              style={{
                position: "absolute",
                left: TEXT_X[i],
                top: COL_TITLE_Y,
                width: (i === 0 ? DIVIDER_X - 36 : W - MARGIN) - TEXT_X[i],
              }}
            >
              <div
                style={{
                  fontFamily: theme.display,
                  fontSize: 32,
                  lineHeight: 1.12,
                  color: theme.ink,
                  ...rise(at + 0.16, 0.2, 10),
                }}
              >
                {b.title}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: theme.text,
                  fontSize: 15,
                  letterSpacing: 3.4,
                  color: theme.ink,
                  ...rise(at + 0.28, 0.2, 10),
                }}
              >
                {b.range}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* 01 - 02 - 03 timeline */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: DOT_CY,
          height: 1,
          width: W - MARGIN * 2,
          backgroundColor: theme.rule,
          opacity: ease(frame, s(4.6), s(5.1), 0, 1),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: DOT_CX[step - 1] + DOT_D / 2,
          top: DOT_CY,
          height: 2,
          backgroundColor: theme.maroon,
          width: ease(frame, s(5.0), s(5.6), 0, 200),
        }}
      />
      {STEPS.map((label, i) => {
        const active = i === step - 1;
        const at = 4.6 + i * 0.16;
        return (
          <React.Fragment key={label}>
            <div
              style={{
                position: "absolute",
                left: DOT_CX[i] - DOT_D / 2,
                top: DOT_CY - DOT_D / 2,
                width: DOT_D,
                height: DOT_D,
                borderRadius: 999,
                backgroundColor: active ? theme.maroon : theme.pale,
                border: active ? `2px solid ${theme.gold}` : `1px solid ${theme.rule}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: theme.text,
                fontSize: 19,
                letterSpacing: 1,
                color: active ? "#F6EFE2" : theme.ink,
                opacity: ease(frame, s(at), s(at + 0.26), 0, active ? 1 : 0.85),
                scale: interpolate(
                  frame,
                  [s(at), s(at + 0.18), s(at + 0.32)],
                  active ? [0.5, 1.14, 1] : [0.7, 1.04, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
                ),
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div
              style={{
                position: "absolute",
                left: DOT_CX[i] - 60,
                top: LABEL_Y,
                width: 160,
                textAlign: "center",
                fontFamily: theme.text,
                fontSize: active ? 23 : 21,
                fontWeight: active ? 700 : 400,
                color: active ? theme.ink : "#8C8375",
                ...rise(at + 0.1, 0.24, 8),
              }}
            >
              {label}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
