import { NAV_ITEMS } from '../data';
import { DistortedLink } from './DistortedLink';

/** Fixed navigation. pointer-events:none on the shell, .enabled on each target. */
export function Nav() {
  return (
    <section className="navigation no-events">
      <div className="nav-bar px-1 py-1 px-md-3 py-md-2 bg-black123">
        {/* The logo and the 245019 link were the two nav elements with no
            `should-animate`, so they were the only chrome that appeared while the
            loader was still fading — i.e. before the wipe, before the hero. They
            join the same reveal as the links below them. */}
        <a
          href="#archive"
          className="logo-wrapper position-relative d-flex flex-column enabled h6 should-animate"
          data-preset="opacity,y"
          data-delay="0.3"
          data-dur="0.9"
          data-fromy="16"
          style={{ textDecoration: 'none', color: '#fff' }}
        >
          <span className="font-A" style={{ fontSize: '2.1rem', lineHeight: 0.9, letterSpacing: '0.02em' }}>EKKO</span>
          <span className="font-M" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', opacity: 0.72 }}>真实伤害 / TRUE DAMAGE</span>
        </a>

        <div
          className="position-absolute r-0 mr-1 mr-md-2 mt-md-1"
          // `top: 0` is load-bearing: absolutely positioned with top:auto this
          // column took its static position, which put the first item above the
          // viewport top (clipped, and therefore never IntersectionObserver-revealed).
          style={{ textAlign: 'right', top: '2rem' }}
        >
          {NAV_ITEMS.map((item, i) => (
            <div className="lh-1 h6" key={item.href}>
              <a
                href={item.href}
                className="nav-item d-md-inline-block enabled should-animate d-none tap"
                data-delay={(0.4 + i * 0.05).toFixed(2)}
                data-preset="opacity,y"
                data-fromy="20"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="text-uppercase h6 move-down lh-1 font-C">{item.label}</span>
              </a>
            </div>
          ))}
          <div className="lh-1 h6 should-animate" data-preset="opacity,y" data-delay="0.62" data-dur="0.9" data-fromy="16" style={{ marginTop: '0.6em' }}>
            <DistortedLink text="245019" href="#lineup" className="font-M tap" innerClassName="h6" />
          </div>
        </div>
      </div>
    </section>
  );
}
