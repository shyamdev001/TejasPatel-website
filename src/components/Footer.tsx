'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/enter';
import { NAV } from '@/lib/ui';
import { useLang } from './LangContext';
import { TLink } from './Transition';
import { Split, Rise, Rule } from './Reveal';
import Magnetic from './Magnetic';
import FurrowField from './FurrowField';

const SOCIAL = [
  ['Facebook', 'https://www.facebook.com/tejashofficial'],
  ['X', 'https://x.com/tejashofficial'],
  ['Instagram', 'https://www.instagram.com/tejashofficial/'],
  ['LinkedIn', 'https://www.linkedin.com/in/tejash-patel-2641a848'],
  ['YouTube', 'https://www.youtube.com/@tejash301175patel'],
  ['Threads', 'https://www.threads.net/@tejashofficial'],
];

type Props = {
  closing: string;
  name: string;
  position: string;
  labels: { explore: string; contact: string; address: string; phone: string; email: string };
  contact: { phone: string; email: string; email2: string; address: string };
};

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg className={`arrow ${className}`} width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
      <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function Footer({ closing, name, position, labels, contact }: Props) {
  const { lang, ui } = useLang();
  const mark = useRef<HTMLParagraphElement>(null);

  // The name widens across the field as the page reaches its end.
  useEffect(() => {
    const el = mark.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.fromTo(el, { '--wdth': 62 }, { '--wdth': 118, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
    return () => {
      tween.revert();
    };
  }, []);

  return (
    <footer className="field-green relative overflow-hidden">
      <FurrowField color="255, 255, 255" rows={26} className="opacity-70" />
      <div className="wrap relative pb-8 pt-[clamp(5rem,12vw,11rem)]">
        <Split as="p" className="display d-1 max-w-[16ch] text-mustard">
          {closing}
        </Split>
        <Rise className="mt-10">
          <Magnetic>
            <TLink to="/contact" label={ui.nav.contact} className="btn btn-light label">
              {ui.contactCta}
              <Arrow />
            </TLink>
          </Magnetic>
        </Rise>

        <Rule className="mt-[clamp(4rem,9vw,8rem)]" />
        <div className="grid gap-12 pt-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_1fr]">
          <Rise>
            <h2 className="display d-3">{name}</h2>
            <p className="mt-4 max-w-[52ch] text-white/85">{position}</p>
          </Rise>
          <Rise delay={0.08}>
            <h2 className="label text-mustard">{labels.explore}</h2>
            <ul className="mt-4 grid gap-1.5">
              {NAV.map((n) => (
                <li key={n.key}>
                  <TLink to={n.path} label={ui.nav[n.key]} className="ulink">
                    {ui.nav[n.key]}
                  </TLink>
                </li>
              ))}
            </ul>
          </Rise>
          <Rise delay={0.16}>
            <h2 className="label text-mustard">{labels.contact}</h2>
            <address className="mt-4 grid gap-4 not-italic">
              <p className="max-w-[36ch]">{contact.address}</p>
              <p className="grid gap-1.5">
                <a className="ulink w-fit" href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>
                  {contact.phone}
                </a>
                <a className="ulink w-fit" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
                <a className="ulink w-fit" href={`mailto:${contact.email2}`}>
                  {contact.email2}
                </a>
              </p>
            </address>
            <ul className="label mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {SOCIAL.map(([label, href]) => (
                <li key={label}>
                  <a className="ulink" href={href} target="_blank" rel="noreferrer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </Rise>
        </div>

        <p
          ref={mark}
          aria-hidden
          className="display mt-[clamp(3rem,7vw,6rem)] select-none text-center text-[11.4vw] uppercase text-mustard lg:text-[12.2vw]"
          style={{ lineHeight: lang === 'gu' ? 1.15 : 0.82, whiteSpace: 'nowrap', textWrap: 'nowrap' }}
        >
          {ui.first} {ui.last}
        </p>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <div className="bg-paper p-3">
            <Image src="/logo.png" alt={`${ui.honorific} ${ui.first} ${ui.last} — ${ui.tagline}`} width={400} height={85} className="h-10 w-auto" />
          </div>
          <p className="text-sm text-white/80">© 2025 {name}</p>
        </div>
      </div>
    </footer>
  );
}
