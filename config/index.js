'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      // '/api':{
      //   target: "http://39.106.31.26:8289/",
      //   changeOrigin:true,
      //   pathRewrite:{
      //       '^/api':''
      //   }
      // },
      // '/iframe':{
      //   target: "http://localhost:17002/",
      //   changeOrigin:true,
      //   pathRewrite:{
      //       '^/iframe':''
      //   }
      // },
      '/':{
        target: "http://182.92.110.122:8080/",
        changeOrigin:true,
      },

      '/bsl':{
        // target: "http://223.70.110.5:10271/",
        target: "http://127.0.0.1:8090/",
        changeOrigin:true,
      },

      '/bs':{
        //target: "http://223.70.110.5:10271/",
        //target: "http://101.42.7.183:9502/",
        //target: "http://192.168.1.49:8090/",
        target: "http://101.42.7.183:9502/",
        //target: "http://114.242.29.129:10271",
        // target: "http://39.96.117.53:9502/",
        // target: "http://114.242.29.129:65491/",
        // target: "http://114.242.29.129:65491/",
        // target: "http://111.207.174.187:8089",
        // target: "http://114.242.29.129:10087/bs/", //新接口地址
        // target: "http://linux.glwsq.cn:7453/bs/",
        changeOrigin:true,
        pathRewrite:{
          '^/bs':''
        }
      },
      '/inter1': {
        // target: "http://192.168.123.212:8081/",
        // target: "http://192.168.3.30/",
        target: "http://linux.glwsq.cn:7453/",
        changeOrigin:true,
        pathRewrite:{
            '^/inter1':''
        }
      },
      '/topic': {
        target: "http://114.242.29.129:10087/dcenter_user/",
        changeOrigin:true,
        pathRewrite:{
            '^/topic':''
        }
      },
      '/bh5000': {
        // target: 'http://124.65.155.42:10093/',
        timeout: 20000,
        target: 'http://service.bhxz.net:8888/',
        changeOrigin:true,
        pathRewrite:{
          '^/bh5000': ''
        }
      },
      '/bh18090': {
        timeout: 20000,
        target: 'http://114.242.29.130:18090/',
        changeOrigin:true,
        pathRewrite:{
          '^/bh18090': ''
        }
      },
    },

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-


    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: process.env.NODE_ENV == 'production' ?  '/bs/' : '/',

    // assetsPublicPath: '/',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
