import graphicMixin from "./graphicMixin";
import event from "@/assets/event";

const toolboxSpectrumGraphMixin = {
  mixins: [graphicMixin],
  data() {
    return {
      //使用细化时间
      useBruchTime: {
        icon: "M1.9,10.8c-0.5-0.7-1-1.6-1.2-2.5 M0.5,7c0-3.7,2.9-6.5,6.5-6.5s6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5\n" +
          "\tc-1.5,0-2.9-0.5-4.1-1.3 M5,7.3h2.3 M7.4,7.3V3.9",
        // icon: "M1.9,10.9c-0.5-0.7-1-1.6-1.2-2.5 M0.6,7c0-3.6,2.9-6.4,6.4-6.4s6.4,2.9,6.4,6.4s-2.9,6.4-6.4,6.4\n" +
        //   "\tc-1.5,0-2.9-0.5-4-1.3 M4.7,7h2.4 M7.2,7V3.8",
        // icon: "M274.6,21.2C414.5,21.2,528,134.7,528,274.6S414.5,528,274.6,528S21.2,414.5,21.2,274.6S134.7,21.2,274.6,21.2z"
        //   +"M405.2,286.6H261 M263,142.4v144.2",
        state: false,
      }
    }
  },
  activated() {
    event.$emit('updateBruchTimeState', this.useBruchTime.state);
  },
  methods: {

    /**
     * 图表标注功能
     * 需要用到的临时变量变量全在this.markPoint中
     * @param x 触发时的x轴位置
     * @param seriesNameIndex
     */
    markPointFun(x, seriesNameIndex = 0) {
      const chart = this.mychart
      //获取当前图表的option
      const op = chart.getOption();
      if(this.markPoint.isMark) { // 处在标注模式下
        // this.markPoint.markPointX保存当前标注过的坐标的信息
        let seriesIndex = seriesNameIndex
        console.log("测试seriesIndex", seriesIndex)
        if (this.otherTypeName == '阴影趋势图') {
          seriesIndex = 0;
        }
        let xName // x轴的值
        let y // y轴的值
        if(typeof chart.getOption().series[seriesIndex].data[x] === 'number') {
          y = chart.getOption().series[seriesIndex].data[x] // 获取这个点对应的y值
          xName = '' + chart.getOption().xAxis[0].data[x]
        } else {
          y = chart.getOption().series[seriesIndex].data[x][1] // 获取这个点对应的y值
          xName = '' + chart.getOption().series[seriesIndex].data[x][0]
        }
        // 通过set处理传入的x轴信息，如果当前没有标注过，进行标注，标注过了则取消标注
        let markPointX = new Set(this.markPoint.markPointX)
        // console.log(markPointX)
        let setNode = {seriesNameIndex, x, xName, y}
        console.log(xName, y);
        setNode = JSON.stringify(setNode)
        if(markPointX.has(setNode)) {
          // console.log("happen-> 找到了")
          // markPointX.delete(setNode)
        } else {
          // console.log("happen-> 找不到")
          markPointX.add(setNode)
          this.markPoint.markPointX = [...markPointX] // 处理完毕，讲set转换成数组
          this.addMarkPoint(xName, y.toString(), seriesIndex)
        }
        // this.refreshMarkPointFun()
      } else { // 取消标注后处理的事件
      }
    },



    /**
     * 显示两个时间的差
     * 需要修改optin的title，添加第二个标题，通过修改第二个标题实现显示功能
     * @update 更新日期 2022-04-13 15:17:36
     * @param time1
     * @param time2
     * @param seriesIndex1
     * @param seriesIndex2
     */
    xAxisSub(time1, time2, seriesIndex1 = 0, seriesIndex2 = 0) {
      console.log("happen->趋势图单独的计算两个时间的差", time1, time2)
      const op = this.mychart.getOption()
      if(op.xAxis[0].name == '[时间]' || op.xAxis[0].name == '[Time]'){
        // 计算时间差
        if(new Date(time1).getTime() < new Date(time2).getTime()) {
          // 交换
          const t = time1
          time1 = time2
          time2 = t
          let t2 = seriesIndex1
          seriesIndex1 = seriesIndex2
          seriesIndex2 = t2
        }

        // 计算y轴的差值

        // console.log("happen->op.xAxis[0].data", op.xAxis[0].data)
        const y1 = op.xAxis[0].data.indexOf(time1)
        const y2 = op.xAxis[0].data.indexOf(time2)
        console.log("happen->y1, y2", y1, y2, seriesIndex1, seriesIndex2)
        console.log("happen->op.series[seriesIndex1].data", op.series[seriesIndex1].data)
        // 幅值差量

        let subFuzhi = 0
        if(op.series[seriesIndex1].data[y2] instanceof Array) {
          subFuzhi = op.series[seriesIndex1].data[y2][1] - op.series[seriesIndex2].data[y1][1]
        } else {
          subFuzhi = op.series[seriesIndex1].data[y2] - op.series[seriesIndex2].data[y1]
        }

        // console.log("happen->幅值", subFuzhi)
        const dateEnd = new Date(time1)
        const dateBegin = new Date(time2)
        const dateDiff = dateEnd.getTime() - dateBegin.getTime()// 时间差的毫秒数
        const dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000))// 计算出相差天数
        const leave1 = dateDiff % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
        const hours = Math.floor(leave1 / (3600 * 1000))// 计算出小时数
        // 计算相差分钟数
        const leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
        const minutes = Math.floor(leave2 / (60 * 1000))// 计算相差分钟数
        // 计算相差秒数
        const leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
        const seconds = Math.round(leave3 / 1000)

        const titles = op.title
        let titleIndex = this.subTitleData.index

        let yAxisUnit = op.yAxis[0].name ? op.yAxis[0].name.substring(1, op.yAxis[0].name.length - 1) : '';//定义yAxisUnit来处理y轴没单位情况下的报错问题

        titles[titleIndex].text = `[${this.translateText("chart.textMap.","差量")} ${dayDiff} ${this.translateText("chart.textMap.","天")} ${hours} ${this.translateText("chart.textMap.","时")} ${minutes} ${this.translateText("chart.textMap.","分")} ${seconds} ${this.translateText("chart.textMap.","秒")} ${Math.abs(subFuzhi).toFixed(2)} ${yAxisUnit}]`
        this.offset = `差量 ${dayDiff} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒 ${Math.abs(subFuzhi).toFixed(2)} ${yAxisUnit}`
        const option = {
          title: titles
        }
        this.mychart.setOption(option)
      }else {
        if(time1 > time2) {
          // 交换
          const t = time1
          time1 = time2
          time2 = t
          let t2 = seriesIndex1
          seriesIndex1 = seriesIndex2
          seriesIndex2 = t2
        }

        // 计算y轴的差值
        // 将获取时间的坐标
        const y1 = op.xAxis[0].data.indexOf(time1)
        const y2 = op.xAxis[0].data.indexOf(time2)
        // 幅值差量
        const subFuzhi = op.series[seriesIndex1].data[y2] - op.series[seriesIndex2].data[y1]
        const titles = op.title
        let xName = op.xAxis[0].name.substring(1, op.xAxis[0].name.length - 1);
        let yName = op.yAxis[0].name.substring(1, op.yAxis[0].name.length - 1)
        let titleIndex = this.subTitleData.index
        titles[titleIndex].text = `[${this.translateText("chart.textMap.","差量")} ${(time2 - time1).toFixed(2)} ${xName} ${subFuzhi.toFixed(2)} ${yName}]`
        this.offset = `差量 ${(time2 - time1).toFixed(2)} ${xName} ${subFuzhi.toFixed(2)} ${yName}`
        const option = {
          title: titles
        }
        this.mychart.setOption(option)
      }

    },

    /**
     * 返回HistoryToolbox的feature
     */
    getTrendGraphHistoryToolboxFeature() {
      return {
        myUseBruchTime: {
          title: this.translateText("chart.textMap.", "使用细化时间"),
          icon: this.useBruchTime.icon,
          show: this.$route.path.indexOf("RotatingMachineryGraph/StartStopGraph") == -1,
          iconStyle: {
            borderColor: this.useBruchTime.state ?'#74ACC8' : null
          },
          onclick: () => {
            let option = {
              toolbox: {
                feature: {
                  myUseBruchTime: {
                    iconStyle: {
                      borderColor: '#74ACC8'
                    }
                  }
                }
              }
            }

            if(this.useBruchTime.state) {
              this.$store.state.useBruchTime = false
              // 还原图表线条颜色
              option.toolbox.feature.myUseBruchTime.iconStyle.borderColor = null
              this.useBruchTime.state = false
              option.toolbox.feature.myUseBruchTime.title = this.translateText("chart.textMap.", "使用细化时间")
            } else {
              this.useBruchTime.state = true
              this.$store.state.useBruchTime = true
            }
            event.$emit('updateBruchTimeState', this.useBruchTime.state);

            this.mychart.setOption(option)
          }
        },
      }
    }
  }
}

export default toolboxSpectrumGraphMixin
