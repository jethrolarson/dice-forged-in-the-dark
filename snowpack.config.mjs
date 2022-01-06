/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: {
    public: { url: '/', static: true },
    src: '/dist',
  },
  packageOptions: {
    polyfillNode: true,
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    // '@snowpack/plugin-dotenv',
    '@snowpack/plugin-webpack',
    '@snowpack/plugin-typescript', // TS support
    'snowpack-plugin-svgr', // import SVG as React component
  ],
  /* for local SPA fallback routing support, more below */
  routes: [{ match: 'routes', src: '.*', dest: '/index.html' }],
  devOptions: {
    port: 3000,
  },
  testOptions: {
    files: ['src/**/*.test.*'],
  },
  knownEntryPoints: [
    'fp-ts/es6/Either',
    'uc.micro/properties/Any/regex',
    'uc.micro/categories/Cc/regex',
    'uc.micro/categories/Z/regex',
  ],
  /* optional, if you want to use alias when importing */
  //   alias: {
  //     '~': './src/',
  //   },
}
