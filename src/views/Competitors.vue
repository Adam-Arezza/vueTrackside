<template>
  <div class="competitors">
    <b-table striped :items="competitors"></b-table>
  </div>
</template>

<script>
import competitorList from '../components/runTable.vue'

export default {
  data(){
    return {
      competitors: competitorList.data.competitorList
    }
  }
}
</script>

<style>

</style>

