/*
给图表添加最大值框
使用方法
首先在组件中引入这个混入文件
mixins: [maxInputMixin],
初始化input框，只需要执行一次
if(!this.initMaxInputFlag) { // 初始化最大值最小值框
  this.initMaxInputFlag = true
  this.initMaxInput()
}
在任何会发生图谱大小改变的地方执行this.resizeMaxInput()方法

如果需要微调最大值的位置，那么可以在组件的data中声明下面的参数
data() {
  return {
    maxInputMixin: { // x轴最大值框所需变量
      offsetX: 0, // x微调
      offsetY: 5, // y微调
    },
  }
}

如果需要关闭x轴最大值框，则可以在data中定义
maxXInputMixin: { // 关闭x轴修改最大值的input框
  show: false
},

 */

const maxInputMixin = {
  data() {
    return {
      yMaxInputDom: null, // y轴最大值dom结构
      yMinInputDom: null,
      firstEnter: true, // 首次进入
      yMaxInputUsed: false,
      yMinInputUsed: false,
      xMaxFixedNum: 2, // x轴最大值框保留小数位数
      // maxInputMixin: { // x轴最大值框所需变量
      //   chartId: 'myWaveChart', // chartId
      //   y: -100, // y轴起始位置
      //   offsetX: 0, // x微调
      //   offsetY: 5, // y微调
      // },
      contentXmax: 'X轴最大值输入',
      contentYmax: 'Y轴最大值输入',
      contentYmin: 'Y轴最小值输入',
    }
  },
  watch: {
    "$store.state.equid": function (val) {
      this.firstEnter = true
      this.yMaxInputUsed = false
      this.yMinInputUsed = false
      // console.log("happen max", val)
      // let chart = this.mychart
      // const option = {
      //   yAxis: [{
      //     min: null,
      //     max: null,
      //   }],
      // }
      // setTimeout(() => {
      //   chart.setOption(option)
      // }, 2000)
    },
    '$i18n.locale'() {
      this.contentYmax = this.translateText("chart.textMap.", 'Y轴最大值输入');
      this.contentYmin = this.translateText("chart.textMap.", 'Y轴最小值输入');
      this.contentXmax = this.translateText("chart.textMap.", 'X轴最大值输入');
    }
  },
  mounted() {
    this.contentYmax = this.translateText("chart.textMap.", 'Y轴最大值输入');
    this.contentYmin = this.translateText("chart.textMap.", 'Y轴最小值输入');
    this.contentXmax = this.translateText("chart.textMap.", 'X轴最大值输入');
    // erd.listenTo(this.$refs.SmyChart, function (element) {
    //   that.$nextTick(function () {
    //     that.resizeMaxInput()
    //   })
    // })
  },
  methods: {
    debug(args) {
      console.log("happen->debug:", ...args)
    },
    // setIsFull(data) {
    //   setTimeout(() => {
    //     this.resizeMaxInput(this.mychart)
    //   }, 1000)
    // },

    // async setchartdata(flagX, flagY, dataX, dataY, title, subtitle) {
    //   this.resizeMaxInput()
    // },

    // setchart(flagX, flagY, dataX, dataY, title, subtitle, isDegree=false) {
    //   this.$nextTick(()=> {
    //     if(!this.initMaxInputFlag) {
    //       this.initMaxInputFlag = true
    //       this.initMaxInput()
    //     }
    //   })
    // },

    /**
     * 获取echarts图表x轴n位置的像素坐标
     * @param chart echarts图表
     * @returns {{x, y}} 对应点的坐标
     */
    // function getMaxPixel(chart) {
    //   const option = chart.getOption() // 获取图表的option
    //   const xdata = option.xAxis[0].data // 图表的x轴数据
    //   const n = option.dataZoom[0].endValue
    //   let y = params.y ? params.y : 0
    //
    //   const pxInGrid = chart.convertToPixel({ seriesIndex: 0 }, [n, y]) // x最右边，y等于0，获取最大值位置的坐标
    //   this.debug(n, y)
    //   // 计算最大值距离最右边轴的差
    //   if(xdata.length > 1) {
    //     pxInGrid[0] += (chart.convertToPixel({ seriesIndex: 0 }, [xdata.length, 0])[0] - chart.convertToPixel({ seriesIndex: 0 }, [xdata.length - 1, 0])[0]) / 2
    //   }
    //   return { x: pxInGrid[0], y: pxInGrid[1] }
    // }

    /**
     * 获取chart图表右下角坐标
     */
    getRightBottomPixel() {
      const chart = this.mychart
      const op = chart.getOption()
      const height = chart.getHeight()
      const width = chart.getWidth()
      // const y = height - parseInt(op.grid[0].bottom) * 0.01 * height

      let y = 0
      // if(op.grid[0].bottom.indexOf('px') !== -1) {
        y = height - parseInt(op.grid[0].bottom)
      // } else {
      //   y = height - parseInt(op.grid[0].bottom) * 0.01 * height
      // }

      let x = 0
      if(op.grid[0].right.indexOf('%') !== -1) {
        x = width - parseInt(op.grid[0].right) * 0.01 * width
      } else {
        x = width - parseInt(op.grid[0].right)
      }
      return {x, y}
    },
    /**
     * 获取chart图表左上角坐标
     */
    getLeftTopPixel() {
      // {
      //     "left": "7%",
      //     "right": "7%",
      //     "top": "21%",
      //     "bottom": "15%",
      // }
      const chart = this.mychart
      const op = chart.getOption()
      const height = chart.getHeight()
      const width = chart.getWidth()
      // const y = height - parseInt(op.grid[0].bottom) * 0.01 * height
      // const x = width - parseInt(op.grid[0].right) * 0.01 * width
      // const y = parseInt(op.grid[0].top) * 0.01 * height

      let y = 0
      try {
      //   if(op.grid[0].top.indexOf('px') !== -1) {
          y = parseInt(op.grid[0].top)
        // } else {
        //   y = parseInt(op.grid[0].top) * 0.01 * height
        // }
      } catch(e) {
        console.log(e);
      }



      let x = 0
      try {
        if(op.grid[0].right.indexOf('%') !== -1) {
          x = parseInt(op.grid[0].left) * 0.01 * width
        } else {
          x = parseInt(op.grid[0].left)
        }
      } catch(e) {
        console.log(e);
      }


      return {x, y}
    },
    /**
     * 获取chart图表左下角坐标
     */
    getLeftBottomPixel() {
      // {
      //     "left": "7%",
      //     "right": "7%",
      //     "top": "21%",
      //     "bottom": "15%",
      // }
      const chart = this.mychart
      const op = chart.getOption()
      const height = chart.getHeight()
      const width = chart.getWidth()
      // const y = height - parseInt(op.grid[0].bottom) * 0.01 * height
      // const x = parseInt(op.grid[0].left) * 0.01 * width


      let y = 0
      try {
        // if(op.grid[0].bottom.indexOf('px') !== -1) {
          y = height - parseInt(op.grid[0].bottom)
        // } else {
        //   y = height - parseInt(op.grid[0].bottom) * 0.01 * height
        // }
      } catch (e) {
        console.log(e);
      }


      let x = 0
      try {
        if(op.grid[0].left.indexOf('%') !== -1) {
          x = parseInt(op.grid[0].left) * 0.01 * width
        } else {
          x = parseInt(op.grid[0].left)
        }
      } catch (e) {
        console.log(e);
      }


      return {x, y}
    },
    /**
     * 将echarts上一个点的像素坐标，转换为相对整个网页的坐标，方便dom操作
     * @param x
     * @param y
     * @returns {{x: *, y: *}} 对应坐标
     */
    getChartPagePixel({ x, y }) {
      const chart = this.mychart
      return { x: x + chart.getDom().offsetLeft, y: y + chart.getDom().offsetTop }
    },
    /**
     * 找到离value最近的点
     * @param value 随便一个值
     * @param arr 一个递增有序的数组
     * @returns {*} 返回一个数字
     */
    getAdjacentValue(value,arr){
      let minDiff=Number.MAX_VALUE;
      let index=-1;
      let temp=0;
      for(let i=0;i<arr.length;i++){
        temp=Math.abs(arr[i]-value);
        if(temp<=minDiff){
          index=i;
          minDiff=temp
        }
      }
      return arr[index];
    },
    /**
     * 获取x轴所有数据
     *
     BH客户端的数据我发现有两种写法
     第一种x轴的数据是在option.xAxis[0].data 这个数组里面保存，直接访问下表就是x轴的数据
     第二种是第一种的情况下没有数据，他的(x, y)数据是在option.series[0].data里面以二维数组的形式存储，访问下表是[x, y]数组坐标
     因此在进行下面的获取数据的操作时，要进行分别处理
     * @returns {*[]}
     */
    getXData() {
      const chart = this.mychart
      const option = chart.getOption()

      let xData = [] // 图表的x轴数据
      // 提取图表x轴的数据
      if(option.xAxis[0].data) { // 第一种情况适用
        xData = option.xAxis[0].data
      } else { // 第二种情况
        for(let d of option.series[0].data) {
          xData.push(d[0])
        }
      }
      return xData
    },
    /**
     * 获取x轴最大值处的值
     */
    getXMaxValue() {
      const chart = this.mychart
      const option = chart.getOption()
      const endValue = option.dataZoom[0].endValue // 获取x轴的最大值
      let value = 0
      // 设置input框的默认值
      if(option.xAxis[0].type == 'value') { // 第一种情况适用
        value = endValue
      } else { // 第二种情况
        value = option.xAxis[0].data[endValue]
      }
      return Number(value).toFixed(this.xMaxFixedNum);
    },
    /**
     * 给div绑定以下事件
     * input获取焦点事件
     * input单击事件
     * input双击事件
     * input焦点离开事件
     * @param oDiv input实例
     * @param inputDefaultValue input框默认值函数
     */
    inputBindEvent(oDiv, inputDefaultValue) {
      const chart = this.mychart

      // 设置input框的默认值
      oDiv.value = inputDefaultValue
      oDiv.onfocus = function() { // 监听input获取焦点事件
        this.style.opacity = 1
      }

      oDiv.onkeydown = function(event) {
        if(event.key === 'Enter') {
          // console.log('回车')
          this.blur()
          // this.style.opacity = 1
        }
      }
    },

    /**
     * 创建一个input
     * @param name 唯一的一个名字，用来区分这个chart上的input
     * @returns {HTMLElement} 返回创建好的实例
     */
    createInput(name) {
      let oDiv
      // 如果没有input框实例，则创建，有直接获取
      if(!this['input_'+name]) { // 没有maxInputElement实例
        oDiv = document.createElement('input')
        oDiv.autocomplete = "off"
        oDiv.style = 'width: 50px;opacity: 0;font-size: 10px;cursor: pointer;position: absolute;top:0;left:0;'
        oDiv.id = 'input_max_' + Math.random()
        this['input_'+name] = oDiv.id
        // console.log('happen -> dom', this.mychart.getZr().dom)
        // document.getElementById(chartId).parentElement.appendChild(oDiv)
        this.mychart.getZr().dom.parentElement.appendChild(oDiv) // 将input框放到mycharts实例里面
      } else {
        oDiv = document.getElementById(this['input_'+name])
      }
      return oDiv
    },
    // 隐藏所有的input框，让所有框失去焦点
    hideAllInput() {
      let inputs = document.querySelectorAll("[id^='input_']") // 获取以固定字符开头的控件id
      for(let input of inputs) {
        input.blur()
      }
    },

    /**
     * 创建并刷新x轴最大值input框的位置，返回input框实例
     * @returns {HTMLElement}
     */
    resizeXMaxInput() {
      const params = this.maxInputMixin ? this.maxInputMixin : {}
      const offsetX = params.offsetX ? params.offsetX : 0
      const offsetY = params.offsetY ? params.offsetY : 5
      let oDiv = this.createInput("xMaxInput") // 创建x轴最大值input框
      let { x, y } = this.getChartPagePixel(this.getRightBottomPixel())

      x = x - oDiv.clientWidth / 2 + offsetX
      y = y - oDiv.clientHeight / 2 + offsetY
      oDiv.className = 'graph-input'
      oDiv.style.position = 'absolute'
      oDiv.style.left = x + 'px'
      oDiv.style.top = y + 'px'
      return oDiv
    },
    // resizeXMaxTool() {
    //   const params = this.maxInputMixin ? this.maxInputMixin : {}
    //   const offsetX = params.offsetX ? params.offsetX : 0
    //   const offsetY = params.offsetY ? params.offsetY : 5
    //   let oDiv = this.createInput("xMaxTool") // 创建x轴最大值input框
    //   let { x, y } = this.getChartPagePixel(this.getRightBottomPixel())
    //
    //   oDiv.innerHTML = "设置坐标轴数值";
    //
    //   x = x - oDiv.clientWidth / 2 + offsetX
    //   y = y + offsetY
    //   oDiv.className = 'graph-tool'
    //   oDiv.style.position = 'absolute'
    //   oDiv.style.backgroundColor = '#fff';
    //   oDiv.style.border = '1px solid #ccc';
    //   oDiv.style.borderRadius = '4px';
    //   oDiv.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
    //   oDiv.style.left = x + 'px'
    //   oDiv.style.top = y + 'px'
    //   return oDiv
    // },

    /**
     * 创建并刷新Y轴最大值input框的位置，返回input框实例
     * @returns {HTMLElement}
     */
    resizeYMaxInput() {
      const params = this.maxYInputMixin || {}
      const offsetX = params.offsetX || 0
      const offsetY = params.offsetY || 0
      let oDiv = this.createInput("yMaxInput") // 创建y轴最大值input框
      let { x, y } = this.getChartPagePixel(this.getLeftTopPixel())

      x = x - oDiv.clientWidth / 4 * 3 + offsetX
      y = y - oDiv.clientHeight / 2 + offsetY
      oDiv.className = 'graph-input'
      oDiv.style.position = 'absolute'
      oDiv.style.left = x + 'px'
      oDiv.style.top = y + 'px'
      return oDiv
    },

    /**
     * 创建并刷新Y轴最小值input框的位置，返回input框实例
     * @returns {HTMLElement}
     */
    resizeYMinInput() {
      //const params = this.minYInputMixin ? this.minYInputMixin : {}
      const params = this.minYInputMixin || {}
      const offsetX = params.offsetX ? params.offsetX : 0
      const offsetY = params.offsetY ? params.offsetY : 0
      let oDiv = this.createInput("yMinInput") // 创建x轴最大值input框
      let { x, y } = this.getChartPagePixel(this.getLeftBottomPixel())

      x = x - oDiv.clientWidth / 4 * 3 + offsetX
      y = y - oDiv.clientHeight / 2 + offsetY

      oDiv.className = 'graph-input'
      oDiv.style.position = 'absolute'
      oDiv.style.left = x + 'px'
      oDiv.style.top = y + 'px'
      return oDiv
    },

    /**创建一个提示框**/
    createDomElement() {
      // 创建一个 DOM 元素
      let tip = document.createElement('div');
      tip.textContent = this.translateText("chart.textMap.","输入字符非法，请重新输入");
      tip.style.position = 'absolute';
      tip.style.top = '50%';
      tip.style.left = '50%';
      tip.style.transform = 'translate(-50%, -50%)';
      tip.style.width = '200px';
      tip.style.height = '50px';
      tip.style.color = '#696B6F';
      tip.style.backgroundColor = '#ffffff';
      tip.style.lineHeight = '50px';
      tip.style.textAlign = 'center';
      tip.style.zIndex = '3';

      // 将 DOM 元素添加到文档中
      document.body.appendChild(tip);

      // 保存引用，以便后续可以移除
      this.domElement = tip;

      // 2 秒后销毁 DOM 元素
      setTimeout(() => {
        if (this.domElement) {
          document.body.removeChild(this.domElement);
          this.domElement = null;
        }
      }, 2000);
    },

    /**
     * 初始化X轴最大值
     */
    initXMaxInput() {
      const chart = this.mychart
      const xMaxInput = this.resizeXMaxInput() // 绘制input框
      console.log(111111111)
      // 初始化X轴最大值 绑定事件
      let xMaxVal = this.getXMaxValue();
      this.inputBindEvent(xMaxInput, xMaxVal)
      const that = this
      const content = this.contentXmax;
      xMaxInput.onmouseover = (event) => {
        // 创建提示框
        event.stopPropagation() // 阻止事件的冒泡
        event.preventDefault() // 阻止默认事件的方法
        const tooltipDiv = document.createElement('div');
        tooltipDiv.id = 'uniqueTooltipId';
        tooltipDiv.textContent = this.contentXmax; // 提示框内容
        tooltipDiv.style.position = 'absolute';
        tooltipDiv.style.left = event.pageX + 5 + 'px'; // 根据鼠标位置定位
        tooltipDiv.style.top = event.pageY + 5 + 'px';
        tooltipDiv.style.padding = '4px';
        tooltipDiv.style.marginRight = '5px';
        tooltipDiv.style.backgroundColor = '#2d2d32';
        tooltipDiv.style.color = '#fff';
        tooltipDiv.style.fontSize = '14px';
        tooltipDiv.style.fontFamily = '微软雅黑';
        tooltipDiv.style.borderRadius = '10px';
        tooltipDiv.style.zIndex = '1000'; // 确保提示框在最上层
        document.body.appendChild(tooltipDiv);

      };
      xMaxInput.onmouseout = function() {
        const tooltipDiv = document.getElementById('uniqueTooltipId');
        document.body.removeChild(tooltipDiv);
      };

      xMaxInput.onclick = function(event) {
        event.stopPropagation() // 阻止事件的冒泡
        event.preventDefault() // 阻止默认事件的方法
        xMaxInput.value = that.getXMaxValue()
        this.style.opacity = 1
      }
      xMaxInput.ondblclick = xMaxInput.onclick
      xMaxInput.onblur = function() { // 监听input离开焦点事件
        this.style.opacity = 0 // 这里为0
        const value = that.getAdjacentValue(this.value,that.getXData()) // 获取input框中的数值，并且找数轴上相邻的
        this.value = Number(value).toFixed(that.xMaxFixedNum)
        if (isNaN(this.value)){
          that.createDomElement()
          return;
        }
        // 手动触发 dataZoom 动作
        chart.dispatchAction({
          type: 'dataZoom',
          xAxisIndex: 0,
          startValue: chart.getModel().getComponent('xAxis').axis.scale._extent[0],
          endValue: '' + value
        });

      }
      // chart进行缩放以后，刷新input框中的值
      chart.on('datazoom', () => {
        // console.log("happen->option ", chart.getOption())
        xMaxInput.value = this.getXMaxValue()
      })

    },
    /**
     * 在细化，更改时间范围也就是刷新数据的时候，进行最大值最小值框的保留更改
     * 需要在commonMixin.js中的setChartAfter中执行
     */
    refreshMinMax() {
      const chart = this.mychart
      // 如果是趋势图，那么增加刷新数据保持不变
      if(this.typename === "趋势图") {
        if(this.firstEnter) {
          // 如果是第一次加载趋势图的话，那么直接初始化趋势图
          var rangeY = chart.getModel().getComponent('yAxis').axis.scale._extent;
          this.yMaxInputDom.value = rangeY[1]
          this.yMinInputDom.value = rangeY[0]
          // 不是细化，那么全部去掉最大值最小值
          console.log("happen->refreshMinMax", "不是细化")
          const option = {
            yAxis: [{
              min: null,
              max: null,
            }],
          }
          chart.setOption(option)
          this.firstEnter = false
        } else {
          // console.log("happen->需要锁定了 this.yMaxInputUsed", this.yMaxInputUsed, this.yMinInputUsed)
          if(this.yMaxInputUsed) {
            this.yMaxInputDom && this.yMaxInputDom.focus()
            this.yMaxInputDom && this.yMaxInputDom.blur()
          }
          if(this.yMinInputUsed) {
            this.yMinInputDom && this.yMinInputDom.focus()
            this.yMinInputDom && this.yMinInputDom.blur()
          }
        }

      }

      return
      // 初始化Y轴最大值 绑定事件
      if(this.$store.state.endTime === '' && this.typename === "趋势图") {
        console.log("happen->refreshMinMax", "细化")
        // 进行细化，需要保留
        // 触发input框中的值
        this.yMaxInputDom && this.yMaxInputDom.focus()
        this.yMaxInputDom && this.yMaxInputDom.blur()

        this.yMinInputDom && this.yMinInputDom.focus()
        this.yMinInputDom && this.yMinInputDom.blur()
      } else {
        var rangeY = chart.getModel().getComponent('yAxis').axis.scale._extent;
        this.yMaxInputDom.value = rangeY[1]
        this.yMinInputDom.value = rangeY[0]
        // 不是细化，那么全部去掉最大值最小值
        console.log("happen->refreshMinMax", "不是细化")
        const option = {
          yAxis: [{
            min: null,
            max: null,
          }],
        }
        chart.setOption(option)
      }

    },
    /**
     * 初始化Y轴最大值
     */
    initYMaxInput() {
      const that = this
      const chart = this.mychart
      const yMaxInput = this.resizeYMaxInput() // 绘制input框
      const content = this.contentYmax;
      this.yMaxInputDom = yMaxInput
      // 初始化Y轴最大值 绑定事件
      var rangeY = chart.getModel().getComponent('yAxis').axis.scale._extent;
      this.inputBindEvent(yMaxInput, rangeY[1])
      yMaxInput.onmouseover = (event) => {
        // 创建提示框
        event.stopPropagation() // 阻止事件的冒泡
        event.preventDefault() // 阻止默认事件的方法
        const tooltipDiv = document.createElement('div');
        tooltipDiv.id = 'uniqueTooltipId';
        tooltipDiv.textContent = this.contentYmax; // 提示框内容
        tooltipDiv.style.position = 'absolute';
        tooltipDiv.style.left = event.pageX + 5 + 'px'; // 根据鼠标位置定位
        tooltipDiv.style.top = event.pageY + 5 + 'px';
        tooltipDiv.style.padding = '4px';
        tooltipDiv.style.marginRight = '5px';
        tooltipDiv.style.backgroundColor = '#2d2d32';
        tooltipDiv.style.color = '#fff';
        tooltipDiv.style.fontSize = '14px';
        tooltipDiv.style.fontFamily = '微软雅黑';
        tooltipDiv.style.borderRadius = '10px';
        tooltipDiv.style.zIndex = '1000'; // 确保提示框在最上层
        document.body.appendChild(tooltipDiv);

      };

      yMaxInput.onmouseout = function() {
        const tooltipDiv = document.getElementById('uniqueTooltipId');
        document.body.removeChild(tooltipDiv);
      };
      yMaxInput.onclick = function(event) {
        event.stopPropagation() // 阻止事件的冒泡
        event.preventDefault() // 阻止默认事件的方法
        yMaxInput.value = that.mychart.getModel().getComponent('yAxis').axis.scale._extent[1];
        this.style.opacity = 1
        return false
      }
      yMaxInput.ondblclick = yMaxInput.onclick

      yMaxInput.onblur = function() { // 监听input离开焦点事件
        that.yMaxInputUsed = true
        this.style.opacity = 0 // 这里为0
        //let value = this.getAdjacentValue(this.value,that.getYData()) // 获取input框中的数值，并且找数轴上相邻的
        // if(!value) {
        //   value = null
        // }
        //this.value = ''
        let min = that.mychart.getModel().getComponent('yAxis').axis.scale._extent[0];
        let max = this.value
        // // console.log("happen->min max", chart.getOption().yAxis[0].min, value)
        // console.log("happen->min max开始：", min, max)
        if (isNaN(this.value)){
          that.createDomElement()
          return;
        }
        if(min && max && min > max) {
          let t = min
          min = max
          max = t
        }
        //console.log("happen->min max", min, max)
        const option = {
          yAxis: [{
            min,
            max
          }],
        }
        chart.setOption(option)
      }

      // chart进行缩放以后，刷新input框中的值
      // chart.on('datazoom', () => {
      //   var rangeY = chart.getModel().getComponent('yAxis').axis.scale._extent;
      //   yMaxInput.value=rangeY[1]
      //   const option = {
      //     yAxis: [{
      //       max: null
      //     }],
      //   }
      //   chart.setOption(option)
      // })
    },

    /**
     * 初始化Y轴最小值
     */
    initYMinInput() {
      const that = this
      const chart = this.mychart
      const YMinInput = this.resizeYMinInput() // 绘制input框
      this.yMinInputDom = YMinInput
      // 初始化Y轴最大值 绑定事件
      var rangeY = chart.getModel().getComponent('yAxis').axis.scale._extent;
      this.inputBindEvent(YMinInput, rangeY[0])
      // 如果原本的y轴是从0开始的，那么初始化最小值以后还从0开始
      let chartDefaultMinValue = null
      if(chart.getOption().yAxis[0].min === 0) {
        /**
         * 图表默认Max值
         */
        chartDefaultMinValue = 0
        // console.log("happen->chartDefaultMinValue", chartDefaultMinValue)
      }
      // console.log("happen->option", chart.getOption().yAxis[0])

      YMinInput.onmouseover = (event) => {
        // 创建提示框
        event.stopPropagation() // 阻止事件的冒泡
        event.preventDefault() // 阻止默认事件的方法
        const tooltipDiv = document.createElement('div');
        tooltipDiv.id = 'uniqueTooltipId';
        tooltipDiv.textContent = this.contentYmin; // 提示框内容
        tooltipDiv.style.position = 'absolute';
        tooltipDiv.style.left = event.pageX + 5 + 'px'; // 根据鼠标位置定位
        tooltipDiv.style.top = event.pageY + 5 + 'px';
        tooltipDiv.style.padding = '4px';
        tooltipDiv.style.marginRight = '5px';
        tooltipDiv.style.backgroundColor = '#2d2d32';
        tooltipDiv.style.color = '#fff';
        tooltipDiv.style.fontSize = '14px';
        tooltipDiv.style.fontFamily = '微软雅黑';
        tooltipDiv.style.borderRadius = '10px';
        tooltipDiv.style.zIndex = '1000'; // 确保提示框在最上层
        document.body.appendChild(tooltipDiv);

      };

      YMinInput.onmouseout = function() {
        const tooltipDiv = document.getElementById('uniqueTooltipId');
        document.body.removeChild(tooltipDiv);
      };

      YMinInput.onclick = function(event) {
        event.stopPropagation() // 阻止事件的冒泡
        event.preventDefault() // 阻止默认事件的方法
        YMinInput.value = that.mychart.getModel().getComponent('yAxis').axis.scale._extent[0];
        this.style.opacity = 1
        return false
      }
      YMinInput.ondblclick = YMinInput.onclick

      YMinInput.onblur = function() { // 监听input离开焦点事件
        that.yMinInputUsed = true
        this.style.opacity = 0 // 这里为0
        // let value = this.value // 获取input框中的数值，并且找数轴上相邻的
        // if(!value) {
        //   value = chartDefaultMinValue
        // }
        // this.value = '' // input框设置为空
        rangeY = chart.getModel().getComponent('yAxis').axis.scale._extent;
        if (isNaN(this.value)){
          that.createDomElement()
          return;
        }
        let min = Number(this.value)
        let max = Number(rangeY[1])

        if(min && max && min > max) {
          let t = min
          min = max
          max = t
        }
        const option = {
          yAxis: [{
            min,
            max
          }],
        }
        chart.setOption(option)
      }
      // chart进行缩放以后，刷新input框中的值
      // chart.on('datazoom', () => {
      //   var rangeY = chart.getModel().getComponent('yAxis').axis.scale._extent;
      //   YMinInput.value=rangeY[0]
      //   const option = {
      //     yAxis: [{
      //       min: chartDefaultMinValue
      //     }],
      //   }
      //   // debugger
      //   chart.setOption(option)
      // })
    },


    /**
     * 刷新所有input框的位置
     * 外部可以调用
     * @returns {HTMLElement}
     */
    resizeMaxInput() {
      const maxXInputMixin = {show: true, ...this.maxXInputMixin}
      const maxYInputMixin = {show: true, ...this.maxYInputMixin}
      const minYInputMixin = {show: true, ...this.minYInputMixin}

      if(maxXInputMixin.show) this.resizeXMaxInput();
      if(maxYInputMixin.show) this.resizeYMaxInput();
      if(minYInputMixin.show) this.resizeYMinInput();
    },


    /**
     * 初始化所有input框并绑定事件
     * 外部可以调用
     */
    initMaxInput() {
      const maxXInputMixin = {show: true, ...this.maxXInputMixin}
      const maxYInputMixin = {show: true, ...this.maxYInputMixin}
      const minYInputMixin = {show: true, ...this.minYInputMixin}

      // const maxXInputMixin = this.maxXInputMixin ? this.maxXInputMixin : {show: true}
      // const maxYInputMixin = this.maxYInputMixin ? this.maxYInputMixin : {show: true}
      // const minYInputMixin = this.minYInputMixin ? this.minYInputMixin : {show: true}
      if(maxXInputMixin.show) this.initXMaxInput()
      if(maxYInputMixin.show) this.initYMaxInput()
      if(minYInputMixin.show) this.initYMinInput()
    },
  }
}

export default maxInputMixin
