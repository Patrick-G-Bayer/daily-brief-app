import type { ReactElement } from 'react';
import type { SoundName } from './audio/sfx';

export type SceneId = 'farm' | 'jungle' | 'castle';
export type ItemKind = 'character' | 'prop';

/** Something placed on the stage. x/y are the item's centre as fractions (0..1) of the stage. */
export interface StageItem {
  uid: string;
  kind: ItemKind;
  type: string;
  x: number;
  y: number;
  z: number;
}

export interface Story {
  v: 1;
  scene: SceneId;
  items: StageItem[];
}

export type AnimName =
  | 'jump'
  | 'bounce'
  | 'spin'
  | 'twirl'
  | 'wiggle'
  | 'jelly'
  | 'float'
  | 'flip'
  | 'pulse'
  | 'shake'
  | 'drive'
  | 'blast'
  | 'popback';

/** A drawable thing: a character or a prop. */
export interface ArtDef {
  id: string;
  /** Spoken label for screen readers only. Never shown on screen. */
  label: string;
  /** SVG viewBox width/height. */
  w: number;
  h: number;
  /** Height on stage as a fraction of the stage height. */
  size: number;
  /** Whether a soft ground shadow is drawn under it. */
  shadow: boolean;
  anim: AnimName;
  sound: SoundName;
  art: () => ReactElement;
}
