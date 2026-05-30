<template>
  <div class="coach-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">教练管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加教练
          </el-button>
        </div>
      </template>

      <SearchForm
        :initial-values="searchForm"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #default="{ formData }">
          <el-form-item label="姓名">
            <el-input
              v-model="formData.name"
              placeholder="请输入教练姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="类型">
            <el-select
              v-model="formData.type"
              placeholder="请选择类型"
              clearable
              style="width: 150px"
            >
              <el-option label="全职" value="fulltime" />
              <el-option label="兼职" value="parttime" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="formData.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="在职" value="active" />
              <el-option label="离职" value="inactive" />
            </el-select>
          </el-form-item>
        </template>
      </SearchForm>

      <el-table
        :data="paginatedCoaches"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="name" label="姓名" min-width="140">
          <template #default="{ row }">
            <div class="name-cell">
              <el-avatar :size="36" :src="row.avatar" />
              <span class="name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'fulltime' ? 'primary' : 'success'" effect="dark">
              {{ row.type === 'fulltime' ? '全职' : '兼职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.level" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="specialties" label="擅长领域" min-width="200">
          <template #default="{ row }">
            <div class="specialties-tags">
              <el-tag
                v-for="s in row.specialties"
                :key="s"
                size="small"
                type="info"
                effect="light"
                class="tag-item"
              >
                {{ s }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" effect="dark">
              {{ row.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleSchedule(row)">排班</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <EmptyState description="暂无教练数据" />
        </template>
      </el-table>

      <Pagination
        v-model="currentPage"
        :total="filteredCoaches.length"
        :page-size="pageSize"
        @size-change="handleSizeChange"
      />
    </el-card>

    <FormDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑教练' : '添加教练'"
      :form-data="formData"
      :rules="formRules"
      width="600px"
      :loading="submitLoading"
      @submit="handleSubmit"
    >
      <template #default="{ formData }">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="全职" value="fulltime" />
            <el-option label="兼职" value="parttime" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-rate v-model="formData.level" show-score text-color="#ff9900" />
        </el-form-item>
        <el-form-item label="擅长领域" prop="specialties">
          <el-select v-model="formData.specialties" multiple placeholder="请选择擅长领域" style="width: 100%">
            <el-option label="减脂塑形" value="减脂塑形" />
            <el-option label="增肌力量" value="增肌力量" />
            <el-option label="康复训练" value="康复训练" />
            <el-option label="瑜伽" value="瑜伽" />
            <el-option label="普拉提" value="普拉提" />
            <el-option label="有氧燃脂" value="有氧燃脂" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
          </el-select>
        </el-form-item>
      </template>
    </FormDialog>

    <el-dialog
      v-model="scheduleVisible"
      title="排班日历"
      class="schedule-dialog"
      :fullscreen="isTablet"
      width="90%"
    >
      <div class="schedule-content">
        <el-calendar v-model="currentDate">
          <template #date-cell="{ data }">
            <div class="calendar-cell">
              <p :class="['date-text', data.isSelected ? 'text-primary' : '']">
                {{ data.day.split('-').slice(2).join('-') }}
              </p>
              <div v-if="getScheduleForDate(data.day).length" class="schedule-list">
                <div
                  v-for="s in getScheduleForDate(data.day)"
                  :key="s.id"
                  class="schedule-item"
                  :class="s.status"
                >
                  <span class="time">{{ s.timeSlot }}</span>
                  <span class="course">{{ s.courseName }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores'
import FormDialog from '@/components/FormDialog.vue'
import SearchForm from '@/components/SearchForm.vue'
import Pagination from '@/components/Pagination.vue'
import EmptyState from '@/components/EmptyState.vue'
import type { Coach, CoachForm, CoachSearchParams, CoachType, CoachStatus } from '@/types'

const store = useAppStore()
const dialogVisible = ref(false)
const scheduleVisible = ref(false)
const isEdit = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const currentDate = ref(new Date())
const selectedCoach = ref<Coach | null>(null)

const isTablet = computed<boolean>(() => {
  return window.innerWidth <= 1024
})

const searchForm = reactive<CoachSearchParams>({
  name: '',
  type: '',
  status: ''
})

const filteredCoaches = computed<Coach[]>(() => {
  return store.coaches.filter(coach => {
    const matchName = !searchForm.name || coach.name.includes(searchForm.name)
    const matchType = !searchForm.type || coach.type === searchForm.type
    const matchStatus = !searchForm.status || coach.status === searchForm.status
    return matchName && matchType && matchStatus
  })
})

const paginatedCoaches = computed<Coach[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredCoaches.value.slice(start, start + pageSize.value)
})

const formData = reactive<CoachForm>({
  id: '',
  name: '',
  type: 'fulltime',
  level: 3,
  specialties: [],
  phone: '',
  status: 'active'
})

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
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
    type: 'fulltime' as CoachType,
    level: 3,
    specialties: [] as string[],
    phone: '',
    status: 'active' as CoachStatus
  })
  dialogVisible.value = true
}

const handleEdit = (row: Coach): void => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleSchedule = (row: Coach): void => {
  selectedCoach.value = row
  scheduleVisible.value = true
}

const getScheduleForDate = () => {
  return []
}

const handleDelete = async (id: string): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除该教练吗？删除后数据无法恢复。', '提示', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    })
    store.deleteCoach(id)
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
      store.updateCoach(data as Coach)
      ElMessage.success('更新成功')
    } else {
      store.addCoach({
        ...data,
        id: Date.now().toString(),
        avatar: `https://picsum.photos/100/100?random=${Date.now()}`,
        availableSlots: [],
        createdAt: new Date().toISOString()
      } as Coach)
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

.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.name {
  font-weight: 500;
}

.specialties-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  margin: 0 !important;
}

.calendar-cell {
  min-height: 80px;
  padding: 8px;
  box-sizing: border-box;
}

.date-text {
  text-align: right;
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
}

.text-primary {
  color: #409eff !important;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.schedule-item {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #ecf5ff;
  color: #409eff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-item.full {
  background: #fef0f0;
  color: #f56c6c;
}

.schedule-item.cancelled {
  background: #f4f4f5;
  color: #909399;
}

.schedule-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.schedule-content {
  padding: 20px;
}

@media (max-width: 1024px) {
  .schedule-content {
    padding: 12px;
  }

  .calendar-cell {
    min-height: 60px;
    padding: 4px;
  }

  .date-text {
    font-size: 12px;
  }

  .schedule-item {
    font-size: 10px;
    padding: 1px 4px;
  }

  .time {
    display: block;
  }

  .course {
    display: none;
  }
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

  .calendar-cell {
    min-height: 50px;
    padding: 2px;
  }

  .schedule-item {
    font-size: 9px;
  }
}
</style>
