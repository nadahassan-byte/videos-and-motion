import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { at } from "./anim";
import { STEPS, theme } from "./palm-content";

const M = 73;
const W = 1080;
const CY = 1224;
const CX = [92, 540, 988];
const D = 17;

/**
 * The track, the three markers and the labels are fixed - identical from one
 * carousel to the next. The only thing that moves is the pin, which travels
 * along from where the previous slide left it, trailing the gold line.
 */
export const ConnectedTimeline: React.FC<{ step: 1 | 2 | 3 }> = ({ step }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fromX = step === 1 ? M : CX[step - 2];
  const toX = CX[step - 1];
  const pinX = at(frame, fps, 6.0, 6.9, fromX, toX);

  return (
    <>
      {/* fixed track */}
      <div
        style={{
          position: "absolute",
          left: M,
          top: CY,
          height: 1,
          width: W - M * 2,
          backgroundColor: "rgba(255,255,255,0.22)",
        }}
      />

      {/* fixed markers and labels */}
      {STEPS.map((label, i) => {
        const active = i === step - 1;
        const done = i < step - 1;
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
                backgroundColor: "transparent",
                border: `1px solid ${
                  active || done ? theme.gold : "rgba(255,255,255,0.45)"
                }`,
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
              }}
            >
              {label}
            </div>
          </React.Fragment>
        );
      })}

      {/* the travelled line */}
      <div
        style={{
          position: "absolute",
          left: M,
          top: CY,
          height: 1,
          width: Math.max(0, pinX - M),
          backgroundColor: theme.gold,
        }}
      />

      {/* the pin itself */}
      <div
        style={{
          position: "absolute",
          left: pinX - D,
          top: CY - D,
          width: D * 2,
          height: D * 2,
          borderRadius: 999,
          border: `1px solid ${theme.gold}`,
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: pinX - D / 2,
          top: CY - D / 2,
          width: D,
          height: D,
          borderRadius: 999,
          backgroundColor: theme.gold,
        }}
      />
    </>
  );
};
