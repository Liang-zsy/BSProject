import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
Vue.use(Vuex);

const state = {
  dblclickEnabled: false, // 是否启用 dblclick 事件（双击图谱放大功能）
  points: [], // 记录概貌图的测点信息
  //prelines:[],
  historyImmediateFlag: true, //历史模式下选中或取消测点树
  equid: "",  //设备id 当前选中的设备id
  etype: "", // 设备类型 旋转 0, 1, 3, 4 往复 6 机泵 7 燃气轮机 2
  dataSource: "",//区分有线和无线 无线 4 其余为有线
  nodeType: "",//2无线采集，1在线采集，0离线采集
  mypointId: '', //测点ID
  alarmStartTime: '',
  alarmEndTime: '',
  startTime: '',
  endTime: '',
  tmpStartTime: '',
  tmpEndTime: '',
  showPlanttree: true,
  hidden: { // 隐藏
    plantTree: config.hidden.plantTree, // 左边设备树
    opPage: config.hidden.opPage, // 右边操作页
    menu: config.hidden.menu, // 菜单栏
  },
  token: '',
  axiosInstance: null,
  equipmentBarInfo: {}, //电机叶轮信息
  globalTimeFlag: false, //全局时间是否开启
  globalTimeTrend: '前一阶段', //全局时间的趋势， 前一阶段 起止时间 起止月
  globalTimeStage: '前1周', //前一阶段时间变量
  globalTimeBegin: new Date().getTime() - 3600 * 1000 * 24 * 7, //起止时间开始时间变量
  globalTimeEnd: new Date().getTime(), //起止时间截止时间变量
  globalTimeMonth: new Date().getFullYear().toString() + '-' + (new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1).toString(), //起止月时间变量
  showGraph: false,
  globalPointId: '',
  globalMeasurementId: '',
  globalTreeSelect: "0",
  pointId: '', //从url获取到的pointId
  path: '',//跳转路由
  timeRadio: 2, //从url获取到的时间选择模式
  uid: '', //平台uid
  username: '', //平台username
  trackModel: 0, //0为滤波、1为提纯
  brush: false, //是否在进行细化
  useBruchTime: false, // 是否正在使用bruch
  useBruchTimeBegin: null,
  useBruchTimeEnd: null,
  blueAxisLableColor: '#ccc', //蓝色主题下坐标轴标签颜色
  equName: "",  //设备名称
  nodeData: {}, //设备测点UUID对应的测点信息info
  nodeNum: 0, //设备测点info信息个数
  equipmentDetail: {},  //设备测点UUID对应的测点详细信息detail
  detailNum: 0, //设备测点detail信息个数
  flaggraph: false, //概貌图是否显示图谱
  flagopright: true, //概貌图操作页是否显示
  flagopleft: true, //设备树是否显示
  marginleftvalue: '0%', //设置概貌图底图偏移量
  timeRev: {}, //存储时间戳对应的转速
  threeDimensionalOverviewIP: config.menu.threeDimensionalOverviewIP,
  ProcessOverviewIP: config.menu.ProcessOverviewIP, //工艺量概貌图和设别流程图的iframeIP
  gongyiOverviewIframeHistoryTime: null,
  OverviewDisplayMode: process.env.NODE_ENV == 'production' ? 2 : 3, //1表示只显示振动概貌图，2表示只显示工艺量概貌图和PID图，3表示显示振动概貌图和工艺量概貌图切换按钮, 平台显示工艺量概貌图和PID图
  showProcessOverview: 1,
  peakSearchNum: 5, // 寻峰个数
  resonanceNum: 20, // 谐频倍数
  modelFlag: true, //是否为时间点等分模式
  tooltipTime: '', //悬浮框选择的时间
  DefaultMax500HzInFrequencyGraph: false, //频谱图默认显示范围是否为0~500HZ
  topiccolor: 'high-ash',
  backgroundcolor: '#222331',
  textcolor: 'white',
  activetextcolor: '#1677FF',
  bgcolor: '#222331',
  conbgcolor: '#0D0F1F',
  shadowcolor:'#d8d8dc',
  leftconbgcolor: '#222331',
  elbgcolor: '#222331',
  pointcolor: '#1D1E2C',
  linecolor: 'rgba(255,255,255,0.3)',
  inputbgcolor: '#222331',
  buttoncolor: '#1677FF',
  eltreecolor: '#1D1E2C',
  treeinputbgcolor: '#ffffff',
  tickcolor: '#999999',
  toolboxcolor: '#ffffff',  // 工具栏图标颜色
  labelcolor: '#696B6F',
  threedcolor: '#007878',
  scrollbarbgcolor: 'rgba(193,193,193,0.2)',  // 滚动条背景颜色
  scrollbarthumbbgcolor: 'rgba(193,193,193,1)',  // 滚动条颜色
  paddingtop: 15,
  paddingright: -10,
  markcolor: '#ffffff',
  markbordercolor: '#FF0B00',
  toolboxtextcolor: '#D1EADF',
  // tablecolor: '#091A42',
  tablecolor: '#001E38',
  checkedcolor: '#1677FF',
  buttontextcolor: '#ffffff',
  eltreebordercolor: '#000',
  selectbordercolor: '#FFFFFFCC',
  language: '',
  intervalId: null,
  intervalIds: [], // 定时器想要不关闭，可以把intervalId放入这个数组
  grid: { //echarts中会保存竖直不需要加px
    left: '5%', // 50px 7%
    right: '5%', // 50px 7%
    top: 50, // 21%
    bottom: 50, // 27%
    trendBottom: 64, // 趋势图需要显示图例
  },
  rotaingOrbit: [false, false, true, true, false, false],
  characteristicFrequency:  ["0.5X","1X","2X","3X"],
  showSpeed: true,
  showWave: true,
  showSpectrum: true,
  showColumnar: false,
  graphCount: 3,
  isWaterFall: false,
  dialogVisible: false,//修改标注弹窗是否显示
  updateGraphicTextFlag: false,//是否执行修改标注内容
  upsInputValue: '',//弹窗输入框文本
  xValue: '',//标注修改数据
  yValue: '',//标注修改数据
  seriesIndex: '',//标注修改数据
  // markcolor: '#FF0B00',
  // markbordercolor: '#ffffff',
  //图谱曲线颜色信息
  colorMap: [
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
  ],
  primarySecondaryColor: ['#FF0000','#FF00FF'],
  // 测点特征值信息
  textMap: [
    "通频",
    "1倍频幅值",
    "2倍频幅值",
    "3倍频幅值",
    "1/2倍频幅值",
    "残振",
    "直流量",
    "间隙电压",
    "1倍频相位",
    "2倍频相位",
    "3倍频相位",
    "1/2倍频相位",
  ],
  showOp: true,
  backMap: [
    'all',
    'one',
    'two',
    'three',
    'half',
    'res',
    'dc',
    'gap',
    'phaseOne',
    'phaseTwo',
    'phaseThree',
    'phaseHalf'
  ],
  //测点type对应特征值list
  features:
    {
      88: [
        {id: 0, label: "峰值", unit: "m/s²"},
        {id: 1, label: "峭度", unit: ""},
        {id: 2, label: "歪度", unit: ""},
      ],
      99: [
        {id: 1, label: "压力", unit: "um"},
        {id: 2, label: "温度", unit: "℃"},
        {id: 3, label: "流量", unit: ""},
        {id: 4, label: "其他", unit: ""},
        {id: 5, label: "撞击", unit: "次"},

      ],
      100: [
        {id: 0, label: "峰值", unit: "m/s²", feature: 'all'},
        {id: 1, label: "峭度", unit: "", feature: 'one'},
        {id: 2, label: "歪度", unit: "", feature: 'two'},
        {id: 3, label: "直流量", unit: "V", feature: 'dc'},
      ],
      101: [
        {id: 0, label: "有效值", unit: "mm/s", feature: 'all'},
        {id: 1, label: "峭度", unit: "", feature: 'one'},
        {id: 2, label: "歪度", unit: "", feature: 'two'},
        {id: 3, label: "直流量", unit: "V",feature: 'dc'},
      ],
      // 111: [
      //   {id: 0, label: "平均压力", unit: "MPa", feature: 'all'},
      //   {id: 1, label: "机械效率", unit: "%", feature: 'one'},
      //   {id: 2, label: "吸气容积效率", unit: "%", feature: 'two'},
      //   {id: 3, label: "排气容积效率", unit: "%", feature: 'three'},
      //   {id: 4, label: "单缸指示功率", unit: "KW", feature: 'half'},
      //   {id: 5, label: "压缩指数", unit: "", feature: 'res'},
      //   {id: 6, label: "膨胀系数", unit: "", feature: 'dc'},
      //   {id: 7, label: "实际压力比", unit: "", feature: 'gap'},
      //   {id: 8, label: "最大值", unit: "", feature: 'phaseOne'},
      //   {id: 9, label: "最小值", unit: "", feature: 'phaseTwo'},
      //   {id: 10, label: "直流量", unit: "V", feature: 'phaseThree'},
      // ],
      111: [
        {id: 0, label: "平均压力", unit: "MPa", feature: 'all'},
        {id: 1, label: "机械效率", unit: "%", feature: 'half'},
        {id: 2, label: "吸气容积效率", unit: "%", feature: 'one'},
        {id: 3, label: "排气容积效率", unit: "%", feature: 'two'},
        {id: 4, label: "单缸指示功率", unit: "KW", feature: 'three'},
        {id: 5, label: "压缩指数", unit: "", feature: 'res'},
        {id: 6, label: "膨胀系数", unit: "", feature: 'dc'},
        {id: 7, label: "实际压力比", unit: "", feature: 'gap'},
        {id: 8, label: "最大值", unit: "KPa", feature: 'phaseHalf'},
        {id: 9, label: "最小值", unit: "KPa", feature: 'phaseOne'},
      ],
      112: [
        {id: 0, label: "沉降量/偏摆量", unit: "um", feature: 'all'},
        {id: 1, label: "峰-峰值", unit: "um", feature: 'half'},
        {id: 2, label: "峰值", unit: "um", feature: 'one'},
        {id: 3, label: "活塞-气缸剩余间隙", unit: "um", feature: 'two'},
        {id: 4, label: "一倍频幅值", unit: "um", feature: 'three'},
        {id: 5, label: "二倍频幅值", unit: "um", feature: 'res'},
        {id: 6, label: "直流量", unit: "V", feature: 'dc'},
        {id: 7, label: "间隙电压", unit: "V", feature: 'gap'},
      ],
      113: [
        {id: 0, label: "加速度峰值", unit: "m/s²",feature: 'all'},
        {id: 1, label: "加速度高频", unit: "m/s²",feature: 'one'},
        {id: 2, label: "加速度低频", unit: "m/s²",feature: 'two'},
        {id: 3, label: "加速度波形峭度", unit: "",feature: 'three'},
        {id: 4, label: "速度有效值", unit: "mm/s",feature: 'half'},
        {id: 5, label: "通频gIE值", unit: "gIE",feature: 'res'},
        {id: 6, label: "加速度真峰值", unit: "m/s²",feature: 'phaseOne'},
        {id: 7, label: "直流量", unit: "V",feature: 'dc'},
      ],
      114: [
        {id: 0, label: "通频有效值", unit: "mm/s",feature: 'all'},
        {id: 1, label: "1倍频幅有效值", unit: "mm/s",feature: 'one'},
        {id: 2, label: "2倍频有效值", unit: "mm/s",feature: 'two'},
        {id: 3, label: "3倍频有效值", unit: "mm/s",feature: 'three'},
        {id: 4, label: "1/2倍频有效值", unit: "mm/s",feature: 'half'},
        {id: 5, label: "残振有效值", unit: "mm/s",feature: 'res'},
        {id: 6, label: "直流量", unit: "V",feature: 'dc'},
      ],
      116: [
        {id: 0, label: "振动速度有效值", unit: "mm/s", feature: 'all'},
      ],
      117: [
        {id: 0, label: "振动加速度真峰值", unit: "m/s²", feature: 'all'},
        {id: 1, label: "振动位移峰峰值", unit: "um", feature: 'one'},
      ],
      118: [
        {id: 0, label: "振动加速度有效峰值", unit: "m/s²", feature: 'all'},
        {id: 1, label: "振动位移峰峰值", unit: "um", feature: 'one'},
        {id: 2, label: "振动加速度低频值", unit: "m/s²", feature: 'two'},
        {id: 3, label: "振动加速度真峰值", unit: "m/s²", feature: 'three'},
      ],
      119: [
        {id: 0, label: "通频", unit: "um", feature: 'all'},
        {id: 1, label: "1倍频幅值", unit: "um", feature: 'one'},
        {id: 2, label: "2倍频幅值", unit: "um", feature: 'two'},
        {id: 3, label: "3倍频幅值", unit: "um", feature: 'three'},
        {id: 4, label: "1/2倍频幅值", unit: "um", feature: 'half'},
        {id: 5, label: "残振", unit: "um", feature: 'res'},
        {id: 6, label: "直流量", unit: "V", feature: 'dc'},
        {id: 7, label: "间隙电压", unit: "V", feature: 'gap'},
        {id: 8, label: "1倍频相位", unit: "°", feature: 'phaseOne'},
        {id: 9, label: "2倍频相位", unit: "°", feature: 'phaseTwo'},
        {id: 10, label: "3倍频相位", unit: "°", feature: 'phaseThree'},
        {id: 11, label: "1/2倍频相位", unit: "°", feature: 'phaseHalf'}
      ],
      120: [
        {id: 0, label: "通频", unit: "mm/s", feature: 'all'},
        {id: 1, label: "1倍频幅值", unit: "mm/s", feature: 'one'},
        {id: 2, label: "2倍频幅值", unit: "mm/s", feature: 'two'},
        {id: 3, label: "3倍频幅值", unit: "mm/s", feature: 'three'},
        {id: 4, label: "1/2倍频幅值", unit: "mm/s", feature: 'half'},
        {id: 5, label: "残振", unit: "mm/s", feature: 'res'},
        {id: 6, label: "直流量", unit: "V", feature: 'dc'},
        {id: 7, label: "间隙电压", unit: "V", feature: 'gap'},
        {id: 8, label: "1倍频相位", unit: "°", feature: 'phaseOne'},
        {id: 9, label: "2倍频相位", unit: "°", feature: 'phaseTwo'},
        {id: 10, label: "3倍频相位", unit: "°", feature: 'phaseThree'},
        {id: 11, label: "1/2倍频相位", unit: "°", feature: 'phaseHalf'}
      ],
      121: [
        {id: 0, label: "通频", unit: "m/s²", feature: 'all'},
        {id: 1, label: "1倍频幅值", unit: "m/s²", feature: 'one'},
        {id: 2, label: "2倍频幅值", unit: "m/s²", feature: 'two'},
        {id: 3, label: "3倍频幅值", unit: "m/s²", feature: 'three'},
        {id: 4, label: "1/2倍频幅值", unit: "m/s²", feature: 'half'},
        {id: 5, label: "残振", unit: "m/s²", feature: 'res'},
        {id: 6, label: "直流量", unit: "V", feature: 'dc'},
        {id: 7, label: "间隙电压", unit: "V", feature: 'gap'},
        {id: 8, label: "1倍频相位", unit: "°", feature: 'phaseOne'},
        {id: 9, label: "2倍频相位", unit: "°", feature: 'phaseTwo'},
        {id: 10, label: "3倍频相位", unit: "°", feature: 'phaseThree'},
        {id: 11, label: "1/2倍频相位", unit: "°", feature: 'phaseHalf'}
      ],
      122: [
        {id: 0, label: "通频", unit: "um", feature: 'all'},
        {id: 1, label: "1倍频幅值", unit: "um", feature: 'one'},
        {id: 2, label: "2倍频幅值", unit: "um", feature: 'two'},
        {id: 3, label: "3倍频幅值", unit: "um", feature: 'three'},
        {id: 4, label: "1/2倍频幅值", unit: "um", feature: 'half'},
        {id: 5, label: "残振", unit: "um", feature: 'res'},
        {id: 6, label: "直流量", unit: "V", feature: 'dc'},
        {id: 7, label: "间隙电压", unit: "V", feature: 'gap'},
        {id: 8, label: "1倍频相位", unit: "°", feature: 'phaseOne'},
        {id: 9, label: "2倍频相位", unit: "°", feature: 'phaseTwo'},
        {id: 10, label: "1/2倍频相位", unit: "°", feature: 'phaseHalf'},
        {id: 11, label: "平均值", unit: "mm", feature: 'phaseThree'},
      ],
      123: [
        {id: 0, label: "通频", unit: "mm/s", feature: 'all'},
        {id: 1, label: "1倍频幅值", unit: "mm/s", feature: 'one'},
        {id: 2, label: "2倍频幅值", unit: "mm/s", feature: 'two'},
        {id: 3, label: "3倍频幅值", unit: "mm/s", feature: 'three'},
        {id: 4, label: "1/2倍频幅值", unit: "mm/s", feature: 'half'},
        {id: 5, label: "残振", unit: "mm/s", feature: 'res'},
        {id: 6, label: "直流量", unit: "V", feature: 'dc'},
        {id: 7, label: "间隙电压", unit: "V", feature: 'gap'},
        {id: 8, label: "1倍频相位", unit: "°", feature: 'phaseOne'},
        {id: 9, label: "2倍频相位", unit: "°", feature: 'phaseTwo'},
        {id: 10, label: "1/2倍频相位", unit: "°", feature: 'phaseHalf'},
        {id: 11, label: "平均值", unit: "mm", feature: 'phaseThree'},
      ],
      124: [
        {id: 0, label: "通频", unit: "m/s²", feature: 'all'},
        {id: 1, label: "1倍频幅值", unit: "m/s²", feature: 'one'},
        {id: 2, label: "2倍频幅值", unit: "m/s²", feature: 'two'},
        {id: 3, label: "3倍频幅值", unit: "m/s²", feature: 'three'},
        {id: 4, label: "1/2倍频幅值", unit: "m/s²", feature: 'half'},
        {id: 5, label: "残振", unit: "m/s²", feature: 'res'},
        {id: 6, label: "直流量", unit: "V", feature: 'dc'},
        {id: 7, label: "间隙电压", unit: "V", feature: 'gap'},
        {id: 8, label: "1倍频相位", unit: "°", feature: 'phaseOne'},
        {id: 9, label: "2倍频相位", unit: "°", feature: 'phaseTwo'},
        {id: 10, label: "1/2倍频相位", unit: "°", feature: 'phaseHalf'},
        {id: 11, label: "平均值", unit: "mm", feature: 'phaseThree'},
      ],
      //动态压力type未知，暂定

    },
  //缸号对应信息
  cylinderNos: {},
  IntelligentAlarmMarkColor: '',
  StaticAlarmMarkColor: '',
  level1: '#e6f600',
  level2: '#f4e301',
  level3: '#e69924',
  hLevel: '#ee831f',
  hhLevel: '#e50a0a',
  zhengchang: 'green',
  duangwang:  'rgb(148, 139, 84)',
  tingji: 'rgb(190, 190, 190)',
  //轴承信息
  bearingInfoList: {},
  showBearingDialogFlag: false,
  BEARING_ID: '',//轴承编号
  BEARING_REV: '',//转速
  innerValue: '',//内圈
  rollingValue: '',//滚动体
  outerValue: '',//外圈
  cageValue: '',//保持架
  fi: '',//内圈旋转频率
  fo: '',//外圈故障特征频率
  fe: '',//滚动体故障特征频率
  fc: '',//保持架故障特征频率
};


const getters = {
  getNowcylinderNos: (state) => {
    return state.cylinderNos[state.equid];
  },
  getGraphHeight: (state) => {
    const showNum = state.showWave + state.showSpectrum + state.showSpeed + state.showColumnar + 1;

    if (showNum === 0) {
      return "100%";
    } else  {
      return (100 / showNum).toFixed(2) + "%";
    }
  },
  getGraphSelectInfo: (state) => {
    return {
      showSpeed: state.showSpeed,
      showWave: state.showWave,
      showSpectrum: state.showSpectrum,
    }
  }
};

const mutations = {
  //修改概貌图显示图谱状态
  setflaggraph: (state, flaggraph) => {
    state.flaggraph = flaggraph;
  },
  //修改概貌图显示操作页flag
  setflagopright: (state, flagopright) => {
    state.flagopright = flagopright;
  },
  //修改设备树显示操作页flag
  setflagopleft: (state, flagopleft) => {
    state.flagopleft = flagopleft;
  },
  //修改底图偏移量
  setmarginleftvalue: (state, marginleftvalue) => {
    state.marginleftvalue = marginleftvalue;
  },
  //修改当前设备UUID
  setequid: (state, equid) => {
    state.gongyiOverviewIframeHistoryTime = null;
    state.equid = equid;
  },
  //修改当前设备名称
  setequName: (state, equidName) => {
    state.equName = equidName;
  },
  //设置无特征值测点单位
  setFeature: (state, feature) => {
    state.features[99] = feature;
  },
  //添加对应设备UUID测点信息info
  setnodeData: (state, info) => {
    state.nodeNum++;
    Vue.set(state.nodeData, info[0], info[1]);
  },
  //添加对应设备UUID测点信息detail
  setEquipmentDetail: (state, detail) => {
    state.detailNum++;
    Vue.set(state.equipmentDetail, detail[0], detail[1]);
  },

  setCylinderNo: (state, cylinderData) => {
    Vue.set(state.cylinderNos, cylinderData[0], cylinderData[1]);
  },
  setGraphInfo: (state, obj) => {
    const {showSpeed, showWave, showSpectrum, showColumnar} = obj;
    state.showSpeed = showSpeed;
    state.showWave = showWave;
    state.showSpectrum = showSpectrum;
    state.showColumnar = showColumnar
    state.graphCount = showSpeed + showWave + showSpectrum + showColumnar
  },

  setGlobalTimeTrend(state, newTrend) {
    state.globalTimeTrend = newTrend;
  },
  setGlobalTimeStage(state, newStage) {
    state.globalTimeStage = newStage;
  },
  setGlobalTimeBegin(state, newBegin) {
    state.globalTimeBegin = newBegin;
  },
  setGlobalTimeEnd(state, newEnd) {
    state.globalTimeEnd = newEnd;
  },
  setGlobalTimeMonth(state, newMonth) {
    state.globalTimeMonth = newMonth;
  },
  setEquipmentBarInfo: (state, info) => {
    state.equipmentBarInfo = info;
  }
};


const actions = {
  //获取设备id
  saveEquipId(content, equid) {
    content.commit('setequid', equid);
  },
  //从端口获取测点Info信息
  saveEquipmentInfo(content, equid) {
    content.commit('setequid', equid);
    if (state.nodeData[equid] === undefined) {
      axios.get("/point/" + equid + "/info").then(res => {
        if (res.data.code === 200) {
          // console.warn(res.data.data);
          let info = [];
          info[0] = equid;
          info[1] = res.data.data;
          axios.get("/point/" + equid + "/detail").then(res2 => {
            let tdata = res2.data.data;
            //console.log('tdata', tdata)
            //查询无特征值测点单位
            let feature = [
              {id: 1, label: "压力", unit: ""},
              {id: 2, label: "温度", unit: ""},
              {id: 3, label: "流量", unit: ""},
              {id: 4, label: "其他", unit: ""},
              {id: 5, label: "撞击", unit: ""},
            ];
            for (let item of tdata) {
              //压力
              if (item.channelType == 3) {
                feature[0].unit = item.unit;
              }
              //温度
              if (item.channelType == 4) {
                feature[1].unit = item.unit;
              }
              //流量
              if (item.channelType == 5) {
                feature[2].unit = item.unit;
              }
              //其他
              if (item.channelType == 6) {
                feature[3].unit = item.unit;
              }
              //撞击
              if (item.channelType == 7) {
                feature[4].unit = item.unit;
              }
            }
            content.commit("setFeature", feature);


            for (var i = 0; i < info[1].length; ++i) {
              for (let item of tdata) {
                if (item.pointUuid == info[1][i].pointUuid) {
                  //    console.log(item,  info[1][i])
                  info[1][i].type = item.type;
                  break;
                }
              }
            }
            content.commit('setequName', res.data.data[0].equipmentName);
            content.commit('setnodeData', info);
          })


        }
      })
    } else {
      content.commit('setequName', content.state.nodeData[equid][0].equipmentName);
    }
  },

  //从端口获取测点detail信息
  saveEquipmentDetail(content, equid) {
    if (state.equipmentDetail[equid] === undefined) {
      axios.get("/point/" + equid + "/detail").then(res => {
        if (res.data.code === 200) {
          // console.warn(res.data.data);
          let data = res.data.data;
          // console.log('zhege data', data)
          let S = new Set();
          data.forEach(item => S.add(item.cylinderNo || 1000));
          let cylinder = Array.from(S);
          cylinder.sort((a, b) => a - b);
          cylinder = cylinder.filter(item => item !== 0 && item !== 1000).map(item => {
            return {id: item, label: item.toString() + "缸"};
          });
          cylinder.unshift({id: -1, label: "全部"});
          // console.log('zhege data', data)
          content.commit('setEquipmentDetail', [equid, data]);
          content.commit('setCylinderNo', [equid, cylinder]);


        }
      })
    }
  },

  //所有端口数据获取
  getPortData(content, url) {
    return new Promise((resolve, reject) => {
      axios.get(url).then(res => {
        resolve(res);
      }).catch(e => reject(e));
    });
  },

  //从端口获取离线测点Info信息
  saveOfflineEquipmentInfo(content, equid) {
    content.commit('setequid', equid)
    if (content.state.nodeData[equid] === undefined){
      axios.get("/point/" + equid + "/info").then(res => {
        if (res.data.code === 200) {
          let infoData = res.data.data
          console.log('store saveOfflineEquipmentInfo请求数据', infoData)
          content.commit('setequName', infoData[0].equipmentName)
          content.commit('setnodeData', [equid, infoData])
        }
      })
    } else {
      content.commit('setequName', content.state.nodeData[equid][0].equipmentName);
    }
  },
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
})
