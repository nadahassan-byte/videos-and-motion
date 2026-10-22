import React from "react";
import { AbsoluteFill, CanvasImage, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { wave } from "@remotion/effects/wave";

/**
 * A still photograph with only the water moving.
 *
 * The image is laid down twice: untouched underneath, and again on top
 * masked to the pool and warped. Three waves of different wavelength and
 * direction are stacked so their interference reads as water rather than as
 * one travelling sine.
 *
 * Every wave completes a whole number of cycles over the composition, so the
 * last frame meets the first and the clip loops without a seam.
 */
const WATERLINE = 0.735;

export const PoolCinemagraph: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const t = frame / durationInFrames;
  const TWO_PI = Math.PI * 2;

  const fill: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  // The mask hands over from the still plate to the moving one across a soft
  // band, so there is no visible line at the water's edge.
  const maskTop = (WATERLINE - 0.008) * 100;
  const maskFull = (WATERLINE + 0.016) * 100;
  const mask = `linear-gradient(to bottom, transparent ${maskTop}%, black ${maskFull}%, black 100%)`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#9CC6DD" }}>
      {/* the still plate */}
      <CanvasImage src={staticFile("pool.png")} style={fill} />

      {/* the water */}
      <AbsoluteFill style={{ maskImage: mask, WebkitMaskImage: mask }}>
        <CanvasImage
          src={staticFile("pool.png")}
          style={fill}
          effects={[
            // long, slow swell
            wave({
              amplitude: 3.4,
              wavelength: 230,
              phase: t * TWO_PI * 1,
              direction: "horizontal",
            }),
            // mid chop, running the other way
            wave({
              amplitude: 2.2,
              wavelength: 128,
              phase: -t * TWO_PI * 2,
              direction: "horizontal",
            }),
            // fine cross-ripple, so the surface is not one clean sine
            wave({
              amplitude: 1.5,
              wavelength: 86,
              phase: t * TWO_PI * 3,
              direction: "vertical",
            }),
          ]}
        />
      </AbsoluteFill>

      {/* a slow glint drifting over the surface, kept very low */}
      <AbsoluteFill
        style={{
          top: `${WATERLINE * 100}%`,
          background: `linear-gradient(${100 + Math.sin(t * TWO_PI) * 6}deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 65%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
