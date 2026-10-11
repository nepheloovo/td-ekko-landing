import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import Scrollbar from 'smooth-scrollbar';

gsap.registerPlugin(CustomEase);

/**
 * The reference site eased its liquid-link hover with RoughEase
 * (rough({template:none.out, strength:2, points:120, taper:false, randomize:true})).
 * RoughEase is not in the public gsap package, so we author the equivalent
 * jitter curve as a CustomEase path: fast rise, jitter, settle at 1.
 */
CustomEase.create('rough', 'M0,0 L0.06,0.42 L0.12,0.28 L0.18,0.55 L0.24,0.44 L0.3,0.66 L0.36,0.58 L0.44,0.72 L0.52,0.66 L0.6,0.8 L0.7,0.76 L0.8,0.88 L0.9,0.86 L0.96,0.97 L1,1');

export { gsap, CustomEase };

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

    api.current = {
      setProgress: () => {},
      scrollTo: (y: number, ms = 900) => bar?.scrollTo(0, y, ms),
    };
    // Smoke-test handles: jump to an exact anchor and read the scroll limit from a
    // deployed build, instead of fighting smooth-scrollbar's momentum with wheels.
    (window as unknown as Record<string, unknown>).__tdScrollTo = (y: number, ms = 0) => bar?.scrollTo(0, y, ms);
    (window as unknown as Record<string, unknown>).__tdLimit = () =>
      Math.max(bar!.size.content.height - bar!.size.container.height, 1);

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
