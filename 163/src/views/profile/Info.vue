<template>
  <div class="info-page">
    <h2 class="page-title">个人资料</h2>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="info-form"
    >
      <el-form-item label="头像">
        <el-avatar :size="80" :src="form.avatar" class="avatar" />
        <el-button type="primary" link style="margin-left: 16px;">
          修改头像
        </el-button>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" disabled />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio value="男">男</el-radio>
          <el-radio value="女">女</el-radio>
          <el-radio value="保密">保密</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="form.birthday"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="loading">
          保存修改
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { validatePhone, validateEmail } from '@/utils'

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  avatar: '',
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: '',
  birthday: ''
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!validatePhone(value)) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!validateEmail(value)) {
          callback(new Error('请输入正确的邮箱地址'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

onMounted(() => {
  if (userStore.currentUser) {
    Object.assign(form, { ...userStore.currentUser })
  }
})

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        userStore.updateProfile({ ...form })
        loading.value = false
        ElMessage.success('保存成功')
      }, 500)
    }
  })
}

const handleReset = () => {
  if (userStore.currentUser) {
    Object.assign(form, { ...userStore.currentUser })
  }
  formRef.value?.clearValidate()
}
</script>

<style lang="scss" scoped>
.info-page {
  .info-form {
    max-width: 500px;
  }

  .avatar {
    border: 2px solid #e4e7ed;
  }
}
</style>
