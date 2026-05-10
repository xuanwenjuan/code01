<template>
  <div class="manager-card">
    <div class="card-header">
      <h2>器材领用归还</h2>
      <div class="header-tips">
        <button 
          v-if="warningEquipments.length > 0" 
          class="btn btn-sm btn-warning-outline"
          @click="showWarningModal = true"
        >
          ⚠️ 有 {{ warningEquipments.length }} 个器材需要维护
        </button>
      </div>
    </div>

    <div class="operation-panel">
      <div class="equipment-selector">
        <label>选择器材</label>
        <select v-model="selectedEquipmentId" class="select-large">
          <option value="">请选择要操作的器材</option>
          <option 
            v-for="eq in availableEquipments" 
            :key="eq.id" 
            :value="eq.id"
          >
            {{ eq.name }} (品牌: {{ eq.brand }}, 库存: {{ eq.stock }}, 状态: {{ eq.status }})
          </option>
        </select>
      </div>

      <div v-if="selectedEquipment" class="equipment-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">器材名称</span>
            <span class="info-value">{{ selectedEquipment.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">品牌</span>
            <span class="info-value">{{ selectedEquipment.brand }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前库存</span>
            <span class="info-value highlight">{{ selectedEquipment.stock }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前状态</span>
            <span 
              class="status-badge"
              :class="getStatusClass(selectedEquipment.status)"
            >
              {{ selectedEquipment.status }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">完好度</span>
            <span 
              class="condition-badge"
              :class="getConditionClass(selectedEquipment.condition)"
            >
              {{ selectedEquipment.condition }}%
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">寿命剩余</span>
            <span 
              class="life-badge"
              :class="getLifeClass(selectedEquipment.lifeRemaining)"
            >
              {{ selectedEquipment.lifeRemaining }}%
            </span>
          </div>
        </div>
        
        <div v-if="isEquipmentWarning(selectedEquipment)" class="warning-banner">
          <span class="warning-icon">⚠️</span>
          <span>该器材需要维护！完好度过低或寿命剩余不足</span>
        </div>
      </div>

      <div v-if="selectedEquipment" class="operation-buttons">
        <button 
          class="btn btn-success"
          @click="openOperationModal('stockIn')"
        >
          <span class="btn-icon">+</span> 入库
        </button>
        <button 
          class="btn btn-primary"
          :disabled="!canStockOut"
          @click="openOperationModal('stockOut')"
        >
          <span class="btn-icon">-</span> 领用
        </button>
        <button 
          class="btn btn-warning"
          @click="openOperationModal('return')"
        >
          <span class="btn-icon">↩</span> 归还
        </button>
        <button 
          class="btn btn-danger"
          :disabled="!canScrap"
          @click="openScrapModal"
        >
          <span class="btn-icon">✕</span> 报废
        </button>
      </div>

      <div v-if="selectedEquipment" class="status-flow">
        <h4>状态流转说明</h4>
        <div class="flow-diagram">
          <div class="flow-step">
            <span class="flow-dot in-stock"></span>
            <span class="flow-label">库存</span>
          </div>
          <span class="flow-arrow">→</span>
          <div class="flow-step">
            <span class="flow-dot in-use"></span>
            <span class="flow-label">使用中</span>
          </div>
          <span class="flow-arrow">→</span>
          <div class="flow-step">
            <span class="flow-dot maintenance"></span>
            <span class="flow-label">维护中</span>
          </div>
          <span class="flow-arrow">→</span>
          <div class="flow-step">
            <span class="flow-dot scrapped"></span>
            <span class="flow-label">已报废</span>
          </div>
        </div>
        <div class="flow-hint">
          <p>• 库存为0时自动进入"维护中"状态</p>
          <p>• 完好度≤60%或寿命≤20%时自动进入"维护中"</p>
          <p>• "维护中"的器材不能领用</p>
        </div>
      </div>
    </div>

    <BaseModal
      :visible="operationModalVisible"
      :title="getOperationTitle()"
      width="480px"
      @close="operationModalVisible = false"
    >
      <div class="operation-form">
        <div v-if="currentOperation === 'stockIn'" class="form-group">
          <div class="form-item">
            <label class="form-label">入库数量 <span class="required">*</span></label>
            <input 
              type="number" 
              v-model.number="operationQuantity"
              class="form-input"
              min="1"
              max="9999"
              placeholder="请输入入库数量"
            />
            <div class="form-footer">
              <span class="form-hint">当前库存：{{ selectedEquipment?.stock || 0 }}</span>
              <span class="form-hint">入库后库存：{{ (selectedEquipment?.stock || 0) + (operationQuantity || 0) }}</span>
            </div>
          </div>
        </div>

        <div v-if="currentOperation === 'stockOut'" class="form-group">
          <div class="form-item">
            <label class="form-label">领用数量 <span class="required">*</span></label>
            <input 
              type="number" 
              v-model.number="operationQuantity"
              class="form-input"
              min="1"
              :max="selectedEquipment?.stock || 0"
              placeholder="请输入领用数量"
            />
            <div class="form-footer">
              <span class="form-hint">可用库存：{{ selectedEquipment?.stock || 0 }}</span>
              <span class="form-hint">领用后库存：{{ Math.max(0, (selectedEquipment?.stock || 0) - (operationQuantity || 0)) }}</span>
            </div>
            <div v-if="operationQuantity > (selectedEquipment?.stock || 0)" class="form-error">
              领用数量不能超过可用库存！
            </div>
          </div>
        </div>
        
        <div v-if="currentOperation === 'return'" class="form-group">
          <div class="form-item">
            <label class="form-label">归还数量 <span class="required">*</span></label>
            <input 
              type="number" 
              v-model.number="operationQuantity"
              class="form-input"
              min="1"
              max="9999"
              placeholder="请输入归还数量"
            />
          </div>
          <div class="form-item">
            <label class="form-label">归还后完好度(%) <span class="required">*</span></label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="returnCondition"
                min="0"
                max="100"
                step="5"
                class="condition-slider"
              />
              <input 
                type="number" 
                v-model.number="returnCondition"
                class="condition-input"
                min="0"
                max="100"
              />
            </div>
            <div class="condition-preview">
              <div 
                class="condition-bar"
                :class="getConditionClass(returnCondition)"
                :style="{ width: returnCondition + '%' }"
              ></div>
            </div>
            <div class="form-footer">
              <span class="form-hint">当前完好度：{{ selectedEquipment?.condition || 0 }}%</span>
              <span class="form-hint warning">归还后寿命减少2%</span>
            </div>
            <div v-if="returnCondition <= 60" class="form-warning">
              ⚠️ 完好度过低，器材将进入维护状态
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <button class="btn btn-secondary" @click="operationModalVisible = false">取消</button>
        <button 
          class="btn"
          :class="getOperationBtnClass()"
          :disabled="!isOperationValid"
          @click="handleOperation"
        >
          确认{{ getOperationAction() }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      :visible="scrapModalVisible"
      title="确认报废器材"
      width="450px"
      @close="scrapModalVisible = false"
    >
      <div class="scrap-warning">
        <div class="scrap-icon">⚠️</div>
        <h4>确定要报废器材「{{ selectedEquipment?.name }}」吗？</h4>
        <div class="scrap-details">
          <p><strong>操作后果：</strong></p>
          <ul>
            <li>库存将清零</li>
            <li>状态变为"已报废"</li>
            <li>报废后无法领用，但可入库恢复</li>
          </ul>
        </div>
      </div>
      
      <template #footer>
        <button class="btn btn-secondary" @click="scrapModalVisible = false">取消</button>
        <button class="btn btn-danger" @click="confirmScrap">确认报废</button>
      </template>
    </BaseModal>

    <BaseModal
      :visible="showWarningModal"
      title="需要维护的器材"
      width="550px"
      @close="showWarningModal = false"
    >
      <div class="warning-list">
        <p class="warning-summary">共 {{ warningEquipments.length }} 个器材需要维护</p>
        <div class="warning-table">
          <table>
            <thead>
              <tr>
                <th>器材名称</th>
                <th>分类</th>
                <th>完好度</th>
                <th>寿命剩余</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="eq in warningEquipments" :key="eq.id">
                <td>{{ eq.name }}</td>
                <td>{{ eq.categoryName }}</td>
                <td>
                  <span 
                    class="condition-badge"
                    :class="getConditionClass(eq.condition)"
                  >
                    {{ eq.condition }}%
                  </span>
                </td>
                <td>
                  <span 
                    class="life-badge"
                    :class="getLifeClass(eq.lifeRemaining)"
                  >
                    {{ eq.lifeRemaining }}%
                  </span>
                </td>
                <td>
                  <span 
                    class="status-badge"
                    :class="getStatusClass(eq.status)"
                  >
                    {{ eq.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="warning-hint">建议及时维护或更换老化器材</p>
      </div>
      
      <template #footer>
        <button class="btn btn-primary" @click="showWarningModal = false">我知道了</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Equipment, EquipmentStatus } from '@/types'
import { EquipmentStatus as Status } from '@/types'
import { useEquipmentStore } from '@/composables/useEquipmentStore'
import BaseModal from './BaseModal.vue'

const { equipments, warningEquipments, stockIn, stockOut, returnEquipment, scrapEquipment } = useEquipmentStore()

const selectedEquipmentId = ref('')
const operationModalVisible = ref(false)
const scrapModalVisible = ref(false)
const showWarningModal = ref(false)
const currentOperation = ref<'stockIn' | 'stockOut' | 'return'>('stockIn')
const operationQuantity = ref(1)
const returnCondition = ref(80)

const availableEquipments = computed(() => {
  return equipments.value.filter(eq => eq.status !== Status.SCRAPPED)
})

const selectedEquipment = computed(() => {
  return equipments.value.find(eq => eq.id === selectedEquipmentId.value) || null
})

const canStockOut = computed(() => {
  if (!selectedEquipment.value) return false
  return selectedEquipment.value.stock > 0 && 
         selectedEquipment.value.status !== Status.SCRAPPED &&
         selectedEquipment.value.status !== Status.MAINTENANCE
})

const canScrap = computed(() => {
  if (!selectedEquipment.value) return false
  return selectedEquipment.value.status !== Status.SCRAPPED
})

const isOperationValid = computed(() => {
  if (operationQuantity.value < 1) return false
  if (currentOperation.value === 'stockOut') {
    return operationQuantity.value <= (selectedEquipment.value?.stock || 0)
  }
  if (currentOperation.value === 'return') {
    return returnCondition.value >= 0 && returnCondition.value <= 100
  }
  return true
})

function isEquipmentWarning(eq: Equipment): boolean {
  return eq.lifeRemaining <= 20 || eq.condition <= 60
}

function getStatusClass(status: EquipmentStatus): string {
  const classes: Record<EquipmentStatus, string> = {
    [Status.IN_STOCK]: 'in-stock',
    [Status.IN_USE]: 'in-use',
    [Status.MAINTENANCE]: 'maintenance',
    [Status.SCRAPPED]: 'scrapped'
  }
  return classes[status]
}

function getConditionClass(condition: number): string {
  if (condition >= 80) return 'good'
  if (condition >= 60) return 'normal'
  return 'bad'
}

function getLifeClass(life: number): string {
  if (life >= 50) return 'good'
  if (life >= 20) return 'normal'
  return 'bad'
}

function getOperationTitle(): string {
  const titles: Record<string, string> = {
    stockIn: '器材入库',
    stockOut: '器材领用',
    return: '器材归还'
  }
  return titles[currentOperation.value]
}

function getOperationAction(): string {
  const actions: Record<string, string> = {
    stockIn: '入库',
    stockOut: '领用',
    return: '归还'
  }
  return actions[currentOperation.value]
}

function getOperationBtnClass(): string {
  const classes: Record<string, string> = {
    stockIn: 'btn-success',
    stockOut: 'btn-primary',
    return: 'btn-warning'
  }
  return classes[currentOperation.value]
}

function openOperationModal(type: 'stockIn' | 'stockOut' | 'return') {
  currentOperation.value = type
  operationQuantity.value = 1
  returnCondition.value = selectedEquipment.value?.condition || 80
  operationModalVisible.value = true
}

function openScrapModal() {
  scrapModalVisible.value = true
}

function handleOperation() {
  if (!selectedEquipment.value) return
  
  switch (currentOperation.value) {
    case 'stockIn':
      stockIn(selectedEquipment.value.id, operationQuantity.value)
      break
    case 'stockOut':
      const success = stockOut(selectedEquipment.value.id, operationQuantity.value)
      if (!success) {
        alert('领用失败！库存不足或器材在维护中')
        return
      }
      break
    case 'return':
      returnEquipment(selectedEquipment.value.id, operationQuantity.value, returnCondition.value)
      break
  }
  
  operationModalVisible.value = false
}

function confirmScrap() {
  if (selectedEquipment.value) {
    scrapEquipment(selectedEquipment.value.id)
  }
  scrapModalVisible.value = false
}
</script>

<style scoped>
.manager-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 16px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.btn-icon {
  font-size: 16px;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
}

.btn-secondary {
  background: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-secondary:hover {
  background: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.btn-warning-outline {
  background: #fff7e6;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.btn-warning-outline:hover {
  background: #fdf6ec;
}

.operation-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.equipment-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.equipment-selector label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.select-large {
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.select-large:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.equipment-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
  border-radius: 10px;
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

.info-value.highlight {
  color: #409eff;
  font-size: 20px;
}

.warning-banner {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fff7e6;
  border: 1px solid #faecd8;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-icon {
  font-size: 18px;
}

.warning-banner span:last-child {
  color: #e6a23c;
  font-size: 13px;
}

.operation-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-flow {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
}

.status-flow h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.flow-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.flow-dot.in-stock { background: #409eff; }
.flow-dot.in-use { background: #67c23a; }
.flow-dot.maintenance { background: #e6a23c; }
.flow-dot.scrapped { background: #f56c6c; }

.flow-label {
  font-size: 12px;
  color: #606266;
}

.flow-arrow {
  color: #c0c4cc;
  font-size: 16px;
}

.flow-hint {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.flow-hint p {
  margin: 4px 0;
  font-size: 12px;
  color: #909399;
}

.condition-badge,
.life-badge,
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.condition-badge.good,
.life-badge.good {
  background: #f0f9eb;
  color: #67c23a;
}

.condition-badge.normal,
.life-badge.normal {
  background: #fdf6ec;
  color: #e6a23c;
}

.condition-badge.bad,
.life-badge.bad {
  background: #fef0f0;
  color: #f56c6c;
}

.status-badge.in-stock {
  background: #e6f7ff;
  color: #1890ff;
}

.status-badge.in-use {
  background: #f0f9eb;
  color: #67c23a;
}

.status-badge.maintenance {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-badge.scrapped {
  background: #fef0f0;
  color: #f56c6c;
}

.operation-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.required {
  color: #f56c6c;
  margin-left: 2px;
}

.form-input {
  padding: 12px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.form-hint {
  font-size: 12px;
  color: #909399;
}

.form-hint.warning {
  color: #e6a23c;
}

.form-error {
  font-size: 12px;
  color: #f56c6c;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 4px;
}

.form-warning {
  font-size: 12px;
  color: #e6a23c;
  padding: 8px 12px;
  background: #fff7e6;
  border-radius: 4px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.condition-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #f56c6c 0%, #e6a23c 60%, #67c23a 100%);
  border-radius: 3px;
  outline: none;
}

.condition-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #409eff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.condition-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

.condition-input {
  width: 70px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.condition-preview {
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.condition-bar {
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.condition-bar.good { background: #67c23a; }
.condition-bar.normal { background: #e6a23c; }
.condition-bar.bad { background: #f56c6c; }

.scrap-warning {
  text-align: center;
  padding: 10px 0;
}

.scrap-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.scrap-warning h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.scrap-details {
  text-align: left;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.scrap-details p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.scrap-details ul {
  margin: 0;
  padding-left: 20px;
}

.scrap-details li {
  font-size: 13px;
  color: #909399;
  margin: 4px 0;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.warning-summary {
  margin: 0;
  font-size: 14px;
  color: #e6a23c;
  font-weight: 500;
}

.warning-table {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.warning-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.warning-table th,
.warning-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.warning-table th {
  background: #fafafa;
  font-weight: 600;
  color: #606266;
  position: sticky;
  top: 0;
}

.warning-table tr:last-child td {
  border-bottom: none;
}

.warning-hint {
  margin: 0;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

@media (max-width: 600px) {
  .manager-card {
    padding: 16px;
  }
  
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .operation-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .flow-diagram {
    flex-direction: column;
  }
  
  .flow-arrow {
    transform: rotate(90deg);
  }
}
</style>
