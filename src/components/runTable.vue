<template>
  <div class="runTable">
    <div class="row no-gutters">
    <b-table class="col-sm-8" striped :fields="fields"></b-table>
    <select id="selector" class="offset-sm-1 col-sm-2" v-if="competitors.length > 2">
        <option v-for="(competitor, index) in competitors" :key="index">
            Car#: {{competitor.Car}}
            Driver: {{competitor.Name}}
        </option>
    </select>
    <!-- <button @click="show">show</button> -->
    </div>
  </div>
</template>

<script>

export default {
    props: {
        competitors: Array
    },
  data() {
    return {
      fields:['Car Number', 'Driver', 'Make', 'Sector 1', 'Sector 2', 'Sector 3', 'Final' ]
    };
  },
  methods: {
      show(){
          console.log(this.competitors)
      }
    }
};
</script>

<style>
#selector{
    max-height: 30px;
}
</style>
