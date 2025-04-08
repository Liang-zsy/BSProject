<template>
  <div
    ref="TmyChart"
    id="myTrendChart"
    :style="{ width: '100%', height: '100%' }"
  ></div>
</template>
<script>
import halloween from "../../../static/halloween";
import maxInputMixin from "../../mixins/maxInputMixin";
import commonMixin from "../../mixins/commonMixin";
import toolboxMixin from "../../mixins/toolboxMixin";
import { changeGraphData } from "@/components/ComUtils/ChangeGraphData";
import toolboxTrendGraphMixin from "../../mixins/toolboxTrendGraphMixin";
import graphicMixin from "../../mixins/graphicMixin";
import brushMixin from "../../mixins/brushMixin";
import keepAliveMixin from "@/mixins/keepAliveMixin";
import {
  timestampToTimeFormat,
  timestampToTimeFormatLineBreaks,
  timestampToTimeFormatLineBreaksNoMilliseconds
} from "../../components/ComUtils/TimeFormat";
import reDataZoomMixin from "../../mixins/reDataZoomMixin";
var elementResizeDetectorMaker = require("element-resize-detector");
export default {
  name: "SpeedTrendGraph",
  props: ["nowtimeStatic", "AlarmValueY"],
  mixins: [maxInputMixin, commonMixin, toolboxMixin, toolboxTrendGraphMixin, graphicMixin, brushMixin, keepAliveMixin,reDataZoomMixin],
  data() {
    return {
      offset: '',
      mainCursor: '',//主游标值
      auxiliaryCursor: '',//辅游标值
      mychart: null,
      arrx: [],
      arry: [],
      typename: '趋势图',
      proLine: null, // 上一条线标记
      nowStatic: true,
      refineFlag: false,
      AlarmValueData: [],
      isFull: false,
      isReal: "real",
      nowOption: null,
      // FullScreenName: "全屏",
      FullScreenName: this.translateText("chart.textMap.",'全屏'),
      icon: "M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n" +
        "\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03",
      //icon: "M19.2,179.9,8,30.5A17.93,17.93,0,0,1,24.6,11.3a10.45,10.45,0,0,1,2.5,0L176.5,21.4m-163-3.5L216.4,218.3M577,179.1,588.2,29.7a18.08,18.08,0,0,0-16.6-19.3,10.45,10.45,0,0,0-2.5,0l-149.4,10m162-4.4L379.8,217.3M19.2,419.7,8,569.1a18.08,18.08,0,0,0,16.6,19.3,10.45,10.45,0,0,0,2.5,0l149.4-10.1m-163,3.5L216.4,381.4M419.6,579.2l149.4,10a18.09,18.09,0,0,0,19.2-16.8,10.45,10.45,0,0,0,0-2.5L577,420.6m4.8,163.1-202-201.4",
      maxXInputMixin: {
        // 关闭x轴修改最大值的input框
        show: false,
      },
    };
  },
  computed: {
    myicon() {
      return this.isFull;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    },
  },
  watch: {
    '$i18n.locale'() {
      let xAxis = {
        name: this.flagX == '[时间]' || this.flagX == '[Time]' ? this.translateText('chart.textMap.', '趋势图时间单位') : this.flagX
      }
      let tempTitle = '',tempOffset = '',tempMainCursor = '',tempAuxiliaryCursor = '';
      this.Title.trim().split(' ').forEach(item => tempTitle += this.translateText('chart.textMap.', item)+' ')
      if(this.offset){
        //this.offset没有保存'[]'
        this.offset.trim().split(' ').forEach(item => tempOffset += this.translateText('chart.textMap.', item)+' ')
        tempOffset = '[' + tempOffset + ']'
      }
      if(this.mainCursor){
        tempMainCursor = '[' + this.translateText('chart.textMap.','主游标')+': ' + this.mainCursor
      }
      if(this.auxiliaryCursor){
        tempAuxiliaryCursor = '[' + this.translateText('chart.textMap.','辅游标')+': ' + this.auxiliaryCursor
      }
      let title = [{
        id: 'title',
        text: tempTitle
      },{
        id: 'offset',
        text: tempOffset,
      },{
        id: 'Main-Cursor',
        text: tempMainCursor
      },{
        id: 'Auxiliary-Cursor',
        text: tempAuxiliaryCursor
      }]
      if(this.mychart.getOption().toolbox[0] == undefined) return
      let feature = this.mychart.getOption().toolbox[0].feature;
      if(feature.myCancel) feature.myCancel.title = this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏');
      if(feature.saveAsImage) feature.saveAsImage.title = this.translateText("chart.textMap.",'导出');
      if(feature.myrestore) feature.myrestore.title = this.translateText("chart.textMap.",'细化还原');
      if(feature.brush) feature.brush.title.lineX = this.translateText("chart.textMap.",'细化');
      if(feature.myDataZoomIn) feature.myDataZoomIn.title.lineX = this.translateText("chart.textMap.",'放大');
      if(feature.myDataZoomOut) feature.myDataZoomOut.title = this.translateText("chart.textMap.",'放大还原');
      if(feature.restore) feature.restore.title = this.translateText("chart.textMap.",'还原');
      if (feature.myover) feature.myover.title = this.translateText("chart.textMap.", "历史概貌图")
      if(feature.myPrimarySecondary) feature.myPrimarySecondary.title = this.PrimarySecondary.isMark ? this.translateText("chart.textMap.", "主游标") : this.translateText("chart.textMap.", "辅游标");
      if(feature.myMore) feature.myMore.title = this.translateText("chart.textMap.", "更多");
      if(feature.mybrush) feature.mybrush.title.lineX = this.translateText("chart.textMap.",'细化');
      if(feature.myUseBruchTime) feature.myUseBruchTime.title = this.translateText("chart.textMap.", "使用细化时间");
      if(feature.myMarkPoint) feature.myMarkPoint.title = this.myMarkPoint.state ? this.translateText("chart.textMap.", "取消标点") : this.translateText("chart.textMap.", "标点");
      if(feature.myMark) feature.myMark.title = this.markPoint.isMark ? this.translateText("chart.textMap.", "取消标注") : this.translateText("chart.textMap.", "标注");
      if(feature.myModel) feature.myModel.title = this.modelFlag ? this.translateText("chart.textMap.", "数据点等分") : this.translateText("chart.textMap.", "时间点等分");
      this.mychart.setOption({
        xAxis,
        title,
        toolbox:{
          feature
        }
      })

    },
    nowtimeStatic(data) {
      if(!this.activatedFlag) return ;
      this.nowStatic = data;
    },
    AlarmValueY(data) {
      if(!this.activatedFlag) return ;
      this.AlarmValueData = data;
    },
    myicon(val) {
      if (val == true) {
        this.FullScreenName = this.translateText("chart.textMap.",'退出全屏')
        this.icon = 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M3.3,10.7l2.8-2.7\n' +
          '\t M6.6,10.3V7.8c0-0.2-0.2-0.4-0.4-0.4H3.6 M7.9,6l2.9-2.6 M7.5,3.8l0,2.5c0,0.2,0.2,0.4,0.4,0.4l2.6,0';
      } else {
        this.FullScreenName = this.translateText("chart.textMap.",'全屏')
        this.icon =
          'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n' +
          '\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03';
      }

      var option = {
        toolbox: {
          feature: {
            myCancel: {
              icon: this.icon,
              title: this.FullScreenName,
            },
          },
        },
      };
      this.mychart.setOption(option);
    },
    topiccolor(val) {
      let myseries1 = this.mychart.getOption().series;
      // console.log('我的数据', myseries1);
      for (let item in myseries1) {
        myseries1[item].itemStyle = {
          normal: {
            lineStyle: {
              color: this.$store.state.colorMap[item],
            },
          },
        };
      }
      let option = {
        backgroundColor: this.$store.state.leftconbgcolor,
        color: this.$store.state.colorMap,
        legend: {
          icon: "rect",
          textStyle: {
            rich: {
              a: {
                color: this.$store.state.selectbordercolor,
              }
            }
          }
        },
        series: myseries1,
        toolbox: {
          iconStyle: {
            normal: {
              borderColor: this.$store.state.toolboxcolor,
            },
            emphasis: {
              textFill: this.$store.state.toolboxtextcolor,
            },
          },
        },
        xAxis: {
          axisLine: {
            onZero: false,
          },
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
        },
        yAxis: {
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
        },
        title: [
          {
            id: 'title',
            top: "12px",
            left: "center",
            textStyle: {
              fontSize: 16, //大小
              color: this.$store.state.textcolor,//颜色
              fontFamily: "Microsoft YaHei UI"
            },
          },
          {
            id: 'offset',
            top: "13px",
            left: this.$store.state.grid.left,
            textStyle: {
              fontSize: 10, // 大小
              //color: this.$store.state.textcolor,//颜色
            },
          },
          {
            id: 'Main-Cursor',
            left: this.$store.state.grid.left,
            top: "32px",
            textStyle:{
              fontSize: 10,
              color: this.$store.state.colorMap[0],
            }
          },{
            id: 'Auxiliary-Cursor',
            left: this.mychart.getWidth() * parseFloat(this.$store.state.grid.left) / 100 + 300,
            top: "32px",
            textStyle:{
              fontSize: 10,
              color: this.$store.state.colorMap[1],
            }
          }
        ],
      };
      this.mychart.setOption(option);
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.drawchart();
    });
    const resizeObeserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.$nextTick( () => {
          if(this.activatedFlag) {
            this.mychart.resize();
            this.resizeMaxInput();
            this.updateMarkPoint()
          }
        })
      }
    });
    try {
      resizeObeserver.observe(this.$refs.TmyChart)
    } catch (error) {
      console.log(error)
    }
  },
  methods: {
    drawchart() {
      let that = this;
      if (that.mychart) {
        that.mychart.clear();
        that.arrx = [];
        that.arry = [];
      } else {
        that.echarts.registerTheme("halloween", halloween);
        that.mychart = that.echarts.init(that.$refs.TmyChart, "halloween");
      }
      var defaultoption = {
        backgroundColor: this.$store.state.leftconbgcolor,
        grid: [
          {
            left: this.$store.state.grid.left,
            right: this.$store.state.grid.right,
            top: this.$store.state.grid.top,
            bottom: this.$store.state.grid.trendBottom,
          },
        ],
        tooltip: {
          trigger: "axis",
        },
        legend: {
          icon: "rect",
          show: true,
          textStyle: {
            fontSize: 10,
            color: this.$store.state.topiccolor == 'blue' ? this.$store.state.blueAxisLableColor : this.$store.state.textcolor,
          },
        },
        xAxis: {
          axisLine: {
            onZero: false,
          },
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: "rgba(255,255,255,0.3)",
            },
          },
          type: "category",
        },
        yAxis: {
          boundaryGap: [0.2, 0.2],
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: "rgba(255,255,255,0.3)",
            },
          },
          type: "value",
          splitNumber: 3,
        },
      };
      that.mychart.setOption(defaultoption);
    },
    setchart(flagX, flagY, dataX, dataY, title, type) {
      if(flagY === '[m/s2]') {
        flagY = '[m/s²]';
      }
      if(flagY === '[]') {//当y轴没有单位时，去掉[]
        flagY = '';
      }
      this.offset = ''
      this.mainCursor = ''
      this.auxiliaryCursor =  ''
      this.drawchart();
      this.status = type;
      this.Title = title.indexOf('趋势图') == -1 && title.indexOf('trend') == -1 && title.indexOf('Trend') == -1 ? title + ' 趋势图' : title
      title = ''
      this.Title.trim().split(' ').forEach(item => title += this.translateText('chart.textMap.', item)+' ')
      this.$nextTick(() => {
        this.setchartdata(flagX, flagY, dataX, dataY, title, type);
        this.setChartAfter();
      });
    },
    async setchartdata(flagX, flagY, dataX, dataY, title, type) {
      //flagX: 横轴名称单位, string
      //flagY: 纵轴名称单位， string
      //dataX : 横轴数据 ,  [] 每一项是数据
      //dataY: 纵轴数据 ,  [] 每一项是一个json
      //                       json 内容格式 {
      //                                 name:曲线名称,  string
      //                                 data:曲线数据， []
      //                                 color:曲线颜色， string eg: #*****
      //
      //                             }
      if (dataX.length == 0) {
        this.clearall();
        return
      }
      this.saveGraphData(flagX, flagY, dataX, dataY, title, type, true);
      if (type != "real") {
        if (this.modelFlag) {
          let changeData = changeGraphData(dataX, dataY);
          dataX = changeData.dataX;
          dataY = changeData.dataY;
        }
      }
      this.isReal = type;
      var myseries = [];
      var legenddata = [];
      var tulicolor = [];
      var markLine = null;
      if (dataX.length > 1 || type == "history") {
        markLine = [];
      } else {
        // 如果是实时模式，并且刚来一个数据的时候，画一条线
        markLine = [
          {
            color: this.$store.state.colorMap[i],
            xAxis: dataX[0],
          },
        ];
      }
      // 相当于是便利所有的series
      for (var i = 0; i < dataY.length; ++i) {
        myseries.push({
          id: dataY[i].name,
          name: dataY[i].lableName ? dataY[i].lableName : dataY[i].name,
          data: dataY[i].data,
          type: "line",
          showSymbol: false,
          connectNulls: true,
          itemStyle: {
            normal: {
              lineStyle: {
                color: this.$store.state.colorMap[i],
                width: 1,
              },
            },
          },
          markLine: {
            data: markLine,
          },
          markPoint: {
            name: "显示报警",
            symbolSize: 20,
            symbol:
              "path://M512 456.310154L94.247385 38.557538a39.542154 39.542154 0 0 0-55.689847 0 39.266462 39.266462 0 0 0 0 55.689847L456.310154 512 38.557538 929.752615a39.542154 39.542154 0 0 0 0 55.689847 39.266462 39.266462 0 0 0 55.689847 0L512 567.689846l417.752615 417.752616c15.163077 15.163077 40.290462 15.36 55.689847 0a39.266462 39.266462 0 0 0 0-55.689847L567.689846 512 985.442462 94.247385a39.542154 39.542154 0 0 0 0-55.689847 39.266462 39.266462 0 0 0-55.689847 0L512 456.310154z",
            data: this.AlarmValueData,
            //  color: '#FF0B00'
            itemStyle: {
              color: "#FF0B00",
            },
          },
        });
        //  tulicolor.push(dataY[i].color)
        legenddata.push(myseries[i].name);
        this.arry.push(dataY[i].data);
      }
      var mydatazoom = [];
      if (type != "real") {
        mydatazoom.push({
          type: "inside",
          moveOnMouseMove: false
        });
      }

      //扩大点击响应的范围
      // 当点击图谱区域时，获得当前x轴坐标，并进行波形频谱图重绘
      this.mychart.getZr().off("click");
      this.mychart.getZr().on("click", this.chartClick);

      // 实时图谱放大
      var mytoolbox = {};
      var historytoolbox = {
        itemGap: 8,
        itemSize: 18,
        top: 8,
        right: 5,
        show: true,
        iconStyle: {
          normal: {
            borderColor: this.$store.state.toolboxcolor,
          },
          emphasis: {
            textPadding: this.$store.state.paddingtop,
            textFill: this.$store.state.toolboxtextcolor,
          },
        },
        feature: {
          ...this.getHistoryToolboxFeature(),
          ...this.custombrush(),
          myrestore: {
            show: true,
            // title: "细化还原",
            title: this.translateText("chart.textMap.",'细化还原'),
            icon:"M1.2,4C2.3,1.9,4.5,0.5,7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5c-1.4,0-2.7-0.5-3.8-1.2 M10.9,8.3H8.6\n" +
              "\tc0,0-0.1,0-0.1-0.1L7.3,4.1H7.2L5.7,9.9H5.6l-1.5-4H4L2.9,8.3c0,0,0,0-0.1,0H1.7 M11,7.8c-0.3,0-0.5,0.2-0.5,0.5s0.2,0.5,0.5,0.5\n" +
              "\ts0.5-0.2,0.5-0.5S11.3,7.8,11,7.8z M11,7.7c-0.3,0-0.7,0.3-0.7,0.7S10.6,9,11,9c0.3,0,0.7-0.3,0.7-0.7S11.3,7.7,11,7.7z M0.5,3.1\n" +
              "\tl0.8,1.3c0,0.1,0.2,0.1,0.3,0.1l1.3-0.6",
            // icon: "M27.7,256.7h0a288,288,0,0,0-4.2,61.5c5.6,146.1,122.9,264.5,269,271.5,159.6,7.6,292-117.2,296.7-274.1C594,153.7,461.1,20.1,299.2,24a282.67,282.67,0,0,0-216,108.6M519.6,323.8H426.5a4.11,4.11,0,0,1-3.7-2.3L377.3,227a4,4,0,0,0-5.5-1.8,4.11,4.11,0,0,0-2,2.3L316.9,379a4.16,4.16,0,0,1-5.3,2.5,3.89,3.89,0,0,1-2.5-2.5L259.2,229.2a4.09,4.09,0,0,0-5.2-2.5,4.52,4.52,0,0,0-2.5,2.4L188.8,402.3a4.15,4.15,0,0,1-7.7.1l-29-74.7a4,4,0,0,0-3.8-2.6H80M83.2,7.7l-.6,122.4a3.4,3.4,0,0,0,3.6,3.3l129.6-12.7",
            onclick: ()=> {
              if (this.refineFlag){
                that.$store.state.startTime = that.$store.state.tmpStartTime;
                that.$store.state.endTime = that.$store.state.tmpEndTime;
                that.$emit("cancelRefine");
                this.refineFlag = false
              }
            },
          },
          myCancel: {
            show: true,
            title: this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),
            // title: this.FullScreenName,
            icon: this.icon,
            onclick: function () {
              that.$emit("cancelFull");
              that.$nextTick(() => {
                console.log("name",this.FullScreenName);
                that.updateMarkPoint(this.FullScreenName == '全屏' || this.FullScreenName === 'Full Screen' ? true : false);
              })
            },
          },
          ...this.reDataZoomIn(),
          ...this.reDataZoomOut(),
          restore: {
            show: false,
            title: this.translateText("chart.textMap.",'还原'),
            icon: "M7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7S3.4,0.5,7,0.5z M9.6,7H4.4",
            // icon: "M492.1,539.9H57.2A47.8,47.8,0,0,1,9.4,492.1V57.2A47.8,47.8,0,0,1,57.2,9.4H492.1a47.8,47.8,0,0,1,47.8,47.8V492.1A47.8,47.8,0,0,1,492.1,539.9ZM433.4,171.6H174.1a47.69,47.69,0,0,0-47.7,47.7v74.2m233.8-81.7,71.7-36.3a4.8,4.8,0,0,0,1.3-6.6,5.35,5.35,0,0,0-1.3-1.3l-71.7-36.3M127.9,381H387.2a47.69,47.69,0,0,0,47.7-47.7V259M201,340.7l-72,36.5a4.51,4.51,0,0,0-1.2,6.3,3.45,3.45,0,0,0,1.2,1.2l72,36.5",
          },
          saveAsImage: {
            title: this.translateText("chart.textMap.",'导出'),
            icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M6.3,6.1H4.7\n' +
              '\tL7,8.7l2.3-2.5H7.8l-0.1-3H6.2L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
            // icon: 'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M6.3,6.1H4.7L7,8.7\n' +
            //   '\tl2.3-2.5H7.8V3.5H6.3L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
            //icon: "M279,16.6V444.4M94.6,251.9,265.8,438.8a17.76,17.76,0,0,0,25.2,1.1,11.41,11.41,0,0,0,1.1-1.1L463.3,251.9M6.5,397.1V537.6a23.69,23.69,0,0,0,23.7,23.7H527.7a23.69,23.69,0,0,0,23.7-23.7h0V397.1",
            iconStyle: {
              emphasis: {
                textPadding: [
                  this.$store.state.paddingtop,
                  this.$store.state.paddingright,
                ],
              },
            },
          },
          //概貌图不显示全屏按钮
          // console.log("****************",mytoolbox)
        },
      };
      var realtoolbox = {
        itemGap: 8,
        itemSize: 18,
        top: 8,
        right: 5,
        show: true,
        iconStyle: {
          normal: {
            borderColor: this.$store.state.toolboxcolor,
          },
          emphasis: {
            textPadding: this.$store.state.paddingtop,
            textFill: this.$store.state.toolboxtextcolor,
          },
        },
        feature: {
          //主副游标
          ...this.getPrimarySecondary(),
          ...this.getRealToolboxFeature(),
          // 标注
          // myMark: {
          //   title: '标注',
          //   show: false,
          //   icon: this.markPoint.markIcon,
          //   // 按正常的逻辑来说这个onclick事件应该在历史模式下的，但是不知道为什么历史模式加载的时候不会把这个覆盖
          //   onclick: historytoolbox.feature.myMark.onclick
          // },
          brush: {
            show: false,
            type: ["lineX"],
            title: {
              // lineX: "细化",
              lineX: this.translateText("chart.textMap.",'细化'),
            },
          },
          myrestore: {
            show: false,
            // title: "细化还原",
            title: this.translateText("chart.textMap.",'细化还原'),
            // icon: "M27.7,256.7h0a288,288,0,0,0-4.2,61.5c5.6,146.1,122.9,264.5,269,271.5,159.6,7.6,292-117.2,296.7-274.1C594,153.7,461.1,20.1,299.2,24a282.67,282.67,0,0,0-216,108.6M519.6,323.8H426.5a4.11,4.11,0,0,1-3.7-2.3L377.3,227a4,4,0,0,0-5.5-1.8,4.11,4.11,0,0,0-2,2.3L316.9,379a4.16,4.16,0,0,1-5.3,2.5,3.89,3.89,0,0,1-2.5-2.5L259.2,229.2a4.09,4.09,0,0,0-5.2-2.5,4.52,4.52,0,0,0-2.5,2.4L188.8,402.3a4.15,4.15,0,0,1-7.7.1l-29-74.7a4,4,0,0,0-3.8-2.6H80M83.2,7.7l-.6,122.4a3.4,3.4,0,0,0,3.6,3.3l129.6-12.7",
            icon:"M1.2,4C2.3,1.9,4.5,0.5,7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5c-1.4,0-2.7-0.5-3.8-1.2 M10.9,8.3H8.6\n" +
              "\tc0,0-0.1,0-0.1-0.1L7.3,4.1H7.2L5.7,9.9H5.6l-1.5-4H4L2.9,8.3c0,0,0,0-0.1,0H1.7 M11,7.8c-0.3,0-0.5,0.2-0.5,0.5s0.2,0.5,0.5,0.5\n" +
              "\ts0.5-0.2,0.5-0.5S11.3,7.8,11,7.8z M11,7.7c-0.3,0-0.7,0.3-0.7,0.7S10.6,9,11,9c0.3,0,0.7-0.3,0.7-0.7S11.3,7.7,11,7.7z M0.5,3.1\n" +
              "\tl0.8,1.3c0,0.1,0.2,0.1,0.3,0.1l1.3-0.6",
            onclick: function () {
              that.$emit("cancelRefine");
            },
          },
          myCancel: {
            show: true,
            title: this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),
            // title: this.FullScreenName,
            icon: this.icon,
            onclick: function () {
              that.$emit("cancelFull");
            },
          },
          dataZoom: {
            yAxisIndex: "none",
            show: false,
          },
          restore: {
            show: false,
          },
          saveAsImage: {
            // title: "导出",
            title: this.translateText("chart.textMap.",'导出'),
            icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M6.3,6.1H4.7\n' +
              '\tL7,8.7l2.3-2.5H7.8l-0.1-3H6.2L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
            // icon: 'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M6.3,6.1H4.7L7,8.7\n' +
            //   '\tl2.3-2.5H7.8V3.5H6.3L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
            iconStyle: {
              emphasis: {
                textPadding: [
                  this.$store.state.paddingtop,
                  this.$store.state.paddingright,
                ],
              },
            },
          },
          //概貌图不显示全屏按钮

          // console.log("****************",mytoolbox)
        },
      };
      realtoolbox.feature.myPrimarySecondary.show = false;

      if (type != "real") {
        mytoolbox = historytoolbox;
      } else {
        mytoolbox = realtoolbox;
      }
      let that = this;
      that.arrx = dataX;

      var option = {
        backgroundColor: this.$store.state.leftconbgcolor,
        grid: [
          {
            left: this.$store.state.grid.left,
            right: this.$store.state.grid.right,
            top: this.$store.state.grid.top,
            bottom: this.$store.state.grid.trendBottom,
          },
        ],
        title: [
          {
            id: 'title',
            top: "12px",
            left: "center",
            text: title,
            textStyle: {
              fontSize: 16, //大小
              color: this.$store.state.textcolor,//颜色
              fontFamily: "Microsoft YaHei UI"
            },
          },
          {
            id: 'offset',
            top: "13px",
            left: this.$store.state.grid.left,
            textStyle: {
              fontSize: 10, // 大小
              //color: this.$store.state.textcolor,//颜色
            },
          },
          {
            id: 'Main-Cursor',
            left: this.$store.state.grid.left,
            top: "32px",
            textStyle:{
              fontSize: 10,
              color: this.$store.state.colorMap[0],
            }
          },{
            id: 'Auxiliary-Cursor',
            left: this.mychart.getWidth() * parseFloat(this.$store.state.grid.left) / 100 + 300,
            top: "32px",
            textStyle:{
              fontSize: 10,
              color: this.$store.state.colorMap[1],
            }
          }
        ],
        tooltip: {
          trigger: "axis",
          confine: true,
          formatter:(params)=>{
            let list = []
            let listItem = ''
            //  console.log('提示框', params, this.modelFlag);
            if (this.modelFlag && type != 'real') {
              // console.log(params[0].axisValue);
              this.$store.state.tooltipTime = params[0].axisValue;
            }
            for (let i = 0; i < params.length; i++) {
              list.push(
                this.modelFlag && type != 'real' ?
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                  params[i].color + ';margin-right: 5px;border-radius: 50%;}"></i><span style="  display:inline-block;">' +
                  params[i].seriesName + ': ' +
                  '</span> ' + params[i].value[1] :
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                  params[i].color + ';margin-right: 5px;border-radius: 50%;}"></i><span style="  display:inline-block;">' +
                  params[i].seriesName + ': ' +
                  '</span> ' + params[i].value
              )

            }
            list.unshift(this.modelFlag && type != 'real' ?
              timestampToTimeFormatLineBreaks(params[0].axisValue):
              params[0].axisValue);
            listItem = list.join('<br>')
            return '<div class="showBox">' + listItem + '</div>'
          }
        },
        //dataZoom: mydatazoom,
        toolbox: mytoolbox,
        color: this.$store.state.colorMap,
        brush: {
          xAxisIndex: "all",
          transformable: false,
          outOfBrush: {
            colorAlpha: 0.1,
          },
          throttleType: "debounce",
          throttleDelay: 2000,
        },
        legend: {
          left: 50,
          bottom: 6,
          data: legenddata.map(function (name) {
            return {
              name: name,
              icon: 'rect',  // 使用矩形图标
            };
          }),
          itemWidth: 12,
          itemHeight: 6,
          itemGap: 24,  // 图例项之间的间距
          formatter: function (name) {
            return '{a|' + name + '}';
          },
          textStyle: {
            rich: {
              a: {
                verticalAlign: 'middle',  // 使图标垂直居中
                lineHeight: 12,  // 根据图标高度调整行高
                fontSize: 12,
                color: this.$store.state.selectbordercolor,
                padding: [0, 0, 3, 4],  // 调整文字和图标的间距
              }
            }
          }
        },

        xAxis: {
          axisLine: {
            onZero: false,
          },
          name: flagX == '[时间]' ? this.translateText("chart.textMap.",'趋势图时间单位') : flagX,
          data: dataX,
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          nameTextStyle: {
            padding:[0,0,0,-14]
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
            color: this.$store.state.selectbordercolor,
            formatter: (value, index) => {
              // console.log(value);
              return  this.modelFlag && type != 'real' ? timestampToTimeFormatLineBreaksNoMilliseconds(value) : value.replace(' ', '\n');
            },
            showMinLabel: true,
            showMaxLabel: true,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
          type: this.modelFlag && type != 'real' ? "time" : "category",
          min: this.modelFlag && type != 'real' ? dataY[0].data[0][0] : null,
          max: this.modelFlag && type != 'real' ? dataY[0].data[dataY[0].data.length - 1][0] : null,
          boundaryGap: false,
        },
        yAxis: {
          name: flagY,
          nameTextStyle: {
            padding:[0,45,-6,0]
          },
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
            showMinLabel: true,
            showMaxLabel: true,
            color: this.$store.state.selectbordercolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
          type: "value",
        },
        series: myseries,
        OriginalSeries: myseries,
        OriginalXAxisData: dataX,
        useDataZoomBegin :[new Date(dataX[0]).getTime()],
        useDataZoomEnd: [new Date(dataX[dataX.length - 1]).getTime()]
      };
      // this.$store.state.useDataZoomBegin[0] = new Date(dataX[0]).getTime()
      // this.$store.state.useDataZoomEnd[0] = new Date(dataX[dataX.length - 1]).getTime()
      this.allseries = myseries;
      that.nowOption = option;

      that.mychart.setOption(option);
      if (that.modelFlag) {
        // that.mychart.on("brushEnd", that.renderBrushed);
        that.mychart.on("brushEnd", function (params) {
          that.renderBrushed(params);

          // 清除刷选框的定时器
          if (that.clearBrushTimer) {
            clearTimeout(that.clearBrushTimer);
          }

          // 设置定时器，过固定时间后清除刷选框
          that.clearBrushTimer = setTimeout(() => {
            that.mychart.dispatchAction({
              type: 'brush',
              areas: [] // 清除所有刷选区域
            });
          }, 0); // 0.5秒后清除
        });
      } else {
        // that.mychart.on("brushSelected", that.renderBrushed);
        that.mychart.on("brushSelected", function (params) {
          that.renderBrushed(params);

          // 清除刷选框的定时器
          if (that.clearBrushTimer) {
            clearTimeout(that.clearBrushTimer);
          }

          // 设置定时器，过固定时间后清除刷选框
          that.clearBrushTimer = setTimeout(() => {
            that.mychart.dispatchAction({
              type: 'brush',
              areas: [] // 清除所有刷选区域
            });
          }, 0); // 0.5秒后清除
        });
      }

      if (this.brushState) {
        that.mychart.dispatchAction({
          type: "takeGlobalCursor",
          key: "brush",
          brushOption: {
            brushType: "lineX",
          },
        });
      }
      //绑定鼠标事件
      that.mychart.on("mousedown", function (param) {
        if (param.event.event.button === 2 && that.nowStatic == false) {
          if (
            that.$route.path == "/UnitOverviewMap" ||
            that.$route.path ==
            "/RotatingMachineryGraph/RotatingOverviewGrap" ||
            that.$route.path == "/DieselMonitorSystem/OverviewGraph" ||
            that.$route.path == "/ReciprocatMachineryGraph/OverviewGraph1"
          ) {
            //e中有当前节点信息
            showMenu(param, [
              {
                name: "历史概貌图",
                fn: function () {
                  that.$emit("historyInformation", param);
                },
              },
            ]);
          }
        }
        if (
          param.event.event.button === 2 &&
          that.$route.path == "/AlarmQueryGraph"
        ) {
          //e中有当前节点信息
          showMenu(param, [
            {
              name: "报警信息显示",
              fn: function () {
                alert("触发-菜单2" + param.data);
              },
            },
          ]);
        }
      });
      var style_ul =
        "padding:0px;margin:0px;border: 1px solid #ccc;background-color: #fff;position: absolute;left: 0px;top: 0px;z-index: 2;display: none;";
      var style_li =
        "list-style:none;padding: 5px; cursor: pointer; padding: 5px 20px;margin:0px;";
      var style_li_hover = style_li + "background-color: #00A0E9; color: #fff;";

      //右键菜单容器
      var menubox = $(
        "<div class='echartboxMenu' style='" +
        style_ul +
        "'><div style='text-align:center;background:#ccc'></div><ul style='margin:0px;padding:0px;'></ul></div>"
      ).appendTo($(document.body));
      //移除浏览器右键菜单
      that.mychart.getDom().oncontextmenu = menubox[0].oncontextmenu =
        function () {
          return false;
        };
      //点击其他位置隐藏菜单
      $(document).click(function () {
        menubox.hide();
      });
      //显示菜单
      var showMenu = function (e, menus) {
        $("div", menubox).text(e.name);
        var menulistbox = $("ul", menubox).empty();
        $(menus).each(function (i, item) {
          var li = $("<li style='" + style_li + "'>" + item.name + "</li>")
            .mouseenter(function () {
              $(this).attr("style", style_li_hover);
            })
            .mouseleave(function () {
              $(this).attr("style", style_li);
            })
            .click(function () {
              item["fn"].call(this);
              menubox.hide();
            });
          menulistbox.append(li);
        });
        menubox
          .css({
            left: event.x,
            top: event.y,
          })
          .show();
      };
    },
    setIsFull(data) {
      this.isFull = data;
    },
    clearall() {
      let that = this;
      if (that.mychart) {
        that.mychart.clear();
      }
      var defaultoption = {
        backgroundColor: this.$store.state.leftconbgcolor,
        grid: {
          left: this.$store.state.grid.left,
          right: this.$store.state.grid.right,
          top: this.$store.state.grid.top,
          bottom: this.$store.state.grid.trendBottom,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          icon: "rect",
          y: "bottom",
          x: "left",
          // 图例样式修改
          // itemWidth: 9,
          // itemHeight: 9, // 图例图形高度
          textStyle: {
            fontSize: 10,
            // color: this.$store.state.textcolor,
            color: this.$store.state.topiccolor == 'blue' ? this.$store.state.blueAxisLableColor : this.$store.state.textcolor,
          },
        },
        xAxis: {
          axisLine: {
            onZero: false,
          },
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
            // color: this.$store.state.textcolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
          type: "category",
        },
        yAxis: {
          boundaryGap: [0.2, 0.2],
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
            // color: this.$store.state.textcolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
          type: "value",
          splitNumber: 3,
          min: 0,
          max: 3,
        },
      };
      that.mychart.setOption(defaultoption);
    },
    changechart(x, y) {
      //x 横轴新添数据
      // y 一个[] 纵轴每项新增的数据
      let that = this;
      if (that.arrx[that.arrx.length - 1] === x) {
        return;
      }
      let mychart = this.mychart.getOption();
      let change = 0;
      for (let i = 0; i < mychart.series.length; i++) {
        if (mychart.series[i].markLine != null) {
          mychart.series[i].markLine = null;
          change = 1;
        }
      }
      if (change) {
        this.mychart.setOption(mychart, true);
      }
      if (that.arrx.length >= 50) {
        that.arrx.shift();
        for (var i = 0; i < that.arry.length; ++i) {
          that.arry[i].shift();
        }
      }
      var newseries = [];
      that.arrx.push(x);
      for (var i = 0; i < that.arry.length; ++i) {
        that.arry[i].push(y[i]);
        newseries.push({
          data: that.arry[i],
          itemStyle: {
            normal: {
              lineStyle: {
                width: 1,
              },
            },
          },
        });
      }
      var option = {
        xAxis: {
          axisLine: {
            onZero: false,
          },
          data: this.arrx,
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
          },
        },
        yAxis: {
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
          },
        },
        series: newseries,
      };
      that.mychart.setOption(option);
    },
    renderBrushed(params) {
      this.delALLMarkPoint();
      // console.log(params, params.batch)
      let left, right;
      if (!this.modelFlag) {
        if (params.batch[0].areas.length == 0) {
          //没有选框
          return;
        }
        left = params.batch[0].areas[0]["coordRange"][0];
        right = params.batch[0].areas[0]["coordRange"][1];
        if (left < 0) {
          left = 0;
        }
        if (right >= this.arrx.length) {
          right = this.arrx.length - 1;
        }
        let tmpLeft = left;
        let tmpRight = right;
        left = this.arrx[left];
        if (!parseInt(left)) {
          let flag = true;
          for (let item = tmpLeft - 1; item >= 0; item--) {
            if (parseInt(this.arrx[item])) {
              left = this.arrx[item];
              tmpLeft = item;
              flag = false;
              break;
            }
          }
          if (flag) {
            for (let item = tmpLeft + 1; item < this.arrx.length; item++) {
              if (parseInt(this.arrx[item])) {
                left = this.arrx[item];
                tmpLeft = item;
                flag = false;
                break;
              }
            }
          }
        }
        right = this.arrx[right];
        if (!parseInt(right)) {
          let flag = true;
          for (let item = tmpRight + 1; item < this.arrx.length; item++) {
            if (parseInt(this.arrx[item])) {
              right = this.arrx[item];
              tmpRight = item;
              flag = false;
              break;
            }
          }
          if (flag) {
            for (let item = tmpRight - 1; item >= 0; item--) {
              if (parseInt(this.arrx[item])) {
                right = this.arrx[item];
                tmpRight = item;
                flag = false;
                break;
              }
            }
          }
        }
        if (tmpLeft > tmpRight) {
          left = this.arrx[tmpRight];
          right = this.arrx[tmpLeft];
        }
      } else {
        left = params.areas[0]["coordRange"][0];
        right = params.areas[0]["coordRange"][1];
      }
      console.log(left, right)
      // console.log(this.arrx.length)
      // console.log(new Date(left).valueOf(), new Date(right).valueOf())
      if (this.$store.state.startTime) {
        this.$store.state.tmpStartTime = this.$store.state.startTime;
      }
      this.$store.state.startTime = "";
      if (this.$store.state.endTime) {
        this.$store.state.tmpEndTime = this.$store.state.endTime;
      }
      this.$store.state.endTime = "";
      if(this.zoomState == true){
        this.$store.state.useDataZoom = true
        this.$emit("dataZoom",new Date(left).getTime(), new Date(right).getTime());
      }else if (this.brushState){
        this.$store.state.useBruchTimeBegin = new Date(left).valueOf()
        this.$store.state.useBruchTimeEnd = new Date(right).valueOf()
        this.$store.state.useBruchTime = false
        this.refineFlag = true

        this.$emit("refine", new Date(left).valueOf(), new Date(right).valueOf());
      }

    },

  }
}
</script>
<style scoped></style>
