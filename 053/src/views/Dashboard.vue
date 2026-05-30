<template>
  <div class="dashboard">
    <el-row :gutter="20" class="mb-20">
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon size="24"><Menu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ courseCategories.length }}</div>
              <div class="stat-label">课程类目</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ teachers.length }}</div>
              <div class="stat-label">在职教师</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon size="24"><Avatar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ students.length }}</div>
              <div class="stat-label">学员总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ classes.length }}</div>
              <div class="stat-label">班级数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card title="最近学员">
          <el-table :data="recentStudents" style="width: 100%">
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="intendedCourse" label="意向课程" />
            <el-table-column prop="paymentStatus" label="缴费状态">
              <template #default="{ row }">
                <el-tag :type="getPaymentTagType(row.paymentStatus)">
                  {{ getPaymentStatusText(row.paymentStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="classStatus" label="班级状态">
              <template #default="{ row }">
                <el-tag :type="getClassTagType(row.classStatus)">
                  {{ getClassStatusText(row.classStatus) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card title="今日课程">
          <el-list>
            <el-list-item v-for="schedule in todaySchedules" :key="schedule.id">
              <el-list-item-meta>
                <template #title>{{ schedule.className }}</template>
                <template #description>
                  {{ schedule.teacherName }} · {{ schedule.periodTime }} · 教室{{ schedule.room }}
                </template>
              </el-list-item-meta>
            </el-list-item>
            <el-empty v-if="todaySchedules.length === 0" description="暂无今日课程" />
          </el-list>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/store'
import { PERIOD_TIMES } from '@/types'
import { Menu, User, Avatar, Calendar } from '@element-plus/icons-vue'
import axios from 'axios'

const appStore = useAppStore()

const courseCategories = computed(() => appStore.courseCategories)
const teachers = computed(() => appStore.teachers.filter(t => t.status === 'on'))
const students = computed(() => appStore.students)
const classes = computed(() => appStore.classes)

const recentStudents = computed(() => {
  return [...appStore.students].slice(-5).reverse()
})

const todaySchedules = computed(() => {
  const today = new Date().getDay() || 7
  const schedules: Array<{
    id: string
    className: string
    teacherName: string
    periodTime: string
    room?: string
  }> = []

  appStore.classes.forEach(cls => {
    cls.schedule.forEach(sch => {
      if (sch.day === today) {
        const period = PERIOD_TIMES.find(p => p.id === sch.period)
        schedules.push({
          id: `${cls.id}-${sch.id}`,
          className: cls.name,
          teacherName: cls.teacherName,
          periodTime: period?.time || '',
          room: sch.room
        })
      }
    })
  })

  return schedules
})

const getPaymentStatusText = (status: string) => {
  const map: Record<string, string> = {
    unpaid: '未缴费',
    partial: '部分缴费',
    paid: '已缴费'
  }
  return map[status] || status
}

const getPaymentTagType = (status: string) => {
  const map: Record<string, string> = {
    unpaid: 'danger',
    partial: 'warning',
    paid: 'success'
  }
  return map[status] || 'info'
}

const getClassStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待分班',
    enrolled: '已入班',
    suspended: '休学',
    graduated: '结业'
  }
  return map[status] || status
}

const getClassTagType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    enrolled: 'success',
    suspended: 'info',
    graduated: 'info'
  }
  return map[status] || 'info'
}

onMounted(async () => {
  if (appStore.courseCategories.length === 0) {
    const [categoriesRes, teachersRes, studentsRes, classesRes, recordsRes] = await Promise.all([
      axios.get('/api/course-categories'),
      axios.get('/api/teachers'),
      axios.get('/api/students'),
      axios.get('/api/classes'),
      axios.get('/api/assignment-records')
    ])

    appStore.setCourseCategories(categoriesRes.data.data)
    appStore.setTeachers(teachersRes.data.data)
    appStore.setStudents(studentsRes.data.data)
    appStore.setClasses(classesRes.data.data)
    appStore.setAssignmentRecords(recordsRes.data.data)
  }
})
</script>

<style scoped lang="scss">
.dashboard {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}
</style>
