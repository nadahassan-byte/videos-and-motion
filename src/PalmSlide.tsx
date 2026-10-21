import React from "react";
import { AbsoluteFill } from "remotion";
import { AreaInformation } from "./AreaInformation";
import { ConnectedTimeline } from "./ConnectedTimeline";
import { SatelliteMap } from "./SatelliteMap";
import type { Carousel } from "./palm-content";
import { MASTHEAD, theme } from "./palm-content";

const MARGIN = 70;

/**
 * PalmJumeirahCarousel: the satellite map runs full bleed behind everything,
 * with gradients for legibility rather than panels or cards.
 */
export const PalmSlide: React.FC<Carousel> = ({
  areaName,
  category,
  blocks,
  step,
  area,
  zoom,
  prevArea,
}) => {
  return (
    <AbsoluteFill>
      <SatelliteMap area={area} prevArea={prevArea} zoom={zoom} />

      {/* BottomGradient - and a lighter one at the head, for the masthead */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(4,16,24,0.62) 0%, rgba(4,16,24,0.18) 16%, rgba(4,16,24,0) 32%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(4,14,21,0.94) 0%, rgba(4,14,21,0.86) 18%, rgba(4,14,21,0.58) 32%, rgba(4,14,21,0.12) 46%, rgba(4,14,21,0) 58%)",
        }}
      />

      {/* Header - fixed. The masthead is the constant across all three
          slides, so it never animates. */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 62,
          fontFamily: theme.display,
          fontSize: 62,
          lineHeight: 1,
          letterSpacing: 0.5,
          color: theme.light,
        }}
      >
        {MASTHEAD}
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: 150,
          height: 2,
          width: 108,
          backgroundColor: theme.gold,
        }}
      />

      <AreaInformation areaName={areaName} category={category} blocks={blocks} />
      <ConnectedTimeline step={step} />
    </AbsoluteFill>
  );
};
