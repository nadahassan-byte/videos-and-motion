import React from "react";
import { AbsoluteFill, CanvasImage, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { at } from "./anim";
import { theme, WHOLE_ISLAND } from "./palm-content";
import type { Ring } from "./palm-geo";

/*
 * The map image: the 1499x1049 source extended with mirrored, blurred sea to
 * 1907x2383 so it covers a 4:5 frame without cropping the island. Geometry in
 * palm-geo.ts is normalised against the ORIGINAL image, so rings are remapped
 * into this frame once, here. Map and overlay share one transform, so the
 * highlight stays registered to the land through every camera move.
 */
const IMG_W = 1907;
const IMG_H = 2383;
const PAD_X = 0.106974;
const SCALE_X = 0.786051;
const PAD_Y = 0.279899;
const SCALE_Y = 0.440201;

export const toFrame = (rings: Ring[] | undefined): Ring[] | undefined =>
  rings?.map((r) =>
    r.map(([x, y]) => [PAD_X + x * SCALE_X, PAD_Y + y * SCALE_Y] as [number, number]),
  );

const W = 1080;
const H = 1350;
const CONTENT_W = 1634;
const CONTENT_H = Math.round(CONTENT_W / (IMG_W / IMG_H));

const toPath = (ring: Ring) =>
  ring
    .map(
      ([x, y], i) =>
        `${i === 0 ? "M" : "L"}${(x * IMG_W).toFixed(1)} ${(y * IMG_H).toFixed(1)}`,
    )
    .join(" ") + "Z";

/** Where the camera sits to frame a set of rings: centre point and zoom. */
export const cameraFor = (rings: Ring[] | undefined, zoom?: number) => {
  if (!rings || rings.length === 0) return { cx: 0.5, cy: 0.5, scale: 1 };
  const xs = rings.flat().map((p) => p[0]);
  const ys = rings.flat().map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  // Restrained: enough of the island stays in frame to read where you are.
  const scale =
    zoom ?? Math.min(Math.max(Math.min(0.62 / (x1 - x0), 0.62 / (y1 - y0)), 1.04), 1.34);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, scale };
};

export const SatelliteMap: React.FC<{
  area: Ring[];
  prevArea?: Ring[];
  zoom?: number;
}> = ({ area, prevArea, zoom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const from = cameraFor(toFrame(prevArea));
  const to = cameraFor(toFrame(area), zoom);

  // 1.0 - 2.4s: the move. Slow in, long settle.
  const scale = at(frame, fps, 1.0, 2.4, from.scale, to.scale);
  const cx = at(frame, fps, 1.0, 2.4, from.cx, to.cx);
  const cy = at(frame, fps, 1.0, 2.4, from.cy, to.cy);
  const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));
  const tx = clamp((0.5 - cx) * CONTENT_W, Math.max(0, (CONTENT_W * scale - W) / 2));
  const ty = clamp((0.5 - cy) * CONTENT_H, Math.max(0, (CONTENT_H * scale - H) / 2));

  const paths = (toFrame(area) as Ring[]).map(toPath);
  const wholePaths = (toFrame(WHOLE_ISLAND) as Ring[]).map(toPath);
  const prevPaths = (toFrame(prevArea) ?? []).map(toPath);

  // The whole island is traced at rest, then clears as the camera moves in.
  const wholeIn = at(frame, fps, 0.15, 0.95, 0, 0.5);
  const wholeOut = at(frame, fps, 1.0, 2.0, 1, 0);
  const whole = wholeIn * wholeOut;

  const prevFade = at(frame, fps, 0.3, 1.4, 1, 0);
  const draw = at(frame, fps, 2.4, 3.8, 1, 0); // 2.4-3.8s: outline draws
  const fill = at(frame, fps, 3.8, 4.5, 0, 0.34); // 3.8-4.5s: fill at 34%
  const dim = at(frame, fps, 3.8, 4.5, 0, 0.22); // others dim by 22%

  const key = area.length + "-" + paths.length;
  const maskId = `sel-${key}`;
  const prevMaskId = `prev-${key}`;
  // The SVG viewBox is 1907 wide but drawn at CONTENT_W, so convert the
  // brief's pixel widths into viewBox units before dividing by the zoom.
  const PX = IMG_W / CONTENT_W;
  const stroke = (2.8 * PX) / scale;

  return (
    <AbsoluteFill style={{ backgroundColor: "#06131C", overflow: "hidden" }}>
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
            filter: "saturate(1.04) contrast(1.06) brightness(0.98)",
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

          {/* the whole island, traced at rest */}
          {whole > 0.001 ? (
            <g opacity={whole}>
              {wholePaths.map((d, i) => (
                <path
                  key={`w${i}`}
                  d={d}
                  fill="none"
                  stroke={theme.hi}
                  strokeWidth={stroke * 0.8}
                  strokeLinejoin="round"
                />
              ))}
            </g>
          ) : null}

          {/* the previous slide's highlight, carried in and cleared */}
          {prevPaths.length ? (
            <g opacity={prevFade}>
              <rect
                width={IMG_W}
                height={IMG_H}
                fill="#04121B"
                opacity={0.22}
                mask={`url(#${prevMaskId})`}
              />
              {prevPaths.map((d, i) => (
                <path key={`pf${i}`} d={d} fill={theme.hi} opacity={0.3} />
              ))}
              {prevPaths.map((d, i) => (
                <path
                  key={`ps${i}`}
                  d={d}
                  fill="none"
                  stroke={theme.hi}
                  strokeWidth={stroke}
                  strokeLinejoin="round"
                />
              ))}
            </g>
          ) : null}

          {/* everything outside the selection sinks back */}
          <rect
            width={IMG_W}
            height={IMG_H}
            fill="#04121B"
            opacity={dim}
            mask={`url(#${maskId})`}
          />

          {/* GoldFill */}
          {paths.map((d, i) => (
            <path key={`f${i}`} d={d} fill={theme.hi} opacity={fill} />
          ))}

          {/* SVGOutline + SoftGlow */}
          {paths.map((d, i) => (
            <path
              key={`s${i}`}
              d={d}
              fill="none"
              stroke={theme.hi}
              strokeWidth={stroke}
              strokeLinejoin="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                // fronds resolve in a gentle cascade rather than together
                strokeDashoffset: Math.max(0, Math.min(1, draw * (1 + (i % 5) * 0.1))),
                filter: `drop-shadow(0 0 ${(5 * PX) / scale}px ${theme.hi}E0)`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* the lens: a soft brightening that gathers on the area as we move in */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 42% 30% at 50% 44%, rgba(255,243,216,0.13), transparent 70%)",
          mixBlendMode: "screen",
          opacity: at(frame, fps, 1.0, 3.0, 0, 1),
        }}
      />
    </AbsoluteFill>
  );
};
