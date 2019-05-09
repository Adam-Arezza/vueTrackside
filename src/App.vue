<template>
  <div id="app">
    <topNav></topNav>
    <router-view></router-view>
  </div>
</template>
<script>
import topNav from "./components/topNav.vue";

export default {
  components: { topNav },
  data() {
    return {};
  }
};
</script>

<style>
#app {
  color: black;
}
</style>
