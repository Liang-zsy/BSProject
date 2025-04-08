/*
toolbox混入，将公共的toolbox中的feature混入到vue中
使用方法
找到historytoolbox的feature，然后加入下面的内容
 */
// 标注
/*
          myMark: {
            title: '标注',
            show: true,
            icon: this.markPoint.markIcon,
            iconStyle: {
              borderColor: this.markPoint.isMark ?'#74ACC8' : this.$store.state.toolboxcolor
            },
            onclick:  ()=>{
              console.log('实时模式下的')
              let option = {
                series: [{
                  markPoint: {
                    data: []
                  },
                }],
                toolbox: {
                  feature: {
                    myMark: {
                      iconStyle: {
                        borderColor: '#74ACC8'
                      }
                    }
                  }
                }
              }
              if(this.markPoint.isMark) {
                // console.log('当前是标记状态下')
                // 如果当前是标记状态,需要取消标记
                this.markPoint.isMark = false;
                option.toolbox.feature.myMark.iconStyle.borderColor = this.$store.state.toolboxcolor
                option.series[0].markPoint= { // 恢复最大值下表样式
                  symbol: 'path://M 512 128 l -213.333 256 l 170.667 0 l 0 512 l 85.333 0 l 0 -512 l 170.667 0 Z',
                  symbolSize: 15,
                  itemStyle: {
                    color: this.$store.state.textcolor,
                  },
                  data: [{
                    name: 'max',
                    y: '92%',
                    xAxis: maxX,
                  }]
                }
              } else {
                this.markPoint.isMark = true;
                this.markPoint.markPointX = []
              }
              this.mychart.setOption(option)
            }
          },


 */
// 谐频
/*
          myResonance: {
            show: true,
            title: '谐频',
            icon: this.markLine.icon,
            iconStyle: {
              borderColor: this.markLine.isResonance ?'#74ACC8' : this.$store.state.toolboxcolor
            },
            onclick:  ()=>{
              let option = {
                series: [{
                  markLine: {
                    data: []
                  },
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
                // 还原图表线条颜色
                option.toolbox.feature.myResonance.iconStyle.borderColor = this.$store.state.toolboxcolor
              } else {
                this.markLine.isResonance = true;
              }
              this.mychart.setOption(option)
            }
          },

 */

import toolboxMoreMixin from "./toolboxMoreMixin";
import graphicMixin from "./graphicMixin";
import {timestampToTimeFormat} from "../components/ComUtils/TimeFormat";
import event from "@/assets/event";

const toolboxMixin = {
  mixins: [toolboxMoreMixin, graphicMixin],

  data() {
    return {
      markLine: { // 谐频数据标注列相关变量
        show: true, // 是否进行 谐频
        icon: 'M13.5,7c0,3.7-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7c0-3.7,2.9-6.5,6.5-6.5S13.5,3.3,13.5,7z M3.1,3.2v7.6 M3.1,3.9\n' +
          'h7.7 M3.1,7.5h3.4 M6.8,4.2v1.2 M6.9,6.9v1.2 M6.8,9.6v1.2 M7.4,7.5h2.5 M10.5,4.2v1.2 M10.5,6.9v1.2 M10.5,9.6v1.2 M10,7.3v0.3\n' +
          'l0.2-0.2L10,7.3z M7.2,7.5l0.2,0.2V7.3L7.2,7.5z\n',
        // icon: 'M13.5,7c0,3.7-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7c0-3.7,2.9-6.5,6.5-6.5S13.5,3.3,13.5,7z M3.1,3.2v7.6 M3.1,3.9\n' +
        //   'h7.7 M3.1,7.5h3.4 M6.8,4.2v1.2 M6.9,6.9v1.2 M6.8,9.6v1.2 M7.4,7.5h2.5 M10.5,4.2v1.2 M10.5,6.9v1.2 M10.5,9.6v1.2 M10,7.3v0.3\n' +
        //   'l0.2-0.2L10,7.3z M7.2,7.5l0.2,0.2V7.3L7.2,7.5z\n',
        isResonance: false,
      },
      proMarkPoint: [],
      markPoint: { // 数据标注点相关变量
        show: true, // 是否进行 标注
        markPointX: [], // 当前标记的数据
        markIcon: 'M3,9.8C2.9,9.7,2.9,9.6,3,9.5l5.3-5.2c0.2-0.2,0.4-0.2,0.6,0l1.4,1.4c0.2,0.2,0.2,0.4,0,0.6L5,11.4\n' +
          '\t\tc-0.1,0.1-0.3,0.1-0.4,0L3,9.8z M7,5.9l0.6,0.6 M5.6,7l0.7,0.7 M4.4,8.4L5,9 M5,5.1L3.9,4.1c0,0-0.1,0-0.2,0L2.6,5.2\n' +
          '\t\tc0,0,0,0.1,0,0.2l1.1,1.1 M8,10.7l0.9,0.9h1.2v-1.2L9.3,9.5 M7,0.5C3.4,0.5,0.5,3.4,0.5,7s2.9,6.5,6.5,6.5s6.5-2.9,6.5-6.5\n' +
          '\t\tS10.6,0.5,7,0.5z',
        // markIcon: 'M3,9.8C2.9,9.7,2.9,9.6,3,9.5l5.3-5.2c0.2-0.2,0.4-0.2,0.6,0l1.4,1.4c0.2,0.2,0.2,0.4,0,0.6L5,11.4\n' +
        //   '\t\tc-0.1,0.1-0.3,0.1-0.4,0L3,9.8z M7,5.9l0.6,0.6 M5.6,7l0.7,0.7 M4.4,8.4L5,9 M5,5.1L3.9,4.1c0,0-0.1,0-0.2,0L2.6,5.2\n' +
        //   '\t\tc0,0,0,0.1,0,0.2l1.1,1.1 M8,10.7l0.9,0.9h1.2v-1.2L9.3,9.5 M7,0.5C3.4,0.5,0.5,3.4,0.5,7s2.9,6.5,6.5,6.5s6.5-2.9,6.5-6.5\n' +
        //   '\t\tS10.6,0.5,7,0.5z',
        //markIcon: 'M178.6,432.3 M277.8,432.3 M294.7,539L178.6,432.3H51.1c-27.1,0-49.1-22-49.1-49.2V51.2C1.9,24,23.9,2,51.1,2 c0,0,0,0,0,0h447c27.1,0,49.1,22,49.1,49.2v332c0,27.1-22,49.1-49.2,49.1H277.7L294.7,539z M407.8,155.7H141.3 M407.8,276.7H141.3',
        isMark: false,
      },
      //自动寻峰
      peakSearch: {
        icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M3.3,3.5v7.2\n' +
          'M3.3,10.7h8.1 M5.6,4.9l-2,5.6 M5.2,4.8h1.1 M8.2,5.9h1.1 M5.8,4.9l1.3,3.6 M7.5,8.4l1.3-2.5 M8.8,5.9l1.4,2.8 M7.3,8.5\n' +
          "C7,8.5,6.9,8.7,6.9,8.9S7,9.3,7.3,9.3s0.4-0.2,0.4-0.4S7.5,8.5,7.3,8.5z M10.3,8.7c-0.2,0-0.4,0.2-0.4,0.4s0.2,0.4,0.4,0.4\n" +
          "s0.4-0.2,0.4-0.4S10.5,8.7,10.3,8.7z",
        // icon: 'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M4.15,6.51\n' +
        //   '\tc-0.28,0-0.5,0.23-0.5,0.5c0,0.28,0.23,0.5,0.5,0.5s0.5-0.23,0.5-0.5C4.66,6.73,4.43,6.51,4.15,6.51z M7.16,6.53\n' +
        //   '\tc-0.28,0-0.5,0.23-0.5,0.5c0,0.28,0.23,0.5,0.5,0.5s0.5-0.23,0.5-0.5C7.67,6.76,7.44,6.53,7.16,6.53z M10.18,6.56\n' +
        //   '\tc-0.28,0-0.5,0.23-0.5,0.5s0.23,0.5,0.5,0.5s0.5-0.23,0.5-0.5S10.45,6.56,10.18,6.56z',
    //     icon: 'M13.5,7.1c0,3.7-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.5c0-3.7,2.9-6.5,6.5-6.5S13.5,3.4,13.5,7.1z M3.3,3.5v7.2\n' +
    //     'M3.3,10.7h8.1 M5.6,4.9l-2,5.6 M5.2,4.8h1.1 M8.2,5.9h1.1 M5.8,4.9l1.3,3.6 M7.5,8.4l1.3-2.5 M8.8,5.9l1.4,2.8 M7.3,8.5\n' +
    // "C7,8.5,6.9,8.7,6.9,8.9S7,9.3,7.3,9.3s0.4-0.2,0.4-0.4S7.5,8.5,7.3,8.5z M10.3,8.7c-0.2,0-0.4,0.2-0.4,0.4s0.2,0.4,0.4,0.4\n" +
    // "s0.4-0.2,0.4-0.4S10.5,8.7,10.3,8.7z",
        state: false,
      },
      myMarkPoint: {
           icon: 'M13.5,7c0,3.6-2.8,6.5-6.5,6.5c-3.6,0-6.5-2.8-6.5-6.5S3.4,0.5,7,0.5C10.6,0.5,13.5,3.5,13.5,7z M3.4,5.3\n' +
            'c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S4,5.3,3.4,5.3z M9,2.9C8.4,2.9,7.9,3.4,7.9,4S8.4,5.1,9,5.1s1.1-0.5,1.1-1.1S9.6,2.9,9,2.9z\n' +
            '\tM6.1,9.1c-0.7,0-1.1,0.5-1.1,1.1s0.5,1.1,1.1,1.1s1.1-0.5,1.1-1.1C7.3,9.6,6.7,9.1,6.1,9.1z M10.8,7.2c-0.5,0-1,0.5-1,1s0.5,1,1,1\n' +
            's1-0.5,1-1C11.8,7.6,11.4,7.2,10.8,7.2z M4,7.1L5.4,9 M8.6,5.1l-2,4 M9.4,5.2l0.9,1.9',
        // icon: 'M13.4,7.03c0,3.5-2.8,6.4-6.4,6.4c-3.5,0-6.4-2.8-6.4-6.4s2.8-6.4,6.4-6.4C10.5,0.63,13.4,3.53,13.4,7.03z   M3.6,5.03c-0.73,0-1.25,0.52-1.25,1.25S2.87,7.53,3.6,7.53s1.25-0.52,1.25-1.25S4.33,5.03,3.6,5.03z M8.6,3.03  c-0.8,0-1.4,0.6-1.4,1.4s0.6,1.4,1.4,1.4s1.4-0.6,1.4-1.4S9.4,3.03,8.6,3.03z M6.1,8.43c-0.8,0-1.4,0.6-1.4,1.4s0.6,1.4,1.4,1.4  s1.4-0.6,1.4-1.4C7.6,9.03,6.9,8.43,6.1,8.43z M10.4,6.73c-0.65,0-1.2,0.55-1.2,1.2c0,0.65,0.55,1.2,1.2,1.2s1.2-0.55,1.2-1.2  C11.6,7.28,11.05,6.73,10.4,6.73z M5.5,8.93l-1.4-2 M8.3,5.53l-1.7,3.2 M9,5.33l0.9,1.7',
        // icon: 'M546.1,546.7H2.9V2.6 M73.9,292.7c-18.2,0-33.5,14.4-33.5,32.4c0,18.1,15,32.4,33.5,32.4s33.5-14.4,33.5-32.4\n' +
        //   '\tC107.5,307.7,92.7,292.7,73.9,292.7z M482.7,240.2c20.9,10.2,27.9,54.4,62.8,54.4 M352.2,365.1c33.7-16,78.6-108.2,112-124.5\n' +
        //   '\t M218.7,140.6c34,26.5,73.3,196.8,114,223.4 M94.3,335.1 M201.7,140.5c-32.2,22.8-76.1,157.1-107.4,194.6 M66.5,341.1\n' +
        //   '\tC49,331.6,36.1,306.5,3,306.5 M73.9,301.2c-13.5,0-24.8,10.7-24.8,24s11.1,24,24.8,24s24.8-10.7,24.8-24\n' +
        //   '\tC98.8,312.2,87.9,301.2,73.9,301.2z M73.9,312.1c-7.3,0-13.5,5.8-13.5,13.1c0,7.3,6,13.1,13.5,13.1c7.5,0,13.5-5.8,13.5-13.1\n' +
        //   '\tC87.4,318.1,81.5,312.1,73.9,312.1z M73.9,309.3c-8.9,0-16.4,7-16.4,15.9s7.4,15.9,16.4,15.9s16.4-7,16.4-15.9\n' +
        //   '\tC90.4,316.6,83.1,309.3,73.9,309.3z M73.9,308.1c-9.6,0-17.6,7.6-17.6,17.1s7.9,17.1,17.6,17.1s17.6-7.6,17.6-17.1\n' +
        //   '\tC91.6,316,83.8,308.1,73.9,308.1z M92.5,315.4c-3.6-6.3-10.5-10.7-18.5-10.7c-11.5,0-21.2,9.1-21.2,20.5s9.5,20.5,21.2,20.5\n' +
        //   '\ts21.2-9.1,21.2-20.5C95.1,321.7,94.1,318.3,92.5,315.4 M73.9,298.2c-15.2,0-27.9,12-27.9,27s12.5,27,27.9,27s27.9-12,27.9-27\n' +
        //   '\tC101.9,310.6,89.6,298.2,73.9,298.2z M73.9,296.4c-16.2,0-29.8,12.8-29.8,28.8S57.5,354,73.9,354s29.8-12.8,29.8-28.8\n' +
        //   '\tC103.7,309.6,90.6,296.4,73.9,296.4z M210,118.2c-18.2,0-33.5,14.4-33.5,32.4s15,32.4,33.5,32.4s33.5-14.4,33.5-32.4\n' +
        //   '\tC243.5,133.1,228.8,118.2,210,118.2z M210,126.6c-13.5,0-24.8,10.7-24.8,24s11.1,24,24.8,24c13.7,0,24.8-10.7,24.8-24\n' +
        //   '\tC234.8,137.6,223.9,126.6,210,126.6z M210,137.5c-7.3,0-13.5,5.8-13.5,13.1s6,13.1,13.5,13.1c7.5,0,13.5-5.8,13.5-13.1\n' +
        //   '\tC223.5,143.5,217.5,137.5,210,137.5z M210,134.7c-8.9,0-16.4,7-16.4,15.9s7.4,15.9,16.4,15.9c9.1,0,16.4-7,16.4-15.9\n' +
        //   '\tC226.4,142,219.2,134.7,210,134.7z M210,133.5c-9.6,0-17.6,7.6-17.6,17.1s7.9,17.1,17.6,17.1c9.7,0,17.6-7.6,17.6-17.1\n' +
        //   '\tC227.6,141.4,219.9,133.5,210,133.5z M228.5,140.8c-3.6-6.3-10.5-10.7-18.5-10.7c-11.5,0-21.2,9.1-21.2,20.5s9.5,20.5,21.2,20.5\n' +
        //   '\tc11.7,0,21.2-9.1,21.2-20.5C231.1,147.1,230.2,143.7,228.5,140.8 M210,123.6c-15.2,0-27.9,12-27.9,27s12.5,27,27.9,27\n' +
        //   '\ts27.9-12,27.9-27C237.9,136,225.6,123.6,210,123.6z M210,121.8c-16.2,0-29.8,12.8-29.8,28.8s13.3,28.8,29.8,28.8\n' +
        //   '\ts29.8-12.8,29.8-28.8C239.8,135,226.7,121.8,210,121.8z M342.4,322.8c-18.2,0-33.5,14.4-33.5,32.4c0,18.1,15,32.4,33.5,32.4\n' +
        //   '\tc18.5,0,33.5-14.4,33.5-32.4C375.9,337.7,361.1,322.8,342.4,322.8z M342.4,331.2c-13.5,0-24.8,10.7-24.8,24s11.1,24,24.8,24\n' +
        //   '\tc13.7,0,24.8-10.7,24.8-24C367.2,342.2,356.3,331.2,342.4,331.2z M342.4,342.1c-7.3,0-13.5,5.8-13.5,13.1c0,7.3,6,13.1,13.5,13.1\n' +
        //   '\tc7.5,0,13.5-5.8,13.5-13.1C355.9,348.2,349.9,342.1,342.4,342.1z M342.4,339.3c-8.9,0-16.4,7-16.4,15.9c0,8.8,7.4,15.9,16.4,15.9\n' +
        //   '\ts16.4-7,16.4-15.9C358.8,346.6,351.6,339.3,342.4,339.3z M342.4,338.1c-9.6,0-17.6,7.6-17.6,17.1s7.9,17.1,17.6,17.1\n' +
        //   '\tc9.7,0,17.6-7.6,17.6-17.1C360,346,352.2,338.1,342.4,338.1z M360.9,345.4c-3.6-6.3-10.5-10.7-18.5-10.7c-11.5,0-21.2,9.1-21.2,20.5\n' +
        //   '\ts9.5,20.5,21.2,20.5s21.2-9.1,21.2-20.5C363.5,351.7,362.6,348.3,360.9,345.4 M342.4,328.2c-15.2,0-27.9,12-27.9,27s12.5,27,27.9,27\n' +
        //   '\tc15.4,0,27.9-12,27.9-27C370.3,340.6,358,328.2,342.4,328.2z M342.4,326.4c-16.2,0-29.8,12.8-29.8,28.8s13.3,28.8,29.8,28.8\n' +
        //   '\tc16.4,0,29.8-12.8,29.8-28.8C372.2,339.6,359,326.4,342.4,326.4z M474.6,218.8c-18.2,0-33.5,14.4-33.5,32.4s15,32.4,33.5,32.4\n' +
        //   '\tc18.5,0,33.5-14.4,33.5-32.4C508.1,233.7,493.4,218.8,474.6,218.8z M474.6,227.2c-13.5,0-24.8,10.7-24.8,24s11.1,24,24.8,24\n' +
        //   '\tc13.7,0,24.8-10.7,24.8-24C499.4,238.2,488.5,227.2,474.6,227.2z M474.6,238.1c-7.3,0-13.5,5.8-13.5,13.1c0,7.3,6,13.1,13.5,13.1\n' +
        //   '\tc7.5,0,13.5-5.8,13.5-13.1C488.1,244.1,482.2,238.1,474.6,238.1z M474.6,235.3c-8.9,0-16.4,7-16.4,15.9c0,8.8,7.4,15.9,16.4,15.9\n' +
        //   '\tc9.1,0,16.4-7,16.4-15.9C491,242.6,483.8,235.3,474.6,235.3z M474.6,234.1c-9.6,0-17.6,7.6-17.6,17.1s7.9,17.1,17.6,17.1\n' +
        //   '\tc9.7,0,17.6-7.6,17.6-17.1C492.2,242,484.5,234.1,474.6,234.1z M493.1,241.4c-3.6-6.3-10.5-10.7-18.5-10.7\n' +
        //   '\tc-11.5,0-21.2,9.1-21.2,20.5c0,11.4,9.5,20.5,21.2,20.5s21.2-9.1,21.2-20.5C495.8,247.7,494.8,244.3,493.1,241.4 M474.6,224.2\n' +
        //   '\tc-15.2,0-27.9,12-27.9,27s12.5,27,27.9,27c15.4,0,27.9-12,27.9-27C502.5,236.6,490.2,224.2,474.6,224.2z M474.6,222.4\n' +
        //   '\tc-16.2,0-29.8,12.8-29.8,28.8s13.3,28.8,29.8,28.8c16.4,0,29.8-12.8,29.8-28.8C504.4,235.6,491.3,222.4,474.6,222.4z',
        state: false
      },
      flagX: '',
      flagY: '',
      dataX: [],
      dataY: [],
      title: '',
      type: '',
      trendFlag: false,
      modelFlag: true, //true表示时间点等分， false表示数据点等分
      changeX: { // X轴坐标功能
        state: 'Hz', // 目前状态
        icon: "M341.33,672.75c-88.52,0-171.75-34.47-234.34-97.07C44.39,513.08,9.92,429.86,9.92,341.33S44.39,169.58,106.99,106.99C169.58,44.39,252.81,9.92,341.33,9.92s171.75,34.47,234.35,97.07c62.59,62.59,97.07,145.82,97.07,234.34s-34.47,171.75-97.07,234.35c-62.6,62.59-145.82,97.07-234.35,97.07Zm0-648.54C166.47,24.21,24.21,166.47,24.21,341.33s142.26,317.12,317.12,317.12,317.12-142.26,317.12-317.12S516.19,24.21,341.33,24.21Zm66.21,531.12c-1.92,0-3.72-.74-5.08-2.09-1.34-1.33-2.11-3.16-2.11-5.03,0-1.89,.73-3.67,2.08-5.01l75.26-75.24H221.75c-3.88-.02-7.04-3.21-7.02-7.12,0-3.96,3.15-7.17,7.02-7.17h255.95l-75.26-75.24c-1.32-1.32-2.08-3.15-2.08-5.03,0-1.86,.77-3.69,2.1-5.01,1.37-1.36,3.17-2.11,5.09-2.11s3.7,.74,5.06,2.08l72.44,72.43c1.14,1.14,1.84,2.6,2.02,4.19l.9,7.82,7.82,.9c3.6,.41,6.31,3.46,6.3,7.08,0,3.68-2.68,6.74-6.24,7.13l-7.88,.86-.9,7.88c-.18,1.58-.9,3.06-2.02,4.18l-72.49,72.49c-1.32,1.3-3.1,2.03-5.01,2.03Zm-132.42-238.93c-1.92,0-3.7-.72-5.02-2.04l-72.48-72.48c-1.13-1.12-1.84-2.6-2.02-4.17l-.89-7.85-7.86-.88c-3.59-.4-6.29-3.43-6.27-7.05,0-3.7,2.69-6.76,6.25-7.16l7.87-.87,.9-7.87c.18-1.57,.9-3.05,2.02-4.17l72.49-72.49c1.32-1.3,3.1-2.03,5.01-2.03s3.72,.74,5.08,2.1c1.34,1.33,2.1,3.15,2.11,5.02,0,1.88-.75,3.71-2.07,5.02l-75.26,75.24h255.94c3.88,0,7.03,3.21,7.03,7.15s-3.15,7.14-7.03,7.14H204.98l75.26,75.24c1.32,1.32,2.08,3.15,2.07,5.02,0,1.88-.77,3.7-2.09,5.02-1.38,1.39-3.14,2.11-5.09,2.11Z",
        lastXData: [],
        lastMarkPoint: null,
        oneFrequency: 50,
      },
      change3DX: { // X轴坐标功能
        state: 'Hz', // 目前状态
        icon: "M341.33,672.75c-88.52,0-171.75-34.47-234.34-97.07C44.39,513.08,9.92,429.86,9.92,341.33S44.39,169.58,106.99,106.99C169.58,44.39,252.81,9.92,341.33,9.92s171.75,34.47,234.35,97.07c62.59,62.59,97.07,145.82,97.07,234.34s-34.47,171.75-97.07,234.35c-62.6,62.59-145.82,97.07-234.35,97.07Zm0-648.54C166.47,24.21,24.21,166.47,24.21,341.33s142.26,317.12,317.12,317.12,317.12-142.26,317.12-317.12S516.19,24.21,341.33,24.21Zm66.21,531.12c-1.92,0-3.72-.74-5.08-2.09-1.34-1.33-2.11-3.16-2.11-5.03,0-1.89,.73-3.67,2.08-5.01l75.26-75.24H221.75c-3.88-.02-7.04-3.21-7.02-7.12,0-3.96,3.15-7.17,7.02-7.17h255.95l-75.26-75.24c-1.32-1.32-2.08-3.15-2.08-5.03,0-1.86,.77-3.69,2.1-5.01,1.37-1.36,3.17-2.11,5.09-2.11s3.7,.74,5.06,2.08l72.44,72.43c1.14,1.14,1.84,2.6,2.02,4.19l.9,7.82,7.82,.9c3.6,.41,6.31,3.46,6.3,7.08,0,3.68-2.68,6.74-6.24,7.13l-7.88,.86-.9,7.88c-.18,1.58-.9,3.06-2.02,4.18l-72.49,72.49c-1.32,1.3-3.1,2.03-5.01,2.03Zm-132.42-238.93c-1.92,0-3.7-.72-5.02-2.04l-72.48-72.48c-1.13-1.12-1.84-2.6-2.02-4.17l-.89-7.85-7.86-.88c-3.59-.4-6.29-3.43-6.27-7.05,0-3.7,2.69-6.76,6.25-7.16l7.87-.87,.9-7.87c.18-1.57,.9-3.05,2.02-4.17l72.49-72.49c1.32-1.3,3.1-2.03,5.01-2.03s3.72,.74,5.08,2.1c1.34,1.33,2.1,3.15,2.11,5.02,0,1.88-.75,3.71-2.07,5.02l-75.26,75.24h255.94c3.88,0,7.03,3.21,7.03,7.15s-3.15,7.14-7.03,7.14H204.98l75.26,75.24c1.32,1.32,2.08,3.15,2.07,5.02,0,1.88-.77,3.7-2.09,5.02-1.38,1.39-3.14,2.11-5.09,2.11Z",
        lastXData: [],
        lastMarkPoint: null,
        oneFrequency: 50,
      },
      // 主辅游标
      PrimarySecondary: {
        icon: 'M13.5,7c0,3.7-2.9,6.5-6.5,6.5S0.5,10.5,0.5,7c0-3.7,2.9-6.5,6.5-6.5S13.5,3.3,13.5,7z M4.4,3.9V10 M7,3.9V10\n' +
          '\t M9.5,3.9V10',
        // icon: 'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M4.4,3.9V10 M7,3.9V10\n' +
        //   '\t M9.5,3.9V10',
        //icon: 'M546.2,545.8H3 M120.7,39.2v50.9 M120.7,265.3v50.9 M120.7,378.3v50.9 M120.7,491.4v50.9 M96.4,77.8h48.7 M120.7,152.2v50.9 M275.5,152.2v50.9 M275.5,265.3v50.9 M275.5,378.3v50.9 M275.5,491.4v50.9 M253.2,77.8h44.7 M275.5,39.2v50.9 M430.4,152.2v50.9 M430.4,265.3v50.9 M430.4,378.3v50.9 M430.4,491.4v50.9 M408.1,77.8h44.7 M430.4,39.2v50.9',
        secondaryIcon: 'M53.1,484.5h458 M157.9,37.5v26 M135.5,60.7h44.7 M157.9,86v29.9 M157.9,138.4v29.9 M157.9,190.7v29.9 M157.9,243.1V273 M157.9,295.5v29.9 M157.9,347.9v29.9 M157.9,400.3v29.9 M157.9,452.7v29.9 M282.1,37.5v26 M259.8,60.7h44.7 M282.1,86v29.9 M282.1,138.4v29.9 M282.1,190.7v29.9 M282.1,243.1V273 M282.1,295.5v29.9 M282.1,347.9v29.9 M282.1,400.3v29.9 M282.1,452.7v29.9 M406.4,37.5v26 M384,60.7h44.7 M406.4,86v29.9 M406.4,138.4v29.9 M406.4,190.7v29.9 M406.4,243.1V273 M406.4,295.5v29.9 M406.4,347.9v29.9 M406.4,400.3v29.9 M406.4,452.7v29.9',
        primaryIcon: 'M53.1,484.5h458.1 M157.9,37.5v447 M135.5,61.7h44.8 M282.1,37.5v447 M259.8,61.7h44.7 M406.4,37.5v447 M384,61.7h44.8',
        isMark: true, // 主游标
        preLines: [], // 当前的主辅游标数据，方便趋势图和转速趋势图游标同步的时候使用
      },
      PrimaryLine: null,
      SecondaryLine: null,
      SecondaryLineY: null,
      PrimaryLineY: null,
      PrimaryLineParam: null,
      SecondaryLineParam: null,
      alarmFlag: false,//报警线是否开启
      aline: [],//报警线信息
    }
  },
  mounted() {
    // console.log("这个图表的option", this.mychart.getOption())
  },
  created() {
    this.$store.state.modelFlag = this.modelFlag;
    event.$on('updatePrimaryLine', this.updatePrimaryLine);
  },
  // 刷新清空主辅游标
  activated() {
    event.$on('updatePrimaryLine', this.updatePrimaryLine);
  },
  deactivated() {
    event.$off('updatePrimaryLine', this.updatePrimaryLine);
  },
  beforeDestroy() {
    event.$off('updatePrimaryLine', this.updatePrimaryLine);
  },
  methods: {
    // 清空主辅游标
    updatePrimaryLine() {
      this.PrimaryLine = this.SecondaryLine = null;
    },

    //存储画图信息
    saveGraphData(flagX, flagY, dataX, dataY, title, type, trendFlag) {
      this.flagX = flagX;
      this.flagY = flagY;
      this.dataX = dataX;
      this.dataY = dataY;
      this.title = title;
      this.type = type;
      // console.log('mytype',type);
      this.trendFlag = trendFlag;
      // console.log('存储的数据', flagX, flagY, dataX, dataY, title, type);
    },


    /**
     * 在图上画条线，lines是位置坐标
     * @update 更新日期 2022-11-09 10:25:11
     * @param lines 格式 [{ xAxis: 2022-01-25 10:26:14.069, lineStyle: { color: '#00ff00' } }, { xAxis: 2022-01-25 10:26:14.069 }]
     */
    drawLine(lines, click = false) {
      console.log("happen->drawLine", lines, click)

      let title = []
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let ydata = this.mychart.getOption().series[line.seriesNameIndex].data[line.xIndex]
        let yvalue = 0
        if (Array.isArray(ydata)) {
          yvalue = parseFloat(ydata[1]).toFixed(2)
        } else {
          yvalue = parseFloat(ydata).toFixed(2)
        }

        // line['label'].formatter = (params) => {
        //   return line.xAxis + ", " + yvalue
        // }
        if(line.id == 'Main-Cursor'){
          title.push({
            id: 'Main-Cursor',
            text: '[' + this.translateText('chart.textMap.','主游标')+': ' + line.xAxis + ", " + yvalue + ']',
          })
          if(this.mainCursor != undefined){
            this.mainCursor = line.xAxis + ", " + yvalue + ']'
          }
        }else if(line.id == 'Auxiliary-Cursor'){
          title.push({
            id: 'Auxiliary-Cursor',
            text: '[' + this.translateText('chart.textMap.','辅游标')+': ' + line.xAxis + ", " + yvalue + ']',
          })
          if(this.auxiliaryCursor != undefined){
            this.auxiliaryCursor = line.xAxis + ", " + yvalue + ']'
          }
        }
      }
      let marklineData = [];
      try {
        marklineData = this.mychart.getOption().series[0].markLine.data;
      }catch (e){}
      marklineData = marklineData.filter(i => {
        return i.id != "Auxiliary-Cursor" && i.id != "Main-Cursor";
      })


      const option = {
        title,
        series: []
      }
      let data = lines

      data.push(...marklineData)

      option.series[0] = {
        type: 'line',
        markLine: {
          lineStyle: {
            color: this.$store.state.textcolor,
            type: 'dashed'
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: false // 鼠标悬浮时隐藏标签
            }
          },
          animation: false, // 关闭动画
          symbol: ['none', 'none'],
          data
        }
      }
      this.mychart.setOption(option)

    },
    /**
     * 显示两个x轴的差
     * 需要修改optin的title，添加第二个标题，通过修改第二个标题实现显示功能
     * @update 更新日期2022-03-18 09:06:05
     * @param time1
     * @param time2
     */
    xAxisSub(a1, a2, seriesIndex1=0, seriesIndex2=0) {
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
      // 将获取时间的坐标
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
     * 画主辅游标 drawLinePrimarySecondary
     * 因为之前的画两条线的函数不需要了，所以直接用这个代替画两条线的函数drawLineAndProLine
     * 就可以实现主辅游标的功能了
     * @param line xAxis
     * @param seriesNameIndex
     * @param param
     */
    drawLineAndProLine(line, seriesNameIndex, param, isMark=null) {
      console.log("happen->drawLineAndProLine", line, param.seriesY, Array.isArray(param.seriesY))
      console.log("isMark",isMark);
      if(isMark || (isMark==null&&this.PrimarySecondary.isMark)) {
        this.PrimaryLine = line
        this.PrimaryLineParam = param
        this.PrimaryLineSeriesNameIndex = seriesNameIndex
      } else {
        this.SecondaryLine = line
        this.SecondaryLineParam = param
        this.SecondaryLineSeriesNameIndex = seriesNameIndex
      }
      let lines = []
      if(this.PrimaryLine) {
        lines.push({
          id: 'Main-Cursor',
          xAxis: '' + this.PrimaryLine,
          lineStyle: {
             color: this.$store.state.primarySecondaryColor[0],
            type: 'solid', //设置线条类型为实线
          },
          xIndex: this.PrimaryLineParam.xIndex, // 记录x轴的索引，方便游标同步的时候计算y轴的值
          seriesNameIndex: this.PrimaryLineSeriesNameIndex
        })
      }
      if(this.SecondaryLine) {
        lines.push({
          id: 'Auxiliary-Cursor',
          xAxis: '' + this.SecondaryLine,
          lineStyle: {
            color: this.$store.state.primarySecondaryColor[1]
          },
          xIndex: this.SecondaryLineParam.xIndex, // 记录x轴的索引，方便游标同步的时候计算y轴的值
          seriesNameIndex: this.SecondaryLineSeriesNameIndex
        })
      }
      if(lines.length === 2) {
        this.xAxisSub(this.PrimaryLine, this.SecondaryLine)
      }
      console.log("存入的PrimarySecondary.preLines", lines)
      //console.log("asjdkajdajd",this.mychart.getOption())
      this.PrimarySecondary.preLines = lines
      // console.log("happen->PrimarySecondary", this.PrimarySecondary.preLines)
      //this.$options.cursorLines=lines
      //this.$store.state.prelines=lines
      //console.log("游标  撒大大",this.$store.state.prelines)
      let option = this.mychart.getOption()
      option.cursorLines=lines
      option.series = option.series.map(item => {
        item.lineStyle.normal.width = 1
        return item
      })
      console.log("asdadadadaaaaaa",option)
      this.mychart.setOption(option)
      this.drawLine(lines, true)
      // 画主辅游标的时候，如果频族带的状态是开着的，那么进行刷新
      // if(this.sidebandFamilyFun) {
      //   this.sidebandFamilyFun()
      // }
    },
    /**
     * 用来适配转速趋势图和趋势图游标同步
     * @param lines
     */
    refreshLineAndProLine(lines) {
      if(lines.length === 2) {
        this.xAxisSub(lines[0].xAxis, lines[1].xAxis)
      }
      let lines2 = []
      for(const l of lines) {
        // if(l.label.formatter) delete l.label.formatter
        lines2.push(l)
      }
      let option = this.mychart.getOption()
      option.cursorLines=lines
      option.series = option.series.map(item => {
        item.lineStyle.normal.width = 1
        return item
      })
      this.mychart.setOption(option)
      //this.$options.cursorLines=lines
      //this.$store.state.prelines=lines
      this.drawLine(lines)
    },


    /**
     * 匹配其它图谱传过来的时间，同步游标信息
     * @param x
     * @param isMark
     */
    drawMarkLine(x,isMark){
      //series为空，无数据不需要同步
      if(this.mychart.getOption().series.length == 0){
        return
      }
      let xTime = new Date(x).getTime()
      let option = this.mychart.getOption()
      let xAxisData = option.xAxis[0].data
      // 将获取的时间，遍历成时间戳
      let xAxisDataTime = xAxisData.map(x => new Date(x).getTime())
      // 定义一个函数，用于找到最接近给定值的元素
      // 找到最接近的时间值
      xTime = this.findClosestValue(xTime, xAxisDataTime);
      let xIndex = xAxisDataTime.indexOf(xTime);
      let param = {};
      param.name = xAxisData[xIndex];
      param.xIndex = xIndex
      param.seriesNameIndex = 0
      param.seriesName = option.series[0].name;
      param.seriesY = option.series[0].data[xIndex]
      param.yIndex = xIndex
      this.drawLineAndProLine(param.name, 0, param, isMark)
    },

    /**
     * 用于适配不同类型测点的游标同步
     * @param lines
     */
    drawMultiPointCursorAlignment(lines){
      // 取出传入的时间
      // console.log('画之前的参照划线数据：',lines)

      let times  = []
      times[0] = new Date(lines[0].xAxis).getTime()
      // times[1] = lines[1].xAxis
      // 取图片的option参数，获取xAxis的值
      let option = this.mychart.getOption()
      let xAxisData = option.xAxis[0].data
      // 将获取的时间，遍历成时间戳
      for (let i = 0; i < xAxisData.length; i++){
        xAxisData[i] = new Date(xAxisData[i]).getTime()
      }
      // 定义一个函数，用于找到最接近给定值的元素
      // 找到最接近的时间值
      let min0 = this.findClosestValue(times[0], xAxisData);
      // console.log("找到的最接近的值：", min0);
      // console.log("目标数据的取值数组：", xAxisData);

      // 找到对应的下标
      let min0Index = xAxisData.indexOf(min0);
      // console.log('下标', min0Index);

      // 找到对应的 x 轴值
      let min0XAxis = xAxisData[min0Index];
      // console.log('minXAxis', min0XAxis);

      // 将 x 轴值转换为时间戳，然后赋给 lines[0].xAxis
      lines[0].xAxis = timestampToTimeFormat(min0XAxis);
      // console.log('lines[0].xAxis', lines[0].xAxis);
      lines[0].xIndex = min0Index

      if(lines.length === 2) {
        times[1] = new Date(lines[1].xAxis).getTime()
        for (let j = 0; j < xAxisData.length; j++){
          xAxisData[j] = new Date(xAxisData[j]).getTime()
        }
        let min1 = this.findClosestValue(times[1], xAxisData)
        let min1Index = xAxisData.indexOf(min1);
        let min1XAxis = xAxisData[min1Index];
        lines[1].xAxis = timestampToTimeFormat(min1XAxis);
        lines[1].xIndex = min1Index

        this.xAxisSub(lines[0].xAxis, lines[1].xAxis)
      }
      let lines2 = []
      for(const l of lines) { // 为什么写这个，我也不知道这个作用是什么，既然存在，就有存在的道理，就选择保留这个循环，冒似真的没啥用
        if(l.label.formatter) delete l.label.formatter
        lines2.push(l)
      }
      lines = lines2
      // console.log('处理后目标划线数据：',lines)
      //let option = this.mychart.getOption()
      option.cursorLines=lines
      option.series = option.series.map(item => {
        item.lineStyle.normal.width = 1
        return item
      })
      this.mychart.setOption(option)
      //this.$options.cursorLines=lines
      //this.$store.state.prelines=lines
      this.drawLine(lines)
    },
    /**
     * 找出相近的值
     * @param arr
     * @param target
     * @returns {*}
     */
     findClosestValue(target, arr) {
      let closest = arr[0];
      arr.forEach((value) => {
        if (Math.abs(value - target) < Math.abs(closest - target)) {
        closest = value;
        }
      });
      return closest;
    },


    /**
     * x轴切换
     */
    changeXFun() {
      const chart = this.mychart
      const op = chart.getOption()
      let xData = op.xAxis[0].data
      this.offset = ''
      this.mainCursor = ''
      this.auxiliaryCursor =  ''
      if(this.PrimaryLine != undefined){
        this.PrimaryLine = null
      }
      if(this.SecondaryLine != undefined){
        this.SecondaryLine = null
      }
      if(this.PrimarySecondary != undefined && this.PrimarySecondary.preLines.length != 0){
        this.PrimarySecondary.preLines = []
      }
      if(this.sidebandFamily != undefined && this.sidebandFamily.state){
        this.sidebandFamily.state = false
      }
      let option = {
        dataZoom: [{
          start: op.dataZoom[0].start,
          end: op.dataZoom[0].end,
        }],
        title:[{
          id: 'offset',
          text: this.offset
        },{
          id: 'Main-Cursor',
          text: this.mainCursor
        },{
          id: 'Auxiliary-Cursor',
          text: this.auxiliaryCursor
        }],
        xAxis: [{
          name: '[Hz]',
          data: xData,
          axisLabel: {}
        }],
        tooltip: {},
        series: [{
          markPoint: {
            data: this.proMarkPoint.data
          },
          markLine: {
            data: []
          }
        }],
        toolbox: {
          feature: {
            mySidebandFamily: {
              iconStyle: {
                borderColor: null
              }
            }
          }
        }
      }
      this.markPoint.markPointX = []
      if(this.changeX.state == 'Hz') {
        option.xAxis[0].data = this.changeX.lastXData
        option.tooltip.formatter = {}
        option.xAxis[0].axisLabel.formatter = function(val) {
          return parseInt(val)
        }
      }
      else {
        this.changeX.lastXData = xData
        xData = xData.map((x) => (x / this.changeX.oneFrequency).toFixed(5)  + 'X')
        option.xAxis[0].data = xData
        option.xAxis[0].name = '[Order]'
        option.xAxis[0].axisLabel.formatter=function(value, index) {
          return (parseFloat(value.substring(0, value.length - 1)) ).toFixed(2) + 'X'
        }
        option.tooltip.formatter=function(params, index) {
          let value = params[0].axisValue
          return 'X:' + (parseFloat(value.substring(0, value.length - 1)) ).toFixed(2) + 'X' + '\n' + 'Y:' + params[0].value
        }
      }
      chart.setOption(option)
      if(this.peakSearch.state) {
        this.peakSearchFun()
      }
    },

    /**
     * 3D
     * x轴切换
     */

    change3DXFun() {
        const chart = this.mychart;
        const op = chart.getOption();
        let xData = op.xAxis3D[0].data; // 获取3D图表X轴的数据
        this.offset = '';
        this.mainCursor = '';
        this.auxiliaryCursor = '';

        // 重置标记和其他相关状态
        if (this.PrimaryLine != undefined) {
          this.PrimaryLine = null;
        }
        if (this.SecondaryLine != undefined) {
          this.SecondaryLine = null;
        }
        if (this.PrimarySecondary != undefined && this.PrimarySecondary.preLines.length != 0) {
          this.PrimarySecondary.preLines = [];
        }
        if (this.sidebandFamily != undefined && this.sidebandFamily.state) {
          this.sidebandFamily.state = false;
        }

        // 构建更新的配置项
        let option = {
          // dataZoom: [{
          //   start: op.dataZoom[0].start,
          //   end: op.dataZoom[0].end,
          // }],
          title: [{
            id: 'offset',
            text: this.offset
          }, {
            id: 'Main-Cursor',
            text: this.mainCursor
          }, {
            id: 'Auxiliary-Cursor',
            text: this.auxiliaryCursor
          }],
          xAxis3D: [{
            name: '[Hz]',
            data: xData,
            axisLabel: {},
            nameTextStyle: {
              color: this.$store.state.selectbordercolor, // 文字颜色
              fontSize: 10,
              padding: [0, 0, 10, 0],
            },
          }],
          tooltip: {},
          series: [{
            markPoint: {
              data: this.proMarkPoint.data
            },
            markLine: {
              data: []
            }
          }],
          toolbox: {
            feature: {
              mySidebandFamily: {
                iconStyle: {
                  borderColor: null
                }
              }
            }
          }
        };

        this.markPoint.markPointX = [];

        if (this.change3DX.state == 'Hz') {
          // 如果当前状态是 Hz，恢复到上一次的数据
          option.xAxis3D[0].data = this.change3DX.lastXData;
          option.tooltip.formatter = {}; // 清除 tooltip 格式化
          option.xAxis3D[0].axisLabel.formatter = function(val) {
            return parseInt(val); // 将标签格式化为整数
          };
        } else {
          // 切换到 Order
          this.change3DX.lastXData = xData; // 备份 Hz 数据
          // 将 Hz 数据转换为 Order（阶次）数据
          xData = xData.map((x) => (x / this.change3DX.oneFrequency).toFixed(5) + 'X');
          option.xAxis3D[0].data = xData;
          option.xAxis3D[0].name = '[Order]';
          // 标签格式化，显示到小数点后两位
          option.xAxis3D[0].axisLabel.formatter = function(value, index) {
            return (parseFloat(value.substring(0, value.length - 1))).toFixed(2) + 'X';
          };
          // 提示框格式化，显示 X 和 Y 轴的值
          option.tooltip.formatter = function(params, index) {
            let value = params[0].axisValue;
            return 'X:' + (parseFloat(value.substring(0, value.length - 1))).toFixed(2) + 'X' + '\n' + 'Y:' + params[0].value;
          };
        }

        // 应用更新的配置
        chart.setOption(option);

        // 如果开启了峰值搜索功能，则执行对应操作
        if (this.peakSearch.state) {
          this.peakSearchFun();
        }

    },

    /**
     * 标点功能开始
     */
    myMarkPointFun() {
      const chart = this.mychart
      //获取当前图表的option
      const op = chart.getOption();

      let option = {
        series: [] //op.series
      }

      if(!this.myMarkPoint.state) {
        // 需要关闭
        // this.myMarkPoint.state = false
        for(let i = 0; i < op.series.length; i++) {
          option.series.push({
            symbol: 'circle',
            symbolSize: 3,
            showSymbol: false,
            showAllSymbol: false,
          })
        }
        // if(this.axisPositionFlag) { // 取消标点，删除所有十字线
        //
        //   // console.log('op.series[0].markLine.data',op.series[0].markLine.data);
        //   // // 数组只保留前两个
        //   op.series[0].markLine.data = op.series[0].markLine.data.slice(0, 2);
        //   this.mychart.setOption(op);
        // }
      } else {
        // 需要打开
        // this.myMarkPoint.state = true
        for(let i = 0; i < op.series.length; i++) {
          option.series.push({
            // symbol: 'emptyCircle',
            symbol: 'circle',
            symbolSize: 3,
            showSymbol: true,
            showAllSymbol: true,
          })
        }
        // console.log('option',option)
      }



      this.mychart.setOption(option)
    },
    /**
     * 标点功能结束
     */
    markPointFunEnd() {
      const chart = this.mychart
      //获取当前图表的option
      const op = chart.getOption();
      let option = {
        series: [] //op.series
      }

      for(let seriesIndex in op.series) { // 清空所有series markPoint中的data
        if(op.series[seriesIndex].markPoint) {
          // option.series[seriesIndex].markPoint.data = []
          // console.log("happen->清空数据", seriesIndex)
          option.series.push({
            markPoint: {
              data : []
            }
          })
        }
      }
      this.mychart.setOption(option)
    },

    /**
     * 刷新图表标注显示
     */
    refreshMarkPointFun() {
      const chart = this.mychart
      //获取当前图表的option
      const op = chart.getOption();

      /**
       * 16进制颜色转rgba
       * @param sHex
       * @param alpha
       * @returns {string}
       */
      function colorRgba(sHex, alpha = 1) {
        // 十六进制颜色值的正则表达式
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/
        /* 16进制颜色转为RGB格式 */
        var sColor = sHex.toLowerCase()
        // var alpha = 1
        if (sColor && reg.test(sColor)) {
          if (sColor.length === 4 || sColor.length === 5) {
            var sColorNew = '#'
            for (var i = 1; i < sColor.length; i += 1) {
              sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
            }
            sColor = sColorNew
          }
          // 如果有透明度再执行
          if (sColor.length === 9) {
            alpha = (parseInt('0x' + sColor.slice(7, 9))/255).toFixed(2)
          }
          //  处理六位的颜色值
          var sColorChange = []
          for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
          }
          return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')'
        } else {
          return sColor
        }
      }

      let option = {
        series: []
      }

      // 标注的样式
      const markPointStyle = { // 绿色标注样式
        symbol: 'pin', // pin rect roundRect
        animation: false,
        label: {
          offset:[0, -5],
          show: true,
          fontWeight: 700,
          color: '#fff',
          textBorderWidth: 0,
          textBorderColor: '#fff',
          backgroundColor: 'rgba(57,191,104,0.9)',
          padding: [3, 4],
          borderRadius: 3,
        },
        itemStyle: {
          color: 'rgba(57,191,104,0.8)',
          // background: 'white',
        },
        symbolSize: [10, 30] , //标记大小 40
        data: [],
      }

      for(let seriesIndex in op.series) { // 清空所有series markPoint中的data
        option.series[seriesIndex] = {
          markPoint: JSON.parse(JSON.stringify(markPointStyle))
        }
        // console.log('happen->颜色',seriesIndex,op.series[seriesIndex].lineStyle.color )
        if(op.series[seriesIndex].lineStyle.color) {
          option.series[seriesIndex].markPoint.label.backgroundColor = colorRgba(op.series[seriesIndex].lineStyle.color, .8)
          option.series[seriesIndex].markPoint.itemStyle.color = colorRgba(op.series[seriesIndex].lineStyle.color, .4)
        }
      }
      //一倍频图标
      if(op.series[0].markPoint && op.series[0].markPoint.data && op.series[0].markPoint.data.length > 0){
        for(let i=0;i<op.series[0].markPoint.data.length;i++){
          if(op.series[0].markPoint.data[i].name == 'max') option.series[0].markPoint.data.push(op.series[0].markPoint.data[i])
        }
      }

      for(let point of this.markPoint.markPointX) {
        point = JSON.parse(point)
        let xName = point.xName // x轴的数值
        let seriesIndex = point.seriesNameIndex
        let y = point.y
        // xName = '123'
        // y = '60'
        // console.log("op.series[seriesIndex].name", op.series[seriesIndex].name)
        // console.log({value: `${xName}, ${y}` ,coord: [xName, y]})
        if(xName.indexOf('X') !== -1) {
          option.series[seriesIndex].markPoint.data.push({value: `${parseFloat(xName.substring(0, xName.length - 1)).toFixed(2)}X, ${y}` ,coord: [xName, y]}) // , coord: [xName, y] xAxis: xName, yAxis: ''+y
        } else {
          option.series[seriesIndex].markPoint.data.push({value: `${xName}, ${y}` ,coord: [xName, y]}) // , coord: [xName, y] xAxis: xName, yAxis: ''+y
        }

      }
      this.mychart.setOption(option)
    },
    /**
     * 图表标注功能
     * 需要用到的临时变量变量全在this.markPoint中
     * @param x 触发时的x轴位置
     * @param seriesNameIndex
     * @param yIndex 触发时的y轴位置
     */
    markPointFun(x, seriesNameIndex = 0, yIndex, closePointIndex) {
      if(this.axisPositionFlag !== 'undefined' && this.axisPositionFlag) {
        this.addMarkPoint(x, yIndex, seriesNameIndex, closePointIndex);
        return ;
      }

      console.log(x, yIndex)
      const chart = this.mychart
      //获取当前图表的option
      const op = chart.getOption();
      let searchRange = 50;

      if(this.markPoint.isMark) { // 处在标注模式下
        // this.markPoint.markPointX保存当前标注过的坐标的信息
        let seriesIndex = seriesNameIndex
        let xName // x轴的值
        let y // y轴的值
        let chartHeight = chart.getHeight()
        let nowPointPixel = chart.convertToPixel({seriesIndex: seriesNameIndex}, [x, yIndex])
        console.log('标注', chart.getOption().series[seriesIndex].data[x]);
        //目前考虑只有波形图和频谱图使用可以去掉前部分，存在且有错误
        let modelFlag = this.typename == '趋势图' ? true : false;
        let yindexValue =  modelFlag ? chart.getOption().series[seriesIndex].data[x][1] : chart.getOption().series[seriesIndex].data[x];
        // if(typeof chart.getOption().series[seriesIndex].data[x] === 'number') {
        if(typeof yindexValue === 'number') {
          // 进行寻找离鼠标最近距离的一个点来进行标注
          let minDis = 99999999;
          let minX = 0;
          for(let i = x - searchRange; i < x + searchRange; i++) {
            if(i <= 0) continue
            let tx = i
            let ty = modelFlag ? chart.getOption().series[seriesIndex].data[i][1] : chart.getOption().series[seriesIndex].data[i]


            // 将图上的坐标，转换为真实的像素值，然后寻找离点击鼠标最近的距离的点
            let pointPixel = chart.convertToPixel({seriesIndex: seriesNameIndex}, [tx, ty]); //{seriesNameIndex: 0, x: 64, xName: '99.84', y: 12.4}

            let dis = (nowPointPixel[0] - pointPixel[0]) * (nowPointPixel[0] - pointPixel[0]) + (nowPointPixel[1] - pointPixel[1]) * (nowPointPixel[1] - pointPixel[1])
            if(dis < minDis) {
              minDis = dis
              minX = tx;
              // console.log(minDis, minX)
            }
          }
          x = minX
          console.log('标注2', chart.getOption().series[seriesIndex].data[minX], modelFlag);
          y = modelFlag ? chart.getOption().series[seriesIndex].data[minX][1] : chart.getOption().series[seriesIndex].data[minX] // 获取这个点对应的y值
          xName = '' + chart.getOption().xAxis[0].data[minX]
          // console.log(`初始点：${nowPointPixel}，获取到的点下标：${minX},像素${chart.convertToPixel({seriesIndex: seriesNameIndex}, [x, y])}`)

        } else {
          // 进行寻找离鼠标最近距离的一个点来进行标注
          let minDis = 99999999;
          let minX = 0;
          for(let i = x - searchRange; i < x + searchRange; i++) {
            if(i <= 0) continue
            let tx = i
            let ty = chart.getOption().series[seriesIndex].data[i][1]
            // 将图上的坐标，转换为真实的像素值，然后寻找离点击鼠标最近的距离的点
            let pointPixel = chart.convertToPixel({seriesIndex: seriesNameIndex}, [tx, ty]); //{seriesNameIndex: 0, x: 64, xName: '99.84', y: 12.4}
            let dis = (nowPointPixel[0] - pointPixel[0]) * (nowPointPixel[0] - pointPixel[0]) + (nowPointPixel[1] - pointPixel[1]) * (nowPointPixel[1] - pointPixel[1])
            if(dis < minDis) {
              minDis = dis
              minX = tx;
              // console.log(minDis, minX)
            }
          }
          x = minX
          y = chart.getOption().series[seriesIndex].data[minX][1] // 获取这个点对应的y值
          xName = '' + chart.getOption().series[seriesIndex].data[minX][0]
        }
        // 通过set处理传入的x轴信息，如果当前没有标注过，进行标注，标注过了则取消标注
        let markPointX = new Set(this.markPoint.markPointX)
        // console.log(markPointX)
        let setNode = {seriesNameIndex, x, xName, y} // {seriesNameIndex: 0, x: 64, xName: '99.84', y: 12.4}
        // console.log(setNode)
        setNode = JSON.stringify(setNode)
        if(markPointX.has(setNode)) {
          // console.log("happen-> 找到了")
          markPointX.delete(setNode)
        } else {
          // console.log("happen-> 找不到")
          markPointX.add(setNode)
        }
        this.markPoint.markPointX = [...markPointX] // 处理完毕，讲set转换成数组

        this.refreshMarkPointFun()
      } else { // 取消标注后处理的事件

      }
    },

    /**
     * 图表谐频功能
     */
    harmonicFrequency(index) {
      if(!this.markLine.isResonance) return
      // 需要的配置项
      // let option = { // 标注的样式和数据点的配置项
      //   series: [{
      //     zlevel: 1,
      //     markLine: {
      //       silent: true, // 不响应图表的点击事件
      //       symbol: ['none', 'none'],
      //       label: {
      //         show: false,
      //         color: '#fff'
      //       },
      //       data: [], // [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }]
      //     },
      //     markPoint: {
      //       data: [],
      //     }
      //   }]
      // }
      let option = {
        series: [{
          markLine: {
            silent: true, // 不响应图表的点击事件
            lineStyle: {
              color: '#fff'
            },
            symbol: ['none', 'none'],
            label: {
              show: false,
              color: '#fff'
            },
            data: [], // [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }]
          },
        }]
      }
      if(index === 0) return // 排除0
      this.nowOption = this.mychart.getOption()
      if (this.nowOption.xAxis[0].data) {
        this.nowOption.xAxis =  this.nowOption.xAxis[0]
      } else {
        this.nowOption.xAxis.data = this.nowOption.series[0].data.map(item => item[0])
      }

      if(this.changeX.state === 'Hz') { // x轴坐标是Hz的时候
        // 转速
        // let timeRev = this.$store.state.timeRev[this.timestamp];
        // let one = timeRev / 60; // 一倍频
        let nowHz = this.nowOption.xAxis.data[index] // 当前的频率
        // let times =  nowHz / one; // 当前的频率 / 一倍频率 = 倍数
        // console.log('一倍频', one, '当前的hz', this.nowOption.xAxis.data[index]);
        let pos = index; // 真实的下标
        let count = 0; // 标记线数量
        for(let i = nowHz; count++ < this.$store.state.resonanceNum; i += nowHz) { // i是需要markLine的x轴位置
          // console.log('需要标记的位置', i)
          for(let j = pos; j < this.nowOption.xAxis.data.length; j++) { // 寻找正确的x轴
            let x = this.nowOption.xAxis.data[j - 1] // x轴
            // let y = 0
            // // 如果是数组，那y的时候得换个方法
            // if (!Array.isArray(this.nowOption.series[0].data[j - 1])) {
            //   y = this.nowOption.series[0].data[j - 1]
            // } else {
            //   y = this.nowOption.series[0].data[j - 1][1]
            // }
            let realX = this.nowOption.xAxis.data[j]
            if(i < realX) {
              option.series[0].markLine.data.push({
                xAxis: '' + x,
                lineStyle: {
                  color: this.$store.state.colorMap[4],
                  type: "solid"
                },
              })
              break;
            }
          }
        }
      } else { // x轴坐标是阶的时候
        // console.log("x轴坐标是阶的时候")
        let nowHz = this.nowOption.xAxis.data[index] // 当前的频率
        let pos = index; // 真实的下标
        let count = 0; // 标记线数量
        for(let i = parseFloat(nowHz); count++ < this.$store.state.resonanceNum; i += parseFloat(nowHz)) { // 找10个点，分别是倍数的关系
          // console.log('i->', i)
          for(let j = pos; j < this.nowOption.xAxis.data.length; j++) { // 寻找正确的x轴
            let realX = parseFloat(this.nowOption.xAxis.data[j])
            if(i < realX) {
              option.series[0].markLine.data.push({
                xAxis: j - 1,
                lineStyle: {
                  color: this.$store.state.colorMap[4],
                  //线的样式  ，虚实  颜色
                  type: "solid"
                },
              })
              break;
            }
          }
        }

      }
      this.mychart.setOption(option)
    },
    /**
     * 返回HistoryToolbox的feature
     */
    getHistoryToolboxFeature() {
      return {
        // 主副游标切换
        myPrimarySecondary: {
          title: !this.PrimarySecondary.isMark ? this.translateText("chart.textMap.", "主游标") : this.translateText("chart.textMap.", "辅游标"),
          show: true,
          // show: this.type=='real'? false:true,
          icon: this.PrimarySecondary.icon,
          iconStyle: {
            borderColor: this.PrimarySecondary.isMark ? null : '#74ACC8'
          },
          onclick:  ()=>{
            console.log('实时模式下的')
            let option = {
              toolbox: {
                feature: {
                  myPrimarySecondary: {
                    iconStyle: {
                      borderColor: '#74ACC8'
                    }
                  }
                }
              }
            }
            if(this.PrimarySecondary.isMark) {
              // console.log('当前是标记状态下')
              // 如果当前是主游标状态,需要切换为副游标
              this.PrimarySecondary.isMark = false;
              option.toolbox.feature.myPrimarySecondary.title = this.translateText("chart.textMap.", "主游标")
              //
            } else {
              this.PrimarySecondary.isMark = true;
              option.toolbox.feature.myPrimarySecondary.iconStyle.borderColor = null
              option.toolbox.feature.myPrimarySecondary.title = this.translateText("chart.textMap.", "辅游标")
            }
            this.mychart.setOption(option)
          }
        },

        // 标点
        myMarkPoint: {
          title: this.myMarkPoint.state ? this.translateText("chart.textMap.", "取消标点") : this.translateText("chart.textMap.", "标点"),
          icon: this.myMarkPoint.icon,
          // show: this.$route.path.indexOf('/WirelessPumpGraph') !== -1 && this.trendFlag ? false : true,
          show: true,
          iconStyle: {
            borderColor: this.myMarkPoint.state ?'#74ACC8' : null
          },
          onclick: () => {
            console.log('标点');
            let option = {
              toolbox: {
                feature: {
                  myMarkPoint: {
                    iconStyle: {
                      borderColor: '#74ACC8'
                    }
                  }
                }
              }
            }
            if(this.myMarkPoint.state) {
              // 还原图表线条颜色
              option.toolbox.feature.myMarkPoint.iconStyle.borderColor = null
              this.myMarkPoint.state = false
              option.toolbox.feature.myMarkPoint.title = this.translateText("chart.textMap.", "标点")
            } else {
              this.myMarkPoint.state = true
              option.toolbox.feature.myMarkPoint.title =  this.translateText("chart.textMap.", "取消标点")
            }
            this.myMarkPointFun()

            this.mychart.setOption(option)
          }
        },
        // 模式切换
        myModel: {
          // title: this.modelFlag ? '数据点等分' : '时间点等分',
          title: this.modelFlag ? this.translateText("chart.textMap.", "数据点等分") : this.translateText("chart.textMap.", "时间点等分"),
          show: false,
          icon: 'M252.6,26v194.6c0,5.8-4.5,10.5-10,10.5h-196c-5.5,0-10-4.7-10-10.5V26c0-5.8,4.5-10.5,10-10.5h196C248.2,15.4,252.6,20.2,252.6,26z M488.6,169.5c0-85.1-66.6-154.1-148.8-154.1 M485.7,242.6l47.7-71H438L485.7,242.6z M485.7,237.5l42.2-62.7h-84.3L485.7,237.5z M485.7,231.8l35.6-53H450L485.7,231.8z M485.7,226.3l29.8-44.3h-59.6L485.7,226.3z M485.7,219.2l23.3-34.7h-46.6L485.7,219.2z M485.7,213.8l17.7-26.4h-35.5L485.7,213.8z M485.7,199.2l2.4-3.7h-4.9L485.7,199.2z M485.7,200l3.6-5.4h-7.1L485.7,200z M485.7,201.1l5-7.5h-10L485.7,201.1z M485.7,203.4l6.9-10.3h-13.9L485.7,203.4z M485.7,206.6l10.2-15.1h-20.3L485.7,206.6z M485.7,209.6l12.9-19.3h-25.9L485.7,209.6z M296.5,318.5v194.6c0,5.8,4.5,10.5,10,10.5h196c5.5,0,10-4.7,10-10.5V318.5c0-5.8-4.5-10.5-10-10.5h-196C300.9,307.9,296.5,312.7,296.5,318.5z M58.5,369.5c0,85.1,66.6,154.1,148.8,154.1 M61.4,296.4l-47.7,71h95.4L61.4,296.4z M61.4,301.5l-42.2,62.7h84.3L61.4,301.5z M61.4,307.3l-35.6,53H97L61.4,307.3z M61.4,312.8l-29.8,44.3h59.6L61.4,312.8z M61.4,319.9l-23.3,34.7h46.6L61.4,319.9z M61.4,325.2l-17.7,26.4h35.5L61.4,325.2z M61.4,339.9l-2.4,3.7h4.9L61.4,339.9z M61.4,339.1l-3.6,5.4H65L61.4,339.1z M61.4,338l-5,7.5h10L61.4,338zM61.4,335.7L54.5,346h13.9L61.4,335.7z M61.4,332.4l-10.2,15.1h20.3L61.4,332.4z M61.4,329.5l-12.9,19.3h25.9L61.4,329.5z',
          onclick: () => {
            console.log('数据点等分');
            this.$store.state.modelFlag = !this.$store.state.modelFlag;
            this.modelFlag = !this.modelFlag;
            this.drawchart();
            this.setchartdata(this.flagX, this.flagY, this.dataX, this.dataY, this.title);
            let option = {
              toolbox: {
                feature: {
                  myModel: {
                    // title: this.modelFlag ? '数据点等分' : '时间点等分'
                    title: this.modelFlag ? this.translateText("chart.textMap.", "数据点等分") : this.translateText("chart.textMap.", "时间点等分"),
                  },
                  myMarkPoint: {
                    iconStyle: {
                      borderColor: null
                    },
                    title: this.translateText("chart.textMap.", "标点"),
                  }
                }
              },
              // dataZoom: [{
              //   type: 'inside',
              //   start: 0,
              //   end: 100
              // }]
            };
            this.mychart.setOption(option);
            // this.updateMarkPoint()
            // this.setchartdata(this.flagX, this.flagY, this.dataX, this.dataY, this.title);
          }
        },
        // 标注
        myMark: {
          title: this.markPoint.isMark ? this.translateText("chart.textMap.", "取消标注") : this.translateText("chart.textMap.", "标注"),
          show: false,
          // show: this.type=='real' ? false: true,
          icon: this.markPoint.markIcon,
          iconStyle: {
            borderColor: this.markPoint.isMark ?'#74ACC8' : null
          },
          onclick:  ()=>{
            if((this.peakSearch != undefined && this.peakSearch.state) || (this.markLine != undefined && this.markLine.isResonance)){
              return
            }
            let option = {
              series: [{
                markPoint: this.proMarkPoint
              }],
              toolbox: {
                feature: {
                  myMark: {
                    iconStyle: {
                      borderColor: '#74ACC8'
                    }
                  },
                  myDataZoomIn: {
                    iconStyle: {
                      borderColor: null,
                    }
                  },
                  mybrush: {
                    iconStyle: {
                      borderColor: null,
                    }
                  }
                }
              }
            }
            if(this.markPoint.isMark) {
              //取消标注 清空标记点

              this.markPoint.isMark = false;
              option.toolbox.feature.myMark.iconStyle.borderColor = null
              option.toolbox.feature.myMark.title = this.translateText("chart.textMap.", "标注")
              this.delALLMarkPoint()


            } else {
              //this.mychart.getOption();
              console.log(this.mychart.getOption().toolbox[0].feature,"wdy")


              /*
              if(this.mychart.getOption().toolbox[0].feature.mybrush!=undefined){
                //标注禁用细化功能
                this.$store.state.brushState = false;
                option.toolbox.feature.mybrush.iconStyle.borderColor = this.$store.state.brushState ?'#74ACC8' : null;
              }*/


              this.markPoint.isMark = true;
              this.proMarkPoint = this.mychart.getOption().series[0].markPoint
              this.markPoint.markPointX = []
              option.toolbox.feature.myMark.title = this.translateText("chart.textMap.", "取消标注")
            }
            if(this.mychart.getOption().toolbox[0].feature.myDataZoomIn){
              // 如果有放大功能,点击标注后按钮保持不变
              // this.zoomState = false;
              option.toolbox.feature.myDataZoomIn.iconStyle.borderColor = this.zoomState ?'#74ACC8' : null;

              //this.mychart.setOption(option)
            }
            this.mychart.setOption(option)
          }
        },
      }
    },

    /**
     * 返回RealToolbox的feature
     * @returns {{myMark: {onclick, show: boolean, icon: string, title: string}}}
     */
    getRealToolboxFeature() {
      return {
        // 标点
        myMarkPoint: {
          title: this.myMarkPoint.state ? this.translateText("chart.textMap.", "取消标点") : this.translateText("chart.textMap.", "标点"),
          icon: this.myMarkPoint.icon,
          iconStyle: {
            borderColor: this.myMarkPoint.state ?'#74ACC8' : null
          },
          show: true,
          onclick: this.getHistoryToolboxFeature().myMarkPoint.onclick
        },
      }
    },
    getMyMarkPoint() {
      return {
        // 标点
        myMarkPoint: {
          title: this.myMarkPoint.state ? this.translateText("chart.textMap.", "取消标点") : this.translateText("chart.textMap.", "标点"),
          icon: this.myMarkPoint.icon,
          show: true,
          onclick: this.getHistoryToolboxFeature().myMarkPoint.onclick
        },
        // 标注
        myMark: {
          title: this.markPoint.isMark ? this.translateText("chart.textMap.", "取消标注") : this.translateText("chart.textMap.", "标注"),
          show: true,
          icon: this.markPoint.markIcon,
          onclick: this.getHistoryToolboxFeature().myMark.onclick
        }

      }
    },


    /**
     * 单独返回主副游标切换
     */
    getPrimarySecondary() {
      return {
        // 主副游标切换
        myPrimarySecondary: {
          title: !this.PrimarySecondary.isMark ? this.translateText("chart.textMap.", "主游标") : this.translateText("chart.textMap.", "辅游标"),
          show: true,
          // show: this.type=='real'? false:true,
          icon: this.PrimarySecondary.icon,
          iconStyle: {
            borderColor: this.PrimarySecondary.isMark ? null : '#74ACC8'
          },
          onclick:  ()=>{
            console.log('实时模式下的')
            let option = {
              toolbox: {
                feature: {
                  myPrimarySecondary: {
                    iconStyle: {
                      borderColor: '#74ACC8'
                    }
                  }
                }
              }
            }
            if(this.PrimarySecondary.isMark) {
              // console.log('当前是标记状态下')
              // 如果当前是主游标状态,需要切换为副游标
              this.PrimarySecondary.isMark = false;
              option.toolbox.feature.myPrimarySecondary.title = this.translateText("chart.textMap.", "主游标")
              //
            } else {
              this.PrimarySecondary.isMark = true;
              option.toolbox.feature.myPrimarySecondary.iconStyle.borderColor = null
              option.toolbox.feature.myPrimarySecondary.title = this.translateText("chart.textMap.", "辅游标")
            }
            this.mychart.setOption(option)
          }
        }
      }
    },

    /**
     * 单独返回标点
     */
    getMarkPoint() {
      return {
        // 标点
        myMarkPoint: {
          title: this.myMarkPoint.state ? this.translateText("chart.textMap.", "取消标点") : this.translateText("chart.textMap.", "标点"),
          icon: this.myMarkPoint.icon,
          // show: this.$route.path.indexOf('/WirelessPumpGraph') !== -1 && this.trendFlag ? false : true,
          show: true,
          iconStyle: {
            borderColor: this.myMarkPoint.state ?'#74ACC8' : null
          },
          onclick: () => {
            console.log('标点');
            let option = {
              toolbox: {
                feature: {
                  myMarkPoint: {
                    iconStyle: {
                      borderColor: '#74ACC8'
                    }
                  }
                }
              }
            }
            if(this.myMarkPoint.state) {
              // 还原图表线条颜色
              option.toolbox.feature.myMarkPoint.iconStyle.borderColor = null
              this.myMarkPoint.state = false
              option.toolbox.feature.myMarkPoint.title = this.translateText("chart.textMap.", "标点")
            } else {
              this.myMarkPoint.state = true
              option.toolbox.feature.myMarkPoint.title =  this.translateText("chart.textMap.", "取消标点")
            }
            this.myMarkPointFun()

            this.mychart.setOption(option)
          }
        }
      }
    },
    /**
     * 单独返回模式切换
     */
    getModel() {
      return {
        // 模式切换
        myModel: {
          // title: this.modelFlag ? '数据点等分' : '时间点等分',
          title: this.modelFlag ? this.translateText("chart.textMap.", "数据点等分") : this.translateText("chart.textMap.", "时间点等分"),
          show: false,
          icon: 'M252.6,26v194.6c0,5.8-4.5,10.5-10,10.5h-196c-5.5,0-10-4.7-10-10.5V26c0-5.8,4.5-10.5,10-10.5h196C248.2,15.4,252.6,20.2,252.6,26z M488.6,169.5c0-85.1-66.6-154.1-148.8-154.1 M485.7,242.6l47.7-71H438L485.7,242.6z M485.7,237.5l42.2-62.7h-84.3L485.7,237.5z M485.7,231.8l35.6-53H450L485.7,231.8z M485.7,226.3l29.8-44.3h-59.6L485.7,226.3z M485.7,219.2l23.3-34.7h-46.6L485.7,219.2z M485.7,213.8l17.7-26.4h-35.5L485.7,213.8z M485.7,199.2l2.4-3.7h-4.9L485.7,199.2z M485.7,200l3.6-5.4h-7.1L485.7,200z M485.7,201.1l5-7.5h-10L485.7,201.1z M485.7,203.4l6.9-10.3h-13.9L485.7,203.4z M485.7,206.6l10.2-15.1h-20.3L485.7,206.6z M485.7,209.6l12.9-19.3h-25.9L485.7,209.6z M296.5,318.5v194.6c0,5.8,4.5,10.5,10,10.5h196c5.5,0,10-4.7,10-10.5V318.5c0-5.8-4.5-10.5-10-10.5h-196C300.9,307.9,296.5,312.7,296.5,318.5z M58.5,369.5c0,85.1,66.6,154.1,148.8,154.1 M61.4,296.4l-47.7,71h95.4L61.4,296.4z M61.4,301.5l-42.2,62.7h84.3L61.4,301.5z M61.4,307.3l-35.6,53H97L61.4,307.3z M61.4,312.8l-29.8,44.3h59.6L61.4,312.8z M61.4,319.9l-23.3,34.7h46.6L61.4,319.9z M61.4,325.2l-17.7,26.4h35.5L61.4,325.2z M61.4,339.9l-2.4,3.7h4.9L61.4,339.9z M61.4,339.1l-3.6,5.4H65L61.4,339.1z M61.4,338l-5,7.5h10L61.4,338zM61.4,335.7L54.5,346h13.9L61.4,335.7z M61.4,332.4l-10.2,15.1h20.3L61.4,332.4z M61.4,329.5l-12.9,19.3h25.9L61.4,329.5z',
          onclick: () => {
            console.log('数据点等分');
            this.$store.state.modelFlag = !this.$store.state.modelFlag;
            this.modelFlag = !this.modelFlag;
            this.drawchart();
            this.setchartdata(this.flagX, this.flagY, this.dataX, this.dataY, this.title);
            let option = {
              toolbox: {
                feature: {
                  myModel: {
                    // title: this.modelFlag ? '数据点等分' : '时间点等分'
                    title: this.modelFlag ? this.translateText("chart.textMap.", "数据点等分") : this.translateText("chart.textMap.", "时间点等分"),
                  },
                  myMarkPoint: {
                    iconStyle: {
                      borderColor: null
                    },
                    title: this.translateText("chart.textMap.", "标点"),
                  }
                }
              },
              // dataZoom: [{
              //   type: 'inside',
              //   start: 0,
              //   end: 100
              // }]
            };
            this.mychart.setOption(option);
            // this.updateMarkPoint()
            // this.setchartdata(this.flagX, this.flagY, this.dataX, this.dataY, this.title);
          }
        },
      }
    },
    /**
     * 单独返回标注
     */
    getMark() {
      return {
        // 标注
        myMark: {
          title: this.markPoint.isMark ? this.translateText("chart.textMap.", "取消标注") : this.translateText("chart.textMap.", "标注"),
          show: false,
          // show: this.type=='real' ? false: true,
          icon: this.markPoint.markIcon,
          iconStyle: {
            borderColor: this.markPoint.isMark ?'#74ACC8' : null
          },
          onclick:  ()=>{
            if((this.peakSearch != undefined && this.peakSearch.state) || (this.sidebandFamily != undefined && this.sidebandFamily.state) || (this.markLine != undefined && this.markLine.isResonance)){
              return
            }
            let option = {
              series: [{
                markPoint: this.mychart.getOption().series[0].markPoint
              }],
              toolbox: {
                feature: {
                  myMark: {
                    iconStyle: {
                      borderColor: '#74ACC8'
                    }
                  }
                }
              }
            }
            if(this.markPoint.isMark) {
              this.markPoint.isMark = false;
              option.series[0].markPoint = this.proMarkPoint
              option.toolbox.feature.myMark.iconStyle.borderColor = null
              option.toolbox.feature.myMark.title = this.translateText("chart.textMap.", "标注")
              this.delALLMarkPoint()
            } else {
              this.markPoint.isMark = true;
              this.markPoint.markPointX = []
              option.toolbox.feature.myMark.title = this.translateText("chart.textMap.", "取消标注")
              // 记录一下markpoint
              this.proMarkPoint = this.mychart.getOption().series[0].markPoint

            }
            this.mychart.setOption(option)
          }
        },
      }
    },

    getAlarmLine(){
      return{
        myAlarmLine: {
          show: true,
          title: this.alarmFlag ? this.translateText('chart.textMap.', '隐藏报警线') : this.translateText('chart.textMap.', '显示报警线'),
          icon: "M0.5999999999999996 7a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z M3.8 6.6L4.2 6.6 M10 10L3.7 10 M4.7 4.6L5 5 M7 4L7 4.4 M9 4.8L9.3 4.5 M9.7 6.6L10.2 6.6 M6.7 7.8L6.7 8.7 M8.5,9.6l0-2.6C8.3,5.3,5.8,5.3,5.6,7v2.6",
          iconStyle: {
            borderColor: this.alarmFlag ? '#74ACC8' : null,
            emphasis: {
              textPadding: [
                this.$store.state.paddingtop,
                this.$store.state.paddingright,
              ],
            },
          },
          onclick: () => {
            this.alarmFlag = !this.alarmFlag
            let option = {
              toolbox: {
                feature: {
                  myAlarmLine: {
                    title: this.alarmFlag ? this.translateText('chart.textMap.', '隐藏报警线') : this.translateText('chart.textMap.', '显示报警线'),
                    iconStyle: {
                      borderColor: this.alarmFlag ? '#74ACC8' : null
                    }
                  }
                }
              }
            }
            this.mychart.setOption(option)
            this.handleAlarm(this.alarmFlag);
            this.updateMarkPoint()
          }
        }
      }
    },

    handleAlarm(val) {
      if (val) {
        if (this.aline.length > 0) {
          let amax = Number.NEGATIVE_INFINITY, amin = Number.POSITIVE_INFINITY;
          let tmp_data = [];
          let linedata = [];
          let mySeries = this.mychart.getOption().series;
          for (let _item in mySeries) {
            for (let item in mySeries[_item].data) {
              if (this.mychart.getOption().xAxis[0].type != 'category') {
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
            this.aline[i].id = "alarmMarkLine"
            this.aline[i].lineStyle = {
              color: "red",
              type: "solid",
            };
            this.aline[i].label = {
              show: true,
              position: this.positionMap[i],
              formatter: ((param) => {
                var tmpname = this.translateText("chart.textMap.",param.name);//对报警状态进行翻译
                return tmpname + " " + param.data.value.toString();
              }),
            };
            linedata.push(this.aline[i]);
            tmp_data.push(this.aline[i].yAxis);
          }
          tmp_data.sort((num1, num2) => {
            return num2 - num1;
          });
          let markLineData = [];
          try{
            markLineData = this.mychart.getOption().series[0].markLine.data;
          }catch (e){}
          if(markLineData == undefined) markLineData = [];
          markLineData = markLineData.filter(i => {
            return i.id != "alarmMarkLine";
          })
          linedata.push(...markLineData);
          let markLine = {
            data: linedata,
            symbol: ['none', 'none'],
            animation: false,
          };
          amax = Math.max(amax, tmp_data[0]);
          amin = Math.min(amin, tmp_data[tmp_data.length - 1]);
          amax = this.roundUp(amin, amax)
          amin = this.roundDown(amin, amax)
          let myOption = {
            series: {
              markLine: markLine
            },
            yAxis: {
              axisLabel: {
                showMaxLabel: true,
                showMinLabel: true,
              },
              max: amax,
              min: amin,
            },
          };
          this.mychart.setOption(myOption);
        }else {
          this.$message({
            message: this.translateText("chart.textMap.",'暂无报警线信息'),
            type: 'warning'
          });
        }
      } else {
        let mySeries = this.mychart.getOption().series;
        let amax = Number.NEGATIVE_INFINITY, amin = Number.POSITIVE_INFINITY;
        for (let _item in mySeries) {
          for (let item in mySeries[_item].data) {
            if (this.mychart.getOption().xAxis[0].type != 'category') {
              amax = Math.max(amax, mySeries[_item].data[item][1]);
              amin = Math.min(amin, mySeries[_item].data[item][1]);
            } else {
              amax = Math.max(amax, mySeries[_item].data[item]);
              amin = Math.min(amin, mySeries[_item].data[item]);
            }
          }
        }
        let markLineData = mySeries[0].markLine.data;
        markLineData = markLineData.filter(i => {
          return i.id != "alarmMarkLine";
        })
        amax = this.roundUp(amin, amax)
        amin = this.roundDown(amin, amax)
        let myOption = {
          series: {
            markLine: {
              data: markLineData
            }
          },
          yAxis: {
            axisLabel: {
              showMaxLabel: true,
              showMinLabel: true,
            },
            max: amax,
            min: amin,
          },
        };
        this.mychart.setOption(myOption);
      }
    },
  }
}

/**
 * 图表的公共toolbox
 */
export default toolboxMixin
