// 实现一个插件：返回一个函数或返回一个对象，它提供一个install方法

// Vue构造函数本地变量
let _Vue

class InchRouter {
    // 处理路由选项 routes路由表
    constructor(options) {
        this.$options = options

        // 缓存path和route映射关系
        this.routeMap = {}
        this.$options.routes.forEach(
            route => {
                this.routeMap[route.path] = route
            }
        )

        // 需要定义一个响应式的current属性，每次改变后都触发render函数重渲
        // 在Vue的api中有一个defineReactive，可以给对象定义响应式数据
        const initial = window.location.hash.slice(1) || '/'
        _Vue.util.defineReactive(this, 'current', initial)

        // 监控url变化
        window.addEventListener('hashchange', this.onHashChange.bind(this))
        window.addEventListener('load', this.onHashChange.bind(this))
    }

    onHashChange() {
        // 只要#后面的部分
        this.current = window.location.hash.slice(1)
        console.log(this.current)
    }
}

InchRouter.install = function(Vue) {
    // 引用Vue构造函数，在上面InchRouter中使用
    // 这里之所以不直接从外部import Vue构造函数进来，是因为插件应该避免打包的时候把Vue打进来
    _Vue = Vue

    // 1. 挂载 $router
    // 目标就是将 router实例 挂载到 Vue的原型对象 上
    // 但这里有个问题，install的时候，router实例（$router）还没有创建，如何挂载呢
    // Vue.prototype.$router = function() {}
    // 解决方法是，使用混入，通过生命周期钩子，来延后这段代码的执行
    // 使用全局混入，给未来所有组件在beforeCreate中，都需要执行挂载$router的任务
    Vue.mixin({
        // 这里是全局混入，所有组件都会在这个钩子执行这段代码
        beforeCreate() {
            // 此处的this指的是组件实例，只有main.js中new Vue()的组件实例才传入了router，其他组件没有，所以要条件执行
            if (this.$options.router) {
                Vue.prototype.$router = this.$options.router // main.js中，new Vue传入了router，就是这里拿到挂载的
            }
        }
    })

    // 2. 定义两个全局组件 router-link, router-view
    Vue.component('router-link', {
        // 可以写template，也可以写render函数，但render函数的优先级更高
        // template: '<a>'
        props: {
            to: {
                type: String,
                require: true
            }
        },
        render(h) {
            // <router-link to="/about">xxx</router-link>
            // 转换成
            // <a href="#/about">xxx</a>
            return h('a', {
                attrs: {
                    href: '#' + this.to
                }
            }, this.$slots.default)
        }
    })
    Vue.component('router-view', {
        render(h) {
            let component = null

            const { routeMap, current } = this.$router
            component = routeMap[current] ? routeMap[current].component : null

            // 渲染传入的组件
            return h(component)
        }
    })
}

export default InchRouter
