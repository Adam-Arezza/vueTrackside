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
  //starts a timer upon created hook
  //checkports will look for available connections to the serialport
  created() {
    this.$timer.start("checkPorts");
  },
  methods: {
    //connects to the main arduino on 'port'
    //changes the property connectionStatus to true
    //changes the property selectedPort to port
    //creates a serialport instance and assigns to the arduino property
    //stops the checkports timer
    connect(port) {
      console.log(port);
      this.selectedPort = port;
      this.connectionStatus = true;
      this.arduino = new SerialPort(port, { baudRate: 9600 });
      this.$timer.stop("checkPorts");
    },
    //checks for avilable serialport connections
    //while searching adds a waiting .... animation
    //adds any avilable ocnnections to the availablePorts property
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
    //When the ardiuno serialport instance recieves any data an event is emitted
    //$root events can be accessed by any other component
    readData(data) {
      console.log(data);
      this.$root.$emit("gateTrigger", data[0]);
    },
    //Changes the properties when the serialport connection is terminated
    //alerts the user that the connection is lost
    //starts the timer for checkports
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
    //If an error occurs when connecting the error is logged and the user instructed to re-insert the cable
    connectError(err) {
      console.log(err);
      alert("Something went wrong...Re-insert the Arduino cable");
    }
  },
  watch: {
    //When an event occurs on the adruino serialport instance the appropriate handler is called
    //If no arduino connection exists logs message to the console
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
