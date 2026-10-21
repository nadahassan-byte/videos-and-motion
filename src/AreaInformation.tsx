import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { at, rise } from "./anim";
import type { Block } from "./palm-content";
import { theme } from "./palm-content";

const M = 73;
const W = 1080;
const DIVIDER_X = 556;
const COL_X = [M, 600];
const COL_W = [448, W - M - 600];

export const AreaInformation: React.FC<{
  areaName: [string, string];
  category: string;
  blocks: [Block, Block];
}> = ({ areaName, category, blocks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {/* the name, set low and large in light lowercase */}
      <div
        style={{
          position: "absolute",
          left: M,
          top: 486,
          fontFamily: theme.sans,
          fontSize: 104,
          fontWeight: 300,
          lineHeight: 1.16,
          letterSpacing: -1.5,
          color: theme.light,
        }}
      >
        <div style={rise(frame, fps, 4.3, 0.42, 22)}>{areaName[0]}</div>
        <div style={rise(frame, fps, 4.4, 0.42, 22)}>{areaName[1]}</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: M,
          top: 764,
          fontFamily: theme.sans,
          fontSize: 17,
          letterSpacing: 4.2,
          lineHeight: 1.7,
          whiteSpace: "pre-line",
          color: theme.light,
          ...rise(frame, fps, 4.58, 0.38, 16),
        }}
      >
        {category}
      </div>

      {blocks.map((b, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <div
              style={{
                position: "absolute",
                left: DIVIDER_X,
                top: 958,
                width: 1,
                backgroundColor: "rgba(255,255,255,0.22)",
                height: at(frame, fps, 4.72, 5.4, 0, 196),
              }}
            />
          ) : null}
          <div
            style={{ position: "absolute", left: COL_X[i], top: 956, width: COL_W[i] }}
          >
            <div
              style={{
                fontFamily: theme.sans,
                fontSize: 21,
                fontWeight: 600,
                lineHeight: 1.26,
                whiteSpace: "pre-line",
                color: theme.light,
                ...rise(frame, fps, 4.76 + i * 0.1, 0.34, 14),
              }}
            >
              {b.title}
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily: theme.sans,
                fontSize: 13,
                letterSpacing: 2.6,
                color: theme.muted,
                ...rise(frame, fps, 4.9 + i * 0.1, 0.32, 12),
              }}
            >
              {b.range}
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: theme.sans,
                fontSize: 16,
                lineHeight: 1.5,
                color: theme.body,
                ...rise(frame, fps, 5.02 + i * 0.1, 0.34, 12),
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
