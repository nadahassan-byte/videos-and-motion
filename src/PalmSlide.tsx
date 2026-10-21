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

/* ---------- layout (1080 x 1350) ----------
 * Card bounds measured off the template (1122x1402): x 0.0365-0.9635,
 * y 0.6705-0.9608.
 */
const W = 1080;
const H = 1350;
const CARD_X = 39;
const CARD_W = 1002;
const CARD_Y = 905;
const CARD_H = 392;
const CARD_PAD = 46;

/* The map, extended with mirrored blurred sea to a 4:5 canvas so it fills
 * the frame without cropping the island. Geometry is normalised against the
 * ORIGINAL 1499x1049 image, so rings are remapped into this frame. */
const IMG_W = 1907;
const IMG_H = 2383;
const PAD_X = 0.106974;
const SCALE_X = 0.786051;
const PAD_Y = 0.279899;
const SCALE_Y = 0.440201;
const inFrame = (rings: Ring[] | undefined): Ring[] | undefined =>
  rings?.map((r) =>
    r.map(([x, y]) => [PAD_X + x * SCALE_X, PAD_Y + y * SCALE_Y] as [number, number]),
  );

const CONTENT_W = 1500;
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
    zoom ?? Math.min(Math.max(Math.min(0.66 / (x1 - x0), 0.66 / (y1 - y0)), 1.04), 1.5);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, scale };
};

/** Line-art tower, as in the template's circular badges. */
const TowerIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="9" y="11" width="13" height="22" stroke={theme.ink} strokeWidth="1.5" />
    <rect x="22" y="17" width="9" height="16" stroke={theme.ink} strokeWidth="1.5" />
    {[16, 21, 26].map((y) => (
      <React.Fragment key={y}>
        <line x1="12" y1={y} x2="15" y2={y} stroke={theme.ink} strokeWidth="1.3" />
        <line x1="17" y1={y} x2="20" y2={y} stroke={theme.ink} strokeWidth="1.3" />
      </React.Fragment>
    ))}
    {[22, 27].map((y) => (
      <line key={y} x1="25" y1={y} x2="28" y2={y} stroke={theme.ink} strokeWidth="1.3" />
    ))}
  </svg>
);

export const PalmSlide: React.FC<Carousel> = ({
  areaName,
  subtitle,
  blocks,
  area,
  zoom,
  prevArea,
  tilt = 20,
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
  const ty = clamp((0.5 - cy) * CONTENT_H, Math.max(0, (CONTENT_H * scale - H) / 2));

  // A shallow lay-back, so the aerial has depth without a visible horizon.
  const tiltNow = ease(frame, s(0.6), s(2.6), tilt * 0.6, tilt);
  const tiltZoom = (1 / Math.cos((tiltNow * Math.PI) / 180)) * 1.1;

  const prevPaths = (inFrame(prevArea) ?? []).map(toPath);
  const prevFade = ease(frame, s(0.4), s(1.5), 1, 0);
  const draw = ease(frame, s(2.5), s(3.7), 1, 0);
  const fill = ease(frame, s(3.7), s(4.5), 0, 0.4);
  const dim = ease(frame, s(3.7), s(4.5), 0, 0.46);
  const paths = (inFrame(area) as Ring[]).map(toPath);
  const maskId = `keep-${areaName.replace(/\s+/g, "")}`;
  const prevMaskId = `keep-prev-${areaName.replace(/\s+/g, "")}`;

  const rise = (at: number, dur = 0.26, dist = 14) => ({
    opacity: ease(frame, s(at), s(at + dur), 0, 1),
    translate: `0px ${ease(frame, s(at), s(at + dur + 0.04), dist, 0)}px`,
  });

  const COLS = blocks.length;
  const inner = CARD_W - CARD_PAD * 2;
  const gut = 30;
  const colW = (inner - gut * (COLS - 1)) / COLS;
  const colX = (i: number) => CARD_X + CARD_PAD + i * (colW + gut);
  const PIN_AT = (i: number) => 4.0 + i * 0.3;
  const ICON_D = COLS > 2 ? 42 : 48;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0E1A22" }}>
      {/* full-bleed aerial, laid back a little for depth */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            perspective: 1500,
            perspectiveOrigin: "50% 42%",
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
                top: (H - CONTENT_H) / 2,
                width: CONTENT_W,
                height: CONTENT_H,
                transformOrigin: `${cx * 100}% ${cy * 100}%`,
                scale,
                translate: `${tx}px ${ty}px`,
              }}
            >
              <CanvasImage
                src={staticFile("masterplan-frame.jpg")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "saturate(1.02) contrast(1.05) brightness(1.03) sepia(0.1)",
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
                      fill="#15100A"
                      opacity={0.46}
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
                  fill="#15100A"
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
                      strokeDashoffset: Math.max(
                        0,
                        Math.min(1, draw * (1 + (i % 4) * 0.12)),
                      ),
                      filter: `drop-shadow(0 0 ${3 / scale}px ${theme.hi})`,
                    }}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* the card */}
      <div
        style={{
          position: "absolute",
          left: CARD_X,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          borderRadius: 30,
          backgroundColor: theme.card,
          boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
          ...rise(3.2, 0.55, 30),
        }}
      />

      {/* area name, centred */}
      <div
        style={{
          position: "absolute",
          left: CARD_X,
          top: CARD_Y + 32,
          width: CARD_W,
          textAlign: "center",
          fontFamily: theme.display,
          fontSize: 62,
          lineHeight: 1.1,
          color: theme.ink,
          ...rise(3.5, 0.34, 12),
        }}
      >
        {areaName}
      </div>
      <div
        style={{
          position: "absolute",
          left: CARD_X + CARD_W / 2 - ease(frame, s(3.75), s(4.15), 0, 46),
          top: CARD_Y + 118,
          height: 2,
          backgroundColor: theme.rule,
          width: ease(frame, s(3.75), s(4.15), 0, 92),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CARD_X,
          top: CARD_Y + 136,
          width: CARD_W,
          textAlign: "center",
          fontFamily: theme.text,
          fontSize: 16,
          letterSpacing: 4.4,
          color: theme.body,
          ...rise(3.85, 0.3, 10),
        }}
      >
        {subtitle}
      </div>

      {/* columns */}
      {blocks.map((b: Block, i) => {
        const at = PIN_AT(i);
        return (
          <React.Fragment key={i}>
            {i > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: colX(i) - gut / 2,
                  top: CARD_Y + 172,
                  width: 1,
                  backgroundColor: theme.rule,
                  height: ease(frame, s(at), s(at + 0.4), 0, 180),
                  opacity: 0.8,
                }}
              />
            ) : null}
            {/* the badge lands first */}
            <div
              style={{
                position: "absolute",
                left: colX(i),
                top: CARD_Y + 172,
                width: ICON_D,
                height: ICON_D,
                borderRadius: 999,
                backgroundColor: theme.circle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: ease(frame, s(at), s(at + 0.1), 0, 1),
                scale: interpolate(
                  frame,
                  [s(at), s(at + 0.16), s(at + 0.3)],
                  [0.2, 1.16, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
                ),
              }}
            >
              <TowerIcon size={ICON_D * 0.58} />
            </div>
            {/* then the words, quickly */}
            <div
              style={{
                position: "absolute",
                left: colX(i),
                top: CARD_Y + 172 + ICON_D + 26,
                width: colW,
              }}
            >
              <div
                style={{
                  fontFamily: theme.text,
                  fontSize: COLS > 2 ? 17 : 19,
                  fontWeight: 700,
                  letterSpacing: 1.3,
                  color: theme.ink,
                  ...rise(at + 0.16, 0.2, 10),
                }}
              >
                {b.title.toUpperCase()}
              </div>
              {b.range ? (
                <div
                  style={{
                    marginTop: 7,
                    fontFamily: theme.text,
                    fontSize: COLS > 2 ? 14 : 15,
                    letterSpacing: 1.6,
                    color: theme.gold,
                    ...rise(at + 0.26, 0.2, 10),
                  }}
                >
                  {b.range}
                </div>
              ) : null}
              <div
                style={{
                  marginTop: 15,
                  fontFamily: theme.text,
                  fontSize: COLS > 2 ? 16 : 17.5,
                  lineHeight: 1.52,
                  color: theme.body,
                  ...rise(at + 0.34, 0.22, 10),
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
