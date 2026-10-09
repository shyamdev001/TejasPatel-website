'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, SplitText } from '@/lib/gsap';
import { onEnter, prefersReducedMotion } from '@/lib/enter';
import { useLang } from '../LangContext';
import { TLink } from '../Transition';
import FurrowField from '../FurrowField';
import Magnetic from '../Magnetic';
import { Arrow } from '../Footer';

type Props = { roles: string[]; intro: string; cta: string; cta2: string; portrait: string };

export default function Hero({ roles, intro, cta, cta2, portrait }: Props) {
  const { lang, ui } = useLang();
  const root = useRef<HTMLElement>(null);
  const [role, setRole] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setRole((r) => (r + 1) % roles.length), 2600);
    return () => window.clearInterval(id);
  }, [roles.length]);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const names = gsap.utils.toArray<HTMLElement>('[data-name]');
      // Latin letters rise one by one; Gujarati words stay whole so conjuncts hold together.
      const pieces = lang === 'en' ? names.flatMap((n) => SplitText.create(n, { type: 'chars' }).chars) : names;
      const tl = gsap
        .timeline({ paused: true })
        .from('[data-plot]', { scaleY: 0, duration: 1.5, ease: 'power4.inOut' }, 0)
        .from(pieces, { yPercent: 118, duration: 1.4, stagger: 0.045 }, 0.1)
        .fromTo('[data-title]', { '--wdth': 76 }, { '--wdth': 118, duration: 2.1, ease: 'power3.out' }, 0.1)
        .from('[data-portrait]', { yPercent: 9, autoAlpha: 0, duration: 1.6 }, 0.35)
        .from('[data-info] > *', { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 0.8);
      onEnter(() => tl.play());

      // Scrolling away: the name parts along the furrows and the plot rises.
      const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('[data-first]', { xPercent: -14, ease: 'none', scrollTrigger: st });
      gsap.to('[data-last]', { xPercent: 14, ease: 'none', scrollTrigger: st });
      gsap.to('[data-portrait-wrap]', { yPercent: 6, scale: 1.05, ease: 'none', scrollTrigger: st });
    }, el);

    // Depth on the pointer: the portrait leans toward it, the plot and the name lean away.
    const layers: [string, number][] = [
      ['[data-portrait]', 16],
      ['[data-plot]', -10],
      ['[data-name]', -22],
    ];
    const movers = layers.map(([sel, amount]) => {
      const targets = el.querySelectorAll(sel);
      return { amount, x: gsap.quickTo(targets, 'x', { duration: 1.1, ease: 'power3' }), y: gsap.quickTo(targets, 'y', { duration: 1.1, ease: 'power3' }) };
    });
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const move = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => {
        m.x(nx * m.amount);
        m.y(ny * m.amount * 0.5);
      });
    };
    if (fine) el.addEventListener('mousemove', move);
    return () => {
      el.removeEventListener('mousemove', move);
      ctx.revert();
    };
  }, [lang]);

  return (
    <section ref={root} className="relative overflow-hidden bg-chalk">
      <div className="relative h-[86svh] min-h-[34rem] lg:h-[min(100svh,82.6vw)]">
        <FurrowField />
        <div data-plot className="absolute bottom-0 left-1/2 h-[58%] w-[min(62vw,calc(max(34rem,86svh)*0.334))] max-w-[34rem] origin-bottom -translate-x-1/2 bg-mustard lg:h-[64%] lg:w-[min(30vw,48svh)]" />

        <h1 data-title className="display d-hero pointer-events-none absolute inset-0 uppercase" aria-label={`${ui.honorific} ${ui.first} ${ui.last}`}>
          <span aria-hidden className="wrap absolute inset-x-0 top-[calc(var(--header-h)+1.5vh)] block overflow-hidden py-[0.07em] lg:top-[calc(var(--header-h)+2vh)]">
            <span data-first className="block">
              <span data-name className="inline-block">
                {ui.first}
              </span>
            </span>
          </span>
        </h1>

        <div data-portrait-wrap className="absolute bottom-0 left-1/2 h-[66%] w-[min(92vw,60svh)] origin-bottom -translate-x-1/2 lg:h-[88%] lg:w-[min(46vw,58svh)]">
          <div data-portrait className="relative size-full">
            <Image src={portrait} alt={`${ui.honorific} ${ui.first} ${ui.last}`} fill priority sizes="(min-width: 1024px) 46vw, 92vw" className="object-contain object-bottom" />
          </div>
        </div>
        <div data-title aria-hidden className="display d-hero pointer-events-none absolute inset-0 z-10 uppercase">
          <span aria-hidden className="wrap absolute inset-x-0 bottom-[3%] block overflow-hidden py-[0.07em] text-right lg:bottom-[4%]">
            <span data-last className="block">
              <span data-name className="inline-block">
                {ui.last}
              </span>
            </span>
          </span>
        </div>
      </div>

      <div data-info className="wrap relative grid gap-8 border-t border-line bg-chalk py-8 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-0 z-20 lg:grid-cols-[minmax(0,min(24rem,calc(50vw-min(23vw,28svh)-var(--gutter)-0.5rem)))_1fr] lg:items-end lg:border-0 lg:bg-transparent lg:pb-9">
        <div className="lg:pointer-events-auto">
          <p className="label flex items-center gap-3">
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-pin" />
            <span className="relative block h-[1.5em] flex-1 overflow-hidden leading-[1.5]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={role}
                  className="absolute inset-0 block"
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-100%' }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {roles[role]}
                </motion.span>
              </AnimatePresence>
            </span>
          </p>
          <p className="mt-4 text-pretty">{intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Magnetic>
              <TLink to="/about" label={ui.nav.about} className="btn label">
                {cta}
                <Arrow />
              </TLink>
            </Magnetic>
            <TLink to="/projects" label={ui.nav.projects} className="btn btn-ghost label">
              {cta2}
            </TLink>
          </div>
        </div>
        <div className="label flex items-center justify-between gap-6 lg:absolute lg:right-(--gutter) lg:bottom-[calc(4svh+17.5vw)] lg:flex-col lg:items-end lg:gap-2">
          <span>{ui.tagline}</span>
          <span className="opacity-80">{ui.place}</span>
          <span className="hidden items-center gap-3 pt-2 lg:flex">
            {ui.scroll}
            <span aria-hidden className="scroll-cue block h-px w-14 bg-ink/25" />
          </span>
        </div>
      </div>
    </section>
  );
}
