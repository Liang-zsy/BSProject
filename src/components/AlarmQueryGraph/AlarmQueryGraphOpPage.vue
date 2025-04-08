<template>
  <div class="AlarmOpPagejibeng" ref="ui">
    <!--  <el-container >-->
    <!--    <el-header>-->
    <!--      <label class="options">操作页</label>-->
    <!--    </el-header>-->
    <!--    <el-main>-->

    <div class="Reciprocat-opPage-header">
      <span class="Reciprocat-opPage-header-text">{{translateText("opPage.textMap.","操作页")}}</span>
    </div>
    <div class="Reciprocat-opPage-body">
      <el-form :model="alarmForm" ref="alarmForm" :label-width="labelWidth" size="mini">
        <el-form-item :label="translateText('opPage.textMap.','设备名称:')" label-width="80px">{{getequName}}</el-form-item>
        <AlarmfeatureTree  @getPointFeatureTree2Data="getmytree" @notExitPoint="notExitPoint"  :NowLsttime="latsmytime"  ref="thistree" :nowstatic="nowstatic">   </AlarmfeatureTree>
        <div class="reciprocat-overview-time-select">
          <HisTimeSelect ref="timeset" @change="FreshHistoryGraph"></HisTimeSelect>
        </div>
        <select-number class="selectnumber"></select-number>
        <el-form-item>
          <el-button @click="changeTime" :loading="loadingStatus" style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','刷新')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--
            <div>    <el-table height="150" size="mini" :data="AlarmData" >
              <el-table-column prop="DiagnosticResult" label="诊断结果" width="88"></el-table-column>
              <el-table-column prop="AlarmPosition" width="88">
              </el-table-column>
              <el-table-column prop="Quality" width="88" ></el-table-column>
            </el-table>-->
    <!--</div>-->
  </div>
</template>

<script>
import HisTimeSelect from "../ComUtils/HisTimeSelect";
import AlarmfeatureTree from "./AlarmfeatureTree";
import SelectNumber from "../ComUtils/SelectNumber";
import keepAliveMixin from "../../mixins/keepAliveMixin";
import event from "@/assets/event";

export default {
  name: "AlarmQueryGraphOpPage",
  components: {SelectNumber, AlarmfeatureTree, HisTimeSelect},
  props: ['equid',"AlarmInformations"],
  mixins: [keepAliveMixin],
  data() {
    return {
      // AlarmData:[{
      //   DiagnosticResult:"底部脱离"
      // }],

      loadingStatus: false, //历史模式下接口是否已经返回结果
      nowstatic:0,
      alarmPointNum: null,
      latsmytime:null,
      points: [],
      alarmPointTree1: [],
      alarmPointTree2: [],
      alarmForm: {

        time: null,
        treeSelect:null

      },
      firstFlag: true, //第一次进入页面的标识
      labelWidth: this.$i18n.locale == 'zh' ? '80px' : '110px',
    };
  },

  mounted() {
    this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
    this.$refs.ui.style.setProperty('--activetextcolor', this.$store.state.activetextcolor);
    this.$refs.ui.style.setProperty('--treeinputbgcolor', this.$store.state.treeinputbgcolor);
    this.$refs.ui.style.setProperty('--labelcolor', this.$store.state.labelcolor);
    this.$refs.ui.style.setProperty('--checkedcolor', this.$store.state.checkedcolor);
    this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
    this.$refs.ui.style.setProperty('--buttontextcolor', this.$store.state.buttontextcolor);
    this.$refs.ui.style.setProperty('--selectbordercolor', this.$store.state.selectbordercolor);
    let interval = setInterval(()=>{
      if(this.equipmentDetail[this.$store.state.equid] !== undefined){
        clearInterval(interval)
        this.doit();
      }
    },500)
    this.$store.state.intervalIds.push(interval)
  },
  watch: {

    myequid(){
      if(!this.activatedFlag) return ;
      this.$refs.thistree.nowstatic = 0;
      // this.firstFlag = true;
      if(this.$route.path == '/AlarmQueryGraph') {
        this.firstFlag = true;
      }
    },
    topiccolor(val) {
      // console.log('weqr '+this.$store.state.textcolor)
      // console.log('qwer '+this.$store.state.leftconbgcolor)
      this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
      this.$refs.ui.style.setProperty('--activetextcolor', this.$store.state.activetextcolor);
      this.$refs.ui.style.setProperty('--treeinputbgcolor', this.$store.state.treeinputbgcolor);
      this.$refs.ui.style.setProperty('--labelcolor', this.$store.state.labelcolor);
      this.$refs.ui.style.setProperty('--checkedcolor', this.$store.state.checkedcolor);
      this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
      this.$refs.ui.style.setProperty('--buttontextcolor', this.$store.state.buttontextcolor);
      this.$refs.ui.style.setProperty('--selectbordercolor', this.$store.state.selectbordercolor);
    },
    '$i18n.locale'(val){
      if(val == 'zh'){
        this.labelWidth = '80px'
      }else if(val == 'en'){
        this.labelWidth = '110px'
      }
    }

  },
  computed: {
    myequid(){
      return this.$store.state.equid;
    },
    getequName(){
      return this.$store.state.equName;
    },
    nodeNum() {
      return this.$store.state.nodeNum;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    },
    equipmentDetail() {
      return this.$store.state.equipmentDetail;
    },

  },



  methods: {
    notExitPoint() {
      this.$parent.$emit('notExitPoint');
    },
    doit() {
      // console.log("时间更新");
      this.latsmytime=this.$refs.timeset.timedata()
      // console.log(this.latsmytime)
      this.$refs.thistree.NowLsttime= this.latsmytime
      // this.$refs.thistree.getdata(thi；s.$store.state.equid)
      // this.$nextTick(
      this.$refs.thistree.getdata(this.$store.state.equid)
      // );
      // console.log(this.$store.state.equid);
    },
    getmytree(mytreedata, treeSelect){
      // console.log("得到的树");
      // console.log(mytreedata);
      this.alarmForm=mytreedata;
      this.alarmForm.treeSelect=treeSelect
      if(this.firstFlag && this.$store.state.historyImmediateFlag) {
        this.FreshHistoryGraph();
        this.firstFlag = false;
      }
      if(!this.$store.state.historyImmediateFlag) {
        this.FreshHistoryGraph();
      }
      // this.FreshHistoryGraph();

    },
    changeTime(){
      this.$refs.thistree.nowstatic=1;
      this.$refs.thistree.check1 = this.$refs.thistree.$refs.pointFeatureTree1.getCheckedNodes();
      this.$refs.thistree.check2 = this.$refs.thistree.$refs.pointFeatureTree2.getCheckedNodes();

      this.$emit('reDataZoomInterval')

      this.doit();
      this.firstFlag = true;
      // this.getmytree(this.alarmForm, this.alarmForm.treeSelect)
      // this.FreshHistoryGraph()
    },
    FreshHistoryGraph(){
      event.$emit('updatePrimaryLine'); // 清空主辅游标
      this.$parent.clearchart();
      // console.log("发送数据")
      var mytime = this.$refs.timeset.timedata();
      this.alarmForm.time = mytime;
      // console.log(this.alarmForm);
      if(this.alarmForm.checkNodes.length == 0) {
        this.$parent.clearchart();
        this.$parent.$emit('pointNull');
      } else {
        this.$emit('refresh', this.alarmForm);
      }
    }
  }

}
</script>

<style lang="scss">

.AlarmOpPagejibeng {
  --conbgcolor: #0D0F1F;
  --leftconbgcolor: #222331;
  --textcolor: #ffffff;
  --activetextcolor: #1677FF;
  --treeinputbgcolor: #ffffff;
  --labelcolor: #696B6F;
  --checkedcolor: #1677FF;
  --buttoncolor: #1677FF;
  --buttontextcolor: #ffffff;
  height: 100%;

  .Reciprocat-opPage-header{
    padding: 6px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--leftconbgcolor);
    box-shadow: 0 1px 1px 0 var(--conbgcolor);
    color: var(--textcolor);
  }
  .Reciprocat-opPage-header-text{
    color: var(--checkedcolor);
    height: auto;
    font-family: "Microsoft YaHei";
    font-size: 16px;
    font-weight: 700;
  }
  .Reciprocat-opPage-body{
    height: calc(100% - 65px);
    overflow: auto;
    display: flex;
    padding: 16px 8px;
    flex-direction: column;
    flex: 1
  }

  //.el-input{
  //  width: 150px;
  //}
  .el-radio__inner{
    border-color: var(--textcolor);
    background-color: var(--leftconbgcolor);
  }
  .el-radio__inner::after {
    width: 7px;
    height: 7px;
    background-color: var(--checkedcolor);
  }
  .el-radio__input.is-checked .el-radio__inner{
    border-color: var(--checkedcolor);
    background-color: var(--leftconbgcolor);
  }
  .el-checkbox__inner{
    background-color: var(--leftconbgcolor);
    border-color: var(--textcolor)
  }
  .el-checkbox__input.is-checked .el-checkbox__inner{
    border-color: var(--checkedcolor);
    background-color: var(--checkedcolor);
  }
  .el-checkbox__label {
    font-size: 14px;
    color: var(--textcolor)!important;
  }

  .reciprocat-overview-time-select{
    margin: 8px 0 0 0;
    background-color: var(--leftconbgcolor);
  }
  .checked{
    margin: 0 8px 16px 8px;
    background-color: var(--leftconbgcolor);
  }
  //.el-header {
  //  height: 60px;
  //  //    background: #2F4554;
  //  background: var(--leftconbgcolor);
  //  .options {
  //    color: var(--activetextcolor);
  //    //color: #359186;
  //    font-size: 24px;
  //    line-height: 60px;
  //    font-weight: bold;
  //  }
  //}
  //
  //.el-main {
  //  padding: 2px;
  //  margin: 13px 10px 0px 10px;
  //  //margin-right: 10px
  //}

  .el-form {
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
      margin: 0 0 16px 8px;
    }
    .el-select {
      width: calc(100% - 8px);
      .el-input__inner {
        background-color: var(--leftconbgcolor);
        color: var(--selectbordercolor);
        border-color: var(--selectbordercolor);
        font-size: 14px;
      }
    }
    .el-date-editor{
      .el-input__inner {
        background-color: var(--leftconbgcolor);
        color: var(--selectbordercolor);
        border-color: var(--selectbordercolor);
        font-size: 14px;
      }
    }

    .el-form-item__label {
      color: var(--textcolor);
      text-align: left;
      padding: 0px 5px 0px 0px;
    }

    .el-form-item__content {
      color: var(--textcolor);
      font-size: 14px;
    }

    .el-button{
      background: var(--buttoncolor);
      border: var(--checkedcolor);
      color: var(--buttontextcolor);
    }
  }
  //.selectnumber{
  //  .el-input{
  //    width: 133%;
  //  }
  //}
  //::-webkit-scrollbar{
  //  width:5px;
  //  height: 5px;
  //  margin-left: 50%;
  //  background-color: #061d74;
  //}
  //::-webkit-scrollbar-thumb{
  //  margin-left: 50%;
  //  background-color: #646563;
  //}

  /*.alarm-pointTree {
    min-height: 190px;
    background-color: #3c455b;
    margin-bottom: 7px;
    max-height: 250px;
    overflow: auto;
    .el-select {
      width: 70%;
    }

    .el-tree {
      background: #3c455b;

      .el-input {
        font-size: 12px;
      }

      .el-tree-node > .el-tree-node__content {
        background-color: #3c455b !important;
      }

      .el-tree-node.is-current > .el-tree-node__content {
        background-color: #3c455b !important;
      }

      .el-tree-node__content {
        height: 60%;
      }

      .el-tree-node__content > .el-tree-node__expand-icon {
        padding: 2px;
      }

      .el-checkbox {
        font-size: 13px;
      }

      .el-tree-node__label {
        font-size: 13px;
      }
    }
  }*/
}
</style>
