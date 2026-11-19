/**
 * Funny sound effects, synthesised live with the Web Audio API.
 * No audio files are needed, so everything works offline.
 */

export type SoundName =
  | 'boing'
  | 'pop'
  | 'spawn'
  | 'pickup'
  | 'drop'
  | 'putAway'
  | 'slideUp'
  | 'slideDown'
  | 'honk'
  | 'squeak'
  | 'sparkle'
  | 'magic'
  | 'harp'
  | 'drum'
  | 'whoosh'
  | 'rocket'
  | 'beepBoop'
  | 'roar'
  | 'meow'
  | 'theremin'
  | 'blub'
  | 'giggle'
  | 'tada'
  | 'partyHorn'
  | 'rustle'
  | 'crunch'
  | 'slurp'
  | 'puff'
  | 'fwump'
  | 'uhOh';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let muted = false;

const MASTER_VOLUME = 0.85;

export function getAudioContext(): AudioContext | null {
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    master = ctx.createGain();
    master.gain.value = muted ? 0 : MASTER_VOLUME;
    master.connect(comp);
    comp.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

/** The node every sound (including recorded voices) plays into. */
export function getOutput(): GainNode | null {
  getAudioContext();
  return master;
}

/** Call from any user gesture so the browser lets audio start. */
export function unlockAudio(): void {
  getAudioContext();
}

export function setMuted(m: boolean): void {
  muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : MASTER_VOLUME, ctx.currentTime, 0.02);
}

function noise(c: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

interface ToneOpts {
  type?: OscillatorType;
  f0: number;
  f1?: number;
  /** Optional middle frequency, reached halfway through. */
  fm?: number;
  t: number;
  dur: number;
  vol?: number;
  attack?: number;
  vibRate?: number;
  vibDepth?: number;
  filter?: { type: BiquadFilterType; f: number; q?: number; f1?: number };
}

function tone(c: AudioContext, out: AudioNode, o: ToneOpts): void {
  const osc = c.createOscillator();
  osc.type = o.type ?? 'sine';
  const g = c.createGain();
  const vol = o.vol ?? 0.3;
  const attack = o.attack ?? 0.008;
  const end = o.t + o.dur;
  osc.frequency.setValueAtTime(o.f0, o.t);
  if (o.fm !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(o.fm, o.t + o.dur / 2);
    if (o.f1 !== undefined) osc.frequency.exponentialRampToValueAtTime(o.f1, end);
  } else if (o.f1 !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(o.f1, end);
  }
  g.gain.setValueAtTime(0.0001, o.t);
  g.gain.linearRampToValueAtTime(vol, o.t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  let node: AudioNode = osc;
  if (o.vibRate && o.vibDepth) {
    const lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = o.vibRate;
    lg.gain.value = o.vibDepth;
    lfo.connect(lg);
    lg.connect(osc.frequency);
    lfo.start(o.t);
    lfo.stop(end + 0.05);
  }
  if (o.filter) {
    const f = c.createBiquadFilter();
    f.type = o.filter.type;
    f.frequency.setValueAtTime(o.filter.f, o.t);
    if (o.filter.f1) f.frequency.exponentialRampToValueAtTime(o.filter.f1, end);
    f.Q.value = o.filter.q ?? 1;
    node.connect(f);
    node = f;
  }
  node.connect(g);
  g.connect(out);
  osc.start(o.t);
  osc.stop(end + 0.05);
}

interface NoiseOpts {
  t: number;
  dur: number;
  vol?: number;
  type?: BiquadFilterType;
  f0: number;
  f1?: number;
  q?: number;
  attack?: number;
}

function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts): void {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.setValueAtTime(o.f0, o.t);
  if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, o.t + o.dur);
  f.Q.value = o.q ?? 1;
  const g = c.createGain();
  const attack = o.attack ?? 0.01;
  g.gain.setValueAtTime(0.0001, o.t);
  g.gain.linearRampToValueAtTime(o.vol ?? 0.3, o.t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
  src.connect(f);
  f.connect(g);
  g.connect(out);
  src.start(o.t, Math.random() * 0.5);
  src.stop(o.t + o.dur + 0.05);
}

function bell(c: AudioContext, out: AudioNode, f: number, t: number, vol = 0.18, dur = 0.5): void {
  tone(c, out, { type: 'sine', f0: f, t, dur, vol, attack: 0.004 });
  tone(c, out, { type: 'sine', f0: f * 2.01, t, dur: dur * 0.5, vol: vol * 0.3, attack: 0.004 });
}

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];

/** A single musical twinkle. `step` picks a note from a happy pentatonic scale. */
export function twinkle(step: number): void {
  const c = getAudioContext();
  if (!c || !master) return;
  const f = PENTATONIC[Math.max(0, Math.min(PENTATONIC.length - 1, Math.round(step)))];
  bell(c, master, f, c.currentTime + 0.005, 0.14, 0.45);
}

/** A short jingle in a given key, used when changing scenes. */
export function sceneJingle(base: number): void {
  const c = getAudioContext();
  if (!c || !master) return;
  const t = c.currentTime + 0.01;
  hiss(c, master, { t, dur: 0.45, vol: 0.12, f0: 400, f1: 3000, q: 0.8 });
  [1, 1.25, 1.5, 2].forEach((m, i) => bell(c, master!, base * m, t + 0.12 + i * 0.08, 0.13, 0.4));
}

const SOUNDS: Record<SoundName, (c: AudioContext, out: AudioNode, t: number) => void> = {
  boing: (c, out, t) => {
    tone(c, out, { f0: 520, f1: 160, t, dur: 0.45, vol: 0.35, vibRate: 16, vibDepth: 50 });
  },
  pop: (c, out, t) => {
    tone(c, out, { f0: 900, f1: 260, t, dur: 0.09, vol: 0.4 });
    hiss(c, out, { t, dur: 0.05, vol: 0.25, type: 'highpass', f0: 2000 });
  },
  spawn: (c, out, t) => {
    tone(c, out, { f0: 400, f1: 1100, t, dur: 0.14, vol: 0.28 });
    tone(c, out, { f0: 1200, f1: 600, t: t + 0.1, dur: 0.08, vol: 0.18 });
  },
  pickup: (c, out, t) => {
    tone(c, out, { f0: 500, f1: 800, t, dur: 0.08, vol: 0.14 });
  },
  drop: (c, out, t) => {
    tone(c, out, { f0: 220, f1: 70, t, dur: 0.16, vol: 0.4 });
    hiss(c, out, { t, dur: 0.06, vol: 0.08, type: 'lowpass', f0: 800 });
  },
  putAway: (c, out, t) => {
    tone(c, out, { f0: 1200, f1: 300, t, dur: 0.35, vol: 0.22, vibRate: 10, vibDepth: 20 });
    tone(c, out, { f0: 700, f1: 200, t: t + 0.32, dur: 0.08, vol: 0.3 });
  },
  slideUp: (c, out, t) => {
    tone(c, out, { f0: 300, f1: 1400, t, dur: 0.55, vol: 0.25, vibRate: 6, vibDepth: 12 });
  },
  slideDown: (c, out, t) => {
    tone(c, out, { f0: 1400, f1: 220, t, dur: 0.6, vol: 0.25, vibRate: 6, vibDepth: 12 });
  },
  honk: (c, out, t) => {
    for (const dt of [0, 0.28]) {
      tone(c, out, { type: 'sawtooth', f0: 330, f1: 300, t: t + dt, dur: 0.22, vol: 0.2, filter: { type: 'lowpass', f: 1300, q: 2 } });
      tone(c, out, { type: 'square', f0: 336, f1: 306, t: t + dt, dur: 0.22, vol: 0.1, filter: { type: 'lowpass', f: 1300, q: 2 } });
    }
  },
  squeak: (c, out, t) => {
    tone(c, out, { f0: 1300, fm: 1900, f1: 1400, t, dur: 0.16, vol: 0.22, vibRate: 40, vibDepth: 60 });
    tone(c, out, { f0: 1400, fm: 2100, f1: 1500, t: t + 0.2, dur: 0.14, vol: 0.2, vibRate: 40, vibDepth: 60 });
  },
  sparkle: (c, out, t) => {
    [1568, 2093, 1760, 2349, 2637].forEach((f, i) => bell(c, out, f, t + i * 0.06, 0.1, 0.35));
  },
  magic: (c, out, t) => {
    [784, 988, 1175, 1319, 1568, 1976, 2349].forEach((f, i) => bell(c, out, f, t + i * 0.05, 0.11, 0.5));
    hiss(c, out, { t, dur: 0.6, vol: 0.05, type: 'highpass', f0: 5000 });
  },
  harp: (c, out, t) => {
    [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760].forEach((f, i) =>
      tone(c, out, { type: 'triangle', f0: f, t: t + i * 0.045, dur: 0.6, vol: 0.12 }),
    );
  },
  drum: (c, out, t) => {
    for (const dt of [0, 0.18, 0.36]) {
      tone(c, out, { f0: 190, f1: 55, t: t + dt, dur: 0.22, vol: 0.5 });
      hiss(c, out, { t: t + dt, dur: 0.07, vol: 0.12, type: 'lowpass', f0: 1200 });
    }
  },
  whoosh: (c, out, t) => {
    hiss(c, out, { t, dur: 0.5, vol: 0.18, f0: 300, f1: 3000, q: 1.2, attack: 0.15 });
  },
  rocket: (c, out, t) => {
    hiss(c, out, { t, dur: 1.1, vol: 0.22, f0: 200, f1: 4000, q: 0.8, attack: 0.2 });
    tone(c, out, { type: 'sawtooth', f0: 80, f1: 300, t, dur: 1.0, vol: 0.08, filter: { type: 'lowpass', f: 600 } });
  },
  beepBoop: (c, out, t) => {
    [660, 880, 520, 990, 740].forEach((f, i) =>
      tone(c, out, { type: 'square', f0: f, t: t + i * 0.11, dur: 0.09, vol: 0.1, filter: { type: 'lowpass', f: 2500 } }),
    );
  },
  roar: (c, out, t) => {
    // A friendly little "rawr!"
    tone(c, out, {
      type: 'sawtooth',
      f0: 150,
      fm: 230,
      f1: 110,
      t,
      dur: 0.7,
      vol: 0.32,
      vibRate: 28,
      vibDepth: 18,
      filter: { type: 'lowpass', f: 700, f1: 1400, q: 3 },
    });
    hiss(c, out, { t, dur: 0.6, vol: 0.06, type: 'lowpass', f0: 600 });
  },
  meow: (c, out, t) => {
    tone(c, out, {
      type: 'sawtooth',
      f0: 480,
      fm: 760,
      f1: 420,
      t,
      dur: 0.6,
      vol: 0.2,
      attack: 0.05,
      vibRate: 6,
      vibDepth: 10,
      filter: { type: 'bandpass', f: 900, f1: 1600, q: 4 },
    });
    tone(c, out, { type: 'sine', f0: 480, fm: 760, f1: 420, t, dur: 0.6, vol: 0.12, attack: 0.05 });
  },
  theremin: (c, out, t) => {
    tone(c, out, { f0: 400, fm: 950, f1: 520, t, dur: 1.0, vol: 0.25, attack: 0.08, vibRate: 7, vibDepth: 30 });
  },
  blub: (c, out, t) => {
    [0, 0.1, 0.2, 0.3].forEach((dt, i) => tone(c, out, { f0: 180 + i * 40, f1: 420 + i * 60, t: t + dt, dur: 0.09, vol: 0.35 }));
    tone(c, out, { f0: 140, f1: 90, t: t + 0.42, dur: 0.3, vol: 0.3, vibRate: 12, vibDepth: 20 });
  },
  giggle: (c, out, t) => {
    [1100, 1000, 1080, 960, 1040, 900].forEach((f, i) =>
      tone(c, out, { f0: f, f1: f * 1.25, t: t + i * 0.085, dur: 0.07, vol: 0.16, vibRate: 30, vibDepth: 30 }),
    );
  },
  tada: (c, out, t) => {
    [523.25, 659.25, 783.99].forEach((f, i) => tone(c, out, { type: 'triangle', f0: f, t: t + i * 0.09, dur: 0.18, vol: 0.18 }));
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(c, out, { type: 'triangle', f0: f, t: t + 0.3, dur: 0.7, vol: 0.12 }));
  },
  partyHorn: (c, out, t) => {
    tone(c, out, {
      type: 'sawtooth',
      f0: 420,
      f1: 560,
      t,
      dur: 0.55,
      vol: 0.16,
      vibRate: 30,
      vibDepth: 25,
      filter: { type: 'lowpass', f: 2200, q: 2 },
    });
    [0.6, 0.66, 0.72].forEach((dt) => hiss(c, out, { t: t + dt, dur: 0.05, vol: 0.12, type: 'highpass', f0: 3000 }));
  },
  rustle: (c, out, t) => {
    for (let i = 0; i < 6; i++) hiss(c, out, { t: t + i * 0.07, dur: 0.09, vol: 0.12, type: 'highpass', f0: 2500 + i * 200 });
  },
  crunch: (c, out, t) => {
    for (let i = 0; i < 3; i++) hiss(c, out, { t: t + i * 0.12, dur: 0.07, vol: 0.3, f0: 1500, q: 1.5, attack: 0.002 });
  },
  slurp: (c, out, t) => {
    hiss(c, out, { t, dur: 0.5, vol: 0.18, f0: 2200, f1: 400, q: 6 });
    tone(c, out, { f0: 900, f1: 300, t, dur: 0.45, vol: 0.08, vibRate: 20, vibDepth: 80 });
  },
  puff: (c, out, t) => {
    hiss(c, out, { t, dur: 0.8, vol: 0.16, type: 'lowpass', f0: 400, f1: 1500, attack: 0.25 });
  },
  fwump: (c, out, t) => {
    hiss(c, out, { t, dur: 0.18, vol: 0.25, type: 'lowpass', f0: 900, f1: 200 });
    tone(c, out, { f0: 240, f1: 90, t, dur: 0.2, vol: 0.3 });
  },
  uhOh: (c, out, t) => {
    tone(c, out, { type: 'triangle', f0: 520, t, dur: 0.18, vol: 0.2 });
    tone(c, out, { type: 'triangle', f0: 390, t: t + 0.22, dur: 0.3, vol: 0.2 });
  },
};

export function play(name: SoundName): void {
  const c = getAudioContext();
  if (!c || !master) return;
  try {
    SOUNDS[name](c, master, c.currentTime + 0.005);
  } catch {
    // Never let a sound glitch break play.
  }
}
