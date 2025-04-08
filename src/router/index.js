import Vue from 'vue'
import Router from 'vue-router'

import menu from "../Page/menu";

const AnalysisGraph = () => import(/* webpackChunkName: 'pump' */ "@/Page/AnalysisGraph");
const SubclassFaultDiagnosis = () => import(/* webpackChunkName: 'pump' */"@/Page/RotorFaultDiagnosis")
const OrbitOfShaftCenter = () => import(/* webpackChunkName: 'pump' */"@/Page/OrbitOfShaftCenter")
const AlarmQueryGraph = () => import(/* webpackChunkName: 'pump' */"@/Page/AlarmQueryGraph")
const ComprehensiveAnalysis = () => import(/* webpackChunkName: 'pump' */"@/Page/ComprehensiveAnalysis")
const ChangeVisualization = () => import(/* webpackChunkName: 'pump' */"@/Page/ChangeVisualization")
const OtherParametersTrendGraph = () => import(/* webpackChunkName: 'pump' */"@/Page/OtherParametersTrendGraph")
const RunSwordGraph = () => import(/* webpackChunkName: 'pump' */"@/Page/RunSwordGraph")
const RunStatusGraph = () => import(/* webpackChunkName: 'pump' */"@/Page/RunStatusGraph")
const VibrationMonitor = () => import(/* webpackChunkName: 'pump' */"@/Page/VibrationMonitor")
const UnitOverviewMap = () => import(/* webpackChunkName: 'pump' */"@/Page/UnitOverviewMap")
const MultiParametersTrendGraph = () => import(/* webpackChunkName: 'pump' */"@/Page/MultiParametersTrendGraph")
const SingleMultiBarValueChart = () => import(/* webpackChunkName: 'pump' */"@/Page/SingleMultiBarValueChart")
const StartstopGraph = () => import(/* webpackChunkName: 'pump' */"@/Page/StartstopGraph")
const TrendAnalysis = () => import(/* webpackChunkName: 'pump' */"@/Page/TrendAnalysis")
const PumpImpactDiagnosis = () => import(/* webpackChunkName: 'pump' */"@/Page/PumpImpactDiagnosis")
const CepstrumGraph = () => import(/* webpackChunkName: 'pump' */"@/Page/CepstrumGraph")

Vue.use(Router)
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error)
}

export default new Router({
  mode: 'hash',
  base:process.env.NODE_ENV == 'production' ? '/bs' : '',
  routes: [
    {
      path: '/',
      redirect:'/UnitOverviewMap',
      name: 'menu',
      component: menu,
      meta: {
        keepAlive:false
      },
      children: [
        //机泵
        {
          path: '/StartstopGraph',          //启停车
          name: 'StartstopGraph',
          component: StartstopGraph,
          meta: {
            keepAlive: false
          },

        },
        {
          path: '/SingleMultiBarValueChart',
          name: 'SingleMultiBarValueChart',
          component: SingleMultiBarValueChart,
          meta: {
            title: config.menu.SpecialManualOfPump.data._7name,
            keepAlive: true
          },

        },
        {
          path: '/UnitOverviewMap',
          name: 'UnitOverviewMap',
          component: UnitOverviewMap,
          meta: {
            title: config.menu.SpecialManualOfPump.data._1name,
            keepAlive: true
          },

        },
        {
          path:'/PumpImpactDiagnosis',
          name:'PumpImpactDiagnosis',
          component:PumpImpactDiagnosis,
          meta: {
            title: config.menu.SpecialManualOfPump.data._4name,
            keepAlive: true
          },
        },
        {
          path: '/RotorFaultDiagnosis',
          name: 'RotorFaultDiagnosis',
          component: SubclassFaultDiagnosis,
          meta: {
            title: config.menu.SpecialManualOfPump.data._5name,
            keepAlive: true
          },
        },
        {
          path: '/OrbitOfShaftCenter',
          name: 'OrbitOfShaftCenter',
          component: OrbitOfShaftCenter,
          meta: {
            title: config.menu.SpecialManualOfPump.data._9name,
            keepAlive: false
          },

        },
        {
          path: '/AlarmQueryGraph',
          name: 'AlarmQueryGraph',
          component: AlarmQueryGraph,
          meta: {
            title: config.menu.SpecialManualOfPump.data._2name,
            keepAlive: true
          },

        },
        {
          path: '/AnalysisGraph',
          name: 'AnalysisGraph',
          component: AnalysisGraph,
          meta: {
            title: config.menu.SpecialManualOfPump.data._14name,
            keepAlive: true
          },

        },
        {
          path: '/ComprehensiveAnalysis',
          name: 'ComprehensiveAnalysis',
          component: ComprehensiveAnalysis,
          meta: {
            keepAlive: false
          },
        },
        {
          path: '/RunStatusGraph',
          name: 'RunStatusGraph',
          component: RunStatusGraph,
          meta: {
            keepAlive: false
          },
        },
        {
          path: '/ChangeVisualization',
          name: 'ChangeVisualization',
          component: ChangeVisualization,
          meta: {
            keepAlive: false
          },
        },
        {
          path: '/RunSwordGraph',
          name: 'RunSwordGraph',
          component: RunSwordGraph,
          meta: {
            keepAlive: false
          },
        },
        {
          path: '/MultiParametersTrendGraph',
          name: 'MultiParametersTrendGraph',
          component: MultiParametersTrendGraph,
          meta: {
            keepAlive: false
          },
        },
        {
          path: '/OtherParametersTrendGraph',
          name: 'OtherParametersTrendGraph',
          component: OtherParametersTrendGraph,
          meta: {
            title: config.menu.SpecialManualOfPump.data._8name,
            keepAlive: true
          },
        },
        {
          path: '/VibrationMonitor',
          name: 'VibrationMonitor',
          component: VibrationMonitor,
          meta: {
            keepAlive: false
          },
        },
        {
          path: '/TrendAnalysis',
          name: 'TrendAnalysis',
          component: TrendAnalysis,
          meta: {
            title: config.menu.SpecialManualOfPump.data._3name,
            keepAlive: true
          },
        },
        {
          path: '/CepstrumGraph',
          name: 'CepstrumGraph',
          component: CepstrumGraph,
          meta: {
            title: config.menu.SpecialManualOfPump.data._6name,
            keepAlive: true
          },
        },

      ]
    }
  ]
})
