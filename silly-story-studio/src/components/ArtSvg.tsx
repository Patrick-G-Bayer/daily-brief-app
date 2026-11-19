import type { ArtDef } from '../types';

export function ArtSvg({ def, className }: { def: ArtDef; className?: string }) {
  const Art = def.art;
  return (
    <svg viewBox={`0 0 ${def.w} ${def.h}`} className={className} aria-hidden="true" focusable="false">
      <Art />
    </svg>
  );
}
