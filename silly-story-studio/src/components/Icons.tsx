/** Simple picture icons. The game itself uses no words, so these carry the meaning. */
const base = {
  viewBox: '0 0 100 100',
  'aria-hidden': true as const,
  focusable: 'false' as const,
};
const INK = '#3a2e5c';
const white = { stroke: '#fff', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function MicIcon({ off = false }: { off?: boolean }) {
  return (
    <svg {...base}>
      <rect x="36" y="14" width="28" height="46" rx="14" fill="#fff" />
      <path d="M26 46 Q26 72 50 72 Q74 72 74 46" fill="none" {...white} strokeWidth={7} />
      <path d="M50 72 L50 86 M36 88 L64 88" {...white} strokeWidth={7} />
      {off && <path d="M18 18 L82 82" {...white} strokeWidth={9} />}
    </svg>
  );
}

export function RecordIcon() {
  return (
    <svg {...base}>
      <circle cx="50" cy="50" r="24" fill="#fff" />
    </svg>
  );
}

export function StopIcon() {
  return (
    <svg {...base}>
      <rect x="28" y="28" width="44" height="44" rx="9" fill="#fff" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg {...base}>
      <rect x="26" y="24" width="16" height="52" rx="6" fill="#fff" />
      <rect x="58" y="24" width="16" height="52" rx="6" fill="#fff" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg {...base}>
      <path d="M34 22 L78 50 L34 78 Z" fill="#fff" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
    </svg>
  );
}

export function RestartIcon() {
  return (
    <svg {...base}>
      <path d="M30 34 A26 26 0 1 1 26 58" fill="none" {...white} strokeWidth={10} />
      <path d="M18 22 L30 36 L44 26" fill="none" {...white} strokeWidth={10} />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg {...base}>
      <path d="M16 50 L50 20 L84 50" fill="none" {...white} strokeWidth={10} />
      <path d="M28 46 L28 80 L72 80 L72 46" fill="#fff" {...white} strokeWidth={8} />
      <rect x="43" y="58" width="14" height="22" rx="3" fill="#ff8a3d" />
    </svg>
  );
}

export function NextIcon() {
  return (
    <svg {...base}>
      <path d="M20 50 L76 50 M54 26 L78 50 L54 74" fill="none" {...white} strokeWidth={12} />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg {...base}>
      <path d="M80 50 L24 50 M46 26 L22 50 L46 74" fill="none" {...white} strokeWidth={12} />
    </svg>
  );
}

export function CameraIcon() {
  return (
    <svg {...base}>
      <path d="M14 34 Q14 28 20 28 L32 28 L38 18 L62 18 L68 28 L80 28 Q86 28 86 34 L86 76 Q86 82 80 82 L20 82 Q14 82 14 76 Z" fill="#5ac8fa" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <circle cx="50" cy="54" r="17" fill="#fff" stroke={INK} strokeWidth={6} />
      <circle cx="50" cy="54" r="7" fill={INK} />
      <circle cx="74" cy="40" r="4" fill="#ffd43b" />
    </svg>
  );
}

/** A little stage with a sparkle: "make a new show". */
export function NewShowIcon() {
  return (
    <svg {...base}>
      <rect x="10" y="26" width="80" height="58" rx="10" fill="#7fd3ff" stroke={INK} strokeWidth={5} />
      <path d="M10 68 Q50 58 90 68 L90 74 Q90 84 80 84 L20 84 Q10 84 10 74 Z" fill="#7ee081" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx="50" cy="46" r="14" fill="#ff4d6d" stroke={INK} strokeWidth={4} />
      <path d="M50 38 L50 54 M42 46 L58 46" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      <path d="M78 8 Q80 18 90 20 Q80 22 78 32 Q76 22 66 20 Q76 18 78 8 Z" fill="#ffd43b" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
}

/** A film strip: "saved shows". */
export function FilmIcon() {
  return (
    <svg {...base}>
      <rect x="12" y="18" width="76" height="64" rx="8" fill={INK} />
      {[24, 40, 56, 72].map((x) => (
        <g key={x}>
          <rect x={x - 4} y="23" width="8" height="8" rx="2" fill="#fff" />
          <rect x={x - 4} y="69" width="8" height="8" rx="2" fill="#fff" />
        </g>
      ))}
      <rect x="20" y="36" width="60" height="28" rx="4" fill="#ffd43b" />
      <path d="M44 42 L60 50 L44 58 Z" fill="#ff4d6d" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...base}>
      <path d="M32 46 L32 34 Q32 16 50 16 Q68 16 68 34 L68 46" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <rect x="22" y="44" width="56" height="42" rx="10" fill="#ffd166" stroke={INK} strokeWidth={6} />
      <circle cx="50" cy="62" r="6" fill={INK} />
      <path d="M50 64 L50 74" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg {...base}>
      <path d="M22 52 L42 72 L80 30" fill="none" {...white} strokeWidth={12} />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg {...base}>
      <path d="M28 28 L72 72 M72 28 L28 72" {...white} strokeWidth={12} />
    </svg>
  );
}

/** A pointing finger drawing a loop: "trace around it". */
export function TraceHintIcon() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="96" rx="70" ry="80" fill="none" stroke="#3dff7a" strokeWidth={8} strokeDasharray="16 14" className="trace-hint-path" />
      <g className="trace-hint-finger">
        <path d="M100 160 L100 118 Q100 108 110 108 Q120 108 120 118 L120 140 L128 140 Q138 140 138 150 L138 186 L100 186 Z" fill="#ffe0bd" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function RotateIcon() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g className="rotate-device">
        <rect x="70" y="40" width="60" height="110" rx="10" fill="#fff" stroke={INK} strokeWidth={7} />
        <circle cx="100" cy="136" r="5" fill={INK} />
      </g>
      <path d="M150 70 Q176 100 150 140" fill="none" stroke="#ff5d9e" strokeWidth={8} strokeLinecap="round" />
      <path d="M140 136 L152 144 L158 130" fill="none" stroke="#ff5d9e" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...base}>
      <path d="M24 30 L76 30 M40 30 L42 18 L58 18 L60 30" fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 32 L34 84 L66 84 L70 32" fill="none" stroke="currentColor" strokeWidth={7} strokeLinejoin="round" />
    </svg>
  );
}
