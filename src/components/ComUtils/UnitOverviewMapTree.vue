<template>
  <div class="chose-8">
    <el-form-item :label="translateText('opPage.textMap.','类型选择:')" style="height: 32px;margin:0 8px 8px 8px">
      <el-select v-model="typef">
        <el-option v-for="item in showPointType" :label="translateText('opPage.textMap.',item.id)" :key="item.id" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <div class="point-tree-specialjibeng tr" ref="ui">
      <!-- <el-scrollbar style="height:100%"> -->
      <el-tree
        :data="shebeis1"
        show-checkbox
        node-key="id"
        :default-expand-all=true
        ref="pointTree"
        @check="getCheckdePoints"
        :render-content="renderContent"
      ></el-tree>
      <!-- </el-scrollbar> -->
    </div>
  </div>
</template>

<script>
  import keepAliveMixin from "@/mixins/keepAliveMixin";
  export default {
    name: "UnitOverviewMapTree",
    mixins: [keepAliveMixin],
    props: ['type', 'nowstatus'],
    data() {
      return {
        typef: "",
        cnum :0,
        featureSelect: [0, 0, 0],
        typeSelect: [
          {id: 0, label: this.translateText("opPage.textMap.","通频")},
          {id: 1, label: this.translateText("opPage.textMap.","1倍频幅值")},
          {id: 2, label: this.translateText("opPage.textMap.","2倍频幅值")},
          {id: 3, label: this.translateText("opPage.textMap.","3倍频幅值")},
          {id: 4, label: this.translateText("opPage.textMap.","1/2倍频幅值")},
          {id: 5, label: this.translateText("opPage.textMap.","残振")},
          {id: 6, label: this.translateText("opPage.textMap.","直流量")},
          {id: 7, label: this.translateText("opPage.textMap.","间隙电压")},
          {id: 8, label: this.translateText("opPage.textMap.","1倍频相位")},
          {id: 9, label: this.translateText("opPage.textMap.","2倍频相位")},
          {id: 10, label: this.translateText("opPage.textMap.","3倍频相位")},
          {id: 11, label: this.translateText("opPage.textMap.","1/2倍频相位")}
        ],
        channelType: {
          1: "振动",
          4: "温度",
          3: "压力",
          5: "流量",
          6: "其他",
          7: "撞击",
        },
        map:{
          "温度": 4,
          "轴位移": 2,
          "撞击次数": 7,
          "压力": 3,
          "流量": 5,
          "其他": 6,
        },
        allPointType:[
          {
            id: '振动',
            channelType: 1,
            show: false
          },{
            id: '温度',
            channelType: 4,
            show: false
          },{
            id: '压力',
            channelType: 3,
            show: false
          },{
            id: '流量',
            channelType: 5,
            show: false
          },{
            id: '其他',
            channelType: 6,
            show: false
          },{
            id: '撞击',
            channelType: 7,
            show: false
          }],//六种测点类型
        showPointType: [],//当前设备测点拥有类型的数组
        allPoints: [], //所有测点信息
        otherPoints: [],
        points: [], //测点树要显示的测点
        shebeis1: [],
        mycolor: '#ffffff',
        first: true,
        pointSelectList: {
          '位移': [],
          '加速度': [],
          '速度': [],
          '温度': [],
          '压力': [],
          '流量': [],
          '其它': []
        },
        firstLoad: true,//第一次不执行activated，避免冲突
      }
    },
    mounted() {
      console.log("this.nodeData[this.equid]:"+this.nodeData[this.equid])
      if (this.nodeData[this.equid] != undefined) {

        this.getpointName(this.equid);

      }
      this.mycolor = this.$store.state.textcolor;
      this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
      this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
    },
    activated() {
      this.activatedFlag = true
      this.$store.state.globalTreeSelect = "0"
      if(!this.firstLoad){
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
      equipmentDetail() {
        return this.$store.state.equipmentDetail;
      },
      topiccolor() {
        return this.$store.state.topiccolor;
      },
      globalPointId(){
        return this.$store.state.globalPointId
      },
      globalTreeSelect(){
        return this.$store.state.globalTreeSelect
      },
    },
    watch: {
      '$i18n.locale'() {
        this.shebeis1.forEach((item, index, arr) => {
          arr[index].label = this.translateText('opPage.textMap.', item.id);
        })
      },
      equid: {
        handler(newEquid) {
          if(!this.activatedFlag) return ;
          this.getpointName(newEquid);
        },
        nodeNum() {
          return this.$store.state.nodeNum;
        }
      },
      nodeNum: {
        handler() {
          if(!this.activatedFlag) return ;
          this.getpointName(this.equid);
        }
      },
      typef(val) {
        if(!this.activatedFlag) return ;
        console.log('触发typef变化', val);
        if (val == '振动') {
          this.setvibrationPointTree(val)
        } else {
          this.setPointTree(val);
        }
        this.shebeis1.forEach((item, index, arr) => {
          arr[index].label = this.translateText('opPage.textMap.', item.id);
        })
      },
      topiccolor(val) {
        this.mycolor = this.$store.state.textcolor;
        this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
        this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
        this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
        this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
      },
    },
    methods: {
      getCheckdePoints(data) {
        let checkedNodes = this.$refs.pointTree.getCheckedNodes() || [];
        console.log("getCheckdePoints")
        console.log(data)
        if(data){
          //测点互斥
          if (data.dtype == '位移' || data.dtype == '加速度' || data.dtype == '速度') {
            checkedNodes.forEach(item => {
              if(item.dtype != data.dtype){
                this.$refs.pointTree.setChecked(item.id, false);
                this.pointSelectList[item.dtype] = []
              }
            })
          }
          //全选
          if (data.hasOwnProperty('children')) {
            if(this.pointSelectList[data.dtype].length){
              for(let i in data.children){
                this.$refs.pointTree.setChecked(data.children[i].id, false);
              }
              this.pointSelectList[data.dtype] = []
            }else{
              let maxNumIndex = data.children[0].hasOwnProperty('disabled') ? config.menu.MaxSelectedPointNumber : config.menu.MaxSelectedPointNumber - 1
              for(let i in data.children){
                if(i > maxNumIndex) this.$refs.pointTree.setChecked(data.children[i].id, false);
                else{
                  this.$refs.pointTree.setChecked(data.children[i].id, true);
                  if(data.children[i].hasOwnProperty('disabled')) continue
                  this.pointSelectList[data.dtype].push(data.children[i].id)
                }
              }
            }
          } else {
            //单选
            let index = this.pointSelectList[data.dtype].indexOf(data.id)
            //特征测点id
            let featureIdList = {
              '位移': '特征-位移',
              '加速度': '特征-加速度',
              '速度': '特征-速度',
            }
            //当前测点的特征测点ID
            let featureId = featureIdList[data.dtype]
            this.$refs.pointTree.setChecked(data.id, index == -1);
            if(index == -1) {
              //选中
              this.pointSelectList[data.dtype].push(data.id)
              if(featureId) this.$refs.pointTree.setChecked(featureId, true);
              if (this.pointSelectList[data.dtype].length > config.menu.MaxSelectedPointNumber) {
                this.$refs.pointTree.setChecked(this.pointSelectList[data.dtype][0], false);
                this.pointSelectList[data.dtype].shift()
              }
            }else{
              //取消选中
              this.pointSelectList[data.dtype].splice(index, 1)
              if (this.pointSelectList[data.dtype].length == 0 && featureId) {
                this.$refs.pointTree.setChecked(featureId, false);
              }
            }
          }
        }

        let returnTreeData = {};
        // returnTreeData['treeSelect'] = this.treeSelect;
        returnTreeData['checkedNodes'] = this.$refs.pointTree.getHalfCheckedNodes();
        checkedNodes = this.$refs.pointTree.getCheckedNodes() || [];
        for (let i = 0; i < checkedNodes.length; i++) {
          if (checkedNodes[i].label == "特征")
            continue;
          console.log("featureSelect",this.featureSelect);
          returnTreeData['featureSelect'] = this.featureSelect[checkedNodes[i].dataType]; //最好要改
          console.log(returnTreeData['featureSelect']);
          returnTreeData['checkedNodes'].push(checkedNodes[i]);
        }

        if(this.first){
          this.first = false
          for(let i in this.pointSelectList){
            this.pointSelectList[i] = [];
          }
          returnTreeData['checkedNodes'].forEach(item =>{
            if(!item.hasOwnProperty('children') && !item.hasOwnProperty('disabled')) {
              this.pointSelectList[item.dtype].push(item.id)
            }
          })
        }
        this.$emit('getNewPoint', returnTreeData);
        let tempCheckedNodes = returnTreeData['checkedNodes'].filter(item =>{
          return !item.hasOwnProperty('children') && !item.hasOwnProperty('disabled')
        })
        let ids = tempCheckedNodes.map(item => item.id);
        this.$store.state.globalPointId = ids.join(',');
        this.$store.state.pointId = this.$store.state.globalPointId
      },
      renderContent(h, {node, data, store}) {
        if (node.label == '特征') {
          let dataType = 0;
          let tempTypeSelect = this.$store.state.features[data.type];
          // let tempTypeSelect = [];
          if (node.data.id == '特征-位移') {
            dataType = 0;
          } else if (node.data.id == '特征-加速度') {
            dataType = 1;
          } else if (node.data.id == '特征-速度') {
            dataType = 2;
          }
          return h(
            "div", { class: "feature-content" }, [
              h(
                "span", {
                  style: {
                    fontSize: '14px',
                    color: this.mycolor,
                    marginRight: '5px',
                    display: 'flex',
                    alignItems: 'center'
                  },
                }, this.translateText("opPage.textMap.","特征")
              ), h(
                "el-select", {
                  class: "el-select--mini el-input--mini",
                  style: {
                    width: '100%'
                  },
                  on: {
                    input: (value) => {
                      this.$set(this.featureSelect, dataType, value);
                      this.getCheckdePoints();
                    }
                  },
                  props: {
                    value: this.featureSelect[dataType]
                  }
                }, [
                  tempTypeSelect.map(item => {
                    return h(
                      "el-option", {
                        style: {
                          lineHeight: '18px',
                          fontSize: '14px',
                          height: '18px'
                        },
                        props: {
                          value: item.id,
                          label: this.translateText("opPage.textMap.",item.label)
                        }
                      }
                    );
                  })
                ]
              )
            ]
          );
        }
        else {
          let icon = '';
          // console.warn(node, data);

          // 实时状态下概貌图测点报警显示
          // 根据概貌图上的测点状态显示不同的图标
          if(this.$store.state.points.length != 0 && this.nowstatus) {
            if(node.data.children == undefined) icon = 'el-icon-s-claim normal';

            this.$store.state.points.forEach(item => {
              if(item.pointId == node.label) {
                if(item.status == "2"){
                  icon = 'iconfont icon-jinggao red'
                }else if (item.status == "1") {
                  icon = 'iconfont icon-jinggao yellow'
                }
              }
            })
          }

          return h(
            "span", [
              h("i", {
                // class: icon,
                style: {
                  display: 'inline-block'
                }
              },),
              h("span", {
                style: {
                  fontSize: '14px',
                  color: this.mycolor
                },
              }, node.label)]
          );
        }
      },
      //选取需要的测点内容
      getpointName(equid) {
        console.log("getpointName"+equid,this.equipmentDetail[equid]);
        const data = this.equipmentDetail[equid];
        if (data == undefined){
          let that = this;
          setTimeout(() => {
            that.getpointName(equid)
          }, 1000)
        }
        else {
          this.allPoints = [];
          this.otherPoints = [];
          data.sort((a, b) => a.pointName.localeCompare(b.pointName));
          let dtypeList = {
            1 : '振动',
            3 : '压力',
            4 : '温度',
            5 : '流量',
            6 : '其它',
            7 : '撞击'
          }
          for (var i = 0; i < data.length; ++i) {
            var nowjson = {};
            nowjson['id'] = data[i].pointId;
            nowjson['label'] = data[i].pointName;
            nowjson['channelType'] = data[i].channelType;
            nowjson['pointUuid'] = data[i].pointUuid;
            nowjson['dataType'] = data[i].dataType;
            nowjson['dtype'] = dtypeList[data[i].channelType];
            nowjson['type'] = data[i].type;
            if (data[i].channelType == 1) {
              this.otherPoints.push(nowjson);
            } else {
              this.allPoints.push(nowjson)
            }
          }
          this.showPointType = []
          this.allPointType.forEach(item1 => {
            for(let item2 of data){
              if(item2.channelType == item1.channelType) {
                item1.show = true
                if(this.typef == '' || item1.id == '振动') {
                  this.typef = item1.id
                }
                this.showPointType.push(item1)
                break
              }
            }
          })
          this.syncGlobalPoint()
        }
      },
      syncGlobalPoint(){
        console.log("syncGlobalPoint()")
        this.$store.state.globalPointId = this.$store.state.pointId
        console.log(this.$store.state.globalPointId)
        if(this.$store.state.globalPointId){
          let tempCheckedKeys = this.globalPointId.split(',')
          for(let i in tempCheckedKeys){
            for(let j in this.allPoints){
              if(this.allPoints[j].id == tempCheckedKeys[i] || this.allPoints[j].label == tempCheckedKeys[i]){
                this.typef = this.channelType[this.allPoints[j].channelType]
                break
              }
            }
          }
          for(let i in tempCheckedKeys){
            for(let j in this.otherPoints){
              if(this.otherPoints[j].id == tempCheckedKeys[i] || this.otherPoints[j].label == tempCheckedKeys[i]){
                this.typef = this.channelType[this.otherPoints[j].channelType]
                break
              }
            }
          }
        }
        console.log(this.typef)
        if(this.typef == '振动'){
          this.setvibrationPointTree(this.typef)
        }else{
          this.setPointTree(this.typef)
        }
      },
      setvibrationPointTree(type) {
        this.first = true
        this.pointSelectList = {
          '位移': [],
          '加速度': [],
          '速度': [],
          '温度': [],
          '压力': [],
          '流量': [],
          '其它': []
        }
        this.shebeis1 = [];
        let tmpDisplacement = {
          id: '振动-位移',
          label: this.translateText('opPage.textMap.', '振动-位移'),
          dtype: '位移',
          children: []
        };
        let tmpAcceleration = {
          id: '振动-加速度',
          label: this.translateText('opPage.textMap.', '振动-加速度'),
          dtype: '加速度',
          children: []
        };
        let tmpSpeed = {
          id: '振动-速度',
          label: this.translateText('opPage.textMap.', '振动-速度'),
          dtype: '速度',
          children: []
        };
        let tmp2 = {
          id: '特征-位移',
          label: '特征',
          dtype: '位移',
          disabled: true,
          type: 113,
        };
        let tmp3 = {
          id: '特征-加速度',
          label: '特征',
          dtype: '加速度',
          disabled: true,
          type: 113,
        };
        let tmp4 = {
          id: '特征-速度',
          label: '特征',
          dtype: '速度',
          disabled: true,
          type: 113,
        };
        tmpDisplacement['children'].push(tmp2);
        tmpAcceleration['children'].push(tmp3);
        tmpSpeed['children'].push(tmp4);
        let that = this;
        let flag1 = 0, flag2 = 0, flag3 = 0;
        for (const i in this.otherPoints) {
          let tmp1 = {
            id: that.otherPoints[i].id,
            label:that.otherPoints[i].label,
            pointUuid: that.otherPoints[i].pointUuid,
            dataType: that.otherPoints[i].dataType,
          };
          if (that.otherPoints[i].dataType == 0) {
            tmp1['dtype'] = tmpDisplacement['dtype']
            tmpDisplacement['children'].push(tmp1);
            if (flag1 == 0) {
              tmpDisplacement['children'][0].type = that.otherPoints[i].type;
              flag1 = 1;
            }
          } else if (that.otherPoints[i].dataType == 1) {
            tmp1['dtype'] = tmpAcceleration['dtype']
            tmpAcceleration['children'].push(tmp1);
            if (flag2 == 0) {
              tmpAcceleration['children'][0].type = that.otherPoints[i].type;
              flag2 = 1;
            }
          } else if (that.otherPoints[i].dataType == 2) {
            tmp1['dtype'] = tmpSpeed['dtype']
            tmpSpeed['children'].push(tmp1);
            if (flag3 == 0) {
              tmpSpeed['children'][0].type = that.otherPoints[i].type;
              flag3 = 1;
            }
          }
        }
        if (tmpDisplacement.children.length > 1)
          this.shebeis1.push(tmpDisplacement);
        if (tmpAcceleration.children.length > 1)
          this.shebeis1.push(tmpAcceleration);
        if (tmpSpeed.children.length > 1)
          this.shebeis1.push(tmpSpeed);
        // 解决默认选项的问题(注意是否存在子节点)
        this.$nextTick(() => {
          console.log(this.$store.state.globalPointId+"zheli")
          if(this.$store.state.globalPointId){
            let tempCheckedKeys = this.globalPointId.split(',')
            this.$refs.pointTree.setCheckedKeys(tempCheckedKeys);
            console.log(this.$refs.pointTree.getCheckedNodes().length)
            if(this.$refs.pointTree.getCheckedNodes().length) this.getCheckdePoints();
          }else{
            console.log("else"+this.shebeis1.length+"???")
            if (this.shebeis1.length != 0) {
              console.log("进入if了")
              console.log(this.$refs.pointTree.setCheckedKeys())
              this.$refs.pointTree.setCheckedKeys([this.shebeis1[0].children[0].id, this.shebeis1[0].children[1].id]);
              console.log("出if了")
            }
            console.log("马上要进入getCheckdePoints")
            this.getCheckdePoints();
          }
          //初始时传数据
          this.$emit("initial");

        });
      },
      //设置其他测点树内容
      setPointTree(type) {
        this.first = true
        this.points = [];
        if (type == '') return
        for (let i = 0; i < this.allPoints.length; i++) {
          if (this.allPoints[i].channelType == this.map[type]) {
            this.points.push(this.allPoints[i]);
          }
        }
        if(this.points.length == 0) {
          this.shebeis1 = [];
        }else{
          this.shebeis1 = [{
            id: type,
            label: this.translateText("opPage.textMap.",type),
            children: this.points,
          }]
        }
        // 解决默认选项的问题(注意是否存在子节点)
        this.$nextTick(() => {
          if(this.shebeis1.length != 0) {
            if(this.$store.state.globalPointId){
              let tempCheckedKeys = this.globalPointId.split(',')
              this.$refs.pointTree.setCheckedKeys(tempCheckedKeys);
              if(this.$refs.pointTree.getCheckedNodes().length) this.getCheckdePoints();
            }else{
              this.$refs.pointTree.setCheckedKeys([this.shebeis1[0].children[0].id]);
              this.getCheckdePoints();
            }
          }
          this.$emit("initial");

        });
      },
    }
  }
</script>

<style lang="scss">
.point-tree-specialjibeng {
  --pointcolor: #1D1E2C;
  --eltreecolor: #1D1E2C;
  --textcolor: #ffffff;
  --eltreebordercolor: #000;
  height: 228px;
  overflow: auto;
  background-color: var(--eltreecolor);
  padding: 8px 0 8px 8px;
  border-radius: 6px;
  border: 1px solid var(--eltreebordercolor);

  .el-tree {
    background: var(--eltreecolor);
    .feature-content{
      display: flex;
      width: 185px;
    }
    .feature-select{
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

    .el-checkbox__inner{
      background-color: var(--eltreecolor);
      border-color: var(--textcolor);
    }

    .el-checkbox__input.is-disabled .el-checkbox__inner{
      background-color: var(--eltreecolor) !important;
      border-color: var(--textcolor) !important;
    }
    .el-checkbox__inner::before{
      background-color: #C0C4CC
    }

  }
}
</style>
