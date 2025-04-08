// numberUtilsMixin.js
export const numberUtilsMixin = {
  methods: {

    // 向下取整到 0 或 数量级
    roundDown(min, max) {
      if (this.graphType == '波形图' && (this.$route.path.indexOf('PumpImpactDiagnosis') != -1 || this.$route.path.indexOf('ImpactDiagnosis') != -1 || this.$route.path.indexOf('WirelessPumpImpactDiagnosis') != -1)) {
        return 0
      }
      if (min >= 0) return 0
      min = parseFloat(min) * 1.1
      // 计算数量级
      const precision = Math.pow(10, Math.floor(Math.log10(Math.abs(min))))
      let minLabel = Math.floor(min / precision) * precision
      return minLabel % 1 == 0 ? minLabel : minLabel.toFixed(1)
    },

    // 向上取整到数量级
    roundUp(min, max) {
      if (max == 0 && min == 0) return 1
      else if (max == 0 && min <= 0) return 0
      max = max >= 0 ? parseFloat(max) * 1.1 : parseFloat(max) * 0.9
      // 计算数量级
      const precision = Math.pow(10, Math.floor(Math.log10(Math.abs(max))))
      let maxLabel = Math.ceil(max / precision) * precision
      return maxLabel % 1 == 0 ? maxLabel : maxLabel.toFixed(1)
    },

  }
}
