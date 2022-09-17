import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    props: route => ({ query: route.query.query }),

    component: HomeView
  },
  {
    path: '/:path+',
    name: 'ViewReference',
    props: route => ({ query: route.query.query }),

    component: HomeView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
