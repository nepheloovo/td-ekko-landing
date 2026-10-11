/**
 * Prefix a public asset path with Vite's configured base.
 *
 * The app is served from the domain root in dev and from a sub-path on a static
 * host (GitHub Pages serves project sites at /<repo>/). With `base: './'` in
 * vite.config.ts, BASE_URL is './' and every asset resolves relative to the
 * document, so the same build works at '/' and at '/<repo>/' without a rebuild.
 */
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
