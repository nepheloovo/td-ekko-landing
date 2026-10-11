/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        field: '#08060F',
        'field-2': '#130A20',
        'violet-deep': '#2A1B4A',
        'violet-mid': '#5B3A9E',
        magenta: '#EE61FF',
        pink: '#FB58FC',
        cyan: '#5BD6FF',
        gold: '#EA981A',
        hot: '#FBFFF1',
        ash: '#919191',
      },
      fontFamily: {
        A: ['"Bodoni Moda"', '"Noto Serif SC"', 'serif'],
        B: ['"Bebas Neue"', '"Noto Sans SC"', 'sans-serif'],
        C: ['Inter', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        E: ['Rajdhani', '"Noto Sans SC"', 'sans-serif'],
        M: ['"Space Mono"', 'monospace'],
      },
      // The source design used a CUSTOM Bootstrap $spacers map, not the default
      // 0.25rem scale. Reproduce it exactly, or every vertical rhythm breaks.
      spacing: {
        0: '0',
        1: '1rem',
        2: '2.25rem',
        3: '3.5rem',
        4: '5rem',
        5: '8rem',
        6: '11rem',
        7: '0.5rem',
        8: '12rem',
        9: '13rem',
      },
    },
  },
  plugins: [],
  corePlugins: { container: false },
};
