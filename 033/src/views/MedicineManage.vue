<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import type { Medicine, MedicineCategory, StockStatus, MedicineFilter, MedicineWithStatus } from '@/types'
import { MedicineCategoryLabels, StockStatusLabels } from '@/types'
import { useMedicineStore } from '@/stores/medicine'
import MedicineDialog from '@/components/MedicineDialog.vue'

const medicineStore = useMedicineStore()

const filter = ref<MedicineFilter>({})
const dialogVisible = ref(false)
const currentMedicine = ref<Medicine | null>(null)

const categoryOptions: Array<{ value: MedicineCategory | ''; label: string }> = [
  { value: '', label: '全部分类' },
  ...Object.entries(MedicineCategoryLabels).map(([value, label]) => ({
    value: value as MedicineCategory,
    label
  }))
]

const stockStatusOptions: Array<{ value: StockStatus | ''; label: string }> = [
  { value: '', label: '全部状态' },
  ...Object.entries(StockStatusLabels).map(([value, label]) => ({
    value: value as StockStatus,
    label
  }))
]

const filteredMedicines = computed<MedicineWithStatus[]>(() => {
  return medicineStore.filterMedicines(filter.value)
})

const hasActiveFilter = computed<boolean>(() => {
  return !!(filter.value.category || filter.value.stockStatus || filter.value.keyword)
})

const filterResultCount = computed<number>(() => {
  return filteredMedicines.value.length
})

function resetFilter(): void {
  filter.value = {}
}

function handleAdd(): void {
  currentMedicine.value = null
  dialogVisible.value = true
}

function handleEdit(medicine: Medicine): void {
  currentMedicine.value = medicine
  dialogVisible.value = true
}

async function handleDelete(medicine: Medicine): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确定要删除药品"${medicine.name}"吗？`,
      '提示',
      { type: 'warning' }
    )
    medicineStore.deleteMedicine(medicine.id)
    ElMessage.success('删除成功')
  } catch {
  }
}

function handleUpdateQuantity(medicine: Medicine, delta: number): void {
  medicineStore.updateQuantity(medicine.id, delta, '管理员')
  ElMessage.success(delta > 0 ? '补充成功' : '消耗成功')
}

function statusTagType(status: StockStatus): 'success' | 'warning' | 'danger' {
  const map: Record<StockStatus, 'success' | 'warning' | 'danger'> = {
    sufficient: 'success',
    expiring: 'warning',
    expired: 'danger'
  }
  return map[status]
}

function formatDaysRemaining(days: number): string {
  if (days < 0) {
    return `已过期 ${Math.abs(days)} 天`
  }
  if (days === 0) {
    return '今天过期'
  }
  if (days <= 7) {
    return `${days} 天`
  }
  if (days <= 30) {
    return `${days} 天`
  }
  return `${Math.floor(days / 30)} 个月`
}

onMounted(() => {
  medicineStore.initMedicines()
})
</script>

<template>
  <div class="medicine-page">
    <div class="page-header">
      <h2 class="page-title">药品管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增药品
      </el-button>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-label">药品总数</div>
        <div class="stat-value primary">{{ medicineStore.medicines.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">库存充足</div>
        <div class="stat-value success">{{ medicineStore.stockStatusCounts.sufficient }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">即将过期</div>
        <div class="stat-value warning">{{ medicineStore.stockStatusCounts.expiring }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已过期</div>
        <div class="stat-value danger">{{ medicineStore.stockStatusCounts.expired }}</div>
      </div>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filter">
        <el-form-item label="药品分类">
          <el-select v-model="filter.category" placeholder="请选择" clearable style="width: 150px">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select v-model="filter.stockStatus" placeholder="请选择" clearable style="width: 150px">
            <el-option
              v-for="item in stockStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filter.keyword"
            placeholder="搜索药品名称/厂家"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
          <el-button :icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="hasActiveFilter" class="filter-result-info">
        <span>筛选结果：共 <strong>{{ filterResultCount }}</strong> 条记录</span>
        <el-button text type="primary" @click="resetFilter">清除筛选</el-button>
      </div>
    </div>

    <div class="table-section">
      <el-table :data="filteredMedicines" stripe style="width: 100%">
        <el-table-column prop="name" label="药品名称" min-width="150">
          <template #default="{ row }">
            <span class="medicine-name">{{ row.name }}</span>
            <el-tag :type="statusTagType(row.stockStatus)" size="small" class="status-tag">
              {{ StockStatusLabels[row.stockStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            {{ MedicineCategoryLabels[row.category] }}
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="生产厂家" min-width="150" />
        <el-table-column prop="spec" label="规格" width="120" />
        <el-table-column label="库存" width="120">
          <template #default="{ row }">
            {{ row.quantity }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column label="剩余天数" width="120">
          <template #default="{ row }">
            <span :class="{
              'days-danger': row.daysUntilExpire < 0,
              'days-warning': row.daysUntilExpire >= 0 && row.daysUntilExpire <= 30,
              'days-safe': row.daysUntilExpire > 30
            }">
              {{ formatDaysRemaining(row.daysUntilExpire) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="expireDate" label="保质期" width="120" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Plus" @click="handleUpdateQuantity(row, 1)">
              补充
            </el-button>
            <el-button link type="warning" :icon="Minus" @click="handleUpdateQuantity(row, -1)">
              消耗
            </el-button>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <MedicineDialog
      v-model:visible="dialogVisible"
      :medicine="currentMedicine"
      @success="dialogVisible = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.medicine-page {
  .medicine-name {
    font-weight: 500;
  }
  
  .status-tag {
    margin-left: 8px;
  }

  .days-danger {
    color: #f56c6c;
    font-weight: 600;
  }

  .days-warning {
    color: #e6a23c;
    font-weight: 500;
  }

  .days-safe {
    color: #67c23a;
  }

  .filter-result-info {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f0f9eb;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    strong {
      color: #67c23a;
    }
  }
}
</style>
