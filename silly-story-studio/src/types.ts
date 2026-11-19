import type { ReactElement } from 'react';

export type ActorKind = 'character' | 'prop' | 'photo';

/** Something drawable that can be an actor. */
export interface ArtDef {
  id: string;
  /** Spoken label for screen readers only. Never shown on screen. */
  label: string;
  /** SVG viewBox width/height. */
  w: number;
  h: number;
  /** Default height on stage as a fraction of the stage height. */
  size: number;
  art: () => ReactElement;
}

export interface SceneDef {
  id: string;
  label: string;
  art: () => ReactElement;
}

/** One cast member. It's either on stage or waiting in the wings. */
export interface Actor {
  uid: string;
  kind: ActorKind;
  type: string;
  on: boolean;
  /** Centre position as a fraction of the stage (can go past 0..1 while walking off). */
  x: number;
  y: number;
  /** Stacking order. */
  z: number;
  /** Scale (pinch), rotation in degrees (twist) and horizontal flip (double tap). */
  s: number;
  r: number;
  f: boolean;
}

export interface StageState {
  scene: string;
  items: Actor[];
}

/** The show being worked on right now (auto-saved). */
export interface CurrentShow extends StageState {
  v: 2;
  backdrops: string[];
}

export type ActorChange = Partial<Pick<Actor, 'x' | 'y' | 's' | 'r'>>;

export type StageAction =
  | { type: 'scene'; scene: string }
  | { type: 'enter'; uid: string; x: number; y: number }
  | { type: 'exit'; uid: string }
  | { type: 'set'; changes: [string, ActorChange][] }
  | { type: 'flip'; uid: string }
  | { type: 'raise'; uid: string };

/** [milliseconds since the show started, action] */
export type TimedAction = [number, StageAction];

export interface PhotoRec {
  id: string;
  kind: 'actor' | 'backdrop';
  /** Image data URL. */
  src: string;
  w: number;
  h: number;
  createdAt: number;
}

export interface SavedShow {
  id: string;
  createdAt: number;
  /** Length in milliseconds. */
  duration: number;
  backdrops: string[];
  start: StageState;
  /** A representative frame for the gallery thumbnail. */
  poster: StageState;
  actions: TimedAction[];
  audio: Blob | null;
  /** Photos used by this show, embedded so it still plays if they're deleted later. */
  photos: PhotoRec[];
}

export type ActorRef = Pick<Actor, 'kind' | 'type'>;
