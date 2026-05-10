<template>
  <div class="page-container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h2>员工管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增员工
      </el-button>
    </div>
    
    <AdvancedFilter
      v-model="filterParams"
      :filters="employeeFilters"
      :show-active-filters="true"
      :auto-search="true"
      @search="handleFilter"
      @reset="handleReset"
    />
    
    <div class="table-container">
      <el-table :data="employeeStore.filteredEmployees" style="width: 100%">
        <el-table-column prop="id" label="工号" width="100" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="40" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="hireDate" label="入职日期" width="120" />
        <el-table-column label="工龄" width="100">
          <template #default="{ row }">
            <span>{{ getYearsOfService(row.hireDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', `status-${row.status}`]">
              {{ EmployeeStatusMap[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="salary" label="薪资" width="120">
          <template #default="{ row }">
            ¥{{ row.salary.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty 
        v-if="employeeStore.filteredEmployees.length === 0" 
        description="暂无员工数据" 
      />
    </div>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑员工' : '新增员工'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="部门" prop="departmentId">
          <el-select v-model="formData.departmentId" placeholder="请选择部门" style="width: 100%" @change="handleDepartmentChange">
            <el-option
              v-for="dept in departmentStore.departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="职位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入职位" />
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入电话" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="入职日期" prop="hireDate">
          <el-date-picker
            v-model="formData.hireDate"
            type="date"
            placeholder="请选择入职日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">在职</el-radio>
            <el-radio value="inactive">离职</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="薪资" prop="salary">
          <el-input-number v-model="formData.salary" :min="0" :step="1000" style="width: 100%" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useEmployeeStore } from '@/stores/employee'
import { useDepartmentStore } from '@/stores/department'
import type { Employee, FilterParams, EmployeeStatus } from '@/types'
import { EmployeeStatusMap } from '@/types'
import { calculateYearsOfService, formatYearsOfService, getCurrentDate } from '@/utils/date'
import AdvancedFilter, { type FilterConfig } from '@/components/AdvancedFilter.vue'

const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()

const employeeFilters = computed<FilterConfig[]>(() => [
  {
    key: 'departmentId',
    label: '部门',
    type: 'select',
    placeholder: '请选择部门',
    width: '180px',
    options: departmentStore.departments.map((dept) => ({
      label: dept.name,
      value: dept.id
    }))
  },
  {
    key: 'position',
    label: '职位',
    type: 'input',
    placeholder: '请输入职位',
    width: '150px'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    width: '120px',
    options: [
      { label: '在职', value: 'active' },
      { label: '离职', value: 'inactive' }
    ]
  },
  {
    key: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '姓名/电话/邮箱',
    width: '200px'
  }
])

const filterParams = reactive<Record<string, unknown>>({})

const dialogVisible = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const currentId = ref<string>('')

const formData = reactive<Partial<Employee>>({
  name: '',
  departmentId: '',
  departmentName: '',
  position: '',
  phone: '',
  email: '',
  hireDate: getCurrentDate(),
  status: 'active',
  salary: 8000,
  avatar: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  hireDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  salary: [{ required: true, message: '请输入薪资', trigger: 'blur' }]
}

function handleDepartmentChange(value: string): void {
  const dept = departmentStore.getDepartmentById(value)
  if (dept) {
    formData.departmentName = dept.name
  }
}

function handleFilter(params: Record<string, unknown>): void {
  const typedParams: Partial<FilterParams> = {
    departmentId: params.departmentId as string | undefined,
    position: params.position as string | undefined,
    status: params.status as string | undefined,
    keyword: params.keyword as string | undefined
  }
  employeeStore.setFilterParams(typedParams)
}

function handleReset(): void {
  employeeStore.clearFilterParams()
}

function handleAdd(): void {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: Employee): void {
  isEdit.value = true
  currentId.value = row.id
  Object.assign(formData, row)
  dialogVisible.value = true
}

function handleDelete(row: Employee): void {
  ElMessageBox.confirm('确定要删除该员工吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    employeeStore.deleteEmployee(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleSubmit(): void {
  if (!formRef.value) return
  
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const dept = departmentStore.getDepartmentById(formData.departmentId || '')
      const deptName = dept ? dept.name : ''
      
      if (isEdit.value) {
        employeeStore.updateEmployee(currentId.value, {
          ...formData,
          departmentName: deptName
        })
        ElMessage.success('编辑成功')
      } else {
        const newEmployee: Employee = {
          id: `emp_${Date.now()}`,
          name: formData.name || '',
          departmentId: formData.departmentId || '',
          departmentName: deptName,
          position: formData.position || '',
          phone: formData.phone || '',
          email: formData.email || '',
          hireDate: formData.hireDate || '',
          status: formData.status as EmployeeStatus,
          salary: formData.salary || 0,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
        }
        employeeStore.addEmployee(newEmployee)
        ElMessage.success('新增成功')
      }
      
      dialogVisible.value = false
      resetForm()
    }
  })
}

function resetForm(): void {
  formData.name = ''
  formData.departmentId = ''
  formData.departmentName = ''
  formData.position = ''
  formData.phone = ''
  formData.email = ''
  formData.hireDate = getCurrentDate()
  formData.status = 'active'
  formData.salary = 8000
  formData.avatar = ''
}

function getYearsOfService(hireDate: string): string {
  const years: number = calculateYearsOfService(hireDate)
  return formatYearsOfService(years)
}
</script>
