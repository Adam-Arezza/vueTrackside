<template>
  <div id="app">
    <div id="nav">
      <b-button-group>
        <b-dropdown id="file-dropdown" text="File" class="sm">
          <b-dropdown-item @click="importCsv()" class="sm">Import</b-dropdown-item>
          <b-dropdown-item>Export</b-dropdown-item>
          <b-dropdown-item>Save</b-dropdown-item>
          <b-dropdown-item>Close</b-dropdown-item>
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
      </b-button-group>
    </div>
    <router-view/>
  </div>
</template>
<script>
import fs from "fs";
const { dialog } = require("electron").remote;

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
      
    };
  },

  methods: {
    importCsv() {
      var store = this.$store;
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
              store.commit("importList", csvJson(data));
            }
          });
        } else {
          console.log("filetype incorrect, please select a CSV file");
          alert("filetype incorrect, please select a CSV file");
        }
      });
    }
  },
  computed: {
    stagedList(){
      return this.$store.state.staged
    },
    disabledLink(){
      if(this.stagedList.length >= 1){
        return true
      }
      if(this.stagedList.length < 1){
        return false
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
  padding: 10px;
}
#nav button {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  padding: 10px;
  background: black;
}

#nav a:hover {
  text-decoration: none;
}

#nav .dropdown-item {
  color:black;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
.disabled {
  pointer-events: none;
}
</style>
