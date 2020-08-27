let _Vue // 缓存传入的Vue构造器

class Store {
    constructor(options) {
        this._mutations = options.mutations
        this._actions = options.actions
        // 创建响应式的state
        // _Vue.util.defineReactive(this, 'state', {})
        // 也可以“借鸡生蛋”
        // data中的任何一个key，都会代理到Vue的实例上去
        // this.$store.state.xxx
        // this.state = new _Vue({
        //     data() {
        //         return options.state
        //     }
        // })
        this._vm = new _Vue({
            data() {
                return {
                    // 这里不希望被代理，就在前面加上一个$，或者前面加上一个_，这样次变量就不会被代理到实例上了（这是源码里约定的）
                    // 为什么不希望被代理呢？因为你不希望用户通过$store.counter直接取到值，而是希望通过$store.state.counter取值
                    $$state: options.state
                }
            }
        })

        // 修改this指向
        // 因为在action中，当内部包裹了setTimeout函数，导致commit或者dispatch在执行时，this丢失，则会报错
        // 因此，这里就像react那样，手动锁死这两个方法的this指向
        // 或者在定义commit和dispatch时，就用箭头函数锁死this
        this.commit = this.commit.bind(this)
        this.dispatch = this.dispatch.bind(this)
    }

    get state() {
        return this._vm._data.$$state // _data是vue初始化后创建的，和$data一样
    }

    set state(v) {
        // vuex中，state是只读的，不能直接改变，所以应该直接报错
        console.error('please use replaceState to reset state')
    }

    // 修改state
    // this.$store.commit('add', 1)
    commit(type, payload) { // 这里用箭头函数的话就不用手动bindthis了
        // 获取type对应的mutation
        const entry = this._mutations[type]

        if (!entry) {
            console.error('unknown mutation')
            return
        }

        // 传入state作为参数
        entry(this.state, payload)
    }

    dispatch(type, payload) {
        // 获取type对应的action
        const entry = this._actions[type]

        if (!entry) {
            console.error('unknown action')
            return
        }

        // 传入当前Store实例做上下文
        // 之所以return是为了适配异步的情况
        return entry(this, payload)
    }
}

const install = function(Vue) {
    _Vue = Vue;

    // 全局混入
    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store
            }
        }
    })
}

// 因为导出的对象是vuex，实例化的写法是这样的：new Vuex.Store()
export default {
    Store,
    install
}
