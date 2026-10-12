import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

/**
 * TimeSweep — the opening sequence's EXIT, and the only choreography in this
 * page that runs before the reader has scrolled anything.
 *
 * MOTION THESIS
 * - The loader counted 0 -> 100. The exit reverses the device literally: a clock
 *   runs backwards (hands counter-clockwise, numeral counting 100 -> 000), then
 *   a magenta/cyan pair of wipes crosses the screen from the left and leaves to
 *   the right. Time is rewound, the frame is torn, and the hero is what is left.
 * - Timing: 1.75s total. Clock in over 0.45s while the loader is still fading;
 *   wipe covers by ~0.95s (that cover is what unmounts the loader visually);
 *   the bands collapse to the right, and only then does #archive animate in.
 *   The hero's four rows are NOT part of this timeline — they are the
 *   `should-animate` system, armed by App when `onDone` fires. That keeps the
 *   ordering one-directional: sweep ends -> rows reveal.
 * - Colour: the two bands are the page's two accents and nothing else, so the
 *   wipe reads as the palette being dragged across the frame rather than as a
 *   generic transition.
 * - Reduced motion: no clock, no wipe; a 0.25s fade and done.
 */

const REWIND_MS = 1750;

export function TimeSweep({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  // Kept in a ref so a parent re-render cannot restart the exit timeline.
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const pick = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel);
    const clock = pick('.time-clock');
    const bandA = pick('.sweep-band-a');
    const bandB = pick('.sweep-band-b');
    const numeral = pick('.clock-count');
    const hands = Array.from(el.querySelectorAll<HTMLElement>('.hand'));

    if (prefersReducedMotion()) {
      const t = window.setTimeout(() => done.current(), 250);
      return () => window.clearTimeout(t);
    }

    const counter = { v: 100 };
    const write = () => {
      if (numeral) numeral.textContent = String(Math.max(0, Math.round(counter.v))).padStart(3, '0');
    };
    write();

    const tl = gsap.timeline({ onComplete: () => done.current() });

    if (clock) {
      tl.fromTo(clock, { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 0);
    }
    tl.to(counter, { v: 0, duration: 1.0, ease: 'power1.inOut', onUpdate: write }, 0);
    if (hands.length) {
      // hour / minute / second, each further behind: the clock unwinds.
      tl.to(hands, {
        rotation: (i: number) => [-220, -540, -900][i] ?? -540,
        duration: 1.05,
        ease: 'power2.inOut',
      }, 0);
    }
    if (bandA) tl.to(bandA, { scaleX: 1, duration: 0.55, ease: 'power3.inOut' }, 0.3);
    if (bandB) tl.to(bandB, { scaleX: 1, duration: 0.55, ease: 'power3.inOut' }, 0.4);
    if (clock) tl.to(clock, { opacity: 0, scale: 1.22, duration: 0.45, ease: 'power2.in' }, 0.86);

    // Origin flips to the right edge while both bands are at scaleX 1 — at scale
    // 1 a transform-origin change is invisible, so the collapse has no seam.
    const bands = [bandB, bandA].filter(Boolean) as HTMLElement[];
    if (bands.length) {
      tl.set(bands, { transformOrigin: 'right center' }, 1.02);
      tl.to(bands, { scaleX: 0, duration: 0.62, ease: 'power3.inOut', stagger: 0.09 }, 1.04);
    }

    (window as unknown as Record<string, unknown>).__tdExit = {
      duration: REWIND_MS,
      progress: () => tl.progress(),
      // The whole exit is a 1.75s transient. A scroll-driven screenshot cannot
      // land on a chosen frame, so the timeline itself is exposed and can be
      // paused at an exact progress by a smoke test.
      pause: () => tl.pause(),
      seek: (p: number) => { tl.pause(); tl.progress(p); },
    };

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="time-sweep" ref={root} aria-hidden="true">
      <div className="sweep-band sweep-band-a" />
      <div className="sweep-band sweep-band-b" />
      <div className="time-clock">
        <div className="clock-ticks" />
        <span className="hand hand-hour" />
        <span className="hand hand-minute" />
        <span className="hand hand-second" />
        <p className="clock-count">100</p>
        <p className="clock-label font-M">REWIND · 时间倒转</p>
      </div>
    </div>
  );
}
