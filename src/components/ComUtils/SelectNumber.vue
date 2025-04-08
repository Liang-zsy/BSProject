<template>
  <div class="peakSearch">
    <!--  <el-row class="peakSearch">-->
    <el-form-item :label="translateText('opPage.textMap.','寻峰个数:')" style="height:32px;margin-bottom: 8px;">
      <el-select v-model="peakSearchNum" @change="changePeakSearch" size="mini" style="width: 100%">
        <el-option label="5" value="5"></el-option>
        <el-option label="10" value="10"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="translateText('opPage.textMap.','谐频倍数:')" style="height:32px;margin-bottom: 8px">
      <!--  <el-row class="peakSearch">-->
      <el-select v-model="resonanceNum" @change="changeResonanceNum" size="mini" style="width: 100%">
        <el-option label="5" value="5"></el-option>
        <el-option label="10" value="10"></el-option>
        <el-option label="15" value="15"></el-option>
      </el-select>
      <!--  </el-row>-->
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "SelectNumber",
  data() {
    return {
      peakSearchNum: 5,
      resonanceNum: 10,
    }
  },
  methods: {
    changePeakSearch() {
      this.$store.state.peakSearchNum = this.peakSearchNum
    },
    changeResonanceNum() {
      this.$store.state.resonanceNum = this.resonanceNum
    }
  }
}
</script>

<style scoped lang="scss">
.peakSearch {
  background-color: var(--leftconbgcolor);
  color: var(--textcolor);
  padding-left: 0;
  //margin-left: 8px;

  font-size: 14px;
  margin-bottom: 0px;

  ///deep/ .el-input__inner {
  //  width: 117%;
  //}
}
</style>
