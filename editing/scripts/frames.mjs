#!/usr/bin/env node
/**
 * Pull evenly-spaced stills out of a clip so an AI agent (or you) can SEE the
 * footage. Agents can read images but not watch video, so this is how the
 * footage becomes reviewable.
 *
 *   node scripts/frames.mjs footage/walkthrough.mp4 12
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { basename, extname, join } from "node:path";

const [input, countArg] = process.argv.slice(2);
if (!input) {
  console.error("usage: node scripts/frames.mjs <video> [count=12]");
  process.exit(1);
}
const count = Number(countArg) || 12;

const duration = Number(
  execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1",
    input,
  ]).toString().trim(),
);
if (!Number.isFinite(duration)) throw new Error(`could not read duration of ${input}`);

const outDir = join("exports", `${basename(input, extname(input))}-frames`);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (let i = 0; i < count; i++) {
  // Sample inside the clip, never exactly at the ends (often black).
  const t = (duration * (i + 0.5)) / count;
  const label = `${String(i).padStart(3, "0")}_${t.toFixed(2)}s.jpg`;
  execFileSync("ffmpeg", [
    "-v", "error", "-y",
    "-ss", t.toFixed(3),
    "-i", input,
    "-frames:v", "1",
    "-q:v", "3",
    join(outDir, label),
  ]);
}
console.log(`${count} frames from ${duration.toFixed(1)}s clip -> ${outDir}`);
