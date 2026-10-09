'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { ScrollTrigger } from '@/lib/gsap';
import { lockScroll, tabKeys } from '@/lib/lock';
import { useLang } from './LangContext';

type Year = { year: string; total: number; images: string[] };
const RATIOS = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-square', 'aspect-[4/3]', 'aspect-[16/10]', 'aspect-[3/4]'];
const EASE = [0.76, 0, 0.24, 1] as const;

export default function GalleryWall({ years }: { years: Year[] }) {
  const { ui } = useLang();
  const [year, setYear] = useState(years[0]?.year);
  const [open, setOpen] = useState<number | null>(null);
  const current = years.find((y) => y.year === year) ?? years[0];
  const images = current?.images ?? [];

  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    const unlock = lockScroll();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', key);
    return () => {
      unlock();
      window.removeEventListener('keydown', key);
    };
  }, [open, step]);

  if (!current) return null;
  return (
    <section className="section bg-chalk">
      <div className="wrap">
        <div role="tablist" onKeyDown={tabKeys} className="flex flex-wrap gap-2">
          {years.map((y) => (
            <button
              key={y.year}
              type="button"
              role="tab"
              aria-selected={y.year === year}
              tabIndex={y.year === year ? 0 : -1}
              onClick={() => setYear(y.year)}
              className={`num flex items-baseline gap-3 border border-line px-5 py-3 text-2xl font-bold transition-colors duration-500 ${y.year === year ? 'bg-ink text-white' : 'hover:bg-leaf'}`}
            >
              {y.year}
              <span className="text-sm font-normal opacity-85">
                {y.total} {ui.photos}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false} onExitComplete={() => ScrollTrigger.refresh()}>
          <motion.ul key={year} className="mt-10 columns-2 gap-4 lg:columns-3" initial="hide" animate="show" exit={{ opacity: 0 }} variants={{ show: { transition: { staggerChildren: 0.03 } } }}>
            {images.map((src, i) => (
              <motion.li
                key={src}
                className="mb-4 break-inside-avoid"
                variants={{ hide: { clipPath: 'inset(0 0 100% 0)' }, show: { clipPath: 'inset(0 0 0% 0)' } }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <button type="button" onClick={() => setOpen(i)} data-cursor={ui.open} aria-label={`${ui.open} ${i + 1}`} className={`group relative block w-full overflow-hidden bg-leaf ${RATIOS[i % RATIOS.length]}`}>
                  <Image src={src} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover transition-transform duration-[1.2s] ease-(--ease-plough) group-hover:scale-105" />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ui.galleryTitle}
            className="fixed inset-0 z-[85] grid grid-rows-[auto_1fr_auto] bg-chalk"
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="wrap flex h-(--header-h) items-center justify-end">
              <button type="button" autoFocus onClick={() => setOpen(null)} className="label bg-ink px-4 py-3 text-white">
                {ui.close}
              </button>
            </div>
            <div className="relative mx-(--gutter)">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={open} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                  <Image src={images[open]} alt="" fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="wrap flex items-center justify-between py-5">
              <button type="button" onClick={() => step(-1)} className="label ulink" aria-label="Previous">
                ←
              </button>
              <p className="num text-lg">
                {String(open + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </p>
              <button type="button" onClick={() => step(1)} className="label ulink" aria-label="Next">
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
