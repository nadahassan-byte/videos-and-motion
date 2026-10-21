import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { at } from "./anim";
import { theme } from "./palm-content";

/*
 * The map image: the 1499x1049 source extended with mirrored, blurred sea to
 * 1907x2383 so it covers a 4:5 frame without cropping the island. Focus rects
 * are normalised against the ORIGINAL image, so they are remapped here.
 */
const IMG_W = 1907;
const IMG_H = 2383;
const PAD_X = 0.106974;
const SCALE_X = 0.786051;
const PAD_Y = 0.279899;
const SCALE_Y = 0.440201;

const W = 1080;
const H = 1350;
const CONTENT_W = 1460;
const CONTENT_H = Math.round(CONTENT_W / (IMG_W / IMG_H));

export type Rect = [number, number, number, number];

/** Original-image coords -> this frame's coords. */
const remap = (r: Rect): Rect => [
  PAD_X + r[0] * SCALE_X,
  PAD_Y + r[1] * SCALE_Y,
  PAD_X + r[2] * SCALE_X,
  PAD_Y + r[3] * SCALE_Y,
];

/** Frame the window with room to breathe around it. */
const cameraFor = (rect: Rect | undefined) => {
  if (!rect) return { cx: 0.5, cy: 0.5, scale: 1 };
  const [x0, y0, x1, y1] = remap(rect);
  const scale = Math.min(
    Math.max(Math.min(0.5 / (x1 - x0), 0.56 / (y1 - y0)), 1.0),
    1.45,
  );
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, scale };
};

/**
 * The map is laid down twice: soft underneath, sharp on top and clipped to
 * the window. The sharp copy starts soft too and resolves - a focus pull,
 * so attention is drawn by depth of field rather than by colour.
 */
export const SatelliteMap: React.FC<{
  focus: Rect;
  prevFocus?: Rect;
}> = ({ focus, prevFocus }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const from = cameraFor(prevFocus);
  const to = cameraFor(focus);
  const scale = at(frame, fps, 1.0, 2.6, from.scale, to.scale);
  const cx = at(frame, fps, 1.0, 2.6, from.cx, to.cx);
  const cy = at(frame, fps, 1.0, 2.6, from.cy, to.cy);
  // The window sits high in the frame: the lower third belongs to the type.
  const AIM_X = 0.52;
  const AIM_Y = 0.395;
  const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));
  const tx = clamp(
    AIM_X * W - (W - CONTENT_W) / 2 - cx * CONTENT_W,
    Math.max(0, (CONTENT_W * scale - W) / 2),
  );
  const ty = clamp(
    AIM_Y * H - (H - CONTENT_H) / 2 - cy * CONTENT_H,
    Math.max(0, (CONTENT_H * scale - H) / 2),
  );

  // The window: slides from the previous slide's rect, so the three read on.
  const a = remap(prevFocus ?? focus);
  const b = remap(focus);
  const rect = a.map((v, i) => at(frame, fps, 1.0, 2.6, v, b[i])) as Rect;

  const project = (nx: number, ny: number) => ({
    x: (W - CONTENT_W) / 2 + cx * CONTENT_W + tx + (nx - cx) * CONTENT_W * scale,
    y: (H - CONTENT_H) / 2 + cy * CONTENT_H + ty + (ny - cy) * CONTENT_H * scale,
  });
  const p0 = project(rect[0], rect[1]);
  const p1 = project(rect[2], rect[3]);
  const win = {
    left: p0.x,
    top: p0.y,
    width: Math.max(1, p1.x - p0.x),
    height: Math.max(1, p1.y - p0.y),
  };

  // 2.4 - 3.8s: the window resolves from soft to sharp.
  const sharpBlur = at(frame, fps, 2.4, 3.8, 9, 0);
  const frameIn = at(frame, fps, 1.2, 2.6, 0, 1);
  const softBlur = at(frame, fps, 0.6, 2.6, 4.5, 9);

  const layer = (blurPx: number) => (
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
          filter: `blur(${blurPx}px) saturate(1.02) contrast(1.04) brightness(0.94)`,
        }}
      />
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: theme.deep, overflow: "hidden" }}>
      {/* soft base */}
      {layer(softBlur)}

      {/* sharp window */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: win.left,
            top: win.top,
            width: win.width,
            height: win.height,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -win.left,
              top: -win.top,
              width: W,
              height: H,
            }}
          >
            {layer(sharpBlur)}
          </div>
        </div>

        {/* the window's hairline */}
        <div
          style={{
            position: "absolute",
            left: win.left,
            top: win.top,
            width: win.width,
            height: win.height,
            border: `1px solid rgba(255,255,255,${0.55 * frameIn})`,
            boxShadow: `0 0 ${40 * frameIn}px rgba(8,28,40,0.5)`,
            boxSizing: "border-box",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
