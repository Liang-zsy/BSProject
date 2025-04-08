<template>
  <div class="pump-impact-diagnosisjibeng" ref="ui">
    <div class='tupu' id='lefttupu'>
      <div :style="{height : highexe(1) , width:'100%'}" v-show="fullId===1||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(1)">
        <TrendGraph ref='trendg' @chartinfo="trendGraphToDrawWaveSpectrum" class="graph" @refine="refine" @cancelRefine="cancelRefine" @cancelFull="handledblclick(1)" @dataZoom="dataZoom" @reDataZoom="reDataZoom"></TrendGraph>
      </div>
      <div :style="{height : highexe(2) , width:'100%'}" v-show="fullId===2||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(2)">
        <SpeedTrendGraph ref='trendg_another' @chartinfo="spendTrendGraphToDrawWaveSpectrum" class="graph" @refine="refine" @cancelFull="handledblclick(2)" @cancelRefine="cancelRefine" @dataZoom="dataZoom" @reDataZoom="reDataZoom"></SpeedTrendGraph>
      </div>
      <div :style="{height :highexe(3) , width:'100%'}" v-show="fullId===3||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(3)">
        <WaveGraph ref='waveg' class="graph" @cancelFull="handledblclick(3)"></WaveGraph>
      </div>
      <div :style="{height : highexe(4) , width:'100%'}" v-show="fullId===4||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(4)">
        <SpectrumGraph ref="spectrumg" :style="{width: '100%', height: '100%'}"@cancelFull="handledblclick(4)"></SpectrumGraph>
      </div>
    </div>

    <!--  隐藏操作页按钮  -->
    <OpHideButton
      :showOpPage="showOpPage"
      @updateShowOpPage="updateShowOpPage">
    </OpHideButton>

    <div class='op' id='rightop' v-show="showOpPage">
      <PumpImpactDiagnosisOpPage
        @yaoxianshi="yaoxianshi"
        @yaoxianshi1="yaoxianshi1"
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
        ref="opPage"
        :style="{height: '100%'}"></PumpImpactDiagnosisOpPage>
    </div>
  </div>
</template>

<script>
import TrendGraph from "../components/ComUtils/TrendGraph";
import PumpImpactDiagnosisOpPage from '../components/PumpImpactDiagnosis/PumpImpactDiagnosisOpPage';
import WaveGraph from "../components/ComUtils/WaveGraph";
import SpectrumGraph from "../components/ComUtils/SpectrumGraph";
import SpeedTrendGraph from "../components/ComUtils/SpeedTrendGraph";
import keepAliveMixin from "@/mixins/keepAliveMixin";
import {timestampToTimeFormat} from "../components/ComUtils/TimeFormat";
import OpHideButton from "@/components/ComUtils/OpHideButton";
import keyPressSignalMixin from '@/mixins/keyPressSignalMixin';
export default {
  name: "TrendAnalysis",
  mixins: [keepAliveMixin,keyPressSignalMixin],
  components: {
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
      nowtype:null,
      fullId: 0,
      isFull: false,
      temp_uuid: null,
      seriesName: '',

      showOpPage: true,
      show: false,
      graphheight: 33.3 + '%',
      fallgraphheight: '0%',
      unitname: '机泵专用图谱-冲击诊断',
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
      xianshi:1,
      xianshi1:1,
      addrealduotongdaoFlag: true, drawrealduotongdaoFlag: true, drawWaveSpectrumFlag: true,
      addrealdantongdaoFlag: true,
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
      if(!this.activatedFlag) return ;
      this.clearchart();
    },
    topiccolor(val) {
      this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
      this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
      this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
    }
  },
  methods: {
    highexe(id){
      if(this.isFull){
        if(id === this.fullId){
          return "100%"
        }else {
          return  "0%"
        }
      }else {
        return "25%"
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
      // console.log(id)
    },
    trendGraphToDrawWaveSpectrum(myinfo) {
      // console.log("trendGraphToDrawWaveSpectrum");
      this.drawWaveSpectrum(myinfo)
      // this.$refs['trendg_another'].drawLineAndProLine(myinfo.name)
      this.$refs.trendg_another.drawMarkLine(myinfo.name,this.$refs.trendg.PrimarySecondary.isMark)
    },
    refine(stime, etime) {
      this.dataloading();
      // console.log(stime, etime);
      if (this.tongdao == 1) {
        this.gethisdantongdaoData(this.nowpointid, this.pointIdString, stime, etime, this.labelname)
      } else {
        this.gethisduotongdaoData(this.nowpointid, this.pointIdString, stime, etime, this.nowtree, this.feature,this.nowtype);
      }
      this.reDataZoomInterval()
    },
    gethisdantongdaoData(equipmentUuid, pointIdString, stime, etime, lablename) {
      this.$emit('dataloading');
      let that = this;
      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      var pointIdString1 = encodeURIComponent(pointIdString);
      this.getline(this.$store.state.equid,pointIdString.split(',')[0]);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
      var netinfor = ('/trend/' + equipmentUuid1 + '/' + pointIdString1 + '/' + stime + '/' + etime + "/info");
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
      })
        .then(res => {
          if (res.data.code === 200) {
            this.$refs.opPage.loadingStatus = false;
            this.$emit('datasuccess');
            this.chartdata = res.data.data;
            var flagX = '[时间]';
            var flagY = '[]';
            this.nowtype = this.nowtree[0].type
            flagY='[' + that.features[ this.nowtype][Number(this.nowtree[1].xid)].unit + ']';
            var dataX = [];
            var dataY = [];
            var back = this.backmap;
            // var title = this.chartdata.equipmentName + ' 历史';
            var title = "多特征值" + ' ';

            var nowdatas = this.chartdata.trendInfo;
            let tmpRev = {};
            for (var i = 0; i < nowdatas.length; ++i) {
              var newX = timestampToTimeFormat(nowdatas[i].trendTime);
              dataX.push(newX);
              tmpRev[nowdatas[i].trendTime.toString()] = nowdatas[i].rev;
            }
            this.$store.state.timeRev = tmpRev;
            console.log('单通道时间戳',this.$store.state.timeRev);
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
            let newY1 = [{name: this.nowtree[0].label, data: nowdatas.map(item => item.rev)}];
            if(dataX.length == 0) {
              this.$emit('datanull');
            }
            if(dataX.length) {
              this.$refs.trendg_another.setchart(flagX, '[r/min]', dataX, newY1, `转速`, 'history');
              this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'history')
              this.drawWaveSpectrum(myinfos);
            }
            else {
              this.clearchart();
            }
          } else {
            this.clearchart();
            that.$emit('datafail')
            // that.$message.error(res.data.message);
          }
        }).catch(e => {
        this.$refs.opPage.loadingStatus = false;
        // this.clearchart();
        // this.$emit('datafail')
      });
    },
    gethisduotongdaoData(equipmentUuid, pointIdString, stime, etime, mytree, feature,type) {
      this.$emit('dataloading');
      var textname = this.textmap.get(feature.toString());
      this.onlyname = textname;
      var textstring = this.backmap.get(feature.toString());
      this.onlyone = textstring;
      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      var pointIdString1 = encodeURIComponent(pointIdString);
      this.getline(this.$store.state.equid,pointIdString.split(',')[0]);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");

      this.$refs.opPage.loadingStatus = true;
      var netinfor = ( '/trend/' + equipmentUuid1 + '/' + pointIdString1 + '/' + stime + '/' + etime + "/info");
      var CancelToken = this.$axios.CancelToken;
      if (typeof this.cancel == 'function') {
        this.cancel()
      }
      this.$axios.get(netinfor, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      }).then(res => {
        this.$refs.opPage.loadingStatus = false;
        if (res.data.code === 200) {
          this.$emit('datasuccess');
          this.chartdata = res.data.data;
          // var title = this.chartdata.equipmentName + ' 历史';
          var title = this.features[type][this.feature].label + ' ';
          var trendinfo = this.chartdata.trendInfo;
          var flagX = '[时间]';
          var flagY = '[]';
          flagY='[' + this.features[type][this.feature].unit + ']';
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
          if(dataX.length == 0) {
            this.$emit('datanull');
          }
          if(dataX.length) {
            this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'history');
            this.$refs.trendg_another.setchart(flagX, '[r/min]', dataX, newY, `转速`, 'history');
            var myinfo = {
              name: dataX[0],
              seriesName: this.nowtree[1].label,
              //  seriesID:this.nowtree[1].id
            };
            this.drawWaveSpectrum(myinfo, revValueY)
          }
          else {
            this.$emit('datanull');
            this.clearchart();
          }
        } else {
          this.clearchart();
          this.$emit('datafail')
        }
      }).catch(e => {
        this.$refs.opPage.loadingStatus = false;
      });
    },
    reDataZoomInterval(){
      this.zoomDataIntervalBegin = []
      this.zoomDataIntervalEnd = []
    },
    getline(equid,pointid) {
      var tmp_data= null;
      let mypointid = encodeURIComponent(pointid);
      mypointid=mypointid.replace(/%2f/gi,"%252F");
      var url = `point/${encodeURIComponent(equid)}/${mypointid}/alarmLine`
      let CancelToken = this.$axios.CancelToken;
      if(typeof this.cancelAlam == 'function') {
        this.cancelAlam();
      }
      this.$axios.get(url, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancelAlam = c;
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
    drawWaveSpectrum(myinfo, revValueY) {
      if (this.graphtype === '历史') {
        // console.log(11111111111111111)
        // console.log(myinfo)
        let that = this;
        var equipmentUuid = this.nowpointid;
        var thistime = myinfo.name;
        this.seriesName = myinfo.seriesName
        var nowtime = new Date(thistime).getTime();
        var pointIdString;
        this.dataloading();
        var pointNmae;
        if (this.tongdao.toString() === '1') {
          pointIdString = this.nowtree[0].xid;
          pointNmae = this.nowtree[0].label
        } else {
          pointIdString = '';
          //   console.log('nowtree')
          //   console.log(this.nowtree)
          for(var i = 0; i < this.nowtree.length; ++i) {
            if(this.nowtree[i].label == myinfo.seriesName) {
              pointIdString = this.nowtree[i].id
              this.temp_uuid = this.nowtree[i].pointUuid
            }
          }
          pointNmae = myinfo.seriesName;
        }
        var waveNumber = 16384;
        var analysisLines = 0;
        var equipmentUuid1 = encodeURIComponent(equipmentUuid);
        var pointIdString1 = encodeURIComponent(pointIdString);
        pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
        this.$emit('dataloading');
        let CancelToken = this.$axios.CancelToken;
        if(typeof this.cancelInfo == 'function') {
          this.cancelInfo();
        }
        // console("/impact/" + equipmentUuid1 + '/' + pointIdString1 + '/' + nowtime + '/' + waveNumber + '/' + analysisLines + "/info")
        this.$axios.get(("/impact/" + equipmentUuid1 + '/' + pointIdString1 + '/' + nowtime + '/' + waveNumber + '/' + analysisLines + "/info"), {
          // this.$axios.get(("/wave-spectrum/" + equipmentUuid1 + '/' + pointIdString1 + '/' + nowtime + '/' + waveNumber + '/' + analysisLines + "/info") /*, {
          cancelToken: new CancelToken((c) => {
            // executor 函数接收一个 cancel 函数作为参数
            this.cancelInfo = c;
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
            var title = res.data.data.equipmentName   + ' 历史';
            // let title1 = res.data.data.equipmentName + ' ' + pointNmae  + ' ' + ' 历史';
            let title1 = pointNmae;
            //thistime =timestampToTimeFormat(thistime);
            thistime = timestampToTimeFormat(nowtime);
            this.$refs.waveg.setchart(wavex, wavey, dataX, dataY, title1+ ' 包络', thistime, null, 'history');
            var spectrumx = '[' + res.data.data.spectrumValue.spectrumUnit.x + ']';
            var spectrumy = '[' + res.data.data.spectrumValue.spectrumUnit.y + ']';
            var tmps = res.data.data.spectrumValue.spectrumX.length;
            for(var i = 0; i < res.data.data.spectrumValue.spectrumX.length; ++i) {
              if(res.data.data.spectrumValue.spectrumX[i] > 1000) {
                tmps = i + 1;
                break;
              }
            }
            dataX = res.data.data.spectrumValue.spectrumX.splice(0, tmps);
            var dataY = {
              name: pointNmae,
              data: res.data.data.spectrumValue.spectrumY.splice(0, tmps)
            };
            this.$refs.spectrumg.setchart(spectrumx, spectrumy, dataX, dataY, title1+ ' 包络', thistime, 'history');
            this.getdefect(1, this.temp_uuid, myinfo.name);
            this.getdata(equipmentUuid1, this.chartdata.rev);
          } else if(res.data.code === 400) {
            this.$emit('datanull')
          } else {
            // this.clearchart();
            if(this.drawWaveSpectrumFlag){
              this.$emit('datafail')
              this.drawrealduotongdaoFlag = false;
            }
            this.$refs.waveg.clearall();
            this.$refs.spectrumg.clearall();
            //this.$message.error(res.data.message);
          }
        }).catch(e => {
        });
      }
    },
    clearchart() {
      var CancelToken = this.$axios.CancelToken;
      this.$refs.trendg.clearall();
      this.$refs.trendg_another.clearall();
      this.$refs.waveg.clearall();
      this.$refs.spectrumg.clearall();
    },
    getdefect(itype, iuuid, itime) {
      console.log('???', iuuid, itime);
      // itime = this.NewDate(itime.toString())
      itime = new Date(itime).getTime()
      var url = '/bearing/'+ iuuid.toString() +'/'+ itype + '/' + itime + '/bearingDefect'
      this.$axios.get(url).then(res => {
        console.log(res);
        if(res.data.code == 200) {
          console.log('xixixi', res);
          let tmp_data = res.data.data;
          this.linepackage = []
          this.linepackage.push({
            name:'保持架',
            xAxis:tmp_data.cageFreq
          })
          this.linepackage.push({
            name:'内圈',
            xAxis:tmp_data.innerFreq
          })
          this.linepackage.push({
            name:'外圈',
            xAxis:tmp_data.outerFreq
          })
          this.linepackage.push({
            name:'滚动体',
            xAxis:tmp_data.rollingFreq
          })
          this.yaoxianshi(this.xianshi)
        }
      })
    },
    dataloading() {
      // this.$emit('dataloading');
    },
    getdata(Uuid, revValueY) {
      var url = '/equipment/'+ Uuid.toString() + '/info';
      var cylinderNum = 0;
      this.$axios.get(url).then(res => {
        if(res.data.code == 200) {
          var dataC = res.data.data;
          cylinderNum = dataC.cylinderNum;
          this.linepackage1 = [];
          if(revValueY === undefined) {
            revValueY = 3000;
          }
          this.linepackage1.push({
            name: '叶片频率',
            xAxis: cylinderNum * revValueY / 60
          })
          this.yaoxianshi1(this.xianshi1);
        }
      });
    },
    yaoxianshi1(value) {
      // console.log('显示缺陷频率',value);
      this.xianshi1 = value;
      if(value == true)
        this.$refs.spectrumg.setnolines1()
      else
        this.$refs.spectrumg.setlines1(this.linepackage1)
    },
    cancelRefine() {
      if (this.tongdao == 1) {
        this.gethisdantongdaoData(this.nowpointid, this.pointIdString, this.stime, this.etime, this.labelname)
      } else {
        this.gethisduotongdaoData(this.nowpointid, this.pointIdString, this.stime, this.etime, this.nowtree, this.feature,this.nowtype);
      }
      this.reDataZoomInterval()
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
      // this.$refs.trendg.drawLineAndProLine(myinfo.name)
      this.$refs.trendg.drawMarkLine(myinfo.name,this.$refs.trendg_another.PrimarySecondary.isMark)
    },
    updateShowOpPage(val) {
      this.showOpPage = val;
    },
    yaoxianshi(value) {
      // console.log('显示缺陷频率',value);
      this.xianshi = value;
      if(value == true)
        this.$refs.spectrumg.setnolines()
      else
        this.$refs.spectrumg.setlines(this.linepackage)
    },
    getrealdantongdao(equipmentUuid, pointIdString, pointuuid, mytree, type) {
      let that = this;
      //帮助后面添加数据
      this.$emit('dataloading');
      this.nowtree = mytree;
      this.nowpointid = pointuuid;
      this.tongdao = 1;
      this.graphtype = '实时';
      this.nowtype = this.nowtree[0].type
      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      var pointIdString1 = encodeURIComponent(pointIdString);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
      that.$axios.get(("/impact/" + equipmentUuid1 + '/' + pointIdString1 + "/real_time")/*, {
      // this.$axios.get("/trend/" + equipmentUuid1 + "/" + pointIdString1 + "/real_time"/*, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      }*/)
        .then(res => {
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.chartdata = res.data.data;
            // console.log("打印一下这个里的nowtreeeeeeeeeeeeeee");
            // console.log(this.nowtree[0]);
            var pointname = this.chartdata.equipmentName + ' ' + this.nowtree[0].label;
            // var title = this.chartdata.equipmentName  + ' 实时';
            var title = "多特征值";
            // var title1 = this.chartdata.equipmentName +' '+  this.nowtree[0].label+ ' 实时';
            // var title_rev = this.equName + ' 实时 转速';
            var title1 = this.nowtree[0].label;
            var title_rev = '转速';
            // 初始化趋势图数据
            var flagX = '[时间]';
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
            //  console.log(this.nowtree)
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
            var nownum_rev = this.chartdata.rev;
            dataY_rev.push({
              // name: this.equName,
              name: this.nowtree[0].label,
              data: [nownum_rev],
            });
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
            let flag = 0;
            //初始化频谱图数据
            try {
              var spectrumdata = this.chartdata.spectrumValue|| {
                spectrumUnit: {}
              };
              var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']' || '';
              var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']' || '';
              var tmps =spectrumdata.spectrumX.length ;
              for(var i = 0 ; i< spectrumdata.spectrumX.length; ++i) {
                if( spectrumdata.spectrumX[i] > 1000) {
                  tmps = i + 1;
                  break;
                }
              }
              var spectrumdataX = spectrumdata.spectrumX.splice(0, tmps)|| [];
              var spectrumdataY = {
                name: this.nowtree[0].label,
                data: spectrumdata.spectrumY.splice(0, tmps)|| []
              };
            } catch (e) {
              flag = 1;
            }
            //画图
            this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'real');
            var dataXX = []
            for(var i = 0; i < dataX.length; ++i) {
              dataXX.push(dataX[i])
            }
            if(dataXX.length == 0) {
              this.$emit('datanull');
            }
            // console.log('here is gone')
            this.$refs.trendg_another.setchart(flagX, flagY_rev, dataXX, dataY_rev, title_rev, 'real');
            this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title1+ ' 包络', newX, null, 'real');
            this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title1+ ' 包络', newX, 'real');
            this.getdefect(0,this.nowtree[1].pointUuid ,dataX[0] )
            this.getdata(equipmentUuid1, this.chartdata.rev);
            if (!flag) {
              // this.getdefect(0,this.nowtree[1].pointUuid ,dataX[0] )
            }
          } else {
            this.clearchart();
            if (this.getrealdantongdaoFlag){
              this.$emit('datafail')
              this.getrealdantongdaoFlag = false;
            }
            // that.$message.error(res.data.message);
          }
        })
    },
    addrealdantongdao() {
      let that = this;
      var equipmentUuid = this.$store.state.equid;
      var pointIdString = this.nowtree[0].xid;
      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      var pointIdString1 = encodeURIComponent(pointIdString);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
      this.$axios.get(("/impact/" + equipmentUuid1 + '/' + pointIdString1 + "/real_time")/*, {
      // this.$axios.get("/trend/" + equipmentUuid1 + "/" + pointIdString1 + "/real_time"/*, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      }*/)
        .then(res => {
          if (res.data.code === 200) {
            // this.$emit('datasuccess');
            this.chartdata = res.data.data;
            var pointname = this.chartdata.equipmentName + ' ' + this.nowtree[0].label;
            // var title = this.chartdata.equipmentName + ' ' + this.nowtree[0].label + ' 实时';
            var title = this.nowtree[0].label;
            var title_rev = this.chartdata.equipmentName + this.nowtree[0].label + ' 实时转速-';
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
            var nownum_rev = this.chartdata.rev;
            dataY_rev.push(nownum_rev);

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
            let flag = 0;
            try {
              var spectrumdata = this.chartdata.spectrumValue|| {
                spectrumUnit: {}
              };
              var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']' || '';
              var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']' || '';
              var tmps =spectrumdata.spectrumX.length ;
              for(var i = 0 ; i< spectrumdata.spectrumX.length; ++i) {
                if( spectrumdata.spectrumX[i] > 1000) {
                  tmps = i + 1;
                  break;
                }
              }
              var spectrumdataX = spectrumdata.spectrumX.splice(0, tmps) || [];
              var spectrumdataY = {
                name: this.nowtree[0].label,
                data: spectrumdata.spectrumY.splice(0, tmps) || []
              };
            } catch (e) {
              flag = 1;
            }
            this.$refs.trendg.changechart(newX, newY);
            this.$refs.trendg_another.changechart(newX, dataY_rev);
            this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title+ ' 包络', newX, null, 'real');
            this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title+ ' 包络', newX, 'real')
            this.getdefect(0,this.nowtree[1].pointUuid ,newX )
            this.getdata(equipmentUuid1, this.chartdata.rev);
            if (!flag) {
              // this.getdefect(0,this.nowtree[1].pointUuid ,newX )
            }
          } else {
            this.clearchart();
            if(this.addrealdantongdaoFlag) {
              this.$emit('datafail')
              this.addrealdantongdaoFlag = false;
            }
            // that.$message.error(res.data.message);
          }
        })
    },
    drawhistoryduotongdao(equipmentUuid, pointIdString, stime, etime, mytree, feature,type) {
      this.tongdao = 0;
      this.graphtype = '历史';
      this.nowtree = mytree;
      this.nowpointid = equipmentUuid;
      this.pointIdString = pointIdString;
      this.temp_uuid = mytree[1].pointUuid;
      this.feature = feature;
      this.nowtype=type;
      this.stime = stime;
      this.etime = etime;
      this.gethisduotongdaoData(equipmentUuid, pointIdString, stime, etime, mytree, feature,type)
    },
    drawrealduotongdao(equid, pointids, mytree, feautre,type) {
      // console.log(mytree[1].label);
      this.$emit('dataloading');
      this.tongdao = 0;
      this.graphtype = '实时'
      this.nowtree = mytree;
      var textname = this.textmap.get(feautre.toString());
      this.onlyname = textname;
      var textstring = this.backmap.get(feautre.toString());
      this.onlyone = textstring;
      var equid1 = encodeURIComponent(equid);
      var pointids1 = encodeURIComponent(pointids);
      pointids1=pointids1.replace(/%2f/gi,"%252F");
      this.$axios.get("/impact/" + equid1 + "/" + pointids1 + "/real_time"/*, {
      // this.$axios.get("/trend/" + equid1 + "/" + pointids1 + "/real_time"/*, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      }*/).then(res => {
        // console.log('go3', res)
        if (res.data.code === 200) {
          this.$emit('datasuccess');

          let that = this;
          this.chartdata = res.data.data;
          // var title = this.chartdata.equipmentName + ' 实时';
          var title = that.features[type][feautre].label;
          // let title1 = this.chartdata.equipmentName + ' ' + mytree[1].label + ' 实时';
          // var title_rev = this.equName + ' 实时 转速';
          let title1 = mytree[1].label;
          var title_rev = '转速';
          var newX = timestampToTimeFormat(this.chartdata.trendTime);
          let newOb = {};
          newOb[this.chartdata.trendTime.toString()] = this.chartdata.rev;
          this.$store.state.timeRev = newOb;
          console.log('第一次的时间戳', this.$store.state.timeRev);
          var flagX = '[时间]';
          var flagY = '[]';
          flagY='[' + that.features[type][feautre].unit + ']';
          var flagY_rev = '[r/min]';
          var dataX = [];
          var dataY = [];
          var dataY_rev = [];
          dataX.push(newX);

          for (var i = 1; i < mytree.length; ++i) {
            var newY = this.chartdata.trendValue[i - 1][textstring];
            // console.log(mytree[i]);
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
          let flag = 0;
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
          try {
            var spectrumdata = this.chartdata.spectrumValue || {
              spectrumUnit:{}
            };
            var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']' || '';
            var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']' || '';
            var tmps =spectrumdata.spectrumX.length ;
            for(var i = 0 ; i< spectrumdata.spectrumX.length; ++i) {
              if( spectrumdata.spectrumX[i] > 1000) {
                tmps = i + 1;
                break;
              }
            }
            var spectrumdataX = spectrumdata.spectrumX.splice(0,tmps) || [];
            var spectrumdataY = {
              name: mytree[1].label,
              data: spectrumdata.spectrumY.splice(0, tmps) || []
            };
          } catch (e) {
            flag = 1;
          }
          this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'real');
          var dataXX = [];
          for(var i = 0; i < dataX.length; ++i) {
            dataXX.push(dataX[i])
          }
          if(dataXX.length == 0) {
            this.$emit('datanull');
          }
          this.$refs.trendg_another.setchart(flagX, flagY_rev, dataXX, dataY_rev, title_rev, 'real');
          this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title1+ ' 包络', newX, null, 'real');
          this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title1+ ' 包络', newX, 'real')
          this.getdefect(0, mytree[1].pointUuid,dataX[0] )
          this.getdata(equid1, this.chartdata.rev);
          if (!flag) {
            // this.getdefect(0, mytree[1].pointUuid,dataX[0] )
          }
        } else {
          if (this.drawrealduotongdaoFlag)
            this.$emit('datafail')
          this.drawrealduotongdaoFlag = false;
          //this.$message.error(res.data.message);
        }
      })
    },
    addrealduotongdao(equid, pointids) {
      let equid1 = encodeURIComponent(equid);
      let pointids1 = encodeURIComponent(pointids);
      pointids1=pointids1.replace(/%2f/gi,"%252F");
      this.$axios.get(("/impact/" + equid1 + "/" + pointids1 + "/real_time")/*, {
      // this.$axios.get(("/trend/" + equid1 + "/" + pointids1 + "/real_time")/*,
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      }*/).then(res => {
        if (res.data.code === 200) {
          let that = this;
          this.chartdata = res.data.data;
          var title = this.chartdata.equipmentName + ' 实时';
          // let title1 = this.chartdata.equipmentName +  ' ' + this.nowtree[1].label + ' 实时';
          let title1 = this.nowtree[1].label;
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
          let flag = 0;
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
          try {
            var spectrumdata = this.chartdata.spectrumValue || {
              spectrumUnit: {}
            };
            var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']' || '';
            var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']' || '';
            var tmps =spectrumdata.spectrumX.length ;
            for(var i = 0 ; i< spectrumdata.spectrumX.length; ++i) {
              if( spectrumdata.spectrumX[i] > 1000) {
                tmps = i + 1;
                break;
              }
            }
            var spectrumdataX = spectrumdata.spectrumX.splice(0,tmps) || [];
            var spectrumdataY = {
              name: this.nowtree[1].label,
              data: spectrumdata.spectrumY.splice(0,tmps) || []
            };
          } catch (e) {
            flag = 1;
          }
          this.$refs.trendg.changechart(newX, dataY);
          this.$refs.trendg_another.changechart(newX, newY_rev);
          this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title1 + ' 包络', newX, null, 'real');
          if (!flag) {
            this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title1+ ' 包络', newX, 'real');
            this.getdefect(0,this.nowtree[1].pointUuid ,newX )
            this.getdata(equid1, this.chartdata.rev);
            // this.getdefect(0,this.nowtree[1].pointUuid ,newX )
          }
        } else {
          this.clearchart();
          if(this.addrealduotongdaoFlag) {
            this.$emit('datafail')
            this.addrealduotongdaoFlag = false
          }
          //this.$message.error(res.data.message);
        }
      })
    },
    drawhistorydantongdao(equipmentUuid, pointIdString, stime, etime, pointuuid, mytree,labelname) {   //单通道
      this.tongdao = 1;
      this.graphtype = '历史';
      this.nowtree = mytree;
      //   console.log('this.mytree', this.nowtree)
      this.nowpointid = equipmentUuid;
      this.pointIdString = pointIdString;
      this.temp_uuid = mytree[1].pointUuid;
      this.pointuuid = pointuuid;
      this.labelname = labelname;
      this.stime = stime;
      this.etime = etime;
      this.gethisdantongdaoData(equipmentUuid, pointIdString, stime, etime,labelname);
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

      date.setUTCHours(mi[0] - 8, mi[1], mi[2].split('.')[0], mi[2].split('.')[1]);
      return date;
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
        that.$emit('datafail');
      });
    },
  }
}
</script>

<style lang="scss">

.pump-impact-diagnosisjibeng {
  --conbgcolor: #232835;
  --leftconbgcolor: #303749;
  --buttoncolor: #359186;
  background: var(--conbgcolor);
  width: 100%;
  height: 100%;
  display: flex;

  .tupu {
    background-color: var(--leftconbgcolor);
    float: left;
    margin: 10px 2px 0 2px;
    width: calc(100% - 300px);
    height: calc(100% - 10px);
  }

  .op {
    width: 290px;
    height: calc(100% - 10px);
    margin-top: 10px;
    float: right;
    background-color: var(--leftconbgcolor);
    overflow: hidden;
  }

  .graph {
    height: 100%;
    width: 100%;
    //margin-bottom: 1px;
  }
}
</style>
