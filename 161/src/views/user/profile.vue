<template>
  <div class="profile-page">
    <div class="section-card">
      <div class="card-title">个人信息</div>
      <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" style="width: 300px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="profileForm.phone" disabled style="width: 300px" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="profileForm.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
            <el-radio value="未设置">保密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="profileForm.idCard" placeholder="请输入身份证号" style="width: 300px" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" style="width: 300px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="loading">保存修改</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="section-card">
      <div class="card-title">修改密码</div>
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" style="width: 300px" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" style="width: 300px" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" style="width: 300px" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">确认修改</el-button>
          <el-button @click="handleResetPassword">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { validatePassword, validateEmail, validateIdCard, validateNotEmpty } from '@/utils/validate'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const loading = ref(false)
const passwordLoading = ref(false)
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

const profileForm = reactive({
  nickname: '',
  phone: '',
  gender: '',
  idCard: '',
  email: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileRules = {
  nickname: [
    { validator: (rule, value, callback) => {
      if (!validateNotEmpty(value)) {
        callback(new Error('请输入昵称'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  idCard: [
    { validator: (rule, value, callback) => {
      if (value && !validateIdCard(value)) {
        callback(new Error('请输入正确的身份证号'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  email: [
    { validator: (rule, value, callback) => {
      if (value && !validateEmail(value)) {
        callback(new Error('请输入正确的邮箱地址'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (!validatePassword(value)) {
        callback(new Error('密码长度需在6-20位之间'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请确认新密码'))
      } else if (value !== passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

const handleSave = async () => {
  if (!profileFormRef.value) return

  await profileFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        userStore.updateUserInfo({
          nickname: profileForm.nickname,
          gender: profileForm.gender,
          idCard: profileForm.idCard,
          email: profileForm.email
        })
        loading.value = false
        ElMessage.success('信息保存成功')
      }, 500)
    }
  })
}

const handleReset = () => {
  initProfileForm()
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      passwordLoading.value = true
      setTimeout(() => {
        passwordLoading.value = false
        ElMessage.success('密码修改成功')
        handleResetPassword()
      }, 500)
    }
  })
}

const handleResetPassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.resetFields()
}

const initProfileForm = () => {
  const userInfo = userStore.userInfo
  if (userInfo) {
    profileForm.nickname = userInfo.nickname || ''
    profileForm.phone = userInfo.phone || ''
    profileForm.gender = userInfo.gender || '未设置'
    profileForm.idCard = userInfo.idCard || ''
    profileForm.email = userInfo.email || ''
  }
}

onMounted(() => {
  initProfileForm()
})
</script>

<style lang="scss" scoped>
.profile-page {
  .section-card {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 20px;

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f5f7fa;
    }
  }
}
</style>
