'use client';
import Image from 'next/image';
import type { Project } from '@/lib/content';
import { useLang } from './LangContext';
import { TLink } from './Transition';
import { Split, Rise, Rule, Wipe, Odometer } from './Reveal';
import { Arrow } from './Footer';

export function SectionHead({ title, to, label, action }: { title: string; to?: string; label?: string; action?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <Split as="h2" className="display d-1 uppercase">
        {title}
      </Split>
      {to && action && (
        <Rise>
          <TLink to={to} label={label} className="btn btn-ghost label">
            {action}
            <Arrow />
          </TLink>
        </Rise>
      )}
    </div>
  );
}

export function HomeAwards({ title, more, children }: { title: string; more: string; children: React.ReactNode }) {
  const { ui } = useLang();
  return (
    <section className="section field-paper">
      <div className="wrap">
        <SectionHead title={title} to="/awards" label={ui.nav.awards} action={more} />
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}

/** All projects as staggered plots. */
export function ProjectGrid({ projects, more }: { projects: Project[]; more: string }) {
  const { ui } = useLang();
  return (
    <section className="section bg-chalk">
      <ul className="wrap grid gap-x-10 gap-y-20 md:grid-cols-2">
        {projects.map((p, i) => (
          <li key={p.slug} className={i % 2 ? 'md:mt-32' : ''}>
            <TLink to={`/${p.slug}`} label={p.title} data-cursor={ui.view} className="group block">
              <Wipe src={p.img} alt="" className={`ticks ${i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`} />
              <div className="mt-6 flex items-baseline justify-between gap-6">
                <h2 className="display d-3 uppercase">{p.title}</h2>
                <span className="num text-base">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="mt-3 max-w-[44ch] text-ink/80">{p.text}</p>
              <span className="label mt-5 inline-flex items-center gap-3">
                <span className="ulink">{more}</span>
                <Arrow className="transition-transform duration-500 ease-(--ease-plough) group-hover:translate-x-2" />
              </span>
            </TLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type TimelineItem = { id: number; year: string; title: string; description: string; details?: string; address?: string; present?: boolean; logo?: string };

/** Career ledger: the year stands in the margin, the office beside it. */
export function Timeline({ items, presentText }: { items: TimelineItem[]; presentText: string }) {
  return (
    <section className="section field-paper">
      <div className="wrap">
        <Rule />
        <ol>
          {items.map((t) => (
            <Rise as="li" key={t.id} className="group relative border-b border-line">
              <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-leaf transition-transform duration-500 ease-(--ease-plough) group-hover:scale-y-100" />
              <div className="relative grid gap-x-8 gap-y-3 py-7 md:grid-cols-[minmax(7rem,0.9fr)_1.2fr_2.2fr_auto] md:items-center md:py-9">
                <p className="num text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[0.85]">{t.year.trim()}</p>
                <div>
                  <h2 className="display d-3">{t.title}</h2>
                  {t.present && (
                    <p className="label mt-2 flex items-center gap-2">
                      <span aria-hidden className="size-2 rounded-full bg-pin" />
                      {presentText}
                    </p>
                  )}
                </div>
                <div>
                  <p className="max-w-[46ch] text-lg">{t.description}</p>
                  {(t.details || t.address) && <p className="mt-1 text-sm text-ink/70">{[t.details?.trim(), t.address].filter(Boolean).join(' · ')}</p>}
                </div>
                {t.logo ? (
                  <div className="relative hidden size-20 bg-paper md:block">
                    <Image src={t.logo} alt="" fill sizes="5rem" className="object-contain p-2" />
                  </div>
                ) : (
                  <span className="hidden size-20 md:block" />
                )}
              </div>
            </Rise>
          ))}
        </ol>
      </div>
    </section>
  );
}

export type Initiative = { title: string; text: string[]; n1?: string; l1?: string; n2?: string; l2?: string };
const FIELDS = ['field-mustard', 'field-leaf', 'field-paper', 'field-green'];

/** Each initiative is its own field of colour. */
export function InitiativeFields({ items }: { items: Initiative[] }) {
  return (
    <>
      {items.map((it, i) => (
        <section key={i} className={`${FIELDS[i % FIELDS.length]} section relative overflow-hidden`}>
          <div aria-hidden className="furrows absolute inset-0 opacity-50" />
          <div className="wrap relative grid gap-12 lg:grid-cols-12">
            <Split as="h2" className="display d-2 lg:col-span-6">
              {it.title.replace(/\s*:\s*$/, '')}
            </Split>
            <div className="lg:col-span-5 lg:col-start-8">
              {it.text.map((p, k) => (
                <Rise as="p" key={k} delay={k * 0.08} className="lede mb-5">
                  {p}
                </Rise>
              ))}
              {it.n1 && (
                <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-current/25 pt-8">
                  {[
                    [it.n1, it.l1],
                    [it.n2, it.l2],
                  ].map(([n, l]) =>
                    n ? (
                      <div key={l} className="flex flex-col-reverse gap-2">
                        <dt className="label">{l?.trim()}</dt>
                        <dd className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold">
                          <Odometer value={Number(n).toLocaleString('en-IN')} />
                        </dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

/** Running band of words, set wide. */
export function WordBand({ words, ground = 'field-green' }: { words: string[]; ground?: string }) {
  const list = [...words, ...words];
  return (
    <div className={`${ground} overflow-hidden py-6`}>
      <p className="sr-only">{words.join(', ')}</p>
      <div className="marquee-track" style={{ ['--dur' as string]: `${Math.max(24, words.length * 6)}s` }} aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {list.map((w, i) => (
              <span key={i} className="display d-2 flex items-center whitespace-nowrap uppercase">
                <span className="px-8">{w}</span>
                <span className="size-3 rounded-full bg-pin" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mission and vision as two adjoining fields. */
export function TwoFields({ a, b }: { a: { title: string; text: string }; b: { title: string; text: string } }) {
  return (
    <section className="grid md:grid-cols-2">
      {[a, b].map((x, i) => (
        <div key={i} className={`${i ? 'field-mustard' : 'field-green'} relative overflow-hidden`}>
          <div aria-hidden className="furrows absolute inset-0 opacity-60" />
          <div className="wrap relative flex min-h-[26rem] flex-col justify-between gap-16 py-16 lg:min-h-[34rem]">
            <h2 className="label">{x.title}</h2>
            <Split as="p" className="display d-2 max-w-[14ch]">
              {x.text}
            </Split>
          </div>
        </div>
      ))}
    </section>
  );
}

/** Big paired statements, ruled like ledger lines. */
export function Statements({ title, items }: { title?: string; items: { title?: string; text: string }[] }) {
  return (
    <section className="section field-paper">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        {title && (
          <Split as="h2" className="display d-2 lg:col-span-5">
            {title}
          </Split>
        )}
        <div className={title ? 'lg:col-span-6 lg:col-start-7' : 'lg:col-span-9'}>
          <Rule />
          {items.map((n, i) => (
            <Rise key={i} delay={i * 0.05} className="border-b border-line py-7">
              {n.title && <h3 className="display d-3">{n.title}</h3>}
              <p className={`max-w-[58ch] ${n.title ? 'mt-2 text-ink/80' : 'lede'}`}>{n.text.trim()}</p>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}
