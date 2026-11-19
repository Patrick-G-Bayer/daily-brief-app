import { CHARACTER_MAP } from '../art/characters';
import { PROP_MAP } from '../art/props';
import type { SceneId, StageItem, Story } from '../types';

export const MAX_PROPS = 30;
const STORY_KEY = 'silly-story-studio:story:v1';
const SETTINGS_KEY = 'silly-story-studio:settings:v1';

/** Keep item centres inside the stage so nothing ever gets lost off-screen. */
export const clampX = (v: number) => Math.min(0.96, Math.max(0.04, v));
export const clampY = (v: number) => Math.min(0.95, Math.max(0.06, v));

export function newUid(kind: 'character' | 'prop', type: string): string {
  if (kind === 'character') return `c-${type}`;
  return `p-${type}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function defaultStory(): Story {
  return {
    v: 1,
    scene: 'farm',
    items: [
      { uid: 'c-dino', kind: 'character', type: 'dino', x: 0.3, y: 0.68, z: 1 },
      { uid: 'c-cat', kind: 'character', type: 'cat', x: 0.56, y: 0.7, z: 2 },
      { uid: newUid('prop', 'ball'), kind: 'prop', type: 'ball', x: 0.74, y: 0.8, z: 3 },
    ],
  };
}

const SCENE_IDS: SceneId[] = ['farm', 'jungle', 'castle'];

/** Validates anything read from storage, dropping whatever doesn't make sense. */
export function sanitizeStory(data: unknown): Story {
  const fallback = defaultStory();
  if (!data || typeof data !== 'object') return fallback;
  const d = data as Partial<Story>;
  const scene = SCENE_IDS.includes(d.scene as SceneId) ? (d.scene as SceneId) : fallback.scene;
  const items: StageItem[] = [];
  const seen = new Set<string>();
  if (Array.isArray(d.items)) {
    for (const raw of d.items) {
      if (!raw || typeof raw !== 'object') continue;
      const it = raw as Partial<StageItem>;
      const known = it.kind === 'character' ? CHARACTER_MAP[it.type ?? ''] : it.kind === 'prop' ? PROP_MAP[it.type ?? ''] : null;
      if (!known || typeof it.uid !== 'string' || seen.has(it.uid)) continue;
      if (typeof it.x !== 'number' || typeof it.y !== 'number' || !isFinite(it.x) || !isFinite(it.y)) continue;
      seen.add(it.uid);
      items.push({
        uid: it.uid,
        kind: it.kind!,
        type: it.type!,
        x: clampX(it.x),
        y: clampY(it.y),
        z: typeof it.z === 'number' && isFinite(it.z) ? it.z : 0,
      });
    }
  }
  // Re-number stacking order compactly (1..n), keeping the existing order.
  items
    .slice()
    .sort((a, b) => a.z - b.z)
    .forEach((it, i) => (it.z = i + 1));
  return { v: 1, scene, items };
}

export function loadStory(): Story {
  try {
    const raw = localStorage.getItem(STORY_KEY);
    if (!raw) return defaultStory();
    return sanitizeStory(JSON.parse(raw));
  } catch {
    return defaultStory();
  }
}

export function saveStory(story: Story): void {
  try {
    localStorage.setItem(STORY_KEY, JSON.stringify(story));
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

export type StoryAction =
  | { type: 'scene'; scene: SceneId }
  | { type: 'spawn'; item: Omit<StageItem, 'z'> }
  | { type: 'move'; moves: Map<string, { x: number; y: number }> }
  | { type: 'raise'; uid: string }
  | { type: 'remove'; uid: string }
  | { type: 'clear' };

const topZ = (items: StageItem[]) => items.reduce((m, i) => Math.max(m, i.z), 0);

export function storyReducer(state: Story, action: StoryAction): Story {
  switch (action.type) {
    case 'scene':
      return state.scene === action.scene ? state : { ...state, scene: action.scene };
    case 'spawn': {
      const { item } = action;
      if (state.items.some((i) => i.uid === item.uid)) return state;
      let items = [...state.items, { ...item, x: clampX(item.x), y: clampY(item.y), z: topZ(state.items) + 1 }];
      const props = items.filter((i) => i.kind === 'prop');
      if (props.length > MAX_PROPS) {
        const oldest = props[0].uid;
        items = items.filter((i) => i.uid !== oldest);
      }
      return { ...state, items };
    }
    case 'move': {
      let changed = false;
      const items = state.items.map((i) => {
        const m = action.moves.get(i.uid);
        if (!m) return i;
        const x = clampX(m.x);
        const y = clampY(m.y);
        if (x === i.x && y === i.y) return i;
        changed = true;
        return { ...i, x, y };
      });
      return changed ? { ...state, items } : state;
    }
    case 'raise': {
      const top = topZ(state.items);
      const it = state.items.find((i) => i.uid === action.uid);
      if (!it || (it.z === top && state.items.filter((i) => i.z === top).length === 1)) return state;
      return { ...state, items: state.items.map((i) => (i.uid === action.uid ? { ...i, z: top + 1 } : i)) };
    }
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.uid !== action.uid) };
    case 'clear':
      return { ...state, items: [] };
  }
}
