/**
 * One place to look up anything drawable: the built-in characters, props and
 * backdrops, plus photo puppets and photo backdrops made on this device.
 */
import type { ActorKind, ActorRef, ArtDef, PhotoRec, SceneDef } from '../types';
import { CHARACTERS } from './characters';
import { PROPS } from './props';
import { SCENES } from './scenes';

const actors = new Map<string, ArtDef>();
const scenes = new Map<string, SceneDef>();

export const actorUid = (kind: ActorKind, type: string) => `${kind}:${type}`;
export const photoSceneId = (photoId: string) => `photo:${photoId}`;

for (const c of CHARACTERS) actors.set(actorUid('character', c.id), c);
for (const p of PROPS) actors.set(actorUid('prop', p.id), p);
for (const s of SCENES) scenes.set(s.id, s);

/** Every built-in actor, in picker order. */
export const BUILTIN_ACTORS: ActorRef[] = [
  ...CHARACTERS.map((c) => ({ kind: 'character' as const, type: c.id })),
  ...PROPS.map((p) => ({ kind: 'prop' as const, type: p.id })),
];

export const BUILTIN_SCENES: string[] = SCENES.map((s) => s.id);

export function getActorDef(kind: ActorKind, type: string): ArtDef | undefined {
  return actors.get(actorUid(kind, type));
}

export function getSceneDef(id: string): SceneDef | undefined {
  return scenes.get(id);
}

/** Makes a photo usable as an actor or backdrop. Safe to call repeatedly. */
export function registerPhoto(p: PhotoRec): void {
  if (p.kind === 'actor') {
    const key = actorUid('photo', p.id);
    if (actors.has(key)) return;
    actors.set(key, {
      id: p.id,
      label: 'Photo puppet',
      w: p.w,
      h: p.h,
      size: 0.42,
      art: () => <image href={p.src} width={p.w} height={p.h} />,
    });
  } else {
    const key = photoSceneId(p.id);
    if (scenes.has(key)) return;
    scenes.set(key, {
      id: key,
      label: 'Photo backdrop',
      art: () => <image href={p.src} width={1600} height={900} preserveAspectRatio="xMidYMid slice" />,
    });
  }
}

export function unregisterPhoto(p: Pick<PhotoRec, 'id' | 'kind'>): void {
  if (p.kind === 'actor') actors.delete(actorUid('photo', p.id));
  else scenes.delete(photoSceneId(p.id));
}
