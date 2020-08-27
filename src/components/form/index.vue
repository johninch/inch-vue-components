<template>
    <div>
        <InchForm :model="model" :rules="rules" ref="loginForm">
            <InchFormItem label="用户名" prop="username">
                <InchInput v-model="model.username" placeholder="请输入用户名"></InchInput>
                <!-- {{model.username}} -->
            </InchFormItem>
            <InchFormItem label="密码" prop="password">
                <InchInput type="password" v-model="model.password" placeholder="请输入密码"></InchInput>
            </InchFormItem>
            <InchFormItem>
                <button @click="login">登录</button>
            </InchFormItem>
        </InchForm>
    </div>
</template>

<script>
import InchForm from '@/components/form/InchForm.vue';
import InchFormItem from '@/components/form/InchFormItem.vue';
import InchInput from '@/components/form/InchInput.vue';
import create from '@/utils/create';
import Notice from '@/components/Notice/Notice.vue';

export default {
    components: {
        InchForm,
        InchFormItem,
        InchInput
    },
    data() {
        return {
            model: {
                username: '',
                password: ''
            },
            rules: {
                username: [{required: true, message: '必须输入用户名'}],
                password: [{required: true, message: '必须输入密码'}],
            }
        };
    },
    methods: {
        login() {
            this.$refs.loginForm.validate(valid => {
                // if (valid) {
                //     alert('校验通过，可以登录')
                // } else {
                //     alert('登录失败')
                // }
                create(Notice, {
                    title: '这是弹窗组件呀',
                    message: valid ? '校验通过，可以登录' : '校验失败'
                }).show()
            })
        }
    },
};
</script>
