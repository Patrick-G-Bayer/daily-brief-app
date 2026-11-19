import { memo, useCallback, type PointerEvent as RPointerEvent } from 'react';
import type { ArtDef, StageItem } from '../types';
import { ArtSvg } from './ArtSvg';
import { MicIcon, SoundWavesIcon } from './Icons';

interface Props {
  item: StageItem;
  def: ArtDef;
  selected: boolean;
  lifted: boolean;
  over: boolean;
  talking: boolean;
  recording: boolean;
  idleDelay: number;
  onDown: (uid: string, e: RPointerEvent<HTMLDivElement>) => void;
  register: (uid: string, el: HTMLDivElement | null) => void;
}

export const StageItemView = memo(function StageItemView({
  item,
  def,
  selected,
  lifted,
  over,
  talking,
  recording,
  idleDelay,
  onDown,
  register,
}: Props) {
  const ref = useCallback((el: HTMLDivElement | null) => register(item.uid, el), [item.uid, register]);
  const cls = [
    'item',
    item.kind,
    selected && 'is-selected',
    lifted && 'is-lifted',
    over && 'is-over',
    talking && 'is-talking',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      ref={ref}
      className={cls}
      data-uid={item.uid}
      role="img"
      aria-label={def.label}
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        height: `${def.size * 100}cqh`,
        aspectRatio: `${def.w} / ${def.h}`,
        zIndex: item.z,
      }}
      onPointerDown={(e) => onDown(item.uid, e)}
    >
      {def.shadow && <div className="item-shadow" />}
      {selected && <div className="item-halo" />}
      <div className="item-lift">
        <div className="item-anim">
          <div className="item-idle" style={{ animationDelay: `${-idleDelay}s`, ['--blink-delay' as string]: `${idleDelay}s` }}>
            <ArtSvg def={def} className="item-art" />
          </div>
        </div>
      </div>
      {(talking || recording) && (
        <div className={`item-badge ${recording ? 'is-rec' : ''}`}>{recording ? <MicIcon /> : <SoundWavesIcon />}</div>
      )}
    </div>
  );
});
