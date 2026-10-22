import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { poolWater } from "./effects/pool-water";

/**
 * Six ways to bring type onto a frame, one per section, so the technique can
 * be chosen by eye rather than from a list.
 *
 * The last one is the answer to "can something sit behind a person": the
 * type is sandwiched between the photograph and a cut-out of its own
 * foreground, so the palms occlude it. On footage the cut-out comes from a
 * segmentation model instead of from colour, but the composite is this.
 */

const SECTION = 75;
const SANS = "Inter, Helvetica, sans-serif";
const SERIF = "Caladea, Charter, Georgia, serif";

const CREAM = "#F4F1EA";
const INK = "#1C1B19";
const GOLD = "#B08D57";

/** The technique's name, so the reel reads as a menu. */
const Label: React.FC<{ n: string; name: string; dark?: boolean }> = ({ n, name, dark }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        bottom: 56,
        opacity: o * 0.75,
        fontFamily: SANS,
        fontSize: 19,
        letterSpacing: "0.22em",
        fontWeight: 500,
        color: dark ? "rgba(255,255,255,0.95)" : INK,
        textShadow: dark ? "0 1px 14px rgba(0,0,0,0.55)" : "none",
      }}
    >
      {n} — {name}
    </div>
  );
};

/** A line that rises out from behind a hard edge. */
const Rise: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.7 } });
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em" }}>
      <div style={{ transform: `translateY(${(1 - p) * 112}%)` }}>{children}</div>
    </div>
  );
};

// 01 — a masthead built out of rising lines, each held back from the last.
const MaskedReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const rule = interpolate(frame, [26, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0, 0.1, 1),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM, justifyContent: "center", padding: "0 64px" }}>
      <Rise delay={0}>
        <div style={{ fontFamily: SANS, fontSize: 21, letterSpacing: "0.34em", color: GOLD, fontWeight: 600 }}>
          DUBAI · UAE
        </div>
      </Rise>
      <div style={{ height: 26 }} />
      <Rise delay={5}>
        <div style={{ fontFamily: SERIF, fontSize: 112, lineHeight: 1.02, color: INK }}>Palm</div>
      </Rise>
      <Rise delay={11}>
        <div style={{ fontFamily: SERIF, fontSize: 112, lineHeight: 1.02, color: INK, fontStyle: "italic" }}>
          Jumeirah
        </div>
      </Rise>
      <div style={{ height: 34 }} />
      <div style={{ height: 1, backgroundColor: INK, opacity: 0.25, transform: `scaleX(${rule})`, transformOrigin: "left" }} />
      <Label n="01" name="MASKED REVEAL" />
    </AbsoluteFill>
  );
};

// 02 — the letters start far apart and close on the word.
const TrackingCollapse: React.FC = () => {
  const frame = useCurrentFrame();
  const e = Easing.bezier(0.16, 1, 0.3, 1);
  const track = interpolate(frame, [0, 54], [0.62, 0.16], { extrapolateRight: "clamp", easing: e });
  const o = interpolate(frame, [0, 26], [0, 1], { extrapolateRight: "clamp" });
  const sub = interpolate(frame, [22, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: INK, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 54,
          fontWeight: 300,
          color: CREAM,
          letterSpacing: `${track}em`,
          // the tracking pushes the word right; pull back by half of it
          marginLeft: `${track}em`,
          opacity: o,
        }}
      >
        WATERFRONT
      </div>
      <div style={{ height: 22 }} />
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 27,
          color: GOLD,
          fontStyle: "italic",
          opacity: sub,
          transform: `translateY(${(1 - sub) * 10}px)`,
        }}
      >
        four bedroom signature villas
      </div>
      <Label n="02" name="TRACKING COLLAPSE" dark />
    </AbsoluteFill>
  );
};

// 03 — words arrive one at a time, resolving out of defocus.
const WordStagger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = "A private frond address facing open water".split(" ");
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM, justifyContent: "center", padding: "0 76px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", columnGap: 19, rowGap: 0 }}>
        {words.map((w, i) => {
          const p = spring({ frame: frame - i * 4, fps, config: { damping: 200, mass: 0.6 } });
          return (
            <span
              key={i}
              style={{
                fontFamily: SERIF,
                fontSize: 62,
                lineHeight: 1.26,
                color: INK,
                opacity: p,
                filter: `blur(${(1 - p) * 11}px)`,
                transform: `translateY(${(1 - p) * 16}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <Label n="03" name="WORD STAGGER · BLUR IN" />
    </AbsoluteFill>
  );
};

// 04 — a figure counts up and lands. Easing matters more than the number.
const NumberRoll: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [6, 58], [0, 12_500_000], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.12, 0.8, 0.2, 1),
  });
  const o = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const rule = interpolate(frame, [30, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM, justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: SANS, fontSize: 19, letterSpacing: "0.3em", color: GOLD, fontWeight: 600, opacity: o }}>
        STARTING FROM
      </div>
      <div style={{ height: 24 }} />
      <div
        style={{
          fontFamily: SANS,
          fontSize: 86,
          fontWeight: 200,
          color: INK,
          opacity: o,
          // tabular figures, or the number jitters as the digits change width
          fontVariantNumeric: "tabular-nums",
        }}
      >
        AED {Math.round(v).toLocaleString("en-US")}
      </div>
      <div style={{ height: 30 }} />
      <div style={{ width: 150, height: 1, backgroundColor: INK, opacity: 0.3, transform: `scaleX(${rule})` }} />
      <Label n="04" name="FIGURE ROLL" />
    </AbsoluteFill>
  );
};

// 05 — the letterforms are a hole cut in a flat colour, so the water that is
// actually moving underneath shows through them.
const Knockout: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const o = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const track = interpolate(frame, [0, 60], [34, 20], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#9CC6DD" }}>
      <CanvasImage
        src={staticFile("pool.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        effects={[poolWater({ waterline: 0.735, amplitude: 9, scale: 2.6, caustics: 0.14, period: 3, time: t * 3 })]}
      />
      <svg viewBox="0 0 1080 1350" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="knock">
            <rect width="1080" height="1350" fill="white" />
            <text
              // letter-spacing adds a trailing gap after the last glyph, which
              // shifts a middle-anchored line right by half of it
              x={540 - track / 2}
              y="1075"
              textAnchor="middle"
              fill="black"
              style={{ fontFamily: SANS, fontSize: 196, fontWeight: 800, letterSpacing: `${track}px` }}
            >
              DUBAI
            </text>
          </mask>
        </defs>
        <rect width="1080" height="1350" fill={CREAM} mask="url(#knock)" opacity={o} />
      </svg>
      <Label n="05" name="KNOCKOUT · LIVE FILL" />
    </AbsoluteFill>
  );
};

// 06 — the type sits between the photograph and a cut-out of its own
// foreground, so the palms pass in front of it. This is the composite that
// puts an object behind someone's head; only the source of the cut-out
// changes.
const BehindSubject: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, SECTION], [120, -120], {
    easing: Easing.bezier(0.3, 0, 0.4, 1),
  });
  const o = interpolate(frame, [2, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fill: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
  return (
    <AbsoluteFill style={{ backgroundColor: "#9CC6DD" }}>
      {/* the plate */}
      <Img src={staticFile("pool.png")} style={fill} />
      {/* the type, in the scene */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 332 }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: "0.04em",
            color: "#FFFFFF",
            opacity: o,
            transform: `translateX(${x}px)`,
            whiteSpace: "nowrap",
          }}
        >
          ON THE PALM
        </div>
      </AbsoluteFill>
      {/* everything that is not sky, laid back over the top */}
      <Img src={staticFile("pool-fg.png")} style={fill} />
      <Label n="06" name="BEHIND THE SUBJECT" dark />
    </AbsoluteFill>
  );
};

const SECTIONS = [MaskedReveal, TrackingCollapse, WordStagger, NumberRoll, Knockout, BehindSubject];

export const TextLab: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CREAM }}>
    {SECTIONS.map((C, i) => (
      <Sequence key={i} from={i * SECTION} durationInFrames={SECTION}>
        <C />
      </Sequence>
    ))}
  </AbsoluteFill>
);
