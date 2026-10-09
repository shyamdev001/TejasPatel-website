'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { lockScroll } from '@/lib/lock';
import { release, prefersReducedMotion } from '@/lib/enter';
import { useLang } from './LangContext';

const MAX_WAIT = 6000;

// Resolves when the type and the above-the-fold photographs are ready, so the
// field never lifts on a half-loaded page.
const pageReady = () => {
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const images = [...document.querySelectorAll<HTMLImageElement>('main img')]
    .filter((img) => img.loading !== 'lazy')
    .map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener('load', () => res(), { once: true });
            img.addEventListener('error', () => res(), { once: true });
          }),
    );
  const cap = new Promise<void>((res) => window.setTimeout(res, MAX_WAIT));
  return Promise.race([Promise.all([fonts, ...images]).then(() => undefined), cap]);
};

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);
  const { ui } = useLang();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setDone(true);
      release();
      return;
    }
    let alive = true;
    const unlock = lockScroll();
    const n = { v: 0 };
    const paint = () => {
      if (count.current) count.current.textContent = String(Math.round(n.v)).padStart(3, '0');
    };
    const ctx = gsap.context(() => {
      // Arrive: furrows are drawn, the name rises, the count climbs and waits short of full.
      const intro = gsap
        .timeline()
        .fromTo('[data-row]', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.inOut', stagger: 0.028 }, 0)
        // the CSS start state reads back as a pixel offset, so y is zeroed explicitly
        .fromTo('[data-word]', { yPercent: 120, y: 0 }, { yPercent: 0, y: 0, duration: 1.1, stagger: 0.09 }, 0.1)
        .fromTo('[data-count]', { yPercent: 120, y: 0 }, { yPercent: 0, y: 0, duration: 1.1 }, 0.1)
        .to(n, { v: 86, duration: 1.7, ease: 'power2.out', onUpdate: paint }, 0.1);

      // Leave: only once the page is really ready.
      Promise.all([pageReady(), intro.then()]).then(() => {
        if (!alive) return;
        ctx.add(() => {
          gsap
            .timeline({
              onComplete: () => {
                unlock();
                setDone(true);
              },
            })
            .to(n, { v: 100, duration: 0.5, ease: 'power2.inOut', onUpdate: paint })
            .to('[data-word], [data-count]', { yPercent: -120, duration: 0.75, ease: 'power3.in', stagger: 0.04 }, '+=0.15')
            .to('[data-row]', { scaleX: 0, transformOrigin: 'right center', duration: 0.7, ease: 'power3.in', stagger: 0.015 }, '<')
            .add(release, '>-0.1')
            .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut' }, '>-0.25');
        });
      });
    }, el);
    return () => {
      alive = false;
      ctx.revert();
      unlock();
    };
  }, []);

  if (done) return null;
  return (
    <div
      ref={root}
      role="status"
      aria-label={`${ui.honorific} ${ui.first} ${ui.last}`}
      className="preloader fixed inset-0 z-[100] flex flex-col justify-between bg-mustard text-ink"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div aria-hidden className="absolute inset-0 flex flex-col justify-between py-[6vh]">
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} data-row className="pre-row block h-px bg-ink/25" />
        ))}
      </div>
      <div aria-hidden className="wrap relative flex items-start justify-between pt-8">
        <span className="overflow-hidden">
          <span data-word className="pre-word label block">
            {ui.honorific}
          </span>
        </span>
        <span className="overflow-hidden">
          <span data-word className="pre-word label block">
            {ui.place}
          </span>
        </span>
      </div>
      <div aria-hidden className="wrap relative flex items-end justify-between gap-6 pb-8">
        <div className="display d-1 uppercase">
          <span className="block overflow-hidden py-[0.08em]">
            <span data-word className="pre-word block">
              {ui.first}
            </span>
          </span>
          <span className="block overflow-hidden py-[0.08em]">
            <span data-word className="pre-word block">
              {ui.last}
            </span>
          </span>
        </div>
        <span className="overflow-hidden">
          <span ref={count} data-count className="pre-word num block text-[clamp(3rem,9vw,8rem)] font-bold leading-none">
            000
          </span>
        </span>
      </div>
    </div>
  );
}
