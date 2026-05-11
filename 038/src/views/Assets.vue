<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessageBox, ElMessage, ElInput, type FormInstance } from 'element-plus'
import type { Asset, AssetFormData, FormMode, DepreciationMethod, DepreciationDetail } from '@/types/asset'
import { 
  ASSET_CATEGORY_MAP, 
  ASSET_STATUS_MAP, 
  ASSET_STATUS_TAG_TYPE,
  DEPRECIATION_METHOD_MAP,
  CATEGORY_DEPRECIATION_RATE
} from '@/types/asset'
import { useAssetStore } from '@/stores'
import { getDepartmentNames, getWarehouseNames } from '@/mock/baseData'
import AssetDialog from '@/components/AssetDialog.vue'
import { formatCurrency, getDepreciationPercentage, isHighValueAsset } from '@/utils/depreciation'
import { Edit, View, Delete, TrendCharts, Save, Collection } from '@element-plus/icons-vue'

const assetStore = useAssetStore()

const dialogVisible = ref(false)
const depreciationDialogVisible = ref(false)
const saveFilterDialogVisible = ref(false)
const dialogMode = ref<FormMode>('create')
const currentAsset = ref<Asset | undefined>()
const depreciationDetails = ref<{
  schedule: DepreciationDetail[]
  currentPercentage: number
  monthlyDepreciation: number
  monthsUsed: number
  summary: string
} | null>(null)

const filterNameInput = ref('')
const filterNameFormRef = ref<FormInstance>()

const categories = Object.entries(ASSET_CATEGORY_MAP).map(([value, label]) => ({ value, label }))
const statuses = Object.entries(ASSET_STATUS_MAP).map(([value, label]) => ({ value, label }))
const departments = getDepartmentNames().map(name => ({ value: name, label: name }))
const warehouses = getWarehouseNames().map(name => ({ value: name, label: name }))

const purchaseYears = computed(() => {
  const years: number[] = []
  const currentYear = new Date().getFullYear()
  for (let year = currentYear; year >= 2018; year--) {
    years.push(year)
  }
  return years
})

const tableData = computed(() => assetStore.assets)
const total = computed(() => assetStore.total)
const loading = computed(() => assetStore.loading)
const pagination = computed(() => assetStore.pagination)
const filters = computed(() => assetStore.filters)
const savedFilters = computed(() => assetStore.savedFilters)

const hasActiveFilters = computed(() => {
  const f = filters.value
  return f.keyword || f.category || f.department || f.status || 
         f.purchaseYear || f.warehouse || f.minValue || f.maxValue || 
         (f.isHighValue !== '' && f.isHighValue !== undefined)
})

onMounted(() => {
  assetStore.fetchAssets()
  assetStore.fetchStats()
})

watch(() => pagination.value.page, () => {
  assetStore.fetchAssets()
})

watch(() => pagination.value.pageSize, () => {
  assetStore.fetchAssets()
})

const handleSearch = () => {
  assetStore.setPage(1)
  assetStore.fetchAssets()
}

const handleReset = () => {
  assetStore.resetFilters()
  assetStore.fetchAssets()
}

const handlePageChange = (page: number) => {
  assetStore.setPage(page)
}

const handleSizeChange = (size: number) => {
  assetStore.setPageSize(size)
}

const handleCreate = () => {
  dialogMode.value = 'create'
  currentAsset.value = undefined
  dialogVisible.value = true
}

const handleEdit = (row: Asset) => {
  dialogMode.value = 'edit'
  currentAsset.value = row
  dialogVisible.value = true
}

const handleView = (row: Asset) => {
  dialogMode.value = 'view'
  currentAsset.value = row
  dialogVisible.value = true
}

const handleViewDepreciation = (row: Asset) => {
  currentAsset.value = row
  depreciationDetails.value = assetStore.getDepreciationDetails(row)
  depreciationDialogVisible.value = true
}

const handleDelete = (row: Asset) => {
  ElMessageBox.confirm(
    `确定要删除资产「${row.name}」吗？此操作不可恢复。`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    assetStore.deleteAsset(row.id, '管理员')
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = (data: AssetFormData) => {
  if (dialogMode.value === 'create') {
    assetStore.createAsset(data, '管理员')
  } else if (dialogMode.value === 'edit' && currentAsset.value) {
    assetStore.updateAsset(currentAsset.value.id, data, '管理员')
  }
}

const handleSaveFilter = () => {
  saveFilterDialogVisible.value = true
  filterNameInput.value = ''
}

const confirmSaveFilter = async () => {
  if (!filterNameFormRef.value) return
  try {
    await filterNameFormRef.value.validate()
    assetStore.saveFilter({
      name: filterNameInput.value,
      filters: { ...filters.value }
    })
    ElMessage.success('筛选条件已保存')
    saveFilterDialogVisible.value = false
  } catch {
    ElMessage.warning('请输入筛选名称')
  }
}

const handleApplySavedFilter = (id: string) => {
  assetStore.applySavedFilter(id)
  ElMessage.success('已应用筛选条件')
}

const handleDeleteSavedFilter = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这个保存的筛选条件吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    assetStore.deleteSavedFilter(id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

const getStatusTagType = (status: string) => {
  return ASSET_STATUS_TAG_TYPE[status as keyof typeof ASSET_STATUS_TAG_TYPE]
}

const getCategoryLabel = (category: string) => {
  return ASSET_CATEGORY_MAP[category as keyof typeof ASSET_CATEGORY_MAP]
}

const getDepreciationMethodLabel = (method: string) => {
  return DEPRECIATION_METHOD_MAP[method as DepreciationMethod] || method
}

const getRowClassName = ({ row }: { row: Asset }) => {
  if (row.currentValue < row.purchasePrice * 0.1) {
    return 'depreciation-high-row'
  }
  if (isHighValueAsset(row.purchasePrice)) {
    return 'high-value-row'
  }
  return ''
}
</script>

<template>
  <div class="assets-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">资产管理</h2>
        <p class="page-subtitle">管理企业IT资产信息、库存和状态</p>
      </div>
      <div class="header-right">
        <el-button 
          v-if="hasActiveFilters" 
          type="success" 
          :icon="Save"
          @click="handleSaveFilter"
        >
          保存筛选
        </el-button>
      </div>
    </div>
    
    <el-card v-if="savedFilters.length > 0" class="saved-filters-card">
      <div class="saved-filters-header">
        <el-icon><Collection /></el-icon>
        <span>已保存的筛选条件</span>
      </div>
      <div class="saved-filters-list">
        <el-tag
          v-for="savedFilter in savedFilters"
          :key="savedFilter.id"
          class="saved-filter-tag"
          closable
          @close="handleDeleteSavedFilter(savedFilter.id)"
          @click="handleApplySavedFilter(savedFilter.id)"
        >
          {{ savedFilter.name }}
        </el-tag>
      </div>
    </el-card>
    
    <el-card class="search-card">
      <el-form :model="filters" inline class="search-form">
        <el-form-item label="关键词">
          <el-input 
            v-model="filters.keyword" 
            placeholder="资产名称/SN码/型号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="资产分类">
          <el-select v-model="filters.category" placeholder="全部分类" clearable>
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-select v-model="filters.department" placeholder="全部部门" clearable>
            <el-option
              v-for="item in departments"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="资产状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option
              v-for="item in statuses"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="采购年份">
          <el-select v-model="filters.purchaseYear" placeholder="全部年份" clearable>
            <el-option
              v-for="year in purchaseYears"
              :key="year"
              :label="`${year}年`"
              :value="year"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="存放仓库">
          <el-select v-model="filters.warehouse" placeholder="全部仓库" clearable>
            <el-option
              v-for="item in warehouses"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="最小价值">
          <el-input-number 
            v-model="filters.minValue" 
            :min="0" 
            :precision="2"
            placeholder="0"
            :controls="false"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="最大价值">
          <el-input-number 
            v-model="filters.maxValue" 
            :min="0" 
            :precision="2"
            placeholder="∞"
            :controls="false"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="高价值">
          <el-select v-model="filters.isHighValue" placeholder="全部" clearable>
            <el-option label="是 (≥¥5000)" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>资产列表 (共 {{ total }} 条)</span>
          <el-button type="primary" @click="handleCreate">
            新增资产
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        :row-class-name="getRowClassName"
        style="width: 100%"
        :empty-text="'暂无资产数据'"
      >
        <el-table-column label="标识" width="60">
          <template #default="{ row }">
            <el-tooltip v-if="isHighValueAsset(row.purchasePrice)" content="高价值资产" placement="top">
              <el-tag type="warning" size="small" effect="dark">★</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="资产名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            {{ getCategoryLabel(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="serialNumber" label="SN码" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.serialNumber }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价值" width="220">
          <template #default="{ row }">
            <div class="value-info">
              <div class="value-purchase">原价: {{ formatCurrency(row.purchasePrice) }}</div>
              <div class="value-current">现值: {{ formatCurrency(row.currentValue) }}</div>
              <el-progress 
                :percentage="getDepreciationPercentage(row.purchasePrice, row.currentValue)" 
                :stroke-width="6"
                :show-text="false"
                :color="row.currentValue < row.purchasePrice * 0.2 ? '#F56C6C' : '#409EFF'"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="depreciationMethod" label="折旧方式" width="100">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ getDepreciationMethodLabel(row.depreciationMethod) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ ASSET_STATUS_MAP[row.status as keyof typeof ASSET_STATUS_MAP] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="90" show-overflow-tooltip />
        <el-table-column prop="currentHolder" label="持有人" width="90" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.currentHolder || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看折旧明细" placement="top">
              <el-button link type="primary" :icon="TrendCharts" @click="handleViewDepreciation(row)">
                折旧
              </el-button>
            </el-tooltip>
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="info" :icon="View" @click="handleView(row)">
                查看
              </el-button>
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button 
                link 
                type="danger" 
                :icon="Delete"
                @click="handleDelete(row)"
                :disabled="row.status === 'in_use'"
              >
                删除
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
    
    <AssetDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :asset="currentAsset"
      @submit="handleSubmit"
    />
    
    <el-dialog
      title="折旧明细"
      v-model="depreciationDialogVisible"
      :width="700"
    >
      <div v-if="currentAsset && depreciationDetails" class="depreciation-detail">
        <el-alert
          :title="depreciationDetails.summary"
          type="info"
          :closable="false"
          show-icon
          class="mb-20"
        />
        
        <el-descriptions :column="2" border class="mb-20">
          <el-descriptions-item label="资产名称">{{ currentAsset.name }}</el-descriptions-item>
          <el-descriptions-item label="SN码">{{ currentAsset.serialNumber }}</el-descriptions-item>
          <el-descriptions-item label="折旧方式">{{ getDepreciationMethodLabel(currentAsset.depreciationMethod) }}</el-descriptions-item>
          <el-descriptions-item label="年折旧率">{{ currentAsset.depreciationRate }}%</el-descriptions-item>
          <el-descriptions-item label="预计使用年限">{{ currentAsset.usefulLife }}年</el-descriptions-item>
          <el-descriptions-item label="残值">{{ formatCurrency(currentAsset.salvageValue) }}</el-descriptions-item>
          <el-descriptions-item label="采购日期">{{ currentAsset.purchaseDate }}</el-descriptions-item>
          <el-descriptions-item label="已使用">{{ depreciationDetails.monthsUsed }}个月</el-descriptions-item>
          <el-descriptions-item label="采购价格">{{ formatCurrency(currentAsset.purchasePrice) }}</el-descriptions-item>
          <el-descriptions-item label="当前价值">{{ formatCurrency(currentAsset.currentValue) }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 class="section-title">折旧计划表</h4>
        <el-table :data="depreciationDetails.schedule" stripe size="small">
          <el-table-column prop="year" label="年份" width="80">
            <template #default="{ row }">第{{ row.year }}年</template>
          </el-table-column>
          <el-table-column prop="monthlyDepreciation" label="月折旧额">
            <template #default="{ row }">{{ formatCurrency(row.monthlyDepreciation) }}</template>
          </el-table-column>
          <el-table-column prop="annualDepreciation" label="年折旧额">
            <template #default="{ row }">{{ formatCurrency(row.annualDepreciation) }}</template>
          </el-table-column>
          <el-table-column prop="accumulatedDepreciation" label="累计折旧">
            <template #default="{ row }">{{ formatCurrency(row.accumulatedDepreciation) }}</template>
          </el-table-column>
          <el-table-column prop="remainingValue" label="年末净值">
            <template #default="{ row }">
              <el-tag 
                v-if="row.remainingValue <= currentAsset.salvageValue" 
                type="info" 
                size="small"
              >
                {{ formatCurrency(row.remainingValue) }} (残值)
              </el-tag>
              <span v-else>{{ formatCurrency(row.remainingValue) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="depreciationDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      title="保存筛选条件"
      v-model="saveFilterDialogVisible"
      :width="400"
    >
      <el-form ref="filterNameFormRef" :model="{ name: filterNameInput }">
        <el-form-item 
          label="筛选名称" 
          :rules="[{ required: true, message: '请输入筛选名称', trigger: 'blur' }]"
          prop="name"
        >
          <el-input 
            v-model="filterNameInput" 
            placeholder="例如：研发部高价值资产"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="saveFilterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveFilter">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.assets-page {
  .page-header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #303133;
    }
    
    .page-subtitle {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }
  
  .saved-filters-card {
    margin-bottom: 20px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    .saved-filters-header {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #606266;
      margin-bottom: 12px;
      
      .el-icon {
        margin-right: 8px;
      }
    }
    
    .saved-filters-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .saved-filter-tag {
        cursor: pointer;
        
        &:hover {
          transform: scale(1.02);
        }
      }
    }
  }
  
  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    .search-form {
      :deep(.el-form-item) {
        margin-bottom: 16px;
      }
    }
  }
  
  .table-card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }
    
    .value-info {
      font-size: 12px;
      
      .value-purchase {
        color: #909399;
        text-decoration: line-through;
      }
      
      .value-current {
        font-weight: 600;
        color: #303133;
      }
    }
    
    :deep(.depreciation-high-row) {
      background-color: rgba(245, 108, 108, 0.05) !important;
    }
    
    :deep(.high-value-row) {
      background-color: rgba(230, 162, 60, 0.03) !important;
    }
    
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .depreciation-detail {
    .mb-20 {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #303133;
    }
  }
}

@media (max-width: 768px) {
  .assets-page {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      
      .header-right {
        margin-top: 16px;
      }
    }
    
    .search-card {
      .search-form {
        :deep(.el-form-item) {
          display: block;
          margin-bottom: 12px;
          width: 100%;
        }
      }
    }
    
    .table-card {
      :deep(.el-table) {
        font-size: 12px;
      }
    }
  }
}
</style>
