import Vue from 'vue'

// 方法1
// Component - 组件配置对象
// props - 传递给它的属性
function create(Component, props) {
    // 1.构建Component的实例
    const vm = new Vue({
        render(h) {
            // h是createElement
            // 它可以返回一个vnode
            return h(Component, { props })
        }
    }).$mount()
    // 一般 $mount() 需要指定挂载点，比如弹窗组件应挂载到body上，但这里的行为是覆盖的，所以应该之后追加到body上而不是直接挂载覆盖
    // 不设置挂载目标，依然可以转换vnode为真实节点$el

    // 2.挂载到body上
    // $mount()会产生一个真实节点$el，可以手动追加到body上
    document.body.appendChild(vm.$el)

    // 3.获取组件实例
    const comp = vm.$children[0]

    comp.remove = () => {
        // 移除组件实例，释放内存
        document.body.removeChild(vm.$el)
        vm.$destroy()
    }

    return comp
}

// 方法2
// function create(Component, props) {
//     // 构建Component的实例
//     const Ctor = Vue.extend(Component)
//     // 获得组件实例
//     const comp = new Ctor({propsData: props})
//     // 必须挂载，得到真实dom$el
//     comp.$mount()
//     // 追加都body上
//     document.body.appendChild(comp.$el)

//     comp.remove = () => {
//         // 移除组件实例，释放内存
//         document.body.removeChild(comp.$el) // 注意，这里不是vm了
//         comp.$destroy()
//     }

//     return comp
// }

export default create
