import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { img, isLang, pick, stripTags } from '@/lib/content';
import { positionTabs } from '@/lib/derive';
import { getUI } from '@/lib/ui';
import PageHero from '@/components/PageHero';
import Legacy from '@/components/home/Legacy';
import Positions from '@/components/home/Positions';
import { Feature } from '@/components/Detail';
import { Statements, TwoFields } from '@/components/Sections';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: getUI(lang).nav.about } : {};
}

export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const ui = getUI(lang);
  const a = pick('about', lang);
  const legacy = pick('legacy', lang);
  return (
    <>
      <PageHero title={a.section1.title} lede={a.section1.text} image={img(a.section1.img)} imageSizes="(min-width: 1024px) 80vw, 180vw" />
      <Statements items={[{ text: a.section2.text1 }]} />
      <Feature title={stripTags(a.section3.title)} text={a.section3.text} image={img(a.section3.img)} />
      <TwoFields a={{ title: ui.mission, text: a.section4.mission }} b={{ title: ui.vision, text: a.section4.vision }} />
      <Statements title={stripTags(a.section5.title)} items={a.section5.news} />
      <Legacy heading={legacy.headingLine2} lede={legacy.headingLine1} slides={legacy.slides.slice(1)} />
      <Positions title={ui.positionsTitle} tabs={positionTabs(lang)} />
    </>
  );
}
