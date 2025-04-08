<!--  隐藏操作页按钮  -->
<template>
  <div class="op-hide" >
    <div v-if="showOpPage" @click="showOrHide" class="op-btn">
      <svg class="op-btn-svg" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;" width="10px" height="66px" viewBox="0 0 10 66" fill="none">
        <path d="M10 66L0 58L0 8L10 0L10 66Z" :fill="$store.state.leftconbgcolor"/>
      </svg>
      <svg class="op-btn-svg" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;" width="10px" height="10px" viewBox="0 0 10 10" fill="none">
        <path d="M7.83147 4.71901L2.80022 0.789324C2.78708 0.778974 2.77128 0.772542 2.75464 0.770766C2.738 0.76899 2.7212 0.771944 2.70617 0.779286C2.69113 0.786629 2.67847 0.798063 2.66964 0.812276C2.66081 0.826489 2.65617 0.842904 2.65625 0.859636V1.72236C2.65625 1.77705 2.68192 1.8295 2.72433 1.86298L6.74219 5.00026L2.72433 8.13754C2.6808 8.17102 2.65625 8.22348 2.65625 8.27816V9.14089C2.65625 9.21566 2.74219 9.25696 2.80022 9.2112L7.83147 5.28151C7.87424 5.24816 7.90883 5.20549 7.93262 5.15675C7.95642 5.10802 7.96878 5.0545 7.96878 5.00026C7.96878 4.94603 7.95642 4.89251 7.93262 4.84377C7.90883 4.79504 7.87424 4.75237 7.83147 4.71901Z" :fill="$store.state.textcolor" fill-opacity="0.85"/>
      </svg>
    </div>
    <div v-else @click="showOrHide" class="op-btn">
      <svg class="op-btn-svg" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;" width="10px" height="66px" viewBox="0 0 10 66" fill="none">
        <path d="M10 66L0 58L0 8L10 0L10 66Z" :fill="$store.state.leftconbgcolor"/>
      </svg>
      <svg class="op-btn-svg" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M7.36623 1.72184V0.85912C7.36623 0.784343 7.28029 0.743048 7.22225 0.788807L2.191 4.71849C2.14826 4.75174 2.11367 4.79431 2.08987 4.84295C2.06608 4.8916 2.05371 4.94503 2.05371 4.99919C2.05371 5.05334 2.06608 5.10678 2.08987 5.15542C2.11367 5.20407 2.14826 5.24663 2.191 5.27988L7.22225 9.20957C7.28141 9.25533 7.36623 9.21403 7.36623 9.13925V8.27653C7.36623 8.22184 7.34056 8.16939 7.29815 8.13591L3.28029 4.99974L7.29815 1.86247C7.34056 1.82899 7.36623 1.77653 7.36623 1.72184Z" :fill="$store.state.textcolor" fill-opacity="0.85"/>
      </svg>
    </div>
  </div>

</template>

<script>

import event from "@/assets/event";

export default {
  name: "OpHideButton",
  props: ['showOpPage'],
  methods: {
    showOrHide() { // 执行隐藏or展开操作页
      // 设置右侧操作栏的宽度， showOpPage在setflagopright进行修改
      if (this.showOpPage == true) {
        event.$emit('setOpPage', false);
        this.$emit('updateShowOpPage', false);
        this.$store.commit('setflagopright', false);
        this.$store.commit('setmarginleftvalue', '10%');
      } else {
        event.$emit('setOpPage', true);
        this.$emit('updateShowOpPage', true);
        this.$store.commit('setflagopright', true);
      }
    },
  }
}
</script>

<style lang="scss">
.op-hide {
  height: 100%;
  width: 10px;
  margin-top: 10px;
  background-color: var(--conbgcolor);
  display: flex;
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
    width: 20px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--leftconbgcolor);
    color: var(--buttoncolor);
    position: absolute;
    cursor: pointer;
  }
}
</style>
