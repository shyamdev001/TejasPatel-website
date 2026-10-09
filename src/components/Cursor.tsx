'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from '@/lib/gsap';

// Survey-pin cursor: a dot with a slower ring in tow; over [data-cursor] targets the dot swells into a labelled disc.
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const state = useRef('');
  const pathname = usePathname();

  // The element under the pointer is gone after a page change; fall back to the plain pin.
  useEffect(() => {
    state.current = '';
    gsap.to(disc.current, { scale: 1, duration: 0.4, overwrite: true });
    gsap.to(ring.current, { scale: 1, opacity: 0.5, duration: 0.4, overwrite: true });
    gsap.to(text.current, { autoAlpha: 0, duration: 0.2, overwrite: true });
  }, [pathname]);

  useEffect(() => {
    const el = root.current;
    const tr = trail.current;
    if (!el || !tr || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.documentElement.classList.add('has-cursor');
    const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
    const tx = gsap.quickTo(tr, 'x', { duration: 0.9, ease: 'power3' });
    const ty = gsap.quickTo(tr, 'y', { duration: 0.9, ease: 'power3' });
    let shown = false;
    const move = (e: MouseEvent) => {
      x(e.clientX);
      y(e.clientY);
      tx(e.clientX);
      ty(e.clientY);
      if (!shown) {
        shown = true;
        gsap.to([el, tr], { autoAlpha: 1, duration: 0.3 });
      }
      const t = e.target as Element | null;
      const labelled = t?.closest?.('[data-cursor]') as HTMLElement | null;
      const label = labelled?.dataset.cursor ?? '';
      const link = !label && !!t?.closest?.('a,button,[role="button"],input,textarea,select,label');
      const next = label ? `l:${label}` : link ? 'link' : '';
      if (next === state.current) return;
      state.current = next;
      if (text.current && label) text.current.textContent = label;
      gsap.to(disc.current, { scale: label ? 5.4 : link ? 0.4 : 1, duration: 0.5, overwrite: true });
      gsap.to(ring.current, { scale: label ? 0 : link ? 1.7 : 1, opacity: label ? 0 : link ? 0.9 : 0.5, duration: 0.5, overwrite: true });
      gsap.to(text.current, { autoAlpha: label ? 1 : 0, duration: 0.25, overwrite: true });
    };
    const press = (down: boolean) => () => gsap.to(ring.current, { scale: down ? 0.7 : state.current === 'link' ? 1.7 : 1, duration: 0.3, overwrite: true });
    const down = press(true);
    const up = press(false);
    const leave = () => {
      shown = false;
      gsap.to([el, tr], { autoAlpha: 0, duration: 0.3 });
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    document.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      document.removeEventListener('mouseleave', leave);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={trail} aria-hidden className="pointer-events-none invisible fixed left-0 top-0 z-[94] opacity-0">
        <div ref={ring} className="absolute -left-5 -top-5 size-10 rounded-full border border-pin opacity-50" />
      </div>
      <div ref={root} aria-hidden className="pointer-events-none invisible fixed left-0 top-0 z-[95] opacity-0">
        <div ref={disc} className="absolute -left-2 -top-2 size-4 rounded-full bg-pin" />
        <span
          ref={text}
          className="label invisible absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-ink opacity-0"
        />
      </div>
    </>
  );
}
