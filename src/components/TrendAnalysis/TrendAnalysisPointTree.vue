<template>
  <div>
    <el-form-item :label="translateText('opPage.textMap.','类型选择:')" style="height: 32px;margin:0 8px 8px 8px">
      <el-select v-model="treeSelect" placeholder="请选择类型" @change="treeChange">
        <el-option :label="translateText('opPage.textMap.','多通道单特征值')" value="0"></el-option>
        <el-option :label="translateText('opPage.textMap.','单通道多特征值')" value="1"></el-option>
      </el-select>
    </el-form-item>

    <div class="trend-analysis-point-treejibeng" ref="ui">
      <div v-show="treeSelect == 0">
        <el-tree :data="pointTree1" show-checkbox node-key="id" :default-expanded-keys="['振动-位移']"
                 @check="pointTree1Checked"
                 accordion ref="pointFeatureTree1" :render-content="renderContent"></el-tree>
      </div>
      <div  v-show="treeSelect == 1">
        <el-tree :data="pointTree2" accordion show-checkbox node-key="id" :default-expanded-keys="['振动-位移']"
                 @check="pointTree2Checked" ref="pointFeatureTree2" :render-content="renderContent2"></el-tree>
      </div>
    </div>
  </div>
</template>
<script>
import keepAliveMixin from "@/mixins/keepAliveMixin";
export default {
  name: "TrendAnalysisPointTree",
  mixins: [keepAliveMixin],
  data() {
    return {
      mycolor: '#ffffff',
      treeSelect: "0",
      featureSelect: [0, 0, 0],
      /*   typeSelect: [
           {id: 0, label: "通频"},
           {id: 1, label: "1倍频幅值"},
           {id: 2, label: "2倍频幅值"},
           {id: 3, label: "3倍频幅值"},
           {id: 4, label: "1/2倍频幅值"},
           {id: 5, label: "残振"},
           {id: 6, label: "直流量"},
           {id: 7, label: "间隙电压"},
           {id: 8, label: "1倍频相位"},
           {id: 9, label: "2倍频相位"},
           {id: 10, label: "3倍频相位"},
           {id: 11, label: "1/2倍频相位"}
         ],*/
      points: [],
      pointTree1: [],
      pointTree2: [],
      defaultProps: {
        children: 'children',
        label: 'label',
        disabled: function (data, node) {
          if (node.store.getCheckedKeys(true).length >= 8) {
            return node.store.getCheckedKeys(true).indexOf(data.id) < 0
          }
        }
      },
      first1: true,
      first2: true,
      pointSelectList1: [[],[],[]],
      pointSelectList2: []
    };
  },
  mounted() {
    if (this.nodeData[this.equid] != undefined) {
      this.setPointTree(this.equid);
    }
    this.mycolor = this.$store.state.textcolor;
    this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
    this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
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
    }
  },
  watch: {
    equid: {
      handler(newEquid) {
        if(!this.activatedFlag) return ;
        // console.log(newEquid)
        this.$nextTick(() => this.setPointTree(newEquid));

        // console.log(this.pointTree1);
      }
    },
    nodeNum: {
      handler() {
        if(!this.activatedFlag) return ;
        this.setPointTree(this.equid);
        // console.log(this.pointTree1);
      }
    },
    topiccolor(val) {
      this.mycolor = this.$store.state.textcolor;
      this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
      this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
    },
    '$i18n.locale'() {
      for(let i in this.pointTree1){
        this.pointTree1[i].label = this.translateText('opPage.textMap.', this.pointTree1[i].id)
      }
      for(let i in this.pointTree2){
        this.pointTree2[i].label = this.translateText('opPage.textMap.', this.pointTree2[i].id)
      }
      for(let k = 0;k < this.pointTree2.length; ++ k) {
        if(this.pointTree2[k].id == '振动-位移' || this.pointTree2[k].id == '振动-加速度' || this.pointTree2[k].id == '振动-速度') {
          for (let i = 0; i < this.pointTree2[k].children.length; i++) {
            for (let j = 0; j < this.pointTree2[k].children[i].children.length; j++) {
              this.pointTree2[k].children[i].children[j].label = this.translateText("opPage.textMap.", this.pointTree2[k].children[i].children[j].name)
            }
          }
        }
      }
    }
  },
  methods: {
    setPointTree(equid) {
      // console.log("这让我很无奈");
      let that = this;
      let newEquid = equid;
      // console.log(this.equipmentDetail)
      setTimeout( () => {
        let _data = that.equipmentDetail[newEquid];
        if (_data == undefined)
          return;
        that.points = [];
        for (const i in _data) {
          if (_data[i].dataType == 1 || _data[i].dataType == 2 || _data[i].dataType == 0) {
            that.points.push(_data[i]);
          }
        }
        that.setPointTree1();
        that.setPointTree2();
        that.$nextTick(() => {
          let urlPointId = '';
          let tmpPointId = window.location.search.substring(1).split('&');
          for(let pointItem in tmpPointId) {
            if (tmpPointId[pointItem].split('=')[0] == 'pointId') {
              urlPointId = decodeURIComponent(decodeURIComponent(tmpPointId[pointItem].split('=')[1]))
            }
          }
          console.log('测点名称', urlPointId);
          let urlFlag = false;
          if (urlPointId) {
            console.log(that.pointTree1);
            for(let item in that.pointTree1) {
              for(let _item in that.pointTree1[item].children) {
                if(this.pointTree1[item].children[_item].id == urlPointId) {
                  this.$refs.pointFeatureTree1.setCheckedKeys([this.pointTree1[item].children[_item].id]);
                  urlFlag = true;
                  break;
                }
              }
              if (urlFlag) {
                break;
              }
            }
          }
          if (urlPointId && !urlFlag) {
            console.log('没有该测点');
            this.$emit('notExitPoint')
          }
          if (!urlFlag) {
            for (const i in that.pointTree1) {
              if (that.pointTree1[i].children.length > 1) {
                that.$refs.pointFeatureTree1.setCheckedKeys([that.pointTree1[i].children[0].id, that.pointTree1[i].children[1].id]);
                break;
              }
            }
          }
          for (const i in that.pointTree2) {
            if (that.pointTree2[i].children.length > 0 && that.pointTree2[i].children[0].children.length > 0 ) {
              this.$refs.pointFeatureTree2.setCheckedKeys([that.pointTree2[i].children[0].children[0].id]);
              break;
            }
          }
          if (that.treeSelect == "0") {
            that.pointTree1Checked();
          } else {
            that.pointTree2Checked();
          }
          that.$emit('firstdo');

        });
      }, 1000);
    },
    setPointTree1() {
      this.pointTree1 = [];
      // console.log('-------iii---------')
      let tmpDisplacement = {
        id: '振动-位移',
        label: this.translateText('opPage.textMap.', "振动-位移"),
        dataType: 0,
        children: []
      };
      let tmpAcceleration = {
        id: '振动-加速度',
        label: this.translateText('opPage.textMap.', "振动-加速度"),
        dataType: 1,
        children: []
      };
      let tmpSpeed = {
        id: '振动-速度',
        label: this.translateText('opPage.textMap.', "振动-速度"),
        dataType: 2,
        children: []
      };
      let tmp2 = {
        id: '特征-位移',
        label: '特征',
        dataType: 0,
        disabled: true,
        type: 113,
      };
      let tmp3 = {
        id: '特征-加速度',
        label: '特征',
        dataType: 1,
        disabled: true,
        type: 113,
      };
      let tmp4 = {
        id: '特征-速度',
        label: '特征',
        dataType: 2,
        disabled: true,
        type: 113,
      };
      tmpDisplacement['children'].push(tmp2);
      tmpAcceleration['children'].push(tmp3);
      tmpSpeed['children'].push(tmp4);
      // console.log('-------iii---------')
      let that = this;
      let flag1 = 0, flag2 = 0, flag3 = 0;
      for (const i in this.points) {
        let tmp1 = {
          id: that.points[i].pointId,
          label: that.points[i].pointName,
          pointUuid: that.points[i].pointUuid,
          dataType: that.points[i].dataType,
        };
        if (that.points[i].dataType == 0) {
          tmpDisplacement['children'].push(tmp1);
          if (flag1 == 0) {
            tmpDisplacement['children'][0].type = that.points[i].type;
            flag1 = 1;
          }
        } else if (that.points[i].dataType == 1) {
          tmpAcceleration['children'].push(tmp1);
          if (flag2 == 0) {
            tmpAcceleration['children'][0].type = that.points[i].type;
            flag2 = 1;
          }
        } else if (that.points[i].dataType == 2) {
          tmpSpeed['children'].push(tmp1);
          if (flag3 == 0) {
            tmpSpeed['children'][0].type = that.points[i].type;
            flag3 = 1;
          }
        }
      }
      // console.log('-------iii---------')
      if (tmpDisplacement.children.length > 1)
        this.pointTree1.push(tmpDisplacement);
      if (tmpAcceleration.children.length > 1)
        this.pointTree1.push(tmpAcceleration);
      if (tmpSpeed.children.length > 1)
        this.pointTree1.push(tmpSpeed);
      this.pointTree1.forEach((item, index, arr) => {
        arr[index].label = this.translateText("opPage.textMap.", item.id);
      })
    },
    setPointTree2() {
      this.pointTree2 = [];
      let tmpDisplacement = {
        id: '振动-位移',
        label: this.translateText('opPage.textMap.', "振动-位移"),
        xid: '振动-位移',
        disabled: true,
        children: []
      };
      let tmpAcceleration = {
        id: '振动-加速度',
        label: this.translateText('opPage.textMap.', "振动-加速度"),
        xid: '振动-加速度',
        disabled: true,
        children: []
      };
      let tmpSpeed = {
        id: '振动-速度',
        label: this.translateText('opPage.textMap.', "振动-速度"),
        xid: '振动-速度',
        disabled: true,
        children: []
      };
      for (const i in this.points) {
        let tmp1 = {
          id: this.points[i].pointId,
          pointUuid: this.points[i].pointUuid,
          label: this.points[i].pointName,
          xid: this.points[i].pointId,
          children: [],
          pid: this.points[i].pointId,
        };
        let type = this.points[i].type;
        if (type != 113 && type != 114) {
          // console.log(this.points[i].pointName)
        }
        for (const j in this.$store.state.features[type]) {
          let tmp2 = {
            id: tmp1['id'] + j.toString(),
            pointUuid: tmp1['pointUuid'],
            label: this.translateText("opPage.textMap.",this.$store.state.features[type][j].label),
            name: this.$store.state.features[type][j].label,
            xid: j.toString(),
            pid: tmp1['id']
          };
          tmp1['children'].push(tmp2);
        }
        this.pointSelectList2[tmp1['pointUuid']] = []
        if (this.points[i].dataType == 0) {
          tmpDisplacement['children'].push(tmp1);
        } else if (this.points[i].dataType == 1) {
          tmpAcceleration['children'].push(tmp1);
        } else if (this.points[i].dataType == 2) {
          tmpSpeed['children'].push(tmp1);
        }
      }
      if (tmpDisplacement.children.length > 0)
        this.pointTree2.push(tmpDisplacement);
      if (tmpAcceleration.children.length > 0)
        this.pointTree2.push(tmpAcceleration);
      if (tmpSpeed.children.length > 0)
        this.pointTree2.push(tmpSpeed);
      // console.log(this.pointTree2);
      this.pointTree2.forEach((item, index, arr) => {
        arr[index].label = this.translateText("opPage.textMap.", item.id);
      })
    },
    pointTree1Checked(data) {
      let checkedNodes = this.$refs.pointFeatureTree1.getCheckedNodes() || [];
      if (data) {
        //测点互斥
        checkedNodes.forEach(item => {
          if(item.dataType != data.dataType){
            this.$refs.pointFeatureTree1.setChecked(item.id, false);
            this.pointSelectList1[item.dataType] = []
          }
        })
        //全选
        if (data.hasOwnProperty('children')) {
          if(this.pointSelectList1[data.dataType].length){
            for(let i in data.children){
              this.$refs.pointFeatureTree1.setChecked(data.children[i].id, false);
            }
            this.pointSelectList1[data.dataType] = []
          }else{
            let maxNumIndex = data.children[0].hasOwnProperty('disabled') ? config.menu.MaxSelectedPointNumber : config.menu.MaxSelectedPointNumber - 1
            for(let i in data.children){
              if(i > maxNumIndex) this.$refs.pointFeatureTree1.setChecked(data.children[i].id, false);
              else{
                this.$refs.pointFeatureTree1.setChecked(data.children[i].id, true);
                if(data.children[i].hasOwnProperty('disabled')) continue
                this.pointSelectList1[data.dataType].push(data.children[i].id)
              }
            }
          }
        } else {
          let featureIdList = ['特征-位移','特征-加速度','特征-速度']
          //单选
          let index = this.pointSelectList1[data.dataType].indexOf(data.id)
          //特征测点id
          let featureId = featureIdList[data.dataType]
          this.$refs.pointFeatureTree1.setChecked(data.id, index == -1);
          if(index == -1) {
            //选中
            this.pointSelectList1[data.dataType].push(data.id)
            this.$refs.pointFeatureTree1.setChecked(featureId, true);
            if (this.pointSelectList1[data.dataType].length > config.menu.MaxSelectedPointNumber) {
              this.$refs.pointFeatureTree1.setChecked(this.pointSelectList1[data.dataType][0], false);
              this.pointSelectList1[data.dataType].shift()
            }
          }else{
            //取消选中
            this.pointSelectList1[data.dataType].splice(index, 1)
            if (this.pointSelectList1[data.dataType].length == 0) {
              this.$refs.pointFeatureTree1.setChecked(featureId, false);
            }
          }
        }
      }
      checkedNodes = this.$refs.pointFeatureTree1.getCheckedNodes() || [];
      let returnTreeData = {};
      returnTreeData['treeSelect'] = this.treeSelect;
      returnTreeData['checkedNodes'] = this.$refs.pointFeatureTree1.getHalfCheckedNodes();
      checkedNodes = checkedNodes.filter((item) => {
        return item.id.indexOf('特征') == -1;
      });
      for (let i = 0; i < checkedNodes.length; i++) {
        if (checkedNodes[i].label == "特征")
          continue;
        returnTreeData['featureSelect'] = this.featureSelect[checkedNodes[i].dataType]; //最好要改
        returnTreeData['checkedNodes'].push(checkedNodes[i]);
      }
      if (returnTreeData['checkedNodes'].length > 1) {
        returnTreeData.featureSelect = this.featureSelect[returnTreeData['checkedNodes'][1].dataType];
      }
      //第一次把选择的测点记录下来
      if(this.first1){
        this.first1 = false
        returnTreeData['checkedNodes'].forEach(item =>{
          if(!item.hasOwnProperty('children') && !item.hasOwnProperty('disabled')) {
            this.pointSelectList1[item.dataType].push(item.id)
          }
        })
      }

      // console.log("getPointFeatureTree2Data", returnTreeData);
      this.$emit('getPointFeatureTree2Data', returnTreeData);
    },
    pointTree2Checked(data) {

      let checkedNodes = this.$refs.pointFeatureTree2.getCheckedNodes();
      let halfCheckedNodes = this.$refs.pointFeatureTree2.getHalfCheckedNodes();
      if(data){
        //测点互斥
        checkedNodes.forEach(item => {
          if(item.pointUuid != data.pointUuid){
            this.$refs.pointFeatureTree2.setChecked(item.id, false);
            this.pointSelectList2[item.pointUuid] = []
          }
        })
        //全选
        if (data.hasOwnProperty('children')) {
          if(this.pointSelectList2[data.pointUuid].length){
            for(let i in data.children){
              this.$refs.pointFeatureTree2.setChecked(data.children[i].id, false);
            }
            this.pointSelectList2[data.pointUuid] = []
          }else{
            let maxNumIndex = config.menu.MaxSelectedPointNumber - 1
            for(let i in data.children){
              if(i > maxNumIndex) this.$refs.pointFeatureTree2.setChecked(data.children[i].id, false);
              else{
                this.$refs.pointFeatureTree2.setChecked(data.children[i].id, true);
                this.pointSelectList2[data.pointUuid].push(data.children[i].id)
              }
            }
          }
        } else {
          //单选
          let index = this.pointSelectList2[data.pointUuid].indexOf(data.id)
          this.$refs.pointFeatureTree2.setChecked(data.id, index == -1);
          if(index == -1) {
            //选中
            this.pointSelectList2[data.pointUuid].push(data.id)
            if (this.pointSelectList2[data.pointUuid].length > config.menu.MaxSelectedPointNumber) {
              this.$refs.pointFeatureTree2.setChecked(this.pointSelectList2[data.pointUuid][0], false);
              this.pointSelectList2[data.pointUuid].shift()
            }
          }else{
            //取消选中
            this.pointSelectList2[data.pointUuid].splice(index, 1)
          }
        }
      }
      checkedNodes = this.$refs.pointFeatureTree2.getCheckedNodes();
      halfCheckedNodes = this.$refs.pointFeatureTree2.getHalfCheckedNodes();
      var cc = [];
      let returnTreeData = {};
      // console.log("打印奇怪的东西",checkedNodes);
      if (checkedNodes.length > 0) {
        if (checkedNodes[0].id.indexOf('振动-') != -1) {
          for (var i = 1; i < checkedNodes.length; ++i) {
            cc.push(checkedNodes[i])
          }
          returnTreeData['type'] = checkedNodes[0].id;
          checkedNodes = cc;
        }
      }

      returnTreeData['treeSelect'] = this.treeSelect;
      returnTreeData['checkedNodes'] = [];
      for (let i = 0; i < halfCheckedNodes.length; i++) {
        if (halfCheckedNodes[i].id.indexOf("振动-") != -1) {
          returnTreeData['type'] = halfCheckedNodes[i].id;
          continue;
        }
        returnTreeData['checkedNodes'].push(halfCheckedNodes[i]);
        returnTreeData['checkedNodes'][0].type = returnTreeData['type'];
      }
      for (let i = 0; i < checkedNodes.length; i++) {
        if (checkedNodes[i].id.indexOf("振动-") != -1) {
          returnTreeData['type'] = checkedNodes[i].id;
          continue;
        }
        returnTreeData['checkedNodes'].push(checkedNodes[i]);
        returnTreeData['checkedNodes'][0].type = returnTreeData['type'];
      }
      // console.log(returnTreeData);
      if(this.first2){
        this.first2 = false
        returnTreeData['checkedNodes'].forEach(item =>{
          if(!item.hasOwnProperty('children')) {
            this.pointSelectList2[item.pointUuid].push(item.id)
          }
        })
      }
      this.$emit('getPointFeatureTree2Data', returnTreeData);
    },
    treeChange(value) {
      this.$nextTick(() => {
        if (value == "0") {
          this.pointTree1Checked();
        } else if (value == "1") {
          this.pointTree2Checked();
        }
      });
    },
    renderContent2(h, {node, data, store}){
      if (node.label == '特征') {
        // console.log(data.type)
        let dataType = 0;
        let tempTypeSelect = this.$store.state.features[data.type];
        // let tempTypeSelect = [];
        // console.log(node)
        if (node.data.id == '特征-位移') {
          dataType = 0;
        } else if (node.data.id == '特征-加速度') {
          dataType = 1;
        } else if (node.data.id == '特征-速度') {
          dataType = 2;
        }
        return h(
          "div", [
            h(
              "span", {
                style: {
                  fontSize: '14px',
                  color: this.mycolor,
                  marginRight: '5px'
                },
              }, this.translateText("opPage.textMap.","特征")
            ), h(
              "el-select", {
                class: "el-select--mini el-input--mini",
                style: {
                  width: '55%'
                },
                on: {
                  input: (value) => {
                    this.$set(this.featureSelect, dataType,value);
                    this.pointTree1Checked();
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
      } else {
        return h(
          "span", {
            domProps: {title: data.children ? data.id : ''},
            style: {
              fontSize: '14px',
              color: this.mycolor
            },
          }, node.label
        );
      }
    },
    renderContent(h, {node, data, store}) {
      if (node.label == '特征') {
        // console.log(data.type)
        let dataType = 0;
        let tempTypeSelect = this.$store.state.features[data.type];
        // let tempTypeSelect = [];
        // console.log(node)
        if (node.data.id == '特征-位移') {
          dataType = 0;
        } else if (node.data.id == '特征-加速度') {
          dataType = 1;
        } else if (node.data.id == '特征-速度') {
          dataType = 2;
        }
        return h("div", {class: "feature-content"}, [
            h("span", {
              style: {
                fontSize: '14px',
                color: this.mycolor,
                marginRight: '5px',
                display: 'flex',
                alignItems: 'center'
              },
            }, this.translateText("opPage.textMap.","特征")),
            h("div",  [
              h("el-select", {
                class: "el-select--mini el-input--mini",
                style: {
                  width: '100%'
                },
                on: {
                  input: (value) => {
                    this.$set(this.featureSelect, dataType, value);
                    this.pointTree1Checked();
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
                })])
            ])
          ]
        );
      } else {
        return h(
          "span", {
            domProps: { title: data.id },
            style: {
              fontSize: '14px',
              color: this.mycolor
            },
          }, node.label
        );
      }
    }
  }
}
</script>
<style lang="scss">
.trend-analysis-point-treejibeng {
  --pointcolor: #1D1E2C;
  --eltreecolor: #1D1E2C;
  --textcolor: #ffffff;
  --eltreebordercolor: #000;
  height: 228px;
  width: calc(100% - 18px);
  overflow: auto;
  background-color: var(--eltreecolor);
  padding: 8px 0 8px 8px;
  border-radius: 6px;
  border: 1px solid var(--eltreebordercolor);
  .el-tree {
    background: var(--eltreecolor);
    .feature-content{
      display: flex;
      width: 182px;
    }
    .feature-select{
      flex: 1;
    }
    .el-input {
      font-size: 14px;
      width: 100%;
    }
    .el-tree-node {
      display: block !important;
    }
    .el-input__inner, .el-input__icon {
      height: 28px;
      line-height: 28px;
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
      border-color: var(--textcolor)
    }
    .el-checkbox__input.is-disabled .el-checkbox__inner{
      background-color: var(--eltreecolor) !important;
      border-color: var(--textcolor) !important;
    }
    .el-checkbox__inner::before{
      background-color: #C0C4CC
    }
    .el-checkbox__inner::before{
      background-color: #C0C4CC
    }
  }

}
</style>
