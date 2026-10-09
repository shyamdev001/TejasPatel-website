import { awardImage, pick, type Lang } from './content';
import { getUI } from './ui';
import type { Award } from '@/components/AwardIndex';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const positionTabs = (lang: Lang) => {
  const ui = getUI(lang);
  const p = pick('positions', lang);
  return (Object.keys(ui.roles) as (keyof typeof ui.roles)[])
    .map((key) => ({ key, label: ui.roles[key], rows: (p[key] ?? []) as { text1: string; text2: string }[] }))
    .filter((t) => t.rows.length);
};

export const awardList = (lang: Lang): Award[] =>
  pick('awards', lang).awards.map((a: any, i: number) => ({
    id: a.id,
    year: a.year,
    title: a.title,
    recipient: a.recipient,
    organization: a.organization ?? '',
    image: awardImage(i),
  }));
