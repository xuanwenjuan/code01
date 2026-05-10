<template>
  <div class="warehouse-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>仓库与货位管理</span>
        </div>
      </template>

      <AdvancedFilter
        :show-warehouse="true"
        :show-status="true"
        :status-options="[
          { label: '空闲', value: 'empty' },
          { label: '部分占用', value: 'partial' },
          { label: '已满', value: 'full' }
        ]"
        @filter="handleFilter"
      />

      <el-tabs v-model="activeTab">
        <el-tab-pane label="仓库概览" name="overview">
          <el-row :gutter="20">
            <el-col :span="8" v-for="warehouse in filteredWarehouses" :key="warehouse.id">
              <el-card shadow="hover" class="warehouse-card" :class="warehouse.type">
                <div class="warehouse-header">
                  <el-icon class="warehouse-icon" :class="warehouse.type">
                    <OfficeBuilding v-if="warehouse.type === 'normal'" />
                    <Snowflake v-else-if="warehouse.type === 'cold'" />
                    <Warning v-else />
                  </el-icon>
                  <div class="warehouse-title">
                    <div class="warehouse-name">{{ warehouse.name }}</div>
                    <div class="warehouse-code">{{ warehouse.code }}</div>
                  </div>
                  <el-tag :type="warehouse.status === 'active' ? 'success' : 'info'" size="small">
                    {{ warehouse.status === 'active' ? '运行中' : '维护中' }}
                  </el-tag>
                </div>
                
                <div class="warehouse-capacity">
                  <div class="capacity-title">
                    <span>容量使用率</span>
                    <span class="capacity-percentage" :style="{ color: warehouseStore.calculateCapacityColor(warehouseCapacityInfo(warehouse).percentage) }">
                      {{ warehouseCapacityInfo(warehouse).percentage }}%
                    </span>
                  </div>
                  <el-progress
                    :percentage="warehouseCapacityInfo(warehouse).percentage"
                    :color="warehouseStore.calculateCapacityColor(warehouseCapacityInfo(warehouse).percentage)"
                    :stroke-width="12"
                    :format="(percentage) => `${warehouseCapacityInfo(warehouse).used} / ${warehouseCapacityInfo(warehouse).total}`"
                  />
                </div>

                <div class="warehouse-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ getWarehouseStats(warehouse.id).totalLocations }}</div>
                    <div class="stat-label">总货位</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value empty">{{ getWarehouseStats(warehouse.id).emptyLocations }}</div>
                    <div class="stat-label">空闲</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value partial">{{ getWarehouseStats(warehouse.id).partialLocations }}</div>
                    <div class="stat-label">部分占用</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value full">{{ getWarehouseStats(warehouse.id).fullLocations }}</div>
                    <div class="stat-label">已满</div>
                  </div>
                </div>

                <div class="warehouse-zones">
                  <div class="zone-header">
                    <span class="zone-title">库区详情</span>
                    <el-button type="primary" link size="small" @click="showZoneDetail(warehouse)">
                      查看详情
                    </el-button>
                  </div>
                  <el-collapse>
                    <el-collapse-item
                      v-for="zone in warehouse.zones"
                      :key="zone.id"
                      :title="`${zone.name} (${zone.code})`"
                    >
                      <div class="zone-detail">
                        <div class="zone-info">
                          <span v-if="zone.temperature"><el-icon><Thermometer /></el-icon> {{ zone.temperature }}</span>
                          <span v-if="zone.specialRequirements"><el-icon><Warning /></el-icon> {{ zone.specialRequirements }}</span>
                        </div>
                        <div class="zone-capacity">
                          <div class="zone-capacity-label">
                            容量: {{ zoneCapacityInfo(zone).used }} / {{ zoneCapacityInfo(zone).total }}
                            <span class="zone-percentage" :style="{ color: warehouseStore.calculateCapacityColor(zoneCapacityInfo(zone).percentage) }">
                              ({{ zoneCapacityInfo(zone).percentage }}%)
                            </span>
                          </div>
                          <el-progress
                            :percentage="zoneCapacityInfo(zone).percentage"
                            :color="warehouseStore.calculateCapacityColor(zoneCapacityInfo(zone).percentage)"
                            :stroke-width="10"
                          />
                        </div>
                        <div class="zone-locations">
                          <span>货位状态:</span>
                          <div class="location-status-tags">
                            <el-tag type="success" size="small">
                              空闲 {{ warehouseStore.getLocationsByZone(zone.id).filter(l => l.status === 'empty').length }}
                            </el-tag>
                            <el-tag type="warning" size="small">
                              部分 {{ warehouseStore.getLocationsByZone(zone.id).filter(l => l.status === 'partial').length }}
                            </el-tag>
                            <el-tag type="info" size="small">
                              已满 {{ warehouseStore.getLocationsByZone(zone.id).filter(l => l.status === 'full').length }}
                            </el-tag>
                          </div>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="货位详情" name="locations">
          <el-table :data="filteredLocations" style="width: 100%">
            <el-table-column prop="code" label="货位编码" width="120" />
            <el-table-column label="所属仓库" width="120">
              <template #default="scope">
                {{ getWarehouseName(scope.row.warehouseId) }}
              </template>
            </el-table-column>
            <el-table-column label="所属库区" width="120">
              <template #default="scope">
                {{ getZoneName(scope.row.warehouseId, scope.row.zoneId) }}
              </template>
            </el-table-column>
            <el-table-column label="容量使用率" width="200">
              <template #default="scope">
                <div class="location-capacity-cell">
                  <span class="location-percentage" :style="{ color: warehouseStore.calculateCapacityColor(locationCapacityInfo(scope.row).percentage) }">
                    {{ locationCapacityInfo(scope.row).percentage }}%
                  </span>
                  <el-progress
                    :percentage="locationCapacityInfo(scope.row).percentage"
                    :color="warehouseStore.calculateCapacityColor(locationCapacityInfo(scope.row).percentage)"
                    :stroke-width="8"
                    :show-text="false"
                    style="width: 120px"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getLocationStatusType(scope.row.status)" size="small">
                  {{ getLocationStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="容量信息" width="150">
              <template #default="scope">
                {{ locationCapacityInfo(scope.row).used }} / {{ locationCapacityInfo(scope.row).total }}
                <span class="available-info">(可用: {{ locationCapacityInfo(scope.row).available }})</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="zoneDetailVisible"
      :title="`${currentWarehouse?.name} - 库区详情`"
      width="900px"
    >
      <div v-if="currentWarehouse">
        <el-row :gutter="20">
          <el-col :span="8" v-for="zone in currentWarehouse.zones" :key="zone.id">
            <el-card shadow="hover" class="zone-detail-card">
              <div class="zone-detail-header">
                <h4>{{ zone.name }}</h4>
                <el-tag size="small">{{ zone.code }}</el-tag>
              </div>
              <div class="zone-detail-info">
                <div v-if="zone.temperature" class="info-item">
                  <el-icon><Thermometer /></el-icon>
                  <span>温度: {{ zone.temperature }}</span>
                </div>
                <div v-if="zone.specialRequirements" class="info-item">
                  <el-icon><Warning /></el-icon>
                  <span>要求: {{ zone.specialRequirements }}</span>
                </div>
              </div>
              <div class="zone-detail-capacity">
                <div class="capacity-row">
                  <span>已用: {{ zoneCapacityInfo(zone).used }}</span>
                  <span>可用: {{ zoneCapacityInfo(zone).available }}</span>
                  <span>总计: {{ zoneCapacityInfo(zone).total }}</span>
                </div>
                <el-progress
                  :percentage="zoneCapacityInfo(zone).percentage"
                  :color="warehouseStore.calculateCapacityColor(zoneCapacityInfo(zone).percentage)"
                  :stroke-width="12"
                />
              </div>
              <div class="zone-detail-locations">
                <h5>货位列表</h5>
                <div class="location-grid">
                  <div
                    v-for="location in warehouseStore.getLocationsByZone(zone.id)"
                    :key="location.id"
                    class="location-item"
                    :class="location.status"
                    :title="`${location.code} - ${location.currentQuantity}/${location.capacity}`"
                  >
                    <div class="location-code">{{ location.code }}</div>
                    <div class="location-qty">{{ location.currentQuantity }}/{{ location.capacity }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { OfficeBuilding, Snowflake, Warning, Thermometer } from '@element-plus/icons-vue'
import { useWarehouseStore } from '@/stores/warehouse'
import type { Warehouse, WarehouseZone, Location, LocationStatus, FilterParams, CapacityInfo } from '@/types'
import AdvancedFilter from '@/components/AdvancedFilter.vue'

const warehouseStore = useWarehouseStore()

const activeTab = ref('overview')
const currentFilter = ref<FilterParams>({})
const zoneDetailVisible = ref(false)
const currentWarehouse = ref<Warehouse | null>(null)

const filteredWarehouses = computed(() => {
  return warehouseStore.filterWarehouses(currentFilter.value)
})

const filteredLocations = computed(() => {
  return warehouseStore.filterLocations(currentFilter.value)
})

const warehouseCapacityInfo = (warehouse: Warehouse): CapacityInfo => {
  return warehouseStore.getWarehouseCapacityInfo(warehouse)
}

const zoneCapacityInfo = (zone: WarehouseZone): CapacityInfo => {
  return warehouseStore.getZoneCapacityInfo(zone)
}

const locationCapacityInfo = (location: Location): CapacityInfo => {
  return warehouseStore.getLocationCapacityInfo(location)
}

const getWarehouseStats = (warehouseId: string) => {
  return warehouseStore.getWarehouseStatistics(warehouseId)
}

const getLocationStatusType = (status: LocationStatus): 'success' | 'warning' | 'info' => {
  const typeMap: Record<LocationStatus, 'success' | 'warning' | 'info'> = {
    empty: 'success',
    partial: 'warning',
    full: 'info'
  }
  return typeMap[status]
}

const getLocationStatusText = (status: LocationStatus): string => {
  const textMap: Record<LocationStatus, string> = {
    empty: '空闲',
    partial: '部分占用',
    full: '已满'
  }
  return textMap[status]
}

const getWarehouseName = (warehouseId: string): string => {
  const warehouse = warehouseStore.getWarehouseById(warehouseId)
  return warehouse?.name || ''
}

const getZoneName = (warehouseId: string, zoneId: string): string => {
  const zone = warehouseStore.getZoneById(warehouseId, zoneId)
  return zone?.name || ''
}

const showZoneDetail = (warehouse: Warehouse) => {
  currentWarehouse.value = warehouse
  zoneDetailVisible.value = true
}

const handleFilter = (params: FilterParams) => {
  currentFilter.value = params
}
</script>

<style scoped>
.warehouse-page {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.warehouse-card {
  border-radius: 8px;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.warehouse-card:hover {
  transform: translateY(-4px);
}

.warehouse-card.normal {
  border-left: 4px solid #1890ff;
}

.warehouse-card.cold {
  border-left: 4px solid #67c23a;
}

.warehouse-card.dangerous {
  border-left: 4px solid #f56c6c;
}

.warehouse-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.warehouse-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.warehouse-icon.normal {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.warehouse-icon.cold {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.warehouse-icon.dangerous {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.warehouse-title {
  flex: 1;
}

.warehouse-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.warehouse-code {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.warehouse-capacity {
  margin-bottom: 16px;
}

.capacity-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.capacity-percentage {
  font-weight: bold;
  font-size: 18px;
}

.warehouse-stats {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stat-value.empty {
  color: #67c23a;
}

.stat-value.partial {
  color: #e6a23c;
}

.stat-value.full {
  color: #909399;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.warehouse-zones {
  margin-top: 8px;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.zone-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.zone-detail {
  padding: 8px 0;
}

.zone-info {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #666;
}

.zone-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zone-capacity {
  margin-bottom: 12px;
}

.zone-capacity-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.zone-percentage {
  margin-left: 4px;
  font-weight: 500;
}

.zone-locations {
  font-size: 12px;
  color: #666;
}

.location-status-tags {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.location-capacity-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-percentage {
  font-weight: bold;
  width: 45px;
}

.available-info {
  color: #67c23a;
  font-size: 12px;
  margin-left: 4px;
}

.zone-detail-card {
  margin-bottom: 16px;
}

.zone-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.zone-detail-header h4 {
  margin: 0;
  font-size: 15px;
}

.zone-detail-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.zone-detail-capacity {
  margin-bottom: 16px;
}

.capacity-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.zone-detail-locations h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
}

.location-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-item {
  width: 60px;
  height: 50px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.location-item:hover {
  transform: scale(1.05);
}

.location-item.empty {
  background: rgba(103, 194, 58, 0.1);
  border: 1px dashed #67c23a;
}

.location-item.partial {
  background: rgba(230, 162, 60, 0.1);
  border: 1px solid #e6a23c;
}

.location-item.full {
  background: rgba(144, 147, 153, 0.1);
  border: 1px solid #909399;
}

.location-code {
  font-size: 11px;
  font-weight: 500;
  color: #333;
}

.location-qty {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}
</style>
