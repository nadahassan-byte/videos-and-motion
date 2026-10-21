import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { at, rise } from "./anim";
import { STEPS, theme } from "./palm-content";

const M = 73;
const W = 1080;
const CY = 1224;
const CX = [92, 540, 988];
const D = 17;

/** 6.0 - 6.8s: the line runs along to the active marker. */
export const ConnectedTimeline: React.FC<{ step: 1 | 2 | 3 }> = ({ step }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reached = CX[step - 1] - M;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: M,
          top: CY,
          height: 1,
          width: W - M * 2,
          backgroundColor: "rgba(255,255,255,0.22)",
          opacity: at(frame, fps, 5.9, 6.3, 0, 1),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: M,
          top: CY,
          height: 1,
          backgroundColor: theme.gold,
          width: at(frame, fps, 6.0, 6.8, 0, reached),
        }}
      />

      {STEPS.map((label, i) => {
        const active = i === step - 1;
        const done = i < step - 1;
        const atM = 6.0 + (i / 3) * 0.8;
        const show = at(frame, fps, atM, atM + 0.45, 0, 1);
        return (
          <React.Fragment key={label}>
            {/* the active marker carries a soft outer ring */}
            {active ? (
              <div
                style={{
                  position: "absolute",
                  left: CX[i] - D,
                  top: CY - D,
                  width: D * 2,
                  height: D * 2,
                  borderRadius: 999,
                  border: `1px solid ${theme.gold}`,
                  opacity: 0.55 * show,
                }}
              />
            ) : null}
            <div
              style={{
                position: "absolute",
                left: CX[i] - D / 2,
                top: CY - D / 2,
                width: D,
                height: D,
                borderRadius: 999,
                boxSizing: "border-box",
                backgroundColor: active ? theme.gold : "transparent",
                border: `1px solid ${
                  active || done ? theme.gold : "rgba(255,255,255,0.45)"
                }`,
                opacity: show,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: CX[i] - 140,
                top: CY + 26,
                width: 280,
                textAlign: "center",
                fontFamily: theme.sans,
                fontSize: 15,
                letterSpacing: 0.4,
                color: active ? theme.gold : "rgba(203,214,220,0.6)",
                ...rise(frame, fps, atM + 0.1, 0.5, 10),
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
