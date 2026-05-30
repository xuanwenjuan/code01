<template>
  <div class="profile-page">
    <h3 class="section-title">个人信息</h3>

    <el-form :model="profileForm" label-width="100px" style="max-width: 600px">
      <el-form-item label="用户类型">
        <el-tag :type="userStore.userRole === 'purchaser' ? 'primary' : 'success'">
          {{ userStore.userRole === 'purchaser' ? '养殖场采购方' : '器械供货商' }}
        </el-tag>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="profileForm.username" disabled />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="profileForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="企业名称">
        <el-input v-model="profileForm.company" placeholder="请输入企业/养殖场名称" />
      </el-form-item>
      <el-form-item label="联系地址">
        <el-input v-model="profileForm.address" placeholder="请输入联系地址" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveProfile">保存修改</el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <h3 class="section-title">修改密码</h3>
    <el-form :model="passwordForm" label-width="100px" style="max-width: 600px">
      <el-form-item label="原密码">
        <el-input v-model="passwordForm.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="passwordForm.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认新密码">
        <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="changePassword">修改密码</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const profileForm = reactive({
  username: '',
  name: '',
  phone: '',
  company: '',
  address: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  if (userStore.userInfo) {
    profileForm.username = userStore.userInfo.username
    profileForm.name = userStore.userInfo.name
    profileForm.phone = userStore.userInfo.phone
    profileForm.company = userStore.userInfo.company
    profileForm.address = userStore.userInfo.address
  }
})

function saveProfile() {
  userStore.userInfo.name = profileForm.name
  userStore.userInfo.phone = profileForm.phone
  userStore.userInfo.company = profileForm.company
  userStore.userInfo.address = profileForm.address
  localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
  ElMessage.success('信息修改成功')
}

function changePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.error('新密码长度不能少于6位')
    return
  }
  ElMessage.success('密码修改成功')
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}
</script>

<style scoped>
.profile-page {
  padding: 0;
}
</style>
