import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export type SnowApi = { burst: (count?: number) => void };

type Flake = {
  x: number;
  y: number;
  vy: number;
  sway: number;
  swayPhase: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  vr: number;
  z: number;
  tint: 0 | 1 | 2;
  alive: boolean;
};

/** Live flake cap. The burst is a moment, not a weather system. */
const MAX = 260;
const DPR_CAP = 2;
const TINTS = ['91,214,255', '238,97,255', '251,255,241'] as const;

/**
 * SnowBurst — the snowflake burst thrown when #abilities arrives.
 *
 * MOTION THESIS
 * - Material: six-armed crystals (three crossing needles plus barbs), because a
 *   soft dot would read as dust and the page already has dust in its grain
 *   plate. Three tints only, taken from the palette: cyan first, magenta as the
 *   accent, hot white as the highlight.
 * - Timing: one throw of ~150 flakes from above the fold, 2.4-4.0s life, drifting
 *   down and swaying — the opposite gesture to the particle trail's fast, dying
 *   shards, so the two systems never read as the same effect twice.
 * - Budget: one pooled Canvas 2D layer, one rAF loop that stops itself the moment
 *   the last flake dies (an idle full-screen canvas is a cost with no payoff),
 *   DPR capped at 2, additive compositing, zero React state per frame.
 * - Reduced motion: not mounted at all.
 */
export const SnowBurst = forwardRef<SnowApi>(function SnowBurst(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pool = useRef<Flake[]>([]);
  const raf = useRef(0);
  const running = useRef(false);
  const last = useRef(0);
  const size = useRef({ w: 0, h: 0 });
  // Same contract as ParticleTrail: reduced motion removes the layer entirely
  // rather than slowing it down.
  const [enabled] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    size.current = { w: window.innerWidth, h: window.innerHeight };
  };

  const draw = (dt: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const { w, h } = size.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    let alive = 0;
    for (const f of pool.current) {
      if (!f.alive) continue;
      f.life += dt;
      if (f.life >= f.maxLife || f.y > h + 40) {
        f.alive = false;
        continue;
      }
      alive += 1;
      f.y += f.vy * dt * f.z;
      // Sway is integrated as velocity rather than added to x incrementally, so
      // a flake that sits still in time still moves in space.
      f.x += Math.sin(f.life * f.swayPhase) * f.sway * dt;
      f.rot += f.vr * dt;

      const p = f.life / f.maxLife;
      // Flat in, flat out: a flake that pops into existence reads as a glitch.
      const alpha = (p < 0.18 ? p / 0.18 : p > 0.7 ? (1 - p) / 0.3 : 1) * 0.82 * (0.55 + f.z * 0.45);
      if (alpha <= 0.004) continue;

      const r = f.size * f.z * (1 + 0.12 * Math.sin(f.life * 2.2));
      ctx.strokeStyle = `rgba(${TINTS[f.tint]},${alpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(0.6, 0.9 * f.z);
      ctx.beginPath();
      for (let i = 0; i < 3; i += 1) {
        const a = f.rot + (i * Math.PI) / 3;
        const dx = Math.cos(a) * r;
        const dy = Math.sin(a) * r;
        ctx.moveTo(f.x - dx, f.y - dy);
        ctx.lineTo(f.x + dx, f.y + dy);
        if (r > 6) {
          // barbs, on the two outer thirds of each needle
          for (const t of [0.55, 0.85]) {
            const bx = f.x + dx * t;
            const by = f.y + dy * t;
            const ba = a + Math.PI * 0.62;
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(ba) * r * 0.32, by + Math.sin(ba) * r * 0.32);
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(-ba) * r * 0.32, by + Math.sin(-ba) * r * 0.32);
          }
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (alive === 0) {
      running.current = false;
      ctx.clearRect(0, 0, w, h);
    }
  };

  const loop = () => {
    if (!running.current) return;
    const now = performance.now();
    const dt = Math.min((now - last.current) / 1000, 0.05);
    last.current = now;
    draw(dt);
    raf.current = requestAnimationFrame(loop);
  };

  useImperativeHandle(ref, () => ({
    burst(count = 150) {
      const canvas = canvasRef.current;
      if (!enabled || !canvas) return;
      resize();
      const { w, h } = size.current;
      const now = performance.now();

      let live = 0;
      for (const f of pool.current) if (f.alive) live += 1;
      const room = Math.max(0, MAX - live);
      const n = Math.min(count, room);
      for (let i = 0; i < n; i += 1) {
        const z = 0.45 + Math.random() * 0.75;
        const flake: Flake = {
          x: Math.random() * w,
          y: -30 - Math.random() * h * 0.35,
          vy: 26 + Math.random() * 78,
          sway: 6 + Math.random() * 26,
          swayPhase: 0.6 + Math.random() * 1.9,
          life: 0,
          maxLife: 2.4 + Math.random() * 1.6,
          size: 3.4 + Math.random() * 7.4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.9,
          z,
          tint: (Math.random() < 0.62 ? 0 : Math.random() < 0.72 ? 1 : 2) as 0 | 1 | 2,
          alive: true,
        };
        pool.current.push(flake);
      }
      if (pool.current.length > MAX) pool.current = pool.current.filter((f) => f.alive).slice(-MAX);

      if (!running.current) {
        running.current = true;
        last.current = now;
        raf.current = requestAnimationFrame(loop);
      }
      (window as unknown as Record<string, unknown>).__tdSnow = {
        live: pool.current.filter((f) => f.alive).length,
        spawned: n,
      };
    },
  }));

  useEffect(() => {
    if (!enabled) return;
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    const onHidden = () => {
      if (document.hidden && running.current) {
        running.current = false;
        cancelAnimationFrame(raf.current);
      }
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onHidden);
      running.current = false;
      cancelAnimationFrame(raf.current);
      pool.current = [];
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas className="snow-burst" ref={canvasRef} aria-hidden="true" />;
});
