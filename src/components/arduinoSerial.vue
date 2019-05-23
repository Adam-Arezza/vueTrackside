<template>
  <div class="arduino">
    <div id="searching" v-if="availablePorts.length == 0 && !connectionStatus">
      <p>Searching for Arduino {{dots}}</p>
    </div>
    <div v-if="availablePorts.length > 0 && !connectionStatus">
      <div id="arduinoConnector" class="row no-gutters justify-content-end">
        <div class="col-md-5">
          <span>Connect to Arduino on port:</span>
          <select v-model="selectedPort">
            <option v-for="(port, index) in availablePorts" :key="index">{{port}}</option>
          </select>
          <button id="connectBtn" @click="connect(selectedPort)">Connect</button>
        </div>
      </div>
    </div>
    <div id="connectionMsg" v-if="connectionStatus">
      <p>Connected to Arduino on port: {{selectedPort}}</p>
    </div>
  </div>
</template>
<script>
// adruinoSerial handles connecting to the main arduino and trigger events from the gate arduinos
import SerialPort from "serialport";

export default {
  timers: {
    checkPorts: { time: 1000, autostart: false, repeat: true }
  },
  data() {
    return {
      availablePorts: [],
      selectedPort: "",
      connectionStatus: false,
      dots: ".",
      message: "",
      arduino: undefined
    };
  },
  created() {
    this.$timer.start("checkPorts");
  },
  methods: {
    //connects to the main arduino and handles the gate signals
    connect(port) {
      console.log(port);
      this.selectedPort = port;
      this.connectionStatus = true;
      this.arduino = new SerialPort(port, { baudRate: 9600 });
      this.$timer.stop("checkPorts");
    },
    //checks for avilable arduino connections
    //while searching adds a waiting .... animation
    checkPorts() {
      console.log("Checking for ports");
      SerialPort.list((err, ports) => {
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
              if (!this.availablePorts.includes(port.comName)) {
                this.availablePorts.push(port.comName);
              }
            }
          });
        }
      });
    },
    readData(data) {
      console.log(data);
      this.$root.$emit("gateTrigger", data[0]);
    },
    closeConnection() {
      this.arduino = undefined;
      this.selectedPort = "";
      this.connectionStatus = false;
      console.log("connection terminated");
      alert(
        "Arduino connection has been terminated... Please connect the Arduino"
      );
      this.$timer.start("checkPorts");
    },
    connectError(err) {
      console.log(err);
      alert("Something went wrong...Re-insert the Arduino cable");
    }
  },
  watch: {
    arduino: function() {
      if (this.arduino) {
        this.arduino.on("data", this.readData);
        this.arduino.on("error", this.connectError);
        this.arduino.on("close", this.closeConnection);
      } else {
        return console.log("No connection");
      }
    }
  }
};
</script>
<style>
.arduino {
  width: 100%;
}
#arduinoConector {
  text-align: left;
}
#arduinoConnector button {
  text-align: left;
}
#warning {
  background: rgb(238, 174, 54);
  color: black;
  text-align: center;
}
#connectBtn {
  margin: 10px;
}
#connectionMsg {
  background: lightgreen;
  color: black;
  align-items: center;
}
#connectionMsg p {
  margin: 0px;
  text-align: center;
}
#searching {
  background: rgb(238, 174, 54);
  color: black;
  align-items: center;
}
#searching p {
  margin: 0px;
  text-align: center;
}
</style>
