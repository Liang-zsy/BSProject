/**

给一个图谱加入一个更多的按钮，点击以后弹出一个下拉菜单，里面有一些原本工具箱的按钮，然后折叠到了这个里面


 使用方法：
 1. 修改 addFeature 函数就可以了，这个函数里面的代码就是下拉菜单里面的内容


加入这个功能影响到的代码：
 1. commonMixin.js 中调用this.createDropdownMenu();
 2. assets/GlobalCSS/basic.css中加入了一些样式
 3. toolboxMixin.js 中引入了这个混入


 */

const toolboxMoreMixin = {
  data() {
    return {
      showDropdown: false,
      dropdownPos: { x: 0, y: 0 },
      dropdownId: '',//创建的下拉菜单的id
      toolboxMoreNumber: 0,
      myOption: null,
      dataZoomSelectFlag: false,
    }
  },
  watch: {
    showDropdown(value) {
      var dropdownElement = document.getElementById(this.dropdownId);
      if (!dropdownElement) {
        return;
      }
      console.log('dropdownElement', this.dropdownId, dropdownElement)
      dropdownElement.style.display = value ? 'block' : 'none';
      this.changeToolTipShow();
    },
    '$route'() {
      this.showDropdown = false;
    },
  },
  beforeDestroy() {
    //组件销毁前将下拉菜单隐藏
    var dropdownElement = document.getElementById(this.dropdownId);
    if (!dropdownElement) {
      return;
    }
    console.log('dropdownElement', this.dropdownId, dropdownElement)
    dropdownElement.style.display = 'none';
  },
  mounted() {
    // console.log("这个图表的option", this.mychart.getOption())
    document.addEventListener('click', this.handleDocumentClick);

  },
  methods: {
    changeToolTipShow() {
      // 根据是否显示更多的下拉菜单来判断是否显示工具栏的提示文字
      this.myOption.toolbox.tooltip.show = !this.showDropdown;
      this.mychart.setOption(this.myOption);
    },
    handleDocumentClick(event) {
      // 如果点击的不是下拉菜单或自定义工具，那么隐藏下拉菜单
      if (event.target.id !== this.dropdownId && event.target.title !== '自定义工具') {
        this.showDropdown = false;
      }
    },
    createDropdownMenu() {
      if (this.dropdownId !== '') {
        // 已经创建过了, 删除原来的
        let tmp = document.getElementById(this.dropdownId);
        if(tmp) {
          tmp.remove();
        }
      }
      this.dropdownId = 'dropdown-' + Math.random().toString(36).substring(7);

      var dropdownElement = document.createElement('div');
      dropdownElement.id = this.dropdownId;
      dropdownElement.className = 'dropdown-content';

      this.addFeature(dropdownElement);


      document.body.appendChild(dropdownElement);

      if(this.zoomState) {
        this.selectDataZoom();
      }

    },

    addFeature(dropdownElement) {
      let chart = this.mychart
      console.log("happen->chart", chart, this.mychart)
      let op = chart.getOption()

      // 检测当前路由是否包含特定的路径
      const shouldIncludeSaveAsImage = this.$route.path.includes('OrbitOfShaftCenter1');

      let option = {
        toolbox: {
          showTitle: false, // 隐藏默认文字，否则两者位置会重叠
          feature: {
            myMore: {
              show: false,
              title: this.translateText("chart.textMap.", "更多"),
              icon: 'M13.4,7c0,3.6-2.9,6.4-6.4,6.4S0.6,10.5,0.6,7c0-3.6,2.9-6.4,6.4-6.4S13.4,3.4,13.4,7z M4.15,6.51\n' +
                '\tc-0.28,0-0.5,0.23-0.5,0.5c0,0.28,0.23,0.5,0.5,0.5s0.5-0.23,0.5-0.5C4.66,6.73,4.43,6.51,4.15,6.51z M7.16,6.53\n' +
                '\tc-0.28,0-0.5,0.23-0.5,0.5c0,0.28,0.23,0.5,0.5,0.5s0.5-0.23,0.5-0.5C7.67,6.76,7.44,6.53,7.16,6.53z M10.18,6.56\n' +
                '\tc-0.28,0-0.5,0.23-0.5,0.5s0.23,0.5,0.5,0.5s0.5-0.23,0.5-0.5S10.45,6.56,10.18,6.56z',
              //icon: 'M505,33.2H3 M505,37.2H3 M505,490.3H3 M505,486.3H3 M253.8,184.2H3 M253.8,188.2H3 M253.8,335.3H3 M253.8,339.3H3 M291.7,185l71.5,54c1.2,1,0.9,0.9,2.1-0.1l73.1-54.7 M289.2,186.1l73,55.1c2.9,2.3,1.3,2.3,4.2,0l72.9-55 M289,183.2c-0.7,0-1.3,0.5-1.3,1.2c0,0.7,0.6,1.2,1.3,1.2c0.7,0,1.3-0.5,1.3-1.2C290.3,183.8,289.7,183.2,289,183.2z M440.1,183.2c-0.7,0-1.3,0.5-1.3,1.2c0,0.7,0.6,1.2,1.3,1.2c0.7,0,1.3-0.5,1.3-1.2C441.3,183.8,440.8,183.2,440.1,183.2z M294.6,280.3l71.5,54c1.2,1,0.9,0.9,2.1-0.1l73.1-54.7 M292.2,281.4l73,55.1c2.9,2.3,1.3,2.3,4.2,0l72.9-55 M292,278.6c-0.7,0-1.3,0.5-1.3,1.2c0,0.7,0.6,1.2,1.3,1.2c0.7,0,1.3-0.5,1.3-1.2C293.2,279.1,292.6,278.6,292,278.6z M443,278.6c-0.7,0-1.3,0.5-1.3,1.2c0,0.7,0.6,1.2,1.3,1.2c0.7,0,1.3-0.5,1.3-1.2C444.2,279.1,443.7,278.6,443,278.6z',
              onclick: () => {
                this.createDropdownMenu(); // 创建下拉菜单
                this.showDropdown = !this.showDropdown;
                if (this.showDropdown) {
                  let x = event.clientX;
                  let y = event.clientY;
                  var dropdownElement = document.getElementById(this.dropdownId);
                  console.log("happen->下拉", dropdownElement.height, dropdownElement.offsetHeight, dropdownElement.clientHeight, dropdownElement.children.length)

                  // 防止下拉菜单超出屏幕
                  if (x + 200 > window.innerWidth) {
                    x = window.innerWidth - 200
                  }
                  if (y + 20 + dropdownElement.children.length * 40 > window.innerHeight) { // 40是每个按钮的高度
                    y = window.innerHeight - 20 - dropdownElement.children.length * 40
                  }

                  dropdownElement.style.left = x + 'px';
                  dropdownElement.style.top = y + 20 + 'px';
                  event.stopPropagation();
                }
              },
            },
          },
          tooltip: { // 和 option.tooltip 的配置项相同
            show: true,
            backgroundColor: 'black',
            position: 'bottom',
            textStyle: {
              // color: 'red',
              // backgroundColor: 'green',
              fontSize: 11,
            },
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); transform: translateY(11px);' // 自定义的 CSS 样式
          },
          itemGap: 2, // 工具栏左右的距离
        }
      }

      // 获取toolbox.feature
      let feature = op.toolbox[0].feature

      console.log("happen->feature", feature)

      let isShow = false

      // >>> 获取toolbox.feature.useBruchTime
      // let useBruchTime = feature.myUseBruchTime
      // // 如果存在useBruchTime，那么加入更多
      // if (useBruchTime) {
      //   var action = document.createElement('a');
      //   action.href = '#';
      //   action.textContent = useBruchTime.title;
      //   action.addEventListener('click', useBruchTime.onclick);
      //   dropdownElement.appendChild(action);
      //
      //   // option.toolbox.feature 中添加 myUseBruchTime
      //   option.toolbox.feature.myUseBruchTime = {
      //     show: false,
      //   }
      //   isShow = true
      // }
      // <<< 获取toolbox.feature.useBruchTime

      // >> X轴坐标切换 myChangeX
      let myChangeX = feature.myChangeX
      if (myChangeX) {
        var action = document.createElement('a');
        action.href = 'javascript:void(0)'
        action.textContent = myChangeX.title;
        if(this.oneFrequencyValue == undefined || this.oneFrequencyValue > 0) {
          action.addEventListener('click', myChangeX.onclick);
        }else{
          action.style = 'opacity: 0.2'
        }
        dropdownElement.appendChild(action);

        // option.toolbox.feature 中添加 myChangeX
        option.toolbox.feature.myChangeX = {
          show: false,
        }
        isShow = true
      }
      // << X轴坐标切换 myChangeX

      // >> 数据点等分 myModel
      // let myModel = feature.myModel
      // if (myModel&&this.trendFlag && this.type !== 'real') {
      //   var action = document.createElement('a');
      //   action.href = '#';
      //   action.textContent = myModel.title;
      //   action.addEventListener('click', myModel.onclick);
      //   dropdownElement.appendChild(action);
      //
      //   // option.toolbox.feature 中添加 myModel
      //   option.toolbox.feature.myModel = {
      //     show: false,
      //   }
      //   isShow = true
      // }
      // << 数据点等分 myModel

      // >> 主辅游标 myPrimarySecondary
      // let myPrimarySecondary = feature.myPrimarySecondary
      // if (myPrimarySecondary) {
      //   var action = document.createElement('a');
      //   action.href = '#';
      //   action.textContent = myPrimarySecondary.title;
      //   action.addEventListener('click', myPrimarySecondary.onclick);
      //   dropdownElement.appendChild(action);
      //
      //   // option.toolbox.feature 中添加 myPrimarySecondary
      //   option.toolbox.feature.myPrimarySecondary = {
      //     show: false,
      //   }
      //   isShow = true
      // }
      // << 主辅游标 myPrimarySecondary


      // >> 标点 myMarkPoint
      // let myMarkPoint = feature.myMarkPoint
      // if (myMarkPoint) {
      //   var action = document.createElement('a');
      //   action.href = '#';
      //   action.textContent = myMarkPoint.title;
      //   action.addEventListener('click', myMarkPoint.onclick);
      //   dropdownElement.appendChild(action);
      //
      //   // option.toolbox.feature 中添加 myMarkPoint
      //   option.toolbox.feature.myMarkPoint = {
      //     show: false,
      //   }
      //   isShow = true
      // }
      // << 标点 myMarkPoint

      // >> 标注 myMark
      let myMark = feature.myMark
      if (myMark && this.type !== 'real') {
        var action = document.createElement('a');
        action.href = 'javascript:void(0)';
        action.textContent = myMark.title;
        action.addEventListener('click', myMark.onclick);
        //这里添加下拉菜单的内容
        dropdownElement.appendChild(action);

        // option.toolbox.feature 中添加 myMark
        option.toolbox.feature.myMark = {
          show: false,
        }
        isShow = true
      }
      // << 标注 myMark

      // >> 清除 myClearAll

      let myClearAll = feature.myClearAll
      if (myClearAll) {
        var action = document.createElement('a');
        action.href = 'javascript:void(0)';
        action.textContent = myClearAll.title;
        action.addEventListener('click', myClearAll.onclick);
        dropdownElement.appendChild(action);

        // option.toolbox.feature 中添加 myClearAll
        option.toolbox.feature.myClearAll = {
          show: false,
        }
        isShow = true
      }
      // << 清除 myClearAll

      if (shouldIncludeSaveAsImage) {
        // >> 导出 saveAsImage

        let saveAsImage = feature.saveAsImage;
        // debugger;

        if(saveAsImage) {
          const img = chart.getDataURL({
            backgroundColor: '#fff',
            excludeComponents: ['toolbox'],
            pixelRatio: 1,
          });

          let action = document.createElement('a');
          action.href = img;
          action.textContent = saveAsImage.title;

          action.setAttribute('download', 'test.jpg');
          action.addEventListener('click', action.click);
          dropdownElement.appendChild(action);


          dropdownElement.appendChild(action);
          option.toolbox.feature.saveAsImage = {
            show: false,
          }
          isShow = true
        }

        // << 导出 saveAsImage
      }


      //波形点 myWavePoint
      let myWavePoint = feature.myWavePoint
      if(myWavePoint && this.status !== 'real'){
        let action = document.createElement('a');
        action.href = 'javascript:void(0)'
        action.textContent = myWavePoint.title
        if(this.mpoint && this.mpoint.length){
          action.addEventListener('click', myWavePoint.onclick);
        }else{
          action.style = 'opacity: 0.2'
        }
        dropdownElement.appendChild(action);
        isShow = true
      }

      let myLangWavePoint = feature.myLangWavePoint
      if(myLangWavePoint && this.status !== 'real' && this.$route.path.indexOf('WirelessPumpTrendAnalysis') != -1){
        let action = document.createElement('a');
        action.href = 'javascript:void(0)'
        action.textContent = myLangWavePoint.title
        if(this.mpoint && this.mpoint.length){
          action.addEventListener('click', myLangWavePoint.onclick);
        }else{
          action.style = 'opacity: 0.2'
        }
        dropdownElement.appendChild(action);
        isShow = true
      }



      if(isShow) {
        option.toolbox.feature.myMore.show = true
      }
      chart.setOption(option)
      this.myOption = option;
    },

    selectDataZoom() { // 默认点击区域放大
      this.mychart.dispatchAction({
        // type:'takeGlobalCursor',
        // key:'dataZoomSelect',
        // dataZoomSelectActive:true
        type: "takeGlobalCursor",
        key: "brush",
        brushOption: {
          brushType:  "lineX",
        },
        brushStyle: {
          borderWidth: 1,
          color: 'rgba(0, 0, 0, 0)',  // 特定选框颜色
          borderColor: 'rgba(0, 0, 0, 0.4)'
        }
      });
    }
  }
}


export default toolboxMoreMixin
