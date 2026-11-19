import { actorUid } from '../art/registry';
import type { Actor, ActorRef, CurrentShow, StageAction, StageState } from '../types';

const CURRENT_KEY = 'silly-story-studio:show:v2';
const SETTINGS_KEY = 'silly-story-studio:settings:v1';

export const MAX_ACTORS = 8;
export const MAX_BACKDROPS = 5;
export const MIN_SCALE = 0.35;
export const MAX_SCALE = 3;

/** While being dragged, actors may walk a little way past the edges (off stage). */
const looseX = (v: number) => Math.min(1.25, Math.max(-0.25, v));
const looseY = (v: number) => Math.min(1.35, Math.max(-0.25, v));
/** When placed on stage, keep the centre inside. */
export const clampX = (v: number) => Math.min(0.96, Math.max(0.04, v));
export const clampY = (v: number) => Math.min(0.95, Math.max(0.06, v));

export const isOffStage = (x: number, y: number) => x < 0 || x > 1 || y < 0 || y > 1;

const round = (v: number) => Math.round(v * 10000) / 10000;

export function newShow(cast: ActorRef[], backdrops: string[]): CurrentShow {
  return {
    v: 2,
    backdrops,
    scene: backdrops[0],
    items: cast.slice(0, MAX_ACTORS).map((a, i) => ({
      uid: actorUid(a.kind, a.type),
      kind: a.kind,
      type: a.type,
      on: false,
      x: 0.5,
      y: 1.2,
      z: i + 1,
      s: 1,
      r: 0,
      f: false,
    })),
  };
}

const topZ = (items: Actor[]) => items.reduce((m, i) => Math.max(m, i.z), 0);

export function stageReducer<S extends StageState>(state: S, a: StageAction): S {
  switch (a.type) {
    case 'scene':
      return state.scene === a.scene ? state : { ...state, scene: a.scene };
    case 'enter':
      return {
        ...state,
        items: state.items.map((i) =>
          i.uid === a.uid ? { ...i, on: true, x: looseX(a.x), y: looseY(a.y), z: topZ(state.items) + 1 } : i,
        ),
      };
    case 'exit':
      return { ...state, items: state.items.map((i) => (i.uid === a.uid ? { ...i, on: false } : i)) };
    case 'set': {
      const m = new Map(a.changes);
      let changed = false;
      const items = state.items.map((i) => {
        const c = m.get(i.uid);
        if (!c) return i;
        changed = true;
        return {
          ...i,
          x: c.x === undefined ? i.x : looseX(c.x),
          y: c.y === undefined ? i.y : looseY(c.y),
          s: c.s === undefined ? i.s : Math.min(MAX_SCALE, Math.max(MIN_SCALE, c.s)),
          r: c.r === undefined ? i.r : c.r,
        };
      });
      return changed ? { ...state, items } : state;
    }
    case 'flip':
      return { ...state, items: state.items.map((i) => (i.uid === a.uid ? { ...i, f: !i.f } : i)) };
    case 'raise': {
      const top = topZ(state.items);
      const it = state.items.find((i) => i.uid === a.uid);
      if (!it || it.z === top) return state;
      return { ...state, items: state.items.map((i) => (i.uid === a.uid ? { ...i, z: top + 1 } : i)) };
    }
  }
}

/** Rounds positions so recorded shows stay small. */
export function compactAction(a: StageAction): StageAction {
  if (a.type === 'set') {
    return {
      type: 'set',
      changes: a.changes.map(([uid, c]) => {
        const o: Record<string, number> = {};
        for (const k of ['x', 'y', 's', 'r'] as const) if (c[k] !== undefined) o[k] = round(c[k]!);
        return [uid, o];
      }),
    };
  }
  if (a.type === 'enter') return { ...a, x: round(a.x), y: round(a.y) };
  return a;
}

export const onStageCount = (s: StageState) => s.items.reduce((n, i) => n + (i.on ? 1 : 0), 0);

/* ------------------------------------------------------------------ */
/* Saving the show in progress                                         */
/* ------------------------------------------------------------------ */

const KINDS = ['character', 'prop', 'photo'];

export function sanitizeShow(data: unknown): CurrentShow | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Partial<CurrentShow>;
  if (d.v !== 2 || !Array.isArray(d.backdrops) || !Array.isArray(d.items)) return null;
  const backdrops = d.backdrops.filter((b): b is string => typeof b === 'string').slice(0, MAX_BACKDROPS);
  if (!backdrops.length) return null;
  const seen = new Set<string>();
  const items: Actor[] = [];
  for (const raw of d.items) {
    if (!raw || typeof raw !== 'object') continue;
    const it = raw as Partial<Actor>;
    if (!KINDS.includes(it.kind as string) || typeof it.type !== 'string') continue;
    const uid = actorUid(it.kind!, it.type);
    if (seen.has(uid)) continue;
    const num = (v: unknown, dflt: number) => (typeof v === 'number' && isFinite(v) ? v : dflt);
    seen.add(uid);
    items.push({
      uid,
      kind: it.kind!,
      type: it.type,
      on: it.on === true,
      x: num(it.x, 0.5),
      y: num(it.y, 0.7),
      z: num(it.z, items.length + 1),
      s: Math.min(MAX_SCALE, Math.max(MIN_SCALE, num(it.s, 1))),
      r: num(it.r, 0),
      f: it.f === true,
    });
    if (items.length >= MAX_ACTORS) break;
  }
  const scene = typeof d.scene === 'string' && backdrops.includes(d.scene) ? d.scene : backdrops[0];
  return { v: 2, backdrops, scene, items };
}

export function loadCurrentShow(): CurrentShow | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? sanitizeShow(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveCurrentShow(show: CurrentShow | null): void {
  try {
    if (show) localStorage.setItem(CURRENT_KEY, JSON.stringify(show));
    else localStorage.removeItem(CURRENT_KEY);
  } catch {
    // Storage full or blocked: the game keeps working, it just won't remember.
  }
}

export interface Settings {
  muted: boolean;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const s = raw ? (JSON.parse(raw) as Partial<Settings>) : {};
    return { muted: s.muted === true };
  } catch {
    return { muted: false };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}
