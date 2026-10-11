import { useRef, type ReactNode } from 'react';
import { useDistortedHover } from '../lib/hooks';

type Props = {
  text: string;
  href: string;
  className?: string;
  innerClassName?: string;
  reversed?: boolean;
  lineNear?: boolean;
  children?: ReactNode;
  external?: boolean;
  onClick?: () => void;
};

/** Liquid-underline link. The underline is displaced by #filter-4 on hover. */
export function DistortedLink({ text, href, className = '', innerClassName = '', reversed, lineNear, children, external, onClick }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const hover = useDistortedHover('#filter-4');
  return (
    <a
      ref={ref}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`distorted-link enabled position-relative ${lineNear ? 'line-near' : ''} ${reversed ? 'reversed' : ''} ${className}`}
      onClick={(e) => { if (onClick) { e.preventDefault(); onClick(); } }}
      onMouseEnter={() => ref.current && hover.onEnter(ref.current)}
      onMouseLeave={() => ref.current && hover.onLeave(ref.current)}
    >
      <span className={innerClassName}>{text} </span>
      {children}
      <span className="distorted-line" />
    </a>
  );
}
