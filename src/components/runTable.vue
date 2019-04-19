<template>
  <div class="runTable">
    <div v-if="!availablePorts && connectionStatus == false">
      <p>Searching for Arduino {{dots}}</p>
    </div>
    <div v-if="availablePorts && connectionStatus == false">
      <div id="arduinoConnector">
        <p>
          {{availablePorts.comName}}
          <button @click="connect(availablePorts.comName)">Connect</button>
        </p>
      </div>
    </div>
    <div v-if="connectionStatus">
      <p>Connected to Arduino on port: {{selectedPort}}</p>
    </div>
    <button @click="stageDriver()">Stage</button>
    <button @click="gateTriggered(0)">Start</button>
    <button @click="gateTriggered(1)">G1</button>
    <button @click="gateTriggered(2)">G2</button>
    <button @click="gateTriggered(3)">End</button>
    <p>{{selectedDriver}}</p>
    <p>{{selected}}</p>
    <p> Penalty count: {{penalty}}</p>
    <div>
      <button v-b-modal.penalty>Penalties</button>
      <b-modal id="penalty">
        <button @click="addCone">+</button>
        <button @click="subtractCone">-</button>
      </b-modal>
    </div>
    <div class="row no-gutters">
      <b-table selectable :select-mode="single" striped :fields="fields" :items="liveRun" @row-selected="rowSelected"></b-table>
    </div>
  </div>
</template>

<script>
import SerialPort from "serialport";
import { setInterval, clearInterval } from "timers";

export default {
  props: {
    liveRun: Array,
    selectedDriver: ""
  },
  data() {
    return {
      fields: ["Car", "Name", "Make", "Sector1", "Sector2", "Sector3", "Final", "Penalty"],
      availablePorts: undefined,
      selectedPort: "",
      connectionStatus: false,
      arduino: {},
      timer: "",
      dots: ".",
      gates: {
        0: [],
        1: [],
        2: [],
        3: []
      },
      runCount: 1,
      penalty: 0,
      single: "single",
      selected: [],
      previous: []
    };
  },
  methods: {
    rowSelected(items){
      this.selected = items
      if(items[0].Penalty){
        return this.penalty = items[0].Penalty
      }
      if(!items[0].Penalty){
        return this.penalty = 0
      }
    },
    addCone() {
      this.penalty++;
      this.selected[0].Penalty = this.penalty
    },
    subtractCone() {
      this.penalty--
      this.selected[0].Penalty = this.penalty
    },
    mockConnect() {
      this.connectionStatus = !this.connectionStatus;
    },
    stageDriver() {
      this.competitors.forEach(competitor => {
        var driverSpecs = this.selectedDriver.split(":");
        driverSpecs = driverSpecs[1].split(" ");
        var carNum = driverSpecs[1];
        if (competitor.Car == carNum) {
          console.log(competitor);
          this.$store.commit("stageNew", competitor);
          console.log(this.$store.state.staged);
          return this.gates[0].push(competitor);
        }
      });
    },
    gateTriggered(gate) {
      var driversAtGate = this.gates[gate];
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
        driver.Runs = {};
      }
      if (driver.Runs) {
        driver.Runs["run" + this.runCount] = {
          Sector1: 0,
          Sector2: 0,
          Sector3: 0,
          Final: 0
        };
      }

      driver.rawTimes.push(Date.now());

      var nextGate = gate + 1;
      if (!this.gates[nextGate]) {
        console.log("End of run", driver.Name);
        // calculate sector times & run times
        this.getSectorTimes(driver);
        this.runTable(driver);
        this.$store.commit("removeFromStaged");
        console.log(this.$store.state.staged);
        return;
      }
      this.gates[nextGate].push(driver);
    },
    getSectorTimes(driver) {
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
          driver.Runs["run" + this.runCount]["Sector" + sector] = time;
          sector++;
        }
        if (sector > 3) {
          driver.Runs["run" + this.runCount]["Final"] = time;
        }
      });
      // console.log(driver.times);
    },
    runTable(driver) {
      var run = {
        Car: driver.Car,
        Name: driver.Name,
        Make: driver.Make,
        Sector1: driver.Runs["run" + this.runCount]["Sector1"],
        Sector2: driver.Runs["run" + this.runCount]["Sector2"],
        Sector3: driver.Runs["run" + this.runCount]["Sector3"],
        Final: driver.Runs["run" + this.runCount]["Final"]
      };
      this.$store.commit("updateRun", run);
    },
    connect(port) {
      var store = this.$store;
      console.log("connecting to", port);
      // var attempts = 0;
      var arduinoPort = new SerialPort(port, {
        baudRate: 9600
      });
      arduinoPort.on("error", function(err) {
        console.log(err);
      });
      this.connectionStatus = true;
      this.selectedPort = port;
      this.arduino = arduinoPort;
      store.commit("newConnect", this.arduino, this.selectedPort);
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
    },
    checkPorts() {
      SerialPort.list((err, ports) => {
        // console.log("checking ports...");
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
              console.log(port);
              return (this.availablePorts = port);
            }
          });
        }
      });
    },
    stopTimer: function() {
      if (this.connectionStatus) {
        window.clearInterval(this.timer);
      }
    }
  },
  created: function() {
    this.timer = window.setInterval(this.checkPorts, 1000);
  },
  computed: {
    competitors() {
      return this.$store.state.competitors;
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
</style>
