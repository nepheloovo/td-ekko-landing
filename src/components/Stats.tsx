import { STATS } from '../data';

/** Stats block — the awards-section analogue, carrying real manifest numbers. */
export function Stats() {
  return (
    <div id="stats" className="waypoint stats color-white py-md-5 pb-5 position-relative top-spacing" style={{ background: '#000' }}>
      <div className="waypoint">
        <div className="display-1 d-flex align-items-center justify-content-center color-ash headline-wrapper">
          <div className="display-1 col-md-8 font-A thin-font bold should-animate lh-1" data-preset="opacity,y" data-delay="0.3" data-dur="1.2">
            数据
          </div>
        </div>
        <div className="display-1 d-flex align-items-center justify-content-between offset-md-3 color-ash headline-wrapper">
          <div className="h2 and align-self-center font-A thin-font bold should-animate lh-1" data-preset="opacity" data-delay="0.6" data-dur="1">
            与
          </div>
          <div className="display-1 font-A thin-font bold should-animate lh-1" data-preset="opacity,y" data-delay="0.4" data-dur="1.2">
            规格
          </div>
        </div>
        <div className="display-1 d-flex align-items-center color-ash headline-wrapper last">
          <div className="display-1 stat-word font-A thin-font bold should-animate d-none d-md-flex lh-1 col-md-5" data-preset="opacity,y" data-delay="0.5" data-dur="1.2">
            TRUE DAMAGE
          </div>
          <div className="display-1 stat-word font-A thin-font bold should-animate d-flex d-md-none lh-1" data-preset="opacity,y" data-delay="0.5" data-dur="1.2">
            245019
          </div>
        </div>
      </div>

      <div className="d-flex flex-row px-1 px-md-0 justify-content-center" style={{ marginTop: '3.5rem' }}>
        <div className="col-md-6 color-white pl-md-3">
          {STATS.map((row) => (
            <div className="stat-row should-animate" data-preset="opacity,y" data-delay="0.1" data-dur="0.8" data-fromy="14" key={row.label}>
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
          <p className="h6 font-M uppercase" style={{ marginTop: '1.6rem', opacity: 0.45, letterSpacing: '0.1em' }}>
            数值来自本工作区 ekko-truedamage/ 工具包对 GLB 与 .skn 的逐字节校验结果
          </p>
        </div>
      </div>
    </div>
  );
}
