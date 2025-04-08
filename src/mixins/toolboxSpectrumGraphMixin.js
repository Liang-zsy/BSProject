import {number} from "echarts/lib/export";
import _ from 'lodash'

const toolboxSpectrumGraphMixin = {
  data() {
    return {
      myclearIcon: 'M226.5,51.8h93.8v125.6h159.1v105H70.9V177.2h155.6V51.8z M102.6,282.1L64.5,484.5h419.9l-35.5-202 M197.7,368.7v115.8 M355.1,484.5V368.7',
      PrimarySecondary: {
        icon: 'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M4.4,3.9V10 M7,3.9V10\n' +
          '\t M9.5,3.9V10',
        //icon: 'M546.2,545.8H3 M120.7,39.2v50.9 M120.7,265.3v50.9 M120.7,378.3v50.9 M120.7,491.4v50.9 M96.4,77.8h48.7 M120.7,152.2v50.9 M275.5,152.2v50.9 M275.5,265.3v50.9 M275.5,378.3v50.9 M275.5,491.4v50.9 M253.2,77.8h44.7 M275.5,39.2v50.9 M430.4,152.2v50.9 M430.4,265.3v50.9 M430.4,378.3v50.9 M430.4,491.4v50.9 M408.1,77.8h44.7 M430.4,39.2v50.9',
        secondaryIcon: 'M53.1,484.5h458 M157.9,37.5v26 M135.5,60.7h44.7 M157.9,86v29.9 M157.9,138.4v29.9 M157.9,190.7v29.9 M157.9,243.1V273 M157.9,295.5v29.9 M157.9,347.9v29.9 M157.9,400.3v29.9 M157.9,452.7v29.9 M282.1,37.5v26 M259.8,60.7h44.7 M282.1,86v29.9 M282.1,138.4v29.9 M282.1,190.7v29.9 M282.1,243.1V273 M282.1,295.5v29.9 M282.1,347.9v29.9 M282.1,400.3v29.9 M282.1,452.7v29.9 M406.4,37.5v26 M384,60.7h44.7 M406.4,86v29.9 M406.4,138.4v29.9 M406.4,190.7v29.9 M406.4,243.1V273 M406.4,295.5v29.9 M406.4,347.9v29.9 M406.4,400.3v29.9 M406.4,452.7v29.9',
        primaryIcon: 'M53.1,484.5h458.1 M157.9,37.5v447 M135.5,61.7h44.8 M282.1,37.5v447 M259.8,61.7h44.7 M406.4,37.5v447 M384,61.7h44.8',
        isMark: true, // 主游标
      },
      // 边频
      sidebandFamily: {
        icon: 'M13.5,7c0,3.7-2.9,6.5-6.5,6.5S0.5,10.6,0.5,7c0-3.7,2.9-6.5,6.5-6.5S13.5,3.3,13.5,7z M3.1,3.3v7.6 M5.5,4.3\n' +
          'v6.6 M3.1,10.9h7.7 M7.9,4.3v1.2 M8,7v1.2 M7.9,9.7v1.2 M10.3,4.3v1.2 M10.4,7v1.2 M10.3,9.7v1.2 M4,9.7l1.6-3.4 M7.7,8.6L5.5,6.2\n' +
          'M8.3,8.7l1.8-2.2 M3.8,9.7c-0.2,0-0.4,0.2-0.4,0.4s0.2,0.4,0.4,0.4s0.4-0.2,0.4-0.4S4,9.7,3.8,9.7z M5.5,5.8C5.3,5.8,5.1,6,5.1,6.2\n' +
          'c0,0.2,0.2,0.4,0.4,0.4s0.4-0.2,0.4-0.4C5.9,6,5.7,5.8,5.5,5.8z M8,8.6C7.8,8.6,7.6,8.7,7.6,9S7.8,9.4,8,9.4S8.4,9.2,8.4,9\n' +
          'S8.2,8.6,8,8.6z M5.7,6C5.5,5.9,5.4,6,5.3,6.1C5.2,6.2,5.2,6.4,5.4,6.4c0.1,0.1,0.3,0.1,0.4-0.1C5.8,6.3,5.8,6.1,5.7,6z M5.6,6.1\n' +
          'c-0.1-0.1-0.2,0-0.2,0c-0.1,0.1,0,0.2,0,0.2c0.1,0.1,0.2,0,0.2,0C5.7,6.2,5.7,6.1,5.6,6.1z M5.6,6.2C5.5,6.1,5.5,6.2,5.6,6.2\n' +
          'c-0.1,0-0.1,0.1-0.1,0.1S5.5,6.3,5.6,6.2C5.6,6.2,5.6,6.2,5.6,6.2z M5.5,6.2C5.5,6.2,5.5,6.2,5.5,6.2C5.5,6.2,5.5,6.2,5.5,6.2\n' +
          'C5.5,6.3,5.5,6.3,5.5,6.2C5.6,6.2,5.6,6.2,5.5,6.2z M10.4,5.8C10.2,5.8,10,6,10,6.2c0,0.2,0.2,0.4,0.4,0.4s0.4-0.2,0.4-0.4\n' +
          'C10.8,6,10.6,5.8,10.4,5.8z\n',
        state: false,
      },
      inMainCursorLeft: null,
      last_xIndex: null,
    }
  },
  methods: {

    /**
     * 在图上画条线，lines是位置坐标
     * @update 更新日期 2022-09-23 10:25:11
     * @param lines 格式 [{ xAxis: 2022-01-25 10:26:14.069, lineStyle: { color: '#00ff00' } }, { xAxis: 2022-01-25 10:26:14.069 }]
     */
    drawLine(lines) {
      // console.log(lines)
      const data = lines
      let title = []
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let ydata = this.mychart.getOption().series[line.seriesNameIndex].data[line.xIndex]
        let yvalue = 0
        if (Array.isArray(ydata)) {
          yvalue = ydata[1]
        } else {
          yvalue = ydata
        }
        let xAxisValue = parseFloat(line.xAxis).toFixed(2);
        let yAxisValue = parseFloat(yvalue).toFixed(2);
        if(line.id == 'Main-Cursor'){
          title.push({
            id: 'Main-Cursor',
            text: '[' + this.translateText('chart.textMap.','主游标')+': ' + xAxisValue+", "+yAxisValue + ']',
          })
          if(this.mainCursor != undefined){
            this.mainCursor = xAxisValue+", "+yAxisValue + ']'
          }
        }else if(line.id == 'Auxiliary-Cursor'){
          title.push({
            id: 'Auxiliary-Cursor',
            text: '[' + this.translateText('chart.textMap.','辅游标')+': ' + xAxisValue+", "+yAxisValue + ']',
          })
          if(this.auxiliaryCursor != undefined){
            this.auxiliaryCursor = xAxisValue+", "+yAxisValue + ']'
          }
        }
      }
      const option = {
        series: [],
        title
      }
      option.series[0] = {
        type: 'line',
        markLine: {
          lineStyle: {
            color: this.$store.state.textcolor,
            // color: 'rgba(255,255,255,0.2)',
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
     * 画主辅游标-专门针对频谱图进行了优化 drawLinePrimarySecondary
     * 因为之前的画两条线的函数不需要了，所以直接用这个代替画两条线的函数drawLineAndProLine
     * 就可以实现主辅游标的功能了
     * @param line x轴下标
     * @param seriesNameIndex series标号
     * @param x x的实际下标
     * @param yIndex y的实际下标
     */
    drawLineAndProLine(line, seriesNameIndex, param, isMark= null,x, yIndex) {
      console.log("happen->draw", line, seriesNameIndex, x, yIndex)
      const chart = this.mychart
      //获取当前图表的option
      const op = chart.getOption();

      // console.log("happen->趋势图:", line, seriesNameIndex, x, yIndex)
      // 进行处理

      //-------------------------------寻找点击的距离最近的点---------------------------------------------
      // 进行寻找离鼠标最近距离的一个点来进行标注
      // let xName // x轴的值
      // let y // y轴的值
      // let searchRange = 25;
      // let seriesIndex = seriesNameIndex
      // let nowPointPixel = chart.convertToPixel({seriesIndex: seriesNameIndex}, [x, yIndex])
      //
      // let minDis = 99999999;
      // let minX = 0;
      // for(let i = x - searchRange; i < x + searchRange; i++) {
      //   if(i <= 0) continue
      //   let tx = i
      //   let ty = chart.getOption().series[seriesIndex].data[i]
      //
      //
      //   // 将图上的坐标，转换为真实的像素值，然后寻找离点击鼠标最近的距离的点
      //   let pointPixel = chart.convertToPixel({seriesIndex: seriesNameIndex}, [tx, ty]); //{seriesNameIndex: 0, x: 64, xName: '99.84', y: 12.4}
      //
      //   let dis = (nowPointPixel[0] - pointPixel[0]) * (nowPointPixel[0] - pointPixel[0]) + (nowPointPixel[1] - pointPixel[1]) * (nowPointPixel[1] - pointPixel[1])
      //   if(dis < minDis) {
      //     minDis = dis
      //     minX = tx;
      //     // console.log(minDis, minX)
      //   }
      // }
      // x = minX
      // y = chart.getOption().series[seriesIndex].data[minX] // 获取这个点对应的y值
      // xName = '' + chart.getOption().xAxis[0].data[minX]
      // line = xName
      //----------------------------------------------------------------------------

      // console.log('happen->x, y: ', x, y, xName)


      // console.log(`初始点：${nowPointPixel}，获取到的点下标：${minX},像素${chart.convertToPixel({seriesIndex: seriesNameIndex}, [x, y])}`)



      if(this.PrimarySecondary.isMark) {
        this.PrimaryLine = line
        this.PrimaryLineParam = param
        this.PrimaryLineSeriesNameIndex = seriesNameIndex
      } else {
        this.SecondaryLine = line
        this.SecondaryLineParam = param
        this.SecondaryLineSeriesNameIndex = seriesNameIndex
      }
      let lines = []
      if(this.PrimaryLine !== null && this.PrimaryLine !== '') {
        lines.push({
          id: 'Main-Cursor',
          xAxis: '' + this.PrimaryLine,
          lineStyle: {
            type: 'solid',
             color: this.$store.state.primarySecondaryColor[0]
          },
          xIndex: this.PrimaryLineParam.xIndex, // 记录x轴的索引，方便游标同步的时候计算y轴的值
          seriesNameIndex: this.PrimaryLineSeriesNameIndex
        })
      }
      if(this.SecondaryLine !== null && this.SecondaryLine !== '') {
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
      this.PrimarySecondary.preLines = lines
      this.drawLine(lines)

      // 画主辅游标的时候，如果边频的状态是开着的，那么进行刷新
      try {
        this.inMainCursorLeft = this.PrimaryLineParam.xIndex > this.SecondaryLineParam.xIndex ? true : false;
      }catch(e){}
      if(this.sidebandFamilyFun) {
        this.sidebandFamilyFun()
      }
    },

    sidebandFamilyFunEventBind(){
      let isDragging = false;
      let option;
      let that = this;
      let selectedMarkLineIndex;
      that.mychart.getZr().on('mousedown', function (event) {
        if(!that.sidebandFamily.state) {
          return
        }

        let pointInGrid = that.mychart.convertFromPixel({ seriesIndex: 0 }, [event.offsetX, 0]);

        if (pointInGrid && !isNaN(pointInGrid[0])) {
          option = that.mychart.getOption();
          console.log("dafasdfasdfasd",option)
          let minDistance = Number.MAX_VALUE;
          let nearestMarkLineIndex = -1;

          // 遍历所有 markLine
          option.series[0].markLine.data.forEach((currentMarkLine, currentIndex) => {
            const currentMarkLine_xIndex = currentMarkLine.xIndex; // 获取 markLine 的 X 坐标
            const distance = Math.abs(currentMarkLine_xIndex - pointInGrid[0]); // 计算点击位置与 markLine 的距离

            // 如果当前 markLine 是最近的，更新最小距离和索引
            if (distance < minDistance) {
              minDistance = distance;
              nearestMarkLineIndex = currentIndex;
            }
          });
          selectedMarkLineIndex = nearestMarkLineIndex;
          let markLineX = option.series[0].markLine.data[nearestMarkLineIndex].xIndex;
          let tolerance = (option.xAxis[0].max - option.xAxis[0].min) * 0.02; // 2% 误差
          if (Math.abs(markLineX - pointInGrid[0]) < tolerance) {
            if(selectedMarkLineIndex != 0 && markLineX != that.PrimaryLineParam.xIndex) {
              that.last_xIndex = markLineX;
            }
            isDragging = true;
          }
        }
      });

      // **鼠标移动，更新 markLine 位置**
      that.mychart.getZr().on('mousemove', _.throttle(function (event) {
        if (isDragging) {
          let pointInGrid = that.mychart.convertFromPixel({ seriesIndex: 0 }, [event.offsetX, 0]);

          if (pointInGrid && !isNaN(pointInGrid[0])) {
            let markLineX = Math.max(option.xAxis[0].min, Math.min(option.xAxis[0].max, pointInGrid[0]));
            let distance = markLineX - option.series[0].markLine.data[0].xIndex;

            // **更新 markLine**
            option.series[0].markLine.data[selectedMarkLineIndex].xIndex = markLineX;
            option.series[0].markLine.data[selectedMarkLineIndex].xAxis = String(option.xAxis[0].data[markLineX]);
            console.log("asdfasdfasdf",option)
            if(option.series[0].markLine.data[selectedMarkLineIndex].hasOwnProperty("id") && option.series[0].markLine.data[selectedMarkLineIndex].id === 'Main-Cursor') {
              that.PrimaryLine = String(option.xAxis[0].data[markLineX]);
              that.PrimaryLineParam.xIndex = markLineX;
              that.SecondaryLineParam.xIndex += distance;
              that.SecondaryLine = String(option.xAxis[0].data[that.SecondaryLineParam.xIndex]);
            }else{
              let pos = Math.abs(option.series[0].markLine.data[selectedMarkLineIndex].label.pos);

              let dis = parseInt(Math.abs(that.PrimaryLineParam.xIndex - markLineX) / pos);

              let secondaryIndex;

              if((markLineX-that.PrimaryLineParam.xIndex)*(that.PrimaryLineParam.xIndex - that.last_xIndex) > 0 ){
                that.inMainCursorLeft = !that.inMainCursorLeft;
                that.last_xIndex = markLineX;
              }

              if(that.inMainCursorLeft){
                secondaryIndex = that.PrimaryLineParam.xIndex - dis;
              }else{
                secondaryIndex = that.PrimaryLineParam.xIndex + dis;
              }

              secondaryIndex = parseInt(Math.max(0, Math.min(option.xAxis[0].data.length - 1, secondaryIndex)));

              that.SecondaryLineParam.xIndex = secondaryIndex;
              that.SecondaryLine = String(option.xAxis[0].data[secondaryIndex]);
            }
            that.sidebandFamilyFun();
            that.xAxisSub(that.PrimaryLine, that.SecondaryLine)
          }
        }
      },50));

      // **鼠标松开，停止拖动**
      that.mychart.getZr().on('mouseup', function (event) {

        isDragging = false;
      });
    },

    /**
     * 边频
     */
    sidebandFamilyFun() {
      if(!this.sidebandFamily.state) {
        return
      }
      if(!this.PrimaryLine || !this.SecondaryLine) {
        return
      }

      let sub = Math.abs(parseFloat(this.PrimaryLine) - parseFloat(this.SecondaryLine))

      let lines = []
      // 主游标
      if(this.PrimaryLine !== null && this.PrimaryLine !== '') {
        lines.push({
          id: 'Main-Cursor',
          xAxis: '' + this.PrimaryLine,
          lineStyle: {
            type: 'solid',
             color: this.$store.state.primarySecondaryColor[0]
          },
          label: {
            show: true,
             color: this.$store.state.primarySecondaryColor[0],
            distance: -15,
            formatter:(params)=>{
              return parseFloat(params.value).toFixed(2)  + (this.changeX.state == 'Hz' ? '' : 'X')
            }
          },
          xIndex: this.PrimaryLineParam.xIndex, // 记录x轴的索引，方便游标同步的时候计算y轴的值
          seriesNameIndex: this.PrimaryLineSeriesNameIndex
        })
      }

      let xData = this.mychart.getOption().xAxis[0].data
      let findPos = -15;
      for(const [i, x] of xData.entries()) {
        if(findPos === 0) {
          findPos++
          continue
        } // 跳过主轴
        let needXAxis = parseFloat(this.PrimaryLine) + sub * findPos
        // console.log("happen->needXAxis", needXAxis)
        if(needXAxis <= 0 || needXAxis > parseFloat(xData[xData.length - 1])) {
          findPos++
          continue
        }
        // 遍历主轴从左边的数据，找到需要的needXAxis
        if(findPos < 0 && parseFloat(x) > needXAxis) {
          let line = {
            xAxis: '' + x,
              lineStyle: { color: this.$store.state.primarySecondaryColor[1] },
            label: {
              show: true,
                color: this.$store.state.primarySecondaryColor[1],
                distance: -15,
                formatter:(params)=>{
                return parseFloat(params.value).toFixed(2)  + (this.changeX.state == 'Hz' ? '' : 'X')
              },
                pos: findPos
            },
            xIndex: i,
              seriesNameIndex: 0
          }
          if(this.inMainCursorLeft && findPos == -1) {
            line.id = 'Auxiliary-Cursor'
          }
          lines.push(line)
          findPos = findPos + 1
        }
        if(findPos > 0 && parseFloat(x) > needXAxis) {
          let line = {
            xAxis: '' + x,
            lineStyle: { color: this.$store.state.primarySecondaryColor[1] },
            label: {
              show: true,
              color: this.$store.state.primarySecondaryColor[1],
              distance: -15,
              formatter:(params)=>{
                return parseFloat(params.value).toFixed(2)  + (this.changeX.state == 'Hz' ? '' : 'X')
              },
              pos: findPos
            },
            xIndex: i,
            seriesNameIndex: 0
          }
          if(!this.inMainCursorLeft && findPos == 1) {
            line.id = 'Auxiliary-Cursor';
          }
          lines.push(line)
          findPos = findPos + 1
        }
        if(findPos > 15) break
      }
      console.log("happen->lines", lines)

      // // 左边
      // for(let i = 1; i < 15; i++) {
      //   console.log("happen->左边", this.PrimaryLine - sub * i)
      //
      //   lines.push({xAxis: '' + (this.PrimaryLine - sub * i), lineStyle: { color: this.$store.state.colorMap[1] }})
      // }
      // // 右边
      // for(let i = 1; i < 15; i++) {
      //   console.log("happen->右边", this.PrimaryLine + sub * i)
      //
      //   lines.push({xAxis: '' + (this.PrimaryLine + sub * i), lineStyle: { color: this.$store.state.colorMap[1] }})
      // }
      this.drawLine(lines)
    },

    /**
     * 返回HistoryToolbox的feature
     */
    getSpectrumGraphHistoryToolboxFeature() {
      return {
        myPrimarySecondary: { // 主副游标切换
          title: !this.PrimarySecondary.isMark ? this.translateText("chart.textMap.", "辅游标") : this.translateText("chart.textMap.", "主游标"),
          show: true,
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
              option.toolbox.feature.myPrimarySecondary.title = this.translateText("chart.textMap.", "辅游标")
              //
            } else {
              this.PrimarySecondary.isMark = true;
              option.toolbox.feature.myPrimarySecondary.iconStyle.borderColor = null
              option.toolbox.feature.myPrimarySecondary.title = this.translateText("chart.textMap.", "主游标")

            }
            this.mychart.setOption(option)
          }
        },
        mySidebandFamily: {
          title: this.translateText("chart.textMap.", "边频"),
          show:  this.$store.state.etype == 7, // 只在机泵有边频功能
          icon: this.sidebandFamily.icon,
          iconStyle: {
            borderColor: this.sidebandFamily.state ? '#74ACC8': null
          },
          onclick:  ()=>{

            if(!this.PrimaryLine || !this.SecondaryLine  || this.markLine.isResonance) {
              return
            }
            let option = {
              toolbox: {
                feature: {
                  mySidebandFamily: {
                    iconStyle: {
                      borderColor: '#74ACC8'
                    }
                  }
                }
              }
            }
            if(this.sidebandFamily.state) {
              // console.log('当前是标记状态下')
              option.toolbox.feature.mySidebandFamily.iconStyle.borderColor = null

              let lines = []
              if(this.PrimaryLine !== null && this.PrimaryLine !== '') {
                lines.push({
                  id: 'Main-Cursor',
                  xAxis: '' + this.PrimaryLine,
                  lineStyle: {
                    type: 'solid',
                     color: this.$store.state.primarySecondaryColor[0]
                  },
                  xIndex: this.PrimaryLineParam.xIndex, // 记录x轴的索引，方便游标同步的时候计算y轴的值
                  seriesNameIndex: this.PrimaryLineSeriesNameIndex
                })
              }
              if(this.SecondaryLine !== null && this.SecondaryLine !== '') {
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

              this.drawLine(lines)

              this.sidebandFamily.state = false;

            } else {
              this.sidebandFamily.state = true;

              if(this.mychart.getOption().toolbox[0].feature.dataZoom.iconStatus.zoom === "emphasis"){
                this.mychart.dispatchAction({
                  type: 'takeGlobalCursor',
                  key: 'dataZoomSelect',
                  dataZoomSelectActive: false // 设为 false 关闭缩放模式
                });
              }

              this.sidebandFamilyFun()

            }
            this.mychart.setOption(option)
          }
        },
        //暂时隐藏
        // myClearAll: {
        //   title: this.translateText("chart.textMap.",'清除'),
        //   icon: this.myclearIcon,
        //   show: false,
        //   onclick: () => {
        //     // 清除两条标线
        //     if(this.proLine) this.proLine = null // 上一条线下标
        //     if(this.PrimaryLine) this.PrimaryLine = null
        //     if(this.SecondaryLine) this.SecondaryLine = null
        //     if(this.proLineSeriesIndex) this.proLineSeriesIndex = null // 上一条线的seriesIndex
        //
        //     // console.log("开始清除")
        //     // console.log(this.subTitleData.index)
        //     const titles = this.mychart.getOption().title
        //     // 做一个值判断，如果定位错了，定位到了不是差量的副标题，则找下一个副标题
        //     // console.log(titles[this.subTitleData.index].text.search('差量'))
        //
        //     if (titles[this.subTitleData.index].text.indexOf('差量') != -1 || titles[this.subTitleData.index].text.indexOf('Offset') != -1){
        //         titles[this.subTitleData.index].text = ``
        //     }
        //     // if (titles[this.subTitleData.index].text.search('差量')<0){
        //     //   titles[this.subTitleData.index+1].text = ``
        //     // }else {
        //     //   titles[this.subTitleData.index].text = ``
        //     //
        //     // }
        //     let option = {
        //       title: titles,
        //       series: [
        //         {
        //           markLine: null,
        //         },
        //       ]
        //     }
        //
        //
        //     this.mychart.setOption(option)
        //   }
        // },
      }
    }
  }
}

export default toolboxSpectrumGraphMixin
