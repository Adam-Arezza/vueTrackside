<template>
  <div class="competitors">
    <b-table striped :items="competitors" :fields="fields">
      <template slot="show_details" slot-scope="row">
        <b-button size="sm" @click.stop="row.toggleDetails" class="mr-2">
       {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
      </b-button>
      </template>
      <template slot="row-details" slot-scope="row">
      <b-card>
        <b-row no-gutters>
          <div class="col-sm-6">
            <p>Make: {{row.item.Make}}</p>
            <p>Model: {{row.item.Model}}</p>
            <p>Year: {{row.item.Year}}</p>
            <p>Tire: {{row.item.Tire}}</p>
          </div>
          <div class="col-sm-6">
            <h3>Runs</h3>
            <p>{{JSON.stringify(row.item.Runs)}}</p>
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

<style>

</style>

