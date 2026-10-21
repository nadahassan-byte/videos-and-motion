import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { at, rise } from "./anim";
import type { Block } from "./palm-content";
import { theme } from "./palm-content";

const MARGIN = 70;
const W = 1080;
const DIVIDER_X = 540;
const COL_X = [MARGIN, 567];
const COL_W = [448, W - MARGIN - 567];

/** AreaTitle, Category, then the two property-type columns. */
export const AreaInformation: React.FC<{
  areaName: string;
  category: string;
  blocks: [Block, Block];
}> = ({ areaName, category, blocks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {/* a short upright tick, as the template has above its closing line */}
      <div
        style={{
          position: "absolute",
          left: W / 2,
          top: 858,
          width: 1,
          height: 26,
          backgroundColor: theme.goldDim,
          opacity: at(frame, fps, 4.4, 5.0, 0, 0.9),
        }}
      />

      {/* 4.5 - 5.2s */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 898,
          width: W,
          textAlign: "center",
          fontFamily: theme.display,
          fontSize: 62,
          lineHeight: 1,
          letterSpacing: 2,
          color: theme.light,
          ...rise(frame, fps, 4.5, 0.7, 22),
        }}
      >
        {areaName}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 982,
          width: W,
          textAlign: "center",
          fontFamily: theme.text,
          fontSize: 16,
          letterSpacing: 5,
          color: theme.gold,
          ...rise(frame, fps, 4.8, 0.6, 16),
        }}
      >
        {category}
      </div>
      <div
        style={{
          position: "absolute",
          left: W / 2 - at(frame, fps, 5.0, 5.8, 0, 62),
          top: 1022,
          height: 1,
          backgroundColor: theme.goldDim,
          width: at(frame, fps, 5.0, 5.8, 0, 124),
        }}
      />

      {/* 5.2 - 6.0s */}
      {blocks.map((b, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <div
              style={{
                position: "absolute",
                left: DIVIDER_X,
                top: 1064,
                width: 1,
                backgroundColor: theme.gold,
                opacity: 0.4,
                height: at(frame, fps, 5.2 + i * 0.12, 6.0, 0, 120),
              }}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              left: COL_X[i],
              top: 1062,
              width: COL_W[i],
            }}
          >
            <div
              style={{
                fontFamily: theme.display,
                fontSize: 30,
                lineHeight: 1.14,
                color: theme.light,
                ...rise(frame, fps, 5.2 + i * 0.12, 0.6, 16),
              }}
            >
              {b.title}
            </div>
            <div
              style={{
                marginTop: 11,
                fontFamily: theme.text,
                fontSize: 13.5,
                letterSpacing: 2.2,
                color: theme.gold,
                ...rise(frame, fps, 5.4 + i * 0.12, 0.55, 14),
              }}
            >
              {b.range}
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: theme.text,
                fontSize: 17,
                lineHeight: 1.46,
                color: theme.body,
                ...rise(frame, fps, 5.6 + i * 0.12, 0.6, 14),
              }}
            >
              {b.body}
            </div>
          </div>
        </React.Fragment>
      ))}
    </>
  );
};
