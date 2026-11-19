/**
 * Microphone recording for whole shows (MediaRecorder), with pause/resume and a
 * live loudness meter. Audio stays on the device.
 */

export type MicSupport = 'ok' | 'insecure' | 'unsupported';
export type MicPermission = 'granted' | 'denied' | 'prompt' | 'unknown';
export type MicErrorKind = 'denied' | 'nomic' | 'error';

/** The longest a single show can be. It stops and saves itself after this. */
export const MAX_SHOW_MS = 5 * 60_000;

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

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

export function classifyMicError(err: unknown): MicErrorKind {
  const name = (err as { name?: string })?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') return 'nomic';
  return 'error';
}

function pickMimeType(): string | undefined {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t));
}

export class ShowRecorder {
  private stream: MediaStream | null = null;
  private rec: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private raf = 0;
  private source: MediaStreamAudioSourceNode | null = null;
  private stopped: Promise<Blob> | null = null;

  /** Opens the mic and starts recording. `onLevel` gets loudness (0..1) every frame. */
  async start(onLevel?: (level: number) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    const mimeType = pickMimeType();
    const rec = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.rec = rec;
    this.chunks = [];
    this.stopped = new Promise<Blob>((resolve) => {
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.chunks.push(e.data);
      };
      rec.onstop = () => resolve(new Blob(this.chunks, { type: rec.mimeType || mimeType || 'audio/webm' }));
    });
    rec.start(500);

    const c = audioContext();
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
        onLevel(this.rec?.state === 'recording' ? Math.min(1, Math.sqrt(sum / data.length) * 6) : 0);
        this.raf = requestAnimationFrame(tick);
      };
      tick();
    }
  }

  pause(): void {
    if (this.rec?.state === 'recording') this.rec.pause();
  }

  resume(): void {
    if (this.rec?.state === 'paused') this.rec.resume();
  }

  /** Stops recording, releases the microphone and returns the audio. */
  async stop(): Promise<Blob | null> {
    cancelAnimationFrame(this.raf);
    this.source?.disconnect();
    this.source = null;
    const rec = this.rec;
    const stopped = this.stopped;
    this.rec = null;
    this.stopped = null;
    if (rec && rec.state !== 'inactive') rec.stop();
    const blob = stopped ? await stopped : null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    return blob && blob.size > 0 ? blob : null;
  }
}
