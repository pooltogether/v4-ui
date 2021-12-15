module.exports = {
  plugins: {
    'postcss-easy-import': {},
    'postcss-custom-properties-fallback': {
      importFrom: require.resolve('react-spring-bottom-sheet/defaults.json'),
    },
    tailwindcss: {},
    'autoprefixer': {},
  },
}