import { ABILITIES } from '../data';
import { Starburst } from './Starburst';
import { CircleTextRing } from './CircleTextRing';

/** Ability list — the services-list analogue: one centred uppercase column. */
export function Abilities() {
  return (
    <section id="abilities" className="waypoint services color-white position-relative pb-2" style={{ zIndex: 200 }}>
      <div className="waypoint d-flex flex-column align-items-center position-relative">
        <div className="position-relative d-flex flex-column align-items-center">
          <div className="d-flex align-items-center" style={{ marginBottom: '0.5rem' }}>
            <Starburst rays={90} color="#5BD6FF" style={{ width: '5rem', height: '5rem' }} />
          </div>

          <div aria-hidden="true" className="circle-text" style={{ pointerEvents: 'none' }}>
            <CircleTextRing text="TIME / REWIND / TIME / REWIND / " color="#EE61FF" className="w-100 rotating" />
          </div>

          <h5 className="uppercase font-B lh-1 d-none d-md-block" style={{ position: 'absolute', top: '-3.5rem', right: '-9rem', transform: 'rotate(90deg)', transformOrigin: 'center', whiteSpace: 'nowrap', letterSpacing: '0.06em', fontSize: '1.6rem' }}>
            Just About <i style={{ color: 'var(--cyan)' }}>时间</i>
          </h5>

          <div id="services-wrapper" className="list onTop should-animate position-relative" data-preset="opacity" data-delay="0.4" data-dur="1.2" style={{ padding: '2.25rem 2.25rem 0', zIndex: 2 }}>
            {ABILITIES.map((a) => (
              <div key={a.key} className="ability-row should-animate" data-preset="opacity,y" data-delay="0.1" data-dur="0.9" data-fromy="18" title={a.flavor}>
                <span className="ability-key">{a.key}</span>
                <span>{a.cn}</span>
                <i>{a.en}</i>
                <b className="d-none d-md-inline">{a.key === 'R' ? '倒带四秒' : a.flavor}</b>
              </div>
            ))}
          </div>

          <div className="pt-5 align-items-center justify-content-center d-none d-md-flex mt-5 mb-2">
            <div className="waypoint d-flex flex-column align-items-center">
              <div className="line should-animate" data-preset="opacity" data-delay="0.2" data-dur="1" />
              <p className="h6 font-M uppercase" style={{ marginTop: '1rem', color: 'var(--ash)', letterSpacing: '0.18em' }}>
                技能名与英文原名归 Riot Games · 文案为粉丝概念写法
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
