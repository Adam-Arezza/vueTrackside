<template>
  <div id="app">
    <topNav></topNav>
    <arduinoSerial></arduinoSerial>
    <router-view></router-view>
  </div>
</template>
<script>
//imports the navigation bar component
import topNav from "./components/topNav.vue";
import arduinoSerial from "./components/arduinoSerial.vue"

export default {
  components: { topNav, arduinoSerial },
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
