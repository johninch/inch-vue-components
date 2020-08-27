import Vue from 'vue'
import InchRouter from './inch-router'
import Home from '../views/Home.vue'

Vue.use(InchRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        // 增加嵌套路由
        path: '/Home/info',
        component: {
          render(h) {
            return h('div', 'info page')
          }
        }
      }
    ]
  },
  {
    path: '/view-store',
    name: 'ViewStore',
    // route level code-splitting
    // this generates a separate chunk (view-store.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "view-store" */ '../views/ViewStore.vue')
  }
]

const router = new InchRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
