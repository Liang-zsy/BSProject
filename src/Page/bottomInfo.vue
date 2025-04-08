<template>
  <div class = 'bottom-info'>
    <div ref = 'unitName' class = "quarter">{{unitName}}</div>
    <div ref = 'equipmentName' class = "quarter">{{getequName}}-->{{'正常'}}</div>
    <div ref = 'interfaceId' class = "quarter">{{interfaceId}}</div>
    <div ref = 'netInfo' class = "quarter">{{netInfo}}</div>
  </div>
</template>

<script>
export default {
  name: "bottomInfo",
  props:['UnitName'],
  data(){
    return {
      unitName : this.UnitName,
      netInfo:'数据获取失败',
      equipmentName: '旋转设备->正常',
      interfaceId: 'TCP[装置级服务器]',
      equipmentNameStatus:'',
      equStatus : '正常'
    }
  },
  computed: {
    equname() {
      return  this.equipmentName;
    },
    getequName() {
      return this.$store.state.equName;
    }
  },
  watch: {
    equname() {
      this.equipmentNameStatus = this.equipmentName + '->' +  this.equStatus;
    }

  },
  methods:{
    setequname(name) {
      this.equipmentName = name;
    },
    changename(name) {
      this.unitName = name;
    },
    datasuccess() {
      this.netInfo = '数据获取成功';
    },
    dataloading() {
      this.netInfo = '数据获取中...';
    },
    datafail() {
      this.netInfo = '数据获取失败';
    }
  }
}
</script>

<style lang="scss">
.el-footer{
  background-color: #2c3242;
  color: white;
  padding: 0 0px;
}
.bottom-info {
  background: #F7F7F7;
  width: 100%;
  height: 100%;
}
.quarter {
  background-color: #2c3242;
  float: left;
  font-size: 12px;
  border-right:1px solid black;
  width: calc(25% - 1px);
  height: 100%;
  text-align:center;
}


</style>
