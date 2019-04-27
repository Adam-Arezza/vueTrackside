<template>
  <div class="competitors">
    <b-table striped :items="competitors" :fields="fields">
      <template slot="show_details" slot-scope="row">
        <b-button size="sm" @click.stop="row.toggleDetails" class="mr-2">
       {{row.detailsShowing ? 'Hide' : 'Show'}} Details
      </b-button>
      </template>
      <template slot="row-details" slot-scope="row">
      <b-card>
        <b-row no-gutters>
          <div class="col-sm-4">
            <p><strong>Make:</strong> {{row.item.Make}}</p>
            <p><strong>Model:</strong> {{row.item.Model}}</p>
            <p><strong>Year:</strong> {{row.item.Year}}</p>
            <p><strong>Tire:</strong> {{row.item.Tire}}</p>
          </div>
          <div class="col-sm-8">
            <!-- <p>{{JSON.stringify(row.item.Runs)}}</p> -->
            <div class="runInfo" v-for="(run, index) in row.item.Runs" :key="index">
              <h5>{{index.toUpperCase()}}</h5>
              <div v-for="(item, heading) in run" :key="heading">
                <p><strong>{{heading}}: </strong>{{item}}</p>
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

export default {
  data(){
    return {
      fields: [
        {key:'Car'},
        {key:'Name'},
        {key:'Class',
        sortable: true},
        {key: 'show_details'}
      ],
      competitors: this.$store.state.competitors
    }
  }
}
</script>

<style scoped>
h3 {
  background: rgb(120, 141, 148);
  color: black;
  padding: 3px;
}
h5 {
  background: rgb(106, 166, 185);
  color: black;
  padding: 3px;
}
.competitors p {
  font-size: 1.2rem;
}
.runInfo p{
  text-align: center;
}

</style>



