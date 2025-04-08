<template>
  <div class="box" ref="ui">
    <el-container @click.native="handleClick">
      <el-header height="48px" v-show="$store.state.hidden.menu">
        <div class="my-div1">
          <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            :unique-opened="true"
            menu-trigger="click"
            ref="topMenu"
            :router="false"
            @select="handleSelect"
            @open="handleOpen"
            :background-color="backgroundcolor"
            :text-color="textcolor"
            :active-text-color="activetextcolor">

            <el-menu-item index="SystemManagement" v-show="menu.SystemManagement.show">{{menu.SystemManagement.name}}</el-menu-item>

            <el-submenu index="1" :disabled="showManual"  v-show="menu.SpecialManualOfPump.show" style="width: 200px;">
              <template slot="title">
<!--                {{translateText("menu.textMap.",'机泵专用图谱')}}-->
                <span style="display: inline-block; width: 180px; text-align: center;">
                  {{translateText("menu.textMap.",'机泵专用图谱')}}
                </span>
              </template>
              <el-menu-item index="/UnitOverviewMap" v-show="menu.SpecialManualOfPump.data['1']"><img :src="imgUrl_UnitMap" style="height: 15px;width: 20px;background: white">  {{translateText("menu.textMap.", menu.SpecialManualOfPump.data._1name)}}</el-menu-item>
              <el-menu-item index="/AlarmQueryGraph" v-show="menu.SpecialManualOfPump.data['2']"><img :src="imgUrl_Alarm_Q" style="height: 15px;width: 20px;background: white">  {{translateText("menu.textMap.", menu.SpecialManualOfPump.data._2name)}}</el-menu-item>
              <el-menu-item index="/TrendAnalysis" v-show="menu.SpecialManualOfPump.data['3']"><img :src="imgUrl_Trend_A" style="height: 15px;width: 20px;background: white">  {{translateText("menu.textMap.", menu.SpecialManualOfPump.data._3name)}}</el-menu-item>
              <el-menu-item index="/PumpImpactDiagnosis" v-show="menu.SpecialManualOfPump.data['4']"><img :src="imgUrl_Pump_P" style="height: 15px;width: 20px;background: white">  {{translateText("menu.textMap.", menu.SpecialManualOfPump.data._4name)}}</el-menu-item>
              <!-- <el-menu-item index="/VibrationMonitor" v-show="menu.SpecialManualOfPump.data['3']">振动监测</el-menu-item>-->
              <el-menu-item index="/RotorFaultDiagnosis" v-show="menu.SpecialManualOfPump.data['5']"><img :src="imgUrl_RotorFault_D" style="height: 15px;width: 20px;background: white">  {{translateText("menu.textMap.", menu.SpecialManualOfPump.data._5name)}}</el-menu-item>
              <el-menu-item index="/CepstrumGraph" v-show="menu.SpecialManualOfPump.data['6']"><img :src="imgUrl_Cepstrum_G" style="height: 15px;width: 20px;background: white">  {{translateText("menu.textMap.", menu.SpecialManualOfPump.data._6name)}}</el-menu-item>
              <!--   <el-menu-item index="/ChangeVisualization" v-show="menu.SpecialManualOfPump.data['5']">变工况可视化</el-menu-item>-->
              <el-menu-item index="/OtherParametersTrendGraph" v-show="menu.SpecialManualOfPump.data['7']"><img :src="imgUrl_Other_Parameters" style="height: 15px;width: 20px;background: white"> {{translateText("menu.textMap.", menu.SpecialManualOfPump.data._7name)}}
              </el-menu-item>
              <el-menu-item index="/SingleMultiBarValueChart" v-show="menu.SpecialManualOfPump.data['8']"><img :src="imgUrl_Single_Multi" style="height: 15px;width: 20px;background: white"> {{translateText("menu.textMap.", menu.SpecialManualOfPump.data._8name)}}
              </el-menu-item>

              <el-menu-item index="/AnalysisGraph" v-show="menu.SpecialManualOfPump.data['14']"><img :src="imgUrl_Alarm_Q" style="height: 15px;width: 20px;background: white">  {{translateText("menu.textMap.", menu.SpecialManualOfPump.data._14name)}}</el-menu-item>
            </el-submenu>

            <el-menu-item index="/CaseBaseSystem" v-show="menu.CaseBaseSystem.show">{{menu.CaseBaseSystem.name}}</el-menu-item>
            <el-menu-item index="/StatisticOfAlarm" v-show="menu.AlarmStatistics.show">{{menu.AlarmStatistics.name}}</el-menu-item>
            <el-menu-item index="/AnotherStatisticOfAlarm" v-show="menu.AnotherPointState.show">{{menu.AnotherPointState.name}}</el-menu-item>
            <el-submenu index="8" class="another_item" v-show="menu.Admin.show">
              <template slot="title">{{menu.Admin.name}}</template>
              <el-menu-item index="login">切换用户</el-menu-item>
              <el-menu-item index="login">注销</el-menu-item>
            </el-submenu>
          </el-menu>
        </div>
        <div class="my-div" v-if="showTopic">
          <el-menu
            :default-active="topiccolor"
            class="el-menu-demo"
            mode="horizontal"
            :unique-opened="true"
            menu-trigger="click"
            ref="topMenu1"
            @select="handleTopic"
            @open="handleOpen"
            :background-color="backgroundcolor"
            :text-color="textcolor"
            :active-text-color="activetextcolor">
            <el-submenu index="9" class="another_item">
              <template slot="title">{{translateText('menu.textMap.','更改主题')}}</template>
              <el-menu-item index="quiet-blue">{{translateText('menu.textMap.','静谧蓝')}}</el-menu-item>
              <el-menu-item index="simple-white">{{translateText('menu.textMap.','简约白')}}</el-menu-item>
              <el-menu-item index="high-ash">{{translateText('menu.textMap.','高级灰')}}</el-menu-item>
            </el-submenu>
          </el-menu>
        </div>
        <div class="my-div" v-if="showLanguage">
          <el-menu
            :default-active="topiccolor"
            class="el-menu-demo"
            mode="horizontal"
            :unique-opened="true"
            ref="topMenu2"
            menu-trigger="click"
            @select="translateLan"
            @open="handleOpen"
            :background-color="backgroundcolor"
            :text-color="textcolor"
            :active-text-color="activetextcolor">
            <el-submenu index="9" class="another_item">
              <template slot="title">{{translateText("menu.textMap.",'语言')}}</template>
              <el-menu-item index="zh">{{translateText("menu.textMap.",'中文')}}</el-menu-item>
              <el-menu-item index="en">{{translateText("menu.textMap.",'英文')}}</el-menu-item>
            </el-submenu>
          </el-menu>
        </div>
      </el-header>

      <el-container class="content">
      <div class="left-aside" id="leftAside" v-show="$store.state.hidden.plantTree">
        <div class="left-title" v-show="showMenu">
          <span class="left-title-txt">{{translateText('plTree.','组织机构')}}</span>
        </div>
        <div class="left-content" :style="{width: myWidth}" v-show="showMenu">
          <PlantTree class="trees" ref="plant" @handleMenuClose="handleClick" @updateRouter="updateRouter" @changeTopic="changeTopic" @NowEquid="ChangEquId" @fail='datafail'></PlantTree>
        </div>
        <div class="menu-hide">
          <div v-if="showMenu" @click="changeflag" class="op-btn">
            <svg class="op-btn-svg" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;" width="10px" height="66px" viewBox="0 0 10 66" fill="none">
              <path d="M0 0L10 8V58L0 66V0Z" :fill="$store.state.leftconbgcolor"/>
            </svg>
            <svg class="op-btn-svg" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M7.36623 1.72184V0.85912C7.36623 0.784343 7.28029 0.743048 7.22225 0.788807L2.191 4.71849C2.14826 4.75174 2.11367 4.79431 2.08987 4.84295C2.06608 4.8916 2.05371 4.94503 2.05371 4.99919C2.05371 5.05334 2.06608 5.10678 2.08987 5.15542C2.11367 5.20407 2.14826 5.24663 2.191 5.27988L7.22225 9.20957C7.28141 9.25533 7.36623 9.21403 7.36623 9.13925V8.27653C7.36623 8.22184 7.34056 8.16939 7.29815 8.13591L3.28029 4.99974L7.29815 1.86247C7.34056 1.82899 7.36623 1.77653 7.36623 1.72184Z" :fill="$store.state.textcolor" fill-opacity="0.85"/>
            </svg>
          </div>
          <div v-else @click="changeflag" class="op-btn">
            <svg class="op-btn-svg" xmlns="http://www.w3.org/2000/svg" width="10" height="66" viewBox="0 0 10 66" fill="none">
              <path d="M0 0L10 8V58L0 66V0Z" :fill="$store.state.leftconbgcolor" />
            </svg>
            <svg class="op-btn-svg" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;" width="10px" height="10px" viewBox="0 0 10 10" fill="none">
              <path d="M7.83147 4.71901L2.80022 0.789324C2.78708 0.778974 2.77128 0.772542 2.75464 0.770766C2.738 0.76899 2.7212 0.771944 2.70617 0.779286C2.69113 0.786629 2.67847 0.798063 2.66964 0.812276C2.66081 0.826489 2.65617 0.842904 2.65625 0.859636V1.72236C2.65625 1.77705 2.68192 1.8295 2.72433 1.86298L6.74219 5.00026L2.72433 8.13754C2.6808 8.17102 2.65625 8.22348 2.65625 8.27816V9.14089C2.65625 9.21566 2.74219 9.25696 2.80022 9.2112L7.83147 5.28151C7.87424 5.24816 7.90883 5.20549 7.93262 5.15675C7.95642 5.10802 7.96878 5.0545 7.96878 5.00026C7.96878 4.94603 7.95642 4.89251 7.93262 4.84377C7.90883 4.79504 7.87424 4.75237 7.83147 4.71901Z" :fill="$store.state.textcolor" fill-opacity="0.85"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="main">
<!--        这里最多缓存10个组件-->
        <keep-alive max="10">
          <router-view
            v-if="$route.meta.keepAlive"
            :key="$route.fullPath"
            @changename='changeunitname'
            @dataloading='dataloading'
            @hideloading='hideloading'
            @datasuccess='datasuccess'
            @datafail='datafail'
            @datanull='datanull'
            @notEvent="notEvent"
            @notExitPoint="notExitPoint"
            @pointNull='pointNull'
            @tmpDataNull='tmpDataNull'
            @intervalError="intervalError"
            @setinfoname='setnowname'
            @showOpPage='setOpPage'
          ></router-view>
        </keep-alive>
        <router-view
          v-if="!$route.meta.keepAlive"
          @changename='changeunitname'
          @dataloading='dataloading'
          @datasuccess='datasuccess'
          @datafail='datafail'
          @datanull='datanull'
          @notEvent="notEvent"
          @notExitPoint="notExitPoint"
          @pointNull='pointNull'
          @tmpDataNull='tmpDataNull'
          @intervalError="intervalError"
          @setinfoname='setnowname'
          @showOpPage='setOpPage'
        ></router-view>
      </div>
<!--      修改标注弹窗-->
      <div>
        <el-dialog
          title="请输入标注"
          :top="upsHeight"
          :modal="false"
          :visible.sync="$store.state.dialogVisible"
          width="20%"
        >
          <el-input size="mini" v-model="$store.state.upsInputValue"></el-input>
          <span slot="footer">
            <el-button size="mini" @click="$store.state.dialogVisible = false">取消</el-button>
            <el-button size="mini" type="primary" @click="$store.state.updateGraphicTextFlag = true;$store.state.dialogVisible = false">确定</el-button>
          </span>
        </el-dialog>
      </div>
<!--      数据加载ing-->
      <div class="data-loading" ref="load" style="display: block">
        <div class="loadingtext"><i class="el-icon-loading"></i>数据加载中qaq</div>
      </div>
<!--      数据获取失败了-->
      <div class="datafail" ref="fail" style="display: none">
        <div class="failtext"><i class="el-icon-warning"></i>数据获取失败了qaq</div>
      </div>
      </el-container>
    </el-container>

  </div>
</template>

<script>
  import event from "../assets/event";
  import PlantTree from "../components/ComUtils/PlantTree";
  import bottomInfo from "../Page/bottomInfo";
  import menuBar from "../language/zh/menuBar"
  import {Base64} from 'js-base64';
  import en from 'element-ui/lib/locale/lang/en'
  import zh from 'element-ui/lib/locale/lang/zh-CN'
  import locale from 'element-ui/lib/locale'
  import { mapState, mapGetters, mapActions, mapMutations } from "vuex";

  var elementResizeDetectorMaker = require("element-resize-detector");

  export default {
    name:"home",
    data() {
      return {
        imgUrl_UnitMap:require("../assets/unitmap.png"),
        imgUrl_Alarm_Q:require("../assets/Alarm_Q.png"),
        imgUrl_Trend_A:require("../assets/Trend_A.png"),
        imgUrl_Pump_P:require("../assets/Pump_P.png"),
        imgUrl_Other_P:require("../assets/Other_P.png"),
        imgUrl_RotorFault_D:require("../assets/RotorFault_D.png"),
        imgUrl_Cepstrum_G:require("../assets/Cepstrum_G.png"),
        imgUrl_Single_Multi:require("../assets/Single_Multi.png"),
        imgUrl_Other_Parameters:require("../assets/Other_Parameters.png"),
        imgUrl_Xuan_Map:require("../assets/Xuan_Map.png"),
        imgUrl_XuanVib:require("../assets/XuanVib.png"),
        imgUrl_XuanHisCompare:require("../assets/Xuan_HisCompare.png"),
        imgUrl_XuanZhouG:require("../assets/Xuan_ZhouG.png"),
        imgUrl_XuanZhouW:require("../assets/Xuan_ZhouW.png"),
        imgUrl_XuanStartStop:require("../assets/Xuan_StartStop.png"),
        imgUrl_Xuan_ZongH:require("../assets/Xuan_ZongH.png"),
        imgUrl_Xuan_RunS:require("../assets/Xuan_RunS.png"),
        imgUrl_AllS:require("../assets/Xuan_AllS.png"),
        imgUrl_TwoS:require("../assets/Xuan_TwoS.png"),
        imgUrl_ThreeS:require("../assets/Xuan_ThreeS.png"),
        imgUrl_DPH:require("../assets/Xuan_DPH.png"),
        imgUrl_WangFM:require("../assets/WangFM.png"),
        imgUrl_Wang_HBai:require("../assets/Wang_HBai.png"),
        imgUrl_Wang_HGuiJi:require("../assets/WangHGuiJi.png"),
        imgUrl_Wang_SG:require("../assets/WangSG.png"),
        imgUrl_Wang_YJ:require("../assets/Wang_YJ.png"),
        imgUrl_Wang_DCS:require("../assets/Wang_DCS.png"),
        nowwidth: (window.screen.width - 270) + 'px',
        // menu: config.menu,
        bookImg: require('@/assets/BH.png'),
        showMenu: true,
        equid: '',
        nowpos: '',
        nowWidth: 0,
        nowHeight: 0,
        nowOpenedIndex: 0,
        isOpened: false,

        myWidth: '230px',
        pathFlag: config.menu.interface,
        tmpmenu:  config.menu,
      }
    },
    mounted() {
      event.$on('setOpPage', (val) => {
        this.setOpPage(val);
      });
      let tempId = setTimeout(()=>{
        let intervalId = setInterval(() => { // 定时关闭弹窗
          this.closePromptBox();
        }, 5000);
        this.$store.state.intervalIds.push(intervalId);
      }, 5000);
      this.$store.state.intervalIds.push(tempId);

      if (document.getElementById("lefttupu")) {
        var erd = elementResizeDetectorMaker();
        var plantHeight = elementResizeDetectorMaker();
        let that = this;
        that.$nextTick(() => {

          const resizeObeserver1 = new ResizeObserver(entries => {
            for (let entry of entries) {
              const width = entry.contentRect.width;
              this.$nextTick( () => {
                if (this.$store.state.timeRadio == 1) {
                  if (this.$store.state.showPlanttree) {
                    this.myWidth = '0px';
                    this.showMenu = false;
                    this.$store.state.showPlanttree = false;
                  } else {
                    this.myWidth = '230px';
                  }
                }
                this.nowWidth = width;
              })
            }
          });
          try {
            resizeObeserver1.observe(document.getElementById("lefttupu"))
          } catch (error) {
            console.log(error)
          }

          plantHeight.listenTo(document.getElementById("leftAside"), function (element) {
            var plant_height = element.offsetHeight;
            if (document.getElementById("UnitOverviewMap")) {
              document.getElementById("UnitOverviewMap").style.height = plant_height.toString() + 'px';
            }
          });
        });
      }

      this.$refs.ui.style.setProperty('--bgcolor', this.$store.state.bgcolor);
      this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
      this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
      this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
      this.$refs.ui.style.setProperty('--treeinputbgcolor', this.$store.state.treeinputbgcolor);
      this.$refs.ui.style.setProperty('--labelcolor', this.$store.state.labelcolor);
      this.$refs.ui.style.setProperty('--scrollbarbgcolor', this.$store.state.scrollbarbgcolor);
      this.$refs.ui.style.setProperty('--scrollbarthumbbgcolor', this.$store.state.scrollbarthumbbgcolor);
      this.$refs.ui.style.setProperty('--activetextcolor', this.$store.state.activetextcolor);
    },
    beforeCreate(){
      let intervalid = setTimeout(() => {
        console.table({
          version:"1.0.0",
          date:window.versionTime,
          NODE_ENV: process.env.NODE_ENV,
        })
      },2000);
      this.$store.state.intervalIds.push(intervalid);
      console.table({
        version:"1.0.0",
        date:"2025-2-27 16:06:00",
        NODE_ENV: process.env.NODE_ENV,
      })
    },

    async created(){

      this.saveUrlParams()//保存url中参数，初始化主题、语言
      let tmptoken = localStorage.getItem('token');
      //console.log(tmptoken+"tmptoken  qaq");
      this.$store.state.token = tmptoken
      this.$axios.defaults.headers.common['Authorization'] = tmptoken.startsWith('Bearer ') ? tmptoken : 'Bearer ' + tmptoken

      //获取平台接口配置
      // 调用 axios 获取 /properties/findByApp 接口的数据
      // 遍历 mydata，根据 key 值决定如何更新 Vuex 里的状态
      // 如果请求失败，则每 3 秒重试一次，直到成功（setInterval）
      if(config.menu.interface) { // 获取平台接口配置
        this.$axios.get('/properties/findByApp', {
          params:{
            application: 'bs',
          }
        }).then(res => {
          if(res.data.code == 200) {
            let mydata = res.data.data;
            for(let item in mydata) {
              let tmp = mydata[item].key;
              if (tmp == 'DefaultMax500HzInFrequencyGraph') {
                   this.$store.state.DefaultMax500HzInFrequencyGraph = mydata[item].value.show;
              }
              if (tmp == 'OfflineOverviewIP') {
                this.tmpmenu[tmp] = mydata[item].value;
                this.$store.state.ProcessOverviewIP = mydata[item].value;
              }
              else if (tmp == 'ProcessOverviewIP') {
                this.tmpmenu[tmp] = mydata[item].value;
                this.$store.state.ProcessOverviewIP = mydata[item].value;
              }
              else if (tmp == 'OverviewDisplayMode') {
                this.$store.state.OverviewDisplayMode =  Math.round(Number(mydata[item].value));
              }
              else if (tmp == 'RoutineAnalysis' || tmp == 'OfflineAnalysis') {
                let myjson = mydata[item].value;
                this.tmpmenu['OfflineAnalysis'].show = myjson.show;
                this.tmpmenu['OfflineAnalysis'].name = myjson.name;
              }
              else if (tmp == 'threeDimensionalOverviewIP') {
                this.$store.state.threeDimensionalOverviewIP =  mydata[item].value;
              }
              else if(tmp == 'showProcessOverview'){
                this.$store.state.showProcessOverview =  mydata[item].value;
              }
              else {
                let myjson = mydata[item].value;
                try {
                  if(myjson && myjson.name && this.tmpmenu[tmp].name) {
                    this.tmpmenu[tmp].name = myjson.name;
                    this.tmpmenu[tmp].show = myjson.show;
                  }
                } catch (e) {
                  console.log(e);
                }
              }
            }
          } else {//API 失败时 3 秒后重试
            let myInterval = setInterval(() => {
              this.$axios.get('/properties/findByApp', {
                params:{
                  application: 'bs',
                }
              }).then(res => {
                if(res.data.code == 200) {
                  clearInterval(myInterval);
                  let mydata = res.data.data;
                  for(let item in mydata) {
                    let tmp = mydata[item].key;
                    let myjson = mydata[item].value;
                    if(myjson) {
                      this.tmpmenu[tmp].name = myjson.name;
                      this.tmpmenu[tmp].show = myjson.show;
                    }
                  }
                }

              })
            }, 3000)
          }
        })
      }
//获取报警等级颜色
      let axiosInstance = this.$axios.create({
        baseURL: '',
        timeout: 15000,
      })
      axiosInstance.defaults.headers.common['Authorization'] = tmptoken.startsWith('Bearer ') ? tmptoken : 'Bearer ' + tmptoken
      //调用平台接口，获取报警等级颜色
      axiosInstance.get('/center6/login/' + this.$store.state.username + '/webInit/').then(res => {
        if(res.data.code == 200) {
          this.$store.state.zhengchang = res.data.data.alarmColorInfo['0']
          this.$store.state.level1 = res.data.data.alarmColorInfo['1']
          this.$store.state.level2 = res.data.data.alarmColorInfo['2']
          this.$store.state.level3 = res.data.data.alarmColorInfo['3']
          this.$store.state.hLevel = res.data.data.alarmColorInfo['4']
          this.$store.state.hhLevel = res.data.data.alarmColorInfo['5']
          this.$store.state.tingji = res.data.data.alarmColorInfo['-1']
          this.$store.state.duangwang = res.data.data.alarmColorInfo['-2']
          this.$refs.plant.setAlarmColor()
        } else{//失败时 3 秒后重试
          let tmpInterval = setInterval(() => {
            axiosInstance.get('/center6/login/'+this.$store.state.username+'/webInit/').then(res => {
              if(res.data.code == 200) {
                clearInterval(tmpInterval);
                this.$store.state.zhengchang = res.data.data.alarmColorInfo['0']
                this.$store.state.level1 = res.data.data.alarmColorInfo['1']
                this.$store.state.level2 = res.data.data.alarmColorInfo['2']
                this.$store.state.level3 = res.data.data.alarmColorInfo['3']
                this.$store.state.hLevel = res.data.data.alarmColorInfo['4']
                this.$store.state.hhLevel = res.data.data.alarmColorInfo['5']
                this.$store.state.tingji = res.data.data.alarmColorInfo['-1']
                this.$store.state.duangwang = res.data.data.alarmColorInfo['-2']
                this.$refs.plant.setAlarmColor()
              }
            })
          }, 3000)
        }
      }).catch(e=>{
        console.log(e)
      })
    },
    computed:{
      ...mapState({
        backgroundcolor:'backgroundcolor',
        activetextcolor:'activetextcolor',
        textcolor:'textcolor',
        nodeType:'nodeType'
      }),
      showLanguage() {
        return process.env.NODE_ENV === 'development' && config.showLanguage;  // 平台不显示切换语言，平台通过url切换
      },
      showTopic() {
        return process.env.NODE_ENV === 'development' && config.showTopic; // 平台不显示切换主题，平台通过url切换
      },
      menu() {
        if(config.menu.interface) {
          // console.log('使用接口', this.tmpmenu);
          this.tmpmenu.DieselMonitorSystem.show = false
          this.tmpmenu.gasTurbineGraph.show = false
          this.tmpmenu.SpecialManualOfPump1.show = false
          return this.tmpmenu;
        }
        else {
          // console.log('未使用接口');
          return config.menu;
        }

      },
      myRoute() {
        return this.$route.path;
      },
      fullUrl() {
        return this.$route.fullPath;
      },
      etype() {
        return this.$store.state.etype;
      },
      nowequid() {
        return this.$store.state.equid.toString();
      },
      nowequname() {
        return this.$store.state.equName.toString();
      },
      showDiesel() {
        return ([6,10, 11].indexOf(this.etype) === -1 || this.nodeType != 1);
      },
      showReciprocat() {
        return ([6, 11].indexOf(this.etype) === -1 || this.nodeType != 1);
        // return this.etype !== 6;  //wangfu
      },
      showManual() {
        return ([7, 11].indexOf(this.etype) === -1 || this.nodeType != 1);
        // return this.etype !== 7;   //机泵
      },
      showGas() {
        // return this.etype !== 2; //燃气轮机
        // return false;
        return ([2, 11].indexOf(this.etype) === -1 || this.nodeType != 1);
      },
      showEscalator() {
        // return this.etype !== 7;   //扶梯
        return ([7, 11].indexOf(this.etype) === -1);
      },
      showHeatingFurnace() {
        return ([8, 9, 11].indexOf(this.etype) == -1); //加热炉
      },
      showRotating() {
        return ([0, 1, 3, 4, 11].indexOf(this.etype) === -1 || this.nodeType != 1);  //旋转
      },
      showWireless() {
        // return this.etype !== 7;   //无线机泵
        return ([1007, 11].indexOf(this.etype) === -1 || this.nodeType != 2);
      },
      showOffline() {
        // 离线
        return (this.nodeType != 0);
      },
      activeIndex() {
        //alert(this.$route.path.replace('/', ''));
        // console.log(this.$route.path);
        return this.$route.path;
      },
      topiccolor() {
        return this.$store.state.topiccolor;
      },
      language(){
        return this.$store.state.language
      },
      upsHeight(){
        return window.innerHeight/2 - 80 + 'px'
      }
    },
    watch: {
      topiccolor(val) {
        this.$refs.ui.style.setProperty('--bgcolor', this.$store.state.bgcolor);
        this.$refs.ui.style.setProperty('--conbgcolor', this.$store.state.conbgcolor);
        this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
        this.$refs.ui.style.setProperty('--buttoncolor', this.$store.state.buttoncolor);
        this.$refs.ui.style.setProperty('--treeinputbgcolor', this.$store.state.treeinputbgcolor);
        this.$refs.ui.style.setProperty('--labelcolor', this.$store.state.labelcolor);
        this.$refs.ui.style.setProperty('--scrollbarbgcolor', this.$store.state.scrollbarbgcolor);
        this.$refs.ui.style.setProperty('--scrollbarthumbbgcolor', this.$store.state.scrollbarthumbbgcolor);
        this.$refs.ui.style.setProperty('--activetextcolor', this.$store.state.activetextcolor);
      },
      myRoute(val) {
        if (val.indexOf('StatisticOfAlarm') != -1) {
          console.log('报警统计', val);
          this.myWidth = '0px';
          console.log(this.myWidth);
          // that.changeflag();
        } else {
          this.myWidth = '230px';
        }
        // console.log(val);
      },
      fullUrl() {          // url改变
        console.log(this.fullUrl);
        this.closePromptBox();

      },
    },
    methods:{
      saveUrlParams(){
        //若url中存在下方变量，则更新
        this.$store.state.equid = this.$route.query.equipmentUuid ? this.$route.query.equipmentUuid : this.$store.state.equid
        //保存到sessionStorage，页面刷新在sessionStorage获取
        if(this.$route.query.uid) {
          this.$store.state.uid = decodeURIComponent(this.$route.query.uid)
          sessionStorage.setItem('uid', this.$store.state.uid)
        } else{
          this.$store.state.uid = sessionStorage.getItem('uid') ? sessionStorage.getItem('uid') : this.$store.state.uid
        }
        if(this.$route.query.username) {
          this.$store.state.username = decodeURIComponent(this.$route.query.username)
          sessionStorage.setItem('username', this.$store.state.username)
        } else{
          this.$store.state.username = sessionStorage.getItem('username') ? sessionStorage.getItem('username') : null
        }
        if(this.$route.query.pointId) {
          this.$store.state.pointId = decodeURIComponent(this.$route.query.pointId)
          sessionStorage.setItem('pointId', this.$store.state.pointId)
        } else{
          this.$store.state.pointId = sessionStorage.getItem('pointId') ? sessionStorage.getItem('pointId') : ''
        }
        this.$store.state.globalPointId = this.$store.state.pointId
        this.$store.state.alarmStartTime = this.$route.query.alarmStartTime ? decodeURIComponent(this.$route.query.alarmStartTime) : this.$store.state.alarmStartTime
        this.$store.state.alarmEndTime = this.$route.query.alarmEndTime ? decodeURIComponent(this.$route.query.alarmEndTime) :    this.$store.state.alarmEndTime
        //主题初始化
        this.$store.state.topiccolor = this.$route.query.topic ? this.$route.query.topic : config.topic
        this.changeTopic(this.$store.state.topiccolor);
        //语言初始化
        this.$store.state.language = this.$route.query.language ? this.$route.query.language : config.language
        if(this.language == 'zh') {
          this.translateLan('zh')
        } else if(this.language == 'en') {
          this.translateLan('en')
        }
      },
      setnowname(newname) {
        //     this.$refs.unitnfo.setequname(newname);
      },
      changeTopic(topic) { // 改变主题颜色
        if(topic == 'white' || topic =='simple-white') {
          this.$store.state.backgroundcolor = '#fdfdfd';
          this.$store.state.bgcolor = '#fdfdfd';
          this.$store.state.textcolor = '#000000';
          this.$store.state.activetextcolor = '#1677FF';
          this.$store.state.buttoncolor = '#1677FF';
          this.$store.state.buttontextcolor = '#ffffff';
          this.$store.state.conbgcolor = '#F1F6FE';
          this.$store.state.leftconbgcolor = '#fdfdfd'
          this.$store.state.elbgcolor = '#fdfdfd';
          this.$store.state.topiccolor = 'white';
          this.$store.state.inputbgcolor = '#fdfdfd';
          this.$store.state.pointcolor = '#FAFAFA';
          this.$store.state.eltreecolor = '#FAFAFA';
          this.$store.state.eltreebordercolor = '#C1C1C1';
          this.$store.state.checkedcolor = '#1677FF'
          this.$store.state.selectbordercolor = '#000000CC'

          this.$store.state.treeinputbgcolor = 'white';
          this.$store.state.toolboxcolor = '#7A7AA4';
          this.$store.state.labelcolor = '#696B6F';
          this.$store.state.linecolor = 'rgba(0, 0, 0, 0.3)';
          this.$store.state.threedcolor = '#add8e6';
          this.$store.state.markcolor = '#FF0B00';
          this.$store.state.markbordercolor = '#ffffff';
          this.$store.state.toolboxtextcolor = '#1890FF';
          this.$store.state.tablecolor = '#ffffff';
          this.$store.state.scrollbarbgcolor = 'rgba(193,193,193,0.2)';
          this.$store.state.scrollbarthumbbgcolor = 'rgba(193,193,193,1)';
          this.$store.state.colorMap = [
            "#0000FF",
            "#608E85",
            "#7D7247",
            "#FF00FF",
            "#006000",
            "#E91E63",
            "#B03A2E",
            "#FFAB91",
            "#423F36",
            "#0097A7",
            "#8E24AA",
            "#4C144F",
            "#111011",
            "#C5E1A5",
            "#EB984E",
            "#206C8D",
            "#E6EE9C",
            "#359186",
            "#FFE082",
            "#FF99FF",
            "#232835",
            "#703838",
            "#BCAAA4",
            "#FFCC80",
          ];
          return
          //旧版
          this.$store.state.backgroundcolor = 'white';
          this.$store.state.textcolor = '#666666';
          this.$store.state.activetextcolor = '#1890FF';
          this.$store.state.bgcolor = 'white';
          this.$store.state.conbgcolor = '#F1F4FB';
          this.$store.state.leftconbgcolor = 'white';
          this.$store.state.elbgcolor = 'gray';
          this.$store.state.pointcolor = 'white';
          this.$store.state.topiccolor = 'white';
          this.$store.state.inputbgcolor = 'white';
          this.$store.state.buttoncolor = '#A0A2D5';
          this.$store.state.eltreecolor = '#FAFAFA';
          this.$store.state.treeinputbgcolor = 'white';
          this.$store.state.toolboxcolor = '#7A7AA4';
          this.$store.state.labelcolor = '#696B6F';
          this.$store.state.linecolor = 'rgba(0, 0, 0, 0.3)';
          this.$store.state.threedcolor = '#add8e6';
          this.$store.state.markcolor = '#FF0B00';
          this.$store.state.markbordercolor = '#ffffff';
          this.$store.state.toolboxtextcolor = '#1890FF';
          this.$store.state.tablecolor = '#ffffff';
          this.$store.state.scrollbarbgcolor = 'white';
          this.$store.state.scrollbarthumbbgcolor = '#c1c1c1';
          this.$store.state.colorMap = [
            "#0000FF",
            "#608E85",
            "#7D7247",
            "#FF00FF",
            "#006000",
            "#E91E63",
            "#B03A2E",
            "#FFAB91",
            "#423F36",
            "#0097A7",
            "#8E24AA",
            "#4C144F",
            "#111011",
            "#C5E1A5",
            "#EB984E",
            "#206C8D",
            "#E6EE9C",
            "#359186",
            "#FFE082",
            "#FF99FF",
            "#232835",
            "#703838",
            "#BCAAA4",
            "#FFCC80",
          ];
        }
        else if(topic == 'quiet-blue') {
          this.$store.state.backgroundcolor = '#011e5a';
          this.$store.state.bgcolor = '#011e5a';
          this.$store.state.textcolor = '#ffffff';
          this.$store.state.activetextcolor = '#0FDDDD';
          this.$store.state.buttoncolor = '#0FDDDD';
          this.$store.state.buttontextcolor = '#ffffff';
          this.$store.state.conbgcolor = '#040440';
          this.$store.state.leftconbgcolor = '#011e5a'
          this.$store.state.elbgcolor = '#011e5a';
          this.$store.state.topiccolor = 'quiet-blue';
          this.$store.state.inputbgcolor = '#011e5a';
          this.$store.state.pointcolor = '#021c54';
          this.$store.state.eltreecolor = '#021c54';
          this.$store.state.eltreebordercolor = 'rgba(0, 0, 0, 0.85)'
          this.$store.state.checkedcolor = '#0FDDDD'
          this.$store.state.selectbordercolor = '#FFFFFFCC'

          this.$store.state.treeinputbgcolor = '#ffffff';
          this.$store.state.toolboxcolor = '#ffffff';
          this.$store.state.labelcolor = '#696B6F';
          this.$store.state.linecolor = 'rgba(255, 255, 255, 0.3)';
          this.$store.state.threedcolor = '#007878';
          this.$store.state.markcolor = '#ffffff';
          this.$store.state.markbordercolor = '#FF0B00';
          this.$store.state.toolboxtextcolor = '#439cff';
          this.$store.state.tablecolor = '#091A42';
          this.$store.state.scrollbarbgcolor = 'rgba(193,193,193,0.2)';
          this.$store.state.scrollbarthumbbgcolor = 'rgba(193,193,193,1)';
          this.$store.state.colorMap = [
            "#00FF00",
            "#CC99FF",
            "#FF9900",
            "#FFCC00",
            "#FFCCCC",
            "#CCCC66",
            "#FFCC99",
            "#FF99FF",
            "#FF00FF",
            "#006000",
            "#703838",
            "#C5E1A5",
            "#E6EE9C",
            "#FFF59D",
            "#FFE082",
            "#FFCC80",
            "#FFAB91",
            "#BCAAA4",
            "#EEEEEE",
            "#B0BEC5",
            "#689F38",
            "#0097A7",
            "#8E24AA",
            "#E91E63"
          ];
          return
          //旧版
          this.$store.state.backgroundcolor = '#2c3242';
          this.$store.state.textcolor = 'white';
          this.$store.state.activetextcolor = '#359186';
          this.$store.state.bgcolor = '#2c3242';
          this.$store.state.conbgcolor = '#232835';
          this.$store.state.leftconbgcolor = '#303749';
          this.$store.state.elbgcolor = '#303749';
          this.$store.state.pointcolor = '#3C455B';
          this.$store.state.topiccolor = 'blue';
          this.$store.state.inputbgcolor = '#303749';
          this.$store.state.buttoncolor = '#359186';
          this.$store.state.eltreecolor = '#3C455B';
          this.$store.state.treeinputbgcolor = '#ffffff';
          this.$store.state.toolboxcolor = '#ffffff';
          this.$store.state.labelcolor = '#696B6F';
          this.$store.state.linecolor = 'rgba(255, 255, 255, 0.3)';
          this.$store.state.threedcolor = '#007878';
          this.$store.state.markcolor = '#ffffff';
          this.$store.state.markbordercolor = '#FF0B00';
          this.$store.state.toolboxtextcolor = '#D1EADF';
          this.$store.state.tablecolor = '#091A42';
          this.$store.state.scrollbarbgcolor = '#061d74';
          this.$store.state.scrollbarthumbbgcolor = '#646563';
          this.$store.state.checkedcolor = '#1677FF'
          this.$store.state.colorMap = [
            "#00FF00",
            "#CC99FF",
            "#FF9900",
            "#FFCC00",
            "#FFCCCC",
            "#CCCC66",
            "#FFCC99",
            "#FF99FF",
            "#FF00FF",
            "#006000",
            "#703838",
            "#C5E1A5",
            "#E6EE9C",
            "#FFF59D",
            "#FFE082",
            "#FFCC80",
            "#FFAB91",
            "#BCAAA4",
            "#EEEEEE",
            "#B0BEC5",
            "#689F38",
            "#0097A7",
            "#8E24AA",
            "#E91E63"
          ];
        }
        else if(topic == 'gray') {
          this.$store.state.backgroundcolor = '#403D4E';
          this.$store.state.textcolor = 'white';
          this.$store.state.activetextcolor = '#439cff';
          this.$store.state.bgcolor = '#403D4E';
          this.$store.state.conbgcolor = '#2B2935';
          this.$store.state.leftconbgcolor = '#403D4E';
          this.$store.state.elbgcolor = 'gray';
          this.$store.state.pointcolor = '#403D4E';
          this.$store.state.topiccolor = 'gray';
          this.$store.state.inputbgcolor = '#2B2935';
          this.$store.state.buttoncolor = '#FFFFFF';
          this.$store.state.eltreecolor = '#2B2935';
          this.$store.state.treeinputbgcolor = '#05050D';
          this.$store.state.toolboxcolor = '#ffffff';
          this.$store.state.labelcolor = '#ffffff';
          this.$store.state.linecolor = 'rgba(255, 255, 255, 0.3)';
          this.$store.state.threedcolor = '#007878';
          this.$store.state.markcolor = '#ffffff';
          this.$store.state.markbordercolor = '#FF0B00';
          this.$store.state.toolboxtextcolor = '#439cff';
          this.$store.state.tablecolor = '#091A42';
          this.$store.state.scrollbarbgcolor = '#061d74';
          this.$store.state.scrollbarthumbbgcolor = '#646563';
          this.$store.state.colorMap = [
            "#00FF00",
            "#CC99FF",
            "#FF9900",
            "#FFCC00",
            "#FFCCCC",
            "#CCCC66",
            "#FFCC99",
            "#FF99FF",
            "#FF00FF",
            "#006000",
            "#703838",
            "#C5E1A5",
            "#E6EE9C",
            "#FFF59D",
            "#FFE082",
            "#FFCC80",
            "#FFAB91",
            "#BCAAA4",
            "#EEEEEE",
            "#B0BEC5",
            "#689F38",
            "#0097A7",
            "#8E24AA",
            "#E91E63"
          ];
        }
        else if(topic == 'high-ash') {
          this.$store.state.backgroundcolor = '#222331';
          this.$store.state.bgcolor = '#222331';
          this.$store.state.textcolor = 'white';
          this.$store.state.activetextcolor = '#1677FF';
          this.$store.state.buttoncolor = '#1677FF';
          this.$store.state.buttontextcolor = '#ffffff';
          this.$store.state.conbgcolor = '#0D0F1F';
          this.$store.state.leftconbgcolor = '#222331'
          this.$store.state.elbgcolor = '#222331';
          this.$store.state.topiccolor = 'high-ash';
          this.$store.state.inputbgcolor = '#222331';
          this.$store.state.pointcolor = '#1D1E2C';
          this.$store.state.eltreecolor = '#1D1E2C';
          this.$store.state.eltreebordercolor = '#000';
          this.$store.state.checkedcolor = '#1677FF'
          this.$store.state.selectbordercolor = '#FFFFFFCC'

          this.$store.state.treeinputbgcolor = '#ffffff';
          this.$store.state.toolboxcolor = '#ffffff';
          this.$store.state.labelcolor = '#696B6F';
          this.$store.state.linecolor = 'rgba(255, 255, 255, 0.3)';
          this.$store.state.threedcolor = '#007878';
          this.$store.state.markcolor = '#ffffff';
          this.$store.state.markbordercolor = '#FF0B00';
          this.$store.state.toolboxtextcolor = '#D1EADF';
          this.$store.state.tablecolor = '#091A42';
          this.$store.state.scrollbarbgcolor = 'rgba(193,193,193,0.2)';
          this.$store.state.scrollbarthumbbgcolor = 'rgba(193,193,193,1)';
          this.$store.state.colorMap = [
            "#00FF00",
            "#CC99FF",
            "#FF9900",
            "#FFCC00",
            "#FFCCCC",
            "#CCCC66",
            "#FFCC99",
            "#FF99FF",
            "#FF00FF",
            "#006000",
            "#703838",
            "#C5E1A5",
            "#E6EE9C",
            "#FFF59D",
            "#FFE082",
            "#FFCC80",
            "#FFAB91",
            "#BCAAA4",
            "#EEEEEE",
            "#B0BEC5",
            "#689F38",
            "#0097A7",
            "#8E24AA",
            "#E91E63"
          ];
          return
          this.$store.state.backgroundcolor = '#1E2128';
          this.$store.state.textcolor = 'white';
          this.$store.state.activetextcolor = '#439cff';
          this.$store.state.bgcolor = '#1E2128';
          this.$store.state.conbgcolor = '#191A1F';
          this.$store.state.leftconbgcolor = '#1E2128';
          this.$store.state.elbgcolor = 'gray';
          this.$store.state.pointcolor = '#1E2128';
          this.$store.state.topiccolor = 'high-ash';
          this.$store.state.inputbgcolor = '#05050D';
          this.$store.state.buttoncolor = '#FFFFFF';
          this.$store.state.eltreecolor = '#191A1F';
          this.$store.state.treeinputbgcolor = '#05050D';
          this.$store.state.toolboxcolor = '#ffffff';
          this.$store.state.labelcolor = '#ffffff';
          this.$store.state.linecolor = 'rgba(255, 255, 255, 0.3)';
          this.$store.state.colorMap = [
            "#00FF00",
            "#CC99FF",
            "#FF9900",
            "#FFCC00",
            "#FFCCCC",
            "#CCCC66",
            "#FFCC99",
            "#FF99FF",
            "#FF00FF",
            "#006000",
            "#703838",
            "#C5E1A5",
            "#E6EE9C",
            "#FFF59D",
            "#FFE082",
            "#FFCC80",
            "#FFAB91",
            "#BCAAA4",
            "#EEEEEE",
            "#B0BEC5",
            "#689F38",
            "#0097A7",
            "#8E24AA",
            "#E91E63"
          ];
        }
        else if(topic == 'blue'){
          this.$store.state.backgroundcolor = '#2c3242';
          this.$store.state.textcolor = 'white';
          this.$store.state.activetextcolor = '#359186';
          this.$store.state.bgcolor = '#2c3242';
          this.$store.state.conbgcolor = '#232835';
          this.$store.state.leftconbgcolor = '#303749';
          this.$store.state.elbgcolor = '#303749';
          this.$store.state.pointcolor = '#3C455B';
          this.$store.state.topiccolor = 'blue';
          this.$store.state.inputbgcolor = '#303749';
          this.$store.state.buttoncolor = '#359186';
          this.$store.state.eltreecolor = '#3C455B';

          this.$store.state.treeinputbgcolor = '#ffffff';
          this.$store.state.toolboxcolor = '#ffffff';
          this.$store.state.labelcolor = '#696B6F';
          this.$store.state.linecolor = 'rgba(255, 255, 255, 0.3)';
          this.$store.state.threedcolor = '#007878';
          this.$store.state.markcolor = '#ffffff';
          this.$store.state.markbordercolor = '#FF0B00';
          this.$store.state.toolboxtextcolor = '#D1EADF';
          this.$store.state.tablecolor = '#091A42';
          this.$store.state.scrollbarbgcolor = '#061d74';
          this.$store.state.scrollbarthumbbgcolor = '#646563';
          this.$store.state.checkedcolor = '#1677FF'
          this.$store.state.colorMap = [
            "#00FF00",
            "#CC99FF",
            "#FF9900",
            "#FFCC00",
            "#FFCCCC",
            "#CCCC66",
            "#FFCC99",
            "#FF99FF",
            "#FF00FF",
            "#006000",
            "#703838",
            "#C5E1A5",
            "#E6EE9C",
            "#FFF59D",
            "#FFE082",
            "#FFCC80",
            "#FFAB91",
            "#BCAAA4",
            "#EEEEEE",
            "#B0BEC5",
            "#689F38",
            "#0097A7",
            "#8E24AA",
            "#E91E63"
          ];

          this.$store.state.buttontextcolor = '#ffffff';
          this.$store.state.eltreebordercolor = 'rgba(0, 0, 0, 0.85)'
          this.$store.state.checkedcolor = '#0FDDDD'
          this.$store.state.selectbordercolor = '#FFFFFFCC'
        }
        else if(topic == 'ash') {
          this.$store.state.backgroundcolor = '#403D4E';
          this.$store.state.textcolor = 'white';
          this.$store.state.activetextcolor = '#439cff';
          this.$store.state.bgcolor = '#403D4E';
          this.$store.state.conbgcolor = '#2B2935';
          this.$store.state.leftconbgcolor = '#403D4E';
          this.$store.state.elbgcolor = 'gray';
          this.$store.state.pointcolor = '#403D4E';
          this.$store.state.topiccolor = 'ash';
          this.$store.state.inputbgcolor = '#2B2935';
          this.$store.state.buttoncolor = '#1677FF';
          this.$store.state.eltreecolor = '#2B2935';
          this.$store.state.treeinputbgcolor = '#05050D';
          this.$store.state.toolboxcolor = '#ffffff';
          this.$store.state.labelcolor = '#ffffff';
          this.$store.state.linecolor = 'rgba(255, 255, 255, 0.3)';
          this.$store.state.threedcolor = '#007878';
          this.$store.state.markcolor = '#ffffff';
          this.$store.state.markbordercolor = '#FF0B00';
          this.$store.state.toolboxtextcolor = '#439cff';
          this.$store.state.tablecolor = '#091A42';
          this.$store.state.scrollbarbgcolor = '#061d74';
          this.$store.state.scrollbarthumbbgcolor = '#646563';
          this.$store.state.colorMap = [
            "#00FF00",
            "#CC99FF",
            "#FF9900",
            "#FFCC00",
            "#FFCCCC",
            "#CCCC66",
            "#FFCC99",
            "#FF99FF",
            "#FF00FF",
            "#006000",
            "#703838",
            "#C5E1A5",
            "#E6EE9C",
            "#FFF59D",
            "#FFE082",
            "#FFCC80",
            "#FFAB91",
            "#BCAAA4",
            "#EEEEEE",
            "#B0BEC5",
            "#689F38",
            "#0097A7",
            "#8E24AA",
            "#E91E63"
          ];

          this.$store.state.buttontextcolor = '#ffffff';
          this.$store.state.eltreebordercolor = '#000';
          this.$store.state.checkedcolor = '#1677FF'
          this.$store.state.selectbordercolor = '#FFFFFFCC'
        }
      },
      closePromptBox() {
        // console.log('关闭弹窗');
        this.$refs.load.style.display = 'none';
        this.$refs.fail.style.display = 'none';
      },
      datafail() {
        console.log("数据获取失败");
        var that = this;
        this.$refs.load.style.display = 'none';
        this.$refs.fail.innerHTML = '<div class="failtext"><i class="el-icon-warning"></i>' + this.translateText('menu.textMap.', '数据获取失败') + '</div>';
        this.$refs.fail.style.display = 'block';
        setTimeout(function () {
          that.$refs.fail.style.display = 'none';
        },3000);
        //  this.$refs.unitnfo.datafail();
      },
      tmpDataNull() {
      },
      notEvent() {
        if (this.$route.path !== '/RotatingMachineryGraph/StartStopGraph') {
          return
        }
        var that = this;
        this.$refs.load.style.display = 'none';
        this.$refs.fail.innerHTML = '<div class="failtext"><i class="el-icon-warning"></i>' + this.translateText('menu.textMap.', '请选择事件') + '</div>';
        this.$refs.fail.style.display = 'block';
        setTimeout(function () {
          that.$refs.fail.style.display = 'none';
        },3000);
      },
      datanull() {
        console.log("无数据");
        var that = this;
        this.$refs.load.style.display = 'none';
        this.$refs.fail.innerHTML = '<div class="failtext"><i class="el-icon-warning"></i>' + this.translateText('menu.textMap.', '无数据') + '</div>';
        this.$refs.fail.style.display = 'block';
        setTimeout(function () {
          that.$refs.fail.style.display = 'none';
        },3000);
      },
      hideloading() {
        this.$refs.load.style.display = 'none';
      },
      dataloading() {
        console.log("数据加载中");
        let that = this;
        this.$refs.load.style.display = 'block';
        this.$refs.load.innerHTML = '<div class="loadingtext"><i class="el-icon-loading"></i>' + this.translateText('menu.textMap.', '数据加载中') + '</div>';
        setTimeout(function () {
          that.$refs.load.style.display = 'none';
        },3000);
      },
      datasuccess() {
        console.log("数据获取成功");
        this.$refs.load.style.display = 'none';
        //this.$refs.unitnfo.datasuccess()
      },
      pointNull() {
      },
      intervalError() {
        var that = this;
        console.log('参数区间错误');
        this.$refs.load.style.display = 'none';
        this.$refs.fail.innerHTML = '<div class="failtext"><i class="el-icon-warning"></i>参数区间错误</div>';
        this.$refs.fail.style.display = 'block';
        setTimeout(function () {
          that.$refs.fail.style.display = 'none';
        },3000);
      },
      notExitPoint() {
        var that = this;
        console.log('没有该测点');
        this.$refs.load.style.display = 'none';
        this.$refs.fail.innerHTML = '<div class="failtext"><i class="el-icon-warning"></i>没有该测点</div>';
        this.$refs.fail.style.display = 'block';
        setTimeout(function () {
          that.$refs.fail.style.display = 'none';
        },3000);
      },
      changeunitname(name) {
        //  this.$refs.unitnfo.changename(name);
      },
      ChangEquId() {
        this.equid = this.$store.state.equid;
      },
      handleClick(event) {
        document.querySelectorAll('input.graph-input').forEach((input) => {
          input.blur();
        })
        if (this.$refs.plant.showDropdownFlag){
          this.$refs.plant.showDropdownFlag = false
        }

        if (this.isOpened != true) {
          this.$refs.topMenu.close(this.nowOpenedIndex.toString());
          this.$refs.topMenu1.close(this.nowOpenedIndex.toString());
          this.$refs.topMenu2.close(this.nowOpenedIndex.toString());
        }
        this.isOpened = false;

      },
      handleOpen(index) {
        this.nowOpenedIndex = index;
        this.isOpened = true;
      },
      // 切换语言
      translateLan(index) {
        this.$store.state.language = index;
        this.$router.push({query: {equipmentUuid: this.nowequid, topic: this.$store.state.topiccolor, language: this.$store.state.language}})
        this.$i18n.locale = index;
        if(index === 'en')
          locale.use(en)
        else if(index === 'zh')
          locale.use(zh)
      },
      updateRouter(){
        console.log("进入updateRouter")
        console.log("nodeType"+this.$store.state.nodeType)
        this.$nextTick(() => {
          if(this.$store.state.nodeType == 1){
            if (this.$store.state.etype === 6) {
              //2025.2.13 后续没问题可以删掉path
              if(this.$store.state.path != ''){
                this.handleSelect(this.$store.state.path);
              } else if(this.menu.ReciprocatMachineryGraph.data['4-1'] == false){
                this.handleSelect("ReciprocatMachineryGraph/ReciprocatVibrationMonitor");
              }else{
                if (this.$route.path.slice(1).indexOf('ReciprocatMachineryGraph') != -1) {
                  this.handleSelect(this.$route.path.slice(1));
                } else {
                  this.handleSelect("ReciprocatMachineryGraph/OverviewGraph1");
                }
              }
            }
            else if (this.$store.state.etype === 7) {
              if(this.$store.state.path != ''){
                this.handleSelect(this.$store.state.path);
              }else{
                if (this.$route.path.slice(1).indexOf('/') != -1){
                  if (!config.menu.SpecialManualOfPump.show && config.menu.EscalatorGraph.show) {
                    this.handleSelect("EscalatorAlarmQueryGraph")
                  } else {
                    if (!config.menu.SpecialManualOfPump.data['1']) {
                      this.handleSelect('TrendAnalysis');
                    } else {
                      this.handleSelect("UnitOverviewMap");
                    }
                  }
                } else {
                  this.handleSelect(this.$route.path.slice(1));
                }
              }
            }
            else if (this.$store.state.etype === 10) {
              if(this.menu.DieselMonitorSystem.data['5-1']==false){
                this.handleSelect("DieselMonitorSystem/VibrationMonitorGraph");
              }else{
                if (this.$route.path.slice(1).indexOf('DieselMonitorSystem') != -1) {
                  this.handleSelect(this.$route.path.slice(1));
                } else {
                  this.handleSelect("DieselMonitorSystem/OverviewGraph");
                }
              }


            }
            else if ([0, 1, 3, 4].indexOf(this.$store.state.etype) !== -1) {
              if(this.$store.state.path != ''){
                this.handleSelect(this.$store.state.path);
              }
              else if(this.menu.RotatingMachineryGraph.data['6-15']==false){
                this.handleSelect("RotatingMachineryGraph/RotatingVibrationMonitor");
              }
              else{
                if (this.$route.path.slice(1).indexOf('RotatingMachineryGraph') != -1) {
                  this.handleSelect(this.$route.path.slice(1));
                } else {
                  if (!config.menu.RotatingMachineryGraph.data['6-15']) {
                    this.handleSelect('RotatingMachineryGraph/RotatingVibrationMonitor')
                  } else {
                    this.handleSelect("RotatingMachineryGraph/RotatingOverviewGrap");
                  }
                }
              }

            }
            else if(this.$store.state.etype == 2) {
              if(this.menu.gasTurbineGraph.data['6-15']==false){
                this.handleSelect("gasTurbineGraph/RotatingVibrationMonitor");
              }
              else{
                if (this.$route.path.slice(1).indexOf('gasTurbineGraph') != -1) {
                  this.handleSelect(this.$route.path.slice(1));
                } else {
                  this.handleSelect("gasTurbineGraph/RotatingOverviewGrap");
                }
              }
            }
            else if ([8, 9].indexOf(this.$store.state.etype) != -1) {
              if (this.$route.path.slice(1).indexOf('HeatingFurnaceGraph') != -1) {
                this.handleSelect(this.$route.path.slice(1));
              } else {
                this.handleSelect("HeatingFurnaceGraph/HeatingFurnaceUnitOverviewMap");
              }
            }
          }
          else if(this.$store.state.nodeType == 2){
            if(this.$store.state.path != ''){
              this.handleSelect(this.$store.state.path);
            } else if (this.$route.path.slice(1).indexOf('WirelessPumpGraph') != -1){
              this.handleSelect(this.$route.path.slice(1));
            }else{
              this.handleSelect("WirelessPumpGraph/WirelessPumpUnitOverviewMap");
            }
          }else{
            if (this.$route.path.slice(1).indexOf('Offline') != -1) {
              this.handleSelect(this.$route.path.slice(1));
            } else {
              this.handleSelect("Offline/OLUnitOverviewMap");
            }
          }
        })
      },
      handleSelect(index, filePath) {
        index = filePath ? index.replace('/', '') : index
        console.log("我是index"+index)
        this.$router.push({query: {equipmentUuid: this.nowequid, topic: this.$store.state.topiccolor, language: this.$store.state.language}})
        //报警统计
        if (index === 'StatisticOfAlarm') {
          this.nowpos = '/StatisticOfAlarm';
          this.$router.push({path: "/StatisticOfAlarm", query: this.$route.query});
        }
        //另一个报警统计
        if (index === 'AnotherStatisticOfAlarm') {
          this.nowpos = '/AnotherStatisticOfAlarm';
          this.$router.push({path: "/AnotherStatisticOfAlarm", query: this.$route.query});
        }
        //加热炉
        if (index == 'HeatingFurnaceGraph/HeatingFurnaceOtherParametersTrendGraph') {
          this.nowpos = '/HeatingFurnaceGraph/HeatingFurnaceOtherParametersTrendGraph';
          this.$router.push({path: "/HeatingFurnaceGraph/HeatingFurnaceOtherParametersTrendGraph", query: this.$route.query});
        }
        if (index == 'HeatingFurnaceGraph/HeatingFurnaceUnitOverviewMap') {
          this.nowpos = '/HeatingFurnaceGraph/HeatingFurnaceUnitOverviewMap';
          this.$router.push({path: "/HeatingFurnaceGraph/HeatingFurnaceUnitOverviewMap", query: this.$route.query});
        }
        //扶梯
        if (index === 'EscalatorAlarmQueryGraph') {
          this.nowpos = '/EscalatorAlarmQueryGraph';
          this.$router.push({path: "/EscalatorAlarmQueryGraph", query: this.$route.query});
        }
        if (index === 'EscalatorTrendAnalysis') {
          this.nowpos = '/EscalatorTrendAnalysis';
          this.$router.push({path: "/EscalatorTrendAnalysis", query: this.$route.query});
        }
        if (index === 'EscalatorPumpImpactDiagnosis') {
          this.nowpos = '/EscalatorPumpImpactDiagnosis';
          this.$router.push({path: "/EscalatorPumpImpactDiagnosis", query: this.$route.query});
        }
        if (index === 'EscalatorRotorFaultDiagnosis') {
          this.nowpos = '/EscalatorRotorFaultDiagnosis';
          this.$router.push({path: "/EscalatorRotorFaultDiagnosis", query: this.$route.query});
        }
        if (index === 'EscalatorSingleMultiBarValueChart') {
          this.nowpos = '/EscalatorSingleMultiBarValueChart';
          this.$router.push({path: "/EscalatorSingleMultiBarValueChart", query: this.$route.query});
        }
        if (index === 'EscalatorOtherParametersTrendGraph') {
          this.nowpos = '/EscalatorOtherParametersTrendGraph';
          this.$router.push({path: "/EscalatorOtherParametersTrendGraph", query: this.$route.query});
        }
        if (index === 'EscalatorCepstrumGraph') {
          this.nowpos = '/EscalatorCepstrumGraph';
          this.$router.push({path: "/EscalatorCepstrumGraph", query: this.$route.query});
        }
        //机泵
        if (index === 'UnitOverviewMap') {
          this.nowpos = '/UnitOverviewMap';
          this.$router.push({path: "/UnitOverviewMap", query: this.$route.query});
        }
        if (index === 'AlarmQueryGraph') {
          this.nowpos = '/AlarmQueryGraph';
          this.$router.push({path: "/AlarmQueryGraph", query: this.$route.query});
        }
        if (index === 'AnalysisGraph') {
          this.nowpos = '/AnalysisGraph';
          this.$router.push({path: "/AnalysisGraph", query: this.$route.query});
        }
        if (index === 'TrendAnalysis') {
          this.nowpos = '/TrendAnalysis';
          this.$router.push({path: "/TrendAnalysis", query: this.$route.query});
        }
        if (index === 'PumpImpactDiagnosis') {
          this.nowpos = '/PumpImpactDiagnosis';
          this.$router.push({path: "/PumpImpactDiagnosis", query: this.$route.query});
        }

        if (index === 'VibrationMonitor') {
          this.nowpos = '/VibrationMonitor';
          this.$router.push({path: "/VibrationMonitor", query: this.$route.query});
        }
        if (index === 'RotorFaultDiagnosis') {
          this.nowpos = '/RotorFaultDiagnosis';
          this.$router.push({path: "/RotorFaultDiagnosis", query: this.$route.query});
        }
        if (index === 'ChangeVisualization') {
          this.nowpos = '/ChangeVisualization';
          this.$router.push({path: "/ChangeVisualization", query: this.$route.query});
        }
        if (index === 'SingleMultiBarValueChart') {
          this.nowpos = '/SingleMultiBarValueChart';
          this.$router.push({path: "/SingleMultiBarValueChart", query: this.$route.query});
        }
        if (index === 'ComprehensiveAnalysis') {
          this.nowpos = '/ComprehensiveAnalysis';
          this.$router.push({path: "/ComprehensiveAnalysis", query: this.$route.query});
        }
        if (index === 'MultiParametersTrendGraph') {
          this.nowpos = '/MultiParametersTrendGraph';
          this.$router.push({path: "/MultiParametersTrendGraph", query: this.$route.query});
        }
        if (index === 'OtherParametersTrendGraph') {
          this.nowpos = '/OtherParametersTrendGraph';
          this.$router.push({path: "/OtherParametersTrendGraph", query: this.$route.query});
        }

        if (index === 'OrbitOfShaftCenter') {
          this.nowpos = '/OrbitOfShaftCenter';
          this.$router.push({path: "/OrbitOfShaftCenter", query: this.$route.query});

        }
        if (index === 'StartstopGraph') {
          this.nowpos = '/StartstopGraph';
          this.$router.push({path: "/StartstopGraph", query: this.$route.query});

        }
        if (index === 'RunSwordGraph') {
          this.nowpos = '/RunSwordGraph';
          this.$router.push({path: "/RunSwordGraph", query: this.$route.query});
        }
        if (index === 'RunStatusGraph') {
          this.nowpos = '/RunStatusGraph';
          this.$router.push({path: "/RunStatusGraph", query: this.$route.query});
        }
        if (index === 'CepstrumGraph') {
          this.nowpos = '/CepstrumGraph';
          this.$router.push({path: "/CepstrumGraph", query: this.$route.query});
        }

        //以下是旋转图谱
        if (index === 'RotatingMachineryGraph/RotatingVibrationMonitor') {
          this.nowpos = '/RotatingMachineryGraph/RotatingVibrationMonitor';
          this.$router.push({path: "/RotatingMachineryGraph/RotatingVibrationMonitor", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/VibrationHistoricalComparison') {
          this.nowpos = '/RotatingMachineryGraph/VibrationHistoricalComparison';
          this.$router.push({path: "/RotatingMachineryGraph/VibrationHistoricalComparison", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/SingleMultiBarValueChart') {
          this.nowpos = '/RotatingMachineryGraph/SingleMultiBarValueChart';
          this.$router.push({path: "/RotatingMachineryGraph/SingleMultiBarValueChart", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/OrbitOfShaftCenter1') {
          this.nowpos = '/RotatingMachineryGraph/OrbitOfShaftCenter1';
          this.$router.push({path: "/RotatingMachineryGraph/OrbitOfShaftCenter1", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/AxisPosition') {
          this.nowpos = '/RotatingMachineryGraph/AxisPosition';
          this.$router.push({path: "/RotatingMachineryGraph/AxisPosition", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/StartStopGraph') {
          this.nowpos = '/RotatingMachineryGraph/StartStopGraph';
          this.$router.push({path: "/RotatingMachineryGraph/StartStopGraph", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/RotatingComprehensiveAnalysis') {
          this.nowpos = '/RotatingMachineryGraph/RotatingComprehensiveAnalysis';
          this.$router.push({path: "/RotatingMachineryGraph/RotatingComprehensiveAnalysis", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/OtherParametersTrendGraph2') {
          this.nowpos = '/RotatingMachineryGraph/OtherParametersTrendGraph2';
          this.$router.push({path: "/RotatingMachineryGraph/OtherParametersTrendGraph2", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/AlarmQueryGraph2') {
          this.nowpos = '/RotatingMachineryGraph/AlarmQueryGraph2';
          this.$router.push({path: "/RotatingMachineryGraph/AlarmQueryGraph2", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/WholeSpectrumGraph') {
          this.nowpos = '/RotatingMachineryGraph/WholeSpectrumGraph';
          this.$router.push({path: "/RotatingMachineryGraph/WholeSpectrumGraph", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/TwoDimensionalHolography') {
          this.nowpos = '/RotatingMachineryGraph/TwoDimensionalHolography';
          this.$router.push({path: "/RotatingMachineryGraph/TwoDimensionalHolography", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/ThreeDimensionalHolography') {
          this.nowpos = '/RotatingMachineryGraph/ThreeDimensionalHolography';
          this.$router.push({path: "/RotatingMachineryGraph/ThreeDimensionalHolography", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/RotatingOverviewGrap') {
          this.nowpos = '/RotatingMachineryGraph/RotatingOverviewGrap';     //概貌图
          this.$router.push({path: "/RotatingMachineryGraph/RotatingOverviewGrap", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/RotatingRunStatusGraph') {
          this.nowpos = '/RotatingMachineryGraph/RotatingRunStatusGraph';          //运行状态
          this.$router.push({path: "/RotatingMachineryGraph/RotatingRunStatusGraph", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/DynamicBalancing') {
          this.nowpos = '/RotatingMachineryGraph/DynamicBalancing';          //现场动平衡
          this.$router.push({path: "/RotatingMachineryGraph/DynamicBalancing", query: this.$route.query});
        }
        if (index === 'RotatingMachineryGraph/TemperatureiDstributionField') {
          this.nowpos = '/RotatingMachineryGraph/TemperatureiDstributionField';
          this.$router.push({path: "/RotatingMachineryGraph/TemperatureiDstributionField", query: this.$route.query}); //温度分布场
        }
        if (index === 'RotatingMachineryGraph/ParameterComparisonQuery') {
          this.nowpos = '/RotatingMachineryGraph/ParameterComparisonQuery';          //参数比较查询
          this.$router.push({path: "/RotatingMachineryGraph/ParameterComparisonQuery", query: this.$route.query});
        }
        if (index == 'RotatingMachineryGraph/ImpactDiagnosis') { // 冲击诊断
          this.nowpos = '/RotatingMachineryGraph/ImpactDiagnosis';
          this.$router.push({path: "/RotatingMachineryGraph/ImpactDiagnosis", query: this.$route.query});
        }
        if (index == 'RotatingMachineryGraph/RotatingCepstrumGraph') { // 倒谱图
          this.nowpos = '/RotatingMachineryGraph/RotatingCepstrumGraph';
          this.$router.push({path: "/RotatingMachineryGraph/RotatingCepstrumGraph", query: this.$route.query});
        }
        if (index == 'RotatingMachineryGraph/RotatingHistoryTrendGraph') { //历史趋势图
          this.nowpos = '/RotatingMachineryGraph/RotatingHistoryTrendGraph';
          this.$router.push({path: "/RotatingMachineryGraph/RotatingHistoryTrendGraph", query: this.$route.query});
        }

        //以下是燃气轮机
        if (index === 'gasTurbineGraph/RotatingVibrationMonitor') {
          this.nowpos = '/gasTurbineGraph/RotatingVibrationMonitor';
          this.$router.push({path: "/gasTurbineGraph/RotatingVibrationMonitor", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/VibrationHistoricalComparison') {
          this.nowpos = '/gasTurbineGraph/VibrationHistoricalComparison';
          this.$router.push({path: "/gasTurbineGraph/VibrationHistoricalComparison", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/SingleMultiBarValueChart') {
          this.nowpos = '/gasTurbineGraph/SingleMultiBarValueChart';
          this.$router.push({path: "/gasTurbineGraph/SingleMultiBarValueChart", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/OrbitOfShaftCenter1') {
          this.nowpos = '/gasTurbineGraph/OrbitOfShaftCenter1';
          this.$router.push({path: "/gasTurbineGraph/OrbitOfShaftCenter1", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/AxisPosition') {
          this.nowpos = '/gasTurbineGraph/AxisPosition';
          this.$router.push({path: "/gasTurbineGraph/AxisPosition", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/StartStopGraph') {
          this.nowpos = '/gasTurbineGraph/StartStopGraph';
          this.$router.push({path: "/gasTurbineGraph/StartStopGraph", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/RotatingComprehensiveAnalysis') {
          this.nowpos = '/gasTurbineGraph/RotatingComprehensiveAnalysis';
          this.$router.push({path: "/gasTurbineGraph/RotatingComprehensiveAnalysis", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/OtherParametersTrendGraph2') {
          this.nowpos = '/gasTurbineGraph/OtherParametersTrendGraph2';
          this.$router.push({path: "/gasTurbineGraph/OtherParametersTrendGraph2", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/AlarmQueryGraph2') {
          this.nowpos = '/gasTurbineGraph/AlarmQueryGraph2';
          this.$router.push({path: "/gasTurbineGraph/AlarmQueryGraph2", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/WholeSpectrumGraph') {
          this.nowpos = '/gasTurbineGraph/WholeSpectrumGraph';
          this.$router.push({path: "/gasTurbineGraph/WholeSpectrumGraph", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/TwoDimensionalHolography') {
          this.nowpos = '/gasTurbineGraph/TwoDimensionalHolography';
          this.$router.push({path: "/gasTurbineGraph/TwoDimensionalHolography", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/ThreeDimensionalHolography') {
          this.nowpos = '/gasTurbineGraph/ThreeDimensionalHolography';
          this.$router.push({path: "/gasTurbineGraph/ThreeDimensionalHolography", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/RotatingOverviewGrap') {
          this.nowpos = '/gasTurbineGraph/RotatingOverviewGrap';     //概貌图
          this.$router.push({path: "/gasTurbineGraph/RotatingOverviewGrap", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/RotatingRunStatusGraph') {
          this.nowpos = '/gasTurbineGraph/RotatingRunStatusGraph';          //运行状态
          this.$router.push({path: "/gasTurbineGraph/RotatingRunStatusGraph", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/DynamicBalancing') {
          this.nowpos = '/gasTurbineGraph/DynamicBalancing';          //现场动平衡
          this.$router.push({path: "/gasTurbineGraph/DynamicBalancing", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/TemperatureiDstributionField1') {
          this.nowpos = '/gasTurbineGraph/TemperatureiDstributionField1';          //温度分布场
          this.$router.push({path: "/gasTurbineGraph/TemperatureiDstributionField1", query: this.$route.query});
        }
        if (index === 'gasTurbineGraph/ParameterComparisonQuery') {
          this.nowpos = '/gasTurbineGraph/ParameterComparisonQuery';          //参数比较查询
          this.$router.push({path: "/gasTurbineGraph/ParameterComparisonQuery", query: this.$route.query});
        }

        //以下是柴油机和往复机，增加跳转路径请在这个上面加
        //柴油机
        if (index === 'DieselMonitorSystem/OverviewGraph') {
          this.nowpos = '/DieselMonitorSystem/OverviewGraph';
          this.$router.push({path: "/DieselMonitorSystem/OverviewGraph", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/DieselMonitorRunStatus') {
          this.nowpos = '/DieselMonitorSystem/DieselMonitorRunStatus';
          this.$router.push({path: "/DieselMonitorSystem/DieselMonitorRunStatus", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/HistoricalComparisonGraph') {
          this.nowpos = '/DieselMonitorSystem/HistoricalComparisonGraph';
          this.$router.push({path: "/DieselMonitorSystem/HistoricalComparisonGraph", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/SingleValueStickGraph') {
          this.nowpos = '/DieselMonitorSystem/SingleValueStickGraph';
          this.$router.push({path: "/DieselMonitorSystem/SingleValueStickGraph", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/DynamicPressureMonitorGraph') {
          this.nowpos = '/DieselMonitorSystem/DynamicPressureMonitorGraph';
          this.$router.push({path: "/DieselMonitorSystem/DynamicPressureMonitorGraph", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/EventQueryGraph') {
          this.nowpos = '/DieselMonitorSystem/EventQueryGraph';
          this.$router.push({path: "/DieselMonitorSystem/EventQueryGraph", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/VibrationMonitorGraph') {
          this.nowpos = '/DieselMonitorSystem/VibrationMonitorGraph';
          this.$router.push({path: "/DieselMonitorSystem/VibrationMonitorGraph", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/InstantaneousSpeed') {
          this.nowpos = '/DieselMonitorSystem/InstantaneousSpeed';
          this.$router.push({path: "/DieselMonitorSystem/InstantaneousSpeed", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/TorsionalVibration') {
          this.nowpos = '/DieselMonitorSystem/TorsionalVibration';
          this.$router.push({path: "/DieselMonitorSystem/TorsionalVibration", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/MultiparameterAnalysis') {
          this.nowpos = '/DieselMonitorSystem/MultiparameterAnalysis';
          this.$router.push({path: "/DieselMonitorSystem/MultiparameterAnalysis", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/ComprehensiveAnalysisGraph') {
          this.nowpos = '/DieselMonitorSystem/ComprehensiveAnalysisGraph';
          this.$router.push({path: "/DieselMonitorSystem/ComprehensiveAnalysisGraph", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/IndicatorGraph') {
          this.nowpos = '/DieselMonitorSystem/IndicatorGraph';
          this.$router.push({path: "/DieselMonitorSystem/IndicatorGraph", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/ImpactDiagnosis') {
          this.nowpos = '/DieselMonitorSystem/ImpactDiagnosis';
          this.$router.push({path: "/DieselMonitorSystem/ImpactDiagnosis", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/OtherParametersTrend') {
          this.nowpos = '/DieselMonitorSystem/OtherParametersTrend';
          this.$router.push({path: "/DieselMonitorSystem/OtherParametersTrend", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/AlarmQuery') {
          this.nowpos = '/DieselMonitorSystem/AlarmQuery';
          this.$router.push({path: "/DieselMonitorSystem/AlarmQuery", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/OnAndOffStateAnalysis') {
          this.nowpos = '/DieselMonitorSystem/OnAndOffStateAnalysis';
          this.$router.push({path: "/DieselMonitorSystem/OnAndOffStateAnalysis", query: this.$route.query});
        }
        if (index === 'DieselMonitorSystem/StartAndStopTimeQuery') {
          this.nowpos = '/DieselMonitorSystem/StartAndStopTimeQuery';
          this.$router.push({path: "/DieselMonitorSystem/StartAndStopTimeQuery", query: this.$route.query});
        }

        //往复机
        if (index === 'ReciprocatMachineryGraph/OverviewGraph1') {
          this.nowpos = '/ReciprocatMachineryGraph/OverviewGraph1';
          this.$router.push({path: "/ReciprocatMachineryGraph/OverviewGraph1", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/ReciprocatAlarmQuery') {
          this.nowpos = '/ReciprocatMachineryGraph/ReciprocatAlarmQuery';
          this.$router.push({path: "/ReciprocatMachineryGraph/ReciprocatAlarmQuery", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/RunStatusGraph1') {
          this.nowpos = '/ReciprocatMachineryGraph/RunStatusGraph1';
          this.$router.push({path: "/ReciprocatMachineryGraph/RunStatusGraph1", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/HistoricalComparisonGraph1') {
          this.nowpos = '/ReciprocatMachineryGraph/HistoricalComparisonGraph1';
          this.$router.push({path: "/ReciprocatMachineryGraph/HistoricalComparisonGraph1", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/SingleValueStickGraph1') {
          this.nowpos = '/ReciprocatMachineryGraph/SingleValueStickGraph1';
          this.$router.push({path: "/ReciprocatMachineryGraph/SingleValueStickGraph1", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/PistonRodSettlement') {
          this.nowpos = '/ReciprocatMachineryGraph/PistonRodSettlement';
          this.$router.push({path: "/ReciprocatMachineryGraph/PistonRodSettlement", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/ReciprocatVibrationMonitor') {
          this.nowpos = '/ReciprocatMachineryGraph/ReciprocatVibrationMonitor';
          this.$router.push({path: "/ReciprocatMachineryGraph/ReciprocatVibrationMonitor", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/MultiparameterAnalysis1') {
          this.nowpos = '/ReciprocatMachineryGraph/MultiparameterAnalysis1';
          this.$router.push({path: "/ReciprocatMachineryGraph/MultiparameterAnalysis1", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/ReciprocatComprehensiveAnalysis') {
          this.nowpos = '/ReciprocatMachineryGraph/ReciprocatComprehensiveAnalysis';
          this.$router.push({path: "/ReciprocatMachineryGraph/ReciprocatComprehensiveAnalysis", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/OtherParametersTrend1') {
          this.nowpos = '/ReciprocatMachineryGraph/OtherParametersTrend1';
          this.$router.push({path: "/ReciprocatMachineryGraph/OtherParametersTrend1", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/PistonRodTrackGraph') {
          this.nowpos = '/ReciprocatMachineryGraph/PistonRodTrackGraph';
          this.$router.push({path: "/ReciprocatMachineryGraph/PistonRodTrackGraph", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/IndicatorGraph1') {
          this.nowpos = '/ReciprocatMachineryGraph/IndicatorGraph1';
          this.$router.push({path: "/ReciprocatMachineryGraph/IndicatorGraph1", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/ImpactDiagnosis1') {
          this.nowpos = '/ReciprocatMachineryGraph/ImpactDiagnosis1';
          this.$router.push({path: "/ReciprocatMachineryGraph/ImpactDiagnosis1", query: this.$route.query});
        }
        if (index === 'ReciprocatMachineryGraph/StressMonitoring') {
          this.nowpos = '/ReciprocatMachineryGraph/StressMonitoring';
          this.$router.push({path: "/ReciprocatMachineryGraph/StressMonitoring", query: this.$route.query});
        }


        //注意在柴油机和往复机上面加跳转路径，请看上一条注释

        //在线报告报表
        if (index === 'MachineMonthReport') {
          this.nowpos = '/MachineMonthReport';
          this.$router.push({path: "/MachineMonthReport"});
        }
        if (index === 'VibrationParameterReport') {
          this.nowpos = '/VibrationParameterReport';
          this.$router.push({path: "/VibrationParameterReport"});
        }
        if (index === 'FactoryReport') {
          this.nowpos = '/FactoryReport';
          this.$router.push({path: "/FactoryReport"});
        }

        // 离线
        if (index === 'Offline/OLUnitOverviewMap') {
          this.nowpos = '/Offline/OLUnitOverviewMap';
          this.$router.push({path: "/Offline/OLUnitOverviewMap", query: this.$route.query});
        }
        if (index === 'Offline/OLVibrationTrend') {
          this.nowpos = '/Offline/OLVibrationTrend';
          this.$router.push({path: "/Offline/OLVibrationTrend", query: this.$route.query});
        }
        if (index === 'Offline/OLEnvelopeAnalysis') {
          this.nowpos = '/Offline/OLEnvelopeAnalysis';
          this.$router.push({path: "/Offline/OLEnvelopeAnalysis", query: this.$route.query});
        }
        if (index === 'Offline/OLRetardedVariablesTrend') {
          this.nowpos = '/Offline/OLRetardedVariablesTrend';
          this.$router.push({path: "/Offline/OLRetardedVariablesTrend", query: this.$route.query});
        }
        if (index === 'Offline/OLAlarmQueryAnalysis') {
          this.nowpos = '/Offline/OLAlarmQueryAnalysis';
          this.$router.push({path: "/Offline/OLAlarmQueryAnalysis", query: this.$route.query});
        }
        if (index === 'Offline/OLComparativeAnalysis') {
          this.nowpos = '/Offline/OLComparativeAnalysis';
          this.$router.push({path: "/Offline/OLComparativeAnalysis", query: this.$route.query});
        }
        if (index === 'Offline/OLComparisonAnalysis') {
          this.nowpos = '/Offline/OLComparisonAnalysis';
          this.$router.push({path: "/Offline/OLComparisonAnalysis", query: this.$route.query});
        }
        if (index === 'Offline/OLOrbitOfShaftCenter') {
          this.nowpos = '/Offline/OLOrbitOfShaftCenter';
          this.$router.push({path: "/Offline/OLOrbitOfShaftCenter", query: this.$route.query});
        }
        if (index === 'Offline/OLManualEntry') {
          this.nowpos = '/Offline/OLManualEntry';
          this.$router.push({path: "/Offline/OLManualEntry", query: this.$route.query});
        }
        if (index === 'Offline/OLWallThicknessTrend') {
          this.nowpos = '/Offline/OLWallThicknessTrend';
          this.$router.push({path: "/Offline/OLWallThicknessTrend", query: this.$route.query});
        }
        // 离线结束

        // 无线机泵
        if (index === 'WirelessPumpGraph/WirelessPumpUnitOverviewMap') {
          this.nowpos = '/WirelessPumpGraph/WirelessPumpUnitOverviewMap';
          this.$router.push({path: "/WirelessPumpGraph/WirelessPumpUnitOverviewMap", query: this.$route.query});
        }
        if (index === 'WirelessPumpGraph/WirelessPumpAlarmQueryGraph') {
          this.nowpos = '/WirelessPumpGraph/WirelessPumpAlarmQueryGraph';
          this.$router.push({path: "/WirelessPumpGraph/WirelessPumpAlarmQueryGraph", query: this.$route.query});
        }
        if (index === 'WirelessPumpGraph/WirelessPumpTrendAnalysis') {
          this.nowpos = '/WirelessPumpGraph/WirelessPumpTrendAnalysis';
          this.$router.push({path: "/WirelessPumpGraph/WirelessPumpTrendAnalysis", query: this.$route.query});
        }
        if (index === 'WirelessPumpGraph/WirelessPumpImpactDiagnosis') {
          this.nowpos = '/WirelessPumpGraph/WirelessPumpImpactDiagnosis';
          this.$router.push({path: "/WirelessPumpGraph/WirelessPumpImpactDiagnosis", query: this.$route.query});
        }
        if (index === 'WirelessPumpGraph/WirelessPumpOtherParametersTrendGraph') {
          this.nowpos = '/WirelessPumpGraph/WirelessPumpOtherParametersTrendGraph';
          this.$router.push({path: "/WirelessPumpGraph/WirelessPumpOtherParametersTrendGraph", query: this.$route.query});
        }
        if (index === 'WirelessPumpGraph/WaveformSpectraComparativeAnalysis') {
          this.nowpos = 'WirelessPumpGraph/WaveformSpectraComparativeAnalysis';
          this.$router.push({path: "/WirelessPumpGraph/WaveformSpectraComparativeAnalysis", query: this.$route.query});
        }
        if (index === 'WirelessPumpGraph/WirelessPumpEdgeComputingGraph') {
          this.nowpos = 'WirelessPumpGraph/WirelessPumpEdgeComputingGraph';
          this.$router.push({path: "/WirelessPumpGraph/WirelessPumpEdgeComputingGraph", query: this.$route.query});
        }
        if (document.getElementById("lefttupu")) {
          console.log('有吗');
          var erd = elementResizeDetectorMaker();
          var plantHeight = elementResizeDetectorMaker();
          let that = this;
          that.$nextTick(() => {
            // erd.listenTo(document.getElementById("lefttupu"), function (element) {
            //   var width = element.offsetWidth;
            //   var height = element.offsetHeight;
            //   that.$nextTick(function () {
            //   //  console.log("Size: " + width + "x" + height);
            //     this.nowWidth = width;
            //   });
            // });
            // const resizeObeserver1 = new ResizeObserver(entries => {
            //   for (let entry of entries) {
            //     const width = entry.contentRect.width;
            //     this.$nextTick( () => {
            //       this.nowWidth = width;
            //     })
            //   }
            // });
            // try {
            //   resizeObeserver1.observe(document.getElementById("lefttupu"))
            // } catch (error) {
            //   console.log(error)
            // }

            plantHeight.listenTo(document.getElementById("leftAside"), function (element) {
              var plant_height = element.offsetHeight;
              if (document.getElementById("UnitOverviewMap")) {
                document.getElementById("UnitOverviewMap").style.height = plant_height.toString() + 'px';
              }
            });
          });
        }
      },
      handleTopic(index) {
        this.$store.state.topiccolor = index
        this.$router.push({query: {equipmentUuid: this.nowequid, topic: this.$store.state.topiccolor, language: this.$store.state.language}})
        this.changeTopic(index);
      },
      changeflag() {
        if (this.showMenu === true) {
          this.showMenu = false;
          this.$store.commit('setflagopleft', false);
          this.$store.commit('setmarginleftvalue', '10%');
          this.$store.state.showOp = false;
        } else {
          this.showMenu = true;
          this.$store.commit('setflagopleft');
          if(!this.$store.state.flaggraph && this.$store.state.flagporight && this.$store.state.flagopleft) {
            this.$store.commit('setmarginleftvalue', '0%');
          }
          this.$store.state.showOp = true;
        }
      },
      setOpPage(param) {
        if (param === false) {
          document.getElementById("lefttupu").style.width = 'calc(100% - 12px)';
        } else {
          document.getElementById("lefttupu").style.width = 'calc(100% - 302px)';
        }
      }
    },
    components:{
      PlantTree,
      bottomInfo,
    },
  }
</script>

<style lang="scss">
.box {
  --labelcolor: #696B6F;
  --treeinputbgcolor: #ffffff;
  --bgcolor: #222331;
  --conbgcolor: #0D0F1F;
  --leftconbgcolor: #222331;
  --buttoncolor: #1677FF;
  --activetextcolor: #1677FF;
  --scrollbarbgcolor: rgba(193,193,193,0.2);
  --scrollbarthumbbgcolor: rgba(193,193,193,1);
  // --bgcolor: '';
  // --conbgcolor: '';
  // --leftconbgcolor: '';
  display: flex;
  height: 100%;
  overflow: hidden;

  .el-header {
    padding: 0;
    background-color: var(--bgcolor);
    color: #fff;
    line-height: 48px;
    font-size: 24px;
    font-weight: bold;
    overflow-x: auto; /* 允许横向滚动 */
    overflow-y: hidden; /* 隐藏垂直滚动条 */
    white-space: nowrap; /* 确保所有内容在同一行 */
    transition: transform 0.5s ease; /* 平滑滚动动画 */
    width: 100%; /* 占满整个容器宽度 */
    display: flex; /* 使用 flex 布局 */
    align-items: center; /* 垂直居中对齐 */


    .el-menu-demo {
      height: 100%;
      display: flex; /* 使用 flex 布局 */
      align-items: center; /* 垂直居中对齐 */
    }

    .my-div1 {
      display: flex; /* 使用 flex 布局 */
      align-items: center; /* 垂直居中对齐 */
      flex-grow: 1; /* 让 .my-div1 占据剩余空间 */

    }
  }

  .content {
    // height: 100%;
    position: relative;
    height: calc(100% - 80px);
    background-color: var(--conbgcolor);
  }

  .left-aside {
    height: calc(100% - 10px);
    display: flex;
    flex-direction: column;
    flex-wrap: wrap; /* 自动换行 */
    margin-top:10px;
    .left-title{
      margin-bottom: 1px;
      padding: 6px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--leftconbgcolor);
      box-shadow: 0 1px 1px 0 var(--conbgcolor);
      color: var(--textcolor);
    }
    .left-title-txt{
      color: var(--activetextcolor);
      height: auto;
      font-family: "Microsoft YaHei";
      font-size: 16px;
      font-weight: 700;
    }
    .left-content {
      flex: 1;
      background: var(--leftconbgcolor);
      overflow: auto;
    }
    .left-content::-webkit-scrollbar{
      background-color: var(--leftconbgcolor);
    }
    .left-content::-webkit-scrollbar-thumb{
      background-color: var(--leftconbgcolor);
    }
    .menu-hide {
      height: 100%;
      width: 10px;
      float: left;
      background-color: var(--conbgcolor);
      display: flex;
      align-items: center;

      .op-btn {
        height: 100%;
        width: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        cursor: pointer;
      }
      .op-btn-svg {
        position: absolute;
      }
      .op-button {
        transform: perspective(0.5em) rotateY(16deg);
        width: 10px;
        height: 66px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--leftconbgcolor);
        color: var(--buttoncolor);
        position: absolute;
        cursor: pointer;
      }
    }
  }

  .el-menu.el-menu--horizontal {
    border-bottom: solid 0px #303749;
  }

  .el-menu--horizontal>.el-submenu .el-submenu__title{
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    padding: 0 16px;
    height: 48px;
    line-height: 48px;
  }

  .el-aside {
    color: #333;
    text-align: center;
    line-height: 205px;
    border: 1px solid #303749;
  }

  .el-main {
    padding: 0;
    /*border: 1px solid #2F4554;*/

  }

  .main {
    flex: 1;
    height: 100%;
    width: calc(100% - 240px);
    background: var(--leftconbgcolor);
  }

  .trees {
    width: 100%;
    //height: 100%;
    height: calc(100% - 10px);
  }

  .el-dialog__header{
    padding: 10px 10px;
  }

  .el-dialog__body{
    padding: 10px 10px;
  }

  //  数据加载样式
  .data-loading,
  .datafail{
    z-index: 3;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    width: 160px;
    height: 50px;
    color: var(--labelcolor);
    background-color: var(--treeinputbgcolor);
    line-height: 50px;
    text-align: center;
  }

  ::-webkit-scrollbar{
    width:5px;
    height: 5px;
    margin-left: 50%;
    background-color: var(--scrollbarbgcolor);
  }
  ::-webkit-scrollbar-thumb{
    margin-left: 50%;
    border-radius: 5px;
    background-color: var(--scrollbarthumbbgcolor);
  }


}

</style>
