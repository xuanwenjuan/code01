<template>
  <div class="course-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">课程管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加课程
          </el-button>
        </div>
      </template>

      <SearchForm
        :initial-values="searchForm"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #default="{ formData }">
          <el-form-item label="课程名称">
            <el-input
              v-model="formData.name"
              placeholder="请输入课程名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="课程类目">
            <el-select
              v-model="formData.category"
              placeholder="请选择课程类目"
              clearable
              style="width: 150px"
            >
              <el-option label="私教一对一" value="私教一对一" />
              <el-option label="小班团课" value="小班团课" />
              <el-option label="瑜伽普拉提" value="瑜伽普拉提" />
              <el-option label="有氧燃脂" value="有氧燃脂" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="formData.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="上架" value="online" />
              <el-option label="下架" value="offline" />
            </el-select>
          </el-form-item>
        </template>
      </SearchForm>

      <el-table
        :data="paginatedCourses"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="name" label="课程名称" min-width="150">
          <template #default="{ row }">
            <span class="course-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="课程类目" width="130">
          <template #default="{ row }">
            <el-tag type="info" effect="dark">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(分钟)" width="120" align="center" />
        <el-table-column prop="price" label="价格(元)" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="maxStudents" label="最大人数" width="110" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'warning'" effect="dark">
              {{ row.status === 'online' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              :type="row.status === 'online' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'online' ? '下架' : '上架' }}
            </el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState description="暂无课程数据" />
        </template>
      </el-table>

      <Pagination
        v-model="currentPage"
        :total="filteredCourses.length"
        :page-size="pageSize"
        @size-change="handleSizeChange"
      />
    </el-card>

    <FormDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑课程' : '添加课程'"
      :form-data="formData"
      :rules="formRules"
      width="600px"
      :loading="submitLoading"
      @submit="handleSubmit"
    >
      <template #default="{ formData }">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程类目" prop="category">
          <el-select v-model="formData.category" placeholder="请选择课程类目" style="width: 100%">
            <el-option label="私教一对一" value="私教一对一" />
            <el-option label="小班团课" value="小班团课" />
            <el-option label="瑜伽普拉提" value="瑜伽普拉提" />
            <el-option label="有氧燃脂" value="有氧燃脂" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时长" prop="duration">
              <el-input-number v-model="formData.duration" :min="30" :max="180" :step="15" style="width: 100%" />
              <span class="unit">分钟</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="formData.price" :min="0" :step="10" style="width: 100%" />
              <span class="unit">元</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="最大人数" prop="maxStudents">
          <el-input-number v-model="formData.maxStudents" :min="1" :max="50" style="width: 100%" />
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入课程描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="上架" value="online" />
            <el-option label="下架" value="offline" />
          </el-select>
        </el-form-item>
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import Pagination from '@/components/Pagination.vue'
import EmptyState from '@/components/EmptyState.vue'
import type { Course, CourseForm, CourseCategory, CourseStatus, CourseSearchParams } from '@/types'

const store = useAppStore()
const dialogVisible = ref(false)
const isEdit = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const searchForm = reactive<CourseSearchParams>({
  name: '',
  category: '',
  status: ''
})

const filteredCourses = computed<Course[]>(() => {
  return store.courses.filter(course => {
    const matchName = !searchForm.name || course.name.includes(searchForm.name)
    const matchCategory = !searchForm.category || course.category === searchForm.category
    const matchStatus = !searchForm.status || course.status === searchForm.status
    return matchName && matchCategory && matchStatus
  })
})

const paginatedCourses = computed<Course[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredCourses.value.slice(start, start + pageSize.value)
})

const formData = reactive<CourseForm>({
  id: '',
  name: '',
  category: '私教一对一',
  duration: 60,
  price: 200,
  description: '',
  status: 'online',
  maxStudents: 10
})

const formRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择课程类目', trigger: 'change' }],
  duration: [{ required: true, message: '请输入时长', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  maxStudents: [{ required: true, message: '请输入最大人数', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const handleSearch = (): void => {
  currentPage.value = 1
  ElMessage.success('搜索完成')
}

const handleReset = (): void => {
  currentPage.value = 1
  ElMessage.info('已重置搜索条件')
}

const handleSizeChange = (size: number): void => {
  pageSize.value = size
  currentPage.value = 1
}

const handleAdd = (): void => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    name: '',
    category: '私教一对一' as CourseCategory,
    duration: 60,
    price: 200,
    description: '',
    status: 'online' as CourseStatus,
    maxStudents: 10
  })
  dialogVisible.value = true
}

const handleEdit = (row: Course): void => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleToggleStatus = async (row: Course): Promise<void> => {
  const newStatus = row.status === 'online' ? 'offline' : 'online'
  const actionText = newStatus === 'online' ? '上架' : '下架'

  try {
    await ElMessageBox.confirm(`确定要${actionText}该课程吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    store.toggleCourseStatus(row.id)
    ElMessage.success(`${actionText}成功`)
  } catch {
    // 取消操作
  }
}

const handleDelete = async (id: string): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除该课程吗？删除后数据无法恢复。', '提示', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    })
    store.deleteCourse(id)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

const handleSubmit = async (data: Record<string, unknown>): Promise<void> => {
  submitLoading.value = true

  try {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 600))

    if (isEdit.value) {
      store.updateCourse(data as Course)
      ElMessage.success('更新成功')
    } else {
      store.addCourse({
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      } as Course)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.course-name {
  font-weight: 500;
}

.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.unit {
  margin-left: 8px;
  color: #909399;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-header .el-button {
    width: 100%;
  }
}
</style>
