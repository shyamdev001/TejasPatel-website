import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { detail, DETAIL_SLUGS, img, isLang, LANGS, pick, projects, stripTags } from '@/lib/content';
import PageHero from '@/components/PageHero';
import { DetailBody, type DetailData } from '@/components/Detail';
import { WordBand } from '@/components/Sections';

/* eslint-disable @typescript-eslint/no-explicit-any */
type P = { params: Promise<{ lang: string; slug: string }> };

export const generateStaticParams = () => LANGS.flatMap((lang) => DETAIL_SLUGS.map((slug) => ({ lang, slug })));

// The live site still carries template filler in a few fields; never show it.
const real = (s?: string) => !!s && !/orem ipsum|Retained for its/i.test(s);
const text = (s?: string) => stripTags(s).trim();

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  return { title: projects(lang).find((p) => p.slug === slug)?.title };
}

export default async function Page({ params }: P) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const d = detail(slug, lang);
  const all = projects(lang);
  const index = all.findIndex((p) => p.slug === slug);
  if (!d || index < 0) notFound();
  const project = all[index];
  const s2 = d.section2 ?? {};

  const paragraphs = Object.keys(s2)
    .filter((k) => /^text\d*$/.test(k))
    .sort((a, b) => (Number(a.slice(4)) || 1) - (Number(b.slice(4)) || 1))
    .map((k) => text(s2[k]))
    .filter(real);
  const [lede, ...rest] = paragraphs;
  const title = [d.section1.title1, d.section1.title2].map(text).filter(Boolean).join(' — ');
  const points = [1, 2, 3, 4, 5, 6].map((n) => text(d.section5?.[`point${n}`])).filter(Boolean);
  const stats = (d.section6?.cart ?? []).filter((c: any) => real(c.title) && real(c.text));

  const data: DetailData = {
    lede: lede ?? project.text,
    body: rest.map((t) => (/^•/.test(t) ? { kind: 'h' as const, text: t.replace(/^•\s*/, '') } : { kind: 'p' as const, text: t })),
    images: (s2.images ?? []).filter(Boolean).map(img),
    goals: s2.goals && { title: s2.goals.title, points: s2.goals.points.map(text).filter(real) },
    blocks: (Array.isArray(d.section3) ? d.section3 : []).filter((b: any) => real(b.title)).map((b: any) => ({ title: text(b.title), points: b.text.map(text).filter(real) })),
    stats: stats.length ? { title: text(d.section6.title), items: stats.map((c: any) => ({ title: text(c.title), text: text(c.text) })) } : undefined,
    conclusion: real(d.section7?.text) ? { title: text(d.section7.title), text: text(d.section7.text) } : undefined,
    next: all[(index + 1) % all.length],
  };

  return (
    <>
      <PageHero title={title} lede={real(d.section1.text) ? text(d.section1.text) : undefined} image={project.img} meta={pick('projects', lang).section1.title} />
      {points.length > 0 && <WordBand words={points} />}
      <DetailBody d={data} />
    </>
  );
}
