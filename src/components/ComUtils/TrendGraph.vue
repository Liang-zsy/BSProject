<template>
  <div
    ref="TmyChart"
    id="myTrendChart"
    :style="{ width: '100%', height: 'calc(100% - 1px)' }"
  ></div>
</template>

<script>
import halloween from "../../../static/halloween";
import maxInputMixin from "../../mixins/maxInputMixin";
import toolboxMixin from "../../mixins/toolboxMixin";
import commonMixin from "../../mixins/commonMixin";
import graphicMixin from '@/mixins/graphicMixin'
import brushMixin from '@/mixins/brushMixin'
import {changeGraphData, revertGraphData} from '@/components/ComUtils/ChangeGraphData'
import toolboxTrendGraphMixin from "../../mixins/toolboxTrendGraphMixin";
import keyPressSlotMixin from '@/mixins/keyPressSlotMixin'
import keepAliveMixin from "@/mixins/keepAliveMixin";
import reDataZoomMixin from "../../mixins/reDataZoomMixin";

var elementResizeDetectorMaker = require("element-resize-detector");
export default {
  name: "TrendGraph",
  props: ["nowtimeStatic", "AlarmValueY"],
  mixins: [maxInputMixin, commonMixin, toolboxMixin, toolboxTrendGraphMixin, graphicMixin, brushMixin, keyPressSlotMixin, keepAliveMixin,reDataZoomMixin],
  data() {
    return {
      Title: '',
      mainCursor: '',//主游标值
      auxiliaryCursor: '',//辅游标值
      offset: '',
      status: "", //实时或者历史
      typename: this.translateText("chart.textMap.",'趋势图'),
      alarmFlag: true,
      alarmLineOption: null,  // 报警线配置
      allseries: [],
      aline: [],
      refineFlag: false,
      mychart: null,
      arrx: [],
      arry: [],
      ymin: "",
      ymax: "",
      iscan: false,
      mycolor: "grey",
      nowStatic: true,
      AlarmValueData: [],
      positionMap: ['insideEndTop', 'insideEndBottom', 'insideEndTop', 'insideEndBottom'],
      maxXInputMixin: { // 关闭x轴修改最大值的input框
        show: false
      },
      isFull: false,
      isReal: "real",
      nowOption: null,
      legendData: [],//保存图例名称
      FullScreenName: this.translateText("chart.textMap.",'全屏'),
      icon: "M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n" +
        "\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03",
      //icon: "M19.2,179.9,8,30.5A17.93,17.93,0,0,1,24.6,11.3a10.45,10.45,0,0,1,2.5,0L176.5,21.4m-163-3.5L216.4,218.3M577,179.1,588.2,29.7a18.08,18.08,0,0,0-16.6-19.3,10.45,10.45,0,0,0-2.5,0l-149.4,10m162-4.4L379.8,217.3M19.2,419.7,8,569.1a18.08,18.08,0,0,0,16.6,19.3,10.45,10.45,0,0,0,2.5,0l149.4-10.1m-163,3.5L216.4,381.4M419.6,579.2l149.4,10a18.09,18.09,0,0,0,19.2-16.8,10.45,10.45,0,0,0,0-2.5L577,420.6m4.8,163.1-202-201.4",
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
        name: this.flagX == '[时间]' || this.flagX == '[Time]' ? this.translateText("chart.textMap.",'趋势图时间单位') : this.flagX
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
      if(feature.mybrush) feature.mybrush.title.lineX = this.translateText("chart.textMap.", "细化");
      if(feature.myUseBruchTime) feature.myUseBruchTime.title = this.translateText("chart.textMap.", "使用细化时间");
      if(feature.myMarkPoint) feature.myMarkPoint.title = this.myMarkPoint.state ? this.translateText("chart.textMap.", "取消标点") : this.translateText("chart.textMap.", "标点")
      if(feature.myMark) feature.myMark.title = this.markPoint.isMark ? this.translateText("chart.textMap.", "取消标注") : this.translateText("chart.textMap.", "标注")
      if(feature.myModel) feature.myModel.title = this.modelFlag ? this.translateText("chart.textMap.", "数据点等分") : this.translateText("chart.textMap.", "时间点等分")

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

    },
    nowtimeStatic(data) {
      if(!this.activatedFlag) return ;
      this.nowStatic = data;
    },
    AlarmValueY(data) {
      if(!this.activatedFlag) return ;
      this.AlarmValueData = data;
      // console.log("this.AlarmValueData",this.AlarmValueData)
    },
    myicon(val) {
      if(!this.activatedFlag) return ;
      if (val == true) {
        this.FullScreenName = this.translateText("chart.textMap.",'退出全屏');
        this.icon = 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M3.3,10.7l2.8-2.7\n' +
          '\t M6.6,10.3V7.8c0-0.2-0.2-0.4-0.4-0.4H3.6 M7.9,6l2.9-2.6 M7.5,3.8l0,2.5c0,0.2,0.2,0.4,0.4,0.4l2.6,0';
      } else {
        this.FullScreenName = this.translateText("chart.textMap.",'全屏');
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
      this.mychart.resize();
    },
    topiccolor(val) {
      let myseries = [];
      let myseries1 = this.allseries;
      // console.log("我的颜色", myseries1);
      for (let item in myseries1) {
        if (myseries1[item].itemStyle) {
          console.log(myseries1[item].itemStyle.normal.lineStyle.color);
          if (myseries1[item].itemStyle.normal.lineStyle.color == "#00FF00" && this.$store.state.topiccolor == 'white') {
            myseries1[item].itemStyle.normal.lineStyle.color = "#0000FF";
          } else if (
            myseries1[item].itemStyle.normal.lineStyle.color == "#0000FF"
          ) {
            myseries1[item].itemStyle.normal.lineStyle.color = "#00FF00";
          }
        }
        if (myseries1[item].markPoint)
          myseries1[item].markPoint = {
            label: {
              color: this.$store.state.markcolor,
              textBorderColor: this.$store.state.markbordercolor,
              textBorderWidth: 2,
            },
          };
        if (myseries1[item].markLine)
          if (
            myseries1[item].markLine.data &&
            myseries1[item].markLine.data.length > 0 &&
            myseries1[item].markLine.data[0].xAxis
          ) {
            if (
              myseries1[item].markLine.lineStyle &&
              myseries1[item].markLine.lineStyle.color
            )
              myseries1[item].markLine.lineStyle.color =
                this.$store.state.textcolor;
          }
      }
      this.allseries = myseries1;
      let option = {
        backgroundColor: this.$store.state.leftconbgcolor,
        color: this.$store.state.colorMap,
        legend: {
          textStyle: {
            rich: {
              a: {
                color: this.$store.state.selectbordercolor,
              }
            }
          },
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
            // color: this.$store.state.textcolor,
            color: this.$store.state.selectbordercolor,
            overflow: 'break', // 文本超出宽后进行换行
            width: 70,
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
        title: [{
          id: 'title',
          top: "12px",
          left: "center",
          textStyle: {
            fontSize: 16, //大小
            color: this.$store.state.textcolor,//颜色
            fontFamily: "Microsoft YaHei UI"

          },
        },{
          id: 'offset',
          top: "13px",
          left: this.$store.state.grid.left,
          textStyle:{
            fontSize: 10,
          }
        },{
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
        }],
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
        const cr = entry.contentRect;
        // console.log('Element:', entry.target);
        // console.log(`Element size: ${cr.width}px x ${cr.height}px`);
        this.$nextTick( () => {
          // console.log("Size: " + cr.width + "x" + cr.height)
          //使echarts尺寸重置
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

    let option = {
      backgroundColor: this.$store.state.leftconbgcolor,
      color: this.$store.state.colorMap,
      legend: {
        icon: 'rect',
        textStyle: {
          // color: this.$store.state.textcolor,
          color: this.$store.state.topiccolor == 'blue' ? this.$store.state.blueAxisLableColor : this.$store.state.textcolor,
        },
      },

      toolbox: {
        iconStyle: {
          normal: {
            borderColor: this.$store.state.toolboxcolor,
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
          // color: this.$store.state.textcolor,
          overflow: 'break', // 文本超出宽后进行换行
          width: 70,
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
          // color: this.$store.state.textcolor,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dotted", //'dotted'虚线 'solid'实线，
            color: this.$store.state.linecolor,
          },
        },
      },
    };
    // this.mychart.setOption(option);


  },
  methods: {
    /* 用于合并图标的option和报警线的option*/
    mergeOption(option1, option2) {
      if(this.alarmFlag || typeof option2.series == 'undefined' || option2.series.length === 0)
        return option1;
      // 假设 option1 和 option2 是需要合并的两个选项对象

      let markLines = option2.series.map(s => s.markLine);
      // 合并 series，只添加 markLine
      let mergedSeries = option1.series.map((s, index) => {
        // 确保不会因为 index 越界而引起错误
        if (index < markLines.length) {
          return { ...s, markLine: markLines[index] };
        }
        return s;
      });
      option1.series = mergedSeries;


      // 特殊处理 yAxis
      let yAxis1 = option1.yAxis || {};
      let yAxis2 = option2.yAxis || {};
      option1.yAxis = {
        ...yAxis1, // 基于 option1 的 yAxis 配置
        max: Math.max(yAxis1.max || 0, yAxis2.max || 0), // 取两者中的最大值
        min: Math.min(yAxis1.min || 0, yAxis2.min || 0), // 取两者中的最小值
        // 如果有其他 yAxis 相关的配置也需要合并，可以在这里添加
      };
      return option1;
    },
    handleAlarm(val, type) {
      if (val == 1) {
        // console.log('显示报警线', this.aline);
        if (this.aline.length > 0) {
          let amax = 0,
            amin = 999999;
          let tmp_data = [];
          let linedata = [];

          let mySeries = this.mychart.getOption().series;

          // console.log(mySeries, mySeries.length);
          for (let _item in mySeries) {
            for (let item in mySeries[_item].data) {
              // console.log(mySeries[_item].data[item]);
              if (this.modelFlag && this.status != 'real' && this.$route.path.indexOf('StartStopGraph') == -1) {
                amax = Math.max(amax, mySeries[_item].data[item][1]);
                amin = Math.min(amin, mySeries[_item].data[item][1]);
              } else {
                amax = Math.max(amax, mySeries[_item].data[item]);
                amin = Math.min(amin, mySeries[_item].data[item]);
              }
            }
          }
          this.aline.sort((a, b) => {
            return b['yAxis'] - a['yAxis'];
          })
          for (const i in this.aline) {
            this.aline[i].label = {
              position: this.positionMap[i]
            }
            linedata.push(this.aline[i]);
            tmp_data.push(this.aline[i].yAxis);
          }
          console.log('报警线', linedata);
          tmp_data.sort((num1, num2) => {
            return num2 - num1;
          });
          this.allseries[0].markLine = {
            symbol: ["none", "none"],

            lineStyle: {
              color: "red",
              type: "solid",
            },

            label: {
              show: true,
              // position: "insideEndTop",
              formatter: ((param) => {
                var tmpname = this.translateText("chart.textMap.",param.name);//对报警状态进行翻译
                return tmpname + " " + param.data.value.toString();
              }),
            },

            data: linedata,
          };
          amax = Math.max(amax, tmp_data[0]);
          if (amax >= 0) {
            amax = (amax * 1.2 + 1).toFixed(0);
          } else {
            amax = (amax * 0.8).toFixed(0);
          }
          amin = Math.min(amin, tmp_data[tmp_data.length - 1]);
          if (amin >= 0) {
            amin = 0;
          } else {
            amin = (amin * 1.2 - 1).toFixed(0);
          }
          console.log("最小值？", amin, amax);
          let myOption = {
            series: this.allseries,
            yAxis: {
              axisLabel: {
                showMaxLabel: true,
                showMinLabel: true,
              },
              max: amax,
              min: amin,
            },
          };
          // }
          this.alarmLineOption = myOption;
          this.mychart.setOption(myOption);
        }else {
          this.$message({
            message: this.translateText("chart.textMap.",'暂无报警线信息'),
            type: 'warning'
          });
        }
      } else if (val == 2) {
        // console.log('隐藏报警线');
        let mySeries = this.mychart.getOption().series;
        let amax = 0,
          amin = 999999;
        // console.log('wuwuwu',mySeries);
        for (let _item in mySeries) {
          for (let item in mySeries[_item].data) {
            // console.log(mySeries[_item].data[item]);
            if (this.modelFlag && this.status != 'real' && this.$route.path.indexOf('StartStopGraph') == -1) {
              amax = Math.max(amax, mySeries[_item].data[item][1]);
              amin = Math.min(amin, mySeries[_item].data[item][1]);
            } else {
              amax = Math.max(amax, mySeries[_item].data[item]);
              amin = Math.min(amin, mySeries[_item].data[item]);
            }
          }
        }
        this.allseries[0].markLine.data = [];
        if (amin >= 0) {
          amin = 0;
        } else {
          amin = (amin * 1.2 - 1).toFixed(0);
        }
        if (amax < 0) {
          amax = (amax * 0.8).toFixed(0);
        } else {
          amax = (amax * 1.2 + 1).toFixed(0);
        }
        let myOption = {
          series: this.allseries,
          yAxis: {
            axisLabel: {
              showMaxLabel: true,
              showMinLabel: true,
            },
            max: amax,
            min: amin,
          },
        };
        this.alarmLineOption = myOption;
        this.mychart.setOption(myOption);
      }
    },
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
          icon: 'rect',
          y: "bottom",
          x: "left",
          // 图例样式修改
          // itemWidth: 9,
          // itemHeight: 9,
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
            overflow: 'break', // 文本超出宽后进行换行
            width: 70,
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
          icon: 'rect',
          y: "bottom",
          x: "left",
          // 图例样式修改
          // itemWidth: 9,
          // itemHeight: 9,
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
            color: this.$store.state.textcolor,
            overflow: 'break', // 文本超出宽后进行换行
            width: 70,
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
            color: this.$store.state.textcolor,
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
    async setchartdata(flagX, flagY, dataX, dataY, title, type) {
      console.log('title', title);
      this.saveGraphData(flagX, flagY, dataX, dataY, title, type, true);
      let that = this;
      //flagX: 横轴名称单位, string
      //flagY: 纵轴名称单位， string
      //dataX : 横轴数据 ,  [] 每一项是数据
      //dataY: 纵轴数据 ,  [] 每一项是一个json
      //                       json 内容格式 {
      //                                 name:曲线名称,  string
      //                                 data:曲线数据， []
      //                                 color:曲线颜色， string eg: #*****
      //                             }
      console.log(flagX, flagY, dataX, dataY, title, type)
      console.log(this.modelFlag, type);

      let routeFlag = this.$route.path.indexOf('StartStopGraph') == -1;
      if (type != 'real') {
        if (this.modelFlag && routeFlag) {
          let changeData = changeGraphData(dataX, dataY);
          dataX = changeData.dataX;
          dataY = changeData.dataY;
        }
      }
      if (dataX.length == 0) {
        this.clearall();
      }
      this.isReal = type;
      var myseries = [];
      this.legendData = []
      var tulicolor = [];
      var markLine = null;
      if (dataX.length > 1 || type == "history") {
        markLine = [];
      } else {
        markLine = [
          {
            color: this.$store.state.colorMap[i],
            xAxis: dataX[0],
          },
        ];
        console.log("这里的i没有定义啊？？ 存疑 :"+i);
      }
      console.log('goalarm',this.AlarmValueData)
      let myYmin = "",
        myYmax = "";
      for (var i = 0; i < dataY.length; ++i) {
        // console.log(this.AlarmValueData[0],"**************************8")
        myseries.push({
          id: dataY[i].name,
          name: dataY[i].lableName ? this.translateText('chart.textMap.',dataY[i].lableName): this.translateText('chart.textMap.',dataY[i].name),
          data: dataY[i].data,
          type: "line",
          showSymbol: false,
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
          connectNulls: true,
          markPoint: {
            name: "显示报警",
            symbolSize: 20,
            symbol:
              "path://M512 456.310154L94.247385 38.557538a39.542154 39.542154 0 0 0-55.689847 0 39.266462 39.266462 0 0 0 0 55.689847L456.310154 512 38.557538 929.752615a39.542154 39.542154 0 0 0 0 55.689847 39.266462 39.266462 0 0 0 55.689847 0L512 567.689846l417.752615 417.752616c15.163077 15.163077 40.290462 15.36 55.689847 0a39.266462 39.266462 0 0 0 0-55.689847L567.689846 512 985.442462 94.247385a39.542154 39.542154 0 0 0 0-55.689847 39.266462 39.266462 0 0 0-55.689847 0L512 456.310154z",
            // data:this.AlarmValueData,
            //  color: '#FF0B00'
            data: this.AlarmValueData,
            label: {
              color: this.$store.state.markcolor,
              textBorderColor: this.$store.state.markbordercolor,
              textBorderWidth: 2,
            },
            itemStyle: {
              color: "#FF0B00",
            },
          },
        });
        //  tulicolor.push(dataY[i].color)
        this.legendData.push(myseries[i].name);
        this.arry.push(dataY[i].data);
        let model = this.modelFlag && type != 'real' && routeFlag;
        for (let item in dataY[i].data) {
          if (myYmin == "") myYmin = model ? dataY[i].data[item][1] : dataY[i].data[item];
          else myYmin = Math.min(myYmin, model ? dataY[i].data[item][1] : dataY[i].data[item]);
          if (myYmax == "") myYmax = model ? dataY[i].data[item][1] : dataY[i].data[item];
          else myYmax = Math.max(myYmax, model ? dataY[i].data[item][1] : dataY[i].data[item]);
        }

        // if(myYmax == '') myYmax = dataY[i].data;
        // else myYmax = Math.max(myYmax, dataY[i].data);
      }
      console.log('我的series', myseries);
      console.log("首次加载", myYmax, myYmin);
      that.ymin = myYmin;
      that.ymax = myYmax;
      //console.log(myseries)
      let myYaxis = {};
      // console.log('我的最小值', myYmin);
      if (myYmin < 0) {
        myYaxis = {
          name: flagY,
          nameLocation: 'end',//将名称设置为起始位置
          nameTextStyle: {
            padding:[0,45,-6,0]
          },
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            fontSize: 10,
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
          min: Math.floor(1.2 * myYmin),
          max: myYmax < 0 ? Math.ceil(myYmax * 0.8) : Math.ceil(myYmax * 1.2),
          type: "value",
          splitNumber: 3,
        };
      }
      else {
        myYaxis = {
          name: flagY,
          nameLocation: 'end',//将名称设置为起始位置
          nameTextStyle: {
            padding:[0,45,-6,0]
          },
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            fontSize: 10,
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
          min: 0,
          max: myYmax < 0 ? Math.ceil(myYmax * 0.8) : Math.ceil(myYmax * 1.2),
          type: "value",
          splitNumber: 3,
        };
      }
      var mydatazoom = [];
      if (type != "real") {
        mydatazoom.push({
          type: "inside",
          moveOnMouseMove: false
        });
      }

      // 实时图谱放大
      var mytoolbox = {};
      var historytoolbox = {
        show: true,
        itemGap: 8,
        itemSize: 18,
        top: 8,
        right: 5,
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
          ...this.getMarkPoint(),
          ...this.getTrendGraphHistoryToolboxFeature(),
          ...this.reDataZoomIn(),
          ...this.reDataZoomOut(),

          //细化
          ...this.custombrush(),
          // ...this.myUnRefine(),
          //细化还原
          myrestore: {
            show: this.$route.path.indexOf("RotatingMachineryGraph/StartStopGraph") == -1,
            title: this.translateText("chart.textMap.",'细化还原'),
            icon:"M1.2,4C2.3,1.9,4.5,0.5,7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5c-1.4,0-2.7-0.5-3.8-1.2 M10.9,8.3H8.6\n" +
              "\tc0,0-0.1,0-0.1-0.1L7.3,4.1H7.2L5.7,9.9H5.6l-1.5-4H4L2.9,8.3c0,0,0,0-0.1,0H1.7 M11,7.8c-0.3,0-0.5,0.2-0.5,0.5s0.2,0.5,0.5,0.5\n" +
              "\ts0.5-0.2,0.5-0.5S11.3,7.8,11,7.8z M11,7.7c-0.3,0-0.7,0.3-0.7,0.7S10.6,9,11,9c0.3,0,0.7-0.3,0.7-0.7S11.3,7.7,11,7.7z M0.5,3.1\n" +
              "\tl0.8,1.3c0,0.1,0.2,0.1,0.3,0.1l1.3-0.6",

            onclick:  () =>{
              if (this.refineFlag){
                this.$store.state.startTime = this.$store.state.tmpStartTime;
                this.$store.state.endTime = this.$store.state.tmpEndTime;
                this.$emit("cancelRefine");
                this.refineFlag = false
              }
            },
          },
          myCancel: {
            //全屏
            show: true,
            title: this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),
            icon: this.icon,
            onclick: ()=> {
              //console.log("this.FullScreenName",this.FullScreenName),
              that.$emit("cancelFull");
              that.$nextTick(() => {
                console.log(this.FullScreenName);
                that.updateMarkPoint(this.FullScreenName == this.translateText("chart.textMap.",'全屏')   ? true : false);
              })
            },
          },
          ...this.reDataZoomIn(),
          ...this.reDataZoomOut(),
          //主副游标
          ...this.getPrimarySecondary(),
          //标注
          ...this.getMark(),
          //模型切换
          ...this.getModel(),
          //历史概貌图
          myover: {
            show: false,
            title: this.translateText("chart.textMap.","历史概貌图"),
            icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M10,5.8V4.3H3.1\n' +
              '\tV10h3.5 M4.8,5.4C4.5,5.4,4.2,5.6,4.2,6c0,0.3,0.2,0.6,0.6,0.6c0.3,0,0.6-0.2,0.6-0.6S5.1,5.4,4.8,5.4z M6.4,7.8L6,7.3\n' +
              '\tc-0.1-0.1-0.2-0.1-0.3,0L3.3,9.2 M7.3,9.2c0.2,0.7,0.9,1.3,1.8,1.3c1,0,1.8-0.8,1.8-1.8c0-0.9-0.8-1.8-1.8-1.8\n' +
              '\tc-0.5,0-0.9,0.2-1.3,0.5 M7.3,6.7L7.1,7.9l1,0.1 M9.1,7.6V9h0.8',

            onclick: function () {
              that.iscan = !that.iscan;
              //alert(this.iscan)
              if (that.iscan == true) {
                var option = {
                  toolbox: {
                    feature: {
                      myover: {
                        iconStyle: {
                          borderColor: "#74ACC8",
                        },
                      },
                    },
                  },
                };
                that.mychart.setOption(option);
              } else {
                var option = {
                  toolbox: {
                    feature: {
                      myover: {
                        iconStyle: {
                          borderColor: that.$store.state.toolboxcolor, // 图标的线条颜色
                        },
                      },
                    },
                  },
                };
                that.mychart.setOption(option);
              }

              that.$emit("iscan", that.iscan);
            },
          },
          saveAsImage: {
            title: this.translateText("chart.textMap.",'导出'),
            icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M6.3,6.1H4.7\n' +
              '\tL7,8.7l2.3-2.5H7.8l-0.1-3H6.2L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',

            iconStyle: {
              emphasis: {
                textPadding: [
                  this.$store.state.paddingtop,
                  this.$store.state.paddingright,
                ],
              },
            },
          },
        },
      };
      if (this.$route.path.indexOf("Overview") != -1) {
        historytoolbox.feature.myover.show = true;
      }
      var realtoolbox = {
        show: true,
        itemGap: 8,
        itemSize: 18,
        top: 8,
        right: 5,
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
          brush: {
            show: false,
            type: ["lineX"],
            title: {
              lineX: this.translateText("chart.textMap.",'细化'),
            },
          },
          myrestore: {
            show: false,
            title: this.translateText("chart.textMap.",'细化还原'),
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
            icon: this.icon,
            onclick: function () {
              // console.log("this.FullScreenName",this.FullScreenName),
              that.$emit("cancelFull");
            },
          },
          dataZoom: {
            yAxisIndex: "none",
            show: false,
            title: {
              zoom: this.translateText("chart.textMap.",'放大'),
              back: this.translateText("chart.textMap.",'放大还原'),
            },
            icon: {
              zoom: "M13.5,7c0,3.7-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7c0-3.7,2.9-6.5,6.5-6.5S13.5,3.3,13.5,7z M7,9.6V4.4 M9.6,7H4.4",
              back: "M7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7S3.4,0.5,7,0.5z M9.6,7H4.4",
            },
          },
          restore: {
            show: false,
            title: this.translateText("chart.textMap.",'还原'),
          },
          saveAsImage: {
            title: this.translateText("chart.textMap.",'导出'),
            icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M6.3,6.1H4.7\n' +
              '\tL7,8.7l2.3-2.5H7.8l-0.1-3H6.2L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
            iconStyle: {
              emphasis: {
                textPadding: [
                  this.$store.state.paddingtop,
                  this.$store.state.paddingright,
                ],
              },
            },
          },
        },
      };
      realtoolbox.feature.myPrimarySecondary.show = false;
      if (type != "real") {
        mytoolbox = historytoolbox;
      } else {
        // console.log("实时",this.FullScreenName)
        mytoolbox = realtoolbox;
      }
      if (
        this.$route.path == "/UnitOverviewMap" ||
        this.$route.path == "/RotatingMachineryGraph/RotatingOverviewGrap" ||
        this.$route.path == "/ReciprocatMachineryGraph/OverviewGraph1" ||
        this.$route.path == "/DieselMonitorSystem/OverviewGraph" ||
        this.$route.path == "/gasTurbineGraph/RotatingOverviewGrap" ||
        this.$route.path == "/HeatingFurnaceGraph/HeatingFurnaceUnitOverviewMap" ||
        this.$route.path == "/WirelessPumpGraph/WirelessPumpUnitOverviewMap"
      ) {
        mytoolbox.feature.myCancel.show = false;
      } else {
        mytoolbox.feature.myCancel.show = true;
      }
      if (this.$route.path.indexOf("StartStopGraph") != -1) {
        try {
          mytoolbox.feature.myCancel.show = false;
          mytoolbox.feature.brush.show = false;
          mytoolbox.feature.myrestore.show = false;
        } catch (e) {
          console.log(e);
        }

      }
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
        title: [{
          id: 'title',
          top: "12px",
          left: "center",
          text: title,
          textStyle: {
            fontSize: 16, //大小
            color: this.$store.state.textcolor,//颜色
            fontFamily: "Microsoft YaHei UI"
          },
        },{
          id: 'offset',
          top: "13px",
          left: this.$store.state.grid.left,
          textStyle:{
            fontSize: 10,
          }
        },{
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
        }],
        tooltip: {
          trigger: "axis",
          confine: true,
          formatter:(params)=>{
            let list = []
            let listItem = ''
            let myparams = []
            params.forEach((pitem,paramunit)=>{
              if(pitem.data[1]!==null)
              {
                myparams.push(pitem);
              }

            })
            if (this.modelFlag && type != 'real' && routeFlag) {
              // console.log(params[0].axisValue);
              this.$store.state.tooltipTime = params[0].axisValue;
            }
            for (let i = 0; i < myparams.length; i++) {
              list.push(
                this.modelFlag && type != 'real' && routeFlag?
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                  myparams[i].color + ';margin-right: 5px;border-radius: 50%;}"></i><span style="  display:inline-block;">' +
                  myparams[i].seriesName + ': ' +
                  '</span> ' + myparams[i].value[1] :
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                  myparams[i].color + ';margin-right: 5px;border-radius: 50%;}"></i><span style="  display:inline-block;">' +
                  myparams[i].seriesName + ': ' +
                  '</span> ' + myparams[i].value
              )

            }
            list.unshift(this.modelFlag && type != 'real' && routeFlag?
              this.timeToStamp(myparams[0].axisValue):
              myparams[0].axisValue);
            listItem = list.join('<br>')
            return '<div class="showBox">' + listItem + '</div>'
          }
        },
        // //dataZoom: mydatazoom,
        toolbox: mytoolbox,
        // graphic: createGraphicFromToolbox(historytoolbox),
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
        // xAxis
        xAxis: {
          axisLine: {
            onZero: false,
          },
          // name: flagX,
          name: flagX == '[时间]' ? this.translateText("chart.textMap.",'趋势图时间单位') : flagX,
          data: dataX,
          nameLocation: 'end',//将名称设置为起始位置
          nameTextStyle: {
            padding:[0,0,0,-14]
          },

          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            },
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
            color: this.$store.state.selectbordercolor,

            formatter: (value, index) => {
              // console.log(value);
              return  this.modelFlag && type != 'real' && routeFlag ? this.timeToStamp(value) : value.replace(' ', '\n');
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
          type: this.modelFlag && type != 'real' && routeFlag ? "time" : "category",
          min: this.modelFlag && type != 'real' && routeFlag ? dataY[0].data[0][0] : null,
          max: this.modelFlag && type != 'real' && routeFlag ? dataY[0].data[dataY[0].data.length - 1][0] : null,
          boundaryGap: false,
        },
        yAxis: myYaxis,
        series: myseries,
        OriginalSeries: myseries,
        OriginalXAxisData: dataX,
        // 存储初始画图时的最大值最小值（仅适用首尾有点和数据的情况）
        useDataZoomBegin :[new Date(dataX[0]).getTime()],
        useDataZoomEnd: [new Date(dataX[dataX.length - 1]).getTime()]
      };
      this.allseries = myseries;
      that.nowOption = option;
      console.log("trendOption",option);
      if(!this.alarmFlag) {
        let mergedOption = this.mergeOption(option, this.alarmLineOption);
        // console.warn(mergedOption);
        that.mychart.setOption(mergedOption);
      } else that.mychart.setOption(option);
      if (that.modelFlag && routeFlag) {
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
      if (this.brushState) {
        that.mychart.dispatchAction({
          type: "takeGlobalCursor",
          key: "brush",
          brushOption: {
            brushType: "lineX",
          },
        });
      }
      //扩大点击响应的范围
      // 当点击图谱区域时，获得当前x轴坐标，并进行波形频谱图重绘
      this.mychart.getZr().off("click");
      this.mychart.getZr().on("click", this.chartClick);
      //绑定鼠标事件
      that.mychart.getZr().on("contextmenu", function (param) {
        // if(that.$route.path.indexOf('AlarmQuery') != -1) {
        if (type == "history") {
          let myName = "";
          if (that.alarmFlag) {
            myName = that.translateText('chart.textMap.','显示报警线');
          } else {
            myName = that.translateText('chart.textMap.','隐藏报警线');
          }
          showMenu(param, [
            {
              name: myName,
              fn: function () {
                if (that.alarmFlag) {
                  that.handleAlarm(1);
                  that.alarmFlag = false;
                } else {
                  that.handleAlarm(2);
                  that.alarmFlag = true;
                }
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
    setchart(flagX, flagY, dataX, dataY, title, myType) {
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
      this.status = myType;
      // let type = this.status = title.indexOf('实时') != -1 || title.indexOf('real')!= -1 ? 'real' : 'history'
      this.Title = title.indexOf('趋势图') == -1 && title.indexOf('trend') == -1 && title.indexOf('Trend') == -1 ? title + ' 趋势图' : title
      title = ''
      this.Title.trim().split(' ').forEach(item => title += this.translateText('chart.textMap.', item)+' ')
      // if (myType) {
      //   type = this.status = myType;
      // }
      this.$nextTick(() => {
        console.log('>>>>>>>>>>', flagY, dataY);
        this.setchartdata(flagX, flagY, dataX, dataY, title, myType);
        this.setChartAfter()

      });
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
      //console.log(mychart)
      // console.log(mychart)
      for (let i = 0; i < mychart.series.length; i++) {
        if (mychart.series[i].markLine != null) {
          mychart.series[i].markLine = null;
          change = 1;
        }
      }
      if (change) {
        if(!that.alarmFlag) {
          this.$nextTick(() => {
            let mergedOption = this.mergeOption(option, that.alarmLineOption);
            // console.log(option)

            that.mychart.setOption(mergedOption);
          })
        }
        else this.mychart.setOption(mychart, true);  // 这个会把实时画的第一条线删掉。true: 这是 setOption 方法的第二个参数。在 ECharts 中，当这个参数被设置为 true 时，表示会在应用新的配置之前，先清除之前的配置。
      }

      if (that.arrx.length >= 50) {
        that.arrx.shift();
        for (var i = 0; i < that.arry.length; ++i) {
          that.arry[i].shift();
        }
      }
      var newseries = [];
      that.arrx.push(x);
      if (that.arry.length > 0 && that.arry[0].length == 1) {
        // for(let item = 0; item < that.arry.length; item++) {
        //   if(that.ymin == '') {
        //     that.ymin = that.arry[item][0];
        //   } else {
        //     that.ymin = Math.min(that.ymin, that.arry[item][0]);
        //   }
        //   if(that.ymax == '') {
        //     that.ymax = that.arry[item][0];
        //   } else {
        //     that.ymax = Math.max(that.ymax, that.arry[item][0]);
        //   }
        // }
      }

      for (var i = 0; i < that.arry.length; ++i) {
        that.arry[i].push(y[i]);
        newseries.push({
          data: that.arry[i],
          itemStyle: {
            normal: {
              lineStyle: {
                width: 1,
              }
            }
          }
        });

        that.ymin = Math.min(that.ymin, y[i]);

        that.ymax = Math.max(that.ymax, y[i]);
      }
      console.log("最值", that.ymax, that.ymin);
      //向上取整
      function myUpRound(x) {
        let flag = 1;
        if (x < 0) flag = 0;
        let newx =  Math.ceil(Math.abs(x));
        let length = newx.toString().length;
        let myNewx = 0;
        if (length == 1) {
          myNewx = newx ;
        } else if (length == 2) {
          let max = newx / 10;
          myNewx = Math.ceil(max) * 10;
        } else {
          let pow = Math.pow(10, length - 2);
          let max = newx / pow;
          myNewx = Math.ceil(max) * pow;
        }
        if (flag) return myNewx;
        else return -myNewx;
      }
      // 向下取整
      function myDownRound(x) {
        let flag = 1;
        if (x < 0) flag = 0;
        let newx =  Math.floor(Math.abs(x));;
        let length = newx.toString().length;
        let myNewx = 0;
        if (length == 1) {
          myNewx = newx ;
        } else if (length == 2) {
          let max = newx / 10;
          myNewx = Math.floor(max) * 10;
        } else {
          let pow = Math.pow(10, length - 2);
          let max = newx / pow;
          myNewx = Math.floor(max) * pow;
        }
        if (flag) return myNewx;
        else return -myNewx;
      }
      //
      let myMax = that.ymax,
        myMin = that.ymin;
      if (that.ymax < 0) {
        myMax = (that.ymax * 0.5).toFixed(0);
        myMax = myDownRound(myMax);
        myMin = (that.ymin * 1.5 - 1).toFixed(0);
        myMin = myUpRound(myMin);
      } else {
        if (that.ymin >= 0) {
          myMax = (that.ymax * 1.5 + 1).toFixed(0);
          myMax = myUpRound(myMax);
          myMin = (that.ymin * 0.5).toFixed(0);
          myMin = myDownRound(myMin);
        } else {
          myMax = (that.ymax * 1.5 + 1).toFixed(0);
          myMax = myUpRound(myMax);
          myMin = (that.ymin * 1.5 - 1).toFixed(0);
          myMin = myUpRound(myMin);
        }
      }
      console.log("变化之后的最值", myMax, myMin);
      //console.log(that.arrx.length,newseries)
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
            overflow: 'break', // 文本超出宽后进行换行
            width: 70,
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
          min: myMax,
          max: myMin,
        },
        series: newseries,
      };
      this.$nextTick(() => {
        let mergedOption = this.mergeOption(option, that.alarmLineOption);
        // console.log(option)

        that.mychart.setOption(mergedOption);
      })
    },
    renderBrushed(params) {
      // this.delALLMarkPoint();
      // console.log(params, params.batch)
      let left, right;
      if (!this.modelFlag && this.$route.path.indexOf('StartStopGraph') == -1) {
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
    timeToStamp(timestamp) {
      var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var Y = date.getFullYear() + '-';
      var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
      var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + '\n';
      var h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
      var m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
      var s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds()) ;
      var ms =  '.' + (timestamp % 1000).toString();
      while(ms.length < 3) {
        ms = '0' + ms;
      }
      //var nowtime = new Date(Y+M+D+h+m+s);
      // console.log(timestamp, Y+M+D+h+m+s+ms);
      return Y+M+D+h+m+s;
    },
  }
}
</script>

<style scoped>

</style>
