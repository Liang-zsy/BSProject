/*
使用全局时间功能，和使用细化时间功能
 */

import event from "@/assets/event";
import {mapMutations, mapState} from "vuex";

const timeSelect = {
  data() {
    return {
      useBruchTimeState: false
    }
  },
  mounted() {
    this.form.trend = this.globalTimeTrend
    this.form.stage = this.globalTimeStage
    this.form.time.start = this.globalTimeBegin
    this.form.time.end = this.globalTimeEnd
    this.form.month = this.globalTimeMonth
  },
  activated() {
    event.$on('updateBruchTimeState', this.updateBruchTimeState);
  },
  deactivated() {
    event.$off('updateBruchTimeState', this.updateBruchTimeState);
  },
  created() {
    event.$on('updateBruchTimeState', this.updateBruchTimeState);
  },
  beforeDestroy() {
    event.$off('updateBruchTimeState', this.updateBruchTimeState);
  },
  computed:{
    ...mapState([
      'globalTimeTrend',
      'globalTimeStage',
      'globalTimeBegin',
      'globalTimeEnd',
      'globalTimeMonth',
      'useBruchTimeBegin',
      'useBruchTimeEnd',
    ])
  },
  watch: {
    useBruchTimeState(val){
      if(!this.activatedFlag) return ;
      if(val && this.$store.state.useBruchTimeBegin && this.$store.state.useBruchTimeEnd) { // 点击了使用细化时间按钮
        this.form.trend = '起止时间'
        this.form.time.start = this.$store.state.useBruchTimeBegin
        this.form.time.end = this.$store.state.useBruchTimeEnd
      }
    },
    useBruchTimeBegin(val) {
      if(!this.activatedFlag) return ;
      if(this.useBruchTimeState && this.$store.state.useBruchTimeBegin && this.$store.state.useBruchTimeEnd) {
        this.form.trend = '起止时间'
        this.form.time.start = this.$store.state.useBruchTimeBegin
        this.form.time.end = this.$store.state.useBruchTimeEnd
      }
    },
    useBruchTimeEnd(val) {
      if(!this.activatedFlag) return ;
      if(this.useBruchTimeState && this.$store.state.useBruchTimeBegin && this.$store.state.useBruchTimeEnd) {
        this.form.trend = '起止时间'
        this.form.time.start = this.$store.state.useBruchTimeBegin
        this.form.time.end = this.$store.state.useBruchTimeEnd
      }
    },
    globalTimeTrend (newVal){
      this.form.trend = this.globalTimeTrend
    },
    globalTimeStage () {
      this.form.stage = this.globalTimeStage
    },
    globalTimeBegin (newVal) {
      this.form.time.start = this.globalTimeBegin
    },
    globalTimeEnd (newVal) {
      this.form.time.end = this.globalTimeEnd
    },
    globalTimeMonth(newVal){
      this.form.month = this.globalTimeMonth
    },
    'form.trend'(newVal) {
      this.setGlobalTimeTrend(newVal)
    },
    'form.stage'(newVal) {
      this.setGlobalTimeStage(newVal)
    },
    'form.time.start' (newVal) {
      this.setGlobalTimeBegin(newVal)
    },
    'form.time.end'(newVal) {
      this.setGlobalTimeEnd(newVal)
    },
    'form.month'(newVal) {
      this.setGlobalTimeMonth(newVal)
    },
  },
  methods: {
    ...mapMutations([
      'setGlobalTimeTrend',
      'setGlobalTimeStage',
      'setGlobalTimeBegin',
      'setGlobalTimeEnd',
      'setGlobalTimeMonth',
    ]),
    updateBruchTimeState(data) {
      this.useBruchTimeState = data;
    },
  }
};

export default timeSelect;
