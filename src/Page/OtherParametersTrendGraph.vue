<template>
  <div class="other-parameters-trend-graphjiebng" ref="ui">
    <div class='tupu' id='lefttupu'>
      <div :style="{height : highexe(1) , width:'100%'}" v-show="fullId===1||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(1)">
        <trend-graph ref='trendt' @chartinfo="trendGraphToDrawWaveSpectrum" class="graph" @refine="refine" @cancelRefine="cancelRefine" @cancelFull="handledblclick(1)" @dataZoom="dataZoom" @reDataZoom="reDataZoom"></trend-graph>
      </div>
      <div :style="{height : highexe(2) , width:'100%'}" v-show="fullId===2||fullId===0" @dblclick="$store.state.dblclickEnabled && handledblclick(2)">
        <trend-graph ref='trendp' @chartinfo="spendTrendGraphToDrawWaveSpectrum" class="graph" @refine="refine" @cancelRefine="cancelRefine" @cancelFull="handledblclick(2)" @dataZoom="dataZoom" @reDataZoom="reDataZoom"></trend-graph>
      </div>
    </div>

    <!--  隐藏操作页按钮  -->
    <OpHideButton
      :showOpPage="showOpPage"
      @updateShowOpPage="updateShowOpPage">
    </OpHideButton>

    <div class='op' id='rightop' v-show="showOpPage">
      <other-parameters-trend-graph-op-page :style="{height: '100%'}"
                                            @cleanChart1="cleanChart1"
                                            @cleanChart2="cleanChart2"
                                            @getRealChart1="getRealChart1"
                                            @getRealChart2="getRealChart2"
                                            @addRealChart1="addRealChart1"
                                            @addRealChart2="addRealChart2"
                                            @getHistoryChart1="getHistoryChart1"
                                            @getHistoryChart2="getHistoryChart2"
                                            @reDataZoomInterval="reDataZoomInterval"
                                            ref="opPage">
      </other-parameters-trend-graph-op-page>
    </div>
  </div>
</template>

<script>
import OtherParametersTrendGraphOpPage from '../components/OtherParametersTrendGraph/OtherParametersTrendGraphOpPage';
import TrendGraph from "../components/ComUtils/TrendGraph";
import keyPressSignalMixin from '@/mixins/keyPressSignalMixin'
import {timestampToTimeFormat} from "../components/ComUtils/TimeFormat";
import OpHideButton from "../components/ComUtils/OpHideButton";

export default {
  name: "OtherParametersTrendGraph",
  mixins: [keyPressSignalMixin],
  components: {
    TrendGraph,
    OtherParametersTrendGraphOpPage,
    OpHideButton,
  },
  data() {
    return {
      stime: null,
      etime: null,
      fullId: 0,
      isFull: false,
      cancelAlarmLineAxios:[null,null],
      cancel1others:null,
      cancel2others:null,
      showOpPage: true,
      unitname: '机泵专用图谱-其他参数趋势图',
      nowdata1: null,
      nowdata2: null,
      nowequid1: null,
      nowequid2: null,
      nowpointid1: null,
      nowpointid2: null,
      colormap: null,
      chartdata1: null,
      chartdata2: null,
      map: {
        '4': "温度",
        '100000': "轴位移",
        '7': "撞击次数",
        '3': "压力",
        '5': "流量",
        '6': "其他",
      },
      getRealChart1Flag: true, getRealChart2Flag: true, addRealChart2Flag: true, addRealChart1Flag: true,
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
  },
  computed:{
    equid(){
      return this.$store.state.equid;
    },
    topiccolor(){
      return this.$store.state.topiccolor;
    }
  },
  watch:{
    topiccolor(val){
      this.mycolor=this.$store.state.textcolor;
      this.$refs.ui.style.setProperty('--text-color', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--conbgcolor',this.$store.state.conbgcolor);
      this.$refs.ui.style.setProperty('--leftconbgcolor',this.$store.state.leftconbgcolor);
      this.$refs.ui.style.setProperty('--buttoncolor',this.$store.state.buttoncolor);
    }
  },
  mounted() {
    this.$emit('changename',this.unitname);
    this.mycolor=this.$store.state.textcolor;
    this.$refs.ui.style.setProperty('--textcolor',this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--conbgcolor',this.$store.state.conbgcolor);
    this.$refs.ui.style.setProperty('--leftconbgcolor',this.$store.state.leftconbgcolor);
    this.$refs.ui.style.setProperty('--buttoncolor',this.$store.state.buttoncolor);
  },
  methods:{
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
        return "50%"
      }
    },
    handledblclick(id){
      if(this.isFull){
        this.isFull = false;
        this.fullId = 0;
        this.$refs.trendt.setIsFull(false);
        this.$refs.trendp.setIsFull(false);
      }
      else{
        this.isFull = true;
        this.fullId = id;
        this.$refs.trendt.setIsFull(true);
        this.$refs.trendp.setIsFull(true);
      }
      console.log(id);
    },
    trendGraphToDrawWaveSpectrum(myinfo){
      this.$refs.trendp.drawMarkLine(myinfo.name,this.$refs.trendt.PrimarySecondary.isMark)
    },
    refine(stime,etime){
      this.getHisChart1(this.nowequid1,this.nowpointid1,stime,etime,this.nowdata1);
      this.getHisChart2(this.nowequid2,this.nowpointid2,stime,etime,this.nowdata2);
      this.reDataZoomInterval();

    },
    getHisChart1(equipmentid,pointid,stime,etime,pointtree){
      equipmentid = encodeURIComponent(equipmentid);
      this.getline(this.$store.state.equid,pointid.split(',')[0],0);
      pointid=encodeURIComponent(pointid);
      pointid=pointid.replace(/%2f/gi,"%252F");
      //单位
      var flag;
      if(pointtree[1].channelType == 4){
        flag= "[°C]";
      }
      else if(pointtree[1].channelType == 3){
        flag= "[KPa]";
      }
      else{
        flag= "[m3/min]";
      }
      var CancelToken=this.$axios.CancelToken;
      if(typeof this.cancel1others=='function'){
        this.cancel1others()
      }
      this.$refs.opPage.loadingStatus = true;
      this.$axios.get("/proctrend/" + equipmentid + "/" + pointid + "/" + stime + "/" + etime +"/his",{
        cancelToken: new CancelToken(c=>{
          this.cancel1others = c;
        })
      })
        .then(res => {
          this.$refs.opPage.loadingStatus = false;
          if(res.data.code === 200){
            this.$emit('datasuccess');
            this.chartdata1 = res.data.data.trendValues;

            var unordered = this.chartdata1;
            const ordered = {};
            Object.keys(unordered).sort().forEach(function(key){
              ordered[key] = unordered[key];
            });
            this.chartdata1 = ordered;

            var x = Object.keys(this.chartdata1);
            var y = Object.values(this.chartdata1);
            //初始化趋势图的数据
            var flagX='[时间]';
            let flagY= `[${res.data.data.unit[0]}]`;

            var dataX = [];
            var dataY = [];
            var title=this.map[this.nowdata1[1].channelType] + ' ';
            //添加X轴数据
            for(var i = 0;i < x.length;i++){
              dataX.push(timestampToTimeFormat(x[i]));
            }
            //添加Y轴数据
            for (var i = 1; i < this.nowdata1.length;++i){
              var nowcolor = this.colormap.get((i-1).toString());
              var nowtext = this.nowdata1[i].label;
              var newY = [];
              for(var j=0;j<y.length;++j){
                var nownum=y[j][0][i-1];
                if(this.nowdata1.length==2){
                  nownum=y[j][0];
                }
                newY.push(nownum);
              }
              dataY.push({
                name:nowtext,
                data:newY,
                color:nowcolor
              })
            }
            this.$refs.trendt.setchart(flagX,flagY,dataX,dataY,title,'history');
          }
          else{
            this.$emit('datafail');
          }
        }).catch(e => {
          this.$emit('datafail');
          this.$refs.opPage.loadingStatus = false;
      });
    },
    getHisChart2(equipmentid,pointid,stime,etime,pointtree){
      var flag;
      if(pointtree[1].channelType == 4){
        flag="[°C]";
      }
      else if(pointtree[1].channelType == 3){
        flag= "[KPa]";
      }
      else{
        flag= "[m3/min]";
      }
      equipmentid = encodeURIComponent(equipmentid);
      this.getline(this.$store.state.equid,pointid.split(',')[0],1);
      pointid=encodeURIComponent(pointid);
      pointid=pointid.replace(/%2f/gi,"%252F");
      this.$refs.opPage.loadingStatus = true;
      var CancelToken=this.$axios.CancelToken;
      if(typeof this.cancel2others=='function'){
        this.cancel2others()
      }
      this.$axios.get("/proctrend/" + equipmentid + "/" + pointid + "/" + stime + "/" + etime + "/his",{
        cancelToken: new CancelToken(c=>{
          this.cancel2others = c;
        })
      })
        .then(res => {
          this.$refs.opPage.loadingStatus = false;
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.chartdata2 = res.data.data.trendValues;

            var unordered = this.chartdata2;
            const ordered = {};
            Object.keys(unordered).sort().forEach(function (key) {
              ordered[key] = unordered[key];
            });
            this.chartdata2 = ordered;

            var x = Object.keys(this.chartdata2);
            var y = Object.values(this.chartdata2);
            // 初始化趋势图数据
            var flagX = '[时间]';
            let flagY = `[${res.data.data.unit[0]}]`;
            // var flagY = flag;
            // var flagY = '[' + this.$store.state.features[99][this.nowdata2[1].channelType-3].unit + ']';
            var dataX = [];
            var dataY = [];
            // var title = this.$store.state.equName + " " + this.map[this.nowdata2[1].channelType] + ' 历史';
            var title = this.map[this.nowdata2[1].channelType] + ' ';
            var nowdatas = this.chartdata2.trendInfo;
            //添加x轴数据
            for (var i = 0; i < x.length; i++) {
              dataX.push(timestampToTimeFormat(x[i]));
            }
            //添加y轴数据
            for (var i = 1; i < this.nowdata2.length; ++i) {
              var nowcolor = this.colormap.get((i - 1).toString());
              var nowtext = this.nowdata2[i].label;
              var newY = [];
              for (var j = 0; j < y.length; ++j) {
                var nownum = y[j][0][i - 1];
                if (this.nowdata2.length == 2) {
                  nownum = y[j][0];
                }
                newY.push(nownum);
              }
              dataY.push({
                name: nowtext,
                data: newY,
                color: nowcolor
              })
            }
            //console.log(dataX, dataY);
            this.$refs.trendp.setchart(flagX, flagY, dataX, dataY, title, 'history');
          } else {
            this.$emit('datafail');
          }
        }).catch(e => {
        this.$refs.opPage.loadingStatus = false;
        this.$emit('datafail');
      });

    },
    reDataZoomInterval(){
      this.zoomDataIntervalBegin = []
      this.zoomDataIntervalEnd = []
    },
    getline(equid,pointid,pos){
      var tmp_data= null;
      let mypointid = encodeURIComponent(pointid);
      mypointid = mypointid.replace(/%2f/gi,"%252F");
      var url = `point/${encodeURIComponent(equid)}/${mypointid}/alarmLine`
      if((typeof this.cancelAlarmLineAxios[pos]) == 'function'){
        this.cancelAlarmLineAxios[pos]()
      }
      let CancelToken = this.$axios.CancelToken;
      this.$axios.get(url,{
        cancelToken: new CancelToken(c=>{
          this.cancelAlarmLineAxios[pos] = c;
        })
      }).then(res=>{
        if(res.data.code == 200){
          var lines= res.data.data;
          tmp_data = []
          if(lines.judgeAlarmType == 0){
            tmp_data.push({
              name:'高报',
              yAxis:lines.alarmHigh
            })
            tmp_data.push({
              name:'高高报',
              yAxis:lines.alarmHighHigh
            })
          }
          else if(lines.judgeAlarmType == 1){
            tmp_data.push({
              name:'低报',
              yAxis:lines.alarmLow
            })
            tmp_data.push({
              name:'低低报',
              yAxis:lines.alarmLowLow
            })
          }
          else{
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
          if(pos == 0){
            this.$refs.trendt.aline = tmp_data;
          }
          else if(pos == 1){
            this.$refs.trendp.aline = tmp_data;
          }
        }
      });
    },
    cancelRefine(){
      this.getHisChart1(this.nowequid1,this.nowpointid1,this.stime,this.etime,this.nowdata1);
      this.getHisChart2(this.nowequid2,this.nowpointid2,this.stime,this.etime,this.nowdata2);
      this.reDataZoomInterval();
    },
    dataZoom(zoomBegin,zoomEnd){
      if(zoomBegin != null && zoomEnd != null){
        if(this.nowTrend === 1){
          if(this.zoomDataIntervalBegin.length === 0){
            this.zoomDataIntervalBegin = this.$refs.trendt.mychart.getOption().useDataZoomBegin;
            this.zoomDataIntervalEnd = this.$refs.trendt.mychart.getOption().useDataZoomEnd;
          }
          this.$refs.trendt.dataZoom(zoomBegin,zoomEnd);
          this.$refs.trendp.dataZoom(zoomBegin,zoomEnd);
        }
        if(this.zoomDataIntervalBegin.length === 0){
          this.zoomDataIntervalBegin = this.$refs.trendt.mychart.getOption().useDataZoomBegin
          this.zoomDataIntervalEnd = this.$refs.trendt.mychart.getOption().useDataZoomEnd
        }
        this.$refs.trendt.dataZoom(zoomBegin,zoomEnd)
        this.$refs.trendp.dataZoom(zoomBegin,zoomEnd)
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
        let reOriginalSeries = JSON.parse(JSON.stringify(this.$refs.trendt.mychart.getOption().OriginalSeries))
        let reOption = JSON.parse(JSON.stringify(this.$refs.trendt.mychart.getOption()))
        this.$refs.trendt.reDataZoom(reOriginalSeries,reOption,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
        this.$refs.trendp.reDataZoom(reOriginalSeries,reOption,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
      }
      let reOriginalSeries3 = JSON.parse(JSON.stringify(this.$refs.trendt.mychart.getOption().OriginalSeries))
      let reOption3 = JSON.parse(JSON.stringify(this.$refs.trendt.mychart.getOption()))
      this.$refs.trendt.reDataZoom(reOriginalSeries3,reOption3,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
      this.$refs.trendp.reDataZoom(reOriginalSeries3,reOption3,this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1],this.zoomDataIntervalEnd[this.zoomDataIntervalEnd.length - 1],flag)
    },
    spendTrendGraphToDrawWaveSpectrum(myinfo) {
      this.$refs.trendt.drawMarkLine(myinfo.name,this.$refs.trendp.PrimarySecondary.isMark)
    },
    updateShowOpPage(val) {
      this.showOpPage = val;
    },
    cleanChart1() {
      this.$refs.trendt.clearall();
    },
    cleanChart2() {
      this.$refs.trendp.clearall();
    },
    //绘制实时图像
    getRealChart1(equipmentid, pointid, pointtree) {
      this.$refs.trendt.clearall();
      this.nowequid1 = equipmentid;
      this.nowpointid1 = pointid;
      this.nowdata1 = pointtree;
      equipmentid = encodeURIComponent(equipmentid);
      pointid = encodeURIComponent(pointid);
      pointid=pointid.replace(/%2f/gi,"%252F");
      this.$axios.get("/proctrend/" + equipmentid + "/" + pointid + "/rt")
        .then(res => {
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.chartdata1 = res.data.data;
            var firstdata = this.chartdata1[this.nowdata1[1].id];
            // 初始化趋势图数据
            var flagX = '[时间]';
            var flagY = '[' + firstdata.unit + ']';
            var dataX = [];
            var dataY = [];
            var title = this.map[this.nowdata1[1].channelType];
            dataX.push(timestampToTimeFormat(firstdata.time));
            for (var i = 1; i < this.nowdata1.length; ++i) {
              dataY.push({
                name: this.nowdata1[i].label,
                data: [this.chartdata1[this.nowdata1[i].id].value],
                color: this.colormap.get((i - 1).toString())
              })
            }
            this.$refs.trendt.setchart(flagX, flagY, dataX, dataY, title, 'real');
          } else {
            this.$emit('datafail');
          }
        }).catch(e => {
        this.$emit('datafail');
      });

    },
    getRealChart2(equipmentid, pointid, pointtree) {
      this.$refs.trendp.clearall();
      this.nowequid2 = equipmentid;
      this.nowpointid2 = pointid;
      this.nowdata2 = pointtree;
      equipmentid = encodeURIComponent(equipmentid);
      pointid = encodeURIComponent(pointid);
      pointid=pointid.replace(/%2f/gi,"%252F");
      this.$axios.get("/proctrend/" + equipmentid + "/" + pointid + "/rt")
        .then(res => {
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.chartdata2 = res.data.data;
            var firstdata = this.chartdata2[this.nowdata2[1].id];
            // 初始化趋势图数据
            var flagX = '[时间]';
            var flagY = '[' + firstdata.unit + ']';
            // var flagY = '[' + this.$store.state.features[99][this.nowdata2[1].channelType-3].unit + ']';
            var dataX = [];
            var dataY = [];
            // var title = this.$store.state.equName + " " + this.map[this.nowdata2[1].channelType] + ' 实时';
            var title = this.map[this.nowdata2[1].channelType];
            dataX.push(timestampToTimeFormat(firstdata.time));
            for (var i = 1; i < this.nowdata2.length; ++i) {
              dataY.push({
                name: this.nowdata2[i].label,
                data: [this.chartdata2[this.nowdata2[i].id].value],
                color: this.colormap.get((i - 1).toString())
              })
            }
            this.$refs.trendp.setchart(flagX, flagY, dataX, dataY, title, 'real');
          } else {
            this.$emit('datafail');
          }
        }).catch(e => {
        this.$emit('datafail');
      });

    },
    //给图谱中添加数据
    addRealChart1() {
      var equipmentid = this.nowequid1;
      var pointid = this.nowpointid1;
      equipmentid = encodeURIComponent(equipmentid);
      pointid = encodeURIComponent(pointid);
      pointid=pointid.replace(/%2f/gi,"%252F");
      this.$axios.get("/proctrend/" + equipmentid + "/" + pointid + "/rt")
        .then(res => {
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.chartdata1 = res.data.data;
            var dataX = [];
            var dataY = [];
            dataX.push(timestampToTimeFormat(this.chartdata1[this.nowdata1[1].id].time));
            for (var i = 1; i < this.nowdata1.length; ++i) {
              dataY.push(this.chartdata1[this.nowdata1[i].id].value)
            }
            this.$refs.trendt.changechart(dataX, dataY);
          } else {
            if (this.addRealChart1Flag){
              this.$emit('datafail');
              this.addRealChart1Flag = false;
            }
          }
        }).catch(e => {
        if (this.getRealChart1Flag){
          this.$emit('datafail');
          this.getRealChart1Flag = false;
        }
      });
    },
    addRealChart2() {
      var equipmentid = this.nowequid2;
      var pointid = this.nowpointid2;
      equipmentid = encodeURIComponent(equipmentid);
      pointid = encodeURIComponent(pointid);
      pointid=pointid.replace(/%2f/gi,"%252F");
      this.$axios.get("/proctrend/" + equipmentid + "/" + pointid + "/rt")
        .then(res => {
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.chartdata2 = res.data.data;
            var dataX = [];
            var dataY = [];
            dataX.push(timestampToTimeFormat(this.chartdata2[this.nowdata2[1].id].time));
            for (var i = 1; i < this.nowdata2.length; ++i) {
              dataY.push(this.chartdata2[this.nowdata2[i].id].value)
            }
            this.$refs.trendp.changechart(dataX, dataY);
          } else {
            if (this.addRealChart2Flag){
              this.$emit('datafail');
              this.addRealChart2Flag = false;
            }
          }
        }).catch(e => {
        if (this.addRealChart2Flag){
          this.$emit('datafail');
          this.addRealChart2Flag = false;
        }
      });
    },
    //绘制历史图
    getHistoryChart1(equipmentid, pointid, stime, etime, pointtree) {
      this.$refs.trendt.clearall();
      this.nowequid1 = equipmentid;
      this.nowpointid1 = pointid;
      this.nowdata1 = pointtree;
      this.stime = stime;
      this.etime = etime;
      this.getHisChart1(equipmentid, pointid, stime, etime, pointtree);
    },
    getHistoryChart2(equipmentid, pointid, stime, etime, pointtree) {
      this.$refs.trendp.clearall();
      this.nowequid2 = equipmentid;
      this.nowpointid2 = pointid;
      this.nowdata2 = pointtree;
      this.stime = stime;
      this.etime = etime;
      this.getHisChart2(equipmentid, pointid, stime, etime, pointtree);
    },

    infoname(myname) {
      this.$emit('setinfoname', myname);
    },
    dataloading() {
      this.$emit('dataloading');
    },
  }
}
</script>

<style lang="scss">

.other-parameters-trend-graphjiebng {
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
    margin: 10px 2px 0 2px;
    float: left;
    width: calc(100% - 300px);
    height: calc(100% - 10px);
  }

  .op {
    overflow: hidden;
    width: 290px;
    height: calc(100% - 10px);
    margin-top: 10px;
    float: right;
    background-color: var(--leftconbgcolor);
  }

  .graph {
    height: 100%;
    width: 100%;
    //margin-bottom: 1px;
  }
}
</style>
<script setup lang="ts">
</script>
