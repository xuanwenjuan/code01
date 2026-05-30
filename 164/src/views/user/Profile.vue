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
        <el-avatar :size="100" :src="formData.avatar" class="avatar-preview">
          {{ formData.nickname?.charAt(0) || 'U' }}
        </el-avatar>
      </el-form-item>
      
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" disabled placeholder="请输入用户名" />
      </el-form-item>
      
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入昵称" />
      </el-form-item>
      
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio value="1">男</el-radio>
          <el-radio value="2">女</el-radio>
          <el-radio value="0">保密</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      
      <el-form-item label="生日">
        <el-date-picker
          v-model="formData.birthday"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="个人简介">
        <el-input
          v-model="formData.bio"
          type="textarea"
          :rows="4"
          placeholder="介绍一下自己吧"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存修改</el-button>
        <el-button @click="handleReset">重置</el-button>
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
  id: '',
  username: '',
  nickname: '',
  gender: '0',
  phone: '',
  email: '',
  birthday: '',
  avatar: '',
  bio: ''
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
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSave = async () => {
  try {
    await formRef.value?.validate()
    await userStore.updateUserInfoAction(formData)
    ElMessage.success('保存成功')
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '保存失败')
    }
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  initFormData()
}

const initFormData = () => {
  if (userStore.userInfo) {
    Object.assign(formData, {
      id: userStore.userInfo.id,
      username: userStore.userInfo.username,
      nickname: userStore.userInfo.nickname || '',
      gender: userStore.userInfo.gender || '0',
      phone: userStore.userInfo.phone || '',
      email: userStore.userInfo.email || '',
      birthday: userStore.userInfo.birthday || '',
      avatar: userStore.userInfo.avatar || '',
      bio: userStore.userInfo.bio || ''
    })
  }
}

onMounted(() => {
  initFormData()
})
</script>

<style lang="scss" scoped>
.profile-page {
  .page-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 24px;
    color: $text-primary;
  }
  
  .profile-form {
    max-width: 500px;
    
    .avatar-preview {
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
