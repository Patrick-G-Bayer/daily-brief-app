import { forwardRef, useRef, type PointerEvent as RPointerEvent } from 'react';
import { CHARACTERS } from '../art/characters';
import { PROPS } from '../art/props';
import { SCENES } from '../art/scenes';
import { runAnim } from '../anim';
import type { ItemKind, SceneId } from '../types';
import { ArtSvg } from './ArtSvg';

export type TrayDown = (kind: ItemKind, type: string, e: RPointerEvent<HTMLElement>) => void;

/** Big round backdrop buttons. */
export function SceneButtons({ scene, onPick }: { scene: SceneId; onPick: (id: SceneId) => void }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  return (
    <div className="scene-buttons">
      {SCENES.map((s) => {
        const Art = s.art;
        const active = s.id === scene;
        return (
          <button
            key={s.id}
            ref={(el) => {
              refs.current[s.id] = el;
            }}
            type="button"
            className={`scene-btn ${active ? 'is-active' : ''}`}
            aria-label={s.label}
            aria-pressed={active}
            onClick={() => {
              if (active) runAnim(refs.current[s.id], 'nudge');
              onPick(s.id);
            }}
          >
            <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <Art />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/** The six characters. Tap to bring one out, or drag it onto the stage. */
export const CastRail = forwardRef<HTMLDivElement, { onStage: Set<string>; glow: number; hint: boolean; onDown: TrayDown }>(
  function CastRail({ onStage, glow, hint, onDown }, ref) {
    return (
      <div ref={ref} className={`tray cast-rail glow-${glow} ${hint ? 'is-hinting' : ''}`}>
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`tray-btn ${onStage.has(c.id) ? 'is-out' : ''}`}
            aria-label={c.label}
            onPointerDown={(e) => onDown('character', c.id, e)}
          >
            <ArtSvg def={c} />
          </button>
        ))}
      </div>
    );
  },
);

/** The twenty props in a big sideways-scrolling toy shelf. */
export const PropStrip = forwardRef<HTMLDivElement, { glow: number; onDown: TrayDown }>(function PropStrip(
  { glow, onDown },
  ref,
) {
  return (
    <div ref={ref} className={`tray prop-strip glow-${glow}`}>
      {PROPS.map((p) => (
        <button
          key={p.id}
          type="button"
          className="tray-btn"
          aria-label={p.label}
          onPointerDown={(e) => onDown('prop', p.id, e)}
        >
          <ArtSvg def={p} />
        </button>
      ))}
    </div>
  );
});
