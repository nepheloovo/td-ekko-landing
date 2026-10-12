import { useEffect, useRef, type RefObject } from 'react';
import Scrollbar from 'smooth-scrollbar';
import { gsap, CustomEase, ScrollTrigger } from './gsap';

export { gsap, CustomEase, ScrollTrigger };

/**
 * ScrollRevealWaypoint — the `should-animate` + `data-preset` system.
 * Elements start at opacity 0 (see .should-animate in index.css) and tween in
 * when they enter the viewport, honouring data-delay / data-dur / data-fromy /
 * data-fromx / data-fromrotation / data-torotation.
 */
export function useWaypointReveal(root: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    if (!enabled || !root.current) return;
    const nodes = Array.from(root.current.querySelectorAll<HTMLElement>('.should-animate'));
    if (!nodes.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      nodes.forEach((n) => { n.style.opacity = '1'; n.style.transform = 'none'; });
      return;
    }

    const tweens = new Map<HTMLElement, gsap.core.Tween>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          const preset = (el.dataset.preset || 'opacity,y').split(',').map((s) => s.trim());
          const delay = parseFloat(el.dataset.delay || '0');
          const dur = parseFloat(el.dataset.dur || '1');
          const fromY = el.dataset.fromy ? parseFloat(el.dataset.fromy) : 24;
          const fromX = el.dataset.fromx ? parseFloat(el.dataset.fromx) : -24;
          const fromRot = el.dataset.fromrotation ? parseFloat(el.dataset.fromrotation) : 0;
          const toRot = el.dataset.torotation ? parseFloat(el.dataset.torotation) : 0;

          const from: gsap.TweenVars = {};
          const to: gsap.TweenVars = { duration: dur, delay, ease: 'power2.out', overwrite: 'auto' };
          if (preset.includes('opacity')) { from.opacity = 0; to.opacity = 1; }
          if (preset.includes('y')) { from.y = fromY; to.y = 0; }
          if (preset.includes('x')) { from.x = fromX; to.x = 0; }
          if (preset.includes('rotation')) { from.rotation = fromRot; to.rotation = toRot; }
          gsap.set(el, from);
          tweens.set(el, gsap.to(el, to));
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    nodes.forEach((n) => { gsap.set(n, { opacity: 0 }); io.observe(n); });

    return () => {
      io.disconnect();
      tweens.forEach((t) => t.kill());
    };
  }, [root, enabled]);
}

export type ScrollApi = {
  setProgress: (p: number) => void;
  scrollTo: (y: number, ms?: number) => void;
} | null;

/**
 * ScrollTrigger lives on `window` by default. This page never scrolls the
 * window: `html{overflow:hidden}` + smooth-scrollbar translates `.scroll-content`
 * inside a fixed-height wrapper. Without a proxy, every ScrollTrigger would
 * compute every trigger position against a window that never moves, so nothing
 * would ever fire.
 *
 * `scrollerProxy` gives ScrollTrigger a scroller whose scrollTop we can read and
 * write, and whose viewport rect is declared as the window (the wrapper really is
 * viewport-sized). Because `.scroll-content` is translated by -scrollTop, an
 * element's `getBoundingClientRect().top` is already document-position minus
 * scroll, so `scrollTop + rect.top` lands on the right document offset — the same
 * arithmetic ScrollTrigger does for a native scroller.
 *
 * `ScrollTrigger.defaults({ scroller })` means section hooks below do NOT have to
 * remember to pass `scroller` — a forgotten argument is a silent no-op, and that
 * class of bug is invisible in review.
 */
function bindScrollTriggerToScrollbar(el: HTMLElement, bar: Scrollbar): void {
  ScrollTrigger.scrollerProxy(el, {
    scrollTop(value) {
      if (typeof value === 'number') bar.scrollTo(0, value, 0);
      return bar.offset.y;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: 'transform',
  });
  // ScrollTrigger.update is cheap and idempotent; the smooth-scrollbar listener
  // fires from its own rAF loop, which is the only thing that moves the content.
  bar.addListener(ScrollTrigger.update);
  ScrollTrigger.defaults({ scroller: el });
}

/** SmoothScroll — smooth-scrollbar on the wrapper; reports normalised progress. */
export function useSmoothScroll(
  wrapper: RefObject<HTMLElement | null>,
  content: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
): RefObject<ScrollApi> {
  const api = useRef<ScrollApi>(null);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    let bar: Scrollbar | null = null;
    try {
      bar = Scrollbar.init(el, { damping: 0.1, alwaysShowTracks: false, renderByPixels: true });
    } catch {
      return; // fall back to native scrolling rather than break the page
    }

    const read = () => {
      if (!bar) return 0;
      const limit = Math.max(bar.size.content.height - bar.size.container.height, 1);
      return Math.min(Math.max(bar.offset.y / limit, 0), 1);
    };
    const listener = () => onProgress(read());
    bar.addListener(listener);
    onProgress(read());
    bindScrollTriggerToScrollbar(el, bar);

    api.current = {
      setProgress: () => {},
      scrollTo: (y: number, ms = 900) => bar?.scrollTo(0, y, ms),
    };
    // Smoke-test handles: jump to an exact anchor and read the scroll limit from a
    // deployed build, instead of fighting smooth-scrollbar's momentum with wheels.
    (window as unknown as Record<string, unknown>).__tdScrollTo = (y: number, ms = 0) => bar?.scrollTo(0, y, ms);
    (window as unknown as Record<string, unknown>).__tdLimit = () =>
      Math.max(bar!.size.content.height - bar!.size.container.height, 1);
    (window as unknown as Record<string, unknown>).__tdScrollTop = () => bar!.offset.y;

    const onAnchor = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!target || !bar) return;
      const id = target.getAttribute('href')!.slice(1);
      const node = id ? document.getElementById(id) : null;
      if (!node) return;
      e.preventDefault();
      const top = node.getBoundingClientRect().top + bar.offset.y;
      bar.scrollTo(0, top - window.innerHeight * 0.08, 1100);
    };
    document.addEventListener('click', onAnchor);

    return () => {
      document.removeEventListener('click', onAnchor);
      // Every ScrollTrigger on the page belongs to this scroller; tear them all
      // down with it (React StrictMode runs this effect twice in dev).
      ScrollTrigger.getAll().forEach((t) => t.kill());
      bar?.removeListener(ScrollTrigger.update);
      bar?.removeListener(listener);
      bar?.destroy();
      bar = null;
    };
  }, [wrapper, content, onProgress]);

  return api;
}

/**
 * DistortedLink — SVG turbulence displacement on hover, driven by GSAP.
 * Mirrors the source contract: on enter attach `filter:url(#filter-N)` to the
 * underline, tween the feTurbulence baseFrequency .04 -> 0 over .6s with the
 * rough ease, then detach the filter.
 */
export function useDistortedHover(filterId = '#filter-4') {
  const tweens = useRef<WeakMap<HTMLElement, gsap.core.Timeline>>(new WeakMap());
  return {
    onEnter(el: HTMLElement) {
      const line = el.querySelector<HTMLElement>('.distorted-line');
      const turb = document.querySelector<SVGFETurbulenceElement>(`${filterId} > feTurbulence`);
      if (!line || !turb) return;
      const values = { t: 0.04 };
      line.style.filter = `url(${filterId})`;
      const tl = gsap.timeline({
        onComplete: () => { line.style.filter = 'none'; },
      });
      tl.to(values, {
        t: 0,
        duration: 0.6,
        ease: 'rough',
        onUpdate: () => turb.setAttribute('baseFrequency', values.t.toFixed(4)),
      });
      tweens.current.set(el, tl);
    },
    onLeave(el: HTMLElement) {
      tweens.current.get(el)?.kill();
    },
  };
}
