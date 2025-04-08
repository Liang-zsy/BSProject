// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from './vuex/store';
import Papa from 'papaparse'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Axios from 'axios';
import Echarts from 'echarts';
import 'echarts-gl';
import 'babel-polyfill'
import './assets/iconfont/iconfont.css'
import './assets/GlobalCSS/basic.css'
import './assets/GlobalCSS/aside.css'
import App from './App'
import router from './router'
import i18n from './language/language.js';

Vue.prototype.echarts = Echarts
Vue.prototype.papa = Papa


//接口入口设置
//Vue.use(Axios);
Vue.prototype.$axios = Axios
if (process.env.NODE_ENV == 'development'){
  Axios.defaults.baseURL = '/bs'
} else if (process.env.NODE_ENV == 'production') {
  Axios.defaults.baseURL = config.IPgroup.requestIP + '/bs'
}

Axios.defaults.headers.post['Content-Type'] = 'application/json';

Vue.config.productionTip = false
Vue.use(ElementUI);
document.addEventListener('contextmenu', e => e.preventDefault());

let responseList = {}

Axios.interceptors.response.use(async (response) => {
  let config = response.config;
  const pattern = /(his|info|detail|getAll)/i
  if (!responseList[config.url]) {
    responseList[config.url] = 1;
  }

  if (responseList[config.url] < 3 && pattern.test(config.url) && (response.data.code == 400 || response.data.status == 503)) {
    responseList[config.url]++
    const callpack = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, 1000)
    })
    return callpack.then(async () => {
      config.url = config.url.replace('/bs', '');
      const newResponse = await Axios(config);
      return newResponse;
    })
  }  else {
    // 否则正常返回响应
    return response;
  }
}, async (error) => {
  if (error.response && error.response.status === 503) {
    let config = error.config;
    const callpack = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, 600)
    })
    return callpack.then(async () => {
      config.url = config.url.replace('/bs', '');
      const newResponse = await Axios(config);
      return newResponse;
    })
  } else {
    return Promise.reject(error);
  }

});

router.beforeEach((to, from, next) => {
  window.document.title = to.meta.title ? `故障诊断图谱分析-${to.meta.title}` : `故障诊断图谱分析`
  next();
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  store,
  components: { App },
  template: '<App/>'
})
