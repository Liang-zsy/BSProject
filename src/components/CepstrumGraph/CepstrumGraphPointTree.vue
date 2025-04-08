<template>
  <div class="cepstrum-graph-point-treejibeng" ref="ui">
    <div v-show="treeSelect == 0">
      <el-tree :data="pointTree1" show-checkbox node-key="id" :default-expanded-keys="['振动-加速度']" @check="pointTree1Checked"
               accordion ref="pointFeatureTree1" :render-content="renderContent"></el-tree>
    </div>
    <div v-show="treeSelect == 1">
      <el-tree :data="pointTree2" accordion show-checkbox node-key="id" :default-expanded-keys="['振动-加速度']"
               @check="pointTree2Checked" ref="pointFeatureTree2" :render-content="renderContent"></el-tree>
    </div>
  </div>
</template>

<script>
import keepAliveMixin from "@/mixins/keepAliveMixin";
export default {
  name: "CepstrumGraphPointTree",
  mixins: [keepAliveMixin],
  data() {
    return {
      mycolor: '#ffffff',
      treeSelect: "0",
      featureSelect: 0,
      typeSelect: [
        {id: 0, label: this.translateText("opPage.textMap.",'加速度峰值'), unit:"mm/s2"},
        {id: 1, label: this.translateText("opPage.textMap.",'加速度高频'), unit:"mm/s2"},
        {id: 2, label: this.translateText("opPage.textMap.",'加速度低频'), unit:"mm/s2"},
        {id: 3, label: this.translateText("opPage.textMap.",'加速度波形峭度'), unit:""},
        {id: 4, label: this.translateText("opPage.textMap.",'速度有效值'), unit:"mm/s"},
        {id: 5, label: this.translateText("opPage.textMap.",'通频gIE值'), unit:"gIE"},
      ],
      points: [],
      pointTree1: [],
      pointTree2: [],
      nowCheckedKey: ''
    };
  },
  mounted() {
    if (this.nodeData[this.equid] != undefined) {
      this.setPointTree(this.equid);
    }
    this.mycolor = this.$store.state.textcolor;
    this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
    this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
  },
  computed: {
    nodeData() {
      return this.$store.state.equipmentDetail;
    },
    equid() {
      return this.$store.state.equid;
    },
    nodeNum() {
      return this.$store.state.nodeNum;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    }
  },
  watch: {
    '$i18n.locale'() {
      this.pointTree1.forEach((item, index, arr) => {
        arr[index].label = this.translateText("opPage.textMap.",item.id);
      })
      this.pointTree2.forEach((item, index, arr) => {
        arr[index].label = this.translateText("opPage.textMap.",item.id);
      })
      this.typeSelect = [
        {id: 0, label: this.translateText("opPage.textMap.",'加速度峰值'), unit:"mm/s2"},
        {id: 1, label: this.translateText("opPage.textMap.",'加速度高频'), unit:"mm/s2"},
        {id: 2, label: this.translateText("opPage.textMap.",'加速度低频'), unit:"mm/s2"},
        {id: 3, label: this.translateText("opPage.textMap.",'加速度波形峭度'), unit:""},
        {id: 4, label: this.translateText("opPage.textMap.",'速度有效值'), unit:"mm/s"},
        {id: 5, label: this.translateText("opPage.textMap.",'通频gIE值'), unit:"gIE"},
      ]
    },
    equid: {
      handler(newEquid) {
        if(!this.activatedFlag) return ;
        this.setPointTree(newEquid);
        // console.log(this.pointTree1);
      }
    },
    nodeNum: {
      handler() {
        if(!this.activatedFlag) return ;
        this.setPointTree(this.equid);
        // console.log(this.pointTree1);
      }
    },
    topiccolor(val) {
      this.mycolor = this.$store.state.textcolor;
      this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
      this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
    }
  },
  methods: {
    setPointTree(equid) {

    },
  }
}
</script>

<style lang="scss">
.cepstrum-graph-point-treejibeng {
  --pointcolor: #1D1E2C;
  --eltreecolor: #1D1E2C;
  --textcolor: #ffffff;
  --eltreebordercolor: #000;
  height: 228px;
  width: calc(100% - 10px);
  overflow: auto;
  background-color: var(--eltreecolor);
  padding: 8px 0 8px 8px;
  border-radius: 6px;
  border: 1px solid var(--eltreebordercolor);

  .el-select {
    width: 70%;
  }


  .el-tree {
    background: var(--eltreecolor);
    .feature-content{
      display: flex;
      height: 28px;
      line-height: 28px;
      width: 180px;
    }
    .feature-select{
      flex: 1;
    }

    .el-input {
      font-size: 14px;
      width: 100%;
    }

    .el-input__inner, .el-input__icon {
      height: 28px;
      line-height: 28px;
    }

    .el-tree-node > .el-tree-node__content {
      background-color: var(--eltreecolor) !important;
    }

    .el-tree-node.is-current > .el-tree-node__content {
      background-color: var(--eltreecolor) !important;
    }

    .el-tree-node__content {
      height: auto;
      margin-right: 8px;
      margin-bottom: 8px;
    }

    .el-tree-node__content > .el-tree-node__expand-icon {
      padding: 6px 5.5px 5.5px 6px;
      width: 12.5px;
      height: 12.5px;
      font-size: 12.5px
    }

    .el-checkbox {
      height: 16px;
      padding: 4px;
      font-size: 14px;
      margin-right: 0;
    }

    .el-tree-node__label {
      font-size: 14px;
      padding: 0px 4px;
    }

    .el-checkbox__inner{
      background-color: var(--eltreecolor);
      border-color: var(--textcolor)
    }

    .el-checkbox__input.is-disabled .el-checkbox__inner{
      background-color: var(--eltreecolor) !important;
      border-color: var(--textcolor) !important;
    }

  }

}
</style>
