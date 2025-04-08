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
import keyPressSlotMixin from "@/mixins/keyPressSlotMixin";
import keepAliveMixin from "@/mixins/keepAliveMixin";
import {
  timestampToTimeFormat,
  timestampToTimeFormatLineBreaks,
  timestampToTimeFormatLineBreaksNoMilliseconds,
  timeStringToTimestamp
} from "../../components/ComUtils/TimeFormat";
import reDataZoomMixin from "../../mixins/reDataZoomMixin";
import {numberUtilsMixin} from "../../mixins/numberUtilsMixin";


var elementResizeDetectorMaker = require("element-resize-detector");

export default {
  name: "AlarmTrendGraph",
  props: ["nowtimeStatic", "AlarmValueY"],
  mixins: [maxInputMixin, commonMixin, toolboxMixin, toolboxTrendGraphMixin, graphicMixin, brushMixin, keyPressSlotMixin, keepAliveMixin,reDataZoomMixin,numberUtilsMixin],
  data() {
    return {
      status: '',
      Title: '',
      mychart: null,
      typename: this.translateText("chart.textMap.",'趋势图'),
      arrx: [],
      arry: [],
      offset: '',
      mainCursor: '',//主游标值
      auxiliaryCursor: '',//辅游标值
      legendData: [],//保存图例名称
      nowStatic: true,
      proLine: null, // 上一条线标记
      refineFlag: false,
      changeBigFlag: false,
      AlarmValueData: [],
      positionMap: ['insideEndTop', 'insideEndBottom', 'insideEndTop', 'insideEndBottom'],
      isFull: false,
      isReal: "real",
      nowOption: null,
      allseries: [],
      aline: [],
      iconName: this.translateText("chart.textMap.",'全屏'),
      myIcon: "M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n" +
        "\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03",
      // myIcon:
      //   'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n' +
      //   '\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03',
      maxXInputMixin: {
        // 关闭x轴修改最大值的input框
        show: false,
      },
    };
  },
  computed: {
    topiccolor() {
      return this.$store.state.topiccolor;
    },
    myicon() {
      return this.isFull;
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
      if(this.mychart.getOption().toolbox == undefined) return
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


      let legend = [{
        data: this.legendData.map((name) => {
          return {
            name: this.translateText('chart.textMap.',name),
            icon: 'rect',  // 使用矩形图标
          };
        })
      }]
      let series = this.legendData.map((name) => {
        return {
          id: name,
          type: 'line',
          name: this.translateText('chart.textMap.',name),
        };
      })

      this.mychart.setOption({
        xAxis,
        title,
        toolbox:{
          feature
        },
        legend,
        series
      });
      console.log("暗杀收到阿松大阿松大啊",this.mychart.getOption())
    },
    nowtimeStatic(data) {
      if(!this.activatedFlag) return ;
      this.nowStatic = data;
    },
    AlarmValueY(data) {
      if(!this.activatedFlag) return ;
      console.log('接收到的报警数据', data);
      this.AlarmValueData = data;
    },
    isFull(data) {
      if(!this.activatedFlag) return ;
      let mytop, mybottom;
      if (this.isReal == "history") {
        let tmpFullScreenName, tmpicon;
        if (this.isFull) {
          tmpFullScreenName = "退出全屏";
          this.iconName = tmpFullScreenName;
          tmpicon = 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M3.3,10.7l2.8-2.7\n' +
            '\t M6.6,10.3V7.8c0-0.2-0.2-0.4-0.4-0.4H3.6 M7.9,6l2.9-2.6 M7.5,3.8l0,2.5c0,0.2,0.2,0.4,0.4,0.4l2.6,0';
          this.myIcon = tmpicon;
        } else {
          // console.log('ok')
          tmpFullScreenName = "全屏";
          this.iconName = tmpFullScreenName;
          tmpicon =
            'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n' +
            '\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03';
          // tmpicon =
          //   'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M3.29,10.73L6.1,8.06\n' +
          //   '\t M6.59,10.31V7.84c0-0.22-0.18-0.39-0.39-0.39h-2.6 M7.95,6.03L10.8,3.4 M7.49,3.78L7.46,6.25c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03';
          this.myIcon = tmpicon;
          // this.nowOption['toolbox']['feature']['myCancel']['title'] ='全屏';
          // this.nowOption['toolbox']['feature']['myCancel']['icon'] =  "M19.2,179.9,8,30.5A17.93,17.93,0,0,1,24.6,11.3a10.45,10.45,0,0,1,2.5,0L176.5,21.4m-163-3.5L216.4,218.3M577,179.1,588.2,29.7a18.08,18.08,0,0,0-16.6-19.3,10.45,10.45,0,0,0-2.5,0l-149.4,10m162-4.4L379.8,217.3M19.2,419.7,8,569.1a18.08,18.08,0,0,0,16.6,19.3,10.45,10.45,0,0,0,2.5,0l149.4-10.1m-163,3.5L216.4,381.4M419.6,579.2l149.4,10a18.09,18.09,0,0,0,19.2-16.8,10.45,10.45,0,0,0,0-2.5L577,420.6m4.8,163.1-202-201.4";
          // this.$set(this.iconPath, "path://M512.015052 32.633132c-264.662531 0-479.24645 214.629075-479.24645 479.366868s214.568867 479.38192 479.24645 479.38192c264.647479 0 479.231398-214.644128 479.231398-479.38192S776.662531 32.633132 512.015052 32.633132zM512.015052 931.474232c-231.231633 0-419.338762-188.197442-419.338762-419.45918 0-231.27679 188.107129-419.444128 419.338762-419.444128S931.338762 280.72321 931.338762 512.015052C931.338762 743.27679 743.14132 931.474232 512.015052 931.474232zM721.90269 321.334c-19.357107-12.68899-45.322123-7.255152-58.011113 12.177216L461.635396 642.607791l-96.695223-89.530384c-16.993914-15.669322-43.545965-14.660826-59.290548 2.333088-15.759635 17.054123-14.675878 43.561017 2.333088 59.275496l133.633279 123.668734 1.565427 0.978392 3.130854 3.221167 5.764986 2.227723 6.8939 2.799706 6.999265 1.068705 10.054858-0.120417 4.079142-0.948288 11.755755-4.891959 1.836366-1.369749 7.194943-5.193003 3.371689-5.509099 0.165574-0.255887L734.034749 379.46553C746.693635 360.033162 741.259797 334.02299 721.90269 321.334z")
        }
        let option = {
          toolbox: {
            feature: {
              myCancel: {
                icon: tmpicon,
                title: this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),
              },
            },
          },
        };
        this.mychart.setOption(option);
      }
    },
    topiccolor(val) {
      let myseries1 = this.allseries;
      for (let item in myseries1) {
        if (myseries1[item].itemStyle) {
          // myseries1[item].itemStyle = {
          //   normal: {
          //     lineStyle: {
          //       color: this.$store.state.colorMap[item - 1]
          //     }
          //   }
          // }
          if (myseries1[item].itemStyle.normal.lineStyle.color == "#00FF00" && this.$store.state.topiccolor == 'white') {
            myseries1[item].itemStyle.normal.lineStyle.color = "#0000FF";
          } else if (
            myseries1[item].itemStyle.normal.lineStyle.color == "#0000FF"
          ) {
            myseries1[item].itemStyle.normal.lineStyle.color = "#00FF00";
          }
        }

        if (myseries1[item].markPoint) {
          myseries1[item].markPoint = {
            label: {
              color: this.$store.state.markcolor,
              textBorderColor: this.$store.state.markbordercolor,
              textBorderWidth: 2,
            },
          };
          // myseries1[item].markPoint.label.color = this.$store.state.markcolor;
          // myseries1[item].markPoint.textBorderColor = this.$store.state.markbordercolor;
          // myseries1[item].markPoint.textBorderWidth = 2;
        }
        // myseries1[item].markPoint = {
        //   label: {
        //     color: this.$store.state.markcolor,
        //     textBorderColor: this.$store.state.markbordercolor,
        //     textBorderWidth: 2,
        //   },
        // };

        if (myseries1[item].markLine)
          if (
            myseries1[item].markLine.data.length > 0 &&
            myseries1[item].markLine.data[0].xAxis
          ) {
            // console.log(myseries1[item].markLine);
            // myseries1[item].markLine = {
            //   lineStyle:{
            //       color: this.$store.state.textcolor,
            //     },
            // };
            myseries1[item].markLine.lineStyle.color =
              this.$store.state.textcolor;
          }
      }
      this.allseries = myseries1;
      console.log("换肤后的", myseries1);
      let option = {
        backgroundColor: this.$store.state.leftconbgcolor,
        color: this.$store.state.colorMap,
        legend: {
          icon: "circle",
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
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
            // color: this.$store.state.topiccolor == 'blue' ? this.$store.state.blueAxisLableColor : this.$store.state.textcolor,
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
            // color: this.$store.state.textcolor,
            // color: this.$store.state.topiccolor == 'blue' ? this.$store.state.blueAxisLableColor : this.$store.state.textcolor,
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
            top: '12',
            left: "center",
            textStyle: {
              fontSize: 16, //大小
              color: this.$store.state.textcolor
            },
          },
          {
            id: 'offset',
            top: '13',
            left: this.$store.state.grid.left,
            text: "",
            textStyle: {
              fontSize: 10, //大小
              fontFamily: "Microsoft YaHei UI"
            },
          },
          {
            id: 'Main-Cursor',
            left: this.$store.state.grid.left,
            top: "32px",
            textStyle:{
              fontSize: 10,
              color: this.$store.state.primarySecondaryColor[0],
            }
          },{
            id: 'Auxiliary-Cursor',
            left: this.mychart.getWidth() * parseFloat(this.$store.state.grid.left) / 100 + 300,
            top: "32px",
            textStyle:{
              fontSize: 10,
              color: this.$store.state.primarySecondaryColor[1],
            }
          }
        ],
      };
      this.mychart.setOption(option);
    },
    myicon(val) {
      if (val == true) {
        this.FullScreenName = this.translateText("chart.textMap.",'退出全屏')
        this.icon = 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M3.3,10.7l2.8-2.7\n' +
          '\t M6.6,10.3V7.8c0-0.2-0.2-0.4-0.4-0.4H3.6 M7.9,6l2.9-2.6 M7.5,3.8l0,2.5c0,0.2,0.2,0.4,0.4,0.4l2.6,0';
        // this.icon =
        //   'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M3.29,10.73L6.1,8.06\n' +
        //   '\t M6.59,10.31V7.84c0-0.22-0.18-0.39-0.39-0.39h-2.6 M7.95,6.03L10.8,3.4 M7.49,3.78L7.46,6.25c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03';
        //"M393,48.24,381.73,197.59a18,18,0,0,0,16.61,19.29,17.8,17.8,0,0,0,2.53,0l149.44-10m-162.08,4.42L590.16,10M207,549.69l11.17-149.37a18,18,0,0,0-16.63-19.27,17.52,17.52,0,0,0-2.51,0L49.59,391.16m163.12-3.52L9.84,588";
      } else {
        this.FullScreenName = this.translateText("chart.textMap.",'全屏')
        this.icon =
          'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n' +
          '\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03';
        // this.icon =
        //   'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n' +
        //   '\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03';
        //"M19.2,179.9,8,30.5A17.93,17.93,0,0,1,24.6,11.3a10.45,10.45,0,0,1,2.5,0L176.5,21.4m-163-3.5L216.4,218.3M577,179.1,588.2,29.7a18.08,18.08,0,0,0-16.6-19.3,10.45,10.45,0,0,0-2.5,0l-149.4,10m162-4.4L379.8,217.3M19.2,419.7,8,569.1a18.08,18.08,0,0,0,16.6,19.3,10.45,10.45,0,0,0,2.5,0l149.4-10.1m-163,3.5L216.4,381.4M419.6,579.2l149.4,10a18.09,18.09,0,0,0,19.2-16.8,10.45,10.45,0,0,0,0-2.5L577,420.6m4.8,163.1-202-201.4";
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
  },
  mounted() {
    this.$nextTick(function () {

      this.drawchart();
    });
    //this.$store.state.prelines=[]
    // var erd = elementResizeDetectorMaker();
    // let that = this;
    // erd.listenTo(this.$refs.TmyChart, function (element) {
    //   var width = element.offsetWidth;
    //   var height = element.offsetHeight;
    //   // console.log('trenddh')
    //   // console.log('123')
    //   that.$nextTick(function () {
    //     // console.log("Size: " + width + "x" + height)
    //     //使echarts尺寸重置
    //     if(that.activatedFlag) {
    //       that.mychart.resize();
    //       that.resizeMaxInput();
    //     }
    //   });
    // });

    const resizeObeserver = new ResizeObserver(entries => {
      // console.log('Size changed', entries);
      for (let entry of entries) {
        const cr = entry.contentRect;
        // console.log('Element:', entry.target);
        // console.log(`Element size: ${cr.width}px x ${cr.height}px`);
        this.$nextTick(() => {
          // console.log("Size: " + cr.width + "x" + cr.height)
          //使echarts尺寸重置
          if(this.activatedFlag) {
            this.mychart.resize();
            this.resizeMaxInput()
            this.updateMarkPoint()
          }
        })
      }
    });


    resizeObeserver.observe(this.$refs.TmyChart);
  },
  methods: {
    /**
     * 在图上画条线，lines是位置坐标
     * @param lines 格式 [2022-01-25 10:26:14.069, 2022-01-25 10:26:14.069]
     */
    // drawLine(lines) {
    //   let option = {
    //     series:[]
    //   }
    //
    //   let op = this.mychart.getOption();
    //   let data = []
    //   // 处理当前要添加的线条
    //   for(let line of lines) {
    //     data.push({
    //       xAxis: line,
    //     })
    //   }
    //   // 获取图标上之前的markLine标记，并处理其他标记线条，防止删除之前的标记
    //   // let allMarkLine = op.series[0].markLine
    //   // if(allMarkLine) {
    //   //   // 处理报警线的数据 如果图标中没有报警线，删除即可
    //   //   for(let d of allMarkLine.data) {
    //   //     // d的样例 = { "name": "高报", "yAxis": 120 }
    //   //     if(d.name && d.name.indexOf('高报') !== -1) {
    //   //       console.log('高报', d, allMarkLine)
    //   //       data.push({
    //   //         ...d, // 展开数据
    //   //         lineStyle: { // 高报对应的样式
    //   //           color: 'red'
    //   //         }
    //   //       })
    //   //     }
    //   //   }
    //   // }
    //
    //
    //
    //   option.series[0] = {
    //     type: 'line',
    //     markLine: {
    //       lineStyle: {
    //         color: this.$store.state.textcolor,
    //         type: 'solid',
    //       },
    //       animation: false, // 关闭动画
    //       symbol: ['none', 'none'],
    //       data
    //     }
    //   }
    //
    //   this.mychart.setOption(option)
    // },

    /**
     * 在图上画条线，保留上一条线
     * @param lines 2022-01-25 10:26:14.069
     */
    // drawLineAndProLine(line) {
    //   if(line === this.proLine) return
    //   console.log('happen->趋势drawLineAndPro', line, this.proLine)
    //   if(this.proLine) {
    //     this.drawLine([line, this.proLine])
    //     this.timeSub(line, this.proLine)
    //   } else {
    //     this.drawLine([line])
    //   }
    //   this.proLine = line; // 上一条线的位置
    // },

    /**
     * 显示两个时间的差
     * 需要修改optin的title，添加第二个标题，通过修改第二个标题实现显示功能
     * @update 更新日期2022-03-18 09:06:05
     * @param time1
     * @param time2
     */
    // timeSub(time1, time2) {
    //   // 计算时间差
    //   if(new Date(time1).getTime() < new Date(time2).getTime()) {
    //     // 交换
    //     const t = time1
    //     time1 = time2
    //     time2 = t
    //   }
    //
    //   // 计算y轴的差值
    //   const op = this.mychart.getOption()
    //   const y1 = op.xAxis[0].data.indexOf(time1)
    //   const y2 = op.xAxis[0].data.indexOf(time2)
    //   // 幅值差量
    //   const subFuzhi = op.series[0].data[y2] - op.series[0].data[y1]
    //
    //   const dateEnd = new Date(time1)
    //   const dateBegin = new Date(time2)
    //   const dateDiff = dateEnd.getTime() - dateBegin.getTime()// 时间差的毫秒数
    //   const dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000))// 计算出相差天数
    //   const leave1 = dateDiff % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
    //   const hours = Math.floor(leave1 / (3600 * 1000))// 计算出小时数
    //   // 计算相差分钟数
    //   const leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
    //   const minutes = Math.floor(leave2 / (60 * 1000))// 计算相差分钟数
    //   // 计算相差秒数
    //   const leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
    //   const seconds = Math.round(leave3 / 1000)
    //
    //   const titles = op.title
    //   titles[1].text = `[差量${dayDiff}天${hours}时${minutes}分${seconds}秒,${subFuzhi.toFixed(2)}${op.yAxis[0].name.substring(1, op.yAxis[0].name.length - 1)}]`
    //   const option = {
    //     title: titles
    //   }
    //   this.mychart.setOption(option)
    // },

    /**
     * 图表鼠标单击事件处理
     * 使用方法，任意位置注册即可
     * this.mychart.getZr().off("click");
     * this.mychart.getZr().on("click", this.chartClick);
     * @param params
     */
    // chartClick(params) {
    //   const pointInPixel = [params.offsetX, params.offsetY];
    //   if (this.mychart.containPixel("grid", pointInPixel)) {
    //     let pointInGrid = this.mychart.convertFromPixel(
    //       { seriesIndex: 0 },
    //       pointInPixel
    //     );
    //     //X轴序号
    //     var xIndex = pointInGrid[0];
    //     //Y轴序号
    //     var yIndex = pointInGrid[1];
    //     //获取当前图表的option
    //     var op = this.mychart.getOption();
    //     //获得图表中我们想要的数据封装为param {name: '2022-03-05 07:51:38.785', seriesName: '2级A壳体振动V'}
    //     var param = {};
    //     param.name = op.xAxis[0].data[xIndex];
    //
    //     // 获取离鼠标最近的 series 的线的名字，以便提供给其他组件
    //     var min = Number.MAX_VALUE;
    //     var seriesNameIndex = 0;
    //     for (var i = 0; i < op.series.length; i++) {
    //       if (Math.abs(op.series[i].data[xIndex] - yIndex) < min) {
    //         min = Math.abs(op.series[i].data[xIndex] - yIndex);
    //         seriesNameIndex = i;
    //       }
    //     }
    //
    //     param.seriesName = op.series[seriesNameIndex].name;
    //
    //     // 画两条线
    //     this.drawLineAndProLine(param.name)
    //
    //     // 告诉父组件刷新其他页面
    //     this.$emit("chartinfo", param);
    //   }
    // },

    setIsFull(data) {
      this.isFull = data;
    },
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
      var defaultoption =  {
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
          icon: "circle",
          y: "bottom",
          x: "center",
          itemWidth: 9,
          itemHeight: 9,
          textStyle: {
            // color: this.$store.state.textcolor,
            color: this.$store.state.topiccolor == 'blue' ? this.$store.state.blueAxisLableColor : this.$store.state.textcolor,
          },
        },
        xAxis: {
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
              color: "rgba(255,255,255,0.3)",
            },
          },
          type: "category",
        },
        yAxis: {
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
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
          splitNumber: 3, //y轴5个刻度
        },
      };
      // console.log('default start')
      that.mychart.setOption(defaultoption);
      // console.log('default ok')
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
          icon: "circle",
          y: "bottom",
          x: "center",
          itemWidth: 9,
          itemHeight: 9,
          textStyle: {
            // color: this.$store.state.textcolor,
            color: this.$store.state.topiccolor == 'blue' ? this.$store.state.blueAxisLableColor : this.$store.state.textcolor,
          },
        },
        xAxis: {
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
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
            // color: this.$store.state.textcolor,
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
          splitNumber: 3, //y轴5个刻度
          min: 0,
          max: 3,
        },
      };
      that.mychart.setOption(defaultoption);
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
      //                             }
      this.saveGraphData(flagX, flagY, dataX, dataY, title, type, true);
      if (type != "real") {
        if (this.modelFlag) {
          let changeData = changeGraphData(dataX, dataY);
          dataX = changeData.dataX;
          dataY = changeData.dataY;
        }
      }
      let that = this;
      this.isReal = type;
      var myseries = [];
      this.legendData = []
      var tulicolor = [];
      // console.log('????',dataY);
      // let amax = '', amin = '';
      // for(let item in dataY) {
      //   for(let _item in dataY[item].data) {
      //     if(amax == '') {
      //       amax = dataY[item].data[_item];
      //       amin = dataY[item].data[_item];
      //     } else {
      //       amax = Math.max(amax, dataY[item].data[_item]);
      //       amin = Math.min(amin, dataY[item].data[_item]);
      //     }
      //   }
      // }
      // console.log('最大值', amax);
      // if(amin > 0) {
      //   amin = 0;
      // }
      let myYmin = "", myYmax = "";
      for (var i = 0; i < dataY.length; ++i) {
        myseries.push({
          id: dataY[i].name,
          name: this.translateText('chart.textMap.',dataY[i].name),
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

          markPoint: {
            name: "显示报警",
            symbolSize: 20,
            symbol:
              "path://M512 456.310154L94.247385 38.557538a39.542154 39.542154 0 0 0-55.689847 0 39.266462 39.266462 0 0 0 0 55.689847L456.310154 512 38.557538 929.752615a39.542154 39.542154 0 0 0 0 55.689847 39.266462 39.266462 0 0 0 55.689847 0L512 567.689846l417.752615 417.752616c15.163077 15.163077 40.290462 15.36 55.689847 0a39.266462 39.266462 0 0 0 0-55.689847L567.689846 512 985.442462 94.247385a39.542154 39.542154 0 0 0 0-55.689847 39.266462 39.266462 0 0 0-55.689847 0L512 456.310154z",
            //       data:[
            //         {type:'max',name:'最大值'},
            //        // {type:'min',name:'最小值'}
            // ],
            //  color: '#FF0B00'
            data: this.AlarmValueData[i],
            itemStyle: {
              color: "#FF0B00",
            },
            label: {
              color: this.$store.state.markcolor,
              textBorderColor: this.$store.state.markbordercolor,
              textBorderWidth: 2,
            },
          },
        });
        //  tulicolor.push(dataY[i].color)
        this.legendData.push(dataY[i].name)
        this.arry.push(dataY[i].data);
        // console.log(legenddata);
        let model = this.modelFlag && type != 'real'
        for (let item in dataY[i].data) {
          if (myYmin == "") myYmin = model ? dataY[i].data[item][1] : dataY[i].data[item];
          else myYmin = Math.min(myYmin, model ? dataY[i].data[item][1] : dataY[i].data[item]);
          if (myYmax == "") myYmax = model ? dataY[i].data[item][1] : dataY[i].data[item];
          else myYmax = Math.max(myYmax, model ? dataY[i].data[item][1] : dataY[i].data[item]);
        }
      }
      var mydatazoom = [];
      if (type != "real") {
        mydatazoom.push({
          type: "inside",
          moveOnMouseMove: false
        });
      }

      if (type != "real") {
        var mytoolbox = {
          itemGap: 8,
          itemSize: 18,
          top: 8,
          right: 5,
          //   show: false,
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
            ...this.getTrendGraphHistoryToolboxFeature(),
            // myMark: {
            //   title: '标注',
            //   show: true,
            //   icon: this.markPoint.markIcon,
            //   iconStyle: {
            //     borderColor: this.markPoint.isMark ?'#74ACC8' : this.$store.state.toolboxcolor
            //   },
            //   onclick:  ()=>{
            //     console.log('实时模式下的')
            //     let option = {
            //       series: [{
            //         markPoint: {
            //           data: []
            //         },
            //       }],
            //       toolbox: {
            //         feature: {
            //           myMark: {
            //             iconStyle: {
            //               borderColor: '#74ACC8'
            //             }
            //           }
            //         }
            //       }
            //     }
            //     if(this.markPoint.isMark) {
            //       // console.log('当前是标记状态下')
            //       // 如果当前是标记状态,需要取消标记
            //       this.markPoint.isMark = false;
            //       option.toolbox.feature.myMark.iconStyle.borderColor = this.$store.state.toolboxcolor
            //       this.markPointFunEnd()
            //     } else {
            //       this.markPoint.isMark = true;
            //       this.markPoint.markPointX = []
            //     }
            //     this.mychart.setOption(option)
            //   }
            // },
            ...this.custombrush(),
            myrestore: {
              show: true,
              // title: '细化还原',
              // icon: "path://M192 631.3c-6.9 0-13.8-2.9-18.8-8.5l-67.7-76.7c-9.1-10.4-8.1-26.2 2.2-35.3 10.4-9.1 26.2-8.1 35.3 2.2l67.7 76.7c9.1 10.4 8.1 26.2-2.2 35.3-4.7 4.3-10.6 6.3-16.5 6.3z m7.3 5.3c-7 0-14-2.9-18.9-8.7-9-10.5-7.9-26.2 2.6-35.3l81.7-70.5c10.5-9 26.2-7.9 35.3 2.6s7.9 26.2-2.6 35.3l-81.7 70.5c-4.8 4.1-10.6 6.1-16.4 6.1z m333.1 273.2c-16.6 0-30-13.4-30-30s13.4-30 30-30c164.9 0 299.1-134.2 299.1-299.1S697.3 251.6 532.4 251.6c-164.9 0-299.1 134.2-299.1 299.1 0 16.6-13.4 30-30 30s-30-13.4-30-30c0-48.5 9.5-95.5 28.2-139.8 18.1-42.8 44-81.2 76.9-114.1 33-33 71.4-58.9 114.1-76.9 44.3-18.7 91.3-28.2 139.8-28.2s95.5 9.5 139.8 28.2c42.8 18.1 81.2 44 114.1 76.9 33 33 58.9 71.4 76.9 114.1 18.7 44.3 28.2 91.3 28.2 139.8 0 48.5-9.5 95.5-28.2 139.8-18.1 42.8-44 81.2-76.9 114.1-33 33-71.4 58.9-114.1 76.9-44.2 18.8-91.2 28.3-139.7 28.3z",
              title: this.translateText("chart.textMap.",'放大还原'),
              icon: "M7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7S3.4,0.5,7,0.5z M9.6,7H4.4",
              // icon: "path://M192 631.3c-6.9 0-13.8-2.9-18.8-8.5l-67.7-76.7c-9.1-10.4-8.1-26.2 2.2-35.3 10.4-9.1 26.2-8.1 35.3 2.2l67.7 76.7c9.1 10.4 8.1 26.2-2.2 35.3-4.7 4.3-10.6 6.3-16.5 6.3z m7.3 5.3c-7 0-14-2.9-18.9-8.7-9-10.5-7.9-26.2 2.6-35.3l81.7-70.5c10.5-9 26.2-7.9 35.3 2.6s7.9 26.2-2.6 35.3l-81.7 70.5c-4.8 4.1-10.6 6.1-16.4 6.1z m333.1 273.2c-16.6 0-30-13.4-30-30s13.4-30 30-30c164.9 0 299.1-134.2 299.1-299.1S697.3 251.6 532.4 251.6c-164.9 0-299.1 134.2-299.1 299.1 0 16.6-13.4 30-30 30s-30-13.4-30-30c0-48.5 9.5-95.5 28.2-139.8 18.1-42.8 44-81.2 76.9-114.1 33-33 71.4-58.9 114.1-76.9 44.3-18.7 91.3-28.2 139.8-28.2s95.5 9.5 139.8 28.2c42.8 18.1 81.2 44 114.1 76.9 33 33 58.9 71.4 76.9 114.1 18.7 44.3 28.2 91.3 28.2 139.8 0 48.5-9.5 95.5-28.2 139.8-18.1 42.8-44 81.2-76.9 114.1-33 33-71.4 58.9-114.1 76.9-44.2 18.8-91.2 28.3-139.7 28.3z",
              // icon: "M27.7,256.7h0a288,288,0,0,0-4.2,61.5c5.6,146.1,122.9,264.5,269,271.5,159.6,7.6,292-117.2,296.7-274.1C594,153.7,461.1,20.1,299.2,24a282.67,282.67,0,0,0-216,108.6M519.6,323.8H426.5a4.11,4.11,0,0,1-3.7-2.3L377.3,227a4,4,0,0,0-5.5-1.8,4.11,4.11,0,0,0-2,2.3L316.9,379a4.16,4.16,0,0,1-5.3,2.5,3.89,3.89,0,0,1-2.5-2.5L259.2,229.2a4.09,4.09,0,0,0-5.2-2.5,4.52,4.52,0,0,0-2.5,2.4L188.8,402.3a4.15,4.15,0,0,1-7.7.1l-29-74.7a4,4,0,0,0-3.8-2.6H80M83.2,7.7l-.6,122.4a3.4,3.4,0,0,0,3.6,3.3l129.6-12.7",
              // icon:"M1.2,4C2.3,1.9,4.5,0.5,7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5c-1.4,0-2.7-0.5-3.8-1.2 M10.9,8.3H8.6\n" +
              //   "\tc0,0-0.1,0-0.1-0.1L7.3,4.1H7.2L5.7,9.9H5.6l-1.5-4H4L2.9,8.3c0,0,0,0-0.1,0H1.7 M11,7.8c-0.3,0-0.5,0.2-0.5,0.5s0.2,0.5,0.5,0.5\n" +
              //   "\ts0.5-0.2,0.5-0.5S11.3,7.8,11,7.8z M11,7.7c-0.3,0-0.7,0.3-0.7,0.7S10.6,9,11,9c0.3,0,0.7-0.3,0.7-0.7S11.3,7.7,11,7.7z M0.5,3.1\n" +
              //   "\tl0.8,1.3c0,0.1,0.2,0.1,0.3,0.1l1.3-0.6",
              onclick: () =>{
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
              // icon:"M19.2,179.9,8,30.5A17.93,17.93,0,0,1,24.6,11.3a10.45,10.45,0,0,1,2.5,0L176.5,21.4m-163-3.5L216.4,218.3M577,179.1,588.2,29.7a18.08,18.08,0,0,0-16.6-19.3,10.45,10.45,0,0,0-2.5,0l-149.4,10m162-4.4L379.8,217.3M19.2,419.7,8,569.1a18.08,18.08,0,0,0,16.6,19.3,10.45,10.45,0,0,0,2.5,0l149.4-10.1m-163,3.5L216.4,381.4M419.6,579.2l149.4,10a18.09,18.09,0,0,0,19.2-16.8,10.45,10.45,0,0,0,0-2.5L577,420.6m4.8,163.1-202-201.4",
              icon: this.myIcon,

              onclick: function () {
                that.$emit("cancelFull");
              },
            },
            // ...this.reDataZoomIn(),
            // ...this.reDataZoomOut(),
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
              iconStyle: {
                emphasis: {
                  textPadding: [
                    this.$store.state.paddingtop,
                    this.$store.state.paddingright,
                  ],
                },
              },
            },
            ...this.getAlarmLine()
          },
        };
      } else {
        var mytoolbox = {
          itemGap: 8,
          itemSize: 18,
          top: 8,
          right: 5,
          //   show: false,
          iconStyle: {
            normal: {
              borderColor: this.$store.state.toolboxcolor,
            },
            emphasis: {
              textPadding: this.$store.state.paddingtop,
            },
          },
          feature: {
            ...this.getRealToolboxFeature(),
            // myMark: {
            //   title: '标注',
            //   show: false,
            //   icon: this.markPoint.markIcon,
            //   // 按正常的逻辑来说这个onclick事件应该在历史模式下的，但是不知道为什么历史模式加载的时候不会把这个覆盖
            //   onclick: historytoolbox.feature.myMark.onclick
            // },
            /*  dataZoom: {
                  yAxisIndex: "none"
                },
                restore: {
                  show: true
                },*/
            saveAsImage: {
              title: this.translateText("chart.textMap.", '导出'),
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
            myAlarmLine: {
              show: true,
              title: this.alarmFlag ? this.translateText('chart.textMap.', '显示报警线') : this.translateText('chart.textMap.', '隐藏报警线'),
              icon: "M0.5999999999999996 7a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z M3.8 6.6L4.2 6.6 M10 10L3.7 10 M4.7 4.6L5 5 M7 4L7 4.4 M9 4.8L9.3 4.5 M9.7 6.6L10.2 6.6 M6.7 7.8L6.7 8.7 M8.5,9.6l0-2.6C8.3,5.3,5.8,5.3,5.6,7v2.6",

              iconStyle: {
                emphasis: {
                  textPadding: [
                    this.$store.state.paddingtop,
                    this.$store.state.paddingright,
                  ],
                },
              },
              onclick: () => {
                let option = {
                  toolbox: {
                    feature: {
                      myAlarmLine: {
                        iconStyle: {
                          borderColor: '#74ACC8'
                        }
                      }
                    }
                  }
                }
                if (!that.alarmFlag) {
                  option.toolbox.feature.myAlarmLine.iconStyle.borderColor = null
                  option.toolbox.feature.myAlarmLine.title = that.translateText('chart.textMap.', '显示报警线')
                } else {
                  option.toolbox.feature.myAlarmLine.title = that.translateText('chart.textMap.', '隐藏报警线')
                }
                that.mychart.setOption(option)
                if (that.alarmFlag) {
                  that.handleAlarm(1);
                  that.alarmFlag = false;
                } else {
                  that.handleAlarm(2);
                  that.alarmFlag = true;
                }
                this.updateMarkPoint()
              }
            }
          },
        };
      }
      this.zoomState = false;
      that.arrx = dataX;
      let clearBrushTimer; // 定义定时器变量
      let left , right
      if(this.$store.state.startTime && this.$store.state.endTime){
        left = this.$store.state.startTime
        right = this.$store.state.endTime
      }else if(this.$store.state.useBruchTimeBegin && this.$store.state.useBruchTimeEnd){
        left = this.$store.state.useBruchTimeBegin
        right = this.$store.state.useBruchTimeEnd
      }else{
        left = dataX[0]
        right = dataX[dataX.length - 1]
      }
      var option = {
        backgroundColor: this.$store.state.leftconbgcolor,
        grid: {
          left: this.$store.state.grid.left,
          right: this.$store.state.grid.right,
          top: this.$store.state.grid.top,
          bottom: this.$store.state.grid.trendBottom,
        },
        title: [
          {
            id: 'title',
            top: '12',
            left: "center",
            text: title,
            textStyle: {
              fontSize: 16, //大小
              color: this.$store.state.textcolor
            },
          },
          {
            id: 'offset',
            top: '13',
            left: this.$store.state.grid.left,
            text: "",
            textStyle: {
              fontSize: 10, //大小
              fontFamily: "Microsoft YaHei UI"
            },
          },
          {
            id: 'Main-Cursor',
            left: this.$store.state.grid.left,
            top: "32px",
            textStyle: {
              fontSize: 10,
              color: this.$store.state.primarySecondaryColor[0],
            }
          }, {
            id: 'Auxiliary-Cursor',
            left: this.mychart.getWidth() * parseFloat(this.$store.state.grid.left) / 100 + 300,
            top: "32px",
            textStyle:{
              fontSize: 10,
              color: this.$store.state.primarySecondaryColor[1],
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
            if (this.modelFlag) {
              // console.log(params[0].axisValue);
              this.$store.state.tooltipTime = params[0].axisValue;
            }
            for (let i = 0; i < params.length; i++) {
              list.push(
                this.modelFlag ?
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                  params[i].color + ';margin-right: 5px;border-radius: 50%;}"></i><span style="  display:inline-block;">' +
                  params[i].seriesName + ': ' +
                  '</span> ' + parseFloat(params[i].value[1]).toFixed(3) :
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                  params[i].color + ';margin-right: 5px;border-radius: 50%;}"></i><span style="  display:inline-block;">' +
                  params[i].seriesName + ': ' +
                  '</span> ' + parseFloat(params[i].value).toFixed(3)
              )

            }
            list.unshift(this.modelFlag ?
              timestampToTimeFormatLineBreaks(params[0].axisValue):
              params[0].axisValue);
            listItem = list.join('<br>')
            return '<div class="showBox">' + listItem + '</div>'
          }
        },
        dataZoom:[{
          type: "inside",         //详细配置可见echarts官网
          zoomLock: true,
          disabled: true, // 禁用内部的缩放功能
        }],
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
          data: this.legendData.map((name) => {
            return {
              name: this.translateText('chart.textMap.',name),
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
          name: flagX == '[时间]' || this.flagX == '[Time]' ? this.translateText('chart.textMap.', '趋势图时间单位') : flagX,
          nameTextStyle: {
            padding:[0,0,0,-14]
          },
          data: dataX,
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
            showMinLabel: true,
            showMaxLabel: true,
            // color: this.$store.state.textcolor,
            color: this.$store.state.selectbordercolor,
            formatter: (value, index) => {
              // console.log(value);
              return  this.modelFlag ? timestampToTimeFormatLineBreaksNoMilliseconds(value) : value.replace(' ', '\n');
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
          type: this.modelFlag ? "time" : "category",
          min: this.modelFlag ? left : dataX[0],
          max: this.modelFlag ? right : dataX[dataX.length - 1]
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
            showMinLabel: true,
            showMaxLabel: true,
            // color: this.$store.state.textcolor,
            color: this.$store.state.selectbordercolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dotted", //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
          max: myYmax < 0 ? Math.ceil(myYmax * 0.8) : Math.ceil(myYmax * 1.2),
          min: myYmin < 0 ? Math.floor(myYmin * 1.2) : 0,
          type: "value",
          splitNumber: 3, //y轴5个刻度


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
      console.log("初始的", myseries);
      that.nowOption = option;
      console.log("option",option)
      that.mychart.setOption(option);
      this.resizeMaxInput();
      if(this.alarmFlag){
        that.handleAlarm(this.alarmFlag)
      }
      if (that.modelFlag) {
        // that.mychart.on("brushEnd", that.renderBrushed);

        that.mychart.off("brushEnd");
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
        that.mychart.off("brushSelected");
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

      // that.mychart.on("dataZoom", () => {
      //   // console.log('放大');
      //   that.updateMarkPoint()
      // })
      if (this.brushState) {
        that.mychart.dispatchAction({
          type: "takeGlobalCursor",
          key: "brush",
          brushOption: {
            brushType: "lineX",
          },
        });
      }
      that.mychart.off("click");
      //扩大点击响应的范围
      // 当点击图谱区域时，获得当前x轴坐标，并进行波形频谱图重绘
      this.mychart.getZr().off("click");
      this.mychart.getZr().on("click", this.chartClick);



      // //绑定鼠标事件
      // that.mychart.getZr().on("contextmenu", function (param) {
      //   if (that.$route.path.indexOf("AlarmQueryGraph") != -1) {
      //     let myName = "";
      //     if (that.alarmFlag) {
      //       myName = that.translateText('chart.textMap.','显示报警线');
      //     } else {
      //       myName = that.translateText('chart.textMap.','隐藏报警线');
      //     }
      //     showMenu(param, [
      //       {
      //         name: myName,
      //         fn: function () {
      //           if (that.alarmFlag) {
      //             that.handleAlarm(1);
      //             that.alarmFlag = false;
      //           } else {
      //             that.handleAlarm(2);
      //             that.alarmFlag = true;
      //           }
      //         },
      //       },
      //     ]);
      //   }
      //   // param = that.swithToEchartsEvent(param)
      //   // if(param === null) {
      //   //   return ;
      //   // }
      //   // console.log('我裂开了', param, that.alarmFlag);
      //   //
      //   // that.mychart.on("mousedown", function (param) {
      //   // if (param.event.event.button === 2 && that.nowStatic == false) {
      //   //   if (that.$route.path == '/UnitOverviewMap') {
      //   //     //e中有当前节点信息
      //   //     showMenu(param, [
      //   //       {
      //   //         "name": "历史概貌图",
      //   //         "fn": function () {
      //   //           that.$emit('historyInformation', param)
      //   //         }
      //   //       },
      //   //     ]);
      //   //   }
      //   // }
      //   // if (param.event.event.button === 2) {
      //   //   //e中有当前节点信息
      //   //   showMenu(param, [
      //   //     {
      //   //       "name": "报警信息显示",
      //   //       "fn": function () {
      //   //         alert("触发-菜单2" + param.data);
      //   //       }
      //   //     }
      //   //   ]);
      //   // }
      //
      //   // })
      // });
      // var style_ul =
      //   "padding:0px;margin:0px;border: 1px solid #ccc;background-color: #fff;position: absolute;left: 0px;top: 0px;z-index: 2;display: none;";
      // var style_li =
      //   "list-style:none;padding: 5px; cursor: pointer; padding: 5px 20px;margin:0px;";
      // var style_li_hover = style_li + "background-color: #00A0E9; color: #fff;";



      //移除浏览器右键菜单
      that.mychart.getDom().oncontextmenu =
        function () {
          return false;
        };

    },
    setchart(flagX, flagY, dataX, dataY, title, type) {
      if(flagY === '[m/s2]') {
        flagY = '[m/s²]';
      }
      if(flagY === '[]') {//当y轴没有单位时，去掉[]
        flagY = '';
      }
      this.drawchart();
      this.offset = ''
      this.mainCursor = ''
      this.auxiliaryCursor =  ''
      this.status = type
      this.Title = title.indexOf('趋势图') == -1 && title.indexOf('trend') == -1 && title.indexOf('Trend') == -1 ? title + ' 趋势图' : title
      title = ''
      this.Title.trim().split(' ').forEach(item => title += this.translateText('chart.textMap.', item)+' ')
      this.$nextTick(() => {
        // console.log(flagX, flagY, dataY, dataX);
        this.setchartdata(flagX, flagY, dataX, dataY, title, type);
        this.setChartAfter();
        console.log("aoifaoidoinf",this.mychart.getOption())
      });
    },
    changechart(x, y) {
      //x 横轴新添数据
      // y 一个[] 纵轴每项新增的数据
      let that = this;
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
        });
      }
      var option = {
        xAxis: {
          data: this.arrx,
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
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
            // color: this.$store.state.textcolor,
            color: this.$store.state.selectbordercolor,
          },
        },
        series: newseries,
      };
      that.mychart.setOption(option);
    },
    renderBrushed(params) {
      // this.delALLMarkPoint();
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

      console.log("测试是否有",left, right)
      let Data = this.mychart.getOption().series[0].data;
      let hasData = false;
      for(let i in Data){
        let t = timeStringToTimestamp(Data[i][0]);
        if (t<=right && t>=left){
          hasData = true;
          break;
        }
      }
      if(!hasData){
        this.$parent.$emit("brushdatanull")
        return;
      }
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
        // this.$store.state.useDataZoom = true
        this.$emit("dataZoom",new Date(left).valueOf(), new Date(right).valueOf());
      }else if (this.brushState){
        this.$store.state.useBruchTimeBegin = new Date(left).valueOf()
        this.$store.state.useBruchTimeEnd = new Date(right).valueOf()
        this.$store.state.useBruchTime = false
        this.refineFlag = true

        this.$emit("refine", new Date(left).valueOf(), new Date(right).valueOf());
      }

    },

  },
};
</script>

<style scoped>
</style>
