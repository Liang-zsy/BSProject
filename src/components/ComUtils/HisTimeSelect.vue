<!--
HisTimeSelect组件使用说明：
1. 将HisTimeSelect引入你的组件，并打上ref，比如：<his-time-select ref="timeset"></his-time-select>
2. 通过调用HisTimeSelect的timedata()函数来获取时间戳，比如可以定义一个按钮点击事件：
onSubmit() {
      console.log(this.$refs.timeset.timedata());
}
3. timedata()函数返回值为json对象，格式为：
{
    model: "",
    trend: "",
    form: {
        starttime:
        endtime:
    }
}
这其中，model表示当前模式是历史模式，trend表示当前时间趋势模式
form表示时间戳，starttime表示开始时间，endtime表示结束时间
-->

<template>
  <div style="font-size: 14px" class="hisTimeSelect" ref="ui">
    <el-form-item :label="translateText('opPage.textMap.','趋势类型:')" style="height: 32px; margin-bottom: 8px">
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
      <el-form-item :label="translateText('opPage.textMap.','时间选择:')" style="height: 32px;margin-bottom: 8px">
        <el-select v-model="form.stage" size="mini" style="width: 75%">
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
          :key="$i18n.locale"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item :label="translateText('opPage.textMap.','结束时间:')" style="height:32px;margin-bottom: 8px">
        <el-date-picker
          v-model="form.time.end"
          type="datetime"
          placeholder="选择日期时间"
          value-format="timestamp"
          :key="$i18n.locale"
          style="width: 100%">
        </el-date-picker>
      </el-form-item>
    </div>
    <div v-else-if="form.trend === '起止月'" style="height:32px;margin-bottom: 8px">
      <el-form-item :label="translateText('opPage.textMap.','选择年月:')">
        <el-date-picker
          v-model="form.month"
          type="month"
          style="width: 100%"
          :format="translateText('opPage.textMap.','yyyy 年 MM 月')"
          value-format="yyyy-MM"
          :key="$i18n.locale"
          :placeholder="translateText('opPage.textMap.','选择年月:')">
        </el-date-picker>
      </el-form-item>
    </div>
  </div>

</template>

<script>
import keepAliveMixin from "@/mixins/keepAliveMixin";
import timeSelect from "@/mixins/opPage/timeSelect";

export default {
  mixins: [keepAliveMixin, timeSelect],
  name: "HisTimeSelect",
  data() {

    return {
      deletetime:  30 * 24 * 60 * 60 * 1000,
      mytime:{
        starttime:null,
        endtime:null
      },
      options1: [{
        value: '前一阶段',
        label: '前一阶段'
      }, {
        value: '起止时间',
        label: '起止时间'
      }, {
        value: '起止月',
        label: '起止月'
      }],
      options2: [{
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
        stage: '前1月',
      },
      mycolor: '#ffffff',
    }
  },
  computed:{
    myselect(){
      return this.form.stage;
    },
    mypointId() {
      return this.$store.state.mypointId;
    },
    globalTimeBegin(){
      return this.$store.state.globalTimeBegin;
    },
    globalTimeEnd(){
      return this.$store.state.globalTimeEnd;
    },
    topiccolor(val) {
      return this.$store.state.topiccolor;
    }
  },
  watch: {
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
    },
  },
  methods: {
    timedata() {
      var nowTrend = '';
      if(this.$store.state.alarmStartTime) {
        this.form.trend = '起止时间';
        let mystime = new Date(this.$store.state.alarmStartTime)
        let myetime = new Date(this.$store.state.alarmEndTime)
        this.form.time.start = mystime.getTime() - 24 * 60 * 60 * 1000;
        this.form.time.end = mystime.getTime() + 24 * 60 * 60 * 1000;
        this.$store.state.alarmStartTime = ''
        this.$store.state.alarmEndTime = ''
      }
      if(this.form.trend == '前一阶段') {
        nowTrend = '前一阶段';
        var thistime = new Date().getTime();
        this.mytime.starttime = thistime - this.deletetime;

        this.mytime.endtime = thistime
      }
      else if(this.form.trend == '起止月'){
        nowTrend = '起止月';
        var monthnum = 0;
        var yearnum = 0;
        for(var i = 0; i < 4; ++i) {
          yearnum *= 10
          yearnum += this.form.month[i] - '0'
        }
        console.log(this.form.month);
        var mydate=new Date(this.form.month.replace(/-/g, '/'));
        var nowtime = new Date(mydate).getTime();

        this.mytime.starttime = nowtime;
        monthnum = (this.form.month[5] - '0') * 10 +  (this.form.month[6] - '0')
        if(monthnum == 12) {
          yearnum += 1
          monthnum = 1
        }
        else {
          monthnum += 1
        }
        if(monthnum < 10) {
          monthnum = '0' + monthnum.toString()
        }
        else {
          monthnum = monthnum.toString()
        }
        yearnum = yearnum.toString()
        mydate = yearnum + '-' + monthnum + '-01 00:00:00'
        //console.log(mydate)
        mydate=new Date(mydate.replace(/-/g, '/'));
        nowtime = new Date(mydate).getTime() - 1;

        this.mytime.endtime = nowtime;
        if (this.form.month[5] == '0') {
          if (this.form.month[6] - '0' == new Date().getMonth() + 1 && new Date().getFullYear() == yearnum) {
            this.mytime.endtime = new Date().getTime();
          }
        } else {
          if ((this.form.month[5] - '0') * 10 +  (this.form.month[6] - '0') == new Date().getMonth() + 1 && new Date().getFullYear() == yearnum) {
            this.mytime.endtime = new Date().getTime();
          }
        }
      }
      else {
        nowTrend = '起止时间';
        this.mytime.starttime = this.form.time.start;
        this.mytime.endtime = this.form.time.end;
      }

      // console.log(this.mytime);
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
    },
  },
  mounted() {
    this.mycolor = this.$store.state.textcolor;
    this.$refs.ui.style.setProperty('--textcolor', this.$store.state.textcolor);
    this.$refs.ui.style.setProperty('--leftconbgcolor', this.$store.state.leftconbgcolor);
    this.$refs.ui.style.setProperty('--labelcolor', this.$store.state.labelcolor);
    this.$refs.ui.style.setProperty('--treeinputbgcolor', this.$store.state.treeinputbgcolor);
    // console.log(this.form);

  }
}
</script>

<style lang="scss">
.el-scrollbar__wrap {
  max-height: 400px!important;
}
.hisTimeSelect {
  --leftconbgcolor: #303749;
  --textcolor: #ffffff;
  --labelcolor: #696B6F;
  --treeinputbgcolor: #ffffff;
  .el-date-editor .el-input__prefix {
    display: none; /* 隐藏图标 */
  }
  .el-date-editor .el-input__inner {
    padding-left: 15px; /* 如果图标在左边 */
  }
  .el-select-dropdown {
    height: 20px;
    // height: 100%;
  }
  .el-row {
    background-color: var(--leftconbgcolor);
    height: 100%;
    width: 258px;
    color: white;
    padding-left: 0;
    margin-left: 8px;
    margin-bottom: 10px;
    .el-radio-group{
      margin: 0;
    }
    .el-date-editor {
      width: 68%;
    }
    .el-select {
      .el-input {
        .el-input__inner {
          // border: red solid 1px;
          width: 133%;
        }
      }
    }
    .el-input__inner{
      background-color: var(--treeinputbgcolor);
      color: var(--labelcolor);
      border: var(--labelcolor);
    }
    /*box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);*/
    /*border: 0.5px solid #dcdfe6;*/
  }
  .el-time-panel {
    width: 150px;
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
      .el-radio__label{
        font-size: 14px;
        color: var(--textcolor);
      }
    }
  }

  .mycolor, .el-radio__label {
    color: var(--textcolor);
  }
}

</style>

