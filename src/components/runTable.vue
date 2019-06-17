<template>
  <div class="runTable">
    <b-button class="runBtn" size="lg" @click="stageDriver()">Stage</b-button>
    <b-button class="runBtn" size="lg" @click="gateTriggered(0)">Start</b-button>
    <b-button class="runBtn" size="lg" @click="gateTriggered(1)">G1</b-button>
    <b-button class="runBtn" size="lg" @click="gateTriggered(2)">G2</b-button>
    <b-button class="runBtn" size="lg" @click="gateTriggered(3)">G3</b-button>
    <b-button class="runBtn" size="lg" @click="gateTriggered(4)">End</b-button>
    <b-button class="runBtn" size="lg" @click="newRun()">Run Complete</b-button>
    <div>
      <!-- <button v-b-modal.penalty> 0">Penalties</button> -->
      <b-modal ref="penaltyModal" id="penalty">
        <button @click="handlePenalties('add')">Add 1 Cone Penalty</button>
        <button @click="handlePenalties('sub')">Remove 1 Cone Penalty</button>
        <button @click="dnf">DNF</button>
      </b-modal>
    </div>
    <div v-if="Object.keys(getGates).length == 0" class="container-fluid gatesSetup">
      <p>Select the total number of gates for the session including start and finish gates.</p>
      <b-row no-gutters>
        <b-col md="8">
          <b-form-group>
            <b-form-radio-group v-model="selectedGates" :options="options"></b-form-radio-group>
          </b-form-group>
          <p>Number of gates: {{selectedGates}}</p>
          <b-button @click="generateGates()" size="lg">Set</b-button>
        </b-col>
      </b-row>
    </div>
    <div v-if="Object.keys(getGates).length > 1" class="row no-gutters">
      <h3>Run{{runCount}}</h3>
      <b-table
        selectable
        hover
        :select-mode="single"
        striped
        :fields="fields"
        :items="liveRun"
        small
        @row-selected="rowSelected"
      ></b-table>
    </div>
  </div>
</template>

<script>
//imports the arduino serial component
// import arduinoSerial from "./arduinoSerial.vue";

export default {
  // components: { arduinoSerial },
  props: {
    liveRun: Array,
    selectedDriver: "",
    allDoneRun: false
  },
  data() {
    return {
      fields: ["Car", "Name", "Make", "RawFinal", "PaxFinal", "Penalty"],
      penalty: 0,
      single: "single",
      selected: [],
      previous: [],
      tableTest: "someHeader",
      selectedGates: 0,
      options: [
        { text: "2 gates", value: 2 },
        { text: "3 gates", value: 3 },
        { text: "4 gates", value: 4 },
        { text: "5 gates", value: 5 }
      ],
      gateResponse: ""
    };
  },
  methods: {
    generateGates() {
      var gates = {};
      var numberOfGates = this.gateNumber;
      for (var i = 0; i < numberOfGates; i++) {
        gates[i] = [];
      }
      this.$store.commit("setGates", gates);
    },
    //opens the penalties modal on driver selection
    rowSelected(items) {
      if (items.length > 0) {
        this.$refs["penaltyModal"].show();
        this.selected = items;
        if (items[0].Penalty) {
          return (this.penalty = items[0].Penalty);
        }
        if (!items[0].Penalty) {
          return (this.penalty = 0);
        }
      }
    },
    //adds a cone penalty
    addCone() {
      this.penalty++;
      this.selected[0].Penalty = this.penalty;
    },
    //subtracts a cone penalty
    subtractCone() {
      this.penalty--;
      this.selected[0].Penalty = this.penalty;
    },
    //give the selected driver a DNF for the current run
    dnf() {
      var currentRuns = this.$store.state.liveRun;
      this.competitors.forEach(competitor => {
        if (competitor.Name == this.selected[0].Name) {
          competitor.Runs[this.runCount - 1].RawFinal = "DNF";
          this.$store.commit('modifyRun', [competitor.Car, competitor.Runs[this.runCount - 1]]) // see if this modifies the liveRun
        }
        // currentRuns.forEach(run => {
        //   if (run.Car == competitor.Car && run.Car == this.selected[0].Car) {
        //     run.RawFinal = "DNF";
        //   }
        // });
      });
    },
    //handles penalty calculation and updates the store for a competitor
    handlePenalties(operation) {
      var currentRuns = this.$store.state.liveRun;
      if (operation == "add") {
        this.addCone();
        this.competitors.forEach(competitor => {
          if (this.selected[0].Car == competitor.Car) {
            competitor.Runs[
              this.runCount - 1
            ].Penalty = this.selected[0].Penalty;
            competitor.Runs[this.runCount - 1].PenaltyFinal = Number(
              (
                competitor.Runs[this.runCount - 1].RawFinal +
                2 * this.selected[0].Penalty
              ).toFixed(3)
            );
            // currentRuns.forEach(run => {
            //   if (
            //     run.Car == competitor.Car &&
            //     run.Car == this.selected[0].Car
            //   ) {
            //     run.PenaltyFinal = competitor.Runs[this.runCount - 1].PenaltyFinal
            //   }
            // });
            this.$store.commit('modifyRun', [competitor.Car, competitor.Runs[this.runCount - 1]])
          }
        });
      }
      if (operation == "sub") {
        this.subtractCone();
        this.competitors.forEach(competitor => {
          if (this.selected[0].Car == competitor.Car) {
            competitor.Runs[
              this.runCount - 1
            ].Penalty = this.selected[0].Penalty;
            if (this.selected[0].Penalty == 0) {
              competitor.Runs[this.runCount - 1].PenaltyFinal = 0;
            } else {
              competitor.Runs[this.runCount - 1].PenaltyFinal = Number(
                (
                  competitor.Runs[this.runCount - 1].PenaltyFinal -
                  2 * this.selected[0].Penalty
                ).toFixed(3)
              );
            }

            // currentRuns.forEach(run => {
            //   if (
            //     run.Car == competitor.Car &&
            //     run.Car == this.selected[0].Car
            //   ) {
            //     run.PenaltyFinal = competitor.Runs[this.runCount - 1].PenaltyFinal
            //   }
            // });
            this.$store.commit('modifyRun', [competitor.Car, competitor.Runs[this.runCount - 1]])
          }
        });
      }
      // console.log("After penalties: ", this.competitors);
    },
    //adds a competitor to the staged list in the store
    //competitor at starting line
    stageDriver() {
      if (Object.keys(this.getGates).length == 0) {
        return alert("Must set number of gates before staging");
      }
      if (this.selectedDriver) {
        this.competitors.forEach(competitor => {
          var driverSpecs = this.selectedDriver.split(":");
          driverSpecs = driverSpecs[1].split(" ");
          var carNum = driverSpecs[1];
          if (competitor.Car == carNum) {
            // console.log(competitor);
            this.$store.commit("stageNew", competitor);
            // console.log(this.$store.state.staged);
            // if (this.message) {
            //   this.message = "";
            // }
            return this.getGates[0].push(competitor);
          }
        });
      } else {
        return alert("First, select the driver to stage.");
      }
    },
    //handles signals from the arduino gates as driver navigates through the course
    //stores values for runtime calculations
    gateTriggered(gate) {
      var driversAtGate = this.getGates[gate];
      // console.log("Current Driver", JSON.stringify(driversAtGate));
      if (driversAtGate == undefined || !driversAtGate) {
        return;
      }
      var driver = driversAtGate.shift();
      if (driver == undefined) {
        console.log("Gate triggered twice before new driver...");
        return;
      }
      if (!driver.rawTimes) {
        driver.rawTimes = [];
      }
      // if (!driver.times) {
      //   driver.times = [];
      // }
      if (!driver.Runs) {
        driver.Runs = [];
      }

      driver.rawTimes.push(Date.now());

      var nextGate = gate + 1;
      if (!this.getGates[nextGate]) {
        // console.log("End of run", driver.Name);
        // calculate sector times & run times
        this.getSectorTimes(driver);
        this.runTable(driver);
        this.$store.commit("removeFromStaged");
        // console.log(this.$store.state.staged);
        // console.log(this.$store.state.liveRun)
        return;
      }
      this.getGates[nextGate].push(driver);
    },
    //calculates the drivers sector times and final runtime (before pax)
    getSectorTimes(driver) {
      var times = [];
      var sectors = [];
      // console.log(Object.keys(this.getGates))
      for (var i = 0; i < Object.keys(this.getGates).length - 1; i++) {
        // console.log(i)
        sectors.push("Sector" + (i + 1));
      }
      // console.log("Sectors...", sectors)
      var sectorObj = {};
      sectors.forEach(sector => {
        sectorObj[sector] = 0;
      });
      console.log(sectorObj);
      var runsObj = {
        RawFinal: 0,
        PaxFinal: 0,
        PenaltyFinal: 0,
        Penalty: 0
      };
      // console.log(sectorObj)
      // console.log(runsObj)
      var run = { ...sectorObj, ...runsObj };
      if (driver.Runs) {
        driver.Runs.push(run);
      }
      console.log(run);
      var rawSectors = driver.rawTimes;
      console.log(rawSectors);
      var sector = 1;
      if (!rawSectors || rawSectors.length < 1) {
        return;
      }
      for (var i = 0; i < rawSectors.length - 1; i++) {
        times.push((rawSectors[i + 1] - rawSectors[i]) / 1000);
      }
      times.push((rawSectors[rawSectors.length - 1] - rawSectors[0]) / 1000);
      console.log(driver);
      console.log(times);
      times.forEach(time => {
        console.log(time);
        // console.log(driver);
        // console.log(driver.Runs["run" + this.runCount]);

        //THIS CODE NEEDS  TO BE CHANGED TO ALLOW FOR ANY NUMBER OF SECTORS
        if (sector < times.length) {
          driver.Runs[this.runCount - 1]["Sector" + sector] = time;
          sector++;
        }
        if (sector >= times.length) {
          driver.Runs[this.runCount - 1]["RawFinal"] = time;
        }
        //THIS CODE NEEDS  TO BE CHANGED TO ALLOW FOR ANY NUMBER OF SECTORS
      });
      driver.Runs[this.runCount - 1]["PaxFinal"] = Number(this.paxTime(driver));
      console.log(sectorObj);
      driver.rawTimes = [];
      times = [];
    },
    //updates the liverun state in the store
    //updates the live runtable values
    runTable(driver) {
      var run = driver.Runs[this.runCount - 1];
      var extraParams = {
        Car: driver.Car,
        Name: driver.Name,
        Make: driver.Make,
        runNum: this.runCount //added for run identifier when sending to express app
      };

      var runData = { ...run, ...extraParams };

      console.log(
        "The competitors after the run: ",
        this.$store.state.competitors
      );
      this.$store.commit("updateRun", runData);
    },
    //updates the global run count when all drivers have completed the current run
    newRun() {
      if (this.allDoneRun) {
        this.$store.commit("newRun");
      } else {
        return (
          console.log("Not all drivers have completed this run"),
          alert("Not all drivers have completed this run")
        );
      }
    },
    //calculates the paxtime for the driver
    paxTime(driver) {
      var carClass = driver.Class;
      var pax;
      this.classList.forEach(c => {
        c.subClasses.forEach(subclass => {
          if (subclass.class == carClass) {
            pax = subclass.pax;
          }
        });
      });
      var result = driver.Runs[this.runCount - 1]["RawFinal"] * pax;
      return Number(result.toFixed(3));
    }
  },
  computed: {
    //returns the competitor info from the store
    competitors() {
      return this.$store.state.competitors;
    },
    //returns the global runcount from the store
    runCount() {
      return this.$store.state.runCount;
    },
    //returns the number of gates from the store
    getGates() {
      return this.$store.state.gates;
    },
    //returns the current arduino connection object
    // getArduino() {
    //   return this.$store.state.connection;
    // },
    getPing() {
      return this.$store.state.pingToGate;
    },
    //returns the classlist from the store
    classList() {
      return this.$store.state.classList;
    },
    gateNumber() {
      // console.log(this.selected);
      return this.selectedGates;
    }
  },
  mounted() {
    this.$root.$on("gateTrigger", data => {
      console.log("Data recieved by runtable from arduino");
      console.log(data);
      switch (data) {
        case 48:
          this.gateTriggered(0);
          break;
        case 49:
          this.gateTriggered(1);
          break;
        case 50:
          this.gateTriggered(2);
          break;
        case 51:
          this.gateTriggered(3);
          break;
        case 52:
          this.gateTriggered(4);
          break;
      }
    });
  },
  watch: {
    getGates() {
      if (Object.keys(this.getGates).length > 0) {
        console.log("gates value has increased");
        var sectors = [];
        var gates = Object.keys(this.getGates);
        gates.shift();
        gates.forEach(gate => {
          sectors.push("Sector" + gate);
        });
        console.log(sectors);
        sectors.reverse();
        sectors.forEach(sector => {
          this.fields.splice(3, 0, sector);
        });
      }
    }
  },
  created() {
    if (Object.keys(this.getGates).length > 0) {
      console.log("gates value has increased");
      var sectors = [];
      var gates = Object.keys(this.getGates);
      gates.shift();
      gates.forEach(gate => {
        sectors.push("Sector" + gate);
      });
      console.log(sectors);
      sectors.reverse();
      sectors.forEach(sector => {
        this.fields.splice(3, 0, sector);
      });
    }
  }
};
</script>

<style scoped>
p {
  text-align: left;
}
.runBtn {
  margin: 2px;
  border-radius: 0px;
  background: #82d661;
  color: black;
}
.runBtn:hover {
  background: #6fb454;
  color: black;
}
</style>
