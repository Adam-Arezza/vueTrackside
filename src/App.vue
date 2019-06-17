<template>
  <div id="app">
    <topNav></topNav>
    <arduinoSerial></arduinoSerial>
    <router-view></router-view>
  </div>
</template>
<script>
//imports the navigation bar component
//imports the arduinoSerial component
import topNav from "./components/topNav.vue";
import arduinoSerial from "./components/arduinoSerial.vue";
import axios from "axios";

export default {
  components: { topNav, arduinoSerial },
  data() {
    return {};
  },
  computed: {
    liveRuns() {
      return this.$store.state.liveRun;
    },
    modRun() {
      return this.$store.state.modRun
    }
  },
  watch: {
    liveRuns: {
      handler: function() {
        if (this.modRun != undefined) {
          var runToModify = this.modRun
          console.log("the run to modify is: ")
          console.log(runToModify)
          axios
            .put(
              "http://192.168.0.17:3000/runs/" +
                runToModify.Car +
                "/" +
                runToModify.runNum,
              runToModify
            )
            .then(response => {
              console.log(response);
            })
            .catch(err => {
              console.log(err);
            });
            this.$store.state.modRun = undefined

        } else{
          axios
          .post(
            "http://192.168.0.17:3000/runs",
            this.liveRuns[this.liveRuns.length - 1]
          )
          .then(response => {
            console.log(response);
          })
          .catch(err => {
            console.log(err);
          });
        }
      },
      deep: true
    }
  }
};
</script>

<style>
#app {
  color: black;
}
</style>
