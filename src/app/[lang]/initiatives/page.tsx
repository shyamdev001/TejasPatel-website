import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { img, isLang, pick, stripTags } from '@/lib/content';
import { getUI } from '@/lib/ui';
import PageHero from '@/components/PageHero';
import { InitiativeFields, Statements, type Initiative } from '@/components/Sections';

/* eslint-disable @typescript-eslint/no-explicit-any */
type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: getUI(lang).nav.initiatives } : {};
}

export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const a = pick('initiatives', lang);
  const items: Initiative[] = a.section3.map((s: any) => ({
    title: stripTags(s.title),
    text: s.text.map(stripTags),
    n1: s.Employements1,
    l1: s.Employements1Text,
    n2: s.Employements2,
    l2: s.Employements2Text,
  }));
  return (
    <>
      <PageHero title={a.section1.title} lede={stripTags(a.section2.text[0])} image={img(a.section2.img)} />
      <InitiativeFields items={items} />
      <Statements items={a.section6.points.map((p: any) => ({ text: stripTags(p.text) }))} />
    </>
  );
}
