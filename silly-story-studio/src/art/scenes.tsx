import { useId } from 'react';
import type { SceneDef } from '../types';
import { Blob, INK, starPath } from './common';

/** A gradient id that's unique per rendered copy (the scene is also drawn as a button thumbnail). */
function useGradId(): string {
  return 'g' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
}

const o = { stroke: INK, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

function Sun({ x, y }: { x: number; y: number }) {
  const rays = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);
  return (
    <g>
      <g>
        {rays.map((a, i) => (
          <line
            key={i}
            x1={x + Math.cos(a) * 92}
            y1={y + Math.sin(a) * 92}
            x2={x + Math.cos(a) * 122}
            y2={y + Math.sin(a) * 122}
            stroke="#ffc93c"
            strokeWidth={14}
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx={x} cy={y} r={76} fill="#ffe066" {...o} />
      <circle cx={x - 24} cy={y - 8} r={7} fill={INK} />
      <circle cx={x + 24} cy={y - 8} r={7} fill={INK} />
      <path d={`M${x - 26} ${y + 18} Q${x} ${y + 42} ${x + 26} ${y + 18}`} fill="none" {...o} />
      <circle cx={x - 44} cy={y + 14} r={10} fill="#ff9a76" opacity={0.6} />
      <circle cx={x + 44} cy={y + 14} r={10} fill="#ff9a76" opacity={0.6} />
    </g>
  );
}

function SkyCloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Blob
        fill="#ffffff"
        outline={0}
        circles={[
          [0, 0, 44],
          [50, -22, 54],
          [104, 0, 44],
          [50, 16, 40],
        ]}
      />
    </g>
  );
}

function Farm() {
  const sky = useGradId();
  return (
    <g>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd1ff" />
          <stop offset="1" stopColor="#d8f3ff" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${sky})`} />
      <Sun x={190} y={160} />
      <SkyCloud x={560} y={150} s={0.9} />
      <SkyCloud x={1180} y={120} s={1.1} />
      <path d="M0 520 Q300 390 650 500 T1300 460 T1600 470 V900 H0 Z" fill="#9be07a" />
      <path d="M0 560 Q220 470 520 540 T1100 520 T1600 540 V900 H0 Z" fill="#86d466" />
      {/* silo */}
      <rect x="1400" y="250" width="110" height="330" fill="#cfd8e8" {...o} />
      <path d="M1400 250 Q1455 170 1510 250 Z" fill="#9aa9c2" {...o} />
      <path d="M1400 330 L1510 330 M1400 410 L1510 410 M1400 490 L1510 490" {...o} strokeWidth={4} />
      {/* barn */}
      <path d="M1040 360 L1180 250 L1320 360 L1320 590 L1040 590 Z" fill="#e8453c" {...o} />
      <path d="M1020 372 L1180 236 L1340 372" fill="none" stroke="#fff" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1020 372 L1180 236 L1340 372" fill="none" {...o} strokeWidth={4} />
      <rect x="1140" y="300" width="80" height="60" fill="#fff6e0" {...o} />
      <path d="M1180 300 L1180 360 M1140 330 L1220 330" {...o} strokeWidth={4} />
      <rect x="1110" y="440" width="140" height="150" fill="#b8302a" {...o} />
      <path d="M1110 440 L1250 590 M1250 440 L1110 590" stroke="#fff" strokeWidth={12} />
      <rect x="1110" y="440" width="140" height="150" fill="none" stroke="#fff" strokeWidth={12} />
      {/* near ground */}
      <path d="M0 610 Q400 560 800 600 T1600 590 V900 H0 Z" fill="#74c655" />
      <path d="M1180 590 Q1150 700 1000 760 Q860 820 900 900 L1120 900 Q1080 820 1180 740 Q1260 680 1250 590 Z" fill="#e8c27a" />
      {/* fence */}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={30 + i * 90} y={548} width={22} height={86} rx={6} fill="#f6e3c2" {...o} strokeWidth={4} />
      ))}
      <rect x="20" y="566" width="770" height="16" rx="6" fill="#f6e3c2" {...o} strokeWidth={4} />
      <rect x="20" y="600" width="770" height="16" rx="6" fill="#f6e3c2" {...o} strokeWidth={4} />
      {/* hay bales */}
      <rect x="840" y="560" width="120" height="80" rx="18" fill="#ffd166" {...o} />
      <path d="M860 580 L940 580 M860 600 L940 600 M860 620 L940 620" stroke="#e0a93a" strokeWidth={5} strokeLinecap="round" />
      {/* flowers */}
      {[
        [120, 760, '#ff7eb6'],
        [340, 820, '#ffd43b'],
        [560, 740, '#ff7eb6'],
        [1340, 780, '#ffffff'],
        [1500, 700, '#ffd43b'],
        [760, 840, '#ffffff'],
      ].map(([x, y, c], i) => (
        <g key={i}>
          <circle cx={x as number} cy={y as number} r={12} fill={c as string} {...o} strokeWidth={3} />
          <circle cx={x as number} cy={y as number} r={4} fill="#ff9f1c" />
        </g>
      ))}
    </g>
  );
}

function Leaf({ x, y, r, s, c }: { x: number; y: number; r: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 Q80 -70 200 0 Q80 70 0 0 Z" fill={c} {...o} />
      <path d="M10 0 L180 0" {...o} strokeWidth={4} />
    </g>
  );
}

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 0 Q-30 -180 10 -340 L34 -336 Q4 -180 16 0 Z" fill="#b07a45" {...o} />
      <path d="M-20 -120 L20 -112 M-24 -200 L18 -196 M-14 -280 L24 -272" {...o} strokeWidth={4} />
      <Leaf x={20} y={-338} r={-160} s={0.9} c="#3fae5a" />
      <Leaf x={20} y={-338} r={-20} s={0.9} c="#3fae5a" />
      <Leaf x={20} y={-338} r={-110} s={0.7} c="#58c46d" />
      <Leaf x={20} y={-338} r={-60} s={0.7} c="#58c46d" />
      <Leaf x={20} y={-338} r={160} s={0.7} c="#2f9a4c" />
      <Leaf x={20} y={-338} r={25} s={0.7} c="#2f9a4c" />
      <circle cx={8} cy={-326} r={16} fill="#8a5a2b" {...o} strokeWidth={4} />
      <circle cx={32} cy={-322} r={16} fill="#8a5a2b" {...o} strokeWidth={4} />
    </g>
  );
}

function Jungle() {
  const sky = useGradId();
  return (
    <g>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8be3c9" />
          <stop offset="1" stopColor="#e6ffd6" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${sky})`} />
      <circle cx="1300" cy="150" r="80" fill="#fff3a8" opacity="0.8" />
      <Blob
        fill="#5cb874"
        outline={0}
        circles={[
          [60, 470, 120],
          [260, 430, 140],
          [480, 470, 110],
          [700, 440, 130],
          [930, 470, 120],
          [1150, 430, 140],
          [1380, 460, 120],
          [1560, 430, 130],
        ]}
      />
      <Blob
        fill="#3f9a5a"
        outline={0}
        circles={[
          [140, 560, 120],
          [400, 540, 110],
          [640, 570, 120],
          [1040, 560, 110],
          [1300, 560, 120],
          [1540, 560, 110],
        ]}
      />
      {/* waterfall */}
      <path d="M760 330 L900 330 L930 600 L740 600 Z" fill="#8a8fa8" {...o} />
      <path d="M790 330 L870 330 L890 610 L780 610 Z" fill="#7fd3ff" />
      <path d="M810 350 L815 590 M840 350 L845 600 M865 350 L870 590" stroke="#e8f8ff" strokeWidth={8} strokeLinecap="round" />
      <path d="M0 600 Q300 560 700 600 T1600 590 V900 H0 Z" fill="#6cc24a" />
      <ellipse cx="830" cy="650" rx="230" ry="60" fill="#5ec8f0" {...o} />
      <ellipse cx="790" cy="640" rx="90" ry="16" fill="#bfeaff" opacity="0.8" />
      <Palm x={240} y={680} s={1} />
      <Palm x={1360} y={700} s={1.1} />
      {/* hanging vines */}
      {[120, 520, 1080, 1500].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 0 Q${x + 30} 100 ${x - 10} ${180 + i * 20} Q${x - 30} ${240 + i * 20} ${x} ${300 + i * 15}`} fill="none" stroke="#2f8a43" strokeWidth={10} strokeLinecap="round" />
          <ellipse cx={x + 14} cy={110} rx={22} ry={11} fill="#4fbf62" transform={`rotate(30 ${x + 14} 110)`} />
          <ellipse cx={x - 20} cy={220 + i * 10} rx={22} ry={11} fill="#4fbf62" transform={`rotate(-30 ${x - 20} ${220 + i * 10})`} />
        </g>
      ))}
      {/* big frame leaves */}
      <Leaf x={-40} y={60} r={20} s={1.4} c="#2f9a4c" />
      <Leaf x={-20} y={-20} r={50} s={1.1} c="#3fae5a" />
      <Leaf x={1640} y={70} r={160} s={1.4} c="#2f9a4c" />
      <Leaf x={1620} y={-20} r={130} s={1.1} c="#3fae5a" />
      {/* flowers */}
      {[
        [520, 780, '#ff6b9e'],
        [1080, 820, '#ff9f1c'],
        [90, 830, '#ff9f1c'],
        [1560, 820, '#ff6b9e'],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-20} rx={14} ry={22} fill={c as string} {...o} strokeWidth={3} transform={`rotate(${a})`} />
          ))}
          <circle r={9} fill="#ffe066" {...o} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
}

function Tower({ x, w, top, roof }: { x: number; w: number; top: number; roof: string }) {
  return (
    <g>
      <rect x={x} y={top} width={w} height={640 - top} fill="#e3dcff" {...o} />
      <path d={`M${x - 20} ${top} L${x + w / 2} ${top - w * 1.1} L${x + w + 20} ${top} Z`} fill={roof} {...o} />
      <line x1={x + w / 2} y1={top - w * 1.1} x2={x + w / 2} y2={top - w * 1.1 - 70} {...o} />
      <path
        d={`M${x + w / 2} ${top - w * 1.1 - 70} L${x + w / 2 + 60} ${top - w * 1.1 - 52} L${x + w / 2} ${top - w * 1.1 - 34} Z`}
        fill="#ffd43b"
        {...o}
        strokeWidth={4}
      />
      <path d={`M${x + w / 2 - 18} ${top + 110} L${x + w / 2 - 18} ${top + 80} Q${x + w / 2} ${top + 56} ${x + w / 2 + 18} ${top + 80} L${x + w / 2 + 18} ${top + 110} Z`} fill="#7a6cc2" {...o} strokeWidth={4} />
    </g>
  );
}

function Castle() {
  const sky = useGradId();
  const bunting = ['#ff6b9e', '#ffd43b', '#5ac8fa', '#7ee081', '#b48cff'];
  return (
    <g>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9a6ff" />
          <stop offset="1" stopColor="#ffd9f0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${sky})`} />
      {[
        [200, 120],
        [420, 80],
        [1240, 90],
        [1460, 170],
        [980, 60],
      ].map(([x, y], i) => (
        <path key={i} d={starPath(x, y, 18, 8)} fill="#fff6a8" />
      ))}
      <SkyCloud x={120} y={260} s={0.8} />
      <SkyCloud x={1320} y={300} s={0.7} />
      <path d="M0 560 L220 360 L420 560 Z" fill="#a99be6" />
      <path d="M1180 560 L1400 340 L1600 520 L1600 560 Z" fill="#a99be6" />
      <path d="M0 600 Q400 540 800 580 T1600 570 V900 H0 Z" fill="#8fd66b" />
      {/* castle */}
      <Tower x={460} w={130} top={260} roof="#ff6b9e" />
      <Tower x={1010} w={130} top={260} roof="#ff6b9e" />
      <Tower x={700} w={200} top={170} roof="#5ac8fa" />
      <path
        d="M560 340 L560 300 L600 300 L600 330 L640 330 L640 300 L680 300 L680 330 L920 330 L920 300 L960 300 L960 330 L1000 330 L1000 300 L1040 300 L1040 340 L1040 640 L560 640 Z"
        fill="#d4cbff"
        {...o}
      />
      <path d="M720 640 L720 520 Q800 430 880 520 L880 640 Z" fill="#b07a45" {...o} />
      <path d="M760 480 L760 640 M800 450 L800 640 M840 480 L840 640" {...o} strokeWidth={4} />
      <circle cx="650" cy="440" r="26" fill="#7a6cc2" {...o} strokeWidth={4} />
      <circle cx="950" cy="440" r="26" fill="#7a6cc2" {...o} strokeWidth={4} />
      {/* path */}
      <path d="M720 640 L880 640 L1060 900 L540 900 Z" fill="#efe2c8" />
      <path d="M700 700 L900 700 M660 770 L940 770 M610 840 L990 840" stroke="#d8c6a2" strokeWidth={6} />
      {/* bunting */}
      <path d="M0 40 Q400 160 800 60 Q1200 160 1600 40" fill="none" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 16 }, (_, i) => {
        const t = (i + 0.5) / 16;
        const x = t * 1600;
        // Follow the two quadratic curves of the string exactly.
        const u = t < 0.5 ? t * 2 : (t - 0.5) * 2;
        const [y0, y1] = t < 0.5 ? [40, 60] : [60, 40];
        const y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * 160 + u * u * y1;
        return (
          <path
            key={i}
            d={`M${x - 26} ${y} L${x + 26} ${y} L${x} ${y + 50} Z`}
            fill={bunting[i % bunting.length]}
            {...o}
            strokeWidth={4}
          />
        );
      })}
      {/* bushes */}
      <Blob fill="#4cbf56" circles={[[120, 690, 60], [200, 660, 70], [280, 700, 55]]} />
      <Blob fill="#4cbf56" circles={[[1320, 700, 55], [1400, 660, 70], [1480, 690, 60]]} />
      {[
        [170, 650],
        [240, 690],
        [1380, 650],
        [1440, 700],
        [120, 700],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={12} fill="#ff6b9e" {...o} strokeWidth={3} />
      ))}
    </g>
  );
}

export const SCENES: SceneDef[] = [
  { id: 'farm', label: 'Farm', art: Farm },
  { id: 'jungle', label: 'Jungle', art: Jungle },
  { id: 'castle', label: 'Castle', art: Castle },
];

