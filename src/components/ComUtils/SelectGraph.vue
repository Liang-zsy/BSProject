<template xmlns="http://www.w3.org/1999/html">

  <el-form-item :label=null  label-width="1px">
    <div class="type-select-checkbox-group">
      <el-checkbox
        v-if="showSpeed"
        v-model="$store.state.showSpeed"
        class="type-select-checkbox"
      >{{ translateText('opPage.textMap.','转速') }}</el-checkbox>
      <el-checkbox
        v-if="showWave"
        v-model="$store.state.showWave"
        class="type-select-checkbox"
      >{{ translateText('opPage.textMap.','波形') }}</el-checkbox>
      <el-checkbox
        v-if="showSpectrum"
        v-model="$store.state.showSpectrum"
        class="type-select-checkbox"
      >{{ translateText('opPage.textMap.','频谱') }}</el-checkbox>
      <el-checkbox
        v-if="$route.path.indexOf('/ReciprocatMachineryGraph/ReciprocatVibrationMonitor') != -1"
        v-model="$store.state.showColumnar"
        class="type-select-checkbox"
      >{{translateText("opPage.textMap.","柱状图")}}</el-checkbox>
    </div>
  </el-form-item>
</template>

<script>
export default {
  name: "SelectGraph",
  methods: {},
  props: {
    showWave: {
      type: Boolean,
      default: true
    },
    showSpectrum: {
      type: Boolean,
      default: true
    },
    showSpeed: {
      type: Boolean,
      default: true
    },
    showColumnar: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    const obj = {
      showSpeed: this.showSpeed,
      showWave: this.showWave,
      showSpectrum: this.showSpectrum,
      showColumnar: this.showColumnar
    };
    this.$store.commit('setGraphInfo', obj);
  }
};
</script>

<style lang="scss">
.type-select-checkbox-group {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap; /* 允许子元素换行 */
  //padding-top: 10px;
  font-size: 14px;
  color: var(--textcolor);
  margin-top: 8px;
  margin-bottom: -10px;

  .type-select-checkbox .el-checkbox__label {
    flex: 1;
    padding-left: 2px !important;
    color: var(--textcolor);
  }
  .type-select-checkbox:nth-child(-n + 3) {
    margin-right: 10px;
  }
  .type-select-checkbox {

  }

}
</style>
