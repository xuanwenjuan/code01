<template>
  <div class="teachers">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>教师档案管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增教师
          </el-button>
        </div>
      </template>

      <SearchForm @search="handleSearch" @reset="handleReset">
        <el-form-item label="教师姓名">
          <el-input v-model="searchForm.name" placeholder="请输入教师姓名" clearable />
        </el-form-item>
        <el-form-item label="授课科目">
          <el-select v-model="searchForm.subject" placeholder="请选择科目" clearable>
            <el-option
              v-for="cat in level2Categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在职" :value="TeacherStatus.ON" />
            <el-option label="离职" :value="TeacherStatus.OFF" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <!-- 科目标签筛选 -->
      <div class="tag-filter">
        <span class="filter-label">授课科目：</span>
        <el-tag
          v-for="subject in allSubjects"
          :key="subject"
          :type="selectedSubjects.includes(subject) ? 'primary' : 'info'"
          @click="toggleSubjectFilter(subject)"
          class="filter-tag"
        >
          {{ subject }}
        </el-tag>
        <el-button v-if="selectedSubjects.length > 0" link type="primary" size="small" @click="clearSubjectFilters">
          清除筛选
        </el-button>
      </div>

      <!-- 空数据状态 -->
      <el-empty v-if="filteredTeachers.length === 0 && !loading" description="暂无教师数据" />

      <el-table v-else :data="filteredTeachers" style="width: 100%" v-loading="loading">
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">{{ row.name.charAt(0) }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column label="性别" width="80" align="center">
          <template #default="{ row }">
            {{ row.gender === Gender.MALE ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column label="授课科目" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="(subject, index) in row.subjects" :key="index" size="small" style="margin: 2px">
              {{ subject }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="职称" width="100" />
        <el-table-column prop="experience" label="教龄" width="80" align="center">
          <template #default="{ row }">
            {{ row.experience }}年
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === TeacherStatus.ON ? 'success' : 'info'">
              {{ row.status === TeacherStatus.ON ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <CommonDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :mode="dialogMode"
      @confirm="handleConfirm"
      ref="dialogRef"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入姓名"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group
                v-model="form.gender"
                :disabled="dialogMode === 'view'"
              >
                <el-radio :value="Gender.MALE">男</el-radio>
                <el-radio :value="Gender.FEMALE">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input
                v-model="form.phone"
                placeholder="请输入联系电话"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="教龄" prop="experience">
              <el-input-number
                v-model="form.experience"
                :min="0"
                :max="50"
                :disabled="dialogMode === 'view'"
              />
              <span style="margin-left: 8px">年</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学历" prop="education">
              <el-select
                v-model="form.education"
                placeholder="请选择学历"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              >
                <el-option label="大专" value="大专" />
                <el-option label="本科" value="本科" />
                <el-option label="硕士" value="硕士" />
                <el-option label="博士" value="博士" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="职称" prop="title">
              <el-select
                v-model="form.title"
                placeholder="请选择职称"
                style="width: 100%"
                :disabled="dialogMode === 'view'"
              >
                <el-option label="讲师" value="讲师" />
                <el-option label="高级讲师" value="高级讲师" />
                <el-option label="特级讲师" value="特级讲师" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status" v-if="dialogMode !== 'view'">
          <el-radio-group v-model="form.status">
            <el-radio :value="TeacherStatus.ON">在职</el-radio>
            <el-radio :value="TeacherStatus.OFF">离职</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="授课科目" prop="subjects">
          <el-select
            v-model="form.subjects"
            multiple
            placeholder="请选择授课科目"
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
        <el-form-item label="可排课时">
          <div class="schedule-grid">
            <div v-for="day in 7" :key="day" class="day-column">
              <div class="day-header">{{ getDayName(day) }}</div>
              <div
                v-for="period in 8"
                :key="period"
                class="period-cell"
                :class="{ active: isPeriodSelected(day, period) }"
                @click="togglePeriod(day, period)"
              >
                {{ getPeriodName(period) }}
              </div>
            </div>
          </div>
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
  Gender,
  TeacherStatus,
  type Teacher,
  type TeacherForm,
  type AvailableTime,
  DAY_NAMES,
  PERIOD_TIMES,
  type DayOfWeek
} from '@/types'
import CommonDialog from '@/components/CommonDialog.vue'
import SearchForm from '@/components/SearchForm.vue'

const appStore = useAppStore()

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const dialogRef = ref<InstanceType<typeof CommonDialog>>()
const currentId = ref<string | null>(null)

const searchForm = reactive({
  name: '',
  subject: '',
  status: '' as TeacherStatus | ''
})

const selectedSubjects = ref<string[]>([])

const allSubjects = computed(() => {
  const subjects = new Set<string>()
  appStore.teachers.forEach(teacher => {
    teacher.subjects.forEach(subject => subjects.add(subject))
  })
  return Array.from(subjects)
})

const toggleSubjectFilter = (subject: string) => {
  const index = selectedSubjects.value.indexOf(subject)
  if (index > -1) {
    selectedSubjects.value.splice(index, 1)
  } else {
    selectedSubjects.value.push(subject)
  }
}

const clearSubjectFilters = () => {
  selectedSubjects.value = []
}

const form = reactive<TeacherForm>({
  name: '',
  gender: Gender.MALE,
  phone: '',
  email: '',
  subjects: [],
  experience: 0,
  education: '本科',
  title: '讲师',
  status: TeacherStatus.ON,
  availableTime: []
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  subjects: [{ required: true, message: '请选择授课科目', trigger: 'change' }],
  experience: [{ required: true, message: '请输入教龄', trigger: 'blur' }],
  education: [{ required: true, message: '请选择学历', trigger: 'change' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const dialogTitle = computed(() => {
  const titles = { add: '新增教师', edit: '编辑教师', view: '教师详情' }
  return titles[dialogMode.value]
})

const level2Categories = computed(() => {
  return appStore.courseCategories.filter(c => c.level === 2 && c.status === 'enabled')
})

const filteredTeachers = computed(() => {
  return appStore.teachers.filter(teacher => {
    const nameMatch = !searchForm.name || 
      teacher.name.toLowerCase().includes(searchForm.name.toLowerCase())
    const subjectMatch = !searchForm.subject || 
      teacher.subjects.includes(searchForm.subject)
    const statusMatch = !searchForm.status || teacher.status === searchForm.status
    const tagSubjectMatch = selectedSubjects.value.length === 0 || 
      selectedSubjects.value.some(subject => teacher.subjects.includes(subject))
    return nameMatch && subjectMatch && statusMatch && tagSubjectMatch
  })
})

const getDayName = (day: number) => {
  return DAY_NAMES[day as DayOfWeek] || ''
}

const getPeriodName = (period: number) => {
  return PERIOD_TIMES.find(p => p.id === period)?.name || ''
}

const isPeriodSelected = (day: number, period: number) => {
  const dayTime = form.availableTime?.find(t => t.day === day)
  return dayTime?.periods.includes(period) || false
}

const togglePeriod = (day: number, period: number) => {
  if (dialogMode.value === 'view') return
  
  let dayTime = form.availableTime?.find(t => t.day === day)
  if (!dayTime) {
    dayTime = { day, periods: [] }
    form.availableTime = form.availableTime || []
    form.availableTime.push(dayTime)
  }
  
  const index = dayTime.periods.indexOf(period)
  if (index > -1) {
    dayTime.periods.splice(index, 1)
    if (dayTime.periods.length === 0) {
      form.availableTime = form.availableTime.filter(t => t.day !== day)
    }
  } else {
    dayTime.periods.push(period)
    dayTime.periods.sort((a, b) => a - b)
  }
}

const handleSearch = () => {
  // 搜索逻辑已通过 computed 实现
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.subject = ''
  searchForm.status = ''
}

const handleAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleView = (row: Teacher) => {
  dialogMode.value = 'view'
  currentId.value = row.id
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const handleEdit = (row: Teacher) => {
  dialogMode.value = 'edit'
  currentId.value = row.id
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const handleConfirm = async () => {
  await formRef.value?.validate(async (valid) => {
    if (valid) {
      dialogRef.value?.setLoading(true)
      
      try {
        if ((dialogMode.value === 'edit' || dialogMode.value === 'view') && currentId.value) {
          appStore.updateTeacher(currentId.value, form)
          ElMessage.success('编辑成功')
        } else {
          appStore.addTeacher(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
      } catch (error: any) {
        ElMessage.error(error.message)
      } finally {
        dialogRef.value?.setLoading(false)
      }
    }
  })
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    gender: Gender.MALE,
    phone: '',
    email: '',
    subjects: [],
    experience: 0,
    education: '本科',
    title: '讲师',
    status: TeacherStatus.ON,
    availableTime: []
  })
  formRef.value?.clearValidate()
  currentId.value = null
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.teachers {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tag-filter {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .filter-label {
      color: #606266;
      font-size: 14px;
    }

    .filter-tag {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .schedule-grid {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .day-column {
      flex: 1;
      min-width: 80px;
    }

    .day-header {
      text-align: center;
      font-weight: bold;
      padding: 8px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .period-cell {
      padding: 6px 8px;
      text-align: center;
      font-size: 12px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      margin-bottom: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
      }

      &.active {
        background: #409eff;
        color: #fff;
        border-color: #409eff;
      }
    }
  }
}
</style>
