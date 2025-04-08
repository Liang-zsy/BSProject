<template>
  <div class="trend-analysisjibeng" ref="ui">
    <div class='tupu' id='lefttupu'>
      <div :style="{height : highexe(1) , width:'100%'}" v-show="fullId===1||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(1)">
        <TrendGraph ref='trendg' @cancelFull="handledblclick(1)" @chartinfo="trendGraphToDrawWaveSpectrum" class="graph" @refine="refine" @cancelRefine="cancelRefine" @dataZoom="dataZoom" @reDataZoom="reDataZoom"></TrendGraph>
      </div>
      <div :style="{height : highexe(2) , width:'100%'}" v-show="(fullId===2||fullId===0) && $store.state.showSpeed" @dblclick="$store.state.dblclickEnabled && handledblclick(2)">
        <SpeedTrendGraph ref='trendg_another' @chartinfo="spendTrendGraphToDrawWaveSpectrum" @cancelFull="handledblclick(2)" class="graph" @refine="refine" @cancelRefine="cancelRefine" @dataZoom="dataZoom" @reDataZoom="reDataZoom"></SpeedTrendGraph>
      </div>
      <div :style="{height :highexe(3) , width:'100%'}" v-show="(fullId===3||fullId===0) && $store.state.showWave" @dblclick="$store.state.dblclickEnabled && handledblclick(3)">
        <WaveGraph ref='waveg' @cancelFull="handledblclick(3)" class="graph"></WaveGraph>
      </div>
      <div :style="{height : highexe(4) , width:'100%'}" v-show="(fullId===4||fullId===0) && $store.state.showSpectrum" @dblclick="$store.state.dblclickEnabled && handledblclick(4)">
        <SpectrumGraph ref="spectrumg" @cancelFull="handledblclick(4)"  ></SpectrumGraph>
      </div>
    </div>

    <!--  隐藏操作页按钮  -->
    <OpHideButton
      :showOpPage="showOpPage"
      @updateShowOpPage="updateShowOpPage">
    </OpHideButton>

    <div class='op' id='rightop' v-show="showOpPage">
      <trend-analysis-op-page
        @cleanChart="clearchart"
        @realdantongdao="getrealdantongdao"
        @addrealdantongdao="addrealdantongdao"
        @drawhistorydantongdao="drawhistorydantongdao"
        @drawrealduotongdao="drawrealduotongdao"
        @addrealduotongdao="addrealduotongdao"
        @drawhistoryduotongdao="drawhistoryduotongdao"
        @showgraph="showgraph"
        @notshowgraph="notshowgraph"
        @reDataZoomInterval="reDataZoomInterval"
        :style="{height: '100%'}"
        ref="opPage"></trend-analysis-op-page>
    </div>
  </div>
</template>

<script>
import TrendGraph from "../components/ComUtils/TrendGraph"
import PumpImpactDiagnosisOpPage from '../components/PumpImpactDiagnosis/PumpImpactDiagnosisOpPage';
import WaveGraph from "../components/ComUtils/WaveGraph";
import SpectrumGraph from "../components/ComUtils/SpectrumGraph";
import SpeedTrendGraph from "../components/ComUtils/SpeedTrendGraph";
import TrendAnalysisOpPage from "../components/TrendAnalysis/TrendAnalysisOpPage";
import keepAliveMixin from "@/mixins/keepAliveMixin";
import {timestampToTimeFormat} from "../components/ComUtils/TimeFormat";
import OpHideButton from "@/components/ComUtils/OpHideButton";
import keyPressSignalMixin from '@/mixins/keyPressSignalMixin';

export default {
  name: "TrendAnalysis",
  mixins: [keepAliveMixin,keyPressSignalMixin],
  components: {
    TrendAnalysisOpPage,
    SpeedTrendGraph,
    SpectrumGraph,
    WaveGraph,
    TrendGraph,
    PumpImpactDiagnosisOpPage,
    OpHideButton,
  },
  data() {
    return {
      labelname: null,
      stime: null,
      etime: null,
      fullId: 0,
      isFull: false,
      seriesName: '',
      showOpPage: true,
      show: false,
      graphheight: 33.3 + '%',
      fallgraphheight: '0%',
      unitname: '机泵专用图谱-趋势分析',
      onlyname: '',
      onlyone: 0,
      nowtree: null,
      chartdata: null,
      myinterval: null,
      nowpointid: null,
      tongdao: null,
      graphtype: null,
      intervalflag: 0,
      backmap: null,
      textmap: null,
      colormap: null,
      nowdata: null,
      nowtype:null,
      realDuoQuestFlag: false, //多通道首次请求是否完成
      realDuoQuest: true, //多通道实时请求
      realDanQuestFlag: false, //单通道首次请求是否完成
      realDanQuest: true, //单通道实时请求
      // 定义datafail只执行一次的flag变量
      addrealduotogndaoFlag: true, getrealdantongdaoFlag: true, addrealdantogndaoFlag: true,
      drawrealduotongdaoFlag: true,
      // 放大的区间记录，开始
      zoomDataIntervalBegin: [],
      // 放大的区间记录，结束
      zoomDataIntervalEnd: [],
    }
  },
  created() {
    var mymap = new Map();
    mymap.set('0', "#FFE4C4");
    mymap.set('1', "#00FFFF");
    mymap.set('2', "#4B0082");
    mymap.set('3', "#F0E68C");
    mymap.set('4', "#778899");
    mymap.set('5', "#7B68EE");
    mymap.set('6', "#FF0000");
    mymap.set('7', "#FFFAFA");
    mymap.set('8', "#008080");
    mymap.set('9', "#FA8072");
    mymap.set('10', "#D3D3D3");
    mymap.set('11', "#FFFFE0");
    this.colormap = mymap;
    mymap = new Map();
    mymap.set('0', "通频");
    mymap.set('1', "1倍频幅值");
    mymap.set('2', "2倍频幅值");
    mymap.set('3', "3倍频幅值");
    mymap.set('4', "1/2倍频幅值");
    mymap.set('5', "残振");
    mymap.set('6', "直流量");
    mymap.set('7', "间隙电压");
    mymap.set('8', "1倍频相位");
    mymap.set('9', "2倍频相位");
    mymap.set('10', "3倍频相位");
    mymap.set('11', "1/2倍频相位");
    this.textmap = mymap;
    mymap = new Map();
    mymap.set("0", 'all');
    mymap.set("1", 'one');
    mymap.set("2", 'two');
    mymap.set("3", 'three');
    mymap.set("4", 'half');
    mymap.set("5", 'res');
    mymap.set("6", 'dc');
    mymap.set("7", 'gap');
    mymap.set("8", 'phaseOne');
    mymap.set("9", 'phaseTwo');
    mymap.set("10", 'phaseThree');
    mymap.set("11", 'phaseHalf');
    this.backmap = mymap;

  },

  mounted() {
    this.$emit('changename', this.unitname);
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
    this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
    this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
  },
  computed: {
    nodeData() {
      return this.$store.state.nodeData;
    },
    equid() {
      return this.$store.state.equid;
    },
    nodeNum() {
      return this.$store.state.nodeNum;
    },
    equName() {
      return this.$store.state.equName;
    },
    features() {
      return this.$store.state.features;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    }
  },

  watch: {
    equid(){
      if(!this.activatedFlag) return;
      this.clearchart();
    },
    topiccolor(val) {
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
      this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
      this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
    }
  },
  methods:{
    highexe(id){
      if(this.isFull){
        if(id === this.fullId){
          return "100%"
        }else {
          return  "0%"
        }
      }else {
        return this.$store.getters.getGraphHeight;
      }
    },
    handledblclick(id){
      if(this.isFull){
        this.isFull = false
        this.fullId = 0
        this.$refs.trendg.setIsFull(false);
        this.$refs.trendg_another.setIsFull(false);
        this.$refs.waveg.setIsFull(false);
        this.$refs.spectrumg.setIsFull(false);
      }else {
        this.isFull = true
        this.fullId = id
        this.$refs.trendg.setIsFull(true);
        this.$refs.trendg_another.setIsFull(true);
        this.$refs.waveg.setIsFull(true);
        this.$refs.spectrumg.setIsFull(true);
      }
      //  console.log(id)

    },
    trendGraphToDrawWaveSpectrum(myinfo) {
      this.drawWaveSpectrum(myinfo)
      this.$refs.trendg_another.drawMarkLine(myinfo.name,this.$refs.trendg.PrimarySecondary.isMark)
    },
    drawWaveSpectrum(myinfo) {
      console.log(myinfo)
      let that = this;
      if (this.graphtype === '历史') {
        // console.log(11111111111111111)
        // console.log(myinfo)
        //  console.log('趋势分析', this.nowtree);
        var equipmentUuid = this.nowpointid;
        var thistime = myinfo.name;
        let mytype = -1;
        this.seriesName = myinfo.seriesName
        var nowtime = new Date(thistime).getTime();
        var pointIdString;
        this.dataloading();
        var pointNmae;
        if (this.tongdao.toString() === '1') {
          pointIdString = this.nowtree[0].xid;
          if(this.nowtree[0].type == '振动-速度') {
            mytype = 2;
          }
          pointNmae = this.nowtree[0].label
        } else {
          pointIdString = '';
          //   console.log('nowtree')
          //    console.log(this.nowtree)
          for(var i = 0; i < this.nowtree.length; ++i) {
            if(this.nowtree[i].label == myinfo.seriesName) {
              pointIdString = this.nowtree[i].id
              mytype = this.nowtree[i].dataType;
            }
          }
          pointNmae = myinfo.seriesName;
        }
        var waveNumber = 16384;
        var analysisLines = 0;

        var equipmentUuid1 = encodeURIComponent(equipmentUuid);
        var pointIdString1 = encodeURIComponent(pointIdString);
        pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
        //   console.log('我的类型', mytype);

        let CancelToken = this.$axios.CancelToken;
        if(typeof this.cancelWaveInfo == 'function') {
          this.cancelWaveInfo();
        }
        this.$axios.get("/wave-spectrum/" + equipmentUuid1 + '/' + pointIdString1 + '/' + nowtime + '/' + waveNumber + '/' + analysisLines + "/info", {
          cancelToken: new CancelToken((c) => {
            this.cancelWaveInfo = c;
          })
        }).then(res => {

          if (res.data.code === 200) {
            this.$emit('datasuccess');
            var name = this.nowtree[0].label
            var wavex = '[' + res.data.data.waveValue.waveUnit.x + ']';
            var wavey = '[' + res.data.data.waveValue.waveUnit.y + ']';
            var dataX = res.data.data.waveValue.waveX;
            if(dataX.length == 0) {
              that.$emit('datanull');
            }
            var dataY = {
              name: pointNmae,
              data: res.data.data.waveValue.waveY
            };
            var title = res.data.data.equipmentName + ' '  + ' 历史';
            let title1 = pointNmae  + ' ';
            // let title1 = res.data.data.equipmentName + ' ' + pointNmae  + ' ' + ' 历史';
            //thistime =timestampToTimeFormat(thistime);
            thistime = timestampToTimeFormat(nowtime);
            this.$refs.waveg.setchart(wavex, wavey, dataX, dataY, title1, thistime);
            var spectrumx = '[' + res.data.data.spectrumValue.spectrumUnit.x + ']';
            var spectrumy = '[' + res.data.data.spectrumValue.spectrumUnit.y + ']';
            let tmpdataX = res.data.data.spectrumValue.spectrumX;
            dataX = tmpdataX;
            // dataX = res.data.data.spectrumValue.spectrumX;
            var dataY = {
              name: pointNmae,
              data: res.data.data.spectrumValue.spectrumY
            };
            if(dataX.length == 0) {
              this.$emit('datanull');
            }
            this.$refs.spectrumg.setchart(spectrumx, spectrumy, dataX, dataY, title1, thistime);
          } else {
            // this.clearchart();
            this.$emit('datafail')
            this.$refs.waveg.clearall();
            this.$refs.spectrumg.clearall();
            //this.$message.error(res.data.message);
          }
        }).catch(e=>{

        })
      }
    },
    refine(stime, etime) {
      // this.dataloading();
      if (this.tongdao == 1) {
        this.gethisdantongdaoData(this.nowpointid, this.pointIdString, stime, etime, this.labelname)
        //  console.log(this.nowpointid, this.pointIdString, stime, etime, this.pointuuid, this.nowtree,this.nowtype)
      } else {
        this.gethisduotongdaoData(this.nowpointid, this.pointIdString, stime, etime, this.nowtree, this.feature,this.nowtype);
      }
      this.reDataZoomInterval()
    },
    // 历史单通道多特征值
    gethisdantongdaoData(equipmentUuid, pointIdString, stime, etime, lablename) {
      // this.nowtype=type;
      // console.log(this.nowtree )
      // console.log("####################")
      this.dataloading();
      let that = this;

      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      this.getline(this.$store.state.equid,pointIdString.split(',')[0]);
      var pointIdString1 = encodeURIComponent(pointIdString);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
      var netinfor = ('/trend/' + equipmentUuid1 + '/' + pointIdString1 + '/' + stime + '/' + etime + "/info");
      // if (typeof this.cancel == 'function') {
      //   this.cancel()
      // }
      let CancelToken = this.$axios.CancelToken;
      if(typeof this.cancelInfo == 'function') {
        this.cancelInfo();
      }
      this.$refs.opPage.loadingStatus = true;
      this.$axios.get(netinfor, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          // this.cancel = c;
          this.cancelInfo = c;
        })
      })

        .then(res => {
          this.$refs.opPage.loadingStatus = false;
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.chartdata = res.data.data;
            var flagX = '[时间]';
            var flagY = '[]';
            // console.log(this.nowtree,"这个树究竟是什么")
            if(this.nowtree[0].type == "振动-位移" || this.nowtree[0].type == "振动-加速度" ){
              this.nowtype=113
            }else if(this.nowtree[0].type == "振动-速度"){
              this.nowtype=114
            }
            flagY='[' + that.features[this.nowtype][this.nowtree[1].xid].unit + ']';
            // flagY='[' + that.features[this.nowtype][this.nowtree[this.nowtree].xid].unit + ']';
            /* if (res.data.data.trendInfo.length > 0) {
               var flagY = '[' + res.data.data.trendInfo[0].unit + ']' || '[um]';
             } else {
               var flagY = '[um]';
             }*/
            var dataX = [];
            var dataY = [];
            var back = this.backmap;
            // var title = this.chartdata.equipmentName + ' '+ this.nowtree[0].label + ' 历史';
            var title = this.nowtree[0].label + ' ';

            var nowdatas = this.chartdata.trendInfo;
            let tmpRev = {};
            for (var i = 0; i < nowdatas.length; ++i) {
              var newX = timestampToTimeFormat(nowdatas[i].trendTime);
              dataX.push(newX);
              tmpRev[nowdatas[i].trendTime.toString()] = nowdatas[i].rev;
            }
            this.$store.state.timeRev = tmpRev;
            console.log('单通道时间戳',this.$store.state.timeRev);
            //     console.log(this.nowtree,"this.nowtree")
            for (var i = 1; i < this.nowtree.length; ++i) {
              var nowid = this.nowtree[i].xid;
              var nowcolor = this.colormap.get(nowid.toString());
              var nowtext = this.nowtree[i].name
              var newY = [];
              for (var j = 0; j < nowdatas.length; ++j) {
                var mydatas = nowdatas[j].trendValue[0];
                var nowname = back.get(nowid.toString());
                var nownum = mydatas[nowname];
                newY.push(nownum)
              }
              dataY.push({
                name: nowtext,
                data: newY,
                color: nowcolor

              })
            }
            var myinfos = {name: nowdatas[0].trendTime};

            let newY1 = [{name: this.nowtree[0].label, data: nowdatas.map(item => item.trendValue[0].rev)}];
            if(dataX.length) {
              // this.$refs.trendg_another.setchart(flagX, '[r/min]', dataX, newY1, `${this.equName} 历史 转速`);
              this.$refs.trendg_another.setchart(flagX, '[r/min]', dataX, newY1, `转速`);
              if(dataX.length == 0) {
                this.$emit('datanull');
              }
              this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title)
              this.drawWaveSpectrum(myinfos);
            }
            else {
              this.clearchart();
            }


          } else {
            this.clearchart()
            that.$emit('datafail')
            // that.$message.error(res.data.message);
          }
        }).catch(e => {
        this.$refs.opPage.loadingStatus = false;
        // this.clearchart();
        // this.$emit('datafail')
      });



    },
    // 历史单通道多特征值
    gethisduotongdaoData(equipmentUuid, pointIdString, stime, etime, mytree, feature,type) {
      // console.log(mytree, feature,type)
      // console.log("*******************88")
      let that = this;
      this.dataloading();
      var textname = this.textmap.get(feature.toString());
      this.onlyname = textname;
      var textstring = this.backmap.get(feature.toString());
      this.onlyone = textstring;
      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      this.getline(this.$store.state.equid,pointIdString.split(',')[0]);
      var pointIdString1 = encodeURIComponent(pointIdString);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
      var netinfor = ( '/trend/' + equipmentUuid1 + '/' + pointIdString1 + '/' + stime + '/' + etime + "/info");
      this.$refs.opPage.loadingStatus = true;
      let CancelToken = this.$axios.CancelToken;
      if(typeof this.cancel == 'function') {
        this.cancel();
      }
      this.$axios.get(netinfor, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      }).then(res => {
        this.$refs.opPage.loadingStatus = false;
        if (res.data.code === 200) {
          that.$emit('datasuccess');
          // console.log(res);
          // console.log("44")
          this.chartdata = res.data.data;
          // var title = this.chartdata.equipmentName + ' 历史';
          var title = this.features[type][this.feature].label + ' ';
          var trendinfo = this.chartdata.trendInfo;
          var flagX = '[时间]';
          var flagY = '[]';
          flagY='[' + this.features[type][this.feature].unit + ']';
          /*  if(trendinfo.length > 0) {
              var flagY = '[' + res.data.data.trendInfo[0].unit + ']' || '[um]';
            } else {
              var flagY = '[um]';
            }*/
          var dataX = [];
          var dataY = [];
          var valueY = [];
          let revValueY = [];
          for (var i = 1; i < this.nowtree.length; ++i) {
            valueY.push([]);
            revValueY.push([]);
          }
          //  timestampToTimeFormat(this.chartdata.trendTime);
          let tmpRev = {};
          for (var i = 0; i < trendinfo.length; ++i) {
            dataX.push(timestampToTimeFormat(trendinfo[i].trendTime));
            tmpRev[trendinfo[i].trendTime.toString()] = trendinfo[i].rev;
            for (var j = 1; j < this.nowtree.length; ++j) {
              valueY[j - 1].push(trendinfo[i].trendValue[j - 1][this.onlyone])
              revValueY[j - 1].push(trendinfo[i].trendValue[j - 1]['rev']);
            }
          }
          this.$store.state.timeRev = tmpRev;
          console.log('多通道时间戳',this.$store.state.timeRev);
          let newY = [];
          for (var i = 1; i < this.nowtree.length; ++i) {
            dataY.push({
              name: this.nowtree[i].label,
              data: valueY[i - 1],
              color: this.colormap.get(i.toString())
            })
            newY.push({
              name: this.nowtree[i].label,
              data: revValueY[i - 1],
              color: this.colormap.get(i.toString())
            })

          }

          // let newY = [{name: this.equName, data: trendinfo.map(item => item.rev)}];
          if (dataX.length == 0) {
            this.$emit('datanull');
            this.clearchart();
            return ;
          }
          if(dataX.length) {
            this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title);
            this.$refs.trendg_another.setchart(flagX, '[r/min]', dataX, newY, `转速`);
            var myinfo = {
              name: dataX[0],
              seriesName: this.nowtree[1].label,
              //  seriesID:this.nowtree[1].id

            };
            this.drawWaveSpectrum(myinfo)
          }

        } else {
          this.clearchart();
          this.$emit('datafail')
          //this.$message.error(res.data.message);
        }
      }).catch(e => {
        this.$refs.opPage.loadingStatus = false;
        // this.clearchart();
        // this.$emit('datafail')
      });


    },
    getline(equid,pointid) {
      var tmp_data= null;
      let mypointid = encodeURIComponent(pointid);
      mypointid=mypointid.replace(/%2f/gi,"%252F");
      var url = `point/${encodeURIComponent(equid)}/${mypointid}/alarmLine`
      let CancelToken = this.$axios.CancelToken;
      if(typeof this.cancelAlarm == 'function') {
        this.cancelAlarm();
      }
      this.$axios.get(url, {
        cancelToken: new CancelToken((c) => {
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
          this.$refs.trendg.aline = tmp_data;
        }

      });
    },
    cancelRefine() {
      if (this.tongdao == 1) {
        this.gethisdantongdaoData(this.nowpointid, this.pointIdString, this.stime, this.etime, this.labelname)
        //  console.log(this.nowpointid, this.pointIdString, stime, etime, this.pointuuid, this.nowtree,this.nowtype)
      } else {
        this.gethisduotongdaoData(this.nowpointid, this.pointIdString, this.stime, this.etime, this.nowtree, this.feature,this.nowtype);

      }
      this.reDataZoomInterval()
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
          this.$refs.trendg_another.dataZoom(zoomBegin,zoomEnd)
        }
        //为什么要执行两次，存疑
        // console.log("测试reZoomData this.$refs.trends.length",this.$refs.trendgs.length)
        if (this.zoomDataIntervalBegin.length === 0){
          this.zoomDataIntervalBegin = this.$refs.trendg.mychart.getOption().useDataZoomBegin
          this.zoomDataIntervalEnd = this.$refs.trendg.mychart.getOption().useDataZoomEnd
        }
        this.$refs.trendg.dataZoom(zoomBegin,zoomEnd)
        this.$refs.trendg_another.dataZoom(zoomBegin,zoomEnd)
        this.zoomDataInterval(zoomBegin,zoomEnd)
      }
    },
    zoomDataInterval(zoomBegin,zoomEnd){
      if (this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1] != zoomBegin ||
        this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1] != zoomEnd){
        this.zoomDataIntervalBegin.push(zoomBegin)
        this.zoomDataIntervalEnd.push(zoomEnd)
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

      if (this.nowTrend===1){
        let reOriginalSeries = JSON.parse(JSON.stringify(this.$refs.trendg.mychart.getOption().OriginalSeries))
        let reOption = JSON.parse(JSON.stringify(this.$refs.trendg.mychart.getOption()))
        this.$refs.trendg.reDataZoom(reOriginalSeries,reOption,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
        this.$refs.trendg_another.reDataZoom(reOriginalSeries,reOption,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
      }


      let reOriginalSeries3 = JSON.parse(JSON.stringify(this.$refs.trendg.mychart.getOption().OriginalSeries))
      let reOption3 = JSON.parse(JSON.stringify(this.$refs.trendg.mychart.getOption()))
      this.$refs.trendg.reDataZoom(reOriginalSeries3,reOption3,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
      this.$refs.trendg_another.reDataZoom(reOriginalSeries3,reOption3,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)


    },
    spendTrendGraphToDrawWaveSpectrum(myinfo) {
      this.drawWaveSpectrum(myinfo)
      this.$refs.trendg.drawMarkLine(myinfo.name,this.$refs.trendg_another.PrimarySecondary.isMark)
    },
    updateShowOpPage(val) {
      this.showOpPage = val;
    },
    clearchart() {
      var CancelToken = this.$axios.CancelToken;
      this.$refs.trendg_another.clearall();
      this.$refs.trendg.clearall();
      this.$refs.waveg.clearall();
      this.$refs.spectrumg.clearall();
    },
    getrealdantongdao(equipmentUuid, pointIdString, pointuuid, mytree,type) {
      // console.log(mytree,type)
      this.dataloading();
      let that = this;
      //帮助后面添加数据
      that.nowtree = mytree;
      that.nowpointid = pointuuid;
      that.tongdao = 1;
      that.graphtype = '实时';
      if(this.nowtree[0].type == "振动-位移" || this.nowtree[0].type == "振动-加速度" ){
        this.nowtype=113
      }else if(this.nowtree[0].type == "振动-速度"){
        this.nowtype=114
      }
      // if (typeof this.cancel == 'function') {
      //   this.cancel()
      // }
      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      var pointIdString1 = encodeURIComponent(pointIdString);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
      this.realDanQuestFlag = false;
      // console.log("/trend/" + equipmentUuid + '/' + pointIdString + "/real_time")
      that.$axios.get(("/trend/" + equipmentUuid1 + '/' + pointIdString1 + "/real_time")/*, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      }*/)
        .then(res => {
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.realDanQuestFlag = true;
            this.chartdata = res.data.data;
            // console.log("打印一下这个里的nowtreeeeeeeeeeeeeee");
            // console.log(this.nowtree[0]);
            var pointname = this.chartdata.equipmentName + ' ' + this.nowtree[0].label;
            // var title = this.chartdata.equipmentName +' '+  this.nowtree[0].label+ ' 实时';
            var title = "多特征值"+ ' 实时';
            // var title_rev = this.equName + ' 实时 转速';
            var title_rev = '转速  实时';
            // 初始化趋势图数据
            var flagX = '[时间]';
            // console.log(this.nowtree)
            var flagY = '[]';
            flagY='[' + that.features[type][mytree[1].xid].unit + ']';
            var flagY_rev = '[r/min]';
            var dataX = [];
            var dataY = [];
            var dataY_rev = [];
            var back = this.backmap;
            this.nowtree = mytree;
            var newX = timestampToTimeFormat(this.chartdata.trendTime);
            let newOb = {};
            newOb[this.chartdata.trendTime.toString()] = this.chartdata.rev;
            this.$store.state.timeRev = newOb;
            console.log('第一次的时间戳', this.$store.state.timeRev);
            dataX.push(newX);
            // console.log('单通道实时',this.nowtree, this.chartdata)
            for (var i = 1; i < this.nowtree.length; ++i) {
              var nowid = this.nowtree[i].xid;
              var nowcolor = this.colormap.get(nowid.toString());
              var nowtext = this.nowtree[i].name
              var nowname = this.backmap.get(nowid.toString());
              var nownum = this.chartdata.trendValue[0][nowname];
              dataY.push({
                name: nowtext,
                data: [nownum],
                color: nowcolor
              });
            }
            dataY_rev.push({
              name: this.nowtree[0].label,
              data: [this.chartdata.trendValue[0].rev],
              color: nowcolor
            })
            //初始化波形图数据
            var wavedata = this.chartdata.waveValue || {
              waveUnit: {}
            };
            var wavex = '[' + wavedata.waveUnit.x + ']' || '';
            var wavey = '[' + wavedata.waveUnit.y + ']' || '';;
            var wavedataX = wavedata.waveX || [];
            var wavedataY = {
              name: this.nowtree[0].label,
              data: wavedata.waveY || []
            };

            //初始化频谱图数据
            var spectrumdata = this.chartdata.spectrumValue|| {
              spectrumUnit: {}
            };
            var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']' || '';
            var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']' || '';
            var spectrumdataX = spectrumdata.spectrumX|| [];
            var spectrumdataY = {
              name: this.nowtree[0].label,
              data: spectrumdata.spectrumY|| []
            };

            //画图
            this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title);
            var dataXX = []
            for(var i = 0; i < dataX.length; ++i) {
              dataXX.push(dataX[i])
            }
            // console.log('here is gone')
            if(dataXX.length == 0) {
              this.$emit('datanull');
            }
            this.$refs.trendg_another.setchart(flagX, flagY_rev, dataXX, dataY_rev, title_rev);
            this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title, newX);
            this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title, newX);


          } else {
            this.clearchart();
            if(this.getrealdantongdaoFlag) {
              this.$emit('datafail');
              this.getrealdantongdaoFlag = false;
            }
            // that.$message.error(res.data.message);
          }
        })
    },
    addrealdantongdao() {
      if (this.realDanQuestFlag && this.realDanQuest) {
        this.realDanQuest = false;
        let that = this;
        var equipmentUuid = this.$store.state.equid;
        var pointIdString = this.nowtree[0].xid;
        var equipmentUuid1 = encodeURIComponent(equipmentUuid);
        var pointIdString1 = encodeURIComponent(pointIdString);
        pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
        this.$axios.get("/trend/" + equipmentUuid1 + '/' + pointIdString1 + "/real_time")
          .then(res => {
            this.realDanQuest = true;
            if (res.data.code === 200) {
              this.chartdata = res.data.data;
              var pointname = this.chartdata.equipmentName + ' ' + this.nowtree[0].label;
              // var title = this.chartdata.equipmentName + ' ' + this.nowtree[0].label + ' 实时';
              var title_rev = this.chartdata.equipmentName + this.nowtree[0].label + ' 实时转速-';
              var title = this.nowtree[0].label + ' 实时';
              var newX = timestampToTimeFormat(this.chartdata.trendTime);
              let newOb = {};
              newOb[this.chartdata.trendTime.toString()] = this.chartdata.rev;
              this.$store.state.timeRev = newOb;
              console.log('新的时间戳', this.$store.state.timeRev);
              var newY = [];
              var dataY_rev = [];
              for (var i = 1; i < this.nowtree.length; ++i) {
                var nowid = this.nowtree[i].xid;
                var nowname = this.backmap.get(nowid.toString());
                var nownum = this.chartdata.trendValue[0][nowname];
                newY.push(nownum);
              }
              // var nownum_rev = this.chartdata.rev;
              // dataY_rev.push(nownum_rev);
              dataY_rev.push(this.chartdata.trendValue[0]['rev']);

              var wavedata = this.chartdata.waveValue || {
                waveUnit: {}
              };
              var wavex = '[' + wavedata.waveUnit.x + ']' || '';
              var wavey = '[' + wavedata.waveUnit.y + ']' || '';
              var wavedataX = wavedata.waveX || [];
              var wavedataY = {
                name: this.nowtree[0].label,
                data: wavedata.waveY || []
              };

              var spectrumdata = this.chartdata.spectrumValue|| {
                spectrumUnit: {}
              };
              var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']' || '';
              var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']' || '';
              var spectrumdataX = spectrumdata.spectrumX || [];
              var spectrumdataY = {
                name: this.nowtree[0].label,
                data: spectrumdata.spectrumY || []
              };
              this.$refs.trendg.changechart(newX, newY);
              this.$refs.trendg_another.changechart(newX, dataY_rev);
              this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title, newX);
              this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title, newX)
            } else {
              this.clearchart();
              if(this.addrealdantogndaoFlag) {
                this.$emit('datafail');
                this.addrealdantogndaoFlag = false;
              }
              // that.$message.error(res.data.message)
            }
          })
      }

    },
    drawhistorydantongdao(equipmentUuid, pointIdString, stime, etime, pointuuid, mytree,labelname) {   //单通道
      this.tongdao = 1;
      this.graphtype = '历史';
      this.nowtree = mytree;
      this.nowpointid = equipmentUuid;
      this.pointIdString = pointIdString;
      this.pointuuid = pointuuid;
      this.stime = stime;
      this.etime = etime;
      this.labelname = labelname;
      // this.nowtype = type
      // console.log("%%%%%%%%%%%",this.nowtype)
      this.gethisdantongdaoData(equipmentUuid, pointIdString, stime, etime,labelname);
    },
    drawrealduotongdao(equid, pointids, mytree, feautre,type) {
      // console.log("2@@@@@@@@@@@@@@@@@@@@",type,feautre);
      // console.log(this.features[type][feautre].unit)
      this.tongdao = 0;
      this.dataloading();
      this.graphtype = '实时'
      this.nowtree = mytree;
      var textname = this.textmap.get(feautre.toString());
      this.onlyname = textname;
      var textstring = this.backmap.get(feautre.toString());
      this.onlyone = textstring;
      // if (typeof this.cancel == 'function') {
      //   this.cancel()
      // }
      var equid1 = encodeURIComponent(equid);
      var pointids1 = encodeURIComponent(pointids);
      pointids1=pointids1.replace(/%2f/gi,"%252F");
      this.realDuoQuestFlag = false;
      this.$axios.get("/trend/" + equid1 + "/" + pointids1 + "/real_time"/*, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      }*/).then(res => {
        // console.log('go3', res)
        if (res.data.code === 200) {
          // console.log('go2')
          this.$emit('datasuccess');
          this.realDuoQuestFlag = true;
          let that = this;
          this.chartdata = res.data.data;
          //  console.log('多通道实时', mytree, this.chartdata);
          //   var title = this.chartdata.equipmentName + ' 实时';
          var title = that.features[type][feautre].label + ' 实时';
          // let title1 = this.chartdata.equipmentName + ' ' + mytree[1].label + ' 实时';
          let title1 = mytree[1].label + ' 实时';
          // var title_rev = this.equName + ' 实时 转速';
          var title_rev = '转速 实时';
          var newX = timestampToTimeFormat(this.chartdata.trendTime);
          let newOb = {};
          newOb[this.chartdata.trendTime.toString()] = this.chartdata.rev;
          this.$store.state.timeRev = newOb;
          console.log('第一次的时间戳', this.$store.state.timeRev);

          var flagX = '[时间]';
          var flagY = '';
          flagY='[' + that.features[type][feautre].unit + ']';
          // if (this.nowtree[0].label.indexOf('加速度') != -1) {
          //   flagY = '[m/s²]';
          // } else if (this.nowtree[0].label.indexOf('速度') != -1) {
          //   flagY = '[mm/s]';
          // }
          var flagY_rev = '[r/min]';
          var dataX = [];
          var dataY = [];
          var dataY_rev = [];
          dataX.push(newX);
          for (var i = 1; i < mytree.length; ++i) {
            var newY = this.chartdata.trendValue[i - 1][textstring];
            //     console.log(mytree[i]);
            dataY.push({
              name: mytree[i].label,
              data: [newY],
              color: this.colormap.get(i.toString())
            });
            dataY_rev.push({
              name: mytree[i].label,
              data: [this.chartdata.trendValue[i - 1]['rev']],
              color: this.colormap.get(i.toString())
            });
          }
          // var nownum_rev = this.chartdata.rev;
          // dataY_rev.push({
          //   name: this.equName,
          //   data: [nownum_rev],
          // });

          var wavedata = this.chartdata.waveValue || {
            waveUnit:{}
          };
          var wavex = '[' + wavedata.waveUnit.x + ']' || '';
          var wavey = '[' + wavedata.waveUnit.y + ']' || '';
          var wavedataX = wavedata.waveX || [];
          var wavedataY = {
            name: mytree[1].label,
            data: wavedata.waveY || []
          };

          var spectrumdata = this.chartdata.spectrumValue || {
            spectrumUnit:{}
          };
          var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']' || '';
          var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']' || '';
          var spectrumdataX = spectrumdata.spectrumX || [];
          var spectrumdataY = {
            name: mytree[1].label,
            data: spectrumdata.spectrumY || []
          };
          // console.log('it goes')

          this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title);
          var dataXX = [];
          for(var i = 0; i < dataX.length; ++i) {
            dataXX.push(dataX[i])
          }
          if(dataXX.length == 0) {
            this.$emit('datanull');
          }
          this.$refs.trendg_another.setchart(flagX, flagY_rev, dataXX, dataY_rev, title_rev);
          this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title1, newX);
          this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title1, newX)
        } else {
          if(this.drawrealduotongdaoFlag) {
            this.$emit('datafail');
            this.drawrealduotongdaoFlag = false;
          }
          //this.$message.error(res.data.message);
        }
      })
    },
    addrealduotongdao(equid, pointids) {
      // if (typeof this.cancel == 'function') {
      //   this.cancel()
      // }
      if (this.realDuoQuestFlag && this.realDuoQuest) {
        this.realDuoQuest = false;
        let equid1 = encodeURIComponent(equid);
        let pointids1 = encodeURIComponent(pointids);
        pointids1=pointids1.replace(/%2f/gi,"%252F");
        this.$axios.get(("/trend/" + equid1 + "/" + pointids1 + "/real_time")).then(res => {
          if (res.data.code === 200) {
            this.realDuoQuest = true;
            let that = this;
            this.chartdata = res.data.data;
            var title = this.chartdata.equipmentName + ' 实时';
            // let title1 = this.chartdata.equipmentName +  ' ' + this.nowtree[1].label + ' 实时';
            let title1 = this.nowtree[1].label + ' 实时';
            var newX = timestampToTimeFormat(this.chartdata.trendTime);
            let newOb = {};
            newOb[this.chartdata.trendTime.toString()] = this.chartdata.rev;
            this.$store.state.timeRev = newOb;
            console.log('新的时间戳', this.$store.state.timeRev);
            var dataY = [];
            var newY_rev = [];
            for (var i = 1; i < this.nowtree.length; ++i) {
              var newY = this.chartdata.trendValue[i - 1][this.onlyone];
              dataY.push(newY);
              newY_rev.push(this.chartdata.trendValue[i - 1]['rev']);
            }
            var wavedata = this.chartdata.waveValue || {
              waveUnit: {}
            };
            var wavex = '[' + wavedata.waveUnit.x + ']' || '';
            var wavey = '[' + wavedata.waveUnit.y + ']' || '';
            var wavedataX = wavedata.waveX || [];
            var wavedataY = {
              name: this.nowtree[1].label,
              data: wavedata.waveY || []
            };

            var spectrumdata = this.chartdata.spectrumValue || {
              spectrumUnit: {}
            };
            var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']' || '';
            var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']' || '';
            var spectrumdataX = spectrumdata.spectrumX || [];
            var spectrumdataY = {
              name: this.nowtree[1].label,
              data: spectrumdata.spectrumY || []
            };
            this.$refs.trendg.changechart(newX, dataY);
            this.$refs.trendg_another.changechart(newX, newY_rev);
            this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title1, newX);
            this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title1, newX);
          } else {
            this.clearchart();
            if(this.addrealduotogndaoFlag) {
              this.$emit('datafail')
              this.addrealduotongdaoFlag = false;
            }
            //this.$message.error(res.data.message);
          }
        })
      }

    },
    drawhistoryduotongdao(equipmentUuid, pointIdString, stime, etime, mytree, feature,type) {
      this.tongdao = 0;
      this.graphtype = '历史';
      this.nowtree = mytree;
      this.nowpointid = equipmentUuid;
      this.pointIdString = pointIdString;
      this.feature = feature;
      this.nowtype=type;
      this.stime = stime;
      this.etime = etime;
      this.gethisduotongdaoData(equipmentUuid, pointIdString, stime, etime, mytree, feature,type);
    },
    showgraph() {
      this.show = true;
      this.graphheight = '20%';
      this.fallgraphheight = '40%';
      this.$nextTick(() => {
        this.$refs.trendg.mychart.resize();
        this.$refs.waveg.mychart.resize();
        this.$refs.spectrumg.mychart.resize();
      })
    },
    notshowgraph() {
      this.show = false;
      this.graphheight = 100 / 3 + '%';
      this.fallgraphheight = '0%';
      this.$nextTick(() => {
        this.$refs.trendg.mychart.resize();
        this.$refs.waveg.mychart.resize();
        this.$refs.spectrumg.mychart.resize();
      })
    },
    dataloading() {
      this.$emit('dataloading')
    },
    infoname(myname) {
      this.$emit('setinfoname', myname);
    },
    stopnowinterval() {
      if (this.myinterval) {
        clearInterval(this.myinterval);
      }
    },
    cancelRequest() {
      if (typeof this.source === 'function') {
        this.source('终止请求')
      }
    },
    openalarm() {
      this.$confirm('请选择测点', '提示', {
        cancelButtonText: '确定',
        type: 'warning'
      }).then(() => {
      }).catch(() => {
        this.clearchart();
        // that.$emit('datafail');
      });
    },
  }
}
</script>

<style lang="scss">

.trend-analysisjibeng {
  --conbgcolor: #0D0F1F;
  --leftconbgcolor: #222331;
  --buttoncolor: #1677FF;
  --textcolor: #ffffff;
  width: 100%;
  height: 100%;
  display: flex;
  background-color: var(--conbgcolor);

  .tupu {
    background-color: var(--leftconbgcolor);
    float: left;
    margin: 10px 2px 0 2px;
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

  .graph {
    height: 100%;
    width: 100%;
    //margin-bottom:  1px;
  }
}
</style>
<script setup lang="ts">
</script>
