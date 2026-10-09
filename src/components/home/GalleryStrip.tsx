'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, scroller } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/enter';
import { useLang } from '../LangContext';
import { TLink } from '../Transition';
import { Split, Rise } from '../Reveal';
import { Arrow } from '../Footer';

type Item = { image: string; title: string };

/** Two rows of photographs drifting against each other; scrolling pushes them faster. */
export default function GalleryStrip({ title, more, items }: { title: string; more: string; items: Item[] }) {
  const { ui } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half)].filter((r) => r.length);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const tracks = [...el.querySelectorAll<HTMLElement>('[data-track]')];
    const pos = tracks.map(() => 0);
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const tick = () => {
      if (!visible) return;
      const v = Math.min(Math.abs(scroller.lenis?.velocity ?? 0), 60);
      tracks.forEach((t, i) => {
        const dir = i % 2 ? 1 : -1;
        const w = t.scrollWidth / 2;
        pos[i] += dir * (0.5 + v * 0.22);
        if (pos[i] <= -w) pos[i] += w;
        if (pos[i] > 0) pos[i] -= w;
        t.style.transform = `translate3d(${pos[i]}px,0,0) skewX(${dir * v * -0.08}deg)`;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, []);

  return (
    <section className="section overflow-hidden bg-chalk">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <Split as="h2" className="display d-1 uppercase">
          {title}
        </Split>
        <Rise>
          <TLink to="/gallery" label={ui.nav.gallery} className="btn btn-ghost label">
            {more}
            <Arrow />
          </TLink>
        </Rise>
      </div>
      <div ref={root} className="mt-14 grid gap-4">
        {rows.map((row, r) => (
          <div key={r} data-track className="flex w-max gap-4 will-change-transform">
            {[...row, ...row].map((g, i) => (
              <TLink
                key={i}
                to="/gallery"
                label={ui.nav.gallery}
                data-cursor={ui.view}
                tabIndex={i >= row.length ? -1 : undefined}
                aria-hidden={i >= row.length ? true : undefined}
                aria-label={g.title || ui.galleryTitle}
                className={`relative block h-[38vw] max-h-[26rem] min-h-52 shrink-0 overflow-hidden ${i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
              >
                <Image src={g.image} alt="" fill sizes="(min-width: 1024px) 34vw, 70vw" className="object-cover" />
              </TLink>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
