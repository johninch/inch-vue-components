<template>
    <form>
        <slot></slot>
    </form>
</template>

<script>
    export default {
        provide() {
            return {
                form: this // 直接传this实例，则 校验规则rules、校验值model都能一并传下去
            }
        },
        props: {
            model: {
                type: Object,
                required: true
            },
            rules: Object
        },
        methods: {
            // 接收一个参数，是回调
            validate(cb) {
                // 调用所有含有prop属性的子组件的validate方法并得到Promise数组
                const tasks = this.$children
                    .filter(item => item.prop)
                    .map(item => item.validate())
                // 所有任务必须全部成功才算校验通过，任一失败则校验失败
                Promise.all(tasks)
                    .then(() => cb(true))
                    .catch(() => cb(false))
            }
        },
    }
</script>
