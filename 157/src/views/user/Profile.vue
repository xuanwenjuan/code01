<template>
  <div class="bg-white rounded-xl shadow-sm p-8">
    <h2 class="text-xl font-bold text-gray-800 mb-6">个人资料</h2>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="max-w-2xl"
    >
      <el-form-item label="头像">
        <div class="flex items-center gap-4">
          <img :src="form.avatar" class="w-24 h-24 rounded-full border-2 border-primary" />
          <el-button type="primary" plain>更换头像</el-button>
        </div>
      </el-form-item>
      
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>
      
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      
      <el-form-item label="手机号">
        <el-input v-model="form.phone" disabled />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio value="male">男</el-radio>
          <el-radio value="female">女</el-radio>
          <el-radio value="secret">保密</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="form.birthday"
          type="date"
          placeholder="选择生日"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">
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

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  avatar: '',
  nickname: '',
  username: '',
  phone: '',
  email: '',
  gender: 'female',
  birthday: ''
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为2-20个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    setTimeout(async () => {
      await userStore.updateUserInfo(form)
      loading.value = false
      ElMessage.success('保存成功')
    }, 1000)
  } catch (error) {
    console.log('表单验证失败')
  }
}

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  initForm()
}

const initForm = () => {
  const userInfo = userStore.userInfo
  if (userInfo) {
    form.avatar = userInfo.avatar
    form.nickname = userInfo.nickname
    form.username = userInfo.username
    form.phone = userInfo.phone
    form.email = userInfo.email
    form.gender = userInfo.gender
    form.birthday = userInfo.birthday
  }
}

onMounted(() => {
  initForm()
})
</script>
