import { useCallback, useRef, useState } from 'react';
import { Backdrop, type BackdropApi } from './components/Backdrop';
import { Loader } from './components/Loader';
import { HeaderMarquee } from './components/HeaderMarquee';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { EkkoStageView } from './components/EkkoStageView';
import { Abilities } from './components/Abilities';
import { Lineup } from './components/Lineup';
import { Stats } from './components/Stats';
import { GetCta } from './components/GetCta';
import { Footer } from './components/Footer';
import { ParticleTrail } from './components/ParticleTrail';
import { SnowBurst, type SnowApi } from './components/SnowBurst';
import { SvgFilters } from './components/SvgFilters';
import { TurntableOverlay } from './components/TurntableOverlay';
import { useSmoothScroll, useWaypointReveal } from './lib/hooks';
import { useAbilitiesFx, useLineupMask } from './lib/scrollFx';
import { ScrollTrigger } from './lib/gsap';
import { asset } from './lib/asset';

const PRELOAD = [asset('assets/bg-lower.webp'), asset('assets/bg-upper.webp'), asset('assets/ekko-td.glb')];

export default function App() {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const backdrop = useRef<BackdropApi | null>(null);
  const stageScroll = useRef<((p: number) => void) | null>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const snow = useRef<SnowApi | null>(null);
  // Two separate gates, because "the loader stopped counting" and "the exit has
  // finished sweeping" are two different moments:
  //   booted   -> #archive may be mounted (it must exist behind the wipe)
  //   revealed -> the should-animate system may fire (the rows must NOT animate
  //               until the wipe has left the screen)
  const [booted, setBooted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [glb, setGlb] = useState(() => asset('assets/ekko-td.glb'));
  const [reelTitle, setReelTitle] = useState('真实伤害 · True Damage Ekko');
  const [reelOpen, setReelOpen] = useState(false);

  const onProgress = useCallback((p: number) => {
    backdrop.current?.setScroll(p);
    stageScroll.current?.(Math.min(p * 2.2, 1));
  }, []);

  useSmoothScroll(wrapper, content, onProgress);
  useWaypointReveal(content, revealed);
  // The fixed chrome (nav + marquee) sits OUTSIDE the scroll content, so it needs
  // its own reveal root — without this its .should-animate items stay at
  // opacity:0 forever and the navigation is invisible.
  useWaypointReveal(chrome, revealed);

  // The two scroll set pieces. Both are armed only after the opening sequence,
  // so their trigger positions are measured against the final page height.
  const setChroma = useCallback((v: number) => backdrop.current?.setChroma(v), []);
  const onSnow = useCallback(() => snow.current?.burst(), []);
  useAbilitiesFx({ enabled: revealed, setChroma, onSnow });
  useLineupMask(revealed);

  const onBackdropReady = useCallback((api: BackdropApi) => {
    backdrop.current = api;
  }, []);

  const onLoaderFinished = useCallback(() => {
    setBooted(true);
    // Watchdog. Every `.should-animate` on the page is at opacity 0 until
    // `revealed` flips, so if the exit timeline ever failed to complete, the
    // whole site would stay blank — the worst possible failure mode for a page
    // that is otherwise fine. Keyed to the exit (not to page load), so a slow
    // GLB preload cannot trip it.
    window.setTimeout(() => setRevealed(true), 4000);
  }, []);
  const onLoaderExit = useCallback(() => {
    setRevealed(true);
    ScrollTrigger.refresh();
    (window as unknown as Record<string, unknown>).__tdRefresh = () => ScrollTrigger.refresh();
  }, []);

  const openReel = useCallback((title?: string) => {
    if (title) setReelTitle(title);
    setReelOpen(true);
    backdrop.current?.stop();
  }, []);

  const closeReel = useCallback(() => {
    setReelOpen(false);
    backdrop.current?.start();
  }, []);

  const onPick = useCallback((nextGlb: string, title: string) => {
    setGlb(nextGlb);
    setReelTitle(title);
    setReelOpen(true);
    backdrop.current?.stop();
  }, []);

  return (
    <>
      <SvgFilters />
      <Backdrop onReady={onBackdropReady} />
      <div ref={chrome}>
        <HeaderMarquee scrollEl={wrapper} />
        <Nav />
      </div>

      {!revealed && (
        <Loader sources={PRELOAD} onFinished={onLoaderFinished} onExitComplete={onLoaderExit} />
      )}

      <div className="scroll-wrapper" ref={wrapper}>
        <div className="scroll-content" ref={content}>
          {/* #archive exists only once the loader has reported in — the hero is
              the payoff of the opening sequence, not a layer sitting behind it. */}
          {booted && <Hero onPlayPreview={() => openReel('真实伤害 · True Damage Ekko')} />}

          {/* 3D hero stage — the A-tier centrepiece */}
          <section className="position-relative px-1 px-md-3" id="stage">
            <div className="d-flex justify-content-between align-items-end px-1 px-md-3 pb-2">
              <p className="h6 font-M uppercase" style={{ margin: 0, color: 'var(--cyan)', letterSpacing: '0.16em' }}>
                实时 3D · GLB 245019
              </p>
              <p className="h6 font-M uppercase d-none d-md-block" style={{ margin: 0, opacity: 0.5, letterSpacing: '0.16em' }}>
                拖拽旋转 / 指针驱动光照 / 滚动推镜
              </p>
            </div>
            <EkkoStageView glb={glb} onReady={(api) => { stageScroll.current = api.setScroll; }} />
          </section>

          <Abilities />
          <Lineup activeGlb={glb} onPick={onPick} />
          <Stats />
          <GetCta />
          <Footer onPlayPreview={() => openReel('真实伤害 · True Damage Ekko')} />
        </div>
      </div>

      <TurntableOverlay open={reelOpen} glb={glb} title={reelTitle} onClose={closeReel} onPick={onPick} />
      <SnowBurst ref={snow} />
      <ParticleTrail />
    </>
  );
}
