<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warehouse">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ warehouseCount }}</div>
              <div class="stat-label">仓库总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon inventory">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ inventoryCount }}</div>
              <div class="stat-label">库存数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon inbound">
              <el-icon><Download /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingInbound }}</div>
              <div class="stat-label">待入库订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon outbound">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingOutbound }}</div>
              <div class="stat-label">待出库订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>库存概览</span>
              <el-tag type="success">实时数据</el-tag>
            </div>
          </template>
          <el-table :data="inventoryStore.inventoryList" style="width: 100%">
            <el-table-column prop="productCode" label="商品编码" width="120" />
            <el-table-column prop="productName" label="商品名称" min-width="150" />
            <el-table-column prop="warehouseName" label="所在仓库" width="100" />
            <el-table-column prop="locationCode" label="货位" width="100" />
            <el-table-column label="数量" width="100">
              <template #default="scope">
                <span :class="{ 'low-stock': isLowStock(scope.row) }">
                  {{ scope.row.quantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastModified" label="最后更新" width="160" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="alerts-card">
          <template #header>
            <div class="card-header">
              <span>库存预警</span>
              <el-badge :value="lowStockItems.length" :max="99" class="item">
                <el-tag type="warning" v-if="lowStockItems.length > 0">
                  {{ lowStockItems.length }} 项低库存
                </el-tag>
              </el-badge>
            </div>
          </template>
          <div v-if="lowStockItems.length === 0" class="no-alerts">
            <el-empty description="暂无库存预警" />
          </div>
          <div v-else class="alert-list">
            <div
              v-for="item in lowStockItems"
              :key="item.id"
              class="alert-item"
            >
              <div class="alert-info">
                <div class="alert-title">{{ item.productName }}</div>
                <div class="alert-desc">
                  货位: {{ item.locationCode }} | 
                  当前: <span class="danger-text">{{ item.quantity }}</span> / 
                  最低: {{ getMinStock(item.productId) }}
                </div>
              </div>
              <el-tag type="danger" size="small">低库存</el-tag>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="recent-operations">
          <template #header>
            <div class="card-header">
              <span>最近操作</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="log in recentLogs"
              :key="log.id"
              :type="getLogType(log.operationType)"
              :timestamp="log.operationTime"
              placement="top"
            >
              <h4>{{ log.operationTitle }}</h4>
              <p>{{ log.operator }} - {{ log.details }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { OfficeBuilding, Box, Download, Upload } from '@element-plus/icons-vue'
import { useWarehouseStore } from '@/stores/warehouse'
import { useInventoryStore } from '@/stores/inventory'
import { useOperationStore } from '@/stores/operation'
import type { Inventory, InventoryStatus, OperationType, ElementTagType, InboundOrderStatus, OutboundOrderStatus } from '@/types'

const warehouseStore = useWarehouseStore()
const inventoryStore = useInventoryStore()
const operationStore = useOperationStore()

const warehouseCount = computed(() => warehouseStore.warehouseList.length)
const inventoryCount = computed(() => inventoryStore.inventoryList.length)
const pendingInbound = computed((): number => {
  const pendingStatuses: InboundOrderStatus[] = ['pending', 'in-progress']
  return inventoryStore.inboundOrderList.filter(o => pendingStatuses.includes(o.status)).length
})
const pendingOutbound = computed((): number => {
  const pendingStatuses: OutboundOrderStatus[] = ['pending', 'picking']
  return inventoryStore.outboundOrderList.filter(o => pendingStatuses.includes(o.status)).length
})

const lowStockItems = computed(() => inventoryStore.lowStockItems)

const recentLogs = computed(() => operationStore.logList.slice(0, 5))

const isLowStock = (inventory: Inventory): boolean => {
  const product = inventoryStore.getProductById(inventory.productId)
  return product ? inventory.quantity < product.minStock : false
}

const getMinStock = (productId: string): number => {
  const product = inventoryStore.getProductById(productId)
  return product?.minStock || 0
}

const getStatusType = (status: InventoryStatus): ElementTagType => {
  const statusMap: Record<InventoryStatus, ElementTagType> = {
    'on-shelf': 'success',
    'pending-in': 'warning',
    'picking': 'info',
    'shipped': 'primary'
  }
  return statusMap[status]
}

const getStatusText = (status: InventoryStatus): string => {
  const textMap: Record<InventoryStatus, string> = {
    'on-shelf': '已上架',
    'pending-in': '待入库',
    'picking': '拣货中',
    'shipped': '已出库'
  }
  return textMap[status]
}

const getLogType = (type: OperationType): ElementTagType => {
  const typeMap: Record<OperationType, ElementTagType> = {
    'inbound': 'success',
    'outbound': 'primary',
    'transfer': 'info',
    'adjustment': 'warning',
    'inventory-check': 'warning'
  }
  return typeMap[type]
}
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stat-icon.warehouse {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.inventory {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.inbound {
  background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
}

.stat-icon.outbound {
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.low-stock {
  color: #f56c6c;
  font-weight: bold;
}

.alerts-card {
  margin-bottom: 20px;
}

.no-alerts {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.alert-list {
  max-height: 200px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.alert-desc {
  font-size: 12px;
  color: #999;
}

.danger-text {
  color: #f56c6c;
  font-weight: bold;
}

.recent-operations {
  min-height: 300px;
}
</style>
