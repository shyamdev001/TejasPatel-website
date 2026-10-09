'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { tabKeys } from '@/lib/lock';
import { Split, Rise } from '../Reveal';

type Slide = { number: string; title: string; description: string[] };
type Props = { heading: string; lede: string; slides: Slide[] };

const isQuote = (s: string) => /^[“"]/.test(s.trim());
const EASE = [0.16, 1, 0.3, 1] as const;

// One drawn mark per chapter of the family story: the seed, the milk co-operative,
// the village home, the sun over the fields, the bank.
const ICONS = [
  <path key="a" d="M16 28V14M16 14c0-5 3-8 9-8 0 6-3 9-9 8ZM16 18c0-4-2.5-6.5-8-6.5 0 5 2.5 7.5 8 6.5ZM9 28h14" />,
  <path key="b" d="M11 10h10M12 10V6h8v4M11 10c-2 2-3 4-3 7v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9c0-3-1-5-3-7M8 18h16M13 22h6" />,
  <path key="c" d="M4 15 16 5l12 10M7 13v14h18V13M13 27v-8h6v8M4 27h24" />,
  <path key="d" d="M16 4v3M5.5 8.5l2 2M26.5 8.5l-2 2M3 18h3M26 18h3M9 18a7 7 0 0 1 14 0M3 23h26M7 28h18" />,
  <path key="e" d="M4 13 16 5l12 8M6 13h20M8 13v11M13 13v11M19 13v11M24 13v11M5 24h22M3 28h26" />,
];

/** Four generations of one family, told as five stops along a single furrow. */
export default function Legacy({ heading, lede, slides }: Props) {
  const [active, setActive] = useState(0);
  const last = slides.length - 1;

  return (
    <section className="field-green relative overflow-hidden">
      <div aria-hidden className="furrows absolute inset-0 opacity-50" />
      <div className="wrap relative py-[clamp(4rem,8vw,7.5rem)]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <Split as="h2" className="display d-2 text-mustard lg:col-span-7">
            {heading}
          </Split>
          <Rise as="p" className="lede text-white/90 lg:col-span-5">
            {lede}
          </Rise>
        </div>

        <Rise className="relative mt-[clamp(2.5rem,5vw,4.5rem)]">
          {/* the furrow: a faint line with a mustard run up to the chosen stop */}
          <div aria-hidden className="absolute inset-x-[10%] top-7 h-px bg-white/30 sm:top-8">
            <motion.div className="h-full origin-left bg-mustard" initial={false} animate={{ scaleX: last ? active / last : 0 }} transition={{ duration: 0.8, ease: EASE }} />
          </div>
          <div role="tablist" aria-label={heading} onKeyDown={tabKeys} className="relative grid" style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}>
            {slides.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.number}
                  type="button"
                  role="tab"
                  id={`legacy-tab-${i}`}
                  aria-selected={on}
                  aria-controls="legacy-panel"
                  aria-label={s.title}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className="group flex flex-col items-center gap-4 px-1 text-center"
                >
                  <span
                    className={`grid size-14 place-items-center rounded-full border transition-[background-color,border-color,color,scale] duration-500 ease-(--ease-plough) sm:size-16 ${
                      on ? 'scale-110 border-mustard bg-mustard text-ink' : i < active ? 'border-mustard bg-green text-mustard' : 'border-white/40 bg-green text-white group-hover:border-mustard group-hover:text-mustard'
                    }`}
                  >
                    <svg aria-hidden viewBox="0 0 32 32" className="size-7 sm:size-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {ICONS[i % ICONS.length]}
                    </svg>
                  </span>
                  <span aria-hidden className={`num text-lg font-bold transition-colors duration-500 sm:hidden ${on ? 'text-mustard' : 'text-white/80'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden className={`hidden max-w-[22ch] text-sm leading-snug transition-colors duration-500 sm:block lg:text-base ${on ? 'text-mustard' : 'text-white/85 group-hover:text-white'}`}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </Rise>

        {/* every chapter shares one cell, so the block is as tall as the longest and never jumps */}
        <div id="legacy-panel" role="tabpanel" aria-labelledby={`legacy-tab-${active}`} className="mt-[clamp(2.5rem,5vw,4rem)] grid border-t border-white/25 pt-[clamp(2rem,4vw,3rem)]">
          {slides.map((s, i) => {
            const on = i === active;
            const quote = s.description.find(isQuote);
            const paras = s.description.filter((d) => d.trim() && !isQuote(d));
            return (
              <motion.article
                key={s.number}
                aria-hidden={!on}
                className="col-start-1 row-start-1 grid gap-8 lg:grid-cols-12 lg:gap-10"
                initial={false}
                animate={on ? { opacity: 1, y: 0, filter: 'blur(0px)', visibility: 'visible' } : { opacity: 0, y: 18, filter: 'blur(6px)', transitionEnd: { visibility: 'hidden' } }}
                transition={{ duration: on ? 0.75 : 0.35, ease: EASE, delay: on ? 0.3 : 0 }}
              >
                <div className="flex items-start gap-5 lg:col-span-4 lg:flex-col lg:gap-4">
                  <p className="num text-[clamp(3.5rem,7vw,7rem)] font-bold leading-[0.8] text-mustard">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="display d-3">{s.title}</h3>
                </div>
                <div className="lg:col-span-8">
                  {quote && (
                    <p className="display mb-5 text-[clamp(1.125rem,1.6vw,1.5rem)] leading-[1.25] text-mustard" style={{ ['--wdth' as string]: 100 }}>
                      {quote}
                    </p>
                  )}
                  <div className="gap-10 text-white/90 md:columns-2">
                    {paras.map((p, k) => (
                      <p key={k} className="mb-4 break-inside-avoid-column">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
