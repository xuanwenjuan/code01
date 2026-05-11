<template>
  <div class="advanced-filter">
    <el-card shadow="never">
      <template #header>
        <div class="filter-header">
          <div class="header-left">
            <span class="header-title">高级筛选</span>
            <el-badge 
              v-if="hasActiveFilters" 
              :value="activeFilterCount" 
              class="filter-badge"
              type="primary"
            />
          </div>
          <el-button 
            type="text" 
            @click="toggleExpand"
            :class="{ 'is-collapsed': !isExpanded }"
          >
            <el-icon>
              <component :is="isExpanded ? 'CaretTop' : 'CaretBottom'" />
            </el-icon>
            <span>{{ isExpanded ? '收起' : '展开更多' }}</span>
          </el-button>
        </div>
      </template>

      <el-form :model="filterModel" label-width="100px" label-position="left">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="就诊科室">
              <el-select
                v-model="filterModel.departmentId"
                placeholder="全部科室"
                clearable
                style="width: 100%"
                filterable
                @change="handleDepartmentChange"
              >
                <el-option
                  v-for="dept in departments"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="挂号医生">
              <el-select
                v-model="filterModel.doctorId"
                placeholder="全部医生"
                clearable
                style="width: 100%"
                filterable
                :disabled="!filterModel.departmentId && !props.showAllDoctors"
              >
                <el-option
                  v-for="doctor in filteredDoctors"
                  :key="doctor.id"
                  :label="`${doctor.name} - ${doctor.title}`"
                  :value="doctor.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="医生职称">
              <el-select
                v-model="filterModel.doctorTitle"
                placeholder="全部职称"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="title in titleLevels"
                  :key="title"
                  :label="title"
                  :value="title"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="就诊状态">
              <el-select
                v-model="filterModel.visitStatus"
                placeholder="全部状态"
                clearable
                style="width: 100%"
              >
                <el-option label="候诊中" value="waiting" />
                <el-option label="就诊中" value="ongoing" />
                <el-option label="已完成" value="completed" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col 
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6" 
            v-show="isExpanded"
            class="expand-field"
          >
            <el-form-item label="就诊时段">
              <el-select
                v-model="filterModel.timeSlot"
                placeholder="全部时段"
                clearable
                style="width: 100%"
              >
                <el-option label="上午" value="morning" />
                <el-option label="下午" value="afternoon" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col 
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6" 
            v-show="isExpanded"
            class="expand-field"
          >
            <el-form-item label="就诊日期">
              <el-date-picker
                v-model="filterModel.scheduleDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col 
            :xs="24" 
            :sm="12" 
            :md="8" 
            :lg="6" 
            v-show="isExpanded"
            class="expand-field"
          >
            <el-form-item label="患者姓名">
              <el-input
                v-model="filterModel.patientName"
                placeholder="输入患者姓名"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="filter-actions">
          <div class="action-buttons">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              <span>查询</span>
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              <span>重置</span>
            </el-button>
          </div>
          <div v-if="hasActiveFilters" class="active-filters">
            <span class="filter-label">已选条件：</span>
            <el-tag
              v-for="(filter, index) in activeFilters"
              :key="index"
              size="small"
              closable
              @close="clearFilter(filter.key)"
              class="filter-tag"
            >
              {{ filter.label }}: {{ filter.value }}
            </el-tag>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { CaretTop, CaretBottom, Search, Refresh } from '@element-plus/icons-vue'
import type { TitleLevel, VisitStatus, TimeSlot, Department, Doctor } from '@/types'
import { useSystemStore } from '@/stores/system'

export interface FilterModel {
  departmentId?: string
  doctorId?: string
  doctorTitle?: TitleLevel
  visitStatus?: VisitStatus
  timeSlot?: TimeSlot
  scheduleDate?: string
  patientName?: string
}

interface ActiveFilter {
  key: keyof FilterModel
  label: string
  value: string
}

interface Props {
  modelValue: FilterModel
  showAllDoctors?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAllDoctors: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: FilterModel): void
  (e: 'search'): void
}>()

const systemStore = useSystemStore()
const isExpanded = ref(false)

const filterModel = reactive<FilterModel>({ ...props.modelValue })

const departments = computed(() => systemStore.activeDepartments)
const titleLevels = computed(() => systemStore.titleLevels)

const filteredDoctors = computed(() => {
  if (props.showAllDoctors && !filterModel.departmentId) {
    return systemStore.doctors
  }
  if (filterModel.departmentId) {
    return systemStore.getDoctorsByDepartment(filterModel.departmentId)
  }
  return []
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filterModel.departmentId) count++
  if (filterModel.doctorId) count++
  if (filterModel.doctorTitle) count++
  if (filterModel.visitStatus) count++
  if (filterModel.timeSlot) count++
  if (filterModel.scheduleDate) count++
  if (filterModel.patientName) count++
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

const activeFilters = computed((): ActiveFilter[] => {
  const filters: ActiveFilter[] = []
  
  if (filterModel.departmentId) {
    const dept = departments.value.find(d => d.id === filterModel.departmentId)
    if (dept) {
      filters.push({ key: 'departmentId', label: '科室', value: dept.name })
    }
  }
  
  if (filterModel.doctorId) {
    const doctor = filteredDoctors.value.find(d => d.id === filterModel.doctorId)
    if (doctor) {
      filters.push({ key: 'doctorId', label: '医生', value: doctor.name })
    }
  }
  
  if (filterModel.doctorTitle) {
    filters.push({ key: 'doctorTitle', label: '职称', value: filterModel.doctorTitle })
  }
  
  if (filterModel.visitStatus) {
    const statusMap: Record<VisitStatus, string> = {
      waiting: '候诊中',
      ongoing: '就诊中',
      completed: '已完成',
      cancelled: '已取消'
    }
    filters.push({ key: 'visitStatus', label: '状态', value: statusMap[filterModel.visitStatus] })
  }
  
  if (filterModel.timeSlot) {
    const slotMap: Record<TimeSlot, string> = {
      morning: '上午',
      afternoon: '下午'
    }
    filters.push({ key: 'timeSlot', label: '时段', value: slotMap[filterModel.timeSlot] })
  }
  
  if (filterModel.scheduleDate) {
    filters.push({ key: 'scheduleDate', label: '日期', value: filterModel.scheduleDate })
  }
  
  if (filterModel.patientName) {
    filters.push({ key: 'patientName', label: '患者', value: filterModel.patientName })
  }
  
  return filters
})

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(filterModel, val)
  },
  { deep: true }
)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function handleDepartmentChange() {
  filterModel.doctorId = undefined
}

function handleSearch() {
  emit('update:modelValue', { ...filterModel })
  emit('search')
}

function handleReset() {
  Object.assign(filterModel, {
    departmentId: undefined,
    doctorId: undefined,
    doctorTitle: undefined,
    visitStatus: undefined,
    timeSlot: undefined,
    scheduleDate: undefined,
    patientName: undefined
  })
  emit('update:modelValue', { ...filterModel })
  emit('search')
}

function clearFilter(key: keyof FilterModel) {
  ;(filterModel[key] as string | undefined) = undefined
  if (key === 'departmentId') {
    filterModel.doctorId = undefined
  }
  emit('update:modelValue', { ...filterModel })
  emit('search')
}
</script>

<style scoped lang="scss">
.advanced-filter {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    padding: 12px 20px;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-title {
      font-weight: 600;
      color: #303133;
    }

    .filter-badge {
      margin-left: 4px;
    }

    .el-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;

      &.is-collapsed {
        color: #409eff;
      }
    }
  }

  .expand-field {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .filter-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;

    .action-buttons {
      display: flex;
      gap: 12px;

      .el-button {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .active-filters {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;

      .filter-label {
        font-size: 12px;
        color: #909399;
      }

      .filter-tag {
        background-color: #ecf5ff;
        border-color: #b3d8ff;
        color: #409eff;
      }
    }
  }
}
</style>
