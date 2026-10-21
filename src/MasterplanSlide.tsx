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
import { theme } from "./theme";
import type { SlideProps } from "./slides";

const PLAN_W = 1000;
const PLAN_H = 700;
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** Shared clamped-interpolate so every beat eases the same way. */
const anim = (
  frame: number,
  range: [number, number],
  out: [number, number],
) =>
  interpolate(frame, range, out, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

export const MasterplanSlide: React.FC<SlideProps> = ({
  masterplanSrc,
  brandLine1,
  brandLine2,
  slideIndex,
  slideTotal,
  title,
  subtitle,
  body,
  status,
  boundary,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const d =
    boundary
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${(p.x * PLAN_W).toFixed(1)} ${(
            p.y * PLAN_H
          ).toFixed(1)}`,
      )
      .join(" ") + " Z";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        fontFamily: theme.fontFamily,
        color: theme.text,
      }}
    >
      {/* ---------- header ---------- */}
      <div
        style={{
          position: "absolute",
          top: 54,
          left: 46,
          right: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: anim(frame, [0.2 * fps, 0.8 * fps], [0, 1]),
          translate: anim(frame, [0.2 * fps, 0.8 * fps], [-18, 0]) + "px 0px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              border: `3px solid ${theme.accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 27,
              fontWeight: 800,
              letterSpacing: -1,
              color: theme.accent,
            }}
          >
            TT
          </div>
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ fontSize: 25, fontWeight: 500, letterSpacing: 2 }}>
              {brandLine1}
            </div>
            <div
              style={{
                fontSize: 25,
                fontWeight: 800,
                letterSpacing: 2,
                color: theme.accent,
              }}
            >
              {brandLine2}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 29, fontWeight: 600, letterSpacing: 6 }}>
          {String(slideIndex).padStart(2, "0")}
          <span style={{ color: theme.textMuted }}>
            {" / "}
            {String(slideTotal).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ---------- masterplan card ---------- */}
      <div
        style={{
          position: "absolute",
          top: 152,
          left: 40,
          width: PLAN_W,
          height: PLAN_H,
          borderRadius: theme.radiusOuter,
          border: `3px solid ${theme.accent}`,
          padding: 12,
          boxSizing: "border-box",
          opacity: anim(frame, [0, 0.6 * fps], [0, 1]),
          scale: anim(frame, [0, 0.7 * fps], [0.94, 1]),
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: theme.radiusInner,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* slow drift on the plan itself */}
          <div
            style={{
              width: "100%",
              height: "100%",
              scale: anim(frame, [0, durationInFrames], [1, 1.07]),
            }}
          >
            <CanvasImage
              src={staticFile(masterplanSrc)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* boundary: fill fades in, outline draws itself on */}
          <svg
            viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <path
              d={d}
              fill={theme.accent}
              style={{
                opacity: anim(frame, [1.5 * fps, 2.3 * fps], [0, 0.22]),
              }}
            />
            <path
              d={d}
              fill="none"
              stroke={theme.accent}
              strokeWidth={6}
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: anim(
                  frame,
                  [0.5 * fps, 2.1 * fps],
                  [1, 0],
                ),
                filter: `drop-shadow(0 0 14px ${theme.accent}99)`,
              }}
            />
          </svg>
        </div>
      </div>

      {/* ---------- info card ---------- */}
      <div
        style={{
          position: "absolute",
          top: 886,
          left: 40,
          width: PLAN_W,
          borderRadius: theme.radiusOuter,
          backgroundColor: theme.panel,
          padding: "38px 44px",
          boxSizing: "border-box",
          display: "flex",
          gap: 34,
          alignItems: "center",
          opacity: anim(frame, [1.9 * fps, 2.5 * fps], [0, 1]),
          translate:
            "0px " + anim(frame, [1.9 * fps, 2.6 * fps], [70, 0]) + "px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: 1,
              lineHeight: 1,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 31, fontWeight: 700, marginTop: 18 }}>
            {subtitle}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: theme.textMuted,
              marginTop: 12,
              lineHeight: 1.35,
              maxWidth: 580,
            }}
          >
            {body}
          </div>
          <div
            style={{
              marginTop: 26,
              display: "inline-block",
              backgroundColor: theme.accent,
              borderRadius: 9,
              padding: "13px 26px",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              opacity: anim(frame, [2.6 * fps, 3.0 * fps], [0, 1]),
              scale: anim(frame, [2.6 * fps, 3.1 * fps], [0.8, 1]),
            }}
          >
            {status}
          </div>
        </div>

        {/* thumbnail stand-in */}
        <div
          style={{
            width: 240,
            height: 230,
            borderRadius: 24,
            border: `3px solid ${theme.accent}`,
            overflow: "hidden",
            flexShrink: 0,
            background: "linear-gradient(160deg,#9DB7C9 0%,#D8D2C6 55%,#B5A48E 100%)",
            opacity: anim(frame, [2.3 * fps, 2.9 * fps], [0, 1]),
            scale: anim(frame, [2.3 * fps, 3.0 * fps], [0.88, 1]),
          }}
        />
      </div>

      {/* ---------- progress timeline ---------- */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 46,
          right: 46,
          display: "flex",
          alignItems: "center",
          opacity: anim(frame, [0.4 * fps, 1.2 * fps], [0, 1]),
        }}
      >
        {Array.from({ length: slideTotal }).map((_, i) => {
          const isCurrent = i + 1 === slideIndex;
          const isPast = i + 1 < slideIndex;
          return (
            <React.Fragment key={i}>
              {i > 0 ? (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: isPast || isCurrent ? theme.accent : "#35353A",
                  }}
                />
              ) : null}
              <div
                style={{
                  width: isCurrent ? 16 : 8,
                  height: isCurrent ? 16 : 8,
                  borderRadius: 999,
                  flexShrink: 0,
                  backgroundColor: isPast || isCurrent ? theme.accent : "#35353A",
                  scale: isCurrent
                    ? anim(frame, [1.0 * fps, 1.5 * fps], [0.4, 1])
                    : 1,
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
