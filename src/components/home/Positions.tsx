'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, ScrollTrigger, scroller } from '@/lib/gsap';
import { tabKeys } from '@/lib/lock';
import { Split, Rule } from '../Reveal';

type Row = { text1: string; text2: string };
type Props = { title: string; tabs: { key: string; label: string; rows: Row[] }[] };

const EASE = [0.16, 1, 0.3, 1] as const;

// The source data is typed by hand: tidy stray spaces and year ranges, change no words.
const tidy = (s: string) =>
  s
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.)])/g, '$1')
    .replace(/(\d{4})\s*-\s*(\d{4})/g, '$1–$2')
    .trim();

/** Offices held, as a ledger: pick a role, read the institutions. */
export default function Positions({ title, tabs }: Props) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tab = tabs[active];

  // The lists differ a lot in length (11 rows to 1). Whenever the panel changes height,
  // everything below moves, so scroll-driven reveals further down are measured again.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    let last = el.offsetHeight;
    let call: gsap.core.Tween | null = null;
    const ro = new ResizeObserver(() => {
      if (el.offsetHeight === last) return;
      last = el.offsetHeight;
      call?.kill();
      call = gsap.delayedCall(0.25, () => ScrollTrigger.refresh());
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      call?.kill();
    };
  }, []);

  const select = (i: number, button: HTMLElement) => {
    if (i === active) return;
    setActive(i);
    // phones: keep the chosen tab in view in its scrolling row
    button.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    // deep in a long list, a shorter one would leave the reader stranded below the section: bring the list top back
    const top = panel.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 && root.current) {
      const y = window.scrollY + root.current.getBoundingClientRect().top;
      if (scroller.lenis) scroller.lenis.scrollTo(y, { duration: 0.9 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section ref={root} className="section bg-chalk">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Split as="h2" className="display d-2 uppercase">
              {title}
            </Split>
            <div role="tablist" aria-label={title} onKeyDown={tabKeys} className="no-scrollbar -mx-(--gutter) mt-10 flex gap-2 overflow-x-auto px-(--gutter) lg:mx-0 lg:flex-col lg:gap-0 lg:px-0">
              {tabs.map((t, i) => (
                <button
                  key={t.key}
                  role="tab"
                  type="button"
                  id={`pos-tab-${t.key}`}
                  aria-selected={i === active}
                  tabIndex={i === active ? 0 : -1}
                  aria-controls="pos-panel"
                  onClick={(e) => select(i, e.currentTarget)}
                  className={`label group flex shrink-0 items-center justify-between gap-4 border border-line px-4 py-3 text-left transition-colors duration-500 lg:border-x-0 lg:border-b-0 lg:px-0 lg:py-4 ${
                    i === active ? 'bg-ink text-white lg:bg-transparent lg:text-ink' : 'text-ink/75 hover:text-ink'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span aria-hidden className={`hidden size-2 rounded-full bg-pin transition-transform duration-500 lg:block ${i === active ? 'scale-100' : 'scale-0'}`} />
                    {t.label}
                  </span>
                  <span className="num text-base">{String(t.rows.length).padStart(2, '0')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={panel} id="pos-panel" role="tabpanel" aria-labelledby={`pos-tab-${tab.key}`} className="min-w-0 lg:col-span-8">
          <Rule />
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul key={tab.key} initial="hide" animate="show" exit="out" variants={{ show: { transition: { staggerChildren: 0.04 } }, hide: {}, out: {} }}>
              {tab.rows.map((r, i) => (
                <motion.li
                  key={i}
                  variants={{
                    hide: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
                    // leaving is quick and all at once; only the arrival is staggered
                    out: { opacity: 0, transition: { duration: 0.2 } },
                  }}
                  className="group relative border-b border-line"
                >
                  <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-mustard transition-transform duration-500 ease-(--ease-plough) group-hover:scale-y-100" />
                  <div className="relative grid gap-1 py-5 transition-transform duration-500 ease-(--ease-plough) group-hover:translate-x-4 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8 md:py-6">
                    <h3 className="display text-[clamp(1.125rem,1.7vw,1.5rem)] leading-[1.2]" style={{ ['--wdth' as string]: 100 }}>
                      {tidy(r.text1)}
                    </h3>
                    <p className="num text-base text-ink/75 md:pr-8 md:text-right">{tidy(r.text2)}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
