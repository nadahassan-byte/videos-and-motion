import React from "react";

/**
 * A stand-in masterplan, drawn as SVG so the template runs with no assets.
 * Swap for the real aerial render: drop it in public/ and replace this with
 *   <CanvasImage src={staticFile("masterplan.png")} ... />
 */
export const SitePlan: React.FC = () => {
  const plots: React.ReactElement[] = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 14; col++) {
      if (rand() > 0.82) continue;
      plots.push(
        <rect
          key={`${row}-${col}`}
          x={40 + col * 68 + rand() * 6}
          y={40 + row * 62 + rand() * 6}
          width={46}
          height={34}
          rx={3}
          fill={rand() > 0.5 ? "#E8E4DC" : "#D6D1C7"}
          opacity={0.9}
        />,
      );
    }
  }

  return (
    <svg
      viewBox="0 0 1000 760"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <rect width={1000} height={760} fill="#2F3B2A" />
      {/* parkland */}
      <circle cx={180} cy={620} r={150} fill="#3C4C34" />
      <circle cx={820} cy={160} r={120} fill="#3C4C34" />
      <rect x={0} y={300} width={1000} height={70} fill="#3A4733" />
      {/* water */}
      <path d="M0 700 Q 180 660 330 718 L 330 760 L 0 760 Z" fill="#2B4E5C" />
      {/* roads */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={`h${i}`}
          x={0}
          y={120 + i * 118}
          width={1000}
          height={11}
          fill="#55554F"
          opacity={0.85}
        />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={`v${i}`}
          x={90 + i * 134}
          y={0}
          width={11}
          height={760}
          fill="#55554F"
          opacity={0.85}
        />
      ))}
      {plots}
    </svg>
  );
};
