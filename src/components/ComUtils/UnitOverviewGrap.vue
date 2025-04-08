<template>
  <div class="infromtion" id="infromtion" :style="{height:'100%',width:'100%',backgroundColor:graphImageBackground,}"
       @click="overlick">
    <!-- 存在滚动条模式 -->
    <div class="myclass" id="div_img" ref="parent">
      <img :src="codeBase" :style=" {marginLeft: Math.max(0, (imageWidth - Math.max(imWidth, Math.min(imageWidth, imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth) + (imageWidth - imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth)) * 0.7)))) / 2+ 'px' ,
      height: (Math.max(imHeight, Math.min(imageheight, imHeight * (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth) ))).toString() + 'px',
      width: (Math.max(imWidth, Math.min(imageWidth, imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth) + Math.max(0, (imageWidth - imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth)) * 0.7)))).toString() + 'px',
      }">
    </div>
    <div class="info">
      <table>
        <tr>
          <td>{{ equipmentsName }}</td>
          <td colspan="2" :style="{fontSize:fontSize + 'px', textAlign: 'right'}">{{ timeComputed }}</td>
        </tr>
        <tr v-for="(revInfo, index) in revInfoList" :key="revInfo.revName">
          <td></td>
          <td :style="{fontSize:fontSize + 'px', textAlign: 'right'}">{{ revInfo.revName }}:</td>
          <td :style="{fontSize:fontSize + 'px', textAlign: 'right'}">{{ revInfo.revValue }}</td>
        </tr>
      </table>
    </div>

    <!-- 加滚动模式 -->
    <div class="myclass" id="div_info"
         :style="{marginLeft: Math.max(0, (imageWidth - Math.max(imWidth, Math.min(imageWidth, imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth) + (imageWidth - imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth)) * 0.7)))) / 2+ 'px' ,
      }">
      <div
        v-for="(item,i) in listBoxes"
        v-show="item.height > 0 && item.width > 0 && item.points.length>0 "
        :id="'id_box' + i"
        :key="'id_box' + i"
        :class="'point_box point_box' + i"
        :style="{
        width: Math.floor(parseInt(item.width, 10) / imWidth * (Math.max(imWidth, Math.min(imageWidth, imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth) + Math.max(0, (imageWidth - imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth)) * 0.7))))) + 'px',
        height: Math.max(0, Math.floor(parseInt(item.height, 10) / imHeight * (Math.max(imHeight, Math.min(imageheight, imHeight * (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth) ))) - 3)) + 'px',
        top: Math.floor(parseInt(item.yPos, 10) / imHeight * (Math.max(imHeight, Math.min(imageheight, imHeight * (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth) )))) + 'px',
        left: Math.floor(parseInt(item.xPos, 10) / imWidth * (Math.max(imWidth, Math.min(imageWidth, imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth) + Math.max(0, (imageWidth - imWidth* (imageheight < imageWidth ? imageheight / imHeight : imageWidth / imWidth)) * 0.7))))) + 'px' ,
        backgroundColor: graphImageBackground
        }">

        <li
          v-for="(val,j) in item.points"
          :key="j"
          :class="'alarmStatus_' + getstatus(val.status)"
          :title="val.pointId"
          @contextmenu.prevent="handleClick(val.pointId, $event)"
        >
          <span
            :style="'width:'+(calMaxWidth(Math.floor(parseInt(item.width,10)/imWidth * imageWidth), val.pointId, i) ).toString()+'px; ' +
             'display:-moz-inline-box; ' +
             'display:inline-block;' +
             'overflow: hidden; ' +
             'vertical-align: top;' +
              'font-size:' + fontSize + 'px'"
          >{{ val.pointId }}</span>

          <span :style="'margin-left: 6px;' +
          'font-size:'+ fontSize + 'px' "
          >{{ getValue(val.value) }}</span>
        </li>

      </div>
    </div>
    <div class="routeMenu" id="routeMenu" ref="box" v-show="showMenu"
         :style="{top: y + 'px', left: x + 'px', zIndex: 4}">
      <div class="sele">
        <i v-if="!boxFlag" class="el-icon-caret-left"></i>
        {{ translateText('opPage.textMap.','切换')}}
        <i v-if="boxFlag" class="el-icon-caret-right"></i>
      </div>
      <ul class="menu">
        <li
          v-for="(val, item) in menuList"
          :key="item"
          @click="handleSelect(val.path)">
          <img :src="val.src">
          {{ val.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

import menu from "../../Page/menu";
import keepAliveMixin from "../../mixins/keepAliveMixin";
import {timestampToTimeFormat} from "./TimeFormat";

var elementResizeDetectorMaker = require("element-resize-detector");
export default {
  name: "UnitOverviewGrap",
  mixins: [keepAliveMixin],
  props: ['nowtimeStatic', 'getScrollValue'],
  data() {
    return {
      imgUrl_UnitMap: require("../../assets/unitmap.png"),
      imgUrl_Alarm_Q: require("../../assets/Alarm_Q.png"),
      imgUrl_Trend_A: require("../../assets/Trend_A.png"),
      imgUrl_Pump_P: require("../../assets/Pump_P.png"),
      imgUrl_Other_P: require("../../assets/Other_P.png"),
      imgUrl_RotorFault_D: require("../../assets/RotorFault_D.png"),
      imgUrl_Cepstrum_G: require("../../assets/Cepstrum_G.png"),
      imgUrl_Single_Multi: require("../../assets/Single_Multi.png"),
      imgUrl_Other_Parameters: require("../../assets/Other_Parameters.png"),
      imgUrl_Xuan_Map: require("../../assets/Xuan_Map.png"),
      imgUrl_XuanVib: require("../../assets/XuanVib.png"),
      imgUrl_XuanHisCompare: require("../../assets/Xuan_HisCompare.png"),
      imgUrl_XuanZhouG: require("../../assets/Xuan_ZhouG.png"),
      imgUrl_XuanZhouW: require("../../assets/Xuan_ZhouW.png"),
      imgUrl_XuanStartStop: require("../../assets/Xuan_StartStop.png"),
      imgUrl_Xuan_ZongH: require("../../assets/Xuan_ZongH.png"),
      imgUrl_Xuan_RunS: require("../../assets/Xuan_RunS.png"),
      imgUrl_AllS: require("../../assets/Xuan_AllS.png"),
      imgUrl_TwoS: require("../../assets/Xuan_TwoS.png"),
      imgUrl_ThreeS: require("../../assets/Xuan_ThreeS.png"),
      imgUrl_DPH: require("../../assets/Xuan_DPH.png"),
      imgUrl_WangFM: require("../../assets/WangFM.png"),
      imgUrl_Wang_HBai: require("../../assets/Wang_HBai.png"),
      imgUrl_Wang_HGuiJi: require("../../assets/WangHGuiJi.png"),
      imgUrl_Wang_SG: require("../../assets/WangSG.png"),
      imgUrl_Wang_YJ: require("../../assets/Wang_YJ.png"),
      imgUrl_Wang_DCS: require("../../assets/Wang_DCS.png"),
      num: 0,
      marginleft: this.$store.state.marginleftvalue,
      interval2: null,
      fontSize: 12,
      oldHeight: '',
      oldWidth: '',
      imWidth: 0,
      imHeight: 0,
      nowwin: 1,
      equipmentNameHight: '',
      equipmentNameWidth: '',
      equipmentNameTop: '',
      equipmentNameleft: '',
      namefontsize: '9px',
      timeHight: '',
      timeWidth: '',
      timeTop: '',
      timeLeft: '',
      timefontize: '9px',
      revInfoHight: '',
      revInfoWidth: '',
      revInfoTop: '',
      revInfoLeft: '',
      revfontsize: '9px',

      imageheight: '',
      imageWidth: '',
      imageheight1: '',
      imageWidth1: '',
      equipmentsName: '',
      time: '',
      revInfo: {
        revName: '',
        revValue: '',
      },
      revInfoList: [],
      ifnowdata: true,
      nowstatus: -1,  ///为了配合keepAliveMixi中的nowstatus，与ifnowdata保持一致
      codeBase: '',
      graphDataTime: '',
      myinterval: null,
      show: false,
      mapheight: '100%',
      graphheight: '0%',
      showOpPage: true,
      graphImageBackground: '',
      listBoxes: [],
      listSpan: {},
      tmpnum: 0,
      apiflag: true,
      showMenu: false,
      x: 0,
      y: 0,
      pointId: '',
      boxFlag: false
      // nnnn: 0
    }
  },
  computed:{
    timeComputed() {
      return this.time;
    },
    getequName() {
      return this.$store.state.equName;
    },
    equid() {
      return this.$store.state.equid;
    },
    newstate() {
      return this.$store.state.newstate
    },
    windowScreenWidth() {
      return window.screen.width
    },
    menuList() {
    if (this.$route.path == '/UnitOverviewMap') {
        return [
          {
            name: this.translateText("menu.textMap.",'报警查询'),
            src: this.imgUrl_Alarm_Q,
            path: '/AlarmQueryGraph'
          },
          {
            name: this.translateText("menu.textMap.",'趋势分析'),
            src: this.imgUrl_Trend_A,
            path: '/TrendAnalysis'
          },
          {
            name: this.translateText("menu.textMap.",'冲击诊断'),
            src: this.imgUrl_Pump_P,
            path: '/PumpImpactDiagnosis'
          },
          {
            name: this.translateText("menu.textMap.",'转子类故障诊断'),
            src: this.imgUrl_RotorFault_D,
            path: '/RotorFaultDiagnosis'
          },
          {
            name: this.translateText("menu.textMap.",'倒谱图'),
            src: this.imgUrl_Cepstrum_G,
            path: '/CepstrumGraph'
          },
          {
            name: this.translateText("menu.textMap.",'单多值棒图'),
            src: this.imgUrl_Single_Multi,
            path: '/SingleMultiBarValueChart'
          },
          {
            name: this.translateText("menu.textMap.",'其他参数趋势图'),
            src: this.imgUrl_Other_Parameters,
            path: 'OtherParametersTrendGraph'
          },
        ]
      }
    }
  },
  mounted() {
    if (typeof this.cancel == 'function') {
      this.cancel()
    }

    if (this.myinterval) {
      // console.log('1没有吗',this.myinterval);
      clearInterval(this.myinterval)
    }
    // window.addEventListener('scroll', this.windowScroll, true);
    this.$emit('changename', this.unitname);
    // console.log(this.equid);
    if (this.equid) {
      // console.log('这里的原因');
      this.getImage(this.equid, 'mounted');
    }

    const that = this;
    that.tmpnum = 0;
    // const erd = elementResizeDetectorMaker();
    let image = document.getElementById("infromtion")
    this.imageheight1 = image.offsetHeight - 6;
    this.imageWidth1 = image.offsetWidth - 6;
    this.imageheight = image.offsetHeight - 6;
    this.imageWidth = image.offsetWidth - 6;
    this.startall() //提前告诉nowstatus已经加载完成
  },
  beforeDestroy() {

    console.log('beforeDestroy')
    if (typeof this.cancel == 'function') {
      this.cancel()
    }
    console.log('销毁前清除定时器', this.myinterval);
    for (let tmp_i = 0; tmp_i <= this.myinterval; tmp_i++) {
      if (tmp_i != this.$store.state.intervalId && !this.$store.state.intervalIds.includes(tmp_i))
        clearInterval(tmp_i)
    }
  },
  destroyed() {

    if (typeof this.cancel == 'function') {
      this.cancel()
    }
    // console.log('摧毁', this.myinterval);
    for (let tmp_i = 0; tmp_i <= this.myinterval; tmp_i++) {
      if (tmp_i != this.$store.state.intervalId && !this.$store.state.intervalIds.includes(tmp_i))
        clearInterval(tmp_i)
    }

  },
  watch: {
    listBoxes(newVal, oldVal) {
      if(!this.activatedFlag || newVal.length == 0) return ;
      this.$store.state.points = []
      for(let item of newVal) {
        this.$store.state.points.push(...item.points);
      }
    },
    '$i18n.locale'() {
      this.revInfoList.revInfo.revName = this.translateText("chart.textMap.",this.revInfoList.revInfo.revName)
    },

    nowtimeStatic(data) {
      if(!this.activatedFlag) return ;
      this.ifnowdata = data;
      console.log('ooooooo');
      // console.log(data)
      this.graps();
    },
    equid: {
      handler(newEquid) {
        if(!this.activatedFlag) return;
        // console.log('我俩开了');
        console.log(this.imageWidth == '', this.imageWidth, this.imWidth);
        // clearInterval(this.myinterval)
        console.log(this.myinterval);
        if(this.$route.path.indexOf('Overview') != -1)
          this.getImage(newEquid, 'watch');
      }
    },


  },

  methods:{
    overlick() {
      if (this.showMenu) {
        this.showMenu = false;
      }
    },
    drawHistoryGraph(time, data, rev) {
      // console.warn(data);
      this.ifnowdata = false;
      this.nowstatus = 0
      this.time = time;
      this.revInfo.revValue = rev;
      // console.log('eeee', data)
      let dataLen = data.length;
      for (let i = 0; i < dataLen; i++) {

        for (let j in this.listBoxes)
          for (let k in this.listBoxes[j].points) {
            if (this.listBoxes[j].points[k].pointId === data[i].pointId.replace("#", "\\#")) {
              // 非响应式赋值
              this.$set(this.listBoxes[j].points[k], 'value', data[i].value.toFixed(2) + data[i].unit)
              // console.log('历史请求数据刷新：',this.listBoxes[j].points[k].pointId, this.listBoxes[j].points[k].value);
            }
          }
      }
      this.listSpan = {}
      this.graps()
    },
    graps() {
      if (this.ifnowdata) {    //true画实时的信息
        // console.log('实时');
        this.addgraphinformation(this.equid)
      } else {
        // console.log('历史');
        clearInterval(this.myinterval);
      }
    },
    addgraphinformation(id, from) {
      //   this.getgraphdata(this.equid);
      let that = this;
      if (this.myinterval) {
        clearInterval(this.myinterval)
      }
      let tmp_res = true;
      // console.log(this.nnnn++,'裂开了', this.myinterval, id);
      this.myinterval = setInterval(() => {

        var CancelToken = that.$axios.CancelToken;
        var nowid = encodeURIComponent(id)
        if (tmp_res) {
          tmp_res = false;
          that.$axios.get("/graph/" + nowid + "/data")

            .then(res => {
              tmp_res = true;
              // console.log('我的请求完成');
              if (res.data.code == 200) {
                var raised = 0;
                // this.$emit('datasuccess');
                let graphData = res.data.data;
                graphData.equipmentName = graphData.equipmentName || {
                  yPos: "",
                  width: "",
                  equipmentName: "",
                  xPos: "",
                  height: ""
                };
                let tmp_ratio = Math.min(that.imageheight / that.imHeight, that.imageWidth / that.imWidth);
                that.equipmentsName = graphData.equipmentName.equipmentName || "";
                that.equipmentNameTop = 20 || '';
                that.equipmentNameleft = that.imageWidth / 3 + "px" || '';
                that.equipmentNameHight = graphData.equipmentName.height || '';
                that.equipmentNameWidth = (graphData.equipmentName.equipmentName.length * 20) || '';
                // this.namefontsize = Math.ceil(this.fontsize * Math.max(this.ratio, this.ratio1)).toString() + 'px';
                that.namefontsize = Math.ceil(9 * tmp_ratio) + "px" || '';
                graphData.time = graphData.time || {
                  yPos: "",
                  width: "",
                  time: "",
                  xPos: "",
                  height: ""
                }
                that.time = graphData.time.time || '';
                if (that.$route.path.includes('/Offline/')) {
                  that.time = '巡检时间: ' + timestampToTimeFormat(Number(that.time.slice(-13)));
                }
                that.timeTop = 20 || '';
                that.timeLeft = (that.imageWidth / 3 + graphData.equipmentName.equipmentName.length * 25) + "px" || '';
                that.timeHight = graphData.time.height || '';
                // this.timefontize = Math.ceil(this.fontsize * Math.max(this.ratio, this.ratio1)).toString() + 'px';
                that.timefontize = Math.ceil(9 * tmp_ratio) + "px" || '';
                that.timeWidth = graphData.time.time.length / 1.7 || '';

                that.revInfoList = [];
                for (let key in graphData.revInfo) {
                  console.log("key", key)
                  let revName = graphData.revInfo[key].revName || '';
                  let revValue = graphData.revInfo[key].revValue || '';
                  let yPos = Number(graphData.revInfo[key].yPos);
                  that.revInfoList.push({
                    revName: this.translateText("chart.textMap.",revName),
                    revValue: revValue,
                    yPos: yPos
                  })
                }

                that.revInfoList.sort((a, b) => {
                  return a.yPos - b.yPos
                })
                that.revInfoTop = 50 || '';
                that.revInfoLeft = (that.imageWidth / 3 + graphData.equipmentName.equipmentName.length * 25) + "px" || '';

                that.revfontsize = Math.ceil(9 * tmp_ratio) + "px" || '';
                that.revInfoWidth = that.timeWidth || '';
                that.listBoxes = graphData.listBoxes;
              } else {
                console.log('请求失败');
                this.$emit('datafail');
              }
            })
            .catch(e => {
            });
        } else {
          // console.log('上次请求未完成');
        }

      }, 3000)
      // console.log('定时器',that.myinterval, from);
      for (let tmp_i = 0; tmp_i < this.myinterval; tmp_i++) {
        if (tmp_i != this.$store.state.intervalId && !this.$store.state.intervalIds.includes(tmp_i))
          clearInterval(tmp_i)
      }
      // clearInterval(that.myinterval)
    },
    getstatus(val) {
      let tmptoken = localStorage.getItem('token');
      //console.log("tmptoken", tmptoken);
      if (tmptoken) {
        if (val == 0) {
          return 0;
        } else if (val == 5) {
          return 2;
        } else {
          return 1;
        }
      } else {
        return val;
      }
    },
    handleClick(pointId, val) {
      console.log('点击事件', pointId, val, val.target.innerText, val.clientX, val.clientY);

      // 这里的value存放的是概貌图的容器的横向滚轮和竖向滚轮两个滚轮的偏移量，补足滚轮异常
      let value = this.getScrollValue()
      this.showMenu = true;
      this.pointId = pointId;
      this.$nextTick(() => {
        let menuHeight = document.getElementById('routeMenu').clientHeight;
        console.log(menuHeight);
        let x = val.clientX - 250;
        let y = val.clientY - 60;
        this.boxFlag = true;
        this.$refs.box.style.setProperty('--marginTop', `0px`);
        this.$refs.box.style.setProperty('--direction', 'row');
        // 正常的方向应该是朝右下方向
        // 解释下，判断哪种情况下需要反转菜单，首先y以下的高度不足menuHeight且y以上的高度超过menuHeight。如果都不满足，那么判断y以下的高度+滚轮剩余高度超过menuHeight就可以
        if ((y + menuHeight > this.imageheight + value[3] - value[1]) || ((y > this.imageheight - y) && (value[1] + y > menuHeight))) {
          console.log("是否执行了y + menuHeight > this.imageweight", this.imageheight, (y + menuHeight))
          y -= menuHeight;
          this.$refs.box.style.setProperty('--marginTop', `${menuHeight - 25}px`);
        }
        // // 解释下，判断哪种情况下需要反转菜单，首先y以下的高度不足menuHeight且y以上的高度超过menuHeight。如果都不满足，那么判断y以下的高度+滚轮剩余高度超过menuHeight就可以
        // if( ((y + menuHeight > this.imageheight) && (y >= menuHeight)) || ((y + menuHeight > (this.imageheight+value[3]-value[1])))){
        //   console.log("是否执行了y + menuHeight > this.imageweight",this.imageheight,(y + menuHeight))
        //   y -= menuHeight;
        //   this.$refs.box.style.setProperty('--marginTop', `${menuHeight - 25}px`);
        // }
        if ((x + 275 > this.imageWidth + value[2] - value[0]) || ((x > this.imageWidth - x) && (value[0] + x > 275))) {
          // x -= (x + 275 - this.imageWidth);
          console.log("是否执行了x + menuHeight > this.imageweight", this.imageWidth, (x + menuHeight))
          x -= 275;
          this.boxFlag = false;
          this.$refs.box.style.setProperty('--direction', 'row-reverse');
        }

        this.x = x + value[0]
        this.y = y + value[1]
      })
    },
    calMaxWidth(windowSize, pointList, spanIndex) {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      context.font = this.fontSize.toString() + 'px Avenir Helvetica Arial sans-serif';
      let dimension = context.measureText(pointList);
      // console.log('我的宽度', dimension.width, pointList, spanIndex, this.fontSize, typeof(this.fontSize));
      if (spanIndex == 0 && !this.listSpan[spanIndex]) {
        this.listSpan = {};
      }
      if (!this.listSpan[spanIndex]) {
        // console.log('第一个数据');
        this.listSpan[spanIndex] = dimension.width * 1.15;
      } else {
        this.listSpan[spanIndex] = Math.max(this.listSpan[spanIndex], dimension.width * 1.15);
      }
      return this.listSpan[spanIndex];

    },
    getValue(oriValue) { // 测点框的测点值, 也就是接口中的value
      oriValue = String(oriValue);
      if(oriValue.endsWith('m/s2')) // 替换角标
        oriValue = oriValue.replace('m/s2', 'm/s²');
      return oriValue;
    },
    handleSelect(val) {
      console.log('选择', val);
      this.showMenu = false;
      if (val) {
        this.$store.state.pointId = this.pointId
        this.$router.push({path: val, query: this.$route.query});
      }
    },
    startall() {
      if (this.nowstatus == -1){ ///防止初始化页面时调用，两次启动定时器
        this.nowstatus = 1
      }else{
        this.addgraphinformation(this.equid)
      }
    },
    getImage(id, from) {
      // this.nowwin=1;
      var CancelToken = this.$axios.CancelToken;

      if (typeof this.cancel == 'function') {
        this.cancel()
      }
      console.log('概貌图开始', from);
      if (this.myinterval) {
        // console.log('123');
        clearInterval(this.myinterval)
      }
      this.$emit('dataloading');
      var nowid = encodeURIComponent(id)
      this.apiflag = true;

      let that = this;
      this.$axios.get("/graph/" + nowid + "/info", {
        cancelToken: new CancelToken((c) => {
          // executor 函数接收一个 cancel 函数作为参数
          that.cancel = c;
        })
      })
        .then(res => {
          if (res.data.code == 200) {
            let nodeData = res.data.data;
            // console.log(nodeData);
            this.codeBase = 'data:image/png;base64,' + nodeData.graphImageBase64Code; //转码
            this.fontSize = 12;
            if (this.fontSize == '' || this.fontSize < nodeData.fontSize) this.fontSize = nodeData.fontSize;
            this.imWidth = nodeData.graphImageWidth;
            this.imHeight = nodeData.graphImageHeight;
            // this.imageheight = this.imHeight;
            // this.imageWidth = this.imWidth;
            this.$emit('imageWidth', this.imWidth);
            this.$emit('imageheight', this.imHeight);
            this.graphImageBackground = nodeData.graphImageBackground;

            this.$emit("graphImageBackground", this.graphImageBackground);//发送背景颜色
            // let _that = that;
            this.$nextTick(() => {
              setTimeout(function () {

                that.$emit('gomid');
              }, 5000)

              if (that.codeBase != '') {
                that.getgraphdata(that.equid, from);
              }
              //    this.addgraphinformation(this.equid);
            })
          } else {
            console.log('请求失败');
            // that.$emit('datafail');
          }

        });
      if (this.myinterval) {
        // console.log('123');
        clearInterval(this.myinterval)
      }
      this.myinterval = setInterval(() => {
        if (this.codeBase != '') {
          clearInterval(this.myinterval)
          //this.$nextTick(() => {
          setTimeout(function () {

            that.$emit('gomid');
          }, 5000)
          that.getgraphdata(that.equid);
          //})
        }
          // console.log('我的编码');
        // console.log('开始定时器', this.codeBase);
        else {
          that.$axios.get("/graph/" + nowid + "/info")
            .then(res => {
              if (res.data.code == 200) {
                // this.$emit('datasuccess');

                let nodeData = res.data.data;
                console.log(nodeData);
                that.codeBase = 'data:image/png;base64,' + nodeData.graphImageBase64Code; //转码

                that.fontSize = 12;
                if (that.fontSize == '' || that.fontSize < nodeData.fontSize) that.fontSize = nodeData.fontSize;

                that.imWidth = nodeData.graphImageWidth;
                that.imHeight = nodeData.graphImageHeight;

                that.$emit('imageWidth', that.imWidth);
                that.$emit('imageheight', that.imHeight);
                that.graphImageBackground = nodeData.graphImageBackground;

                that.$emit("graphImageBackground", that.graphImageBackground);//发送背景颜色
                let _that = that;
                that.$nextTick(() => {
                  setTimeout(function () {

                    _that.$emit('gomid');
                  }, 5000)

                  if (_that.codeBase != '') {
                    clearInterval(_that.myinterval)
                    _that.getgraphdata(_that.equid);
                  }
                })
              } else {
                console.log('请求失败');
              }
            });
        }
      }, 3000);


    },
    //获得概貌图数据
    getgraphdata(id, from) {
      console.log("qdy=>判断实时状态下概貌图请求数据是否为定时启动",)
      window.clearTimeout(this.graphDataTime);
      // $("#gmt").html("");      //清数据
      // $("#information").html("");
      this.listBoxes = [];
      this.listSpan = {};
      var CancelToken = this.$axios.CancelToken;
      if (typeof this.cancel == 'function') {
        this.cancel()
      }
      var nowid = encodeURIComponent(id)
      this.$emit('dataloading');
      let that = this;
      if (this.myinterval) {
        clearInterval(this.myinterval)
      }
      let tmp_res = true;
      // this.myinterval = setInterval(() => {
      if (tmp_res) {
        tmp_res = false;
        that.$axios.get("/graph/" + nowid + "/data"
          , {
            cancelToken: new CancelToken((c) => {
              // executor 函数接收一个 cancel 函数作为参数
              that.cancel = c;
            })
          })
          .then(res => {
            tmp_res = true;
            if (res.data.code == 200) {
              var raised = 0;
              that.$emit('datasuccess');
              let graphData = res.data.data;
              // console.log(graphData)
              if (graphData.listBoxes.length == 0) {
                that.$emit('datanull');
              }
              graphData.equipmentName = graphData.equipmentName || {
                yPos: "",
                width: "",
                equipmentName: "",
                xPos: "",
                height: ""
              };
              // console.log('属性', typeof(Number(graphData.equipmentName.yPos)));
              let tmp_ratio = Math.min(this.imageheight / this.imHeight, this.imageWidth / this.imWidth);
              that.equipmentsName = graphData.equipmentName.equipmentName || '';
              that.equipmentNameTop = 20 || '';
              that.equipmentNameleft = this.imageWidth / 3 + "px" || '';
              that.equipmentNameHight = graphData.equipmentName.height || '';
              that.equipmentNameWidth = (graphData.equipmentName.equipmentName.length * 20) || '';
              that.namefontsize = 9 || '';
              graphData.time = graphData.time || {
                yPos: "",
                width: "",
                time: "",
                xPos: "",
                height: ""
              }
              that.time = graphData.time.time || '';
              if (that.$route.path.includes('/Offline/')) {
                that.time = '巡检时间: ' + timestampToTimeFormat(Number(that.time.slice(-13)));
              }
              that.timeTop = 20 || '';
              that.timeLeft = (this.imageWidth / 3 + graphData.equipmentName.equipmentName.length * 25) + "px" || '';
              that.timeHight = graphData.time.height || '';
              // this.timefontize = Math.ceil(this.fontsize * Math.max(this.ratio, this.ratio1)).toString() + 'px';
              that.timefontize = Math.ceil(9 * tmp_ratio) + "px" || '';
              that.timeWidth = graphData.time.time.length / 1.7 || '';

              that.revInfoList = [];
              for (let key in graphData.revInfo) {
                console.log("key", key)
                let revName = graphData.revInfo[key].revName || '';
                let revValue = graphData.revInfo[key].revValue || '';
                let yPos = Number(graphData.revInfo[key].yPos);
                console.log("ddddddddd")
                that.revInfoList.push({
                  revName: this.translateText("chart.textMap.",revName),
                  revValue: revValue,
                  yPos: yPos
                })
              }

              that.revInfoList.sort((a, b) => {
                return a.yPos - b.yPos
              })

              that.revInfoTop = 50 || '';
              that.revInfoLeft = (this.imageWidth / 3 + graphData.equipmentName.equipmentName.length * 25) + "px" || '';

              that.revfontsize = Math.ceil(9 * tmp_ratio) + "px" || '';
              that.revInfoWidth = this.timeWidth || '';
              // this.revInfoTop=graphData.revInfo.转速.yPos+'px'||'px';
              // this.revInfoLeft=graphData.revInfo.转速.xPos+'px'||'px';
              // this.revInfoHight=graphData.revInfo.转速.height+'px'||'px';
              // this.revInfoWidth=graphData.revInfo.转速.width+'px'||'px'
              that.listBoxes = graphData.listBoxes;

              if (that.listBoxes.length > 0) {
                clearInterval(that.myinterval);
                // console.log('清除定时器开始更新测点数据');
                // that.addgraphinformation(that.equid);
              }
              // that.$nextTick(() => {
              //   //  this.getgraphdata(this.equid);
              //   that.addgraphinformation(this.equid);
              // })
            } else {
              console.log('请求失败');
              that.$emit('datafail');
            }
            this.addgraphinformation(this.equid, from)
          }).catch(e => {
        });
      }
      // }, 3000);


    },

    //没有直接用到的methods
    //获得概貌图
    stopinterval() {
      if (this.interval2) {
        clearInterval(this.interval2);
      }
    },
    mytop() {
      // console.log('打印高度', this.revInfoTop * Math.max(1,Math.min(this.imageheight1 / this.imHeight, this.imageWidth1 / this.imWidth)), this.revInfoHight * Math.min(this.imageheight1 / this.imHeight, this.imageWidth1 / this.imWidth));
      let tmpmax = -1;
      for (let i = 0; i < this.listBoxes.length; i++) {
        if (i == 0) tmpmax = parseInt(this.listBoxes[i].yPos, 10);
        else tmpmax = Math.min(tmpmax, parseInt(this.listBoxes[i].yPos, 10));
      }
      if (Math.floor(tmpmax / this.imHeight * (Math.max(this.imHeight, Math.min(this.imageheight, this.imHeight * (this.imageheight < this.imageWidth ? this.imageheight / this.imHeight : this.imageWidth / this.imWidth))))) > this.imageheight / 2) {
        // console.log('不变了', Math.floor(tmpmax / this.imHeight * (Math.max(this.imHeight, Math.min(this.imageheight, this.imHeight * (this.imageheight < this.imageWidth ? this.imageheight / this.imHeight : this.imageWidth / this.imWidth) )))), this.imageheight);
        return 0;
      } else
        return Math.max(0, Math.floor(tmpmax / this.imHeight * (Math.max(this.imHeight, Math.min(this.imageheight, this.imHeight * (this.imageheight < this.imageWidth ? this.imageheight / this.imHeight : this.imageWidth / this.imWidth))))) - this.revInfoTop * Math.max(1, Math.min(this.imageheight1 / this.imHeight, this.imageWidth1 / this.imWidth)) - this.revInfoHight * Math.min(this.imageheight1 / this.imHeight, this.imageWidth1 / this.imWidth) - 20)

    },
    clearinterval() {
      if (this.myinterval) {
        clearInterval(this.myinterval);
      }
      if (this.interval2) {
        clearInterval(this.interval2);
      }
    },
    dataloading() {

      this.$emit('dataloading');
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
    clearchart() {
      var CancelToken = this.$axios.CancelToken;

      if (typeof this.cancel == 'function') {
        this.cancel()
      }
//   this.$refs.trendg.clearall();

    },

    //没有用到的
    myleft(val) {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      context.font = '24px Avenir Helvetica Arial sans-serif';
      let dimension = context.measureText(val);
      // console.log('标题宽度', dimension.width);
      return (this.imageWidth1 - dimension.width) / 2;
    },
    myLength(val) {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      context.font = '24px Avenir Helvetica Arial sans-serif';
      let dimension = context.measureText(val);
      return dimension.width;
    },
    timeLength(val) {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      context.font = this.fontSize.toString() + 'px Avenir Helvetica Arial sans-serif';
      let dimension = context.measureText(val);
      return dimension.width * 1.5;
    },
    startmyinterval() {

      if (this.interval2) {
        clearInterval(this.interval2);
      }
      this.interval2 = setInterval(() => {
        this.addgraphinformation(this.equid);
      }, 3000)
    },
    calsize(val) {
      let tmpratio;
      if (this.imageheight < this.imageWidth) {
        tmpratio = this.imageheight / this.imHeight;
      } else {
        tmpratio = this.imageWidth / this.imWidth;
      }
      if (val == 1) {
        return this.imHeight * tmpratio + 'px';
      } else {
        return this.imWidth * tmpratio + 'px';
      }
    },

  }
}
</script>

<style lang="scss">


.infromtion {
  // overflow: auto;
  margin: auto;
  position: relative;
  .gmt {
    color: #001429;
  }

  .myclass, .routeMenu {
    position: absolute;

  }

  .routeMenu {
    --marginTop: 0px;
    --direction: row;
    font-family: "微软雅黑", serif;
    height: auto;
    width: auto;
    display: flex;
    flex-direction: var(--direction);
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    position: absolute;
    background-color: rgba(0, 0, 0, 0);
    color: black;

    .sele {
      display: flex;
      // margin-left: 2px;
      width: 70px;
      height: 25px;
      margin-top: var(--marginTop);
      align-items: center;
      justify-content: center;
      background-color: #fff;
    }

    .menu {
      background-color: #fff;
      font-family: "微软雅黑", serif;
      width: calc(100% - 80px);
      margin: 0%;
      line-height: 25px;
      padding-left: 10px;
      cursor: pointer;
      border-bottom: 0;
    }

    li {
      list-style: none;
      padding: 2px 0px;

      img {
        width: 30px;
        height: 15px;
        background-color: #EFEFEF;
      }
    }

    .menu li:hover {
      background-color: #FFE7A2;
    }
  }

  #div_img {
    z-index: 1;

  }

  #div_info {
    z-index: 3;
    margin-left: 50%;

  }

  #div_menu {
    z-index: 4;
  }

  .myname {
    text-align: center;
  }

  .info {
    position: absolute;
    width: 100%;
    z-index: 2;
    display: flex;
    justify-content: center;
  }

  .info table td {
    color: #fff;
  }

  .info td:nth-child(1) {
    font-size: 24px;
    padding-top: 20px;
    padding-right: 30px;
  }


  .equipmentName {

    position: absolute;
    z-index: 1;
    color: #fff;

    margin: 0 auto;

    font-size: 25px;
  }

  .equipmentTime {
    font-size: 15px;

    text-align: right;
    position: absolute;
    z-index: 1;
    color: #fff;

    margin: 0 auto;

  }

  .revInfo {
    font-size: 18px;
    //width: 200px;
    text-align: right;
    position: absolute;
    z-index: 1;
    color: #fff;

    margin: 0 auto;

  }

  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    margin-left: 50%;
    background-color: #061d74;
  }

  ::-webkit-scrollbar-thumb {
    margin-left: 50%;
    background-color: #646563;
  }


  .point_box {
    display: block;
    white-space: nowrap;
    font-size: 12px;
    color: #ececec;
    position: absolute;
    border: 1px solid #fff;
    overflow: auto;
    list-style: none
  }
}
</style>
