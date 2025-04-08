<template>
  <div class="time" ref="ui">

    <el-form-item :label="translateText('opPage.textMap.','模式选择:')" label-width="80px" :style="{height:'32px', marginBottom: '8px'}">
      <el-radio-group v-model="radio">
        <el-radio :label="1" :style="{color: mycolor}">{{ translateText('opPage.textMap.','实时') }}</el-radio>
        <el-radio :label="2" :style="{color: mycolor, margin: 0}" >{{ translateText('opPage.textMap.','历史') }}</el-radio>
      </el-radio-group>
    </el-form-item>

    <div v-if="radio === 1">

    </div>
    <div v-else  style="font-size: 14px">
      <el-form-item :label="translateText('opPage.textMap.','趋势类型:')" style="height:32px;margin-bottom: 8px">
        <el-select v-model="form.trend" size="mini"  style="width: 75%">
          <el-option
            v-for="(item, index) in options1"
            :key="item.value"
            :label="translateText('opPage.textMap.',item.value)"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <div v-if="form.trend === '前一阶段'">
        <el-form-item :label="translateText('opPage.textMap.','时间选择:')" style="height:32px;margin-bottom: 8px">
          <el-select v-model="form.stage" size="mini" style="width: 75%" :popper-class="'my-popper-class'">
            <el-option
              v-for="(item, index) in options2"
              :key="item.value"
              :label="translateText('opPage.textMap.',item.value)"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <div v-else-if="form.trend === '起止时间'">
        <el-form-item :label="translateText('opPage.textMap.','开始时间:')" style="height:32px;margin-bottom: 8px">
          <el-date-picker
            v-model="form.time.start"
            type="datetime"
            placeholder="选择日期时间"
            value-format="timestamp"
            style="width: 100%"
            :key="$i18n.locale"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="translateText('opPage.textMap.','结束时间:')" style="height:32px;margin-bottom: 8px">
          <el-date-picker
            v-model="form.time.end"
            type="datetime"
            placeholder="选择日期时间"
            value-format="timestamp"
            style="width: 100%"
            :key="$i18n.locale"
          >
          </el-date-picker>
        </el-form-item>
      </div>
      <div v-else-if="form.trend === '起止月'">
        <el-form-item :label="translateText('opPage.textMap.','选择年月:')" style="height:32px;margin-bottom: 8px">
          <el-date-picker
            v-model="form.month"
            type="month"
            size="mini"
            :format="translateText('opPage.textMap.','yyyy 年 MM 月')"
            value-format="yyyy-MM"
            :placeholder="translateText('opPage.textMap.','选择年月:')"
            style="width: 100%"
            :key="$i18n.locale"
          >
          </el-date-picker>
        </el-form-item>
      </div>
    </div>

  </div>
</template>
<script>
  import event from "../../assets/event";
  import AlarmTrendGraphVue from './AlarmTrendGraph.vue';
  import keepAliveMixin from "@/mixins/keepAliveMixin";
  import timeSelect from "@/mixins/opPage/timeSelect";
  export default {
    name: "RtHisTimeSelect",
    mixins: [keepAliveMixin, timeSelect],
    data() {
      return {
        // locale: en,
        handleDis: false,
        deletetime: 7*24*60*60*1000,
        mytime:{
          starttime:null,
          endtime:null
        },
        radio: 1,
        globalTimeRadio: false,
        options1: [
          {
            value: '前一阶段',
            label: '前一阶段'
          },
          {
            value: '起止时间',
            label: '起止时间'
          },
          {
            value: '起止月',
            label: '起止月'
          }],
        options2: [
          {
            value: '前5分钟',
            label: '前5分钟'
          }, {
            value: '前半小时',
            label: '前半小时'
          }, {
            value: '前1小时',
            label: '前1小时'
          }, {
            value: '前1天',
            label: '前1天'
          }, {
            value: '前1周',
            label: '前1周'
          }, {
            value: '前1月',
            label: '前1月'
          }, {
            value: '前1季度',
            label: '前1季度'
          }, {
            value: '前1年',
            label: '前1年'
          }],

        form: {
          trend: '前一阶段',
          time: {
            start: new Date().getTime() - 3600 * 1000 * 24 * 7,
            end: new Date().getTime(),
          },
          month: new Date().getFullYear().toString() + '-' + (new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1).toString(),
          stage: '前1周',
        },
        mycolor: '#ffffff',
      }

    },
    computed:{
      en() {
        return en
      },
      myselect(){
        return this.form.stage;
      },
      myradio() {
        return this.radio;
      },
      topiccolor() {
        return this.$store.state.topiccolor;
      },
      globalTimeBegin(){
        return this.$store.state.globalTimeBegin;
      },
      globalTimeEnd(){
        return this.$store.state.globalTimeEnd;
      }
    },
    watch: {
      myradio() {
        if(!this.activatedFlag) return ;
        this.$store.state.gongyiOverviewIframeHistoryTime = null;
        this.$emit('radiostatus', this.radio)
      },

      myselect(){
        if(!this.activatedFlag) return ;
        var mystatus = this.form.stage
        if(mystatus == '前5分钟') {
          this.deletetime = 5 * 60 * 1000
        }
        else if(mystatus == '前半小时') {
          this.deletetime = 30 * 60 * 1000
        }
        else if(mystatus ==  '前1小时') {
          this.deletetime = 60 * 60 * 1000
        }
        else if(mystatus ==  '前1天') {
          this.deletetime = 24 * 60 * 60 * 1000
        }
        else if(mystatus ==  '前1周') {
          this.deletetime = 7 * 24 * 60 * 60 * 1000
        }
        else if(mystatus ==  '前1月') {
          this.deletetime = 30 * 24 * 60 * 60 * 1000
        }
        else if(mystatus ==  '前1季度') {
          this.deletetime = 90 * 24 * 60 * 60 * 1000
        }
        else if(mystatus ==  '前1年') {
          this.deletetime = 365 * 24 * 60 * 60 * 1000
        }
      },
      topiccolor(val) {
        this.mycolor = this.$store.state.textcolor;
        this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
        this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
        this.$refs.ui.style.setProperty('--labelcolor', this.$store.state.labelcolor);
        this.$refs.ui.style.setProperty('--treeinputbgcolor', this.$store.state.treeinputbgcolor);
      }
    },
    methods: {
      timedata() {
        if (this.radio == 1) {
          return {model: '实时' , form: this.mytime}

        }
        else {
          var nowTrend = '';
          if(this.form.trend == '前一阶段') {
            nowTrend = '前一阶段';

            var thistime = new Date().getTime();
            this.mytime.starttime = thistime - this.deletetime;

            this.mytime.endtime = thistime
          }
          else if(this.form.trend == '起止月'){
            // console.log('时间选择',this.form);
            nowTrend = '起止月';
            var monthnum = 0;
            var yearnum = 0;
            for(var i = 0; i < 4; ++i) {
              yearnum *= 10
              yearnum += this.form.month[i] - '0'
            }
            // console.log('happen->yearnum', yearnum)

            var mydate=new Date(this.form.month.replace(/-/g, '/'));
            var nowtime = new Date(mydate).getTime();
            // console.log('开始时间', mydate, nowtime);
            this.mytime.starttime = nowtime;
            // console.log('happen->startTime', new Date(mydate))
            monthnum = (this.form.month[5] - '0') * 10 +  (this.form.month[6] - '0')
            // console.log(monthnum);
            if(monthnum == 12) {
              yearnum += 1
              monthnum = 1
            } else {
              monthnum += 1
            }

            if(monthnum < 10) {
              monthnum = '0' + monthnum.toString()
            } else {
              monthnum = monthnum.toString()
            }

            // console.log('happen->yearnum monthnum', yearnum, monthnum)

            yearnum = yearnum.toString()
            mydate = yearnum + '-' + monthnum + '-01 00:00:00'
            // console.log(mydate)
            mydate=new Date(mydate.replace(/-/g, '/'));
            nowtime = new Date(mydate).getTime() - 1;

            this.mytime.endtime = nowtime;
            // console.log('时间类型', monthnum, typeof(monthnum), new Date().getMonth() + 1, typeof(new Date().getMonth() + 1));
            if (this.form.month[5] == '0') {
              if (this.form.month[6] - '0' == new Date().getMonth() + 1 && new Date().getFullYear() == yearnum) {
                this.mytime.endtime = new Date().getTime();
                // console.log('happen->到现在的时间', new Date().getFullYear() == yearnum, new Date().getFullYear())
              }
            } else {
              if ((this.form.month[5] - '0') * 10 +  (this.form.month[6] - '0') == new Date().getMonth() + 1  && new Date().getFullYear() == yearnum) {
                this.mytime.endtime = new Date().getTime();
                // console.log('happen->到现在的时间', new Date().getFullYear() == yearnum, new Date().getFullYear())

              }
            }
            // if (monthnum == new Date().getMonth() + 1) {
            //   this.mytime.endtime = new Date().getTime();
            // }
          }
          else {
            nowTrend = '起止时间';
            this.mytime.starttime = this.form.time.start;
            this.mytime.endtime = this.form.time.end;
          }
          if(this.mytime.starttime <=  this.mytime.endtime) {
            this.$store.state.startTime = this.mytime.starttime;
            this.$store.state.endTime = this.mytime.endtime;
            console.log('更新时间', this.$store.state.startTime);
            return {model: '历史' , trend: nowTrend, form: this.mytime}
          } else {
            this.$alert('请确保开始时间早于终止时间', '时间选择错误', {
              confirmButtonText: '确定',
              callback: action => {

              }
            });
          }
        }
      },
    },
    created() {
      // 柴油机 扶梯 无线机泵暂时默认实时 radio = 1
      // /DieselMonitorSystem
      // /Escalator
      // /WirelessPumpGraph
      if(this.$route.path.indexOf('/DieselMonitorSystem') !== -1 || this.$route.path.indexOf('/Escalator') !== -1 || this.$route.path.indexOf('/WirelessPumpGraph') !== -1) {
        this.radio = 1
      } else {
        this.radio = 2
      }

      // console.log("happen->timeRadio", this.$store.state.timeRadio)
      this.radio = parseInt(this.$store.state.timeRadio); // 根据路由的url来判断到底是历史还是实时

    },
    mounted() {
      this.mycolor = this.$store.state.textcolor;
      this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
      this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
      this.$refs.ui.style.setProperty('--labelcolor', this.$store.state.labelcolor);
      this.$refs.ui.style.setProperty('--treeinputbgcolor', this.$store.state.treeinputbgcolor);
      if(this.$route.path.indexOf("RotatingMachineryGraph/WholeSpectrumGraph") != -1) {
        this.handleDis = true;
      } else {
        this.handleDis = false;
      }
    }
  }
</script>

<style lang="scss">
.time{
  --leftconbgcolor: #303749;
  --textcolor: #ffffff;
  --labelcolor: #696B6F;
  --treeinputbgcolor: #ffffff;
  .el-select-dropdown {
    height: 20px;
  }
  .el-row {

    background-color: var(--leftconbgcolor);
    height: 100%;
    width: 258px;
    color: var(--textcolor);
    padding-left: 0;
    margin-left: 8px;
    margin-bottom: 10px;
    .el-radio-group {
      margin: 0;
    }
    .el-date-editor {
      width: 68%;
    }
    .el-select {
      .el-input {
        .el-input__inner {
          width: 133%
        }
      }
    }
    .el-input__inner {
      background-color: var(--treeinputbgcolor);
      color: var(--labelcolor);
      // border: red solid 1px;
      border: var(--labelcolor);
    }

  }
  .el-form-item {
    .el-radio:first-child {
      margin-right: 20px;
    }
    .el-form-item__content {
      .el-select {
        .el-input {
          // border: red solid 1px;
          width: 133%;
        }
      }
      .el-date-editor{
        .el-input__inner{
          font-size: 14px;
        }
      }
      .el-radio__label {
        font-size: 14px;
        color: var(--textcolor);
      }
      .el-input__inner {

      }
    }
  }
  .el-time-panel {
    width: 150px;
  }
}
.el-scrollbar__wrap {
  max-height: 400px!important;
}
</style>
<script setup lang="ts">
</script>
