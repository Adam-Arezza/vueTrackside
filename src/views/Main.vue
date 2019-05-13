<template>
  <div class="main">
    <div class="row no-gutters">
      <div class="col-sm-3">
        <driver-list @selected="getDriver"></driver-list>
      </div>
      <div class="col-sm-9">
        <runTable :liveRun="currentRun" :selectedDriver="driver" :allDoneRun="allRunsCompleted"></runTable>
      </div>
    </div>
  </div>
</template>

<script>
//imports the runtable and driverlist components
import runTable from "../components/runTable.vue";
import driverList from "../components/driversList.vue";

export default {
  components: { runTable, driverList },
  data() {
    return {
      driver: ""
    };
  },
  methods: {
    //sends the runtable component the driver selected from the driverlist dropdown
    getDriver(driver) {
      console.log(driver);
      return (this.driver = driver);
    }
  },
  computed: {
    //returns the competitor info from the store
    competitors() {
      return this.$store.state.competitors;
    },
    //checks if all competitors have completed the current run
    allRunsCompleted() {
      if (
        this.competitors.length > 0 &&
        this.competitors.length == this.$store.state.liveRun.length
      ) {
        return true;
      } else {
        return false;
      }
    },
    //returns the runs for the runtable from the store
    currentRun() {
      return this.$store.state.liveRun;
    },
    //returns the current run # from the store
    runCount() {
      return this.$store.state.runCount;
    }
  }
};
</script>

<style>
</style>
