import React from "react";
import { AbsoluteFill } from "remotion";
import { AreaInformation } from "./AreaInformation";
import { ConnectedTimeline } from "./ConnectedTimeline";
import { SatelliteMap } from "./SatelliteMap";
import type { Carousel } from "./palm-content";
import { MASTHEAD, theme } from "./palm-content";

const M = 73;

export const PalmSlide: React.FC<Carousel> = ({
  areaName,
  category,
  blocks,
  step,
  focus,
  prevFocus,
}) => (
  <AbsoluteFill style={{ backgroundColor: theme.deep }}>
    <SatelliteMap focus={focus} prevFocus={prevFocus} />

    {/* gradients carry the type; no panels */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(6,22,32,0.55) 0%, rgba(6,22,32,0.1) 12%, rgba(6,22,32,0) 24%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to top, rgba(5,20,29,0.93) 0%, rgba(5,20,29,0.86) 20%, rgba(5,20,29,0.62) 38%, rgba(5,20,29,0.28) 52%, rgba(5,20,29,0) 68%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to right, rgba(5,20,29,0.5) 0%, rgba(5,20,29,0.12) 34%, rgba(5,20,29,0) 55%)",
      }}
    />

    {/* top bar - fixed across all three slides */}
    <div
      style={{
        position: "absolute",
        left: M,
        top: 48,
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: theme.sans,
        fontSize: 15,
        letterSpacing: 3.4,
        color: theme.muted,
      }}
    >
      {MASTHEAD}
      <div style={{ width: 74, height: 1, backgroundColor: "rgba(145,170,182,0.6)" }} />
    </div>
    <AreaInformation areaName={areaName} category={category} blocks={blocks} />
    <ConnectedTimeline step={step} />
  </AbsoluteFill>
);
