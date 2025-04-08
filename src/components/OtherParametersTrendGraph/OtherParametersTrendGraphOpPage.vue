<template>
  <div class="other-parameters-trend-graph-op-pagejibeng" ref="ui">
    <div class="Reciprocat-opPage-header">
      <span class="Reciprocat-opPage-header-text">{{translateText("opPage.textMap.","操作页")}}</span>
    </div>
    <div class="Reciprocat-opPage-body">
      <el-form ref="ruleForm" label-width="80px" class="demo-ruleForm" size="mini">
        <el-form-item :label="translateText('opPage.textMap.','设备名称:')">{{getequName}}</el-form-item>

        <point-tree-special1 type="温度" ref="pointTreeSpecial1" @initial="initial1" @notExitPoint="notExitPoint" @getNewPoint="getUpNewPoint" @stop="stop1"> </point-tree-special1>
        <div style="margin-top: 16px">
          <point-tree-special1 type="温度" ref="pointTreeSpecial2" @initial="initial2" @notExitPoint="notExitPoint" @getNewPoint="getDownNewPoint" @stop="stop2"> </point-tree-special1>
        </div>

        <div style="margin-top: 8px">
          <rt-his-time-select ref='timeset' @radiostatus = 'changestatus'></rt-his-time-select>
        </div>
        <el-form-item>
          <el-button v-if="nowstatus == 2" @click="gethistortdata" :loading="loadingStatus" style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','刷新')}}</el-button>
          <el-button v-if = 'nowstatus == 1 &&freshstatus == 0' @click = 'startall' :loading="loadingStatus" style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','刷新')}}</el-button>
          <el-button v-if="nowstatus == 1 &&freshstatus ==   1" @click = 'stopinterval' style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','停止')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import RtHisTimeSelect from "../ComUtils/RtHisTimeSelect";
import PointTreeSpecial1 from "../ComUtils/PointTreeSpecial1";
import keepAliveMixin from "../../mixins/keepAliveMixin";

export default {
  name: "OtherParametersTrendGraphOpPage",
  mixins: [keepAliveMixin],
  components: {PointTreeSpecial1, RtHisTimeSelect},
  data() {
    return {
      loadingStatus:false,
      flag: 0,  //控制页面初始化加载
      freshstatus:1,
      nowstatus: 1,
      pointstree1:null,//当前选择的测点
      pointstree2:null,
      pointid1: null,
      pointid2: null,
      myinterval1: null,
      myinterval2: null,
      lastpointstree1:[],//上一次选择的测点
      lastpointstree2:[],
      mytime: null,
      firstFlag1: true,
      firstFlag2: true,
    };
  },
  computed: {
    equid() {
      return this.$store.state.equid;
    },
    getequName(){
      return this.$store.state.equName;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    }
  },
  //更换页面时清除interval
  beforeDestroy() {
    if (this.myinterval1) {
      clearInterval(this.myinterval1);
    }
    if (this.myinterval2) {
      clearInterval(this.myinterval2);
    }
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
  },
  watch:{
    equid(){
      if(!this.activatedFlag) return ;
      console.log("qdy检测到设备发生改变了")
      if(this.$route.path == '/OtherParametersTrendGraph') {
        this.firstFlag1 = true;
        this.firstFlag2 = true;
      }
    },
    topiccolor(val) {
      // // console.log('我的颜色',this.$store.state.textcolcor)
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
    getequName(){
      if(!this.activatedFlag) return ;
      console.log('//设备变化时重置刷新变量');
      if(this.$route.path == '/DieselMonitorSystem/OtherParametersTrend') {
        this.firstFlag1 = true;
        this.firstFlag2 = true;
      }
    },
  },
  methods: {
    //初始加载图谱
    initial1() {
      if(this.nowstatus == 1) {
        // console.log("初始化1");
        this.startinterval(1);
        this.flag = 0;
      }
    },
    initial2() {
      if(this.nowstatus == 1){
        // console.log("初始化2");
        this.startinterval(2);
        this.flag = 0;
      }
    },
    //实时情况下每三秒接收一次数据
    startinterval(num) {
      // console.log("开始实时画图");
      this.freshstatus = 1;
      let that = this;
      if(num == 1){
        this.getrealdata(1); //初次获得实时图谱信息
        this.lastpointstree1 = this.pointstree1;
        //控制第一棵树进行访问
        this.myinterval1 = setInterval(function(){
          //判断前后两棵树是否相等
          if(that.isequaltree(that.pointstree1, that.lastpointstree1)){
            if(that.pointstree1.length!=0){
              // console.log("myinterval1");
              that.$emit('addRealChart1');
            }
          }
          else{
            that.getrealdata(1);
            that.lastpointstree1 = that.pointstree1;
          }
        },3000)
      }
      else {
        this.getrealdata(2);
        this.lastpointstree2 = this.pointstree2;
        //控制第二棵树进行访问
        this.myinterval2 = setInterval(function(){
          //判断前后两棵树是否相等
          if(that.isequaltree(that.pointstree2, that.lastpointstree2)){
            if(that.pointstree2.length!=0){
              // console.log("myinterval2");
              that.$emit('addRealChart2');
            }
          }
          else{
            that.getrealdata(2);
            that.lastpointstree2 = that.pointstree2;
          }

        },3000)
      }
    },
    //比较前后两棵树是否一致
    isequaltree(tree1, tree2) {
      var len1 = tree1.length;
      var len2 = tree2.length;
      if(len1 != len2) {
        return false
      }
      else {
        for(var i = 0; i < len1; ++i) {
          if(tree1[i].id != tree2[i].id) {
            return false;
          }
        }
        return true;
      }
    },
    //第一次画图
    getrealdata(num) {
      //判断是否为空树（空树需要清空原图像）
      if(num==1){
        if(this.pointstree1.length == 0 ){
          this.$emit('cleanChart1');
          // this.$parent.$emit('datafail');
          this.$parent.$emit('pointNull')
        }
        else {
          this.$parent.dataloading();
          //构造出连续的pointid
          var points = [];
          for(var i=1; i<this.pointstree1.length; i++){
            points.push(this.pointstree1[i].id);
          }
          points = points.join(",");
          this.pointid1 = points;
          this.$emit('getRealChart1',this.$store.state.equid, this.pointid1, this.pointstree1);
        }
      }
      else {
        if(this.pointstree2.length == 0 ){
          this.$emit('cleanChart2');
          // this.$parent.$emit('datafail');
          this.$parent.$emit('pointNull')
        }
        else {
          this.$parent.dataloading();
          //构造出连续的pointid
          var points = [];
          for(var i=1; i<this.pointstree2.length; i++){
            points.push(this.pointstree2[i].id);
          }
          points = points.join(",");
          this.pointid2 = points;
          this.$emit('getRealChart2',this.$store.state.equid, this.pointid2, this.pointstree2);
        }
      }
    },
    notExitPoint() {
      this.$parent.$emit('notExitPoint');
    },
    //当第一颗测点数发生变化
    getUpNewPoint(point){
      this.pointstree1 = point;
      //如果是历史状态下改变测点树测点，更新历史图谱
      if(this.nowstatus == 2) {
        if(this.firstFlag1 && this.$store.state.historyImmediateFlag) {
          this.freshHistoryGraph(1);
          this.firstFlag1 = false;
        }
        if(!this.$store.state.historyImmediateFlag) {
          this.freshHistoryGraph(1);
        }
      }
    },
    //当第二颗测点数发生变化
    getDownNewPoint(point){
      this.pointstree2 = point;
      //如果是历史状态下改变测点树测点，更新历史图谱
      if(this.nowstatus == 2) {
        if(this.firstFlag2 && this.$store.state.historyImmediateFlag) {
          this.freshHistoryGraph(2);
          this.firstFlag2 = false;
        }
        if(!this.$store.state.historyImmediateFlag) {
          this.freshHistoryGraph(2);
        }
      }
    },
    //画历史图
    freshHistoryGraph(num) {
      // console.log("画历史图");
      if(this.myinterval1) {
        clearInterval(this.myinterval1);
      }
      if(this.myinterval2) {
        clearInterval(this.myinterval2);
      }
      this.mytime = this.$refs.timeset.timedata();
      var stime = this.mytime.form.starttime;
      var etime = this.mytime.form.endtime;
      if(num == 1){
        if(this.pointstree1.length == 0){
          this.$emit('cleanChart1');
          // this.$parent.$emit('datafail');
          this.$parent.$emit('pointNull')
        }
        else {
          this.$parent.dataloading();
          //构造出连续的pointid
          var points = [];
          for(var i=1; i<this.pointstree1.length; i++){
            points.push(this.pointstree1[i].id);
          }
          points = points.join(",");
          this.pointid1 = points;
          this.$emit('getHistoryChart1',this.$store.state.equid, this.pointid1,stime,etime,this.pointstree1);
        }
      }
      else {
        if(this.pointstree2.length == 0){
          this.$emit('cleanChart2');
          // this.$parent.$emit('datafail');
          this.$parent.$emit('pointNull')
        }
        else {
          this.$parent.dataloading();
          //构造出连续的pointid
          var points = [];
          for(var i=1; i<this.pointstree2.length; i++){
            points.push(this.pointstree2[i].id);
          }
          points = points.join(",");
          this.pointid2 = points;
          this.$emit('getHistoryChart2',this.$store.state.equid, this.pointid2,stime,etime,this.pointstree2);
        }
      }
    },
    stop1() {
      if (this.myinterval1) {
        clearInterval(this.myinterval1);
      }
    },
    stop2() {
      if (this.myinterval2) {
        clearInterval(this.myinterval2);
      }
    },
    //是否需要显示停止
    changestatus(data) {
      this.nowstatus = data;
      if(this.nowstatus == 1) {
        this.startinterval(1);
        this.startinterval(2);
      }
      else {
        if(this.myinterval1) {
          clearInterval(this.myinterval1);
        }
        if(this.myinterval2) {
          clearInterval(this.myinterval2);
        }
        this.gethistortdata();
      }
    },
    //初始画历史图谱
    gethistortdata(){
      this.$emit('reDataZoomInterval');
      this.freshHistoryGraph(1);
      this.freshHistoryGraph(2);
    },
    startall() {
      this.startinterval(1);
      this.startinterval(2);
    },
    //停止画图（一起停止）
    stopinterval() {
      this.freshstatus = 0;
      if(this.myinterval1) {
        clearInterval(this.myinterval1);
      }
      if(this.myinterval2) {
        clearInterval(this.myinterval2);
      }
    },
  }
}

</script>

<style lang="scss">
.other-parameters-trend-graph-op-pagejibeng {
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
    width: calc(100% - 16px);
    overflow: auto;
    display: flex;
    padding: 16px 8px;
    flex-direction: column;
    flex: 1
  }
  .Reciprocat-opPage-overviewType{
    padding: 0px 8px;
  }
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
    margin: 32px 0 0 0;
    background-color: var(--leftconbgcolor);
  }
  .checked{
    margin: 0 8px 16px 8px;
    background-color: var(--leftconbgcolor);
  }
  .el-form {
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
      margin: 0 0 16px 8px;
    }
    .el-select {
      width: 100%;
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
}
</style>
<script setup lang="ts">
</script>
