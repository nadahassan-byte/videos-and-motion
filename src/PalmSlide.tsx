import React from "react";
import { AbsoluteFill } from "remotion";
import { AreaInformation } from "./AreaInformation";
import { ConnectedTimeline } from "./ConnectedTimeline";
import { SatelliteMap } from "./SatelliteMap";
import type { Carousel } from "./palm-content";
import { MASTHEAD, SUBHEAD, theme } from "./palm-content";


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
            "linear-gradient(to top, rgba(4,14,21,0.92) 0%, rgba(4,14,21,0.86) 14%, rgba(4,14,21,0.72) 25%, rgba(4,14,21,0.42) 36%, rgba(4,14,21,0.12) 46%, rgba(4,14,21,0) 58%)",
        }}
      />

      {/* Header - fixed. The masthead is the constant across all three
          slides, so it never animates. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 74,
          width: 1080,
          textAlign: "center",
          fontFamily: theme.display,
          fontSize: 58,
          lineHeight: 1,
          letterSpacing: 11,
          textIndent: 11,
          color: theme.light,
        }}
      >
        {MASTHEAD}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 140,
          width: 1080,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <div style={{ width: 92, height: 1, backgroundColor: theme.goldDim }} />
        <div
          style={{
            fontFamily: theme.text,
            fontSize: 16,
            letterSpacing: 5.2,
            color: theme.body,
          }}
        >
          {SUBHEAD}
        </div>
        <div style={{ width: 92, height: 1, backgroundColor: theme.goldDim }} />
      </div>

      <AreaInformation areaName={areaName} category={category} blocks={blocks} />
      <ConnectedTimeline step={step} />
    </AbsoluteFill>
  );
};
