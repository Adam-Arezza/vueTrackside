<template>
  <div class="driverList">
    <p v-if="competitors.length > 0">
      <strong>Select a driver from the dropdown</strong>
    </p>
    <select v-model="selectedDriver" id="selector" v-if="competitors.length > 2">
      <option
        id="drivers"
        v-for="(competitor, index) in competitors"
        :key="index"
        :disabled="completed(competitor)"
      >
        Car#: {{competitor.Car}}
        Driver: {{competitor.Name}}
      </option>
    </select>
  </div>
</template>
<script>
//handles the dropdown list for staging drivers
export default {
  data() {
    return {
      selectedDriver: ""
    };
  },
  methods: {
    completed(driver) {
      var i = 0;
      var doneRun = [];
      if (driver.Runs) {
        var runs = driver.Runs;
        // console.log(runs)
        if (runs.length >= this.runCount) {
          return true;
        }
      }
      for (i = 0; i < this.$store.state.liveRun.length; i++) {
        doneRun.push(this.$store.state.liveRun[i].Car);
      }
      if (doneRun.includes(driver.Car)) {
        return true;
      } else {
        return false;
      }
    }
  },
  computed: {
    competitors() {
      return this.$store.state.competitors;
    }
  },
  watch: {
    selectedDriver: function() {
      var driver = this.selectedDriver;
      console.log("The selected driver is: ", driver);
      this.$emit("selected", driver);
    }
  }
};
</script>
<style scoped>
p {
  padding: 10px;
}
#selector {
  min-height: 40px;
  margin: 10px;
  width: 80%;
}
option {
  font-size: 1.2em;
}
</style>
