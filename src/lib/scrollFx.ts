import { useEffect } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap';

/**
 * Section choreography — the three scroll-linked set pieces.
 *
 * Every trigger here is created AFTER the opening sequence has finished (the
 * `enabled` flag), because the page's content height changes when #archive is
 * mounted and any trigger created before that would hold a stale document
 * offset. ScrollTrigger itself is bound to smooth-scrollbar by
 * `bindScrollTriggerToScrollbar` in hooks.ts, so a bare `trigger:` is enough.
 *
 * Each effect is also reachable from `window.__tdFx` for smoke tests: a burst
 * that lasts 0.4s is impossible to eyeball from a scrolling screenshot, so it
 * has to be reproducible on demand.
 */

/** Where `#abilities` has to be before the burst fires.
 *
 *  NOT `top bottom`, and not `top 72%` either. #abilities is 1182px tall at
 *  1440x900 — taller than the viewport — and its ring + rows sit 40px..800px
 *  below its top edge, so a trigger on the section's first pixel would burn the
 *  whole 0.75s burst on an empty region, and 72% still left the first ability
 *  row clipped by the bottom edge when the text split peaked. At 62% the ring
 *  and the first two rows are on screen at the moment of the peak. */
const ABILITIES_START = 'top 62%';

/** How hard the background is split, in UV units, at the peak of the burst.
 *  The backdrop is a low-frequency collage, so this component of the effect is
 *  a colour smear at the frame edges, not a hard fringe — the text split below
 *  is what carries the read. */
const CHROMA_PEAK = 0.08;

/** Text-channel split amplitude (em) at the peak.
 *
 *  The first pass used 0.05em, which is ~2px on a 2.2rem row: verified in the
 *  browser as *not visible at all*. 0.28em puts ~12px of magenta on one side and
 *  cyan on the other, which is what a chromatic aberration actually looks like. */
const SPLIT_PEAK = 0.28;

type AbilitiesOpts = {
  enabled: boolean;
  /** Drives the WebGL backdrop's per-channel UV offset. */
  setChroma: (v: number) => void;
  /** One-shot snowflake burst. */
  onSnow: () => void;
};

/**
 * #stage -> #abilities.
 *
 * On the single frame that #abilities arrives: a chromatic-aberration burst
 * (real RGB split in the background shader + a magenta/cyan text split in the
 * foreground), a snowflake burst, and then — only after those have spent
 * themselves — the `.circle-text` ring spins up and takes over as the section's
 * perpetual motion.
 */
export function useAbilitiesFx({ enabled, setChroma, onSnow }: AbilitiesOpts): void {
  useEffect(() => {
    if (!enabled) return;
    const section = document.getElementById('abilities');
    if (!section) return;

    const ring = section.querySelector<HTMLElement>('.circle-text');
    const textTargets = Array.from(section.querySelectorAll<HTMLElement>('.ability-row, h5, h6'));
    const reduced = prefersReducedMotion();

    // Pre-state is written by GSAP, never by CSS: if this effect never runs (or
    // GSAP fails), the ring keeps the stylesheet's static 0.4 opacity instead of
    // disappearing for good.
    if (ring && !reduced) gsap.set(ring, { opacity: 0, scale: 0.86, rotation: -24 });

    const burst = { k: 0 };
    const apply = () => {
      const k = burst.k;
      setChroma(k * CHROMA_PEAK);
      // Readable from a deployed build: proves the burst actually reached the
      // shader uniform rather than only moving a DOM style.
      (window as unknown as Record<string, unknown>).__tdChroma = k * CHROMA_PEAK;
      const a = (k * SPLIT_PEAK).toFixed(4);
      const shadow = k < 0.0015 ? 'none' : `-${a}em 0 rgba(238,97,255,.92), ${a}em 0 rgba(91,214,255,.92)`;
      textTargets.forEach((el) => { el.style.textShadow = shadow; });
    };

    let tl: gsap.core.Timeline | null = null;
    let spin: gsap.core.Tween | null = null;

    const play = () => {
      if (tl) return;
      // Verified defect: without this guard the trigger still fired under
      // `prefers-reduced-motion`, and a 0.75s stuttering magenta/cyan split is
      // exactly what that preference exists to suppress.
      if (reduced) {
        (window as unknown as Record<string, unknown>).__tdFxFired = 'abilities (reduced motion: burst suppressed)';
        return;
      }
      tl = gsap.timeline({
        onComplete: () => {
          apply();
          (window as unknown as Record<string, unknown>).__tdFxFired = 'abilities';
        },
      });

      // 1. the aberration: spike, stutter, settle. `keyframes` keeps the whole
      //    envelope in one tween so the peak can never be left applied.
      tl.to(burst, {
        keyframes: [
          { k: 1, duration: 0.1, ease: 'power4.out' },
          { k: 0.34, duration: 0.1, ease: 'none' },
          { k: 0.83, duration: 0.09, ease: 'none' },
          { k: 0, duration: 0.46, ease: 'power2.inOut' },
        ],
        onUpdate: apply,
      }, 0);

      // 2. snow, thrown on the same frame as the peak
      tl.add(() => onSnow(), 0.04);

      // 3. only then the ring: spin-up, then hand over to an endless rotation.
      //    The endless part lives OUTSIDE this timeline on purpose. A `repeat: -1`
      //    child makes the parent timeline immortal, which silently kills its
      //    onComplete — the first version put it inside and the completion
      //    callback (and the state reset it guards) never ran at all.
      //    (`reduced` already returned above, so the ring is only ever armed in
      //    the full-motion path.)
      if (ring) {
        tl.to(ring, {
          opacity: 0.4,
          scale: 1,
          rotation: 0,
          duration: 1.15,
          ease: 'power3.out',
          onComplete: () => { spin = gsap.to(ring, { rotation: 360, duration: 16, ease: 'none', repeat: -1 }); },
        }, 0.62);
      }
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: ABILITIES_START,
      once: true,
      onEnter: play,
    });

    // Smoke-test surface (same convention as __tdStage / __tdScrollTo).
    const fx = ((window as unknown as Record<string, unknown>).__tdFx ||= {}) as Record<string, unknown>;
    fx.abilities = play;
    fx.chroma = (v: number) => setChroma(v);
    fx.snow = () => onSnow();
    // Holds the burst envelope at an arbitrary point. The real thing peaks for
    // 0.1s and is gone in 0.75s, so a screenshot cannot land on it; this runs the
    // identical code path (burst.k -> apply()) for as long as needed.
    fx.split = (k: number) => { burst.k = k; apply(); };
    fx.state = () => ({
      duration: tl ? tl.duration() : null,
      progress: tl ? Number(tl.progress().toFixed(4)) : null,
      active: tl ? tl.isActive() : null,
      children: tl ? tl.getChildren(false).length : null,
      fired: (window as unknown as Record<string, unknown>).__tdFxFired ?? null,
    });

    // Fonts land after first paint and move every section boundary with them.
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

    return () => {
      st.kill();
      tl?.kill();
      spin?.kill();
      textTargets.forEach((el) => { el.style.textShadow = ''; });
      setChroma(0);
    };
  }, [enabled, setChroma, onSnow]);
}

/** The scrub that opens the mask, and how far the radius travels inside it.
 *
 *  Two measured mistakes are recorded here, because both were invisible in code
 *  review and only showed up in the browser:
 *
 *  1. `top 90%` started the scrub while the disc was still 100px BELOW the fold
 *     (the disc sits 190px into a 2762px section), so the circle appeared to open
 *     from nothing. 78% puts the disc right at the bottom edge as the reveal
 *     begins, which is where "the section pours out of the disc" reads.
 *  2. Growing the radius to 152% (the value needed to unclip the whole section)
 *     meant every visible frame of the opening happened in the first 3% of the
 *     scroll: a circle() radius is a percentage of sqrt(w²+h²)/√2, and this
 *     section is 2762px tall, so 100% is ~2200px while covering the viewport
 *     needs ~900px. 42% is 925px, which already contains the viewport at the end
 *     of the scrub — so `apply()` drops the clip outright at the top of the
 *     range instead of paying for the other 110%, and the opening fills the
 *     whole scrub. The end is at `top 26%` rather than 45% so that the reveal
 *     completes once #lineup owns the frame; at 45% the circle finished opening
 *     while the abilities list still held three quarters of the screen, and all
 *     that was revealed inside it was the section's own dark top gradient. */
const MASK_START = 'top 78%';
const MASK_END = 'top 26%';
const MASK_MAX_R = 42;

/**
 * #abilities -> #lineup.
 *
 * #lineup is revealed through a circular clip whose CENTRE is the light disc at
 * the top of the section — the disc is therefore the first thing through the
 * hole and the thing the section appears to pour out of. Scrubbed, so scrolling
 * back up re-closes it rather than leaving the page in a different state.
 */
export function useLineupMask(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const section = document.getElementById('lineup');
    const origin = section?.querySelector<HTMLElement>('[data-mask-origin]');
    if (!section || !origin || prefersReducedMotion()) return;

    const proxy = { r: 0 };
    let cx = 50;
    let cy = 6;

    // Measured, not assumed: this page's disc is not at the section's centre and
    // its offset changes across breakpoints. Both rects are read in the same
    // frame, so the shared smooth-scroll transform cancels out.
    const measure = () => {
      const s = section.getBoundingClientRect();
      const o = origin.getBoundingClientRect();
      if (s.width < 1 || s.height < 1) return;
      cx = ((o.left + o.width / 2 - s.left) / s.width) * 100;
      cy = ((o.top + o.height / 2 - s.top) / s.height) * 100;
    };
    const apply = () => {
      // At full travel the circle already contains the viewport, so the clip can
      // be removed rather than held at a radius the section would need at scroll
      // depths the reveal never reaches. Removing it is also what guarantees the
      // section is never clipped once the reader is inside it.
      section.style.clipPath = proxy.r >= MASK_MAX_R - 0.01
        ? 'none'
        : `circle(${proxy.r.toFixed(3)}% at ${cx.toFixed(3)}% ${cy.toFixed(3)}%)`;
    };

    measure();
    gsap.set(section, { clipPath: `circle(0% at ${cx}% ${cy}%)`, willChange: 'clip-path' });

    const tween = gsap.to(proxy, {
      r: MASK_MAX_R,
      ease: 'none',
      onUpdate: apply,
      scrollTrigger: {
        trigger: section,
        start: MASK_START,
        end: MASK_END,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onRefresh: () => { measure(); apply(); },
      },
    });

    const fx = ((window as unknown as Record<string, unknown>).__tdFx ||= {}) as Record<string, unknown>;
    fx.maskOrigin = () => ({ cx, cy, r: proxy.r });
    fx.mask = (r: number) => { proxy.r = r; apply(); };

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      section.style.clipPath = '';
      section.style.willChange = '';
    };
  }, [enabled]);
}
