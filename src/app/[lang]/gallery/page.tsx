import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { gallery, isLang } from '@/lib/content';
import { getUI } from '@/lib/ui';
import PageHero from '@/components/PageHero';
import GalleryWall from '@/components/GalleryWall';

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: getUI(lang).nav.gallery } : {};
}

export default async function Page({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const ui = getUI(lang);
  const years = gallery();
  return (
    <>
      <PageHero title={ui.galleryTitle} ground="mustard" meta={`${years.at(-1)?.year} — ${years[0]?.year}`} />
      <GalleryWall years={years} />
    </>
  );
}
