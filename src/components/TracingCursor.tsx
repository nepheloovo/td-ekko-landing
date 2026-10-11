import { useEffect, useRef } from 'react';

/**
 * TracingCursorLayer — the fixed full-viewport SVG whose <polyline> grows with
 * the pointer, leaving a persistent drawn trail across the page.
 * Reference values: stroke #A3EC26, width 2, fill none; ours is the cyan pulled
 * from the splash (#5BD6FF) since green is banned on this page.
 */
export function TracingCursor() {
  const poly = useRef<SVGPolylineElement>(null);
  const pts = useRef<number[]>([]);
  const raf = useRef(0);
  const dirty = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const onMove = (e: PointerEvent) => {
      const last = pts.current;
      const n = last.length;
      if (n >= 4) {
        const dx = e.clientX - last[n - 2];
        const dy = e.clientY - last[n - 1];
        if (dx * dx + dy * dy < 36) return; // ~6px minimum segment
      }
      last.push(e.clientX, e.clientY);
      // keep the trail bounded so the path stays cheap to repaint
      while (last.length > 240) last.splice(0, 2);
      dirty.current = true;
    };

    const loop = () => {
      if (dirty.current && poly.current) {
        const arr = pts.current;
        let s = '';
        for (let i = 0; i < arr.length; i += 2) s += `${Math.round(arr[i])},${Math.round(arr[i + 1])} `;
        poly.current.setAttribute('points', s.trim());
        dirty.current = false;
      }
      raf.current = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <svg className="tracing-layer" aria-hidden="true" focusable="false">
      <polyline
        id="drawing-polyline"
        ref={poly}
        fill="none"
        stroke="#5BD6FF"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points=""
        style={{ filter: 'drop-shadow(0 0 6px rgba(91,214,255,0.55))' }}
      />
    </svg>
  );
}
