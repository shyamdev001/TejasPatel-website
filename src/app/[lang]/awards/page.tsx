import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang, pick } from '@/lib/content';
import { awardList } from '@/lib/derive';
import { getUI } from '@/lib/ui';
import PageHero from '@/components/PageHero';
import AwardIndex from '@/components/AwardIndex';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: getUI(lang).nav.awards } : {};
}

export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const awards = awardList(lang).reverse();
  return (
    <>
      <PageHero title={pick('awards', lang).mainTitle1} ground="leaf" meta={`${awards.at(-1)?.year} — ${awards[0]?.year}`} />
      <section className="section field-paper">
        <div className="wrap">
          <AwardIndex awards={awards} as="h2" />
        </div>
      </section>
    </>
  );
}
