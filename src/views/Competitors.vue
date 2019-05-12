<template>
  <div class="competitors">
    <b-table dark small striped :items="competitors" :fields="fields">
      <template slot="show_details" slot-scope="row">
        <b-button
          size="sm"
          @click.stop="row.toggleDetails"
          class="mr-2"
        >{{row.detailsShowing ? 'Hide' : 'Show'}} Details</b-button>
      </template>
      <template slot="row-details" slot-scope="row">
        <b-card bg-variant="dark" class="infoCard">
          <b-row class="info" no-gutters>
            <div class="col-sm-5 driverInfo">
              <p>
                <strong>Make:</strong>
                {{row.item.Make}}
              </p>
              <p>
                <strong>Model:</strong>
                {{row.item.Model}}
              </p>
              <p>
                <strong>Year:</strong>
                {{row.item.Year}}
              </p>
              <p>
                <strong>Tire:</strong>
                {{row.item.Tire}}
              </p>
              <p class="specialTimes">
                <strong>Theoretical Best:</strong>
                {{theoreticalBest(row.item.Runs)}}
              </p>
              <p class="specialTimes">
                <strong>Delta:</strong>
                {{deltaTime(row.item.Runs)}}
              </p>
            </div>
            <div class="col-sm-5 runInfo">
              <!-- <p>{{JSON.stringify(row.item.Runs)}}</p> -->
              <div v-for="(run, index) in row.item.Runs" :key="index">
                <h5>{{("Run" +(index+1))}}</h5>
                <div v-for="(item, heading) in run" :key="heading">
                  <p>
                    <strong>{{heading }}:</strong>
                    {{item}}
                  </p>
                </div>
              </div>
            </div>
          </b-row>
          <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button>
        </b-card>
      </template>
    </b-table>
  </div>
</template>

<script>
// handles display of individual driver stats for the autox event
export default {
  data() {
    return {
      fields: [
        { key: "Car" },
        { key: "Name" },
        { key: "Class", sortable: true },
        { key: "show_details" }
      ]
    };
  },
  computed: {
    competitors() {
      return this.$store.state.competitors;
    }
  },
  methods: {
    theoreticalBest(driverRuns) {
      if(!driverRuns){
        return console.log("Driver has no runs")
      }
      var sectors = {};
      driverRuns.forEach(run => {
        var keys = Object.keys(run);
        for (var i = 0; i < keys.length; i++) {
          if (keys[i] != "PaxFinal" && keys[i] != "Penalty" && keys[i] != "RawFinal") {
            // console.log(keys[i],run[keys[i]])
            if (!sectors[keys[i]]) {
              sectors[keys[i]] = run[keys[i]];
            }
            if (run[keys[i]] < sectors[keys[i]]) {
              sectors[keys[i]] = run[keys[i]];
            }
          }
        }
      });
      var total = 0;
      var result = Object.values(sectors);
      for (var i = 0; i < result.length; i++) {
        total += result[i];
      }
      return total.toFixed(3);
    },
    deltaTime(driverRuns) {
      if(!driverRuns){
        return console.log("Driver has no runs")
      }
      var thb = this.theoreticalBest(driverRuns);
      var finalTimes = {};
      driverRuns.forEach(run => {
        if (!finalTimes.best) {
          finalTimes.best = run.RawFinal;
        }
        if (run.Final < finalTimes.best) {
          finalTimes.best = run.RawFinal;
        }
      });
      // console.log(finalTimes);
      return (finalTimes.best - thb).toFixed(3);
    }
  }
};
</script>

<style scoped>
h3 {
  background: rgb(120, 141, 148);
  color: black;
  padding: 3px;
}
h5 {
  background: rgb(184, 189, 190);
  color: black;
  padding: 3px;
}
.competitors p {
  font-size: 1.2rem;
}
.runInfo {
  height: 50%;
  line-height: 10px;
}
.runInfo p {
  display: flex;
  text-align: left;
  margin: 15px;
}
.specialTimes {
  display: flex;
  background: lightblue;
  color: black;
  font-size: 1.3rem;
  justify-self: end;
  width: 50%;
}
.info {
  justify-content: center;
  align-items: center;
}
</style>
