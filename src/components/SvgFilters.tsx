/**
 * The seven displacement filters the reference site defines once and reuses.
 * #filter-4 is the one wired to every .distorted-link.
 */
export function SvgFilters() {
  return (
    <svg className="hidden position-absolute t-0 l-0 disabled overflow-hidden w-0 h-0" aria-hidden="true" focusable="false">
      <defs>
        <filter id="filter-1">
          <feTurbulence type="fractalNoise" baseFrequency="0" numOctaves="1" result="warp" />
          <feOffset dx="0" result="warpOffset" />
          <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="30" in="SourceGraphic" in2="warpOffset" />
        </filter>
        <filter id="filter-2">
          <feTurbulence type="fractalNoise" baseFrequency="0" numOctaves="20" result="warp" />
          <feOffset dx="0" result="warpOffset" />
          <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="40" in="SourceGraphic" in2="warpOffset" />
        </filter>
        <filter id="filter-3">
          <feTurbulence type="fractalNoise" baseFrequency="0.15 0.02" numOctaves="3" result="warp" />
          <feDisplacementMap scale="0" in="SourceGraphic" in2="warp" />
        </filter>
        <filter id="filter-4">
          <feTurbulence type="fractalNoise" baseFrequency="0" numOctaves="5" result="warp" />
          <feOffset dx="0" result="warpOffset" />
          <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="35" in="SourceGraphic" in2="warpOffset" />
        </filter>
        <filter id="filter-5">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.7" numOctaves="5" result="warp" />
          <feDisplacementMap scale="0" in="SourceGraphic" in2="warp" />
        </filter>
        <filter id="filter-6">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.07" numOctaves="5" seed="2" result="warp" />
          <feDisplacementMap scale="0" xChannelSelector="R" yChannelSelector="B" in="SourceGraphic" in2="warp" />
        </filter>
        <filter id="filter-7">
          <feTurbulence type="fractalNoise" baseFrequency="0" numOctaves="5" result="warp" />
          <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="90" in="SourceGraphic" in2="warp" />
        </filter>
      </defs>
    </svg>
  );
}
