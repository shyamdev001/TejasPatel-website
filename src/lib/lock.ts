'use client';
import { scroller } from './gsap';

// Scroll lock shared by the preloader, menu and lightbox. Counted, so one layer
// closing never unlocks the page while another is still open.
let locks = 0;

const apply = () => {
  const on = locks > 0;
  document.documentElement.style.overflow = on ? 'hidden' : '';
  if (on) scroller.lenis?.stop();
  else scroller.lenis?.start();
};

export const lockScroll = () => {
  locks++;
  apply();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    apply();
  };
};

/** Arrow-key movement for a row of role="tab" buttons. */
export const tabKeys = (e: React.KeyboardEvent<HTMLElement>) => {
  const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
  if (!dir) return;
  const tabs = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')];
  const at = tabs.indexOf(document.activeElement as HTMLElement);
  if (at < 0) return;
  e.preventDefault();
  const next = tabs[(at + dir + tabs.length) % tabs.length];
  next.focus();
  next.click();
};
