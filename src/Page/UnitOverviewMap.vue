<template>
  <div class="UnitOverviewMapjibeng" ref="ui">
    <div class="graphs" id="lefttupu">
      <div class="ingraphs"
           v-if="overviewType === '振动概貌图'"
           ref="needmid"
           :style="{height: mapheight,backgroundColor: nowImageBackground, width:'100%'}"
           id="midtupu"
           @contextmenu.prevent.stop="handleRightClick($event)">
        <UnitOverviewGrap ref="unitOverview" :nowtimeStatic="nowtimeStatic"  :get-scroll-value="getScrollValue" @graphImageBackground="graphImageBackground"
                          @gomid="gomid" @imageWidth="imageWidth" @imageheight="imageheights"
                          @changthispostion='changthispostion'
                          @dataloading="dataloading" @datasuccess ="datasuccess"
                          @datanull="datanull" @datafail="datafail">
        </UnitOverviewGrap>
      </div>

      <OverViewIframe class="other-graph"
                      v-if="overviewType !== '振动概貌图'"
                      :overviewType="overviewType"
                      :mapheight="mapheight"
                      :nowImageBackground="nowImageBackground"
                      :initequid="initequid">
      </OverViewIframe>
      <div class="divGraph" :style="{height: graphheight}">
        <TrendGraph ref='trendg'
                    v-show="show"
                    @historyInformation="historyInformation"
                    @chartinfo="chartinfo"
                    @iscan="myiscan"
                    :nowtimeStatic="nowtimeStatic"
                    @refine="refine"
                    @cancelRefine="cancelRefine"
                    @dataZoom="dataZoom"
                    @reDataZoom="reDataZoom"></TrendGraph>
      </div>
    </div>

    <!--  隐藏操作页按钮  -->
    <OpHideButton
      :showOpPage="showOpPage"
      @updateShowOpPage="updateShowOpPage">
    </OpHideButton>

    <div class='OpPage' v-show="showOpPage">
      <UnitOverviewMapOpPage
        @static="nowstatic"
        @cleanChart="clearchart"
        @showgraph="showgraph"
        @overviewChange="overviewChange"
        @notshowgraph="notshowgraph"
        @DramHistoryGrap="iDramHistorygrap"
        @DramOtherHistoryGrap="iDramotherHistoryGrap"
        @DrawrealGrap="iDrawrealgrap"
        @AddrealGrap="Addrealgrap"
        @DrawoutherrealGrap="iDrawoutherrealGrap"
        @AddoutherrealGrap="AddoutherrealGrap"
        @reDataZoomInterval="reDataZoomInterval"
        ref="opPage"
      ></UnitOverviewMapOpPage>
    </div>

  </div>
</template>

<script>
import UnitOverviewMapOpPage from "../components/UnitOverviewMap/UnitOverviewMapOpPage";
import TrendGraph from "../components/ComUtils/TrendGraph";
import UnitOverviewGrap from "../components/ComUtils/UnitOverviewGrap";
import keyPressSignalMixin from '@/mixins/keyPressSignalMixin'
import keepAliveMixin from "@/mixins/keepAliveMixin";
import OverViewIframe from "@/components/ComUtils/OverViewIframe";
import {timestampToTimeFormat} from "../components/ComUtils/TimeFormat";
import OpHideButton from "@/components/ComUtils/OpHideButton";

export default {
  name: "UnitOverviewMap",
  components: {UnitOverviewGrap, TrendGraph, UnitOverviewMapOpPage, OverViewIframe, OpHideButton},
  mixins: [keepAliveMixin,keyPressSignalMixin],

  data() {
    return {
      stime: null,
      overviewType: this.$store.state.OverviewDisplayMode == 2 ? '工艺概貌图' : '振动概貌图',
      etime: null,
      nowunit:'',
      imageheight: '',
      //  imageWidth: '',
      equipmentsName: '',
      time: '',
      revInfo: {
        revName: '',
        revValue: '',
      },

      codeBase: '',
      graphDataTime: '',

      show: false,
      mapheight: '100%',
      graphheight: '0%',
      unitname: '机泵专用图谱-机组概貌图',
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
      showOpPage: true,
      nowtimeStatic: null,
      rev: null,
      iscan:false,
      nowImageBackground:'',
      // chartdata:null,

      //细化
      lastpointsid:null,
      lastfeature:null,

      imageWidths:0,
      nowimageheights:0,
      isMenuShow:false,
      y:0,
      x:0,
      realVibrationQuestFlag: false, //振动数据首次请求是否完成
      realVibrationQuest: true, //振动测点实时请求
      realOtherQuestFlag: false, //工艺量测点首次请求是否完成
      realOtherQuest: true, //工艺量测点实时请求
      ProcessOverviewIP: this.changeUrl(this.$store.state.ProcessOverviewIP),
      threeDimensionalOverviewIP: this.changeUrl(this.$store.state.threeDimensionalOverviewIP),
      // 数据获取失败提示只执行一次
      Drawrealgrapflag: true,
      Addrealgrapflag: true,
      // DrawoutherrealGrap: true,
      Drawrealgrapflag2 : true, DrawoutherrealGrapFlag2: true,
      initequid: this.$store.state.equid,

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

  computed:{
    overviewDisplayMode(){
      return this.$store.state.OverviewDisplayMode
    },
    show1() {
      return Number(this.showOpPage) + Number(this.$store.state.showOp);
    },
    getequName() {
      return this.$store.state.equName;
    },
    equid() {
      return this.$store.state.equid;
    },
    features() {
      return this.$store.state.features;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    },
    uid() {
      return this.$store.state.uid;
    },
    username() {
      return this.$store.state.username;
    },
    theme(){
      if (this.$store.state.topiccolor === 'white' || this.$store.state.topiccolor === 'simple-white'){
        return 'light'
      }else {
        return 'dark'
      }
    }
  },

  mounted() {

    this.$emit('changename', this.unitname);
    // console.log("机泵啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊");
    //  this.getImage(this.equid);
    this.mycolor = this.$store.state.textcolor;
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
    this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
    this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
    window.addEventListener('message', (event) => {
      console.log('%cGOT MSG', 'background:green;color:#fff')
      console.log('origin', event.origin)
      console.log('data', event.data.pointName)
      if (event.data.pointName) {
        let pointIdString = encodeURIComponent(event.data.pointName);
        pointIdString = pointIdString.replace(/%2f/gi,"%252F");
        this.$router.push({path: '/OtherParametersTrendGraph', query: {pointId: pointIdString}});
      }
      // window.location.href = event.data.url
    }, false)
  },
  beforeDestroy() {
    if(this.isMenuShow){
      window.removeEventListener('click',this.hideTheMenu)
      window.removeEventListener('contextmenu',this.hideTheMenu)
    }
    clearInterval(this.myinterval)
  },
  destroyed() {
    window.removeEventListener('click',this.hideTheMenu)
    window.removeEventListener('contextmenu',this.hideTheMenu)
    if(this.myinterval) {
      clearInterval(this.myinterval)
    }
  },
  watch:{
    overviewDisplayMode(val){
      this.overviewType = val == 2 ? '工艺概貌图' : '振动概貌图'
    },
    show1() {

    },
    topiccolor(val) {
      this.mycolor = this.$store.state.textcolor;
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
      this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
      this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
    },
    equid(val) {
      if(!this.activatedFlag) return ;
      console.log('机泵', this.$refs.iframe);
      if (this.$route.path == '/UnitOverviewMap' && this.overviewType == '3D图') {
        this.$refs.iframe.contentWindow.postMessage(val, `${this.threeDimensionalOverviewIP}`)
      }
    }
  },
  methods:{
    handleRightClick(event) {
      // console.log(event)
      this.x = event.pageX
      this.y = event.pageY
      if (!this.isMenuShow) {
        this.isMenuShow = true
        this.showContextMenu()
      }
    },
    showContextMenu() {

      window.addEventListener('click', this.hideTheMenu)
      window.addEventListener('contextmenu', this.hideTheMenu)
    },
    getScrollValue(){
      let value = [this.$refs.needmid.scrollLeft,this.$refs.needmid.scrollTop,this.$refs.needmid.scrollWidth,this.$refs.needmid.scrollHeight]
      // console.log("测试是否执行获取滚轮偏移值的方法",value)
      return value
    },
    graphImageBackground(val){
      this.nowImageBackground=val;
    },
    gomid() {
      this.$refs.needmid.scrollTo(this.imageWidths,0)
    },
    imageWidth(args){
      var o = document.getElementById("midtupu");
      var w = o.clientWidth||o.offsetWidth;
      this.imageWidths=Number(args-w)/2;
    },
    imageheights(args){
      var o = document.getElementById("midtupu");
      var h = o.clientHeight||o.offsetHeight;

      this.nowimageheights=Number(args-h)/2;

    },
    changthispostion(imWidths, imHeights) {
      // alert(document.getElementById("midtupu").clientWidth)
      if (imWidths > document.getElementById("midtupu").clientWidth) {
        this.$refs.needmid.scrollLeft = (imWidths - document.getElementById("midtupu").clientWidth) / 2;
        //   this.$refs.needmid.scrollTop = 350;
      }
      if (imHeights > document.getElementById("midtupu").clientHeight) {
        this.$refs.needmid.scrollTop = (imHeights - document.getElementById("midtupu").clientHeight) / 2;
      }
    },
    dataloading() {
      this.$emit('dataloading');
    },
    datasuccess() {
      this.$emit('datasuccess')
    },
    datanull() {
      this.$emit('datanull')
    },
    datafail() {
      this.$emit('datafail')
    },
    historyInformation(myinfo) {
      var nowtime = this.handleClick(myinfo.name)
      var equipmentUuid1  = encodeURIComponent(this.equid);
      // var pointIdString1  = encodeURIComponent(pointsIds);
      this.$store.state.gongyiOverviewIframeHistoryTime = nowtime;
      if (this.overviewType === "振动概貌图"){
        var i = "/graph/" + equipmentUuid1 + '/' + nowtime + "/historyData"
        this.$emit('dataloading');
        this.$axios.get("/graph/" + equipmentUuid1 + '/' + nowtime + "/historyData")
          .then(res => {
            if (res.data.code === 200) {
              // console.log(res);
              this.$emit('datasuccess');
              this.rev = res.data.data[0].trend.rev + 'r/min'
              this.$refs.unitOverview.drawHistoryGraph(timestampToTimeFormat(nowtime), res.data.data, this.rev);
            } else {
              this.$emit('datafail');
            }
          });
      }
    },
    handleClick(getTimes) {//将当前时间转换为时间戳
      var date = new Date(getTimes);
      // 有三种方式获取
      // this.timestamp = date.getTime();//会精确到毫秒
      var time2 = date.valueOf();//会精确到毫秒
      return time2;
      // console.log(time2);//1398250549123
    },
    chartinfo(data) {

      // alert(this.iscan)
      if(this.iscan == true) {
        if (this.overviewType === '振动概貌图'){
          this.cleanunit();
        }
        this.historyInformation(data);
      }
      else {

      }
    },
    cleanunit() {
      let that =this;
      that.$refs.unitOverview.clearinterval();
    },
    myiscan(val) {
      this.iscan = val
      // alert(val)

      if (this.overviewType === "振动概貌图"){
        if(val == true) {
          this.cleanunit();
        }
        else {
          this.cleanunit();
          this.setinterval();
        }
      }

    },
    setinterval() {
      let that = this;
      setTimeout(() => {
        that.$refs.unitOverview.addgraphinformation(this.equid);
      }, 1000)
    },
    //细化
    refine(stime,etime){
      if (this.nowtree[0].id == '振动-位移' || this.nowtree[0].id == '振动-加速度' ||  this.nowtree[0].id == '振动-速度'){
        this.DramHistorygrapOther(  this.nowpointid ,  this.lastpointsid, stime, etime, this.nowtree,  this.lastfeature)
        // console.log("我是细化的数据",this.nowtree,this.lastfeature);
      }else{
        this. DramotherHistoryGrapOther( this.nowpointid , this.lastpointsid, stime, etime,  this.nowtree, this.lastfeature)
      }
      this.reDataZoomInterval()
    },
    DramHistorygrapOther(equipmentUuid, pointIdString, stime, etime, mytree, feature) {
      this.$emit('dataloading');
      // console.log("我是传来振动的数据",mytree,feature);
      this.graphtype = '历史';
      this.nowtree = mytree;
      this.nowpointid = equipmentUuid;
      this.lastpointsid = pointIdString
      this.lastfeature = feature
      // this.nowunit=unit
      var textname = this.textmap.get(feature.toString());
      this.onlyname = textname;
      var textstring = this.backmap.get(feature.toString());
      this.onlyone = textstring;
      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      var pointIdString1 = encodeURIComponent(pointIdString);
      this.getline(this.$store.state.equid, pointIdString.split(',')[0]);
      pointIdString1 = pointIdString1.replace(/%2f/gi, "%252F");
      this.$refs.opPage.loadingStatus = true;
      var netinfor = '/trend/' + equipmentUuid1 + '/' + pointIdString1 + '/' + stime + '/' + etime + "/info";
      var CancelToken = this.$axios.CancelToken;
      if (typeof this.cancel == 'function') {
        this.cancel()
      }
      this.$axios.get(netinfor, {
        cancelToken: new CancelToken((c) => {
          this.cancel = c;
        })
      }).then(res => {
        this.$refs.opPage.loadingStatus = false;
        if (res.data.code == 200 && res.data.data.trendInfo.length != 0) {
          // console.log(this.nowtree);
          // console.log('aaaaaaaaaaaaaaaaaaqqqqqqqqqqqqqqqqqqqqq')
          this.$emit('datasuccess');
          this.chartdata = res.data.data;
          // var title = this.chartdata.equipmentName + ' 历史';
          var title = this.features[this.nowtree[0].children[0].type][this.lastfeature].label
          var trendinfo = this.chartdata.trendInfo;
          var flagX = '[时间]';
          // var flagY = '['+"unit"+']'||'[]';
          // console.log(this.lastfeature);
          // console.log(this.nowtree[0].children[0].type);
          // console.log(this.features[this.nowtree[0].children[0].type][ this.lastfeature].unit)
          var flagY = '[' + this.features[this.nowtree[0].children[0].type][this.lastfeature].unit + ']' || '[]';
          var dataX = [];
          var dataY = [];
          var valueY = [];
          for (var i = 1; i < this.nowtree.length; ++i) {
            valueY.push([]);
          }
          //  timestampToTimeFormat(this.chartdata.trendTime);
          for (var i = 0; i < trendinfo.length; ++i) {
            dataX.push(timestampToTimeFormat(trendinfo[i].trendTime));
            for (var j = 1; j < this.nowtree.length; ++j) {
              valueY[j - 1].push(trendinfo[i].trendValue[j - 1][this.onlyone])
            }
          }

          for (var i = 1; i < this.nowtree.length; ++i) {
            dataY.push({
              name: this.nowtree[i].label,
              data: valueY[i - 1],
              color: this.colormap.get(i.toString())
            })

          }

          if (dataX.length == 0) {
            this.$emit('datanull');
          } else {
            this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'history');
          }

        } else {
          this.clearchart();
          this.$emit('datafail')
          //this.$message.error(res.data.message);
        }
      })
        .catch(e => {
          this.$refs.opPage.loadingStatus = false;

        });

    },
    getline(equid,pointid) {
      var tmp_data= null;
      let mypointid = encodeURIComponent(pointid);
      let CancelToken = this.$axios.CancelToken;
      if(typeof this.cancelAlarm == "function") {
        this.cancelAlarm();
      }
      mypointid=mypointid.replace(/%2f/gi,"%252F");
      var url = `point/${encodeURIComponent(equid)}/${mypointid}/alarmLine`
      this.$axios.get(url, {cancelToken: new CancelToken((c)=>{
          this.cancelAlarm = c;
        })
      }).then(res => {
        if(res.data.code == 200) {
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
      // 对于$store.state.startTime和endTime 由于存在清空操作 导致changeGraphData中没有进行x轴起止时间的插入
      // 所以对startTime和endTime进行赋值
      if(this.$store.state.startTime === '' || this.$store.state.endTime === '') {
        this.$store.state.startTime = this.stime;
        this.$store.state.endTime = this.etime;
      }
      if (this.nowtree[0].id == '振动-位移' || this.nowtree[0].id == '振动-加速度' ||  this.nowtree[0].id == '振动-速度'){
        this.DramHistorygrapOther(  this.nowpointid ,  this.lastpointsid, this.stime, this.etime, this.nowtree,  this.lastfeature)

      }else{
        this. DramotherHistoryGrapOther( this.nowpointid , this.lastpointsid, this.stime, this.etime,  this.nowtree, this.lastfeature)
      }
      this.reDataZoomInterval()
    },
    DramotherHistoryGrapOther(equipmentUuid, pointIdString, stime, etime, mytree, feature) {
      this.graphtype = '历史';
      this.$emit('dataloading');
      // console.log(this.nowtree);
      // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      this.nowtree = mytree;
      this.lastpointsid = pointIdString
      this.lastfeature = feature;
      //   console.log(this.nowtree)
      this.nowpointid = equipmentUuid;
      var equipmentUuid1 = encodeURIComponent(equipmentUuid);
      this.getline(this.$store.state.equid, pointIdString.split(',')[0]);
      var pointIdString1 = encodeURIComponent(pointIdString);
      pointIdString1 = pointIdString1.replace(/%2f/gi, "%252F");
      var netinfor = '/proctrend/' + equipmentUuid1 + '/' + pointIdString1 + '/' + stime + '/' + etime + "/his";
      /*   var CancelToken = this.$axios.CancelToken;
         if (typeof this.cancel == 'function') {
           this.cancel()
         }*/
      this.$refs.opPage.loadingStatus = true;
      this.$axios.get(netinfor).then(res => {
        this.$refs.opPage.loadingStatus = false;
        if (res.data.code == 200 && res.data.data != null) {
          // console.log(res)
          // console.log('99999999999999999999999999999999999999')
          this.$emit('datasuccess');
          this.chartdata = res.data.data.trendValues;
          //排序
          var unordered = this.chartdata;
          const ordered = {};
          Object.keys(unordered).sort().forEach(function (key) {
            ordered[key] = unordered[key];
          });
          this.chartdata = ordered;


          var x = Object.keys(this.chartdata);
          var y = Object.values(this.chartdata);
          //初始化趋势图
          var flagX = '[时间]';
          let flagY = `[${res.data.data.unit[0]}]`;
          // var flagY;
          // if (this.nowtree[0].id == '压力') flagY = '[Kpa]'
          // else if (this.nowtree[0].id == '温度') flagY = '[℃]'
          // else  flagY = '[um]'
          var dataX = [];
          var dataY = [];
          // var title = this.$store.state.equName + ' ' + '历史'
          var title = mytree[0].label;

          //添加 x轴数据
          for (var i = 0; i < x.length; i++) {
            dataX.push(x[i])
          }
          //添加y轴数据
          for (var i = 1; i < this.nowtree.length; ++i) {
            var nowcolor = this.colormap.get((i - 1).toString());
            var nowtext = this.nowtree[i].id;
            var newY = [];
            for (var j = 0; j < y.length; ++j) {
              var nownum = y[j][0][i - 1];
              if (this.nowtree.length == 2) {
                nownum = y[j][0];
              }
              newY.push(nownum);
            }
            dataY.push({
              name: this.nowtree[i].label,
              data: newY,
              color: nowcolor
            })
          }
          //  console.log(dataY);
          if (dataX.length == 0) {
            this.$emit('datanull');
          } else {
            this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'history');
          }
        } else {
          this.clearchart();
          this.$emit('datafail')
          //this.$message.error(res.data.message);
        }
      })
        .catch(e => {
          this.$refs.opPage.loadingStatus = false;
          // this.clearchart();
          // this.$emit('datafail')
        });

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
        if (this.zoomDataIntervalBegin.length === 0){
          this.zoomDataIntervalBegin = this.$refs.trendg.mychart.getOption().useDataZoomBegin
          this.zoomDataIntervalEnd = this.$refs.trendg.mychart.getOption().useDataZoomEnd
        }
        this.$refs.trendg.dataZoom(zoomBegin,zoomEnd)
        this.zoomDataInterval(zoomBegin,zoomEnd)
      }
    },
    zoomDataInterval(zoomBegin,zoomEnd){
      if (this.zoomDataIntervalBegin[this.zoomDataIntervalBegin.length - 1] != zoomBegin &&
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
    nowstatic(data) {
      this.nowtimeStatic = data;    //实时为true  历史为false
    },
    clearchart() {
      var CancelToken = this.$axios.CancelToken;
      this.$refs.trendg.clearall();

    },
    showgraph() {
      // console.log("xianshi");
      this.show = true;
      this.mapheight = '60%';
      this.graphheight = 'calc(40% - 4px)';
      this.$nextTick(() => {
        this.$refs.trendg.mychart.resize();
      })

    },
    overviewChange(type) {
      this.overviewType = type
    },
    notshowgraph() {
      this.show = false;
      this.mapheight = '100%';
      this.graphheight = '0%';
      this.$nextTick(() => {
        this.$refs.trendg.mychart.resize();

      })
    },
    iDramHistorygrap(equipmentUuid, pointIdString, stime, etime, mytree, feature) {
      this.setinterval();
      this.DramHistorygrap(equipmentUuid, pointIdString, stime, etime, mytree, feature)
    },
    DramHistorygrap(equipmentUuid, pointIdString, stime, etime, mytree, feature) {
      this.stime = stime;
      this.etime = etime;
      this.DramHistorygrapOther(equipmentUuid, pointIdString, stime, etime, mytree, feature)
    },
    iDramotherHistoryGrap(equipmentUuid, pointIdString, stime, etime, mytree, feature) {
      this.setinterval();
      this.DramotherHistoryGrap(equipmentUuid, pointIdString, stime, etime, mytree, feature);
    },
    DramotherHistoryGrap(equipmentUuid, pointIdString, stime, etime, mytree, feature) {
      this.stime = stime;
      this.etime = etime;
      this.DramotherHistoryGrapOther(equipmentUuid, pointIdString, stime, etime, mytree, feature);
    },
    iDrawrealgrap(equid, pointids, mytree, feautre){
      this.setinterval();
      this.Drawrealgrap(equid, pointids, mytree, feautre)
    },
    Drawrealgrap(equid, pointids, mytree, feautre) {
      this.$emit('dataloading');
      this.tongdao = 0;
      this.graphtype = '实时'
      this.nowtree = mytree;
      // console.log("this.nowtree",this.nowtree);
      var textname = this.textmap.get(feautre.toString());
      this.onlyname = textname;
      var textstring = this.backmap.get(feautre.toString());
      this.onlyone = textstring;
      // var CancelToken = this.$axios.CancelToken;
      let that = this;

      // if (typeof this.cancel == 'function') {
      //   this.cancel()
      // }
      var equipmentUuid1 = encodeURIComponent(equid);
      var pointIdString1 = encodeURIComponent(pointids);
      pointIdString1 = pointIdString1.replace(/%2f/gi, "%252F");
      this.realVibrationQuestFlag = false;
      this.$axios.get("/trend/" + equipmentUuid1 + "/" + pointIdString1 + "/real_time")
        .then(res => {
          this.realVibrationQuestFlag = true;
          if (res.data.code === 200) {
            // console.log('进行数据请求');
            this.$emit('datasuccess');
            this.chartdata = res.data.data;
            // var title = this.chartdata.equipmentName + ' 实时';
            var title = this.features[this.nowtree[0].children[0].type][feautre].label;

            var newX = timestampToTimeFormat(this.chartdata.trendTime);

            var flagX = '[时间]';
            // var flagY = '[um]';
            var flagY = '[' + this.features[this.nowtree[0].children[0].type][feautre].unit + ']' || '[]';
            var dataX = [];
            var dataY = [];
            dataX.push(newX);


            for (var i = 1; i < mytree.length; ++i) {
              var newY = this.chartdata.trendValue[i - 1][textstring];
              dataY.push({
                name: mytree[i].label,
                data: [newY],
                color: this.colormap.get(i.toString())
              })


            }
            if (dataX.length == 0) {
              this.$emit('datanull');
            } else {
              // console.log('设置数据');
              this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'real');
            }

          } else {
            if (this.Drawrealgrapflag) {
              this.$emit('datafail');
              this.Drawrealgrapflag = false;
            }
          }
        }).catch(e => {
        if (this.Drawrealgrapflag2) {
          console.log("qdy执行catch,datafail里面的内容");
          this.$emit('datafail')
          this.Drawrealgrapflag2 = false;
        }
        this.clearchart();
      });
    },

    Addrealgrap(equid, pointids) {
      if (this.realVibrationQuestFlag && this.realVibrationQuest) {
        this.realVibrationQuest = false;
        var equipmentUuid1 = encodeURIComponent(equid);
        var pointIdString1 = encodeURIComponent(pointids);
        pointIdString1 = pointIdString1.replace(/%2f/gi, "%252F");
        this.$axios.get("/trend/" + equipmentUuid1 + "/" + pointIdString1 + "/real_time").then(res => {
          this.realVibrationQuest = true;
          if (res.data.code === 200) {
            // console.log('进入add');
            this.$emit('datasuccess');
            let that = this;
            this.chartdata = res.data.data;
            var title = this.chartdata.equipmentName + ' 实时';

            var newX = timestampToTimeFormat(this.chartdata.trendTime);
            var dataY = [];
            for (var i = 1; i < this.nowtree.length; ++i) {
              var newY = this.chartdata.trendValue[i - 1][this.onlyone];
              dataY.push(newY);
            }
            if (newX.length == 0) {
              this.$emit('datanull');
            } else {
              this.$refs.trendg.changechart(newX, dataY);
            }

          } else {
            // this.clearchart();
            // this.$emit('datafail')
            //this.$message.error(res.data.message);
          }
        }).catch(e => {
          this.clearchart();
          // console.log('增加数据');
          if (this.Addrealgrapflag) {
            this.$emit('datafail');
            this.Addrealgrapflag = false;
          }
        });
      }

    },
    iDrawoutherrealGrap(equid, pointids, mytree, feautre) {
      this.setinterval();
      this.DrawoutherrealGrap(equid, pointids, mytree, feautre)
    },
    DrawoutherrealGrap(equid, pointids, mytree, feautre) {
      //   console.log('画实时图谱，我是传过来的数据');
      //  this.$refs.trendg.clearall();
      this.$emit('dataloading');
      this.nowtree = mytree;
      const equipmentUuid1 = encodeURIComponent(equid);
      let pointIdString1 = encodeURIComponent(pointids);
      pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
      this.realOtherQuestFlag = false;
      this.$axios.get("/proctrend/" + equipmentUuid1 + "/" + pointIdString1 + "/rt")
        .then(res => {
          if (res.data.code === 200) {
            this.$emit('datasuccess');
            this.realOtherQuestFlag = true;
            // console.log(res);
            // console.log(this.nowtree);
            //  console.log('画实时图谱');
            this.chartdata = res.data.data;
            var firstdata = this.chartdata[this.nowtree[1].id];
            // console.log(this.nowtree[1].id)
            // 初始化趋势图数据
            var flagX = '[时间]';
            var flagY = '['+firstdata.unit+']';
            var dataX = [];
            var dataY = [];
            // var title = this.$store.state.equName  + ' 实时';
            var title = mytree[0].label;
            dataX.push(timestampToTimeFormat(firstdata.time));
            for (var i = 1; i < this.nowtree.length; ++i) {
              dataY.push({
                name: this.nowtree[i].label,
                data: [this.chartdata[this.nowtree[i].id].value],
                color: this.colormap.get((i - 1).toString())
              })
            }
            if(dataX.length == 0) {
              this.$emit('datanull');
            }else {
              this.$refs.trendg.setchart(flagX, flagY, dataX, dataY, title, 'real');
            }
            // this.$refs.trendt.setchart(flagX, flagY, dataX, dataY, title);
          }
          else{
            if(this.DrawoutherrealGrapFlag){
              this.DrawoutherrealGrapFlag = false;
              this.$emit('datafail');
            }
          }
        }).catch(e => {
        if(this.DrawoutherrealGrapFlag2){
          this.DrawoutherrealGrapFlag2 = false;
          this.$emit('datafail');
        }
      });


    },
//给其他图谱添加实时数据
    AddoutherrealGrap(equid, pointids) {

      if (this.realOtherQuestFlag && this.realOtherQuest) {
        this.realOtherQuest = false;
        var equipmentUuid1  = encodeURIComponent(equid);
        var pointIdString1  = encodeURIComponent(pointids);
        pointIdString1=pointIdString1.replace(/%2f/gi,"%252F");
        this.$axios.get("/proctrend/" + equipmentUuid1 + "/" + pointIdString1 + "/rt")
          .then(res => {
            this.realOtherQuest = true;
            if (res.data.code === 200) {
              this.$emit('datasuccess');
              this.chartdata = res.data.data;
              //   console.log(res);
              //   console.log('我是增加的图谱');
              var dataX = [];
              var dataY = [];
              dataX.push(timestampToTimeFormat(this.chartdata[this.nowtree[1].id].time));
              // console.log("####################",timestampToTimeFormat(this.chartdata[this.nowtree[1].id].time))
              for (var i = 1; i < this.nowtree.length; ++i) {
                dataY.push(this.chartdata[this.nowtree[i].id].value)
              }
              if(dataX.length == 0) {
                this.$emit('datanull');
              }else {
                this.$refs.trendg.changechart(dataX, dataY);}
            }
            else{
              // this.$emit('datafail');
            }
          })
      }
      /*.catch(e => {
        this.$emit('datafail');
      });*/
    },
    reDataZoomInterval(){
      this.zoomDataIntervalBegin = []
      this.zoomDataIntervalEnd = []
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
      });
    },
    handleMenuClick(id) {

    },
    hideTheMenu() {
      this.isMenuShow = false
      window.removeEventListener('click', this.hideTheMenu)
      window.removeEventListener('contextmenu', this.hideTheMenu)
    },
    handleJump(Uri) {
      this.$router.push({path: Uri, query: this.$route.query})
    },
  }

}
</script>
<style lang="scss" scoped>

.UnitOverviewMapjibeng {
  --conbgcolor: #232835;
  --leftconbgcolor: #303749;
  --buttoncolor: #359186;
  --textcolor: #ffffff;
  background-color: var(--conbgcolor);
  width: 100%;
  height: 100%;
  display: flex;
  float: left;

  .alarmStatus_2 {
    color: red; //危险
  }

  .alarmStatus_1 {
    color: yellow; //报警
  }

  .imgs {
    top: 5px;
    position: absolute;
    z-index: 0;
    height: 100%;
    width: 100%;

  }

  .ingraphs {
    // width: calc(100% - 520px);
    overflow-x: auto;
    overflow-y: auto;
    background-color: var(--leftconbgcolor);
  }

  .other-graph {
    background-color: var(--leftconbgcolor);
  }

  .graphs {
    // background-color: #e0e44c;
    margin: 10px 2px 0px 2px;
    float: left;
    width: calc(100% - 300px);
    height: calc(100% - 10px);
  }


  .OpPage {
    width: 290px;
    height: calc(100% - 10px);
    margin-top: 10px;
    float: right;
    overflow: hidden;
    background-color: var(--leftconbgcolor);
  }

  .image {
    //  background-color: #67c23a;
  }

  .gmt {
    height: 747px;
    margin: 0 auto;
    background-repeat: no-repeat;
    background-position: left top;
  }

  .divGraph {
    width: 100%;
    margin-top: 4px;
  }
}

#menu {
  height: auto;
  width: 125px;
  overflow: hidden;
  box-shadow: 0 1px 1px #888, 1px 0 1px #ccc;
  position: absolute;
  background-color: #fff;
  z-index: 100;

  .menu {
    width: 130px;
    height: 25px;
    line-height: 25px;
    padding: 0 10px;
  }

  .menu:hover {
    background-color: rgb(230, 230, 230);
  }
}
</style>
