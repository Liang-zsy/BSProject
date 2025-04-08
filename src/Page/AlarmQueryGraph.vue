<template>
  <div class="Alarmjibeng" ref="ui">
    <div class="tuPu" id="lefttupu">
      <div :style="{height:highexe(1)}" v-show="(fullId===1||fullId===0)&& nowTrend===1" @dblclick="$store.state.dblclickEnabled && handledblclick(1)">

        <!--      <div class="divGraph" :style="{height:graphheight}" v-show="showGrap">-->
        <AlarmTrendGraph ref='trendg' id="onetrend" @chartinfo="cursorSynchronization($event,'true')" :AlarmValueY="AlarmValueY" @refine="refine"
                         @cancelRefine="cancelRefine" @cancelFull="handledblclick(1)" @dataZoom="dataZoom" @reDataZoom="reDataZoom"></AlarmTrendGraph>

      </div>
      <div v-for="(item, index) in trends" :key="index" :style="{height : highexe(item.id + 2)}" v-show="fullId===item.id+2||fullId===0"
           @dblclick="$store.state.dblclickEnabled && handledblclick(item.id+2)">

        <!--       <div class="otherdivGraph"  v-for="item in trends" :style="{height:othergraphheight}"  v-show="showOutherGrap">-->
        <AlarmTrendGraph :ref='item.name' :id="forId(index)" :AlarmValueY="AlarmValueY" @refine="refine1(arguments, item.id)"
                         @chartinfo="cursorSynchronization($event,'false',index)" @cancelRefine="cancelRefine1(item.id)"
                         @cancelFull="handledblclick(item.id+2)" @dataZoom="dataZoom" @reDataZoom="reDataZoom"></AlarmTrendGraph>
      </div>
      <div :style="{height : highexe(trends.length+3)}" v-show="(fullId===trends.length+3||fullId===0)&&nowTrend===1"
           @dblclick="$store.state.dblclickEnabled && handledblclick(trends.length+3)">

        <!--        <div class="divGraph":style="{height:Spectrumgraphheight}" v-show="showGrap">-->
        <WaveGraph @cancelFull="handledblclick(3)" ref='waveg' class="graph"></WaveGraph>
      </div>
      <div :style="{height : highexe(trends.length+2)}" v-show="(fullId===trends.length+2||fullId===0)&&nowTrend===1"
           @dblclick="$store.state.dblclickEnabled && handledblclick(trends.length+2)">

        <!--        <div class="divGraph":style="{height:Spectrumgraphheight}" v-show="showGrap">-->
        <SpectrumGraph ref="spectrumg" @cancelFull="handledblclick(trends.length+2)"></SpectrumGraph>
      </div>
    </div>

    <!--  隐藏操作页按钮  -->
    <OpHideButton
      :showOpPage="showOpPage"
      @updateShowOpPage="updateShowOpPage">
    </OpHideButton>

    <div class='op' v-show="showOpPage">
      <AlarmQueryGraphOpPage @refresh="refreshDate" @reDataZoomInterval="reDataZoomInterval"
                             ref="opPage"></AlarmQueryGraphOpPage>
    </div>
  </div>

</template>


<script>
import AlarmQueryGraphOpPage from "../components/AlarmQueryGraph/AlarmQueryGraphOpPage";
//import TrendGraph from "../components/ComUtils/TrendGraph";
import event from "../assets/event";
import SpectrumGraph from "../components/ComUtils/SpectrumGraph";
import AlarmTrendGraph from "../components/ComUtils/AlarmTrendGraph";
import WaveGraph from "../components/ComUtils/WaveGraph";
import keepAliveMixin from "@/mixins/keepAliveMixin";
import keyPressSignalMixin from "../mixins/keyPressSignalMixin";
import {timestampToTimeFormat} from "../components/ComUtils/TimeFormat";
import OpHideButton from "@/components/ComUtils/OpHideButton";

export default {
  name: "AlarmQueryGraph",
  components: {WaveGraph, AlarmTrendGraph, SpectrumGraph, /*TrendGraph, */AlarmQueryGraphOpPage, OpHideButton},
  mixins: [keepAliveMixin,keyPressSignalMixin],
  data() {
    return {
      stime: null,
      etime: null,
      fullId: 0,
      isFull: false,
      unitname: '机泵监测分析-报警分析',
      graphheight: '50%',
      othergraphheight: '0%',
      Spectrumgraphheight: '50%',
      trends: [],
      // 放大的区间记录，开始
      zoomDataIntervalBegin: [],
      // 放大的区间记录，结束
      zoomDataIntervalEnd: [],
      alarmPointsName: ['温度', '压力', '流量', '其它'],
      alarmPointNum: null,
      nowProcessTree: [],
      processPointIdStringList: [],
      nowVibrationTree: [],
      vibrationPointIdString: null,
      myinterval: null,
      nowpointid: null,
      tongdao: null,
      graphtype: null,
      backmap: null,
      textmap: null,
      colormap: null,
      nowdata: null,
      checkedData: null,
      onlyname: '',
      onlyone: 0,
      showOpPage: true,
      showGrap: true,
      showOutherGrap: false,
      // length: ''
      AlarmValueY: [],
      OtherAlarmValueY: [],
      nowTrend:1,
      //细化进行的修改
      NowfeatureSelect: null,
      Nownumber: 0,
      Nowtongdao: 0,
      nowunit: [],
      danunit: '',
      jiasuduWeiyiMap: null,
      sudumap: null
    }
  },
  created() {
    var mymap = new Map();
    mymap.set('0', "#FFE4C4")
    mymap.set('1', "#00FFFF")
    mymap.set('2', "#4B0082")
    mymap.set('3', "#F0E68C")
    mymap.set('4', "#778899")
    mymap.set('5', "#7B68EE")
    mymap.set('6', "#FF0000")
    mymap.set('7', "#FFFAFA")
    mymap.set('8', "#008080")
    mymap.set('9', "#FA8072")
    mymap.set('10', "#D3D3D3")
    mymap.set('11', "#FFFFE0")
    this.colormap = mymap
    mymap = new Map();
    mymap.set('0', "通频")
    mymap.set('1', "1倍频幅值")
    mymap.set('2', "2倍频幅值")
    mymap.set('3', "3倍频幅值")
    mymap.set('4', "1/2倍频幅值")
    mymap.set('5', "残振")
    mymap.set('6', "直流量")
    mymap.set('7', "间隙电压")
    mymap.set('8', "1倍频相位")
    mymap.set('9', "2倍频相位")
    mymap.set('10', "3倍频相位")
    mymap.set('11', "1/2倍频相位")
    this.textmap = mymap
    mymap = new Map();
    mymap.set('0', "加速度峰值")
    mymap.set('1', "加速度高频")
    mymap.set('2', "加速度低频")
    mymap.set('3', "加速度波形峭度")
    mymap.set('4', "速度有效值")
    mymap.set('5', "同频gIE值")
    this.jiasuduWeiyiMap = mymap
    mymap = new Map();
    mymap.set('0', "通频有效值")
    mymap.set('1', "1倍频幅有效值")
    mymap.set('2', "2倍频有效值")
    mymap.set('3', "3倍频有效值")
    mymap.set('4', "0.5倍频有效值")
    mymap.set('5', "残振有效值")
    this.sudumap = mymap
    mymap = new Map();
    mymap.set("0", 'all')
    mymap.set("1", 'one')
    mymap.set("2", 'two')
    mymap.set("3", 'three')
    mymap.set("4", 'half')
    mymap.set("5", 'res')
    mymap.set("6", 'dc')
    mymap.set("7", 'gap')
    mymap.set("8", 'phaseOne')
    mymap.set("9", 'phaseTwo')
    mymap.set("10", 'phaseThree')
    mymap.set("11", 'phaseHalf')
    this.backmap = mymap

  },
  /* beforeMount() {

     event.$emit('unitname',this.unitname);

   },*/
  mounted() {
    this.alarmPointNum = this.alarmPointsName.length;
    let that = this;

    document.getElementById("onetrend").oncontextmenu = (e)=>{

      this.$refs.trendg.menuShow = true
      let menu = document.getElementById("onetrend");
      this.$refs.trendg.x  = e.offsetX
      this.$refs.trendg.y  = e.offsetY
      window.addEventListener("click",this.$refs.trendg.hideTheMenu)
      return false
    }

    that.$emit('changename', this.unitname)
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
    this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
    this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
  },
  watch:{
    topiccolor(val) {
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
      this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
      this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
    }
  },
  computed: {
    equid() {
      //得到设备的id
      return this.$store.state.equid;
    },
    getequName() {
      return this.$store.state.equName;
    },
    features() {
      return this.$store.state.features;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    }

  },
  methods: {
    updateShowOpPage(val) {
      this.showOpPage = val;
    },
    forId(id) {
      //console.log('我的id', id);
      return 'trends' + id.toString();
    },

    getline(equid,pointid,pos = -1) {
      var tmp_data= null;
      console.log('我的pos', pos);
      if(pos == -1) {
        // this.$refs.trendg.pflag = 0;
        // this.$refs.trendg.aline = null;
      }
      else {
        // this.$refs.trendgs[pos].pflag = 0;
        // this.$refs.trendgs[pos].aline =null;
      }
      // console.log('我的测点', pointid);
      // console.log('长度', this.trends, this.trends.length);
      let mypointid = encodeURIComponent(pointid);
      mypointid=mypointid.replace(/%2f/gi,"%252F");
      let CancelToken = this.$axios.CancelToken;
      if(typeof this.cancelAlarm == "function") {
        this.cancelAlarm();
      }
      var url = `point/${encodeURIComponent(equid)}/${mypointid}/alarmLine`
      this.$axios.get(url, {
        cancelToken: new CancelToken((c)=>{
          this.cancelAlarm = c;
        })
      }).then(res => {
        if(res.data.code == 200) {
          //   console.log('line data', res.data.data)
          var lines = res.data.data;
          tmp_data = []
          if(lines.judgeAlarmType == 0) {
            tmp_data.push({
              name:'高报',
              yAxis:lines.alarmHigh
            })
            tmp_data.push({
              name:'高高报',
              yAxis:lines.alarmHighHigh
            })
          }
          else if(lines.judgeAlarmType == 1) {
            tmp_data.push({
              name:'低报',
              yAxis:lines.alarmLow
            })
            tmp_data.push({
              name:'低低报',
              yAxis:lines.alarmLowLow
            })
          }
          else {
            tmp_data.push({
              name:'高报',
              yAxis:lines.alarmHigh
            })
            tmp_data.push({
              name:'高高报',
              yAxis:lines.alarmHighHigh
            })
            tmp_data.push({
              name:'低报',
              yAxis:lines.alarmLow
            })
            tmp_data.push({
              name:'低低报',
              yAxis:lines.alarmLowLow
            })
          }
          if(pos == -1) {
            // console.log('不是在这里吗',tmp_data);
            this.$refs.trendg.aline = tmp_data
          }
          else {
            // console.log('进入else', pos, this.$refs.trendgs[pos]);
            this.$refs.trendgs[pos].aline = tmp_data
          }
          //    console.log(this.line_data,'lineline')
        }

      });
    },

    handledblclick(id) {
      // console.log(this.trends[id-2]);
      // console.log( this.$refs.trendgs[id-2])

      if (this.isFull) {
        this.isFull = false
        this.fullId = 0
        this.$refs.trendg.setIsFull(false);
        //this.$refs.trendgs[id - 2].setIsFull(false);
        for (var i = 0; i < this.trends.length; i++) {
          if(this.$refs.trendgs[i]) {
            this.$refs.trendgs[i].setIsFull(false);
          }
        }
        this.$refs.spectrumg.setIsFull(false);
        this.$refs.waveg.setIsFull(false);
      } else {
        this.isFull = true
        this.fullId = id
        this.$refs.trendg.setIsFull(true);
        //this.$refs.trendgs[id - 2].setIsFull(true);
        for (var i = 0; i < this.trends.length; i++) {
          if(this.$refs.trendgs[i]) {
            this.$refs.trendgs[i].setIsFull(true);
          }
        }
        this.$refs.spectrumg.setIsFull(true);
        this.$refs.waveg.setIsFull(true);
      }
      // console.log(id)
    },
    highexe(id) {
      if (this.isFull) {
        if (id === this.fullId) {
          return "100%"
        } else {
          return "0%"
        }
      } else {
        let now_height
        if(this.showGrap == true){
          this.nowTrend=1;
          now_height = 100 / (3 + this.trends.length);
        }else {
          this.nowTrend=0;
          now_height = 100 / (this.trends.length);
        }

        if(now_height < 25) {
          now_height = 25;
        }

        return now_height.toString() + '%'
      }
    },

    infoname(myname) {
      this.$emit('setinfoname', myname);
    },

    //将操作页的信息传递回来
    async refreshDate(formdata) {
      this.Nowtongdao = formdata.treeSelect;
      if (formdata.treeSelect == 0) {

        if (formdata.checkNodes.length == 0) {
          //如果没有测点选择
          // this.$emit('datafail');
          this.clearchart();

        } else {
          if (this.myinterval) {
            clearInterval(this.myinterval);
          }
          this.graphtype = "历史";
          var starttime = formdata.time.form.starttime;
          var endtime = formdata.time.form.endtime;
          var featureSelect = formdata.featureSelect;
          var units = formdata.unit;
          var pointIdString = '';   //整理振动测点选中的特征值
          var mytree = [];
          this.nowProcessTree = [];
          for (let j = 0; j < this.alarmPointNum; j++) {
            var mytree2 = [];     //整理振动测点树
            for (const i in formdata.checkNodes) {
              if (this.alarmPointsName[j] == formdata.checkNodes[i].parent) {
                mytree2.push(formdata.checkNodes[i]);
              }
            }
            this.nowProcessTree.push(mytree2);
          }
          for (var i = 0; i < this.nowProcessTree.length; i++) {
            var otherPointId = '';
            if (this.nowProcessTree[i].length != 0) {
              var pointid = this.nowProcessTree[i];
              for (var j = 0; j < pointid.length; j++) {
                otherPointId += pointid[j].id;
                if (j != pointid.length - 1) {
                  otherPointId += ',';
                }
              }
            }
            this.processPointIdStringList[i] = otherPointId;      //得到除了振动以外的stringid
          }

          for (var i = 1; i < formdata.checkNodes.length; ++i) {
            if (formdata.checkNodes[i].parent == '振动') {
              mytree.push(formdata.checkNodes[i]);       //得到振动测点树
            }
          }

          var numb = 0;
          for (var k = 0; k < this.processPointIdStringList.length; k++) {
            if (this.processPointIdStringList[k].length != 0) {
              numb++;
            }
          }
          this.trends = [];
          for (var i = 0; i < numb; i++) {
            var node = {};
            node.id = i;
            node.name = "trendgs";
            this.trends.push(node);
          }
          // console.log('我的ref啊', this.trends);

          if (mytree.length === 0) {
            if (numb === 0) {
              this.clearchart()
            } else {
              this.clearchart1();
              this.showGrap = false;
              this.showOutherGrap = true;
              this.graphheight = 0 + "%";
              this.Spectrumgraphheight = 0 + '%';
              this.othergraphheight = 100 / (numb) + '%';
            }

          } else {
            this.showGrap = true;
            if (numb === 0) {
              this.showOutherGrap = false;
              this.graphheight = 50 + '%';
              this.Spectrumgraphheight = 50 + '%';

            } else {
              this.showOutherGrap = true;
              this.graphheight = 100 / (numb + 2) + '%'
              this.othergraphheight = 100 / (numb + 2) + '%';
              this.Spectrumgraphheight = 100 / (numb + 2) + '%';
            }

          }
          this.$nextTick(() => {
            this.$refs.trendg.mychart.resize();
            this.$refs.spectrumg.mychart.resize();
            for (var i = 0; i < numb; i++) {
              if (this.$refs.trendgs[i].mychart)
                this.$refs.trendgs[i].mychart.resize()
            }
          })
          if (mytree.length != 0) {
            // 画振动测点图
            for (var j = 0; j < mytree.length; j++) {
              pointIdString += mytree[j].id;
              if (j != mytree.length - 1) {
                pointIdString += ','
              }
            }

            this.NowfeatureSelect = featureSelect;
            this.nowVibrationTree = mytree
            this.vibrationPointIdString = pointIdString;
            this.nowunit = units;
            this.getduotongdaohistorytrends(this.equid, pointIdString, starttime, endtime, mytree, featureSelect, units);
          }
          var number = 0;
          let tmpNum = 0;
          for (var f = 0; f < this.processPointIdStringList.length; f++) {
            if (this.processPointIdStringList[f].length != 0) {
              this.getline(this.equid, this.processPointIdStringList[f].split(',')[0],tmpNum++)
              this.getoutherhistorytrends(this.equid, this.processPointIdStringList[f], starttime, endtime, number, this.nowProcessTree[f])
              number++;
            }
          }

        }
      } else {
        if (formdata.checkNodes == 0) {
          //如果没有选的话则清屏
          //    this.openalarm();
          this.clearchart();
          // this.$emit('datafail');
        } else {
          if (this.myinterval) {
            clearInterval(this.myinterval);
          }
          //测点的id
          this.nowpointid = formdata.checkNodes[0].pointUuid;
          if (formdata.time.model == '历史') {
            this.graphtype = "历史";

            var starttime = formdata.time.form.starttime;
            var endtime = formdata.time.form.endtime;
            var newtree1 = [];
            for (var i = 0; i < formdata.checkNodes.length; ++i) {
              if (formdata.checkNodes[i].parent == '振动') {
                //筛选振动节点树
                newtree1.push(formdata.checkNodes[i]);
              }
            }
            this.nowProcessTree = [];
            for (let j = 0; j < this.alarmPointNum; j++) {
              var newtree2 = [];     //整理振动测点树
              for (const i in formdata.checkNodes) {
                if (this.alarmPointsName[j] == formdata.checkNodes[i].parent) {
                  newtree2.push(formdata.checkNodes[i]);
                }
              }
              this.nowProcessTree.push(newtree2);
            }

            for (var i = 0; i < this.nowProcessTree.length; i++) {
              var otherPointId = '';
              if (this.nowProcessTree[i].length != 0) {
                var pointid = this.nowProcessTree[i];
                for (var j = 0; j < pointid.length; j++) {
                  otherPointId += pointid[j].id;
                  if (j != pointid.length - 1) {
                    otherPointId += ',';
                  }
                }
              }
              this.processPointIdStringList[i] = otherPointId;      //得到除了振动以外的stringid
            }


            var numb = 0;
            for (var k = 0; k < this.processPointIdStringList.length; k++) {
              if (this.processPointIdStringList[k].length != 0) {
                numb++;
              }
            }
            this.trends = [];
            for (var i = 0; i < numb; i++) {
              var node = {};
              node.id = i;
              node.name = "trendgs";
              this.trends.push(node);
            }
            if (newtree1.length === 0) {
              if (numb === 0) {
                this.clearchart()
              } else {
                this.clearchart1()
                this.showGrap = false;
                this.showOutherGrap = true;
                this.graphheight = 0 + "%";
                this.Spectrumgraphheight = 0 + '%';
                this.othergraphheight = 100 / (numb) + '%';
              }

            } else {
              this.showGrap = true;
              if (numb === 0) {
                this.showOutherGrap = false;
                this.graphheight = 50 + '%';
                this.Spectrumgraphheight = 50 + '%';

              } else {
                this.showOutherGrap = true;
                this.graphheight = 100 / (numb + 2) + '%'
                this.othergraphheight = 100 / (numb + 2) + '%';
                this.Spectrumgraphheight = 100 / (numb + 2) + '%';
              }

            }
            this.$nextTick(() => {
              this.$refs.trendg.mychart.resize();
              this.$refs.spectrumg.mychart.resize();
              for (var i = 0; i < numb; i++) {
                if (this.$refs.trendgs[i].mychart)
                  this.$refs.trendgs[i].mychart.resize()
              }
            })

            if (newtree1 != 0) {
              //画振动节点图
              var pointIdString = newtree1[0].xid;
              this.danunit = newtree1[1].unit;
              this.nowVibrationTree = newtree1;
              this.vibrationPointIdString = pointIdString;
              await this.gethistorytrends(this.equid, pointIdString, starttime, endtime, newtree1[1].unit, this.nowVibrationTree);
            }


            var number = 0;
            let tmpNum = 0;
            for (var f = 0; f < this.processPointIdStringList.length; f++) {
              if (this.processPointIdStringList[f].length != 0) {
                this.getline(this.equid, this.processPointIdStringList[f].split(',')[0],tmpNum++)
                this.getline(this.equid, this.processPointIdStringList[f],f)
                this.getoutherhistorytrends(this.equid, this.processPointIdStringList[f], starttime, endtime, number, this.nowProcessTree[f])
                number++;
              }
            }

          }
        }
      }
    },
    //工艺图谱细化
    async refine1(arg, Nowbumbers) {

      //   console.log("我会重新画工艺图")
      let stime = arg[0];
      let etime = arg[1];
      await this.refine(stime, etime);
      let mytrends = this.trends;
      for(let item in this.trends) {
        this.getoutherhistorytrendsOther(this.equid, this.processPointIdStringList[mytrends[item].id], stime, etime, mytrends[item].id, this.nowProcessTree[mytrends[item].id])
      }
      this.reDataZoomInterval()
    },
    async cancelRefine1(Nowbumbers) {
      await this.cancelRefine();
      let mytrends = this.trends;
      for(let item in mytrends) {
        this.getoutherhistorytrendsOther(this.equid, this.processPointIdStringList[mytrends[item].id], this.stime, this.etime, mytrends[item].id, this.nowProcessTree[mytrends[item].id])
      }
      this.reDataZoomInterval()
    },
    //图谱细化
    async refine(stime, etime) {
      if (this.vibrationPointIdString || this.nowVibrationTree) {
        if (this.Nowtongdao == 0) {
          this.getduotongdaohistorytrendsOther(this.equid, this.vibrationPointIdString, stime, etime, this.nowVibrationTree, this.NowfeatureSelect, this.nowunit);
        } else {
          this.gethistorytrendsOther(this.equid, this.vibrationPointIdString, stime, etime, this.danunit, this.nowVibrationTree);
        }
      }
      let mytrends = this.trends;
      for(let item in this.trends) {
        this.getoutherhistorytrendsOther(this.equid, this.processPointIdStringList[mytrends[item].id], stime, etime, mytrends[item].id, this.nowProcessTree[mytrends[item].id])
      }
      // await this.refine1([stime, etime], 0);
      this.reDataZoomInterval()
    },

    async cancelRefine() {
      if (this.vibrationPointIdString || this.nowVibrationTree) {
        if (this.Nowtongdao == 0) {
          this.getduotongdaohistorytrendsOther(this.equid, this.vibrationPointIdString, this.stime, this.etime, this.nowVibrationTree, this.NowfeatureSelect, this.nowunit);
        } else {
          this.gethistorytrendsOther(this.equid, this.vibrationPointIdString, this.stime, this.etime, this.danunit, this.nowVibrationTree);
        }
      }
      let mytrends = this.trends;
      for(let item in mytrends) {
        this.getoutherhistorytrendsOther(this.equid, this.processPointIdStringList[mytrends[item].id], this.stime, this.etime, mytrends[item].id, this.nowProcessTree[mytrends[item].id])
      }
      // await this.cancelRefine1();
      this.reDataZoomInterval();
    },
    zoomDataInterval(zoomBegin,zoomEnd){
      if (this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1] != zoomBegin ||
        this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1] != zoomEnd){
        this.zoomDataIntervalBegin.push(zoomBegin)
        this.zoomDataIntervalEnd.push(zoomEnd)
      }
    },
    reDataZoomInterval(){
      this.zoomDataIntervalBegin = []
      this.zoomDataIntervalEnd = []
    },
    dataZoom(zoomBegin,zoomEnd){
      if ( zoomBegin != null && zoomEnd != null){
        if (this.nowTrend===1){
          if (this.zoomDataIntervalBegin.length === 0){
            this.zoomDataIntervalBegin = this.$refs.trendg.mychart.getOption().useDataZoomBegin
            this.zoomDataIntervalEnd = this.$refs.trendg.mychart.getOption().useDataZoomEnd
          }
          this.$refs.trendg.dataZoom(zoomBegin,zoomEnd)
        }
        // console.log("测试reZoomData this.$refs.trends.length",this.$refs.trendgs.length)
        if (this.trends.length>0){
          for (let i = 0; i < this.$refs.trendgs.length; i++) { // 动态绑定的ref的组件，进行放大处理操作
            if (this.zoomDataIntervalBegin.length === 0){
              this.zoomDataIntervalBegin = this.$refs.trendgs[i].mychart.getOption().useDataZoomBegin
              this.zoomDataIntervalEnd = this.$refs.trendgs[i].mychart.getOption().useDataZoomEnd
            }
            this.$refs.trendgs[i].dataZoom(zoomBegin,zoomEnd)
          }
        }
        this.zoomDataInterval(zoomBegin,zoomEnd)


      }
    },
    reDataZoom(){
      // console.log("测试，最外层reDataZoom111", this.$refs.trendg.mychart.getOption().OriginalSeries[0].data);
      if (this.zoomDataIntervalBegin.length > 1){ // 最少保证有两个数据才能缩放，因为是先删除最后一个数据才开始放大还原
        this.zoomDataIntervalBegin.pop()
        this.zoomDataIntervalEnd.pop()
      }else {
        // 如果没有开始和结束时间，则直接结束方法
        return;
      }
      let flag=this.zoomDataIntervalBegin.length===1;

      if ( this.nowTrend===1){
        let reOriginalSeries = JSON.parse(JSON.stringify(this.$refs.trendg.mychart.getOption().OriginalSeries))
        let reOption = JSON.parse(JSON.stringify(this.$refs.trendg.mychart.getOption()))
        this.$refs.trendg.reDataZoom(reOriginalSeries,reOption,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
      }
      if (this.trends.length>0){
        for (let i = 0; i < this.$refs.trendgs.length; i++){
          let reOriginalSeries3 = JSON.parse(JSON.stringify(this.$refs.trendgs[i].mychart.getOption().OriginalSeries))
          let reOption3 = JSON.parse(JSON.stringify(this.$refs.trendgs[i].mychart.getOption()))
          this.$refs.trendgs[i].reDataZoom(reOriginalSeries3,reOption3,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
        }
      }

    },
    clearchart1() {
      var CancelToken = this.$axios.CancelToken;
      // if (typeof this.cancel == 'function') {
      //   this.cancel()
      // }
      this.$refs.trendg.clearall();
      this.$refs.spectrumg.clearall();


    },
    //清屏
    clearchart() {
      var CancelToken = this.$axios.CancelToken;
      // if (typeof this.cancel == 'function') {
      //   this.cancel()
      // }
      this.$refs.trendg.clearall();
      this.$refs.waveg.clearall();
      this.$refs.spectrumg.clearall();

      for (var i = 0; i < this.trends.length; i++) {
        this.$refs.trendgs[i].clearall();
      }
    },
    //提示未选中测点
    openalarm() {
      this.$confirm('请选择测点', '提示', {
        cancelButtonText: '确定',
        type: 'warning'
      }).then(() => {
      }).catch(() => {
      });
    },
    //加载中
    openFullScreen() {
      const loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      setTimeout(() => {
        loading.close();
      }, 1000);
    },
    //时间戳处理
    // timestampToTime(timestamp) {
    //   var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    //   var Y = date.getFullYear() + '-';
    //   var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    //   var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    //   var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    //   var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    //   var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + '.';
    //   var ms = (date.getTime() % 1000).toString()
    //   while (ms.length < 3) {
    //     ms = '0' + ms
    //   }
    //   //var nowtime = new Date(Y+M+D+h+m+s);
    //   return Y + M + D + h + m + s + ms;
    // },
    //多通道其他图谱
    getoutherhistorytrends(equitmentuuid, pointsIds, starttime, endtime, number, nowtree) {
      this.stime = starttime;
      this.etime = endtime;

      this.getoutherhistorytrendsOther(equitmentuuid, pointsIds, starttime, endtime, number, nowtree);
    },
    getoutherhistorytrendsOther(equitmentuuid, pointsIds, starttime, endtime, number, nowtree) {
      this.$emit('dataloading');
      var equipmentUuid1 = encodeURIComponent(equitmentuuid);
      var pointIdString1 = encodeURIComponent(pointsIds);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
      this.$store.state.mypointId = '';
      var netinfor = '/proctrend/' + equipmentUuid1 + '/' + pointIdString1 + '/' + starttime + '/' + endtime + "/his";
      this.$refs.opPage.loadingStatus = true;
      this.$axios.get(netinfor)
        .then((res) => {
          this.$refs.opPage.loadingStatus = false;
          if (res.data.code == 200) {
            this.$emit('datasuccess');
            var chartdata = res.data.data.trendValues;
            //  console.log('我是温度的数据');
            //  console.log(res )
            // console.log('选择的测点', nowtree[0]);
            // var title = this.getequName + ' ' + nowtree[0].parent + ' 历史';
            // var title = this.getequName + ' ' + nowtree[0].parent + ' ';
            var title = nowtree[0].parent;
            var flagX = '[时间]';
            let flagY = `[${res.data.data.unit[0]}]`;
            // var flagY;
            // if (nowtree[0].parent == "温度")
            //   flagY = '[℃]';
            // else if (nowtree[0].parent == "压力")
            //   flagY = '[KPa]';
            // else if (nowtree[0].parent == "其他")
            //   flagY = '[um]';
            // else if (nowtree[0].parent == "流量")
            //   flagY = '[m3/min]';

            var dataX = [];
            var dataY = [];
            var valueY = [];
            var timeData = [];
            //    var OutherAlarmDataY=null;
            var OtherNowAlarmData = [];
            this.AlarmValueY = [];

            var unordered = chartdata;
            const ordered = {};
            Object.keys(unordered).sort().forEach(function (key) {
              ordered[key] = unordered[key];
            });
            chartdata = ordered;


            for (var i = 0; i < nowtree.length; ++i) {
              valueY.push([]);
            }
            for (const data in chartdata) {
              dataX.push(data);
              // console.log('时间数据', chartdata[data][0]);
              timeData.push(chartdata[data][0])

            }
            for (var i = 0; i < dataX.length; i++) {
              //获得报警的时间；
              var date2 = new Date(dataX[i]);  //当前时间戳
              var time2 = date2.valueOf();//会精确到毫秒
              var date3 = new Date(dataX[i + 1]); //下一个时间戳
              var time3 = date3.valueOf();//会精确到毫秒
              for (var j = 0; j < nowtree.length; j++) {
                for (var k = 0; k < nowtree[j].alarmStartTime.length; k++) {
                  if (time2 == nowtree[j].alarmStartTime[k]) {
                    //得到这个报警数据
                    if (nowtree.length > 1) {
                      OtherNowAlarmData.push({
                        value: chartdata[dataX[i]][0][j],
                        xAxis: timestampToTimeFormat(time2),
                        yAxis: chartdata[dataX[i]][0][j],
                        label: nowtree[j].label
                      })

                    } else {
                      OtherNowAlarmData.push({
                        value: chartdata[dataX[i]][j],
                        xAxis: timestampToTimeFormat(time2),
                        yAxis: chartdata[dataX[i]][j],
                        label: nowtree[j].label
                      })
                    }


                  } else if (time3 > nowtree[j].alarmStartTime[k] && time2 < nowtree[j].alarmStartTime[k]) {
                    if (nowtree.length > 1) {
                      OtherNowAlarmData.push({
                        value: chartdata[dataX[i + 1]][0][j],
                        xAxis: timestampToTimeFormat(time3),
                        yAxis: chartdata[dataX[i + 1]][0][j],
                        label: nowtree[j].label
                      })
                    } else {
                      OtherNowAlarmData.push({
                        value: chartdata[dataX[i + 1]][j],
                        xAxis: timestampToTimeFormat(time3),
                        yAxis: chartdata[dataX[i + 1]][j],
                        label: nowtree[j].label
                      })
                    }
                  }

                }
              }
            }
            this.AlarmValueY.push(OtherNowAlarmData)
            if (nowtree.length > 1) {
              for (var j = 0; j < nowtree.length; j++) {
                for (var k = 0; k < timeData.length; k++) {


                  valueY[j].push(timeData[k][j]);
                }

              }

            } else {
              for (var k = 0; k < timeData.length; k++) {
                valueY[0].push(timeData[k]);
              }

            }
            for (var i = 0; i < nowtree.length; i++) {
              dataY.push({
                name: nowtree[i].label,
                data: valueY[i],
                color: this.colormap.get(i.toString())
              })
            }
            if(dataX.length == 0) {
              this.$emit('datanull');
            }else {
              for(let item = 0 ; item < 3; item++) {
                // console.log('对应图谱的ref', this.$refs.trendgs[item]);
                // if(this.$refs.trendgs[item]) {
                //   this.$refs.trendgs[item].setchart(flagX, flagY, dataX, dataY, title)
                // }
              }
              this.$refs.trendgs[number].setchart(flagX, flagY, dataX, dataY, title, 'history')
            }
          } else {
            //请求失败
            this.$refs.opPage.loadingStatus = false;
            this.clearchart();
            this.$emit('datafail');
          }

        })
        .catch(e => {
          this.$refs.opPage.loadingStatus = false;
          // this.clearchart();
          // this.$emit('datafail')
        });
    },


    //多通道振动历史数据
    getduotongdaohistorytrends(equitmentuuid, pointidString, stime, etime, nowtree, featureSelect, units) {
      this.stime = stime;
      this.etime = etime;

      this.getduotongdaohistorytrendsOther(equitmentuuid, pointidString, stime, etime, nowtree, featureSelect, units);
    },
    getduotongdaohistorytrendsOther(equitmentuuid, pointidString, stime, etime, nowtree, featureSelect, units) {
      let that = this;
      this.tongdao = 0;
      this.nowVibrationTree = nowtree;
      this.$emit('dataloading');
      let feature = featureSelect[nowtree[0].dtype]
      this.onlyname = this.$store.state.features[nowtree[0].type][(feature.toString())].label
      this.onlyone = this.$store.state.features[nowtree[0].type][(feature.toString())].feature
      this.getline(equitmentuuid,pointidString.split(',')[0]);
      var equipmentUuid1 = encodeURIComponent(equitmentuuid);
      var pointIdString1 = encodeURIComponent(pointidString);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");

      //console.log("测试ddddd")
      this.$refs.opPage.loadingStatus = true;
      var netinfor = '/trend/' + equipmentUuid1 + '/' + pointIdString1 + '/' + stime + '/' + etime + "/alarminfo";
      //   console.log(netinfor);
      // console.log('hereisinfo :' + netinfor);
      var CancelToken = this.$axios.CancelToken;
      if (typeof this.cancelTrendInfo == 'function') {
        this.cancelTrendInfo()
      }
      this.$refs.opPage.loadingStatus = true;
      this.$axios.get(netinfor,{
        cancelToken: new CancelToken((c)=>{
          // executor 函数接收一个 cancel 函数作为参数
          this.cancelTrendInfo = c;
        })
      })
        .then((res) => {
          this.$refs.opPage.loadingStatus = false;
          if (res.data.code == 200 && res.data.data.trendInfo.length != 0) {
            //请求成功
            this.$emit('datasuccess');
            var tmpchartdata = res.data.data
            var title = this.onlyname + ' ';
            var flagX = '[时间]';
            var flagY;
            flagY = '[' + units[nowtree[0].dtype] + ']'
            var dataX = [];
            var dataY = [];
            var valueY = [];
            var AlarmData = [];
            this.AlarmValueY = [];
            for (var i = 0; i < this.nowVibrationTree.length; ++i) {
              valueY.push([]);
            }
            // console.log(tmpchartdata.trendInfo)

            var nowdatas = tmpchartdata.trendInfo;
            // console.log(nowdatas);
            var high_light = []
            var posj = -1;
            let tmpRev = {};
            for (var i = 0; i < nowdatas.length; ++i) {
              dataX.push(timestampToTimeFormat(nowdatas[i].trendTime));
              tmpRev[nowdatas[i].trendTime.toString()] = nowdatas[i].rev;
              for(var j = 0; j < this.nowVibrationTree.length; ++j) {
                if(nowdatas[i].smpNum > 0) {
                  if(posj == -1) {
                    posj = i;
                  }
                  high_light.push([dataX[i],nowdatas[i].trendValue[j][this.onlyone], this.nowVibrationTree[j].label])
                }
                valueY[j].push(nowdatas[i].trendValue[j][this.onlyone]);

                // var flagY = '['+nowdatas[i].unit+']';
                //显示报警
                if (this.nowVibrationTree[j].alarmStartTime != "") {

                  for (var k = 0; k < this.nowVibrationTree[j].alarmStartTime.length; ++k) {
                    if (nowdatas[i].trendTime == this.nowVibrationTree[j].alarmStartTime[k]) {
                      AlarmData.push({
                        value: nowdatas[i].trendValue[j][this.onlyone],
                        xAxis: timestampToTimeFormat(nowdatas[i].trendTime),
                        yAxis: nowdatas[i].trendValue[j][this.onlyone],
                        label: this.nowVibrationTree[j].label
                      })

                    } else if (
                      nowdatas[i].trendTime < this.nowVibrationTree[j].alarmStartTime[k] && i + 1 < nowdatas.length
                      && nowdatas[i + 1].trendTime > this.nowVibrationTree[j].alarmStartTime[k]) {
                      AlarmData.push({
                        value: nowdatas[i + 1].trendValue[j][this.onlyone],
                        xAxis: timestampToTimeFormat(nowdatas[i + 1].trendTime),
                        yAxis: nowdatas[i + 1].trendValue[j][this.onlyone],
                        label: this.nowVibrationTree[j].label
                      })
                    }
                  }
                }
              }
            }
            this.$store.state.timeRev = tmpRev;
            console.log('多通道时间戳',this.$store.state.timeRev);
            this.AlarmValueY.push(AlarmData)
            for (var i = 0; i < this.nowVibrationTree.length; ++i) {
              dataY.push({
                name: this.nowVibrationTree[i].label,
                data: valueY[i],
                color: this.colormap.get(i.toString())
              })

            }
            if (dataX.length == 0) {
              this.$emit('datanull');
              this.clearchart();
              return ;
            }

            if (dataX.length) {

              this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'history')
              this.$store.state.mypointId = '';

              var myinfo = {
                name: dataX[0],
                seriesName: this.nowVibrationTree[0].label
              };

              this.drawWaveSpectrum(myinfo)
            } else {
              this.clearchart();
            }
          } else {
            //请求失败
            this.clearchart();
            that.$emit('datafail');

          }
        }) .catch(e => {
        this.$refs.opPage.loadingStatus = false;
        // this.clearchart();
        // this.$emit('datafail');
      });


    },

    //单通道历史数据
    gethistorytrends(equitmentuuid, pointidString, stime, etime, danunit, nowtree) {
      this.stime = stime;
      this.etime = etime;
      this.gethistorytrendsOther(equitmentuuid, pointidString, stime, etime, danunit, nowtree);
    },
    gethistorytrendsOther(equitmentuuid, pointidString, stime, etime, danunit, nowtree) {
      console.log(nowtree,"??????????????")
      this.getline(equitmentuuid,pointidString)
      this.tongdao = 1;
      this.nowVibrationTree = nowtree;
      this.$emit('dataloading');
      var equipmentUuid1 = encodeURIComponent(equitmentuuid);
      var pointIdString1 = encodeURIComponent(pointidString);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
      var netinfor = '/trend/' + equipmentUuid1 + '/' + pointIdString1 + '/' + stime + '/' + etime + "/alarminfo"
      var CancelToken = this.$axios.CancelToken;
      if (typeof this.cancel == 'function') {
        this.cancel()
      }
      this.$refs.opPage.loadingStatus = true;
      this.$axios.get(netinfor,{
        cancelToken: new CancelToken((c)=>{
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      })
        .then(res => {
          this.$refs.opPage.loadingStatus = false;
          if (res.data.code == 200) {
            //请求成功
            this.$emit('datasuccess');
            this.chartdata = res.data.data;

            var title = "多特征值" + ' ';

            var flagX = '[时间]';
            var flagY;
            flagY = '[' + danunit + ']'
            var dataX = [];
            var dataY = [];
            var Alarmdata = [];
            var centerAlarmData = [];
            this.AlarmValueY = [];

            var nowdatas = this.chartdata.trendInfo;
            //画X轴的时间
            let tmpRev = {};

            for (var i = 0; i < nowdatas.length; ++i) {
              var newX = timestampToTimeFormat(nowdatas[i].trendTime);
              tmpRev[nowdatas[i].trendTime.toString()] = nowdatas[i].rev;
              dataX.push(newX);
              //筛选报警的X轴
              if (this.nowVibrationTree[0].alarmStartTime != "") {
                for (var k = 0; k < this.nowVibrationTree[0].alarmStartTime.length; ++k) {
                  if (this.nowVibrationTree[0].alarmStartTime[k] == nowdatas[i].trendTime) {
                    Alarmdata.push(nowdatas[i])   //报警的值
                  } else if (nowdatas[i].trendTime < this.nowVibrationTree[0].alarmStartTime[k] && i + 1 < nowdatas.length && nowdatas[i + 1].trendTime > this.nowVibrationTree[0].alarmStartTime[k]) {
                    Alarmdata.push(nowdatas[i + 1])   //报警的值
                  }
                }
              }

            }
            this.$store.state.timeRev = tmpRev;
            console.log('单通道时间戳',this.$store.state.timeRev);
            for (var i = 0; i < Alarmdata.length; ++i) {

              for (var k = 1; k < this.nowVibrationTree.length; ++k) {
                var nowAlarmid = this.nowVibrationTree[k].xid;
                var nowAlarmname = this.$store.state.features[nowtree[0].type][nowAlarmid.toString()].feature

                for (var keys in Alarmdata[i].trendValue[0]) {
                  if (keys == nowAlarmname) {
                    centerAlarmData.push({
                      value: Alarmdata[i].trendValue[0][keys],
                      xAxis: timestampToTimeFormat(Alarmdata[i].trendTime),
                      yAxis: Alarmdata[i].trendValue[0][keys],

                    })
                  }
                }
              }
            }
            this.AlarmValueY.push(centerAlarmData)
            //画y轴的数据
            var textmaptmp = {
              'sudu': {
                "0": "通频有效值",
                "1": "1倍频有效值",
                "2": "2倍频有效值",
                "3": "3倍频有效值",
                "4": "1/2倍频有效值",
                "5": "残频有效值"
              },
              'jiasudu': {
                "0": "加速度峰值",
                "1": "加速度高频",
                "2": "加速度低频",
                "3": "加速度波形峭度",
                "4": "速度有效值",
                "5": "通频gIE值"
              },
              'weiyi': {
                "0": "加速度峰值",
                "1": "加速度高频",
                "2": "加速度低频",
                "3": "加速度波形峭度",
                "4": "速度有效值",
                "5": "通频gIE值"
              }
            }
            var high_light = []
            var posj = -1;
            for (var i = 1; i < this.nowVibrationTree.length; ++i) {
              var nowid = this.nowVibrationTree[i].xid;
              var nowcolor = this.colormap.get(nowid.toString());
              var nowtext = this.nowVibrationTree[i].zhLabel;
              var newY = [];
              for (var j = 0; j < nowdatas.length; ++j) {
                var mydatas = nowdatas[j].trendValue[0];
                var nowname = this.$store.state.features[nowtree[0].type][nowid.toString()].feature
                var nownum = mydatas[nowname];

                // if (nowdatas[j].smpNum > 0) {
                //   newY.push({value: nownum, symbolSize: 10})
                // } else {
                //   newY.push(nownum);
                // }

                if(nowdatas[j].smpNum > 0) {
                  if(posj === -1) {
                    posj = j;
                  }

                  high_light.push([dataX[j],nownum,nowtext]);
                }

                newY.push(nownum);

                // console.log(nownum);

              }
              // this.AlarmValueY.push(AlarmDataY);
              dataY.push({
                name: nowtext,
                data: newY,
                color: nowcolor

              })
            }
            if(posj == -1) {
              posj = 0;
            }

            var myinfos = {name: nowdatas[0].trendTime};
            if(dataX.length == 0) {
              this.$emit('datanull');
            }

            if (dataX.length) {
              this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'history');
              // this.$refs.trendg.setchart(flagX, flagY, dataX, dataY,title, 'history')
              this.drawWaveSpectrum(myinfos);
            } else {
              this.clearchart();

            }
          } else {
            //请求失败
            this.$emit('datafail');
            this.clearchart();

            // that.$message.error(res.data.message);
          }
        }).catch(e => {
        console.log(e)
        this.$refs.opPage.loadingStatus = false;
        this.clearchart();
        this.$emit('datafail');
      });
    },
    dataloading() {

      this.$emit('dataloading');
    },
    NewDate(str) {
      //首先将日期分隔 ，获取到日期部分 和 时间部分
      var day = str.split(' ');
      //获取日期部分的年月日
      var days = day[0].split('-');
      //获取时间部分的 时分秒
      var mi = day[day.length - 1].split(':');
      //获取当前date类型日期
      var date = new Date();
      //给date赋值  年月日
      date.setUTCFullYear(days[0], days[1] - 1, days[2]);
      //给date赋值 时分秒  首先转换utc时区 ：+8
      date.setUTCHours(mi[0] - 8, mi[1], mi[2].split('.')[0],mi[2].split('.')[1]);
      return date;
    },

    cursorSynchronization(myinfo,flag,index){
      if (flag ==='true'){
        for (var i = 0; i < this.trends.length; i++){
          this.$refs.trendgs[i].drawMarkLine(myinfo.name,this.$refs.trendg.PrimarySecondary.isMark)
        }
        this.drawWaveSpectrum(myinfo)
      }
      if (flag ==='false'){
        this.$refs.trendg.drawMarkLine(myinfo.name,this.$refs.trendgs[index].PrimarySecondary.isMark)
        for (var j = 0; j < this.trends.length; j++){
          this.$refs.trendgs[j].drawMarkLine(myinfo.name,this.$refs.trendgs[index].PrimarySecondary.isMark)
        }
      }
    },
    drawWaveSpectrum(myinfo) {
      this.dataloading();
      var nowtime = '';
      var thistime = '';
      let mytype = '';
      var pointNmae;
      if (this.tongdao.toString() === '1') {
        pointNmae = this.nowVibrationTree[0].label
        // console.log("我是单通道")
        if (myinfo.seriesName != null || typeof (myinfo.name) != 'string') {
          //  console.log("不是空的")
          thistime = myinfo.name;
          // thistime = this.NewDate(thistime)
          nowtime = new Date(myinfo.name).getTime();
        } else {
          // console.log("是空的")
          thistime = myinfo.data.xAxis
          thistime = this.NewDate(thistime)
          nowtime = new Date(myinfo.data.xAxis).getTime();
        }

      } else {
        pointNmae = myinfo.seriesName;
        //   console.log("多通道")
        if (myinfo.seriesName != null) {
          thistime = myinfo.name;
          thistime = this.NewDate(thistime)
          nowtime = new Date(myinfo.name).getTime();
        } else {
          thistime = myinfo.data.xAxis
          thistime = this.NewDate(thistime)
          nowtime = new Date(myinfo.data.xAxis).getTime();
        }
      }

      var equipmentUuid = this.equid;
      var pointIdString;
      var Nowname;
      this.dataloading();

      if (this.tongdao.toString() === '1') {
        pointIdString = this.nowVibrationTree[0].xid
        mytype = this.nowVibrationTree[0].dtype;
        Nowname = this.nowVibrationTree[0].label

      } else {
        //  pointIdString = myinfo.seriesName;
        pointIdString = '';
        for (var i = 0; i < this.nowVibrationTree.length; ++i) {
          if (myinfo.seriesName != null) {
            if (this.nowVibrationTree[i].label == myinfo.seriesName) {
              pointIdString = this.nowVibrationTree[i].id
              mytype = this.nowVibrationTree[i].dtype;
            }
            Nowname = myinfo.seriesName;
          } else {
            if (this.nowVibrationTree[i].label == myinfo.data.label) {
              pointIdString = this.nowVibrationTree[i].id
              mytype = this.nowVibrationTree[i].dtype;
            }
            Nowname = myinfo.data.label;
          }

        }

      }
      console.log('测点类型', mytype);
      var waveNumber = 16384;
      var analysisLines = 0;
      var CancelToken = this.$axios.CancelToken;
      if (typeof this.cancelWaveInfo == 'function') {
        this.cancelWaveInfo()
      }
      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      var pointIdString1 = encodeURIComponent(pointIdString);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");

      this.$axios.get("/wave-spectrum/" + equipmentUuid1 + '/' + pointIdString1 + '/' + nowtime + '/' + waveNumber + '/' + analysisLines + "/info"
        , {
          cancelToken: new CancelToken((c) => {
            // executor 函数接收一个 cancel 函数作为参数
            this.cancelWaveInfo = c;
          })
        }).then(res => {
        if (res.data.code === 200) {
          // console.log("画频谱图");
          // alert("画频谱图")
          this.$emit('datasuccess');

          var wavex = '[' + res.data.data.waveValue.waveUnit.x + ']';
          var wavey = '[' + res.data.data.waveValue.waveUnit.y + ']';
          var dataX = res.data.data.waveValue.waveX;

          var dataY = {
            name: pointNmae,
            data: res.data.data.waveValue.waveY
          };



          var title = res.data.data.equipmentName + ' ' + '历史';
          // let title1 = res.data.data.equipmentName + ' ' +  Nowname +  ' 历史';
          let title1 = Nowname +  ' ';
          thistime = timestampToTimeFormat(nowtime);

          this.$refs.waveg.setchart(wavex, wavey, dataX, dataY, title1, thistime, null, 'history');

          var spectrumx = '[' + res.data.data.spectrumValue.spectrumUnit.x + ']';
          var spectrumy = '[' + res.data.data.spectrumValue.spectrumUnit.y + ']';
          let mydataX = res.data.data.spectrumValue.spectrumX;
          var dataX = mydataX
          var dataY = {
            name: Nowname,
            data: res.data.data.spectrumValue.spectrumY
          };
          if(dataX.length == 0) {
            this.$emit('datanull');
          }
          this.$refs.spectrumg.setchart(spectrumx, spectrumy, dataX, dataY, title1, thistime, 'history');

          console.log(dataX)
        } else {
          this.$refs.spectrumg.clearall();

          this.$emit('datafail')
        }
      })
      /* .catch(e => {
         this.clearchart();
         this.$emit('datafail')
       });*/
    }

  },
  dataloading() {

    // this.$emit('dataloading');
  },
  ccchart() {
    this.$refs.waveg.clearall();
    this.$refs.spectrumg.clearall();
  },

}

</script>

<style lang="scss">
.Alarmjibeng {
  --conbgcolor: #0D0F1F;
  --leftconbgcolor: #222331;
  --buttoncolor: #1677FF;
  --textcolor: #ffffff;
  background-color: var(--conbgcolor);
  width: 100%;
  height: 100%;
  display: flex;

  .tuPu {
    background-color: var(--leftconbgcolor);
    float: left;
    margin: 10px 2px 0 2px;
    overflow-y: auto;
    overflow-x: hidden;
    /* width: calc(100% - 300px);*/
    width: calc(100% - 300px);
    height: calc(100% - 10px);
  }

  .op {
    overflow: hidden;
    width: 290px;
    height: calc(100% - 10px);
    margin-top: 10px;
    float: right;
    //  background-color: #2F4554;
    background-color: var(--leftconbgcolor);
  }

  /*.otherdivGraph{

  }*/

  /*.divGraph {
    height: 25%;
    width: 100%;
  }*/
}
</style>
