<template>
  <div class="cepstrum-graphjibeng" ref="ui">
    <div class='tupu' id='lefttupu'>
      <div :style="{height : highexe(1) , width:'100%'}" v-show="fullId===1||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(1)">
        <TrendGraph ref='trendg' @chartinfo="drawWaveSpectrum" class="graph" @refine="refine"
                    @cancelFull="handledblclick(1)"
                    @cancelRefine="cancelRefine" @dataZoom="dataZoom" @reDataZoom="reDataZoom"></TrendGraph>
      </div>
      <div :style="{height : highexe(2) , width:'100%'}" v-show="fullId===2||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(2)">
        <WaveGraph ref='waveg' class="graph" @cancelFull="handledblclick(2)"></WaveGraph>
      </div>
      <div :style="{height :highexe(3) , width:'100%'}" v-show="fullId===3||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(3)">
        <Cepstrum ref="spectrumg" @cancelFull="handledblclick(3)"></Cepstrum>
      </div>
    </div>

    <!--  隐藏操作页按钮  -->
    <OpHideButton
      :showOpPage="showOpPage"
      @updateShowOpPage="updateShowOpPage">
    </OpHideButton>

    <div class='op' id='rightop' v-show="showOpPage">
      <cepstrum-graph-op-page
        @cleanChart="clearchart"
        @realduotongdao="getrealduotongdao"
        @addrealduotongdao="addrealduotongdao"
        @drawhistoryduotongdao="drawhistoryduotongdao"
        @reDataZoomInterval="reDataZoomInterval"
        :style="{height: '100%'}"
        ref="opPage"></cepstrum-graph-op-page>
    </div>
  </div>
</template>

<script>
import TrendGraph from "../components/ComUtils/TrendGraph";
import CepstrumGraphOpPage from '../components/CepstrumGraph/CepstrumGraphOpPage';
import WaveGraph from "../components/ComUtils/WaveGraph";
import Cepstrum from "../components/CepstrumGraph/Cepstrum";
import {timestampToTimeFormat} from "../components/ComUtils/TimeFormat";
import OpHideButton from "@/components/ComUtils/OpHideButton";
import keyPressSignalMixin from '@/mixins/keyPressSignalMixin';

export default{
  name: "CepstrumGraph",
  components: {
    CepstrumGraphOpPage,
    Cepstrum,
    WaveGraph,
    TrendGraph,
    OpHideButton,
  },
  mixins: [keyPressSignalMixin],
  data() {
    return {
      stime: null,
      etime: null,
      fullId: 0,
      isFull: false,
      nowequipid: null,
      nowpointid: null,
      nowtree: null,
      nowfeature: null,
      nowpointuuid: null,
      cancelAlarmLineAxios: null,
      cancelTrendAxios:null,
      cancelWaveAxios: null,
      cancelCepstrumAxios: null,
      unit: null,
      unitname: '机泵专用图谱-倒谱图',
      onlyname: '',
      onlyone: 0,
      chartdata: null,
      myinterval: null,
      tongdao: null,
      graphtype: null,
      intervalflag: 0,
      backmap: null,
      textmap: null,
      colormap: null,
      nowdata: null,
      eids: '',
      showOpPage: true,
      drawWaveSpectrumFlag: true,
      getrealduotongdaoFlag: true,
      getrealduotongdaoFlag2: true,
      addrealduotongdaoFlag: true,
      addrealduotongdaoFlag2: true,
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
    mymap.set('0', "加速度峰值");
    mymap.set('1', "加速度高频");
    mymap.set('2', "加速度低频");
    mymap.set('3', "加速度波形峭度");
    mymap.set('4', "加速度有效值");
    mymap.set('5', "通频gIE值");
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
    features() {
      return this.$store.state.features;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    }
  },
  watch: {
    topiccolor(val) {
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
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
        }
        else{
          return "0%"
        }
      }
      else{
        return "33%"
      }
    },
    handledblclick(id) {
      if (this.isFull) {
        this.isFull = false
        this.fullId = 0
        this.$refs.trendg.setIsFull(false);

        this.$refs.waveg.setIsFull(false);
        this.$refs.spectrumg.setIsFull(false);
      } else {
        this.isFull = true
        this.fullId = id
        this.$refs.trendg.setIsFull(true);

        this.$refs.waveg.setIsFull(true);
        this.$refs.spectrumg.setIsFull(true);
      }
      //   console.log(id)
    },
    //绘制历史的波形图和频谱图
    drawWaveSpectrum(myinfo) {
      // console.log("myinfo");
      // console.log(myinfo);
      //单通道
      if (this.graphtype === '历史') {
        var thistime = myinfo.name;
        this.dataloading();
        var nowtime = new Date(thistime).getTime();
        var equipmentid = this.nowequipid;
        var pointName;
        //单通道
        if (this.tongdao.toString() === '1') {
          var pointid = this.nowpointid;
          pointName = this.nowtree[0].label;
        }
        //多通道
        else {
          var pointid = "";
          // console.log('nowtree');
          // console.log(this.nowtree);
          for (var i = 0; i < this.nowtree.length; ++i) {
            if (this.nowtree[i].label == myinfo.seriesName) {
              pointid = this.nowtree[i].id
            }
          }
          pointName = myinfo.seriesName;
        }
        let CancelToken = this.$axios.CancelToken;
        if (typeof this.cancelWaveAxios == 'function') {
          this.cancelWaveAxios()
        }
        // console.log("***************************************");
        // console.log(this.nowpointuuid);
        // console.log(nowtime);
        this.$axios.get("/Cepstrum/" + this.nowpointuuid + '/' + nowtime + "/CepstrumHis", {
          cancelToken: new CancelToken(c => {
            this.cancelWaveAxios = c;
          })
        }).then(res => {
          if (res.data.code === 200) {
            // console.log("获得的数据");
            // console.log(res);
            this.$emit('datasuccess');
            var wavex = '[' + res.data.data.waveValue.waveUnit.x + ']';
            var wavey = '[' + res.data.data.waveValue.waveUnit.y + ']';
            var dataX = res.data.data.waveValue.waveX;
            var dataY = {
              name: pointName,
              data: res.data.data.waveValue.waveY
            };
            var title = res.data.data.equipmentName + ' 历史';
            // let title1 = res.data.data.equipmentName + ' ' + pointName + ' ' + ' 历史';
            let title1 = pointName + ' ';
            if (dataX.length == 0) {
              this.$emit('datanull');
            }
            this.$refs.waveg.setchart(wavex, wavey, dataX, dataY, title1, thistime, null, 'history');
            var spectrumx = '[' + res.data.data.spectrumValue.spectrumUnit.x + ']';
            var spectrumy = '[' + res.data.data.spectrumValue.spectrumUnit.y + ']';
            dataX = res.data.data.spectrumValue.spectrumX
            var dataY = {
              name: pointName,
              data: res.data.data.spectrumValue.spectrumY
            };
            this.$refs.spectrumg.setchart(spectrumx, spectrumy, dataX, dataY, title1, thistime, 'history');
          } else {
            if (this.drawWaveSpectrumFlag) {
              this.$emit('datafail');
              this.drawWaveSpectrumFlag = false;
            }
            this.$refs.waveg.clearall();
            this.$refs.spectrumg.clearall();
            // console.log("波形频谱图画图！=200")
          }
        })
      }
    },
    dataloading() {
      this.$emit('dataloading');
    },
    refine(stime, etime) {
      this.dataloading();
      //console.log(stime, etime);
      if (this.tongdao == 1) {
        this.gethisdantongdaoData(this.nowequipid, this.nowpointid, stime, etime, this.unit);
      } else {
        this.gethisduotongdaoData(this.nowequipid, this.nowpointid, stime, etime, this.unit);
      }
      this.reDataZoomInterval()
    },
    //多通道历史趋势图
    gethisduotongdaoData(equipmentid, pointid, stime, etime, unit) {
      let that = this;
      let mypoint = encodeURIComponent(pointid);
      this.getline(this.$store.state.equid, pointid.split(',')[0]);
      mypoint = mypoint.replace(/%2f/gi, "%252F");
      var netinfor = '/trend/' + equipmentid + '/' + mypoint + '/' + stime + '/' + etime + '/info';
      var CancelToken = this.$axios.CancelToken;

      let isCancel = false
      if (typeof this.cancelTrendAxios == 'function') {
        this.cancelTrendAxios()
        isCancel = true
      }
      this.$refs.opPage.loadingStatus = true;
      this.$axios.get(netinfor, {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancelTrendAxios = c;
        })
      })
        .then(res => {
          this.$refs.opPage.loadingStatus = false;
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.chartdata = res.data.data;
            var flagX = '[时间]';
            var flagY = '[' + unit + ']';
            var dataX = [];
            var dataY = [];
            var back = this.backmap;

            // var title = this.chartdata.equipmentName + ' 历史';
            var title = this.textmap.get(this.nowfeature.toString()) + ' ';
            var nowdatas = this.chartdata.trendInfo;

            //添加x轴数据
            for (var i = 0; i < nowdatas.length; ++i) {
              dataX.push(timestampToTimeFormat(nowdatas[i].trendTime));
            }

            //添加y轴数据
            var nowname = this.backmap.get(this.nowfeature.toString());
            for (var i = 1; i < this.nowtree.length; ++i) {
              var nowcolor = this.colormap.get((i - 1).toString());
              var nowtext = this.nowtree[i].label;
              var newY = [];
              for (var j = 0; j < nowdatas.length; ++j) {
                var mydatas = nowdatas[j].trendValue;
                var nownum = mydatas[i - 1][nowname];
                newY.push(nownum)
              }
              dataY.push({
                name: nowtext,
                data: newY,
                color: nowcolor
              })
            }
            var myinfos = {
              name: dataX[0],
              seriesName: this.nowtree[1].label
            };
            //数据为空时显示无数据
            if (dataX.length == 0) {
              this.$emit('datanull');
              this.clearchart();
            } else {
              this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'history');
              this.drawWaveSpectrum(myinfos);
            }
          } else {
            this.$emit('datafail');
          }
        }).catch(e => {
        if(isCancel == false){
          this.$emit('datafail');
        }
        this.$refs.opPage.loadingStatus = false;
      });
    },
    getline(equid, pointid) {
      var tmp_data = null;
      let mypointid = encodeURIComponent(pointid);
      mypointid = mypointid.replace(/%2f/gi, "%252F");
      var url = `point/${encodeURIComponent(equid)}/${mypointid}/alarmLine`

      if ((typeof this.cancelAlarmLineAxios) == 'function') {
        this.cancelAlarmLineAxios()
      }

      let CancelToken = this.$axios.CancelToken;

      this.$axios.get(url, {
        cancelToken: new CancelToken(c => {
          this.cancelAlarmLineAxios = c;
        })
      }).then(res => {
        if (res.data.code == 200) {
          //   console.log('line data', res.data.data)
          var lines = res.data.data;
          tmp_data = []
          if (lines.judgeAlarmType == 0) {
            tmp_data.push({
              name: '高报',
              yAxis: lines.alarmHigh
            })
            tmp_data.push({
              name: '高高报',
              yAxis: lines.alarmHighHigh
            })
          } else if (lines.judgeAlarmType == 1) {
            tmp_data.push({
              name: '低报',
              yAxis: lines.alarmLow
            })
            tmp_data.push({
              name: '低低报',
              yAxis: lines.alarmLowLow
            })
          } else {
            tmp_data.push({
              name: '高报',
              yAxis: lines.alarmHigh
            })
            tmp_data.push({
              name: '高高报',
              yAxis: lines.alarmHighHigh
            })
            tmp_data.push({
              name: '低报',
              yAxis: lines.alarmLow
            })
            tmp_data.push({
              name: '低低报',
              yAxis: lines.alarmLowLow
            })
          }
          this.$refs.trendg.aline = tmp_data;
        }

      });
    },
    clearchart() {
      var CancelToken = this.$axios.CancelToken;
      this.$refs.trendg.clearall();
      this.$refs.waveg.clearall();
      this.$refs.spectrumg.clearall();
    },
    reDataZoomInterval(){
      this.zoomDataIntervalBegin = []
      this.zoomDataIntervalEnd = []
    },
    cancelRefine() {
      // console.log("细化取消");
      if (this.tongdao == 1) {
        this.gethisdantongdaoData(this.nowequipid, this.nowpointid, this.stime, this.etime, this.unit);
      } else {
        this.gethisduotongdaoData(this.nowequipid, this.nowpointid, this.stime, this.etime, this.unit);
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
        }
        // console.log("测试reZoomData this.$refs.trends.length",this.$refs.trendgs.length)
        if (this.zoomDataIntervalBegin.length === 0){
          this.zoomDataIntervalBegin = this.$refs.trendg.mychart.getOption().useDataZoomBegin
          this.zoomDataIntervalEnd = this.$refs.trendg.mychart.getOption().useDataZoomEnd
        }
        this.$refs.trendg.dataZoom(zoomBegin,zoomEnd)
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
      }
      let reOriginalSeries3 = JSON.parse(JSON.stringify(this.$refs.trendg.mychart.getOption().OriginalSeries))
      let reOption3 = JSON.parse(JSON.stringify(this.$refs.trendg.mychart.getOption()))
      this.$refs.trendg.reDataZoom(reOriginalSeries3,reOption3,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
    },
    updateShowOpPage(val) {
      this.showOpPage = val;
    },
    //多通道历史图谱
    drawhistoryduotongdao(equipmentid, pointid, pointtree, feature, stime, etime, unit) {
      this.tongdao = 0;
      this.graphtype = '历史';
      this.nowequipid = equipmentid;
      this.nowpointid = pointid;
      this.nowtree = pointtree;
      this.nowfeature = feature;
      this.nowpointuuid = pointtree[1].pointUuid;
      this.unit = unit;
      this.stime = stime;
      this.etime = etime;
      // console.log("多历史");
      // console.log(equipmentid,pointid,stime,etime );
      this.gethisduotongdaoData(equipmentid, pointid, stime, etime, unit);
    },
    //初始化多通道实时图谱
    getrealduotongdao(equipmentid, pointid, pointtree, feature, unit) {
      let that = this;
      //帮助后面添加数据
      this.nowequipid = equipmentid;
      this.nowpointid = pointid;
      this.nowtree = pointtree;
      this.nowfeature = feature;
      this.unit = unit;
      // console.log(this.unit,'this.unit')
      if (pointtree[1])
        this.nowpointuuid = pointtree[1].pointUuid;
      this.tongdao = 0;
      this.graphtype = '实时';
      var CancelToken = this.$axios.CancelToken;
      this.$axios.get("/CepstrumRt/" + this.nowpointuuid + "/real_time")
        .then(res => {
          if (res.data.code == 200) {
            // console.log("获得的数据");
            // console.log(res);
            this.$emit('datasuccess');
            this.chartdata = res.data.data;
            var pointname = this.nowtree[1].label;
            // var title = this.chartdata.equipmentName + ' 实时';
            var title = this.textmap.get(this.nowfeature.toString());
            // let title1 = this.chartdata.equipmentName + ' ' + this.nowtree[1].label + ' 实时';
            let title1 = this.nowtree[1].label;
            // 初始化趋势图数据
            var flagX = '[时间]';
            var flagY = '[' + this.unit + ']';
            var dataX = [];
            var dataY = [];
            var back = this.backmap;
            this.nowtree = pointtree;

            //初始化趋势图数据
            //添加x轴
            var newX = timestampToTimeFormat(this.chartdata.trendTime);
            dataX.push(newX);
            //添加y轴
            // console.log("开始画y轴");
            var nowname = this.backmap.get(this.nowfeature.toString());
            for (var i = 1; i < this.nowtree.length; ++i) {
              var nowtext = this.nowtree[i].label;
              var nowcolor = this.colormap.get((i - 1).toString());
              var nownum = this.chartdata.trendValue[i - 1][nowname];
              //console.log(nownum);
              dataY.push({
                name: nowtext,
                data: [nownum],
                color: nowcolor
              })
            }

            //初始化波形图数据
            var wavedata = this.chartdata.waveValue;
            var wavex = '[' + wavedata.waveUnit.x + ']';
            var wavey = '[' + wavedata.waveUnit.y + ']';
            var wavedataX = wavedata.waveX;
            var wavedataY = {
              name: pointname,
              data: wavedata.waveY
            };

            //初始化频谱图数据
            var spectrumdata = this.chartdata.spectrumValue;
            var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']';
            var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']';
            var spectrumdataX = spectrumdata.spectrumX;
            var spectrumdataY = {
              name: pointname,
              data: spectrumdata.spectrumY
            };

            //数据为空时显示无数据
            if (dataX.length == 0 || wavedataX.length == 0 || spectrumdataX.length == 0) {
              this.$emit('datanull');
            } else {
              //画图
              this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'real');
              this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title1, newX, null, 'real');
              this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title1, newX, 'real')
            }
          } else {
            if (this.getrealduotongdaoFlag) {
              this.$emit('datafail');
              this.gethisduotongdaoFlag = false;
            }
            // that.$message.error(res.data.message);
          }
        }).catch(e => {
        if (this.getrealduotongdaoFlag2) {
          this.$emit('datafail');
          this.getrealduotongdaoFlag2 = false
        }
      });
    },
    //多通道实时图谱添加数据
    addrealduotongdao() {
      let that = this;
      var CancelToken = this.$axios.CancelToken;
      this.$axios.get("/CepstrumRt/" + this.nowpointuuid + "/real_time", {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          this.cancel = c;
        })
      })
        .then(res => {
          if (res.data.code === 200) {
            // console.log("获得的数据");
            // console.log(res);
            // this.$emit('datasuccess');
            this.chartdata = res.data.data;
            // var pointname = this.chartdata.equipmentName + ' ' +  this.textmap.get(this.nowfeature.toString());
            var pointname = this.nowtree[1].label;
            var title = this.chartdata.equipmentName + ' 实时';
            // let title1 = this.chartdata.equipmentName + ' ' + this.nowtree[1].label + ' 实时';
            let title1 = this.nowtree[1].label;
            //添加趋势图数据
            //添加x轴
            var newX = timestampToTimeFormat(this.chartdata.trendTime);
            //添加y轴
            var newY = [];
            var nowname = this.backmap.get(this.nowfeature.toString());
            for (var i = 1; i < this.nowtree.length; ++i) {
              var nownum = this.chartdata.trendValue[i - 1][nowname];
              newY.push(nownum);
            }

            //添加波形图数据
            var wavedata = this.chartdata.waveValue;
            var wavex = '[' + wavedata.waveUnit.x + ']';
            var wavey = '[' + wavedata.waveUnit.y + ']';
            var wavedataX = wavedata.waveX;
            var wavedataY = {
              name: pointname,
              data: wavedata.waveY
            };

            //添加频谱图数据
            var spectrumdata = this.chartdata.spectrumValue;
            var spectrumx = '[' + spectrumdata.spectrumUnit.x + ']';
            var spectrumy = '[' + spectrumdata.spectrumUnit.y + ']';
            var spectrumdataX = spectrumdata.spectrumX;
            var spectrumdataY = {
              name: pointname,
              data: spectrumdata.spectrumY
            };
            this.$refs.trendg.changechart(newX, newY);
            this.$refs.waveg.setchart(wavex, wavey, wavedataX, wavedataY, title1, newX, null, 'real');
            this.$refs.spectrumg.setchart(spectrumx, spectrumy, spectrumdataX, spectrumdataY, title1, newX, 'real')
          } else {
            if (this.addrealduotongdaoFlag) {
              this.$emit('datafail')
              this.addrealduotongdaoFlag = false;
            }
            // that.$message.error(res.data.message);
          }
        }).catch(e => {
        if (this.addrealduotongdaoFlag2) {
          this.$emit('datafail')
          this.addrealduotongdaoFlag2 = false;
        }
      });
    },

    cancelRequest() {
      if (typeof this.source === 'function') {
        this.source('终止请求')
      }
    },
    infoname(myname) {
      this.$emit('setinfoname', myname);
    },
  }
}
</script>

<style lang="scss">

.cepstrum-graphjibeng {
  --conbgcolor: #0D0F1F;
  --leftconbgcolor: #222331;
  --buttoncolor: #1677FF;
  --textcolor: #ffffff;
  background-color: var(--conbgcolor);
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

  .divgraph {
    height: 33.3%;
    width: 100%;
  }

  .graph {
    height: 100%;
    width: 100%;
    //margin-bottom: 1px;
  }
}
</style>
