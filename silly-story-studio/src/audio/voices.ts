/**
 * Character voices: microphone recording (MediaRecorder), local-only storage
 * (IndexedDB, never uploaded) and playback with silly pitch effects (Web Audio).
 */
import { getAudioContext, getOutput } from './sfx';

export const MAX_RECORD_MS = 10_000;

/* ------------------------------------------------------------------ */
/* Support & permission                                                */
/* ------------------------------------------------------------------ */

export type MicSupport = 'ok' | 'insecure' | 'unsupported';
export type MicPermission = 'granted' | 'denied' | 'prompt' | 'unknown';

export function micSupport(): MicSupport {
  if (!window.isSecureContext) return 'insecure';
  if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === 'undefined') return 'unsupported';
  return 'ok';
}

/** Reads the current microphone permission without prompting. */
export async function queryMicPermission(): Promise<{ state: MicPermission; status?: PermissionStatus }> {
  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return { state: status.state as MicPermission, status };
  } catch {
    return { state: 'unknown' };
  }
}

export type MicErrorKind = 'denied' | 'nomic' | 'error';

export function classifyMicError(err: unknown): MicErrorKind {
  const name = (err as { name?: string })?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') return 'nomic';
  return 'error';
}

const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
};

/** Asks the browser for microphone access, then immediately releases the mic. */
export async function requestMicAccess(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
  stream.getTracks().forEach((t) => t.stop());
}

/* ------------------------------------------------------------------ */
/* Recording                                                           */
/* ------------------------------------------------------------------ */

function pickMimeType(): string | undefined {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t));
}

export class VoiceRecorder {
  private stream: MediaStream | null = null;
  private rec: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private raf = 0;
  private source: MediaStreamAudioSourceNode | null = null;
  private stopped: Promise<Blob> | null = null;

  /** Starts recording. `onLevel` receives the input loudness (0..1) every frame. */
  async start(onLevel?: (level: number) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
    const mimeType = pickMimeType();
    this.rec = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.chunks = [];
    const rec = this.rec;
    this.stopped = new Promise<Blob>((resolve) => {
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.chunks.push(e.data);
      };
      rec.onstop = () => resolve(new Blob(this.chunks, { type: rec.mimeType || mimeType || 'audio/webm' }));
    });
    rec.start(250);

    const c = getAudioContext();
    if (c && onLevel) {
      this.source = c.createMediaStreamSource(this.stream);
      const analyser = c.createAnalyser();
      analyser.fftSize = 512;
      this.source.connect(analyser);
      const data = new Float32Array(analyser.fftSize);
      const tick = () => {
        analyser.getFloatTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
        const rms = Math.sqrt(sum / data.length);
        onLevel(Math.min(1, rms * 6));
        this.raf = requestAnimationFrame(tick);
      };
      tick();
    }
  }

  get recording(): boolean {
    return this.rec?.state === 'recording';
  }

  /** Stops recording, releases the microphone and returns the audio. */
  async stop(): Promise<Blob | null> {
    cancelAnimationFrame(this.raf);
    this.source?.disconnect();
    this.source = null;
    const rec = this.rec;
    if (!rec || !this.stopped) {
      this.release();
      return null;
    }
    if (rec.state !== 'inactive') rec.stop();
    const blob = await this.stopped;
    this.release();
    this.rec = null;
    this.stopped = null;
    return blob;
  }

  private release(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}

/* ------------------------------------------------------------------ */
/* Local storage (IndexedDB)                                           */
/* ------------------------------------------------------------------ */

const DB_NAME = 'silly-story-studio';
const STORE = 'voices';

interface VoiceRecord {
  blob: Blob;
  savedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

export async function listVoiceIds(): Promise<string[]> {
  try {
    const keys = await tx('readonly', (s) => s.getAllKeys());
    return keys.map(String);
  } catch {
    return [];
  }
}

async function loadBlob(id: string): Promise<Blob | null> {
  try {
    const rec = await tx<VoiceRecord | undefined>('readonly', (s) => s.get(id));
    return rec?.blob ?? null;
  } catch {
    return null;
  }
}

/**
 * Saves a voice on this device. The voice is usable for this session even if
 * storage fails (e.g. a private window); returns whether it was stored for later.
 */
export async function saveVoice(id: string, blob: Blob, buffer: AudioBuffer): Promise<boolean> {
  cache.set(id, buffer);
  try {
    await tx('readwrite', (s) => s.put({ blob, savedAt: Date.now() } satisfies VoiceRecord, id));
    // Ask the browser to keep our data even when storage runs low (best effort).
    void navigator.storage?.persist?.().catch(() => {});
    return true;
  } catch {
    return false;
  }
}

export async function deleteVoice(id: string): Promise<void> {
  cache.delete(id);
  try {
    await tx('readwrite', (s) => s.delete(id));
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/* Decoding & playback                                                 */
/* ------------------------------------------------------------------ */

const cache = new Map<string, AudioBuffer>();
const SILENCE = 0.015;

/**
 * Decodes a recording and trims quiet bits at the start and end, so a voice
 * plays the moment a character is tapped. Returns null if it's all silence.
 */
export async function decodeVoice(blob: Blob): Promise<AudioBuffer | null> {
  const c = getAudioContext();
  if (!c) return null;
  const raw = await c.decodeAudioData(await blob.arrayBuffer());
  const ch = raw.getChannelData(0);
  let first = -1;
  let last = -1;
  for (let i = 0; i < ch.length; i++) {
    if (Math.abs(ch[i]) > SILENCE) {
      if (first < 0) first = i;
      last = i;
    }
  }
  if (first < 0) return null;
  const pad = Math.floor(raw.sampleRate * 0.06);
  const start = Math.max(0, first - pad);
  const end = Math.min(ch.length, last + pad * 2);
  const len = Math.max(1, end - start);
  const out = c.createBuffer(raw.numberOfChannels, len, raw.sampleRate);
  for (let k = 0; k < raw.numberOfChannels; k++) {
    out.copyToChannel(raw.getChannelData(k).subarray(start, end), k);
  }
  return out;
}

async function getBuffer(id: string): Promise<AudioBuffer | null> {
  const hit = cache.get(id);
  if (hit) return hit;
  const blob = await loadBlob(id);
  if (!blob) return null;
  try {
    const buf = await decodeVoice(blob);
    if (buf) cache.set(id, buf);
    return buf;
  } catch {
    return null;
  }
}

let current: AudioBufferSourceNode | null = null;

/**
 * Plays a character's voice. rate 1 = normal, >1 = squeaky, <1 = deep.
 * Returns the playback length in seconds, or 0 if there's no voice.
 */
export async function playVoice(id: string, rate = 1): Promise<number> {
  const c = getAudioContext();
  const out = getOutput();
  if (!c || !out) return 0;
  const buf = await getBuffer(id);
  if (!buf) return 0;
  try {
    current?.stop();
  } catch {
    // already stopped
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate;
  const g = c.createGain();
  g.gain.value = 1.4;
  src.connect(g);
  g.connect(out);
  src.start();
  current = src;
  src.onended = () => {
    if (current === src) current = null;
  };
  return buf.duration / rate;
}
