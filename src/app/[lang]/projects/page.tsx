import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang, pick, projects } from '@/lib/content';
import { getUI } from '@/lib/ui';
import PageHero from '@/components/PageHero';
import { ProjectGrid } from '@/components/Sections';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: getUI(lang).nav.projects } : {};
}

export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const ui = getUI(lang);
  const all = projects(lang);
  const p = pick('projects', lang);
  return (
    <>
      <PageHero title={p.section1.title} ground="mustard" meta={ui.place} />
      <ProjectGrid projects={all} more={p.section2.project[0].button} />
    </>
  );
}
