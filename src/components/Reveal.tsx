'use client';
import { useEffect, useRef, type ElementType } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { onEnter, prefersReducedMotion } from '@/lib/enter';
import { useLang } from './LangContext';

type Base = { as?: ElementType; className?: string; children: React.ReactNode; delay?: number; enter?: boolean };

/** Text that rises out of line masks. `enter` waits for the preloader / page wipe instead of scroll. */
export function Split({ as: Tag = 'div', className, children, delay = 0, enter, by = 'lines', stagger }: Base & { by?: 'lines' | 'words' | 'chars'; stagger?: number }) {
  const ref = useRef<HTMLElement>(null);
  const { lang } = useLang();
  // Gujarati conjuncts must not be split into single characters.
  const mode = by === 'chars' && lang === 'gu' ? 'words' : by;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let entered = !enter;
    let tween: gsap.core.Tween | null = null;
    const split = SplitText.create(el, {
      type: mode === 'lines' ? 'lines' : mode === 'words' ? 'lines,words' : 'lines,words,chars',
      mask: 'lines',
      linesClass: 'sl',
      autoSplit: true,
      onSplit: (self) => {
        const targets = mode === 'lines' ? self.lines : mode === 'words' ? self.words : self.chars;
        tween = gsap.from(targets, {
          yPercent: 115,
          duration: 1.2,
          delay,
          stagger: stagger ?? (mode === 'lines' ? 0.09 : mode === 'words' ? 0.04 : 0.025),
          paused: !entered,
          scrollTrigger: enter ? undefined : { trigger: el, start: 'top 90%', once: true },
        });
        return tween;
      },
    });
    const off = enter
      ? onEnter(() => {
          entered = true;
          tween?.play();
        })
      : () => {};
    return () => {
      off();
      split.revert();
    };
  }, [mode, delay, enter, stagger]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Block that lifts into place. */
export function Rise({ as: Tag = 'div', className, children, delay = 0, enter, y = 44 }: Base & { y?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.from(el, {
      y,
      autoAlpha: 0,
      duration: 1.3,
      delay,
      paused: !!enter,
      scrollTrigger: enter ? undefined : { trigger: el, start: 'top 92%', once: true },
    });
    const off = enter ? onEnter(() => tween.play()) : () => {};
    return () => {
      off();
      tween.revert();
    };
  }, [delay, enter, y]);
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Hairline that is ploughed from left to right. */
export function Rule({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.from(el, { scaleX: 0, duration: 1.6, delay, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
    return () => {
      tween.revert();
    };
  }, [delay]);
  return <div ref={ref} aria-hidden className={`rule ${className}`} />;
}

type WipeProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  parallax?: boolean;
  enter?: boolean;
  contain?: boolean;
  delay?: number;
};

/** Image that opens with a straight wipe, then drifts slower than the page. */
export function Wipe({ src, alt, className = '', sizes = '(min-width: 1024px) 50vw, 100vw', priority, parallax = true, enter, contain, delay = 0 }: WipeProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const inner = el?.firstElementChild;
    const cover = el?.lastElementChild;
    if (!el || !inner || !cover || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // Two passes of the plough: a green field opens first, then draws back off the photograph.
      const open = gsap
        .timeline({ paused: !!enter, delay, scrollTrigger: enter ? undefined : { trigger: el, start: 'top 88%', once: true } })
        .fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.95, ease: 'power4.inOut' })
        .fromTo(cover, { scaleX: 1 }, { scaleX: 0, duration: 1, ease: 'power4.inOut' }, 0.6)
        .from(inner, { scale: 1.35, duration: 2, ease: 'power3.out' }, 0.6);
      if (enter) onEnter(() => open.play());
      if (parallax && !contain) {
        gsap.fromTo(inner, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
    }, el);
    return () => ctx.revert();
  }, [enter, parallax, contain, delay]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div className={`absolute inset-x-0 ${parallax && !contain ? '-inset-y-[8%]' : 'inset-y-0'}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={contain ? 'object-contain' : 'object-cover'} />
      </div>
      <div aria-hidden className="absolute inset-0 origin-right scale-x-0 bg-green" />
    </div>
  );
}

/** Number whose digits roll into place, each in a fixed slot. */
export function Odometer({ value, className = '' }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cols = el.querySelectorAll<HTMLElement>('[data-digit]');
    if (prefersReducedMotion()) {
      cols.forEach((c) => (c.style.transform = `translateY(${-Number(c.dataset.digit) * 10}%)`));
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        cols.forEach((c, i) =>
          gsap.to(c, { yPercent: -Number(c.dataset.digit) * 10, duration: 2 + i * 0.25, ease: 'power4.out', delay: i * 0.06 }),
        ),
    });
    return () => st.kill();
  }, [value]);

  return (
    <span ref={ref} className={`num inline-flex overflow-hidden leading-none ${className}`}>
      <span className="sr-only">{value}</span>
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden">
            <span data-digit={ch} className="flex flex-col">
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="block h-[1em]">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
