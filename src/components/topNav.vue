<template>
  <div id="nav">
    <b-button-group>
      <b-dropdown id="file-dropdown" text="File" class="sm">
        <b-dropdown-item @click="importCsv()">Import</b-dropdown-item>
        <b-dropdown-item @click="exportCsv()">Export to Csv</b-dropdown-item>
        <b-dropdown-item @click="saveToLocal()">Save</b-dropdown-item>
        <b-dropdown-item @click="loadFromLocal()">Load</b-dropdown-item>
        <b-dropdown-item @click="shutDown()">Close</b-dropdown-item>
      </b-dropdown>
      <b-button v-bind:class="{disabled: disabledLink}">
        <router-link to="/">Main</router-link>
      </b-button>
      <b-button v-bind:class="{disabled: disabledLink}">
        <router-link to="/competitors">Competitors</router-link>
      </b-button>
      <b-button v-bind:class="{disabled: disabledLink}">
        <router-link to="/gates">Gates</router-link>
      </b-button>
      <b-button v-bind:class="{disabled: disabledLink}">
        <router-link to="/reports">Reports</router-link>
      </b-button>
    </b-button-group>
    <b-modal ref="load-modal" id="loda-modal" title="Load race data"
    :header-bg-variant="'dark'"
    :header-border-variant="'primary'"
    >
      <p><strong>Select event data to load</strong></p>
      <div>
        <ul>
          <li v-for="(item, index) in loadModalData" :key="index" @click="load(item)">
            {{dayAndTime(item.date)}}
          </li>
        </ul>
      </div>
      <div slot="modal-footer">
        <b-button @click="close()">Close</b-button>
      </div>
    </b-modal>
  </div>
  <!-- <router-view/> -->
</template>
<script>
import fs from "fs";
const { dialog } = require("electron").remote;
const remote = require("electron").remote;

function csvJson(csv) {
  var competitors = [];
  var rows = csv.split("\n");
  var headers = rows[0].split(",");
  for (var i = 1; i < rows.length - 1; i++) {
    var obj = {};
    var currentline = rows[i].split(",");
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    competitors.push(obj);
  }
  return competitors;
}

export default {
  data() {
    return {
      loadModalData: []
    };
  },
  methods: {
    close() {
      this.$refs['load-modal'].hide()
    },
    dayAndTime(date){
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      var dates = Array.from({length: 31}, (i,n) => n+1)
      var d = new Date(date)
      var mins = d.getMinutes().toString()
      if(mins.length == 1){
        mins = '0'+ mins
      }
      return days[d.getDay()] + " " + months[d.getMonth()] + " " + dates[d.getDate() -1] + " Time:" + d.getHours() + ":" + mins
    },
    importCsv() {
      var store = this.$store;
      dialog.showOpenDialog(function(fileNames) {
        var fileName;
        if (fileNames == undefined) {
          return console.log("no file selected");
        }
        if (fileNames[0] != undefined) {
          fileName = fileNames[0];
        }

        if (fileName.split(".")[1] == "csv") {
          console.log("File accepted, generating competitor list...");
          alert("File accepted, generating competitor list...");
          fs.readFile(fileName, "utf8", function(err, data) {
            if (err) {
              throw err;
            }
            if (data) {
              store.commit("importList", csvJson(data));
            }
          });
        } else {
          console.log("filetype incorrect, please select a CSV file");
          alert("filetype incorrect, please select a CSV file");
        }
      });
    },
    saveToLocal() {
      var competitors = this.$store.state.competitors;
      var newData;
      if (localStorage.getItem("competitorData")) {
        // alert("overwriting previous saved data!");
        var data = JSON.parse(localStorage.getItem("competitorData"));
        localStorage.removeItem("competitorData");
        console.log(data);
        if (data.length > 20) {
          data.shift();
        }
        data.push({
          date: new Date(),
          competitors: competitors,
          runCount: this.runCount
        })
        localStorage.setItem("competitorData", JSON.stringify(data));
        // var data = JSON.parse(localStorage.getItem("competitorData"));
        // var date = new Date(data.date).toString();
        // console.log(date);
      } else {
        localStorage.setItem(
          "competitorData",
          JSON.stringify([
            {
              date: new Date(),
              competitors: competitors,
              runCount: this.runCount
            }
          ])
        );
      }
    },
    loadFromLocal() {
      if (localStorage.getItem("competitorData")) {
        var competitorData = JSON.parse(localStorage.getItem("competitorData"));
        this.loadModalData = competitorData
        this.$refs['load-modal'].show()
      }
    },
    load(data){
      var competitors = data.competitors;
        var runCount = data.runCount;
        console.log(data.competitors);
        this.$store.commit("importList", competitors);
        console.log(this.$store.state.competitors);
        this.$store.state.runCount = runCount;
    },
    exportCsv() {
      var competitorData = this.$store.state.competitors;
      var headers = [];
      var competitorInfo = [];
      var i = 0;
      var n = 0;
      var compData = "";
      var runHeaders = [];
      var runVals = [];
      for (i = 0; i < competitorData.length; i++) {
        var row = [];
        var competitorProps = Object.keys(competitorData[i]);
        var competitorVals = Object.values(competitorData[i]);
        for (var prop in competitorProps)
          if (
            !headers.includes(competitorProps[prop]) &&
            competitorProps[prop] != "Runs" &&
            competitorProps[prop] != "rawTimes" &&
            competitorProps[prop] != "times" &&
            competitorProps[prop] != "_showDetails"
          ) {
            headers.push(competitorProps[prop]);
          }
        for (var val in competitorVals)
          if (typeof competitorVals[val] == "string") {
            row.push(competitorVals[val]);
          }
        if (competitorData[i].Runs) {
          var runs = competitorData[i].Runs;
          runs.forEach(run => {
            var keys = Object.keys(run);
            var vals = Object.values(run);
            keys.forEach(key => {
              if (!runHeaders.includes(key)) {
                runHeaders.push(key);
              }
            });
            var compRun = [];
            compRun.push(vals);
            runVals.push(compRun);
          });
        }
        competitorInfo.push(row);
      }

      console.log("run headers: ", runHeaders);
      console.log("run values: ", runVals);
      console.log("Headers: ", headers);
      console.log("compInfo: ", competitorInfo);
      // console.log(rows)
      // compData += headers.join(",") + "\n";
      // compData += competitorInfo.join(",") + "\n";
      for (i = 0; i < competitorInfo.length; i++) {
        compData += headers.join(",") + "\n";
        compData += competitorInfo[i].join(",") + "\n";
        compData += "Runs" + "\n";
        for (run in runVals) {
        }
      }
      console.log(compData);
      dialog.showSaveDialog(
        remote.getCurrentWindow(),
        {
          filters: [
            { name: "Csv", extensions: "csv" },
            { name: "json", extensions: "json" }
          ]
        },
        function(filename) {
          console.log(filename);
          if (filename == undefined) {
            return console.log("no file name");
          }
          fs.writeFile(filename, compData, "utf8", function(err) {
            if (err) {
              console.log("error: ", err);
            }
          });
          console.log("file saved to: ", filename);
        }
      );
    },
    shutDown() {
      var w = remote.getCurrentWindow();
      w.close();
    }
  },
  computed: {
    stagedList() {
      return this.$store.state.staged;
    },
    //disables changing from page to page if the stagedList has entries
    //prevents disconnect to arduino when pages are navigated
    disabledLink() {
      if (this.stagedList.length >= 1) {
        return true;
      }
      if (this.stagedList.length < 1) {
        return false;
      }
    },
    runCount() {
      return this.$store.state.runCount;
    }
  }
};
</script>
<style>
#nav {
  width: 100%;
  background: black;
}

#nav a {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  padding: 10px;
}
#nav .btn {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: black;
}

#nav a:hover {
  text-decoration: none;
}

#nav .dropdown-item {
  color: black;
}

#nav .dropdown-item:hover {
  background: #96f571;
}

#nav a.router-link-exact-active {
  color: #82e412;
}
.disabled {
  pointer-events: none;
}
ul {
  width: 100%;
  padding: 0px;
}
li {
  list-style-type: none;
  padding: 10px;
  width: 75%;
  border:solid black 2px;
}
li:hover {
background:#96f571;
  cursor: pointer;
  transform: translateX(25px);
  font-weight: bold;
}
.modal-header {
  color: #82e412;
}
</style>
