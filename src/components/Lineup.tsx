import type React from 'react';
import { SKINS } from '../data';
import { Starburst } from './Starburst';

type Props = {
  activeGlb: string;
  onPick: (glb: string, title: string) => void;
};

/**
 * Skin lineup — the reference's 14-card listing reduced to the three Ekko skins
 * this workspace actually extracted. The card contract is transplanted intact:
 * col-sm-7 shell, >=1200px max-width 580px, an off-white "paper sheet" at
 * opacity .9679, 5:6 image frame, giant index numeral, centred title, tiny
 * uppercase copy.
 */
export function Lineup({ activeGlb, onPick }: Props) {
  return (
    <div className="waypoint cases-listing color-white d-flex flex-column align-items-center justify-content-center position-relative w-100 pt-5 pb-5 top-spacing" id="lineup">
      <div className="w-100 gradient-top" />

      <div className="d-flex align-items-center justify-content-center" style={{ marginTop: '-3rem' }}>
        <Starburst rays={72} color="#FB58FC" style={{ width: '9rem', height: '9rem', opacity: 0.5 }} />
      </div>

      <div className="waypoint position-relative mt-3">
        <h2 className="uppercase big-text onTop font-weight-300 text-center lh-08 headline font-B should-animate color-hot" data-preset="opacity,y" data-delay="0.2" data-dur="1.6" style={{ margin: 0 }}>
          Selected
          <br />
          Skins
        </h2>
        <div className="line should-animate d-flex justify-content-center py-2" data-preset="opacity" data-delay="0.2" data-dur="1">
          <span style={{ display: 'block', width: '1px', height: '18vw', transform: 'rotate(20deg)', background: 'hsla(0,0%,100%,.5)' }} />
        </div>
      </div>

      <div className="d-flex flex-column w-100 align-items-center pl-1 pr-1 pl-md-0 pr-md-0 pb-md-5">
        {SKINS.map((skin, i) => {
          const active = activeGlb === skin.glb;
          return (
            <div className="skin-card-outer mb-1 col-sm-7 should-animate" data-preset="opacity,y" data-delay={(0.15 + i * 0.12).toFixed(2)} data-dur="1" data-fromy="40" key={skin.id}>
              <div id={`case-${skin.id}`} className="skin-card row position-relative">
                <div className="sheet" style={{ opacity: 0.9679 }} />

                <div className="col-12 col-md-8 w-100 project-image">
                  <div
                    className="w-100 image-proportion position-relative"
                    style={{ '--frame-ar': `${(100 / skin.aspect).toFixed(2)}%` } as React.CSSProperties}
                  >
                    <img className="art" loading="lazy" alt={`${skin.cn} ${skin.en}`} src={skin.art} />
                    <div className="card-art-tint" />
                  </div>
                </div>

                <div className="col-12 col-md-4 d-flex align-items-start justify-content-end index-container">
                  <h3 className="d-flex align-items-end index lh-08 font-A" style={{ margin: 0 }}>{i + 1}</h3>
                </div>

                <div className="d-flex flex-md-row flex-column flex-column-reverse w-100 position-relative content-wrapper">
                  <div className="col-md-4 d-flex align-items-end mt-1 mt-md-0">
                    <button type="button" className={`card-pick ${active ? 'is-active' : ''}`} onClick={() => onPick(skin.glb, `${skin.cn} · ${skin.en}`)}>
                      {active ? '正在展示' : '查看模型'}
                    </button>
                  </div>
                  <div className="col-md-8 text-wrapper">
                    <h2 className="font-A bold mt-7 headline">{skin.cn}</h2>
                    <p className="meta" style={{ margin: '0 0 0.6rem', letterSpacing: '0.08em' }}>
                      {skin.en} · ID {skin.id} · {skin.released}
                    </p>
                    <p className="content tiny lh-14 uppercase col-11">
                      {skin.meshes} 部件 · {skin.tris} 三角面 · {skin.textures} 贴图 —— {skin.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-100 gradient-bottom" />
    </div>
  );
}
