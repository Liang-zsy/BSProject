<template>
  <div class="cepstrum-graph-op-pagejibeng" ref="ui">
    <div class="Reciprocat-opPage-header">
      <span class="Reciprocat-opPage-header-text">{{translateText("opPage.textMap.","操作页")}}</span>
    </div>
    <div class="Reciprocat-opPage-body">
      <el-form ref="ruleForm" label-width="80px" class="demo-ruleForm" size="mini">
        <el-form-item :label="translateText('opPage.textMap.','设备名称:')" style="min-height:24px;">{{getequName}}</el-form-item>
        <cepstrum-graph-point-tree default
                                   @firstdo="defaultdo"
                                   @getPointFeatureTree2Data="getmytree"
                                   @stop="stop"></cepstrum-graph-point-tree>
        <div>
          <div class="reciprocat-overview-time-select">
            <RtHisTimeSelect ref='timeset' @radiostatus='changestatus'></RtHisTimeSelect>
          </div>
        </div>
        <el-form-item style="margin-bottom: 0px">
          <el-button v-if="nowstatus == 2" @click="FreshHistoryGraph" :loading="loadingStatus" style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','刷新')}}</el-button>
          <el-button v-if='nowstatus == 1 &&freshstatus == 0' @click='startinterval'style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','刷新')}}</el-button>
          <el-button v-if="nowstatus == 1 &&freshstatus == 1" @click='stopinterval' style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','停止 ')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import  CepstrumGraphPointTree from "./CepstrumGraphPointTree";
import RtHisTimeSelect from "../ComUtils/RtHisTimeSelect";
import keepAliveMixin from "../../mixins/keepAliveMixin";
import event from "@/assets/event";
export default {
  name: "CepstrumGraphOpPage",
  mixins:[keepAliveMixin],
  components: {
    RtHisTimeSelect,
    CepstrumGraphPointTree
  },
  data() {
    return {
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
    };
  },
  mounted() {
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
    getequName() {
      return this.$store.state.equName;
      // console.log("设备名称");
      // console.log(this.$store.state.equName);
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    },
    equid() {
      return this.$store.state.equid;
    },
  },
  watch:{
    equid(val) {
      // this.firstFlag = true;
      if(!this.activatedFlag) return ;
      if(this.$route.path == '/CepstrumGraph') {
        this.firstFlag = true;
      }
    } ,
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
    }
  },
  beforeDestroy() {
    if (this.myinterval) {
      clearInterval(this.myinterval);
    }
  },
  methods: {
    stop() {
      if (this.myinterval) {
        clearInterval(this.myinterval);
      }
    },
    //用于对前后两颗测点数进行对比
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
    //默认初始化进行画图
    defaultdo() {
      if (this.nowstatus == 1) {
        this.startinterval();
      }
    },
    //用于接收测点树的数据
    getmytree(mytreedata) {
      this.mytrees = mytreedata;
      // console.log("更新选取测点");
      // console.log(this.mytrees);
      // console.log(this.nowstatus)
      if (this.nowstatus == 2) {
        if(this.$store.state.historyImmediateFlag && this.firstFlag) {
          this.FreshHistoryGraph();
          this.firstFlag = false;
        }
        if(!this.$store.state.historyImmediateFlag) {
          this.FreshHistoryGraph();
        }
      }
    },
    //实时情况下每三秒接收一次数据
    startinterval() {
      this.freshstatus = 1;
      this.getrealdata();
      this.lasttree = this.mytrees;
      let that = this;
      this.myinterval = setInterval(function () {
        //如果两次间隔的测点树一致之间添加数据
        if (that.isequaltree(that.mytrees.checkedNodes, that.lasttree.checkedNodes)) {
          //多通道
          if (that.mytrees.treeSelect == '0' && that.mytrees.featureSelect != that.lasttree.featureSelect) {
            // console.log('here is not interval');
            that.getrealdata();
            that.lasttree = that.mytrees;
          } else {
            // console.log('here is interval1111');
            if (that.isnontree != true) {  //空树不需要添加数据
              if (that.mytrees.treeSelect == 1) {
                that.$emit('addrealdantongdao');
              } else {
                that.$emit('addrealduotongdao');
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
    //初始化树，并添加第一次访问的图谱数据
    getrealdata() {
      let that = this;
      //多通道
      if (this.mytrees.treeSelect == 0) {
        if (this.mytrees.checkedNodes.length === 1) {
          //判断空树
          this.isnontree = true;
          this.$emit('cleanChart');
          // console.log(4);
          // that.$parent.$emit('datafail')
        } else {
          that.$parent.dataloading();
          //构造出连续的pointid
          var points = [];
          for (var i = 1; i < this.mytrees.checkedNodes.length; i++) {
            points.push(this.mytrees.checkedNodes[i].id);
          }
          points = points.join(",");
          this.mypointid = points;
          // console.log(this.mytrees.unit,'this.mytrees.unit')
          this.$emit('realduotongdao', this.$store.state.equid, this.mypointid, this.mytrees.checkedNodes, this.mytrees.featureSelect, this.mytrees.unit);
        }
      }
      //单通道
      else {
        if (this.mytrees.checkedNodes.length === 0) {
          //判断空树
          this.isnontree = true;
          this.$emit('cleanChart');
          // console.log(2);
          // that.$parent.$emit('datafail')
        } else {
          that.$parent.dataloading();
          this.mypointid = this.mytrees.checkedNodes[0].id;
          this.$emit('realdantongdao', this.$store.state.equid, this.mypointid, this.mytrees.checkedNodes);
        }
      }
    },
    //更新历史图谱
    FreshHistoryGraph() {
      event.$emit('updatePrimaryLine'); // 清空主辅游标
      this.$emit('reDataZoomInterval');
      this.stop();
      //多通道
      if (this.mytrees.treeSelect == 0) {
        if (this.mytrees.checkedNodes.length === 1) {
          //判断空树
          this.$emit('cleanChart');
          // this.$parent.$emit('datafail');
        } else {
          this.$parent.dataloading();
          this.mytime = this.$refs.timeset.timedata();
          var stime = this.mytime.form.starttime;
          var etime = this.mytime.form.endtime;
          //构造出连续的pointid
          var points = [];
          for (var i = 1; i < this.mytrees.checkedNodes.length; i++) {
            points.push(this.mytrees.checkedNodes[i].id);
          }
          points = points.join(",");
          this.mypointid = points;
          console.log(this.mytrees.unit,'this.mytrees.unit')
          this.$emit('drawhistoryduotongdao', this.$store.state.equid, this.mypointid, this.mytrees.checkedNodes, this.mytrees.featureSelect, stime, etime,this.mytrees.unit)
        }
      }
      //单通道
      else {
        if (this.mytrees.checkedNodes.length === 0) {
          //判断空树
          this.$emit('cleanChart');
          // this.$parent.$emit('datafail');
        } else {
          this.$parent.dataloading();
          this.mytime = this.$refs.timeset.timedata();
          var stime = this.mytime.form.starttime;
          var etime = this.mytime.form.endtime;
          this.mypointid = this.mytrees.checkedNodes[0].id;
          this.$emit('drawhistorydantongdao', this.$store.state.equid, this.mypointid, this.mytrees.checkedNodes, stime, etime);
        }
      }
    },
    //点击停止按钮终止实时图谱绘制
    stopinterval() {
      this.freshstatus = 0;
      if (this.myinterval) {
        clearInterval(this.myinterval);
      }
    },
    //当实时按钮与历史按钮进行切换时触发
    changestatus(data) {
      this.nowstatus = data;
      if (this.nowstatus == 1) {
        this.startinterval();
      } else {
        this.FreshHistoryGraph();
      }
    },
  }
}
</script>

<style lang="scss">
.cepstrum-graph-op-pagejibeng {
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
