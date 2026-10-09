'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { useLang } from '../LangContext';
import { Split } from '../Reveal';
import { tabKeys } from '@/lib/lock';

type Message = { name: string; designation: string; text: string; img: string; videoUrl?: string };
const EASE = [0.16, 1, 0.3, 1] as const;
const HOLD = 9000;

/** What national and state leaders have said, one voice at a time. */
export default function Leaders({ title, messages }: { title: string; messages: Message[] }) {
  const { ui } = useLang();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const running = inView && !paused;
  const m = messages[active];

  // Only turn the page while someone is actually looking at it.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % messages.length), HOLD);
    return () => window.clearTimeout(id);
  }, [active, running, messages.length]);

  return (
    <section
      ref={root}
      className="section field-leaf relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="wrap">
        <Split as="h2" className="display d-1 uppercase">
          {title}
        </Split>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative aspect-[4/5] max-h-[70svh] overflow-hidden bg-mustard lg:col-span-4">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ clipPath: 'inset(100% 0 0 0)' }}
                animate={{ clipPath: 'inset(0% 0 0 0)' }}
                exit={{ opacity: 0.99 }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
              >
                <Image src={m.img} alt={m.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover object-top" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-between gap-10 lg:col-span-8">
            {/* Every quote sits in the same cell, so the block keeps the height of the longest one and the page below never jumps. */}
            <div className="grid">
              {messages.map((x, i) => {
                const on = i === active;
                return (
                  <motion.figure
                    key={x.name}
                    aria-hidden={!on}
                    className="col-start-1 row-start-1"
                    initial={false}
                    animate={on ? { opacity: 1, y: 0, filter: 'blur(0px)', visibility: 'visible' } : { opacity: 0, y: -16, filter: 'blur(6px)', transitionEnd: { visibility: 'hidden' } }}
                    transition={{ duration: on ? 0.8 : 0.45, ease: EASE, delay: on ? 0.4 : 0 }}
                  >
                    <blockquote>
                      <p className="display text-[clamp(1.25rem,2.1vw,2rem)] leading-[1.28]" style={{ ['--wdth' as string]: 100, fontWeight: 500 }}>
                        “{x.text}”
                      </p>
                    </blockquote>
                    <figcaption className="mt-8">
                      <p className="display d-3">{x.name}</p>
                      <p className="mt-1 max-w-[52ch] text-ink/80">{x.designation}</p>
                      {x.videoUrl && (
                        <a href={x.videoUrl} target="_blank" rel="noreferrer" tabIndex={on ? undefined : -1} className="label ulink mt-4 inline-block">
                          {ui.watch} · YouTube
                        </a>
                      )}
                    </figcaption>
                  </motion.figure>
                );
              })}
            </div>

            <div role="tablist" aria-label={title} onKeyDown={tabKeys} className="grid grid-cols-2 gap-x-6 lg:grid-cols-4">
              {messages.map((x, i) => (
                <button key={x.name} type="button" role="tab" aria-selected={i === active} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} className="group relative py-4 text-left">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-ink/25" />
                  {i === active && (
                    <motion.span
                      aria-hidden
                      key={`${active}-${running}`}
                      className="absolute inset-x-0 top-0 h-0.5 origin-left bg-pin"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: running ? HOLD / 1000 : 0.4, ease: 'linear' }}
                    />
                  )}
                  <span className={`label block transition-opacity duration-300 ${i === active ? '' : 'opacity-75 group-hover:opacity-100'}`}>{x.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
