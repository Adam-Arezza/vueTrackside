<template>
  <div class="container-fluid gatesSetup">
    <b-row no-gutters align-h="center">
      <b-col v-if="Object.keys(getGates).length == 0">
        <p>Please set the number of gates on the main screen.</p>
      </b-col>
      <b-col v-if="Object.keys(getGates).length > 0">
        <div class="gates" v-for="(gate, index) in getGates" :key="index">
          Gate {{index}}
          <b-button size="sm" @click="pingGate(index)">Ping Gate</b-button>
          <p>{{gateResponse}}</p>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      gateResponse: ""
    };
  },
  computed: {
    //returns the number of gates from the store
    getGates() {
      return this.$store.state.gates;
    },
    //computes the gate number based on radio btn selection
    gateNumber() {
      // console.log(this.selected);
      return this.selected;
    }
  }
};
</script>
<style scoped>
p {
  text-align: center;
}
</style>
