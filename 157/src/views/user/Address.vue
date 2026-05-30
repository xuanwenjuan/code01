<template>
  <div class="bg-white rounded-xl shadow-sm p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">收货地址</h2>
      <el-button type="primary" @click="handleAdd">
        <Plus class="w-4 h-4 mr-1" />
        新增地址
      </el-button>
    </div>
    
    <div v-if="addressList.length > 0" class="grid grid-cols-2 gap-4">
      <div
        v-for="addr in addressList"
        :key="addr.id"
        class="border-2 rounded-xl p-6 relative transition-all"
        :class="{
          'border-primary bg-pink-50': addr.isDefault,
          'border-gray-200 hover:border-gray-300': !addr.isDefault
        }"
      >
        <div v-if="addr.isDefault" class="absolute top-4 right-4">
          <span class="text-xs bg-primary text-white px-2 py-1 rounded">默认</span>
        </div>
        
        <div class="mb-4">
          <div class="flex items-center gap-3 mb-2">
            <span class="font-bold text-gray-800">{{ addr.name }}</span>
            <span class="text-gray-500">{{ addr.phone }}</span>
          </div>
          <p class="text-gray-600">
            {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
          </p>
        </div>
        
        <div class="flex items-center gap-4 text-sm">
          <button
            v-if="!addr.isDefault"
            class="text-primary hover:underline"
            @click="handleSetDefault(addr.id)"
          >
            设为默认
          </button>
          <button class="text-gray-500 hover:text-primary" @click="handleEdit(addr)">
            <Edit class="w-4 h-4 inline-block mr-1" />
            编辑
          </button>
          <button class="text-gray-500 hover:text-red-500" @click="handleDelete(addr.id)">
            <Delete class="w-4 h-4 inline-block mr-1" />
            删除
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="py-16 text-center">
      <el-empty description="暂无收货地址" />
    </div>
    
    <el-dialog
      v-model="dialogVisible"
      :title="editingAddress ? '编辑地址' : '新增地址'"
      width="600px"
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
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="district">
          <el-cascader
            v-model="region"
            :options="regionOptions"
            placeholder="请选择省/市/区"
            style="width: 100%"
            @change="handleRegionChange"
          />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="form.detail"
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
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { addresses } from '@/data/mock'
import { addressRules, validateRequired } from '@/utils/validate'

const addressList = ref([...addresses])
const dialogVisible = ref(false)
const formRef = ref(null)
const loading = ref(false)
const editingAddress = ref(null)
const region = ref([])

const form = reactive({
  id: null,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const rules = {
  ...addressRules,
  district: [validateRequired('请选择所在地区')]
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
          { value: '宝安区', label: '宝安区' }
        ]
      },
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '天河区', label: '天河区' },
          { value: '越秀区', label: '越秀区' }
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
          { value: '海淀区', label: '海淀区' }
        ]
      }
    ]
  }
]

const handleAdd = () => {
  editingAddress.value = null
  Object.assign(form, {
    id: null,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  })
  region.value = []
  dialogVisible.value = true
}

const handleEdit = (addr) => {
  editingAddress.value = addr
  Object.assign(form, { ...addr })
  region.value = [addr.province, addr.city, addr.district]
  dialogVisible.value = true
}

const handleRegionChange = (val) => {
  if (val && val.length === 3) {
    form.province = val[0]
    form.city = val[1]
    form.district = val[2]
  }
}

const handleSetDefault = (id) => {
  addressList.value.forEach(addr => {
    addr.isDefault = addr.id === id
  })
  ElMessage.success('设置成功')
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = addressList.value.findIndex(a => a.id === id)
    if (index > -1) {
      addressList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    setTimeout(() => {
      if (form.isDefault) {
        addressList.value.forEach(addr => {
          addr.isDefault = false
        })
      }
      
      if (editingAddress.value) {
        Object.assign(editingAddress.value, form)
      } else {
        form.id = Date.now()
        addressList.value.push({ ...form })
      }
      
      loading.value = false
      dialogVisible.value = false
      ElMessage.success('保存成功')
    }, 1000)
  } catch (error) {
    console.log('表单验证失败')
  }
}
</script>
