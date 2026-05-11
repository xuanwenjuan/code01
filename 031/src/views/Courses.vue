<template>
  <div class="courses-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span>课程管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增课程
          </el-button>
        </div>
      </template>

      <el-form :model="filters" inline class="mb-10">
        <el-form-item label="课程名称">
          <el-input v-model="filters.courseName" placeholder="请输入课程名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="教练">
          <el-input v-model="filters.coachName" placeholder="请输入教练姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="courseStore.courses" v-loading="courseStore.loading" style="width: 100%">
        <el-table-column prop="name" label="课程名称" width="150" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="coachName" label="教练" width="100" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="时间" width="130">
          <template #default="{ row }">
            {{ row.startTime }} - {{ row.endTime }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(分钟)" width="100" />
        <el-table-column prop="room" label="教室" width="100" />
        <el-table-column label="人数" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.currentParticipants / row.maxParticipants) * 100)"
              :status="row.currentParticipants >= row.maxParticipants ? 'exception' : ''"
            >
              {{ row.currentParticipants }}/{{ row.maxParticipants }}
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'upcoming'"
              type="danger"
              link
              size="small"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper mt-10">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="courseStore.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑课程' : '新增课程'"
      width="600px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入课程名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
                <el-option label="瑜伽" value="瑜伽" />
                <el-option label="动感单车" value="动感单车" />
                <el-option label="力量训练" value="力量训练" />
                <el-option label="有氧健身" value="有氧健身" />
                <el-option label="普拉提" value="普拉提" />
                <el-option label="搏击" value="搏击" />
                <el-option label="游泳" value="游泳" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="教练" prop="coachName">
              <el-input v-model="form.coachName" placeholder="请输入教练姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时长(分钟)" prop="duration">
              <el-input-number v-model="form.duration" :min="30" :max="180" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日期" prop="date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="请选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-picker
                v-model="form.startTime"
                placeholder="请选择开始时间"
                value-format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="教室" prop="room">
              <el-select v-model="form.room" placeholder="请选择教室" style="width: 100%">
                <el-option label="A1教室" value="A1教室" />
                <el-option label="A2教室" value="A2教室" />
                <el-option label="B1教室" value="B1教室" />
                <el-option label="B2教室" value="B2教室" />
                <el-option label="C1教室" value="C1教室" />
                <el-option label="私教1室" value="私教1室" />
                <el-option label="私教2室" value="私教2室" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大人数" prop="maxParticipants">
              <el-input-number v-model="form.maxParticipants" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="价格(元)" prop="price">
          <el-input-number v-model="form.price" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Course, FilterOptions } from '@/types'
import { useCourseStore } from '@/stores/course'

const courseStore = useCourseStore()

const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const loading = ref(false)
const currentCourse = ref<Course | null>(null)

const isEdit = computed(() => !!currentCourse.value)

const filters = reactive<FilterOptions>({
  courseName: '',
  coachName: '',
})

interface CourseForm {
  name: string
  coachName: string
  category: string
  duration: number
  price: number
  maxParticipants: number
  startTime: string
  endTime: string
  date: string
  room: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

const form = reactive<CourseForm>({
  name: '',
  coachName: '',
  category: '瑜伽',
  duration: 60,
  price: 100,
  maxParticipants: 20,
  startTime: '09:00',
  endTime: '10:00',
  date: new Date().toISOString().split('T')[0],
  room: 'A1教室',
  status: 'upcoming',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  coachName: [{ required: true, message: '请输入教练姓名', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入时长', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  room: [{ required: true, message: '请选择教室', trigger: 'change' }],
  maxParticipants: [{ required: true, message: '请输入最大人数', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

function getStatusType(
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    upcoming: 'primary',
    ongoing: 'success',
    completed: 'info',
    cancelled: 'danger',
  }
  return map[status]
}

function getStatusText(status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'): string {
  const map: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status]
}

async function loadData() {
  await courseStore.fetchCourses(currentPage.value, pageSize.value, filters)
}

function handleSearch() {
  currentPage.value = 1
  loadData()
}

function handleReset() {
  filters.courseName = ''
  filters.coachName = ''
  handleSearch()
}

function handleSizeChange(val: number) {
  pageSize.value = val
  loadData()
}

function handleCurrentChange(val: number) {
  currentPage.value = val
  loadData()
}

function resetForm() {
  Object.assign(form, {
    name: '',
    coachName: '',
    category: '瑜伽',
    duration: 60,
    price: 100,
    maxParticipants: 20,
    startTime: '09:00',
    endTime: '10:00',
    date: new Date().toISOString().split('T')[0],
    room: 'A1教室',
    status: 'upcoming',
  })
}

function handleAdd() {
  currentCourse.value = null
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: Course) {
  currentCourse.value = row
  Object.assign(form, {
    name: row.name,
    coachName: row.coachName,
    category: row.category,
    duration: row.duration,
    price: row.price,
    maxParticipants: row.maxParticipants,
    startTime: row.startTime,
    endTime: row.endTime,
    date: row.date,
    room: row.room,
    status: row.status,
  })
  dialogVisible.value = true
}

function handleCancel(row: Course) {
  ElMessageBox.confirm(`确定要取消课程 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await courseStore.cancelCourse(row.id, row.name)
    ElMessage.success('取消成功')
  }).catch(() => {})
}

function handleClose() {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + minutes
  const newH = Math.floor(totalMinutes / 60)
  const newM = totalMinutes % 60
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`
}

watch(
  () => [form.startTime, form.duration],
  () => {
    form.endTime = addMinutes(form.startTime, form.duration)
  }
)

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const submitData = {
          ...form,
          coachId: `coach_${Date.now()}`,
        }
        if (currentCourse.value) {
          await courseStore.updateCourse(currentCourse.value.id, submitData)
          ElMessage.success('更新成功')
        } else {
          await courseStore.createCourse(submitData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})

watch([currentPage, pageSize], () => {
  loadData()
})
</script>

<style scoped>
.courses-page {
  min-height: 100%;
}

.mb-10 {
  margin-bottom: 10px;
}

.mt-10 {
  margin-top: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
