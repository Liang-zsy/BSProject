<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app,body,html{
  padding:0;
  margin:0;
  height:100%;
  overflow: hidden;
}
#app::-webkit-scrollbar{
  display:none;
}/*隐藏滚动条*/
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
