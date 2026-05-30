<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">软装素材管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增素材
      </el-button>
    </div>

    <el-card>
      <SearchForm 
        :initial-values="{ name: '', category: '', status: '' }"
        @search="handleSearch"
        @reset="handleReset"
      >
        <el-form-item label="素材名称">
          <el-input v-model="searchForm.name" placeholder="请输入素材名称" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
            <el-option label="家具" value="furniture" />
            <el-option label="窗帘" value="curtain" />
            <el-option label="灯饰" value="lighting" />
            <el-option label="地毯" value="carpet" />
            <el-option label="装饰摆件" value="decoration" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="上架" value="on" />
            <el-option label="下架" value="off" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <el-table 
        :data="paginatedMaterials" 
        border 
        stripe 
        v-loading="materialStore.loading"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="name" label="素材名称" min-width="150" sortable />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.category" :status-map="MATERIAL_CATEGORY_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="specs" label="规格参数" min-width="150" />
        <el-table-column prop="styleTags" label="风格标签" min-width="200">
          <template #default="{ row }">
            <el-tag 
              v-for="tag in row.styleTags" 
              :key="tag" 
              size="small" 
              class="mr-2"
              type="info"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120" sortable>
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="MATERIAL_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" sortable />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="filteredMaterials.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <FormDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑素材' : '新增素材'"
      :form-data="formData"
      :rules="formRules"
      @submit="handleSubmit"
    >
      <el-form-item label="素材名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入素材名称" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
          <el-option label="家具" value="furniture" />
          <el-option label="窗帘" value="curtain" />
          <el-option label="灯饰" value="lighting" />
          <el-option label="地毯" value="carpet" />
          <el-option label="装饰摆件" value="decoration" />
        </el-select>
      </el-form-item>
      <el-form-item label="规格参数" prop="specs">
        <el-input v-model="formData.specs" placeholder="请输入规格参数" />
      </el-form-item>
      <el-form-item label="风格标签" prop="styleTags">
        <el-select v-model="formData.styleTags" multiple placeholder="请选择风格标签" style="width: 100%">
          <el-option label="现代简约" value="现代简约" />
          <el-option label="北欧风格" value="北欧风格" />
          <el-option label="中式古典" value="中式古典" />
          <el-option label="欧式奢华" value="欧式奢华" />
          <el-option label="工业风" value="工业风" />
          <el-option label="日式禅意" value="日式禅意" />
        </el-select>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="on">上架</el-radio>
          <el-radio label="off">下架</el-radio>
        </el-radio-group>
      </el-form-item>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import { useMaterialStore } from '@/stores/material'
import type { Material } from '@/types'
import { MATERIAL_CATEGORY_MAP, MATERIAL_STATUS_MAP } from '@/constants'
import axios from 'axios'

const materialStore = useMaterialStore()

const searchForm = reactive({
  name: '',
  category: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const sortState = reactive({
  prop: '',
  order: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)

const formData = reactive<Partial<Material>>({
  name: '',
  category: 'furniture',
  specs: '',
  styleTags: [],
  price: 0,
  status: 'on'
})

const formRules = {
  name: [
    { required: true, message: '请输入素材名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  specs: [{ required: true, message: '请输入规格参数', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
  ],
  styleTags: [{ required: true, message: '请选择至少一个风格标签', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const filteredMaterials = computed(() => {
  let list = [...materialStore.materials]
  
  if (searchForm.name) {
    list = list.filter(m => m.name.includes(searchForm.name))
  }
  if (searchForm.category) {
    list = list.filter(m => m.category === searchForm.category)
  }
  if (searchForm.status) {
    list = list.filter(m => m.status === searchForm.status)
  }
  
  if (sortState.prop && sortState.order) {
    list.sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''
      
      if (sortState.prop === 'price') {
        aValue = a.price
        bValue = b.price
      } else if (sortState.prop === 'name') {
        aValue = a.name
        bValue = b.name
      } else if (sortState.prop === 'createTime') {
        aValue = a.createTime
        bValue = b.createTime
      }
      
      if (sortState.order === 'ascending') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }
  
  return list
})

const paginatedMaterials = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredMaterials.value.slice(start, end)
})

const handleSearch = () => {
  pagination.page = 1
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    category: '',
    status: ''
  })
  pagination.page = 1
}

const handleSortChange = (sortInfo: { prop: string; order: string }) => {
  sortState.prop = sortInfo.prop
  sortState.order = sortInfo.order
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    name: '',
    category: 'furniture',
    specs: '',
    styleTags: [],
    price: 0,
    status: 'on'
  })
  dialogVisible.value = true
}

const handleEdit = (row: Material) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm('确定要删除该素材吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    materialStore.deleteMaterial(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = (data: Record<string, unknown>) => {
  const now = new Date().toISOString()
  
  if (isEdit.value && data.id) {
    materialStore.updateMaterial({
      ...data,
      updateTime: now
    } as Material)
    ElMessage.success('更新成功')
  } else {
    materialStore.addMaterial({
      id: Date.now().toString(),
      ...data,
      imageUrl: '',
      createTime: now,
      updateTime: now
    } as Material)
    ElMessage.success('新增成功')
  }
}

onMounted(async () => {
  try {
    materialStore.setLoading(true)
    const response = await axios.get('/api/materials')
    if (response.data.code === 200) {
      materialStore.setMaterials(response.data.data)
    }
  } catch (error) {
    console.error('加载素材数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    materialStore.setLoading(false)
  }
})
</script>

<style scoped lang="scss">
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mr-2 {
  margin-right: 8px;
}

.price-text {
  font-weight: 600;
  color: #f56c6c;
}
</style>
