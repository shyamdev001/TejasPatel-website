'use client';
import Image from 'next/image';
import type { Article } from '@/lib/content';
import { useLang } from '../LangContext';
import { TLink } from '../Transition';
import { Split, Rise, Rule, Wipe } from '../Reveal';
import { Arrow } from '../Footer';

const excerpt = (s: string, n: number) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n)) + '…' : s);

/** Latest from the press: one lead story, then the running list. */
export default function News({ title, more, articles }: { title: string; more: string; articles: Article[] }) {
  const { ui } = useLang();
  const [lead, ...rest] = articles;
  if (!lead) return null;
  // CMS bodies open by repeating the headline; do not print it twice.
  const body = lead.body.startsWith(lead.title) ? lead.body.slice(lead.title.length).trim() : lead.body;
  return (
    <section className="section field-paper">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Split as="h2" className="display d-1 uppercase">
            {title}
          </Split>
          <Rise>
            <TLink to="/press" label={ui.nav.press} className="btn btn-ghost label">
              {more}
              <Arrow />
            </TLink>
          </Rise>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <TLink to="/press" label={ui.nav.press} data-cursor={ui.read} className="group block lg:col-span-7">
            <Wipe contain src={lead.image} alt="" className="aspect-[16/10] bg-leaf" sizes="(min-width: 1024px) 58vw, 100vw" />
            <p className="num mt-6 text-base">{lead.year}</p>
            <h3 className="display d-3 mt-2 max-w-[28ch]">{lead.title}</h3>
            <p className="mt-4 max-w-[62ch] text-ink/80">{excerpt(body, 240)}</p>
          </TLink>

          <div className="lg:col-span-5">
            <Rule />
            <ul>
              {rest.map((a, i) => (
                <Rise as="li" key={a.id} delay={i * 0.06} className="border-b border-line">
                  <TLink to="/press" label={ui.nav.press} className="group grid grid-cols-[1fr_6.5rem] items-center gap-5 py-5">
                    <div>
                      <p className="num text-sm">{a.year}</p>
                      <h3 className="mt-1 text-lg font-medium leading-snug transition-transform duration-500 ease-(--ease-plough) group-hover:translate-x-2">{excerpt(a.title, 110)}</h3>
                    </div>
                    <div className="relative aspect-square overflow-hidden bg-leaf">
                      <Image src={a.image} alt="" fill sizes="7rem" className="object-cover transition-transform duration-700 ease-(--ease-plough) group-hover:scale-110" />
                    </div>
                  </TLink>
                </Rise>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
