<template>
  <div class="main">
    <div class="row no-gutters">
    <div class="col-sm-3">
    <select
        v-model="selectedDriver"
        id="selector"
        v-if="competitors.length > 2"
      >
        <option v-for="(competitor, index) in competitors" :key="index">
          Car#: {{competitor.Car}}
          Driver: {{competitor.Name}}
        </option>
      </select>
    </div>
    <div class="col-sm-9">
    <runTable 
    :competitors="competitors"
    :liveRun="this.$store.state.liveRun"
    :selectedDriver="selectedDriver"
    ></runTable>
    </div>
  </div>
  </div>
</template>

<script>
// @ is an alias to /src
import runTable from "../components/runTable.vue";

export default {
  components: { runTable },
  data() {
    return {
      selectedDriver: ""
    };
  },
  methods: {

  },
  computed: {
    competitors(){
      return this.$store.state.competitors
    }
  }
};
</script>

<style>
#selector {
  max-height: 30px;
  margin: 10px;
  width: 80%;
}
</style>

