<template>
  <div>
    <div v-if="this.$store.state.OverviewDisplayMode === 1 ">
      <el-radio v-model="overviewType" @change="overviewChanges" label="振动概貌图" style="margin: 0 16px 16px 0">{{translateText('opPage.textMap.','设备概貌图')}}</el-radio>
    </div>
    <div v-if="this.$store.state.OverviewDisplayMode === 2 ">
      <el-radio v-model="overviewType" @change="overviewChanges" label="工艺概貌图" style="margin: 0 16px 16px 0">{{translateText('opPage.textMap.','设备概貌图')}}</el-radio>
      <el-radio v-show="showProcessOverview == 1" v-model="overviewType" @change="overviewChanges" label="PID图" style="margin: 0 16px 16px 0">{{translateText('opPage.textMap.','工艺概貌图')}}</el-radio>
    </div>
    <div v-if="this.$store.state.OverviewDisplayMode === 3">
      <el-radio v-model="overviewType" @change="overviewChanges" label="振动概貌图" style="margin:0 16px 16px 0">{{translateText('opPage.textMap.','设备概貌图')}}</el-radio>
      <el-radio v-model="overviewType" @change="overviewChanges" label="工艺概貌图" style="margin: 0 16px 16px 0">{{translateText('opPage.textMap.','工艺概貌图')}}</el-radio>
      <el-radio v-model="overviewType" @change="overviewChanges" label="3D图" style="margin: 0 16px 16px 0">{{translateText('opPage.textMap.','3D图')}}</el-radio>
    </div>
  </div>
</template>
<script>
export default{
  // 右侧上方的公共组件
  name: 'overviewTypeOpPage',
  props: ['inputChecked'],
  data() {
    return{

    }
  },
  methods: {
    overviewChanges() {
      console.log("happen->概貌图切换", this.overviewType)
      this.$emit("overviewChange", this.overviewType)
      this.inputChecked = false
      //存疑 取消选中状态（但是 props 不能直接修改，可能这里有错误，应该使用 $emit 让父组件修改）
    },
  },
  computed:{
    overviewType(){
      return this.$store.state.OverviewDisplayMode == 2 ? '工艺概貌图' : '振动概貌图'
    },
    showProcessOverview(){
      return this.$store.state.showProcessOverview
    }
  }

}
</script>
<style lang="scss">

</style>
