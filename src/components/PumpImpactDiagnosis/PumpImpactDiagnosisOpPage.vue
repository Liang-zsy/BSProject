<template>
  <div class="pumpimpactdiagnosis-op-pagejibeng" ref="ui">
    <div class="Reciprocat-opPage-header">
      <span class="Reciprocat-opPage-header-text">{{translateText("opPage.textMap.","操作页")}}</span>
    </div>
    <div class="Reciprocat-opPage-body">
      <el-form ref="ruleForm" :label-width="labelWidth" class="demo-ruleForm" size="mini">
        <el-form-item :label="translateText('opPage.textMap.','设备名称:')" label-width="80px" style="min-height:24px;">{{getequName}}</el-form-item>
        <PumpImpactDiagnosisPointFeatureTree
          @firstdo="defaultdo"
          @notExitPoint="notExitPoint"
          @getPointFeatureTree2Data="getmytree"></PumpImpactDiagnosisPointFeatureTree>
        <div>
          <el-form-item :label="translateText('opPage.textMap.','缺陷频率:')" label-width="80px" style="margin-top: 8px; margin-bottom: 8px;">
            <el-radio-group v-model="another_status">
              <el-radio :label="0">{{translateText('opPage.textMap.','显示')}}</el-radio>
              <el-radio :label="1">{{translateText('opPage.textMap.','隐藏')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="translateText('opPage.textMap.','叶片频率:')" label-width="80px" style="margin-bottom: 8px">
            <el-radio-group v-model="another_status1">
              <el-radio :label="0">{{translateText('opPage.textMap.','显示')}}</el-radio>
              <el-radio :label="1">{{translateText('opPage.textMap.','隐藏')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <RtHisTimeSelect ref='timeset' @radiostatus='changestatus'></RtHisTimeSelect>
          <select-number class="selectnumber"></select-number>
        </div>
        <el-form-item>
          <el-button v-if="nowstatus == 2" @click="FreshHistoryGraph" :loading="loadingStatus" style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','刷新')}}</el-button>
          <el-button v-if='nowstatus == 1 &&freshstatus == 0' @click='startinterval' style="font-size: 14px">{{translateText('opPage.textMap.','刷新')}}</el-button>
          <el-button v-if="nowstatus == 1 &&freshstatus == 1" @click='stopinterval' style="font-size: 14px">{{translateText('opPage.textMap.','停止')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import PumpImpactDiagnosisPointFeatureTree from "../PumpImpactDiagnosis/PumpImpactDiagnosisPointFeatureTree";
import RtHisTimeSelect from "../ComUtils/RtHisTimeSelect";
import SelectNumber from "../ComUtils/SelectNumber";
import keepAliveMixin from "../../mixins/keepAliveMixin";
import event from "@/assets/event";
export default {
  name: "PumpImpactDiagnosisOpPage",
  mixins:[keepAliveMixin],
  components: {
    SelectNumber,
    RtHisTimeSelect,
    PumpImpactDiagnosisPointFeatureTree
  },
  data() {
    return {
      another_status: 1,
      another_status1: 1,
      checkList: ['包络波形','包络频谱'],
      //单通道相关数据
      mypointid: null,
      myinterval: null,
      freshstatus: 1,
      nowstatus: 1,
      msg: '',
      EquName: '',
      isnontree: false,
      mytrees: null,
      mytime: null,
      lasttree: null,
      loadingStatus: false, //历史模式下接口是否已经返回结果
      firstFlag: true,
      labelWidth: this.$i18n.locale == 'zh' ? '80px' : '110px',
    };
  },
  mounted() {
    //接收A组件的数据
    //this.getPoint(this.msg);
    this.$parent.dataloading();
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
  computed: {
    xinshi(){
      return this.another_status;
    },
    xinshi1() {
      return this.another_status1;
    },
    nodeData() {
      return this.$store.state.nodeData;
    },
    equid() {
      return this.$store.state.equid;
    },
    nodeNum() {
      return this.$store.state.nodeNum;
    },
    getequName() {
      return this.$store.state.equName;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    }
  },
  watch: {
    xinshi(value) {
      if(!this.activatedFlag) return ;
      this.$emit('yaoxianshi', value);
    },
    xinshi1(value) {
      if(!this.activatedFlag) return ;
      this.$emit('yaoxianshi1', value);
    },
    equid(){
      if(!this.activatedFlag) return ;
      // this.firstFlag = true;
      if(this.$route.path == '/PumpImpactDiagnosis') {
        this.firstFlag = true;
      }
      if(this.myinterval) {
        var CancelToken = this.$axios.CancelToken;
        clearInterval(this.myinterval)
      }
      if (typeof this.cancel == 'function') {
        this.cancel()
      }
    },
    topiccolor(val) {
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
  beforeDestroy() {
    if(this.myinterval) {
      clearInterval(this.myinterval)
    }
  },
  methods: {
    defaultdo() {

    },
    notExitPoint(){
      this.$parent.$emit('notExitPoint');
    },
    getmytree(mytreedata){//接收测点树的数据
      this.mytrees = mytreedata;
      if(false){
        if(this.$store.state.historyImmediateFlag && this.firstFlag){
          this.$parent.clearchart();
          this.firstFlag=false;
        }
        if(!this.$store.state.historyImmediateFlag){
          this.$parent.clearchart();
        }
        this.$parent.$emit('pointNull');
      }
      else{
        if(this.nowstatus ==1){
          this.startinterval();
        }
        else{
          if(this.myinterval){
            var CancelToken=this.$axios.CancelToken;
            clearInterval(this.myinterval)
          }
          if(typeof this.cancel == 'function'){
            this.cancel()
          }
          if(this.$store.state.historyImmediateFlag && this.firstFlag){
            this.FreshHistoryGraph();
            this.firstFlag = false;
          }
          if(!this.$store.state.historyImmediateFlag){
            this.FreshHistoryGraph();
          }
        }
      }
    },
    async changestatus(data){
      this.nowstatus = data;
      if(this.nowstatus == 1){
        setTimeout(()=>{
          this.startinterval();
        },500)
      }
      else{
        if(this.myinterval){
          clearInterval(this.myinterval);
        }
        await this.FreshHistoryGraph();
      }
    },
    FreshHistoryGraph() {
      event.$emit('updatePrimaryLine'); // 清空主辅游标
      this.$emit('reDataZoomInterval');
      if (this.mytrees.treeSelect == 0) {
        if (this.mytrees.checkedNodes.length <= 1) {
          //判断空树
          this.isnontree = true;
          this.$emit('cleanChart');
          this.$parent.$emit('pointNull')
        } else {
          this.$parent.dataloading();
          this.mytime = this.$refs.timeset.timedata();
          var stime = this.mytime.form.starttime;
          var etime = this.mytime.form.endtime;
          var pointids = '';
          for (var i = 1; i < this.mytrees.checkedNodes.length; ++i) {
            pointids += this.mytrees.checkedNodes[i].id;
            if (i != this.mytrees.checkedNodes.length - 1) {
              pointids += ','
            }
          }
          if(this.mytrees.checkedNodes[0].id== '振动-位移'|| this.mytrees.checkedNodes[0].id== '振动-加速度'){
            this.type = 113;
          }else if(this.mytrees.checkedNodes[0].id== '振动-速度'){
            this.type = 114;
          }
          this.mypointid = pointids;
          if(this.myinterval) {
            clearInterval(
              this.myinterval
            )
          }
          this.$emit('drawhistoryduotongdao', this.$store.state.equid, this.mypointid, stime, etime, this.mytrees.checkedNodes, this.mytrees.featureSelect,this.type);
        }
      } else {
        if (this.mytrees.checkedNodes.length === 0) {
          //判断空树
          this.isnontree = true;
          this.$emit('cleanChart');
          this.$parent.$emit('pointNull')
        } else {
          this.$parent.dataloading();
          this.mytime = this.$refs.timeset.timedata();
          var stime = this.mytime.form.starttime;
          var etime = this.mytime.form.endtime;
          this.mypointid = this.mytrees.checkedNodes[0].pointUuid;
          if(this.myinterval) {
            clearInterval(
              this.myinterval
            )
          }
          this.$emit('drawhistorydantongdao', this.$store.state.equid, this.mytrees.checkedNodes[0].xid, stime, etime, this.mypointid, this.mytrees.checkedNodes,this.mytrees.checkedNodes[0].label);
        }
      }
    },
    startinterval() {  //实时情况下每三秒接收一次数据
      this.freshstatus = 1;
      this.getrealdata();
      this.lasttree = this.mytrees;
      let that = this;
      if(this.myinterval) {
        clearInterval(this.myinterval)
      }
      this.myinterval = setInterval(function () {
        //如果两次间隔的测点树一致之间添加数据n
        if (that.isequaltree(that.mytrees.checkedNodes, that.lasttree.checkedNodes)) {
          // console.log(12334)
          if (that.mytrees.treeSelect == '0' && that.mytrees.featureSelect != that.lasttree.featureSelect) {
            that.getrealdata();
            that.lasttree = that.mytrees;
          } else {
            // console.log(232323)
            if (that.isnontree != true) {  //空树不需要添加数据
              if (that.mytrees.treeSelect == 1) {
                that.$emit('addrealdantongdao');
              } else {
                that.$emit('addrealduotongdao', that.$store.state.equid, that.mypointid);
              }
            }
          }
        } else {
          //否则更新
          // console.log('here is not interval');
          that.getrealdata();
          that.lasttree = that.mytrees;
        }
      }, 3000)
    },
    stopinterval() {
      this.freshstatus = 0;
      if (this.myinterval) {
        clearInterval(this.myinterval);
      }
    },
    async getrealdata() {
      //初始化树，并添加第一次访问的图谱数据
      let that = this;
      if (this.mytrees.treeSelect == 0) {
        if (this.mytrees.checkedNodes.length <= 1) {
          //判断空树
          this.isnontree = true;
          this.$emit('cleanChart');
          // that.$parent.$emit('datafail')
          this.$parent.$emit('pointNull')
        } else {
          this.isnontree = false;
          var pointids = '';
          for (var i = 1; i < this.mytrees.checkedNodes.length; ++i) {
            pointids += this.mytrees.checkedNodes[i].id;
            if (i != this.mytrees.checkedNodes.length - 1) {
              pointids += ','
            }
          }
          if(this.mytrees.checkedNodes[0].id== '振动-位移'|| this.mytrees.checkedNodes[0].id== '振动-加速度'){
            this.type = 113;
          }else if(this.mytrees.checkedNodes[0].id== '振动-速度'){
            this.type = 114;
          }
          this.mypointid = pointids;
          await that.$emit('drawrealduotongdao', this.$store.state.equid, pointids, this.mytrees.checkedNodes, this.mytrees.featureSelect,this.type);
        }
      } else {
        if (this.mytrees.checkedNodes.length === 0) {
          //判断空树
          this.isnontree = true;
          this.$emit('cleanChart');
          // console.log(2);
          // that.$parent.$emit('datafail')
          this.$parent.$emit('pointNull')
        } else {
          this.isnontree = false;
          that.$parent.dataloading();
          this.mypointid = this.mytrees.checkedNodes[0].pointUuid;
          // // console.log('types ' , this.mytrees.type)
          if(this.mytrees.checkedNodes[0].id== '振动-位移'|| this.mytrees.checkedNodes[0].id== '振动-加速度'){
            this.type = 113;
          }else if(this.mytrees.checkedNodes[0].id== '振动-速度'){
            this.type = 114;
          }
          await  this.$emit('realdantongdao', this.$store.state.equid, this.mytrees.checkedNodes[0].xid, this.mypointid, this.mytrees.checkedNodes,this.type);
        }

      }

    },
    isequaltree(tree1, tree2) {
      var len1 = tree1.length;
      var len2 = tree2.length;
      if (len1 != len2) {
        return false
      } else {
        for (var i = 0; i < len1; ++i) {
          if (tree1[i].id != tree2[i].id) {
            return false;
          }
        }
        return true;
      }
    },

    Show_Spectrum(){
      this.another_status = !this.another_status;
    },
  }
}
</script>

<style lang="scss">
.pumpimpactdiagnosis-op-pagejibeng {
  --conbgcolor: #0D0F1F;
  --leftconbgcolor: #222331;
  --textcolor: #ffffff;
  --activetextcolor: #1677FF;
  --treeinputbgcolor: #ffffff;
  --labelcolor: #696B6F;
  --checkedcolor: #1677FF;
  --buttoncolor: #1677FF;
  --buttontextcolor: #ffffff;
  .Reciprocat-opPage-header {
    padding: 6px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--leftconbgcolor);
    box-shadow: 0 1px 1px 0 var(--conbgcolor);
    color: var(--textcolor);
  }

  .Reciprocat-opPage-header-text {
    color: var(--checkedcolor);
    height: auto;
    font-family: "Microsoft YaHei";
    font-size: 16px;
    font-weight: 700;
  }

  .Reciprocat-opPage-body {
    height: calc(100% - 65px);
    width: calc(100% - 16px);
    overflow: auto;
    display: flex;
    padding: 16px 8px;
    flex-direction: column;
    flex: 1
  }

  .el-form-item {
    .el-radio {
      color: var(--textcolor);
    }


    .el-radio:first-child {
      margin-right: 20px;
    }

    .el-radio__label {
      font-size: 14px;
      color: var(--textcolor);
    }
  }

  .Reciprocat-opPage-overviewType {
    padding: 0px 8px;
  }

  .el-radio__inner {
    border-color: var(--textcolor);
    background-color: var(--leftconbgcolor);
  }

  .el-radio__inner::after {
    width: 7px;
    height: 7px;
    background-color: var(--checkedcolor);
  }

  .el-radio__input.is-checked .el-radio__inner {
    border-color: var(--checkedcolor);
    background-color: var(--leftconbgcolor);
  }

  .el-checkbox__inner {
    background-color: var(--leftconbgcolor);
    border-color: var(--textcolor)
  }

  .el-checkbox__input.is-checked .el-checkbox__inner {
    border-color: var(--checkedcolor);
    background-color: var(--checkedcolor);
  }

  .el-checkbox__label {
    font-size: 14px;
    color: var(--textcolor) !important;
  }

  .reciprocat-overview-time-select {
    margin: 32px 0 0 0;
    background-color: var(--leftconbgcolor);
  }

  .checked {
    margin: 0 8px 16px 8px;
    background-color: var(--leftconbgcolor);
  }

  .el-main {
    padding: 2px;
    margin-left: 10px;
    margin-right: 10px
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
      width: 80px;
      color: var(--textcolor);
      text-align: left;
      padding: 0px 2px 0px 0px;
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

  .selectnumber {
    .el-select {
      width: 75%;

      .el-input {
        width: 100%;
      }
    }
  }
}
</style>
