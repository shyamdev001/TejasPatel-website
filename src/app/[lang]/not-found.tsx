'use client';
import { useLang } from '@/components/LangContext';
import { TLink } from '@/components/Transition';
import { Arrow } from '@/components/Footer';

export default function NotFound() {
  const { ui } = useLang();
  return (
    <section className="field-mustard relative grid min-h-svh place-items-center overflow-hidden">
      <div aria-hidden className="furrows absolute inset-0" />
      <div className="wrap relative py-[calc(var(--header-h)+3rem)] text-center">
        <h1>
          <span className="num block text-[clamp(6rem,22vw,18rem)] font-bold leading-none">404</span>
          <span className="display d-3 mt-4 block">{ui.notFound}</span>
        </h1>
        <TLink to="" label={ui.nav.home} className="btn label mt-8">
          {ui.backHome}
          <Arrow />
        </TLink>
      </div>
    </section>
  );
}
