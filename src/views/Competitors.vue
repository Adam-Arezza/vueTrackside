<template>
  <div class="competitors">
    <b-table small striped :items="competitors" :fields="fields">
      <template slot="show_details" slot-scope="row">
        <b-button
          size="sm"
          @click.stop="row.toggleDetails"
          class="mr-2"
        >{{row.detailsShowing ? 'Hide' : 'Show'}} Details</b-button>
      </template>
      <template slot="row-details" slot-scope="row">
        <b-row class="info" no-gutters align-v="start" align-h="center">
          <b-col class="driverInfo" md="2">
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
          </b-col>
          <b-col md="2">
            <p>
              <strong>Theoretical Best:</strong>
              {{theoreticalBest(row.item.Runs)}}
            </p>
            <p>
              <strong>Delta:</strong>
              {{deltaTime(row.item.Runs)}}
            </p>
          </b-col>
          <b-col md="8" class="runInfo">
            <!-- <p>{{JSON.stringify(row.item.Runs)}}</p> -->
            <b-row v-for="(run, index) in row.item.Runs" :key="index">
              <b-col md="12">
                <h5>{{("Run" +(index+1))}}</h5>
              </b-col>
              <b-col v-for="(item, heading) in run" :key="heading">
                <div class="header">
                  <strong>{{heading}}</strong>
                </div>
                <div class="data">{{item}}</div>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button>
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
  methods: {
    //returns the drivers theoretical best run time based on their fastest sectors of the day
    theoreticalBest(driverRuns) {
      if (!driverRuns) {
        return console.log("Driver has no runs");
      }
      var sectors = {};
      driverRuns.forEach(run => {
        var keys = Object.keys(run);
        for (var i = 0; i < keys.length; i++) {
          if (
            keys[i] != "PaxFinal" &&
            keys[i] != "Penalty" &&
            keys[i] != "RawFinal" &&
            keys[i] != "PenaltyFinal"
          ) {
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
    //returns the difference between the drivers theoretical best time and their current fastest run
    deltaTime(driverRuns) {
      if (!driverRuns) {
        return console.log("Driver has no runs");
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
      var result = Number((finalTimes.best - thb).toFixed(3));
      return result;
    }
  },
  computed: {
    //returns the competitor info from the store
    competitors() {
      return this.$store.state.competitors;
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
.info {
  justify-content: center;
  align-items: center;
}
.header, .data {
  margin: 5px;
  padding: 5px;
}
</style>
