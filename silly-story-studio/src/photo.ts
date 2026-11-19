/** Turning photos into puppets and backdrops, entirely on the device. */

export type Pt = [number, number];

/** Loads a photo (respecting camera orientation) into a canvas no bigger than `maxSide`. */
export async function loadPhoto(file: File, maxSide = 1600): Promise<HTMLCanvasElement> {
  let src: CanvasImageSource & { width: number; height: number };
  let cleanup = () => {};
  try {
    const bmp = await createImageBitmap(file);
    src = bmp;
    cleanup = () => bmp.close();
  } catch {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    src = img;
    cleanup = () => URL.revokeObjectURL(url);
  }
  const k = Math.min(1, maxSide / Math.max(src.width, src.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(src.width * k));
  c.height = Math.max(1, Math.round(src.height * k));
  c.getContext('2d')!.drawImage(src, 0, 0, c.width, c.height);
  cleanup();
  return c;
}

/** Crops a photo to fill the 16:9 stage. */
export function makeBackdrop(img: HTMLCanvasElement): { src: string; w: number; h: number } {
  const W = 1600;
  const H = 900;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const k = Math.max(W / img.width, H / img.height);
  const w = img.width * k;
  const h = img.height * k;
  c.getContext('2d')!.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  return { src: c.toDataURL('image/jpeg', 0.85), w: W, h: H };
}

export function pathBounds(pts: Pt[]) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

export function tracePath(ctx: CanvasRenderingContext2D, pts: Pt[], close: boolean) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  if (close) ctx.closePath();
}

/**
 * Cuts out the traced shape as a sticker-style puppet (white border, dark edge).
 * `pts` are in the photo's pixel coordinates.
 */
export function makeCutout(img: HTMLCanvasElement, pts: Pt[]): { src: string; w: number; h: number } {
  const b = pathBounds(pts);
  const MAX = 640;
  const k = Math.min(1, MAX / Math.max(b.w, b.h));
  const pad = 10;
  const w = Math.ceil(b.w * k + pad * 2);
  const h = Math.ceil(b.h * k + pad * 2);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.translate(pad, pad);
  ctx.scale(k, k);
  ctx.translate(-b.x0, -b.y0);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  tracePath(ctx, pts, true);
  ctx.strokeStyle = '#3a2e5c';
  ctx.lineWidth = 16 / k;
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10 / k;
  ctx.stroke();
  ctx.save();
  tracePath(ctx, pts, true);
  ctx.clip();
  ctx.drawImage(img, 0, 0);
  ctx.restore();
  let src = c.toDataURL('image/webp', 0.9);
  if (!src.startsWith('data:image/webp')) src = c.toDataURL('image/png');
  return { src, w, h };
}
