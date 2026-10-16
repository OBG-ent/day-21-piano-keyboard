# 🎹 Piano Keys — Playable Web Piano

**A real piano in your browser. Click it, tap it, or play it with your computer keyboard — then record your masterpiece.**

No audio files, no plugins, no build step. Every note is synthesized live with the Web Audio API, shaped with a piano-like envelope so it sings instead of beeps.

## ✨ Features

- 🎹 **2 full octaves** (C4–B5) with properly laid-out black keys
- ⌨️ **Computer-keyboard playing** — `Z`–`M` and `Q`–`U` rows are mapped to keys (labels shown right on the keys)
- 🔊 **Volume control**
- ⏺ **Record & playback** — capture a take, replay it with keys lighting up in time
- 📱 Touch-friendly — works on phones and tablets
- 🌙 Stage-dark UI with glowing gold keys

## 🚀 Run it in 30 seconds

1. Download or clone this repo
2. Open `index.html` in any modern browser
3. Play!

```bash
npx serve .
```

**Try this:** hit ⏺ Record, play the first line of "Twinkle Twinkle" (`C C G G A A G`), hit ⏹ Stop, then ▶ Play.

## 🧠 What I practiced (Day 21 of my daily coding journey)

- Web Audio API: oscillators, gain nodes, ADSR-style envelopes
- Building DOM from data (keyboard generated from a note table)
- Pointer + keyboard event handling, auto-repeat suppression
- Scheduling timed playback with `setTimeout` and audio-clock offsets
- Recording event streams with timestamps

Day 21 of my daily coding journey. 🎶
