<template>
  <el-card class="filter-card" shadow="never">
    <el-form :model="filterForm" inline label-width="80px">
      <el-form-item label="关键词">
        <el-input
          v-model="filterForm.keyword"
          placeholder="搜索..."
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
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
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useWarehouseStore } from '@/stores/warehouse'
import type { FilterParams, WarehouseZone } from '@/types'
import { categories } from '@/mock/data'

interface StatusOption {
  label: string
  value: string
}

interface Props {
  showWarehouse?: boolean
  showZone?: boolean
  showCategory?: boolean
  showStatus?: boolean
  showDate?: boolean
  showOperator?: boolean
  statusOptions?: StatusOption[]
}

interface Emits {
  (e: 'filter', params: FilterParams): void
}

const props = withDefaults(defineProps<Props>(), {
  showWarehouse: false,
  showZone: false,
  showCategory: false,
  showStatus: false,
  showDate: false,
  showOperator: false,
  statusOptions: () => []
})

const emit = defineEmits<Emits>()

const warehouseStore = useWarehouseStore()

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

const warehouseList = computed(() => warehouseStore.warehouseList)
const categoryList = computed(() => categories)

const handleWarehouseChange = (warehouseId: string) => {
  filterForm.value.zoneId = ''
  zoneList.value = warehouseStore.getZonesByWarehouse(warehouseId)
}

const handleSearch = () => {
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
  
  emit('filter', params)
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
</style>
