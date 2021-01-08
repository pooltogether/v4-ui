const {
  colors
} = require('tailwindcss/defaultTheme')

module.exports = {
  experimental: 'all',
  corePlugins: {
    container: true
  },
  theme: {
    // this gives us:
    // null (mobile),
    // xs (tablet),
    // sm (941px - 1481px)
    // lg (1481px+)
    screens: {
      'xs': '531px',
      'sm': '941px',
      'lg': '1481px'
    },
    colors: {
      // black: colors.black,
      white: colors.white,
      cyan: {
      },
      blue: {
      },
      green: {
      },
      purple: {
      },
      orange: {
      },
      pink: {
      },
      teal: {
      },
    },
    extend: {
      backgroundColor: {
        body: 'var(--color-bg-body)',
        card: 'var(--color-bg-card)',
        'card-selected': 'var(--color-bg-card-selected)',
        'card-purple': 'var(--color-bg-card-purple)',
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        tertiary: 'var(--color-bg-tertiary)',
        default: 'var(--color-bg-default)',
        input: 'var(--color-bg-input)',
        darkened: 'var(--color-bg-darkened)',
        inverse: 'var(--color-bg-inverse)',
        overlay: 'var(--color-bg-overlay)',
        'overlay-white': 'var(--color-bg-overlay-white)',
        black: 'var(--color-bg-black)',
        'highlight-1': 'var(--color-bg-highlight-1)',
        'highlight-2': 'var(--color-bg-highlight-2)',
        'highlight-3': 'var(--color-bg-highlight-3)',
        'highlight-4': 'var(--color-bg-highlight-4)',
        'highlight-5': 'var(--color-bg-highlight-5)',
        'highlight-6': 'var(--color-bg-highlight-6)',
        'highlight-7': 'var(--color-bg-highlight-7)',
        'highlight-8': 'var(--color-bg-highlight-8)',
        raspberry: 'var(--color-bg-raspberry)',
        red: 'var(--color-bg-red)',
        green: 'var(--color-bg-green)',
        orange: 'var(--color-bg-orange)',
        'orange-darkened': 'var(--color-bg-orange-darkened)',
        blue: 'var(--color-bg-blue)',
        teal: 'var(--color-bg-teal)',
        'accent-grey-1': 'var(--color-bg-accent-grey-1)',
        'accent-grey-2': 'var(--color-bg-accent-grey-2)',
        'accent-grey-3': 'var(--color-bg-accent-grey-3)',
        'accent-grey-4': 'var(--color-bg-accent-grey-4)',
        purple: 'var(--color-bg-purple)',
      },
      textColor: {
        'accent-1': 'var(--color-text-accent-1)',
        'accent-2': 'var(--color-text-accent-2)',
        'accent-3': 'var(--color-text-accent-3)',
        'accent-4': 'var(--color-text-accent-4)',
        black: 'var(--color-text-black)',
        primary: 'var(--color-text-primary)',
        'primary-soft': 'var(--color-text-primary-soft)',
        secondary: 'var(--color-text-secondary)',
        default: 'var(--color-text-default)',
        darkened: 'var(--color-text-darkened)',
        'default-soft': 'var(--color-text-default-soft)',
        inverse: 'var(--color-text-inverse)',
        'inverse-purple': 'var(--color-text-inverse-purple)',
        'inverse-soft': 'var(--color-text-inverse-soft)',
        match: 'var(--color-text-match)',
        'highlight-1': 'var(--color-text-highlight-1)',
        'highlight-2': 'var(--color-text-highlight-2)',
        'highlight-3': 'var(--color-text-highlight-3)',
        'highlight-6': 'var(--color-text-highlight-6)',
        'highlight-7': 'var(--color-text-highlight-7)',
        'highlight-9': 'var(--color-text-highlight-9)',
        raspberry: 'var(--color-text-raspberry)',
        red: 'var(--color-text-red)',
        green: 'var(--color-text-green)',
        orange: 'var(--color-text-orange)',
        blue: 'var(--color-text-blue)',
        teal: 'var(--color-text-teal)',
        'accent-grey-1': 'var(--color-text-accent-grey-1)',
        purple: 'var(--color-text-purple)',
      },
      borderColor: {
        'accent-1': 'var(--color-border-accent-1)',
        'accent-2': 'var(--color-border-accent-2)',
        'accent-3': 'var(--color-border-accent-3)',
        'accent-4': 'var(--color-border-accent-4)',
        primary: 'var(--color-border-primary)',
        card: 'var(--color-border-card)',
        secondary: 'var(--color-border-secondary)',
        default: 'var(--color-border-default)',
        inverse: 'var(--color-border-inverse)',
        'highlight-1': 'var(--color-border-highlight-1)',
        'highlight-2': 'var(--color-border-highlight-2)',
        'highlight-3': 'var(--color-border-highlight-3)',
        'highlight-4': 'var(--color-border-highlight-4)',
        'highlight-5': 'var(--color-border-highlight-5)',
        'highlight-6': 'var(--color-border-highlight-6)',
        'highlight-7': 'var(--color-border-highlight-7)',
        raspberry: 'var(--color-border-raspberry)',
        red: 'var(--color-border-red)',
        green: 'var(--color-border-green)',
        orange: 'var(--color-border-orange)',
        transparent: 'var(--color-border-transparent)',
      },
      boxShadow: {
        'sm': '0 2px 6px 0 rgba(0, 0, 0, .07), 0 1px 2px -1px rgba(0, 0, 0, .04)',
        'md': '0 3px 8px -1px rgba(0, 0, 0, .1), 0 1px 5px -1px rgba(0, 0, 0, .06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, .1), 0 4px 6px -2px rgba(0, 0, 0, .05)',
        'xl': '0 10px 25px -1px rgba(0, 0, 0, .1), 0 10px 10px 5px rgba(0, 0, 0, .04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, .25)',
        '3xl': '0 20px 30px -3px rgba(0, 0, 0, .2), 0 15px 15px -3px rgba(0, 0, 0, .1)',
        '4xl': '0 30px 40px -3px rgba(0, 0, 0, .25), 0 20px 20px -3px rgba(0, 0, 0, .15)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-lg': 'inset 0 1px 5px 0 rgba(0, 0, 0, 0.2)'
      },
      minHeight: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        '5xl': '1.75rem',
        '6xl': '2rem',
        '7xl': '2.25rem',
        '8xl': '2.5rem',
      },
      height: {
        '28': '7rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
        '112': '28rem',
        '128': '32rem'
      },
      minWidth: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
      },
      maxWidth: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
      },
      lineHeight: {
        relaxed: 1.75
      },
      fontSize: {
        // sm: ['14px', '20px'],
        // base: ['16px', '24px'],
        // lg: ['20px', '28px'], // line height!
        // xl: ['24px', '32px'],
        'xxxxxs': '0.5rem',
        'xxxxs': '0.625rem',
        'xxxs': '0.75rem',
        'xxs': '0.875rem',
        'xs': '1rem',
        'sm': '1.125rem',
        'base': '1.25rem',
        'lg': '1.25rem',
        'xl': '1.5rem',
        '2xl': '1.875rem',
        '3xl': '2.25rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
        '6xl': '4rem',
        '7xl': '5rem',
        '8xl': '6rem',
        '9xl': '7rem',
        '10xl': '8rem'
      },
      fontFamily: {
        'sans':  ['Titillium Web', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
        'serif': ['Titillium Web', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
        'mono':  ['DM Mono', 'Courier', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      },
      opacity: {
        '0': '0',
        '10': '.1',
        '20': '.2',
        '30': '.3',
        '40': '.4',
        '50': '.5',
        '60': '.6',
        '70': '.7',
        '80': '.8',
        '90': '.9',
        '100': '1',
      },
      fill: theme => ({
        // 'indigo': theme('colors.indigo.500')
      }),
    }
  },
  variants: {
    borderColor: [
      'hover',
      'focus',
      'active'
    ],
    textColor: [
      'hover',
      'focus',
      'active'
    ],
    backgroundColor: [
      'hover',
      'focus',
      'active',
      'responsive'
    ],
    borderRadius: [
      'responsive'
    ],
    opacity: [
      'hover',
      'focus',
    ]
  },
  plugins: [],
  purge: false
  // purge: [
  //   './components/**/*.jsx',
  //   './components/**/*.js',
  //   './pages/**/*.jsx',
  //   './pages/**/*.js'
  // ],
}
