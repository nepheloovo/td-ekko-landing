import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(CustomEase, ScrollTrigger);

/**
 * The reference site eased its liquid-link hover with RoughEase
 * (rough({template:none.out, strength:2, points:120, taper:false, randomize:true})).
 * RoughEase is not in the public gsap package, so we author the equivalent
 * jitter curve as a CustomEase path: fast rise, jitter, settle at 1.
 */
CustomEase.create('rough', 'M0,0 L0.06,0.42 L0.12,0.28 L0.18,0.55 L0.24,0.44 L0.3,0.66 L0.36,0.58 L0.44,0.72 L0.52,0.66 L0.6,0.8 L0.7,0.76 L0.8,0.88 L0.9,0.86 L0.96,0.97 L1,1');

/** A stepped, glitchy ease for the one-shot chromatic aberration burst. */
CustomEase.create('glitch', 'M0,0 L0.08,0.86 L0.16,0.22 L0.26,0.74 L0.36,0.34 L0.48,0.62 L0.6,0.44 L0.72,0.56 L0.84,0.5 L1,0.52');

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, CustomEase, ScrollTrigger };
