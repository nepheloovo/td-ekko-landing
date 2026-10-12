import { useEffect, useRef } from 'react';
import { Backdrop as BackdropGL, type BackdropState } from '../lib/backdrop';
import { asset } from '../lib/asset';

export type BackdropApi = {
  setScroll: (p: number) => void;
  /** RGB split for the abilities burst; 0 at rest. */
  setChroma: (v: number) => void;
  stop: () => void;
  start: () => void;
  state: BackdropState;
};

/** Fixed full-viewport WebGL stage + its grade and grain plates. */
export function Backdrop({ onReady }: { onReady?: (api: BackdropApi) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const gl = useRef<BackdropGL | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    const instance = new BackdropGL(canvas.current, [asset('assets/bg-lower.webp'), asset('assets/bg-upper.webp')]);
    gl.current = instance;
    let alive = true;
    instance.init().then((state) => {
      if (!alive) return;
      if (!state.ok) console.warn('[backdrop]', state.error);
      const api = {
        setScroll: (p: number) => instance.setScroll(p),
        setChroma: (v: number) => instance.setChroma(v),
        stop: () => instance.stop(),
        start: () => instance.play(),
        state,
      };
      // Smoke-test surface: lets an automated check read the stage state from a
      // deployed static build (no dev-only guard, deliberately).
      (window as unknown as Record<string, unknown>).__tdBackdrop = api;
      onReady?.(api);
    });
    return () => {
      alive = false;
      instance.dispose();
      gl.current = null;
    };
  }, [onReady]);

  return (
    <>
      <div className="background-stage">
        <canvas ref={canvas} />
      </div>
      <div className="backdrop-grade" />
      <div className="backdrop-grain" />
    </>
  );
}
