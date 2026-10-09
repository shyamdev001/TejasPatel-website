import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang, pick, press } from '@/lib/content';
import { getUI } from '@/lib/ui';
import PageHero from '@/components/PageHero';
import PressBoard from '@/components/PressBoard';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: getUI(lang).nav.press } : {};
}

export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const ui = getUI(lang);
  const t = pick('press', lang);
  const p = press(lang);
  const groups = [
    { key: 'news', label: t.section2.title, articles: p.news },
    { key: 'editorials', label: t.section4.title, articles: p.editorials },
    { key: 'pressMedia', label: ui.pressMedia, articles: p.pressMedia },
    { key: 'activity', label: ui.activity, articles: p.activity },
  ];
  return (
    <>
      <PageHero title={t.section1.title} ground="leaf" />
      <PressBoard groups={groups} videos={p.videos} videosLabel={t.section3.title} videoLabel={ui.video} />
    </>
  );
}
