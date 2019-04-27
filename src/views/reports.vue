<template>
  <div class="reports">
    <b-button class="collapseBtn" v-b-toggle.overall>Overall Ftd</b-button>
    <b-collapse id="overall">
      <b-table :items="GetOverallFtd" :fields="overallFields" :sort-by="ftdSort" :sort-desc="false"></b-table>
    </b-collapse>
    <b-button class="collapseBtn" v-b-toggle.class>Class Ftd</b-button>
    <b-collapse id="class">
      <div v-for="(carClass, index) in classes" :key="index">
        <h4>Class {{carClass}}</h4>
        <b-table :items="getClassFtd[index]" :fields="classFields" :sort-by="ftdSort" :sort-desc="false"></b-table>
      </div>
    </b-collapse>
    <b-button class="collapseBtn" v-b-toggle.sector>Sector Ftd</b-button>
    <b-collapse id="sector">
      <div v-for="(sector, index) in sectors" :key="index">
        <h4>Sector {{sector}}</h4>
        <b-table :items="getSectorFtd[index]" :fields="sectorFields" :sort-by="ftdSort" :sort-desc="false"></b-table>
      </div>
    </b-collapse>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ftdSort: "Ftd",
      overallFields: [
        { key: "driver" },
        { key: "class" },
        { key: "Ftd", sortable: true }
      ],
      classFields: [
        { key: "driver" },
        { key: "run" },
        { key: "Ftd", sortable: true }
      ],
      sectorFields: [{ key: "driver" }, { key: "Ftd", sortable: true }],
      classes: ["A", "B", "C", "D"],
      sectors: ["1", "2", "3"]
    };
  },
  computed: {
    competitors() {
      return this.$store.state.competitors;
    },
    GetOverallFtd() {
      var result = [];
      this.competitors.forEach(competitor => {
        var runTimes = [];
        if (competitor.Runs) {
          Object.keys(competitor.Runs).forEach(run => {
            runTimes.push(competitor.Runs[run].Final);
          });
        }
        if (runTimes.length > 0) {
          var fastestTime = Math.min(...runTimes);
          var fastestRun
          Object.keys(competitor.Runs).forEach(run => {
            if(competitor.Runs[run].Final == fastestTime){
              fastestRun = run
            }
          })
          // console.log("The fastest run: ",fastestRun)
          result.push({
            driver: competitor.Name,
            class: competitor.Class,
            run: fastestRun[3],
            Ftd: fastestTime
          });
        }
      });
      // console.log("GetoverallTimes result: ", result)
      return result;
    },
    getClassFtd() {
      var result = []
      var classA = []
      var classB = []
      var classC = []
      var classD = []
      this.GetOverallFtd.forEach(competitor => {
        switch (competitor.class){
          case "A":
          classA.push(competitor)
          break
          case "B":
          classB.push(competitor)
          break
          case "C":
          classC.push(competitor)
          break
          case "D":
          classD.push(competitor)
          break
        }
      })
    result.push(classA,classB,classC,classD)
    console.log(result)
    return result
    },
    getSectorFtd() {
      var result = []
      var sector1Fastest = []
      var sector2Fastest = []
      var sector3Fastest = []
      this.competitors.forEach(competitor => {
        var sector1 = []
        var sector2 = []
        var sector3 = []
        if(competitor.Runs){
          Object.keys(competitor.Runs).forEach(run => {
            var sectors = Object.keys(competitor.Runs[run])
            sector1.push(competitor.Runs[run][sectors[0]])
            sector2.push(competitor.Runs[run][sectors[1]])
            sector3.push(competitor.Runs[run][sectors[2]])
          })
        }
        var fastestS1 = Math.min(...sector1)
        var fastestS2 = Math.min(...sector2)
        var fastest3 = Math.min(...sector3)
        sector1Fastest.push({driver:competitor.Name, Ftd:fastestS1})
        sector2Fastest.push({driver:competitor.Name, Ftd:fastestS2})
        sector3Fastest.push({driver:competitor.Name, Ftd: fastest3})
      })
      result.push(sector1Fastest, sector2Fastest, sector3Fastest)
      return result
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
  width: 90%;
  margin: 5px;
}
h4 {
  background: rgb(106, 166, 185);
  color: black;
  padding: 3px;
}
</style>
