import { useEffect, useRef, useState } from 'react';

/**
 * ParticleTrail — the pointer trail, as time shards.
 *
 * MOTION THESIS
 * - Focal moment: the pointer drags time fragments loose. This replaces the drawn
 *   polyline that was transplanted from the reference site (`#drawing-polyline`);
 *   a persistent line is a drawing tool, while this subject is a boy with a time
 *   device, so the trail is *material* that spills and dies rather than a stroke
 *   that accumulates. Specific to this world, not generic sparkle.
 * - Material: additive glowing shards — a soft core plus a rotated sliver —
 *   tinted from the page's two accents (cyan #5BD6FF, magenta #EE61FF), each
 *   inheriting a fraction of the pointer's velocity.
 * - Timing: 550-1000ms life, exit faster than entrance (alpha falls on a power
 *   curve so the last third dies hardest). No bounce or elastic.
 * - Feedback: a pointerdown emits a small burst, so the trail acknowledges the
 *   click as well as the movement.
 * - Budget: one Canvas 2D layer, pooled particles, hard cap 200 live, a single
 *   rAF loop, DPR capped at 2, loop suspended while the tab is hidden (a
 *   nonessential loop must stop when offscreen), and zero React state per frame.
 * - Reduced motion: not mounted at all. The trail carries no state and no
 *   feedback the page depends on, so removing it loses no meaning.
 */

type Shard = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  vr: number;
  tint: 0 | 1;
  shard: boolean;
};

const MAX = 200;
const GRAVITY = 12; // px/s^2, a slow settle — sand, not sparks falling
const FRICTION = 2.4; // per second
const DPR_CAP = 2;

/** Pre-rendered radial glow, one sprite per tint. Cheaper than per-particle gradients. */
function makeSprite(rgb: string): HTMLCanvasElement {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${rgb},0.95)`);
  g.addColorStop(0.35, `rgba(${rgb},0.42)`);
  g.addColorStop(0.7, `rgba(${rgb},0.11)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

export function ParticleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Reduced motion removes the layer entirely (no canvas in the DOM, no loop).
  const [enabled] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const sprites = [makeSprite('91,214,255'), makeSprite('238,97,255')];
    const pool: Shard[] = [];
    let next = 0;
    let raf = 0;
    let running = true;
    let last = performance.now();
    let pointer = { x: -100, y: -100, vx: 0, vy: 0, t: 0 };
    let emitted = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (x: number, y: number, dirX: number, dirY: number, burst: boolean) => {
      let p: Shard;
      if (pool.length < MAX) {
        p = { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 1, rot: 0, vr: 0, tint: 0, shard: false };
        pool.push(p);
      } else {
        p = pool[next];
        next = (next + 1) % MAX;
      }
      const spread = burst ? 1.5 : 0.8;
      const life = (burst ? 700 : 700) + Math.random() * 550;
      p.x = x + (Math.random() - 0.5) * (burst ? 14 : 5);
      p.y = y + (Math.random() - 0.5) * (burst ? 14 : 5);
      p.vx = dirX * (burst ? 0.55 : 0.13) + (Math.random() - 0.5) * 34 * spread;
      p.vy = dirY * (burst ? 0.55 : 0.13) + (Math.random() - 0.5) * 34 * spread;
      p.maxLife = life;
      p.life = life;
      p.size = (burst ? 10 : 7) + Math.random() * 15;
      p.rot = Math.random() * Math.PI;
      p.vr = (Math.random() - 0.5) * 4.5;
      p.tint = Math.random() < 0.62 ? 0 : 1; // cyan-dominant, magenta accent
      p.shard = Math.random() < 0.35;
      emitted++;
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(now - pointer.t, 1);
      pointer.vx = ((e.clientX - pointer.x) / dt) * 1000;
      pointer.vy = ((e.clientY - pointer.y) / dt) * 1000;
      pointer.t = now;
      const far = pointer.x < -50;
      const dist = far ? 0 : Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y);
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (far) return;
      // distance-based emission: slow movement does not spam, fast movement streams
      const n = Math.max(1, Math.min(5, Math.floor(dist / 6) + 1));
      for (let i = 0; i < n; i++) spawn(e.clientX, e.clientY, pointer.vx, pointer.vy, false);
    };

    const onDown = (e: PointerEvent) => {
      for (let i = 0; i < 10; i++) spawn(e.clientX, e.clientY, 0, 0, true);
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (p.life <= 0) continue;
        p.life -= dt * 1000;
        if (p.life <= 0) continue;
        const damp = Math.max(0, 1 - FRICTION * dt);
        p.vx *= damp;
        p.vy = p.vy * damp + GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        const t = p.life / p.maxLife; // 1 -> 0
        const alpha = Math.pow(t, 1.4); // exit faster than entrance, without a hard cut
        const size = p.size * (0.45 + 0.55 * t);

        ctx.globalAlpha = alpha * 0.9;
        ctx.drawImage(sprites[p.tint], p.x - size, p.y - size, size * 2, size * 2);

        if (p.shard) {
          // the sliver is what makes it read as a fragment rather than bokeh
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.tint === 0 ? 'rgba(180,238,255,0.95)' : 'rgba(255,196,255,0.95)';
          const len = size * 1.5;
          ctx.fillRect(-len * 0.5, -0.8, len, 1.6);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(frame);

    // Smoke-test surface (same convention as __tdBackdrop / __tdStage): lets an
    // automated check confirm the trail is alive on a deployed build.
    (window as unknown as Record<string, unknown>).__tdTrail = {
      get emitted() {
        return emitted;
      },
      get live() {
        return pool.reduce((n, p) => n + (p.life > 0 ? 1 : 0), 0);
      },
      get running() {
        return running;
      },
      get pool() {
        return pool.length;
      },
    };

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} className="particle-trail" aria-hidden="true" />;
}
