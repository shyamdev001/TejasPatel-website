'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/enter';
import { Rule } from './Reveal';

export type Award = { id: string; year: string; title: string; recipient: string; organization: string; image: string };

/** Awards as an index: the photograph follows the pointer down the list. */
export default function AwardIndex({ awards, as: Heading = 'h3' }: { awards: Award[]; as?: 'h2' | 'h3' }) {
  const root = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = root.current;
    const f = float.current;
    if (!el || !f || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const x = gsap.quickTo(f, 'x', { duration: 0.7, ease: 'power3' });
    const y = gsap.quickTo(f, 'y', { duration: 0.7, ease: 'power3' });
    const move = (e: MouseEvent) => {
      x(e.clientX);
      y(e.clientY);
    };
    el.addEventListener('mousemove', move);
    return () => el.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    const els = root.current?.querySelectorAll('[data-row]');
    if (!els?.length || prefersReducedMotion()) return;
    const tween = gsap.from(els, { y: 36, autoAlpha: 0, duration: 1, stagger: 0.05, scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
    return () => {
      tween.revert();
    };
  }, [awards]);

  return (
    <div ref={root} onMouseLeave={() => setActive(-1)}>
      <Rule />
      <ul>
        {awards.map((a, i) => (
          <li key={i} data-row onMouseEnter={() => setActive(i)} className="group relative border-b border-line">
            <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-leaf transition-transform duration-700 ease-(--ease-plough) group-hover:scale-x-100" />
            <div className="relative grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-2 py-5 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1.2fr)] md:gap-x-8 md:py-6">
              <p className="num text-2xl font-bold md:text-3xl">{a.year}</p>
              <Heading className="display text-[clamp(1.125rem,1.8vw,1.625rem)] leading-[1.15] transition-transform duration-500 ease-(--ease-plough) md:group-hover:translate-x-3" style={{ ['--wdth' as string]: 100 }}>
                {a.title.trim()}
              </Heading>
              <p className="col-start-2 text-ink/80 md:col-start-3">
                {a.recipient.trim()}
                <span className="mt-1 block text-sm text-ink/75">{a.organization}</span>
              </p>
              {a.image && (
                <div className="relative col-span-2 aspect-[16/10] overflow-hidden bg-paper md:col-span-3 md:max-w-xl md:[@media(hover:hover)]:hidden">
                  <Image src={a.image} alt="" fill sizes="100vw" className="object-contain" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div ref={float} aria-hidden className="pointer-events-none fixed left-0 top-0 z-40 hidden md:[@media(hover:hover)]:block">
        <div
          className="relative h-[17rem] w-[23rem] -translate-y-1/2 translate-x-8 overflow-hidden bg-mustard transition-[clip-path] duration-700 ease-(--ease-plough)"
          style={{ clipPath: active >= 0 && awards[active]?.image ? 'inset(0 0 0 0)' : 'inset(50% 0 50% 0)' }}
        >
          {awards.map((a, i) =>
            a.image ? (
              <Image
                key={i}
                src={a.image}
                alt=""
                fill
                sizes="23rem"
                loading="lazy"
                className={`object-contain p-3 transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-0'}`}
              />
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
