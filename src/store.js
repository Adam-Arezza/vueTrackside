import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    competitors: [],
    connection: {},
    liveRun:[],
    staged: [],
    runCount: 1
  },
  mutations: {
    importList(state, list){
      state.competitors = list
    },
    newConnect(state,device,port){
      state.connection = {"device": device, "port": port}
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
    }
  },
  actions: {

  }
})
