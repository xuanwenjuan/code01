<template>
  <el-card class="filter-card" shadow="never">
    <div class="filter-header" @click="showFilter = !showFilter">
      <div class="filter-title">
        <el-icon><Filter /></el-icon>
        <span>筛选条件</span>
        <el-badge v-if="activeFilterCount > 0" :value="activeFilterCount" class="filter-badge" />
      </div>
      <div class="filter-toggle">
        <span>{{ showFilter ? '收起' : '展开' }}</span>
        <el-icon :class="{ 'rotate': showFilter }">
          <CaretBottom />
        </el-icon>
      </div>
    </div>

    <el-collapse-transition>
      <div v-show="showFilter">
        <el-form :model="filterForm" inline label-width="80px" class="filter-form">
          <el-form-item label="关键词">
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索..."
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
              @input="handleKeywordInput"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <template v-if="showWarehouse">
            <el-form-item label="仓库">
              <el-select
                v-model="filterForm.warehouseId"
                placeholder="全部仓库"
                clearable
                style="width: 150px"
                @change="handleWarehouseChange"
                @clear="handleWarehouseClear"
                filterable
              >
                <el-option
                  v-for="warehouse in warehouseList"
                  :key="warehouse.id"
                  :label="warehouse.name"
                  :value="warehouse.id"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="showZone">
            <el-form-item label="库区">
              <el-select
                v-model="filterForm.zoneId"
                placeholder="全部库区"
                clearable
                style="width: 150px"
                :disabled="!filterForm.warehouseId"
                @change="handleAutoSearch"
                filterable
              >
                <el-option
                  v-for="zone in zoneList"
                  :key="zone.id"
                  :label="zone.name"
                  :value="zone.id"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="showCategory">
            <el-form-item label="类别">
              <el-select
                v-model="filterForm.category"
                placeholder="全部类别"
                clearable
                style="width: 150px"
                @change="handleAutoSearch"
                filterable
              >
                <el-option
                  v-for="category in categoryList"
                  :key="category"
                  :label="category"
                  :value="category"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="showStatus">
            <el-form-item label="状态">
              <el-select
                v-model="filterForm.status"
                placeholder="全部状态"
                clearable
                style="width: 150px"
                @change="handleAutoSearch"
              >
                <el-option
                  v-for="status in statusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="showDate">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 280px"
                @change="handleAutoSearch"
                :shortcuts="dateShortcuts"
              />
            </el-form-item>
          </template>

          <template v-if="showOperator">
            <el-form-item label="操作人">
              <el-input
                v-model="filterForm.operator"
                placeholder="操作人姓名"
                clearable
                style="width: 150px"
                @keyup.enter="handleSearch"
                @input="handleKeywordInput"
              />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="activeFilterCount > 0" class="active-tags">
          <span class="tags-label">已选条件:</span>
          <el-tag
            v-for="tag in activeFilterTags"
            :key="tag.key"
            closable
            size="small"
            @close="removeFilter(tag.key)"
            class="filter-tag"
          >
            {{ tag.label }}
          </el-tag>
        </div>
      </div>
    </el-collapse-transition>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Refresh, Filter, CaretBottom } from '@element-plus/icons-vue'
import { useWarehouseStore } from '@/stores/warehouse'
import type { FilterParams, WarehouseZone, StatusOption } from '@/types'
import { categories } from '@/mock/data'

interface Props {
  showWarehouse?: boolean
  showZone?: boolean
  showCategory?: boolean
  showStatus?: boolean
  showDate?: boolean
  showOperator?: boolean
  statusOptions?: StatusOption[]
  autoSearch?: boolean
  debounceTime?: number
}

interface Emits {
  (e: 'filter', params: FilterParams): void
}

interface ActiveFilterTag {
  key: keyof FilterParams
  label: string
  value: string
}

const props = withDefaults(defineProps<Props>(), {
  showWarehouse: false,
  showZone: false,
  showCategory: false,
  showStatus: false,
  showDate: false,
  showOperator: false,
  statusOptions: () => [] as StatusOption[],
  autoSearch: true,
  debounceTime: 300
})

const emit = defineEmits<Emits>()

const warehouseStore = useWarehouseStore()

const showFilter = ref(true)
const filterForm = ref<FilterParams>({
  keyword: '',
  warehouseId: '',
  zoneId: '',
  category: '',
  status: '',
  startDate: '',
  endDate: '',
  operator: ''
})

const dateRange = ref<[string, string] | null>(null)
const zoneList = ref<WarehouseZone[]>([])
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const warehouseList = computed(() => warehouseStore.warehouseList)
const categoryList = computed(() => categories)

const activeFilterCount = computed((): number => {
  let count = 0
  if (filterForm.value.keyword) count++
  if (filterForm.value.warehouseId) count++
  if (filterForm.value.zoneId) count++
  if (filterForm.value.category) count++
  if (filterForm.value.status) count++
  if (filterForm.value.operator) count++
  if (dateRange.value) count++
  return count
})

const activeFilterTags = computed((): ActiveFilterTag[] => {
  const tags: ActiveFilterTag[] = []
  
  if (filterForm.value.keyword) {
    tags.push({ key: 'keyword', label: `关键词: ${filterForm.value.keyword}`, value: filterForm.value.keyword })
  }
  if (filterForm.value.warehouseId) {
    const warehouse = warehouseList.value.find(w => w.id === filterForm.value.warehouseId)
    tags.push({ key: 'warehouseId', label: `仓库: ${warehouse?.name || filterForm.value.warehouseId}`, value: filterForm.value.warehouseId })
  }
  if (filterForm.value.zoneId) {
    const zone = zoneList.value.find(z => z.id === filterForm.value.zoneId)
    tags.push({ key: 'zoneId', label: `库区: ${zone?.name || filterForm.value.zoneId}`, value: filterForm.value.zoneId })
  }
  if (filterForm.value.category) {
    tags.push({ key: 'category', label: `类别: ${filterForm.value.category}`, value: filterForm.value.category })
  }
  if (filterForm.value.status) {
    const status = props.statusOptions.find(s => s.value === filterForm.value.status)
    tags.push({ key: 'status', label: `状态: ${status?.label || filterForm.value.status}`, value: filterForm.value.status })
  }
  if (filterForm.value.operator) {
    tags.push({ key: 'operator', label: `操作人: ${filterForm.value.operator}`, value: filterForm.value.operator })
  }
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    tags.push({ key: 'startDate', label: `时间: ${dateRange.value[0]} 至 ${dateRange.value[1]}`, value: dateRange.value.join('-') })
  }
  
  return tags
})

const dateShortcuts = [
  {
    text: '今天',
    value: (): [Date, Date] => {
      const now = new Date()
      return [now, now]
    }
  },
  {
    text: '昨天',
    value: (): [Date, Date] => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      return [yesterday, yesterday]
    }
  },
  {
    text: '最近7天',
    value: (): [Date, Date] => {
      const end = new Date()
      const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: (): [Date, Date] => {
      const end = new Date()
      const start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000)
      return [start, end]
    }
  }
]

const buildFilterParams = (): FilterParams => {
  const params: FilterParams = {
    keyword: filterForm.value.keyword || undefined,
    warehouseId: filterForm.value.warehouseId || undefined,
    zoneId: filterForm.value.zoneId || undefined,
    category: filterForm.value.category || undefined,
    status: filterForm.value.status || undefined,
    operator: filterForm.value.operator || undefined
  }
  
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }
  
  return params
}

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
  emit('filter', buildFilterParams())
}

const handleKeywordInput = () => {
  if (props.autoSearch) {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
      handleSearch()
    }, props.debounceTime)
  }
}

const handleAutoSearch = () => {
  if (props.autoSearch) {
    handleSearch()
  }
}

const handleWarehouseChange = (warehouseId: string) => {
  filterForm.value.zoneId = ''
  zoneList.value = warehouseStore.getZonesByWarehouse(warehouseId)
  if (props.autoSearch) {
    handleSearch()
  }
}

const handleWarehouseClear = () => {
  filterForm.value.zoneId = ''
  zoneList.value = []
  if (props.autoSearch) {
    handleSearch()
  }
}

const handleReset = () => {
  filterForm.value = {
    keyword: '',
    warehouseId: '',
    zoneId: '',
    category: '',
    status: '',
    startDate: '',
    endDate: '',
    operator: ''
  }
  dateRange.value = null
  zoneList.value = []
  emit('filter', {})
}

const removeFilter = (key: keyof FilterParams) => {
  switch (key) {
    case 'keyword':
      filterForm.value.keyword = ''
      break
    case 'warehouseId':
      filterForm.value.warehouseId = ''
      filterForm.value.zoneId = ''
      zoneList.value = []
      break
    case 'zoneId':
      filterForm.value.zoneId = ''
      break
    case 'category':
      filterForm.value.category = ''
      break
    case 'status':
      filterForm.value.status = ''
      break
    case 'operator':
      filterForm.value.operator = ''
      break
    case 'startDate':
    case 'endDate':
      dateRange.value = null
      filterForm.value.startDate = ''
      filterForm.value.endDate = ''
      break
  }
  handleSearch()
}

watch(() => props.showWarehouse, () => {
  if (!props.showWarehouse) {
    filterForm.value.warehouseId = ''
    filterForm.value.zoneId = ''
    zoneList.value = []
  }
})
</script>

<style scoped>
.filter-card {
  margin-bottom: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
}

.filter-badge {
  margin-left: 4px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
  transition: color 0.3s;
}

.filter-toggle:hover {
  color: #409eff;
}

.filter-toggle .el-icon {
  transition: transform 0.3s;
}

.filter-toggle .el-icon.rotate {
  transform: rotate(180deg);
}

.filter-form {
  margin-bottom: 16px;
}

.active-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed #f0f0f0;
}

.tags-label {
  font-size: 13px;
  color: #909399;
}

.filter-tag {
  max-width: 300px;
}
</style>
