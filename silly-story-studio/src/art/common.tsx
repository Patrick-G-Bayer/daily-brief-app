/** Shared drawing helpers for the original placeholder artwork. */

export const INK = '#3a2e5c';
export const SW = 5;

export const line = {
  stroke: INK,
  strokeWidth: SW,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

export function Eye({ x, y, r = 13 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke={INK} strokeWidth={4} />
      <circle cx={x + r * 0.1} cy={y + r * 0.15} r={r * 0.56} fill={INK} />
      <circle cx={x + r * 0.3} cy={y - r * 0.12} r={r * 0.22} fill="#fff" />
    </g>
  );
}

export function Cheek({ x, y, r = 8 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill="#ff7aa8" opacity={0.45} />;
}

/** A circle with a scalloped, furry edge. */
export function fuzzyCircle(cx: number, cy: number, r: number, bumps = 26, depth = 7): string {
  let d = '';
  for (let i = 0; i <= bumps; i++) {
    const a = (i / bumps) * Math.PI * 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) {
      d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      const am = ((i - 0.5) / bumps) * Math.PI * 2;
      const qx = cx + Math.cos(am) * (r + depth);
      const qy = cy + Math.sin(am) * (r + depth);
      d += ` Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  return d + 'Z';
}

/** A star polygon path. */
export function starPath(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    d += `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)} `;
  }
  return d + 'Z';
}

/** Several circles drawn as one blob with a single outer outline (no inner seams). */
export function Blob({
  circles,
  fill,
  outline = SW,
}: {
  circles: [number, number, number][];
  fill: string;
  outline?: number;
}) {
  return (
    <g>
      {circles.map(([x, y, r], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={r + outline / 2} fill={INK} />
      ))}
      {circles.map(([x, y, r], i) => (
        <circle key={`f${i}`} cx={x} cy={y} r={r - outline / 2} fill={fill} />
      ))}
    </g>
  );
}
