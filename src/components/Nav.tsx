import { NAV_ITEMS } from '../data';
import { DistortedLink } from './DistortedLink';

/** Fixed navigation. pointer-events:none on the shell, .enabled on each target. */
export function Nav() {
  return (
    <section className="navigation no-events">
      <div className="nav-bar px-1 py-1 px-md-3 py-md-2 bg-black123">
        <a href="#archive" className="logo-wrapper position-relative d-flex flex-column enabled h6" style={{ textDecoration: 'none', color: '#fff' }}>
          <span className="font-A" style={{ fontSize: '2.1rem', lineHeight: 0.9, letterSpacing: '0.02em' }}>EKKO</span>
          <span className="font-M" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', opacity: 0.72 }}>真实伤害 / TRUE DAMAGE</span>
        </a>

        <div className="position-absolute r-0 mr-1 mr-md-2 mt-md-1" style={{ textAlign: 'right' }}>
          {NAV_ITEMS.map((item, i) => (
            <div className="lh-1 h6" key={item.href}>
              <a
                href={item.href}
                className="nav-item d-md-inline-block enabled should-animate d-none"
                data-delay={(0.4 + i * 0.05).toFixed(2)}
                data-preset="opacity,y"
                data-fromy="20"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <span className="text-uppercase h6 move-down lh-1 font-C">{item.label}</span>
              </a>
            </div>
          ))}
          <div className="lh-1 h6" style={{ marginTop: '0.6em' }}>
            <DistortedLink text="245019" href="#lineup" className="font-M" innerClassName="h6" />
          </div>
        </div>
      </div>
    </section>
  );
}
