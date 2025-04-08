const brushMixin = {

  data() {
    return {
      brushState: false,
    }
  },
  methods: {
    custombrush() {
      let mybrush = {
        show: this.$route.path.indexOf("RotatingMachineryGraph/StartStopGraph") == -1,
        type: ["lineX"],
        title: {
          // lineX: "细化",
          lineX: this.translateText("chart.textMap.",'放大'),
        },
        iconStyle: {
          borderColor: this.brushState ?'#74ACC8' : null
        },
        icon: {
          lineX: "M13.5,7c0,3.7-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7c0-3.7,2.9-6.5,6.5-6.5S13.5,3.3,13.5,7z M7,9.6V4.4 M9.6,7H4.4"
        },
        // icon: {
        //     lineX:
        //     'M7,0.5c3.7,0,6.5,2.9,6.5,6.5c0,3.7-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7C0.4,3.5,3.3,0.5,7,0.5z M10.9,8.6h-2\n' +
        //       '\tc0,0-0.1,0-0.1-0.1L7.3,4.2H7.2l-1.8,5.9H5.3L3.5,6H3.4L2.3,8.6c0,0,0,0-0.1,0L1,8.6 M11,8c-0.3,0-0.5,0.3-0.5,0.5S10.8,9,11,9\n' +
        //       '\ts0.5-0.3,0.5-0.5C11.4,8.2,11.3,8,11,8z M11,7.9c-0.3,0-0.7,0.3-0.7,0.7c0,0.3,0.3,0.7,0.7,0.7c0.3,0,0.7-0.3,0.7-0.7\n' +
        //       '\tC11.7,8.2,11.4,7.9,11,7.9z'
        //   },

        // icon: {
        //   lineX:
        //     "M466.4,237.4c0,126.1-102.2,228.3-228.3,228.3S9.8,363.5,9.8,237.4S112,9.1,238.1,9.1S466.4,111.3,466.4,237.4z\n" +
        //     "M390,407.8l133,134.8 M395.5,258.2l-57.2,1l-35.9-85l-32.9,101l-48.9-106l-44.6,137l-32.2-53H79.6",
        // },
        onclick: () => {



            this.brushState = !this.brushState;
            try {
              let option = this.mychart.getOption();
              option.series = option.series.map(item => {
                item.lineStyle.normal.width = 1
                return item
              })
              option.toolbox[0].feature.mybrush.iconStyle.borderColor = this.brushState ? '#74ACC8' : null;
              // console.log("测试", option.toolbox[0].feature.dataZoom)
              //隐藏按钮
              if (option.toolbox[0].feature.myDataZoomIn) {
                option.toolbox[0].feature.myDataZoomIn.show = !this.brushState
                //改变按钮颜色,禁用放大
                this.zoomState = false;
                option.toolbox[0].feature.myDataZoomIn.iconStyle.borderColor = this.zoomState ?'#74ACC8' : null;

              }
              if (option.toolbox[0].feature.myDataZoomOut) {
                option.toolbox[0].feature.myDataZoomOut.show = !this.brushState

              }
              option.brush[0].brushStyle.shadowColor = this.brushState ? '#74ACC8' : null;
              option.brush[0].brushStyle.opacity = this.brushState ? 0.8 : 0;

              this.mychart.setOption(option)
              this.mychart.dispatchAction({
                type: "takeGlobalCursor",
                key: "brush",
                brushOption: {
                  brushType: this.brushState ? "lineX" : false,
                },
              });
            } catch (e) {
              console.log(e);
            }
          }


      }
      return {mybrush};
    },
    myUnRefine() {
      let myrestore  = {
        show: true,
        title: this.translateText("chart.textMap.",'细化还原'),
        icon: 'M1.2,4C2.3,1.9,4.5,0.5,7,0.5c3.6,0,6.5,2.9,6.5,6.5s-2.9,6.5-6.5,6.5c-1.4,0-2.7-0.5-3.8-1.2 M10.9,8.3H8.6\n' +
          '\tc0,0-0.1,0-0.1-0.1L7.3,4.1H7.2L5.7,9.9H5.6l-1.5-4H4L2.9,8.3c0,0,0,0-0.1,0H1.7 M11,7.8c-0.3,0-0.5,0.2-0.5,0.5s0.2,0.5,0.5,0.5\n' +
          '\ts0.5-0.2,0.5-0.5S11.3,7.8,11,7.8z M11,7.7c-0.3,0-0.7,0.3-0.7,0.7S10.6,9,11,9c0.3,0,0.7-0.3,0.7-0.7S11.3,7.7,11,7.7z M0.5,3.1\n' +
          '\tl0.8,1.3c0,0.1,0.2,0.1,0.3,0.1l1.3-0.6',
        // icon: "M27.7,256.7h0a288,288,0,0,0-4.2,61.5c5.6,146.1,122.9,264.5,269,271.5,159.6,7.6,292-117.2,296.7-274.1C594,153.7,461.1,20.1,299.2,24a282.67,282.67,0,0,0-216,108.6M519.6,323.8H426.5a4.11,4.11,0,0,1-3.7-2.3L377.3,227a4,4,0,0,0-5.5-1.8,4.11,4.11,0,0,0-2,2.3L316.9,379a4.16,4.16,0,0,1-5.3,2.5,3.89,3.89,0,0,1-2.5-2.5L259.2,229.2a4.09,4.09,0,0,0-5.2-2.5,4.52,4.52,0,0,0-2.5,2.4L188.8,402.3a4.15,4.15,0,0,1-7.7.1l-29-74.7a4,4,0,0,0-3.8-2.6H80M83.2,7.7l-.6,122.4a3.4,3.4,0,0,0,3.6,3.3l129.6-12.7",
        onclick:  () =>{
            this.$store.state.startTime = this.$store.state.tmpStartTime;
            this.$store.state.endTime = this.$store.state.tmpEndTime;
            this.$emit("cancelRefine");
        },
      }
      return {myrestore};
    }
  }
}

export default brushMixin
