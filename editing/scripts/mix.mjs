#!/usr/bin/env node
/**
 * Lay an Epidemic Sound track under a clip: duck the music whenever anyone
 * speaks, then normalise the whole mix to -14 LUFS (the loudness Instagram,
 * YouTube and LinkedIn all target, so nothing gets turned down on upload).
 *
 *   node scripts/mix.mjs exports/cut.mp4 music/golden-hour.mp3 exports/final.mp4
 *
 * Options:  --music-db -18   how loud the bed sits under speech (default -18)
 *           --no-duck        constant music level, no ducking
 */
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const positional = argv.filter((a) => !a.startsWith("--") && !/^-?\d+(\.\d+)?$/.test(a));
const [video, music, output = "exports/final.mp4"] = positional;

if (!video || !music) {
  console.error("usage: node scripts/mix.mjs <video> <music> [output] [--music-db -18] [--no-duck]");
  process.exit(1);
}
const dbIndex = argv.indexOf("--music-db");
const musicDb = dbIndex === -1 ? -18 : Number(argv[dbIndex + 1]);

const hasVoice =
  execFileSync("ffprobe", [
    "-v", "error",
    "-select_streams", "a",
    "-show_entries", "stream=index",
    "-of", "csv=p=0",
    video,
  ]).toString().trim().length > 0;

const duck = hasVoice && !flags.has("--no-duck");

// Music is trimmed to the video's length and faded out at the end, so a long
// track never dictates the runtime.
const chain = [];
chain.push(`[1:a]volume=${musicDb}dB,afade=t=out:st=0:d=2:curve=tri[bed_raw]`);

if (duck) {
  // Split the voice: one copy is heard, one only steers the compressor.
  chain.push(`[0:a]asplit=2[voice][key]`);
  chain.push(`[bed_raw][key]sidechaincompress=threshold=0.05:ratio=8:attack=15:release=450[bed]`);
  chain.push(`[voice][bed]amix=inputs=2:duration=shortest:dropout_transition=0[mixed]`);
} else if (hasVoice) {
  chain.push(`[0:a][bed_raw]amix=inputs=2:duration=shortest:dropout_transition=0[mixed]`);
} else {
  chain.push(`[bed_raw]anull[mixed]`);
}
chain.push(`[mixed]loudnorm=I=-14:TP=-1.5:LRA=11[out]`);

mkdirSync(dirname(output), { recursive: true });
execFileSync(
  "ffmpeg",
  [
    "-v", "error", "-stats", "-y",
    "-i", video,
    "-stream_loop", "-1", "-i", music,
    "-filter_complex", chain.join(";"),
    "-map", "0:v", "-map", "[out]",
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "192k",
    "-shortest",
    output,
  ],
  { stdio: "inherit" },
);

console.log(
  `mixed ${duck ? "with ducking" : "without ducking"}, bed at ${musicDb}dB, normalised to -14 LUFS -> ${output}`,
);
