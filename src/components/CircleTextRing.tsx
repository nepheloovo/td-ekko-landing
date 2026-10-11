type Props = { text: string; className?: string; color?: string; fontSize?: number };

/** Asset-free circular text ring (the reference page used a 65 KB circle-text.svg). */
export function CircleTextRing({ text, className = '', color = '#EE61FF', fontSize = 26 }: Props) {
  const size = 600;
  const r = 240;
  const c = size / 2;
  const d = `M ${c} ${c - r} a ${r} ${r} 0 1 1 -0.01 0`;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true" focusable="false">
      <defs>
        <path id="ringpath" d={d} fill="none" />
      </defs>
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="0.6" opacity="0.35" />
      <circle cx={c} cy={c} r={r - 14} fill="none" stroke={color} strokeWidth="0.4" strokeDasharray="2 8" opacity="0.5" />
      <text fill={color} fontSize={fontSize} letterSpacing="8" fontFamily="'Space Mono', monospace">
        <textPath href="#ringpath" startOffset="0">{text.repeat(2)}</textPath>
      </text>
    </svg>
  );
}
