<template>
  <div class="main">
    <span v-if="eventNumber"> Event: {{eventNumber}}</span>
    <span v-if="eventNumber"> {{today}}</span>
    <div class="row no-gutters">
      <div class="col-sm-3">
        <driver-list @selected="getDriver"></driver-list>
      </div>
      <div class="col-sm-9">
        <runTable :liveRun="currentRun" :selectedDriver="driver" :allDoneRun="allRunsCompleted"></runTable>
      </div>
    </div>
    <b-container class="eventNumber" v-if="!eventNumber">
      <b-row align-v="center" align-h="center">
        <b-col md="8">
        <p> Assign an event number to this event</p>
        <p>All data from todays session will be saved under the assigned event number</p>
        </b-col>
      </b-row>
      <b-row align-h="center">
        <b-col md="5">
          <b-button-group>
            <b-button class="eventBtns" v-for="(b, index) in eventBtns" :key="index" @click="assignEvent(b)" variant="success" size="lg">
              {{b}}
            </b-button>
          </b-button-group>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
//imports the runtable and driverlist components
import runTable from "../components/runTable.vue";
import driverList from "../components/driversList.vue";
import { join } from 'path';

export default {
  components: { runTable, driverList },
  data() {
    return {
      driver: "",
      eventBtns: [1,2,3,4,5,6]
    };
  },
  methods: {
    //sends the runtable component the driver selected from the driverlist dropdown
    getDriver(driver) {
      console.log(driver);
      return (this.driver = driver);
    },
    assignEvent(num) {
      this.$store.state.eventNumber = num
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
    },
    eventNumber() {
      return this.$store.state.eventNumber
    },
    today() {
      let today = new Date()
      let month = today.getMonth()
      let day = today.getDay()
      let yr = today.getFullYear()

      return today
    }
  }
};
</script>

<style>
.eventNumber {
  padding: 50px;
}
.eventNumber p {
  font-size: 1.25em;
}
.eventBtns {
  margin: 10px;
}
</style>
