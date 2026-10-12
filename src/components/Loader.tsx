import { useEffect, useRef, useState } from 'react';
import { TimeSweep } from './TimeSweep';

type Props = {
  sources: string[];
  /** Loading finished: the counter reached 100. App mounts #archive on this. */
  onFinished: () => void;
  /** The EXIT段 finished. App arms the hero's should-animate system on this and
   *  unmounts the loader — the sweep's last frame is the hero's first. */
  onExitComplete?: () => void;
  minDurationMs?: number;
};

/**
 * OpeningSequence — self-contained loader.
 *
 * It owns its counter state on purpose: the reference drove the 0->100 numeral
 * from a per-frame loop, and keeping that loop inside this small subtree means
 * App never re-renders the page tree 60x/second.
 *
 * Stage 0  mount            -> counter 0, wordmarks hidden
 * Stage 1  preloading       -> images decoded + GLB fetched (counter creeps to 92)
 * Stage 2  completion       -> counter eases to 100, no earlier than minDurationMs
 * Stage 3  exit             -> TimeSweep: clock rewinds, magenta/cyan wipe covers,
 *                             then leaves to the right. This component is NOT
 *                             removed here (the reference removed #loader after a
 *                             flat 950ms fade); App removes it when the sweep
 *                             reports back, so the loader can never disappear
 *                             from under the exit animation.
 */
export function Loader({ sources, onFinished, onExitComplete, minDurationMs = 2200 }: Props) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const assetsReady = useRef(false);
  const started = useRef(performance.now());

  useEffect(() => {
    let cancelled = false;
    let settled = 0;
    const finishOne = () => {
      settled += 1;
      if (settled >= sources.length && !cancelled) assetsReady.current = true;
    };
    sources.forEach((url) => {
      const isModel = /\.(glb|gltf)$/i.test(url);
      const job = isModel
        ? fetch(url).then((r) => r.arrayBuffer()).then(() => undefined)
        : new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(url));
            img.src = url;
          });
      job.then(finishOne).catch(finishOne);
    });
    return () => {
      cancelled = true;
    };
  }, [sources]);

  useEffect(() => {
    let raf = 0;
    let value = 0;
    const tick = () => {
      const elapsed = performance.now() - started.current;
      // creep toward 92 while loading, then to 100, never before minDurationMs
      const goal = assetsReady.current ? 100 : Math.min(92, 6 + elapsed / 55);
      value += (goal - value) * 0.07;
      const timeUp = elapsed >= minDurationMs;
      if (assetsReady.current && value > 99.2 && timeUp) {
        setProgress(100);
        setDone(true);
        return;
      }
      setProgress(value);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [minDurationMs]);

  useEffect(() => {
    if (!done) return;
    onFinished();
  }, [done, onFinished]);

  const show = (at: number) => (progress > at ? 1 : 0);
  const slide = (at: number, from: number) => ({
    opacity: show(at),
    transform: `translateX(${show(at) ? 0 : from}px)`,
    transition: 'opacity .7s ease, transform .7s ease',
  });

  return (
    <>
      <div
        className="loader loader-padding"
        style={{
          opacity: done ? 0 : 1,
          transition: 'opacity .9s ease',
          // The field is already transparent once the sweep has covered the
          // screen; without this the loader would keep swallowing clicks for the
          // whole 1.75s exit.
          pointerEvents: done ? 'none' : 'auto',
        }}
      >
      <div className="d-flex justify-content-between align-items-start">
        <p className="display-4 font-E" style={{ margin: 0, lineHeight: 1 }}>{Math.round(progress)}</p>
      </div>

      <div className="display-progress-wrapper">
        <p className="h6 font-C" style={{ margin: 0 }}>{Math.round(progress)}%</p>
      </div>

      <div className="d-flex justify-content-between align-items-end" style={{ fontFamily: "'Bodoni Moda','Noto Serif SC',serif" }}>
        <div>
          <h2 style={slide(8, -24)}>
            <span style={{ fontFamily: "'Noto Serif SC',serif", fontWeight: 900 }}>真实伤害</span>
          </h2>
          <h2 style={slide(18, -24)}>TRUE DAMAGE</h2>
        </div>

        <div className="d-none d-md-flex flex-grow justify-content-center">
          <p className="lh-12 h6 trans-white" style={{ margin: 0 }}>一个用时间残片与霓虹节拍写成的皮肤概念页</p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <h2 style={slide(28, 24)}>EKKO</h2>
          <h2 style={slide(38, 24)} className="font-M">
            <span style={{ fontSize: '0.3em', letterSpacing: '0.18em' }}>SKIN 245019 / 2019</span>
          </h2>
          <p className="lh-12 h6 font-M" style={{ margin: 0, fontSize: '0.5rem', opacity: 0.6 }}>
            粉丝概念设计 · 非商用 · 版权归 Riot Games
          </p>
        </div>
      </div>

        <div className="loader-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Sibling, not child: .loader fades its whole subtree to opacity 0, and the
          exit sequence has to stay at full strength while the counter goes. */}
      {done && <TimeSweep onDone={onExitComplete ?? (() => {})} />}
    </>
  );
}
