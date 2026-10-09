'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, scroller } from '@/lib/gsap';
import Magnetic from './Magnetic';

const R = 21;
const C = 2 * Math.PI * R;

/** How far down the field you are, as a ring; press to walk back to the top. */
export default function ScrollTop({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = root.current;
    const circle = ring.current;
    if (!el || !circle) return;
    let shown = false;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        circle.style.strokeDashoffset = String(C * (1 - self.progress));
        const show = self.scroll() > window.innerHeight * 0.7;
        if (show !== shown) {
          shown = show;
          gsap.to(el, { autoAlpha: show ? 1 : 0, y: show ? 0 : 16, duration: 0.5, ease: 'power3.out', overwrite: true });
        }
      },
    });
    return () => st.kill();
  }, []);

  const top = () => {
    if (scroller.lenis) scroller.lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={root} className="invisible fixed bottom-4 right-3 z-[60] translate-y-4 opacity-0 lg:bottom-5 lg:right-[max(0.25rem,calc((var(--gutter)-3rem)/2))]">
      <Magnetic strength={0.4}>
        <button type="button" onClick={top} aria-label={label} className="group relative grid size-12 place-items-center rounded-full bg-paper text-ink shadow-[0_6px_24px_-8px_rgb(20_27_77/0.45)]">
          <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
            <circle cx="24" cy="24" r={R} fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="2" />
            <circle ref={ring} cx="24" cy="24" r={R} fill="none" stroke="var(--color-pin)" strokeWidth="2" strokeDasharray={C} strokeDashoffset={C} />
          </svg>
          <svg aria-hidden width="12" height="14" viewBox="0 0 12 14" fill="none" className="transition-transform duration-500 ease-(--ease-plough) group-hover:-translate-y-0.5">
            <path d="M6 14V2M1 7l5-5 5 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </Magnetic>
    </div>
  );
}
