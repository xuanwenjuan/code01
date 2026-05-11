<template>
  <div class="courses-page">
    <div class="page-header">
      <h1 class="page-title">课程管理</h1>
      <div class="page-actions">
        <el-tag type="info">共 {{ courseStore.totalCourses }} 门课程</el-tag>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          添加课程
        </el-button>
      </div>
    </div>
    
    <div class="filter-panel">
      <div class="filter-row">
        <el-input
          class="filter-item"
          v-model="filterParams.keyword"
          placeholder="搜索课程名称或讲师"
          clearable
          @keyup.enter="applyFilter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          class="filter-item"
          v-model="filterParams.category"
          placeholder="课程分类"
          clearable
        >
          <el-option
            v-for="(label, value) in CourseCategoryMap"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
        
        <el-select
          class="filter-item"
          v-model="filterParams.platform"
          placeholder="学习平台"
          clearable
        >
          <el-option
            v-for="(label, value) in PlatformTypeMap"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
        
        <el-select
          class="filter-item"
          v-model="filterParams.status"
          placeholder="学习状态"
          clearable
        >
          <el-option
            v-for="(label, value) in LearningStatusMap"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
      </div>
      
      <div class="filter-row filter-progress-row">
        <div class="progress-filter-label">
          <span>进度范围: {{ progressRangeDisplay }}</span>
        </div>
        <el-slider
          class="filter-item progress-slider"
          v-model="filterParams.progressRange"
          :range="true"
          :min="0"
          :max="100"
          :show-tooltip="true"
        />
        <el-tag type="info" size="small">{{ activeFilterCount }} 个筛选条件</el-tag>
      </div>
      
      <div class="filter-actions">
        <el-button @click="resetFilter">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="applyFilter">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
    
    <div class="results-header" v-if="isFiltering">
      <el-alert
        :title="`筛选结果: 共 ${filteredCourses.length} 门课程`"
        type="info"
        show-icon
        :closable="false"
        effect="light"
      >
        <template #default>
          <div v-if="activeFilters.length > 0" class="active-filters">
            <span>当前筛选:</span>
            <el-tag
              v-for="filter in activeFilters"
              :key="filter.key"
              size="small"
              closable
              @close="removeFilter(filter.key)"
            >
              {{ filter.label }}
            </el-tag>
          </div>
        </template>
      </el-alert>
    </div>
    
    <div v-if="filteredCourses.length > 0">
      <el-row :gutter="20">
        <el-col
          v-for="course in filteredCourses"
          :key="course.id"
          :xs="24"
          :sm="12"
          :lg="8"
          :xl="6"
        >
          <CourseCard
            :course="course"
            @edit="openEditDialog"
            @check-in="openCheckInDialog"
            style="margin-bottom: 20px;"
          />
        </el-col>
      </el-row>
    </div>
    
    <el-empty v-else description="暂无符合条件的课程">
      <el-button type="primary" @click="openAddDialog">添加课程</el-button>
      <el-button @click="resetFilter" style="margin-top: 12px;">清除筛选条件</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, reactive, computed, watch } from 'vue'
import type { Course, CourseFilterParams } from '@/types'
import {
  CourseCategoryMap, 
  PlatformTypeMap, 
  LearningStatusMap,
  ProgressStatusMap
} from '@/types'
import { useCourseStore } from '@/stores/course'
import CourseCard from '@/components/CourseCard.vue'

const courseStore = useCourseStore()

const openAddDialog = inject<() => void>('openAddDialog') as () => void
const openEditDialog = inject<(course: Course) => void>('openEditDialog') as (course: Course) => void
const openCheckInDialog = inject<(courseOrId?: Course | string) => void>('openCheckInDialog') as (courseOrId?: Course | string) => void

const defaultFilterParams = (): CourseFilterParams => ({
  keyword: '',
  category: undefined,
  platform: undefined,
  status: undefined,
  progressRange: [0, 100]
})

const filterParams = reactive<CourseFilterParams>(defaultFilterParams())
const appliedFilter = ref<CourseFilterParams>(defaultFilterParams())

const filteredCourses = computed(() => {
  return courseStore.filterCourses(appliedFilter.value)
})

const isFiltering = computed(() => {
  const params = appliedFilter.value
  return (
    (params.keyword && params.keyword.trim() !== '') ||
    params.category !== undefined ||
    params.platform !== undefined ||
    params.status !== undefined ||
    (params.progressRange && (params.progressRange[0] !== 0 || params.progressRange[1] !== 100))
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  const params = filterParams
  if (params.keyword && params.keyword.trim() !== '') count++
  if (params.category !== undefined) count++
  if (params.platform !== undefined) count++
  if (params.status !== undefined) count++
  if (params.progressRange && (params.progressRange[0] !== 0 || params.progressRange[1] !== 100)) count++
  return count
})

const progressRangeDisplay = computed(() => {
  if (!filterParams.progressRange) return '0% - 100%'
  return `${filterParams.progressRange[0]}% - ${filterParams.progressRange[1]}%`
})

interface ActiveFilter {
  key: keyof CourseFilterParams
  label: string
  value: string
}

const activeFilters = computed<ActiveFilter[]>(() => {
  const filters: ActiveFilter[] = []
  const params = appliedFilter.value
  
  if (params.keyword && params.keyword.trim() !== '') {
    filters.push({
      key: 'keyword',
      label: `关键词: ${params.keyword}`,
      value: params.keyword
    })
  }
  
  if (params.category !== undefined) {
    filters.push({
      key: 'category',
      label: `分类: ${CourseCategoryMap[params.category]}`,
      value: params.category
    })
  }
  
  if (params.platform !== undefined) {
    filters.push({
      key: 'platform',
      label: `平台: ${PlatformTypeMap[params.platform]}`,
      value: params.platform
    })
  }
  
  if (params.status !== undefined) {
    filters.push({
      key: 'status',
      label: `状态: ${LearningStatusMap[params.status]}`,
      value: params.status
    })
  }
  
  if (params.progressRange && (params.progressRange[0] !== 0 || params.progressRange[1] !== 100)) {
    filters.push({
      key: 'progressRange',
      label: `进度: ${params.progressRange[0]}% - ${params.progressRange[1]}%`,
      value: JSON.stringify(params.progressRange)
    })
  }
  
  return filters
})

const removeFilter = (key: keyof CourseFilterParams): void => {
  if (key === 'keyword') {
    filterParams.keyword = ''
  } else if (key === 'category') {
    filterParams.category = undefined
  } else if (key === 'platform') {
    filterParams.platform = undefined
  } else if (key === 'status') {
    filterParams.status = undefined
  } else if (key === 'progressRange') {
    filterParams.progressRange = [0, 100]
  }
  applyFilter()
}

const applyFilter = (): void => {
  appliedFilter.value = { ...filterParams }
}

const resetFilter = (): void => {
  Object.assign(filterParams, defaultFilterParams())
  appliedFilter.value = defaultFilterParams()
}

watch(() => courseStore.courses.length, () => {
  applyFilter()
})
</script>

<style lang="scss" scoped>
.filter-item {
  flex: 1;
  min-width: 180px;
  
  @media (max-width: 768px) {
    flex: 1 1 100%;
  }
  
  &.progress-slider {
    flex: 2;
    min-width: 200px;
  }
}

.filter-progress-row {
  align-items: center;
  
  .progress-filter-label {
    font-size: 14px;
    color: #606266;
    min-width: 100px;
  }
}

.results-header {
  margin-bottom: 20px;
  
  .active-filters {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
}

.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
