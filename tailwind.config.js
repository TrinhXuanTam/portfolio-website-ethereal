/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Refined warm-light editorial palette — deeper neutrals for contrast,
        // a single restrained accent (deep sage-teal) for premium calm.
        alabaster: '#F3F1EB', // page base — warm paper
        pearl: '#FBFAF6', // lifted surfaces
        mist: '#E7E4DC',
        ash: '#7C7A73', // muted labels
        graphite: '#26251F', // body text — near-black, warm
        ink: '#141310', // headings — deep espresso-black
        // Primary accent + its darker/soft variants
        accent: '#3F6B5E', // deep sage-teal — the one signature color
        'accent-soft': '#7C9A8E',
        // Atmospheric trio (used in the WebGL shader only)
        sage: '#B7C4B0',
        azure: '#B4C6D6',
        sand: '#E4D5BE',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest2: '0.32em',
      },
      transitionTimingFunction: {
        ethereal: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
