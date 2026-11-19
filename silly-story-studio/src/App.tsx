import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as RPointerEvent,
} from 'react';
import { CHARACTER_MAP } from './art/characters';
import { PROP_MAP } from './art/props';
import { SCENES, SCENE_MAP } from './art/scenes';
import { runAnim, runTalk } from './anim';
import { play, sceneJingle, setMuted, twinkle, unlockAudio } from './audio/sfx';
import {
  MAX_RECORD_MS,
  VoiceRecorder,
  classifyMicError,
  decodeVoice,
  deleteVoice,
  listVoiceIds,
  micSupport as detectMicSupport,
  playVoice,
  queryMicPermission,
  requestMicAccess,
  saveVoice,
  type MicPermission,
} from './audio/voices';
import { GrownUpPanel } from './components/GrownUpPanel';
import { HoldButton } from './components/HoldButton';
import { LockIcon, RotateIcon } from './components/Icons';
import { MicCard, type MicCardKind } from './components/MicCard';
import { CastRail, PropStrip, SceneButtons } from './components/Rails';
import { StageItemView } from './components/StageItemView';
import { VoicePill, type RecState } from './components/VoicePill';
import { loadSettings, loadStory, newUid, saveSettings, saveStory, storyReducer } from './state/story';
import type { ItemKind, SceneId, StageItem } from './types';

/** How far (px) a finger must travel before a touch counts as a drag rather than a tap. */
const SLOP = 14;
const SPARKLE_COLORS = ['#ffd43b', '#ff7eb6', '#7fd3ff', '#7ee081', '#b48cff', '#ff9f1c'];

type Drag =
  | { kind: 'item'; uid: string; rect: DOMRect; offX: number; offY: number; sx: number; sy: number; moved: boolean; over: boolean }
  | {
      kind: 'tray';
      itemKind: ItemKind;
      type: string;
      el: HTMLElement;
      axis: 'x' | 'y';
      sx: number;
      sy: number;
      mode: 'pending' | 'scroll';
      startScroll: number;
      lastPos: number;
      lastT: number;
      vel: number;
    }
  | { kind: 'paint'; lastX: number; lastY: number; acc: number; count: number };

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  dx: number;
  dy: number;
}

let sparkleId = 0;

const itemDef = (it: StageItem) => (it.kind === 'character' ? CHARACTER_MAP[it.type] : PROP_MAP[it.type]);

/** A stable per-item offset so characters breathe and blink out of sync. */
const idleOffset = (uid: string) => {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  return (h % 260) / 100;
};

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export default function App() {
  const [story, dispatch] = useReducer(storyReducer, undefined, loadStory);
  const [selected, setSelected] = useState<string | null>(null);
  const [lifted, setLifted] = useState<Record<string, boolean>>({});
  const [overTray, setOverTray] = useState<Record<string, boolean>>({});
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [talking, setTalking] = useState<string | null>(null);
  const [voices, setVoices] = useState<Set<string>>(() => new Set());
  const [rec, setRec] = useState<{ state: RecState; who: string | null }>({ state: 'idle', who: null });
  const [micPerm, setMicPerm] = useState<MicPermission>('unknown');
  const [card, setCard] = useState<MicCardKind | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [muted, setMutedState] = useState(() => loadSettings().muted);
  const [installEvt, setInstallEvt] = useState<InstallPromptEvent | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotateDismissed, setRotateDismissed] = useState(false);
  const micSupport = useMemo(detectMicSupport, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const castRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLSpanElement>(null);
  const itemEls = useRef(new Map<string, HTMLDivElement>());
  const pointers = useRef(new Map<number, Drag>());
  const pendingMoves = useRef(new Map<string, { x: number; y: number }>());
  const moveRaf = useRef(0);
  const recorder = useRef<VoiceRecorder | null>(null);
  const recWho = useRef<string | null>(null);
  const autoStop = useRef(0);
  const talkTimer = useRef(0);
  const talkAnim = useRef<Animation | null>(null);
  const storyRef = useRef(story);
  storyRef.current = story;
  const voicesRef = useRef(voices);
  voicesRef.current = voices;

  /* ---------------------------- persistence ---------------------------- */

  useEffect(() => {
    const t = window.setTimeout(() => saveStory(story), 250);
    return () => window.clearTimeout(t);
  }, [story]);

  useEffect(() => {
    setMuted(muted);
    saveSettings({ muted });
  }, [muted]);

  useEffect(() => {
    void listVoiceIds().then((ids) => setVoices(new Set(ids.filter((id) => CHARACTER_MAP[id]))));
  }, []);

  /* ----------------------- browser integration ------------------------ */

  useEffect(() => {
    let status: PermissionStatus | undefined;
    void queryMicPermission().then((r) => {
      setMicPerm(r.state);
      status = r.status;
      if (status) status.onchange = () => setMicPerm(status!.state as MicPermission);
    });
    const onInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as InstallPromptEvent);
    };
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    const noMenu = (e: Event) => e.preventDefault();
    window.addEventListener('pointerdown', unlockAudio, true);
    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('contextmenu', noMenu);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      if (status) status.onchange = null;
      window.removeEventListener('pointerdown', unlockAudio, true);
      window.removeEventListener('beforeinstallprompt', onInstall);
      window.removeEventListener('contextmenu', noMenu);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, []);

  /* ---------------------------- helpers ---------------------------- */

  const register = useCallback((uid: string, el: HTMLDivElement | null) => {
    if (el) itemEls.current.set(uid, el);
    else itemEls.current.delete(uid);
  }, []);

  const animLayer = (uid: string) => itemEls.current.get(uid)?.querySelector('.item-anim');

  const addSparkles = useCallback((x: number, y: number, n = 1, spread = 0) => {
    const fresh: Sparkle[] = Array.from({ length: n }, () => {
      const a = Math.random() * Math.PI * 2;
      const d = spread * (0.5 + Math.random() * 0.5);
      return {
        id: ++sparkleId,
        x,
        y,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
        size: 22 + Math.random() * 22,
        dx: Math.cos(a) * d,
        dy: Math.sin(a) * d,
      };
    });
    setSparkles((s) => [...s.slice(-48 + n), ...fresh]);
  }, []);

  const flushMoves = useCallback(() => {
    cancelAnimationFrame(moveRaf.current);
    moveRaf.current = 0;
    if (pendingMoves.current.size) {
      dispatch({ type: 'move', moves: new Map(pendingMoves.current) });
      pendingMoves.current.clear();
    }
  }, []);

  const queueMove = useCallback(
    (uid: string, x: number, y: number) => {
      pendingMoves.current.set(uid, { x, y });
      if (!moveRaf.current) moveRaf.current = requestAnimationFrame(flushMoves);
    },
    [flushMoves],
  );

  const isOverTray = (x: number, y: number) =>
    [castRef.current, propsRef.current].some((el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });

  /** Picks a fairly empty spot on the stage for something new. */
  const freeSpot = (kind: ItemKind) => {
    const items = storyRef.current.items;
    let best = { x: 0.5, y: 0.7 };
    let bestScore = -1;
    for (let i = 0; i < 8; i++) {
      const x = 0.15 + Math.random() * 0.7;
      const y = kind === 'character' ? 0.6 + Math.random() * 0.18 : 0.45 + Math.random() * 0.4;
      const score = items.reduce((m, it) => Math.min(m, Math.hypot(it.x - x, (it.y - y) * 0.6)), 1);
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
    return best;
  };

  /* ----------------------------- voices ------------------------------ */

  const speak = useCallback(async (type: string, rate: number) => {
    const secs = await playVoice(type, rate);
    if (!secs) return false;
    talkAnim.current?.cancel();
    talkAnim.current = runTalk(itemEls.current.get(`c-${type}`)?.querySelector('.item-idle'), secs);
    setTalking(type);
    window.clearTimeout(talkTimer.current);
    talkTimer.current = window.setTimeout(() => setTalking(null), secs * 1000 + 100);
    return true;
  }, []);

  const stopRecording = useCallback(async () => {
    window.clearTimeout(autoStop.current);
    const r = recorder.current;
    const who = recWho.current;
    recorder.current = null;
    if (!r || !who) return;
    levelRef.current?.style.setProperty('--level', '0');
    setRec({ state: 'saving', who });
    try {
      const blob = await r.stop();
      const buf = blob && blob.size > 0 ? await decodeVoice(blob) : null;
      if (!blob || !buf) {
        // Nothing heard: keep any earlier voice, just a gentle "uh-oh".
        play('uhOh');
        runAnim(animLayer(`c-${who}`), 'nudge');
        setRec({ state: 'idle', who: null });
        return;
      }
      await saveVoice(who, blob, buf);
      setVoices((v) => new Set(v).add(who));
      setRec({ state: 'idle', who: null });
      void speak(who, 1);
    } catch {
      play('uhOh');
      setRec({ state: 'idle', who: null });
    }
  }, [speak]);

  const startRecording = useCallback(
    async (who: string) => {
      const r = new VoiceRecorder();
      recorder.current = r;
      recWho.current = who;
      setRec({ state: 'starting', who });
      try {
        await r.start((level) => levelRef.current?.style.setProperty('--level', level.toFixed(3)));
        if (recorder.current !== r) {
          // Cancelled while the mic was starting.
          await r.stop();
          return;
        }
        setMicPerm('granted');
        setRec({ state: 'recording', who });
        autoStop.current = window.setTimeout(() => void stopRecording(), MAX_RECORD_MS);
      } catch (err) {
        recorder.current = null;
        await r.stop().catch(() => null);
        setRec({ state: 'idle', who: null });
        const kind = classifyMicError(err);
        if (kind === 'denied') {
          const q = await queryMicPermission();
          if (q.state === 'prompt') setCard('ask');
          else {
            setMicPerm('denied');
            setCard('denied');
          }
        } else setCard(kind);
      }
    },
    [stopRecording],
  );

  const onMic = useCallback(() => {
    if (rec.state === 'recording') {
      void stopRecording();
      return;
    }
    if (rec.state !== 'idle' || !selected) return;
    if (micSupport !== 'ok') return setCard(micSupport);
    // Not asked yet: a grown-up confirms first (press-and-hold) before the browser prompt appears.
    if (micPerm === 'prompt' || micPerm === 'unknown') return setCard('ask');
    // Granted, or reported as blocked: just try. A truly blocked mic fails instantly
    // (no browser prompt) and the "blocked" help card is shown instead.
    void startRecording(selected);
  }, [rec.state, selected, micSupport, micPerm, startRecording, stopRecording]);

  const grantMic = useCallback(async () => {
    try {
      await requestMicAccess();
      setMicPerm('granted');
      setCard(null);
      play('tada');
    } catch (err) {
      const kind = classifyMicError(err);
      if (kind === 'denied') {
        const q = await queryMicPermission();
        if (q.state === 'prompt') {
          setCard('ask'); // prompt was dismissed; nothing is blocked yet
        } else {
          setMicPerm('denied');
          setCard('denied');
        }
      } else setCard(kind);
    }
  }, []);

  // Stop recording and save the story when the app is hidden (tablet sleeps, app switch).
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') {
        saveStory(storyRef.current);
        if (recorder.current) void stopRecording();
      }
    };
    const onPageHide = () => saveStory(storyRef.current);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [stopRecording]);

  /* --------------------------- tap actions --------------------------- */

  const tapItem = useCallback(
    (uid: string) => {
      const it = storyRef.current.items.find((i) => i.uid === uid);
      if (!it) return;
      const def = itemDef(it);
      runAnim(animLayer(uid), def.anim);
      if (it.kind === 'character') {
        setSelected(it.type);
        if (voicesRef.current.has(it.type)) {
          void speak(it.type, 1).then((ok) => !ok && play(def.sound));
        } else play(def.sound);
      } else {
        play(def.sound);
      }
    },
    [speak],
  );

  const spawn = useCallback(
    (kind: ItemKind, type: string, x: number, y: number) => {
      const uid = newUid(kind, type);
      dispatch({ type: 'spawn', item: { uid, kind, type, x, y } });
      if (kind === 'character') setSelected(type);
      return uid;
    },
    [],
  );

  const tapTray = useCallback(
    (kind: ItemKind, type: string) => {
      if (kind === 'character') {
        const existing = storyRef.current.items.find((i) => i.kind === 'character' && i.type === type);
        if (existing) {
          dispatch({ type: 'raise', uid: existing.uid });
          tapItem(existing.uid);
          return;
        }
      }
      const spot = freeSpot(kind);
      spawn(kind, type, spot.x, spot.y);
      play('spawn');
    },
    [spawn, tapItem],
  );

  const putAway = useCallback(
    (uid: string, cx: number, cy: number) => {
      const it = storyRef.current.items.find((i) => i.uid === uid);
      dispatch({ type: 'remove', uid });
      play('putAway');
      addSparkles(cx, cy, 6, 60);
      if (it?.kind === 'character') {
        setSelected((s) => (s === it.type ? null : s));
        if (recWho.current === it.type && recorder.current) void stopRecording();
      }
    },
    [addSparkles, stopRecording],
  );

  const changeScene = useCallback(
    (id: SceneId) => {
      if (id === storyRef.current.scene) {
        twinkle(5);
        return;
      }
      dispatch({ type: 'scene', scene: id });
      sceneJingle(SCENE_MAP[id].tone);
      storyRef.current.items
        .slice()
        .sort((a, b) => a.x - b.x)
        .forEach((it, i) => runAnim(animLayer(it.uid), 'hop', 120 + i * 45));
    },
    [],
  );

  /* ------------------------ pointer handling ------------------------- */

  const onItemDown = useCallback((uid: string, e: RPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const stage = stageRef.current;
    const it = storyRef.current.items.find((i) => i.uid === uid);
    if (!stage || !it) return;
    const rect = stage.getBoundingClientRect();
    pointers.current.set(e.pointerId, {
      kind: 'item',
      uid,
      rect,
      offX: rect.left + it.x * rect.width - e.clientX,
      offY: rect.top + it.y * rect.height - e.clientY,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
      over: false,
    });
    dispatch({ type: 'raise', uid });
    if (it.kind === 'character') setSelected(it.type);
  }, []);

  const onTrayDown = useCallback((itemKind: ItemKind, type: string, e: RPointerEvent<HTMLElement>) => {
    const el = (itemKind === 'character' ? castRef.current : propsRef.current) as HTMLElement;
    const axis = itemKind === 'character' ? 'y' : 'x';
    pointers.current.set(e.pointerId, {
      kind: 'tray',
      itemKind,
      type,
      el,
      axis,
      sx: e.clientX,
      sy: e.clientY,
      mode: 'pending',
      startScroll: axis === 'x' ? el.scrollLeft : el.scrollTop,
      lastPos: axis === 'x' ? e.clientX : e.clientY,
      lastT: performance.now(),
      vel: 0,
    });
  }, []);

  const onStageBgDown = useCallback(
    (e: RPointerEvent<HTMLDivElement>) => {
      pointers.current.set(e.pointerId, { kind: 'paint', lastX: e.clientX, lastY: e.clientY, acc: 0, count: 0 });
      addSparkles(e.clientX, e.clientY, 3, 30);
      const r = stageRef.current?.getBoundingClientRect();
      twinkle(r ? (1 - (e.clientY - r.top) / r.height) * 8 : 4);
      if (!recorder.current) setSelected(null);
    },
    [addSparkles],
  );

  // Latest handlers for the window-level listeners.
  const handlers = useRef({ tapItem, tapTray, spawn, putAway, queueMove, flushMoves, addSparkles });
  handlers.current = { tapItem, tapTray, spawn, putAway, queueMove, flushMoves, addSparkles };

  useEffect(() => {
    const setFlag = (setter: typeof setLifted, uid: string, on: boolean) =>
      setter((m) => {
        if (!!m[uid] === on) return m;
        const next = { ...m };
        if (on) next[uid] = true;
        else delete next[uid];
        return next;
      });

    const glide = (el: HTMLElement, axis: 'x' | 'y', v0: number) => {
      let v = v0;
      let last = performance.now();
      const step = (now: number) => {
        const dt = now - last;
        last = now;
        if (axis === 'x') el.scrollLeft -= v * dt;
        else el.scrollTop -= v * dt;
        v *= Math.pow(0.94, dt / 16);
        if (Math.abs(v) > 0.02) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const move = (e: PointerEvent) => {
      const d = pointers.current.get(e.pointerId);
      if (!d) return;
      const h = handlers.current;
      if (d.kind === 'item') {
        if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > SLOP) {
          d.moved = true;
          setFlag(setLifted, d.uid, true);
          play('pickup');
        }
        if (d.moved) {
          h.queueMove(d.uid, (e.clientX + d.offX - d.rect.left) / d.rect.width, (e.clientY + d.offY - d.rect.top) / d.rect.height);
          const over = isOverTray(e.clientX, e.clientY);
          if (over !== d.over) {
            d.over = over;
            setFlag(setOverTray, d.uid, over);
          }
        }
      } else if (d.kind === 'tray') {
        const dx = e.clientX - d.sx;
        const dy = e.clientY - d.sy;
        const pos = d.axis === 'x' ? e.clientX : e.clientY;
        if (d.mode === 'pending' && Math.hypot(dx, dy) > SLOP) {
          const along = Math.abs(d.axis === 'x' ? dx : dy);
          const across = Math.abs(d.axis === 'x' ? dy : dx);
          const canScroll =
            d.axis === 'x' ? d.el.scrollWidth > d.el.clientWidth + 2 : d.el.scrollHeight > d.el.clientHeight + 2;
          if (canScroll && along > across) {
            d.mode = 'scroll';
          } else {
            // Pull it out of the tray: it appears under the finger and follows it.
            const stage = stageRef.current;
            if (!stage) return;
            const rect = stage.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            let uid: string;
            const existing =
              d.itemKind === 'character'
                ? storyRef.current.items.find((i) => i.kind === 'character' && i.type === d.type)
                : undefined;
            if (existing) {
              uid = existing.uid;
              dispatch({ type: 'raise', uid });
              h.queueMove(uid, x, y);
              setSelected(d.type);
            } else {
              uid = h.spawn(d.itemKind, d.type, x, y);
            }
            play('spawn');
            const over = isOverTray(e.clientX, e.clientY);
            pointers.current.set(e.pointerId, {
              kind: 'item',
              uid,
              rect,
              offX: 0,
              offY: 0,
              sx: d.sx,
              sy: d.sy,
              moved: true,
              over,
            });
            setFlag(setLifted, uid, true);
            setFlag(setOverTray, uid, over);
            return;
          }
        }
        if (d.mode === 'scroll') {
          const now = performance.now();
          const delta = pos - d.lastPos;
          const dt = Math.max(1, now - d.lastT);
          d.vel = d.vel * 0.6 + (delta / dt) * 0.4;
          d.lastPos = pos;
          d.lastT = now;
          if (d.axis === 'x') d.el.scrollLeft = d.startScroll - dx;
          else d.el.scrollTop = d.startScroll - dy;
        }
      } else if (d.kind === 'paint') {
        const dist = Math.hypot(e.clientX - d.lastX, e.clientY - d.lastY);
        d.acc += dist;
        d.lastX = e.clientX;
        d.lastY = e.clientY;
        if (d.acc > 34) {
          d.acc = 0;
          d.count++;
          h.addSparkles(e.clientX, e.clientY, 1, 0);
          if (d.count % 3 === 0) {
            const r = stageRef.current?.getBoundingClientRect();
            twinkle(r ? (1 - (e.clientY - r.top) / r.height) * 8 : 4);
          }
        }
      }
    };

    const end = (e: PointerEvent, cancelled: boolean) => {
      const d = pointers.current.get(e.pointerId);
      if (!d) return;
      pointers.current.delete(e.pointerId);
      const h = handlers.current;
      if (d.kind === 'item') {
        if (!d.moved) {
          if (!cancelled) h.tapItem(d.uid);
          return;
        }
        h.flushMoves();
        setFlag(setLifted, d.uid, false);
        setFlag(setOverTray, d.uid, false);
        if (d.over && !cancelled) {
          h.putAway(d.uid, e.clientX, e.clientY);
        } else {
          runAnim(itemEls.current.get(d.uid)?.querySelector('.item-anim'), 'drop');
          play('drop');
        }
      } else if (d.kind === 'tray') {
        if (d.mode === 'pending' && !cancelled) h.tapTray(d.itemKind, d.type);
        else if (d.mode === 'scroll' && Math.abs(d.vel) > 0.1) glide(d.el, d.axis, d.vel);
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

  /* --------------------------- grown-ups ---------------------------- */

  const clearStage = () => {
    if (recorder.current) void stopRecording();
    dispatch({ type: 'clear' });
    setSelected(null);
    setPanelOpen(false);
    play('putAway');
  };

  const removeVoice = async (id: string) => {
    await deleteVoice(id);
    setVoices((v) => {
      const n = new Set(v);
      n.delete(id);
      return n;
    });
  };

  const removeAllVoices = async () => {
    await Promise.all([...voicesRef.current].map((id) => deleteVoice(id)));
    setVoices(new Set());
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
        await o.lock?.('landscape').catch(() => {});
      }
    } catch {
      // Not allowed here; nothing else to do.
    }
  };

  const install = async () => {
    if (!installEvt) return;
    await installEvt.prompt().catch(() => {});
    setInstallEvt(null);
  };

  /* ----------------------------- render ------------------------------ */

  const onStage = useMemo(
    () => new Set(story.items.filter((i) => i.kind === 'character').map((i) => i.type)),
    [story.items],
  );
  const anyLifted = Object.keys(lifted).length > 0;
  const anyOver = Object.keys(overTray).length > 0;
  const trayGlow = anyOver ? 2 : anyLifted ? 1 : 0;
  const pillFor = rec.state !== 'idle' && rec.who ? rec.who : selected && onStage.has(selected) ? selected : null;
  const micBlocked = micSupport !== 'ok' || micPerm === 'denied';

  return (
    <div className="app">
      <aside className="rail left-rail">
        <SceneButtons scene={story.scene} onPick={changeScene} />
        <HoldButton ms={2000} label="Grown-up corner (press and hold)" className="grownup-btn" onDone={() => setPanelOpen(true)}>
          <LockIcon />
        </HoldButton>
      </aside>

      <main className="stage" ref={stageRef}>
        <div className="stage-bg" onPointerDown={onStageBgDown}>
          {SCENES.map((s) => {
            const Art = s.art;
            return (
              <svg
                key={s.id}
                className={`backdrop ${s.id === story.scene ? 'is-active' : ''}`}
                viewBox="0 0 1600 900"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <Art />
              </svg>
            );
          })}
        </div>
        <div className="stage-items">
          {story.items.map((it) => (
            <StageItemView
              key={it.uid}
              item={it}
              def={itemDef(it)}
              selected={it.kind === 'character' && it.type === pillFor}
              lifted={!!lifted[it.uid]}
              over={!!overTray[it.uid]}
              talking={it.kind === 'character' && talking === it.type}
              recording={it.kind === 'character' && rec.state === 'recording' && rec.who === it.type}
              idleDelay={idleOffset(it.uid)}
              onDown={onItemDown}
              register={register}
            />
          ))}
        </div>
        {pillFor && (
          <VoicePill
            character={pillFor}
            hasVoice={voices.has(pillFor)}
            recState={rec.state}
            micBlocked={micBlocked}
            levelRef={levelRef}
            onMic={onMic}
            onPlay={(rate) => {
              runAnim(animLayer(`c-${pillFor}`), 'hop');
              void speak(pillFor, rate);
            }}
          />
        )}
      </main>

      <CastRail ref={castRef} onStage={onStage} glow={trayGlow} hint={story.items.length === 0} onDown={onTrayDown} />
      <PropStrip ref={propsRef} glow={trayGlow} onDown={onTrayDown} />

      <div className="sparkle-layer" aria-hidden="true">
        {sparkles.map((s) => (
          <span
            key={s.id}
            className="sparkle"
            style={
              {
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
                color: s.color,
                '--dx': `${s.dx}px`,
                '--dy': `${s.dy}px`,
              } as CSSProperties
            }
            onAnimationEnd={() => setSparkles((all) => all.filter((x) => x.id !== s.id))}
          >
            <svg viewBox="0 0 40 40">
              <path d="M20 0 Q23 17 40 20 Q23 23 20 40 Q17 23 0 20 Q17 17 20 0 Z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>

      {card && <MicCard kind={card} onClose={() => setCard(null)} onConfirm={() => void grantMic()} />}

      {panelOpen && (
        <GrownUpPanel
          voices={voices}
          muted={muted}
          micSupport={micSupport}
          micPermission={micPerm}
          canInstall={!!installEvt}
          isFullscreen={isFullscreen}
          onClose={() => setPanelOpen(false)}
          onPlayVoice={(id) => void playVoice(id, 1)}
          onDeleteVoice={(id) => void removeVoice(id)}
          onDeleteAllVoices={() => void removeAllVoices()}
          onClearStage={clearStage}
          onToggleMute={() => setMutedState((m) => !m)}
          onFullscreen={() => void toggleFullscreen()}
          onInstall={() => void install()}
        />
      )}

      {!rotateDismissed && (
        <div className="rotate-hint" onPointerDown={() => setRotateDismissed(true)} aria-label="Turn the tablet sideways">
          <RotateIcon />
        </div>
      )}
    </div>
  );
}
