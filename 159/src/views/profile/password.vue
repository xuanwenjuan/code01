<template>
  <div class="page-container">
    <div class="card-wrapper" style="max-width: 500px; margin: 0 auto;">
      <h3 class="form-title">修改密码</h3>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            确认修改
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-alert
        title="密码安全提示"
        type="info"
        :closable="false"
        show-icon
        class="mt-20"
      >
        <ul class="tips-list">
          <li>密码长度应为 6-20 位</li>
          <li>建议包含大小写字母、数字和特殊字符</li>
          <li>定期更换密码可提高账户安全性</li>
        </ul>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { mockUpdatePassword } from '@/mock/user'

const formRef = ref()
const loading = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await mockUpdatePassword(form)
        ElMessage.success('密码修改成功，请重新登录')
        setTimeout(() => {
          window.location.href = '#/login'
        }, 1500)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleReset = () => {
  form.oldPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  formRef.value?.clearValidate()
}
</script>

<style scoped lang="scss">
.form-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 30px;
  text-align: center;
}

.tips-list {
  margin: 10px 0 0 20px;
  padding: 0;
  
  li {
    margin-bottom: 4px;
    font-size: 13px;
  }
}
</style>
