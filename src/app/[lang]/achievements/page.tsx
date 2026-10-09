import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { img, isLang, pick } from '@/lib/content';
import { getUI } from '@/lib/ui';
import PageHero from '@/components/PageHero';
import { Timeline, type TimelineItem } from '@/components/Sections';

/* eslint-disable @typescript-eslint/no-explicit-any */
type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: getUI(lang).nav.achievements } : {};
}

export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const ui = getUI(lang);
  const a = pick('achievements', lang);
  // A dated range that has ended is not a current office, whatever the flag says.
  const ended = (d?: string) => !!d && /\d{4}\s*-\s*\d{4}/.test(d) && !/present|અત્યાર/i.test(d);
  const sorted = [...a.timeline].sort((x: any, y: any) => parseInt(x.year, 10) - parseInt(y.year, 10));
  const items: TimelineItem[] = sorted.map((t: any) => ({
    id: t.id,
    year: t.year,
    title: t.title,
    description: t.description,
    details: t.cardDetails,
    address: t.address,
    present: t.present && !ended(t.cardDetails),
    logo: img(t.logo),
  }));
  return (
    <>
      <PageHero title={a.headerTitle} ground="mustard" meta={`${items[0].year.trim()} — ${ui.present}`} />
      <Timeline items={items} presentText={a.presentText} />
    </>
  );
}
