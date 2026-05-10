<template>
  <div class="advanced-filter">
    <el-card shadow="never">
      <template #header>
        <div class="filter-header">
          <span>高级筛选</span>
          <el-button type="text" @click="toggleExpand">
            <el-icon><component :is="isExpanded ? 'CaretTop' : 'CaretBottom'" /></el-icon>
            {{ isExpanded ? '收起' : '展开' }}
          </el-button>
        </div>
      </template>

      <el-form :model="filterModel" label-width="100px">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="就诊科室">
              <el-select
                v-model="filterModel.departmentId"
                placeholder="全部科室"
                clearable
                style="width: 100%"
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
                :disabled="!filterModel.departmentId && !showAllDoctors"
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

          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-show="isExpanded">
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

          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-show="isExpanded">
            <el-form-item label="就诊日期">
              <el-date-picker
                v-model="filterModel.scheduleDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-show="isExpanded">
            <el-form-item label="患者姓名">
              <el-input
                v-model="filterModel.patientName"
                placeholder="输入患者姓名"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="filter-actions">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-tag 
            v-if="hasActiveFilters" 
            type="info" 
            closable
            @close="handleReset"
          >
            已筛选 {{ activeFilterCount }} 个条件
          </el-tag>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { CaretTop, CaretBottom, Search, Refresh } from '@element-plus/icons-vue'
import type { Department, Doctor, TitleLevel, VisitStatus, TimeSlot } from '@/types'
import { useSystemStore } from '@/stores/system'

export interface FilterModel {
  departmentId?: string
  doctorId?: string
  doctorTitle?: string
  visitStatus?: VisitStatus
  timeSlot?: TimeSlot
  scheduleDate?: string
  patientName?: string
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
    font-weight: 600;
  }

  .filter-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
