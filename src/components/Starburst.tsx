type Props = {
  rays?: number;
  className?: string;
  color?: string;
  rayOpacity?: number;
  style?: React.CSSProperties;
};

/**
 * The reference site's rotating starburst. Drawn inline (no asset dependency):
 * N rays of alternating length plus a soft core, so it reads as the same
 * radiating "star" glyph at any size.
 */
export function Starburst({ rays = 72, className = '', color = '#EE61FF', rayOpacity = 0.75, style }: Props) {
  const items = Array.from({ length: rays }, (_, i) => {
    const a = (i / rays) * 360;
    const long = i % 3 === 0;
    const len = long ? 50 : i % 3 === 1 ? 38 : 27;
    return (
      <line
        key={i}
        x1="50"
        y1="50"
        x2={50 + len * Math.cos((a * Math.PI) / 180)}
        y2={50 + len * Math.sin((a * Math.PI) / 180)}
        stroke={color}
        strokeWidth={long ? 0.9 : 0.5}
        opacity={long ? rayOpacity : rayOpacity * 0.62}
      />
    );
  });
  return (
    <svg viewBox="0 0 100 100" className={`sun-icon rotating ${className}`} style={style} aria-hidden="true" focusable="false">
      {items}
      <circle cx="50" cy="50" r="3.4" fill={color} opacity={rayOpacity * 0.9} />
      <circle cx="50" cy="50" r="7" fill="none" stroke={color} strokeWidth="0.4" opacity={rayOpacity * 0.4} />
    </svg>
  );
}
