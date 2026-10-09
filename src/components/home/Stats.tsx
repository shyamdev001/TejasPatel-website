'use client';
import { Odometer, Rise } from '../Reveal';

type Stat = { number: string; extr: string; title: string };

/** The yield, read off like a mandi board: fixed slots, rolling digits. */
export default function Stats({ stats }: { stats: Stat[] }) {
  return (
    <section className="field-mustard relative overflow-hidden">
      <div aria-hidden className="furrows absolute inset-0" />
      <dl className="wrap relative grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Rise
            key={i}
            delay={i * 0.08}
            // label first in the markup (a term comes before its value); shown value-first
            className={`stat flex flex-col-reverse justify-between gap-10 border-ink/25 py-12 lg:min-h-[26rem] lg:py-16 ${i % 2 ? 'border-l pl-5' : 'pr-5'} ${i > 1 ? 'border-t lg:border-t-0' : ''} lg:border-l lg:pl-8 lg:pr-6 lg:first:border-l-0 lg:first:pl-0`}
          >
            <dt className="max-w-[22ch] text-base font-medium lg:text-lg">{s.title.trim()}</dt>
            <dd className="flex flex-wrap items-baseline text-[clamp(3.25rem,10.5vw,11rem)] font-bold">
              <Odometer value={s.number} />
              {s.extr && (
                <span className="display ml-1 text-[0.32em] uppercase" style={{ ['--wdth' as string]: 90 }}>
                  {s.extr}
                </span>
              )}
            </dd>
          </Rise>
        ))}
      </dl>
    </section>
  );
}
