import { Starburst } from './Starburst';
import { DistortedLink } from './DistortedLink';

const ROWS = [
  { text: '真实伤害', cls: 'row-cjk', delay: 0.10 },
  { text: 'TRUE', cls: 'row-1', delay: 0.22 },
  { text: 'DAMAGE', cls: 'row-2', delay: 0.34 },
  { text: 'EKKO', cls: 'row-3', delay: 0.46 },
];

/**
 * The signature sliced-column headline, transplanted verbatim.
 *
 * The four-row word stack is rendered FOUR times as .text-part siblings; each
 * copy is clipped to a slanted vertical band by clip-path (the polygons are the
 * source's exact values), and each band nudges its rows by a different `top`
 * offset — so the type reads as sheared along invisible diagonal seams.
 *
 * NOTE on the hairlines: the reference animated their `rotation` channel from
 * 80deg to data-torotation (0), yet the measured live transform was the CSS
 * rotate value (-7.05deg / -5.65deg / 7.7deg). Measured values win here, so the
 * lines keep their CSS rotation and only fade in.
 */
export function Hero({ onPlayPreview }: { onPlayPreview: () => void }) {
  return (
    <div className="waypoint page-header color-white px-0 pt-5 pb-3" id="archive">
      <div className="big-headline" style={{ width: '100%' }}>
        {[1, 2, 3, 4].map((part) => (
          <div key={part} className={`text-part part-${part} huge-text`} aria-hidden={part > 1}>
            {ROWS.map((row, i) => (
              <span
                key={row.text}
                className={`d-block inner-text text-row-${i + 1} should-animate ${row.cls}`}
                data-preset="opacity,y"
                data-delay={row.delay.toFixed(2)}
                data-dur="1.2"
                data-fromy="34"
              >
                {row.text}
              </span>
            ))}
          </div>
        ))}

        <div className="lines" aria-hidden="true">
          <div className="line line-1 should-animate" data-preset="opacity" data-delay="0.55" data-dur="1" />
          <div className="line line-2 should-animate" data-preset="opacity" data-delay="0.62" data-dur="1" />
          <div className="line line-3 should-animate" data-preset="opacity" data-delay="0.7" data-dur="1" />
        </div>

        <div aria-hidden="true" style={{ position: 'absolute', top: '74%', left: '76%', width: '15vw', opacity: 0.45 }}>
          <Starburst rays={84} color="#EE61FF" />
        </div>

        <div className="content-box">
          <div className="should-animate" data-preset="opacity,y" data-delay="0.8" data-dur="1">
            <p className="h6 font-M" style={{ margin: 0, letterSpacing: '0.14em', color: 'var(--cyan)' }}>
              SKIN 245019 · TRUE DAMAGE · 2019-11-10
            </p>
            <h1 className="font-C" style={{ fontSize: '1rem', textTransform: 'uppercase', lineHeight: 0.95, margin: '0.6rem 0 0.6rem', fontWeight: 500 }}>
              一个把四秒倒带当成武器的少年
            </h1>
            <p className="font-C" style={{ fontSize: '1rem', lineHeight: 1.25, opacity: 0.62, margin: 0 }}>
              佐恩的霓虹、黑胶质感的低音，和一台永远比对手快半拍的时间装置。这一页用真实游戏模型与自写 WebGL 着色器把它重建出来。
            </p>

            <div style={{ marginTop: '2.2rem' }}>
              <DistortedLink
                text="PLAY 3D 转台"
                href="#"
                onClick={onPlayPreview}
                className="h5 uppercase font-B lh-1 tap"
                innerClassName="h5"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="watch-top d-none d-md-block" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <span className="h6 font-M uppercase">SCROLL</span>
        <span className="h6 font-M uppercase">·</span>
        <span className="h6 font-M uppercase">3D 实时渲染</span>
        <span className="h6 font-M uppercase">·</span>
        <span className="h6 font-M uppercase">WebGL 背景舞台</span>
      </div>
    </div>
  );
}
