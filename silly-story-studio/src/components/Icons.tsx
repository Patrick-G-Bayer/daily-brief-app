/** Simple picture icons. The game itself uses no words, so these carry the meaning. */
const base = {
  viewBox: '0 0 100 100',
  'aria-hidden': true as const,
  focusable: 'false' as const,
};
const ink = { stroke: '#3a2e5c', strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function MicIcon({ off = false }: { off?: boolean }) {
  return (
    <svg {...base}>
      <rect x="36" y="14" width="28" height="46" rx="14" fill="#fff" />
      <path d="M26 46 Q26 72 50 72 Q74 72 74 46" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      <path d="M50 72 L50 86 M36 88 L64 88" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      {off && <path d="M18 18 L82 82" stroke="#fff" strokeWidth={9} strokeLinecap="round" />}
    </svg>
  );
}

export function StopIcon() {
  return (
    <svg {...base}>
      <rect x="28" y="28" width="44" height="44" rx="10" fill="#fff" />
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

/** Tiny mouse face = squeaky voice. */
export function MouseIcon() {
  return (
    <svg {...base}>
      <circle cx="28" cy="34" r="17" fill="#d9d2ef" {...ink} strokeWidth={5} />
      <circle cx="72" cy="34" r="17" fill="#d9d2ef" {...ink} strokeWidth={5} />
      <circle cx="28" cy="34" r="8" fill="#ffb3c9" />
      <circle cx="72" cy="34" r="8" fill="#ffb3c9" />
      <circle cx="50" cy="58" r="26" fill="#d9d2ef" {...ink} strokeWidth={5} />
      <circle cx="41" cy="54" r="4" fill="#3a2e5c" />
      <circle cx="59" cy="54" r="4" fill="#3a2e5c" />
      <circle cx="50" cy="66" r="5" fill="#ff7aa8" />
      <path d="M38 68 L20 64 M38 72 L22 76 M62 68 L80 64 M62 72 L78 76" stroke="#3a2e5c" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

/** Big bear face = deep voice. */
export function BearIcon() {
  return (
    <svg {...base}>
      <circle cx="22" cy="24" r="14" fill="#a5714a" {...ink} strokeWidth={5} />
      <circle cx="78" cy="24" r="14" fill="#a5714a" {...ink} strokeWidth={5} />
      <circle cx="50" cy="54" r="40" fill="#a5714a" {...ink} strokeWidth={5} />
      <ellipse cx="50" cy="68" rx="18" ry="14" fill="#e8c39e" />
      <circle cx="36" cy="48" r="5" fill="#3a2e5c" />
      <circle cx="64" cy="48" r="5" fill="#3a2e5c" />
      <ellipse cx="50" cy="62" rx="7" ry="5" fill="#3a2e5c" />
      <path d="M43 74 Q50 80 57 74" fill="none" stroke="#3a2e5c" strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  );
}

export function SoundWavesIcon() {
  return (
    <svg {...base}>
      <path d="M20 40 L36 40 L54 24 L54 76 L36 60 L20 60 Z" fill="#fff" {...ink} strokeWidth={5} />
      <path d="M66 36 Q74 50 66 64" fill="none" {...ink} strokeWidth={6} />
      <path d="M76 26 Q90 50 76 74" fill="none" {...ink} strokeWidth={6} />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...base}>
      <path d="M32 46 L32 34 Q32 16 50 16 Q68 16 68 34 L68 46" fill="none" stroke="#3a2e5c" strokeWidth={8} strokeLinecap="round" />
      <rect x="22" y="44" width="56" height="42" rx="10" fill="#ffd166" stroke="#3a2e5c" strokeWidth={6} />
      <circle cx="50" cy="62" r="6" fill="#3a2e5c" />
      <path d="M50 64 L50 74" stroke="#3a2e5c" strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg {...base}>
      <path d="M22 52 L42 72 L80 30" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg {...base}>
      <path d="M28 28 L72 72 M72 28 L28 72" stroke="#fff" strokeWidth={12} strokeLinecap="round" />
    </svg>
  );
}

export function RotateIcon() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g className="rotate-device">
        <rect x="70" y="40" width="60" height="110" rx="10" fill="#fff" stroke="#3a2e5c" strokeWidth={7} />
        <circle cx="100" cy="136" r="5" fill="#3a2e5c" />
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
