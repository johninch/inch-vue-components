<template>
    <div>
        <!-- 自定义组件双向绑定 -->
        <input :type="type" :value="value" @input="onInput" v-bind="$attrs">
    </div>
</template>

<script>
    export default {
        inheritAttrs: false, // 禁止继承父组件属性，因为会直接继承到InchForm的包裹div上
        props: {
            type: {
                type: String,
                default: 'text'
            },
            value: {
                type: String,
                default: ''
            }
        },
        methods: {
            onInput(e) {
                this.$emit('input', e.target.value)

                // 触发校验
                // this.$emit('validate') 这样是没办法写的，因为外层的InchFormItem中是插槽
                // 插槽还没有被替换层最外层的InchForm，所以无法绑定事件，因此需要另辟蹊径
                // 参考事件总线eventBus的实现：事件的派发者和监听者，必须是同一个角色，
                // 如果当前实例InchInput派发时，则在外层使用InchInput时也必须是它自己监听
                // 同理，考虑让父组件，即 InchFormItem来派发和监听
                this.$parent.$emit('validate')
            }
        },
    }
</script>
