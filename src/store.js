import Vue from 'vue'
import Vuex from 'vuex'
import ClassPax from './classes'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    competitors: [],
    connection: {},
    liveRun:[],
    staged: [],
    gates: {},
    runCount: 1,
    classList: ClassPax
  },
  mutations: {
    importList(state, list){
      state.competitors = list
    },
    newConnect(state,device){
      state.connection = {"device": device[0], "port": device[1]}
      console.log(state.connection)
    },
    updateRun(state, run){
      state.liveRun.push(run)
    },
    stageNew(state, driver){
      state.staged.unshift(driver)
    },
    removeFromStaged(state){
      state.staged.pop()
    },
    newRun(state){
      state.liveRun = []
      state.runCount++
    },
    setGates(state, num) {
      state.gates = num
      console.log("gates at the store: ", state.gates)
    },
    disconnect(state) {
      state.connection = {}
    }
  }
})
