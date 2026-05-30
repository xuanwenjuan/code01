<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const profileForm = reactive({
  nickname: userInfo.value?.nickname || '',
  phone: userInfo.value?.phone || '',
  email: userInfo.value?.email || ''
})

const isEditing = ref(false)

function handleEdit() {
  isEditing.value = true
}

function handleSave() {
  isEditing.value = false
  userStore.userInfo.nickname = profileForm.nickname
  userStore.userInfo.phone = profileForm.phone
  userStore.userInfo.email = profileForm.email
  localStorage.setItem('baking_user', JSON.stringify(userStore.userInfo))
  ElMessage.success('资料修改成功')
}

function handleCancel() {
  profileForm.nickname = userInfo.value?.nickname
  profileForm.phone = userInfo.value?.phone
  profileForm.email = userInfo.value?.email
  isEditing.value = false
}
</script>

<template>
  <div class="profile-page">
    <div class="page-header">
      <h2 class="page-title">个人资料</h2>
    </div>

    <div class="profile-content">
      <div class="avatar-section">
        <el-avatar :size="120" :src="userInfo?.avatar" />
        <p class="username">{{ userInfo?.username }}</p>
        <el-tag type="success" effect="light">普通用户</el-tag>
      </div>

      <el-form label-width="80px" class="profile-form">
        <el-form-item label="昵称">
          <template v-if="isEditing">
            <el-input v-model="profileForm.nickname" />
          </template>
          <template v-else>
            <span class="form-value">{{ userInfo?.nickname }}</span>
          </template>
        </el-form-item>
        <el-form-item label="手机号">
          <template v-if="isEditing">
            <el-input v-model="profileForm.phone" />
          </template>
          <template v-else>
            <span class="form-value">{{ userInfo?.phone }}</span>
          </template>
        </el-form-item>
        <el-form-item label="邮箱">
          <template v-if="isEditing">
            <el-input v-model="profileForm.email" />
          </template>
          <template v-else>
            <span class="form-value">{{ userInfo?.email }}</span>
          </template>
        </el-form-item>
        <el-form-item label="注册时间">
          <span class="form-value">{{ new Date(userInfo?.createdAt).toLocaleDateString() }}</span>
        </el-form-item>
        <el-form-item>
          <el-button v-if="!isEditing" type="primary" @click="handleEdit">
            编辑资料
          </el-button>
          <template v-else>
            <el-button type="primary" @click="handleSave">保存</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </template>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
}

.profile-content {
  display: flex;
  gap: 60px;
  padding: 20px 0;
}

.avatar-section {
  text-align: center;
  width: 200px;
  flex-shrink: 0;
}

.username {
  font-size: 18px;
  color: #303133;
  margin: 16px 0 8px 0;
}

.profile-form {
  flex: 1;
  max-width: 400px;
}

.form-value {
  font-size: 14px;
  color: #606266;
  padding: 0 12px;
}
</style>
