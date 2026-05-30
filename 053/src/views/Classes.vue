<template>
  <div class="classes">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>班级排课管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增班级
          </el-button>
        </div>
      </template>

      <SearchForm @search="handleSearch" @reset="handleReset">
        <el-form-item label="班级名称">
          <el-input v-model="searchForm.name" placeholder="请输入班级名称" clearable />
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="searchForm.course" placeholder="请选择课程" clearable>
            <el-option
              v-for="cat in level2Categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="招生中" :value="ClassStatus.RECRUITING" />
            <el-option label="进行中" :value="ClassStatus.ACTIVE" />
            <el-option label="已结课" :value="ClassStatus.FINISHED" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <!-- 空数据状态 -->
      <el-empty v-if="filteredClasses.length === 0 && !loading" :key="refreshKey" description="暂无班级数据" />

      <el-table v-else :key="refreshKey" :data="filteredClasses" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="班级名称" min-width="150" />
        <el-table-column prop="course" label="课程" width="120" />
        <el-table-column label="授课教师" width="120">
          <template #default="{ row }">
            {{ row.teacherName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="学员人数" width="120" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.currentStudents / row.maxStudents) * 100)"
              :format="() => `${row.currentStudents}/${row.maxStudents}`"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开班日期" width="120" />
        <el-table-column prop="endDate" label="结课日期" width="120" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleSchedule(row)">
              排课
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑班级弹窗 -->
    <CommonDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :mode="dialogMode"
      @confirm="handleConfirm"
      ref="dialogRef"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="班级名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入班级名称"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程" prop="course">
              <el-select
                v-model="form.course"
                placeholder="请选择课程"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              >
                <el-option
                  v-for="cat in level2Categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授课教师" prop="teacherId">
              <el-select
                v-model="form.teacherId"
                placeholder="请选择教师"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              >
                <el-option
                  v-for="teacher in activeTeachers"
                  :key="teacher.id"
                  :label="teacher.name"
                  :value="teacher.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大人数" prop="maxStudents">
              <el-input-number
                v-model="form.maxStudents"
                :min="1"
                :max="100"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status" v-if="dialogMode !== 'view'">
              <el-radio-group v-model="form.status">
                <el-radio :value="ClassStatus.RECRUITING">招生中</el-radio>
                <el-radio :value="ClassStatus.ACTIVE">进行中</el-radio>
                <el-radio :value="ClassStatus.FINISHED">已结课</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开班日期" prop="startDate">
              <el-date-picker
                v-model="form.startDate"
                type="date"
                placeholder="选择开班日期"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结课日期" prop="endDate">
              <el-date-picker
                v-model="form.endDate"
                type="date"
                placeholder="选择结课日期"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
      </el-form>
    </CommonDialog>

    <!-- 排课弹窗 -->
    <el-dialog
      v-model="scheduleDialogVisible"
      :title="`${currentClass?.name || ''} - 课程安排`"
      width="900px"
    >
      <div class="schedule-header">
        <el-select v-model="scheduleViewType" placeholder="视图类型" style="width: 150px">
          <el-option label="按班级" value="class" />
          <el-option label="按教师" value="teacher" />
        </el-select>
        <el-button type="primary" size="small" @click="handleAddSchedule">
          <el-icon><Plus /></el-icon>
          添加课程
        </el-button>
      </div>

      <div class="schedule-table">
        <table>
          <thead>
            <tr>
              <th class="time-column">时间</th>
              <th v-for="day in 7" :key="day">
                {{ getDayName(day as DayOfWeek) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="period in 8" :key="period">
              <td class="time-cell">{{ getPeriodName(period) }}</td>
              <td
                v-for="day in 7"
                :key="`${day}-${period}`"
                class="schedule-cell"
                :class="{
                  available: isPeriodAvailable(day as DayOfWeek, period),
                  occupied: !isPeriodAvailable(day as DayOfWeek, period),
                  'has-schedule': getScheduleAt(day as DayOfWeek, period),
                  'drag-over': dragState.isDragging
                }"
                @click="handleCellClick(day as DayOfWeek, period)"
                @dragover.prevent
                @dragenter="handleDragEnter($event, day as DayOfWeek, period)"
                @dragleave="handleDragLeave"
                @drop="handleDrop(day as DayOfWeek, period)"
              >
                <div
                  v-if="getScheduleAt(day as DayOfWeek, period)"
                  class="schedule-item"
                  :class="{ 
                    locked: getScheduleAt(day as DayOfWeek, period)?.locked,
                    dragging: dragState.draggedSchedule?.id === getScheduleAt(day as DayOfWeek, period)?.id
                  }"
                  :draggable="!getScheduleAt(day as DayOfWeek, period)?.locked"
                  @dragstart="handleDragStart(getScheduleAt(day as DayOfWeek, period)!, day as DayOfWeek, period)"
                  @dragend="handleDragEnd"
                >
                  <div class="course-name">
                    {{ getScheduleAt(day as DayOfWeek, period)?.course }}
                  </div>
                  <div class="teacher-name">
                    {{ getScheduleAt(day as DayOfWeek, period)?.teacherName }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-dialog>

    <!-- 添加/编辑课程弹窗 -->
    <CommonDialog
      v-model="scheduleFormVisible"
      :title="scheduleForm.id ? '编辑课程' : '添加课程'"
      width="500px"
      mode="edit"
      @confirm="handleScheduleConfirm"
      ref="scheduleFormRef"
    >
      <el-form :model="scheduleForm" label-width="100px" ref="scheduleFormElRef">
        <el-form-item label="星期" prop="dayOfWeek">
          <el-select v-model="scheduleForm.dayOfWeek" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="day in 7"
              :key="day"
              :label="getDayName(day as DayOfWeek)"
              :value="day"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="节次" prop="period">
          <el-select v-model="scheduleForm.period" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="period in 8"
              :key="period"
              :label="getPeriodName(period)"
              :value="period"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程" prop="course">
          <el-select v-model="scheduleForm.course" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="cat in level2Categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="授课教师" prop="teacherId">
          <el-select v-model="scheduleForm.teacherId" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="teacher in activeTeachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教室">
          <el-input v-model="scheduleForm.classroom" placeholder="请输入教室" />
        </el-form-item>
        <el-form-item label="是否锁定">
          <el-switch v-model="scheduleForm.locked" />
        </el-form-item>
      </el-form>
    </CommonDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAppStore } from '@/store'
import {
  ClassStatus,
  TeacherStatus,
  type Class,
  type ClassForm,
  type ClassSchedule,
  type DayOfWeek,
  PERIOD_TIMES,
  DAY_NAMES
} from '@/types'
import CommonDialog from '@/components/CommonDialog.vue'
import SearchForm from '@/components/SearchForm.vue'

const appStore = useAppStore()

const loading = ref(false)
const dialogVisible = ref(false)
const scheduleDialogVisible = ref(false)
const scheduleFormVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const scheduleViewType = ref<'class' | 'teacher'>('class')
const formRef = ref<FormInstance>()
const scheduleFormElRef = ref<FormInstance>()
const dialogRef = ref<InstanceType<typeof CommonDialog>>()
const scheduleFormRef = ref<InstanceType<typeof CommonDialog>>()
const currentId = ref<string | null>(null)
const currentClass = ref<Class | null>(null)
const refreshKey = ref(0)

const forceRefresh = () => {
  refreshKey.value++
}

// 拖拽相关状态
const dragState = reactive({
  isDragging: false,
  draggedSchedule: null as ClassSchedule | null,
  sourceDay: 0 as DayOfWeek,
  sourcePeriod: 0
})

const searchForm = reactive({
  name: '',
  course: '',
  status: '' as ClassStatus | ''
})

const form = reactive<ClassForm>({
  name: '',
  course: '',
  teacherId: '',
  teacherName: '',
  maxStudents: 30,
  currentStudents: 0,
  status: ClassStatus.RECRUITING,
  startDate: '',
  endDate: '',
  description: '',
  schedule: []
})

const scheduleForm = reactive<Partial<ClassSchedule>>({
  id: '',
  classId: '',
  className: '',
  dayOfWeek: 1,
  period: 1,
  course: '',
  teacherId: '',
  teacherName: '',
  classroom: '',
  locked: false
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  course: [{ required: true, message: '请选择课程', trigger: 'change' }],
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
  maxStudents: [{ required: true, message: '请输入最大人数', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开班日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结课日期', trigger: 'change' }]
}

const dialogTitle = computed(() => {
  const titles = { add: '新增班级', edit: '编辑班级', view: '班级详情' }
  return titles[dialogMode.value]
})

const level2Categories = computed(() => {
  return appStore.courseCategories.filter(c => c.level === 2 && c.status === 'enabled')
})

const activeTeachers = computed(() => {
  return appStore.teachers.filter(t => t.status === TeacherStatus.ON)
})

const filteredClasses = computed(() => {
  return appStore.classes.filter(cls => {
    const nameMatch = !searchForm.name || 
      cls.name.toLowerCase().includes(searchForm.name.toLowerCase())
    const courseMatch = !searchForm.course || cls.course === searchForm.course
    const statusMatch = !searchForm.status || cls.status === searchForm.status
    return nameMatch && courseMatch && statusMatch
  })
})

const getStatusText = (status: ClassStatus) => {
  const map: Record<ClassStatus, string> = {
    [ClassStatus.RECRUITING]: '招生中',
    [ClassStatus.ACTIVE]: '进行中',
    [ClassStatus.FINISHED]: '已结课'
  }
  return map[status] || status
}

const getStatusTagType = (status: ClassStatus) => {
  const map: Record<ClassStatus, string> = {
    [ClassStatus.RECRUITING]: 'warning',
    [ClassStatus.ACTIVE]: 'success',
    [ClassStatus.FINISHED]: 'info'
  }
  return map[status] || 'info'
}

const getDayName = (day: DayOfWeek) => {
  return DAY_NAMES[day] || ''
}

const getPeriodName = (period: number) => {
  return PERIOD_TIMES.find(p => p.id === period)?.name || ''
}

const getScheduleAt = (day: DayOfWeek, period: number) => {
  if (!currentClass.value) return null
  return currentClass.value.schedule.find(
    s => s.dayOfWeek === day && s.period === period
  )
}

const isPeriodAvailable = (day: DayOfWeek, period: number) => {
  const schedule = getScheduleAt(day, period)
  return !schedule
}

// 检查教师时段冲突
const checkTeacherConflict = (teacherId: string, day: DayOfWeek, period: number, excludeId?: string): boolean => {
  // 检查当前班级的其他课程
  if (currentClass.value) {
    const conflict = currentClass.value.schedule.find(
      s => s.teacherId === teacherId && s.dayOfWeek === day && s.period === period && s.id !== excludeId
    )
    return !!conflict
  }
  return false
}

// 拖拽开始
const handleDragStart = (schedule: ClassSchedule, day: DayOfWeek, period: number) => {
  if (schedule.locked) {
    ElMessage.warning('该课程已锁定，无法拖拽调课')
    return
  }
  dragState.isDragging = true
  dragState.draggedSchedule = schedule
  dragState.sourceDay = day
  dragState.sourcePeriod = period
}

// 拖拽结束
const handleDragEnd = () => {
  dragState.isDragging = false
  dragState.draggedSchedule = null
  dragState.sourceDay = 0 as DayOfWeek
  dragState.sourcePeriod = 0
}

// 拖拽进入
const handleDragEnter = (e: DragEvent, day: DayOfWeek, period: number) => {
  e.preventDefault()
}

// 拖拽离开
const handleDragLeave = () => {
}

// 放置
const handleDrop = (day: DayOfWeek, period: number) => {
  if (!dragState.isDragging || !dragState.draggedSchedule) return

  const schedule = dragState.draggedSchedule
  
  // 检查是否放置到原位置
  if (dragState.sourceDay === day && dragState.sourcePeriod === period) {
    handleDragEnd()
    return
  }

  // 检查目标位置是否有课程
  const targetSchedule = getScheduleAt(day, period)
  if (targetSchedule && targetSchedule.locked) {
    ElMessage.warning('目标位置的课程已锁定，无法调课')
    handleDragEnd()
    return
  }

  // 检查教师时段冲突
  if (checkTeacherConflict(schedule.teacherId, day, period, schedule.id)) {
    ElMessage.warning('该教师在此时段已有课程安排')
    handleDragEnd()
    return
  }

  // 执行调课
  try {
    // 先移除原位置课程
    const newSchedule = currentClass.value!.schedule.filter(s => s.id !== schedule.id)
    
    // 添加到新位置
    newSchedule.push({
      ...schedule,
      dayOfWeek: day,
      period: period
    })

    appStore.updateClassSchedule(currentClass.value!.id, newSchedule)
    
    // 更新当前班级数据
    const updatedClass = appStore.classes.find(c => c.id === currentClass.value?.id)
    if (updatedClass) {
      currentClass.value = updatedClass
    }

    ElMessage.success('调课成功')
  } catch (error: any) {
    ElMessage.error(error.message)
  } finally {
    handleDragEnd()
  }
}

const handleSearch = () => {
  // 搜索逻辑已通过 computed 实现
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.course = ''
  searchForm.status = ''
}

const handleAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Class) => {
  dialogMode.value = 'edit'
  currentId.value = row.id
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const handleSchedule = (row: Class) => {
  currentClass.value = row
  scheduleDialogVisible.value = true
}

const handleAddSchedule = () => {
  Object.assign(scheduleForm, {
    id: '',
    classId: currentClass.value?.id || '',
    className: currentClass.value?.name || '',
    dayOfWeek: 1,
    period: 1,
    course: currentClass.value?.course || '',
    teacherId: currentClass.value?.teacherId || '',
    teacherName: currentClass.value?.teacherName || '',
    classroom: '',
    locked: false
  })
  scheduleFormVisible.value = true
}

const handleCellClick = (day: DayOfWeek, period: number) => {
  const schedule = getScheduleAt(day, period)
  if (schedule) {
    if (schedule.locked) {
      ElMessage.warning('该课程已锁定，无法编辑')
      return
    }
    Object.assign(scheduleForm, JSON.parse(JSON.stringify(schedule)))
    scheduleFormVisible.value = true
  } else {
    Object.assign(scheduleForm, {
      id: '',
      classId: currentClass.value?.id || '',
      className: currentClass.value?.name || '',
      dayOfWeek: day,
      period: period,
      course: currentClass.value?.course || '',
      teacherId: currentClass.value?.teacherId || '',
      teacherName: currentClass.value?.teacherName || '',
      classroom: '',
      locked: false
    })
    scheduleFormVisible.value = true
  }
}

const handleConfirm = async () => {
  await formRef.value?.validate(async (valid) => {
    if (valid) {
      dialogRef.value?.setLoading(true)
      
      try {
        const teacher = activeTeachers.value.find(t => t.id === form.teacherId)
        if (teacher) {
          form.teacherName = teacher.name
        }
        
        if (dialogMode.value === 'edit' && currentId.value) {
          appStore.updateClass(currentId.value, form)
          ElMessage.success('编辑成功')
        } else {
          appStore.addClass(form)
          ElMessage.success('新增成功')
        }
        forceRefresh()
        dialogVisible.value = false
      } catch (error: any) {
        ElMessage.error(error.message)
      } finally {
        dialogRef.value?.setLoading(false)
      }
    }
  })
}

const handleScheduleConfirm = async () => {
  if (!currentClass.value) return
  
  // 检查时段冲突
  if (scheduleForm.dayOfWeek && scheduleForm.period && scheduleForm.teacherId) {
    const conflict = checkTeacherConflict(
      scheduleForm.teacherId,
      scheduleForm.dayOfWeek,
      scheduleForm.period,
      scheduleForm.id
    )
    if (conflict) {
      ElMessage.warning('该教师在此时段已有课程安排，请调整时段')
      return
    }
  }

  // 检查当前位置是否已有课程
  if (scheduleForm.dayOfWeek && scheduleForm.period) {
    const existingSchedule = getScheduleAt(scheduleForm.dayOfWeek, scheduleForm.period)
    if (existingSchedule && existingSchedule.id !== scheduleForm.id) {
      ElMessage.warning('该时段已有课程安排，请选择其他时段')
      return
    }
  }

  scheduleFormRef.value?.setLoading(true)
  
  try {
    const teacher = activeTeachers.value.find(t => t.id === scheduleForm.teacherId)
    if (teacher) {
      scheduleForm.teacherName = teacher.name
    }
    
    if (scheduleForm.id) {
      // 编辑
      appStore.updateClassSchedule(currentClass.value.id, scheduleForm.id, scheduleForm as ClassSchedule)
      ElMessage.success('编辑成功')
    } else {
      // 新增
      appStore.addClassSchedule(currentClass.value.id, scheduleForm as ClassSchedule)
      ElMessage.success('添加成功')
    }
    
    // 更新当前班级数据
    const updatedClass = appStore.classes.find(c => c.id === currentClass.value?.id)
    if (updatedClass) {
      currentClass.value = updatedClass
    }
    
    scheduleFormVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message)
  } finally {
    scheduleFormRef.value?.setLoading(false)
  }
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    course: '',
    teacherId: '',
    teacherName: '',
    maxStudents: 30,
    currentStudents: 0,
    status: ClassStatus.RECRUITING,
    startDate: '',
    endDate: '',
    description: '',
    schedule: []
  })
  formRef.value?.clearValidate()
  currentId.value = null
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.classes {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .schedule-table {
    overflow-x: auto;

    table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        border: 1px solid #ebeef5;
        padding: 8px;
        text-align: center;
      }

      th {
        background: #f5f7fa;
        font-weight: 500;
      }

      .time-column {
        width: 100px;
      }

      .time-cell {
        background: #fafafa;
        font-size: 12px;
      }

      .schedule-cell {
        height: 60px;
        cursor: pointer;
        transition: all 0.3s;

        &.available:hover {
          background: #f0f9ff;
        }

        &.occupied {
          background: #f5f7fa;
        }

        &.has-schedule {
          background: #ecf5ff;
        }

        &.drag-over {
          background: #e6f7ff;
          border: 2px dashed #409eff !important;
        }
      }

      .schedule-item {
        padding: 4px;
        border-radius: 4px;
        background: #409eff;
        color: #fff;
        font-size: 12px;
        cursor: move;
        transition: all 0.3s;

        &:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
        }

        &.locked {
          background: #909399;
          cursor: not-allowed;
        }

        &.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .course-name {
          font-weight: 500;
          margin-bottom: 2px;
        }

        .teacher-name {
          font-size: 11px;
          opacity: 0.9;
        }
      }
    }
  }
}
</style>
