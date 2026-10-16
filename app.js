/* Piano Keys — playable web piano.
 *
 * How it works:
 *  1. We build the keyboard in JS from a list of notes (2 octaves: C4–B5).
 *  2. The Web Audio API creates each note's sound from an oscillator —
 *     no audio files needed. An envelope (attack/decay/sustain/release)
 *     makes it sound piano-like instead of a flat beep.
 *  3. Clicking, touching, or pressing the mapped computer key plays a note.
 *  4. The recorder stores (note, timestamp) pairs; Play replays them on time.
 */

// ---- Note data: name, frequency (Hz), and whether it's a black key ----
const NOTES = [
  // Octave 4
  { name: 'C4',  freq: 261.63, black: false, kb: 'z' },
  { name: 'C#4', freq: 277.18, black: true,  kb: 's' },
  { name: 'D4',  freq: 293.66, black: false, kb: 'x' },
  { name: 'D#4', freq: 311.13, black: true,  kb: 'd' },
  { name: 'E4',  freq: 329.63, black: false, kb: 'c' },
  { name: 'F4',  freq: 349.23, black: false, kb: 'v' },
  { name: 'F#4', freq: 369.99, black: true,  kb: 'g' },
  { name: 'G4',  freq: 392.00, black: false, kb: 'b' },
  { name: 'G#4', freq: 415.30, black: true,  kb: 'h' },
  { name: 'A4',  freq: 440.00, black: false, kb: 'n' },
  { name: 'A#4', freq: 466.16, black: true,  kb: 'j' },
  { name: 'B4',  freq: 493.88, black: false, kb: 'm' },
  // Octave 5
  { name: 'C5',  freq: 523.25, black: false, kb: 'q' },
  { name: 'C#5', freq: 554.37, black: true,  kb: '2' },
  { name: 'D5',  freq: 587.33, black: false, kb: 'w' },
  { name: 'D#5', freq: 622.25, black: true,  kb: '3' },
  { name: 'E5',  freq: 659.25, black: false, kb: 'e' },
  { name: 'F5',  freq: 698.46, black: false, kb: 'r' },
  { name: 'F#5', freq: 739.99, black: true,  kb: '5' },
  { name: 'G5',  freq: 783.99, black: false, kb: 't' },
  { name: 'G#5', freq: 830.61, black: true,  kb: '6' },
  { name: 'A5',  freq: 880.00, black: false, kb: 'y' },
  { name: 'A#5', freq: 932.33, black: true,  kb: '7' },
  { name: 'B5',  freq: 987.77, black: false, kb: 'u' },
];

// ---- Audio setup: one shared AudioContext + a gain node for volume ----
let audioCtx = null;
const masterGain = { node: null };
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain.node = audioCtx.createGain();
    masterGain.node.gain.value = document.getElementById('volume').value / 100;
    masterGain.node.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

// Play one note with a piano-like envelope:
// quick attack, then a decay down to a soft sustain while held.
function playTone(freq, when = 0) {
  ensureAudio();
  const t0 = audioCtx.currentTime + when;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';           // triangle wave sounds softer than square
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(1.0, t0 + 0.01);   // attack
  gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.4); // decay to sustain
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 2.5); // gentle fade out
  osc.connect(gain).connect(masterGain.node);
  osc.start(t0);
  osc.stop(t0 + 2.6);
}

// ---- Build the visible keyboard ----
const pianoEl = document.getElementById('piano');
const statusEl = document.getElementById('status');
const keyEls = {}; // note name -> DOM element

NOTES.forEach((n) => {
  const key = document.createElement('div');
  key.className = 'key ' + (n.black ? 'black' : 'white');
  key.dataset.note = n.name;
  key.dataset.freq = n.freq;
  key.textContent = n.kb.toUpperCase(); // show the computer-keyboard mapping
  keyEls[n.name] = key;
  pianoEl.appendChild(key);
});

// ---- Recorder: stores {note, at} pairs, 'at' = ms since recording started ----
let recording = false;
let recStart = 0;
let events = [];

function noteOn(noteName, freq) {
  playTone(freq);
  keyEls[noteName].classList.add('active');
  statusEl.textContent = `♪ ${noteName}`;
  if (recording) {
    events.push({ note: noteName, freq, at: performance.now() - recStart });
    updateRecButtons();
  }
}
function noteOff(noteName) {
  keyEls[noteName].classList.remove('active');
}

// Mouse + touch: pointer events cover both, and pointerleave releases the key
pianoEl.addEventListener('pointerdown', (e) => {
  const key = e.target.closest('.key');
  if (!key) return;
  e.preventDefault();
  noteOn(key.dataset.note, parseFloat(key.dataset.freq));
});
window.addEventListener('pointerup', () => {
  document.querySelectorAll('.key.active').forEach((k) => noteOff(k.dataset.note));
});

// Computer keyboard: map keys from the NOTES table
const kbMap = {};
NOTES.forEach((n) => (kbMap[n.kb] = n));
window.addEventListener('keydown', (e) => {
  if (e.repeat) return; // ignore held-down auto-repeat
  const n = kbMap[e.key.toLowerCase()];
  if (n && !keyEls[n.name].classList.contains('active')) {
    noteOn(n.name, n.freq);
  }
});
window.addEventListener('keyup', (e) => {
  const n = kbMap[e.key.toLowerCase()];
  if (n) noteOff(n.name);
});

// ---- Volume control ----
document.getElementById('volume').addEventListener('input', (e) => {
  ensureAudio();
  masterGain.node.gain.value = e.target.value / 100;
});

// ---- Record / Play / Clear ----
const recordBtn = document.getElementById('record-btn');
const playBtn = document.getElementById('play-btn');
const clearBtn = document.getElementById('clear-btn');

function updateRecButtons() {
  playBtn.disabled = events.length === 0 || recording;
  clearBtn.disabled = events.length === 0 || recording;
}

recordBtn.addEventListener('click', () => {
  ensureAudio();
  recording = !recording;
  recordBtn.classList.toggle('recording', recording);
  if (recording) {
    events = [];              // start a fresh take each time
    recStart = performance.now();
    recordBtn.textContent = '⏹ Stop';
    statusEl.textContent = '🔴 Recording… play something!';
  } else {
    recordBtn.textContent = '⏺ Record';
    statusEl.textContent = events.length
      ? `Recorded ${events.length} note${events.length > 1 ? 's' : ''} — hit Play!`
      : 'Recording stopped (nothing captured).';
  }
  updateRecButtons();
});

playBtn.addEventListener('click', () => {
  if (!events.length) return;
  statusEl.textContent = '▶ Playing your recording…';
  events.forEach((ev) => {
    playTone(ev.freq, ev.at / 1000); // schedule each note at its recorded offset
    // Light up the key in time with the sound
    setTimeout(() => {
      keyEls[ev.note].classList.add('active');
      setTimeout(() => keyEls[ev.note].classList.remove('active'), 250);
    }, ev.at);
  });
  const total = events[events.length - 1].at;
  setTimeout(() => (statusEl.textContent = 'Done — record another take!'), total + 500);
});

clearBtn.addEventListener('click', () => {
  events = [];
  updateRecButtons();
  statusEl.textContent = 'Recording cleared.';
});
