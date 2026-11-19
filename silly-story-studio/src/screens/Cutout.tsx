import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { CheckIcon, CloseIcon, RestartIcon, TraceHintIcon } from '../components/Icons';
import { loadPhoto, makeCutout, pathBounds, tracePath, type Pt } from '../photo';

type Phase = 'loading' | 'trace' | 'review' | 'error';

/**
 * Make a photo puppet: trace around someone with a finger (a green line shows
 * the cut), check it, and keep it.
 */
export function Cutout({
  file,
  onDone,
  onCancel,
}: {
  file: File;
  onDone: (cut: { src: string; w: number; h: number }) => void;
  onCancel: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [touched, setTouched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLCanvasElement | null>(null);
  const pts = useRef<Pt[]>([]);
  const view = useRef({ k: 1, ox: 0, oy: 0, dpr: 1 });
  const drawing = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const redraw = () => {
    const c = canvasRef.current;
    const im = img.current;
    if (!c || !im) return;
    const ctx = c.getContext('2d')!;
    const { k, ox, oy, dpr } = view.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
    ctx.drawImage(im, 0, 0);
    const p = pts.current;
    if (p.length < 2) return;
    const closed = phaseRef.current === 'review';
    if (closed) {
      // Dim everything outside the cut.
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, im.width, im.height);
      tracePath(ctx, p, true);
      ctx.fillStyle = 'rgba(20, 14, 40, 0.65)';
      ctx.fill('evenodd');
      ctx.restore();
    }
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    tracePath(ctx, p, closed);
    ctx.strokeStyle = 'rgba(0, 40, 10, 0.6)';
    ctx.lineWidth = 9 / k;
    ctx.stroke();
    ctx.strokeStyle = '#3dff7a';
    ctx.lineWidth = 5 / k;
    ctx.stroke();
  };

  const layout = () => {
    const c = canvasRef.current;
    const wrap = wrapRef.current;
    const im = img.current;
    if (!c || !wrap || !im) return;
    const r = wrap.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
    const k = Math.min(r.width / im.width, r.height / im.height);
    view.current = { k, ox: (r.width - im.width * k) / 2, oy: (r.height - im.height * k) / 2, dpr };
    redraw();
  };

  useEffect(() => {
    let alive = true;
    loadPhoto(file)
      .then((c) => {
        if (!alive) return;
        img.current = c;
        setPhase('trace');
        requestAnimationFrame(layout);
      })
      .catch(() => alive && setPhase('error'));
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
    };
  }, [file]);

  useEffect(redraw, [phase]);

  const toImage = (e: RPointerEvent): Pt => {
    const r = canvasRef.current!.getBoundingClientRect();
    const { k, ox, oy } = view.current;
    const im = img.current!;
    const x = Math.min(im.width, Math.max(0, (e.clientX - r.left - ox) / k));
    const y = Math.min(im.height, Math.max(0, (e.clientY - r.top - oy) / k));
    return [x, y];
  };

  const finishTrace = () => {
    drawing.current = null;
    const b = pathBounds(pts.current);
    const im = img.current!;
    const minSide = Math.min(im.width, im.height) * 0.06;
    if (pts.current.length < 8 || b.w < minSide || b.h < minSide) {
      // Too small to be a puppet: start again.
      pts.current = [];
      redraw();
      return;
    }
    setPhase('review');
  };

  return (
    <div className="cutout">
      <div
        ref={wrapRef}
        className="cutout-canvas-wrap"
        onPointerDown={(e) => {
          if (phase !== 'trace' || drawing.current !== null) return;
          drawing.current = e.pointerId;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          setTouched(true);
          pts.current = [toImage(e)];
          redraw();
        }}
        onPointerMove={(e) => {
          if (drawing.current !== e.pointerId) return;
          const p = toImage(e);
          const last = pts.current[pts.current.length - 1];
          if (Math.hypot(p[0] - last[0], p[1] - last[1]) * view.current.k < 3) return;
          pts.current.push(p);
          redraw();
        }}
        onPointerUp={(e) => drawing.current === e.pointerId && finishTrace()}
        onPointerCancel={(e) => drawing.current === e.pointerId && finishTrace()}
      >
        <canvas ref={canvasRef} />
        {phase === 'trace' && !touched && (
          <div className="trace-hint" aria-hidden="true">
            <TraceHintIcon />
          </div>
        )}
        {phase === 'loading' && <div className="cutout-msg">…</div>}
        {phase === 'error' && <div className="cutout-msg">That picture couldn’t be opened. Try another one.</div>}
      </div>

      <div className="cutout-bar">
        <button type="button" className="round-btn close-btn" aria-label="Cancel" onClick={onCancel}>
          <CloseIcon />
        </button>
        <p className="cutout-tip">Grown-ups: trace around the person, pet or toy with one finger.</p>
        {phase === 'review' && (
          <>
            <button
              type="button"
              className="round-btn restart-btn"
              aria-label="Trace again"
              onClick={() => {
                pts.current = [];
                setPhase('trace');
              }}
            >
              <RestartIcon />
            </button>
            <button
              type="button"
              className="round-btn ok-btn"
              aria-label="Keep this puppet"
              onClick={() => img.current && onDone(makeCutout(img.current, pts.current))}
            >
              <CheckIcon />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
