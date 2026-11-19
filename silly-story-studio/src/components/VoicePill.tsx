import type { PointerEvent as RPointerEvent, Ref } from 'react';
import { CHARACTER_MAP } from '../art/characters';
import { ArtSvg } from './ArtSvg';
import { BearIcon, MicIcon, MouseIcon, PlayIcon, StopIcon } from './Icons';

export type RecState = 'idle' | 'starting' | 'recording' | 'saving';

export const SQUEAKY = 1.7;
export const DEEP = 0.62;

/**
 * Voice controls for the selected character: record, play, squeaky, deep.
 * Shown floating at the top of the stage.
 */
export function VoicePill({
  character,
  hasVoice,
  recState,
  micBlocked,
  levelRef,
  onMic,
  onPlay,
}: {
  character: string;
  hasVoice: boolean;
  recState: RecState;
  micBlocked: boolean;
  levelRef: Ref<HTMLSpanElement>;
  onMic: () => void;
  onPlay: (rate: number) => void;
}) {
  const def = CHARACTER_MAP[character];
  if (!def) return null;
  const recording = recState === 'recording';
  const busy = recState === 'starting' || recState === 'saving';
  const stop = (e: RPointerEvent) => e.stopPropagation();
  return (
    <div className="voice-pill" onPointerDown={stop}>
      <div className="pill-face" aria-hidden="true">
        <ArtSvg def={def} />
      </div>
      <button
        type="button"
        className={`round-btn mic-btn ${recording ? 'is-recording' : ''} ${busy ? 'is-busy' : ''} ${micBlocked ? 'is-blocked' : ''}`}
        aria-label={recording ? 'Stop recording' : `Record a voice for the ${def.label}`}
        onClick={onMic}
      >
        <span className="mic-level" ref={levelRef} />
        {recording ? <StopIcon /> : <MicIcon off={micBlocked} />}
      </button>
      {hasVoice && !recording && (
        <>
          <button type="button" className="round-btn play-btn" aria-label="Play voice" onClick={() => onPlay(1)}>
            <PlayIcon />
          </button>
          <button type="button" className="round-btn fx-btn" aria-label="Squeaky voice" onClick={() => onPlay(SQUEAKY)}>
            <MouseIcon />
          </button>
          <button type="button" className="round-btn fx-btn fx-deep" aria-label="Deep voice" onClick={() => onPlay(DEEP)}>
            <BearIcon />
          </button>
        </>
      )}
    </div>
  );
}
