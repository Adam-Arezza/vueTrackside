<template>
  <div class="arduino">
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
  </div>
</template>
<script>
// adruinoSerial handles connecting to the main arduino and trigger events from the gate arduinos
import SerialPort from "serialport";
import { setInterval, clearInterval } from "timers";

export default {
  data() {
    return {
      availablePorts: undefined,
      selectedPort: "",
      connectionStatus: false,
      timer: "",
      dots: ".",
      message: ""
    };
  },
  created: function() {
    this.timer = window.setInterval(this.checkPorts, 1000);
  },
  methods: {
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
        var pingBack = this.pingBack;
        arduinoPort.on("data", function(data) {
          var msg = data[0];
          console.log(data[0]);
          switch (msg) {
            case 48:
              vue.$emit("gateTriggered", 0);
              break;
            case 49:
              vue.$emit("gateTriggered", 1);
              //   gateTriggered(1);
              break;
            case 50:
              vue.$emit("gateTriggered", 2);
              //   gateTriggered(2);
              break;
            case 51:
              vue.$emit("gateTriggered", 3);
              //   gateTriggered(3);
              break;
            case "ping1":
              pingBack("gate1");
              console.log("Received ping back from gate 1");
              break;
          }
        });
        arduinoPort.on("close", function() {
          store.state.connection = {};
          this.availablePorts = undefined;
          this.startTimer;
          alert("Arduino disconnected, reconnect Arduino");
        });
        if (this.getPing) {
          arduinoPort.write(this.getPing.gate.toString());
          arduinoPort.write(this.getPing.msg.toString());
        }
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
    }
  },
  computed: {
    getArduino() {
      return this.$store.state.connection;
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
