<template>
  <div ref="SmyChart" id="mySpectrumChart" :style="{width: '100%', height: '100%'}"></div>
</template>

<script>
import halloween from '../../../static/halloween';
import maxInputMixin from "../../mixins/maxInputMixin";
import toolboxMixin from "../../mixins/toolboxMixin";
import commonMixin from "../../mixins/commonMixin";
import toolboxSpectrumGraphMixin from "../../mixins/toolboxSpectrumGraphMixin";
import keepAliveMixin from "@/mixins/keepAliveMixin";
var elementResizeDetectorMaker = require("element-resize-detector");
export default {
  name: "SpectrumGraph",
  mixins: [maxInputMixin, commonMixin, toolboxMixin, toolboxSpectrumGraphMixin,keepAliveMixin],
  data() {
    return {
      Title: '',
      offset: '',
      mainCursor: '',//主游标值
      auxiliaryCursor: '',//辅游标值
      mychart: null,
      mydataX: null,
      mydataY: null,
      arrx: [],
      arry: [],
      timestamp: 0,
      isFull: false,
      // isReal: 'real',
      subTitleData: { // 差值的标题
        index: 2, // 显示两个x轴的差的title索引
      },
      nowOption: null, // 数据
      iseries: null,
      FullScreenName: '全屏',
      icon: 'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n' +
        '\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03',
      mytop: 12,
      mytop1: 13,
      PrimaryLine: null,
      SecondaryLine: null,
      status: null,
      proMarkPoint: {
        data: []
      },
      minYInputMixin:{ // 关闭y轴修改最小值的input框
        show: false
      },
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.drawchart();
    })
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
          }
        })
      }
    });
    resizeObeserver.observe(this.$refs.SmyChart);
  },
  computed: {
    myicon() {
      return this.isFull;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    },
    // 是否显示自动寻峰
    hasShowPeakSearch() {
      let showList = [
        '/TrendAnalysis',
        '/AlarmQueryGraph',
        '/RotorFaultDiagnosis',
        '/PumpImpactDiagnosis',
      ]
      return showList.includes(this.$route.path)
    },
    // 显示5个点的自动寻峰路径
    show5PeakSearch() {
      let showList = [
        '/TrendAnalysis',
        '/AlarmQueryGraph',
        '/RotorFaultDiagnosis',
        '/PumpImpactDiagnosis',
      ]
      return showList.includes(this.$route.path)
    }
  },
  watch: {
    myicon(val) {
      if(!this.activatedFlag) return ;
      if (val == true) {
        this.FullScreenName="退出全屏";
        this.icon = 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M3.3,10.7l2.8-2.7\n' +
          '\t M6.6,10.3V7.8c0-0.2-0.2-0.4-0.4-0.4H3.6 M7.9,6l2.9-2.6 M7.5,3.8l0,2.5c0,0.2,0.2,0.4,0.4,0.4l2.6,0';
      } else {
        this.FullScreenName='全屏';
        this.icon =
          'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n' +
          '\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03';
      }
      var option = {
        toolbox: {
          feature: {
            myCancel: {
              icon: this.icon,
              title: this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),
            },
          }
        }
      }
      this.mychart.setOption(option);
    },
    topiccolor(val) {
      let option = {
        backgroundColor: this.$store.state.leftconbgcolor,
        color: this.$store.state.colorMap,

        toolbox: {
          iconStyle: {
            normal: {
              borderColor: this.$store.state.toolboxcolor,
            },
            emphasis: {
              textFill: this.$store.state.toolboxtextcolor,
            },
          }
        },
        series: {
          type: 'line',
          markPoint: {
            itemStyle: {
              color: this.$store.state.textcolor,
            },
          },
          itemStyle: {
            normal: {
              lineStyle: {
                color: this.$store.state.colorMap[0]
              }
            }
          }
        },
        xAxis: {
          axisLine: {
            onZero: false,
          },
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            }
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
            color: this.$store.state.selectbordercolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dotted',  //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
        },
        yAxis: {
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            }
          },
          axisLabel: {
            // color: this.$store.state.textcolor,
            color: this.$store.state.selectbordercolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dotted',  //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
        },
        title: [{
          id: 'title',
          top: this.mytop,
          left: 'center',
          // padding: 0,
          // subtext:'[' + subtitle + ']',
          textStyle: {
            fontSize: 16,//大小
            color: this.$store.state.textcolor,//颜色
            fontFamily: "Microsoft YaHei UI"
          }
        }, {
          top: this.mytop1,
          left: this.$store.state.grid.left,
          // padding: 0,
          // subtext:'[' + subtitle + ']',
          textStyle: {
            fontSize: 10,//大小
            color: this.$store.state.textcolor,//颜色
            fontFamily: "Microsoft YaHei UI"
          }
        },{
          id: 'offset',
          top: "32px",
          left: this.mychart.getWidth() * parseFloat(this.$store.state.grid.left) / 100 + 360,
          text: '',
          textStyle:{
            fontSize: 10,//大小
            // color: this.$store.state.textcolor,//颜色
            fontFamily: "Microsoft YaHei UI"
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
          left: this.mychart.getWidth() * parseFloat(this.$store.state.grid.left) / 100 + 170,
          top: "32px",
          textStyle:{
            fontSize: 10,
            color: this.$store.state.colorMap[1],
          }
        }


        ],
      }
      this.mychart.setOption(option);
    },
    '$i18n.locale'() {
      let newOption = this.mychart.getOption();
      let tempTitle = '',tempOffset = '',tempMainCursor = '',tempAuxiliaryCursor = '';
      this.Title.trim().split(' ').forEach(item => tempTitle += this.translateText('chart.textMap.', item)+' ')
      if(this.offset){
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
      if(newOption.toolbox == undefined) return
      let feature =  newOption.toolbox[0].feature
      if(feature.myCancel) feature.myCancel.title = this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏');
      if(feature.saveAsImage) feature.saveAsImage.title = this.translateText("chart.textMap.",'导出');
      if(feature.myrestore) feature.myrestore.title = this.translateText("chart.textMap.",'细化还原');
      if(feature.brush) feature.brush.title.lineX = this.translateText("chart.textMap.",'细化');
      if(feature.dataZoom) feature.dataZoom.title.zoom = this.translateText("chart.textMap.",'放大');
      if(feature.dataZoom) feature.dataZoom.title.back = this.translateText("chart.textMap.",'放大还原');
      if(feature.restore) feature.restore.title = this.translateText("chart.textMap.",'还原');
      if (feature.myover) feature.myover.title = this.translateText("chart.textMap.", "历史概貌图")
      if(feature.myPrimarySecondary) feature.myPrimarySecondary.title = this.PrimarySecondary.isMark ? this.translateText("chart.textMap.", "主游标") : this.translateText("chart.textMap.", "辅游标");
      if(feature.myMore) feature.myMore.title = this.translateText("chart.textMap.", "更多");
      if(feature.myUseBruchTime) feature.myUseBruchTime.title = this.translateText("chart.textMap.", "使用细化时间");
      if(feature.myMarkPoint) feature.myMarkPoint.title = this.myMarkPoint.state ? this.translateText("chart.textMap.", "取消标点") : this.translateText("chart.textMap.", "标点");
      if(feature.myMark) feature.myMark.title = this.markPoint.isMark ? this.translateText("chart.textMap.", "取消标注") : this.translateText("chart.textMap.", "标注");
      if(feature.myModel) feature.myModel.title = this.modelFlag ? this.translateText("chart.textMap.", "数据点等分") : this.translateText("chart.textMap.", "时间点等分");
      //频谱图
      if(feature.myPeakSearch) feature.myPeakSearch.title = this.translateText("chart.textMap.", "自动寻峰");
      if(feature.myChangeX) feature.myChangeX.title = this.changeX.state == 'Hz' ? this.translateText("chart.textMap.", "阶次") : this.translateText("chart.textMap.", "赫兹")
      if(feature.myClearAll) feature.myClearAll.title = this.translateText("chart.textMap.", "清除");
      if(feature.myResonance) feature.myResonance.title = this.translateText("chart.textMap.", "谐频");
      if(feature.mySidebandFamily) feature.mySidebandFamily.title = this.translateText("chart.textMap.", "边频");
      this.mychart.setOption({
        title,
        toolbox:{
          feature
        },
        series: this.iseries
      });
    },
  },
  methods: {
    drawchart() {
      let that = this;
      if (that.mychart) {
        this.clearall()
        return;
      } else {
        that.echarts.registerTheme('halloween', halloween)
        that.mychart = that.echarts.init(that.$refs.SmyChart, 'halloween')
        // happenflag 绑定echarts监听highlight事件，及点选中以后触发
        //扩大点击响应的范围
        // 当点击图谱区域时，获得当前x轴坐标，并进行波形频谱图重绘
        that.mychart.getZr().off("click");
        that.mychart.getZr().on("click", this.chartClick);
        var defaultoption = {
          backgroundColor: this.$store.state.leftconbgcolor,
          tooltip: {
            trigger: 'axis',
            // triggerOn: 'click',
          },
          grid: [{
            left: this.$store.state.grid.left,
            right: this.$store.state.grid.right,
            top: this.$store.state.grid.top,
            bottom: this.$store.state.grid.bottom,
          }],
          xAxis: {
            axisLine: {
              onZero: false,
            },
            axisTick: {
              lineStyle: {
                color: this.$store.state.tickcolor,
              }
            },
            axisLabel: {
              color: this.$store.state.selectbordercolor,
              // color: this.$store.state.textcolor,
            },
            splitLine: {

              show: true,
              lineStyle: {
                type: 'dotted',  //'dotted'虚线 'solid'实线，
                color: this.$store.state.linecolor
              },
            },
            type: 'category',

          },
          yAxis: {
            axisTick: {
              lineStyle: {
                color: this.$store.state.tickcolor,
              }
            },
            axisLabel: {
              color: this.$store.state.selectbordercolor,
              // color: this.$store.state.textcolor,
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dotted',  //'dotted'虚线 'solid'实线，
                color: this.$store.state.linecolor
              },
            },
            type: 'value',
            splitNumber: 3 ,//y轴5个刻度
            minInterval: 0
          },
        }
        that.mychart.setOption(defaultoption)
      }

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
          bottom: this.$store.state.grid.bottom,
        },
        tooltip: {

          trigger: 'axis'
        },
        xAxis: {
          axisLine: {
            onZero: false,
          },
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            }
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
            // color: this.$store.state.textcolor,
          },
          splitLine: {

            show: true,
            lineStyle: {
              type: 'dotted',  //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor
            },
          },
          type: 'category',

        },
        yAxis: {
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            }
          },
          axisLabel: {
            color: this.$store.state.selectbordercolor,
            // color: this.$store.state.textcolor,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dotted',  //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor
            },
          },
          type: 'value',
          splitNumber: 3, //y轴5个刻度
          min: 0,
          max: 3,
          minInterval: 0
        },
      }
      that.mychart.setOption(defaultoption)
    },
    setchart(flagX, flagY, dataX, dataY, title, subtitle, type) {

      if(flagY === '[m/s2]') {
        flagY = '[m/s²]';
      }
      if(flagY === '[]') {//当y轴没有单位时，去掉[]
        flagY = '';
      }
      this.offset = ''
      this.mainCursor = ''
      this.auxiliaryCursor =  ''
      // this.status = title.indexOf('实时') != -1 || title.indexOf('real')!= -1 ? 'real' : 'history'
      this.status = type;
      let tempTitle = this.$route.path == '/RotatingMachineryGraph/WholeSpectrumGraph' ? ' 全频谱图' : ' 频谱图'
      this.Title = (title.indexOf('频谱图') == -1 && title.indexOf('Spectrum') == -1) || (title.indexOf('全频谱图') == -1 && title.indexOf('Full Spectrum') == -1) ? title + tempTitle : title
      title = ''
      this.Title.trim().split(' ').forEach(item => title += this.translateText('chart.textMap.', item)+' ')
      this.drawchart();
      this.$nextTick(() => {
        this.setchartdata(flagX, flagY, dataX, dataY, title, subtitle);
        this.setChartAfter()
      })

    },
    async setchartdata(flagX, flagY, dataX, dataY, title, subtitle) {
      let Index500Hz = 0;
      if (this.$store.state.DefaultMax500HzInFrequencyGraph) {
        for (let item in dataX) {
          if (dataX[item] <= 500) {
            Index500Hz = Number(item);
          } else {
            break;
          }
        }
      }
      this.timestamp = new Date(subtitle).getTime()
      let that = this;
      //flagX: 横轴名称单位, string
      //flagY: 纵轴名称单位， string
      //dataX : 横轴数据 ,  [] 每一项是数据
      //dataY: 纵轴数据 ,  是一个json
      //                       json 内容格式 {
      //                                 name:曲线名称,  string
      //                                 data:曲线数据， []
      //                             }

      //Y轴最大值对应横坐标
      // let that = this;
      // this.isReal = type;
      // console.log(this.isReal)
      if (dataX.length == 0 && dataY.data.length == 0) {
        return;
      }
      // console.log(dataX.length + ' ' + dataY.data.length)
      var len = 0;
      var index = -1;
      var maxX = 0;
      let ymin = '',ymax = '';
      for (var i = 0; i < dataY.data.length; i++) {
        if (ymax == '') {
          ymax = dataY.data[i];
          index = i;
        }else{
          ymax = Math.max(ymax, dataY.data[i]);
        }
        if(ymin == '') {
          ymin = dataY.data[i];
        }
        else ymin = Math.min(ymin, dataY.data[i]);
      }
      // 有转速趋势图，再显示一倍频
      if(this.$store.state.timeRev && this.$store.state.timeRev[new Date(subtitle).getTime()]) {
        // console.log('yibeipin',this.$store.state.timeRev[new Date(subtitle).getTime()] / 60);
        let doubleFrequency = this.$store.state.timeRev[new Date(subtitle).getTime()] / 60;
        for (let item in dataX) {
          if (dataX[item] > this.$store.state.timeRev[new Date(subtitle).getTime()] / 60) {
            if (item > 0) {
              index = dataX[item] - doubleFrequency < doubleFrequency - dataX[item - 1] ?  item : item - 1;
            } else {
              index = item;
            }
            break;
          } else if (dataX[item] == doubleFrequency) {
            index = item;
            break;
          }
        }
        if (dataX.length > 0) {
          // maxX = dataX[index].toString();
          maxX = Number(index)
        }
      }
      this.mydataX = dataX;
      this.mydataY = dataY;
      var myseries = []
      myseries.push({
        name: dataY.name,
        data: dataY.data,
        showAllSymbol: false,
        showSymbol:false,
        type: 'line',
        itemStyle: {
          normal: {
            lineStyle: {
              color: this.$store.state.colorMap[0],
              width: 0.5,
            }
          }
        },
        markPoint: {
          data: []
        }
      })
      // 有转速趋势图，再显示一倍频
      if(this.$store.state.timeRev && this.$store.state.timeRev[new Date(subtitle).getTime()]) {
        if(typeof this.changeX.oneFrequency != undefined) this.changeX.oneFrequency = this.$store.state.timeRev[new Date(subtitle).getTime()] / 60
        this.proMarkPoint = myseries[0].markPoint = {
          data: [{
            symbol: 'path://M 512 128 l -213.333 256 l 170.667 0 l 0 512 l 85.333 0 l 0 -512 l 170.667 0 Z',
            symbolSize: 15,
            itemStyle: {
              color: this.$store.state.textcolor,
            },
            name: 'max',
            // y: 'bottom',
            // xAxis: maxX,
            coord: [maxX, 0],
            symbolOffset: [0, '70%']
          }]
        }
      }



      // console.log('my series', myseries);
      var legenddata = [dataY.name];
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
          ...this.getSpectrumGraphHistoryToolboxFeature(),
          myChangeX: {
            title: this.changeX.state == 'Hz' ? this.translateText("chart.textMap.", "阶次") : this.translateText("chart.textMap.", "赫兹"),
            icon: this.changeX.icon,
            // iconStyle: {
            //   borderColor: this.peakSearch.state ?'#74ACC8' : null
            // },
            onclick: () => {
              // changeX.state
              if(this.changeX.state == 'Hz') {
                let option = {
                  toolbox: {
                    feature: {
                      myChangeX: {
                        title: this.translateText("chart.textMap.", "赫兹")
                      }
                    }
                  }
                };
                this.mychart.setOption(option);
                this.changeX.state = 'ORDER'
                // 开始倍频操作
              } else {
                let option = {
                  toolbox: {
                    feature: {
                      myChangeX: {
                        title: this.translateText("chart.textMap.", "阶次")
                      }
                    }
                  }
                };
                this.mychart.setOption(option);
                this.changeX.state = 'Hz'
              }
              this.changeXFun()
              console.log(this.changeX.state)
            }
          },
          myPeakSearch: {
            title: this.translateText("chart.textMap.", "自动寻峰"),
            icon: this.peakSearch.icon,
            show: true,
            iconStyle: {
              borderColor: this.peakSearch.state ?'#74ACC8' : null
            },
            onclick: () => {
              if(this.markPoint.isMark || this.markLine.isResonance){
                return
              }
              let option = {
                toolbox: {
                  feature: {
                    myPeakSearch: {
                      iconStyle: {
                        borderColor: '#74ACC8'
                      }
                    }
                  }
                }
              }
              if(this.peakSearch.state) {
                // console.log("自动寻峰-关闭")
                this.peakSearch.state = false
                // 还原图表线条颜色
                option.toolbox.feature.myPeakSearch.iconStyle.borderColor = null
                this.peakSearchFunEnd()

              } else {
                // console.log("自动寻峰-开启")
                this.peakSearch.state = true
                this.peakSearchFun()

              }
              this.mychart.setOption(option)
            }
          },
          // myMark: {
          //   title: '标注',
          //   show: true,
          //   icon: this.markPoint.markIcon,
          //   iconStyle: {
          //     borderColor: this.markPoint.isMark ?'#74ACC8' : this.$store.state.toolboxcolor
          //   },
          //   onclick:  ()=>{
          //     // console.log('实时模式下的')
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
          //       option.series[0].markPoint= { // 恢复最大值下表样式
          //         symbol: 'path://M 512 128 l -213.333 256 l 170.667 0 l 0 512 l 85.333 0 l 0 -512 l 170.667 0 Z',
          //         symbolSize: 15,
          //         itemStyle: {
          //           color: this.$store.state.textcolor,
          //         },
          //         data: [{
          //           name: 'max',
          //           y: '92%',
          //           xAxis: maxX,
          //         }]
          //       }
          //     } else {
          //       this.markPoint.isMark = true;
          //       this.markPoint.markPointX = []
          //     }
          //     this.mychart.setOption(option)
          //   }
          // },
          myResonance: {
            show: true,
            title: this.translateText("chart.textMap.", "谐频"),
            icon: this.markLine.icon,
            iconStyle: {
              borderColor: this.markLine.isResonance ?'#74ACC8' : null
            },
            onclick:  ()=>{
              if(this.markPoint.isMark || this.sidebandFamily.state || this.peakSearch.state){
                return
              }
              let option = {
                title: [{
                  id: 'Main-Cursor',
                  show: this.markLine.isResonance,
                },{
                  id: 'Auxiliary-Cursor',
                  show: this.markLine.isResonance,
                },{
                  id: 'offset',
                  show: this.markLine.isResonance,
                }],
                series: [{
                  markPoint: this.proMarkPoint,
                  markLine: {
                    data: []
                  }
                }],
                toolbox: {
                  feature: {
                    myResonance: {
                      iconStyle: {
                        borderColor: '#74ACC8'
                      }
                    }
                  }
                }
              }
              if(this.markLine.isResonance) {
                // 如果当前是标记状态,需要取消标记
                this.markLine.isResonance = false;
                option.toolbox.feature.myResonance.iconStyle.borderColor = null
                if(this.PrimarySecondary !=undefined && this.PrimarySecondary.preLines.length != 0) option.series[0].markLine.data = this.PrimarySecondary.preLines;
              } else {
                this.markLine.isResonance = true;
              }
              this.mychart.setOption(option)
            }
          },
          myCancel: {
            show: true,
            title: this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),
            icon: this.icon,
            onclick: function () {
              that.$emit('cancelFull')
            }
          },
          dataZoom: {
            yAxisIndex: "none",
            show:true,
            title:{
              zoom: this.translateText("chart.textMap.",'放大'),
              back: this.translateText("chart.textMap.",'放大还原'),
            },

            icon:{
              zoom: "M13.5,7c0,3.7-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7c0-3.7,2.9-6.5,6.5-6.5S13.5,3.3,13.5,7z M7,9.6V4.4 M9.6,7H4.4",
              back: "M7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7S3.4,0.5,7,0.5z M9.6,7H4.4",
            }
          },
          restore: {
            show: false,
            title: this.translateText("chart.textMap.",'还原'),
            icon: "M7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7S3.4,0.5,7,0.5z M9.6,7H4.4",
            // icon:"M492.1,539.9H57.2A47.8,47.8,0,0,1,9.4,492.1V57.2A47.8,47.8,0,0,1,57.2,9.4H492.1a47.8,47.8,0,0,1,47.8,47.8V492.1A47.8,47.8,0,0,1,492.1,539.9ZM433.4,171.6H174.1a47.69,47.69,0,0,0-47.7,47.7v74.2m233.8-81.7,71.7-36.3a4.8,4.8,0,0,0,1.3-6.6,5.35,5.35,0,0,0-1.3-1.3l-71.7-36.3M127.9,381H387.2a47.69,47.69,0,0,0,47.7-47.7V259M201,340.7l-72,36.5a4.51,4.51,0,0,0-1.2,6.3,3.45,3.45,0,0,0,1.2,1.2l72,36.5"
          },
          saveAsImage: {
            title: this.translateText("chart.textMap.",'导出'),
            icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M6.3,6.1H4.7\n' +
              '\tL7,8.7l2.3-2.5H7.8l-0.1-3H6.2L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
            // icon: 'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M6.3,6.1H4.7L7,8.7\n' +
            //   '\tl2.3-2.5H7.8V3.5H6.3L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
            iconStyle: {
              emphasis: {
                textPadding: [this.$store.state.paddingtop, this.$store.state.paddingright],
              },
            },
          },

          //其他功能性按钮查看官网进行增加，包括（显示数据，下载图片，改为柱状图等）
        }
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
          ...this.getRealToolboxFeature(),
          myPeakSearch: {
            title: this.translateText("chart.textMap.", "自动寻峰"),
            icon: this.peakSearch.icon,
            show: this.hasShowPeakSearch,
            iconStyle: {
              borderColor: this.peakSearch.state ?'#74ACC8' : null
            },
            onclick: historytoolbox.feature.myPeakSearch.onclick
          },
          // 标注
          // myMark: {
          //   title: '标注',
          //   show: false,
          //   icon: this.markPoint.markIcon,
          //   // 按正常的逻辑来说这个onclick事件应该在历史模式下的，但是不知道为什么历史模式加载的时候不会把这个覆盖
          //   onclick: historytoolbox.feature.myMark.onclick
          // },
          // 谐频
          myResonance: {
            show: true,
            title: this.translateText("chart.textMap.", "谐频"),
            icon: this.markLine.icon,
            iconStyle: {
              borderColor: this.markLine.isResonance ?'#74ACC8' : null
            },
            // 按正常的逻辑来说这个onclick事件应该在历史模式下的，但是不知道为什么历史模式加载的时候不会把这个覆盖
            onclick: historytoolbox.feature.myResonance.onclick
          },
          myCancel: {
            show: true,
            title: this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),
            icon: this.icon,
            onclick: function () {
              that.$emit('cancelFull')
            }
          },
          dataZoom: {
            yAxisIndex: "none",
            show: false
          },
          restore: {
            show: false,
          },
          saveAsImage: {
            title: this.translateText("chart.textMap.",'导出'),
            icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M6.3,6.1H4.7\n' +
              '\tL7,8.7l2.3-2.5H7.8l-0.1-3H6.2L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
            // icon: 'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M6.3,6.1H4.7L7,8.7\n' +
            //   '\tl2.3-2.5H7.8V3.5H6.3L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
            iconStyle: {
              emphasis: {
                textPadding: [this.$store.state.paddingtop, this.$store.state.paddingright],
              },
            },
          },
          //其他功能性按钮查看官网进行增加，包括（显示数据，下载图片，改为柱状图等）
        }
      };
      if (this.status === "real") {

        mytoolbox = realtoolbox;

      } else {
        // console.log('切换到了历史模式')
        mytoolbox = historytoolbox;
      }
      let myyAxis;
      if(ymin < 0) {
        myyAxis = {
          name: flagY,
          nameTextStyle: {
            padding:[0,45,-10,0]
          },
          boundaryGap: ['15%', '15%'],
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            }
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
              type: 'dotted',  //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor
            },
          },
          type: 'value',
          splitNumber: 3 ,//y轴5个刻度
          minInterval: 0,
          min: Math.floor(ymin * 1.2),
          max: ymax < 0 ? Math.ceil(ymax * 0.8) : Math.ceil(ymax * 1.2),
        }
      } else {
        myyAxis = {
          name: flagY,
          nameTextStyle: {
            padding:[0,45,-6,0]
          },
          boundaryGap: ['15%', '15%'],
          axisTick: {
            lineStyle: {
              color: this.$store.state.tickcolor,
            }
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
              type: 'dotted',  //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor
            },
          },
          type: 'value',
          splitNumber: 3 ,//y轴5个刻度
          minInterval: 0,
          min: 0,
          max: ymax < 0 ? Math.ceil(ymax * 0.8) : Math.ceil(ymax * 1.2),
        }
      }
      var option = {
        backgroundColor: this.$store.state.leftconbgcolor,
        title: [{
          id: 'title',
          top: this.mytop,
          left: 'center',
          // padding: 0,
          text: title,
          // subtext:'[' + subtitle + ']',
          textStyle: {
            fontSize: 16,//大小
            color: this.$store.state.textcolor,//颜色
            fontFamily: "Microsoft YaHei UI"
          }
        }, {
          top: this.mytop1,
          left: this.$store.state.grid.left,
          // padding: 0,
          text: subtitle,
          // subtext:'[' + subtitle + ']',
          textStyle: {
            fontSize: 10,//大小
            color: this.$store.state.textcolor,//颜色
            fontFamily: "Microsoft YaHei UI"
          }
        },{
          id: 'offset',
          top: "32px",
          left: this.mychart.getWidth() * parseFloat(this.$store.state.grid.left) / 100 + 360,
          text: '',
          textStyle:{
            fontSize: 10,//大小
            // color: this.$store.state.textcolor,//颜色
            fontFamily: "Microsoft YaHei UI"
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
          left: this.mychart.getWidth() * parseFloat(this.$store.state.grid.left) / 100 + 170,
          top: "32px",
          textStyle:{
            fontSize: 10,
            color: this.$store.state.colorMap[1],
          }
        }


        ],
        grid: [{
          left: this.$store.state.grid.left,
          right: this.$store.state.grid.right,
          top: this.$store.state.grid.top,
          bottom: this.$store.state.grid.bottom,
        }],
        tooltip: {
          trigger: 'axis',
          formatter:(params)=>{
            let list = []
            let listItem = ''
            // console.log(params);

            for (let i = 0; i < params.length; i++) {
              list.push(
                '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                params[i].color + ';margin-right: 5px;border-radius: 50%;}"></i><span style="  display:inline-block;">' +
                'X: ' +
                '</span> ' + parseFloat(params[i].axisValue).toFixed(3).toString()+'<br>'+  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                params[i].color + ';margin-right: 5px;border-radius: 50%;}"></i><span style="  display:inline-block;">' +
                'Y: ' +
                '</span> ' + parseFloat(params[i].value).toFixed(3).toString()

              )

            }
            listItem = list.join('<br>')
            return '<div class="showBox">' + listItem + '</div>'
          }
          // triggerOn: 'click',
        },
        color: this.$store.state.colorMap,
        dataZoom: [{
          type: "inside",         //详细配置可见echarts官网
          endValue: this.$store.state.DefaultMax500HzInFrequencyGraph ? Index500Hz : null,
          zoomLock:true
        }],
        toolbox: mytoolbox,
        // legend: {
        //     y: 'bottom',
        //     x: 'center',
        //     data: legenddata,
        //
        // },
        xAxis: {
          axisLine: {
            onZero: false,
          },
          name: flagX,
          data: dataX,
          nameTextStyle: {
            padding:[0,0,0,-14]
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dotted',  //'dotted'虚线 'solid'实线，
              color: this.$store.state.linecolor,
            },
          },
          type: 'category',
          axisTick: {
            lineStyle: {
              color: this.$store.state.linecolor,
            }
          },
          axisLabel: {
            showMinLabel: true,
            showMaxLabel: true,
            interval: 'auto',
            // color: this.$store.state.textcolor,
            color: this.$store.state.selectbordercolor,
            formatter: (val) => {
              return parseInt(val)
            },
            // interval: function (index, value) {
            //   if (index % dataXInterval == 0) {
            //     return true;
            //   } else if (index == dataX.length - 1) {
            //     return true;
            //   }
            //   return false;
            // }
          },
          boundaryGap: false,
        },
        yAxis: myyAxis,
        series: myseries
      }
      that.nowOption = option;
      this.iseries = myseries;
      that.mychart.setOption(option)
      this.resizeMaxInput()
    },
    peakSearchFun() {
      const chart = this.mychart
      //获取当前图表的option
      const op = chart.getOption();

      let yData = op.series[0].data

      let peakSearchNum = this.$store.state.peakSearchNum;
      // if(this.show5PeakSearch) peakSearchNum = 5;

      let result = [] // 保存所有的极值点，极值点定义：这个点比左边2个点和右边2个点大
      if(yData[0] > yData[1] && yData[0] > yData[2]) {
        result.push(0)
      }
      if ((yData[1] > yData[2] && yData[1] > yData[3]) && (yData[1] > yData[0])) {
        result.push(1)
      }
      for(let i = 2; i < yData.length - 2; i++) {
        if((yData[i - 2] < yData[i] && yData[i - 1] < yData[i]) && (yData[i] > yData[i + 1] && yData[i] > yData[i + 2])) {
          result.push(i)
        }
      }
      // if(result.length == 5) break;
      result = result.sort((a, b) => {
        return yData[b] - yData[a];
      });
      console.log("happen->res", result)
      result = result.slice(0, peakSearchNum);

      let option = {
        series: [{
          markPoint: { // 绿色标注样式
            symbol: 'pin', // pin rect roundRect
            label: {
              offset:[0, -5],
              show: true,
              // fontWeight: 500,
              color: '#fff',
              textBorderWidth: 0,
              backgroundColor: 'rgba(57,191,104,0.9)', //'rgba(57,191,104,0.9)',
              padding: [3, 4],
              borderRadius: 3,
            },
            itemStyle: {
              color: 'rgba(57,191,104,0.9)', //'rgba(57,191,104,0.8)', op.series[0].lineStyle.color
              // background: 'white',
            },
            symbolSize: 20 , //标记大小 40
            data: [...this.proMarkPoint.data]
          }
        }]
      }

      for(let i of result) {
        let y = chart.getOption().series[0].data[i] // 获取这个点对应的y值
        let x = chart.getOption().xAxis[0].data[i]
        // console.log("happen", x, y)
        // option.series[0].markPoint.data.push({value: `${x}, ${y}` , coord: ['' + x, '' + y]})

        if(('' + x).indexOf('X') !== -1) {
          let va = parseFloat(x).toFixed(2) + 'X'
          option.series[0].markPoint.data.push({value: `${va}, ${y}` , coord: ['' + x, '' + y]})
        } else {
          option.series[0].markPoint.data.push({value: `${x}, ${y}` , coord: ['' + x, '' + y]})
        }

      }

      // option.series[seriesNameIndex] =

      // console.log("happen-> 自动寻峰的坐标", result)
      chart.setOption(option)

    },
    peakSearchFunEnd() {
      let option = {
        series: [{
          markPoint: this.proMarkPoint
        }]
      }
      this.mychart.setOption(option)
    },

    setlines(linepackage) {
      if(this.iseries.length > 1) {
        for(let i = 0;i < this.iseries.length;i ++) {
          if(this.iseries[i].name == 'data') {
            this.iseries.splice(i, 1);
            break;
          }
        }

      }
      // console.log('图标的option',this.mychart.getOption());
      let myseries = this.mydataX;
      // console.log('横坐标轴值', myseries);
      let mylinepackage = linepackage;
      let mydict = {};
      for(let _item in mylinepackage) {
        let flag = false;
        for(let item in myseries) {
          if(myseries[item] == mylinepackage[_item].xAxis) {
            mydict[mylinepackage[_item].name] = myseries[item];
            flag = true;
            break;
          } else if(myseries[item] > mylinepackage[_item].xAxis) {
            mydict[mylinepackage[_item].name] = mylinepackage[_item].xAxis;
            mylinepackage[_item].xAxis = myseries[item];

            flag = true;
            break;
          }
        }
        if(!flag) {
          mydict[mylinepackage[_item].name] = mylinepackage[_item].xAxis;
          mylinepackage[_item].xAxis = myseries[myseries.length - 1];

        }
      }
      for(let item in mylinepackage) {
        // console.log('类型', typeof(linepackage[item].xAxis));
        mylinepackage[item].xAxis = mylinepackage[item].xAxis.toString();
      }
      // console.log('缺陷频率数据', mylinepackage);
      this.iseries.push({
          name: 'data',
          type: 'line',
          markLine: {
            symbol: ['none', 'none'],
            animation: false,

            lineStyle: {
              color: '#ffaf51',
              type: 'dashed'
            },

            label: {
              show: true,
              formatter: (param) => {
                return this.translateText("chart.textMap.",param.name) + (mydict[param.name].toFixed(2).toString());
              },
              position:'insideEndBottom',

            },

            data: mylinepackage
          }
        }
      );
      // console.log(this.iseries)
      this.mychart.setOption({
        series:this.iseries
      });
    },
    setlines1(linepackage) {
      if(this.iseries.length > 1) {
        for(let i = 0;i < this.iseries.length;i ++) {
          if(this.iseries[i].name == 'data1') {
            this.iseries.splice(i, 1);
            break;
          }
        }

      }

      // console.log('图标的option',this.mychart.getOption());
      let myseries = this.mydataX;
      // console.log('横坐标轴值', myseries);
      let mylinepackage = linepackage;
      let mydict = {};
      for(let _item in mylinepackage) {
        let flag = false;
        for(let item in myseries) {
          if(myseries[item] == mylinepackage[_item].xAxis) {
            mydict[mylinepackage[_item].name] = myseries[item];
            flag = true;
            break;
          } else if(myseries[item] > mylinepackage[_item].xAxis) {
            mydict[mylinepackage[_item].name] = mylinepackage[_item].xAxis;
            mylinepackage[_item].xAxis = myseries[item];

            flag = true;
            break;
          }
        }
        if(!flag) {
          mydict[mylinepackage[_item].name] = mylinepackage[_item].xAxis;
          mylinepackage[_item].xAxis = myseries[myseries.length - 1];

        }
      }
      for(let item in mylinepackage) {
        // console.log('类型', typeof(linepackage[item].xAxis));
        mylinepackage[item].xAxis = mylinepackage[item].xAxis.toString();
      }
      // console.log('缺陷频率数据', mylinepackage);
      this.iseries.push({
          name: 'data1',
          type: 'line',
          markLine: {
            symbol: ['none', 'none'],
            animation: false,

            lineStyle: {
              color: '#ffaf51',
              type: 'dashed'
            },

            label: {
              show: true,
              formatter: (param) => {
                return this.translateText("chart.textMap.",param.name) + (mydict[param.name].toFixed(2).toString());
              },
              position:'insideEndBottom',

            },

            data: mylinepackage
          }
        }
      );
      // console.log(this.iseries)
      this.mychart.setOption({
        series:this.iseries
      });
    },
    setIsFull(data) {
      this.isFull = data;
      // console.log('最大值切换')
      setTimeout(() => {
        this.resizeMaxInput()
      }, 1000)
    },
    setnolines() {
      console.log('?????', this.iseries, this.mychart.getOption().series);
      if(this.iseries.length) {

        for(let i = 0;i < this.iseries.length;i ++) {
          if(this.iseries[i].name == 'data') {
            this.iseries[i].markLine.data = [];
            break;
          }
        }
        this.mychart.setOption({
          series:this.iseries
        })
      }

    },
    setnolines1() {
      if(this.iseries.length) {

        for(let i = 0;i < this.iseries.length;i ++) {
          if(this.iseries[i].name == 'data1') {
            this.iseries[i].markLine.data = [];
            break;
          }
        }

        this.mychart.setOption({
          series:this.iseries
        })
      }

    },
    xAxisSub(a1, a2) {
      // a1 保存小的坐标 a2保存大的坐标
      if(parseFloat(a1) > parseFloat(a2)) {
        let t = a2;
        a2 = a1;
        a1 = t;
      }

      // 计算y轴的差值
      const op = this.mychart.getOption()
      let y1 = op.xAxis[0].data.indexOf(a1)
      if(y1 === -1) {
        y1 = op.xAxis[0].data.indexOf(Number(a1))
      }

      let y2 = op.xAxis[0].data.indexOf(a2)
      if(y2 === -1) {
        y2 = op.xAxis[0].data.indexOf(Number(a2))
      }
      // 幅值差量
      const subFuzhi = op.series[0].data[y2] - op.series[0].data[y1]

      const titles = op.title
      let xName = op.xAxis[0].name.substring(1, op.xAxis[0].name.length - 1);
      let yName = op.yAxis[0].name.substring(1, op.yAxis[0].name.length - 1)


      titles[2].text = `[${this.translateText("chart.textMap.","差量")} ${Math.abs(parseFloat(a2) - parseFloat(a1)).toFixed(2)} ${xName} ${Math.abs(subFuzhi).toFixed(2)} ${yName}]`
      this.offset = `差量 ${Math.abs(parseFloat(a2) - parseFloat(a1)).toFixed(2)} ${xName} ${Math.abs(subFuzhi).toFixed(2)} ${yName}`
      const option = {
        title: titles
      }
      this.mychart.setOption(option)
    },
  }

}
</script>

<script setup lang="ts">
</script>
