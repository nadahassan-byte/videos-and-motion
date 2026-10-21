import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { at, rise } from "./anim";
import { STEPS, theme } from "./palm-content";

const MARGIN = 70;
const W = 1080;
const CY = 1281;
const D = 38;
const CX = [135, 540, 937];

/** 6.0 - 6.8s: the line advances to the active marker. */
export const ConnectedTimeline: React.FC<{ step: 1 | 2 | 3 }> = ({ step }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const track = W - MARGIN * 2;
  const reached = CX[step - 1] - MARGIN;
  const progress = at(frame, fps, 6.0, 6.8, 0, reached);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: CY,
          height: 1,
          width: track,
          backgroundColor: theme.gold,
          opacity: at(frame, fps, 5.9, 6.3, 0, 0.42),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: CY,
          height: 2,
          width: progress,
          backgroundColor: theme.gold,
          opacity: 0.95,
        }}
      />

      {STEPS.map((label, i) => {
        const active = i === step - 1;
        const done = i < step - 1;
        // Each marker settles as the line reaches it.
        const atMarker = 6.0 + (i / 3) * 0.8;
        return (
          <React.Fragment key={label}>
            <div
              style={{
                position: "absolute",
                left: CX[i] - D / 2,
                top: CY - D / 2,
                width: D,
                height: D,
                borderRadius: 999,
                boxSizing: "border-box",
                backgroundColor: active ? theme.oxblood : "rgba(8,22,30,0.5)",
                border: `1px solid ${theme.gold}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: theme.text,
                fontSize: 15,
                letterSpacing: 0.6,
                color: active ? theme.light : done ? theme.gold : "rgba(248,243,231,0.6)",
                opacity: at(frame, fps, atMarker, atMarker + 0.45, 0.25, 1),
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div
              style={{
                position: "absolute",
                left: CX[i] - 90,
                top: CY + 28,
                width: 180,
                textAlign: "center",
                fontFamily: theme.text,
                fontSize: 15,
                fontWeight: active ? 700 : 400,
                letterSpacing: 0.8,
                color: active ? theme.light : "rgba(215,216,211,0.62)",
                ...rise(frame, fps, atMarker + 0.1, 0.5, 10),
              }}
            >
              {label}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};
