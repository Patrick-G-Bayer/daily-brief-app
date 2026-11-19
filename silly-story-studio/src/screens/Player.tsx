import { useCallback, useEffect, useRef, useState } from 'react';
import { CloseIcon, PauseIcon, PlayIcon, RestartIcon } from '../components/Icons';
import { StageView } from '../components/StageView';
import { stageReducer } from '../state/stage';
import type { SavedShow, StageState } from '../types';

/**
 * Plays a saved show back like a movie: the recorded moves are replayed in time
 * with the recorded voices.
 */
export function Player({ show, muted, onExit }: { show: SavedShow; muted: boolean; onExit: () => void }) {
  const [state, setState] = useState<StageState>(show.start);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const cur = useRef<StageState>(show.start);
  const idx = useRef(0);
  const offset = useRef(0); // ms of show already played before the current run
  const runStart = useRef(0); // performance.now() when the current run started
  const raf = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!show.audio) return;
    const url = URL.createObjectURL(show.audio);
    const a = new Audio(url);
    a.preload = 'auto';
    audio.current = a;
    return () => {
      a.pause();
      audio.current = null;
      URL.revokeObjectURL(url);
    };
  }, [show]);

  useEffect(() => {
    if (audio.current) audio.current.muted = muted;
  }, [muted]);

  const applyUntil = useCallback(
    (t: number) => {
      let s = cur.current;
      const acts = show.actions;
      while (idx.current < acts.length && acts[idx.current][0] <= t) {
        s = stageReducer(s, acts[idx.current][1]);
        idx.current++;
      }
      if (s !== cur.current) {
        cur.current = s;
        setState(s);
      }
    },
    [show],
  );

  const stopLoop = () => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
  };

  const tick = useCallback(() => {
    const t = offset.current + (performance.now() - runStart.current);
    applyUntil(t);
    if (t >= show.duration) {
      offset.current = show.duration;
      applyUntil(Infinity);
      stopLoop();
      audio.current?.pause();
      setPlaying(false);
      setEnded(true);
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [applyUntil, show.duration]);

  const play = useCallback(() => {
    if (raf.current) return;
    runStart.current = performance.now();
    setPlaying(true);
    setEnded(false);
    const a = audio.current;
    if (a) {
      a.muted = muted;
      void a.play().catch(() => {});
    }
    raf.current = requestAnimationFrame(tick);
  }, [tick, muted]);

  const pause = () => {
    if (!raf.current) return;
    offset.current += performance.now() - runStart.current;
    stopLoop();
    audio.current?.pause();
    setPlaying(false);
  };

  const restart = useCallback(() => {
    stopLoop();
    audio.current?.pause();
    if (audio.current) audio.current.currentTime = 0;
    offset.current = 0;
    idx.current = 0;
    cur.current = show.start;
    setState(show.start);
    play();
  }, [play, show.start]);

  // Start playing as soon as the player opens.
  useEffect(() => {
    play();
    return stopLoop;
  }, []);

  // Pause if the tablet goes to sleep or the app is hidden.
  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && pause();
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  });

  return (
    <div className="player">
      <StageView state={state} backdrops={show.backdrops} className="player-stage" />
      {ended && (
        <button type="button" className="round-btn big-replay" aria-label="Watch again" onClick={restart}>
          <RestartIcon />
        </button>
      )}
      <div className="player-controls">
        <button type="button" className="round-btn close-btn" aria-label="Close" onClick={onExit}>
          <CloseIcon />
        </button>
        <button
          type="button"
          className="round-btn play-btn big"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => (playing ? pause() : ended ? restart() : play())}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className="round-btn restart-btn" aria-label="Start again" onClick={restart}>
          <RestartIcon />
        </button>
      </div>
    </div>
  );
}
