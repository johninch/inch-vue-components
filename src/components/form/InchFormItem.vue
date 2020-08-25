<template>
    <div>
        <label v-if="label">{{label}}</label>
        <slot></slot>
        <p class="error" v-if="error">{{error}}</p>
    </div>
</template>

<script>
    import Schema from 'async-validator';

    export default {
        inject: ['form'], // 注入
        props: {
            label: {
                type: String,
                default: ''
            },
            prop: {
                type: String
            }
        },
        data() {
            return {
                error: ''
            }
        },
        mounted() {
            // InchFormItem在mounted钩子中监听校验触发
            this.$on('validate', () => {
                this.validate()
            });
        },
        methods: {
            validate() {
                // 校验规则
                const rules = this.form.rules[this.prop]
                // 校验值
                const value = this.form.model[this.prop] // 注意value是变化的，因为外面是双向绑定的，且provide的是对象

                // 创建校验器实例
                const validator = new Schema({ [this.prop]: rules }) // 使用ES6的计算属性设置键名

                // 校验，返回 Promise，因为校验有可能是异步操作
                return validator.validate({ [this.prop]: value }, errors => {
                    if (errors) {
                        // 显示错误信息
                        this.error = errors[0].message
                    } else {
                        this.error = ''
                    }
                })
            }
        },
    }
</script>

<style scoped>
.error {
    color: red
}
</style>