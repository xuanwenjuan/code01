<template>
  <div class="info-page">
    <div class="page-header">
      <h2 class="page-title">个人信息</h2>
    </div>

    <div class="info-content">
      <div class="avatar-section">
        <el-avatar :size="120" :src="userStore.userInfo?.avatar">
          {{ userStore.userInfo?.name?.charAt(0) }}
        </el-avatar>
        <el-button type="primary" size="small" style="margin-top: 16px">
          更换头像
        </el-button>
      </div>

      <el-form :model="infoForm" :rules="infoRules" label-width="100px" class="info-form">
        <el-descriptions :column="1" border size="default" class="info-desc">
          <el-descriptions-item label="账号">
            {{ userStore.userInfo?.username }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="userStore.isBuyer ? 'primary' : 'success'">
              {{ userStore.isBuyer ? '采购方' : '供货商' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="infoForm.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item v-if="userStore.isBuyer" label="所属机构" prop="organization">
          <el-input v-model="infoForm.organization" placeholder="请输入所属机构" />
        </el-form-item>

        <el-form-item v-else label="公司名称" prop="company">
          <el-input v-model="infoForm.company" placeholder="请输入公司名称" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="infoForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="infoForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存修改
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const saving = ref(false)
const infoFormRef = ref(null)

const infoForm = reactive({
  name: '',
  organization: '',
  company: '',
  phone: '',
  email: ''
})

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const validateName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入姓名'))
  } else if (value.length < 2 || value.length > 20) {
    callback(new Error('姓名长度为2-20个字符'))
  } else {
    callback()
  }
}

const infoRules = {
  name: [{ validator: validateName, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }]
}

onMounted(() => {
  if (userStore.userInfo) {
    infoForm.name = userStore.userInfo.name || ''
    infoForm.organization = userStore.userInfo.organization || ''
    infoForm.company = userStore.userInfo.company || ''
    infoForm.phone = userStore.userInfo.phone || ''
    infoForm.email = userStore.userInfo.email || ''
  }
})

async function handleSave() {
  if (!infoFormRef.value) return
  
  const valid = await infoFormRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  setTimeout(() => {
    if (userStore.userInfo) {
      userStore.userInfo.name = infoForm.name
      userStore.userInfo.phone = infoForm.phone
      userStore.userInfo.email = infoForm.email
      if (userStore.isBuyer) {
        userStore.userInfo.organization = infoForm.organization
      } else {
        userStore.userInfo.company = infoForm.company
      }
      localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
    }
    saving.value = false
    ElMessage.success('信息保存成功')
  }, 500)
}

function resetForm() {
  if (userStore.userInfo) {
    infoForm.name = userStore.userInfo.name || ''
    infoForm.organization = userStore.userInfo.organization || ''
    infoForm.company = userStore.userInfo.company || ''
    infoForm.phone = userStore.userInfo.phone || ''
    infoForm.email = userStore.userInfo.email || ''
  }
}
</script>

<style lang="scss" scoped>
.info-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2d3d;
}

.info-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
}

.avatar-section {
  text-align: center;
  padding: 24px;
  background: #f8fafc;
  border-radius: 8px;
}

.info-form {
  max-width: 500px;
}

.info-desc {
  margin-bottom: 24px;
}
</style>
