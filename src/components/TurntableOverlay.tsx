import { useEffect } from 'react';
import { EkkoStageView } from './EkkoStageView';

type Props = { open: boolean; glb: string; title: string; onClose: () => void };

/**
 * The reference page opened a full-screen showreel video here. This project has
 * no video asset, so the equivalent stage is a live 3D turntable of the same GLB
 * — same fixed overlay contract (z 9999999, body scroll locked, background
 * canvas ticker paused while open), different medium.
 */
export function TurntableOverlay({ open, glb, title, onClose }: Props) {
  useEffect(() => {
    document.body.classList.toggle('reel-open', open);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('reel-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="showreel">
      <div className="showreel-stage">
        <EkkoStageView glb={glb} compact />
      </div>
      <button type="button" className="showreel-close" onClick={onClose}>
        关闭 ESC
      </button>
      <div className="position-absolute" style={{ left: '1.6rem', bottom: '1.4rem' }}>
        <p className="h6 font-M uppercase" style={{ margin: 0, color: 'var(--cyan)' }}>3D 转台 · 实时渲染</p>
        <p className="h5 font-A" style={{ margin: 0 }}>{title}</p>
      </div>
    </div>
  );
}
