<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的日程</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加日程
      </el-button>
    </div>
    
    <div class="card-wrapper">
      <el-calendar v-model="currentDate">
        <template #date-cell="{ data }">
          <div class="calendar-cell">
            <span class="day-text" :class="{ 'is-today': data.isToday }">{{ data.day }}</span>
            <div v-if="getScheduleCount(data.day) > 0" class="schedule-dot">
              {{ getScheduleCount(data.day) }}
            </div>
          </div>
        </template>
      </el-calendar>
      
      <div class="schedule-list-section mt-20">
        <h3>
          {{ selectedMonth }} 日程列表
          <el-tag size="small" type="primary">共 {{ schedules.length }} 条</el-tag>
        </h3>
        
        <PageLoading :loading="loading" />
        
        <div v-if="schedules.length" class="schedule-list">
          <div v-for="item in schedules" :key="item.id" class="schedule-item">
            <div class="schedule-date">
              <span class="date-day">{{ item.date.split('-')[2] }}</span>
              <span class="date-month">{{ item.date.split('-')[1] }}月</span>
            </div>
            <div class="schedule-content">
              <div class="schedule-header">
                <el-tag :type="getTypeColor(item.type)" size="small">
                  {{ getTypeText(item.type) }}
                </el-tag>
                <span class="schedule-title">{{ item.title }}</span>
                <el-tag v-if="item.remind" size="small" type="warning">
                  <el-icon><Bell /></el-icon>提醒
                </el-tag>
              </div>
              <div class="schedule-meta">
                <span><el-icon><Clock /></el-icon> {{ item.time }}</span>
                <span><el-icon><Location /></el-icon> {{ item.location }}</span>
              </div>
              <p v-if="item.description" class="schedule-desc">{{ item.description }}</p>
            </div>
            <div class="schedule-actions">
              <el-button type="primary" link size="small" @click="handleEdit(item)">
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(item)">
                删除
              </el-button>
            </div>
          </div>
        </div>
        
        <EmptyState v-else description="本月暂无日程安排" />
      </div>
    </div>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑日程' : '添加日程'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="日程标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入日程标题" maxlength="50" show-word-limit />
        </el-form-item>
        
        <el-form-item label="日程类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="会议" value="meeting" />
            <el-option label="任务" value="task" />
            <el-option label="培训" value="training" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="时间" prop="time">
          <el-time-picker
            v-model="form.time"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入地点" />
        </el-form-item>
        
        <el-form-item label="日程描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入日程描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="开启提醒">
          <el-switch v-model="form.remind" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Clock, Location, Bell } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { mockScheduleList, mockCreateSchedule, mockUpdateSchedule, mockDeleteSchedule } from '@/mock/schedule'
import EmptyState from '@/components/EmptyState.vue'
import PageLoading from '@/components/PageLoading.vue'

const loading = ref(false)
const actionLoading = ref(false)
const currentDate = ref(new Date())
const schedules = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const editId = ref(null)

const selectedMonth = computed(() => {
  return dayjs(currentDate.value).format('YYYY年MM月')
})

const form = reactive({
  title: '',
  type: 'meeting',
  date: '',
  time: '',
  location: '',
  description: '',
  remind: true
})

const rules = {
  title: [
    { required: true, message: '请输入日程标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  time: [{ required: true, message: '请选择时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入地点', trigger: 'blur' }]
}

const getTypeText = (t) => ({ meeting: '会议', task: '任务', training: '培训', other: '其他' }[t])
const getTypeColor = (t) => ({ meeting: 'primary', task: 'success', training: 'warning', other: 'info' }[t])

const getScheduleCount = (day) => {
  const dateStr = dayjs(currentDate.value).date(Number(day)).format('YYYY-MM-DD')
  return schedules.value.filter(s => s.date === dateStr).length
}

const loadData = async () => {
  loading.value = true
  try {
    const month = dayjs(currentDate.value).format('YYYY-MM')
    const res = await mockScheduleList({ month })
    schedules.value = res.list
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(form, {
    title: '',
    type: 'meeting',
    date: dayjs(currentDate.value).format('YYYY-MM-DD'),
    time: '',
    location: '',
    description: '',
    remind: true
  })
  dialogVisible.value = true
}

const handleEdit = (item) => {
  isEdit.value = true
  editId.value = item.id
  Object.assign(form, { ...item })
  dialogVisible.value = true
}

const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除此日程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await mockDeleteSchedule(item.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {}
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      actionLoading.value = true
      try {
        if (isEdit.value) {
          await mockUpdateSchedule(editId.value, form)
          ElMessage.success('更新成功')
        } else {
          await mockCreateSchedule(form)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadData()
      } finally {
        actionLoading.value = false
      }
    }
  })
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }
}

.calendar-cell {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .day-text {
    font-size: 14px;
    
    &.is-today {
      color: #409EFF;
      font-weight: 600;
    }
  }
  
  .schedule-dot {
    margin-top: 4px;
    background: #409EFF;
    color: #fff;
    font-size: 12px;
    padding: 0 4px;
    border-radius: 8px;
    min-width: 16px;
    text-align: center;
  }
}

.schedule-list-section {
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.schedule-list {
  .schedule-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 12px;
    
    .schedule-date {
      flex-shrink: 0;
      width: 60px;
      text-align: center;
      padding: 8px;
      background: #f5f7fa;
      border-radius: 8px;
      
      .date-day {
        display: block;
        font-size: 24px;
        font-weight: 600;
        color: #409EFF;
        line-height: 1;
      }
      
      .date-month {
        font-size: 12px;
        color: #909399;
      }
    }
    
    .schedule-content {
      flex: 1;
      
      .schedule-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        
        .schedule-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
      
      .schedule-meta {
        display: flex;
        gap: 20px;
        margin-bottom: 8px;
        font-size: 13px;
        color: #606266;
        
        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
      
      .schedule-desc {
        font-size: 13px;
        color: #909399;
        margin: 0;
      }
    }
    
    .schedule-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>
