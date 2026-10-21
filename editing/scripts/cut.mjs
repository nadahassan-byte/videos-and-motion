#!/usr/bin/env node
/**
 * Apply a cut list to a clip: keep the listed ranges, drop everything else,
 * join what is left. This is the script an agent drives after reading the
 * transcript - it decides the ranges, this executes them.
 *
 *   node scripts/cut.mjs footage/walkthrough.mp4 cuts.json exports/cut.mp4
 *
 * cuts.json:  { "keep": [[0, 12.5], [31.2, 48.0]] }   // seconds
 */
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [input, cutsPath, output = "exports/cut.mp4"] = process.argv.slice(2);
if (!input || !cutsPath) {
  console.error("usage: node scripts/cut.mjs <video> <cuts.json> [output]");
  process.exit(1);
}

const { keep } = JSON.parse(readFileSync(cutsPath, "utf8"));
if (!Array.isArray(keep) || keep.length === 0) {
  throw new Error("cuts.json needs a non-empty `keep` array of [start, end] pairs");
}
for (const [start, end] of keep) {
  if (!(end > start)) throw new Error(`bad range [${start}, ${end}] - end must be after start`);
}

const hasAudio =
  execFileSync("ffprobe", [
    "-v", "error",
    "-select_streams", "a",
    "-show_entries", "stream=index",
    "-of", "csv=p=0",
    input,
  ]).toString().trim().length > 0;

// One filter_complex: trim each kept range, then concat. Re-encodes, so cuts
// land on the exact frame rather than the nearest keyframe.
const parts = [];
keep.forEach(([start, end], i) => {
  parts.push(`[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}]`);
  if (hasAudio) {
    parts.push(`[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${i}]`);
  }
});
const streams = keep.map((_, i) => (hasAudio ? `[v${i}][a${i}]` : `[v${i}]`)).join("");
parts.push(`${streams}concat=n=${keep.length}:v=1:a=${hasAudio ? 1 : 0}[v]${hasAudio ? "[a]" : ""}`);

mkdirSync(dirname(output), { recursive: true });
const args = [
  "-v", "error", "-stats", "-y",
  "-i", input,
  "-filter_complex", parts.join(";"),
  "-map", "[v]",
];
if (hasAudio) args.push("-map", "[a]", "-c:a", "aac", "-b:a", "192k");
args.push("-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", output);

execFileSync("ffmpeg", args, { stdio: "inherit" });

const kept = keep.reduce((sum, [s, e]) => sum + (e - s), 0);
console.log(`kept ${keep.length} segment(s), ${kept.toFixed(1)}s total -> ${output}`);
