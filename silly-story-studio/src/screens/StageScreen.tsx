import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { getActorDef } from '../art/registry';
import { MAX_SHOW_MS, ShowRecorder, classifyMicError, queryMicPermission, type MicPermission, type MicSupport } from '../audio/recorder';
import { ArtSvg } from '../components/ArtSvg';
import { HoldButton } from '../components/HoldButton';
import { HomeIcon, LockIcon, PauseIcon, RecordIcon, StopIcon } from '../components/Icons';
import { MicCard, type MicCardKind } from '../components/MicCard';
import { Backdrop, StageView } from '../components/StageView';
import { compactAction, isOffStage, onStageCount, stageReducer } from '../state/stage';
import type { ActorChange, CurrentShow, PhotoRec, SavedShow, StageAction, StageState, TimedAction } from '../types';

/** How far (px) a finger must travel before a touch counts as a drag rather than a tap. */
const SLOP = 12;
const DOUBLE_TAP_MS = 380;

type RecUi = 'idle' | 'starting' | 'recording' | 'paused' | 'saving';

type Gesture =
  | { kind: 'drag'; uid: string; rect: DOMRect; offX: number; offY: number; sx: number; sy: number; moved: boolean; over: boolean }
  | { kind: 'pinch'; id: number }
  | { kind: 'wings'; uid: string; sx: number; sy: number }
  | { kind: 'none' };

interface Pinch {
  id: number;
  uid: string;
  a: number;
  b: number;
  rect: DOMRect;
  d0: number;
  ang0: number;
  mid0: [number, number];
  s0: number;
  r0: number;
  x0: number;
  y0: number;
}

interface Session {
  startPerf: number;
  pausedAt: number | null;
  pausedTotal: number;
  start: StageState;
  mirror: StageState;
  poster: StageState;
  posterCount: number;
  actions: TimedAction[];
  recorder: ShowRecorder | null;
}

const clone = (s: StageState): StageState => ({ scene: s.scene, items: s.items.map((i) => ({ ...i })) });

export function StageScreen({
  show,
  act,
  photos,
  micSupport,
  micPerm,
  setMicPerm,
  onHome,
  onGrownUps,
  onRecorded,
}: {
  show: CurrentShow;
  act: (a: StageAction) => void;
  photos: PhotoRec[];
  micSupport: MicSupport;
  micPerm: MicPermission;
  setMicPerm: (p: MicPermission) => void;
  onHome: () => void;
  onGrownUps: () => void;
  onRecorded: (s: SavedShow) => void;
}) {
  const [recUi, setRecUi] = useState<RecUi>('idle');
  const [card, setCard] = useState<MicCardKind | null>(null);
  const [overWings, setOverWings] = useState(false);
  const [dragging, setDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const wingsRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLButtonElement>(null);
  const showRef = useRef(show);
  showRef.current = show;
  const gestures = useRef(new Map<number, Gesture>());
  const pinches = useRef(new Map<number, Pinch>());
  const lastPos = useRef(new Map<number, [number, number]>());
  const pinchSeq = useRef(0);
  const pending = useRef(new Map<string, ActorChange>());
  const raf = useRef(0);
  const lastTap = useRef<{ uid: string; t: number } | null>(null);
  const session = useRef<Session | null>(null);
  const silentChosen = useRef(false);
  const stopTimer = useRef(0);

  /* --------------------------- performing --------------------------- */

  const clock = () => {
    const s = session.current;
    if (!s) return 0;
    return (s.pausedAt ?? performance.now()) - s.startPerf - s.pausedTotal;
  };

  /** Apply an action to the stage, and capture it if a show is being recorded. */
  const perform = useCallback((action: StageAction) => {
    // The same (rounded) action drives the live stage and the recording, so playback matches exactly.
    const c = compactAction(action);
    act(c);
    // Keep our own copy current right away (the screen re-renders a moment later).
    showRef.current = stageReducer(showRef.current, c);
    const s = session.current;
    if (!s) return;
    s.actions.push([Math.round(clock()), c]);
    s.mirror = stageReducer(s.mirror, c);
    const n = onStageCount(s.mirror);
    if (n > s.posterCount) {
      s.posterCount = n;
      s.poster = clone(s.mirror);
    }
  }, [act]);

  const flush = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (pending.current.size) {
      perform({ type: 'set', changes: [...pending.current.entries()] });
      pending.current.clear();
    }
  }, [perform]);

  const queue = useCallback(
    (uid: string, c: ActorChange) => {
      pending.current.set(uid, { ...pending.current.get(uid), ...c });
      if (!raf.current) raf.current = requestAnimationFrame(flush);
    },
    [flush],
  );

  const actor = (uid: string) => showRef.current.items.find((i) => i.uid === uid);

  const overWingsAt = (x: number, y: number) => {
    const r = wingsRef.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  /** A fairly empty spot on stage for an actor that's tapped on. */
  const freeSpot = () => {
    const on = showRef.current.items.filter((i) => i.on);
    let best = { x: 0.5, y: 0.66 };
    let bestScore = -1;
    for (let i = 0; i < 8; i++) {
      const x = 0.18 + Math.random() * 0.64;
      const y = 0.55 + Math.random() * 0.2;
      const score = on.reduce((m, it) => Math.min(m, Math.hypot(it.x - x, (it.y - y) * 0.6)), 1);
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
    return best;
  };

  const startDrag = (pointerId: number, uid: string, clientX: number, clientY: number, moved: boolean) => {
    const stage = stageRef.current;
    const a = actor(uid);
    if (!stage || !a) return;
    const rect = stage.getBoundingClientRect();
    gestures.current.set(pointerId, {
      kind: 'drag',
      uid,
      rect,
      offX: rect.left + a.x * rect.width - clientX,
      offY: rect.top + a.y * rect.height - clientY,
      sx: clientX,
      sy: clientY,
      moved,
      over: false,
    });
    if (moved) setDragging(true);
  };

  const startPinch = (uid: string, a: number, b: number) => {
    const stage = stageRef.current;
    const it = actor(uid);
    const pa = lastPos.current.get(a);
    const pb = lastPos.current.get(b);
    if (!stage || !it || !pa || !pb) return;
    flush();
    const id = ++pinchSeq.current;
    pinches.current.set(id, {
      id,
      uid,
      a,
      b,
      rect: stage.getBoundingClientRect(),
      d0: Math.max(10, Math.hypot(pb[0] - pa[0], pb[1] - pa[1])),
      ang0: Math.atan2(pb[1] - pa[1], pb[0] - pa[0]),
      mid0: [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2],
      s0: it.s,
      r0: it.r,
      x0: it.x,
      y0: it.y,
    });
    gestures.current.set(a, { kind: 'pinch', id });
    gestures.current.set(b, { kind: 'pinch', id });
    setDragging(false);
  };

  const onActorDown = useCallback((uid: string, e: RPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    lastPos.current.set(e.pointerId, [e.clientX, e.clientY]);
    // A second finger on an actor that's already held: resize / rotate it.
    for (const [pid, g] of gestures.current) {
      if (g.kind === 'drag' && g.uid === uid && pid !== e.pointerId) {
        startPinch(uid, pid, e.pointerId);
        return;
      }
    }
    if ([...pinches.current.values()].some((p) => p.uid === uid)) {
      gestures.current.set(e.pointerId, { kind: 'none' });
      return;
    }
    startDrag(e.pointerId, uid, e.clientX, e.clientY, false);
    perform({ type: 'raise', uid });
  }, [perform]);

  const onBgDown = useCallback((e: RPointerEvent<HTMLDivElement>) => {
    lastPos.current.set(e.pointerId, [e.clientX, e.clientY]);
    // One finger holding an actor + a finger anywhere on stage = resize / rotate (easier for big hands).
    const drags = [...gestures.current.entries()].filter(([, g]) => g.kind === 'drag');
    if (drags.length === 1) {
      const [pid, g] = drags[0];
      if (g.kind === 'drag') {
        startPinch(g.uid, pid, e.pointerId);
        return;
      }
    }
    gestures.current.set(e.pointerId, { kind: 'none' });
  }, []);

  const onWingsDown = (uid: string, e: RPointerEvent<HTMLButtonElement>) => {
    lastPos.current.set(e.pointerId, [e.clientX, e.clientY]);
    gestures.current.set(e.pointerId, { kind: 'wings', uid, sx: e.clientX, sy: e.clientY });
  };

  // Window-level pointer handling, so drags keep working wherever the finger goes.
  const handlers = useRef({ perform, queue, flush });
  handlers.current = { perform, queue, flush };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const g = gestures.current.get(e.pointerId);
      if (!g) return;
      lastPos.current.set(e.pointerId, [e.clientX, e.clientY]);
      const h = handlers.current;
      if (g.kind === 'drag') {
        if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > SLOP) {
          g.moved = true;
          setDragging(true);
        }
        if (!g.moved) return;
        h.queue(g.uid, {
          x: (e.clientX + g.offX - g.rect.left) / g.rect.width,
          y: (e.clientY + g.offY - g.rect.top) / g.rect.height,
        });
        const over = overWingsAt(e.clientX, e.clientY);
        if (over !== g.over) {
          g.over = over;
          setOverWings(over);
        }
      } else if (g.kind === 'pinch') {
        const p = pinches.current.get(g.id);
        const pa = p && lastPos.current.get(p.a);
        const pb = p && lastPos.current.get(p.b);
        if (!p || !pa || !pb) return;
        const d = Math.max(10, Math.hypot(pb[0] - pa[0], pb[1] - pa[1]));
        const ang = Math.atan2(pb[1] - pa[1], pb[0] - pa[0]);
        const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
        h.queue(p.uid, {
          s: p.s0 * (d / p.d0),
          r: p.r0 + ((ang - p.ang0) * 180) / Math.PI,
          x: p.x0 + (mid[0] - p.mid0[0]) / p.rect.width,
          y: p.y0 + (mid[1] - p.mid0[1]) / p.rect.height,
        });
      } else if (g.kind === 'wings') {
        if (Math.hypot(e.clientX - g.sx, e.clientY - g.sy) <= SLOP) return;
        // Pull the actor out of the wings: it appears under the finger and follows it.
        const stage = stageRef.current;
        const a = actor(g.uid);
        if (!stage || !a) return;
        const rect = stage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        if (a.on) {
          h.perform({ type: 'raise', uid: g.uid });
          h.queue(g.uid, { x, y });
        } else {
          h.perform({ type: 'enter', uid: g.uid, x, y });
        }
        gestures.current.set(e.pointerId, {
          kind: 'drag',
          uid: g.uid,
          rect,
          offX: 0,
          offY: 0,
          sx: g.sx,
          sy: g.sy,
          moved: true,
          over: true,
        });
        setDragging(true);
        setOverWings(true);
      }
    };

    const end = (e: PointerEvent, cancelled: boolean) => {
      const g = gestures.current.get(e.pointerId);
      const pos = lastPos.current.get(e.pointerId) ?? [e.clientX, e.clientY];
      gestures.current.delete(e.pointerId);
      lastPos.current.delete(e.pointerId);
      if (!g) return;
      const h = handlers.current;
      if (g.kind === 'drag') {
        const stillDragging = [...gestures.current.values()].some((x) => x.kind === 'drag' && x.moved);
        setDragging(stillDragging);
        if (!stillDragging) setOverWings(false);
        if (!g.moved) {
          if (cancelled) return;
          // Double tap flips the actor to face the other way.
          const now = performance.now();
          if (lastTap.current && lastTap.current.uid === g.uid && now - lastTap.current.t < DOUBLE_TAP_MS) {
            h.perform({ type: 'flip', uid: g.uid });
            lastTap.current = null;
          } else {
            lastTap.current = { uid: g.uid, t: now };
          }
          return;
        }
        h.flush();
        const x = (pos[0] + g.offX - g.rect.left) / g.rect.width;
        const y = (pos[1] + g.offY - g.rect.top) / g.rect.height;
        // Dropped on the wings, or walked off the edge of the stage: back to the wings.
        if (g.over || isOffStage(x, y)) h.perform({ type: 'exit', uid: g.uid });
      } else if (g.kind === 'pinch') {
        const p = pinches.current.get(g.id);
        if (!p) return;
        h.flush();
        pinches.current.delete(g.id);
        const other = p.a === e.pointerId ? p.b : p.a;
        const pos = lastPos.current.get(other);
        if (pos && gestures.current.has(other)) {
          // The remaining finger keeps dragging the actor.
          startDrag(other, p.uid, pos[0], pos[1], true);
        }
      } else if (g.kind === 'wings') {
        if (cancelled) return;
        const a = actor(g.uid);
        if (!a) return;
        if (a.on) h.perform({ type: 'raise', uid: g.uid });
        else {
          const spot = freeSpot();
          h.perform({ type: 'enter', uid: g.uid, x: spot.x, y: spot.y });
        }
      }
    };

    const up = (e: PointerEvent) => end(e, false);
    const cancel = (e: PointerEvent) => end(e, true);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  }, []);

  /* ---------------------------- recording ---------------------------- */

  const begin = async (withMic: boolean) => {
    setCard(null);
    setRecUi('starting');
    let recorder: ShowRecorder | null = null;
    if (withMic) {
      recorder = new ShowRecorder();
      try {
        await recorder.start((level) => levelRef.current?.style.setProperty('--level', level.toFixed(3)));
        setMicPerm('granted');
      } catch (err) {
        await recorder.stop().catch(() => null);
        setRecUi('idle');
        const kind = classifyMicError(err);
        if (kind === 'denied') {
          const q = await queryMicPermission();
          setMicPerm(q.state === 'prompt' ? 'prompt' : 'denied');
          setCard(q.state === 'prompt' ? 'ask' : 'denied');
        } else setCard(kind);
        return;
      }
    }
    flush();
    const now = clone(showRef.current);
    session.current = {
      startPerf: performance.now(),
      pausedAt: null,
      pausedTotal: 0,
      start: now,
      mirror: now,
      poster: clone(now),
      posterCount: onStageCount(now),
      actions: [],
      recorder,
    };
    setRecUi('recording');
    window.clearInterval(stopTimer.current);
    stopTimer.current = window.setInterval(() => {
      if (session.current && clock() >= MAX_SHOW_MS) void finish();
    }, 1000);
  };

  const onRecord = () => {
    if (recUi !== 'idle') return;
    if (silentChosen.current) return void begin(false);
    if (micSupport !== 'ok') return setCard(micSupport);
    if (micPerm === 'prompt' || micPerm === 'unknown') return setCard('ask');
    void begin(true);
  };

  const togglePause = () => {
    const s = session.current;
    if (!s) return;
    if (s.pausedAt === null) {
      flush();
      s.pausedAt = performance.now();
      s.recorder?.pause();
      setRecUi('paused');
    } else {
      s.pausedTotal += performance.now() - s.pausedAt;
      s.pausedAt = null;
      s.recorder?.resume();
      setRecUi('recording');
    }
  };

  const finish = async () => {
    const s = session.current;
    if (!s) return;
    flush();
    window.clearInterval(stopTimer.current);
    const duration = Math.round(clock());
    session.current = null;
    setRecUi('saving');
    levelRef.current?.style.setProperty('--level', '0');
    const audio = s.recorder ? await s.recorder.stop().catch(() => null) : null;
    // A quick record-then-stop with nothing happening isn't worth keeping.
    if (duration < 1200 && s.actions.length === 0) {
      setRecUi('idle');
      return;
    }
    const used = new Set([
      ...s.start.items.filter((i) => i.kind === 'photo').map((i) => i.type),
      ...showRef.current.backdrops.filter((b) => b.startsWith('photo:')).map((b) => b.slice(6)),
    ]);
    const saved: SavedShow = {
      id: `show-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
      duration: Math.max(duration, 500),
      backdrops: [...showRef.current.backdrops],
      start: s.start,
      poster: s.posterCount > 0 ? s.poster : clone(s.mirror),
      actions: s.actions,
      audio,
      photos: photos.filter((p) => used.has(p.id)),
    };
    setRecUi('idle');
    onRecorded(saved);
  };

  // Hidden (tablet sleeps, app switched): stop and keep what was recorded.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && session.current) void finish();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  });

  useEffect(
    () => () => {
      window.clearInterval(stopTimer.current);
      void session.current?.recorder?.stop();
    },
    [],
  );

  /* ----------------------------- render ------------------------------ */

  const live = recUi === 'recording' || recUi === 'paused' || recUi === 'saving';

  return (
    <div className={`app stage-screen rec-${recUi}`}>
      <aside className="rail left-rail">
        {!live ? (
          <button type="button" className="round-btn home-btn-small" aria-label="Home" onClick={onHome}>
            <HomeIcon />
          </button>
        ) : (
          <span className="rail-spacer" />
        )}
        <div className="scene-buttons">
          {show.backdrops.map((id) => (
            <button
              key={id}
              type="button"
              className={`scene-btn ${id === show.scene ? 'is-active' : ''}`}
              aria-label="Change backdrop"
              aria-pressed={id === show.scene}
              onClick={() => perform({ type: 'scene', scene: id })}
            >
              <Backdrop id={id} />
            </button>
          ))}
        </div>
        <HoldButton ms={2000} label="Grown-up corner (press and hold)" className="grownup-btn" onDone={onGrownUps}>
          <LockIcon />
        </HoldButton>
      </aside>

      <main className="stage-wrap">
        <StageView
          state={show}
          backdrops={show.backdrops}
          onActorDown={onActorDown}
          onBgDown={onBgDown}
          stageRef={stageRef}
          className={`live-stage ${live ? 'on-air' : ''} ${recUi === 'paused' ? 'is-paused' : ''}`}
        />
      </main>

      <aside className="rail right-rail">
        {recUi === 'idle' || recUi === 'starting' ? (
          <button
            type="button"
            className={`round-btn rec-btn ${recUi === 'starting' ? 'is-busy' : ''}`}
            aria-label="Record a show"
            onClick={onRecord}
          >
            <RecordIcon />
          </button>
        ) : (
          <>
            <button
              ref={levelRef}
              type="button"
              className="round-btn stop-btn"
              aria-label="Stop recording"
              disabled={recUi === 'saving'}
              onClick={() => void finish()}
            >
              <span className="mic-level" />
              <StopIcon />
            </button>
            <button
              type="button"
              className={`round-btn pause-btn ${recUi === 'paused' ? 'is-paused' : ''}`}
              aria-label={recUi === 'paused' ? 'Keep recording' : 'Pause recording'}
              disabled={recUi === 'saving'}
              onClick={togglePause}
            >
              {recUi === 'paused' ? <RecordIcon /> : <PauseIcon />}
            </button>
          </>
        )}
      </aside>

      <div ref={wingsRef} className={`wings ${dragging ? 'is-target' : ''} ${overWings ? 'is-over' : ''}`}>
        {show.items.map((a) => {
          const def = getActorDef(a.kind, a.type);
          if (!def) return null;
          return (
            <button
              key={a.uid}
              type="button"
              className={`wing-btn ${a.on ? 'is-on' : ''}`}
              aria-label={def.label}
              onPointerDown={(e) => onWingsDown(a.uid, e)}
            >
              <ArtSvg def={def} />
            </button>
          );
        })}
      </div>

      {card && (
        <MicCard
          kind={card}
          onSilent={() => {
            silentChosen.current = true;
            void begin(false);
          }}
          onConfirm={() => void begin(true)}
          onClose={() => setCard(null)}
        />
      )}
    </div>
  );
}
