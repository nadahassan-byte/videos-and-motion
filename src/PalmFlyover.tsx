import React from "react";
import { AbsoluteFill } from "remotion";
import { CesiumFlythrough } from "./CesiumFlythrough";

/**
 * Photorealistic 3D flyover of Palm Jumeirah, using Google's Photorealistic
 * 3D Tiles through CesiumJS — real towers and villas with real geometry,
 * rather than a flat satellite image tipped back.
 *
 * Requires REMOTION_GOOGLE_MAPS_API_KEY (Map Tiles API enabled, billing on).
 * Without it the component renders its own error state.
 *
 * Coordinates are [longitude, latitude]. The default path runs up the trunk
 * from the mainland causeway toward the crown; nudge them if the camera is
 * off the mark.
 */
export const TRUNK_FLIGHT: [number, number][] = [
  [55.139, 25.0975],
  [55.139, 25.1035],
  [55.139, 25.1095],
  [55.139, 25.1155],
  [55.139, 25.121],
];

export const PalmFlyover: React.FC<{
  path?: [number, number][];
  altitudeStart?: number;
  altitudeEnd?: number;
  pitchFromNadir?: number;
}> = ({
  path = TRUNK_FLIGHT,
  altitudeStart = 1400,
  altitudeEnd = 650,
  pitchFromNadir = 42,
}) => (
  <AbsoluteFill style={{ backgroundColor: "#0E1A22" }}>
    <CesiumFlythrough
      mode="city"
      path={path}
      altitudeStart={altitudeStart}
      altitudeEnd={altitudeEnd}
      pitchFromNadir={pitchFromNadir}
      lookAheadKm={0.6}
    />
  </AbsoluteFill>
);
