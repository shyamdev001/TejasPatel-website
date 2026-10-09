'use client';
import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/enter';
import { useLang } from '../LangContext';
import { TLink } from '../Transition';
import { Rise, Wipe } from '../Reveal';
import { Arrow } from '../Footer';

type Props = { quote: string; bio: string; image: string; cta: string };

/** His own line, inked in word by word as the reader scrolls through it. */
export default function Statement({ quote, bio, image, cta }: Props) {
  const { ui } = useLang();
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const split = SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.14 },
          { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 88%', end: 'center 58%', scrub: true } },
        ),
    });
    return () => split.revert();
  }, []);

  return (
    <section className="section field-paper relative">
      <div className="wrap grid gap-14 lg:grid-cols-12">
        <blockquote className="lg:col-span-12">
          <p ref={ref} className="display d-2 max-w-[22ch]">
            {quote}
          </p>
        </blockquote>
        <Wipe src={image} alt={`${ui.honorific} ${ui.first} ${ui.last}`} className="ticks aspect-[5/4] lg:col-span-6 lg:col-start-1" sizes="(min-width: 1024px) 100vw, 200vw" />
        <Rise className="lg:col-span-5 lg:col-start-8 lg:self-end">
          <p className="lede">{bio}</p>
          <TLink to="/about" label={ui.nav.about} className="btn label mt-8">
            {cta}
            <Arrow />
          </TLink>
        </Rise>
      </div>
    </section>
  );
}
