/**
 * keepAlive的公共生命周期函数
 * activated: 在打开页面且为实时状态下打开定时器
 * deactivated: 在离开页面时清除定时器
 */

const keepAliveMixin = {
  data() {
    return {
      activatedFlag: false
    }
  },

  mounted () {
    this.activatedFlag = true;
  },
  activated() {
    // console.log('activated');
    this.activatedFlag = true;
    if(this.nowstatus && this.nowstatus == 1) {
      if(typeof this.$options.methods['startall'] !== 'undefined') {
        this.startall();
      } else {
        this.startinterval();
      }
    }
  },
  deactivated() {
    // console.log('deactivated', this.myinterval);
    this.activatedFlag = false;
    if(this.myinterval) {
      clearInterval(this.myinterval);
    }

    if (this.myinterval1) {
      clearInterval(this.myinterval1);
    }
    if (this.myinterval2) {
      clearInterval(this.myinterval2);
    }
  },

}

export default keepAliveMixin
