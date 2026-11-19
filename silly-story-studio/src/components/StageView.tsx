import { memo, type PointerEvent as RPointerEvent, type ReactNode, type Ref } from 'react';
import { getActorDef, getSceneDef } from '../art/registry';
import type { Actor, ArtDef, StageState } from '../types';
import { ArtSvg } from './ArtSvg';

type ActorDown = (uid: string, e: RPointerEvent<HTMLDivElement>) => void;

const ActorView = memo(function ActorView({ actor, def, onDown }: { actor: Actor; def: ArtDef; onDown?: ActorDown }) {
  return (
    <div
      className="actor"
      data-uid={actor.uid}
      role="img"
      aria-label={def.label}
      style={{
        left: `${actor.x * 100}%`,
        top: `${actor.y * 100}%`,
        height: `${def.size * actor.s * 100}cqh`,
        aspectRatio: `${def.w} / ${def.h}`,
        zIndex: actor.z,
        transform: `translate(-50%, -50%) rotate(${actor.r}deg) scaleX(${actor.f ? -1 : 1})`,
      }}
      onPointerDown={onDown ? (e) => onDown(actor.uid, e) : undefined}
    >
      <ArtSvg def={def} />
    </div>
  );
});

export function Backdrop({ id, className = '' }: { id: string; className?: string }) {
  const def = getSceneDef(id);
  const Art = def?.art;
  return (
    <svg className={`backdrop ${className}`} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Art ? <Art /> : <rect width="1600" height="900" fill="#cfe9ff" />}
    </svg>
  );
}

/**
 * Draws a stage: the backdrop(s) plus the actors that are on stage.
 * Used for the live stage, the show player and the gallery thumbnails.
 */
export function StageView({
  state,
  backdrops,
  onActorDown,
  onBgDown,
  stageRef,
  className = '',
  children,
}: {
  state: StageState;
  /** Backdrops to keep loaded so switching between them cross-fades. */
  backdrops?: string[];
  onActorDown?: ActorDown;
  onBgDown?: (e: RPointerEvent<HTMLDivElement>) => void;
  stageRef?: Ref<HTMLDivElement>;
  className?: string;
  children?: ReactNode;
}) {
  const layers = backdrops && backdrops.length ? backdrops : [state.scene];
  return (
    <div className={`stage-view ${className}`} ref={stageRef}>
      <div className="stage-bg" onPointerDown={onBgDown}>
        {layers.map((id) => (
          <Backdrop key={id} id={id} className={id === state.scene ? 'is-active' : ''} />
        ))}
      </div>
      <div className={`stage-items ${onActorDown ? 'is-interactive' : ''}`}>
        {state.items.map((a) => {
          if (!a.on) return null;
          const def = getActorDef(a.kind, a.type);
          return def ? <ActorView key={a.uid} actor={a} def={def} onDown={onActorDown} /> : null;
        })}
      </div>
      {children}
    </div>
  );
}
