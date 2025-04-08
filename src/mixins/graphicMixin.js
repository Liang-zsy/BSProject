/**
 *
 * 标注功能
 */
const graphicMixin = {
  data() {
    return  {
      clickgraphic: false,
      lineStyleNormalWidth: typeof this.axisPositionFlag == 'undefined' ? 1 : 2,
    }
  },
  computed:{
    updateGraphicTextFlag(){
      return this.$store.state.updateGraphicTextFlag
    }
  },
  watch:{
    updateGraphicTextFlag(val){
      if(val === true){
        this.updateGraphicText(this.$store.state.xValue,this.$store.state.yValue,this.$store.state.seriesIndex)
      }
    }
  },
  methods: {
    updateMarkPoint(flag) {
      let initgraphic = this.mychart.getOption().graphic
      console.log(flag);
      console.log('放大后的刷新', initgraphic);
      if (typeof initgraphic == 'undefined' || !initgraphic.length) {
        return;
      } else {
        initgraphic = initgraphic[0].elements
      }
      let allgraphic = []
      let line = {};
      for (let item of initgraphic) {
        if (item.type == 'line') {
          line[item.id] = item.shape;
        }
      }
      for (let item of initgraphic) {
        if (item.type == 'group') {
          console.log(item);
          let xvalue = item.id.split('/')[1];
          let yvalue = item.id.split('/')[2];
          let seriesIndex = item.id.split('/')[3];
          let oldHeight = item.name.split('/')[0];
          let oldWidth = item.name.split('/')[1];
          let coord = this.mychart.convertToPixel('grid', [xvalue, yvalue])
          let pretop = line[item.id.replace('group', 'line')].y1;
          let preleft = line[item.id.replace('group', 'line')].x1;
          let leftSub = coord[0] - preleft;
          let topSub = coord[1] - pretop;
          console.log('原始数据', item);
          console.log('最新位置', coord[0], coord[1]);
          console.log('原始位置', preleft, pretop);
          console.log('移动距离', leftSub, topSub);
          let nowHeight = this.mychart.getHeight()
          let nowWidth = this.mychart.getWidth()
          if(coord[0] > nowWidth || coord[0] < 0|| coord[1] > nowHeight || coord[1] < 0){
            this.delMarkPoint(xvalue, yvalue, seriesIndex)
            continue
          }
          let graphic = [
            {
              type: "group",
              $action: 'merge',
              name: `${nowHeight}/${nowWidth}`,
              id: `group/${xvalue}/${yvalue}/${seriesIndex}`,
              left: item.left * (nowWidth - item.boxWidth - 2) / (oldWidth - item.boxWidth - 2),
              top: item.top * (nowHeight - 22) / (oldHeight  - 22),
              children: [{
                type: 'rect',
                $action: 'merge',
                id: `react/${xvalue}/${yvalue}/${seriesIndex}`,
                z: 100,
                style: {
                  fill: this.$store.state.colorMap[seriesIndex],
                  stroke: this.$store.state.colorMap[seriesIndex],
                  lineWidth: 1,
                }
              }]
            },
            {
              type: "line",
              $action: 'merge',
              id: `line/${xvalue}/${yvalue}/${seriesIndex}`,
              shape:{
                x1: coord[0],
                y1: coord[1],
                x2: item.left * (nowWidth - item.boxWidth - 2) / (oldWidth - item.boxWidth - 2) + item.boxWidth / 2 + 1,
                y2: (item.top * (nowHeight - 22) / (oldHeight  - 22) >= coord[1]) ? item.top * (nowHeight - 22) / (oldHeight - 22) : item.top * (nowHeight - 22) / (oldHeight - 22) + 22,
              }
            }
          ]
          allgraphic.push(...graphic)
        }
      }
      console.log('测试更新后的数据', allgraphic);
      this.mychart.setOption({
        graphic: allgraphic,
      })
    },
    updateGraphicText(xvalue, yvalue, seriesIndex){
      let updateGraphic = this.mychart.getOption().graphic
      if (typeof updateGraphic == 'undefined' || !updateGraphic.length) {
        return
      } else {
        updateGraphic = updateGraphic[0].elements
        for(let item of updateGraphic){
          if(item.id == `text/${xvalue}/${yvalue}/${seriesIndex}`){
            item.style.text = this.$store.state.upsInputValue
          }
        }
      }
      let option = {
        graphic: updateGraphic,
      }
      this.mychart.setOption(option)
      this.$nextTick(() => {
        this.$store.state.updateGraphicTextFlag = false
      })
    },
    handledrag(params, xvalue, yvalue, seriesIndex,boxWidth) {
      // 假设已经创建了一个 ECharts 实例 myChart
      // console.log(params);
      let coord = this.mychart.convertToPixel('grid', [xvalue, yvalue])
      let toolBoxData = this.mychart.getOption().toolbox
      try{
        this.zoomState = this.zoomState ? false : false;
        toolBoxData[0].feature.myDataZoomIn.iconStyle.borderColor = this.zoomState ?'#74ACC8' : null;
      }catch (e){}
      let oOption = {
        graphic: [
          {
            type: "group",
            $action: 'merge',
            id: `group/${xvalue}/${yvalue}/${seriesIndex}`,
            left: params.offsetX - boxWidth / 2 - 1,
            top: params.offsetY,
            children: [{
              type: 'rect',
              $action: 'merge',
              id: `react/${xvalue}/${yvalue}/${seriesIndex}`,
              z: 100,
              style: {
                fill: this.$store.state.colorMap[seriesIndex],
                stroke: this.$store.state.colorMap[seriesIndex],
                lineWidth: 1,
              }
            }]
          },
          {
            type: "line",
            $action: 'merge',
            id: `line/${xvalue}/${yvalue}/${seriesIndex}`,
            shape:{
              x1: coord[0],
              y1: coord[1],
              x2: params.offsetX,
              y2: params.offsetY >= coord[1] ? params.offsetY : params.offsetY + 22
            }
          }
        ],
        toolbox: toolBoxData
      }
      this.mychart.setOption(oOption)
    },
    delALLMarkPoint() {
      if (typeof this.mychart.getOption().graphic == 'undefined') {
        return ;
      }
      let initgraphic = this.mychart.getOption().graphic[0].elements;
      let delgraphic = []
      delgraphic = initgraphic.map(item =>  {
        return {id: item.id, $action: 'remove'}
      })
      // console.log('取消标注', delgraphic);
      let seriesData = this.mychart.getOption().series;
      seriesData = seriesData.map(item => {
        item.lineStyle.normal.width = this.lineStyleNormalWidth
        return item
      })
      for (let seriesIndex in seriesData) {
        if(seriesData[seriesIndex].markPoint == null) continue;
        try {
          seriesData[seriesIndex].markPoint.data = seriesData[seriesIndex].markPoint.data.filter(item => {
            return item.name != '标点';
          })
        } catch (error) {
          console.log(error);
        }
      }
      let eoption = {
        graphic: delgraphic,
        series: seriesData,
      }
      this.mychart.setOption(eoption)
    },
    delMarkPoint(xvalue, yvalue, seriesIndex) {
      // console.log('点击', xvalue, yvalue, seriesIndex);
      this.clickgraphic = true
      let delgraphic = [
        {
          id: `group/${xvalue}/${yvalue}/${seriesIndex}`,
          $action: 'remove'
        },
        {
          id: `line/${xvalue}/${yvalue}/${seriesIndex}`,
          $action: 'remove'
        },
        {
          id: `react/${xvalue}/${yvalue}/${seriesIndex}`,
          $action: 'remove'
        },
        {
          id: `text/${xvalue}/${yvalue}/${seriesIndex}`,
          $action: 'remove'
        }
      ]
      let seriesData = this.mychart.getOption().series;
      seriesData = seriesData.map(item => {
        item.lineStyle.normal.width = this.lineStyleNormalWidth
        return item
      })
      this.markPoint.markPointX = this.markPoint.markPointX.filter(item => {
        let node = JSON.parse(item)
        return node.xName != xvalue || node.y != yvalue
      })
      seriesData[seriesIndex].markPoint.data = seriesData[seriesIndex].markPoint.data.filter(item => {
        return item.name != '标点' || item.xAxis != xvalue || item.yAxis.toString() != yvalue
      })
      let eoption = {
        graphic: delgraphic,
        series: seriesData,
      }
      this.mychart.setOption(eoption)
    },
    addMarkPoint(xvalue, yvalue, seriesIndex, closePointIndex) {
      console.log(xvalue, yvalue);
      let coord = this.mychart.convertToPixel('grid', [xvalue, yvalue])
      let maxHeight = this.mychart.getHeight()
      let maxWidth = this.mychart.getWidth()
      // coord[0] 和 coord[1] 分别为转换后的 X 和 Y 像素坐标
      console.log('X 像素坐标:', coord[0]);
      console.log('Y 像素坐标:', coord[1]);
      const textContent = `${xvalue}, ${yvalue}`;
      function getTextWidth(text, font) {
        // 创建一个临时的 Canvas 元素
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        // 设置字体样式
        context.font = font;

        // 测量文本的宽度
        var metrics = context.measureText(text);

        // 返回文本的宽度
        return metrics.width;
      }
      // 计算文本的长度
      const textWidth = getTextWidth(textContent, '14px Microsoft YaHei');

      // 动态设置框的宽度
      const boxWidth = Math.ceil(Math.max(textWidth + 20, 220)) // 假设最大宽度为 220
      let addgraphic = [
        {
          type: 'group',
          id: `group/${xvalue}/${yvalue}/${seriesIndex}`,
          name: `${maxHeight}/${maxWidth}`,
          boxWidth: `${boxWidth}`,
          // x: coord[0] - 120,
          // y: coord[1] - 10,
          left: coord[0] - 180,
          top: coord[1] - 20,
          draggable: true,
          // ondragend: echarts.util.curry(dragend),
          // ondrag: echarts.util.curry(ondrag),
          onclick: (params) => {
            console.log(params);
            // params.event.stopPropagation();
            this.delMarkPoint(xvalue, yvalue, seriesIndex)
          },
          oncontextmenu: ()=>{
            let updateGraphic = this.mychart.getOption().graphic
            if (typeof updateGraphic == 'undefined' || !updateGraphic.length) {
              return
            } else {
              updateGraphic = updateGraphic[0].elements
              for(let item of updateGraphic){
                if(item.id == `text/${xvalue}/${yvalue}/${seriesIndex}`){
                  this.$store.state.upsInputValue = item.style.text
                  this.$store.state.dialogVisible = true
                  this.$store.state.xValue = xvalue
                  this.$store.state.yValue = yvalue
                  this.$store.state.seriesIndex = seriesIndex
                }
              }
            }
          },
          //鼠标按下关闭细化刷选，鼠标松开根据是否开启细化，开启或关闭刷选
          onmousedown: () =>{
            this.mychart.dispatchAction({
              type: "takeGlobalCursor",
              key: "brush",
              brushOption: {
                brushType: false,
              },
            });
          },
          onmouseup: () => {
            this.mychart.dispatchAction({
              type: "takeGlobalCursor",
              key: "brush",
              brushOption: {
                brushType: this.brushState ? "lineX" : false,
              },
            });
          },
          ondrag: (params) => {
            //解决标签可以拖到边界外的问题
            if(params.offsetX < boxWidth / 2 + 1){
              params.offsetX = boxWidth / 2 + 1
            }
            if(params.offsetX > this.mychart.getWidth() - boxWidth / 2 - 1){
              params.offsetX = this.mychart.getWidth() - boxWidth / 2 - 1
            }
            if(params.offsetY < 0){
              params.offsetY = 0
            }
            if(params.offsetY > this.mychart.getHeight() - 22){
              params.offsetY = this.mychart.getHeight() - 22
            }
            // console.log(params);
            this.handledrag(params, xvalue, yvalue, seriesIndex,boxWidth)
          },
          children: [
            {
              type: 'rect',
              z: 100,
              left: 'center',
              top: 'middle',
              id: `react/${xvalue}/${yvalue}/${seriesIndex}`,
              shape: {
                width: boxWidth,
                height: 20
              },
              style: {
                fill: this.$store.state.colorMap[seriesIndex],
                stroke: this.$store.state.colorMap[seriesIndex],
                lineWidth: 1,
              },
            },
            {
              type: 'text',
              z: 101,
              left: 'center',
              top: -5,
              id: `text/${xvalue}/${yvalue}/${seriesIndex}`,
              style: {
                fill: '#ffffff',
                width: boxWidth,
                overflow: 'break',
                text: `${xvalue}, ${yvalue}`,
                font: '14px Microsoft YaHei'
              }
            }

          ]
        },
        {
              type: "line",
              id: `line/${xvalue}/${yvalue}/${seriesIndex}`,
              $action: 'replace',
              draggable: false,
              style: {
                stroke: this.$store.state.colorMap[seriesIndex],
              },
              shape:{
                x1: coord[0],
                y1: coord[1],
                x2: coord[0] - 180 + boxWidth / 2,
                y2: coord[1]
              }
        }
      ]
      let initgraphic = this.mychart.getOption().graphic
      // console.log(initgraphic, '新增的' ,addgraphic);
      if (typeof initgraphic == 'undefined' || !initgraphic.length) {
        // console.log('初始化');
        initgraphic = []
      } else {
        initgraphic = initgraphic[0].elements
      }
      initgraphic.push(...addgraphic)
      // console.log('增加之后', initgraphic);
      let seriesData = this.mychart.getOption().series
      seriesData = seriesData.map(item => {
        item.lineStyle.normal.width = this.lineStyleNormalWidth
        console.log(item);
        return item
      })
      // console.log(seriesData);
      if (typeof seriesData[seriesIndex].markPoint == 'undefined' || typeof seriesData[seriesIndex].markPoint.data == 'undefined') {
        seriesData[seriesIndex].markPoint = {
          data: []
        }
      }
      seriesData[seriesIndex].markPoint.data.push({
        name: '标点',
        xAxis: xvalue,
        yAxis: Number(yvalue),
        symbol: 'triangle',
        symbolSize: 10,
        itemStyle: {
          color: this.$store.state.colorMap[seriesIndex]
        }
      })
      this.mychart.setOption({
        graphic: initgraphic,
        series: seriesData
      })
      console.log(this.mychart.getOption().graphic);
    }
  }
}

export default graphicMixin
