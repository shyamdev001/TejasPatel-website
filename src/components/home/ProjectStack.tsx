'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, scroller } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/enter';
import type { Project } from '@/lib/content';
import { useLang } from '../LangContext';
import { TLink } from '../Transition';
import { Split, Rise } from '../Reveal';
import { Arrow } from '../Footer';

const GROUNDS = ['bg-paper', 'field-leaf', 'field-mustard', 'bg-paper', 'field-leaf'];

type Props = { title: string; projects: Project[]; more: string; total: number };

/** Projects laid over one another like adjoining plots; each new plot slides over the last. */
export default function ProjectStack({ title, projects, more, total }: Props) {
  const { ui } = useLang();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]');
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (next) {
          // only where the cards are sticky; on phones they are ordinary flow and must not shrink
          mm.add('(min-width: 1024px)', () => {
            gsap.to(card.firstElementChild, {
              scale: 0.93,
              ease: 'none',
              scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 12%', scrub: true },
            });
          });
        }
        gsap.fromTo(
          card.querySelector('[data-img]'),
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'power4.inOut', scrollTrigger: { trigger: card, start: 'top 75%', once: true } },
        );
      });
    }, el);
    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  // Keyboard: an earlier card lies under the later ones, so a focused link there would be invisible.
  // Bring that card back to its resting place first.
  const reveal = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.target.matches(':focus-visible') || !window.matchMedia('(min-width: 1024px)').matches) return;
    const card = e.currentTarget;
    const wrap = card.parentElement;
    if (!wrap) return;
    const before = [...wrap.children].slice(0, [...wrap.children].indexOf(card)).reduce((h, x) => h + (x as HTMLElement).offsetHeight, 0);
    const y = window.scrollY + wrap.getBoundingClientRect().top + before - (parseFloat(getComputedStyle(card).top) || 0);
    if (scroller.lenis) scroller.lenis.scrollTo(y, { duration: 0.7 });
    else window.scrollTo({ top: y });
  };

  return (
    <section className="section bg-chalk">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <Split as="h2" className="display d-1 uppercase">
          {title}
        </Split>
        <Rise>
          <TLink to="/projects" label={ui.nav.projects} className="btn btn-ghost label">
            {ui.allProjects}
            <span className="num">{String(total).padStart(2, '0')}</span>
          </TLink>
        </Rise>
      </div>

      <div ref={root} className="wrap mt-14">
        {projects.map((p, i) => (
          <div key={p.slug} data-card onFocus={reveal} className="pb-6 lg:sticky lg:top-[calc(var(--header-h)+0.5rem)]">
            <article className={`${GROUNDS[i % GROUNDS.length]} ticks grid origin-top border border-line lg:min-h-[72svh] lg:grid-cols-2`}>
              <TLink to={`/${p.slug}`} label={p.title} data-cursor={ui.view} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden lg:aspect-auto">
                <div data-img className="absolute inset-0">
                  <Image src={p.img} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-(--ease-plough) hover:scale-105" />
                </div>
              </TLink>
              <div className="flex flex-col justify-between gap-10 p-6 lg:p-12">
                <p className="num text-base">
                  {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </p>
                <div>
                  <h3 className="display d-2 uppercase">{p.title}</h3>
                  <p className="lede mt-5 max-w-[38ch]">{p.text}</p>
                  <TLink to={`/${p.slug}`} label={p.title} aria-label={`${more}: ${p.title}`} className="btn label mt-8">
                    {more}
                    <Arrow />
                  </TLink>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
