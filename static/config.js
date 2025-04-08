const config={
  topic:'high-ash',
  language:'zh',
  showLanguage:true,
  showTopic:true,
  //菜单栏显示与否
  menu: {
    //频谱图默认显示范围是否为0~500HZ
    DefaultMax500HzInFrequencyGraph: {
      show: false,
      name: "频谱图默认显示范围"
    },
    //测点树能够选择的最大数量
    MaxSelectedPointNumber: 8,
    //是否从接口拿数据
    interface: true,  // 平台是true, 其它是false, 在使用build-center平台打包时自动修改为true
    useFilterButton: true, // 是否使用设备过滤按钮
    //系统管理
    SystemManagement:{
      show: false,
      name:"系统管理",
    },
    OfflineOverviewIP: '127.0.0.1', //离线概貌图iframeIP'
    ProcessOverviewIP: '/apps', //工艺量概貌图iframeIP
    threeDimensionalOverviewIP: '/apps', // 3D概貌图
    //离线常规分析
    OfflineAnalysis: {
      show: false,
      name:"离线常规分析",
      data: {
        '7-1': true,
        _71name:"机组概貌图",
        '7-2': true,
        _72name:"振动趋势",
        '7-3': true,
        _73name:"包络分析",
        '7-4': true,
        _74name:"缓变量趋势",
        '7-5': false,
        _75name:"报警查询分析",
        '7-6': false,
        _76name:"对比分析",
        '7-7': false,
        _77name:"综合分析",
        '7-8': false,
        _78name:"轴心轨迹",
        '7-9': false,
        _79name:"手动录入",
        '7-10': false,
        _710name:"壁厚趋势",
      }
    },

    //应急柴油机振动监测系统
    DieselMonitorSystem: {
      show: true,
      name:"应急柴油机振动监测系统",
      data: {
        '5-1': true,
        _51name:"机组概貌图",
        '5-2': true,
        _52name:"运行状态图",
        '5-3': true,
        _53name:"历史比较图",
        '5-4': true,
        _54name:"单值棒图",
        '5-5': true,
        _55name:"动态压力监测",
        '5-7': true,
        _57name:"事件查询",
        '5-8': true,
        _58name:"振动监测",
        '5-9': false,
        _59name:"瞬时转速",
        '5-11': false,
        _511name:"扭振",
        '5-12': true,
        _512name:"多参数分析",
        '5-14': true,
        _514name:"综合监测",
        '5-16': true,
        _516name:"示功图",
        '5-17': true,
        _517name:"冲击诊断",
        '5-18': true,
        _518name:"其它参数趋势图",
        '5-19': true,
        _519name:"报警查询",
        '5-21': false,
        _521name:"开停车状态分析",
        '5-22': false,
        _522name:"开停车事件查询",
      }
    },

    //往复机械专用图谱
    ReciprocatMachineryGraph: {
      show:true,
      name:"往复机械专用图谱",
      data: {
        '4-1': true,
        _41name:"机组概貌图",
        '4-2': true,
        _42name:"报警查询",
        '4-3': true,
        _43name:"振动监测",
        '4-4': true,
        _44name:"历史比较图",
        '4-5': true,
        _45name:"活塞杆沉降/偏摆监测",
        '4-6': true,
        _46name:"示功图",
        '4-7': true,
        _47name:"活塞杆载荷分析",
        '4-8': true,
        _48name:"运行状态图",
        '4-9': true,
        _49name:"多参数分析",
        '4-10': true,
        _410name:"其它参数趋势图",
        '4-11': true,
        _411name:"单值棒图",
        '4-12': true,
        _412name:"综合监测",
        '4-13': false,
        _413name:"活塞杆轨迹图",
        '4-14': false,
        _414name:"冲击诊断",
      }
    },

    //旋转机械专用图谱
    RotatingMachineryGraph: {
      show: true,
      name:"旋转机械专用图谱",
      data: {
        '6-15': true,
        _615name:"机组概貌图",
        '6-1': true,
        _61name:"振动监测",
        '6-2': true,
        _62name:"振动历史比较",
        '6-3': true,
        _63name:"单多值棒图",
        '6-4': true,
        _64name:"轴心轨迹",
        '6-5': true,
        _65name:"轴心位置",
        '6-6': true,
        _66name:"启停车图形",
        '6-7': true,
        _67name:"综合分析",
        '6-8': false,
        _68name:"运行状态图",
        '6-9': true,
        _69name:"其它参数趋势图",
        '6-10': true,
        _610name:"旋转报警查询",
        '6-11': true,
        _611name:"全频谱图",
        '6-12': false,
        _612name:"二维全息谱图",
        '6-13': false,
        _613name:"三维全息谱图",
        '6-14': false,
        _614name:"现场动平衡",
        '6-17': false,
        _617name:"温度分布场",
        '6-16': false,
        _616name:"参数比较查询",
        '6-18': true,
        _618name: '冲击诊断',
        '6-19': true,
        _619name: '倒谱图',
        '6-20': false,
        _620name: '历史趋势图'
      }
    },
    //燃气轮机专用图谱
    gasTurbineGraph: {
      show: true,
      name:"燃气轮机专用图谱",
      data: {
        '6-15': true,
        _615name:"机组概貌图",
        '6-1': true,
        _61name:"振动监测",
        '6-2': true,
        _62name:"振动历史比较",
        '6-3': true,
        _63name:"单多值棒图",
        '6-4': true,
        _64name:"轴心轨迹",
        '6-5': true,
        _65name:"轴心位置",
        '6-6': true,
        _66name:"启停车图形",
        '6-7': true,
        _67name:"综合分析",
        '6-8': true,
        _68name:"运行状态图",
        '6-9': true,
        _69name:"其它参数趋势图",
        '6-10': true,
        _610name:"燃气轮机报警查询",
        '6-11': true,
        _611name:"全频谱图",
        '6-12': false,
        _612name:"二维全息谱图",
        '6-13': false,
        _613name:"三维全息谱图",
        '6-14': false,
        _614name:"现场动平衡",
        '6-16': false,
        _616name: "温度分布场",
        '6-17': true,
        _617name:"参数比较查询"
      }
    },

    //机泵专用图谱
    SpecialManualOfPump: {
      show: true,
      name:"机泵专用图谱",
      data: {
        '1': true,
        _1name:"机组概貌图",
        '2': true,
        _2name:"报警查询",
        '3': true,
        _3name:"趋势分析",
        '4': true,
        _4name:"冲击诊断",
        '5': false,
        _5name:"转子类故障诊断",
        '6': true,
        _6name:"倒谱图",
        '7': true,
        _7name:"其它参数趋势图",
        '8': true,
        _8name:"单多值棒图",
        '9': true,
        _9name:"轴心轨迹",
        '14': false,
        _14name:"分析图谱"
      }
    },

    // 无线机泵
    SpecialManualOfPump1: {
      show: true,
      name:"无线机泵专用图谱",
      data: {
        '1': true,
        _wu1name:"机组概貌图",
        '2': true,
        _wu2name:"机泵报警查询",
        '3': true,
        _wu3name:"趋势分析",
        '4': true,
        _wu4name:"冲击诊断",
        '8': true,
        _wu8name:"其它参数趋势图",
        '9': true,
        _wu9name:"波形频谱对比分析",

      }
    },
    //报警统计
    AlarmStatistics: {
      show: false,
      name:"报警统计",
    },

    //历史报警统计
    AnotherPointState: {
      show: false,
      name: '历史报警统计'
    },

    //扶梯专用图谱
    EscalatorGraph: {
      show: false,
      name:"扶梯专用图谱",
      data: {
        '2': true,
        _2name:"报警查询",
        '3': true,
        _3name:"趋势分析",
        '4': true,
        _4name:"冲击诊断",
        '5': true,
        _5name:"转子类故障诊断",
        '6': true,
        _6name:"倒谱图",
        '7': true,
        _7name:"单多值棒图",
        '8': true,
        _8name:"其它参数趋势图",
      }
    },

    //加热炉
    HeatingFurnace: {
      show: false,
      name:"加热炉专用图谱",
      data: {
        '1': true,
        _1name:"机组概貌图",
        '2': true,
        _2name:"其它参数趋势图",
      }
    },

    //在线报告报表
    ReportOnline: {
      show: false,
      name:"在线报告报表",
      data: {
        '3-1': true,
        _31name:"监测诊断报告",
        '3-2': true,
        _32name:"厂级报表",
        '3-3': true,
        _33name:"机组月报表",
        '3-4': true,
        _34name:"振动参数报表",
      }
    },

    //案例库系统
    CaseBaseSystem:{
      name:"案例库系统",
      show:false,
    },

    //管理员
    Admin:{
      name:"管理员",
      show: false,
    }
  },
  IPgroup:{
    requestIP:''
  },
  hidden:{//隐藏
    plantTree: true,//左边设备树
    opPage:true,//右边的操作页
    menu:true,//菜单栏
  }

}
