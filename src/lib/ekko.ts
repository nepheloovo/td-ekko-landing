/**
 * EkkoStage — real 3D hero.
 *
 * Loads the GLB produced by the workspace toolkit (`ekko-truedamage/`), which
 * validated the mesh orientation: after its X-flip fix the character faces +Z,
 * i.e. straight at a camera parked on the +Z axis. Materials arrive as
 * baseColorTexture + metallic 0 with smooth per-vertex normals, so the look is
 * decided entirely by the lighting rig below.
 *
 * The rig is built from the splash palette: magenta key, cyan fill, gold rim.
 * Interaction: pointer tilt (lerped), drag to spin with inertia, scroll dolly,
 * and hot GLB swapping from the skin lineup.
 */
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type StageStats = {
  ok: boolean;
  error?: string;
  parts: number;
  triangles: number;
  loading: boolean;
};

/** One half of a cross-dissolve: a model fading between two opacities. */
type Fade = {
  root: THREE.Object3D;
  mats: THREE.MeshStandardMaterial[];
  t: number;
  dur: number;
  from: number;
  to: number;
  /** true for the outgoing half — it is removed and disposed when it hits 0. */
  outgoing: boolean;
};

/** How long a model swap takes to cross-dissolve. */
const DISSOLVE = 0.72;

/** Depth-first disposal of a loaded GLB subtree (geometry + textures + materials). */
function disposeTree(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry?.dispose();
    const mat = m.material as THREE.MeshStandardMaterial;
    mat?.map?.dispose();
    mat?.dispose();
  });
}

export class EkkoStage {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private loader = new GLTFLoader();
  private group = new THREE.Group();
  private current: THREE.Object3D | null = null;
  private raf = 0;
  private running = false;
  private dragging = false;
  private lastPointer = { x: 0, y: 0 };
  private spin = { x: 0, y: 0, vx: 0, vy: 0 };
  private tilt = { x: 0, y: 0 };
  private targetTilt = { x: 0, y: 0 };
  private scroll = 0;
  private scrollTarget = 0;
  private targetHeight = 3.1;
  private autoRotate = true;
  private key!: THREE.PointLight;
  private fill!: THREE.PointLight;
  private rim!: THREE.PointLight;
  private glow!: THREE.Mesh;
  private pmrem?: THREE.PMREMGenerator;
  private disposers: Array<() => void> = [];
  private disposed = false;
  private fades: Fade[] = [];
  public stats: StageStats = { ok: false, parts: 0, triangles: 0, loading: false };

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 0.15, 6.4);

    this.scene.add(this.group);

    // ---- lighting rig (palette-locked) ----------------------------------
    this.key = new THREE.PointLight(new THREE.Color('#EE61FF'), 55, 26, 2);
    this.key.position.set(2.4, 1.8, 3.2);
    this.fill = new THREE.PointLight(new THREE.Color('#5BD6FF'), 34, 24, 2);
    this.fill.position.set(-3.1, -0.6, 2.4);
    this.rim = new THREE.PointLight(new THREE.Color('#EA981A'), 26, 18, 2);
    this.rim.position.set(-1.2, 2.6, -2.8);
    this.scene.add(this.key, this.fill, this.rim);
    this.scene.add(new THREE.AmbientLight(new THREE.Color('#2A1B4A'), 1.5));

    // additive halo behind the model so the silhouette separates from the field
    this.glow = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 7.5),
      new THREE.MeshBasicMaterial({
        map: makeHaloTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.55,
      }),
    );
    this.glow.position.set(0, 0.1, -2.2);
    this.scene.add(this.glow);

    try {
      this.pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = this.pmrem.fromScene(new RoomEnvironment()).texture;
      this.scene.environmentIntensity = 0.35;
    } catch {
      /* environment is a nicety, never a hard dependency */
    }
  }

  async load(url: string): Promise<StageStats> {
    this.stats = { ...this.stats, loading: true };
    try {
      const gltf: GLTF = await this.loader.loadAsync(url);
      if (this.disposed) return this.stats;
      this.setModel(gltf.scene);
      this.stats = { ok: true, parts: this.countParts(gltf.scene), triangles: this.countTris(gltf.scene), loading: false };
    } catch (err) {
      this.stats = { ...this.stats, ok: false, error: String(err), loading: false };
    }
    return this.stats;
  }

  private countParts(root: THREE.Object3D): number {
    let n = 0;
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) n++;
    });
    return n;
  }

  private countTris(root: THREE.Object3D): number {
    let t = 0;
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry) {
        const g = m.geometry as THREE.BufferGeometry;
        t += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      }
    });
    return Math.round(t);
  }

  /**
   * Swap the model with a cross-dissolve.
   *
   * The outgoing mesh is NOT removed on the frame the new one arrives — it is
   * kept, made transparent and faded to 0 over DISSOLVE seconds while the
   * incoming model fades up from 0. Two details make the cross actually read as
   * one image turning into another rather than as two ghosts:
   *
   *   - renderOrder -1 on the outgoing, +1 on the incoming, so the new model is
   *     always composited ON TOP of the old one (three sorts the transparent
   *     pass by renderOrder first, and both models sit at the same distance).
   *   - depthWrite stays ON for the incoming half, so it occludes its own back
   *     faces instead of reading as a glass shell while it fades up. Only the
   *     outgoing half gives up depth writes.
   *
   * Swapping again mid-dissolve is safe: the previous fade record is dropped and
   * the new one starts from whatever opacity the model currently has.
   */
  private setModel(root: THREE.Object3D) {
    if (this.current) {
      this.startFade(this.current, 0, DISSOLVE, true);
    }

    // Normalise: centre on X/Z, sit on Y=0, scale to a constant on-screen height.
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = this.targetHeight / Math.max(size.y, 0.0001);
    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -box.min.y * scale - this.targetHeight * 0.42, -center.z * scale);
    root.rotation.y = 0;

    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.metalness = 0.12;
          mat.roughness = 0.62;
          mat.envMapIntensity = 0.4;
        }
        m.castShadow = false;
        m.receiveShadow = false;
      }
    });

    this.group.add(root);
    this.current = root;
    this.spin = { x: 0, y: 0, vx: 0, vy: 0 };
    // The incoming half. First load included: a model that materialises out of
    // the field reads as arriving, whereas a pop-in reads as a loading artefact.
    this.startFade(root, 1, DISSOLVE * 0.8, false, 0);
  }

  /** Register (or replace) a fade record for `root` and prepare its materials. */
  private startFade(root: THREE.Object3D, to: number, dur: number, outgoing: boolean, fromOverride?: number) {
    // A root can only be fading once: a rapid second swap must not leave the old
    // record fighting the new one for the same materials.
    this.fades = this.fades.filter((f) => f.root !== root);

    const mats: THREE.MeshStandardMaterial[] = [];
    let from = fromOverride ?? 1;
    let seen = false;
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat) {
        mats.push(mat);
        // Interrupting a dissolve must not snap the model's alpha: take over
        // from wherever it currently is.
        if (!seen) { seen = true; if (fromOverride === undefined) from = mat.opacity; }
        mat.transparent = true;
        mat.opacity = from;
        // Only the outgoing half gives up depth writes; see setModel.
        mat.depthWrite = !outgoing;
      }
      m.renderOrder = outgoing ? -1 : 1;
    });
    this.fades.push({ root, mats, t: 0, dur, from, to, outgoing });
  }

  /** Advance every in-flight dissolve. Called from the render loop, not React. */
  private stepFades(dt: number) {
    if (!this.fades.length) return;
    for (let i = this.fades.length - 1; i >= 0; i -= 1) {
      const f = this.fades[i];
      f.t += dt;
      const k = Math.min(f.t / f.dur, 1);
      const o = f.from + (f.to - f.from) * k;
      for (const mat of f.mats) mat.opacity = o;
      if (k < 1) continue;

      this.fades.splice(i, 1);
      if (f.outgoing) {
        this.group.remove(f.root);
        disposeTree(f.root);
      } else {
        for (const mat of f.mats) {
          mat.opacity = 1;
          mat.transparent = false;
          mat.depthWrite = true;
        }
        f.root.traverse((o2) => { (o2 as THREE.Mesh).renderOrder = 0; });
      }
    }
    (window as unknown as Record<string, unknown>).__tdDissolve = {
      active: this.fades.length,
      progress: this.fades[0] ? Math.min(this.fades[0].t / this.fades[0].dur, 1) : 1,
    };
  }

  setScroll(p: number) {
    this.scrollTarget = Math.min(Math.max(p, 0), 1);
  }

  setAutoRotate(on: boolean) {
    this.autoRotate = on;
  }

  setWireframe(on: boolean) {
    this.current?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat) mat.wireframe = on;
      }
    });
  }

  resetView() {
    this.spin = { x: 0, y: 0, vx: 0, vy: 0 };
    this.targetTilt = { x: 0, y: 0 };
    this.group.rotation.set(0, 0, 0);
  }

  bind() {
    const c = this.canvas;
    const onDown = (e: PointerEvent) => {
      this.dragging = true;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      c.setPointerCapture?.(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      this.dragging = false;
      c.releasePointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      this.targetTilt = { x: ny * 0.22, y: nx * 0.5 };
      if (this.dragging) {
        const dx = e.clientX - this.lastPointer.x;
        const dy = e.clientY - this.lastPointer.y;
        this.spin.vy += dx * 0.0035;
        this.spin.vx += dy * 0.0022;
        this.lastPointer = { x: e.clientX, y: e.clientY };
      }
    };
    const onLeave = () => {
      this.dragging = false;
    };
    const onResize = () => this.resize();

    c.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove, { passive: true });
    c.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);
    this.disposers.push(() => {
      c.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
    });
    this.resize();
  }

  private resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || Math.round(window.innerHeight * 0.88);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();
  }

  play() {
    if (this.disposed || this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const t = this.clock.elapsedTime;

      this.scroll += (this.scrollTarget - this.scroll) * 0.07;
      this.tilt.x += (this.targetTilt.x - this.tilt.x) * 0.06;
      this.tilt.y += (this.targetTilt.y - this.tilt.y) * 0.06;

      // inertia
      this.spin.x += this.spin.vx;
      this.spin.y += this.spin.vy;
      this.spin.vx *= 0.9;
      this.spin.vy *= 0.9;
      if (this.autoRotate) this.spin.y += 0.0016; // idle turntable

      this.group.rotation.x = this.spin.x + this.tilt.x;
      this.group.rotation.y = this.spin.y + this.tilt.y;
      this.group.position.y = Math.sin(t * 0.55) * 0.035 - this.scroll * 0.6;
      this.group.position.x = (this.tilt.y * 0.4);

      // lights orbit opposite the pointer so highlights travel across the mesh
      this.key.position.set(2.4 - this.tilt.y * 3.2, 1.8 - this.tilt.x * 2.4, 3.2);
      this.fill.position.set(-3.1 - this.tilt.y * 2.2, -0.6 - this.tilt.x * 1.6, 2.4);
      this.rim.position.set(-1.2 - this.tilt.y * 1.6, 2.6 + this.tilt.x * 1.4, -2.8);

      this.camera.position.z = 6.4 + this.scroll * 1.4;
      this.camera.position.y = 0.15 + this.scroll * 0.5;
      this.camera.lookAt(0, -0.05, 0);

      this.glow.quaternion.copy(this.camera.quaternion);
      this.glow.scale.setScalar(1 + 0.03 * Math.sin(t * 0.9));

      this.stepFades(dt);

      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.disposers.forEach((d) => d());
    this.disposers = [];
    // Anything still mid-dissolve owns geometry that nothing else will free.
    this.fades.forEach((f) => disposeTree(f.root));
    this.fades = [];
    if (this.current) disposeTree(this.current);
    this.glow.geometry.dispose();
    (this.glow.material as THREE.Material).dispose();
    this.pmrem?.dispose();
    this.renderer.dispose();
  }
}

/** Soft magenta/cyan radial halo, drawn to a canvas so we ship no extra asset. */
function makeHaloTexture(): THREE.Texture {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(238,97,255,0.55)');
  g.addColorStop(0.35, 'rgba(150,80,220,0.22)');
  g.addColorStop(0.7, 'rgba(91,214,255,0.10)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
