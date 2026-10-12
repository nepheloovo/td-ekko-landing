import { MARQUEE_FOOT, SOCIALS } from '../data';
import { MarqueeLoop } from './MarqueeLoop';

export function Footer({ onPlayPreview }: { onPlayPreview: () => void }) {
  return (
    <div className="waypoint page-footer color-white d-flex align-items-center justify-content-center position-relative pb-4">
      <div className="gradient-foot" />
      <div className="d-flex flex-column flex-md-row h-100 w-100 flex-column-reverse">
        <div className="col-md-6 justify-content-center justify-content-md-start mt-2 mt-md-0 d-none d-md-flex">
          <div className="d-flex flex-row-reverse flex-md-column justify-content-md-end align-items-center align-items-md-start social">
            <h5 className="uppercase mb-md-3" style={{ opacity: 0.75 }}>
              © Riot Games · 艾克与真实伤害归 Riot Games 所有
              <br />
              本页为粉丝概念设计，非官方，非商用
            </h5>
            <div className="footer-rainbow-rule w-100" style={{ marginBottom: '1.4rem' }} />
            <p className="h6 font-M uppercase" style={{ opacity: 0.5, letterSpacing: '0.12em' }}>
              3D 资产：CommunityDragon 镜像资源 · 自建 GLB 管线
            </p>
          </div>
        </div>

        <div className="col-md-6 d-flex flex-column justify-content-center justify-content-md-start justify-content-between align-items-center align-items-md-start">
          <h5 className="uppercase should-animate font-C" style={{ opacity: 0.8, maxWidth: '22ch' }} data-preset="opacity,y" data-delay="0.1" data-dur="1">
            你可以在这里继续看：官方皮肤页、英雄页面、以及本页用到的社区资源
          </h5>

          <div className="social d-flex flex-column" style={{ margin: '2rem 0' }}>
            {SOCIALS.map((s, i) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="uppercase cursor-pointer font-B should-animate enabled"
                data-preset="opacity,x" data-delay={(0.1 + i * 0.06).toFixed(2)} data-dur="0.8"
                style={{ textDecoration: 'none', color: '#fff', fontSize: '2.2rem', lineHeight: 1.35 }}
              >
                {s.label}
              </a>
            ))}
          </div>

          <button type="button" onClick={onPlayPreview} className="btn-play" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <span className="d-flex" style={{ color: 'var(--magenta)', fontSize: '1.3rem', fontFamily: "'Bodoni Moda','Noto Serif SC',serif" }}>
              let's watch it in 3D
            </span>
          </button>
        </div>
      </div>

      <div className="d-flex w-100 watch-bottom">
        <MarqueeLoop items={MARQUEE_FOOT} className="h6 uppercase" repeat={14} onClick={onPlayPreview} />
      </div>
    </div>
  );
}
