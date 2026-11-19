import type { AnimName } from './types';

interface AnimSpec {
  frames: Keyframe[];
  duration: number;
  origin?: string;
  easing?: string;
}

const BOTTOM = '50% 100%';
const CENTER = '50% 50%';

const SPECS: Record<AnimName | 'drop' | 'hop' | 'nudge', AnimSpec> = {
  jump: {
    duration: 650,
    origin: BOTTOM,
    frames: [
      { transform: 'translateY(0) scale(1, 1)' },
      { transform: 'translateY(0) scale(1.15, 0.85)', offset: 0.15 },
      { transform: 'translateY(-45%) scale(0.92, 1.1)', offset: 0.45 },
      { transform: 'translateY(0) scale(1.12, 0.88)', offset: 0.8 },
      { transform: 'translateY(0) scale(1, 1)' },
    ],
  },
  bounce: {
    duration: 1000,
    origin: BOTTOM,
    frames: [
      { transform: 'translateY(0) scale(1, 1)' },
      { transform: 'translateY(-40%) scale(0.95, 1.08)', offset: 0.2 },
      { transform: 'translateY(0) scale(1.15, 0.85)', offset: 0.4 },
      { transform: 'translateY(-20%) scale(0.97, 1.04)', offset: 0.6 },
      { transform: 'translateY(0) scale(1.08, 0.92)', offset: 0.8 },
      { transform: 'translateY(0) scale(1, 1)' },
    ],
  },
  spin: {
    duration: 750,
    origin: CENTER,
    easing: 'cubic-bezier(.5,0,.3,1.4)',
    frames: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
  },
  twirl: {
    duration: 900,
    origin: CENTER,
    frames: [
      { transform: 'translateY(0) rotateY(0deg)' },
      { transform: 'translateY(-18%) rotateY(180deg)', offset: 0.5 },
      { transform: 'translateY(0) rotateY(360deg)' },
    ],
  },
  wiggle: {
    duration: 700,
    origin: BOTTOM,
    frames: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-14deg)', offset: 0.15 },
      { transform: 'rotate(12deg)', offset: 0.35 },
      { transform: 'rotate(-10deg)', offset: 0.55 },
      { transform: 'rotate(7deg)', offset: 0.75 },
      { transform: 'rotate(0deg)' },
    ],
  },
  jelly: {
    duration: 800,
    origin: BOTTOM,
    frames: [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.25, 0.75)', offset: 0.2 },
      { transform: 'scale(0.8, 1.2)', offset: 0.4 },
      { transform: 'scale(1.12, 0.9)', offset: 0.6 },
      { transform: 'scale(0.95, 1.05)', offset: 0.8 },
      { transform: 'scale(1, 1)' },
    ],
  },
  float: {
    duration: 1300,
    origin: CENTER,
    easing: 'ease-in-out',
    frames: [
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-35%) rotate(-8deg)', offset: 0.4 },
      { transform: 'translateY(-30%) rotate(8deg)', offset: 0.6 },
      { transform: 'translateY(0) rotate(0deg)' },
    ],
  },
  flip: {
    duration: 900,
    origin: CENTER,
    frames: [
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-60%) rotate(180deg)', offset: 0.5 },
      { transform: 'translateY(0) rotate(360deg)' },
    ],
  },
  pulse: {
    duration: 700,
    origin: CENTER,
    frames: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.35)', offset: 0.3 },
      { transform: 'scale(0.9)', offset: 0.6 },
      { transform: 'scale(1.08)', offset: 0.8 },
      { transform: 'scale(1)' },
    ],
  },
  shake: {
    duration: 600,
    origin: BOTTOM,
    frames: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-6deg)', offset: 0.1 },
      { transform: 'rotate(6deg)', offset: 0.25 },
      { transform: 'rotate(-6deg)', offset: 0.4 },
      { transform: 'rotate(5deg)', offset: 0.55 },
      { transform: 'rotate(-3deg)', offset: 0.75 },
      { transform: 'rotate(0deg)' },
    ],
  },
  drive: {
    duration: 1100,
    origin: BOTTOM,
    easing: 'ease-in-out',
    frames: [
      { transform: 'translateX(0) rotate(0deg)' },
      { transform: 'translateX(-12%) rotate(3deg)', offset: 0.15 },
      { transform: 'translateX(45%) rotate(-2deg)', offset: 0.5 },
      { transform: 'translateX(-8%) rotate(2deg)', offset: 0.8 },
      { transform: 'translateX(0) rotate(0deg)' },
    ],
  },
  blast: {
    duration: 1500,
    origin: CENTER,
    frames: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-3%, 0)', offset: 0.05 },
      { transform: 'translate(3%, 0)', offset: 0.1 },
      { transform: 'translate(-3%, 0)', offset: 0.15 },
      { transform: 'translate(3%, 0)', offset: 0.2 },
      { transform: 'translate(0, -160%)', offset: 0.55, easing: 'ease-in' },
      { transform: 'translate(0, 0)', offset: 0.85, easing: 'ease-out' },
      { transform: 'translate(0, -8%)', offset: 0.92 },
      { transform: 'translate(0, 0)' },
    ],
  },
  popback: {
    duration: 1100,
    origin: CENTER,
    frames: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.3)', opacity: 1, offset: 0.12 },
      { transform: 'scale(0)', opacity: 0, offset: 0.2 },
      { transform: 'scale(0)', opacity: 0, offset: 0.55 },
      { transform: 'scale(1.15)', opacity: 1, offset: 0.85 },
      { transform: 'scale(1)', opacity: 1 },
    ],
  },
  drop: {
    duration: 280,
    origin: BOTTOM,
    frames: [{ transform: 'scale(1.12, 0.88)' }, { transform: 'scale(0.96, 1.04)', offset: 0.6 }, { transform: 'scale(1, 1)' }],
  },
  hop: {
    duration: 450,
    origin: BOTTOM,
    frames: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-22%)', offset: 0.45 },
      { transform: 'translateY(0) scale(1.06, 0.94)', offset: 0.8 },
      { transform: 'translateY(0)' },
    ],
  },
  nudge: {
    duration: 420,
    origin: CENTER,
    frames: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6%)', offset: 0.25 },
      { transform: 'translateX(6%)', offset: 0.5 },
      { transform: 'translateX(-3%)', offset: 0.75 },
      { transform: 'translateX(0)' },
    ],
  },
};

export type AnyAnim = keyof typeof SPECS;

export function runAnim(el: Element | null | undefined, name: AnyAnim, delay = 0): void {
  if (!el || typeof (el as HTMLElement).animate !== 'function') return;
  const spec = SPECS[name];
  const h = el as HTMLElement;
  h.style.transformOrigin = spec.origin ?? CENTER;
  h.animate(spec.frames, { duration: spec.duration, easing: spec.easing ?? 'ease-out', delay });
}

/** Mouth-flap style wobble for while a voice plays. */
export function runTalk(el: Element | null | undefined, seconds: number): Animation | null {
  if (!el || typeof (el as HTMLElement).animate !== 'function' || seconds <= 0) return null;
  const h = el as HTMLElement;
  h.style.transformOrigin = BOTTOM;
  const period = 180;
  return h.animate(
    [
      { transform: 'scale(1, 1) rotate(0deg)' },
      { transform: 'scale(1.04, 0.95) rotate(-2deg)', offset: 0.5 },
      { transform: 'scale(1, 1) rotate(0deg)' },
    ],
    { duration: period, iterations: Math.max(1, Math.round((seconds * 1000) / period)) },
  );
}
