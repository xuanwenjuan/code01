<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCommunityStore } from '@/stores'
import AdvancedFilter from '@/components/AdvancedFilter.vue'
import type { AdvancedFilter as FilterType, Building, Resident } from '@/types'

const store = useCommunityStore()

const activeTab = ref<'buildings' | 'residents'>('buildings')
const filter = ref<FilterType>({})
const selectedBuilding = ref<Building | null>(null)
const residentDialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit' | 'view'>('view')
const currentResident = ref<Resident | null>(null)

const formRef = ref()
const residentForm = ref({
  name: '',
  phone: '',
  idCard: '',
  buildingId: '',
  houseId: '',
  relationship: 'owner' as Resident['relationship'],
  moveInDate: '',
  status: 'active' as Resident['status']
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  buildingId: [{ required: true, message: '请选择楼栋', trigger: 'change' }],
  houseId: [{ required: true, message: '请选择房屋', trigger: 'change' }],
  moveInDate: [{ required: true, message: '请选择入住日期', trigger: 'change' }]
}

const filteredResidents = computed(() => {
  return store.filterResidents(filter.value)
})

const buildingStats = computed(() => {
  return store.buildings.map(building => {
    const buildingHouses = store.houses.filter(h => h.buildingId === building.id)
    const occupied = buildingHouses.filter(h => h.occupancyStatus === 'occupied').length
    const total = buildingHouses.length
    return {
      ...building,
      buildingHouses,
      occupied,
      total,
      rate: total > 0 ? ((occupied / total) * 100).toFixed(1) : '0'
    }
  })
})

const availableHouses = computed(() => {
  if (!residentForm.value.buildingId) return []
  return store.houses.filter(h => h.buildingId === residentForm.value.buildingId)
})

function handleSearch() {
  ElMessage.success('搜索完成')
}

function handleReset() {
  selectedBuilding.value = null
  ElMessage.info('已重置筛选条件')
}

function openResidentDialog(mode: 'create' | 'edit' | 'view', resident?: Resident) {
  dialogMode.value = mode
  residentDialogVisible.value = true
  currentResident.value = resident || null
  
  if (resident) {
    residentForm.value = {
      name: resident.name,
      phone: resident.phone,
      idCard: resident.idCard,
      buildingId: resident.buildingId,
      houseId: resident.houseId,
      relationship: resident.relationship,
      moveInDate: resident.moveInDate,
      status: resident.status
    }
  } else {
    resetResidentForm()
  }
}

function resetResidentForm() {
  residentForm.value = {
    name: '',
    phone: '',
    idCard: '',
    buildingId: '',
    houseId: '',
    relationship: 'owner',
    moveInDate: '',
    status: 'active'
  }
}

async function handleSaveResident() {
  if (!formRef.value) return
  await formRef.value.validate()
  
  if (dialogMode.value === 'create') {
    store.addResident(residentForm.value)
    ElMessage.success('住户添加成功')
  } else if (currentResident.value) {
    store.updateResident(currentResident.value.id, residentForm.value)
    ElMessage.success('住户信息更新成功')
  }
  
  residentDialogVisible.value = false
}

function handleDeleteResident(resident: Resident) {
  ElMessageBox.confirm(
    `确定要删除住户「${resident.name}」吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = store.residents.findIndex(r => r.id === resident.id)
    if (index > -1) {
      store.residents.splice(index, 1)
      store.addOperationLog('删除住户', '住户', resident.id, resident.name)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

function selectBuilding(building: Building) {
  selectedBuilding.value = building
  filter.value.buildingId = building.id
  activeTab.value = 'residents'
}

const getBuildingStatusTag = (status: Building['status']) => {
  const map: Record<string, { type: string; text: string }> = {
    normal: { type: 'success', text: '正常' },
    maintenance: { type: 'warning', text: '维护中' },
    completed: { type: 'info', text: '已竣工' }
  }
  return map[status]
}

const getOccupancyStatusTag = (status: string) => {
  const map: Record<string, { type: string; text: string }> = {
    occupied: { type: 'success', text: '已入住' },
    vacant: { type: 'info', text: '空置' },
    decorating: { type: 'warning', text: '装修中' }
  }
  return map[status] || { type: 'info', text: status }
}

const getRelationshipTag = (relationship: string) => {
  const map: Record<string, { type: string; text: string }> = {
    owner: { type: 'primary', text: '业主' },
    family: { type: 'success', text: '家属' },
    tenant: { type: 'warning', text: '租户' }
  }
  return map[relationship] || { type: 'info', text: relationship }
}
</script>

<template>
  <div class="building-management">
    <el-tabs v-model="activeTab" class="management-tabs">
      <el-tab-pane label="楼栋管理" name="buildings">
        <el-row :gutter="20">
          <el-col :span="8" v-for="building in buildingStats" :key="building.id">
            <el-card 
              class="building-card"
              :class="{ 'is-selected': selectedBuilding?.id === building.id }"
              @click="selectBuilding(building)"
            >
              <template #header>
                <div class="building-header">
                  <span class="building-name">{{ building.name }}</span>
                  <el-tag :type="getBuildingStatusTag(building.status)?.type" size="small">
                    {{ getBuildingStatusTag(building.status)?.text }}
                  </el-tag>
                </div>
              </template>
              
              <div class="building-info">
                <div class="info-row">
                  <span class="label">期数：</span>
                  <span>{{ building.phase }}</span>
                </div>
                <div class="info-row">
                  <span class="label">楼层：</span>
                  <span>{{ building.totalFloors }}层</span>
                </div>
                <div class="info-row">
                  <span class="label">单元：</span>
                  <span>{{ building.totalUnits }}个</span>
                </div>
              </div>
              
              <el-divider />
              
              <div class="occupancy-section">
                <div class="occupancy-header">
                  <span>入住情况</span>
                  <span class="rate">{{ building.rate }}%</span>
                </div>
                <el-progress 
                  :percentage="parseFloat(building.rate)" 
                  :stroke-width="10"
                  :color="parseFloat(building.rate) > 80 ? '#67C23A' : '#E6A23C'"
                />
                <div class="occupancy-detail">
                  <span>已入住：{{ building.occupied }}户</span>
                  <span>空置：{{ building.total - building.occupied }}户</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      
      <el-tab-pane label="住户管理" name="residents">
        <AdvancedFilter
          v-model="filter"
          :show-keyword="true"
          :show-building="true"
          :show-occupancy-status="true"
          @search="handleSearch"
          @reset="handleReset"
        />
        
        <el-card>
          <template #header>
            <div class="table-header">
              <span>住户列表</span>
              <el-button type="primary" @click="openResidentDialog('create')">
                <el-icon><Plus /></el-icon>
                添加住户
              </el-button>
            </div>
          </template>
          
          <el-table :data="filteredResidents" stripe>
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column label="身份" width="80">
              <template #default="{ row }">
                <el-tag :type="getRelationshipTag(row.relationship).type" size="small">
                  {{ getRelationshipTag(row.relationship).text }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="电话" width="120" />
            <el-table-column label="楼栋" width="100">
              <template #default="{ row }">
                {{ store.buildings.find(b => b.id === row.buildingId)?.name }}
              </template>
            </el-table-column>
            <el-table-column label="房屋" width="100">
              <template #default="{ row }">
                {{ store.houses.find(h => h.id === row.houseId)?.houseNo }}
              </template>
            </el-table-column>
            <el-table-column label="入住状态" width="100">
              <template #default="{ row }">
                <el-tag 
                  :type="getOccupancyStatusTag(store.houses.find(h => h.id === row.houseId)?.occupancyStatus || '').type" 
                  size="small"
                >
                  {{ getOccupancyStatusTag(store.houses.find(h => h.id === row.houseId)?.occupancyStatus || '').text }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="moveInDate" label="入住日期" width="120" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '正常' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openResidentDialog('view', row)">
                  详情
                </el-button>
                <el-button type="primary" link size="small" @click="openResidentDialog('edit', row)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click="handleDeleteResident(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-pagination
            class="pagination"
            background
            layout="prev, pager, next, total"
            :total="filteredResidents.length"
            :page-size="10"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <el-dialog
      v-model="residentDialogVisible"
      :title="dialogMode === 'create' ? '添加住户' : dialogMode === 'edit' ? '编辑住户' : '住户详情'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="residentForm"
        :rules="rules"
        label-width="80px"
        :disabled="dialogMode === 'view'"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="residentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="residentForm.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证" prop="idCard">
              <el-input v-model="residentForm.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="楼栋" prop="buildingId">
              <el-select 
                v-model="residentForm.buildingId" 
                placeholder="请选择楼栋"
                style="width: 100%"
              >
                <el-option
                  v-for="building in store.buildings"
                  :key="building.id"
                  :label="building.name"
                  :value="building.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房屋" prop="houseId">
              <el-select 
                v-model="residentForm.houseId" 
                placeholder="请选择房屋"
                style="width: 100%"
                :disabled="!residentForm.buildingId"
              >
                <el-option
                  v-for="house in availableHouses"
                  :key="house.id"
                  :label="house.houseNo"
                  :value="house.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份" prop="relationship">
              <el-select v-model="residentForm.relationship" placeholder="请选择身份" style="width: 100%">
                <el-option label="业主" value="owner" />
                <el-option label="家属" value="family" />
                <el-option label="租户" value="tenant" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="residentForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="正常" value="active" />
                <el-option label="停用" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="入住日期" prop="moveInDate">
          <el-date-picker
            v-model="residentForm.moveInDate"
            type="date"
            placeholder="请选择入住日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="residentDialogVisible = false">取消</el-button>
        <el-button 
          v-if="dialogMode !== 'view'"
          type="primary" 
          @click="handleSaveResident"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.building-management {
  padding: 0;
}

.management-tabs {
  margin-top: -20px;
}

.building-card {
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.building-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.building-card.is-selected {
  border-color: #409EFF;
}

.building-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.building-name {
  font-weight: bold;
  font-size: 16px;
}

.building-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
}

.info-row .label {
  color: #909399;
  width: 60px;
}

.occupancy-section {
  margin-top: 8px;
}

.occupancy-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.occupancy-header .rate {
  font-weight: bold;
  color: #409EFF;
}

.occupancy-detail {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
