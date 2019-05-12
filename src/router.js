import Vue from 'vue'
import Router from 'vue-router'
import Main from './views/Main.vue'
import Competitors from './views/Competitors.vue'
import Gates from './views/Gates.vue'
import Reports from "./views/reports.vue"


Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main
    },
    {
      path: '/competitors',
      name: 'competitors',
      component: Competitors
    },
    {
      path: '/gates',
      name: 'gates',
      component: Gates
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports
    }
  ]
})
