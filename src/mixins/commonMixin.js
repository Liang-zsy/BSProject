/*
存放所有组件里面公共的函数，方便后期维护
文件包含的功能
drawLine 画线函数
drawLineAndProLine 画两条线
xAxisSub 显示两个x轴的差，需要xAxisSubData传入参数，可以默认不写
chartClick 图谱点击事件

需要注册一下单击事件，可以放在下面这一行代码的下面
-> that.mychart = that.echarts.init(that.$refs.SmyChart, 'halloween')

//扩大点击响应的范围
// 当点击图谱区域时，获得当前x轴坐标，并进行波形频谱图重绘
that.mychart.getZr().off("click");
that.mychart.getZr().on("click", this.chartClick);

 */

const commonMixin = {
  data() {
    return {
      subTitleData: { // 差值的标题
        index: 1, // 显示两个x轴的差的title索引
        offsetX: 0,
        offsetY: 0,
      },
      proLine: null, // 上一条线下标
      proLineSeriesIndex: null, // 上一条线的seriesIndex
      clickParam: {},
    }
  },
  mounted() {

  },
  methods: {

    /**
     * 显示两个x轴的差
     * 需要修改optin的title，添加第二个标题，通过修改第二个标题实现显示功能
     * @update 更新日期2022-03-18 09:06:05
     * @param time1
     * @param time2
     */
    xAxisSub(a1, a2, seriesIndex1, seriesIndex2) {
      // a1 保存小的坐标 a2保存大的坐标
      if(a1 > a2) {
        let t = a2;
        a2 = a1;
        a1 = t;
        let t2 = seriesIndex1
        seriesIndex1 = seriesIndex2
        seriesIndex2 = t2
      }

      // 计算y轴的差值
      const op = this.mychart.getOption()
      const y1 = op.xAxis[0].data.indexOf(a1)
      const y2 = op.xAxis[0].data.indexOf(a2)
      // 幅值差量
      const subFuzhi = op.series[seriesIndex1].data[y2] - op.series[seriesIndex2].data[y1]

      const titles = op.title
      let xName = op.xAxis[0].name.substring(1, op.xAxis[0].name.length - 1);
      let yName = op.yAxis[0].name.substring(1, op.yAxis[0].name.length - 1)
      let titleIndex = this.subTitleData.index
      titles[titleIndex].text = `[差量${(a2 - a1).toFixed(2)}${xName},${subFuzhi.toFixed(2)}${yName}]`
      const option = {
        title: titles
      }
      this.mychart.setOption(option)
    },

    /**
     * 图表鼠标单击事件处理
     * 使用方法，任意位置注册即可
     * this.mychart.getZr().off("click");
     * this.mychart.getZr().on("click", this.chartClick);
     * @param params
     */
    chartClick(params) {

      // 如果点击了可拖拽的标注，不执行下面的代码
      if (this.clickgraphic) {
        this.clickgraphic = false;
        return ;
      }

      console.log(params);
      const chart = this.mychart
      //获取当前图表的option
      var op = chart.getOption();

      const pointInPixel = [params.offsetX, params.offsetY];
      // >> 处置无线机泵获取最近高亮点
      let highLightIndex = -1;
      if(this.isWirelessPumpTrendGraph !== 'undefined' && this.isWirelessPumpTrendGraph && this.highLightPoints)  {
        let timeX = this.$store.state.tooltipTime;

        var min = Number.MAX_VALUE;
        // console.log("high", this.highLightPoints);
        for(let i = 0; i < this.highLightPoints.length; ++i) {
          let pointX = new Date(this.highLightPoints[i][0]).getTime();
          if(Math.abs(pointX-timeX) < min) {
             min = Math.abs(pointX-timeX);
            highLightIndex = i;
          }
        }
        if(highLightIndex != -1) {
          this.$store.state.tooltipTime = new Date(this.highLightPoints[highLightIndex][0]).getTime();
        }
      }
      // << 处置无线机泵获取最近高亮点

      if (this.mychart.containPixel("grid", pointInPixel)) {
        let pointInGrid = this.mychart.convertFromPixel(
          { seriesIndex: 0 },
          pointInPixel
        );
        //X轴序号
        var xIndex = pointInGrid[0];
        let modelFlag = false;
        try {
          modelFlag = op.toolbox[0].feature.myModel.title == '数据点等分' ||  op.toolbox[0].feature.myModel.title == 'Data Partitioning Point'? true : false;
        }
        catch (e) {
          console.log(e);
        }

        // console.log(this.$store.state.tooltipTime, this.$store.state.modelFlag, this.typename);
        if (modelFlag && (this.typename == '趋势图' || this.typename == 'Trend')) {
          // console.log(this.$store.state.tooltipTime, op.xAxis[0].data);
          for (let item in op.xAxis[0].data) {
            if (new Date(op.xAxis[0].data[item]).getTime() == this.$store.state.tooltipTime) {
              xIndex = Number(item);
              // console.log('匹配成功',item, new Date(op.xAxis[0].data[item]).getTime(), op.xAxis[0].data[item]);
              break;
            }
          }
        }

        if (this.graphType === '倒谱图' || this.graphType === '频谱图' || this.graphType === '波形图') {
          xIndex = Number(this.tooltipIndex);
        }

        //Y轴序号
        var yIndex = pointInGrid[1];
        // if(highLightIndex != -1) yIndex = this.highLightPoints[highLightIndex][1];
        console.log("happen->xIndex yIndex", xIndex, yIndex)
        // >> 处理轴心位置标点
        let closePointIndex = -1;
        if(this.axisPositionFlag !== 'undefined' && this.axisPositionFlag) {

          let closestLine = this.getAxisPosition(params, xIndex, yIndex);
          xIndex = closestLine[0].toFixed(3);
          yIndex = closestLine[1].toFixed(3);
          closePointIndex = closestLine[2];
          var param = {};
          param.name = this.posListTime[closePointIndex];
          param.xIndex = xIndex
          if(this.status == undefined || this.status != 'real') {
            this.$emit("chartinfo", param);
          }
          this.handleAxisPosition(params, xIndex, yIndex);

        }
        // << 处理轴心位置标点

        // 获取离鼠标最近的 series 的线的index，以便提供给其他组件
        var min = Number.MAX_VALUE;
        var seriesNameIndex = 0;
        for (var i = 0; i < op.series.length; i++) {
          // console.log(op.series[i].data[xIndex]);
          try {
            if (op.series[i].data && (modelFlag ? op.series[i].data[xIndex][1] : op.series[i].data[xIndex]) != null && Math.abs((modelFlag ? op.series[i].data[xIndex][1] : op.series[i].data[xIndex]) - yIndex) < min) {
              min = Math.abs((modelFlag ? op.series[i].data[xIndex][1] : op.series[i].data[xIndex]) - yIndex);
              seriesNameIndex = i;
            }
          } catch (e) {
            console.log(e);
          }

        }
        try {
          if(op.xAxis[0].data[xIndex] === '' || op.series[seriesNameIndex].data[xIndex] === null) { // 如果这一点没有数据，则不进行任何实践的处理
            console.log("这一点没有数据，因此不执行操作")
            return
          }
        } catch (e) {
          console.log(e);
        }


        console.log("happen->seriesNameIndex", seriesNameIndex)

        if (this.markPoint.isMark) {
          // 处理图表标注功能
          // console.log(xIndex, yIndex, op.xAxis[0].data[xIndex], this.$store.state.tooltipTime);
          this.markPointFun(xIndex, seriesNameIndex, yIndex, closePointIndex);
        }
        if(this.markLine.isResonance) {
          // 处理 谐频
          this.harmonicFrequency(xIndex)
        }
        // 如果执行上面的特殊功能的话，直接阻止画线和刷新
        if(this.markPoint.isMark || this.markLine.isResonance) {
          return
        }

        this.hideAllInput()

        //获得图表中我们想要的数据封装为param {name: '2022-03-05 07:51:38.785', seriesName: '2级A壳体振动V'}
        var param = {};
        param.name = op.xAxis[0].data[xIndex];
        param.xIndex = xIndex
        param.seriesNameIndex = seriesNameIndex
        param.seriesName = op.series[seriesNameIndex].name;
        param.seriesId = op.series[seriesNameIndex].id;//seriesId的值用于往复-振动监测，点击趋势图后显示波形图，请求传参数
        param.seriesY = op.series[seriesNameIndex].data[xIndex]
        param.yIndex = yIndex
        this.clickParam = param
        console.log("happen->param", param, op.series[seriesNameIndex].data[xIndex])

        // console.log("happen->seriesNameIndex", seriesNameIndex)

        if(this.graphType === '倒谱图' || this.graphType === '频谱图' || this.graphType === '波形图'){
          this.drawLineAndProLine(param.name, seriesNameIndex, param, null,xIndex, yIndex)
          return
        }


        if(this.status == undefined || this.status != 'real') {
          this.drawLineAndProLine(param.name, seriesNameIndex, param, null,xIndex, yIndex)
          // 告诉父组件刷新其他页面，父组件如果不执行这个函数，相当于没有影响
          this.$emit("chartinfo", param);
        }

      }
    },
    /**
     * 图谱绘图完毕以后执行
     */
    setChartAfter() {
      // console.log("setChartAfter后执行")

      // 初始化最大值最小值框
      if(this.firstEnter != undefined && this.firstEnter) {
        this.firstEnter = false
        this.initMaxInput()
      }

      // 进行标注处理
      if(this.markPoint.isMark) {
        this.markPoint.isMark = false
        this.markPointList = []
        let feature = this.mychart.getOption().toolbox[0].feature;
        if(feature.myMark) feature.myMark.title = this.markPoint.isMark ? this.translateText("chart.textMap.", "取消标注") : this.translateText("chart.textMap.", "标注")
        this.mychart.setOption({
          toolbox: [{
            feature
          }]
        });
      }
      //波形点处理
      // if(this.showWavePointFlag != undefined && this.showWavePointFlag){
      //   this.showWavePointFlag = false
      // }

      // 进行标点处理
      if(this.myMarkPoint.state) {
        console.log("进行标点处理")
        this.myMarkPointFun()

      }
      // 自动寻峰
      if(this.peakSearch.state) {
        this.peakSearchFun()
      }
      // 清空所有的proLine
      this.proLine = null

      // 在细化，更改时间范围也就是刷新数据的时候，进行最大值最小值框的保留更改
      // this.refreshMinMax()

      if(this.PrimaryLine != undefined){
        this.PrimaryLine = null
      }
      if(this.SecondaryLine != undefined){
        this.SecondaryLine = null
      }

      this.createDropdownMenu();
    },

    /**
     * 获取轴心位置最近点位置
     * 返回值包括x, y, 和对应最近点的下标
     * @param {*} params
     */
    getAxisPosition(params, xIndex, yIndex) {
      const chart = this.mychart
      //获取当前图表的option
      var op = chart.getOption();
      console.log("happen->轴心位置标点op", op);
      console.log("happen->轴心位置标点params", params);

      let series = op.series[0].data;
      // 找到距离xIndex, yIndex距离最近的线
      let closestLine = null;
      let closestDistance = Infinity;
      series.forEach((seriesItem, index) => {
        const distance = Math.abs(xIndex - seriesItem[0])*Math.abs(xIndex - seriesItem[0]) + Math.abs(yIndex - seriesItem[1])*Math.abs(yIndex - seriesItem[1]);
        if (distance < closestDistance) {
          closestLine = [...seriesItem,  index];
          closestDistance = distance;
        }
      });
      console.log("happen->轴心位置标点closestLine", closestLine);
      return closestLine;
    },

    /**
     * 图表鼠标单击事件处理
     * 处理轴心位置标点
     * 需要画出一个十字线
     */
    handleAxisPosition(params, xIndex, yIndex) {
      const chart = this.mychart
      //获取当前图表的option
      var op = chart.getOption();
      console.log("happen->轴心位置标点op", op);
      console.log("happen->轴心位置标点params", params);

      // 找到距离xIndex, yIndex距离最近的线
      let closestLine = this.getAxisPosition(params, xIndex, yIndex);
      // 基于标点位置画十字线

      if (closestLine) {

        // 给定最近点的坐标
        let xValue = closestLine[0];
        let yValue = closestLine[1];


        let series = op.series[0];

        // 确保 markLine 属性存在并且有一个 data 数组
        if (!series.markLine) {
          series.markLine = {data: []};
        }
        if(series.markLine.data.length > 2 ){
          series.markLine.data[2] ={
            xAxis: ''+xValue.toFixed(3), // 垂直线
            lineStyle: {
              color: this.$store.state.linecolor,
              width: 1, // 线宽
              type: 'dashed' // 实线
            },
            id: 'crossMarkLines xValue: ' + xValue,
          }
          series.markLine.data[3] ={
            yAxis: ''+yValue.toFixed(3), // 水平线
            lineStyle: {
              color: this.$store.state.linecolor,
              width: 1, // 线宽
              type: 'dashed' // 虚线
            },
            id: 'crossMarkLines yValue: ' + yValue,
          }
        }else{
          series.markLine.data.push({
              xAxis: ''+xValue.toFixed(3), // 垂直线
              lineStyle: {
                color: this.$store.state.linecolor,
                width: 1, // 线宽
                type: 'dashed' // 实线
              },
              id: 'crossMarkLines xValue: ' + xValue,
            },
            {
              yAxis: ''+yValue.toFixed(3), // 水平线
              lineStyle: {
                color: this.$store.state.linecolor,
                width: 1, // 线宽
                type: 'dashed' // 虚线
              },
              id: 'crossMarkLines yValue: ' + yValue,
            })
        }

        // 为十字线构造新的 markLine 项，每一项都有自己的 lineStyle
        // 隐藏线

        // let crossMarkLines = [
        //   {
        //     xAxis: ''+xValue.toFixed(3), // 垂直线
        //     lineStyle: {
        //       color: this.$store.state.linecolor,
        //       width: 1, // 线宽
        //       type: 'dashed' // 实线
        //     },
        //     id: 'crossMarkLines xValue: ' + xValue,
        //   },
        //   {
        //     yAxis: ''+yValue.toFixed(3), // 水平线
        //     lineStyle: {
        //       color: this.$store.state.linecolor,
        //       width: 1, // 线宽
        //       type: 'dashed' // 虚线
        //     },
        //     id: 'crossMarkLines yValue: ' + yValue,
        //   }
        // ];

        // 将这些新的 markLine 项添加到现有的 markLine 数据中
        // for(let crossMarkLineItem of crossMarkLines) {
        //   // 在series.markLine.data中查找相同的项
        //
        //   let existingItem = series.markLine.data.find
        //     (item => item.id === crossMarkLineItem.id);
        //
        //   // 如果不存在相同的项，则添加
        //   if (existingItem == undefined) {
        //     series.markLine.data.push(crossMarkLineItem);
        //   }
        //
        // }

        // 不会改变现有的线数据或之前设置的任何 markLines
        // 应用更新后的配置
        chart.setOption(op);

      }
    }
  },


}

/**
 * 图表的公共toolbox
 */
export default commonMixin
