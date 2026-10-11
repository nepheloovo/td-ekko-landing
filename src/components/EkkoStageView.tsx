import { useEffect, useRef, useState } from 'react';
import { EkkoStage, type StageStats } from '../lib/ekko';

type Props = {
  glb: string;
  onReady?: (api: { setScroll: (p: number) => void }) => void;
  compact?: boolean;
};

/**
 * The 3D hero. Real GLB, real lights, pointer tilt + drag spin + scroll dolly,
 * plus a small instrument HUD so the page states what it is actually rendering.
 */
export function EkkoStageView({ glb, onReady, compact }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<EkkoStage | null>(null);
  const [stats, setStats] = useState<StageStats>({ ok: false, parts: 0, triangles: 0, loading: true });
  const [wire, setWire] = useState(false);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!canvas.current) return;
    const instance = new EkkoStage(canvas.current);
    stage.current = instance;
    instance.bind();
    instance.play();
    onReady?.({ setScroll: (p) => instance.setScroll(p) });
    return () => {
      instance.dispose();
      stage.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const instance = stage.current;
    if (!instance) return;
    let alive = true;
    setStats((s) => ({ ...s, loading: true }));
    instance.load(glb).then((s) => {
      if (!alive) return;
      setStats(s);
      (window as unknown as Record<string, unknown>).__tdStage = s;
    });
    return () => { alive = false; };
  }, [glb]);

  return (
    <div className="ekko-stage">
      <canvas ref={canvas} />
      <div className="stage-hud">
        <div className="d-flex flex-column" style={{ gap: '0.4rem' }}>
          <span className="stage-chip" style={{ border: 'none', background: 'none', padding: 0 }}>
            {stats.loading ? 'LOADING GLB…' : stats.ok ? `${stats.parts} PARTS · ${stats.triangles.toLocaleString()} TRIANGLES` : `GLB ERROR: ${stats.error?.slice(0, 40)}`}
          </span>
          <span className="stage-chip" style={{ border: 'none', background: 'none', padding: 0, opacity: 0.6 }}>
            拖拽旋转 · 移动指针看光照流动
          </span>
        </div>
        {!compact && (
          <div className="d-flex" style={{ gap: '0.5rem' }}>
            <button type="button" className={`stage-chip ${auto ? 'is-on' : ''}`} onClick={() => { setAuto((v) => !v); stage.current?.setAutoRotate(!auto); }}>
              自动旋转 {auto ? 'ON' : 'OFF'}
            </button>
            <button type="button" className={`stage-chip ${wire ? 'is-on' : ''}`} onClick={() => { setWire((v) => !v); stage.current?.setWireframe(!wire); }}>
              线框 {wire ? 'ON' : 'OFF'}
            </button>
            <button type="button" className="stage-chip" onClick={() => stage.current?.resetView()}>
              重置视角
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
