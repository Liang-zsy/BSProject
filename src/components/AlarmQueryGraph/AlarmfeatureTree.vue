<!--
PointFeatureTree2组件使用说明：
1. 将PointFeatureTree2引入你的组件 在操作页<el-form></el-form>标签中使用<PointFeatureTree2></PointFeatureTree2>
2. 组件属性：
**必须属性**  equid 属性类型 String 传入设备id <PointFeatureTree2 :equid="this.equid"></PointFeatureTree2>
2. Events：
getPointFeatureTree2Data    振动测点树节点初始化时选中状态及发生变化时选中状态回调   回调参数为测点树数据对象，格式为：
{
  treeSelect: String,
  featureSelect: Number,
  checkedNodes: Array  [{},{}]
}
-->

<template>
  <div class="AlarmFeatureTreeGeneral" ref="ui">
    <el-radio-group v-model="treeSelect" @change="treeChange" class="pointType">
      <el-radio label="0">{{translateText('opPage.textMap.','不同测点')}}</el-radio>
      <el-radio label="1">{{translateText('opPage.textMap.','相同测点')}}</el-radio>
    </el-radio-group>
    <div class="AlarmTreeGeneral">
      <div  v-show="treeSelect == 0">

        <!-- <el-scrollbar style="height:100%"> -->
        <el-tree :data="pointTree1" show-checkbox node-key="id"
                 :default-expanded-keys="expandedKeys1"
                 @node-expand="handleExpandChange1"
                 @node-collapse="handleCollapsedChange1"
                 @check="pointTree1Checked"
                 accordion ref="pointFeatureTree1" :render-content="renderContent"></el-tree>
        <!-- </el-scrollbar> -->
      </div>
      <div  v-show="treeSelect == 1">

        <el-tree :data="pointTree2" accordion show-checkbox node-key="id"
                 :default-expanded-keys="expandedKeys2"
                 @node-expand="handleExpandChange2"
                 @node-collapse="handleCollapsedChange2"
                 @check="pointTree2Checked" ref="pointFeatureTree2" :render-content="renderContent"></el-tree>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AlarmfeatureTree",
  props: {
    //获取当前的时间戳
    // required: true
  },
  data() {
    return {
      mycolor: '#ffffff',
      expandedKeys1: [],
      expandedKeys2: [],
      firstSelectTree1: true,
      firstSelectTree2: true,
      nowstatic: 0,
      treeSelect: "0",
      check1: null,
      check2: null,
      // featureSelect: 0,
      // typeSelect: [
      //   {id: 0, label: "通频"},
      //   {id: 1, label: "1倍频幅值"},
      //   {id: 2, label: "2倍频幅值"},
      //   {id: 3, label: "3倍频幅值"},
      //   {id: 4, label: "1/2倍频幅值"},
      //   {id: 5, label: "残振"},
      //   {id: 6, label: "直流量"},
      //   {id: 7, label: "间隙电压"},
      //   {id: 8, label: "1倍频相位"},
      //   {id: 9, label: "2倍频相位"},
      //   {id: 10, label: "3倍频相位"},
      //   {id: 11, label: "1/2倍频相位"}
      // ],
      points: [],
      lastPoints: [],
      pointTree1: [],
      pointTree2: [],
      visflag: 0,
      NowLsttime: null,
      //后来的测点树
      NowPoints: [],
      NowCheckedNodes:'',

      Grouping: [],
      featureSelect: {
        jiasudu: 0,
        sudu: 0,
        weiyi: 0
      },
      typeSelect: {
        //振动加速度  datatpye(1)
        'jiasudu': [
          {id: 0, label: "加速度峰值", unit: "mm/s2"},
          {id: 1, label: "加速度高频", unit: "mm/s2"},
          {id: 2, label: "加速度低频", unit: "mm/s2"},
          {id: 3, label: "加速度波形峭度", unit: ""},
          {id: 4, label: "速度有效值", unit: "mm/s2"},
          {id: 5, label: "通频gIE值", unit: "gIE"},
        ],
        //振动速度 datatpye(2)
        'sudu': [
          {id: 0, label: "通频有效值", unit: "mm/s"},
          {id: 1, label: "1倍频幅有效值", unit: "mm/s"},
          {id: 2, label: "2倍频有效值", unit: "mm/s"},
          {id: 3, label: "3倍频有效值", unit: "mm/s"},
          {id: 4, label: "1/2倍频有效值", unit: "mm/s"},
          {id: 5, label: "残振有效值", unit: "mm/s"},
        ],
        //振动位移 datatpye(0)
        'weiyi': [
          {id: 0, label: "加速度峰值", unit: "mm/s2"},
          {id: 1, label: "加速度高频", unit: "mm/s2"},
          {id: 2, label: "加速度低频", unit: "mm/s2"},
          {id: 3, label: "加速度波形峭度", unit: ""},
          {id: 4, label: "速度有效值", unit: "mm/s"},
          {id: 5, label: "通频gIE值", unit: "gIE"},
        ]
      },
      pointSelectList: {
        'jiasudu': [],
        'sudu': [],
        'weiyi': [],
        '温度': [],
        '压力': [],
        '流量': [],
        '其它': []
      },
      first: true,
      pointSelectList2: {},
      first2: true,
      firstLoad: true,//第一次不执行activated，避免和setPointTree（）方法冲突
      activatedFlag: false
    };
  },

  mounted() {
    this.nowstatic = 0;
    // this.getdata(this.equid)
    if (this.nodeData[this.equid] != undefined) {
      // this.setPointTree(this.equid);
    }
    //  this.getdata(equit);
    this.mycolor = this.$store.state.textcolor;
    this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
    this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
    this.treeSelect = this.globalTreeSelect
  },
  activated() {
    this.activatedFlag = true
    if(!this.firstLoad){
      this.syncGlobalPoint()
      this.syncGlobalPointEnd()
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
    globalMeasurementId(){
      return this.$store.state.globalMeasurementId
    }
  },

  watch: {
    '$i18n.locale'() {
      this.pointTree1.forEach((item, index, arr) => {
        arr[index].label = this.translateText("opPage.textMap.",item.id);
      })
      this.pointTree2.forEach((item, index, arr) => {
        arr[index].label = this.translateText("opPage.textMap.",item.id);
      })
      for(let i in this.pointTree2){
        for(let j in this.pointTree2[i].children){
          for(let k in this.pointTree2[i].children[j].children){
            this.pointTree2[i].children[j].children[k].label = this.translateText('opPage.textMap.', this.pointTree2[i].children[j].children[k].zhLabel)
          }
        }
      }
    },

    NowLsttime: {
      handler() {

      }
    },
    equid: {
      handler(newEquid) {
        // this.$nextTick(()=>this.getdata(newEquid));
        //this.getdata(this.equid)
      }
    },
    nodeNum: {
      handler() {
        //  this.getdata(this.equid)
      }
    },
    topiccolor(val) {
      this.mycolor = this.$store.state.textcolor;
      this.$refs.ui.style.setProperty('--pointcolor', this.$store.state.pointcolor);
      this.$refs.ui.style.setProperty('--eltreecolor', this.$store.state.eltreecolor);
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--eltreebordercolor', this.$store.state.eltreebordercolor);
    },
    globalTreeSelect(val){
      if(val == '0'){
        this.$store.state.globalMeasurementId = ''
      }
      this.treeSelect = val
    },
  },

  methods: {

    syncGlobalPoint(){
      let tempCheckedKeys = this.globalPointId.split(',')
      //多通道
      let flag = false //找到测点结束循环
      for(let i in tempCheckedKeys){
        for(let j in this.pointTree1){
          for(let k in this.pointTree1[j].children) {
            if(this.pointTree1[j].children[k].id == tempCheckedKeys[i]) {
              if(this.pointTree1[j].children[0].hasOwnProperty('disabled')) {
                flag = true
                this.expandedKeys1 = []
                this.expandedKeys1.push(this.pointTree1[j].id)
                tempCheckedKeys.push(this.pointTree1[j].children[0].id) //将该类测点特征值加入keys中
                break;//振动测点只会选中一类，找到结束循环
              }
            }
          }
          if(flag) break;
        }
        if(flag) break;
      }
      this.$refs.pointFeatureTree1.setCheckedKeys(tempCheckedKeys)
      //单通道
      flag = false //找到测点结束循环
      for(let i in tempCheckedKeys){
        for(let j in this.pointTree2){
          for(let k in this.pointTree2[j].children) {
            if(this.pointTree2[j].children[k].label == tempCheckedKeys[i] || this.pointTree2[j].children[k].id == tempCheckedKeys[i]) {
              flag = true
              this.expandedKeys2 = []
              this.expandedKeys2.push(this.pointTree2[j].id)
              if(this.globalMeasurementId) {
                this.$refs.pointFeatureTree2.setCheckedKeys(this.globalMeasurementId.split(','));
              }else{
                if(this.pointTree2[j].children[k].hasOwnProperty('children')) this.$refs.pointFeatureTree2.setCheckedKeys([this.pointTree2[j].children[k].children[0].id]);
                else this.$refs.pointFeatureTree2.setCheckedKeys([this.pointTree2[j].children[k].id]);
              }
              break;//单通道选中一个测点，找到结束循环
            }
          }
          if(flag) break;
        }
        if(flag) break;
      }
      if(!flag) this.$refs.pointFeatureTree2.setCheckedKeys([]) //没找到全局测点，不选中测点
    },
    syncGlobalPointEnd(){
      if (this.treeSelect == 0) {
        this.first = true
        this.pointSelectList = {
          'jiasudu': [],
          'sudu': [],
          'weiyi': [],
          '温度': [],
          '压力': [],
          '流量': [],
          '其它': []
        }

        if(this.$refs.pointFeatureTree1.getCheckedNodes().length == 0) {
          for (let item in this.pointTree1) {
            if (this.pointTree1[item].children.length > 0) {
              this.expandedKeys1.push(this.pointTree1[item].id)
              if(['weiyi','jiasudu','sudu'].includes(this.pointTree1[item].dtype)){
                this.$refs.pointFeatureTree1.setCheckedKeys([this.pointTree1[item].children[0].id, this.pointTree1[item].children[1].id]); //振动选择特征测点 加一个实际测点
              }else{
                this.$refs.pointFeatureTree1.setCheckedKeys([this.pointTree1[item].children[0].id]);  //工艺量测点选择第一个测点
              }
              break
            }
          }
        }
        this.pointTree1Checked()
      } else {
        this.first2 = true
        Object.keys(this.pointSelectList2).forEach(key => {
          this.pointSelectList2[key] = [];
        });

        if(this.$refs.pointFeatureTree2.getCheckedNodes().length == 0) {
          for (let item in this.pointTree2) {
            if (this.pointTree2[item].children.length > 0 && this.pointTree2[item].children[0].children.length > 0) {
              this.expandedKeys2.push(this.pointTree2[item].id)
              this.$refs.pointFeatureTree2.setCheckedKeys([this.pointTree2[item].children[0].children[0].id]);
              break;
            }
          }
        }
        this.pointTree2Checked();
      }
    },
    // 监听节点展开/折叠事件：
    handleExpandChange1(data, node) {
      this.expandedKeys1.push(data.id);
    },
    handleCollapsedChange1(data, node) {
      this.expandedKeys1.splice(this.expandedKeys1.indexOf(data.id), 1);
    },

    // 监听节点展开/折叠事件：
    handleExpandChange2(data, node) {
      this.expandedKeys2.push(data.id);
    },
    handleCollapsedChange2(data, node) {
      this.expandedKeys2.splice(this.expandedKeys2.indexOf(data.id), 1);
    },

    getdata(equit) {
      //从vuex中获取特征值和单位
      this.typeSelect['jiasudu'] = this.$store.state.features[113];
      this.typeSelect['sudu'] = this.$store.state.features[114];
      this.typeSelect['weiyi'] = this.$store.state.features[113];

      this.points = [];
      this.lastPoints = [];
      var stime = this.NowLsttime.form.starttime;
      var etime = this.NowLsttime.form.endtime;
      let that = this;
      const data = that.equipmentDetail[equit];
      if (data == undefined)
        return;
      //振动测点进行分类（缺少轴位移）
      this.points = [];
      this.points.push(data.filter(item => item["channelType"] === 1));   //振动
      this.points.push(data.filter(item => item["channelType"] === 4));   //温度
      this.points.push(data.filter(item => item["channelType"] === 3));   //压力
      this.points.push(data.filter(item => item["channelType"] === 5));   //流量
      this.points.push(data.filter(item => item["channelType"] === 6));   //其它
      // this.points[0] = [];
      // this.points[1] = [];
      // this.points[2] = [];
      // this.points[3] = [];
      var netinfor = '/equipment/' + equit + '/' + stime + '/' + etime + "/event";
      this.$axios.get(netinfor).then(res => {
        if (res.data.code === 200 || res.data.code == 400) {
          if (res.data.data != null) {
            let NowData = [];
            NowData = res.data.data;
            var map = {}, dest = [];
            for (var i = 0; i < NowData.length; i++) {
              var ai = NowData[i];
              if (!map[ai.pointUuid]) {
                dest.push({
                  pointUuid: ai.pointUuid,
                  pointName: ai.pointName,
                  pointId: ai.pointId,
                  alarmAlias: ai.alarmAlias,
                  alarmStatus: ai.alarmStatus,
                  channelType: ai.channelType,
                  alarmStartTime: [ai.alarmStartTime]

                });
                map[ai.pointUuid] = ai;
              } else {
                for (var j = 0; j < dest.length; j++) {
                  var dj = dest[j];
                  if (dj.pointUuid == ai.pointUuid) {
                    dj.alarmStartTime.push(ai.alarmStartTime);
                    break;
                  }
                }
              }
            }
            this.lastPoints = dest;
          }
          this.setPointTree1();
          this.setPointTree2()
          this.pointTree1.forEach((item, index, arr) => {
            arr[index].label = this.translateText("opPage.textMap.",item.id);
          })
          this.pointTree2.forEach((item, index, arr) => {
            arr[index].label = this.translateText("opPage.textMap.",item.id);
          })
          this.$nextTick(() => {
            if (this.nowstatic == 0) {
              //如果路径参数传递了pointId 去选中对应的测点
              this.syncGlobalPoint()
              this.syncGlobalPointEnd()
            } else {
              this.$refs.pointFeatureTree1.setCheckedNodes(that.check1);
              this.$refs.pointFeatureTree2.setCheckedNodes(that.check2);
              this.syncGlobalPointEnd()
            }
          });

        } else {

        }
      })
    },


    setPointTree1() {
      console.log("qdy->实现了吗")
      this.pointTree1 = [];
      let nowOutherTree = [];
      if (this.points[0].length != 0) {   //振动


        let tmpi = {
          type: 'jiasudu',
          dtype:'jiasudu',
          id: '振动-加速度',
          label: '振动-加速度',
          pos: 'jiasudu',
          parent: '振动',
          children: []

        }

        let tmpj = {
          type: 'sudu',
          dtype:'sudu',
          id: '振动-速度',
          label: '振动-速度',
          parent: '振动',
          pos: 'sudu',
          children: []

        }

        let tmpk = {
          type: 'weiyi',
          dtype:'weiyi',
          id: '振动-位移',
          label: '振动-位移',
          parent: '振动',
          pos: 'weiyi',
          children: []

        }

        tmpi.children.push({
          id: '特征1',
          type: 'jiasudu',
          dtype: 'jiasudu',
          pos: 'jiasudu',
          label: '特征',
          disabled: true
        })
        tmpj.children.push({
          id: '特征2',
          type: 'sudu',
          dtype: 'sudu',
          pos: 'sudu',
          label: '特征',
          disabled: true
        })
        tmpk.children.push({
          id: '特征3',
          type: 'weiyi',
          dtype: 'weiyi',
          pos: 'weiyi',
          label: '特征',
          disabled: true
        })
        // let tmp2 = {};
        // tmp2['id'] = '特征';
        // tmp2['label'] = tmp2['id'];
        // tmp2['disabled'] = true;
        // tmp['children'].push(tmp2);

        var mymp = {
          0: 'weiyi',
          1: 'jiasudu',
          2: 'sudu'
        }
        // console.log(mymp);
        for (const i in this.points[0]) {

          let tmp1 = {};
          tmp1['dtype'] = mymp[this.points[0][i].dataType]
          tmp1['id'] = this.points[0][i].pointId;
          tmp1['label'] = this.points[0][i].pointName;
          tmp1['pointUuid'] = this.points[0][i].pointUuid;
          tmp1["parent"] = "振动";
          tmp1["type"] = this.points[0][i].type;
          if (this.lastPoints.length != 0) {
            var zhendongtemp = 0;
            for (var j = 0; j < this.lastPoints.length; j++) {
              if (this.lastPoints[j].pointName == this.points[0][i].pointName) {  //如果名字一样
                zhendongtemp = 1;
                tmp1["alarmStatus"] = this.lastPoints[j].alarmStatus;
                tmp1["alarmStartTime"] = this.lastPoints[j].alarmStartTime;

                if (this.lastPoints[j].alarmStatus == 1) {
                  tmp1['icon'] = 'iconfont icon-jinggao red'
                }
                if (this.lastPoints[j].alarmStatus == 2) {
                  tmp1['icon'] = 'iconfont icon-jinggao yellow'
                }
              }
              if (zhendongtemp == 0) {
                tmp1["alarmStatus"] = "";
                tmp1["alarmStartTime"] = "";
                // tmp1['icon'] = 'el-icon-s-claim normal'
                tmp1['icon'] = 'iconfont icon-normal green'
              }
            }
          } else {
            tmp1["alarmStatus"] = "";
            tmp1["alarmStartTime"] = "";
            // tmp1['icon'] = 'el-icon-s-claim normal'
            tmp1['icon'] = 'iconfont icon-normal green'
          }

          if (tmp1.dtype == 'jiasudu') {
            tmpi['children'].push(tmp1)
          } else if (tmp1.dtype == 'sudu') {
            tmpj['children'].push(tmp1)
          } else if (tmp1.dtype == 'weiyi') {
            tmpk['children'].push(tmp1)
          }
          //tmp['children'].push(tmp1);

        }

        if (tmpi.children.length > 1)
          nowOutherTree.push(tmpi);
        if (tmpj.children.length > 1)
          nowOutherTree.push(tmpj);
        if (tmpk.children.length > 1)
          nowOutherTree.push(tmpk);

      }
      //工艺
      for (var i = 1; i < this.points.length; i++) {
        let tempNode = {};

        if (this.points[i].length != 0) {
          switch (i) {
            case 1:
              tempNode['id'] = "温度";
              tempNode['label'] = "温度";
              tempNode['dtype'] = "温度";
              break;
            case 2:
              tempNode['id'] = "压力";
              tempNode['label'] = "压力";
              tempNode['dtype'] = "压力";
              break;
            case 3:
              tempNode['id'] = "流量";
              tempNode['label'] = "流量";
              tempNode['dtype'] = "流量";
              break;
            case 4:
              tempNode['id']="其它";
              tempNode['label']="其它";
              tempNode['dtype']="其它";
              break;
          }

          tempNode['children'] = [];

          for (const j in this.points[i]) {
            let outhertmp1 = {};
            // console.log(this.points[i][j].pointId)
            outhertmp1['id'] = this.points[i][j].pointId;
            outhertmp1['label'] = this.points[i][j].pointName;
            outhertmp1['pointUuid'] = this.points[i][j].pointUuid;
            outhertmp1["parent"] = tempNode['id'];
            outhertmp1["dtype"] = tempNode['id'];
            if (this.lastPoints.length != 0) {
              var temp = 0;
              for (var k = 0; k < this.lastPoints.length; k++) {
                if (this.lastPoints[k].pointName == this.points[i][j].pointName) {
                  temp = 1;
                  outhertmp1["alarmStatus"] = this.lastPoints[k].alarmStatus;
                  outhertmp1["alarmStartTime"] = this.lastPoints[k].alarmStartTime;

                  if (this.lastPoints[k].alarmStatus == 1) {
                    outhertmp1['icon'] = 'iconfont icon-jinggao red'
                  } else if (this.lastPoints[k].alarmStatus == 2) {
                    outhertmp1['icon'] = 'iconfont icon-jinggao yellow'
                  }

                }

                if (temp == 0) {
                  outhertmp1["alarmStatus"] = "";
                  outhertmp1["alarmStartTime"] = "";
                  // outhertmp1['icon'] = 'el-icon-s-claim normal'
                  outhertmp1['icon'] = 'iconfont icon-normal green'
                }
              }
            } else {
              outhertmp1["alarmStatus"] = "";
              outhertmp1["alarmStartTime"] = "";
              // outhertmp1['icon'] = 'el-icon-s-claim normal'
              outhertmp1['icon'] = 'iconfont icon-normal green'
            }

            tempNode['children'].push(outhertmp1);
          }

          if (tempNode.children.length > 0)
            nowOutherTree.push(tempNode);
        }
      }

      this.pointTree1 = nowOutherTree;
      // console.log(this.pointTree1);
      // console.log("777777777777777")
    },

    setPointTree2() {
      this.pointTree2 = [];
      let nowOutherTree = [];
      //如果是振动
      if (this.points[0].length != 0) {

        let tmpi = {};
        tmpi['id'] = '振动-加速度';
        tmpi['dtype'] = 'jiasudu'
        tmpi['label'] = tmpi['id'];
        tmpi['xid'] = tmpi['id'];
        tmpi['disabled'] = true;
        // tmpi['disabled'] = true;
        tmpi['children'] = [];
        let tmpj = {};
        tmpj['id'] = '振动-速度';
        tmpj['dtype'] = 'sudu'
        tmpj['label'] = tmpj['id'];
        tmpj['xid'] = tmpj['id'];
        tmpj['disabled'] = true;
        //tmpj['disabled'] = true;
        tmpj['children'] = [];
        let tmpk = {};
        tmpk['dtype'] = 'weiyi'
        tmpk['id'] = '振动-位移';
        tmpk['label'] = tmpk['id'];
        tmpk['xid'] = tmpk['id'];
        tmpk['disabled'] = true;
        //tmpk['disabled'] = true;
        tmpk['children'] = [];
        var mymp = {
          0: 'weiyi',
          1: 'jiasudu',
          2: 'sudu'
        }

        //   this.points.sort((a, b) => a.pointName.localeCompare(b.pointName));
        for (const i in this.points[0]) {

          let tmp1 = {};
          tmp1['id'] = this.points[0][i].pointId;
          tmp1['pointUuid'] = this.points[0][i].pointUuid;
          tmp1['label'] = this.points[0][i].pointName;
          tmp1['dtype'] = mymp[this.points[0][i].dataType]
          // tmp1["alarmAlias"]=this.points[0][i].alarmAlias;
          // tmp1["alarmStatus"]=this.points[0][i].alarmStatus;
          // tmp1["alarmStartTime"]=this.points[0][i].alarmStartTime;
          tmp1["parent"] = "振动";
          tmp1['xid'] = tmp1['id'];
          tmp1["type"] = this.points[0][i].type;
          // if(this.points[0][i].alarmStatus==1){
          //   tmp1['icon']='iconfont icon-jinggao red'
          // }
          // if(this.points[0][i].alarmStatus==2){
          //   tmp1['icon']='iconfont icon-jinggao yellow'
          // }
          // if(this.points[0][i].alarmStatus==3){
          //   tmp1['icon']='el-icon-s-claim normal'
          // }
          if (this.lastPoints.length != 0) {
            var zhendongtemp = 0;

            for (var j = 0; j < this.lastPoints.length; j++) {
              if (this.lastPoints[j].pointName == this.points[0][i].pointName) {  //如果名字一样
                zhendongtemp = 1;
                tmp1["alarmStatus"] = this.lastPoints[j].alarmStatus;
                tmp1["alarmStartTime"] = this.lastPoints[j].alarmStartTime;

                if (this.lastPoints[j].alarmStatus == 1) {
                  tmp1['icon'] = 'iconfont icon-jinggao red'
                }
                if (this.lastPoints[j].alarmStatus == 2) {
                  tmp1['icon'] = 'iconfont icon-jinggao yellow'
                }
              }
              if (zhendongtemp == 0) {
                tmp1["alarmStatus"] = "";
                tmp1["alarmStartTime"] = "";
                // tmp1['icon'] = 'el-icon-s-claim normal'
                tmp1['icon'] = 'iconfont icon-normal green'
              }
            }
          } else {
            tmp1["alarmStatus"] = "";
            tmp1["alarmStartTime"] = "";
            // tmp1['icon'] = 'el-icon-s-claim normal'
            tmp1['icon'] = 'iconfont icon-normal green'
          }

          tmp1['children'] = [];
          for (const j in this.typeSelect[tmp1['dtype']]) {
            let tmp2 = {};
            tmp2['parent'] = "振动";
            tmp2['id'] = tmp1['id'] + j.toString();
            tmp2['pointUuid'] = tmp1['pointUuid'];
            tmp2['dtype'] = tmp1['dtype']
            tmp2['type'] = tmp1['type']
            tmp2['label'] = this.translateText("opPage.textMap.", this.typeSelect[tmp1['dtype']][j].label);
            tmp2['zhLabel'] = this.typeSelect[tmp1['dtype']][j].label;
            tmp2['unit'] = this.typeSelect[tmp1['dtype']][j].unit;
            tmp2['xid'] = j.toString();
            tmp2['pid'] = tmp1['id'] //父节点的pointId
            tmp1['children'].push(tmp2);
          }
          this.pointSelectList2[tmp1['pointUuid']] = []
          // console.log(i, tmp1['dtype'])
          if (tmp1['dtype'] == 'weiyi') {
            tmpk['children'].push(tmp1);
          }
          if (tmp1['dtype'] == 'jiasudu') {
            tmpi['children'].push(tmp1);
          }
          if (tmp1['dtype'] == 'sudu') {
            tmpj['children'].push(tmp1);
          }

        }
        if (tmpi.children.length > 0)
          nowOutherTree.push(tmpi);
        if (tmpj.children.length > 0)
          nowOutherTree.push(tmpj);
        if (tmpk.children.length > 0)
          nowOutherTree.push(tmpk);

      }

      //工艺
      for (var i = 1; i < this.points.length; i++) {
        let tempNode = {};
        if (this.points[i].length != 0) {
          switch (i) {
            case 1:
              tempNode['id'] = "温度";
              tempNode['label'] = "温度";
              tempNode['dtype'] = "温度";
              break;
            case 2:
              tempNode['id'] = "压力";
              tempNode['label'] = "压力";
              tempNode['dtype'] = "压力";
              break;
            case 3:
              tempNode['id'] = "流量";
              tempNode['label'] = "流量";
              tempNode['dtype'] = "流量";
              break;
            case 4:
              tempNode['id']="其它";
              tempNode['label']="其它";
              tempNode['dtype']="其它";
              break;
          }
          this.pointSelectList2[tempNode['dtype']] = []

          tempNode['children'] = [];

          for (const j in this.points[i]) {
            let outhertmp1 = {};
            // console.log(this.points[i][j].pointId)
            outhertmp1['id'] = this.points[i][j].pointId;
            outhertmp1['label'] = this.points[i][j].pointName;
            outhertmp1['pointUuid'] = this.points[i][j].pointUuid;
            outhertmp1["type"] = this.points[i][j].type;
            outhertmp1["dtype"] = tempNode['id'];
            outhertmp1["pid"] = this.points[i][j].pointId;//工艺量测点没有特征值pid设置为pointId
            outhertmp1["parent"] = tempNode['id'];
            if (this.lastPoints.length != 0) {
              var temp = 0;
              for (var k = 0; k < this.lastPoints.length; k++) {
                if (this.lastPoints[k].pointName == this.points[i][j].pointName) {
                  temp = 1;
                  outhertmp1["alarmStatus"] = this.lastPoints[k].alarmStatus;
                  outhertmp1["alarmStartTime"] = this.lastPoints[k].alarmStartTime;

                  if (this.lastPoints[k].alarmStatus == 1) {
                    outhertmp1['icon'] = 'iconfont icon-jinggao red'
                  } else if (this.lastPoints[k].alarmStatus == 2) {
                    outhertmp1['icon'] = 'iconfont icon-jinggao yellow'
                  }

                }

                if (temp == 0) {
                  outhertmp1["alarmStatus"] = "";
                  outhertmp1["alarmStartTime"] = "";
                  // outhertmp1['icon'] = 'el-icon-s-claim normal'
                  outhertmp1['icon'] = 'iconfont icon-normal green'
                }
              }
            } else {
              outhertmp1["alarmStatus"] = "";
              outhertmp1["alarmStartTime"] = "";
              // outhertmp1['icon'] = 'el-icon-s-claim normal'
              outhertmp1['icon'] = 'iconfont icon-normal green'
            }


            tempNode['children'].push(outhertmp1);
          }

          if (tempNode.children.length > 0)
            nowOutherTree.push(tempNode);
        }
      }
      this.pointTree2 = nowOutherTree

    },
    pointTree1Checked(data) {
      console.log("qdy->是否点击了",data)
      // console.log(this.pointTree1 , 'shaqingkuang');
      let that = this;
      let returnTreeData = {
        unit: {}
      };
      // 将 featureSelect 对象添加到 returnTreeData 中
      returnTreeData['featureSelect'] = that.featureSelect;
      // returnTreeData['unit'] = this.typeSelect[this.featureSelect].unit

      // 遍历 featureSelect 对象并根据 typeSelect 中的 unit 属性填充 returnTreeData 中的 unit
      for (var item in that.featureSelect) {
        returnTreeData['unit'][item] = that.typeSelect[item][that.featureSelect[item]].unit
      }
      // console.log(returnTreeData.unit)

      // 获取全选的节点
      let CheckedNodes = that.$refs.pointFeatureTree1.getCheckedNodes();
      // that.NowCheckedNodes=CheckedNodes;
      // 获取半选的节点
      if(data){
        //振动测点互斥
        if (data.dtype == 'weiyi' || data.dtype == 'jiasudu' || data.dtype == 'sudu') {
          CheckedNodes.forEach(item => {
            if(item.dtype != data.dtype && item.dtype != '温度' && item.dtype != '压力' && item.dtype != '流量' && item.dtype != '其它'){
              this.$refs.pointFeatureTree1.setChecked(item.id, false);
              this.pointSelectList[item.dtype] = []
            }
          })
        }
        //全选
        if (data.hasOwnProperty('children')) {
          if(this.pointSelectList[data.dtype].length){
            for(let i in data.children){
              this.$refs.pointFeatureTree1.setChecked(data.children[i].id, false);
            }
            this.pointSelectList[data.dtype] = []
          }else{
            let maxNumIndex = data.children[0].hasOwnProperty('disabled') ? config.menu.MaxSelectedPointNumber : config.menu.MaxSelectedPointNumber - 1
            for(let i in data.children){
              if(i > maxNumIndex) this.$refs.pointFeatureTree1.setChecked(data.children[i].id, false);
              else{
                this.$refs.pointFeatureTree1.setChecked(data.children[i].id, true);
                if(data.children[i].hasOwnProperty('disabled')) continue
                this.pointSelectList[data.dtype].push(data.children[i].id)
              }
            }
          }
        } else {
          //单选
          let index = this.pointSelectList[data.dtype].indexOf(data.id)
          let featureIdList = {
            'jiasudu': '特征1',
            'sudu': '特征2',
            'weiyi': '特征3',
          }
          //特征测点id
          let featureId = featureIdList[data.dtype]
          this.$refs.pointFeatureTree1.setChecked(data.id, index == -1);
          if(index == -1) {
            //选中
            this.pointSelectList[data.dtype].push(data.id)
            if(featureId) this.$refs.pointFeatureTree1.setChecked(featureId, true);
            if (this.pointSelectList[data.dtype].length > config.menu.MaxSelectedPointNumber) {
              this.$refs.pointFeatureTree1.setChecked(this.pointSelectList[data.dtype][0], false);
              this.pointSelectList[data.dtype].shift()
            }
          }else{
            //取消选中
            this.pointSelectList[data.dtype].splice(index, 1)
            if (this.pointSelectList[data.dtype].length == 0 && featureId) {
              this.$refs.pointFeatureTree1.setChecked(featureId, false);
            }
          }
        }
      }
      returnTreeData['checkNodes'] = that.$refs.pointFeatureTree1.getHalfCheckedNodes();
      CheckedNodes = that.$refs.pointFeatureTree1.getCheckedNodes();
      // 将所有全选的节点添加到 returnTreeData.checkNodes，除了标签为 "特征" 的节点
      for (let i = 0; i < CheckedNodes.length; i++) {
        if (CheckedNodes[i].label == "特征")
          continue;
        returnTreeData['checkNodes'].push(CheckedNodes[i]);
      }
      if(returnTreeData.checkNodes.length !=0){
        for (const i in returnTreeData.checkNodes){
          // 针对 returnTreeData.checkNodes 中的每个节点进行处理，如果节点的标签包含 '振动-' 或等于 "温度"，"压力" 或 "流量"
          if(returnTreeData.checkNodes[i].label.indexOf('振动-') != -1 ||returnTreeData.checkNodes[i].label == "温度"||
            returnTreeData.checkNodes[i].label=="压力" || returnTreeData.checkNodes[i].label=="流量"||
            returnTreeData.checkNodes[i].label=="其它"){
            if(this.firstSelectTree1) this.expandedKeys1=[returnTreeData.checkNodes[i].label]
            this.firstSelectTree1 = false
          }
        }
      }
      //第一次把选择的测点记录下来
      if(this.first){
        this.first = false
        returnTreeData['checkNodes'].forEach(item =>{
          if(!item.hasOwnProperty('children') && !item.hasOwnProperty('disabled')) {
            this.pointSelectList[item.dtype].push(item.id)
          }
        })
      }
      // 触发一个自定义事件 getPointFeatureTree2Data，并将 returnTreeData 对象和 that.treeSelect 作为参数传递到操作页
      that.$emit('getPointFeatureTree2Data', returnTreeData, that.treeSelect);
      //保存当前所选测点到全局变量
      let tempCheckedNodes = returnTreeData['checkNodes'].filter(item =>{
        return !item.hasOwnProperty('children') && !item.hasOwnProperty('disabled')
      })
      let ids = tempCheckedNodes.map(item => item.id);
      this.$store.state.globalPointId = ids.join(',');
      this.$store.state.pointId = this.$store.state.globalPointId
    },

    pointTree2Checked(data) {
      let that = this;
      let checkedNodes = that.$refs.pointFeatureTree2.getCheckedNodes();
      if(data){
        let key
        //振动测点互斥
        if (data.dtype == 'weiyi' || data.dtype == 'jiasudu' || data.dtype == 'sudu') {
          //振动测点数组以pointUuid为键
          key = data.pointUuid
          checkedNodes.forEach(item => {
            if(item.pointUuid != data.pointUuid && item.dtype != '温度' && item.dtype != '压力' && item.dtype != '流量' && item.dtype != '其它'){
              this.$refs.pointFeatureTree2.setChecked(item.id, false);
              this.pointSelectList2[item.pointUuid] = []
            }
          })
        }else{
          //工艺量测点数组以dtype为键
          key = data.dtype
        }
        //全选
        if (data.hasOwnProperty('children')) {
          if(this.pointSelectList2[key].length){
            for(let i in data.children){
              this.$refs.pointFeatureTree2.setChecked(data.children[i].id, false);
            }
            this.pointSelectList2[key] = []
          }else{
            let maxNumIndex = config.menu.MaxSelectedPointNumber - 1
            for(let i in data.children){
              if(i > maxNumIndex) this.$refs.pointFeatureTree2.setChecked(data.children[i].id, false);
              else{
                this.$refs.pointFeatureTree2.setChecked(data.children[i].id, true);
                this.pointSelectList2[key].push(data.children[i].id)
              }
            }
          }
        } else {
          //单选
          let index = this.pointSelectList2[key].indexOf(data.id)
          this.$refs.pointFeatureTree2.setChecked(data.id, index == -1);
          if(index == -1) {
            //选中
            this.pointSelectList2[key].push(data.id)
            if (this.pointSelectList2[key].length > config.menu.MaxSelectedPointNumber) {
              this.$refs.pointFeatureTree2.setChecked(this.pointSelectList2[key][0], false);
              this.pointSelectList2[key].shift()
            }
          }else{
            //取消选中
            this.pointSelectList2[key].splice(index, 1)
          }
        }
      }
      let returnTreeData = {};
      returnTreeData['checkNodes'] = [];
      returnTreeData['checkNodes'] = that.$refs.pointFeatureTree2.getHalfCheckedNodes();
      const tree2CheckedNodes = that.$refs.pointFeatureTree2.getCheckedNodes();
      for (const i in tree2CheckedNodes) {

        returnTreeData['checkNodes'].push(tree2CheckedNodes[i]);
      }
      if(returnTreeData.checkNodes.length !=0){
        for (const i in returnTreeData.checkNodes){
          // console.log("##############################")
          if(returnTreeData.checkNodes[i].label.indexOf('振动-') != -1 ||
            returnTreeData.checkNodes[i].label == "温度"||
            returnTreeData.checkNodes[i].label=="压力" ||
            returnTreeData.checkNodes[i].label=="流量" ||
            returnTreeData.checkNodes[i].label=="其它"){
            if(this.firstSelectTree2) this.expandedKeys2=[returnTreeData.checkNodes[i].label]
            this.firstSelectTree2 = false
          }

        }
      }
      if(this.first2){
        this.first2 = false
        returnTreeData['checkNodes'].forEach(item =>{
          if(!item.hasOwnProperty('children')) {
            if (item.dtype == 'weiyi' || item.dtype == 'jiasudu' || item.dtype == 'sudu') {
              //振动测点数组以pointUuid为键
              this.pointSelectList2[item.pointUuid].push(item.id)
            }else{
              //工艺量测点数组以dtype为键
              this.pointSelectList2[item.dtype].push(item.id)
            }
          }
        })
      }
      that.$emit('getPointFeatureTree2Data', returnTreeData, that.treeSelect);
      let tempCheckedNodes = returnTreeData['checkNodes'].filter(item => !item.hasOwnProperty('children'))
      let pointIds = [...new Set(tempCheckedNodes.map(item => item.pid))]
      let measurementIds = tempCheckedNodes.map(item => item.id);
      this.$store.state.globalPointId = pointIds.join(',');
      this.$store.state.globalMeasurementId = measurementIds.join(',');
      this.$store.state.pointId = this.$store.state.globalPointId
    }
    ,

    treeChange(value) {
      if(this.activatedFlag) {
        this.$store.state.globalTreeSelect = value
        this.syncGlobalPoint()
        this.syncGlobalPointEnd()
      }
    }
    ,
    renderContent2(i, {node, data, store}) {
      return i(
        "span", [
          i("i", {
            class: data.icon,
            style: {
              display: 'inline-block'
            }
          },),
          i("span", {
            style: {
              marginLeft: '5px',
              fontSize: '14px',
              color: this.mycolor,
            },
          }, node.label)]
      );
    }
    ,

    renderContent(h, {node, data, store}) {

      if (node.label == '特征') {
        return h(
          "div", {class: "feature-content"}, [
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
                    this.featureSelect[node.data.pos] = value;
                    this.pointTree1Checked();
                  }
                },
                props: {
                  value: this.featureSelect[node.data.pos]
                }
              }, [
                this.typeSelect[node.data.type].map(item => {
                  return h(
                    "el-option", {
                      style: {
                        lineHeight: '18px',
                        fontSize: '14px',
                        height: '18px'
                      },
                      props: {
                        value: item.id,
                        label: this.translateText("opPage.textMap.",item.label),
                        unit: item.unit
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
          "span", [
            h("i", {
              class: data.icon,
              style: {
                display: 'inline-block'
              }
            },),
            h("span", {
              domProps:this.treeSelect == 1 ? {title: data.children ? data.id : ''} : { title: data.id },
              style: {
                fontSize: '14px',
                color: this.mycolor,
              },
            }, node.label)]
        );
      }
    }
  },
}
</script>

<style lang="scss">
.AlarmFeatureTreeGeneral{
  --pointcolor: #1D1E2C;
  --eltreecolor: #1D1E2C;
  --textcolor: #ffffff;
  --eltreebordercolor: #000;
  .pointType {
    height: 32px;
    margin:0 8px 8px 8px;
    .el-radio__label {
      font-size: 14px;
      color: var(--textcolor);
    }
  }
  .AlarmTreeGeneral {
    height: 228px;
    overflow: auto;
    background-color: var(--eltreecolor);
    padding: 8px 0 8px 8px;
    border-radius: 6px;
    border: 1px solid var(--eltreebordercolor);
    .el-checkbox__input.is-disabled.is-indeterminate .el-checkbox__inner {
      background-color: #419fff;
      border-color: #419fff;
    }

    .red {
      color: red;
    }

    .yellow {
      color: rgb(255, 187, 0);
    }
    .green {
      color: #4cae4c;
    }
    //.normal {
    //  color: var(--textcolor);
    //}

    min-height: 190px;
    max-height: 350px;
    background-color: var(--eltreecolor);
    margin-bottom: 7px;
    overflow: auto;

    //.el-select {
    //  width: 70%;
    //}

    // .el-scrollbar {
    //   .el-scrollbar__wrap {
    //     overflow:auto;
    //   }
    // }

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

      .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        background-color: var(--eltreecolor) !important;
        border-color: var(--textcolor) !important;
      }

      //.el-checkbox__inner{
      //  background-color: var(--eltreecolor);
      //  border-color: var(--textcolor)
      //}

      .el-checkbox__input.is-disabled .el-checkbox__inner{
        background-color: var(--eltreecolor) !important;
        border-color: var(--textcolor) !important;
      }

      .el-checkbox__inner::before{
        background-color: #C0C4CC
      }

    }

  }
}
</style>
