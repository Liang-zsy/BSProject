import Vue from 'vue';
import VueI18n from "vue-i18n";
import Locale from 'element-ui/lib/locale'


// 从语言包中导入语言包对象
import en from "./en";
import zh from "./zh";

Vue.use(VueI18n);

const messages = {
  en,
  zh,
};

const i18n = new VueI18n({
  messages,
  locale: config.language,
});

// Locale.i18n((key, value) => i18n.t(key, value)); // 用这个时间组件英文错乱
i18n: (key, value) => i18n.t(key, value);

// 定义全局混入
/**
 * @description 获取翻译的方法
 * @param {String} prefix 翻译的前缀
 * @param {String} text 需要翻译的文本
 * @returns {String} 翻译后的文本
 */
Vue.mixin({
  methods: {
    translateText: function(prefix, text) {
      text = String(text);
      if(text == 'undefined' || text == '') return '';
      prefix += text;
      // 如果返回的是prefix+text，则说明没有找到对应的翻译，返回原值
      return this.$i18n.t(prefix) != prefix ? this.$i18n.t(prefix) : text;
    },

    changeUrl(url) {
      if(url.includes(".") && !url.includes("http")) return "http://" + url;
      return url;
    },
  }
});

export default i18n;
