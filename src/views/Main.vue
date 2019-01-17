<template>
  <div class="main">
    <b-button v-if="competitors.length < 2" @click="importCsv">Import</b-button>
    <runTable :competitors="competitors"></runTable>
  </div>
</template>

<script>
// @ is an alias to /src
import runTable from "../components/runTable.vue";
import fs from "fs";
const { dialog } = require("electron").remote;

var competitors = [];
function csvJson(csv) {
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
}

export default {
  components: { runTable },
  data() {
    return {
      competitors: competitors
    };
  },
  methods: {
    importCsv() {
      dialog.showOpenDialog(function(fileNames) {
        var fileName = fileNames[0];
        if (fileNames === undefined) {
          return console.log("no file selected");
        }
        if (fileName.split(".")[1] == "csv") {
          console.log("File accepted, generating competitor list...");
          alert("File accepted, generating competitor list...");
          fs.readFile(fileName, "utf8", function(err, data) {
            if (err) {
              throw err;
            }
            if (data) {
              csvJson(data);
            }
          });
        } else {
          console.log("filetype incorrect, please select a CSV file");
          alert("filetype incorrect, please select a CSV file");
        }
      });
    }
  }
};
</script>

<style>
</style>

