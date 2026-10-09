// Gate for entrance motion: hero animations wait until the preloader or the
// page-transition cover has cleared, so nothing plays underneath them.
let busy = true;
const queue: (() => void)[] = [];

export const hold = () => {
  busy = true;
};

export const release = () => {
  busy = false;
  queue.splice(0).forEach((cb) => cb());
};

export const onEnter = (cb: () => void) => {
  if (!busy) {
    cb();
    return () => {};
  }
  queue.push(cb);
  return () => {
    const i = queue.indexOf(cb);
    if (i >= 0) queue.splice(i, 1);
  };
};

// `?still` renders the settled page without motion, for screenshots and review.
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(window.location.search).has('still'));
