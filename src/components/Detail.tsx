'use client';
import type { Project } from '@/lib/content';
import { useLang } from './LangContext';
import { TLink } from './Transition';
import { Split, Rise, Rule, Wipe } from './Reveal';
import { Arrow } from './Footer';

/** Image beside a titled passage. */
export function Feature({ title, text, image, flip }: { title: string; text: string; image: string; flip?: boolean }) {
  return (
    <section className="section field-leaf">
      <div className="wrap grid items-center gap-12 lg:grid-cols-12">
        <Wipe src={image} alt="" className={`ticks aspect-[4/5] lg:col-span-5 ${flip ? 'lg:order-2 lg:col-start-8' : ''}`} />
        <div className={`lg:col-span-6 ${flip ? 'lg:order-1' : 'lg:col-start-7'}`}>
          <Split as="h2" className="display d-1 uppercase">
            {title}
          </Split>
          <Rise as="p" className="lede mt-8" delay={0.1}>
            {text}
          </Rise>
        </div>
      </div>
    </section>
  );
}

export type DetailData = {
  lede: string;
  body: { kind: 'p' | 'h'; text: string }[];
  images: string[];
  goals?: { title: string; points: string[] };
  blocks: { title: string; points: string[] }[];
  stats?: { title: string; items: { title: string; text: string }[] };
  conclusion?: { title: string; text: string };
  next: Project;
};

export function DetailBody({ d }: { d: DetailData }) {
  const { ui } = useLang();
  return (
    <>
      <section className="section field-paper">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <Split
            as="p"
            delay={0.05}
            className={`${d.lede.length > 220 ? 'text-[clamp(1.2rem,1.55vw,1.5rem)] font-medium leading-[1.45]' : 'display d-3'} ${d.body.length ? 'lg:col-span-5' : 'max-w-[52ch] lg:col-span-9'}`}
          >
            {d.lede}
          </Split>
          <div className={`prose-body grid content-start gap-5 lg:col-span-6 lg:col-start-7 ${d.body.length ? '' : 'hidden'}`}>
            {d.body.map((b, i) =>
              b.kind === 'h' ? (
                <Rise as="h2" key={i} className="display d-3 mt-6">
                  {b.text}
                </Rise>
              ) : (
                <Rise as="p" key={i}>
                  {b.text}
                </Rise>
              ),
            )}
          </div>
        </div>
        {d.images.length > 0 && (
          <div className={`wrap mt-20 grid gap-4 ${d.images.length > 2 ? 'md:grid-cols-3' : d.images.length === 2 ? 'md:grid-cols-2' : ''}`}>
            {d.images.map((src, i) => (
              <Wipe key={src} src={src} alt="" delay={i * 0.12} className={`${d.images.length === 1 ? 'aspect-[16/8]' : 'aspect-[4/3]'} ${i === 1 ? 'md:mt-16' : ''}`} sizes={d.images.length === 1 ? '100vw' : '(min-width: 768px) 33vw, 100vw'} />
            ))}
          </div>
        )}
      </section>

      {d.goals && d.goals.points.length > 0 && (
        <section className="section field-mustard relative overflow-hidden">
          <div aria-hidden className="furrows absolute inset-0" />
          <div className="wrap relative grid gap-12 lg:grid-cols-12">
            <Split as="h2" className="display d-1 uppercase lg:col-span-4">
              {d.goals.title}
            </Split>
            <ul className="lg:col-span-7 lg:col-start-6">
              {d.goals.points.map((p, i) => (
                <Rise as="li" key={i} delay={i * 0.06} className="display d-3 border-b border-ink/25 py-6 first:border-t">
                  {p}
                </Rise>
              ))}
            </ul>
          </div>
        </section>
      )}

      {d.blocks.map((b, i) => (
        <section key={i} className={`section ${i % 2 ? 'field-leaf' : 'bg-chalk'}`}>
          <div className="wrap grid gap-12 lg:grid-cols-12">
            <Split as="h2" className="display d-2s lg:col-span-5">
              {b.title}
            </Split>
            <div className="lg:col-span-6 lg:col-start-7">
              <Rule />
              <ul>
                {b.points.map((p, k) => (
                  <Rise as="li" key={k} delay={k * 0.04} className="grid grid-cols-[0.75rem_1fr] items-baseline gap-4 border-b border-line py-5">
                    <span aria-hidden className="size-2 translate-y-[-0.1em] rounded-full bg-pin" />
                    <span className="max-w-[58ch]">{p}</span>
                  </Rise>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      {d.stats && (
        <section className="field-green relative overflow-hidden">
          <div aria-hidden className="furrows absolute inset-0 opacity-50" />
          <div className="wrap relative py-[clamp(4rem,8vw,7rem)]">
            <h2 className="label text-mustard">{d.stats.title}</h2>
            <dl className="mt-10 grid gap-10 md:grid-cols-3">
              {d.stats.items.map((s, i) => (
                <Rise key={i} delay={i * 0.08} className="flex flex-col-reverse gap-3 border-t border-white/30 pt-6">
                  <dt className="text-white/85">{s.text}</dt>
                  <dd className="display d-2 text-mustard">{s.title}</dd>
                </Rise>
              ))}
            </dl>
          </div>
        </section>
      )}

      {d.conclusion && (
        <section className="section field-paper">
          <div className="wrap">
            <h2 className="label flex items-center gap-3">
              <span aria-hidden className="size-2 rounded-full bg-pin" />
              {d.conclusion.title}
            </h2>
            <Split as="p" className="display d-2 mt-8 max-w-[26ch]">
              {d.conclusion.text}
            </Split>
          </div>
        </section>
      )}

      <TLink to={`/${d.next.slug}`} label={d.next.title} data-cursor={ui.view} className="field-mustard group relative block overflow-hidden">
        <div aria-hidden className="furrows absolute inset-0" />
        <div className="wrap relative flex flex-wrap items-end justify-between gap-8 py-[clamp(4rem,9vw,8rem)]">
          <div>
            <p className="label">{ui.nextProject}</p>
            <p className="display d-1 mt-4 max-w-[14ch] uppercase transition-transform duration-700 ease-(--ease-plough) group-hover:translate-x-4">{d.next.title}</p>
          </div>
          <Arrow className="mb-4 h-8 w-14 transition-transform duration-700 ease-(--ease-plough) group-hover:translate-x-4" />
        </div>
      </TLink>
    </>
  );
}
