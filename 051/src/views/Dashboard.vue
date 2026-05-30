<template>
  <div class="page-container">
    <el-page-header content="工作台" class="mb-4" />
    
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card-hover">
          <div class="stat-item">
            <div class="stat-icon wine"><Grape /></div>
            <div class="stat-info">
              <div class="stat-value">{{ appStore.wineBrands.length }}</div>
              <div class="stat-label">酒水品牌数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card-hover">
          <div class="stat-item">
            <div class="stat-icon supplier"><OfficeBuilding /></div>
            <div class="stat-info">
              <div class="stat-value">{{ appStore.suppliers.length }}</div>
              <div class="stat-label">供应商数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card-hover">
          <div class="stat-item">
            <div class="stat-icon warning"><Warning /></div>
            <div class="stat-info">
              <div class="stat-value text-warning">{{ appStore.lowInventoryItems.length }}</div>
              <div class="stat-label">低库存预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card-hover">
          <div class="stat-item">
            <div class="stat-icon danger"><Clock /></div>
            <div class="stat-info">
              <div class="stat-value text-danger">{{ appStore.expiringItems.length }}</div>
              <div class="stat-label">临期商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card title="待审核采购单" shadow="hover">
          <el-table :data="pendingOrders" size="small" v-loading="loading">
            <el-table-column prop="orderNo" label="单据号" width="120" />
            <el-table-column prop="supplierName" label="供应商" show-overflow-tooltip />
            <el-table-column prop="totalAmount" label="金额" width="120">
              <template #default="{ row }">
                ¥{{ row.totalAmount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="pendingOrders.length === 0" description="暂无待审核单据" :image-size="80" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card title="库存预警列表" shadow="hover">
          <el-table :data="warningInventory" size="small" v-loading="loading">
            <el-table-column prop="wineBrandName" label="商品名称" show-overflow-tooltip />
            <el-table-column prop="quantity" label="库存数量" width="100">
              <template #default="{ row }">
                <el-tag :type="row.quantity <= row.warningQuantity ? 'danger' : 'warning'" size="small">
                  {{ row.quantity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="warningQuantity" label="预警线" width="80" />
            <el-table-column prop="expiryDate" label="有效期" width="120" />
          </el-table>
          <el-empty v-if="warningInventory.length === 0" description="暂无库存预警" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :xs="24" :md="8">
        <el-card title="快速操作" shadow="hover">
          <el-space direction="vertical" fill>
            <el-button type="primary" plain @click="$router.push('/wine-brand')" style="width: 100%">
              <el-icon><Plus /></el-icon>
              新增酒水品牌
            </el-button>
            <el-button type="success" plain @click="$router.push('/supplier')" style="width: 100%">
              <el-icon><Plus /></el-icon>
              新增供应商
            </el-button>
            <el-button type="warning" plain @click="$router.push('/purchase')" style="width: 100%">
              <el-icon><ShoppingCart /></el-icon>
              采购入库
            </el-button>
            <el-button type="info" plain @click="$router.push('/inventory')" style="width: 100%">
              <el-icon><Box /></el-icon>
              库存管理
            </el-button>
          </el-space>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="16">
        <el-card title="库存概览" shadow="hover">
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="库存总数量">
              <span class="text-primary font-bold">{{ totalQuantity }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="库存总金额">
              <span class="text-success font-bold">¥{{ totalAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="商品种类">
              <span class="text-warning font-bold">{{ appStore.inventoryList.length }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Grape, OfficeBuilding, Warning, Clock, Plus, ShoppingCart, Box } from '@element-plus/icons-vue'
import { useAppStore } from '@/store'
import { useRouter } from 'vue-router'

const router = useRouter()
const appStore = useAppStore()
const loading = ref(false)

const pendingOrders = computed(() => appStore.pendingPurchaseOrders.slice(0, 5))
const warningInventory = computed(() => {
  const low = appStore.lowInventoryItems
  const expiring = appStore.expiringItems
  const combined = [...low, ...expiring]
  return combined.slice(0, 5)
})

const totalQuantity = computed(() => appStore.inventoryList.reduce((sum, item) => sum + item.quantity, 0))
const totalAmount = computed(() => appStore.inventoryList.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  loading.value = true
  try {
    if (appStore.wineBrands.length === 0) {
      const wineRes = await fetch('/api/wine-brands').then(res => res.json())
      appStore.setWineBrands(wineRes.data)
    }
    if (appStore.suppliers.length === 0) {
      const supplierRes = await fetch('/api/suppliers').then(res => res.json())
      appStore.setSuppliers(supplierRes.data)
    }
    if (appStore.purchaseOrders.length === 0) {
      const purchaseRes = await fetch('/api/purchase-orders').then(res => res.json())
      appStore.setPurchaseOrders(purchaseRes.data)
    }
    if (appStore.inventoryList.length === 0) {
      const inventoryRes = await fetch('/api/inventory').then(res => res.json())
      appStore.setInventoryList(inventoryRes.data)
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;

  &.wine {
    background: #ede7f6;
    color: #7c4dff;
  }

  &.supplier {
    background: #e3f2fd;
    color: #2196f3;
  }

  &.warning {
    background: #fdf6ec;
    color: #e6a23c;
  }

  &.danger {
    background: #fef0f0;
    color: #f56c6c;
  }
}

.stat-info {
  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }

  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
  }
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.text-warning {
  color: #e6a23c;
}

.text-danger {
  color: #f56c6c;
}

.text-primary {
  color: #409eff;
}

.text-success {
  color: #67c23a;
}

.font-bold {
  font-weight: 600;
}

.stat-card-hover {
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
}
</style>
