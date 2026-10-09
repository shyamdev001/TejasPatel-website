'use client';
import { createContext, useContext } from 'react';
import type { Lang } from '@/lib/content';
import type { UI } from '@/lib/ui';

type Value = { lang: Lang; ui: UI };
const Ctx = createContext<Value | null>(null);

export function LangProvider({ value, children }: { value: Value; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLang outside LangProvider');
  return v;
};
