import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

new Vue({
  // 挂载的目的是什么？让我们可以在插件中访问到Router实例，就是执行混入的beforeCreate钩子中挂载$router
  router,

  store,
  render: h => h(App)
}).$mount('#app')
