'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, scroller } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/enter';

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    scroller.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      scroller.lenis = null;
    };
  }, []);
  return null;
}
