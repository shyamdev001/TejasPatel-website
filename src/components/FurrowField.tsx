'use client';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/enter';

type Props = { className?: string; color?: string; rows?: number };

/**
 * The ploughed field: furrow lines receding toward the horizon, swaying like
 * crop in wind and parting around the pointer.
 */
export default function FurrowField({ className = '', color = '20, 27, 77', rows = 34 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const still = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (still) draw(0);
    };

    const draw = (time: number) => {
      const t = time * 0.00035;
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      const step = w < 700 ? 22 : 18;
      const radius = Math.min(w, h) * 0.26;
      for (let i = 0; i < rows; i++) {
        const p = i / (rows - 1);
        // rows bunch near the top like furrows running to the horizon
        const base = h * (0.04 + 0.96 * Math.pow(p, 1.7));
        const amp = 2 + p * 9;
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          let y = base + Math.sin(x * 0.006 + t * 2 + i * 0.55) * amp + Math.sin(x * 0.0017 - t * 1.3 + i * 0.2) * amp * 1.4;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius * radius * 4) y += (dy >= 0 ? 1 : -1) * 46 * (0.4 + p) * Math.exp(-d2 / (radius * radius));
          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${color}, ${0.07 + p * 0.16})`;
        ctx.lineWidth = 0.6 + p * 0.9;
        ctx.stroke();
      }
    };

    const loop = (time: number) => {
      if (visible) draw(time);
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    if (!still) {
      window.addEventListener('pointermove', move, { passive: true });
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      io.disconnect();
      ro.disconnect();
    };
  }, [color, rows]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 size-full ${className}`} />;
}
