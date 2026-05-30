<template>
  <div class="address-page">
    <div class="page-header">
      <h2 class="page-title">地址管理</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        新增地址
      </el-button>
    </div>
    <div class="address-list">
      <div
        v-for="addr in userStore.addresses"
        :key="addr.id"
        class="address-card"
        :class="{ 'is-default': addr.isDefault }"
      >
        <div class="address-info">
          <div class="address-header">
            <span class="name">{{ addr.name }}</span>
            <span class="phone">{{ addr.phone }}</span>
            <el-tag v-if="addr.isDefault" type="danger" size="small">默认</el-tag>
          </div>
          <div class="address-detail">
            {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
          </div>
        </div>
        <div class="address-actions">
          <el-button type="primary" text @click="setDefault(addr)" v-if="!addr.isDefault">
            设为默认
          </el-button>
          <el-button text @click="openDialog(addr)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" text @click="deleteAddress(addr.id)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
      <div v-if="userStore.addresses.length === 0" class="empty-address">
        <el-empty description="暂无收货地址" />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地址' : '新增地址'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="formData.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="formData.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="formData.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-input v-model="formData.district" placeholder="请输入区县" />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="formData.detail"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="formData.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref(null)

const formData = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const rules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const openDialog = (addr = null) => {
  isEdit.value = !!addr
  editingId.value = addr?.id || null
  
  if (addr) {
    Object.assign(formData, {
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault
    })
  } else {
    Object.assign(formData, {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    })
  }
  
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  
  const addressData = { ...formData }
  
  let result
  if (isEdit.value) {
    addressData.id = editingId.value
    result = await userStore.updateAddress(addressData)
  } else {
    result = await userStore.addAddress(addressData)
  }
  
  if (result.success) {
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
    dialogVisible.value = false
  } else {
    ElMessage.error('操作失败')
  }
  
  submitting.value = false
}

const setDefault = async (addr) => {
  const result = await userStore.updateAddress({ ...addr, isDefault: true })
  if (result.success) {
    ElMessage.success('已设为默认地址')
  }
}

const deleteAddress = (id) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await userStore.deleteAddress(id)
    if (result.success) {
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.address-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid $border-light;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }
  }

  .address-list {
    .address-card {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px;
      border: 2px solid $border-light;
      border-radius: $border-radius;
      margin-bottom: 16px;
      transition: all 0.2s;

      &:hover {
        border-color: $primary-color;
      }

      &.is-default {
        border-color: $primary-color;
        background: #fff5f7;
      }

      .address-info {
        flex: 1;

        .address-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .name {
            font-weight: 600;
            font-size: 16px;
          }

          .phone {
            color: $text-secondary;
          }
        }

        .address-detail {
          color: $text-regular;
          line-height: 1.6;
        }
      }

      .address-actions {
        display: flex;
        gap: 8px;
        margin-left: 16px;
      }
    }

    .empty-address {
      padding: 60px 0;
    }
  }
}
</style>
