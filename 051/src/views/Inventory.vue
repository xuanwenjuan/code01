<template>
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">库存管理与预警</h1>
      <el-button type="primary" @click="handleBatchStockOut">
        <el-icon><ShoppingCart /></el-icon>
        批量出库
      </el-button>
    </div>

    <div class="card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff;">
            <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px">
              {{ appStore.inventoryList.length }}
            </div>
            <div style="font-size: 14px; opacity: 0.9">商品总数</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff;">
            <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px">
              {{ lowStockCount }}
            </div>
            <div style="font-size: 14px; opacity: 0.9">低库存预警</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #fff;">
            <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px">
              {{ expiringCount }}
            </div>
            <div style="font-size: 14px; opacity: 0.9">临期商品</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: #fff;">
            <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px">
              ¥{{ totalStockValue.toFixed(2) }}
            </div>
            <div style="font-size: 14px; opacity: 0.9">库存总值</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="card">
      <el-tabs v-model="activeWarning" @tab-change="handleWarningChange">
        <el-tab-pane label="全部商品" value="" />
        <el-tab-pane label="低库存预警" value="low" />
        <el-tab-pane label="临期预警" value="expiring" />
      </el-tabs>
    </div>

    <div class="card">
      <SearchForm v-model="filters" @search="handleSearch" @reset="handleReset">
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="filters.category" placeholder="请选择分类" clearable style="width: 160px">
            <el-option label="进口红酒" value="imported_wine" />
            <el-option label="洋酒" value="spirits" />
            <el-option label="精酿啤酒" value="craft_beer" />
            <el-option label="国产白酒" value="chinese_liquor" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警类型" prop="warning">
          <el-select v-model="filters.warning" placeholder="请选择预警类型" clearable style="width: 140px">
            <el-option label="低库存" value="low" />
            <el-option label="临期" value="expiring" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次号" prop="batchNo">
          <el-input v-model="filters.batchNo" placeholder="输入批次号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="关键词" prop="keyword">
          <el-input v-model="filters.keyword" placeholder="商品名称" clearable style="width: 180px" />
        </el-form-item>
      </SearchForm>

      <el-table
        :data="paginatedInventory"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        :empty-text="'暂无库存数据'"
        @selection-change="handleSelectionChange"
        :row-key="row => row.id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="wineBrandName" label="商品名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <span :class="['category-tag', row.category]">
              {{ WineCategoryLabel[row.category] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="batchNo" label="批次号" width="120" />
        <el-table-column prop="quantity" label="库存数量" width="120" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.quantity <= row.warningQuantity ? '#f56c6c' : '' }">
              {{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="warningQuantity" label="预警阈值" width="100" align="center" />
        <el-table-column prop="unitPrice" label="单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.unitPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" label="有效期至" width="180">
          <template #default="{ row }">
            <span :class="{ 'text-danger': isExpiring(row.expiryDate) }>
              {{ row.expiryDate }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="预警标签" width="120">
          <template #default="{ row }">
            <div v-if="isLowStock(row)" class="warning-tag low">低库存</div>
            <div v-else-if="isExpiring(row.expiryDate)" class="warning-tag expiring">临期</div>
            <div v-else style="color: #909399; font-size: 12px">正常</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleStockOut(row)">单品出库</el-button>
            <el-button type="warning" link size="small" @click="handleAdjustStock(row)">调整库存</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination-wrapper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="stockOutDialogVisible" title="单品出库" width="500px">
      <el-form label-width="100px">
        <el-form-item label="商品名称">
          <span>{{ currentStock?.wineBrandName }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span style="color: #f56c6c; font-weight: 600">{{ currentStock?.quantity }}</span>
        </el-form-item>
        <el-form-item label="客户名称" required>
          <el-input v-model="stockOutForm.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="stockOutForm.customerPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="出库数量" required>
          <el-input-number
            v-model="stockOutForm.quantity"
            :min="1"
            :max="currentStock?.quantity || 1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stockOutForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockOutDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="confirmStockOut">确认出库</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="adjustDialogVisible" title="调整库存" width="500px">
      <el-form label-width="100px">
        <el-form-item label="商品名称">
          <span>{{ currentStock?.wineBrandName }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span style="color: #409eff; font-weight: 600">{{ currentStock?.quantity }}</span>
        </el-form-item>
        <el-form-item label="调整后数量" required>
          <el-input-number v-model="adjustForm.quantity" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="调整原因">
          <el-input v-model="adjustForm.reason" type="textarea" :rows="2" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="confirmAdjust">确认调整</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchStockOutDialogVisible" title="批量出库" width="600px">
      <div style="margin-bottom: 16px">
        <span style="color: #606266">已选择 {{ selectedItems.length }} 件商品</span>
      </div>
      <el-table :data="selectedItems" border stripe size="small" max-height="300">
        <el-table-column prop="wineBrandName" label="商品名称" min-width="150" />
        <el-table-column prop="quantity" label="当前库存" width="100" align="center" />
        <el-table-column label="出库数量" width="140">
          <template #default="{ row }">
            <el-input-number v-model="row.stockOutQty" :min="1" :max="row.quantity" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row, $index }">
            <el-button type="danger" link size="small" @click="removeSelected($index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-form label-width="100px" style="margin-top: 20px">
        <el-form-item label="客户名称" required>
          <el-input v-model="batchStockOutForm.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="batchStockOutForm.customerPhone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchStockOutDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="confirmBatchStockOut">确认批量出库</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useAppStore } from '@/store'
import { WineCategoryLabel, type Inventory, type InventoryFilters } from '@/types'
import SearchForm from '@/components/SearchForm.vue'

const appStore = useAppStore()

const loading = ref(false)
const stockOutDialogVisible = ref(false)
const adjustDialogVisible = ref(false)
const batchStockOutDialogVisible = ref(false)
const submitLoading = ref(false)
const activeWarning = ref('')
const currentStock = ref<Inventory | null>(null)
const selectedItems = ref<Array<Inventory & { stockOutQty: number }>>([])

const filters = reactive<InventoryFilters>({
  category: '',
  warning: '',
  keyword: '',
  batchNo: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const stockOutForm = reactive({
  customerName: '',
  customerPhone: '',
  quantity: 1,
  remark: ''
})

const adjustForm = reactive({
  quantity: 0,
  reason: ''
})

const batchStockOutForm = reactive({
  customerName: '',
  customerPhone: ''
})

const filteredInventory = computed(() => {
  let result = [...appStore.inventoryList]

  if (activeWarning.value === 'low') {
    result = result.filter(item => item.quantity <= item.warningQuantity)
  } else if (activeWarning.value === 'expiring') {
    result = result.filter(item => isExpiring(item.expiryDate))
  }

  if (filters.category) {
    result = result.filter(item => item.category === filters.category)
  }
  if (filters.warning === 'low') {
    result = result.filter(item => item.quantity <= item.warningQuantity)
  } else if (filters.warning === 'expiring') {
    result = result.filter(item => isExpiring(item.expiryDate))
  }
  if (filters.batchNo) {
    result = result.filter(item => item.batchNo.includes(filters.batchNo))
  }
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(item =>
      item.wineBrandName.toLowerCase().includes(keyword)
    )
  }

  pagination.total = result.length
  return result
})

const paginatedInventory = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredInventory.value.slice(start, end)
})

const lowStockCount = computed(() =>
  appStore.inventoryList.filter(item => item.quantity <= item.warningQuantity).length
)

const expiringCount = computed(() =>
  appStore.inventoryList.filter(item => isExpiring(item.expiryDate)).length
)

const totalStockValue = computed(() =>
  appStore.inventoryList.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
)

const isLowStock = (item: Inventory): boolean => item.quantity <= item.warningQuantity

const isExpiring = (dateStr: string): boolean => {
  const now = new Date()
  const threeMonthsLater = new Date(now.setMonth(now.getMonth() + 3))
  return new Date(dateStr) <= threeMonthsLater
}

const handleWarningChange = (warning: string) => {
  activeWarning.value = warning
  pagination.page = 1
}

const handleSearch = () => {
  pagination.page = 1
}

const handleReset = () => {
  filters.category = ''
  filters.warning = ''
  filters.keyword = ''
  filters.batchNo = ''
  pagination.page = 1
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

const handleSelectionChange = (selection: Inventory[]) => {
  selectedItems.value = selection.map(item => ({ ...item, stockOutQty: 1 }))
}

const removeSelected = (index: number) => {
  selectedItems.value.splice(index, 1)
}

const handleStockOut = (row: Inventory) => {
  currentStock.value = row
  stockOutForm.customerName = ''
  stockOutForm.customerPhone = ''
  stockOutForm.quantity = 1
  stockOutForm.remark = ''
  stockOutDialogVisible.value = true
}

const handleAdjustStock = (row: Inventory) => {
  currentStock.value = row
  adjustForm.quantity = row.quantity
  adjustForm.reason = ''
  adjustDialogVisible.value = true
}

const handleBatchStockOut = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要出库的商品')
    return
  }
  batchStockOutForm.customerName = ''
  batchStockOutForm.customerPhone = ''
  batchStockOutDialogVisible.value = true
}

const confirmStockOut = () => {
  if (!stockOutForm.customerName.trim()) {
    ElMessage.warning('请输入客户名称')
    return
  }
  if (!stockOutForm.customerPhone.trim()) {
    ElMessage.warning('请输入联系电话')
    return
  }
  if (!currentStock.value) return

  submitLoading.value = true
  setTimeout(() => {
    const success = appStore.stockOut(currentStock.value!.id, stockOutForm.quantity)
    if (success) {
      ElMessage.success('出库成功')
      stockOutDialogVisible.value = false
    } else {
      ElMessage.error('库存不足，出库失败')
    }
    submitLoading.value = false
  }, 500)
}

const confirmAdjust = () => {
  if (!currentStock.value) return

  submitLoading.value = true
  setTimeout(() => {
    appStore.updateInventoryItem(currentStock.value!.id, { quantity: adjustForm.quantity })
    ElMessage.success('库存调整成功')
    adjustDialogVisible.value = false
    submitLoading.value = false
  }, 500)
}

const confirmBatchStockOut = () => {
  if (!batchStockOutForm.customerName.trim()) {
    ElMessage.warning('请输入客户名称')
    return
  }
  if (!batchStockOutForm.customerPhone.trim()) {
    ElMessage.warning('请输入联系电话')
    return
  }
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要出库的商品')
    return
  }

  submitLoading.value = true
  setTimeout(() => {
    const items = selectedItems.value.map(item => ({
      id: item.id,
      quantity: item.stockOutQty
    }))
    const result = appStore.batchStockOut(items)
    ElMessage.success(`批量出库完成：成功 ${result.success} 件，失败 ${result.failed} 件`)
    batchStockOutDialogVisible.value = false
    selectedItems.value = []
    submitLoading.value = false
  }, 500)
}
</script>
