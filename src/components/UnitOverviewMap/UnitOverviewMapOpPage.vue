<template>
  <div class="UnitOverviewMapOpPagejibeng" ref="ui">
    <div class="Reciprocat-opPage-header">
      <span class="Reciprocat-opPage-header-text">{{translateText("opPage.textMap.","操作页")}}</span>
    </div>
    <div class="Reciprocat-opPage-body">
      <overview-type-op-page class="overviewType" :inputChecked="checked"  @overviewChange="overviewChange"></overview-type-op-page>
      <el-checkbox v-model="checked" class="checked" >{{translateText("opPage.textMap.","图谱显示")}}</el-checkbox>
      <div v-show="checked">
        <el-form ref="ruleForm" label-width="80px" size="mini">
          <el-form-item :label="translateText('opPage.textMap.','设备名称:')" style="min-height: 24px">{{getequName}}</el-form-item>
          <UnitOverviewMapTree type="振动" @getNewPoint="getmytree" :nowstatus="nowstatus == 1"></UnitOverviewMapTree>
          <div class="reciprocat-overview-time-select">
            <RtHisTimeSelect ref='timeset' @radiostatus='changestatus'></RtHisTimeSelect>
          </div>
          <el-form-item style="margin-bottom: 0px">
            <el-button v-if="nowstatus == 2" @click="FreshHistoryGraph" :loading="loadingStatus" style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','刷新')}}</el-button>
            <el-button v-if='nowstatus == 1 &&freshstatus == 0' @click='startinterval' style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','刷新')}}</el-button>
            <el-button v-if="nowstatus == 1 &&freshstatus == 1" @click='stopinterval' style="font-size: 14px;margin-top: 24px">{{translateText('opPage.textMap.','停止')}}</el-button>
          </el-form-item>

          <!--          <el-checkbox v-model="checked">显示图谱</el-checkbox>-->
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
  import RtHisTimeSelect from "../ComUtils/RtHisTimeSelect";
  import UnitOverviewMapTree from "../ComUtils/UnitOverviewMapTree";
  import keepAliveMixin from "../../mixins/keepAliveMixin";
  import OverviewTypeOpPage from "../ComUtils/OverviewTypeOpPage.vue";
  import event from "../../assets/event.js"

  export default {
    name: "UnitOverviewMapOpPage",
    components: {
      OverviewTypeOpPage,
      UnitOverviewMapTree,
      RtHisTimeSelect,
    },
    mixins:[keepAliveMixin],
    data() {
      return {
        loadingStatus: false, //历史模式下接口是否已经返回结果
        checked: false,
        // overviewType: '',
        nowChecked:0,
        //单通道相关数据
        mypointid: null,
        myinterval: null,
        freshstatus: 1,
        nowstatus: 1,//实时状态为1，历史状态为2
        msg: '',
        EquName: '',
        isnontree: false,
        mytrees: null,
        mytime: null,
        lasttree: null,
        ifnowdata:true,   //实时
        ProcessOverviewShow: this.$store.state.ProcessOverviewShow, //是否显示工艺量概貌图
        firstFlag: true, //第一次进入页面的标识
      };
    },
    mounted() {
      // this.$parent.dataloading();
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
    destroyed() {
      if(this.myinterval) {
        clearInterval(this.myinterval)
      }
    },
    computed: {
      equid() {
        return this.$store.state.equid;
      },
      getequName() {
        return this.$store.state.equName;
      },
      topiccolor() {
        return this.$store.state.topiccolor;
      },
    },
    watch: {
      equid(){
        console.log("qdy检测到设备发生改变了")
        // this.firstFlag = true;
        console.log(this.checked, this.nowChecked);
        if(this.$route.path == '/UnitOverviewMap') {
          this.firstFlag = true;
        }
      },
      //是否显示趋势图
      checked(val){
        //this.nowChecked=0;
        console.log("checked,val:"+val)
        if(val){
          this.nowChecked=1;
          this.$store.commit('setflaggraph', true);
          if(!this.$store.state.flaggraph && this.$store.state.flagporight && this.$store.state.flagopleft) {
            this.$store.commit('setmarginleftvalue', '0%');
          }
          this.$emit('showgraph');
        }
        else {
          this.nowChecked=0;
          this.$store.commit('setflaggraph', false);
          this.$store.commit('setmarginleftvalue', '10%');
          this.$emit('notshowgraph');
        }
        this.showGrap();
        if(this.nowChecked ==1 && this.nowstatus == 2)
          this.FreshHistoryGraph();
      },
      topiccolor(val) {

        // console.log('我的颜色',this.$store.state.textcolcor)
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
    methods: {
      overviewChange(val) {
        console.log("happen->概貌图切换", this.overviewType)
        this.$emit("overviewChange", val)
        // this.checked = false
      },
      getmytree(mytree) {
        console.log("getmytree()");
        this.mytrees = mytree;    //得到测点树的数据的时候先不请求 ，所以去掉
         console.log("this.mytrees ",this.mytrees )
        this.$nextTick(() => {

          //初始时传数据
          console.log('设备发生变化重新加载');
          this.showGrap();
        });
      },
      showGrap(){
        console.log('是否刷新数据', this.firstFlag);
        console.log(this.nowChecked, this.nowstatus);
        if(this.nowChecked ==1){

          if (this.nowstatus == 1) {
            if(this.myinterval) {
              clearInterval(this.myinterval);
            }
            this.startinterval();


          } else {
            if (this.myinterval) {
              clearInterval(this.myinterval);
            }
            console.log(this.firstFlag, this.checked, this.$store.state.historyImmediateFlag);
            if(this.firstFlag && this.checked && this.$store.state.historyImmediateFlag) {
              this.FreshHistoryGraph();
              this.firstFlag = false;
            }
            if(!this.$store.state.historyImmediateFlag) {
              this.FreshHistoryGraph();
            }

          }
        }else if(this.nowChecked ==0){
          if (this.myinterval) {
            clearInterval(this.myinterval);
          }
        }
      },
      startinterval() {  //实时情况下每三秒接收一次数据

        this.freshstatus = 1;
        this.getrealdata();
        this.lasttree = this.mytrees;
        let that = this;
        this.$store.state.intervalId = setInterval(function () {

          //如果两次间隔的测点树一致之间添加数据n
          if (that.isequaltree(that.mytrees.checkedNodes, that.lasttree.checkedNodes)) {

            if (that.mytrees.featureSelect != that.lasttree.featureSelect) {
              that.getrealdata();
              that.lasttree = that.mytrees;
            } else {
              if (that.isnontree != true) {  //空树不需要添加数据
                if(that.lasttree.checkedNodes[0].id.indexOf('振动')!=-1 ){
                  that.$emit('AddrealGrap', that.$store.state.equid, that.mypointid);
                }else{
                  that.$emit('AddoutherrealGrap', that.$store.state.equid, that.mypointid);
                }
              }
            }
          } else {


            // that.getrealdata();
            that.lasttree = that.mytrees;
          }

        }, 3000)
        this.myinterval = this.$store.state.intervalId;

      },
      FreshHistoryGraph() {
        event.$emit('updatePrimaryLine'); // 清空主辅游标
        this.$emit('reDataZoomInterval');
        console.log('FreshHistoryGraph');
        console.log("FHG:mytrees"+this.mytrees);
        this.$store.state.gongyiOverviewIframeHistoryTime = null;
        if (!this.mytrees) {
          return ;
        }
        if (this.mytrees.checkedNodes.length == 1 || this.mytrees.checkedNodes.length==0) {

          this.$emit('cleanChart');
          this.$parent.$emit('pointNull')
        } else {
          console.log('发射事件');
          // this.$parent.dataloading();
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
          this.mypointid = pointids;
          console.log("数据概貌图测点树",this.mypointid, this.mytrees);
          if(this.mytrees.checkedNodes[0].id.indexOf('振动')!=-1){
            this.$emit('DramHistoryGrap', this.$store.state.equid, this.mypointid, stime, etime, this.mytrees.checkedNodes, this.mytrees.featureSelect);

          }else{

            this.$emit('DramOtherHistoryGrap', this.$store.state.equid, this.mypointid, stime, etime, this.mytrees.checkedNodes, this.mytrees.featureSelect);
          }

        }
      },
      getrealdata() {
        //初始化树，并添加第一次访问的图谱数据
        let that = this;

        if (this.mytrees.checkedNodes.length == 1 || this.mytrees.checkedNodes.length == 0) {
          //判断空树
          this.isnontree = true;
          this.$emit('cleanChart');
          that.$parent.$emit('pointNull')
        } else {
          this.isnontree = false;
          var pointids = '';
          for (var i = 1; i < this.mytrees.checkedNodes.length; ++i) {
            pointids += this.mytrees.checkedNodes[i].id;
            if (i != this.mytrees.checkedNodes.length - 1) {
              pointids += ','
            }
          }
          this.mypointid = pointids;

          if(this.mytrees.checkedNodes[0].id.indexOf('振动')!=-1){
            that.$emit('DrawrealGrap', this.$store.state.equid, pointids, this.mytrees.checkedNodes, this.mytrees.featureSelect);
          }else{
            that.$emit('DrawoutherrealGrap', this.$store.state.equid, pointids, this.mytrees.checkedNodes, this.mytrees.featureSelect);
          }

        }
        // that.startinterval()
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
      stopinterval() {
        this.freshstatus = 0;
        if (this.myinterval) {
          clearInterval(this.myinterval);
        }
      },
      changestatus(data) {
        this.nowstatus = data;
        this.$nextTick(() => {

          //初始时传数据

          this.showGrap();

        });
        if (this.nowstatus == 1) {
          this.startinterval();
          this.ifnowdata = true;

        } else {
          if (this.myinterval) {
            clearInterval(this.myinterval);
          }
          this.FreshHistoryGraph();
          this.ifnowdata = false;
        }
        this.$emit('static',this.ifnowdata);
      },

    }

  }
</script>

<style lang="scss">
.UnitOverviewMapOpPagejibeng {
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

  .Reciprocat-opPage-body {
    padding: 16px 8px;
  }


  .el-header {
    height: 60px;
    background: var(--leftconbgcolor);

    .options {
      color: var(--activetextcolor);
    }
  }
  .checked{
    margin: 0 8px 16px 8px;
    background-color: var(--leftconbgcolor);
  }
  .overviewType {
    display: flex;
    align-items: center;
    padding: 0 8px;
    gap: 16px;
    background-color: var(--leftconbgcolor);
    .el-radio__label {
      font-size: 14px;
      color: var(--textcolor);
    }
  }
  .el-main {
    padding: 2px;
    margin-left: 20px;
    margin-right: 20px
  }

  .reciprocat-overview-time-select {
    margin: 8px 0 0 0;
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
