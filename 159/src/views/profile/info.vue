<template>
  <div class="page-container">
    <div class="card-wrapper" style="max-width: 800px; margin: 0 auto;">
      <div class="profile-header">
        <div class="avatar-section">
          <el-avatar :size="100" :src="userStore.userInfo?.avatar" />
          <el-button type="primary" size="small" class="mt-10">
            <el-icon><Camera /></el-icon>更换头像
          </el-button>
        </div>
        <div class="basic-info">
          <h2>{{ userStore.userInfo?.name }}</h2>
          <p class="position">{{ userStore.userInfo?.position }}</p>
          <p class="dept">
            <el-icon><OfficeBuilding /></el-icon>
            {{ userStore.userInfo?.department }}
          </p>
          <el-tag :type="userStore.userInfo?.role === 'admin' ? 'danger' : 'primary'">
            {{ userStore.userInfo?.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </div>
      </div>
      
      <el-divider />
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="profile-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="form.department" disabled />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" disabled />
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-input v-model="form.entryDate" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            保存修改
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, OfficeBuilding } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { mockUpdateUserInfo } from '@/mock/user'

const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  name: '',
  phone: '',
  email: '',
  department: '',
  position: '',
  entryDate: ''
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

onMounted(() => {
  if (userStore.userInfo) {
    Object.assign(form, userStore.userInfo)
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await mockUpdateUserInfo(form)
        userStore.updateUserInfo(form)
        ElMessage.success('保存成功')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleReset = () => {
  if (userStore.userInfo) {
    Object.assign(form, userStore.userInfo)
  }
  formRef.value?.clearValidate()
}
</script>

<style scoped lang="scss">
.profile-header {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 20px 0;
  
  .avatar-section {
    text-align: center;
  }
  
  .basic-info {
    flex: 1;
    
    h2 {
      font-size: 24px;
      margin: 0 0 8px;
    }
    
    .position {
      font-size: 16px;
      color: #606266;
      margin-bottom: 4px;
    }
    
    .dept {
      font-size: 14px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 12px;
    }
  }
}

.profile-form {
  padding-top: 20px;
}
</style>
