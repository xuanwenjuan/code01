<template>
  <div>
    <Teleport to="body">
      <div v-if="showAgeAlert" class="modal-overlay" @click.self="showAgeAlert = false">
        <div class="modal" style="max-width: 500px;">
          <div class="modal-header" style="background: linear-gradient(135deg, #dc3545 0%, #ffc107 100%);">
            <h3 class="modal-title" style="color: white;">标本年限时效提醒</h3>
            <button class="modal-close" style="color: white;" @click="showAgeAlert = false">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="ageStatistics.expired > 0" style="padding: 12px; background: #f8d7da; border-radius: 8px; margin-bottom: 12px;">
              <div style="font-weight: 600; color: #721c24;">
                🔴 已过期标本: {{ ageStatistics.expired }} 个
              </div>
              <div style="font-size: 13px; color: #721c24; margin-top: 4px;">
                这些标本已超过保存期限，请及时处理
              </div>
            </div>
            <div v-if="ageStatistics.warning > 0" style="padding: 12px; background: #fff3cd; border-radius: 8px;">
              <div style="font-weight: 600; color: #856404;">
                🟡 即将过期标本: {{ ageStatistics.warning }} 个
              </div>
              <div style="font-size: 13px; color: #856404; margin-top: 4px;">
                这些标本将在1年内过期，请安排检查
              </div>
            </div>
            <div v-if="alertSpecimens.length > 0" style="margin-top: 15px;">
              <div style="font-weight: 600; margin-bottom: 8px;">相关标本列表：</div>
              <div style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; border-radius: 6px;">
                <div 
                  v-for="s in alertSpecimens" 
                  :key="s.id"
                  style="padding: 8px 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;"
                >
                  <span>{{ s.name }}</span>
                  <span :class="['badge', getSpecimenAgeStatus(s.collectYear, categoryStore.getCategoryName(s.categoryId)) === 'expired' ? 'badge-danger' : 'badge-warning']">
                    {{ getSpecimenAgeStatus(s.collectYear, categoryStore.getCategoryName(s.categoryId)) === 'expired' ? '已过期' : '即将过期' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="showAgeAlert = false">我知道了</button>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="grid-4" style="margin-bottom: 20px;">
      <div class="card" style="padding: 20px; margin: 0;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">标本总数</div>
            <div style="font-size: 32px; font-weight: bold; color: var(--primary-color);">
              {{ specimenStore.statistics.total }}
            </div>
          </div>
          <div style="width: 48px; height: 48px; background: #d4edda; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            📦
          </div>
        </div>
      </div>

      <div class="card" style="padding: 20px; margin: 0;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">总库存量</div>
          <div style="font-size: 32px; font-weight: bold; color: #17a2b8;">
            {{ specimenStore.statistics.totalStock }}
          </div>
        </div>
        <div style="width: 48px; height: 48px; background: #d1ecf1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          📊
        </div>
      </div>

      <div class="card" style="padding: 20px; margin: 0;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">借阅中</div>
          <div style="font-size: 32px; font-weight: bold; color: #ffc107;">
            {{ borrowStore.activeBorrows.length }}
          </div>
        </div>
        <div style="width: 48px; height: 48px; background: #fff3cd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          📋
        </div>
      </div>

      <div class="card" style="padding: 20px; margin: 0;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">珍稀标本</div>
          <div style="font-size: 32px; font-weight: bold; color: #dc3545;">
            {{ specimenStore.statistics.rare }}
          </div>
        </div>
        <div style="width: 48px; height: 48px; background: #f8d7da; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          🌟
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">标本状态分布</h3>
        </div>
        <div class="grid-2" style="margin-top: 10px;">
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <div style="font-size: 14px; color: #666;">正常</div>
            <div style="font-size: 28px; font-weight: bold; color: #28a745;">{{ specimenStore.statistics.normal }}</div>
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <div style="font-size: 14px; color: #666;">已借出</div>
            <div style="font-size: 28px; font-weight: bold; color: #ffc107;">{{ specimenStore.statistics.borrowed }}</div>
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <div style="font-size: 14px; color: #666;">养护中</div>
            <div style="font-size: 28px; font-weight: bold; color: #17a2b8;">{{ specimenStore.statistics.maintenance }}</div>
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <div style="font-size: 14px; color: #666;">破损</div>
            <div style="font-size: 28px; font-weight: bold; color: #dc3545;">{{ specimenStore.statistics.damaged }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">年限时效状态</h3>
        </div>
        <div class="grid-3" style="margin-top: 10px;">
          <div 
            style="padding: 15px; background: #d4edda; border-radius: 8px; text-align: center; cursor: pointer;" 
            @click="appStore.showConfirm('正常标本', `共 ${ageStatistics.normal} 个标本在有效期内。`, () => {})"
          >
            <div style="font-size: 14px; color: #155724;">正常</div>
            <div style="font-size: 28px; font-weight: bold; color: #155724;">{{ ageStatistics.normal }}</div>
          </div>
          <div 
            style="padding: 15px; background: #fff3cd; border-radius: 8px; text-align: center; cursor: pointer;" 
            @click="showAgeAlert = true"
            :class="{ 'ring-warning': ageStatistics.warning > 0 }"
          >
            <div style="font-size: 14px; color: #856404;">即将过期</div>
            <div style="font-size: 28px; font-weight: bold; color: #856404;">{{ ageStatistics.warning }}</div>
          </div>
          <div 
            style="padding: 15px; background: #f8d7da; border-radius: 8px; text-align: center; cursor: pointer;" 
            @click="showAgeAlert = true"
            :class="{ 'ring-danger': ageStatistics.expired > 0 }"
          >
            <div style="font-size: 14px; color: #721c24;">已过期</div>
            <div style="font-size: 28px; font-weight: bold; color: #721c24;">{{ ageStatistics.expired }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">近期提醒</h3>
        </div>
        <div style="margin-top: 10px;">
          <div v-if="borrowStore.overdueBorrows.length > 0" style="padding: 12px; background: #f8d7da; border-radius: 8px; margin-bottom: 10px;">
            <div style="font-weight: 600; color: #721c24; margin-bottom: 8px;">
              ⚠️ 逾期借阅 ({{ borrowStore.overdueBorrows.length }})
            </div>
            <div v-for="b in borrowStore.overdueBorrows.slice(0, 3)" :key="b.id" style="font-size: 13px; color: #721c24; padding: 4px 0;">
              {{ b.specimenName }} - {{ b.borrower }}
            </div>
          </div>

          <div v-if="maintenanceStore.overdueMaintenance.length > 0" style="padding: 12px; background: #fff3cd; border-radius: 8px; margin-bottom: 10px;">
            <div style="font-weight: 600; color: #856404; margin-bottom: 8px;">
              🔔 逾期养护 ({{ maintenanceStore.overdueMaintenance.length }})
            </div>
            <div v-for="m in maintenanceStore.overdueMaintenance.slice(0, 3)" :key="m.id" style="font-size: 13px; color: #856404; padding: 4px 0;">
              {{ m.specimenName }} - {{ m.maintenanceType }}
            </div>
          </div>

          <div v-if="maintenanceStore.upcomingMaintenance.length > 0" style="padding: 12px; background: #d1ecf1; border-radius: 8px;">
            <div style="font-weight: 600; color: #0c5460; margin-bottom: 8px;">
              📅 即将养护计划 ({{ maintenanceStore.upcomingMaintenance.length }})
            </div>
            <div v-for="m in maintenanceStore.upcomingMaintenance.slice(0, 3)" :key="m.id" style="font-size: 13px; color: #0c5460; padding: 4px 0;">
              {{ m.specimenName }} - {{ m.maintenanceDate }}
            </div>
          </div>

          <div v-if="borrowStore.overdueBorrows.length === 0 && maintenanceStore.overdueMaintenance.length === 0 && maintenanceStore.upcomingMaintenance.length === 0" style="text-align: center; padding: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
            <div style="color: #666;">暂无待处理事项</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">最近操作记录</h3>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>时间</th>
              <th>操作类型</th>
              <th>描述</th>
              <th>经办人</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in recentLogs" :key="log.id">
              <td>{{ formatDateTime(log.timestamp) }}</td>
              <td>
                <span class="badge badge-info">{{ getOperationTypeLabel(log.operationType) }}</span>
              </td>
              <td>{{ log.description }}</td>
              <td>{{ log.operator || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="logStore.operationLogs.length === 0" class="empty-state" style="padding: 30px;">
          暂无操作记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSpecimenStore } from '../stores/specimen'
import { useCategoryStore } from '../stores/category'
import { useBorrowStore } from '../stores/borrow'
import { useMaintenanceStore } from '../stores/maintenance'
import { useLogStore } from '../stores/log'
import { useAppStore } from '../stores/app'
import { formatDateTime, getSpecimenAgeStatus } from '../utils/helpers'

const specimenStore = useSpecimenStore()
const categoryStore = useCategoryStore()
const borrowStore = useBorrowStore()
const maintenanceStore = useMaintenanceStore()
const logStore = useLogStore()
const appStore = useAppStore()

const showAgeAlert = ref(false)
const alertSpecimens = ref([])

const ageStatistics = computed(() => {
  const expired = specimenStore.specimens.filter(s => {
    const categoryName = categoryStore.getCategoryName(s.categoryId)
    return getSpecimenAgeStatus(s.collectYear, categoryName) === 'expired'
  }).length
  
  const warning = specimenStore.specimens.filter(s => {
    const categoryName = categoryStore.getCategoryName(s.categoryId)
    return getSpecimenAgeStatus(s.collectYear, categoryName) === 'warning'
  }).length
  
  const normal = specimenStore.specimens.filter(s => {
    const categoryName = categoryStore.getCategoryName(s.categoryId)
    return getSpecimenAgeStatus(s.collectYear, categoryName) === 'normal'
  }).length
  
  return { normal, warning, expired }
})

const checkAgeAlerts = () => {
  const expired = specimenStore.specimens.filter(s => {
    const categoryName = categoryStore.getCategoryName(s.categoryId)
    return getSpecimenAgeStatus(s.collectYear, categoryName) === 'expired'
  })
  
  const warning = specimenStore.specimens.filter(s => {
    const categoryName = categoryStore.getCategoryName(s.categoryId)
    return getSpecimenAgeStatus(s.collectYear, categoryName) === 'warning'
  })
  
  if (expired.length > 0 || warning.length > 0) {
    alertSpecimens.value = [...expired, ...warning].slice(0, 10)
    showAgeAlert.value = true
  }
}

const recentLogs = computed(() => {
  return logStore.operationLogs.slice(0, 10)
})

const getOperationTypeLabel = (type) => {
  const typeInfo = logStore.operationTypes.find(t => t.value === type)
  return typeInfo?.label || type
}

onMounted(() => {
  setTimeout(() => {
    checkAgeAlerts()
  }, 500)
})
</script>