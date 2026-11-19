import type { ArtDef } from '../types';
import { Cheek, Eye, INK, fuzzyCircle, line, starPath } from './common';

const s = { ...line };

function Dino() {
  const G = '#6fd36b';
  const D = '#4fb24c';
  const O = '#ffb347';
  return (
    <g>
      <path d="M150 168 Q204 170 214 120 Q196 150 152 138 Z" fill={G} {...s} />
      <path d="M110 96 L122 66 L138 98 Z" fill={O} {...s} />
      <path d="M138 106 L158 84 L166 118 Z" fill={O} {...s} />
      <path d="M160 128 L184 116 L180 146 Z" fill={O} {...s} />
      <rect x="80" y="178" width="32" height="44" rx="13" fill={G} {...s} />
      <rect x="128" y="178" width="32" height="44" rx="13" fill={G} {...s} />
      <ellipse cx="120" cy="156" rx="60" ry="52" fill={G} {...s} />
      <ellipse cx="112" cy="168" rx="34" ry="32" fill="#c9f5a8" />
      <circle cx="150" cy="140" r="7" fill={D} />
      <circle cx="160" cy="162" r="5" fill={D} />
      <path d="M86 148 Q70 156 74 172" fill="none" stroke={INK} strokeWidth={15} strokeLinecap="round" />
      <path d="M86 148 Q70 156 74 172" fill="none" stroke={G} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx="78" cy="84" rx="60" ry="52" fill={G} {...s} />
      <circle cx="44" cy="54" r="6" fill={D} />
      <circle cx="112" cy="50" r="5" fill={D} />
      <Eye x={58} y={74} r={14} />
      <Eye x={100} y={72} r={14} />
      <circle cx="70" cy="98" r="3" fill={INK} />
      <circle cx="86" cy="98" r="3" fill={INK} />
      <path d="M50 110 Q78 134 108 110" fill="#fff" {...s} strokeWidth={4} />
      <Cheek x={36} y={100} />
      <Cheek x={122} y={98} />
    </g>
  );
}

function Robot() {
  const B = '#8ec5ff';
  const Y = '#ffd166';
  const M = '#b7c3d6';
  return (
    <g>
      <line x1="100" y1="16" x2="100" y2="40" {...s} />
      <circle cx="100" cy="14" r="10" fill="#ff5d73" {...s} />
      <rect x="38" y="60" width="18" height="32" rx="7" fill={Y} {...s} />
      <rect x="144" y="60" width="18" height="32" rx="7" fill={Y} {...s} />
      <path d="M54 142 L30 172" stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <path d="M54 142 L30 172" stroke={M} strokeWidth={8} strokeLinecap="round" />
      <path d="M146 142 L170 172" stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <path d="M146 142 L170 172" stroke={M} strokeWidth={8} strokeLinecap="round" />
      <circle cx="27" cy="177" r="11" fill={Y} {...s} />
      <circle cx="173" cy="177" r="11" fill={Y} {...s} />
      <rect x="66" y="194" width="22" height="20" fill={M} {...s} />
      <rect x="112" y="194" width="22" height="20" fill={M} {...s} />
      <rect x="56" y="208" width="40" height="16" rx="8" fill={Y} {...s} />
      <rect x="104" y="208" width="40" height="16" rx="8" fill={Y} {...s} />
      <rect x="88" y="110" width="24" height="16" fill={M} {...s} />
      <rect x="46" y="122" width="108" height="78" rx="18" fill={B} {...s} />
      <rect x="64" y="136" width="72" height="48" rx="10" fill="#d6ecff" {...s} strokeWidth={4} />
      <circle cx="82" cy="152" r="7" fill="#ff5d73" {...s} strokeWidth={3} />
      <circle cx="100" cy="152" r="7" fill={Y} {...s} strokeWidth={3} />
      <circle cx="118" cy="152" r="7" fill="#6fd36b" {...s} strokeWidth={3} />
      <path d="M78 170 L122 170" {...s} strokeWidth={4} />
      <rect x="50" y="34" width="100" height="80" rx="22" fill={B} {...s} />
      <rect x="62" y="46" width="76" height="56" rx="14" fill="#eaf7ff" {...s} strokeWidth={4} />
      <g>
        <circle cx="84" cy="70" r="10" fill={INK} />
        <circle cx="87" cy="66" r="3.5" fill="#fff" />
      </g>
      <g>
        <circle cx="116" cy="70" r="10" fill={INK} />
        <circle cx="119" cy="66" r="3.5" fill="#fff" />
      </g>
      <path d="M86 88 Q100 98 114 88" fill="none" {...s} strokeWidth={4} />
      <Cheek x={70} y={88} r={6} />
      <Cheek x={130} y={88} r={6} />
    </g>
  );
}

function Unicorn() {
  const W = '#fff6fb';
  const H = '#c9b6ff';
  return (
    <g>
      <path d="M156 160 Q206 150 196 104 Q212 150 176 178 Z" fill="#ff8cc6" {...s} />
      <path d="M160 176 Q206 180 204 140 Q214 184 168 194 Z" fill="#7fd3ff" {...s} />
      <rect x="60" y="176" width="22" height="42" rx="9" fill={W} {...s} />
      <rect x="86" y="180" width="22" height="40" rx="9" fill={W} {...s} />
      <rect x="122" y="180" width="22" height="40" rx="9" fill={W} {...s} />
      <rect x="148" y="176" width="22" height="42" rx="9" fill={W} {...s} />
      <rect x="60" y="208" width="22" height="12" rx="5" fill={H} {...s} strokeWidth={4} />
      <rect x="86" y="208" width="22" height="12" rx="5" fill={H} {...s} strokeWidth={4} />
      <rect x="122" y="208" width="22" height="12" rx="5" fill={H} {...s} strokeWidth={4} />
      <rect x="148" y="208" width="22" height="12" rx="5" fill={H} {...s} strokeWidth={4} />
      <ellipse cx="116" cy="166" rx="64" ry="40" fill={W} {...s} />
      <circle cx="138" cy="70" r="18" fill="#ff8cc6" {...s} />
      <circle cx="146" cy="98" r="17" fill="#b48cff" {...s} />
      <circle cx="142" cy="126" r="16" fill="#7fd3ff" {...s} />
      <circle cx="132" cy="150" r="14" fill="#ffd34d" {...s} />
      <path d="M62 58 L68 26 L86 50 Z" fill={W} {...s} />
      <path d="M100 50 L120 28 L124 60 Z" fill={W} {...s} />
      <ellipse cx="94" cy="98" rx="52" ry="48" fill={W} {...s} />
      <path d="M82 52 L96 6 L108 52 Z" fill="#ffd34d" {...s} />
      <path d="M86 40 L104 34 M90 26 L101 22" {...s} strokeWidth={3} />
      <circle cx="100" cy="50" r="13" fill="#ff8cc6" {...s} strokeWidth={4} />
      <circle cx="84" cy="52" r="11" fill="#b48cff" {...s} strokeWidth={4} />
      <ellipse cx="90" cy="124" rx="30" ry="20" fill="#ffd6ea" {...s} strokeWidth={4} />
      <ellipse cx="80" cy="120" rx="3" ry="4" fill={INK} />
      <ellipse cx="100" cy="120" rx="3" ry="4" fill={INK} />
      <path d="M80 132 Q90 140 100 132" fill="none" {...s} strokeWidth={3.5} />
      <path d="M56 80 L50 74 M60 76 L57 68" {...s} strokeWidth={3} />
      <Eye x={70} y={90} r={12} />
      <Eye x={112} y={88} r={12} />
      <Cheek x={58} y={110} r={7} />
      <Cheek x={124} y={108} r={7} />
    </g>
  );
}

function Monster() {
  const P = '#9b6dff';
  return (
    <g>
      <path d="M62 56 Q42 36 50 10 Q66 32 84 42 Z" fill="#ffe066" {...s} />
      <path d="M148 56 Q168 36 160 10 Q144 32 126 42 Z" fill="#ffe066" {...s} />
      <path d={fuzzyCircle(24, 132, 18, 10, 5)} fill={P} {...s} />
      <path d={fuzzyCircle(186, 132, 18, 10, 5)} fill={P} {...s} />
      <ellipse cx="74" cy="208" rx="26" ry="14" fill="#ff9f43" {...s} />
      <ellipse cx="136" cy="208" rx="26" ry="14" fill="#ff9f43" {...s} />
      <path d={fuzzyCircle(105, 122, 80, 30, 7)} fill={P} {...s} />
      <path d={fuzzyCircle(105, 156, 40, 18, 4)} fill="#c2a5ff" />
      <circle cx="56" cy="88" r="7" fill="#b892ff" />
      <circle cx="160" cy="104" r="9" fill="#b892ff" />
      <circle cx="148" cy="70" r="5" fill="#b892ff" />
      <circle cx="105" cy="88" r="31" fill="#fff" {...s} />
      <circle cx="107" cy="92" r="17" fill="#3fc1a5" />
      <circle cx="108" cy="93" r="9" fill={INK} />
      <circle cx="114" cy="85" r="5" fill="#fff" />
      <g>
        <path d="M74 60 Q105 50 136 60" fill="none" {...s} />
      </g>
      <path d="M62 134 Q105 192 148 134 Q105 150 62 134 Z" fill="#5a1f4a" {...s} />
      <ellipse cx="105" cy="164" rx="18" ry="8" fill="#ff7aa8" />
      <path d="M78 140 L86 154 L94 143 Z" fill="#fff" {...s} strokeWidth={3} />
      <path d="M116 143 L124 154 L132 140 Z" fill="#fff" {...s} strokeWidth={3} />
      <Cheek x={58} y={130} r={9} />
      <Cheek x={152} y={130} r={9} />
    </g>
  );
}

function Cat() {
  const O = '#ffa94d';
  const L = '#ffe3c2';
  const S = '#e07b1f';
  return (
    <g>
      <path d="M146 200 Q206 196 198 132 Q194 112 180 118 Q190 172 140 178 Z" fill={O} {...s} />
      <path d="M190 132 Q196 122 190 120" fill="none" stroke={S} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx="105" cy="172" rx="54" ry="48" fill={O} {...s} />
      <ellipse cx="105" cy="182" rx="28" ry="32" fill={L} />
      <path d="M58 160 Q66 156 70 164 M140 164 Q144 156 152 160" fill="none" stroke={S} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx="82" cy="214" rx="18" ry="11" fill={L} {...s} />
      <ellipse cx="128" cy="214" rx="18" ry="11" fill={L} {...s} />
      <path d="M46 74 L54 16 L94 50 Z" fill={O} {...s} />
      <path d="M164 74 L156 16 L116 50 Z" fill={O} {...s} />
      <path d="M58 56 L62 32 L80 50 Z" fill="#ffb3c9" />
      <path d="M152 56 L148 32 L130 50 Z" fill="#ffb3c9" />
      <ellipse cx="105" cy="90" rx="66" ry="56" fill={O} {...s} />
      <path d="M96 38 L98 56 M114 38 L112 56 M105 36 L105 54" stroke={S} strokeWidth={6} strokeLinecap="round" />
      <path d="M42 82 L56 86 M42 96 L54 96" stroke={S} strokeWidth={5} strokeLinecap="round" />
      <path d="M168 82 L154 86 M168 96 L156 96" stroke={S} strokeWidth={5} strokeLinecap="round" />
      <Eye x={78} y={84} r={14} />
      <Eye x={132} y={84} r={14} />
      <path d="M98 104 L112 104 L105 112 Z" fill="#ff7aa8" {...s} strokeWidth={3} />
      <path d="M92 116 Q98 124 105 114 Q112 124 118 116" fill="none" {...s} strokeWidth={4} />
      <path d="M70 110 L34 104 M70 118 L36 122 M140 110 L176 104 M140 118 L174 122" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <Cheek x={64} y={106} r={8} />
      <Cheek x={146} y={106} r={8} />
    </g>
  );
}

function Alien() {
  const G = '#7ee081';
  const C = '#5ad1ff';
  return (
    <g>
      <line x1="80" y1="40" x2="62" y2="12" {...s} />
      <line x1="130" y1="40" x2="148" y2="12" {...s} />
      <circle cx="62" cy="12" r="10" fill="#ff8cc6" {...s} />
      <circle cx="148" cy="12" r="10" fill="#ff8cc6" {...s} />
      <path d="M66 140 L34 104" stroke={INK} strokeWidth={20} strokeLinecap="round" />
      <path d="M66 140 L34 104" stroke={G} strokeWidth={10} strokeLinecap="round" />
      <path d="M144 140 L176 104" stroke={INK} strokeWidth={20} strokeLinecap="round" />
      <path d="M144 140 L176 104" stroke={G} strokeWidth={10} strokeLinecap="round" />
      <circle cx="32" cy="100" r="12" fill={G} {...s} />
      <circle cx="178" cy="100" r="12" fill={G} {...s} />
      <rect x="78" y="186" width="20" height="26" fill={G} {...s} />
      <rect x="112" y="186" width="20" height="26" fill={G} {...s} />
      <ellipse cx="86" cy="214" rx="18" ry="10" fill={C} {...s} />
      <ellipse cx="124" cy="214" rx="18" ry="10" fill={C} {...s} />
      <path d="M68 128 Q105 118 142 128 L152 188 Q105 202 58 188 Z" fill={C} {...s} />
      <rect x="62" y="164" width="86" height="13" rx="5" fill="#ffd166" {...s} strokeWidth={4} />
      <path d={starPath(105, 170, 10, 4.5)} fill="#ff8cc6" {...s} strokeWidth={3} />
      <ellipse cx="105" cy="128" rx="34" ry="9" fill="#b9ecff" {...s} strokeWidth={4} />
      <ellipse cx="105" cy="78" rx="72" ry="54" fill={G} {...s} />
      <circle cx="54" cy="56" r="6" fill="#a9f0a9" />
      <circle cx="160" cy="62" r="8" fill="#a9f0a9" />
      <circle cx="150" cy="40" r="4" fill="#a9f0a9" />
      <Eye x={70} y={78} r={13} />
      <Eye x={105} y={62} r={16} />
      <Eye x={140} y={78} r={13} />
      <path d="M86 102 Q105 124 124 102 Z" fill="#5a1f4a" {...s} strokeWidth={4} />
      <Cheek x={58} y={102} r={7} />
      <Cheek x={152} y={102} r={7} />
    </g>
  );
}

export const CHARACTERS: ArtDef[] = [
  { id: 'dino', label: 'Dinosaur', w: 220, h: 230, size: 0.33, art: Dino },
  { id: 'robot', label: 'Robot', w: 200, h: 230, size: 0.33, art: Robot },
  { id: 'unicorn', label: 'Unicorn', w: 216, h: 230, size: 0.33, art: Unicorn },
  { id: 'monster', label: 'Fuzzy monster', w: 210, h: 230, size: 0.33, art: Monster },
  { id: 'cat', label: 'Cat', w: 210, h: 230, size: 0.31, art: Cat },
  { id: 'alien', label: 'Alien', w: 210, h: 230, size: 0.33, art: Alien },
];

export const CHARACTER_MAP: Record<string, ArtDef> = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));

