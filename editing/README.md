# Editing system

Local video editing driven by a transcript and a chat prompt. Nothing here
calls a hosted API, needs an API key, or uploads your footage anywhere.

    record anywhere            Tella, Loom, QuickTime, your phone
            |
            v
    hyperframes transcribe     word-level timestamps
            |
            v
    chat with Claude Code      "cut the waffle at the start"
            |
            v
    scripts/cut.mjs            FFmpeg applies the cut list
            |
            v
    scripts/mix.mjs            Epidemic track under it, ducked + normalised
            |
            v
    exports/final.mp4

## Folders

| folder     | what goes in it                                  |
| ---------- | ------------------------------------------------ |
| `footage/` | source recordings (git-ignored)                  |
| `music/`   | tracks downloaded from Epidemic Sound (ignored)  |
| `exports/` | anything produced (ignored)                      |

## One-time setup

Already done on this machine, listed so it can be rebuilt:

1. **Node 22+** - `node -v`
2. **FFmpeg + FFprobe on PATH.** Without admin rights:
   ```bash
   mkdir -p ~/.local/tools ~/.local/bin && cd ~/.local/tools
   npm init -y && npm i ffmpeg-static @ffprobe-installer/ffprobe
   ln -sf ~/.local/tools/node_modules/ffmpeg-static/ffmpeg ~/.local/bin/ffmpeg
   ln -sf ~/.local/tools/node_modules/@ffprobe-installer/darwin-arm64/ffprobe ~/.local/bin/ffprobe
   ```
   `~/.local/bin` must be on PATH.
3. **Check it:** `npx hyperframes@latest doctor`
   FFmpeg, FFprobe, Chrome and Node should be green. whisper-cpp, Kokoro,
   MusicGen and Docker can stay red - the transcriber installs its own runtime
   on first use, and you supply music from Epidemic rather than generating it.

## Using it

**1. Drop a recording in `footage/`.**

**2. Transcribe it.** First run downloads the speech model.

```bash
npx hyperframes@latest transcribe footage/walkthrough.mp4 --json > exports/transcript.json
```

**3. Look at the footage.** Agents read images, not video, so turn the clip
into stills before asking one to judge it:

```bash
node scripts/frames.mjs footage/walkthrough.mp4 12
```

**4. Decide the cuts.** Hand the transcript to Claude Code and say what you
want gone. It writes a `cuts.json`:

```json
{ "keep": [[0, 12.5], [31.2, 48.0]] }
```

Ranges are seconds, and they are what you *keep*.

**5. Cut.**

```bash
node scripts/cut.mjs footage/walkthrough.mp4 cuts.json exports/cut.mp4
```

Re-encodes, so cuts land on the exact frame rather than the nearest keyframe.

**6. Add music.** Download a track from your Epidemic Sound subscription into
`music/`, then:

```bash
node scripts/mix.mjs exports/cut.mp4 music/golden-hour.mp3 exports/final.mp4
```

The bed ducks under speech and the mix is normalised to -14 LUFS, the loudness
Instagram, YouTube and LinkedIn all target - so nothing is turned down on
upload.

```bash
node scripts/mix.mjs exports/cut.mp4 music/track.mp3 --music-db -22   # quieter bed
node scripts/mix.mjs exports/cut.mp4 music/track.mp3 --no-duck        # constant level
```

## Branded graphics

Titles, lower thirds and end cards are compositions, not edits. Build them
with HyperFrames (`npx hyperframes@latest init`) or with the Remotion
templates in the parent folder, render to MP4, and join them on with
`cut.mjs`.

## Epidemic Sound

There is an API, but it needs a partnership agreement, so this uses manual
downloads instead: pick a track in the web app, download the MP3, drop it in
`music/`. Your subscription covers the licence; nothing here changes that.

## What is NOT automated

- Choosing the best take, or cutting on action. The transcript says what was
  said, not what looks good.
- Beat-matched cuts. `npx hyperframes@latest beats <track>` finds the beats;
  aligning cuts to them is still a manual call.
