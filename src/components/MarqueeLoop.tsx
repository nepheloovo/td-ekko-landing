import type { ReactNode } from 'react';

type Props = {
  items: string[];
  className?: string;
  itemClassName?: string;
  separator?: ReactNode;
  href?: string;
  onClick?: () => void;
  repeat?: number;
};

/**
 * MarqueeLoop — the reference's seamless marquee contract: the item sequence is
 * rendered TWICE (.marquee-1 / .marquee-2) and animated with a -15s offset so the
 * loop never gaps. Keyframes live in index.css.
 */
export function MarqueeLoop({ items, className = '', itemClassName = '', separator, href, onClick, repeat = 1 }: Props) {
  const seq: ReactNode[] = [];
  for (let r = 0; r < repeat; r++) {
    items.forEach((it, i) => {
      seq.push(
        <span key={`${r}-${i}`} className={`marquee-span ${itemClassName}`}>
          {it}
        </span>,
      );
      if (separator) seq.push(<span key={`${r}-${i}-sep`} className="marquee-span">{separator}</span>);
    });
  }

  const inner = (
    <div className={`marquee d-flex w-100 ${className} animating`}>
      <div className="marquee-1">{seq}</div>
      <div className="marquee-2">{seq}</div>
    </div>
  );

  if (href) {
    return (
      <a className="marquee-wrapper w-100 enabled t-0 d-block l-0" href={href} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <div className="marquee-wrapper w-100 enabled" onClick={onClick}>
      {inner}
    </div>
  );
}
