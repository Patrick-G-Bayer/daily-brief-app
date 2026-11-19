import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * A button that only activates after being pressed and held, with a ring that
 * fills up while holding. Keeps grown-up actions safe from quick little taps.
 */
export function HoldButton({
  ms,
  onDone,
  className = '',
  label,
  children,
}: {
  ms: number;
  onDone: () => void;
  className?: string;
  label: string;
  children: ReactNode;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const cancel = () => {
    window.clearTimeout(timer.current);
    setHolding(false);
  };

  return (
    <button
      type="button"
      className={`hold-btn ${holding ? 'is-holding' : ''} ${className}`}
      style={{ '--hold-ms': `${ms}ms` } as CSSProperties}
      aria-label={label}
      onPointerDown={(e) => {
        e.stopPropagation();
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        window.clearTimeout(timer.current);
        setHolding(true);
        timer.current = window.setTimeout(() => {
          setHolding(false);
          navigator.vibrate?.(30);
          done.current();
        }, ms);
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
      onKeyDown={(e) => {
        // Keyboard users (grown-ups at a computer) can activate with Enter/Space.
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          done.current();
        }
      }}
    >
      <svg className="hold-ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" pathLength={100} />
      </svg>
      {children}
    </button>
  );
}
