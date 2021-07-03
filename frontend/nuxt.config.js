
let HOST = '';
console.log("NODE ENVIRONMENT:", process.env.NODE_ENV);
if (
  process.env.NODE_ENV === 'test' ||
  process.env.NODE_ENV === 'dev' ||
  process.env.NODE_ENV === 'development'
) {
  console.log("HOST changing...........");
  // TODO: don't hard-code
  HOST = 'http://localhost:3456';
}

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  server: {
    port: 3002,
  },

  proxy: {
    '/api/': `${HOST}`,
  },

  router: {
    middleware: ['auth'],
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'teachagogo-frontend',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/learningful-sdk.js',
    '~/plugins/filters.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
