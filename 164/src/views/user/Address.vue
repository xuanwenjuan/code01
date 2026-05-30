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
        v-for="address in userStore.addresses"
        :key="address.id"
        class="address-card"
        :class="{ 'is-default': address.isDefault }"
      >
        <div class="address-info">
          <div class="address-header">
            <span class="receiver">{{ address.name }}</span>
            <span class="phone">{{ address.phone }}</span>
            <el-tag v-if="address.isDefault" type="danger" size="small">默认</el-tag>
          </div>
          <div class="address-detail">
            {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
          </div>
        </div>
        <div class="address-actions">
          <el-button type="primary" link size="small" @click="handleEdit(address)">编辑</el-button>
          <el-button
            v-if="!address.isDefault"
            type="primary"
            link
            size="small"
            @click="handleSetDefault(address.id)"
          >
            设为默认
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(address.id)">删除</el-button>
        </div>
      </div>
    </div>

    <EmptyState v-else icon="📍" text="暂无收货地址">
      <template #action>
        <el-button type="primary" @click="handleAdd">添加地址</el-button>
      </template>
    </EmptyState>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地址' : '新增地址'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="address-form"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="formData.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="formData.region"
            :options="regionOptions"
            @change="handleRegionChange"
            style="width: 100%"
          />
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
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import EmptyState from '@/components/EmptyState.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const formRef = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const formData = reactive({
  name: '',
  phone: '',
  region: [],
  detail: '',
  isDefault: false
})

const rules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  region: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const regionOptions = [
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '南山区', label: '南山区' },
          { value: '福田区', label: '福田区' },
          { value: '罗湖区', label: '罗湖区' },
          { value: '宝安区', label: '宝安区' },
          { value: '龙岗区', label: '龙岗区' }
        ]
      },
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '天河区', label: '天河区' },
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' },
          { value: '白云区', label: '白云区' }
        ]
      }
    ]
  },
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' },
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '浦东新区', label: '浦东新区' },
          { value: '黄浦区', label: '黄浦区' },
          { value: '静安区', label: '静安区' },
          { value: '徐汇区', label: '徐汇区' }
        ]
      }
    ]
  }
]

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (address) => {
  isEdit.value = true
  editId.value = address.id
  formData.name = address.name
  formData.phone = address.phone
  formData.region = [address.province, address.city, address.district]
  formData.detail = address.detail
  formData.isDefault = address.isDefault
  dialogVisible.value = true
}

const handleRegionChange = (value) => {
  console.log('Region changed:', value)
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    const addressData = {
      name: formData.name,
      phone: formData.phone,
      province: formData.region[0],
      city: formData.region[1],
      district: formData.region[2],
      detail: formData.detail,
      isDefault: formData.isDefault
    }
    
    if (isEdit.value) {
      await userStore.updateAddressAction(editId.value, addressData)
      ElMessage.success('修改成功')
    } else {
      await userStore.addAddressAction(addressData)
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await userStore.deleteAddressAction(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSetDefault = async (id) => {
  await userStore.setDefaultAddressAction(id)
  ElMessage.success('设置成功')
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  formData.name = ''
  formData.phone = ''
  formData.region = []
  formData.detail = ''
  formData.isDefault = false
  formRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.address-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .page-title {
      font-size: 20px;
      font-weight: 500;
      color: $text-primary;
      margin: 0;
    }
  }
  
  .address-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .address-card {
      border: 1px solid $border-color;
      border-radius: $radius;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s;
      
      &.is-default {
        border-color: $primary-color;
        background: $primary-color + '08';
      }
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      
      .address-info {
        .address-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .receiver {
            font-size: 16px;
            font-weight: 500;
            color: $text-primary;
          }
          
          .phone {
            font-size: 14px;
            color: $text-secondary;
          }
        }
        
        .address-detail {
          font-size: 14px;
          color: $text-secondary;
          line-height: 1.6;
        }
      }
      
      .address-actions {
        display: flex;
        gap: 16px;
      }
    }
  }
}
</style>
