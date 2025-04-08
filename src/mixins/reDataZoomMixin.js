import {timestampToTimeFormat} from "../components/ComUtils/TimeFormat";
import line from "echarts/src/chart/helper/Line";
import {none} from "html-webpack-plugin/lib/chunksorter";

const reDataZoomMixin ={
  data() {
    return {
      // num: 0,
      zoomState: true
    }
  },
  methods:{
    /**
     * @description: 放大操作按钮
     * @author: HHy
     * @date: 2024/11/6 14:55
     **/
    reDataZoomIn(){ // 放大
      let myDataZoomIn = {
        show: this.brushState != undefined ? !this.brushState : true,
        type: ["lineX"],
        title: {
          lineX: this.translateText("chart.textMap.",'放大')
        },
        icon: {
          lineX: "M13.5,7c0,3.7-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7c0-3.7,2.9-6.5,6.5-6.5S13.5,3.3,13.5,7z M7,9.6V4.4 M9.6,7H4.4"
        },
        iconStyle: {
          borderColor: this.zoomState ? '#74ACC8' : null
        },
        onclick: () => {
          // if (!this.markPoint.isMark&&!this.brushState){
            this.zoomState = !this.zoomState
          try {
            let option = this.mychart.getOption();
            // console.log(option);
            option.series = option.series.map(item => {
              item.lineStyle.normal.width = 1
              return item
            })
            option.toolbox[0].feature.myDataZoomIn.iconStyle.borderColor = this.zoomState ? '#74ACC8' : null;
            option.brush[0].brushStyle.shadowColor = this.zoomState ? '#74ACC8' : null;
            option.brush[0].brushStyle.opacity = this.zoomState ? 0.8 : 0;
            // console.log("测试测试执行到了自定义")
            this.mychart.setOption(option)

            this.mychart.dispatchAction({
              type: "takeGlobalCursor",
              key: "brush",
              brushOption: {
                brushType: this.zoomState ? "lineX" : false,
              },
              brushStyle: {
                borderWidth: 1,
                color: 'rgba(0, 0, 0, 0.4)',  // 特定选框颜色
                borderColor: 'rgba(0, 0, 0, 0.4)'
              }
            });
          } catch (e) {
            console.log(e);
          }
        // }
        }
      }
      return {myDataZoomIn}
    },
    /**
     * @description: 放大还原操作按钮实现，点击时触发还原操作
     * @author: HHy
     * @date: 2024/11/6 14:55
     **/
    reDataZoomOut(){ // 放大还原
      let myDataZoomOut = {
        show: this.brushState != undefined ? !this.brushState : true,
        yAxisIndex: "none",
        title:  this.translateText("chart.textMap.",'放大还原'),
        icon: "M7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7S3.4,0.5,7,0.5z M9.6,7H4.4",

        onclick: ()=>{
          // console.log("测试1，点击进入操作")
          this.$emit("reDataZoom")
        }
      }
      return {myDataZoomOut}
    },

    /**
     * @description: 放大时，需要对数据进行筛选，然后重新赋值给series以及xAxis，原始数据分别为OriginalSeries和OriginalXAxisData
     * @author: HHy
     * @date: 2024/11/6 14:54
     * @param Begin 放大的开始位置
     * @param End 放大的结束位置
     **/
    dataZoom(Begin,End){
      this.mychart.dispatchAction({
        type: 'dataZoom',
        xAxisIndex: 0,
        startValue: Begin,
        endValue: End
      });
    },
    /**
     * @description: 还原放大-通过传入的区间值进行还原操作，flag表示是否是还原到最初始的画图区间
     * @author: HHy
     * @date: 2024/11/6 14:51
     * @param reOriginalSeriesData 原始的Series数据
     * @param myOption 当前的option,需要重新传递的Option
     * @param zoomBegin 需要还原的区间开始值
     * @param zoomEnd 需要还原的区间结束值
     * @param flag 是否是还原到最初始的画图区间
     **/
    reDataZoom(reOriginalSeriesData,myOption,zoomBegin,zoomEnd,flag){
      this.mychart.dispatchAction({
        type: 'dataZoom',
        xAxisIndex: 0,
        startValue: zoomBegin,
        endValue: zoomEnd
      });
    }
  }
}
export default reDataZoomMixin
