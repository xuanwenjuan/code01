<template>
  <div class="students">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学员报名管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增学员
          </el-button>
        </div>
      </template>

      <SearchForm @search="handleSearch" @reset="handleReset">
        <el-form-item label="学员姓名">
          <el-input v-model="searchForm.name" placeholder="请输入学员姓名" clearable />
        </el-form-item>
        <el-form-item label="意向课程">
          <el-select v-model="searchForm.course" placeholder="请选择课程" clearable>
            <el-option
              v-for="cat in level2Categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="缴费状态">
          <el-select v-model="searchForm.paymentStatus" placeholder="请选择" clearable>
            <el-option label="未缴费" :value="PaymentStatus.UNPAID" />
            <el-option label="部分缴费" :value="PaymentStatus.PARTIAL" />
            <el-option label="已缴费" :value="PaymentStatus.PAID" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级状态">
          <el-select v-model="searchForm.classStatus" placeholder="请选择" clearable>
            <el-option label="待分班" :value="StudentClassStatus.PENDING" />
            <el-option label="已入班" :value="StudentClassStatus.ENROLLED" />
            <el-option label="休学" :value="StudentClassStatus.SUSPENDED" />
            <el-option label="结业" :value="StudentClassStatus.GRADUATED" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <el-tabs v-model="activeTab" class="status-tabs">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="待分班" :name="StudentClassStatus.PENDING" />
        <el-tab-pane label="已入班" :name="StudentClassStatus.ENROLLED" />
        <el-tab-pane label="休学" :name="StudentClassStatus.SUSPENDED" />
        <el-tab-pane label="结业" :name="StudentClassStatus.GRADUATED" />
      </el-tabs>

      <!-- 空数据状态 -->
      <el-empty v-if="filteredStudents.length === 0 && !loading" :key="refreshKey" description="暂无学员数据" />

      <el-table v-else :key="refreshKey" :data="filteredStudents" style="width: 100%" v-loading="loading">
        <el-table-column label="基本信息" min-width="150">
          <template #default="{ row }">
            <div class="student-info">
              <el-avatar :size="40">{{ row.name.charAt(0) }}</el-avatar>
              <div class="info-detail">
                <div class="name">{{ row.name }}</div>
                <div class="phone">{{ row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80" align="center">
          <template #default="{ row }">
            {{ row.gender === Gender.MALE ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="intendedCourse" label="意向课程" min-width="120" />
        <el-table-column label="缴费状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPaymentTagType(row.paymentStatus)" size="small">
              {{ getPaymentStatusText(row.paymentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="班级状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getClassTagType(row.classStatus)" size="small">
              {{ getClassStatusText(row.classStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="所属班级" min-width="120" />
        <el-table-column label="操作" width="280" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.classStatus === StudentClassStatus.PENDING"
              link
              type="primary"
              size="small"
              @click="handleAssignClass(row)"
            >
              分班
            </el-button>
            <el-button
              v-if="row.classStatus === StudentClassStatus.ENROLLED"
              link
              type="warning"
              size="small"
              @click="handleTransfer(row)"
            >
              转班
            </el-button>
            <el-button
              v-if="row.classStatus === StudentClassStatus.ENROLLED"
              link
              type="info"
              size="small"
              @click="handleSuspend(row)"
            >
              休学
            </el-button>
            <el-button
              v-if="row.classStatus === StudentClassStatus.ENROLLED"
              link
              type="success"
              size="small"
              @click="handleGraduate(row)"
            >
              结业
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑学员弹窗 -->
    <CommonDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
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
            <el-form-item label="年龄" prop="age">
              <el-input-number
                v-model="form.age"
                :min="3"
                :max="100"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                :disabled="dialogMode === 'view'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="意向课程" prop="intendedCourse">
              <el-select
                v-model="form.intendedCourse"
                placeholder="请选择意向课程"
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
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="缴费状态" prop="paymentStatus" v-if="dialogMode !== 'view'">
              <el-radio-group v-model="form.paymentStatus">
                <el-radio :value="PaymentStatus.UNPAID">未缴费</el-radio>
                <el-radio :value="PaymentStatus.PARTIAL">部分缴费</el-radio>
                <el-radio :value="PaymentStatus.PAID">已缴费</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </CommonDialog>

    <!-- 分班/转班弹窗 -->
    <CommonDialog
      v-model="classDialogVisible"
      :title="operationType === 'assign' ? '分班' : '转班'"
      width="500px"
      mode="edit"
      @confirm="handleAssignConfirm"
      ref="classDialogRef"
    >
      <el-form :model="classForm" label-width="80px" :rules="classRules" ref="classFormRef">
        <el-form-item label="选择班级" prop="classId">
          <el-select v-model="classForm.classId" placeholder="请选择班级" style="width: 100%">
            <el-option
              v-for="cls in availableClasses"
              :key="cls.id"
              :label="`${cls.name} (${cls.currentStudents}/${cls.maxStudents})`"
              :value="cls.id"
              :disabled="cls.currentStudents >= cls.maxStudents"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="classForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
    </CommonDialog>

    <!-- 分班记录抽屉 -->
    <el-drawer
      v-model="recordDrawerVisible"
      title="分班记录"
      size="60%"
    >
      <el-table :data="assignmentRecords" style="width: 100%">
        <el-table-column prop="studentName" label="学员姓名" width="100" />
        <el-table-column prop="className" label="班级名称" width="150" />
        <el-table-column prop="operation" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.operation === 'assign'" type="success" size="small">分班</el-tag>
            <el-tag v-else-if="row.operation === 'transfer'" type="warning" size="small">转班</el-tag>
            <el-tag v-else type="info" size="small">移除</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="operateTime" label="操作时间" min-width="180" />
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAppStore } from '@/store'
import {
  Gender,
  PaymentStatus,
  StudentClassStatus,
  ClassStatus,
  type Student,
  type StudentForm,
  type ClassAssignmentRecord,
  OperationType
} from '@/types'
import CommonDialog from '@/components/CommonDialog.vue'
import SearchForm from '@/components/SearchForm.vue'

const appStore = useAppStore()

const loading = ref(false)
const dialogVisible = ref(false)
const classDialogVisible = ref(false)
const recordDrawerVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const classFormRef = ref<FormInstance>()
const dialogRef = ref<InstanceType<typeof CommonDialog>>()
const classDialogRef = ref<InstanceType<typeof CommonDialog>>()
const currentId = ref<string | null>(null)
const currentStudent = ref<Student | null>(null)
const operationType = ref<'assign' | 'transfer'>('assign')

const activeTab = ref<string>('')
const refreshKey = ref(0)

const forceRefresh = () => {
  refreshKey.value++
}

const searchForm = reactive({
  name: '',
  course: '',
  paymentStatus: '' as PaymentStatus | '',
  classStatus: '' as StudentClassStatus | ''
})

const form = reactive<StudentForm>({
  name: '',
  gender: Gender.MALE,
  phone: '',
  email: '',
  age: 10,
  intendedCourse: '',
  paymentStatus: PaymentStatus.UNPAID,
  classStatus: StudentClassStatus.PENDING,
  classId: undefined,
  className: undefined
})

const classForm = reactive({
  classId: '',
  remark: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  intendedCourse: [{ required: true, message: '请选择意向课程', trigger: 'change' }],
  paymentStatus: [{ required: true, message: '请选择缴费状态', trigger: 'change' }]
}

const classRules: FormRules = {
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }]
}

const dialogTitle = computed(() => {
  const titles = { add: '新增学员', edit: '编辑学员', view: '学员详情' }
  return titles[dialogMode.value]
})

const level2Categories = computed(() => {
  return appStore.courseCategories.filter(c => c.level === 2 && c.status === 'enabled')
})

const availableClasses = computed(() => {
  return appStore.classes.filter(c => c.status === ClassStatus.ACTIVE)
})

const assignmentRecords = computed(() => {
  return appStore.assignmentRecords
})

const filteredStudents = computed(() => {
  return appStore.students.filter(student => {
    const nameMatch = !searchForm.name || 
      student.name.toLowerCase().includes(searchForm.name.toLowerCase())
    const courseMatch = !searchForm.course || student.intendedCourse === searchForm.course
    const paymentStatusMatch = !searchForm.paymentStatus || 
      student.paymentStatus === searchForm.paymentStatus
    const classStatusMatch = !searchForm.classStatus || 
      student.classStatus === searchForm.classStatus
    const tabMatch = !activeTab.value || student.classStatus === activeTab.value
    
    return nameMatch && courseMatch && paymentStatusMatch && classStatusMatch && tabMatch
  })
})

const getPaymentStatusText = (status: PaymentStatus) => {
  const map: Record<PaymentStatus, string> = {
    [PaymentStatus.UNPAID]: '未缴费',
    [PaymentStatus.PARTIAL]: '部分缴费',
    [PaymentStatus.PAID]: '已缴费'
  }
  return map[status] || status
}

const getPaymentTagType = (status: PaymentStatus) => {
  const map: Record<PaymentStatus, string> = {
    [PaymentStatus.UNPAID]: 'danger',
    [PaymentStatus.PARTIAL]: 'warning',
    [PaymentStatus.PAID]: 'success'
  }
  return map[status] || 'info'
}

const getClassStatusText = (status: StudentClassStatus) => {
  const map: Record<StudentClassStatus, string> = {
    [StudentClassStatus.PENDING]: '待分班',
    [StudentClassStatus.ENROLLED]: '已入班',
    [StudentClassStatus.SUSPENDED]: '休学',
    [StudentClassStatus.GRADUATED]: '结业'
  }
  return map[status] || status
}

const getClassTagType = (status: StudentClassStatus) => {
  const map: Record<StudentClassStatus, string> = {
    [StudentClassStatus.PENDING]: 'warning',
    [StudentClassStatus.ENROLLED]: 'success',
    [StudentClassStatus.SUSPENDED]: 'info',
    [StudentClassStatus.GRADUATED]: 'info'
  }
  return map[status] || 'info'
}

const handleSearch = () => {
  // 搜索逻辑已通过 computed 实现
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.course = ''
  searchForm.paymentStatus = ''
  searchForm.classStatus = ''
  activeTab.value = ''
}

const handleAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Student) => {
  dialogMode.value = 'edit'
  currentId.value = row.id
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const handleAssignClass = (row: Student) => {
  currentStudent.value = row
  operationType.value = 'assign'
  classForm.classId = ''
  classForm.remark = ''
  classDialogVisible.value = true
}

const handleTransfer = (row: Student) => {
  currentStudent.value = row
  operationType.value = 'transfer'
  classForm.classId = ''
  classForm.remark = ''
  classDialogVisible.value = true
}

const handleSuspend = (row: Student) => {
  ElMessageBox.confirm('确定要将该学员休学吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    try {
      appStore.suspendStudent(row.id, '学员休学')
      ElMessage.success('休学成功')
      forceRefresh()
    } catch (error: any) {
      ElMessage.error(error.message)
    }
  }).catch(() => {})
}

const handleGraduate = (row: Student) => {
  ElMessageBox.confirm('确定要将该学员结业吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    try {
      appStore.graduateStudent(row.id, '学员结业')
      ElMessage.success('结业成功')
      forceRefresh()
    } catch (error: any) {
      ElMessage.error(error.message)
    }
  }).catch(() => {})
}

const handleConfirm = async () => {
  await formRef.value?.validate(async (valid) => {
    if (valid) {
      dialogRef.value?.setLoading(true)
      
      try {
        if (dialogMode.value === 'edit' && currentId.value) {
          appStore.updateStudent(currentId.value, form)
          ElMessage.success('编辑成功')
        } else {
          appStore.addStudent(form)
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

const handleAssignConfirm = async () => {
  await classFormRef.value?.validate(async (valid) => {
    if (valid && currentStudent.value) {
      classDialogRef.value?.setLoading(true)
      
      try {
        const cls = availableClasses.value.find(c => c.id === classForm.classId)
        if (!cls) throw new Error('班级不存在')
        
        if (currentStudent.value.classId) {
          // 转班
          appStore.suspendStudent(currentStudent.value.id, '转出班级')
          appStore.assignStudentToClass(
            currentStudent.value.id, 
            classForm.classId, 
            classForm.remark || '转班'
          )
          ElMessage.success('转班成功')
        } else {
          // 分班
          appStore.assignStudentToClass(
            currentStudent.value.id, 
            classForm.classId, 
            classForm.remark
          )
          ElMessage.success('分班成功')
        }
        forceRefresh()
        classDialogVisible.value = false
      } catch (error: any) {
        ElMessage.error(error.message)
      } finally {
        classDialogRef.value?.setLoading(false)
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
    age: 10,
    intendedCourse: '',
    paymentStatus: PaymentStatus.UNPAID,
    classStatus: StudentClassStatus.PENDING,
    classId: undefined,
    className: undefined
  })
  formRef.value?.clearValidate()
  currentId.value = null
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.students {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-tabs {
    margin-bottom: 20px;
  }

  .student-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .info-detail {
      .name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .phone {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
