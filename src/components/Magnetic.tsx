'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * strength);
      y((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const out = () => {
      x(0);
      y(0);
    };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', out);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', out);
    };
  }, [strength]);
  return (
    <span ref={ref} className={`inline-block ${className ?? ''}`}>
      {children}
    </span>
  );
}
