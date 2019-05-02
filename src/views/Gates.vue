<template>
  <div class="container-fluid gatesSetup">
    <label for="numGates">Enter the number of gates</label>
    <input id="numGates" v-model="gateNumber">
    <button @click="generateGates()">Set</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      gateNumber: 0
    };
  },
  methods: {
    generateGates() {
      var gates = {};
      var numberOfGates = this.gateNumber;
      for (var i = 0; i < numberOfGates; i++) {
        gates[i] = [];
      }
      this.$store.commit("setGates", gates);
    }
  }
};
</script>
<style>
label {
  padding: 10px;
  font-size: 1.2rem;
}
input {
  margin: 10px;
  min-width: 10%;
  max-width: 10%;
}
</style>


