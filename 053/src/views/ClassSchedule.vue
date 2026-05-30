<template>
  <div class="class-schedule">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>班级课表排课</span>
          <el-button type="primary" @click="handleAddClass">
            <el-icon><Plus /></el-icon>
            新增班级
          </el-button>
        </div>
      </template>

      <el-select v-model="selectedClassId" placeholder="请选择班级" style="width: 300px; margin-bottom: 20px">
        <el-option
          v-for="cls in appStore.classes"
          :key="cls.id"
          :label="`${cls.name} - ${cls.teacherName}`"
          :value="cls.id"
        />
      </el-select>

      <div v-if="selectedClass" class="schedule-container">
        <div class="class-info">
          <h3>{{ selectedClass.name }}</h3>
          <span>教师：{{ selectedClass.teacherName }}</span>
          <span>课程：{{ selectedClass.categoryName }}</span>
          <span>人数：{{ selectedClass.currentStudents }}/{{ selectedClass.maxStudents }}</span>
        </div>

        <div class="schedule-table">
          <div class="schedule-header">
            <div class="time-column">时间</div>
            <div v-for="day in 7" :key="day" class="day-column">{{ getDayName(day) }}</div>
          </div>
          <div class="schedule-body">
            <div v-for="period in PERIOD_TIMES" :key="period.id" class="period-row">
              <div class="time-cell">
                <div>{{ period.name }}</div>
                <div class="time-range">{{ period.time }}</div>
              </div>
              <div
                v-for="day in 7"
                :key="day"
                class="schedule-cell"
                :class="{
                  'has-schedule': getSchedule(day, period.id),
                  'locked': getSchedule(day, period.id)?.isLocked,
                  'available': isTimeAvailable(day, period.id)
                }"
                @click="handleCellClick(day, period.id)"
              >
                <div v-if="getSchedule(day, period.id)" class="schedule-item">
                  <div class="room">{{ getSchedule(day, period.id)?.room }}</div>
                  <el-icon v-if="getSchedule(day, period.id)?.isLocked" class="lock-icon"><Lock /></el-icon>
                </div>
                <div v-else-if="isTimeAvailable(day, period.id)" class="empty-available">
                  <el-icon><Plus /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="schedule-legend">
          <div class="legend-item">
            <span class="legend-color available"></span>
            <span>老师可排课</span>
          </div>
          <div class="legend-item">
            <span class="legend-color scheduled"></span>
            <span>已排课</span>
          </div>
          <div class="legend-item">
            <span class="legend-color locked"></span>
            <span>已锁定</span>
          </div>
        </div>
      </div>

      <el-empty v-else description="请选择班级查看课表" />
    </el-card>

    <CommonDialog
      v-model="classDialogVisible"
      :title="isEditClass ? '编辑班级' : '新增班级'"
      width="600px"
      @confirm="handleClassConfirm"
      ref="classDialogRef"
    >
      <el-form :model="classForm" label-width="100px" :rules="classRules" ref="classFormRef">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="classForm.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="所属课程" prop="categoryId">
          <el-select v-model="classForm.categoryId" placeholder="请选择课程" style="width: 100%">
            <el-option
              v-for="cat in allCourses"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="授课教师" prop="teacherId">
          <el-select v-model="classForm.teacherId" placeholder="请选择教师" style="width: 100%">
            <el-option
              v-for="teacher in activeTeachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="最大人数" prop="maxStudents">
          <el-input-number v-model="classForm.maxStudents" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="classForm.status">
            <el-radio value="active">招生中</el-radio>
            <el-radio value="finished">已结课</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </CommonDialog>

    <CommonDialog
      v-model="scheduleDialogVisible"
      :title="isEditSchedule ? '编辑课表' : '添加课表'"
      width="500px"
      @confirm="handleScheduleConfirm"
      ref="scheduleDialogRef"
    >
      <el-form :model="scheduleForm" label-width="100px">
        <el-form-item label="星期">
          <el-select v-model="scheduleForm.day" placeholder="请选择星期">
            <el-option v-for="day in 7" :key="day" :label="getDayName(day)" :value="day" />
          </el-select>
        </el-form-item>
        <el-form-item label="节次">
          <el-select v-model="scheduleForm.period" placeholder="请选择节次">
            <el-option
              v-for="period in PERIOD_TIMES"
              :key="period.id"
              :label="`${period.name} (${period.time})`"
              :value="period.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教室">
          <el-input v-model="scheduleForm.room" placeholder="请输入教室" />
        </el-form-item>
        <el-form-item label="锁定课程">
          <el-switch v-model="scheduleForm.isLocked" />
        </el-form-item>
      </el-form>
    </CommonDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '@/store'
import type { Class as ClassType, ScheduleItem } from '@/types'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Lock } from '@element-plus/icons-vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { generateId } from '@/mock'
import { DAY_NAMES, PERIOD_TIMES } from '@/types'

const appStore = useAppStore()

const selectedClassId = ref('')
const classDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)
const isEditClass = ref(false)
const isEditSchedule = ref(false)
const classFormRef = ref<FormInstance>()
const scheduleFormRef = ref<FormInstance>()

const classForm = reactive<Partial<ClassType>>({
  id: '',
  name: '',
  categoryId: '',
  categoryName: '',
  teacherId: '',
  teacherName: '',
  maxStudents: 20,
  currentStudents: 0,
  status: 'active',
  schedule: []
})

const scheduleForm = reactive<{
  id?: string
  day: number
  period: number
  room: string
  isLocked: boolean
}>({
  id: undefined,
  day: 1,
  period: 1,
  room: '',
  isLocked: false
})

const classRules: FormRules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
  maxStudents: [{ required: true, message: '请输入最大人数', trigger: 'blur' }]
}

const selectedClass = computed(() => {
  return appStore.classes.find(c => c.id === selectedClassId.value)
})

const allCourses = computed(() => {
  return appStore.courseCategories.filter(c => c.level === 2)
})

const activeTeachers = computed(() => {
  return appStore.teachers.filter(t => t.status === 'on')
})

const selectedTeacher = computed(() => {
  if (!selectedClass.value) return null
  return appStore.teachers.find(t => t.id === selectedClass.value?.teacherId)
})

const getDayName = (day: number) => {
  return DAY_NAMES[day as keyof typeof DAY_NAMES] || ''
}

const getSchedule = (day: number, period: number) => {
  if (!selectedClass.value) return null
  return selectedClass.value.schedule.find(s => s.day === day && s.period === period)
}

const isTimeAvailable = (day: number, period: number) => {
  if (!selectedTeacher.value) return false
  const available = selectedTeacher.value.availableTime.find(t => t.day === day)
  return available?.periods.includes(period) || false
}

const handleAddClass = () => {
  isEditClass.value = false
  Object.assign(classForm, {
    id: '',
    name: '',
    categoryId: '',
    categoryName: '',
    teacherId: '',
    teacherName: '',
    maxStudents: 20,
    currentStudents: 0,
    status: 'active',
    schedule: []
  })
  classDialogVisible.value = true
}

const handleCellClick = (day: number, period: number) => {
  if (!selectedClassId.value) {
    ElMessage.warning('请先选择班级')
    return
  }

  const existingSchedule = getSchedule(day, period)
  
  if (existingSchedule) {
    if (existingSchedule.isLocked) {
      ElMessageBox.confirm('该课程已锁定，确定要解锁并编辑吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        isEditSchedule.value = true
        Object.assign(scheduleForm, {
          id: existingSchedule.id,
          day: existingSchedule.day,
          period: existingSchedule.period,
          room: existingSchedule.room || '',
          isLocked: false
        })
        scheduleDialogVisible.value = true
      }).catch(() => {})
    } else {
      ElMessageBox.confirm('确定要删除该课表吗？', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'danger',
        distinguishCancelAndClose: true
      }).then(() => {
        const newSchedule = selectedClass.value!.schedule.filter(s => s.id !== existingSchedule.id)
        appStore.updateClass(selectedClassId.value, { schedule: newSchedule })
        ElMessage.success('删除成功')
      }).catch(() => {
        isEditSchedule.value = true
        Object.assign(scheduleForm, {
          id: existingSchedule.id,
          day: existingSchedule.day,
          period: existingSchedule.period,
          room: existingSchedule.room || '',
          isLocked: existingSchedule.isLocked
        })
        scheduleDialogVisible.value = true
      })
    }
  } else if (isTimeAvailable(day, period)) {
    isEditSchedule.value = false
    Object.assign(scheduleForm, {
      id: undefined,
      day,
      period,
      room: '',
      isLocked: false
    })
    scheduleDialogVisible.value = true
  } else {
    ElMessage.info('该时间段教师不可排课')
  }
}

const handleClassConfirm = () => {
  classFormRef.value?.validate((valid) => {
    if (valid) {
      const category = allCourses.value.find(c => c.id === classForm.categoryId)
      const teacher = activeTeachers.value.find(t => t.id === classForm.teacherId)
      
      if (isEditClass.value) {
        appStore.updateClass(classForm.id!, {
          ...classForm,
          categoryName: category?.name,
          teacherName: teacher?.name
        } as ClassType)
        ElMessage.success('编辑成功')
      } else {
        const newClass: ClassType = {
          id: generateId(),
          name: classForm.name!,
          categoryId: classForm.categoryId!,
          categoryName: category?.name || '',
          teacherId: classForm.teacherId!,
          teacherName: teacher?.name || '',
          maxStudents: classForm.maxStudents!,
          currentStudents: 0,
          status: classForm.status! as 'active' | 'finished',
          schedule: [],
          createTime: new Date().toISOString().split('T')[0]
        }
        appStore.addClass(newClass)
        ElMessage.success('新增成功')
      }
      classDialogVisible.value = false
    }
  })
}

const handleScheduleConfirm = () => {
  if (!selectedClassId.value) return
  
  const cls = selectedClass.value
  if (!cls) return

  if (isEditSchedule.value && scheduleForm.id) {
    const scheduleIndex = cls.schedule.findIndex(s => s.id === scheduleForm.id)
    if (scheduleIndex > -1) {
      const newSchedule = [...cls.schedule]
      newSchedule[scheduleIndex] = {
        id: scheduleForm.id,
        day: scheduleForm.day,
        period: scheduleForm.period,
        room: scheduleForm.room,
        isLocked: scheduleForm.isLocked
      }
      appStore.updateClass(selectedClassId.value, { schedule: newSchedule })
    }
  } else {
    const newScheduleItem: ScheduleItem = {
      id: generateId(),
      day: scheduleForm.day,
      period: scheduleForm.period,
      room: scheduleForm.room,
      isLocked: scheduleForm.isLocked
    }
    appStore.updateClass(selectedClassId.value, {
      schedule: [...cls.schedule, newScheduleItem]
    })
  }
  
  ElMessage.success(isEditSchedule.value ? '编辑成功' : '添加成功')
  scheduleDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.class-schedule {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .class-info {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    h3 {
      margin: 0;
      font-size: 18px;
    }

    span {
      color: #606266;
    }
  }

  .schedule-table {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
  }

  .schedule-header {
    display: flex;
    background: #f5f7fa;
    font-weight: 500;

    .time-column {
      width: 120px;
      padding: 12px;
      text-align: center;
      border-right: 1px solid #e4e7ed;
    }

    .day-column {
      flex: 1;
      padding: 12px;
      text-align: center;
      border-right: 1px solid #e4e7ed;

      &:last-child {
        border-right: none;
      }
    }
  }

  .schedule-body {
    .period-row {
      display: flex;
      border-bottom: 1px solid #e4e7ed;

      &:last-child {
        border-bottom: none;
      }
    }

    .time-cell {
      width: 120px;
      padding: 12px 8px;
      text-align: center;
      border-right: 1px solid #e4e7ed;
      background: #fafafa;

      .time-range {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }

    .schedule-cell {
      flex: 1;
      min-height: 60px;
      padding: 8px;
      border-right: 1px solid #e4e7ed;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;

      &:last-child {
        border-right: none;
      }

      &:hover {
        background: #ecf5ff;
      }

      &.has-schedule {
        background: #409eff;
        color: #fff;

        &.locked {
          background: #909399;
        }
      }

      &.available:not(.has-schedule) {
        background: #f0f9eb;
      }
    }

    .schedule-item {
      width: 100%;
      text-align: center;
      position: relative;

      .lock-icon {
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 12px;
      }
    }

    .empty-available {
      color: #67c23a;
    }
  }

  .schedule-legend {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;

      &.available {
        background: #f0f9eb;
        border: 1px solid #67c23a;
      }

      &.scheduled {
        background: #409eff;
      }

      &.locked {
        background: #909399;
      }
    }
  }
}
</style>
