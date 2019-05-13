<template>
  <div class="container-fluid gatesSetup">
    <p>Select the total number of gates for the session including start and finish gates.</p>
    <!-- <input id="numGates" v-model="gateNumber"> -->
    <div class="row no-gutters">
      <div class="col-sm-5 offset-sm-1">
        <b-form-group>
          <b-form-radio-group stacked v-model="selected" :options="options"></b-form-radio-group>
        </b-form-group>
        <p>Number of gates: {{selected}}</p>
        <b-button @click="generateGates()" size="lg">Set</b-button>
      </div>
      <div class="col-sm-6">
        <div class="gates" v-for="(gate, index) in getGates" :key="index">
          Gate {{index}}
          <b-button size="sm" @click="pingGate(index)">Ping Gate</b-button>
          <p>{{gateResponse}}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      selected: 0,
      options: [
        { text: "2 gates", value: 2 },
        { text: "3 gates", value: 3 },
        { text: "4 gates", value: 4 }
      ],
      gateResponse: ""
    };
  },
  methods: {
    //sets the number of gates for the autocross event into the store
    generateGates() {
      var gates = {};
      var numberOfGates = this.gateNumber;
      for (var i = 0; i < numberOfGates; i++) {
        gates[i] = [];
      }
      this.$store.commit("setGates", gates);
    }
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
.gates {
  padding: 15px;
}
</style>
