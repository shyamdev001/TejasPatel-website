'use client';
import FurrowField from './FurrowField';
import { Split, Rise, Wipe } from './Reveal';

type Props = { title: string; lede?: string; image?: string; imageSizes?: string; ground?: 'chalk' | 'mustard' | 'leaf'; meta?: string };

const GROUND = { chalk: 'bg-chalk', mustard: 'field-mustard', leaf: 'field-leaf' };

/** Opening plot of every inner page: the title set wide across a furrowed field. */
export default function PageHero({ title, lede, image, imageSizes = '(min-width: 1024px) 40vw, 100vw', ground = 'chalk', meta }: Props) {
  const long = title.length > 22;
  return (
    <section className={`relative overflow-hidden ${GROUND[ground]}`}>
      <FurrowField rows={24} />
      <div className="wrap relative grid gap-10 pb-[clamp(3rem,7vw,6rem)] pt-[calc(var(--header-h)+clamp(4rem,11vw,10rem))] lg:grid-cols-12 lg:items-end">
        <div className={image ? 'lg:col-span-7' : 'lg:col-span-10'}>
          <Split as="h1" enter by="words" className={`display uppercase ${long ? 'd-2' : 'd-1'}`}>
            {title}
          </Split>
          {lede && (
            <Rise enter delay={0.25} className="lede mt-8">
              <p>{lede}</p>
            </Rise>
          )}
          {meta && (
            <Rise enter delay={0.35} className="label mt-8 flex items-center gap-3">
              <span aria-hidden className="size-2 rounded-full bg-pin" />
              {meta}
            </Rise>
          )}
        </div>
        {image && (
          <Wipe enter priority src={image} alt="" className="ticks aspect-[4/3] lg:col-span-5" sizes={imageSizes} delay={0.1} />
        )}
      </div>
    </section>
  );
}
