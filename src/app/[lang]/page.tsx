import { notFound } from 'next/navigation';
import { homeGallery, img, isLang, pick, press, projects } from '@/lib/content';
import { awardList, positionTabs } from '@/lib/derive';
import { getUI } from '@/lib/ui';
import Hero from '@/components/home/Hero';
import Statement from '@/components/home/Statement';
import Legacy from '@/components/home/Legacy';
import Positions from '@/components/home/Positions';
import Stats from '@/components/home/Stats';
import ProjectStack from '@/components/home/ProjectStack';
import Leaders from '@/components/home/Leaders';
import GalleryStrip from '@/components/home/GalleryStrip';
import News from '@/components/home/News';
import AwardIndex from '@/components/AwardIndex';
import { HomeAwards } from '@/components/Sections';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const ui = getUI(lang);
  const home = pick('home', lang);
  const about = pick('about', lang);
  const legacy = pick('legacy', lang);
  const all = projects(lang);
  const awards = awardList(lang);
  // His Gujarati copy still says 21 years of service where the English says 29 (1997 to now).
  // A count cannot differ by language, so the English figure is the one shown in both.
  const en = pick('home', 'en').section6;
  const stats = home.section6.map((x: any, i: number) => (i === 0 ? { ...x, number: en[0].number } : x));

  return (
    <>
      <Hero
        roles={home.section2.map((r: any) => r.text)}
        intro={legacy.slides[0].description[0]}
        cta={home.section3.button1}
        cta2={home.section3.button2}
        portrait={img('/static/media/newImage.281568f4d8bbe300b0b8.webp')}
      />
      <Statement quote={about.section1.text} bio={about.section2.text1} image={img(about.section1.img)} cta={home.section3.button1} />
      <Legacy heading={legacy.headingLine2} lede={legacy.headingLine1} slides={legacy.slides.slice(1)} />
      <Positions title={ui.positionsTitle} tabs={positionTabs(lang)} />
      <Stats stats={stats} />
      <ProjectStack title={home.section4.title} projects={all.slice(0, 5)} more={home.section4.project[0].button} total={all.length} />
      <Leaders title={home.sectionDignitaries.title} messages={home.sectionDignitaries.messages.map((m: any) => ({ ...m, img: img(m.img) }))} />
      <HomeAwards title={ui.awardsTitle} more={ui.allAwards}>
        <AwardIndex awards={awards.slice(-8).reverse()} />
      </HomeAwards>
      <GalleryStrip title={home.section7.title} more={home.section7.button} items={homeGallery(lang)} />
      <News title={home.section8.title} more={ui.allNews} articles={press(lang).news.slice(0, 5)} />
    </>
  );
}
