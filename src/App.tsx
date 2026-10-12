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
import { TracingCursor } from './components/TracingCursor';
import { SvgFilters } from './components/SvgFilters';
import { TurntableOverlay } from './components/TurntableOverlay';
import { useSmoothScroll, useWaypointReveal } from './lib/hooks';
import { SKINS } from './data';
import { asset } from './lib/asset';

const PRELOAD = [asset('assets/bg-lower.webp'), asset('assets/bg-upper.webp'), asset('assets/ekko-td.glb')];

export default function App() {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const backdrop = useRef<BackdropApi | null>(null);
  const stageScroll = useRef<((p: number) => void) | null>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(false);
  const [glb, setGlb] = useState(() => asset('assets/ekko-td.glb'));
  const [reelTitle, setReelTitle] = useState('真实伤害 · True Damage Ekko');
  const [reelOpen, setReelOpen] = useState(false);

  const onProgress = useCallback((p: number) => {
    backdrop.current?.setScroll(p);
    stageScroll.current?.(Math.min(p * 2.2, 1));
  }, []);

  useSmoothScroll(wrapper, content, onProgress);
  useWaypointReveal(content, booted);
  // The fixed chrome (nav + marquee) sits OUTSIDE the scroll content, so it needs
  // its own reveal root — without this its .should-animate items stay at
  // opacity:0 forever and the navigation is invisible.
  useWaypointReveal(chrome, booted);

  const onBackdropReady = useCallback((api: BackdropApi) => {
    backdrop.current = api;
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

      {!booted && <Loader sources={PRELOAD} onFinished={() => setBooted(true)} />}

      <div className="scroll-wrapper" ref={wrapper}>
        <div className="scroll-content" ref={content}>
          <Hero onPlayPreview={() => openReel('真实伤害 · True Damage Ekko')} />

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

      <TurntableOverlay open={reelOpen} glb={glb} title={reelTitle} onClose={closeReel} />
      <TracingCursor />
    </>
  );
}
