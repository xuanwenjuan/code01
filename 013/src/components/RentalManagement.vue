<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import BaseModal from './BaseModal.vue'
import AgingWarningModal from './AgingWarningModal.vue'
import { useDataStore } from '@/composables/useDataStore'
import { useNotification } from '@/composables/useNotification'
import { validateForm, commonRules, hasErrors } from '@/utils/validation'
import type { Equipment, FormErrors, FormValidationRule, EquipmentStatus, QualityLevel, RentalRecord } from '@/types'
import { QualityLevel as QualityLevelEnum, EquipmentStatus as EquipmentStatusEnum, QualityLevelNames, EquipmentStatusNames } from '@/types'

const {
  equipments,
  rentEquipment,
  returnEquipmentByEquipmentId,
  scrapEquipment,
  agingWarningEquipments,
  agingWarnings,
  highQualityEquipments,
  activeRentalRecords,
  getCategoryById
} = useDataStore()

const { success, error, warning } = useNotification()

const activeTab = ref<'rent' | 'return' | 'scrap'>('rent')
const rentModalVisible = ref(false)
const returnModalVisible = ref(false)
const scrapModalVisible = ref(false)
const agingModalVisible = ref(false)
const selectedEquipment = ref<Equipment | null>(null)
const hasShownAgingWarning = ref(false)

const operator = ref(localStorage.getItem('current_operator') || '系统管理员')

const rentForm = reactive({
  quantity: 1,
  renter: '',
  expectedReturnDays: 7,
  notes: ''
})

const returnForm = reactive({
  quantity: 1,
  renter: ''
})

const formErrors = ref<FormErrors>({})

const rentFormRules: Record<string, FormValidationRule[]> = {
  quantity: [
    commonRules.required('请输入租赁数量'),
    commonRules.minValue(1, '租赁数量至少为1')
  ],
  renter: [
    commonRules.required('请输入租赁人姓名'),
    commonRules.minLength(2, '租赁人姓名至少2个字符')
  ]
}

const returnFormRules: Record<string, FormValidationRule[]> = {
  quantity: [
    commonRules.required('请输入归还数量'),
    commonRules.minValue(1, '归还数量至少为1')
  ],
  renter: [
    commonRules.minLength(2, '租赁人姓名至少2个字符')
  ]
}

const availableEquipments = computed(() => {
  return equipments.value.filter(eq => 
    eq.status === EquipmentStatusEnum.IN_STOCK && eq.stockQuantity > 0
  )
})

const notScrappedEquipments = computed(() => {
  return equipments.value.filter(eq => eq.status !== EquipmentStatusEnum.SCRAPPED)
})

const showWarningBanner = computed(() => agingWarningEquipments.value.length > 0)

const getCategoryName = (categoryId: string) => {
  const category = getCategoryById(categoryId)
  return category ? category.name : '-'
}

const getQualityLevelClass = (level: QualityLevel) => {
  switch (level) {
    case QualityLevelEnum.EXCELLENT:
      return 'quality-excellent'
    case QualityLevelEnum.GOOD:
      return 'quality-good'
    case QualityLevelEnum.NORMAL:
      return 'quality-normal'
    case QualityLevelEnum.POOR:
      return 'quality-poor'
    default:
      return ''
  }
}

const getStatusClass = (status: EquipmentStatus) => {
  switch (status) {
    case EquipmentStatusEnum.IN_STOCK:
      return 'status-in-stock'
    case EquipmentStatusEnum.RENTED:
      return 'status-rented'
    case EquipmentStatusEnum.SCRAPPED:
      return 'status-scrapped'
    default:
      return ''
  }
}

const isHighQuality = (equipment: Equipment) => {
  return equipment.qualityLevel === QualityLevelEnum.EXCELLENT
}

const isAgingWarning = (equipment: Equipment) => {
  return agingWarningEquipments.value.some(eq => eq.id === equipment.id)
}

const openRentModal = (equipment: Equipment) => {
  if (isHighQuality(equipment)) {
    warning('注意：这是高品质装备，请谨慎租赁！')
  }
  selectedEquipment.value = equipment
  rentForm.quantity = 1
  rentForm.renter = ''
  rentForm.expectedReturnDays = 7
  rentForm.notes = ''
  formErrors.value = {}
  rentModalVisible.value = true
}

const openReturnModal = (equipment: Equipment) => {
  selectedEquipment.value = equipment
  returnForm.quantity = 1
  returnForm.renter = ''
  formErrors.value = {}
  returnModalVisible.value = true
}

const openScrapModal = (equipment: Equipment) => {
  if (isHighQuality(equipment)) {
    warning('注意：这是高品质装备，报废后无法恢复！')
  }
  selectedEquipment.value = equipment
  scrapModalVisible.value = true
}

const openAgingWarningModal = () => {
  agingModalVisible.value = true
}

const handleRent = () => {
  const errors = validateForm(rentForm, rentFormRules)
  formErrors.value = errors
  if (hasErrors(errors)) {
    return
  }
  if (!selectedEquipment.value) {
    error('请选择要租赁的装备')
    return
  }
  
  if (rentForm.quantity > selectedEquipment.value.stockQuantity) {
    error(`库存不足！当前库存：${selectedEquipment.value.stockQuantity}`)
    return
  }

  const result = rentEquipment(
    selectedEquipment.value.id,
    rentForm.quantity,
    rentForm.renter,
    operator.value,
    rentForm.expectedReturnDays,
    rentForm.notes
  )

  if (result.success) {
    success(`成功租赁 ${rentForm.quantity} 件 ${selectedEquipment.value.name}`)
    localStorage.setItem('current_operator', operator.value)
    rentModalVisible.value = false
  } else {
    error(result.reason || '租赁失败')
  }
}

const handleReturn = () => {
  const errors = validateForm(returnForm, returnFormRules)
  formErrors.value = errors
  if (hasErrors(errors)) {
    return
  }
  if (!selectedEquipment.value) {
    error('请选择要归还的装备')
    return
  }

  const result = returnEquipmentByEquipmentId(
    selectedEquipment.value.id,
    returnForm.quantity,
    returnForm.renter || '未指定',
    operator.value
  )

  if (result.success) {
    success(`成功归还 ${returnForm.quantity} 件 ${selectedEquipment.value.name}`)
    localStorage.setItem('current_operator', operator.value)
    returnModalVisible.value = false
  } else {
    error(result.reason || '归还失败')
  }
}

const handleScrap = () => {
  if (!selectedEquipment.value) {
    error('请选择要报废的装备')
    return
  }
  const result = scrapEquipment(selectedEquipment.value.id, operator.value)
  if (result) {
    success(`已报废装备：${selectedEquipment.value.name}`)
    scrapModalVisible.value = false
    agingModalVisible.value = false
  } else {
    error('报废失败')
  }
}

const handleScrapFromWarning = (equipmentId: string) => {
  const equipment = equipments.value.find(eq => eq.id === equipmentId)
  if (equipment) {
    selectedEquipment.value = equipment
    scrapModalVisible.value = true
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const operatorInput = ref(operator.value)
const updateOperator = () => {
  operator.value = operatorInput.value
  localStorage.setItem('current_operator', operator.value)
}

onMounted(() => {
  if (agingWarnings.value.length > 0 && !hasShownAgingWarning.value) {
    hasShownAgingWarning.value = true
    setTimeout(() => {
      agingModalVisible.value = true
    }, 500)
  }
})
</script>

<template>
  <div class="rental-management">
    <div class="section-header">
      <h2>装备租赁与归还</h2>
      <div class="header-actions">
        <div class="operator-input">
          <label>当前经办人：</label>
          <input
            v-model="operatorInput"
            type="text"
            class="form-input"
            placeholder="请输入经办人姓名"
            style="width: 150px;"
            @blur="updateOperator"
            @keyup.enter="updateOperator"
          />
        </div>
        <button 
          v-if="agingWarnings.length > 0" 
          class="btn btn-warning"
          @click="openAgingWarningModal"
        >
          ⚠️ 老化预警 ({{ agingWarnings.length }})
        </button>
      </div>
    </div>

    <div v-if="showWarningBanner" class="warning-banner" @click="openAgingWarningModal">
      <span class="warning-icon">⚠️</span>
      <div class="warning-content">
        <strong>老化预警提醒：</strong>
        当前有 <strong>{{ agingWarningEquipments.length }}</strong> 件装备存在老化风险，
        <span class="click-hint">点击查看详情</span>
      </div>
    </div>

    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'rent' }"
        @click="activeTab = 'rent'"
      >
        租赁登记
        <span class="tab-count">{{ availableEquipments.length }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'return' }"
        @click="activeTab = 'return'"
      >
        归还入库
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'scrap' }"
        @click="activeTab = 'scrap'"
      >
        报废处理
      </button>
    </div>

    <div v-if="activeTab === 'rent'" class="card">
      <h3 class="card-title">可租赁装备</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>装备名称</th>
              <th>品牌</th>
              <th>分类</th>
              <th>可租数量</th>
              <th>品质等级</th>
              <th>状态</th>
              <th>入库年份</th>
              <th>剩余寿命</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="equipment in availableEquipments" 
              :key="equipment.id"
              :class="{ 'warning-row': isAgingWarning(equipment) }"
            >
              <td>
                <div class="equipment-name">
                  {{ equipment.name }}
                  <span v-if="isHighQuality(equipment)" class="high-quality-badge">★ 高品质</span>
                  <span v-if="isAgingWarning(equipment)" class="aging-badge">⚠️ 老化</span>
                </div>
              </td>
              <td>{{ equipment.brand }}</td>
              <td>{{ getCategoryName(equipment.categoryId) }}</td>
              <td>
                <span class="stock-badge" :class="{ 'low-stock': equipment.stockQuantity <= 3 }">
                  {{ equipment.stockQuantity }}
                </span>
              </td>
              <td>
                <span class="quality-badge" :class="getQualityLevelClass(equipment.qualityLevel)">
                  {{ QualityLevelNames[equipment.qualityLevel] }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(equipment.status)">
                  {{ EquipmentStatusNames[equipment.status] }}
                </span>
              </td>
              <td>{{ equipment.entryYear }}年</td>
              <td>
                <span v-if="equipment.remainingLife !== undefined">{{ equipment.remainingLife }}年</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <button 
                  class="btn btn-primary btn-sm" 
                  @click="openRentModal(equipment)"
                >
                  租赁
                </button>
              </td>
            </tr>
            <tr v-if="availableEquipments.length === 0">
              <td colspan="9" class="empty-state">暂无可租赁的装备</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'return'" class="card">
      <h3 class="card-title">装备列表（可归还）</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>装备名称</th>
              <th>品牌</th>
              <th>分类</th>
              <th>库存数量</th>
              <th>品质等级</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="equipment in notScrappedEquipments" :key="equipment.id">
              <td>
                <div class="equipment-name">
                  {{ equipment.name }}
                  <span v-if="isHighQuality(equipment)" class="high-quality-badge">★ 高品质</span>
                </div>
              </td>
              <td>{{ equipment.brand }}</td>
              <td>{{ getCategoryName(equipment.categoryId) }}</td>
              <td>
                <span class="stock-badge">{{ equipment.stockQuantity }}</span>
              </td>
              <td>
                <span class="quality-badge" :class="getQualityLevelClass(equipment.qualityLevel)">
                  {{ QualityLevelNames[equipment.qualityLevel] }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(equipment.status)">
                  {{ EquipmentStatusNames[equipment.status] }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-success btn-sm" 
                  @click="openReturnModal(equipment)"
                >
                  归还
                </button>
              </td>
            </tr>
            <tr v-if="notScrappedEquipments.length === 0">
              <td colspan="7" class="empty-state">暂无装备</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'scrap'" class="card">
      <h3 class="card-title">装备列表（可报废）</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>装备名称</th>
              <th>品牌</th>
              <th>分类</th>
              <th>品质等级</th>
              <th>入库年份</th>
              <th>剩余寿命</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="equipment in notScrappedEquipments" 
              :key="equipment.id"
              :class="{ 'warning-row': isAgingWarning(equipment) }"
            >
              <td>
                <div class="equipment-name">
                  {{ equipment.name }}
                  <span v-if="isHighQuality(equipment)" class="high-quality-badge">★ 高品质</span>
                  <span v-if="isAgingWarning(equipment)" class="aging-badge">⚠️ 建议报废</span>
                </div>
              </td>
              <td>{{ equipment.brand }}</td>
              <td>{{ getCategoryName(equipment.categoryId) }}</td>
              <td>
                <span class="quality-badge" :class="getQualityLevelClass(equipment.qualityLevel)">
                  {{ QualityLevelNames[equipment.qualityLevel] }}
                </span>
              </td>
              <td>{{ equipment.entryYear }}年</td>
              <td>
                <span v-if="equipment.remainingLife !== undefined">{{ equipment.remainingLife }}年</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <button 
                  class="btn btn-danger btn-sm" 
                  @click="openScrapModal(equipment)"
                >
                  报废
                </button>
              </td>
            </tr>
            <tr v-if="notScrappedEquipments.length === 0">
              <td colspan="7" class="empty-state">暂无装备</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      v-model:visible="rentModalVisible"
      title="装备租赁"
      okText="确认租赁"
      @ok="handleRent"
    >
      <div v-if="selectedEquipment" class="rental-form">
        <div class="equipment-info">
          <h4>{{ selectedEquipment.name }}</h4>
          <p class="text-muted">品牌：{{ selectedEquipment.brand }}</p>
          <p class="text-muted">
            可租数量：<span class="stock-highlight">{{ selectedEquipment.stockQuantity }}</span>
          </p>
          <p v-if="isHighQuality(selectedEquipment)" class="high-quality-notice">
            ⚠️ 这是高品质装备，请谨慎租赁
          </p>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              租赁数量 <span class="required">*</span>
            </label>
            <input
              v-model.number="rentForm.quantity"
              type="number"
              class="form-input"
              :class="{ 'is-error': formErrors.quantity }"
              :min="1"
              :max="selectedEquipment.stockQuantity"
              placeholder="请输入租赁数量"
            />
            <p v-if="formErrors.quantity" class="form-error">{{ formErrors.quantity }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              租赁期限 (天)
            </label>
            <input
              v-model.number="rentForm.expectedReturnDays"
              type="number"
              class="form-input"
              min="1"
              max="365"
              placeholder="默认7天"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">
            租赁人 <span class="required">*</span>
          </label>
          <input
            v-model="rentForm.renter"
            type="text"
            class="form-input"
            :class="{ 'is-error': formErrors.renter }"
            placeholder="请输入租赁人姓名"
          />
          <p v-if="formErrors.renter" class="form-error">{{ formErrors.renter }}</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea
            v-model="rentForm.notes"
            class="form-input"
            rows="2"
            placeholder="可选备注信息"
          ></textarea>
        </div>
      </div>
    </BaseModal>

    <BaseModal
      v-model:visible="returnModalVisible"
      title="装备归还"
      okText="确认归还"
      @ok="handleReturn"
    >
      <div v-if="selectedEquipment" class="rental-form">
        <div class="equipment-info">
          <h4>{{ selectedEquipment.name }}</h4>
          <p class="text-muted">品牌：{{ selectedEquipment.brand }}</p>
          <p class="text-muted">
            当前库存：<span class="stock-highlight">{{ selectedEquipment.stockQuantity }}</span>
          </p>
        </div>
        
        <div class="form-group">
          <label class="form-label">
            归还数量 <span class="required">*</span>
          </label>
          <input
            v-model.number="returnForm.quantity"
            type="number"
            class="form-input"
            :class="{ 'is-error': formErrors.quantity }"
            min="1"
            placeholder="请输入归还数量"
          />
          <p v-if="formErrors.quantity" class="form-error">{{ formErrors.quantity }}</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">租赁人</label>
          <input
            v-model="returnForm.renter"
            type="text"
            class="form-input"
            :class="{ 'is-error': formErrors.renter }"
            placeholder="请输入租赁人姓名（可选）"
          />
          <p v-if="formErrors.renter" class="form-error">{{ formErrors.renter }}</p>
        </div>
      </div>
    </BaseModal>

    <BaseModal
      v-model:visible="scrapModalVisible"
      title="确认报废"
      okText="确认报废"
      cancelText="取消"
      @ok="handleScrap"
    >
      <div v-if="selectedEquipment" class="scrap-confirm">
        <div class="warning-icon-large">⚠️</div>
        <h4>确定要报废以下装备吗？</h4>
        <div class="equipment-info">
          <p><strong>{{ selectedEquipment.name }}</strong></p>
          <p class="text-muted">品牌：{{ selectedEquipment.brand }}</p>
          <p class="text-muted">
            品质等级：{{ QualityLevelNames[selectedEquipment.qualityLevel] }}
          </p>
          <p class="text-muted">
            当前库存：{{ selectedEquipment.stockQuantity }} 件
          </p>
        </div>
        <p v-if="isHighQuality(selectedEquipment)" class="high-quality-warning">
          ⚠️ 这是高品质装备，报废后无法恢复！
        </p>
        <p class="warning-text">此操作不可恢复，装备状态将变更为已报废。</p>
      </div>
    </BaseModal>

    <AgingWarningModal
      :visible="agingModalVisible"
      :warnings="agingWarnings"
      :equipments="equipments"
      @update:visible="agingModalVisible = $event"
      @scrap="handleScrapFromWarning"
    />
  </div>
</template>

<style scoped>
.rental-management {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.operator-input {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.form-input {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-warning {
  background: #f59e0b;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-warning:hover {
  background: #d97706;
}

.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.warning-banner:hover {
  background: #fef3c7;
}

.warning-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.warning-content {
  font-size: 14px;
  color: #92400e;
  line-height: 1.5;
}

.click-hint {
  color: #b45309;
  text-decoration: underline;
  cursor: pointer;
}

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-count {
  background: #dbeafe;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.card-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.equipment-name {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.high-quality-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.aging-badge {
  background: #fee2e2;
  color: #991b1b;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.stock-badge {
  display: inline-block;
  padding: 2px 10px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}

.stock-badge.low-stock {
  background: #fee2e2;
  color: #991b1b;
}

.quality-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
}

.quality-excellent {
  background: #dbeafe;
  color: #1d4ed8;
}

.quality-good {
  background: #d1fae5;
  color: #065f46;
}

.quality-normal {
  background: #fef3c7;
  color: #92400e;
}

.quality-poor {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
}

.status-in-stock {
  background: #d1fae5;
  color: #065f46;
}

.status-rented {
  background: #fef3c7;
  color: #92400e;
}

.status-scrapped {
  background: #fee2e2;
  color: #991b1b;
}

.warning-row {
  background: #fffbeb;
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: #9ca3af;
}

.rental-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.equipment-info {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.equipment-info h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1f2937;
}

.equipment-info p {
  margin: 4px 0;
  font-size: 14px;
}

.high-quality-notice {
  margin-top: 8px !important;
  padding: 8px;
  background: #fef3c7;
  border-radius: 4px;
  color: #92400e;
  font-weight: 500;
}

.stock-highlight {
  font-weight: 600;
  color: #059669;
  font-size: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-label .required {
  color: #ef4444;
}

.form-input.is-error {
  border-color: #ef4444;
}

.form-error {
  margin: 0;
  font-size: 12px;
  color: #ef4444;
}

.scrap-confirm {
  text-align: center;
}

.warning-icon-large {
  font-size: 48px;
  margin-bottom: 16px;
}

.scrap-confirm h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1f2937;
}

.high-quality-warning {
  margin: 16px 0 !important;
  padding: 12px;
  background: #fee2e2;
  border-radius: 6px;
  color: #991b1b;
  font-weight: 600;
}

.warning-text {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  color: #ef4444;
  font-size: 14px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .operator-input {
    width: 100%;
  }
  
  .operator-input input {
    flex: 1;
  }
}
</style>
