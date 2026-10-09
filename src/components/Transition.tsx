'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ScrollTrigger, scroller } from '@/lib/gsap';
import { hold, release, prefersReducedMotion } from '@/lib/enter';
import { useLang } from './LangContext';

type Phase = 'idle' | 'cover' | 'reveal';
const Ctx = createContext<{ go: (href: string, label?: string) => void }>({ go: () => {} });
export const usePageTransition = () => useContext(Ctx);

const STRIPS = 6;
const EASE = [0.76, 0, 0.24, 1] as const;

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const [label, setLabel] = useState('');
  const pending = useRef<string | null>(null);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const go = useCallback(
    (href: string, text = '') => {
      if (phaseRef.current !== 'idle' || href === pathname) return;
      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }
      hold();
      pending.current = href;
      setLabel(text);
      setPhase('cover');
    },
    [pathname, router],
  );

  // The new route has rendered under the cover: reset scroll, then plough it away.
  useEffect(() => {
    if (phaseRef.current !== 'cover') return;
    pending.current = null;
    scroller.lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    const t = window.setTimeout(() => {
      ScrollTrigger.refresh();
      setPhase('reveal');
      window.setTimeout(release, 280);
    }, 120);
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Failsafe: if the destination never arrives, lift the cover instead of trapping the visitor behind it.
  useEffect(() => {
    if (phase !== 'cover') return;
    const t = window.setTimeout(() => {
      pending.current = null;
      setPhase('reveal');
      release();
    }, 12000);
    return () => window.clearTimeout(t);
  }, [phase]);

  const stripDone = () => {
    if (phaseRef.current === 'cover' && pending.current) router.push(pending.current);
    else if (phaseRef.current === 'reveal') setPhase('idle');
  };

  return (
    <Ctx.Provider value={{ go }}>
      {children}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] flex"
        style={{ visibility: phase === 'idle' ? 'hidden' : 'visible' }}
      >
        {Array.from({ length: STRIPS }, (_, i) => (
          <motion.div
            key={i}
            className="-mr-px h-full flex-1 bg-green"
            style={{ originY: phase === 'reveal' ? 0 : 1 }}
            initial={false}
            animate={{ scaleY: phase === 'cover' ? 1 : 0 }}
            transition={{ duration: phase === 'idle' ? 0 : 0.72, ease: EASE, delay: phase === 'idle' ? 0 : i * 0.055 }}
            onAnimationComplete={i === STRIPS - 1 ? stripDone : undefined}
          />
        ))}
        <div className="absolute inset-0 grid place-items-center overflow-hidden px-6 text-center">
          <div className="overflow-hidden py-[0.2em]">
            <motion.span
              className="display d-1 block text-mustard"
              initial={false}
              animate={{ y: phase === 'cover' ? '0%' : phase === 'reveal' ? '-130%' : '130%' }}
              transition={{ duration: phase === 'idle' ? 0 : 0.7, ease: EASE, delay: phase === 'cover' ? 0.28 : 0 }}
            >
              {label}
            </motion.span>
          </div>
        </div>
      </div>
    </Ctx.Provider>
  );
}

type TLinkProps = Omit<React.ComponentProps<typeof Link>, 'href'> & { to: string; label?: string; raw?: boolean };

// Internal link that runs the strip wipe. `to` is a path without the language prefix.
export function TLink({ to, label, raw, onClick, children, ...rest }: TLinkProps) {
  const { go } = usePageTransition();
  const { lang } = useLang();
  const href = raw ? to : `/${lang}${to}`;
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(href, label);
      }}
    >
      {children}
    </Link>
  );
}
