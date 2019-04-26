<template>
  <div class="main">
    <div class="row no-gutters">
      <div class="col-sm-3">
        <select v-model="selectedDriver" id="selector" v-if="competitors.length > 2">
          <option id="drivers" v-for="(competitor, index) in competitors" :key="index" :disabled="completed(competitor)">
            Car#: {{competitor.Car}}
            Driver: {{competitor.Name}}
          </option>
        </select>
      </div>
      <div class="col-sm-9">
        <runTable
          :competitors="competitors"
          :liveRun="currentRun"
          :selectedDriver="selectedDriver"
          :allDoneRun="allRunsCompleted"
        ></runTable>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import runTable from "../components/runTable.vue";

export default {
  components: { runTable },
  data() {
    return {
      selectedDriver: ""
    };
  },
  methods: {
    completed(driver){
     var i = 0
     var doneRun = []
     var runCount = "run" + this.$store.state.runCount.toString()
     if(driver.Runs){
       var runs = driver.Runs
       var runKeys = Object.keys(runs)
       if(runKeys.includes(runCount)){
          return true
     }
     }
     for(i = 0; i < this.$store.state.liveRun.length; i++){
       doneRun.push(this.$store.state.liveRun[i].Car)
     }
     if(doneRun.includes(driver.Car)){
       return true
     }
     else {
       return false
     }
    }
  },
  computed: {
    competitors(){
      return this.$store.state.competitors
    },
    allRunsCompleted(){
      if(this.competitors.length == this.$store.state.liveRun.length){
        return true
      }
      else{
        return false
      }
    },
    currentRun(){
      return this.$store.state.liveRun
    }
  }
};
</script>

<style>
#selector {
  min-height: 40px;
  margin: 10px;
  width: 80%;
}
option {
  font-size: 1.2em;
  
}
</style>

