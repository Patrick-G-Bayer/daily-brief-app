import { useRef, type ReactNode } from 'react';
import { BackIcon, CameraIcon, CheckIcon, NextIcon } from '../components/Icons';

export interface PickItem {
  key: string;
  label: string;
  render: () => ReactNode;
}

function nudge(el: Element | null) {
  (el as HTMLElement | null)?.animate?.(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }],
    { duration: 300 },
  );
}

/**
 * A picture-only picker: tap tiles to choose (up to `max`), see the choices in
 * the slots along the top, then tap the big green arrow.
 */
export function Picker({
  variant,
  items,
  selected,
  max,
  onToggle,
  onBack,
  onNext,
  onPhoto,
}: {
  variant: 'actors' | 'backdrops';
  items: PickItem[];
  selected: string[];
  max: number;
  onToggle: (key: string) => void;
  onBack: () => void;
  onNext: () => void;
  onPhoto: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const tileRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const byKey = new Map(items.map((i) => [i.key, i]));
  const full = selected.length >= max;

  return (
    <div className={`picker picker-${variant}`}>
      <header className="picker-bar">
        <button type="button" className="round-btn back-btn" aria-label="Back" onClick={onBack}>
          <BackIcon />
        </button>
        <div className="slots" aria-label={`${selected.length} of ${max} chosen`}>
          {Array.from({ length: max }, (_, i) => {
            const key = selected[i];
            const item = key ? byKey.get(key) : undefined;
            return (
              <button
                key={i}
                type="button"
                className={`slot ${item ? 'is-filled' : ''}`}
                aria-label={item ? `Remove ${item.label}` : 'Empty spot'}
                onClick={() => key && onToggle(key)}
              >
                {item?.render()}
              </button>
            );
          })}
        </div>
        <button
          ref={nextRef}
          type="button"
          className={`round-btn next-btn ${selected.length ? 'is-ready' : ''}`}
          aria-label="Next"
          onClick={() => (selected.length ? onNext() : nudge(nextRef.current))}
        >
          <NextIcon />
        </button>
      </header>

      <div className="picker-grid">
        <button type="button" className="tile camera-tile" aria-label={variant === 'actors' ? 'Make a photo puppet' : 'Use a photo as a backdrop'} onClick={() => fileRef.current?.click()}>
          <CameraIcon />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) onPhoto(f);
          }}
        />
        {items.map((it) => {
          const isSel = selected.includes(it.key);
          return (
            <button
              key={it.key}
              ref={(el) => {
                tileRefs.current[it.key] = el;
              }}
              type="button"
              className={`tile ${isSel ? 'is-selected' : ''} ${full && !isSel ? 'is-dimmed' : ''}`}
              aria-label={it.label}
              aria-pressed={isSel}
              onClick={() => {
                if (!isSel && full) {
                  nudge(tileRefs.current[it.key]);
                  return;
                }
                onToggle(it.key);
              }}
            >
              {it.render()}
              {isSel && (
                <span className="tile-check">
                  <CheckIcon />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
