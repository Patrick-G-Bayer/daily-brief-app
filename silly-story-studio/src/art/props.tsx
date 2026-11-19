import type { ArtDef } from '../types';
import { Blob, Cheek, INK, line, starPath } from './common';

const s = { ...line };
const s4 = { ...line, strokeWidth: 4 };

function BeachBall() {
  const colors = ['#ff5d5d', '#ffffff', '#4fa8ff', '#ffffff', '#ffd43b', '#ffffff'];
  const cx = 50;
  const cy = 50;
  const r = 44;
  return (
    <g>
      {colors.map((c, i) => {
        const a0 = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2;
        const d = `M${cx} ${cy} L${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A${r} ${r} 0 0 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r} Z`;
        return <path key={i} d={d} fill={c} />;
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" {...s} />
      <circle cx={cx} cy={cy} r="7" fill="#fff" {...s4} />
      <ellipse cx="32" cy="28" rx="9" ry="5" fill="#fff" opacity="0.7" transform="rotate(-35 32 28)" />
    </g>
  );
}

function Balloon() {
  return (
    <g>
      <path d="M40 92 Q28 104 42 114 T40 128" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <ellipse cx="40" cy="46" rx="34" ry="40" fill="#ff4d6d" {...s} />
      <path d="M33 86 L47 86 L40 94 Z" fill="#ff4d6d" {...s4} />
      <ellipse cx="27" cy="30" rx="7" ry="12" fill="#fff" opacity="0.55" transform="rotate(20 27 30)" />
    </g>
  );
}

function Star() {
  return (
    <g>
      <path d={starPath(50, 54, 46, 22)} fill="#ffd43b" {...s} />
      <circle cx="42" cy="52" r="4" fill={INK} />
      <circle cx="58" cy="52" r="4" fill={INK} />
      <path d="M42 62 Q50 69 58 62" fill="none" {...s4} />
      <Cheek x={35} y={61} r={4} />
      <Cheek x={65} y={61} r={4} />
    </g>
  );
}

function Flower() {
  const petals = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return [40 + Math.cos(a) * 20, 40 + Math.sin(a) * 20] as const;
  });
  return (
    <g>
      <path d="M40 118 Q34 90 40 58" fill="none" stroke={INK} strokeWidth={11} strokeLinecap="round" />
      <path d="M40 118 Q34 90 40 58" fill="none" stroke="#3fa34d" strokeWidth={5} strokeLinecap="round" />
      <path d="M38 98 Q14 80 8 96 Q20 108 38 98 Z" fill="#5fcf6a" {...s4} />
      {petals.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="15" fill="#ff7eb6" {...s4} />
      ))}
      <circle cx="40" cy="40" r="14" fill="#ffd43b" {...s4} />
      <circle cx="35" cy="38" r="2.5" fill={INK} />
      <circle cx="45" cy="38" r="2.5" fill={INK} />
      <path d="M35 45 Q40 49 45 45" fill="none" {...line} strokeWidth={2.5} />
    </g>
  );
}

function Tree() {
  return (
    <g>
      <path d="M48 148 L54 86 L68 86 L74 148 Z" fill="#a0643c" {...s} />
      <path d="M61 112 L74 98" {...s4} />
      <Blob
        fill="#4cbf56"
        circles={[
          [60, 62, 40],
          [30, 78, 26],
          [92, 78, 26],
          [60, 32, 28],
          [38, 44, 22],
          [84, 44, 22],
        ]}
      />
      <circle cx="42" cy="56" r="7" fill="#ff4d4d" {...s4} strokeWidth={3} />
      <circle cx="80" cy="70" r="7" fill="#ff4d4d" {...s4} strokeWidth={3} />
      <circle cx="60" cy="32" r="7" fill="#ff4d4d" {...s4} strokeWidth={3} />
      <circle cx="28" cy="82" r="6" fill="#ff4d4d" {...s4} strokeWidth={3} />
      <circle cx="94" cy="88" r="6" fill="#ff4d4d" {...s4} strokeWidth={3} />
    </g>
  );
}

function Car() {
  return (
    <g>
      <path
        d="M10 62 Q10 44 26 42 L40 42 L52 20 Q56 14 64 14 L96 14 Q104 14 108 20 L120 42 Q132 44 132 58 L132 66 Q132 74 124 74 L18 74 Q10 74 10 66 Z"
        fill="#ff5d5d"
        {...s}
      />
      <path d="M58 22 L76 22 L76 42 L48 42 Z" fill="#bfe9ff" {...s4} />
      <path d="M84 22 L100 22 L112 42 L84 42 Z" fill="#bfe9ff" {...s4} />
      <circle cx="127" cy="54" r="5" fill="#ffe066" {...s4} strokeWidth={3} />
      <rect x="12" y="52" width="10" height="7" rx="3" fill="#ffb347" />
      <circle cx="38" cy="74" r="14" fill={INK} />
      <circle cx="38" cy="74" r="6" fill="#dde3ee" />
      <circle cx="104" cy="74" r="14" fill={INK} />
      <circle cx="104" cy="74" r="6" fill="#dde3ee" />
    </g>
  );
}

function Crown() {
  return (
    <g>
      <path d="M10 82 L14 24 L38 52 L60 12 L82 52 L106 24 L110 82 Z" fill="#ffd43b" {...s} />
      <rect x="10" y="66" width="100" height="16" rx="4" fill="#ffbf1f" {...s4} />
      <circle cx="14" cy="22" r="6" fill="#ff5d9e" {...s4} strokeWidth={3} />
      <circle cx="60" cy="10" r="7" fill="#4fa8ff" {...s4} strokeWidth={3} />
      <circle cx="106" cy="22" r="6" fill="#ff5d9e" {...s4} strokeWidth={3} />
      <circle cx="36" cy="74" r="5" fill="#ff4d4d" />
      <circle cx="60" cy="74" r="6" fill="#6fd36b" />
      <circle cx="84" cy="74" r="5" fill="#4fa8ff" />
      <path d="M58 40 L62 40 L60 54 Z" fill="#fff" opacity="0.7" />
    </g>
  );
}

function Cake() {
  return (
    <g>
      <ellipse cx="55" cy="108" rx="52" ry="9" fill="#e7f0ff" {...s4} />
      <rect x="10" y="62" width="90" height="44" rx="10" fill="#ff9ec7" {...s} />
      <path d="M12 72 Q20 84 28 72 Q36 84 44 72 Q52 84 60 72 Q68 84 76 72 Q84 84 92 72 Q98 80 98 70 L98 66 L12 66 Z" fill="#fff" />
      <rect x="26" y="36" width="58" height="30" rx="8" fill="#fff1a8" {...s} />
      <rect x="51" y="14" width="8" height="24" rx="2" fill="#7fd3ff" {...s4} strokeWidth={3} />
      <path d="M55 2 Q64 12 55 16 Q46 12 55 2 Z" fill="#ffb347" {...s4} strokeWidth={2.5} />
      <circle cx="30" cy="92" r="3" fill="#ffd43b" />
      <circle cx="52" cy="96" r="3" fill="#4fa8ff" />
      <circle cx="76" cy="90" r="3" fill="#6fd36b" />
      <circle cx="40" cy="50" r="3" fill="#ff5d9e" />
      <circle cx="68" cy="54" r="3" fill="#4fa8ff" />
    </g>
  );
}

function Umbrella() {
  return (
    <g>
      <path d="M60 60 L60 112 Q60 124 48 124 Q38 124 38 114" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path
        d="M8 62 Q60 -4 112 62 Q99 52 86 62 Q73 52 60 62 Q47 52 34 62 Q21 52 8 62 Z"
        fill="#5ac8fa"
        {...s}
      />
      <path d="M34 62 Q40 24 60 10 M86 62 Q80 24 60 10" fill="none" {...s4} />
      <path d="M34 61 Q40 24 60 11 Q47 30 46 58 Z" fill="#ffd43b" />
      <path d="M86 61 Q80 24 60 11 Q73 30 74 58 Z" fill="#ffd43b" />
      <path d="M60 10 L60 4" {...s} />
    </g>
  );
}

function Duck() {
  return (
    <g>
      <path d="M18 62 Q18 94 62 94 Q104 94 110 62 Q112 48 98 54 Q82 60 70 52 Z" fill="#ffd43b" {...s} />
      <path d="M60 68 Q80 60 90 74 Q72 82 60 68 Z" fill="#ffbf1f" {...s4} strokeWidth={3} />
      <circle cx="42" cy="38" r="25" fill="#ffd43b" {...s} />
      <path d="M18 42 Q0 44 8 54 Q18 56 26 50 Z" fill="#ff8c2e" {...s4} />
      <circle cx="40" cy="31" r="5" fill={INK} />
      <circle cx="41.5" cy="29.5" r="1.8" fill="#fff" />
      <Cheek x={50} y={44} r={5} />
    </g>
  );
}

function Apple() {
  return (
    <g>
      <path d="M45 26 Q46 12 54 6" fill="none" stroke="#7a4a26" strokeWidth={6} strokeLinecap="round" />
      <path d="M50 18 Q66 4 80 14 Q66 28 50 18 Z" fill="#5fcf6a" {...s4} />
      <path d="M45 28 C30 14 6 22 8 52 C10 82 30 98 45 90 C60 98 80 82 82 52 C84 22 60 14 45 28 Z" fill="#ff4d4d" {...s} />
      <ellipse cx="26" cy="46" rx="6" ry="11" fill="#fff" opacity="0.5" transform="rotate(15 26 46)" />
    </g>
  );
}

function Drum() {
  return (
    <g>
      <line x1="30" y1="30" x2="58" y2="6" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <line x1="80" y1="30" x2="52" y2="6" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <circle cx="58" cy="6" r="5" fill="#ffd43b" {...s4} strokeWidth={3} />
      <circle cx="52" cy="6" r="5" fill="#ffd43b" {...s4} strokeWidth={3} />
      <path d="M14 42 L14 92 Q55 108 96 92 L96 42 Z" fill="#ff5d5d" {...s} />
      <path d="M16 50 L30 92 L44 50 L58 96 L72 50 L86 94 L94 54" fill="none" stroke="#ffd43b" strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx="55" cy="42" rx="41" ry="12" fill="#fff7e0" {...s} />
    </g>
  );
}

function Rainbow() {
  const bands = ['#ff4d4d', '#ff9f1c', '#ffd43b', '#5fcf6a', '#4fa8ff', '#9b6dff'];
  return (
    <g>
      <path d="M38.5 92 A41.5 41.5 0 0 1 121.5 92" fill="none" stroke={INK} strokeWidth={62.5} />
      {bands.map((c, i) => {
        const r = 64 - i * 9;
        return <path key={c} d={`M${80 - r} 92 A${r} ${r} 0 0 1 ${80 + r} 92`} fill="none" stroke={c} strokeWidth={9.6} />;
      })}
      <Blob fill="#fff" circles={[[14, 86, 12], [30, 80, 15], [48, 87, 11]]} />
      <Blob fill="#fff" circles={[[112, 87, 11], [130, 80, 15], [146, 86, 12]]} />
    </g>
  );
}

function Rocket() {
  return (
    <g>
      <path d="M28 102 Q45 152 62 102 Z" fill="#ff9f1c" {...s4} />
      <path d="M36 104 Q45 132 54 104 Z" fill="#ffe066" />
      <path d="M20 74 L4 114 L24 104 Z" fill="#ff4d6d" {...s} />
      <path d="M70 74 L86 114 L66 104 Z" fill="#ff4d6d" {...s} />
      <path d="M45 6 Q78 32 72 104 L18 104 Q12 32 45 6 Z" fill="#f1f3ff" {...s} />
      <path d="M45 6 Q60 18 66 32 L24 32 Q30 18 45 6 Z" fill="#ff4d6d" {...s4} />
      <circle cx="45" cy="58" r="13" fill="#7fd3ff" {...s} />
      <circle cx="41" cy="54" r="4" fill="#fff" opacity="0.8" />
      <path d="M45 104 L45 84" {...s4} />
    </g>
  );
}

function WizardHat() {
  return (
    <g>
      <ellipse cx="55" cy="100" rx="50" ry="14" fill="#5b5bd6" {...s} />
      <path d="M58 4 Q50 22 66 40 Q76 62 92 98 L18 98 Q36 56 40 30 Q44 10 58 4 Z" fill="#5b5bd6" {...s} />
      <path d="M22 88 Q55 100 88 88 L92 98 Q55 110 18 98 Z" fill="#ffd43b" {...s4} />
      <path d={starPath(52, 52, 9, 4)} fill="#ffd43b" />
      <path d={starPath(70, 74, 6, 3)} fill="#ffd43b" />
      <path d={starPath(38, 76, 6, 3)} fill="#ffd43b" />
      <path d="M56 26 Q50 32 56 38 Q46 36 48 30 Q50 24 56 26 Z" fill="#fff1a8" />
    </g>
  );
}

function Gift() {
  return (
    <g>
      <path d="M50 28 Q30 4 22 16 Q18 30 50 28 Z" fill="#ff5d9e" {...s4} />
      <path d="M50 28 Q70 4 78 16 Q82 30 50 28 Z" fill="#ff5d9e" {...s4} />
      <rect x="14" y="42" width="72" height="52" rx="6" fill="#6fd3ff" {...s} />
      <rect x="8" y="28" width="84" height="18" rx="5" fill="#8fe0ff" {...s} />
      <rect x="43" y="29" width="14" height="64" fill="#ff5d9e" />
      <path d="M43 28 L43 94 M57 28 L57 94" stroke={INK} strokeWidth={3} />
      <circle cx="50" cy="28" r="6" fill="#ff5d9e" {...s4} strokeWidth={3} />
      <circle cx="26" cy="62" r="4" fill="#fff" opacity="0.8" />
      <circle cx="72" cy="76" r="4" fill="#fff" opacity="0.8" />
    </g>
  );
}

function IceCream() {
  return (
    <g>
      <path d="M14 58 L40 126 L66 58 Z" fill="#f5b562" {...s} />
      <path d="M22 70 L50 98 M30 62 L56 88 M58 70 L30 98 M50 62 L24 88" stroke="#c98b3a" strokeWidth={3} strokeLinecap="round" />
      <Blob fill="#8ee6c6" circles={[[40, 56, 26], [22, 62, 10], [58, 62, 10]]} />
      <Blob fill="#ff9ec7" circles={[[40, 32, 22]]} />
      <path d="M44 10 Q48 2 54 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx="44" cy="12" r="7" fill="#ff4d4d" {...s4} strokeWidth={3} />
      <circle cx="30" cy="26" r="2.5" fill="#ffd43b" />
      <circle cx="46" cy="36" r="2.5" fill="#4fa8ff" />
      <circle cx="34" cy="40" r="2.5" fill="#fff" />
    </g>
  );
}

function Cloud() {
  return (
    <g>
      <Blob
        fill="#ffffff"
        circles={[
          [38, 56, 26],
          [70, 40, 32],
          [102, 54, 26],
          [56, 64, 22],
          [86, 64, 22],
        ]}
      />
      <circle cx="60" cy="50" r="4" fill={INK} />
      <circle cx="82" cy="50" r="4" fill={INK} />
      <path d="M62 60 Q71 68 80 60" fill="none" {...s4} strokeWidth={3.5} />
      <Cheek x={52} y={60} r={5} />
      <Cheek x={90} y={60} r={5} />
    </g>
  );
}

function Wand() {
  return (
    <g>
      <line x1="18" y1="112" x2="60" y2="50" stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <line x1="18" y1="112" x2="60" y2="50" stroke="#8a5cf6" strokeWidth={6} strokeLinecap="round" />
      <path d={starPath(68, 38, 30, 14)} fill="#ffd43b" {...s} />
      <path d={starPath(18, 22, 8, 2.5, 4)} fill="#ff8cc6" />
      <path d={starPath(92, 84, 7, 2, 4)} fill="#7fd3ff" />
      <path d={starPath(88, 12, 6, 2, 4)} fill="#7fd3ff" />
    </g>
  );
}

function Banana() {
  return (
    <g>
      <path d="M12 30 Q30 86 102 70 Q114 66 110 56 Q46 64 24 22 Q18 12 12 30 Z" fill="#ffe14d" {...s} />
      <path d="M24 34 Q44 66 96 64" fill="none" stroke="#e6c22e" strokeWidth={4} strokeLinecap="round" />
      <path d="M18 18 L14 10" stroke="#7a4a26" strokeWidth={7} strokeLinecap="round" />
      <circle cx="108" cy="60" r="4" fill="#7a4a26" />
    </g>
  );
}

export const PROPS: ArtDef[] = [
  { id: 'ball', label: 'Beach ball', w: 100, h: 100, size: 0.15, art: BeachBall },
  { id: 'balloon', label: 'Balloon', w: 80, h: 130, size: 0.22, art: Balloon },
  { id: 'star', label: 'Star', w: 100, h: 100, size: 0.15, art: Star },
  { id: 'flower', label: 'Flower', w: 80, h: 120, size: 0.18, art: Flower },
  { id: 'tree', label: 'Tree', w: 120, h: 150, size: 0.34, art: Tree },
  { id: 'car', label: 'Toy car', w: 140, h: 90, size: 0.15, art: Car },
  { id: 'crown', label: 'Crown', w: 120, h: 90, size: 0.13, art: Crown },
  { id: 'cake', label: 'Cake', w: 110, h: 120, size: 0.18, art: Cake },
  { id: 'umbrella', label: 'Umbrella', w: 120, h: 130, size: 0.21, art: Umbrella },
  { id: 'duck', label: 'Rubber duck', w: 120, h: 100, size: 0.14, art: Duck },
  { id: 'apple', label: 'Apple', w: 90, h: 100, size: 0.13, art: Apple },
  { id: 'drum', label: 'Drum', w: 110, h: 110, size: 0.16, art: Drum },
  { id: 'rainbow', label: 'Rainbow', w: 160, h: 100, size: 0.2, art: Rainbow },
  { id: 'rocket', label: 'Rocket', w: 90, h: 150, size: 0.25, art: Rocket },
  { id: 'hat', label: 'Wizard hat', w: 110, h: 120, size: 0.17, art: WizardHat },
  { id: 'gift', label: 'Present', w: 100, h: 100, size: 0.15, art: Gift },
  { id: 'icecream', label: 'Ice cream', w: 80, h: 130, size: 0.2, art: IceCream },
  { id: 'cloud', label: 'Cloud', w: 140, h: 90, size: 0.15, art: Cloud },
  { id: 'wand', label: 'Magic wand', w: 100, h: 120, size: 0.18, art: Wand },
  { id: 'banana', label: 'Banana', w: 120, h: 90, size: 0.13, art: Banana },
];

export const PROP_MAP: Record<string, ArtDef> = Object.fromEntries(PROPS.map((p) => [p.id, p]));
