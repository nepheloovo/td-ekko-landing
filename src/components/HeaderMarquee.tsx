import { useEffect, useRef, useState } from 'react';
import Scrollbar from 'smooth-scrollbar';
import { MARQUEE_TOP } from '../data';
import { MarqueeLoop } from './MarqueeLoop';

/**
 * Fixed top strip. The reference faded it out as the hero left the viewport —
 * reproduced here with a scroll-linked opacity driven by a passive listener on
 * the smooth-scrollbar container.
 */
export function HeaderMarquee({ scrollEl }: { scrollEl: React.RefObject<HTMLElement | null> }) {
  const [op, setOp] = useState(1);
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollEl.current;
    if (!el) return;
    // smooth-scrollbar keeps the container's scrollTop at 0 and scrolls the
    // content with a transform, so a native `scroll` listener never fires.
    // Ask the instance for its real offset instead.
    let detach = () => {};
    let tries = 0;
    const attach = () => {
      const bar = (Scrollbar as unknown as { get: (e: HTMLElement) => Scrollbar | undefined }).get(el);
      if (!bar) {
        if (tries++ < 40) requestAnimationFrame(attach);
        return;
      }
      const listener = () => {
        const limit = Math.max(bar.size.content.height - bar.size.container.height, 1);
        setOp(Math.max(0, 1 - bar.offset.y / Math.min(240, limit * 0.12)));
      };
      bar.addListener(listener);
      listener();
      detach = () => bar.removeListener(listener);
    };
    attach();
    return () => detach();
  }, [scrollEl]);

  return (
    <div ref={node} className="position-fixed t-0 l-0 w-100" style={{ zIndex: 99998, opacity: op, transition: 'opacity .2s linear', pointerEvents: op < 0.15 ? 'none' : 'auto' }}>
      {/* The reveal class goes on the <a>, not on the wrapper: the wrapper's
          inline `opacity` is rewritten by the scroll listener every frame, so a
          GSAP opacity tween on it would be clobbered. This way the strip is
          hidden until the opening sequence hands over, and still fades on scroll
          afterwards (the wrapper multiplies it). */}
      <a href="#lineup" className="should-animate" data-preset="opacity" data-delay="0.15" data-dur="1" style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '3px 0' }}>
        <MarqueeLoop
          items={MARQUEE_TOP}
          className="header-marquee h6 color-white"
          itemClassName="uppercase"
          repeat={11}
        />
      </a>
    </div>
  );
}
