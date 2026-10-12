import { useEffect } from 'react';
import { EkkoStageView } from './EkkoStageView';
import { SKINS } from '../data';

type Props = {
  open: boolean;
  glb: string;
  title: string;
  onClose: () => void;
  onPick: (glb: string, title: string) => void;
};

/**
 * The reference page opened a full-screen showreel video here. This project has
 * no video asset, so the equivalent stage is a live 3D turntable of the same GLB
 * — same fixed overlay contract (z 9999999, body scroll locked, background
 * canvas ticker paused while open), different medium.
 *
 * The skin strip exists because the card that opened this overlay is behind it:
 * without an in-overlay swap, picking a second skin would mean closing, scrolling
 * back to #lineup and opening again — and the cross-dissolve between models, the
 * one thing this overlay is uniquely able to show at full screen, would never be
 * seen at all. Each chip reuses `onPick`, so the stage behind stays in sync.
 */
export function TurntableOverlay({ open, glb, title, onClose, onPick }: Props) {
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

      <div className="showreel-skins" role="group" aria-label="切换皮肤模型">
        {SKINS.map((skin) => {
          const active = skin.glb === glb;
          return (
            <button
              key={skin.id}
              type="button"
              className={`stage-chip ${active ? 'is-on' : ''}`}
              aria-pressed={active}
              onClick={() => onPick(skin.glb, `${skin.cn} · ${skin.en}`)}
            >
              {skin.cn}
              <span className="font-M" style={{ opacity: 0.55, marginLeft: '0.5em' }}>{skin.id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
