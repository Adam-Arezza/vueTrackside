<template>
  <div class="runTable">
    <!-- <p>{{getArduino.port}}</p> -->
    <div id="searching" v-if="!availablePorts && getArduino.device == undefined">
      <p>Searching for Arduino {{dots}}</p>
    </div>
    <div v-if="availablePorts && getArduino.device == undefined">
      <div id="arduinoConnector">
        <p v-if="message" id="warning">{{message}}</p>
        <p>
          Arduino on port:
          {{availablePorts.comName}}
          <button
            id="connectBtn"
            @click="connect(availablePorts.comName)"
          >Connect</button>
        </p>
      </div>
    </div>
    <div id="connectionMsg" v-if="getArduino.device != undefined">
      <p>Connected to Arduino on port: {{getArduino.port}}</p>
    </div>
    <button @click="stageDriver()">Stage</button>
    <button @click="gateTriggered(0)">Start</button>
    <button @click="gateTriggered(1)">G1</button>
    <button @click="gateTriggered(2)">G2</button>
    <button @click="gateTriggered(3)">End</button>
    <button @click="newRun()">Run Complete</button>
    <div>
      <!-- <button v-b-modal.penalty> 0">Penalties</button> -->
      <b-modal ref="penaltyModal" id="penalty">
        <button @click="handlePenalties('add')">Add 1 Cone Penalty</button>
        <button @click="handlePenalties('sub')">Remove 1 Cone Penalty</button>
        <button @click="dnf">DNF</button>
      </b-modal>
    </div>
    <h3>Run{{runCount}}</h3>

    <div class="row no-gutters">
      <b-table
        selectable
        hover
        :select-mode="single"
        striped
        :fields="fields"
        :items="liveRun"
        @row-selected="rowSelected"
      ></b-table>
    </div>
  </div>
</template>

<script>
import SerialPort from "serialport";
import { setInterval, clearInterval } from "timers";

export default {
  props: {
    liveRun: Array,
    selectedDriver: "",
    allDoneRun: false
  },
  data() {
    return {
      fields: [
        "Car",
        "Name",
        "Make",
        "Sector1",
        "Sector2",
        "Sector3",
        "Final",
        "Penalty"
      ],
      availablePorts: undefined,
      selectedPort: "",
      connectionStatus: false,
      timer: "",
      dots: ".",
      penalty: 0,
      single: "single",
      selected: [],
      previous: [],
      message: ""
    };
  },
  methods: {
    //opens the penalties modal on row selection
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
          competitor.Runs[this.runCount - 1].Final = "DNF";
        }
        currentRuns.forEach(run => {
          if (run.Car == competitor.Car && run.Car == this.selected[0].Car) {
            run.Final = "DNF";
          }
        });
      });
    },
    //handles penalty calculation and updates the store for a competitor
    handlePenalties(operation) {
      if (operation == "add") {
        this.addCone();
        this.competitors.forEach(competitor => {
          if (this.selected[0].Car == competitor.Car) {
            competitor.Runs[
              this.runCount - 1
            ].Penalty = this.selected[0].Penalty;
            competitor.Runs[this.runCount - 1].Final =
              competitor.Runs[this.runCount - 1].Final + 2;
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
            competitor.Runs[this.runCount - 1].Final = (
              competitor.Runs[this.runCount - 1].Final - 2
            ).toFixed(3);
          }
        });
      }
      console.log("After penalties: ", this.competitors);
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
      if (!driver.times) {
        driver.times = [];
      }
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
    //calculates the drivers sector times
    getSectorTimes(driver) {
      if (driver.Runs) {
        driver.Runs.push({
          Sector1: 0,
          Sector2: 0,
          Sector3: 0,
          Final: 0,
          Penalty: 0
        });
      }
      var rawSectors = driver.rawTimes;
      var i = 0;
      var sector = 1;

      if (!rawSectors || rawSectors.length < 1) {
        return;
      }
      for (i = 0; i < rawSectors.length - 1; i++) {
        driver.times.push((rawSectors[i + 1] - rawSectors[i]) / 1000);
      }
      driver.times.push((rawSectors[3] - rawSectors[0]) / 1000);
      // console.log(driver)
      driver.times.forEach(time => {
        // console.log(time);
        // console.log(driver);
        // console.log(driver.Runs["run" + this.runCount]);
        if (sector <= 3) {
          driver.Runs[this.runCount - 1]["Sector" + sector] = time;
          sector++;
        }
        if (sector > 3) {
          driver.Runs[this.runCount - 1]["Final"] = time;
        }
        driver.rawTimes = [];
        driver.times = [];
      });
      // console.log(driver.times);
    },
    //updates the liverun state in the store
    //updates the live runtable values
    runTable(driver) {
      var run = {
        Car: driver.Car,
        Name: driver.Name,
        Make: driver.Make,
        Sector1: driver.Runs[this.runCount - 1]["Sector1"],
        Sector2: driver.Runs[this.runCount - 1]["Sector2"],
        Sector3: driver.Runs[this.runCount - 1]["Sector3"],
        Final: driver.Runs[this.runCount - 1]["Final"]
      };
      // console.log("runtable(driver)")
      console.log(
        "The competitors after the run: ",
        this.$store.state.competitors
      );
      this.$store.commit("updateRun", run);
    },
    //connects to the main arduino and handles the gate signals
    connect(port) {
      var arduinoPort;
      var store = this.$store;
      var vue = this;
      if (this.getArduino) {
        console.log("Previously active connections: ", this.getArduino);
        // arduinoPort = this.getArduino;
        this.connectionStatus = true;
      }
      console.log("connecting to", port);
      if (this.getArduino.device == undefined) {
        console.log("store connection", store.state.connection);
        arduinoPort = new SerialPort(port, {
          baudRate: 9600
        });
        arduinoPort.on("error", function(err) {
          console.log(err);
          if (
            err ==
            "Error: Error: No such file or directory, cannot open /dev/ttyACM0"
          ) {
            vue.message = "Disconnected, please reconnect the Arduino";
            console.log("Set error message");
          }
          store.commit("disconnect");
          this.connectionStatus = false;
          vue.startTimer;
          return;
        });

        this.connectionStatus = true;
        this.selectedPort = port;
        var arduino = arduinoPort;
        store.commit("newConnect", [arduino, this.selectedPort]);
        var gateTriggered = this.gateTriggered;
        arduinoPort.on("data", function(data) {
          var msg = data[0];
          console.log(data[0]);
          switch (msg) {
            case 48:
              gateTriggered(0);
              break;
            case 49:
              gateTriggered(1);
              break;
            case 50:
              gateTriggered(2);
              break;
            case 51:
              gateTriggered(3);
              break;
          }
        });
        arduinoPort.on("close", function() {
          store.state.connection = {};
          this.availablePorts = undefined;
          this.startTimer;
          alert("Arduino disconnected, reconnect Arduino");
        });
      }
    },
    //checks for avilable arduino connections
    //while searching adds a waiting .... animation
    checkPorts() {
      // console.log("Checking for ports");
      SerialPort.list((err, ports) => {
        this.stopTimer();
        if (this.dots.length == 5) {
          this.dots = "";
        }
        this.dots += ".";
        if (err) {
          console.log(err);
        }
        if (ports) {
          // console.log(ports);
          ports.forEach(port => {
            if (port.manufacturer) {
              // console.log(port);
              return (this.availablePorts = port);
            }
          });
        }
      });
    },
    //stops the ..... animation when a connection is made to the main arduino
    stopTimer: function() {
      if (this.getArduino.device != undefined) {
        window.clearInterval(this.timer);
        console.log("Timer stopped");
      }
    },
    startTimer: function() {
      if (this.getArduino == {}) {
        this.timer = window.setInterval(this.checkPorts, 1000);
      }
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
    }
  },
  //interval for checking for arduino on ports
  created: function() {
    this.timer = window.setInterval(this.checkPorts, 1000);
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
    getGates() {
      return this.$store.state.gates;
    },
    getArduino() {
      return this.$store.state.connection;
    }
  }
};
</script>

<style>
#arduinoConector {
  text-align: left;
}
#arduinoConnector button {
  text-align: left;
}
p {
  text-align: left;
}
#warning {
  background: rgb(238, 174, 54);
  color: black;
  margin: 10px 10px 10px 0px;
  padding: 5px;
  width: 30%;
  border-radius: 15px;
  text-align: center;
}
#connectBtn {
  margin: 10px;
}
#connectionMsg {
  background: lightgreen;
  color: black;
  margin: 10px 10px 10px 0px;
  padding: 5px;
  width: 25%;
  align-items: center;
  border-radius: 15px;
}
#connectionMsg p {
  margin: 0px;
  text-align: center;
}
#searching {
  background: rgb(238, 174, 54);
  color: black;
  margin: 10px 10px 10px 0px;
  align-items: center;
  padding: 5px;
  width: 15%;
  border-radius: 15px;
}
#searching p {
  margin: 0px;
  text-align: center;
}
</style>
