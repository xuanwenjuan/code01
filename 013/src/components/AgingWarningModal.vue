<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import type { AgingWarning, Equipment } from '@/types'
import { QualityLevelNames, EquipmentStatusNames } from '@/types'

interface Props {
  visible: boolean
  warnings: AgingWarning[]
  equipments: Equipment[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'scrap', equipmentId: string): void
  (e: 'close'): void
}>()

const getWarningLevelClass = (level: AgingWarning['warningLevel']) => {
  switch (level) {
    case 'critical': return 'level-critical'
    case 'high': return 'level-high'
    case 'medium': return 'level-medium'
    case 'low': return 'level-low'
    default: return ''
  }
}

const getWarningLevelLabel = (level: AgingWarning['warningLevel']) => {
  switch (level) {
    case 'critical': return '严重'
    case 'high': return '高危'
    case 'medium': return '中等'
    case 'low': return '轻微'
    default: return '未知'
  }
}

const getWarningTypeLabel = (type: AgingWarning['warningType']) => {
  switch (type) {
    case 'remainingLife': return '剩余寿命'
    case 'entryYear': return '使用年限'
    case 'quality': return '品质等级'
    default: return '未知'
  }
}

const getEquipmentById = (equipmentId: string) => {
  return props.equipments.find(eq => eq.id === equipmentId)
}

const hasCriticalWarnings = computed(() => {
  return props.warnings.some(w => w.warningLevel === 'critical')
})

const warningStats = computed(() => {
  const stats = {
    total: props.warnings.length,
    critical: props.warnings.filter(w => w.warningLevel === 'critical').length,
    high: props.warnings.filter(w => w.warningLevel === 'high').length,
    medium: props.warnings.filter(w => w.warningLevel === 'medium').length,
    low: props.warnings.filter(w => w.warningLevel === 'low').length
  }
  return stats
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleScrap = (equipmentId: string) => {
  emit('scrap', equipmentId)
}
</script>

<template>
  <BaseModal
    :visible="visible"
    title="老化装备预警提醒"
    okText="我知道了"
    cancelText="关闭"
    width="700px"
    @ok="handleClose"
    @cancel="handleClose"
  >
    <div class="aging-warning-content">
      <div class="warning-summary">
        <div v-if="hasCriticalWarnings" class="critical-banner">
          <span class="icon">🚨</span>
          <strong>警告：存在严重老化的装备，请及时处理！</strong>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item critical">
            <span class="stat-value">{{ warningStats.critical }}</span>
            <span class="stat-label">严重</span>
          </div>
          <div class="stat-item high">
            <span class="stat-value">{{ warningStats.high }}</span>
            <span class="stat-label">高危</span>
          </div>
          <div class="stat-item medium">
            <span class="stat-value">{{ warningStats.medium }}</span>
            <span class="stat-label">中等</span>
          </div>
          <div class="stat-item low">
            <span class="stat-value">{{ warningStats.low }}</span>
            <span class="stat-label">轻微</span>
          </div>
        </div>
      </div>

      <div class="warning-list">
        <div v-if="warnings.length === 0" class="empty-state">
          <span class="icon">✅</span>
          <p>暂无老化装备预警</p>
        </div>

        <div 
          v-for="warning in warnings" 
          :key="warning.equipmentId"
          class="warning-item"
          :class="getWarningLevelClass(warning.warningLevel)"
        >
          <div class="warning-header">
            <div class="equipment-info">
              <h4>{{ warning.equipmentName }}</h4>
              <span 
                class="level-badge"
                :class="getWarningLevelClass(warning.warningLevel)"
              >
                {{ getWarningLevelLabel(warning.warningLevel) }}
              </span>
            </div>
            <button 
              class="btn btn-danger btn-sm"
              @click="handleScrap(warning.equipmentId)"
            >
              报废处理
            </button>
          </div>
          
          <div class="warning-details">
            <p class="warning-message">
              <strong>预警类型：</strong>{{ getWarningTypeLabel(warning.warningType) }}
              <br />
              <strong>预警内容：</strong>{{ warning.message }}
            </p>
            
            <div v-if="getEquipmentById(warning.equipmentId)" class="equipment-stats">
              <span>
                <strong>状态：</strong>
                {{ EquipmentStatusNames[getEquipmentById(warning.equipmentId)!.status] }}
              </span>
              <span>
                <strong>库存：</strong>
                {{ getEquipmentById(warning.equipmentId)!.stockQuantity }}件
              </span>
              <span v-if="getEquipmentById(warning.equipmentId)!.remainingLife !== undefined">
                <strong>剩余寿命：</strong>
                {{ getEquipmentById(warning.equipmentId)!.remainingLife }}年
              </span>
              <span>
                <strong>品质：</strong>
                {{ QualityLevelNames[getEquipmentById(warning.equipmentId)!.qualityLevel] }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.aging-warning-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.warning-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.critical-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}

.critical-banner .icon {
  font-size: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: #f9fafb;
}

.stat-item.critical {
  background: #fef2f2;
}

.stat-item.high {
  background: #fff7ed;
}

.stat-item.medium {
  background: #fffbeb;
}

.stat-item.low {
  background: #f0fdf4;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-item.critical .stat-value {
  color: #dc2626;
}

.stat-item.high .stat-value {
  color: #ea580c;
}

.stat-item.medium .stat-value {
  color: #d97706;
}

.stat-item.low .stat-value {
  color: #16a34a;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-state .icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.warning-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #e5e7eb;
  background: #fafafa;
}

.warning-item.level-critical {
  border-left-color: #dc2626;
  background: #fef2f2;
}

.warning-item.level-high {
  border-left-color: #ea580c;
  background: #fff7ed;
}

.warning-item.level-medium {
  border-left-color: #d97706;
  background: #fffbeb;
}

.warning-item.level-low {
  border-left-color: #16a34a;
  background: #f0fdf4;
}

.warning-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.equipment-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.equipment-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.level-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.level-badge.level-critical {
  background: #fecaca;
  color: #991b1b;
}

.level-badge.level-high {
  background: #fed7aa;
  color: #9a3412;
}

.level-badge.level-medium {
  background: #fde68a;
  color: #92400e;
}

.level-badge.level-low {
  background: #bbf7d0;
  color: #166534;
}

.warning-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning-message {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #4b5563;
}

.equipment-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 12px;
  color: #6b7280;
}

.equipment-stats strong {
  color: #374151;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}
</style>
