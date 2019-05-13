<template>
  <div class="reports">
    <b-button class="collapseBtn" v-b-toggle.overall>Overall Ftd</b-button>
    <b-collapse id="overall">
      <b-table small dark striped :items="GetOverallFtd" :fields="overallFields">
        <template slot="rank" slot-scope="data">{{data.index +1}}</template>
      </b-table>
    </b-collapse>
    <b-button class="collapseBtn" v-b-toggle.class>Class Ftd</b-button>
    <b-collapse id="class">
      <div v-for="(carClass, index) in classes" :key="index">
        <h4>Class {{carClass}}</h4>
        <b-table
          small
          dark
          striped
          :items="classFtd[carClass]"
          :fields="classFields"
          :sort-by="ftdSort"
          :sort-desc="false"
        >
          <template slot="rank" slot-scope="data">{{data.index +1}}</template>
        </b-table>
      </div>
    </b-collapse>
    <b-button class="collapseBtn" v-b-toggle.sector>Sector Ftd</b-button>
    <b-collapse id="sector">
      <div v-for="(sector, index) in sectors" :key="index">
        <h4>Sector {{sector}}</h4>
        <b-table
          small
          dark
          striped
          :items="sectorFtd[index]"
          :fields="sectorFields"
          :sort-by="ftdSort"
          :sort-desc="false"
        >
          <template slot="rank" slot-scope="data">{{data.index +1}}</template>
        </b-table>
      </div>
    </b-collapse>
  </div>
</template>

<script>
//imports the raceCalcs mixin
import { reportCalcs } from "../mixins/reportCalcs.js";
export default {
  mixins: [reportCalcs],
  data() {
    return {
      ftdSort: "Ftd",
      //fields for the tables
      overallFields: [
        "rank",
        { key: "carNumber" },
        { key: "carModel" },
        { key: "driver" },
        { key: "class" },
        { key: "Ftd" }
      ],
      classFields: [
        "rank",
        { key: "carNumber" },
        { key: "carModel" },
        { key: "driver" },
        { key: "run" },
        { key: "Ftd", sortable: true }
      ],
      sectorFields: [
        "rank",
        { key: "carNumber" },
        { key: "carModel" },
        { key: "driver" },
        { key: "class" },
        { key: "Ftd", sortable: true }
      ],
      classes: this.classList(),
      sectors: this.getSectors()
    };
  },
  methods: {
    //returns the main vehicle classes as an array
    classList() {
      var classes = [];
      var cList = this.$store.state.classList;
      cList.forEach(c => {
        classes.push(c.class);
      });
      return classes;
    },
    //returns the number of sectors on the course based on the number of gates set in the store
    getSectors() {
      var result = [];
      var gateCount = Object.keys(this.$store.state.gates).length;
      for (var i = 0; i < gateCount - 1; i++) {
        result.push(i + 1);
      }
      // console.log("Sector count: " + result)
      return result;
    }
  },
  computed: {
    //returns the competitors list from the store
    competitors() {
      return this.$store.state.competitors;
    },
    //returns the Ftds for each class using the mixin function from raceCalcs mixin
    classFtd() {
      return this.getClassFtd();
    },
    //returns the Ftds for each sector using the mixin function from raceCalcs mixin
    sectorFtd() {
      return this.getSectorFtd();
    }
  }
};
</script>

<style>
.reports {
  width: 100%;
  text-align: center;
}
.collapseBtn {
  width: 95%;
  margin: 3px;
  font-size: 20px !important;
}
h4 {
  background: rgb(20, 20, 20);
  color: white;
  margin-bottom: 0px !important;
}
table {
  margin: 0px !important;
}
</style>
