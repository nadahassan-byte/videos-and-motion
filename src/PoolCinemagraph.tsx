import React from "react";
import { AbsoluteFill, CanvasImage, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { poolWater } from "./effects/pool-water";

/**
 * A still photograph in which only the pool moves.
 *
 * The whole frame goes through one shader, which leaves everything above the
 * waterline untouched, so no masking or second plate is needed and there is
 * no edge where one version meets the other.
 */
const WATERLINE = 0.735;
const PERIOD = 3; // whole noise cycles across the clip, so it loops

export const PoolCinemagraph: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#9CC6DD" }}>
      <CanvasImage
        src={staticFile("pool.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        effects={[
          poolWater({
            waterline: WATERLINE,
            amplitude: 7,
            scale: 2.6,
            caustics: 0.12,
            period: PERIOD,
            time: (frame / durationInFrames) * PERIOD,
          }),
        ]}
      />
    </AbsoluteFill>
  );
};
