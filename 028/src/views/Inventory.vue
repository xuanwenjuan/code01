<template>
  <div class="inventory-page">
    <el-card shadow="never">
      <template #header>
      </template>

      <AdvancedFilter
        :show-warehouse="true"
        :show-zone="true"
        :show-category="true"
        :show-status="true"
        :status-options="[
          { label: '已上架', value: 'on-shelf' },
          { label: '待入库', value: 'pending-in' },
          { label: '拣货中', value: 'picking' },
          { label: '已出库', value: 'shipped' }
        ]"
        @filter="handleFilter"
      />

      <el-table :data="filteredInventories" style="width: 100%">
        <el-table-column prop="productCode" label="商品编码" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="category" label="商品类别" width="100" />
        <el-table-column prop="warehouseName" label="所在仓库" width="100" />
        <el-table-column prop="locationCode" label="货位" width="100" />
        <el-table-column label="数量" width="100">
          <template #default="scope">
            <span :class="{ 'low-stock': isLowStock(scope.row) }">
              {{ scope.row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="库存状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="batchNo" label="批次号" width="120" />
        <el-table-column prop="inboundDate" label="入库日期" width="120" />
        <el-table-column prop="expiryDate" label="有效期至" width="120">
          <template #default="scope">
            <span v-if="scope.row.expiryDate" :class="{ 'expiring-soon': isExpiringSoon(scope.row.expiryDate) }">
              {{ scope.row.expiryDate }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import type { Inventory, InventoryStatus, FilterParams } from '@/types'
import AdvancedFilter from '@/components/AdvancedFilter.vue'

const inventoryStore = useInventoryStore()

const currentFilter = ref<FilterParams>({})

const filteredInventories = computed(() => {
  return inventoryStore.filterInventories(currentFilter.value)
})

const isLowStock = (inventory: Inventory): boolean => {
  const product = inventoryStore.getProductById(inventory.productId)
  return product ? inventory.quantity < product.minStock : false
}

const getStatusType = (status: InventoryStatus): 'success' | 'warning' | 'info' | 'primary' => {
  const statusMap: Record<InventoryStatus, 'success' | 'warning' | 'info' | 'primary'> = {
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

const isExpiringSoon = (expiryDate: string | undefined): boolean => {
  if (!expiryDate) return false
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 30 && diffDays > 0
}

const handleFilter = (params: FilterParams) => {
  currentFilter.value = params
}
</script>

<style scoped>
.inventory-page {
  width: 100%;
}

.low-stock {
  color: #f56c6c;
  font-weight: bold;
}

.expiring-soon {
  color: #e6a23c;
  font-weight: bold;
}
</style>
