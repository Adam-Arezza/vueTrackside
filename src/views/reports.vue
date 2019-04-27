<template>
    <div class="reports">
            <b-button class="collapseBtn" v-b-toggle.overall>Overall Ftd</b-button>
            <b-collapse id="overall">
                <p>Overall Fastest Time of the day table!</p>
                <b-table :items="overallFtd" :fields="overallFields"></b-table>
            </b-collapse>
            <b-button class="collapseBtn" v-b-toggle.class>Class Ftd</b-button>
            <b-collapse id="class">
                <p>Class Fastest Time of the day table!</p>
                <b-table :items="classFtd" :fields="classFields"></b-table>
            </b-collapse>
            <b-button class="collapseBtn" v-b-toggle.sector>Sector Ftd</b-button>
            <b-collapse id="sector">
                <p>Sector Fastest Time of the day table!</p>
                <b-table :items="sectorFtd" :fields="sectorFields"></b-table>
            </b-collapse>
    </div>
</template>

<script>
export default {
    data() {
        return {
            overallFtd: [],
            classFtd: [],
            sectorFtd: [],
            overallFields: ["driver", "class", "Ftd"],
            classFields: ["class", "driver", "run", "Ftd"],
            sectorFields: ["sector", "driver", "Ftd" ]
        }
    },
    methods: {
        GetOverallFtd() {

        },
        GetClassFtd() {

        },
        GetSectorFtd() {

        }
    },
    computed: {
        competitors() {
            return this.$store.state.competitors
        }
    }
}
</script>

<style>
.reports {
    width: 100%;
    text-align: center;
}
.collapseBtn {
    width: 90%;
    margin: 5px;
}
</style>
