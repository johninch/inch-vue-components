import Vue from 'vue'
import InchVuex from './inch-vuex'
// import Vuex from 'vuex'

Vue.use(InchVuex)

export default new InchVuex.Store({
  state: {
    counter: 0,
  },
  mutations: {
    add(state) {
      state.counter++
    }
  },
  actions: {
    // 此处参数上下文其实就是store实例
    add({commit}) {
      setTimeout(() => {
        // 这里在定时器内的commit的this已经丢失，所以需要在插件中锁死this
        commit('add')
      }, 1000)
    }
  },
  getters: {
    doubleCounter(state) {
      return state.counter * 2
    }
  },
  modules: {
  }
})
