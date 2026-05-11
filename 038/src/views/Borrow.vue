<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { BorrowRecord, BorrowFormData, ReturnFormData, FormMode, BorrowStatus, StatusFlowStep } from '@/types/borrow'
import { BORROW_STATUS_MAP, BORROW_STATUS_TAG_TYPE } from '@/types/borrow'
import { useBorrowStore, useAssetStore } from '@/stores'
import { getDepartmentNames } from '@/mock/baseData'
import BorrowDialog from '@/components/BorrowDialog.vue'
import ReturnDialog from '@/components/ReturnDialog.vue'
import * as assetApi from '@/api/asset'
import type { Asset, AssetCategory } from '@/types/asset'
import { ASSET_CATEGORY_MAP } from '@/types/asset'
import { Warning, WarningFilled, View, Check, Close, RefreshLeft, Collection, Save, Clock, Link } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

interface SavedFilter {
  id: string
  name: string
  filters: Record<string, unknown>
  createdAt: string
}

const borrowStore = useBorrowStore()
const assetStore = useAssetStore()

const borrowDialogVisible = ref(false)
const returnDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const saveFilterDialogVisible = ref(false)
const dialogMode = ref<FormMode>('create')
const currentRecord = ref<BorrowRecord | undefined>()
const returnRecord = ref<BorrowRecord | undefined>()
const filterNameInput = ref('')

const departments = getDepartmentNames().map(name => ({ value: name, label: name }))
const categories = Object.entries(ASSET_CATEGORY_MAP).map(([value, label]) => ({ value, label }))

const availableAssets = ref<Asset[]>([])

const tableData = computed(() => borrowStore.records)
const total = computed(() => borrowStore.total)
const loading = computed(() => borrowStore.loading)
const pagination = computed(() => borrowStore.pagination)
const filters = computed(() => borrowStore.filters)
const savedFilters = computed(() => {
  const saved = localStorage.getItem('borrow-saved-filters')
  return saved ? (JSON.parse(saved) as SavedFilter[]) : []
})

const hasActiveFilters = computed(() => {
  const f = filters.value
  return f.keyword || f.applicantDepartment || f.status || 
         f.assetCategory || f.applicant ||
         (f.isHighValue !== '' && f.isHighValue !== undefined) ||
         (f.isOverdue !== '' && f.isOverdue !== undefined)
})

const getStatusFlow = (record: BorrowRecord): StatusFlowStep[] => {
  const flow: StatusFlowStep[] = []
  
  flow.push({
    status: '申请中',
    time: record.applyDate,
    active: true,
    description: '提交领用申请'
  })
  
  if (record.approveDate) {
    flow.push({
      status: record.status === 'rejected' ? '已拒绝' : '已审批',
      time: record.approveDate,
      active: true,
      description: record.status === 'rejected' 
        ? `拒绝申请${record.rejectReason ? `: ${record.rejectReason}` : ''}` 
        : '审批通过'
    })
  }
  
  if (record.borrowDate) {
    flow.push({
      status: '已领用',
      time: record.borrowDate,
      active: true,
      description: '领取设备'
    })
  }
  
  if (record.actualReturnDate) {
    flow.push({
      status: '已归还',
      time: record.actualReturnDate,
      active: true,
      description: '设备已归还'
    })
  }
  
  return flow
}

const getCurrentStep = (status: BorrowStatus): number => {
  const statusOrder: BorrowStatus[] = ['pending', 'approved', 'rejected', 'in_use', 'returned']
  return statusOrder.indexOf(status)
}

onMounted(async () => {
  await borrowStore.fetchRecords()
  await borrowStore.fetchStats()
  availableAssets.value = await assetApi.getAvailableAssets()
})

watch(() => pagination.value.page, () => {
  borrowStore.fetchRecords()
})

watch(() => pagination.value.pageSize, () => {
  borrowStore.fetchRecords()
})

const handleSearch = () => {
  borrowStore.setPage(1)
  borrowStore.fetchRecords()
}

const handleReset = () => {
  borrowStore.resetFilters()
  borrowStore.fetchRecords()
}

const handlePageChange = (page: number) => {
  borrowStore.setPage(page)
}

const handleSizeChange = (size: number) => {
  borrowStore.setPageSize(size)
}

const handleCreate = async () => {
  availableAssets.value = await assetApi.getAvailableAssets()
  if (availableAssets.value.length === 0) {
    ElMessage.warning('当前没有可领用的闲置资产')
    return
  }
  dialogMode.value = 'create'
  currentRecord.value = undefined
  borrowDialogVisible.value = true
}

const handleView = (row: BorrowRecord) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

const handleApprove = (row: BorrowRecord) => {
  ElMessageBox.confirm(
    `确定要通过「${row.applicant}」的「${row.assetName}」领用申请吗？`,
    '审批通过',
    {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    borrowStore.approveBorrow(row.id, '管理员')
    ElMessage.success('审批已通过')
  }).catch(() => {})
}

const handleReject = (row: BorrowRecord) => {
  ElMessageBox.prompt(
    '请输入拒绝原因',
    '拒绝申请',
    {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝原因'
    }
  ).then(({ value }) => {
    borrowStore.rejectBorrow(row.id, '管理员', value as string)
    ElMessage.success('已拒绝申请')
  }).catch(() => {})
}

const handleConfirm = (row: BorrowRecord) => {
  ElMessageBox.confirm(
    `确认「${row.applicant}」已领取「${row.assetName}」？`,
    '确认领用',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    borrowStore.confirmBorrow(row.id, '管理员')
    ElMessage.success('领用已确认')
  }).catch(() => {})
}

const handleReturn = (row: BorrowRecord) => {
  returnRecord.value = row
  returnDialogVisible.value = true
}

const handleBorrowSubmit = async (data: BorrowFormData) => {
  const selectedAsset = availableAssets.value.find(a => a.id === data.assetId)
  if (selectedAsset) {
    const recordData = {
      ...data,
      assetName: selectedAsset.name,
      assetSerialNumber: selectedAsset.serialNumber,
      assetCategory: ASSET_CATEGORY_MAP[selectedAsset.category as AssetCategory],
      assetPrice: selectedAsset.purchasePrice
    }
    await borrowStore.createBorrow(recordData, '管理员')
    availableAssets.value = await assetApi.getAvailableAssets()
  }
}

const handleReturnSubmit = async (data: ReturnFormData) => {
  if (returnRecord.value) {
    await borrowStore.returnBorrow(returnRecord.value.id, data, '管理员')
    availableAssets.value = await assetApi.getAvailableAssets()
  }
}

const handleSaveFilter = () => {
  saveFilterDialogVisible.value = true
  filterNameInput.value = ''
}

const confirmSaveFilter = async () => {
  if (!filterNameInput.value.trim()) {
    ElMessage.warning('请输入筛选名称')
    return
  }
  
  const saved = savedFilters.value || []
  saved.push({
    id: `filter-${Date.now()}`,
    name: filterNameInput.value,
    filters: { ...filters.value },
    createdAt: new Date().toISOString()
  })
  localStorage.setItem('borrow-saved-filters', JSON.stringify(saved))
  
  ElMessage.success('筛选条件已保存')
  saveFilterDialogVisible.value = false
}

const handleApplySavedFilter = (id: string) => {
  const saved = savedFilters.value || []
  const filter = saved.find((f: SavedFilter) => f.id === id)
  if (filter) {
    borrowStore.filters = { ...filter.filters }
    borrowStore.setPage(1)
    borrowStore.fetchRecords()
    ElMessage.success('已应用筛选条件')
  }
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
    const saved = savedFilters.value || []
    const filtered = saved.filter((f: SavedFilter) => f.id !== id)
    localStorage.setItem('borrow-saved-filters', JSON.stringify(filtered))
    ElMessage.success('已删除')
  }).catch(() => {})
}

const getStatusTagType = (status: string) => {
  return BORROW_STATUS_TAG_TYPE[status as keyof typeof BORROW_STATUS_TAG_TYPE]
}

const getRowClassName = ({ row }: { row: BorrowRecord }) => {
  if (row.isOverdue) {
    return 'overdue-row'
  }
  if (row.isHighValue && (row.status === 'in_use' || row.status === 'approved')) {
    return 'high-value-row'
  }
  return ''
}

const formatDays = (days: number | undefined) => {
  if (!days) return ''
  if (days === 1) return '1天'
  return `${days}天`
}
</script>

<template>
  <div class="borrow-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">领用管理</h2>
        <p class="page-subtitle">管理资产领用、归还和审批流程</p>
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
    
    <el-card class="stats-card">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6" :span="6">
          <div class="stat-item">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ borrowStore.stats.pending }}</div>
              <div class="stat-label">待审批</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :span="6">
          <div class="stat-item">
            <div class="stat-icon active">
              <el-icon><Link /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ borrowStore.stats.inUse }}</div>
              <div class="stat-label">已领用</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :span="6">
          <div class="stat-item">
            <div class="stat-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value danger">{{ borrowStore.stats.overdue }}</div>
              <div class="stat-label">逾期未还</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :span="6">
          <div class="stat-item">
            <div class="stat-icon high-value">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value warning">{{ borrowStore.stats.highValue }}</div>
              <div class="stat-label">高价值资产</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
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
            placeholder="资产名称/领用人/SN码"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="所属部门">
          <el-select v-model="filters.applicantDepartment" placeholder="全部部门" clearable>
            <el-option
              v-for="item in departments"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="领用状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option label="申请中" value="pending" />
            <el-option label="已审批" value="approved" />
            <el-option label="已领用" value="in_use" />
            <el-option label="已归还" value="returned" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="资产分类">
          <el-select v-model="filters.assetCategory" placeholder="全部分类" clearable>
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="高价值">
          <el-select v-model="filters.isHighValue" placeholder="全部" clearable>
            <el-option label="是 (≥¥5000)" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="逾期">
          <el-select v-model="filters.isOverdue" placeholder="全部" clearable>
            <el-option label="是" :value="true" />
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
          <span>领用记录 (共 {{ total }} 条)</span>
          <el-button type="primary" @click="handleCreate">
            发起领用
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        :row-class-name="getRowClassName"
        style="width: 100%"
        :empty-text="'暂无领用记录'"
      >
        <el-table-column label="预警" width="80">
          <template #default="{ row }">
            <div class="warning-icons">
              <el-tooltip v-if="row.isOverdue" content="已逾期" placement="top">
                <el-tag type="danger" size="small" effect="dark">逾期</el-tag>
              </el-tooltip>
              <el-tooltip v-if="row.isHighValue && row.status !== 'returned'" content="高价值资产" placement="top">
                <el-tag type="warning" size="small" effect="dark">★</el-tag>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="领用人" width="100">
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">
              {{ row.applicant }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="applicantDepartment" label="部门" width="100" show-overflow-tooltip />
        <el-table-column prop="assetName" label="资产名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="assetCategory" label="分类" width="100" />
        <el-table-column label="日期信息" width="220">
          <template #default="{ row }">
            <div class="date-info">
              <div class="date-item">
                <span class="date-label">申请：</span>
                <span class="date-value">{{ row.applyDate }}</span>
              </div>
              <div class="date-item">
                <span class="date-label">预计：</span>
                <span class="date-value" :class="{ overdue: row.isOverdue }">{{ row.expectedReturnDate }}</span>
              </div>
              <div v-if="row.actualReturnDate" class="date-item">
                <span class="date-label">实际：</span>
                <span class="date-value">{{ row.actualReturnDate }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <div class="status-info">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ BORROW_STATUS_MAP[row.status as keyof typeof BORROW_STATUS_MAP] }}
              </el-tag>
              <div v-if="row.isOverdue" class="overdue-days">
                逾期 {{ formatDays(row.overdueDays) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用途" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="info" :icon="View" @click="handleView(row)">
                详情
              </el-button>
            </el-tooltip>
            
            <template v-if="row.status === 'pending'">
              <el-tooltip content="审批通过" placement="top">
                <el-button link type="success" :icon="Check" @click="handleApprove(row)">
                  审批
                </el-button>
              </el-tooltip>
              <el-tooltip content="拒绝申请" placement="top">
                <el-button link type="danger" :icon="Close" @click="handleReject(row)">
                  拒绝
                </el-button>
              </el-tooltip>
            </template>
            
            <template v-else-if="row.status === 'approved'">
              <el-tooltip content="确认领用" placement="top">
                <el-button link type="primary" @click="handleConfirm(row)">
                  确认领用
                </el-button>
              </el-tooltip>
            </template>
            
            <template v-else-if="row.status === 'in_use'">
              <el-tooltip content="归还设备" placement="top">
                <el-button link type="warning" :icon="RefreshLeft" @click="handleReturn(row)">
                  归还
                </el-button>
              </el-tooltip>
            </template>
            
            <template v-else>
              <span class="text-disabled">已完成</span>
            </template>
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
    
    <BorrowDialog
      v-model:visible="borrowDialogVisible"
      :mode="dialogMode"
      :available-assets="availableAssets"
      :record="currentRecord"
      @submit="handleBorrowSubmit"
    />
    
    <ReturnDialog
      v-model:visible="returnDialogVisible"
      :record="returnRecord"
      @submit="handleReturnSubmit"
    />
    
    <el-dialog
      title="领用详情"
      v-model="detailDialogVisible"
      :width="600"
    >
      <div v-if="currentRecord" class="detail-content">
        <el-descriptions :column="2" border class="mb-20">
          <el-descriptions-item label="领用人">{{ currentRecord.applicant }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentRecord.applicantDepartment }}</el-descriptions-item>
          <el-descriptions-item label="资产名称">{{ currentRecord.assetName }}</el-descriptions-item>
          <el-descriptions-item label="资产分类">{{ currentRecord.assetCategory }}</el-descriptions-item>
          <el-descriptions-item label="资产价值">¥{{ currentRecord.assetPrice?.toFixed(2) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="SN码">{{ currentRecord.assetSerialNumber }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(currentRecord.status)">
              {{ BORROW_STATUS_MAP[currentRecord.status as keyof typeof BORROW_STATUS_MAP] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentRecord.applyDate }}</el-descriptions-item>
          <el-descriptions-item label="预计归还">{{ currentRecord.expectedReturnDate }}</el-descriptions-item>
          <el-descriptions-item label="审批人">{{ currentRecord.approver || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审批日期">{{ currentRecord.approveDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="领用日期">{{ currentRecord.borrowDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="实际归还">{{ currentRecord.actualReturnDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="领用用途" :span="2">{{ currentRecord.purpose }}</el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.rejectReason" label="拒绝原因" :span="2">
            <el-tag type="danger" effect="light">{{ currentRecord.rejectReason }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRecord.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 class="section-title">状态流转</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(step, index) in getStatusFlow(currentRecord)"
            :key="index"
            :timestamp="step.time"
            placement="top"
            :type="step.active ? 'primary' : 'info'"
            :hollow="!step.active"
          >
            <div class="timeline-content">
              <div class="timeline-status">{{ step.status }}</div>
              <div class="timeline-desc">{{ step.description }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      title="保存筛选条件"
      v-model="saveFilterDialogVisible"
      :width="400"
    >
      <el-form>
        <el-form-item label="筛选名称">
          <el-input 
            v-model="filterNameInput" 
            placeholder="例如：研发部逾期领用"
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
.borrow-page {
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
  
  .stats-card {
    margin-bottom: 20px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    .stat-item {
      display: flex;
      align-items: center;
      padding: 16px;
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;
        
        &.pending {
          background-color: rgba(230, 162, 60, 0.1);
          color: #E6A23C;
        }
        
        &.active {
          background-color: rgba(103, 194, 58, 0.1);
          color: #67C23A;
        }
        
        &.warning {
          background-color: rgba(245, 108, 108, 0.1);
          color: #F56C6C;
        }
        
        &.high-value {
          background-color: rgba(144, 147, 153, 0.1);
          color: #909399;
        }
      }
      
      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #303133;
          margin-bottom: 4px;
          
          &.danger {
            color: #F56C6C;
          }
          
          &.warning {
            color: #E6A23C;
          }
        }
        
        .stat-label {
          font-size: 13px;
          color: #909399;
        }
      }
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
    
    .warning-icons {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .date-info {
      font-size: 12px;
      line-height: 1.6;
      
      .date-item {
        display: flex;
        
        .date-label {
          color: #909399;
          width: 36px;
        }
        
        .date-value {
          &.overdue {
            color: #F56C6C;
            font-weight: 600;
          }
        }
      }
    }
    
    .status-info {
      .overdue-days {
        margin-top: 4px;
        font-size: 11px;
        color: #F56C6C;
      }
    }
    
    .text-disabled {
      color: #C0C4CC;
    }
    
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
    
    :deep(.overdue-row) {
      background-color: rgba(245, 108, 108, 0.05) !important;
    }
    
    :deep(.high-value-row) {
      background-color: rgba(230, 162, 60, 0.05) !important;
    }
  }
  
  .detail-content {
    .mb-20 {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #303133;
    }
    
    .timeline-content {
      .timeline-status {
        font-weight: 600;
        color: #303133;
      }
      
      .timeline-desc {
        font-size: 13px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

@media (max-width: 768px) {
  .borrow-page {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      
      .header-right {
        margin-top: 16px;
      }
    }
    
    .stats-card {
      .stat-item {
        margin-bottom: 16px;
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
