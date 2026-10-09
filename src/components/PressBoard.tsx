'use client';
import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import type { Article } from '@/lib/content';
import { ScrollTrigger } from '@/lib/gsap';
import { tabKeys } from '@/lib/lock';
import { useLang } from './LangContext';

type Video = { id: number; year: string; url: string; title: string };
type Props = { groups: { key: string; label: string; articles: Article[] }[]; videos: Video[]; videosLabel: string; videoLabel: string };

const EASE = [0.16, 1, 0.3, 1] as const;
const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

export default function PressBoard({ groups, videos, videosLabel, videoLabel }: Props) {
  const { ui } = useLang();
  const tabs = [...groups.filter((g) => g.articles.length).map((g) => ({ key: g.key, label: g.label, count: g.articles.length })), ...(videos.length ? [{ key: 'videos', label: videosLabel, count: videos.length }] : [])];
  const [tab, setTab] = useState(tabs[0]?.key);
  const [open, setOpen] = useState<number | null>(null);
  const group = groups.find((g) => g.key === tab);
  const refresh = () => ScrollTrigger.refresh();

  return (
    <section className="section field-paper">
      <div className="wrap">
        <div role="tablist" onKeyDown={tabKeys} className="no-scrollbar -mx-(--gutter) flex gap-2 overflow-x-auto px-(--gutter)">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === tab}
              tabIndex={t.key === tab ? 0 : -1}
              onClick={() => {
                setTab(t.key);
                setOpen(null);
              }}
              className={`label flex shrink-0 items-center gap-3 border border-line px-5 py-3 transition-colors duration-500 ${t.key === tab ? 'bg-ink text-white' : 'hover:bg-leaf'}`}
            >
              {t.label}
              <span className="num text-base">{String(t.count).padStart(2, '0')}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false} onExitComplete={refresh}>
          <motion.div key={tab} role="tabpanel" className="mt-10 border-t border-line" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: EASE }}>
            {group ? (
              <ul>
                {group.articles.map((a) => {
                  const isOpen = open === a.id;
                  return (
                    <li key={a.id} className="border-b border-line">
                      <h2>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`art-${a.id}`}
                          onClick={() => setOpen(isOpen ? null : a.id)}
                          data-cursor={isOpen ? ui.close : ui.read}
                          className="group grid w-full grid-cols-[3.5rem_1fr_1.5rem] items-baseline gap-4 py-6 text-left md:grid-cols-[6rem_1fr_2rem] md:gap-8"
                        >
                          <span className="num text-xl font-bold md:text-2xl">{a.year}</span>
                          <span className="display text-[clamp(1.125rem,1.9vw,1.75rem)] leading-[1.2] transition-transform duration-500 ease-(--ease-plough) md:group-hover:translate-x-3" style={{ ['--wdth' as string]: 100 }}>
                            {a.title}
                          </span>
                          <span aria-hidden className="relative block size-4 self-center justify-self-end">
                            <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                            <span className={`absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-500 ease-(--ease-plough) ${isOpen ? 'scale-y-0' : ''}`} />
                          </span>
                        </button>
                      </h2>
                      <AnimatePresence initial={false} onExitComplete={refresh}>
                        {isOpen && (
                          <motion.div id={`art-${a.id}`} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.8, ease: EASE }} onAnimationComplete={refresh} className="overflow-hidden">
                            <div className="grid gap-8 pb-10 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1.1fr)] md:gap-8">
                              <span className="hidden md:block" />
                              <div className="relative aspect-[4/3] self-start overflow-hidden bg-leaf">
                                <Image src={a.image} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-contain" />
                              </div>
                              <div className="prose-body grid content-start gap-4">
                                {a.body.split('\n').filter(Boolean).map((p, i) => (
                                  <p key={i}>{p}</p>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="grid gap-x-10 md:grid-cols-2">
                {videos.map((v, i) => (
                  <li key={v.id} className="border-b border-line">
                    <a href={v.url} target="_blank" rel="noreferrer" data-cursor={ui.watch} className="group flex items-center justify-between gap-6 py-6">
                      <span className="flex items-baseline gap-5">
                        <span className="num text-xl font-bold">{v.year}</span>
                        <span className="text-lg">{v.title || `${videoLabel} ${String(i + 1).padStart(2, '0')}`}</span>
                      </span>
                      <span className="label text-ink/70 transition-transform duration-500 ease-(--ease-plough) group-hover:translate-x-2">{host(v.url)} ↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
