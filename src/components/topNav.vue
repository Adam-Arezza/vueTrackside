<template>
  <div id="nav">
    <b-button-group>
      <b-dropdown id="file-dropdown" text="File" class="sm">
        <b-dropdown-item @click="importCsv()">Import</b-dropdown-item>
        <b-dropdown-item @click="exportData()">Export to spreadsheet</b-dropdown-item>
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
  </div>
  <!-- <router-view/> -->
</template>
<script>
// topNav component handles application navigation via vueRouter
// handles import, save, load and export functions of the application
import fs from "fs";
import XLSX from "xlsx";
import { reportCalcs } from "../mixins/reportCalcs";
const { dialog } = require("electron").remote;
const remote = require("electron").remote;

//returns JSON of competitors given a CSV file
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
      loadModalData: [],
      compList: this.competitors
    };
  },
  methods: {
    //activates the export data modal and loads localstorage data for selection
    //closes the modal
    closeModal(modal) {
      this.$refs[modal].hide();
    },
    //returns a formatted date and time of an event from the date object saved to the event
    //format: day, month, day(number), hour:minute
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
    //opens a filesystem dialog for opening a selected CSV file
    //saves the competitor list as JSON to the store
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
    //creates a new save in the localstorage
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
    //activates the load modal
    loadModal() {
      this.$refs["load-modal"].show();
      this.loadFromLocal();
    },
    //retrieves data from the localstorage saved data
    loadFromLocal() {
      if (localStorage.getItem("competitorData")) {
        var competitorData = JSON.parse(localStorage.getItem("competitorData"));
        this.loadModalData = competitorData;
      }
    },
    //loads the selected save data into the store
    load(data) {
      var competitors = data.competitors;
      var runCount = data.runCount;
      // console.log(data.competitors);
      this.$store.commit("importList", competitors);
      // console.log(this.$store.state.competitors);
      this.$store.state.runCount = runCount;
      this.$store.state.gates = data.gates;
      this.closeModal("load-modal");
    },
    //exports the selected data into a tabbed spreadsheet with Ftd data (overall, pax, sectors, classes)
    exportData() {
      if(this.competitors.length == 0){
        return alert("No data, please load data before export")
      }
      if(this.runCount <= 1){
        return alert("All runs must be complete before export")
      }
      //formatting the output of GetOverallFtd() for the spreadshseet
      var overallData = this.GetOverallFtd().sort((a, b) =>
        a.Ftd < b.Ftd ? -1 : 1
      );
      overallData.forEach(driver => {
        driver.class = driver.class[1];
      });
      // console.log(overallData)

      //Formatting the output of getClassFtd() for the spreadsheet
      var classFtdData = [];
      var classData = this.getClassFtd();
      var classHeads = Object.keys(classData);
      // console.log(classData);
      // console.log(classHeads);
      classHeads.forEach(head => {
        // console.log(head);
        classFtdData.push([head]);
        if (classData[head].length == 0) {
          // console.log(head);
          // console.log("no data");
          classFtdData.push([" "]);
        } else {
          // console.log(Object.keys(classData[head][0]));
          classData[head].sort((a, b) => (a.Ftd < b.Ftd ? -1 : 1));
          classFtdData.push(Object.keys(classData[head][0]));
        }
        for (var i = 0; i < classData[head].length; i++) {
          // console.log(classData[head][i]);
          classData[head][i].class = classData[head][i].class[1];
          classFtdData.push(Object.values(classData[head][i]));
        }
      });
      // console.log(classFtdData);

      //formatting the sector data for the spreadsheet
      var sectorData;
      var sectorFtdData = [];
      sectorData = this.getSectorFtd();
      var sectorHeads = Object.keys(sectorData);
      sectorHeads.forEach(sector => {
        // console.log("Sector: ", Number(sector) +1)
        sectorFtdData.push(["Sector: ", Number(sector) + 1]);
        sectorData[sector] = sectorData[sector].sort((a, b) =>
          a.Ftd < b.Ftd ? -1 : 1
        );
        // console.log(Object.keys(sectorData[sector][0]))
        sectorFtdData.push(Object.keys(sectorData[sector][0]));
        // console.log(sectorData[sector])
        for (var i = 0; i < sectorData[sector].length; i++) {
          // console.log(Object.values(sectorData[sector][i]))
          sectorFtdData.push(Object.values(sectorData[sector][i]));
        }
      });
      var paxData = this.paxCalcs();
      paxData = paxData.sort((a, b) => (a.paxTime < b.paxTime ? -1 : 1));
      paxData.forEach(driver => {
        driver.class = driver.class[1];
      });

      //starting a new workbook
      var wb = XLSX.utils.book_new();
      wb.Props = {
        Title: "Trackside Data",
        Subject: "autoslalom event data",
        Author: "Trackside Autosports",
        CreateDate: new Date()
      };
      //giving the workbook first sheet name
      var vue = this;
      wb.SheetNames.push("FTD-Raw");
      dialog.showSaveDialog(function(filename) {
        if (filename) {
          console.log(filename);
          var wsOverall = XLSX.utils.json_to_sheet(overallData);
          wb.Sheets["FTD-Raw"] = wsOverall;
          var wsClasses = XLSX.utils.aoa_to_sheet(classFtdData);
          var wsSectors = XLSX.utils.aoa_to_sheet(sectorFtdData);
          var wsPax = XLSX.utils.json_to_sheet(paxData);
          XLSX.utils.book_append_sheet(wb, wsPax, "FTD-Pax");
          XLSX.utils.book_append_sheet(wb, wsClasses, "FTD-Class");
          XLSX.utils.book_append_sheet(wb, wsSectors, "FTD-Sectors");
          if (filename.split(".")[1] == "xlsx") {
            XLSX.writeFile(wb, filename);
          } else {
            XLSX.writeFile(wb, filename + ".xlsx");
          }

          console.log("Exporting all current data to spreadsheet");
        } else {
          console.log("no file");
        }
      });
    },
    //closes the application
    shutDown() {
      var w = remote.getCurrentWindow();
      w.close();
    }
  },
  computed: {
    competitors() {
      return this.$store.state.competitors
    },
    //returns the list of staged/running competitors
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
    //returns the current run # from the store
    runCount() {
      return this.$store.state.runCount;
    },
    //returns the number of gates from the store
    gates() {
      return this.$store.state.gates;
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
