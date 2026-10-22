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
import { poolWater } from "./effects/pool-water";

/**
 * A still photograph given a camera.
 *
 * The push-in scales about the horizon rather than the centre of the frame.
 * For a shot across a ground plane that is the correct first-order dolly:
 * everything near the camera expands quickly, the far shore barely moves, and
 * the result reads as a lens travelling forward rather than as a picture
 * being enlarged.
 *
 * The water runs underneath it, so the surface lives while the camera moves.
 */
const WATERLINE = 0.735;
/** Where the far shore sits. The dolly expands outward from here. */
const HORIZON = 0.56;
const PERIOD = 3;

export const PoolCinemagraph: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  // One continuous move: eased in off the mark, still travelling at the cut.
  // A camera that decelerates to a stop announces itself as an effect.
  const ease = Easing.bezier(0.3, 0, 0.75, 1);
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.115], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const drift = interpolate(frame, [0, durationInFrames], [0, -9], {
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#9CC6DD", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformOrigin: `50% ${HORIZON * 100}%`,
          scale,
          translate: `${drift}px 0px`,
        }}
      >
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
              time: t * PERIOD,
            }),
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
