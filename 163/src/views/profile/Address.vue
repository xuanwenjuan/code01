<template>
  <div class="address-page">
    <div class="page-header">
      <h2 class="page-title">收货地址</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增地址
      </el-button>
    </div>

    <div v-if="userStore.addresses.length > 0" class="address-list">
      <div
        v-for="addr in userStore.addresses"
        :key="addr.id"
        class="address-card"
        :class="{ default: addr.isDefault }"
      >
        <div class="address-info">
          <div class="address-header">
            <span class="name">{{ addr.name }}</span>
            <span class="phone">{{ addr.phone }}</span>
            <el-tag v-if="addr.isDefault" type="primary" size="small">默认</el-tag>
          </div>
          <div class="address-detail">
            {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.address }}
          </div>
        </div>
        <div class="address-actions">
          <el-button type="primary" link @click="handleEdit(addr)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button v-if="!addr.isDefault" type="primary" link @click="handleSetDefault(addr)">
            设为默认
          </el-button>
          <el-button type="danger" link @click="handleDelete(addr)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
    </div>

    <div v-else class="empty-wrapper">
      <el-empty description="暂无收货地址">
        <el-button type="primary" @click="handleAdd">添加地址</el-button>
      </el-empty>
    </div>

    <el-dialog
      v-model="showDialog"
      :title="editingAddress ? '编辑地址' : '新增地址'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省市区" prop="province">
          <el-row :gutter="12">
            <el-col :span="8">
              <el-input v-model="form.province" placeholder="省份" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="form.city" placeholder="城市" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="form.district" placeholder="区县" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { validatePhone } from '@/utils'

const userStore = useUserStore()

const showDialog = ref(false)
const editingAddress = ref(null)
const formRef = ref(null)

const form = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  isDefault: false
})

const rules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!validatePhone(value)) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const handleAdd = () => {
  editingAddress.value = null
  Object.assign(form, {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    isDefault: false
  })
  showDialog.value = true
}

const handleEdit = (addr) => {
  editingAddress.value = addr
  Object.assign(form, { ...addr })
  showDialog.value = true
}

const handleSetDefault = (addr) => {
  userStore.updateAddress(addr.id, { isDefault: true })
  ElMessage.success('已设为默认地址')
}

const handleDelete = (addr) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.deleteAddress(addr.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (editingAddress.value) {
        userStore.updateAddress(editingAddress.value.id, { ...form })
        ElMessage.success('修改成功')
      } else {
        userStore.addAddress({ ...form })
        ElMessage.success('添加成功')
      }
      showDialog.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.address-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .address-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .address-card {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    transition: all 0.3s;

    &.default {
      border-color: #409eff;
      background-color: #f0f9ff;
    }

    &:hover {
      border-color: #409eff;
    }
  }

  .address-info {
    flex: 1;

    .address-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .phone {
        color: #666;
        font-size: 14px;
      }
    }

    .address-detail {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }
  }

  .address-actions {
    display: flex;
    gap: 16px;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .address-card {
    flex-direction: column;
    gap: 16px;
  }

  .address-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
