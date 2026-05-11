<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCommunityStore } from '@/stores'
import type { 
  AdvancedFilter, 
  WorkOrderType, 
  WorkOrderStatus, 
  WorkOrderPriority,
  PaymentStatus,
  HouseOccupancyStatus,
  SelectOption
} from '@/types'

const props = defineProps<{
  modelValue: AdvancedFilter
  showBuilding?: boolean
  showWorkOrderType?: boolean
  showWorkOrderStatus?: boolean
  showPriority?: boolean
  showPaymentStatus?: boolean
  showOccupancyStatus?: boolean
  showKeyword?: boolean
  showDateRange?: boolean
  realtimeSearch?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: AdvancedFilter): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const store = useCommunityStore()

const localFilter = ref<AdvancedFilter>({
  buildingId: '',
  workOrderType: '',
  workOrderStatus: undefined,
  priority: undefined,
  paymentStatus: '',
  occupancyStatus: '',
  keyword: '',
  dateRange: undefined
})

watch(() => props.modelValue, (val: AdvancedFilter) => {
  localFilter.value = { ...val }
}, { immediate: true, deep: true })

watch(localFilter, (val: AdvancedFilter) => {
  if (props.realtimeSearch) {
    emit('update:modelValue', { ...val })
    emit('search')
  }
}, { deep: true })

function handleSearch(): void {
  emit('update:modelValue', { ...localFilter.value })
  emit('search')
}

function handleReset(): void {
  localFilter.value = {
    buildingId: '',
    workOrderType: '',
    workOrderStatus: undefined,
    priority: undefined,
    paymentStatus: '',
    occupancyStatus: '',
    keyword: '',
    dateRange: undefined
  }
  emit('update:modelValue', { ...localFilter.value })
  emit('reset')
}

const workOrderTypeOptions: SelectOption<WorkOrderType | string>[] = [
  { label: '维修报修', value: 'repair' },
  { label: '投诉建议', value: 'complaint' },
  { label: '服务建议', value: 'suggestion' },
  { label: '其他', value: 'other' }
]

const workOrderStatusOptions: SelectOption<WorkOrderStatus | string>[] = [
  { label: '待派单', value: 'pending' },
  { label: '维修中', value: 'processing' },
  { label: '待验收', value: 'checking' },
  { label: '已完成', value: 'completed' }
]

const priorityOptions: SelectOption<WorkOrderPriority | string>[] = [
  { label: '紧急', value: 'high' },
  { label: '普通', value: 'medium' },
  { label: '低', value: 'low' }
]

const paymentStatusOptions: SelectOption<PaymentStatus | string>[] = [
  { label: '未缴费', value: 'unpaid' },
  { label: '部分缴费', value: 'partial' },
  { label: '已缴费', value: 'paid' }
]

const occupancyStatusOptions: SelectOption<HouseOccupancyStatus | string>[] = [
  { label: '已入住', value: 'occupied' },
  { label: '空置', value: 'vacant' },
  { label: '装修中', value: 'decorating' }
]

const hasFilters = computed((): boolean => {
  return !!(
    localFilter.value.keyword ||
    localFilter.value.buildingId ||
    localFilter.value.workOrderType ||
    localFilter.value.workOrderStatus ||
    localFilter.value.priority ||
    localFilter.value.paymentStatus ||
    localFilter.value.occupancyStatus ||
    localFilter.value.dateRange
  )
})

const activeFilterTags = computed((): Array<{ label: string; value: string; key: keyof AdvancedFilter }> => {
  const tags: Array<{ label: string; value: string; key: keyof AdvancedFilter }> = []
  
  if (localFilter.value.keyword) {
    tags.push({ label: '关键词', value: localFilter.value.keyword, key: 'keyword' })
  }
  if (localFilter.value.buildingId) {
    const building = store.getBuildingById(localFilter.value.buildingId)
    tags.push({ label: '楼栋', value: building?.name || localFilter.value.buildingId, key: 'buildingId' })
  }
  if (localFilter.value.workOrderType) {
    const option = workOrderTypeOptions.find(o => o.value === localFilter.value.workOrderType)
    tags.push({ label: '类型', value: option?.label || localFilter.value.workOrderType, key: 'workOrderType' })
  }
  if (localFilter.value.workOrderStatus) {
    const option = workOrderStatusOptions.find(o => o.value === localFilter.value.workOrderStatus)
    tags.push({ label: '状态', value: option?.label || localFilter.value.workOrderStatus, key: 'workOrderStatus' })
  }
  if (localFilter.value.priority) {
    const option = priorityOptions.find(o => o.value === localFilter.value.priority)
    tags.push({ label: '优先级', value: option?.label || localFilter.value.priority, key: 'priority' })
  }
  if (localFilter.value.paymentStatus) {
    const option = paymentStatusOptions.find(o => o.value === localFilter.value.paymentStatus)
    tags.push({ label: '缴费状态', value: option?.label || localFilter.value.paymentStatus, key: 'paymentStatus' })
  }
  if (localFilter.value.occupancyStatus) {
    const option = occupancyStatusOptions.find(o => o.value === localFilter.value.occupancyStatus)
    tags.push({ label: '入住状态', value: option?.label || localFilter.value.occupancyStatus, key: 'occupancyStatus' })
  }
  if (localFilter.value.dateRange) {
    tags.push({ 
      label: '时间范围', 
      value: `${localFilter.value.dateRange[0]} 至 ${localFilter.value.dateRange[1]}`, 
      key: 'dateRange' 
    })
  }
  
  return tags
})

function removeFilterTag(key: keyof AdvancedFilter): void {
  if (key === 'dateRange') {
    localFilter.value.dateRange = undefined
  } else {
    ;(localFilter.value as Record<string, string | undefined>)[key] = ''
  }
  if (props.realtimeSearch) {
    emit('update:modelValue', { ...localFilter.value })
    emit('search')
  }
}
</script>

<template>
  <el-card class="filter-card">
    <el-form :inline="true" :model="localFilter" class="filter-form">
      <template v-if="showKeyword">
        <el-form-item label="关键词">
          <el-input
            v-model="localFilter.keyword"
            placeholder="请输入关键词搜索"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </template>
      
      <template v-if="showBuilding">
        <el-form-item label="所属楼栋">
          <el-select
            v-model="localFilter.buildingId"
            placeholder="请选择楼栋"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option
              v-for="building in store.buildings"
              :key="building.id"
              :label="building.name"
              :value="building.id"
            />
          </el-select>
        </el-form-item>
      </template>
      
      <template v-if="showWorkOrderType">
        <el-form-item label="工单类型">
          <el-select
            v-model="localFilter.workOrderType"
            placeholder="请选择类型"
            clearable
            style="width: 130px"
          >
            <el-option
              v-for="item in workOrderTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
      </template>
      
      <template v-if="showWorkOrderStatus">
        <el-form-item label="工单状态">
          <el-select
            v-model="localFilter.workOrderStatus"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in workOrderStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
      </template>
      
      <template v-if="showPriority">
        <el-form-item label="优先级">
          <el-select
            v-model="localFilter.priority"
            placeholder="请选择优先级"
            clearable
            style="width: 110px"
          >
            <el-option
              v-for="item in priorityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
      </template>
      
      <template v-if="showPaymentStatus">
        <el-form-item label="缴费状态">
          <el-select
            v-model="localFilter.paymentStatus"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in paymentStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
      </template>
      
      <template v-if="showOccupancyStatus">
        <el-form-item label="入住状态">
          <el-select
            v-model="localFilter.occupancyStatus"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in occupancyStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>
        </el-form-item>
      </template>
      
      <template v-if="showDateRange">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="localFilter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
      </template>
      
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
    
    <div v-if="activeFilterTags.length > 0" class="filter-tags">
      <span class="filter-tags-label">
        <el-icon><Filter /></el-icon>
        已选筛选条件：
      </span>
      <el-tag
        v-for="tag in activeFilterTags"
        :key="tag.key"
        type="info"
        effect="light"
        closable
        @close="removeFilterTag(tag.key)"
      >
        <span class="tag-label">{{ tag.label }}:</span>
        <span class="tag-value">{{ tag.value }}</span>
      </el-tag>
      <el-button v-if="!props.realtimeSearch" type="primary" link size="small" @click="handleSearch">
        立即筛选
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.filter-card {
  margin-bottom: 16px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.filter-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #ebeef5;
}

.filter-tags-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.tag-label {
  color: #909399;
  margin-right: 4px;
}

.tag-value {
  color: #409EFF;
  font-weight: 500;
}
</style>
