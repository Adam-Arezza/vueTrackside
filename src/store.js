import Vue from 'vue'
import Vuex from 'vuex'
import ClassPax from './classes'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    competitors: [],
    liveRun:[],
    modRun: undefined,
    staged: [],
    gates: {},
    runCount: 1,
    classList: ClassPax
  },
  mutations: {
    importList(state, list){
      state.competitors = list
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
    modifyRun(state, runData){
      var car = runData[0]
      var modifiedRun = runData[1]
      for(var i = 0 ; i < state.liveRun.length; i++){
        if(state.liveRun[i].Car == car){
          modifiedRun = {...state.liveRun[i], ...modifiedRun}
          state.liveRun.splice(i, 1, modifiedRun)
          state.modRun = modifiedRun
        }
      }
    }
  }
})
