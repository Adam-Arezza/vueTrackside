<template>
  <div id="nav">
    <b-button-group>
      <b-dropdown id="file-dropdown" text="File" class="sm">
        <b-dropdown-item @click="importCsv()">Import</b-dropdown-item>
        <b-dropdown-item @click="exportModal()">Export to Csv</b-dropdown-item>
        <b-dropdown-item @click="saveToLocal()">Save</b-dropdown-item>
        <b-dropdown-item @click="loadModal()">Load</b-dropdown-item>
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
    <b-modal
      ref="load-modal"
      id="loda-modal"
      title="Load race data"
      :header-bg-variant="'dark'"
      :header-border-variant="'primary'"
    >
      <p>
        <strong>Select event data to load</strong>
      </p>
      <div>
        <ul>
          <li
            v-for="(item, index) in loadModalData"
            :key="index"
            @click="load(item)"
          >{{dayAndTime(item.date)}}</li>
        </ul>
      </div>
      <div slot="modal-footer">
        <b-button @click="closeModal('load-modal')">Close</b-button>
      </div>
    </b-modal>
    <b-modal
      ref="export-modal"
      id="export-modal"
      title="Export selected to spreadsheet"
      :header-bg-variant="'dark'"
    >
      <div>
        <p>Select from previous save data or the currentlty loaded data to export</p>
        <ul>
          <li
            v-for="(item, index) in loadModalData"
            :key="index"
            @click="exportCsv(item)"
          >{{dayAndTime(item.date)}}</li>
        </ul>
      </div>
      <div>
        <b-button @click="exportCsv('current')">Export current data</b-button>
      </div>
      <div slot="modal-footer">
        <b-button @click="closeModal('export-modal')">Close</b-button>
      </div>
    </b-modal>
  </div>
  <!-- <router-view/> -->
</template>
<script>
// topNav component handles application navigation via vueRouter
// handles import, save, load and export functions of the application
import fs from "fs";
import XLSX from "xlsx";
import { reportCalcs } from '../mixins/reportCalcs';
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
  mixins: [reportCalcs],
  data() {
    return {
      loadModalData: []
    };
  },
  methods: {
    exportModal() {
      this.$refs["export-modal"].show();
      this.loadFromLocal();
    },
    closeModal(modal) {
      this.$refs[modal].hide();
    },
    dayAndTime(date) {
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      var dates = Array.from({ length: 31 }, (i, n) => n + 1);
      var d = new Date(date);
      var mins = d.getMinutes().toString();
      if (mins.length == 1) {
        mins = "0" + mins;
      }
      return (
        days[d.getDay()] +
        " " +
        months[d.getMonth()] +
        " " +
        dates[d.getDate() - 1] +
        " Time:" +
        d.getHours() +
        ":" +
        mins
      );
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
          runCount: this.runCount,
          gates: this.gates
        });
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
              runCount: this.runCount,
              gates: this.gates
            }
          ])
        );
      }
    },
    loadModal() {
      this.$refs["load-modal"].show();
      this.loadFromLocal();
    },
    loadFromLocal() {
      if (localStorage.getItem("competitorData")) {
        var competitorData = JSON.parse(localStorage.getItem("competitorData"));
        this.loadModalData = competitorData;
      }
    },
    load(data) {
      var competitors = data.competitors;
      var runCount = data.runCount;
      // console.log(data.competitors);
      this.$store.commit("importList", competitors);
      // console.log(this.$store.state.competitors);
      this.$store.state.runCount = runCount;
      this.$store.state.gates = data.gates
    },
    exportCsv(data) {

      //formatting the output of GetOverallFtd() for the spreadshseet
      var overallData = this.GetOverallFtd().sort((a,b) => (a.Ftd < b.Ftd) ? -1 : 1)
      overallData.forEach(driver => {
        driver.class = driver.class[1]
      })
      // console.log(overallData)

      //Formatting the output of getClassFtd() for the spreadsheet
      var classData = this.getClassFtd()
      var classes = Object.keys(classData)
      var streetData 
      var streetTouringData
      var streetPreppedData
      var preparedData
      var modifiedData
      for(var i = 0; i < classes.length; i++){
        for(var n = 0; n < classData[classes[i]].length; n ++){
          // console.log(classData[classes[i]][n])
          classData[classes[i]][n].class = classData[classes[i]][n].class[1]
        }
        classData[classes[i]] = classData[classes[i]].sort((a,b) => (a.Ftd < b.Ftd) ? -1 : 1)
      }
      for(var c in classes){
        // console.log(classes[c])
        switch (classes[c]){
          case "Street":
          streetData = (classData[classes[c]])
          break
          case "Street Touring":
          streetTouringData = (classData[classes[c]])
          break
          case "Street Prepared":
          streetPreppedData = (classData[classes[c]])
          break
          case "Prepared":
          preparedData = (classData[classes[c]])
          break
          case "Modified":
          modifiedData = (classData[classes[c]])
          break
        }
      }
      // console.log(overallData)
      // console.log(streetData)
      // console.log(classes)
      // console.log(classHeadings)
      // console.log(classFtdData)

      var sectorData
      var paxData
      //starting a new workbook
      var wb = XLSX.utils.book_new();
      wb.Props = {
        Title: "Trackside Data",
        Subject: "autoslalom event data",
        Author: "Trackside Autosports",
        CreateDate: new Date()
      };
      //giving the workbook first sheet name
      wb.SheetNames.push("FTD-Raw")
      dialog.showSaveDialog(null, null, function(filename) {
        if (filename) {
          console.log(filename);
          if (data == "current") {
            var wsOverall = XLSX.utils.json_to_sheet(overallData)
            wb.Sheets['FTD-Raw'] = wsOverall
            // console.log(overallData)
            var wsS = XLSX.utils.json_to_sheet(streetData)
            var wsSP = XLSX.utils.json_to_sheet(streetPreppedData)
            var wsST = XLSX.utils.json_to_sheet(streetTouringData)
            var wsP = XLSX.utils.json_to_sheet(preparedData)
            var wsM = XLSX.utils.json_to_sheet(modifiedData)
            XLSX.utils.book_append_sheet(wb,wsS,"FTD-Street")
            XLSX.utils.book_append_sheet(wb,wsST,"FTD-Street Touring")
            XLSX.utils.book_append_sheet(wb,wsSP,"FTD-Street Prepared")
            XLSX.utils.book_append_sheet(wb,wsP,"FTD-Prepared")
            XLSX.utils.book_append_sheet(wb,wsM,"FTD-Modifed")
            XLSX.writeFile(wb, filename)
            
            console.log("Exporting all current data to spreadsheet");
          }
          if (typeof data == "object") {
            console.log("Exporting save data to spreadsheet");
          }
        } else {
          console.log("no file");
        }
      });
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
    },
    gates() {
      return this.$store.state.gates
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
  border: solid black 2px;
}
li:hover {
  background: #96f571;
  cursor: pointer;
  transform: translateX(25px);
  font-weight: bold;
}
.modal-header {
  color: #82e412;
}
</style>
