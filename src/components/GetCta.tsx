import { DistortedLink } from './DistortedLink';
import { Starburst } from './Starburst';

/** Closing CTA — the contact-section analogue (three giant serif lines). */
export function GetCta() {
  return (
    <div id="get" className="waypoint contact-info color-white position-relative pt-md-5 pb-5 onTop top-spacing" style={{ fontFamily: "'Bodoni Moda','Noto Serif SC',serif" }}>
      <div className="gradient-veil" />

      <div className="d-flex align-items-center justify-content-center minus-margin big-text">
        <div className="big-text thin-font should-animate" data-preset="opacity,y" data-delay="0.1" data-dur="1">
          不要犹豫
        </div>
      </div>

      <div className="big-text d-flex align-items-center justify-content-center justify-content-md-between position-relative minus-margin">
        <div className="big-text thin-font should-animate mr-7 mr-md-0 position-relative" data-preset="opacity,y" data-delay="0.2" data-dur="1">
          <span>去 </span>
          <div className="sun-box d-md-flex d-none">
            <Starburst rays={96} color="#EE61FF" />
          </div>
        </div>
        <div className="big-text thin-font should-animate position-relative" data-preset="opacity,y" data-delay="0.3" data-dur="1">
          <span>看真实伤害</span>
          <div className="line position-absolute l-0 should-animate d-none d-md-block t-50" data-preset="opacity" data-delay="0.3" data-dur="1" />
        </div>
      </div>

      <div className="d-flex justify-content-center mt-5 mt-md-4 mt-xl-5 position-relative">
        <div className="big-text thin-font lh-08 mr-1 should-animate" data-preset="opacity,y" data-delay="0.4" data-dur="1">
          <span>在</span>
        </div>
        <div className="big-text thin-font lh-08 should-animate" data-preset="opacity,y" data-delay="0.5" data-dur="1">
          <span>峡谷里</span>
        </div>
      </div>

      <div className="d-flex flex-column align-items-center justify-content-center should-animate mt-5 mt-md-0" data-preset="opacity,y" data-delay="0.6" data-dur="1">
        <h6 className="uppercase small text-center my-2 lets-do d-none d-md-flex flex-column font-C color-white" style={{ opacity: 0.6 }}>
          官方皮肤页（非本页所属）
        </h6>
        <DistortedLink
          text="leagueoflegends.com"
          href="https://www.leagueoflegends.com/en-us/champions/ekko/"
          external
          className="email-link"
        />
        <h6 className="uppercase small mt-1 col-7 text-center font-C" style={{ opacity: 0.5 }}>
          本页为粉丝概念设计 · 非商用 · 不提供下载
        </h6>
      </div>
    </div>
  );
}
