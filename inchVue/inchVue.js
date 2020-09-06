// 数组响应式
// 1.替换数组原型中7个方法
const originalProto = Array.prototype
// 备份一份，修改备份
const arrayProto = Object.create(originalProto);
['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'].forEach(method => {
    arrayProto[method] = function() {
        // 原始操作
        originalProto[method].apply(this, arguments)
        // 覆盖操作：通知更新
        console.log('数组执行' + method + '操作')
    }
})

// 对象响应式
function defineReactive(obj, key, val) {
    // 解决嵌套对象问题：如果val是对象，需要递归，obj.baz.a = 10
    observe(val)

    // 因为dep和obj.key一一对应，所以创建dep的时机应该在这里：
    const dep = new Dep()

    Object.defineProperty(obj, key, {
        get() {
            // console.log('get', key, val)
            // 依赖收集
            Dep.target && dep.addDep(Dep.target)
            return val
        },
        set(newVal) {
            if (val !== newVal) {
                // 解决赋值是对象的情况：如果newVal是对象，也要做响应式处理，obj.baz = { a: 20 }
                observe(newVal)

                val = newVal
                // console.log('set', key, val)

                // 通知更新
                dep.notify()
            }
        }
    })
}

// 遍历指定数据对象每个key，拦截他们
function observe(obj) {
    if(typeof obj !== 'object' || obj === null) {
        return obj
    }
    // 每遇到一个对象，就创建一个Observer实例，去做拦截操作
    new Observer(obj)
}

class Observer {
    constructor(value) {
        this.value = value
        // 这里应该根据传入value的类型做不同处理
        if (Array.isArray(value)) {
            // 覆盖原型，替换7个变更操作
            value.__proto__ = arrayProto
            // 对数组内部元素执行响应式
            for (let i = 0; i < value.length; i++) {
                observe(value[i])
            }
        } else if (typeof value === 'object') {
            // 遍历对象
            this.walk(value)
        }

    }

    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key, obj[key])
        })
    }
}

// proxy代理函数：让用户可以直接访问data中的key
function proxy(vm, key) {
    Object.keys(vm[key]).forEach(k => {
        Object.defineProperty(vm, k, {
            get() {
                return vm[key][k]
            },
            set(v) {
                vm[key][k] = v
            }
        })
    })
}

function set(obj, key, val) {
    // 解决添加/删除了新属性无法检测的问题：
    defineReactive(obj, key, val)
}

// 实现InchVue构造函数
class InchVue {
    constructor(options) {
        // 0. 保存options
        this.$options = options
        this.$data = options.data

        // 1. 将data做响应式处理
        observe(this.$data)

        // 2. 为$data做代理
        proxy(this, '$data')

        // 3. 编译模板
        new Compile('#app', this)
    }
}

class Compile {
    // el：宿主元素，vm：InchVue实例
    constructor(el, vm) {
        this.$el = document.querySelector(el)
        this.$vm = vm

        // 解析模板
        if (this.$el) {
            this.compile(this.$el)
        }
    }

    compile(el) {
        // el是宿主元素
        // 遍历，判断当前遍历元素的类型 el.children只包含elements，el.childNodes包含elements和文本节点
        el.childNodes.forEach(node => {
            if (node.nodeType === 1) {
                // 是element
                // console.log('编译元素', node.nodeName)
                this.compileElement(node)
            } else if (this.isInter(node)) {
                // 文本，{{xxx}}
                // console.log('编译文本', node.textContent, RegExp.$1)
                this.compileText(node)
            }

            // 递归
            if (node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })
    }

    // 判断插值表达式
    isInter(node) {
        return node.nodeType === 3 && /\{\{(.*?)\}\}/.test(node.textContent)
    }
    // 编译文本
    compileText(node) {
        // node.textContent = this.$vm[RegExp.$1] // 到这里，只是编译完成update，初始化了动态数据，但数据不会更新
        this.update(node, RegExp.$1, 'text')
    }
    // 编译元素：分析指令、@事件
    compileElement(node) {
        // 获取属性并遍历
        const nodeAttrs = node.attributes

        Array.from(nodeAttrs).forEach(attr => {
            // 指令：k-xxx="yyy"
            const attrName = attr.name // k-xxx
            const exp = attr.value // yyy
            if (this.isDirective(attrName)) {
                const dir = attrName.substring(2) /// xxx
                // 指令实际操作方法
                this[dir] && this[dir](node, exp)
            }
            // 事件处理
            if (this.isEvent(attrName)) {
                // @click="onClick"
                const dir = attrName.substring(1) // click
                // 事件监听
                this.eventHandler(node, exp, dir)
            }
        })
    }

    isEvent(dir) {
        return dir.indexOf('@') === 0
    }

    eventHandler(node, exp, dir) {
        // methods: {onClick:function(){}}
        const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp]
        node.addEventListener(dir, fn.bind(this.$vm)) // 记得 bind this
    }

    isDirective(attr) {
        return attr.indexOf('k-') === 0
    }

    // k-model="xxx"
    model(node, exp) {
        // update方法只完成赋值和更新
        this.update(node, exp, 'model')
        // 还需要做事件监听
        node.addEventListener('input', e => {
            // 将新的值赋值给数据即可
            this.$vm[exp] = e.target.value
        })
    }

    modelUpdater(node, val) {
        // 表单元素赋值
        node.value = val
    }


    // 每个指令，都对应一个调用高阶update的更新函数，以及一个实际的操作函数
    // 执行text指令对应的更新函数
    text(node, exp) {
        this.update(node, exp, 'text')
    }
    // k-text 对应操作函数
    textUpdater(node, val) {
        node.textContent = val
    }

    // html(node, exp) {
    //     node.innerHTML = this.$vm[exp]
    // }
    html(node, exp) {
        this.update(node, exp, 'html')
    }

    htmlUpdater(node, val) {
        node.innerHTML = val
    }

    // 提取update为高阶函数，初始化和创建更新函数
    update(node, exp, dir) {
        const fn = this[dir+'Updater']
        // 初始化
        fn && fn(node, this.$vm[exp])

        // 更新
        new Watcher(this.$vm, exp, function(val) {
            fn && fn(node, val)
        })
    }

}

// const watchers = []

// watcher: 跟视图中的依赖一对一
class Watcher {
    constructor(vm, key, updaterFn) {
        this.vm = vm
        this.key = key
        this.updaterFn = updaterFn

        // 依赖收集触发
        // watchers.push(this)
        Dep.target = this
        this.vm[this.key] // 触发上面的get
        Dep.target = null
    }

    update() {
        this.updaterFn.call(this.vm, this.vm[this.key])
    }
}

// dep：和某个key对应，管理多个watcher，数据更新时通知他们做更新
class Dep {
    constructor() {
        this.dep = []
    }

    addDep(watcher) {
        this.dep.push(watcher)
    }

    notify() {
        this.dep.forEach(watcher => watcher.update())
    }
}

// 测试
const obj = {arr: [1, 2, 3]};
observe(obj)
obj.arr.push(4) // 输出：‘数组执行push操作’