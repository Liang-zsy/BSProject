<template>
  <div class="treebox" ref="ui">
    <div class="search-box">
      <el-input
        class="myinput"
        :placeholder="translateText('plTree.','搜索组织结构')"
        v-model="filterText">
      </el-input>
      <el-tooltip class="el-icon-box" effect="dark" v-if="useFilterButton" :content="translateText('plTree.','筛选设备类型')" placement="bottom">
        <svg t="1723519416483" class="search-box-icon" @click="showDropdown" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16195" width="30" height="30">
          <path d="M577.499296 1023.99875a99.999878 99.999878 0 0 1-47.999942-11.999985l-131.999839-72.999911a99.999878 99.999878 0 0 1-51.999936-87.999893V431.999473a19.999976 19.999976 0 0 0-7.99999-15.999981L32.499961 171.99979l-3.999995-3.999995C0.5 138.99983-6.499991 96.999882 9.499989 59.999927S60.499927 0 100.499878 0h821.998997c39.999951 0 75.999907 22.999972 91.999887 59.999927s8.999989 77.999905-17.999978 107.999868l-3.999995 3.999995-307.999624 246.999699a19.999976 19.999976 0 0 0-6.999991 15.99998v488.999403a99.999878 99.999878 0 0 1-99.999878 99.999878zM84.499897 111.999863l302.999631 241.999705a98.999879 98.999879 0 0 1 37.999953 77.999905v418.999488a19.999976 19.999976 0 0 0 9.999988 17.999978l131.999839 71.999912a19.999976 19.999976 0 0 0 29.999963-17.999978V434.999469a99.999878 99.999878 0 0 1 36.999955-77.999905l303.999629-244.999701a19.999976 19.999976 0 0 0-15.99998-31.999961H100.499878a19.999976 19.999976 0 0 0-15.999981 31.999961z m881.998924 28.999965z" :fill="$store.state.textcolor" p-id="16196"></path>
          <path d="M983.4988 520.999364H757.499076a39.999951 39.999951 0 0 1 0-79.999902h225.999724a39.999951 39.999951 0 0 1 0 79.999902zM983.4988 670.999181H757.499076a39.999951 39.999951 0 0 1 0-79.999902h225.999724a39.999951 39.999951 0 0 1 0 79.999902zM983.4988 819.998999H757.499076a39.999951 39.999951 0 0 1 0-79.999902h225.999724a39.999951 39.999951 0 0 1 0 79.999902z" :fill="$store.state.textcolor" p-id="16197"></path>
        </svg>
      </el-tooltip>
    </div>
<!--    过滤节点-->
    <el-tree :data="data"
             class="filter-tree"
             :filter-node-method="filterNode"
             node-key="id" ref="mytree"
             :highlight-current="true"
             :default-expanded-keys="idArr"
             :render-content="renderContent2"
             @node-click="handleNodeClick"
             @node-contextmenu="contextmenu"
    ></el-tree>
    <div v-show="contextmenuVisable" id="contextmenu">
      <el-button>{{contextmenuText}}</el-button>
    </div>
<!--    设备筛选-->
    <div class="dropdown" id="dropdown" ref="dropdown" v-show="showDropdownFlag" @click="notParentClick">
      <el-checkbox v-for="(item,index) in allEquipmentType"
                   :key="index"
                   v-if="item.show" v-model="item.check"
                   @change="getPlantTreeByUserName">{{translateText('plTree.',item.name)}}</el-checkbox>
    </div>
  </div>
</template>

<script>
import {Base64} from 'js-base64';
import Axios from "axios";
import '../../../static/config'

export default {
  name: "PlantTree",
  data(){
    return {
      //右键内容
      contextmenuVisable: false,
      contextmenuText: '关注',
      filterText: '',
      //设备类型
      allEquipmentType : [
        { name: '旋转', equipmentTypes: [0, 1, 3, 4], nodeType: 1,show: false, check: true},
        { name: '燃气轮机', equipmentTypes: [2], nodeType: 1 ,show: false, check: true},
        { name: '往复', equipmentTypes: [6], nodeType: 1 ,show: false, check: true},
        { name: '机泵', equipmentTypes: [7], nodeType: 1 ,show: false, check: true},
        { name: '风电', equipmentTypes: [8, 9], nodeType: 1 ,show: false, check: true},
        { name: '燃气发动机', equipmentTypes: [10], nodeType: 1 ,show: false, check: true},
        { name: '内燃机', equipmentTypes: [11], nodeType: 1 ,show: false, check: true},
        { name: '无线机泵', equipmentTypes: [7], nodeType: 2 ,show: false, check: true}
      ],
      //index
      allEquipmentTypeIndex:{
        '0': 0,
        '1': 0,
        '2': 1,
        '3': 0,
        '4': 0,
        '5': -1,
        '6': 2,
        '7': 3,
        '8': 4,
        '9': 4,
        '10': 5,
        '11': 6,
        '1007': 7,
      },
      useFilterButton: config.menu.useFilterButton,
      idArr: [],
      data: [],
      cnt: 0,
      mylen: 0,
      nowtree: [],
      username: '',
      // 离线状态（避免多次请求数据）
      mycolor: '#ffffff',
      myInterval: '',
      tmpparams: null,
      nodeIcon: {},
      showDropdownFlag: false,
      currentNodeId: null
    };
  },
  computed:{
    topiccolor() {
      return this.$store.state.topiccolor;
    },
    equid() {
      return  this.$store.state.equid;
    }
  },
  watch:{
    filterText(val) {
      this.$refs.mytree.filter(val);
    },
    equid(val) {
      this.sendMessage();
    },
    topiccolor(val) {
      // console.log('颜色', this.$store.state.textcolor, this.$store.state.leftconbgcolor);
      this.mycolor = this.$store.state.textcolor;
      this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
      this.$refs.ui.style.setProperty('--activetextcolor', this.$store.state.activetextcolor);
      this.$refs.ui.style.setProperty('--inputbgcolor', this.$store.state.inputbgcolor);
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    },
  },
  created(){},
  mounted() {
    this.getPlantTreeByUserName()
    this.mycolor = this.$store.state.textcolor;
    this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
    this.$refs.ui.style.setProperty('--activetextcolor', this.$store.state.activetextcolor);
    this.$refs.ui.style.setProperty('--inputbgcolor', this.$store.state.inputbgcolor);
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
  },
  methods:{
    // 处理筛选按钮逻辑
    handleFilter(data) {
      console.log("handleFilter")
      if(config.menu.useFilterButton){
        data.forEach((item, index) => {
          //无线设备
          if(item.nodeType == 2){
            item.equipmentType += 1000
          }
          //离线设备
          else if(item.nodeType == 0){
            item.equipmentType += 10000
          }
          if(this.allEquipmentTypeIndex[item.equipmentType] != undefined && this.allEquipmentTypeIndex[item.equipmentType] != -1){
            this.allEquipmentType[this.allEquipmentTypeIndex[item.equipmentType]].show = true
          }
        })
        // 过滤设备类型，只显示出filterEquipmentTypeFlag中为true的设备类型
        data = data.filter(item => {
          if(this.allEquipmentTypeIndex[item.equipmentType] != undefined && this.allEquipmentTypeIndex[item.equipmentType] != -1){
            return this.allEquipmentType[this.allEquipmentTypeIndex[item.equipmentType]].check
          }else{
            return true //设备类型不存在，把该设备放出去
          }
        });
      }
      return data;
    },
    setAlarmColor(){
      this.$refs.ui.style.setProperty('--level1', this.$store.state.level1);
      this.$refs.ui.style.setProperty('--level2', this.$store.state.level2);
      this.$refs.ui.style.setProperty('--level3', this.$store.state.level3);
      this.$refs.ui.style.setProperty('--hLevel', this.$store.state.hLevel);
      this.$refs.ui.style.setProperty('--hhLevel', this.$store.state.hhLevel);
      this.$refs.ui.style.setProperty('--zhengchang', this.$store.state.zhengchang);
      this.$refs.ui.style.setProperty('--tingji', this.$store.state.tingji);
      this.$refs.ui.style.setProperty('--duangwang', this.$store.state.duangwang);
    },
    showDropdown(){
      this.showDropdownFlag = !this.showDropdownFlag;
      if(this.showDropdownFlag){// 判断是否显示下拉菜单
        let x=event.clientX//鼠标点击事件发生时相对于浏览器窗口的坐标位置
        let y=event.clientY
        let dropdownElement=document.getElementById('dropdown')
        dropdownElement.style.left= x + 'px'
        dropdownElement.style.top= y + 20 + 'px'
        event.stopPropagation()
      }
    },
    filterNode(value, data, node) {
      if (!value) return true;
      value = value.toUpperCase()
      // console.log(value, '---', data, node);
      if (data.label.toUpperCase().indexOf(value) == -1 && !data.children) {
        let nowNode = node.parent;
        while (nowNode) {
          if (!Array.isArray(nowNode.data) && nowNode.data.label.toUpperCase().indexOf(value) !== -1) {
            return true;
          }
          nowNode = nowNode.parent;
        }
        return false;
      }
      return data.label.toUpperCase().indexOf(value) !== -1;
    },
    renderContent2(i, {node, data, store}) {
      if (data.visible == 0 && node.level > 1) {
        for (let item in node.parent.data.children) {
          if (node.parent.data.children[item].label == data.label) {
            // node.parent.data.children[item] = data.children;
            node.parent.data.children.splice(item, 1);
            for (let _item in data.children) {
              node.parent.data.children.push(data.children[_item]);
            }
          }
        }
      }
      return i(
        "span", [
          i("i", {
            class: data.icon,
            style: {
              display: 'inline-block'
            }
          },),

          i("i", {
            class: 'el-icon-star-on star', // el-icon-star-on iconfont icon-dian2 green
            style: {
              display: data.isFollow ? 'inline-block' : 'none',
              color: data.id == this.$store.state.equid ? '#fff' : this.$store.state.buttoncolor
            }
          }),

          i("span", {
            domProps: {title: data.title},
            style: {
              marginLeft: '5px',
              fontSize: '13px',
              color: this.mycolor,
            },

          }, node.label)]
      );
    },
    handleNodeClick(data) {
      this.currentNodeId = data.id;
      console.log("current nodeid"+this.currentNodeId);
      this.$emit('handleMenuClose')
      console.log('选择设备');
      if(data.children ) {
        return
      }
      if (data.etype != undefined && (data.etype != this.$store.state.etype || data.nodeType != this.$store.state.nodeType)) {
        this.$store.state.etype = data.etype;
        this.$store.state.nodeType = data.nodeType
        this.$emit('updateRouter');
      }
      if (this.$store.state.nodeType === 0) {
        this.$store.dispatch('saveOfflineEquipmentInfo', data.id)
      } else {
        this.$store.dispatch('saveEquipmentInfo', data.id);
        this.$store.dispatch('saveEquipmentDetail', data.id);
      }
    },
    contextmenu(event, data, node, item) {
      console.log("contextmenu(event, data, node, item)");
      if(!this.username) return // 没登陆，不让关注
      console.log(event, data, node, item)
      const clientX = event.clientX - event.offsetY
      const clientY = event.clientY - event.offsetX
      const labelDom = event.srcElement
      const display = labelDom.parentElement.getElementsByClassName('star')[0].style.display
      const menu = document.getElementById('contextmenu')
      menu.style.position = 'absolute'
      // menu.innerHTML = display === 'none' ? '关注' : '取消关注'
      this.contextmenuText = display === 'none' ? '关注' : '取消关注'
      menu.style.left = clientX - 10 + 'px'
      menu.style.top = clientY - 10 + 'px'
      this.contextmenuVisable = true
      // console.log("happen->contextmenu->data", data)
      // console.log("happen->contextmenu->node", node)
      // console.log("happen->contextmenu->item", item)
      let that = this
      menu.onmouseleave = () => {
        console.log('鼠标离开了')
        this.contextmenuVisable = false
      }
      menu.onclick = () => {
        console.log('鼠标点击')
        let display;
        let follow;
        let error;
        if(this.contextmenuText === '关注') {
          // 关注代码
          follow = 1;
          display = "inline-block"
          error = "none"
        } else {
          // 取消关注
          follow = 0;
          display = "none"
          error = "inline-block"
        }
        this.contextmenuVisable = false
        labelDom.parentElement.getElementsByClassName('star')[0].style.display = display
        this.$axios.get(`/user/${that.username}/${data.id}/${follow}/updateUserFollowEquipment`).then(res => {
          if(res.data.code !== 200) { // 点击以后优先改图标， 如果请求失败了，再把图标切换回来，这样感觉体验会更好
            labelDom.parentElement.getElementsByClassName('star')[0].style.display = error
          }
        }).catch(err=> {
          labelDom.parentElement.getElementsByClassName('star')[0].style.display = error
        })

      }
    },
    //阻止向父组件传递点击事件
    notParentClick(){
      event.stopPropagation()
    },
    // 归纳初始化设备树的方法
    getPlantTreeByUserName() {
      console.log("getPlantTreeByUserName");
      console.log("process.env.NODE_ENV: "+process.env.NODE_ENV)
      //development
      if(process.env.NODE_ENV != 'production') {
        this.getNodeId()    //无权
        return ;
      }
      var UrlName = this.$route.query.username
      //console.log("UrlName:"+UrlName)
      if(UrlName == null){
        console.error("bs error", "以iframe的方式调用时 username 必须传入, 例如: http://localhost:8080/?username=EDA7E6CEF56EAB4784D2504DFB1058B4bWdy")
        UrlName = 'EDA7E6CEF56EAB4784D2504DFB1058B4bWdy'
      }
      var tmp_url = ''
      for (var i = 32; i < UrlName.length; ++i) {
        tmp_url += UrlName[i];
      }
      // UrlName = Base64.decode(tmp_url)
      this.username = UrlName
      this.$store.state.username = UrlName;
      this.getUserEquTree(UrlName)
    },
    sovCol(node,stu) {
      node.alarmLevel = Math.max(node.alarmLevel, stu)
      if (node.alarmLevel == 1) {
        node['icon'] = 'iconfont icon-dian2 level1'  //智能一级
      }
      if (node.alarmLevel == 2) {
        node['icon'] = 'iconfont icon-dian2 level2'   //智能二级
      }
      if (node.alarmLevel == 3) {
        node['icon'] = 'iconfont icon-dian2 level3'  //智能三级
      }
      if (node.alarmLevel == 4) {
        node['icon'] = 'iconfont icon-dian2 hLevel'  //固定高报
      }
      if (node.alarmLevel == 5) {
        node['icon'] = 'iconfont icon-dian2 hhLevel'  //固定高高报
      }
      if (node.alarmLevel == 0) {
        node['icon'] = 'iconfont icon-dian2 green'  //正常
      }
      if (node.alarmLevel == -1) {
        node['icon'] = 'iconfont icon-dian2 tingji'    //停车
      }
      if (node.alarmLevel == -2) {
        node['icon'] = 'iconfont icon-dian2 duanwang'  //断网
      }
      this.nodeIcon[node.key.toString()] = node['icon'];
      return node
    },
    async getUserEquTree(username) {
      this.nowtree = []
      this.data = []
      this.idArr = []
      this.cnt = 0


      this.$axios.get('/user/' + username + '/equipment_uuid').then(res => {
        if (res.data.code == 200) {
          /**
           * 保存了设备是否收藏的映射关系 {“9aeca92b89c3f1337dd3452a6e8d8806”: 0}
           */
          let equipmentIsFollow = {}
          for(let d of res.data.data) {
            equipmentIsFollow[d.equipmentUuid] = d.isFollow
          }

          this.$axios.get('/user/' + username + '/equipment').then(res => {
            if (res.data.code == 200) {

              // 点击筛选按钮后进行设备筛选
              res.data.data = this.handleFilter(res.data.data);

              this.data = this.nowtree = [];
              let alldic = {}, nodeTypeList = {}
              var nowdata = res.data.data;
              nowdata.sort((item1, item2) => {
                if (item1.groupSort == item2.groupSort) {
                  if (item1.groupName != item2.groupName) {
                    return item1.groupName.localeCompare(item2.groupName);
                  }
                  if (item1.companySort == item2.companySort) {
                    if (item1.companyName != item2.companyName) {
                      return item1.companyName.localeCompare(item2.companyName);
                    }
                    if (item1.factorySort == item2.factorySort) {
                      if (item1.factoryName != item2.factoryName) {
                        return item1.factoryName.localeCompare(item2.factoryName);
                      }
                      if (item1.unitSort == item2.unitSort) {
                        if (item1.unitName != item2.unitName) {
                          return item1.unitName.localeCompare(item2.unitName);
                        }
                        if (item1.equipmentSort == item2.equipmentSort) {
                          return item1.equipmentName.localeCompare(item2.equipmentName);
                        }
                        return item2.equipmentSort - item1.equipmentSort
                      }
                      return item2.unitSort - item1.unitSort
                    }
                    return item2.factorySort - item1.factorySort
                  }
                  return item2.companySort - item1.companySort
                }
                return item2.groupSort - item1.groupSort
              });
              if (nowdata == null) {
                this.data = [];
                this.$emit('fail');
                return;
              }
              var treenode = [];
              var allnode = []
              for (var i = 0; i < nowdata.length; ++i) {
                allnode.push(nowdata[i].equipmentUuid)
              }
              for (var i = 0; i < allnode.length; ++i) {
                var pid = allnode[i];
                for (var i = 0; i < nowdata.length; ++i) {
                  var noweq = nowdata[i];
                  var have_group = -1;
                  var groupId = noweq.groupName;

                  for (var j = 0; j < treenode.length; ++j) {
                    if (groupId == treenode[j].id) {
                      have_group = j;
                      break;
                    }
                  }
                  if (have_group == -1) {
                    have_group = treenode.length;
                    treenode.push({id: groupId, key: `${have_group}`, label: noweq.groupName, visible: noweq.groupVisible, children: [], alarmLevel:-2})
                  }
                  //group
                  var companyId = noweq.companyName;
                  var have_com = -1;
                  for (var j = 0; j < treenode[have_group].children.length; ++j) {
                    if (companyId == treenode[have_group].children[j].id) {
                      have_com = j;
                      break;
                    }
                  }
                  if (have_com == -1) {
                    have_com = treenode[have_group].children.length;
                    treenode[have_group].children.push({id: companyId, key: `${have_group}-${have_com}`, visible: noweq.companyVisible, label: noweq.companyName, children: [],alarmLevel:-2})
                  }
                  //company
                  var factoryId = noweq.factoryName;
                  var have_fact = -1;
                  for (var j = 0; j < treenode[have_group].children[have_com].children.length; ++j) {
                    if (factoryId == treenode[have_group].children[have_com].children[j].id) {
                      have_fact = j;
                      break;
                    }
                  }
                  if (have_fact == -1) {
                    have_fact = treenode[have_group].children[have_com].children.length;
                    treenode[have_group].children[have_com].children.push({
                      id: factoryId,
                      label: noweq.factoryName,
                      visible: noweq.factoryVisible,
                      key: `${have_group}-${have_com}-${have_fact}`,
                      children: [], alarmLevel:-2
                    })
                  }
                  //factory
                  var unitId = noweq.unitName;
                  var have_uuit = -1;
                  for (var j = 0; j < treenode[have_group].children[have_com].children[have_fact].children.length; ++j) {
                    if (unitId == treenode[have_group].children[have_com].children[have_fact].children[j].id) {
                      have_uuit = j;
                      break;
                    }
                  }
                  if (have_uuit == -1) {
                    have_uuit = treenode[have_group].children[have_com].children[have_fact].children.length;
                    treenode[have_group].children[have_com].children[have_fact].children.push({
                      id: unitId,
                      label: noweq.unitName,
                      visible: noweq.unitVisible,
                      key: `${have_group}-${have_com}-${have_fact}-${have_uuit}`,
                      children: [], alarmLevel:-2
                    })
                  }
                  //unit
                  let tmp1 = {};
                  if (noweq.alarmLevel == 1) {
                    tmp1['icon'] = 'iconfont icon-dian2 level1'  //智能一级
                    tmp1['title'] = noweq.alarmAlias
                  }
                  if (noweq.alarmLevel == 2) {
                    tmp1['icon'] = 'iconfont icon-dian2 level2'   //智能二级
                    tmp1['title'] = noweq.alarmAlias
                  }
                  if (noweq.alarmLevel == 3) {
                    tmp1['icon'] = 'iconfont icon-dian2 level3'  //智能三级
                    tmp1['title'] = noweq.alarmAlias
                  }
                  if (noweq.alarmLevel == 4) {
                    tmp1['icon'] = 'iconfont icon-dian2 hLevel'  //固定高报
                    tmp1['title'] = noweq.alarmAlias
                  }
                  if (noweq.alarmLevel == 5) {
                    tmp1['icon'] = 'iconfont icon-dian2 hhLevel'  //固定高高报
                    tmp1['title'] = noweq.alarmAlias
                  }
                  if (noweq.alarmLevel == 0) {
                    tmp1['icon'] = 'iconfont icon-dian2 green'  //正常
                    tmp1['title'] = noweq.alarmAlias
                  }
                  if (noweq.alarmLevel == -1) {
                    tmp1['icon'] = 'iconfont icon-dian2 tingji'    //停车
                    tmp1['title'] = noweq.alarmAlias
                  }
                  if (noweq.alarmLevel == -2) {
                    tmp1['icon'] = 'iconfont icon-dian2 duanwang'  //断网
                    tmp1['title'] = noweq.alarmAlias
                  }
                  alldic[noweq.equipmentUuid] = noweq.equipmentType
                  nodeTypeList[noweq.equipmentUuid] = noweq.nodeType
                  treenode[have_group] = this.sovCol(treenode[have_group], noweq.alarmLevel)
                  treenode[have_group].children[have_com] = this.sovCol(treenode[have_group].children[have_com], noweq.alarmLevel)
                  treenode[have_group].children[have_com].children[have_fact] = this.sovCol(treenode[have_group].children[have_com].children[have_fact], noweq.alarmLevel)
                  treenode[have_group].children[have_com].children[have_fact].children[have_uuit] = this.sovCol(treenode[have_group].children[have_com].children[have_fact].children[have_uuit],noweq.alarmLevel)



                  treenode[have_group].children[have_com].children[have_fact].children[have_uuit].children.push({
                    id: noweq.equipmentUuid,
                    label: noweq.equipmentName,
                    visible: noweq.equipmentVisible,
                    key: noweq.equipmentUuid,
                    icon: tmp1.icon,
                    title: tmp1.title,
                    etype: noweq.equipmentType,
                    dataSource: noweq.dataSource,
                    nodeType: noweq.nodeType,
                    isFollow: equipmentIsFollow[noweq.equipmentUuid]

                  })

                }
                // })
              }
              let visibleFlag = false;
              for (var i = 0; i < treenode.length; ++i) {
                if (i == 0 && treenode[0].visible == 0) {
                  for (let item in treenode[0].children) {
                    this.nowtree.push(treenode[0].children[item]);
                  }
                  visibleFlag = true;
                } else {
                  this.nowtree.push(treenode[i]);
                }
                // this.nowtree.push(treenode[i]);
              }
              this.data = this.nowtree;
              this.data.forEach(m => {
                this.idArr.push(m.id)
              })
              let defaultid = this.$store.state.equid
              if(defaultid) {
                this.$store.state.etype = alldic[defaultid]
                this.$store.state.nodeType = nodeTypeList[defaultid]
              }
              else {
                if (visibleFlag) {
                  defaultid = this.nowtree[0].children[0].children[0].children[0].id;
                  this.$store.state.etype = this.nowtree[0].children[0].children[0].children[0].etype;
                  this.$store.state.nodeType = this.nowtree[0].children[0].children[0].children[0].nodeType;
                } else {
                  defaultid = this.nowtree[0].children[0].children[0].children[0].children[0].id;
                  this.$store.state.etype = this.nowtree[0].children[0].children[0].children[0].children[0].etype;
                  this.$store.state.nodeType = this.nowtree[0].children[0].children[0].children[0].children[0].nodeType;
                }
              }
              this.$emit('updateRouter');

              //离线设备
              if(this.$store.state.nodeType == 0){
                this.$store.dispatch('saveOfflineEquipmentInfo', defaultid)
              }else{
                this.$store.dispatch('saveEquipmentInfo', defaultid);
                this.$store.dispatch('saveEquipmentDetail', defaultid);
              }
              this.idArr = [defaultid]
              this.currentNodeId = defaultid;
              this.$nextTick(() =>{
                this.$refs.mytree.setCurrentKey(defaultid);
                this.handleUserIcon(username);
              });
            }
          })
          this.$store.state.showGraph = true;
        }
      })

    },
    getNodeId() {
      this.cnt = 0;
      this.nowtree = [];
      this.idArr = []
      this.getAllEquipment()
    },
    getAllEquipment() {
      let that = this;

      this.$axios.get("/equipment/getAll")
        .then(res => {
          if (res.data.code == 200) {

            // 点击筛选按钮后进行设备筛选
            res.data.data = this.handleFilter(res.data.data)

            this.data = this.nowtree = [];

            var alldic = {}, nodeTypeList = {}

            var nowdata = res.data.data;
            console.log("nowdata"+nowdata)
            nowdata.sort((item1, item2) => {
              if (item1.groupSort == item2.groupSort) {
                if (item1.groupName != item2.groupName) {
                  return item1.groupName.localeCompare(item2.groupName);
                }
                if (item1.companySort == item2.companySort) {
                  if (item1.companyName != item2.companyName) {
                    return item1.companyName.localeCompare(item2.companyName);
                  }
                  if (item1.factorySort == item2.factorySort) {
                    if (item1.factoryName != item2.factoryName) {
                      return item1.factoryName.localeCompare(item2.factoryName);
                    }
                    if (item1.unitSort == item2.unitSort) {
                      if (item1.unitName != item2.unitName) {
                        return item1.unitName.localeCompare(item2.unitName);
                      }
                      if (item1.equipmentSort == item2.equipmentSort) {
                        return item1.equipmentName.localeCompare(item2.equipmentName);
                      }
                      return item2.equipmentSort - item1.equipmentSort
                    }
                    return item2.unitSort - item1.unitSort
                  }
                  return item2.factorySort - item1.factorySort
                }
                return item2.companySort - item1.companySort
              }
              return item2.groupSort - item1.groupSort
            });
            var treenode = [];
            for (var i = 0; i < nowdata.length; ++i) {
              var noweq = nowdata[i];
              if(noweq.equipmentType!==7) continue;
              var have_group = -1;
              var groupId = noweq.groupName;

              for (var j = 0; j < treenode.length; ++j) {
                if (groupId == treenode[j].id) {
                  have_group = j;
                  break;
                }
              }
              if (have_group == -1) {
                have_group = treenode.length;
                treenode.push({
                  id: groupId,
                  key: `${have_group}`,
                  label: noweq.groupName,
                  visible: noweq.groupVisible,
                  children: [],
                  alarmLevel: -2
                })
              }
              //group
              var companyId = noweq.companyName;
              var have_com = -1;
              for (var j = 0; j < treenode[have_group].children.length; ++j) {
                if (companyId == treenode[have_group].children[j].id) {
                  have_com = j;
                  break;
                }
              }
              if (have_com == -1) {
                have_com = treenode[have_group].children.length;
                treenode[have_group].children.push({
                  id: companyId,
                  key: `${have_group}-${have_com}`,
                  label: noweq.companyName,
                  visible: noweq.companyVisible,
                  children: [],
                  alarmLevel: -2
                })
              }
              //company
              var factoryId = noweq.factoryName;
              var have_fact = -1;
              for (var j = 0; j < treenode[have_group].children[have_com].children.length; ++j) {
                if (factoryId == treenode[have_group].children[have_com].children[j].id) {
                  have_fact = j;
                  break;
                }
              }
              if (have_fact == -1) {
                have_fact = treenode[have_group].children[have_com].children.length;
                treenode[have_group].children[have_com].children.push({
                  id: factoryId,
                  label: noweq.factoryName,
                  key: `${have_group}-${have_com}-${have_fact}`,
                  visible: noweq.factoryVisible,
                  // visible: 0,
                  children: [],
                  alarmLevel: -2
                })
              }
              //factory
              var unitId = noweq.unitName;
              var have_uuit = -1;
              //  console.log(treenode[have_group].children[have_com].children[have_fact])
              for (var j = 0; j < treenode[have_group].children[have_com].children[have_fact].children.length; ++j) {
                if (unitId == treenode[have_group].children[have_com].children[have_fact].children[j].id) {
                  have_uuit = j;
                  break;
                }
              }
              if (have_uuit == -1) {
                have_uuit = treenode[have_group].children[have_com].children[have_fact].children.length;
                treenode[have_group].children[have_com].children[have_fact].children.push({
                  id: unitId,
                  label: noweq.unitName,
                  key: `${have_group}-${have_com}-${have_fact}-${have_uuit}`,
                  visible: noweq.unitVisible,
                  children: [], alarmLevel: -2
                })
              }
              //unit

              let tmp1 = {};
              if (noweq.alarmLevel == 1) {
                tmp1['icon'] = 'iconfont icon-dian2 level1'  //智能一级
                tmp1['title'] = noweq.alarmAlias
              }
              if (noweq.alarmLevel == 2) {
                tmp1['icon'] = 'iconfont icon-dian2 level2'   //智能二级
                tmp1['title'] = noweq.alarmAlias
              }
              if (noweq.alarmLevel == 3) {
                tmp1['icon'] = 'iconfont icon-dian2 level3'  //智能三级
                tmp1['title'] = noweq.alarmAlias
              }
              if (noweq.alarmLevel == 4) {
                tmp1['icon'] = 'iconfont icon-dian2 hLevel'  //固定高报
                tmp1['title'] = noweq.alarmAlias
              }
              if (noweq.alarmLevel == 5) {
                tmp1['icon'] = 'iconfont icon-dian2 hhLevel'  //固定高高报
                tmp1['title'] = noweq.alarmAlias
              }
              if (noweq.alarmLevel == 0) {
                tmp1['icon'] = 'iconfont icon-dian2 green'  //正常
                tmp1['title'] = noweq.alarmAlias
              }
              if (noweq.alarmLevel == -1) {
                tmp1['icon'] = 'iconfont icon-dian2 tingji'    //停车
                tmp1['title'] = noweq.alarmAlias
              }
              if (noweq.alarmLevel == -2) {
                tmp1['icon'] = 'iconfont icon-dian2 duanwang'  //断网
                tmp1['title'] = noweq.alarmAlias
              }
              alldic[noweq.equipmentUuid] = noweq.equipmentType
              nodeTypeList[noweq.equipmentUuid] = noweq.nodeType
              treenode[have_group] = this.sovCol(treenode[have_group], noweq.alarmLevel)
              treenode[have_group].children[have_com] = this.sovCol(treenode[have_group].children[have_com], noweq.alarmLevel)
              treenode[have_group].children[have_com].children[have_fact] = this.sovCol(treenode[have_group].children[have_com].children[have_fact], noweq.alarmLevel)
              treenode[have_group].children[have_com].children[have_fact].children[have_uuit] = this.sovCol(treenode[have_group].children[have_com].children[have_fact].children[have_uuit], noweq.alarmLevel)


              treenode[have_group].children[have_com].children[have_fact].children[have_uuit].children.push({
                id: noweq.equipmentUuid,
                label: noweq.equipmentName,
                visible: noweq.equipmentVisible,
                key: noweq.equipmentUuid,
                icon: tmp1.icon,
                title: tmp1.title,
                etype: noweq.equipmentType,
                dataSource: noweq.dataSource,
                nodeType: noweq.nodeType,
              })
              this.nodeIcon[noweq.equipmentUuid] = tmp1.icon;
            }

            let visibleFlag = false;
            for (var i = 0; i < treenode.length; ++i) {
              if (i == 0 && treenode[0].visible == 0) {
                for (let item in treenode[0].children) {

                  this.nowtree.push(treenode[0].children[item]);
                }
                visibleFlag = true;
              } else {
                //console.log("treenode[i]"+treenode[i])
                this.nowtree.push(treenode[i]);
              }

              // this.nowtree.push(treenode[i]);
            }
            //console.log(treenode)
            let treenode2 =this.nowtree; // 用于存放符合条件的设备节点

            // 遍历树并筛选符合条件的节点
            // treenode2.filter(item => {
            //   return item1.filter(item => {
            //
            //   })
            // })
            // let treenode3 = this.nowtree;
            // for (var i = 0; i < treenode3.length; ++i) {
            //   for (var j = 0; j < treenode3[i].children.length; ++j) {
            //     for (var k = 0; k < treenode3[i].children[j].children.length; ++k) {
            //       for (var l = 0; l < treenode3[i].children[j].children[k].children.length; ++l) {
            //         for (var m = 0; m < treenode3[i].children[j].children[k].children[l].children.length; ++m) {
            //           let node = treenode3[i].children[j].children[k].children[l].children[m];
            //           // 检查设备节点类型是否为7
            //           if (node.etype !== 7) {
            //             treenode3[i].children[j].children[k].children[l].children.splice(m, 1);
            //             m--;
            //           }
            //         }
            //       }
            //     }
            //   }
            // }
            // this.nowtree = treenode3;

              if (true) {
              this.data = this.nowtree;

              this.data.forEach(m => {
                this.idArr.push(m.id)
              })  //遍历进行二级展开

              let defaultid = this.$store.state.equid
              console.log("getAllEquipment()-defaultid:"+defaultid)
              if (defaultid) {
                this.$store.state.etype = alldic[defaultid]
                this.$store.state.nodeType = nodeTypeList[defaultid]
              }
              else {
                console.log("visibleFlag:"+visibleFlag);
                if (visibleFlag) {
                  defaultid = this.nowtree[0].children[0].children[0].children[0].id;
                  this.$store.state.etype = this.nowtree[0].children[0].children[0].children[0].etype;
                  this.$store.state.nodeType = this.nowtree[0].children[0].children[0].children[0].nodeType;
                } else {
                  defaultid = this.nowtree[0].children[0].children[0].children[0].children[0].id;
                  this.$store.state.etype = this.nowtree[0].children[0].children[0].children[0].children[0].etype;
                  this.$store.state.nodeType = this.nowtree[0].children[0].children[0].children[0].children[0].nodeType;
                }
              }
              this.$emit('updateRouter');
              this.idArr = [defaultid]
              this.currentNodeId = defaultid;


              this.$store.dispatch('saveEquipId', defaultid)
              this.$nextTick(() => {
                this.$store.dispatch('saveEquipmentInfo', defaultid);
                this.$store.dispatch('saveEquipmentDetail', defaultid);
              })
              this.$nextTick(() => {
                this.$refs.mytree.setCurrentKey(defaultid);
                this.handleIcon();
              });

            }
          }
          this.$store.state.showGraph = true
        })

    },
    handleIcon() {
      this.$store.state.intervalId = setInterval(() => {
        this.$axios.get("/equipment/getAll")
          .then(res => {
            if (res.data.code == 200) {
              // 点击筛选按钮后进行设备筛选
              res.data.data = this.handleFilter(res.data.data);

              var alldic = {}

              var nowdata = res.data.data;
              nowdata.sort((item1, item2) => {
                if (item1.groupSort == item2.groupSort) {
                  if (item1.groupName != item2.groupName) {
                    return item1.groupName.localeCompare(item2.groupName);
                  }
                  if (item1.companySort == item2.companySort) {
                    if (item1.companyName != item2.companyName) {
                      return item1.companyName.localeCompare(item2.companyName);
                    }
                    if (item1.factorySort == item2.factorySort) {
                      if (item1.factoryName != item2.factoryName) {
                        return item1.factoryName.localeCompare(item2.factoryName);
                      }
                      if (item1.unitSort == item2.unitSort) {
                        if (item1.unitName != item2.unitName) {
                          return item1.unitName.localeCompare(item2.unitName);
                        }
                        if (item1.equipmentSort == item2.equipmentSort) {
                          return item1.equipmentName.localeCompare(item2.equipmentName);
                        }
                        return item2.equipmentSort - item1.equipmentSort
                      }
                      return item2.unitSort - item1.unitSort
                    }
                    return item2.factorySort - item1.factorySort
                  }
                  return item2.companySort - item1.companySort
                }
                return item2.groupSort - item1.groupSort
              });
              var treenode = [];
              for (var i = 0; i < nowdata.length; ++i) {
                var noweq = nowdata[i];
                var have_group = -1;
                var groupId = noweq.groupName;

                for (var j = 0; j < treenode.length; ++j) {
                  if (groupId == treenode[j].id) {
                    have_group = j;
                    break;
                  }
                }
                if (have_group == -1) {
                  have_group = treenode.length;
                  treenode.push({id: groupId, label: noweq.groupName, key: `${have_group}`, visible: noweq.groupVisible, children: [],alarmLevel:-2})
                }
                //group
                var companyId = noweq.companyName;
                var have_com = -1;
                for (var j = 0; j < treenode[have_group].children.length; ++j) {
                  if (companyId == treenode[have_group].children[j].id) {
                    have_com = j;
                    break;
                  }
                }
                if (have_com == -1) {
                  have_com = treenode[have_group].children.length;
                  treenode[have_group].children.push({id: companyId, key: `${have_group}-${have_com}`, label: noweq.companyName, visible: noweq.companyVisible, children: [],alarmLevel:-2})
                }
                //company
                var factoryId = noweq.factoryName;
                var have_fact = -1;
                for (var j = 0; j < treenode[have_group].children[have_com].children.length; ++j) {
                  if (factoryId == treenode[have_group].children[have_com].children[j].id) {
                    have_fact = j;
                    break;
                  }
                }
                if (have_fact == -1) {
                  have_fact = treenode[have_group].children[have_com].children.length;
                  treenode[have_group].children[have_com].children.push({
                    id: factoryId,
                    label: noweq.factoryName,
                    visible: noweq.factoryVisible,
                    key: `${have_group}-${have_com}-${have_fact}`,
                    children: [],
                    alarmLevel:-2
                  })
                }
                //factory
                var unitId = noweq.unitName;
                var have_uuit = -1;
                //  console.log(treenode[have_group].children[have_com].children[have_fact])
                for (var j = 0; j < treenode[have_group].children[have_com].children[have_fact].children.length; ++j) {
                  if (unitId == treenode[have_group].children[have_com].children[have_fact].children[j].id) {
                    have_uuit = j;
                    break;
                  }
                }
                if (have_uuit == -1) {
                  have_uuit = treenode[have_group].children[have_com].children[have_fact].children.length;
                  treenode[have_group].children[have_com].children[have_fact].children.push({
                    id: unitId,
                    label: noweq.unitName,
                    key: `${have_group}-${have_com}-${have_fact}-${have_uuit}`,
                    visible: noweq.unitVisible,
                    children: [],alarmLevel:-2
                  })
                }
                //unit

                let tmp1 = {};
                if (noweq.alarmLevel == 1) {
                  tmp1['icon'] = 'iconfont icon-dian2 level1'  //智能一级
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 2) {
                  tmp1['icon'] = 'iconfont icon-dian2 level2'   //智能二级
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 3) {
                  tmp1['icon'] = 'iconfont icon-dian2 level3'  //智能三级
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 4) {
                  tmp1['icon'] = 'iconfont icon-dian2 hLevel'  //固定高报
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 5) {
                  tmp1['icon'] = 'iconfont icon-dian2 hhLevel'  //固定高高报
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 0) {
                  tmp1['icon'] = 'iconfont icon-dian2 green'  //正常
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == -1) {
                  tmp1['icon'] = 'iconfont icon-dian2 tingji'    //停车
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == -2) {
                  tmp1['icon'] = 'iconfont icon-dian2 duanwang'  //断网
                  tmp1['title'] = noweq.alarmAlias
                }
                alldic[noweq.equipmentUuid] = noweq.equipmentType
                treenode[have_group] = this.sovCol(treenode[have_group], noweq.alarmLevel)
                treenode[have_group].children[have_com] = this.sovCol(treenode[have_group].children[have_com], noweq.alarmLevel)
                treenode[have_group].children[have_com].children[have_fact] = this.sovCol(treenode[have_group].children[have_com].children[have_fact], noweq.alarmLevel)
                treenode[have_group].children[have_com].children[have_fact].children[have_uuit] = this.sovCol(treenode[have_group].children[have_com].children[have_fact].children[have_uuit],noweq.alarmLevel)


                treenode[have_group].children[have_com].children[have_fact].children[have_uuit].children.push({
                  id: noweq.equipmentUuid,
                  label: noweq.equipmentName,
                  visible: noweq.equipmentVisible,
                  key: noweq.equipmentUuid,
                  icon: tmp1.icon,
                  title: tmp1.title,
                  etype: noweq.equipmentType
                })
                this.nodeIcon[noweq.equipmentUuid] = tmp1.icon;
              }


              // this.cnt += 1;
              let tmpNowTree = [];
              for (var i = 0; i < treenode.length; ++i) {
                if (i == 0 && treenode[0].visible == 0) {
                  for (let j in treenode[0].children)
                    tmpNowTree.push(treenode[0].children[j]);
                } else {
                  tmpNowTree.push(treenode[i]);
                }
                // tmpNowTree.push(treenode[i]);
              }

              for (let item1 in this.data) {
                // console.log('1', this.data[item1].label, this.data[item1].key);
                if (this.data[item1].icon != this.nodeIcon[this.data[item1].key]) {
                  this.data[item1].icon = this.nodeIcon[this.data[item1].key];
                }
                for (let item2 in this.data[item1].children) {
                  if (this.data[item1].children[item2].icon != this.nodeIcon[this.data[item1].children[item2].key]) {
                    this.data[item1].children[item2].icon = this.nodeIcon[this.data[item1].children[item2].key];
                  }
                  // console.log('2',this.data[item1].children[item2].label, this.data[item1].children[item2].key);
                  for (let item3 in this.data[item1].children[item2].children) {
                    if (this.data[item1].children[item2].children[item3].icon != this.nodeIcon[this.data[item1].children[item2].children[item3].key]) {
                      this.data[item1].children[item2].children[item3].icon = this.nodeIcon[this.data[item1].children[item2].children[item3].key];
                    }
                    // console.log('3',this.data[item1].children[item2].children[item3].label, this.data[item1].children[item2].children[item3].key);
                    for (let item4 in this.data[item1].children[item2].children[item3].children) {
                      if (this.data[item1].children[item2].children[item3].children[item4].icon != this.nodeIcon[this.data[item1].children[item2].children[item3].children[item4].key]) {
                        this.data[item1].children[item2].children[item3].children[item4].icon = this.nodeIcon[this.data[item1].children[item2].children[item3].children[item4].key];
                      }
                      // console.log('4',this.data[item1].children[item2].children[item3].children[item4].label, this.data[item1].children[item2].children[item3].children[item4].key);
                      for(let item5 in this.data[item1].children[item2].children[item3].children[item4].children) {
                        if (this.data[item1].children[item2].children[item3].children[item4].children[item5].icon != this.nodeIcon[this.data[item1].children[item2].children[item3].children[item4].children[item5].key]) {
                          this.data[item1].children[item2].children[item3].children[item4].children[item5].icon = this.nodeIcon[this.data[item1].children[item2].children[item3].children[item4].children[item5].key];
                        }
                        // console.log('5',this.data[item1].children[item2].children[item3].children[item4].children[item5].label, this.data[item1].children[item2].children[item3].children[item4].children[item5].key);
                      }
                    }
                  }
                }
              }

            }
          })
      }, 60000)
    },
    handleUserIcon(username) { // todo：这里需要判断路由，
      this.$store.state.intervalId = setInterval(() => {
        this.$axios.defaults.baseURL = '/bs'
        this.$axios.get('/user/' + username + '/equipment_uuid').then(res => {
          if (res.data.code == 200) {
            // console.log("happen->res.data", res.data.data)
            /**
             * 保存了设备是否收藏的映射关系 {“9aeca92b89c3f1337dd3452a6e8d8806”: 0}
             */
            let equipmentIsFollow = {}
            for (let d of res.data.data) {
              equipmentIsFollow[d.equipmentUuid] = d.isFollow
            }
            // console.log("happen->equipmentIsFollow", equipmentIsFollow)

            this.$axios.get('/user/' + username + '/equipment').then(res => {
              if (res.data.code == 200) {
                let alldic = {};
                var nowdata = res.data.data;
                nowdata.sort((item1, item2) => {
                  if (item1.groupSort == item2.groupSort) {
                    if (item1.groupName != item2.groupName) {
                      return item1.groupName.localeCompare(item2.groupName);
                    }
                    if (item1.companySort == item2.companySort) {
                      if (item1.companyName != item2.companyName) {
                        return item1.companyName.localeCompare(item2.companyName);
                      }
                      if (item1.factorySort == item2.factorySort) {
                        if (item1.factoryName != item2.factoryName) {
                          return item1.factoryName.localeCompare(item2.factoryName);
                        }
                        if (item1.unitSort == item2.unitSort) {
                          if (item1.unitName != item2.unitName) {
                            return item1.unitName.localeCompare(item2.unitName);
                          }
                          if (item1.equipmentSort == item2.equipmentSort) {
                            return item1.equipmentName.localeCompare(item2.equipmentName);
                          }
                          return item2.equipmentSort - item1.equipmentSort
                        }
                        return item2.unitSort - item1.unitSort
                      }
                      return item2.factorySort - item1.factorySort
                    }
                    return item2.companySort - item1.companySort
                  }
                  return item2.groupSort - item1.groupSort
                });
                if (nowdata == null) {
                  this.data = [];
                  this.$emit('fail');
                  return;
                }
                var treenode = [];
                var allnode = []
                for (var i = 0; i < nowdata.length; ++i) {
                  allnode.push(nowdata[i].equipmentUuid)
                }
                var mymap = {}
                for (var i = 0; i < allnode.length; ++i) {
                  var pid = allnode[i];
                  for (var i = 0; i < nowdata.length; ++i) {
                    var noweq = nowdata[i];
                    var have_group = -1;
                    var groupId = noweq.groupName;

                    for (var j = 0; j < treenode.length; ++j) {
                      if (groupId == treenode[j].id) {
                        have_group = j;
                        break;
                      }
                    }
                    if (have_group == -1) {
                      have_group = treenode.length;
                      treenode.push({id: groupId, key: `${have_group}`, label: noweq.groupName, visible: noweq.groupVisible, children: [], alarmLevel:-2})
                    }
                    //group
                    var companyId = noweq.companyName;
                    var have_com = -1;
                    for (var j = 0; j < treenode[have_group].children.length; ++j) {
                      if (companyId == treenode[have_group].children[j].id) {
                        have_com = j;
                        break;
                      }
                    }
                    if (have_com == -1) {
                      have_com = treenode[have_group].children.length;
                      treenode[have_group].children.push({id: companyId, key: `${have_group}-${have_com}`, visible: noweq.companyVisible, label: noweq.companyName, children: [],alarmLevel:-2})
                    }
                    //company
                    var factoryId = noweq.factoryName;
                    var have_fact = -1;
                    for (var j = 0; j < treenode[have_group].children[have_com].children.length; ++j) {
                      if (factoryId == treenode[have_group].children[have_com].children[j].id) {
                        have_fact = j;
                        break;
                      }
                    }
                    if (have_fact == -1) {
                      have_fact = treenode[have_group].children[have_com].children.length;
                      treenode[have_group].children[have_com].children.push({
                        id: factoryId,
                        label: noweq.factoryName,
                        visible: noweq.factoryVisible,
                        key: `${have_group}-${have_com}-${have_fact}`,
                        children: [], alarmLevel:-2
                      })
                    }
                    //factory
                    var unitId = noweq.unitName;
                    var have_uuit = -1;
                    for (var j = 0; j < treenode[have_group].children[have_com].children[have_fact].children.length; ++j) {
                      if (unitId == treenode[have_group].children[have_com].children[have_fact].children[j].id) {
                        have_uuit = j;
                        break;
                      }
                    }
                    if (have_uuit == -1) {
                      have_uuit = treenode[have_group].children[have_com].children[have_fact].children.length;
                      treenode[have_group].children[have_com].children[have_fact].children.push({
                        id: unitId,
                        label: noweq.unitName,
                        visible: noweq.unitVisible,
                        key: `${have_group}-${have_com}-${have_fact}-${have_uuit}`,
                        children: [], alarmLevel:-2
                      })
                    }
                    //unit
                    let tmp1 = {};
                    if (noweq.alarmLevel == 1) {
                      tmp1['icon'] = 'iconfont icon-dian2 level1'  //智能一级
                      tmp1['title'] = noweq.alarmAlias
                    }
                    if (noweq.alarmLevel == 2) {
                      tmp1['icon'] = 'iconfont icon-dian2 level2'   //智能二级
                      tmp1['title'] = noweq.alarmAlias
                    }
                    if (noweq.alarmLevel == 3) {
                      tmp1['icon'] = 'iconfont icon-dian2 level3'  //智能三级
                      tmp1['title'] = noweq.alarmAlias
                    }
                    if (noweq.alarmLevel == 4) {
                      tmp1['icon'] = 'iconfont icon-dian2 hLevel'  //固定高报
                      tmp1['title'] = noweq.alarmAlias
                    }
                    if (noweq.alarmLevel == 5) {
                      tmp1['icon'] = 'iconfont icon-dian2 hhLevel'  //固定高高报
                      tmp1['title'] = noweq.alarmAlias
                    }
                    if (noweq.alarmLevel == 0) {
                      tmp1['icon'] = 'iconfont icon-dian2 green'  //正常
                      tmp1['title'] = noweq.alarmAlias
                    }
                    if (noweq.alarmLevel == -1) {
                      tmp1['icon'] = 'iconfont icon-dian2 tingji'    //停车
                      tmp1['title'] = noweq.alarmAlias
                    }
                    if (noweq.alarmLevel == -2) {
                      tmp1['icon'] = 'iconfont icon-dian2 duanwang'  //断网
                      tmp1['title'] = noweq.alarmAlias
                    }
                    alldic[noweq.equipmentUuid] = noweq.equipmentType
                    treenode[have_group] = this.sovCol(treenode[have_group], noweq.alarmLevel)
                    treenode[have_group].children[have_com] = this.sovCol(treenode[have_group].children[have_com], noweq.alarmLevel)
                    treenode[have_group].children[have_com].children[have_fact] = this.sovCol(treenode[have_group].children[have_com].children[have_fact], noweq.alarmLevel)
                    treenode[have_group].children[have_com].children[have_fact].children[have_uuit] = this.sovCol(treenode[have_group].children[have_com].children[have_fact].children[have_uuit],noweq.alarmLevel)



                    treenode[have_group].children[have_com].children[have_fact].children[have_uuit].children.push({
                      id: noweq.equipmentUuid,
                      label: noweq.equipmentName,
                      visible: noweq.equipmentVisible,
                      key: noweq.equipmentUuid,
                      icon: tmp1.icon,
                      title: tmp1.title,
                      etype: noweq.equipmentType,
                      isFollow: equipmentIsFollow[noweq.equipmentUuid]
                    })
                    this.nodeIcon[noweq.equipmentUuid] = tmp1.icon;
                  }
                  // if(this.data[0].label == 'bhxz') treenode[0].label = '123';
                  //   else if(this.data[0].label == '123') treenode[0].label = 'bhxz'
                  //   console.log(this.data, treenode, this.data[0].label);
                  for (let item1 in this.data) {
                    // console.log('1', this.data[item1].label, this.data[item1].key);
                    if (this.data[item1].icon != this.nodeIcon[this.data[item1].key]) {
                      this.data[item1].icon = this.nodeIcon[this.data[item1].key];
                    }
                    for (let item2 in this.data[item1].children) {
                      if (this.data[item1].children[item2].icon != this.nodeIcon[this.data[item1].children[item2].key]) {
                        this.data[item1].children[item2].icon = this.nodeIcon[this.data[item1].children[item2].key];
                      }
                      // console.log('2',this.data[item1].children[item2].label, this.data[item1].children[item2].key);
                      for (let item3 in this.data[item1].children[item2].children) {
                        if (this.data[item1].children[item2].children[item3].icon != this.nodeIcon[this.data[item1].children[item2].children[item3].key]) {
                          this.data[item1].children[item2].children[item3].icon = this.nodeIcon[this.data[item1].children[item2].children[item3].key];
                        }
                        // console.log('3',this.data[item1].children[item2].children[item3].label, this.data[item1].children[item2].children[item3].key);
                        for (let item4 in this.data[item1].children[item2].children[item3].children) {
                          if (this.data[item1].children[item2].children[item3].children[item4].icon != this.nodeIcon[this.data[item1].children[item2].children[item3].children[item4].key]) {
                            this.data[item1].children[item2].children[item3].children[item4].icon = this.nodeIcon[this.data[item1].children[item2].children[item3].children[item4].key];
                          }
                          // console.log('4',this.data[item1].children[item2].children[item3].children[item4].label, this.data[item1].children[item2].children[item3].children[item4].key);
                          for(let item5 in this.data[item1].children[item2].children[item3].children[item4].children) {
                            if (this.data[item1].children[item2].children[item3].children[item4].children[item5].icon != this.nodeIcon[this.data[item1].children[item2].children[item3].children[item4].children[item5].key]) {
                              this.data[item1].children[item2].children[item3].children[item4].children[item5].icon = this.nodeIcon[this.data[item1].children[item2].children[item3].children[item4].children[item5].key];
                            }
                            // console.log('5',this.data[item1].children[item2].children[item3].children[item4].children[item5].label, this.data[item1].children[item2].children[item3].children[item4].children[item5].key);
                          }
                        }
                      }
                    }
                  }
                  // for(let item1 in treenode) {
                  //   if(this.data[item1].icon != treenode[item1].icon) {
                  //     this.data[item1].icon = treenode[item1].icon
                  //   }
                  //   for(let item2 in treenode[item1].children) {
                  //     if(this.data[item1].children[item2].icon != treenode[item1].children[item2].icon) {
                  //       this.data[item1].children[item2].icon = treenode[item1].children[item2].icon
                  //     }
                  //     for(let item3 in treenode[item1].children[item2].children) {
                  //       if(this.data[item1].children[item2].children[item3].icon != treenode[item1].children[item2].children[item3].icon) {
                  //         this.data[item1].children[item2].children[item3].icon = treenode[item1].children[item2].children[item3].icon
                  //       }
                  //       for(let item4 in treenode[item1].children[item2].children[item3].children) {
                  //         if(this.data[item1].children[item2].children[item3].children[item4].icon != treenode[item1].children[item2].children[item3].children[item4].icon) {
                  //           this.data[item1].children[item2].children[item3].children[item4].icon = treenode[item1].children[item2].children[item3].children[item4].icon
                  //         }
                  //         for(let item5 in treenode[item1].children[item2].children[item3].children[item4].children)
                  //           if(this.data[item1].children[item2].children[item3].children[item4].children[item5].icon != treenode[item1].children[item2].children[item3].children[item4].children[item5]) {
                  //             this.data[item1].children[item2].children[item3].children[item4].children[item5].icon = treenode[item1].children[item2].children[item3].children[item4].children[item5].icon
                  //           }
                  //       }
                  //     }
                  //   }
                  // }
                  // this.data = treenode
                  // })
                }
                // let that = this;
                //     if (this.$route.query.equipmentUuid) {
                //       this.$nextTick(() => {
                //         that.$refs.mytree.setCurrentKey(this.$route.query.equipmentUuid);
                //       })

                //     }


              }
            })


          }
        })




      }, 60000)
    },
    sendMessage() {    // 向平台发送切换页面的信息，缓存下来，这样刷新之后可以直接跳转到该页面

      let uid = this.$store.state.uid;
      let equipmentUuid = this.$route.query.equipmentUuid;
      let username = this.$store.state.username;
      let childParameter = '';
      if(uid != '') {
        childParameter = "?uid=" + uid;
        if(username != '') {
          childParameter += "&username=" + username;
        }
        if(equipmentUuid != '') {
          childParameter += "&equipmentUuid=" + equipmentUuid;
        }
      }

      if(childParameter != '')
        window.localStorage.setItem('child_parameter', childParameter);
    },
    urlParse(){
      let obj = {};
      let reg = /[?&][^?&]+=[^?&%]+/g;
      let url = window.location.search;
      let arr = url.match(reg);
      if(arr) {

        arr.forEach((item) => {
          let tempArr = item.substring(1).split('=');
          let key = decodeURIComponent(tempArr[0]);
          let val = decodeURIComponent(tempArr[1]);
          obj[key] = val;
        })
        return obj;
      }
      else return {}
    },
    getOfflineEquTree() {
      let that = this
      this.cnt = 0
      this.idArr = []
      this.$axios.get("/node/info").then(res => {
        // console.log('PlantTree 离线节点', res)
        if (res.data.code === 200) {
          this.nowtree = [];
          this.mylen = res.data.data.length;
          let nodeId;
          for (var i = 0; i < res.data.data.length; i++) {
            if (!res.data.data[i].nodeType) {
              nodeId = res.data.data[i].nodeId
            }
          }
          // 对离线nodeId请求节点信息
          this.$axios.get("/equipment/node/" + nodeId + "/info").then(res => {
            // console.log('PlantTree 离线节点的设备数据', res)
            if (res.data.code == 200) {
              res.data.data = this.handleFilter(res.data.data);
              var nowdata = res.data.data;
              nowdata.sort((item1, item2) => {
                if (item1.groupSort == item2.groupSort) {
                  if (item1.groupName != item2.groupName) {
                    return item1.groupName.localeCompare(item2.groupName);
                  }
                  if (item1.companySort == item2.companySort) {
                    if (item1.companyName != item2.companyName) {
                      return item1.companyName.localeCompare(item2.companyName);
                    }
                    if (item1.factorySort == item2.factorySort) {
                      if (item1.factoryName != item2.factoryName) {
                        return item1.factoryName.localeCompare(item2.factoryName);
                      }
                      if (item1.unitSort == item2.unitSort) {
                        if (item1.unitName != item2.unitName) {
                          return item1.unitName.localeCompare(item2.unitName);
                        }
                        if (item1.equipmentSort == item2.equipmentSort) {
                          return item1.equipmentName.localeCompare(item2.equipmentName);
                        }
                        return item2.equipmentSort - item1.equipmentSort
                      }
                      return item2.unitSort - item1.unitSort
                    }
                    return item2.factorySort - item1.factorySort
                  }
                  return item2.companySort - item1.companySort
                }
                return item2.groupSort - item1.groupSort
              });
              var treenode = []; // 设备树对象列表
              // 循环多个设备
              for (var i = 0; i < nowdata.length; ++i) {
                var noweq = nowdata[i]; // 单个设备信息
                var have_group = -1; // flag：是否保存了相同的groupId
                var groupId = noweq.groupId; // 获取groupId
                // treenode查找保存groupId的位置
                for (var j = 0; j < treenode.length; ++j) {
                  if (groupId == treenode[j].id) {
                    have_group = j;
                    break;
                  }
                }
                // 如果没有groupId，在treenode中新建一个对象
                if (have_group == -1) {
                  have_group = treenode.length;
                  treenode.push({id: groupId, label: noweq.groupName, children: [], alarmLevel:-2,})
                }
                //group
                var companyId = noweq.companyName;
                var have_com = -1;
                for (var j = 0; j < treenode[have_group].children.length; ++j) {
                  if (companyId == treenode[have_group].children[j].id) {
                    have_com = j;
                    break;
                  }
                }
                if (have_com == -1) {
                  have_com = treenode[have_group].children.length;
                  treenode[have_group].children.push({id: companyId, label: noweq.companyName, children: [], alarmLevel:-2})
                }
                //company
                var factoryId = noweq.factoryName;
                var have_fact = -1;
                for (var j = 0; j < treenode[have_group].children[have_com].children.length; ++j) {
                  if (factoryId == treenode[have_group].children[have_com].children[j].id) {
                    have_fact = j;
                    break;
                  }
                }
                if (have_fact == -1) {
                  have_fact = treenode[have_group].children[have_com].children.length;
                  treenode[have_group].children[have_com].children.push({
                    id: factoryId,
                    label: noweq.factoryName,
                    children: [], alarmLevel:-2
                  })
                }
                //factory
                var unitId = noweq.unitName;
                var have_uuit = -1;
                //  console.log(treenode[have_group].children[have_com].children[have_fact])
                for (var j = 0; j < treenode[have_group].children[have_com].children[have_fact].children.length; ++j) {
                  if (unitId == treenode[have_group].children[have_com].children[have_fact].children[j].id) {
                    have_uuit = j;
                    break;
                  }
                }
                if (have_uuit == -1) {
                  have_uuit = treenode[have_group].children[have_com].children[have_fact].children.length;
                  treenode[have_group].children[have_com].children[have_fact].children.push({
                    id: unitId,
                    label: noweq.unitName,
                    children: [], alarmLevel:-2
                  })
                }
                //unit

                let tmp1 = {}
                if (noweq.alarmLevel == 1) {
                  tmp1['icon'] = 'iconfont icon-dian2 level1'  //智能一级
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 2) {
                  tmp1['icon'] = 'iconfont icon-dian2 level2'   //智能二级
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 3) {
                  tmp1['icon'] = 'iconfont icon-dian2 level3'  //智能三级
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 4) {
                  tmp1['icon'] = 'iconfont icon-dian2 hLevel'  //固定高报
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 5) {
                  tmp1['icon'] = 'iconfont icon-dian2 hhLevel'  //固定高高报
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == 0) {
                  tmp1['icon'] = 'iconfont icon-dian2 green'  //正常
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == -1) {
                  tmp1['icon'] = 'iconfont icon-dian2 tingji'    //停车
                  tmp1['title'] = noweq.alarmAlias
                }
                if (noweq.alarmLevel == -2) {
                  tmp1['icon'] = 'iconfont icon-dian2 duanwang'  //断网
                  tmp1['title'] = noweq.alarmAlias
                }

                // 存在问题，离线的alarmLevel大量是0或者-1000
                treenode[have_group] = this.sovCol(treenode[have_group], noweq.alarmLevel)
                treenode[have_group].children[have_com] = this.sovCol(treenode[have_group].children[have_com], noweq.alarmLevel)
                treenode[have_group].children[have_com].children[have_fact] = this.sovCol(treenode[have_group].children[have_com].children[have_fact], noweq.alarmLevel)
                treenode[have_group].children[have_com].children[have_fact].children[have_uuit] = this.sovCol(treenode[have_group].children[have_com].children[have_fact].children[have_uuit],noweq.alarmLevel)

                treenode[have_group].children[have_com].children[have_fact].children[have_uuit].children.push({
                  id: noweq.equipmentUuid,
                  label: noweq.equipmentName,
                  icon: tmp1.icon,
                  title: tmp1.title,
                  etype: noweq.equipmentType
                })
              }

              this.cnt += 1;
              for (var i = 0; i < treenode.length; ++i) {
                this.nowtree.push(treenode[i]);
              }

              if (true) {
                this.data = this.nowtree;

                this.data.forEach(m => {
                  this.idArr.push(m.id)
                })  //遍历进行二级展开

                console.log(this.data, this.nowtree);
                // 没有设置defaultId（设备树默认选择节点）时，选择第一个
                let defaultid = this.nowtree[0].children[0].children[0].children[0].children[0].id;
                console.log(this.$route.query.equipmentUuid);
                if (this.$route.query.equipmentUuid) {
                  defaultid = this.$route.query.equipmentUuid;
                }
                // 临时写出来，避免与其他的etype冲突（在menu组件中有其他标题栏有选择控制）
                this.$store.state.etype = 11
                // 确定第一个设备树equipmentUuid保存在网址的query
                this.$router.push({query: {equipmentUuid: defaultid}});
                // 从端口获取离线信息
                this.$store.dispatch('saveOfflineEquipmentInfo', defaultid)
                this.idArr = [defaultid];
                this.currentNodeId = defaultid;
                // console.log('question')
                console.log('PlantTree 默认选择的id', defaultid)
                // console.log('PlantTree 当前树下的的etype', this.nowtree[0].children[0].children[0].children[0].children[0].etype)
                // this.$store.state.etype = this.nowtree[0].children[0].children[0].children[0].children[0].etype;
                this.$nextTick(() => {
                  console.log('设备id', defaultid, this.data);
                  this.$refs.mytree.setCurrentKey(defaultid);
                });
              }
            }
          })
        }
      }).catch(err => {
        // console.log(err);
      })
    },

  },
}
</script>

<style lang="scss">

.treebox {
  --leftconbgcolor: #222331;
  --activetextcolor: #1677FF;
  --inputbgcolor: #222331;
  --textcolor: #ffffff;
  --level1: #e6f600;
  --level2: #f4e301;
  --level3: #e69924;
  --hLevel: #ee831f;
  --hhLevel: #e50a0a;
  --zhengchang: green;
  --duangwang:  rgb(148, 139, 84);
  --tingji: rgb(190, 190, 190);
  .red {
    color: red;
  }

  .yellow {
    color: yellow;
  }

  .level1 {
    color: var(--level1);
  }

  .level2 {
    color: var(--level2);
  }
  .level3 {
    color: var(--level3);
  }
  .hLevel {
    color: var(--hLevel);
  }
  .hhLevel {
    color: var(--hhLevel);
  }
  .green {
    color: var(--zhengchang);
  }

  .duanwang {
    color: var(--duanwang);
  }

  .tingji {
    color: var(--tingji);
  }

  .search-box{
    margin-top: 10px;
    margin-bottom: 15px;
    display: flex;
    border-radius: 2px;
    margin-left: 10px;
  }
  .search-box-icon{
    opacity: 0.8;
    padding: 0 8px;
    //width: 32px;
    //height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    color: var(--textcolor);
  }
  .dropdown{
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 10px;
    border: 1px solid #E4E7ED;
    border-radius: 4px;
    background-color: #ffffff;//周钰凯要求白色
    position: fixed;
    z-index: 9999;
    .el-checkbox{
      zoom: 100%;
    }
    .el-checkbox__label{
      color: black;
      font-size: 13px;
    }
  }
  .myinput {

    .el-input__inner {
      height: 30px;
      font-size: 14px;
      background-color: var(--inputbgcolor);
      // background-color: #303749;
      color: var(--textcolor);
      border-radius: 2px!important;
    }

    /* 调整图标的位置、大小和颜色 */
    .el-icon-s-operation {
      height: 30px;
      color: var(--textcolor); /* 调整图标的颜色，需要在CSS变量中定义这个颜色 */
      cursor: pointer; /* 更改鼠标悬停时的光标样式 */


    }
  }
  .filter-tree {
    height: calc(100% - 50px) !important;
    overflow: auto;
  }
  .el-tree {
    height: 100%;
    font-family: "微软雅黑";
    background-color: var(--leftconbgcolor);
    // background-color: #303749;
  }

  .el-collapse-item {
    background-color: #303749 !important;
  }

  .el-tree-node__label {
    font-size: 14px;
    color: var(--leftconbgcolor);
    display: inline-block; /* 使背景颜色只包围文字 */
  }


  .el-tree-node__expand-icon{
    border-radius: 4px;
  }

  .el-tree-node > .el-tree-node__content {
    background-color: var(--leftconbgcolor) !important;

  }

  .el-tree-node.is-current > .el-tree-node__content {
    background-color: var(--activetextcolor) !important ;
    span{
      span{
        color: #ffffff !important;
      }
    }
    border-radius: 10px;
  }

  .el-tree-node__children .el-tree-node__children .el-tree-node__children .el-tree-node__children .el-tree-node__content {
    padding-left: 0 !important;
    margin-left: 72px;
  }
  .el-tree-node__children .el-tree-node__children .el-tree-node__children .el-tree-node__content {
    padding-left: 0 !important;
    margin-left: 54px;
  }
  .el-tree-node__children .el-tree-node__children .el-tree-node__content {
    padding-left: 0 !important;
    margin-left: 36px;
  }
  .el-tree-node__children .el-tree-node__content {
    padding-left: 0 !important;
    margin-left: 18px;
  }
  .el-tree-node__content {
    padding-left: 0 !important;
  }

  .el-select-dropdown__item {
    height: 25px;
    /*line-height: 20px;*/
  }
}

</style>
