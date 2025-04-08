<template>
  <div style="padding-top: 5px">
    <el-form-item :label="translateText('opPage.textMap.','类型选择:')" style="height: 32px;margin:0 8px 8px 8px">
      <el-select v-model="typef" style="width: 100%;">
        <el-option v-for="item in showPointType" :label="translateText('opPage.textMap.',item.id)" :key="item.id" :value="item.id"></el-option>
      </el-select>
    </el-form-item>

    <div class="point-tree-special1jibeng tr" ref="ui">
      <el-tree
        :data="shebeis1"
        show-checkbox
        node-key="id"
        :default-expand-all=true
        :render-content="renderContent"
        ref="pointTree"
        @check="getCheckdePoints"
      >
      </el-tree>
    </div>
  </div>
</template>
<!--机泵其它参数分析测点树-->
<script>
export default {
  name: "PointTreeSpecial1",
  props: ['type'],
  data() {
    return {
      mycolor: '#ffffff',
      typef: '',
      allPoints: [], //所有测点信息
      points: [], //测点树要显示的测点
      shebeis1: [],
      channelType: {
        4: "温度",
        3: "压力",
        5: "流量",
        6: "其它",
        7: "撞击",
      },
      map: {
        "温度": 4,
        "轴位移": 100000,
        "撞击": 7,
        "压力": 3,
        "流量": 5,
        "其它": 6,
      },
      allPointType: [{
        id: '温度',
        channelType: 4,
        show: false
      }, {
        id: '压力',
        channelType: 3,
        show: false
      }, {
        id: '流量',
        channelType: 5,
        show: false
      }, {
        id: '其它',
        channelType: 6,
        show: false
      }, {
        id: '撞击',
        channelType: 7,
        show: false
      }],//五种测点类型
      showPointType: [],//当前设备测点拥有类型的数组
      first: true,
      pointSelectList: {
        '温度': [],
        '撞击': [],
        '压力': [],
        '流量': [],
        '其它': [],
      },//保存各类测点选中的顺序
      firstLoad: true,//第一次不执行activated，避免冲突
      activatedFlag: true,
    }
  },
  mounted() {
    this.mycolor = this.$store.state.textcolor;
    this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
    this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
    let interval = setInterval(() => {
      if (this.nodeData[this.$store.state.equid] !== undefined) {
        clearInterval(interval)
        this.getpointName(this.equid);
      }
    }, 500)
    this.$store.state.intervalIds.push(interval)
  },
  activated() {
    this.activatedFlag = true
    this.$store.state.globalTreeSelect = "0"
    if (!this.firstLoad) {
      this.syncGlobalPoint()
    }
    this.firstLoad = false
  },
  deactivated() {
    this.activatedFlag = false
  },
  computed: {
    nodeData() {
      return this.$store.state.nodeData;
    },
    equid() {
      return this.$store.state.equid;
    },
    nodeNum() {
      return this.$store.state.nodeNum;
    },
    topiccolor() {
      return this.$store.state.topiccolor;
    },
    globalPointId() {
      return this.$store.state.globalPointId
    },
  },

  watch: {
    typef(val) {
      this.setPointTree(val);
    },
    topiccolor(val) {
      this.mycolor = this.$store.state.textcolor;
      this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
      this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
    },
    '$i18n.locale'() {
      for (let i in this.shebeis1) {
        this.shebeis1[i].label = this.translateText('opPage.textMap.', this.shebeis1[i].id + "测点")
      }
    }
  },
  methods: {
    syncGlobalPoint() {
      let tempCheckedKeys = this.globalPointId.split(',')
      for (let i in tempCheckedKeys) {
        for (let j in this.allPoints) {
          if (this.allPoints[j].id == tempCheckedKeys[i]) {
            this.typef = this.channelType[this.allPoints[j].channelType]
            break
          }
        }
      }
      this.setPointTree(this.typef);
    },
    getpointName(equid) {
      const data = this.nodeData[equid];
      if (data == undefined)
        return;
      this.allPoints = [];
      for (var i = 0; i < data.length; ++i) {
        var nowjson = {};
        nowjson['label'] = data[i].pointName;
        nowjson['id'] = data[i].pointId;
        nowjson['channelType'] = data[i].channelType;
        nowjson['channelTypeAlias'] = this.channelType[data[i].channelType];
        nowjson['pointUuid'] = data[i].pointUuid;
        nowjson['xid'] = i;
        if ([3, 4, 5, 6, 7].indexOf(data[i].channelType) != -1) {
          this.allPoints.push(nowjson);
        }
      }
      this.showPointType = []
      this.allPointType.forEach(item1 => {
        for (let item2 of this.allPoints) {
          if (item2.channelType == item1.channelType) {
            item1.show = true
            if (this.typef == '') {
              this.typef = item1.id
            }
            this.showPointType.push(item1)
            break
          }
        }
      })
      this.syncGlobalPoint()
    },

    //设置测点树内容
    setPointTree(type) {
      this.first = true //更换测点类型，pointSelectList需要清空
      this.pointSelectList = {
        '温度': [],
        '撞击': [],
        '压力': [],
        '流量': [],
        '其它': [],
      }
      this.$emit("stop");
      this.points = [];
      if (!type) return
      for (let i = 0; i < this.allPoints.length; i++) {
        if (this.allPoints[i].channelType == this.map[type]) {
          this.points.push(this.allPoints[i]);
        }
      }
      if (this.points.length == 0) {
        this.shebeis1 = [];
      } else {
        this.shebeis1 = [{
          id: type,
          label: this.translateText("opPage.textMap.", type),
          children: this.points,
        }]
      }
      this.$nextTick(() => {
        if (this.shebeis1.length != 0) {
          let tempCheckedKeys = this.globalPointId.split(',')
          this.$refs.pointTree.setCheckedKeys(tempCheckedKeys);

          //无全局测点，选中第一个测点
          if (this.$refs.pointTree.getCheckedNodes().length == 0) {
            this.$refs.pointTree.setCheckedKeys([this.shebeis1[0].children[0].id]);
          }
          this.getCheckdePoints();
          //初始化画图
          this.$emit("initial");
        }
      });
    },

    // 当测点树发生变化时，打包数据并返回
    getCheckdePoints(data) {
      if (data) {
        //全选
        if (data.hasOwnProperty('children')) {
          if (this.pointSelectList[data.id].length) {
            for (let i in data.children) {
              this.$refs.pointTree.setChecked(data.children[i].id, false);
            }
            this.pointSelectList[data.id] = []
          } else {
            let maxNumIndex = config.menu.MaxSelectedPointNumber - 1
            for (let i in data.children) {
              if (i > maxNumIndex) this.$refs.pointTree.setChecked(data.children[i].id, false);
              else {
                this.$refs.pointTree.setChecked(data.children[i].id, true);
                this.pointSelectList[data.id].push(data.children[i].id)
              }
            }
          }
        } else {
          //单选
          let index = this.pointSelectList[data.channelTypeAlias].indexOf(data.id)
          this.$refs.pointTree.setChecked(data.id, index == -1);
          if (index == -1) {
            //选中
            this.pointSelectList[data.channelTypeAlias].push(data.id)
            if (this.pointSelectList[data.channelTypeAlias].length > config.menu.MaxSelectedPointNumber) {
              this.$refs.pointTree.setChecked(this.pointSelectList[data.channelTypeAlias][0], false);
              this.pointSelectList[data.channelTypeAlias].shift()
            }
          } else {
            //取消选中
            this.pointSelectList[data.channelTypeAlias].splice(index, 1);
          }
        }
      }
      var allnode = [];
      var othernode = this.$refs.pointTree.getHalfCheckedNodes();
      var checked = this.$refs.pointTree.getCheckedNodes();
      if (othernode.length > 0) {
        allnode = othernode
      }
      for (var i = 0; i < checked.length; ++i) {
        allnode.push(checked[i]);
      }
      if (this.first) {
        this.first = false
        for (let i in this.pointSelectList) {
          this.pointSelectList[i] = [];
        }
        allnode.forEach(item => {
          if (!item.hasOwnProperty('children')) {
            this.pointSelectList[item.channelTypeAlias].push(item.id)
          }
        })
      }
      this.$emit('getNewPoint', allnode);
      let tempCheckedNodes = allnode.filter(item => {
        return !item.hasOwnProperty('children')
      })
      let ids = tempCheckedNodes.map(item => item.id);
      this.$store.state.globalPointId = ids.join(',');
      this.$store.state.pointId = this.$store.state.globalPointId
    },
    renderContent(h, {node, data, store}) {
      return h(
        "span", {
          domProps: {title: data.id},
          style: {
            fontSize: '14px',
            color: this.mycolor
          },
        }, node.label
      );
    }

  }
}
</script>

<style lang="scss">
.red {
  color: red;
}

.yellow {
  color: yellow;
}

.point-tree-special1jibeng {
  --pointcolor: #1D1E2C;
  --eltreecolor: #1D1E2C;
  --textcolor: #ffffff;
  --eltreebordercolor: #000;
  height: 228px;
  width: calc(100% - 10px);
  overflow: auto;
  background-color: var(--eltreecolor);
  padding: 8px 0 8px 8px;
  border-radius: 6px;
  border: 1px solid var(--eltreebordercolor);

  //.el-form-item {
  //  margin-bottom: 10px !important;
  //}
  //
  //.el-select {
  //  width: 70%;
  //}

  .el-tree {
    background: var(--eltreecolor);

    .feature-content {
      display: flex;
    }

    .feature-select {
      flex: 1;
    }

    .el-input {
      font-size: 14px;
      width: 100%;
    }

    .el-tree-node > .el-tree-node__content {
      background-color: var(--eltreecolor) !important;
    }

    .el-tree-node.is-current > .el-tree-node__content {
      background-color: var(--eltreecolor) !important;
    }

    .el-tree-node__content {
      height: auto;
      margin-right: 8px;
      margin-bottom: 8px;
    }

    .el-tree-node__content > .el-tree-node__expand-icon {
      padding: 6px 5.5px 5.5px 6px;
      width: 12.5px;
      height: 12.5px;
      font-size: 12.5px
    }

    .el-checkbox {
      height: 16px;
      padding: 4px;
      font-size: 14px;
      margin-right: 0;
    }

    .el-tree-node__label {
      font-size: 14px;
      padding: 0px 4px;
    }

    .el-checkbox__inner {
      background-color: var(--eltreecolor);
      border-color: var(--textcolor)
    }

    .el-checkbox__input.is-disabled .el-checkbox__inner {
      background-color: var(--eltreecolor) !important;
      border-color: var(--textcolor) !important;
    }

    .el-checkbox__inner::before {
      background-color: #C0C4CC
    }

  }

}
</style>
