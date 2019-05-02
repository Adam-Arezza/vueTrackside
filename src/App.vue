<template>
  <div id="app">
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
    </div>
    <router-view/>
  </div>
</template>
<script>
import fs from "fs";
const { dialog } = require("electron").remote;
const remote = require("electron").remote;

//converts a passed in csv files header row and row values
//into key/value pairs object
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
    return {};
  },

  methods: {
    //opens a file dialog to select the imported csv file
    //converts csv to json using csvJson() function
    //returns the competitor list and saves to the store
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
    //saves the store competitor information to local storage
    //overwrites the old info
    saveToLocal() {
      var competitors = this.$store.state.competitors;
      if (localStorage.getItem("competitorData")) {
        alert("overwriting previous saved data!");
        localStorage.removeItem("competitorData");
        localStorage.setItem(
          "competitorData",
          JSON.stringify({ date: new Date(), competitors: competitors })
        );
      } else {
        localStorage.setItem(
          "competitorData",
          JSON.stringify({ date: new Date(), competitors: competitors })
        );
      }
    },
    //loads the competitor list stored in local storage and saves it to the store
    loadFromLocal() {
      if (localStorage.getItem("competitorData")) {
        var competitorData = JSON.parse(localStorage.getItem("competitorData"));
        var competitors = competitorData.competitors;
        console.log(competitorData.competitors);
        this.$store.commit("importList", competitors);
        console.log(this.$store.state.competitors);
      }
    },
    //exports the competitor info from the store into a csv file
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
    //closes the application
    shutDown() {
      var w = remote.getCurrentWindow();
      w.close();
    }
  },
  computed: {
    //gets the list of staged competitors
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
    }
  }
};
</script>

<style>
#app {
  color: black;
}

#nav {
  width: 100%;
  background: black;
}

#nav a {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  padding: 20px;
}
#nav button {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  /* height: 50px; */
  background: black;
}

#nav a:hover {
  text-decoration: none;
}

#nav .dropdown-item {
  color: black;
}

#nav .dropdown-item:hover {
  background: #2ca4c2;
}

#nav a.router-link-exact-active {
  color: #2ca4c2;
}
.disabled {
  pointer-events: none;
}
</style>
