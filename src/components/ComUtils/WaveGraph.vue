<template>
  <div ref="WmyChart" id="myWaveChart"  :style="{width: '100%', height: 'calc(100% - 1px)', overflow: 'hidden'}"></div>
</template>

<script>
  import halloween from '../../../static/halloween';
  import maxInputMixin from "../../mixins/maxInputMixin";
  import toolboxMixin from "../../mixins/toolboxMixin";
  import brushMixin from '@/mixins/brushMixin';
  import commonMixin from "../../mixins/commonMixin";
  import keepAliveMixin from "@/mixins/keepAliveMixin";
  var elementResizeDetectorMaker = require("element-resize-detector");
  export default {
    name: "WaveGraph",
    mixins: [maxInputMixin, toolboxMixin, commonMixin, brushMixin, keepAliveMixin],
    props: ['markValue'],
    data() {
      return {
        Title: '',
        status: null,
        offset: '',
        mainCursor: '',//主游标值
        auxiliaryCursor: '',//辅游标值
        mychart: null,
        arrx:[],
        arry:[],
        FullScreenName: '全屏',
        icon: "M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M7.48,6.51l2.81-2.67\n" +
          "\t M10.79,6.09V3.62c0-0.22-0.18-0.39-0.39-0.39h-2.6 M6.68,7.36L3.84,10 M3.37,7.74l-0.03,2.47c0,0.22,0.17,0.39,0.39,0.4l2.6,0.03",
        isFull: false,
        isReal: 'real',
        nowOption: null,
        lastPoint: -1,
        mytop: 12,
        mytop1: 13,
        mytop2: 13,
        maxInputMixin: { // x轴最大值框所需变量
          chartId: 'myWaveChart', // chartId
          y: -100, // y轴起始位置
          offsetX: 0, // x微调
          offsetY: 5, // y微调
        },
        dataX: [],
        dataY: [],
        markValueData: [],
        primaryXIndex: '',
        auxiliaryXIndex: '',
      }
    },
    computed:{
      myicon(){
        return this.isFull;
      },
      topiccolor(){
        return this.$store.state.topiccolor;
      },
      equName() {
        return this.$store.state.equName;
      }
    },
    watch:{
      myicon(val) {
        if(!this.activatedFlag) return ;
        // let mytop, mytop1, mytop2;
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
                title:this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),

              },
            }
          }
        }
        this.mychart.setOption(option);
      },
      topiccolor(val) {
        // console.log('波形图修改', this.mychart.getOption().series);
        let myseries1 = this.mychart.getOption().series;
        // console.log('切换皮肤', myseries1);
        for(let item in myseries1) {
          myseries1[item].itemStyle = {
            normal: {
              lineStyle: {
                color: this.$store.state.colorMap[item],
                width: 0.5,
              }
            }
          }
          if(myseries1[item].markLine)
            myseries1[item].markLine = {
              lineStyle:{
                color: this.$store.state.textcolor,
              },
            }
          if (myseries1[item].lineStyle && myseries1[item].lineStyle.normal) {
            myseries1[item].lineStyle.normal= {
              width: 0.5
            }
          }
        };
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
          series: myseries1,
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
            left: this.$route.path.indexOf('RotatingMachineryGraph/OrbitOfShaftCenter') == -1 ? 'center' : this.$store.state.grid.left,
            textStyle:{
              fontSize: 16,//大小
              color: this.$store.state.textcolor,//颜色
              fontFamily: "Microsoft YaHei UI"
            }
          },{
            top: this.mytop1,
            left: this.$store.state.grid.left,
            textStyle:{
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
        let xAxis = {
          name: newOption.xAxis[0].name == '[秒]' ||  newOption.xAxis[0].name == '[S]' ? this.translateText('chart.textMap.', '波形图时间单位') : newOption.xAxis[0].name
        }
        let tempTitle = '',tempOffset = '',tempMainCursor = '',tempAuxiliaryCursor = '';
        this.Title.trim().split(' ').forEach(item => tempTitle += this.translateText('chart.textMap.', item)+' ')
        if(this.offset){
          this.offset.trim().split(' ').forEach(item => tempOffset += this.translateText('chart.textMap.', item)+' ')
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
        if(feature.mybrush) feature.mybrush.title.lineX = this.translateText("chart.textMap.",'细化');
        if(feature.myUseBruchTime) feature.myUseBruchTime.title = this.translateText("chart.textMap.", "使用细化时间");
        if(feature.myMarkPoint) feature.myMarkPoint.title = this.myMarkPoint.state ? this.translateText("chart.textMap.", "取消标点") : this.translateText("chart.textMap.", "标点");
        if(feature.myMark) feature.myMark.title = this.markPoint.isMark ? this.translateText("chart.textMap.", "取消标注") : this.translateText("chart.textMap.", "标注");
        if(feature.myModel) feature.myModel.title = this.modelFlag ? this.translateText("chart.textMap.", "数据点等分") : this.translateText("chart.textMap.", "时间点等分")
        this.mychart.setOption({
          xAxis,
          title,
          toolbox:{
            feature
          }
        });

      },
      markValue(data) {
        this.markValueData = data;
      },
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
          this.$nextTick( () => {
            // console.log("Size: " + cr.width + "x" + cr.height)
            //使echarts尺寸重置
            if(this.activatedFlag) {
              this.mychart.resize();
              this.resizeMaxInput()
            }
          })
        }
      });
      resizeObeserver.observe(this.$refs.WmyChart);

    },
    methods: {
      drawchart() {
        let that = this;
        if (that.mychart) {
          return;
        }
        else {
          that.echarts.registerTheme('halloween', halloween)
          that.mychart = that.echarts.init(that.$refs.WmyChart, 'halloween')
          var defaultoption = {
            backgroundColor: this.$store.state.leftconbgcolor,
            grid: {
              left: this.$store.state.grid.left,
              right: this.$store.state.grid.right,
              top: this.$store.state.grid.top,
              bottom: '15%',
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
                showMaxLabel: true
              },
              splitLine: {
                show: true,
                lineStyle: {
                  type: 'dotted',  //'dotted'虚线 'solid'实线，
                  color: this.$store.state.linecolor,
                },
              },
              type: 'category',


            },
            yAxis: {
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
              type: 'value',
              splitNumber:3, //y轴5个刻度
              boundaryGap: ['10%','10%']
            },
          }
          that.mychart.setOption(defaultoption)
        }

      },
      clearall () {
        let that = this;
        if(that.mychart) {
          that.mychart.clear();
        }
        var defaultoption = {
          backgroundColor: this.$store.state.leftconbgcolor,
          grid: [{
            left: this.$store.state.grid.left,
            right: this.$store.state.grid.right,
            top: this.$store.state.grid.top,
            bottom: '15%',
          }],
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            axisLine: {
              onZero: false,
            },
            splitLine: {

              show: true,
              lineStyle: {
                type: 'dotted',  //'dotted'虚线 'solid'实线，
                color: 'rgba(255,255,255,0.3)'
              },
            },
            type: 'category',

            axisTick: {
              lineStyle: {
                color: this.$store.state.tickcolor,
              }
            },
            axisLabel: {
              showMaxLabel: true,
              color: this.$store.state.selectbordercolor,
              // color: this.$store.state.textcolor,
            },

          },
          yAxis: {
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
                color: 'rgba(255,255,255,0.3)'
              },
            },
            type: 'value',
            splitNumber:3 ,//y轴5个刻度
            min: 0,
            max: 3,
          },
        }
        that.mychart.setOption(defaultoption)
      },
      setIsFull(data) {
        this.isFull = data;
        setTimeout(() => {
          this.resizeMaxInput(this.mychart)
        }, 1000)
      },
      async setchartdata(flagX, flagY, dataX, dataY, title, subtitle, degree = null) {
        //flagX: 横轴名称单位, string
        //flagY: 纵轴名称单位， string
        //dataX : 横轴数据 ,  [] 每一项是数据
        //dataY: 纵轴数据 ,  是一个json
        //                       json 内容格式 {
        //                                 name:曲线名称,  string
        //                                 data:曲线数据， []
        //                             }
        // let interval =  Math.round(dataX.length / (dataX[dataX.length - 1] * 10))
        let interval =   Math.round(dataX.length / 10);
        let equName1 = this.equName;
        if(dataX.length == 0 && dataY.data.length == 0) {
          return;
        }
        var myseries = [];
        myseries.push({
          name: dataY.name,
          data:dataY.data,
          showAllSymbol: false,
          showSymbol:false,
          type: 'line',
          itemStyle:{
            normal:{
              lineStyle:{
                color:this.$store.state.colorMap[0],
                width: 0.5,
              }
            }
          },
        });
        myseries.push({
          type:'line',
          markLine:{
            symbol: ['none', 'none'],
            lineStyle:{               //警戒线的样式  ，虚实  颜色
              type:"solid",
              color: this.$store.state.textcolor,
            },
            itemStyle: {
              normal: {
                color: 'white',
              },
            },
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: false // 鼠标悬浮时隐藏标签
              }
            },
            animation: false,
            data:[]
          }
        })
        var legenddata = [dataY.name];
        var dataXInterval = Math.floor(dataX.length / 5);
        var mytoolbox ={};
        var historytoolbox= {
          itemGap: 8,
          itemSize: 18,
          top: 8,
          right: 5,
          show:true,
          iconStyle: {
            normal: {
              borderColor: this.$store.state.toolboxcolor,
            },
            emphasis: {
              textPadding: this.$store.state.paddingtop,
              textFill: this.$store.state.toolboxtextcolor,
            }
          },
          feature:{
            // ...this.getHistoryToolboxFeature(),
            ...this.getMarkPoint(),
            myCancel: {
              show: true,
              title:this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),
              icon: this.icon,
              onclick: function () {
                that.$emit('cancelFull')
              }
            },
            dataZoom: {
              yAxisIndex:"none",
              title:{
                zoom:this.translateText("chart.textMap.",'放大'),
                back:this.translateText("chart.textMap.",'放大还原')
              },
              icon:{
                zoom: "M13.5,7c0,3.7-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7c0-3.7,2.9-6.5,6.5-6.5S13.5,3.3,13.5,7z M7,9.6V4.4 M9.6,7H4.4",
                back: "M7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7S3.4,0.5,7,0.5z M9.6,7H4.4",
              }
            },
            restore: {
              show: false,
              title:this.translateText("chart.textMap.",'还原'),
              icon: "M7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7S3.4,0.5,7,0.5z M9.6,7H4.4",
            },
            //主副游标
            ...this.getPrimarySecondary(),
            //标注
            ...this.getMark(),

            saveAsImage: {
              title: this.translateText("chart.textMap.",'导出'),
              icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M6.3,6.1H4.7\n' +
                '\tL7,8.7l2.3-2.5H7.8l-0.1-3H6.2L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',

              iconStyle: {
                emphasis: {
                  textPadding: [this.$store.state.paddingtop, this.$store.state.paddingright],
                },
              },
            },
            //其他功能性按钮查看官网进行增加，包括（显示数据，下载图片，改为柱状图等）
          }
        };
        var realtoolbox= {
          itemGap: 8,
          itemSize: 18,
          top: 8,
          right: 5,
          show:true,
          iconStyle: {
            normal: {
              borderColor: this.$store.state.toolboxcolor,
            },
            emphasis: {
              textPadding: this.$store.state.paddingtop,
              textFill: this.$store.state.toolboxtextcolor,
            }
          },
          feature:{
            ...this.getRealToolboxFeature(),
            myCancel: {
              show: true,
              title:this.myicon ? this.translateText("chart.textMap.",'退出全屏') : this.translateText("chart.textMap.",'全屏'),
              icon: this.icon,
              onclick: function () {
                that.$emit('cancelFull')
              }
            },
            dataZoom: {
              yAxisIndex:"none",
              show:false,
            },
            restore: {
              show: false,
            },
            saveAsImage: {
              title: this.translateText("chart.textMap.",'导出'),
              icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M6.3,6.1H4.7\n' +
                '\tL7,8.7l2.3-2.5H7.8l-0.1-3H6.2L6.3,6.1z M3.3,8.6c0,0,0.2,1.9,2.2,1.9c1.4,0,1.7,0,3,0c2,0,2.1-1.9,2.1-1.9',
              iconStyle: {
                emphasis: {
                  textPadding: [this.$store.state.paddingtop, this.$store.state.paddingright],
                },
              },
            },
            //其他功能性按钮查看官网进行增加，包括（显示数据，下载图片，改为柱状图等）
          }
        };
        // console.log('我的标题', title);
        if (this.status != 'real') {
          mytoolbox = historytoolbox;
        }
        else{
          mytoolbox = realtoolbox;
        }
        var tmpDataX = []
        for (const i in dataX) {
          tmpDataX.push(dataX[i]);
        }
        this.dataX = tmpDataX
        let tmpDataY = []
        for (const i in dataY.data) {
          tmpDataY.push(dataY.data[i]);
        }
        this.dataY = tmpDataY
        let myYmax, myYmin;
        for(let item in dataY.data) {
          if(item == 0) {
            myYmax = dataY.data[item];
            myYmin = dataY.data[item];
          } else {
            myYmax = Math.max(myYmax, dataY.data[item]);
            myYmin = Math.min(myYmin, dataY.data[item]);
          }
        }

        if (degree) {
        }

        if (this.markValueData.length) {//旋转-轴心轨迹，波形图增加键相标记点
          var Points = {
            symbol: 'emptyCircle',
            // symbol: 'rectangle',
            symbolSize: 5,
            data: this.markValueData,
            label: {
              show: false
            },
          };
          myseries.push({
            type: 'line',
            markPoint: Points
          })
        }
        var option = {
          animation: false,
          backgroundColor: this.$store.state.leftconbgcolor,
          grid: [{
            left: this.$store.state.grid.left,
            right: this.$store.state.grid.right,
            top: this.$store.state.grid.top,
            bottom: this.$store.state.grid.bottom,
          }],
          title: [{
            id: 'title',
            top: this.mytop,
            left: this.$route.path.indexOf('RotatingMachineryGraph/OrbitOfShaftCenter') == -1 ? 'center' : this.$store.state.grid.left,
            // padding: 0,
            text: title,
            // subtext:'[' + subtitle + ']',
            textStyle:{
              fontSize: 16,//大小
              // fontSize: 16,//大小
              color: this.$store.state.textcolor,//颜色
              fontFamily: "Microsoft YaHei UI"
            }
          },{
            top: this.mytop1,
            left: this.$store.state.grid.left,
            // left: this.$store.state.grid.left,
            // padding: 0,
            text: this.$route.path.indexOf('RotatingMachineryGraph/OrbitOfShaftCenter') == -1 ? subtitle : '',
            // subtext:'[' + subtitle + ']',
            textStyle:{
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
          tooltip: {
            trigger: 'axis',
            confine: true,
            formatter: function (params) {
              var result = '';
              params.forEach(function (item) {
                let tipName;
                if(item.seriesName.startsWith(equName1)){
                  tipName = item.seriesName.slice(equName1.length)
                }else{
                  tipName = item.seriesName;
                }
                result += item.marker + tipName + '<br>';
                result += Number(item.axisValue).toFixed(3) + ' , ' + item.value.toFixed(3) + '<br>';
              });
              return result;
            },
          },
          color: this.$store.state.colorMap,
          dataZoom:[{
            type:"inside",         //详细配置可见echarts官网
            zoomLock:true
          }],
          toolbox: mytoolbox,
          xAxis: {
            axisLine: {
              onZero: false,
            },
            nameTextStyle: {
              padding:[0,0,0,-14]
            },
            name: flagX == '[秒]' ? this.translateText('chart.textMap.', '波形图时间单位') : flagX,
            data: tmpDataX,
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dotted',  //'dotted'虚线 'solid'实线，
                color: this.$store.state.linecolor
              },
            },
            type: 'category',
            axisTick: {
              lineStyle: {
                color: this.$store.state.tickcolor,
              }
            },
            axisLabel:{
              showMinLabel: true,
              showMaxLabel: true,
              interval: interval,
              // color: this.$store.state.textcolor,
              color: this.$store.state.selectbordercolor,
              formatter: (value) => {
                return degree ? parseFloat(value).toFixed(0).toString() : parseFloat(value).toFixed(2).toString();
              }
            },
            boundaryGap: false,
          },
          yAxis: {
            axisLine: {
              onZero: false,
            },
            name: flagY,
            nameTextStyle: {
              padding:[0,45,-6,0]
            },
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
            max: Math.abs(myYmax) > Math.abs(myYmin) ? Math.ceil(Math.abs(myYmax * 1.2)) : Math.ceil(Math.abs(myYmin * 1.2)),
            min: Math.abs(myYmax) > Math.abs(myYmin) ? -Math.ceil(Math.abs(myYmax * 1.2)) : -Math.ceil(Math.abs(myYmin * 1.2)),
            splitNumber:3, //y轴5个刻度
          },

          series : myseries,
        }

        if(degree) {
          option.dataZoom = [{
            type: 'inside',  // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            zoomLock:true,
            start: degree.startIndex / (degree.length-1) * 100,       // 左边在 0% 的位置。
            end: degree.endIndex / (degree.length-1) * 100       // 右边在 100% 的位置。
          }]

        }

        // console.log('第一次加载', myseries);
        let that = this;
        that.nowOption = option;
        this.allseries=myseries

        that.mychart.setOption(option, true);
        that.mychart.getZr().off("click")
        that.mychart.off("click")
        await that.mychart.getZr().on('click', (param) => {
          that.chartClick(param)
          const pointInPixel= [param.offsetX, param.offsetY];
          // console.log('修改之前', that.allseries);
          // return;
          if(this.status != 'real' && that.mychart.containPixel('grid',pointInPixel)) {
            var pointInGrid=that.mychart.convertFromPixel({seriesIndex:0},pointInPixel);
            //X轴序号
            var xIndex=pointInGrid[0];
            let info = {
              xIndex,
              isMark:that.PrimarySecondary.isMark
            }
            that.drawLine(xIndex,that.PrimarySecondary.isMark)
            that.$emit('drawMarkLine',info)
            // console.log(dataX[xIndex])
          }
        })
        this.resizeMaxInput()
      },
      setchart(flagX, flagY, dataX, dataY, title, subtitle, degree=null, type) {
        if(flagY === '[m/s2]') {
          flagY = '[m/s²]';
        }
        // 关于isDegree和timeWaveX：
        // 在往复机里面某些情况下dataY传进来的不是时间而是角度值，当isDegree为True时则代表传进来的是角度
        // timeWaveX仅在isDegree为True时有用，否则为空数组
        // 一般而言不必用如此难看的方式实现，但是不这样就要改很多代码
        if(degree) { // 进行一些特殊判断，防止接口没有传入开始点和结束点以后，数据出问题
          if(degree.endIndex === 0) {
            degree.endIndex = dataX.length - 1
          }
          if(degree.startIndex > degree.length) {
            degree.startIndex = 0
          }
        }
        this.offset = ''
        this.mainCursor = ''
        this.auxiliaryCursor =  ''
        // this.status = title.indexOf('实时') != -1 || title.indexOf('real')!= -1 ? 'real' : 'history'
        this.status = type;
        this.Title = title.indexOf('波形图') == -1 && title.indexOf('Waveform') == -1 ? title + ' 波形图' : title
        title = ''
        this.Title.trim().split(' ').forEach(item => title += this.translateText('chart.textMap.', item)+' ')
        this.drawchart( );
        this.$nextTick(()=> {
          this.setchartdata(flagX, flagY, dataX, dataY, title,subtitle, degree);
          this.setChartAfter()
        })

      },
      drawLine(xIndex,isMark){
        let that = this;
        let oldMark = that.PrimarySecondary.isMark
        that.PrimarySecondary.isMark = isMark
        that.allseries = that.mychart.getOption().series;
        let line_series = that.allseries[that.allseries.length - 1];
        let newTitle = []
        if(that.markPoint && that.markPoint.isMark) {
          return
        }
        //主辅游标
        if (that.PrimarySecondary.isMark) {
          that.primaryXIndex = xIndex;
          line_series['markLine']['data'][0] = [
            {
              coord:[xIndex,that.mychart.getOption().yAxis[0].min],//使用coord是为了在x轴存在相同值的情况下，在点击处划线
              lineStyle: {
                color: that.$store.state.colorMap[0],
                type: 'solid'
              }
            },
            {
              coord:[xIndex,that.mychart.getOption().yAxis[0].max]
            }
          ]
          newTitle.push({
            id: 'Main-Cursor',
            text: '[' + this.translateText('chart.textMap.','主游标')+': ' + parseFloat(that.dataX[xIndex]).toFixed(2).toString() + ", " + that.dataY[xIndex].toFixed(2) + ']',
          })
          if(that.mainCursor != undefined) that.mainCursor = parseFloat(that.dataX[xIndex]).toFixed(2).toString() + ", " + that.dataY[xIndex].toFixed(2) + ']'
        } else {
          that.auxiliaryXIndex = xIndex;
          line_series['markLine']['data'][1] = [
            {
              coord:[xIndex,that.mychart.getOption().yAxis[0].min],
              lineStyle: {
                color: that.$store.state.colorMap[1],
                type: 'solid'
              }
            },
            {
              coord:[xIndex,that.mychart.getOption().yAxis[0].max]
            }
          ]
          newTitle.push({
            id: 'Auxiliary-Cursor',
            text: '[' + this.translateText('chart.textMap.','辅游标')+': ' + parseFloat(that.dataX[xIndex]).toFixed(2).toString() + ", " + that.dataY[xIndex].toFixed(2) + ']'
          })
          if(that.auxiliaryCursor != undefined) that.auxiliaryCursor = parseFloat(that.dataX[xIndex]).toFixed(2).toString() + ", " + that.dataY[xIndex].toFixed(2) + ']'
        }

        line_series['markLine'].lineStyle.type = 'dashed'
        that.allseries[that.allseries.length - 1] = line_series;
        if (line_series['markLine']['data'].length >= 2 && line_series['markLine']['data'][0]) {
          let nowFrequency = 0;
          let startValue = 0;
          let endValue = 0;
          let startIndex = parseFloat(that.dataX[that.auxiliaryXIndex].toString());
          let endIndex = parseFloat(that.dataX[that.primaryXIndex].toString());
          startValue = Math.max(startIndex, endIndex);
          endValue = Math.min(startIndex, endIndex);
          console.log("差值计算", startValue, endValue)
          nowFrequency = 1.0 / Math.abs(startValue - endValue);
          newTitle.push({
            id: 'offset',
            text: 'ΔF = ' + nowFrequency.toFixed(2),
          })
          this.offset = 'ΔF = ' + nowFrequency.toFixed(2)
        }
        for(let tmp in that.allseries) {
          if(that.allseries[tmp].markLine) {
            that.allseries[tmp].markLine.lineStyle.color = that.$store.state.textcolor;
          }
          if (that.allseries[tmp].lineStyle && that.allseries[tmp].lineStyle.normal) {
            that.allseries[tmp].lineStyle.normal= {
              width: 0.5
            }
          }
        }

        let option = {
          series:that.allseries,
          title: newTitle,
        }
        // console.log('我裂开了',that.allseries)

        that.mychart.setOption(option);
        that.PrimarySecondary.isMark = oldMark
      }
    }
  }
</script>

<style scoped>

</style>
