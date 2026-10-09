'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { lockScroll } from '@/lib/lock';
import { NAV } from '@/lib/ui';
import { useLang } from './LangContext';
import { TLink } from './Transition';
import Magnetic from './Magnetic';

const EASE = [0.76, 0, 0.24, 1] as const;

/** Local time at his village, ticking in the menu. */
function VillageClock({ place }: { place: string }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <p className="label flex items-center gap-3">
      <span aria-hidden className="pulse size-2 rounded-full bg-pin" />
      {place}
      <span className="num text-base">{time} IST</span>
    </p>
  );
}

type Contact = { phone: string; email: string; email2: string; address: string };

export default function Header({ contact }: { contact: Contact }) {
  const { lang, ui } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const rest = pathname.replace(/^\/(en|gu)/, '');
  const current = rest === '' ? '' : '/' + rest.split('/')[1];

  useEffect(() => setOpen(false), [pathname]);

  // While the menu is open the page behind it is locked and out of reach of Tab;
  // closing hands focus back to the button that opened it.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) toggle.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const unlock = lockScroll();
    const behind = [...document.querySelectorAll<HTMLElement>('main, footer')];
    behind.forEach((el) => (el.inert = true));
    gsap.to(bar.current, { yPercent: 0, duration: 0.4, overwrite: true });
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => {
      unlock();
      behind.forEach((el) => (el.inert = false));
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  // Tuck the bar away while reading down, bring it back on the way up.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      start: 120,
      end: 'max',
      onUpdate: (self) => {
        // keep the bar in place while someone is tabbing through it
        const hide = self.direction === 1 && !el.contains(document.activeElement);
        gsap.to(el, { yPercent: hide ? -130 : 0, duration: 0.6, ease: 'power3.out', overwrite: true });
      },
      onLeaveBack: () => gsap.to(el, { yPercent: 0, duration: 0.6, overwrite: true }),
    });
    return () => st.kill();
  }, []);

  return (
    <>
      <header ref={bar} className="fixed inset-x-0 top-0 z-[80]">
        <div className="wrap flex h-(--header-h) items-center justify-between">
          <TLink to="" label={ui.nav.home} aria-label={`${ui.honorific} ${ui.first} ${ui.last}`} className="bg-paper px-3 py-2">
            <Image src="/logo.png" alt="" width={400} height={85} priority className="h-7 w-auto md:h-8" />
          </TLink>
          <div className="flex items-stretch gap-2">
            <div className="label flex items-stretch bg-paper text-ink" role="group" aria-label="Language">
              {(['en', 'gu'] as const).map((l) => (
                <TLink
                  key={l}
                  raw
                  to={`/${l}${rest}`}
                  label={l === 'en' ? 'English' : 'ગુજરાતી'}
                  lang={l}
                  aria-current={l === lang ? 'true' : undefined}
                  className={`grid min-w-11 place-items-center px-3 transition-colors duration-300 ${l === lang ? 'bg-pin text-[#0b1033]' : 'hover:bg-leaf'}`}
                >
                  {l === 'en' ? 'En' : 'ગુજ'}
                </TLink>
              ))}
            </div>
            <Magnetic strength={0.25}>
              <button
                ref={toggle}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="site-menu"
                className="label group flex h-11 items-center gap-3 bg-ink px-4 text-white"
              >
                <span className="relative block h-[1.2em] overflow-hidden leading-[1.2]">
                  <span className={`block transition-transform duration-500 ease-(--ease-plough) ${open ? '-translate-y-full' : ''}`}>{ui.menu}</span>
                  <span className={`absolute inset-x-0 top-full block transition-transform duration-500 ease-(--ease-plough) ${open ? '-translate-y-full' : ''}`}>
                    {ui.close}
                  </span>
                </span>
                <span aria-hidden className="relative block h-2.5 w-5">
                  <span className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500 ease-(--ease-plough) ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
                  <span className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500 ease-(--ease-plough) ${open ? '-translate-y-[4px] -rotate-45' : ''}`} />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label={ui.menu}
            data-lenis-prevent
            className="field-mustard fixed inset-0 z-[70] overflow-y-auto"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(100% 0 0% 0)', transition: { duration: 0.65, ease: EASE, delay: 0.1 } }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="furrows pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <div className="wrap relative grid min-h-full gap-12 pb-10 pt-[calc(var(--header-h)+2.5rem)] lg:grid-cols-[2.2fr_1fr] lg:items-end">
              <nav aria-label={ui.menu}>
                <ul className="grid gap-x-10 sm:grid-cols-2">
                  {NAV.map((n, i) => (
                    <li key={n.key} className="overflow-hidden border-b border-ink/20">
                      <motion.div
                        initial={{ y: '110%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '-110%', transition: { duration: 0.4, ease: EASE, delay: i * 0.015 } }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.18 + i * 0.045 }}
                      >
                        <TLink
                          to={n.path}
                          label={ui.nav[n.key]}
                          aria-current={current === n.path ? 'page' : undefined}
                          onClick={() => rest === n.path && setOpen(false)}
                          className="menu-link display group flex items-baseline justify-between gap-4 py-3 text-[clamp(1.75rem,3.2vw,3rem)] uppercase"
                        >
                          <span>{ui.nav[n.key]}</span>
                          <span aria-hidden className={`size-3 shrink-0 rounded-full bg-pin transition-transform duration-500 ease-(--ease-plough) ${current === n.path ? 'scale-100' : 'scale-0 group-hover:scale-100'}`} />
                        </TLink>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </nav>
              <motion.div
                className="grid gap-6 text-base"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <VillageClock place={ui.place.split(' · ')[0]} />
                <p className="display d-3">{ui.tagline}</p>
                <p className="max-w-[40ch]">{contact.address}</p>
                <p className="grid gap-1">
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
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
