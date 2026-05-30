<template>
  <div class="profile-page">
    <h2 class="page-title">个人信息</h2>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="profile-form"
    >
      <el-form-item label="头像">
        <el-avatar :size="80" :src="formData.avatar" class="avatar-preview" />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" disabled />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio value="male">男</el-radio>
          <el-radio value="female">女</el-radio>
          <el-radio value="secret">保密</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="formData.birthday"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="userStore.loading" @click="handleSubmit">
          保存修改
        </el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const formRef = ref(null)

const formData = reactive({
  avatar: '',
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 'secret',
  birthday: ''
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ]
}

const initForm = () => {
  if (userStore.user) {
    Object.assign(formData, {
      avatar: userStore.user.avatar,
      username: userStore.user.username,
      nickname: userStore.user.nickname,
      phone: userStore.user.phone,
      email: userStore.user.email,
      gender: userStore.user.gender || 'secret',
      birthday: userStore.user.birthday || ''
    })
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const result = await userStore.updateProfile({
    nickname: formData.nickname,
    phone: formData.phone,
    email: formData.email,
    gender: formData.gender,
    birthday: formData.birthday
  })

  if (result.success) {
    ElMessage.success('修改成功')
  } else {
    ElMessage.error('修改失败')
  }
}

const resetForm = () => {
  initForm()
  formRef.value?.resetFields()
}

onMounted(() => {
  initForm()
})
</script>

<style lang="scss" scoped>
.profile-page {
  .page-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid $border-light;
  }

  .profile-form {
    max-width: 500px;

    .avatar-preview {
      margin-right: 16px;
    }
  }
}
</style>
