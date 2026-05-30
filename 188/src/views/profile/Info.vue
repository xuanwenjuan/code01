<template>
  <div class="info-page">
    <h2 class="page-title">个人信息</h2>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="info-form"
    >
      <el-form-item label="用户类型">
        <el-tag :type="form.role === 'supplier' ? 'warning' : 'primary'" size="large">
          {{ form.role === 'supplier' ? '园艺资材供货商' : '园林采购商' }}
        </el-tag>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" disabled />
      </el-form-item>
      <el-form-item label="真实姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入真实姓名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱地址" />
      </el-form-item>
      <el-form-item label="公司名称" prop="company">
        <el-input v-model="form.company" placeholder="请输入公司名称" />
      </el-form-item>
      <el-form-item label="联系地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入联系地址" />
      </el-form-item>
      <el-form-item label="注册时间">
        <el-input :model-value="form.createTime" disabled />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="large" :loading="saving" @click="handleSave">
          保存修改
        </el-button>
        <el-button size="large" @click="handleReset">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const formRef = ref()
const saving = ref(false)

const form = reactive({
  role: '',
  username: '',
  name: '',
  phone: '',
  email: '',
  company: '',
  address: '',
  createTime: ''
})

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号码'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱地址'))
  } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

const rules = {
  name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }]
}

onMounted(() => {
  const userInfo = userStore.userInfo
  if (userInfo) {
    Object.assign(form, {
      role: userStore.userRole,
      username: userInfo.username,
      name: userInfo.name,
      phone: userInfo.phone,
      email: userInfo.email,
      company: userInfo.company,
      address: userInfo.address || '',
      createTime: userInfo.createTime
    })
  }
})

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const userInfo = { ...userStore.userInfo, ...form }
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        userStore.userInfo = userInfo
        ElMessage.success('保存成功')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  onMounted()
}
</script>

<style lang="scss" scoped>
.info-page {
  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 24px;
  }

  .info-form {
    max-width: 600px;
  }
}
</style>
