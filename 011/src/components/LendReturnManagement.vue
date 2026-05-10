<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Stationery, Category, LendFormData, ReturnFormData, ConfirmDialogData } from '@/types'
import { OperationType, ExpiryStatus, ModalActionType } from '@/types'
import {
  categoryStorage,
  stationeryStorage,
  logStorage,
  getExpiryStatus,
  isHighQualityStationery
} from '@/utils/storage'
import { validateLendForm, validateReturnForm, validateExpireForm } from '@/utils/validation'

const props = defineProps<{
  refreshKey: number
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const categories = ref<Category[]>([])
const stationeries = ref<Stationery[]>([])
const activeAction = ref<'lend' | 'return' | 'expire'>('lend')
const successMessage = ref<string>('')

const showConfirmDialog = ref(false)
const pendingStationery = ref<Stationery | null>(null)
const confirmDialogData = ref<ConfirmDialogData>({
  title: '',
  message: '',
  confirmText: '确认',
  actionType: 'lend'
})

const expireOperator = ref('')

const lendForm = ref<LendFormData>({
  stationeryId: '',
  quantity: 1,
  operator: '',
  classUsed: ''
})

const returnForm = ref<ReturnFormData>({
  stationeryId: '',
  quantity: 1,
  operator: ''
})

const formErrors = ref<Record<string, string>>({})

const expiringStationeries = computed(() => {
  return stationeries.value.filter((s) => {
    if (!s.expiryDaysLeft) return false
    return s.expiryDaysLeft <= 30
  })
})

const hasExpiredStationeries = computed(() => {
  return expiringStationeries.value.some((s) =>
    s.expiryDaysLeft !== undefined && s.expiryDaysLeft <= 0
  )
})

const availableStationeries = computed(() => {
  return stationeries.value.filter((s) => s.stockQuantity > 0)
})

const allStationeries = computed(() => {
  return stationeries.value
})

function loadData() {
  categories.value = categoryStorage.getAll()
  stationeries.value = stationeryStorage.getAll()
}

function showSuccess(msg: string) {
  successMessage.value = msg
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

function getStationeryById(stationeryId: string): Stationery | undefined {
  return stationeries.value.find((s) => s.id === stationeryId)
}

function getSelectedLendStationery(): Stationery | undefined {
  if (!lendForm.value.stationeryId) return undefined
  return getStationeryById(lendForm.value.stationeryId)
}

function getSelectedReturnStationery(): Stationery | undefined {
  if (!returnForm.value.stationeryId) return undefined
  return getStationeryById(returnForm.value.stationeryId)
}

function openConfirmDialog(
  stationery: Stationery,
  actionType: ModalActionType,
  title: string,
  message: string,
  confirmText: string
) {
  pendingStationery.value = stationery
  confirmDialogData.value = {
    title,
    message,
    confirmText,
    actionType
  }
  showConfirmDialog.value = true
}

function closeConfirmDialog() {
  showConfirmDialog.value = false
  pendingStationery.value = null
  expireOperator.value = ''
}

function handleLend() {
  formErrors.value = {}

  const validation = validateLendForm(lendForm.value)

  if (!validation.valid) {
    formErrors.value = validation.errors
    return
  }

  const stationery = getSelectedLendStationery()
  if (!stationery) {
    formErrors.value.stationeryId = '请选择有效的文具'
    return
  }

  if (stationery.stockQuantity < lendForm.value.quantity) {
    formErrors.value.quantity = `库存不足，当前库存: ${stationery.stockQuantity}`
    return
  }

  if (isHighQualityStationery(stationery.qualityLevel)) {
    const message = `"${stationery.name}" 是高品质文具（品质等级：${stationery.qualityLevel}）。\n\n请确认领用详情：\n- 领用数量：${lendForm.value.quantity}\n- 领用班级：${lendForm.value.classUsed}\n- 经办人：${lendForm.value.operator}\n\n请确认以下信息无误后继续操作。`

    openConfirmDialog(stationery, 'lend', '🔔 高品质文具领用确认', message, '确认领用')
  } else {
    executeLend(stationery)
  }
}

function executeLend(stationery: Stationery) {
  const previousStock = stationery.stockQuantity
  const changeQuantity = lendForm.value.quantity
  const newStock = previousStock - changeQuantity

  const updateResult = stationeryStorage.updateStock(stationery.id, -changeQuantity)

  if (!updateResult.success) {
    alert('库存更新失败，请检查库存数量')
    return
  }

  logStorage.add({
    operator: lendForm.value.operator,
    operationContent: `向${lendForm.value.classUsed}领用了 ${changeQuantity} 个${stationery.name}`,
    stationeryId: stationery.id,
    stationeryName: stationery.name,
    stockChange: -changeQuantity,
    previousStock,
    newStock,
    operationType: OperationType.领用,
    classUsed: lendForm.value.classUsed,
    categoryId: stationery.categoryId,
    categoryName: stationery.categoryName
  })

  showSuccess(`成功领用 ${changeQuantity} 个 ${stationery.name}`)

  loadData()
  closeConfirmDialog()
  formErrors.value = {}
  lendForm.value = {
    stationeryId: '',
    quantity: 1,
    operator: '',
    classUsed: ''
  }
  emit('updated')
}

function handleReturn() {
  formErrors.value = {}

  const validation = validateReturnForm(returnForm.value)

  if (!validation.valid) {
    formErrors.value = validation.errors
    return
  }

  const stationery = getSelectedReturnStationery()
  if (!stationery) {
    formErrors.value.stationeryId = '请选择有效的文具'
    return
  }

  const previousStock = stationery.stockQuantity
  const changeQuantity = returnForm.value.quantity
  const newStock = previousStock + changeQuantity

  const updateResult = stationeryStorage.updateStock(stationery.id, changeQuantity)

  if (!updateResult.success) {
    alert('库存更新失败')
    return
  }

  logStorage.add({
    operator: returnForm.value.operator,
    operationContent: `归还了 ${changeQuantity} 个${stationery.name}`,
    stationeryId: stationery.id,
    stationeryName: stationery.name,
    stockChange: changeQuantity,
    previousStock,
    newStock,
    operationType: OperationType.归还,
    categoryId: stationery.categoryId,
    categoryName: stationery.categoryName
  })

  showSuccess(`成功归还 ${changeQuantity} 个 ${stationery.name}`)

  loadData()
  formErrors.value = {}
  returnForm.value = {
    stationeryId: '',
    quantity: 1,
    operator: ''
  }
  emit('updated')
}

function handleExpire(stationery: Stationery) {
  if (stationery.stockQuantity === 0) {
    return
  }

  const status = getExpiryStatus(stationery.expiryDaysLeft)
  const statusText = status === ExpiryStatus.已过期 ? '已过期' : `临期（剩余${stationery.expiryDaysLeft}天）`

  const message = `文具名称：${stationery.name}\n品牌：${stationery.brand}\n当前库存：${stationery.stockQuantity}\n保质期状态：${statusText}\n\n过期处理将把该文具的库存数量清零。\n\n请在下方输入经办人姓名确认此操作。`

  openConfirmDialog(stationery, 'expire', '⚠️ 过期处理确认', message, '确认过期处理')
}

function executeExpire(stationery: Stationery) {
  const validation = validateExpireForm(expireOperator.value)

  if (!validation.valid) {
    alert('请输入有效的经办人姓名（至少2个字符）')
    return
  }

  const previousStock = stationery.stockQuantity
  const changeQuantity = previousStock
  const newStock = 0

  const updateResult = stationeryStorage.updateStock(stationery.id, -changeQuantity)

  if (!updateResult.success) {
    alert('过期处理失败，请稍后重试')
    return
  }

  logStorage.add({
    operator: expireOperator.value,
    operationContent: `对${stationery.name}进行过期处理，移除了 ${changeQuantity} 个库存`,
    stationeryId: stationery.id,
    stationeryName: stationery.name,
    stockChange: -changeQuantity,
    previousStock,
    newStock,
    operationType: OperationType.过期处理,
    categoryId: stationery.categoryId,
    categoryName: stationery.categoryName
  })

  showSuccess(`已对 ${stationery.name} 完成过期处理`)

  loadData()
  closeConfirmDialog()
  emit('updated')
}

function onConfirmAction() {
  if (!pendingStationery.value) {
    return
  }

  const actionType = confirmDialogData.value.actionType

  switch (actionType) {
    case 'lend':
      executeLend(pendingStationery.value)
      break
    case 'expire':
      executeExpire(pendingStationery.value)
      break
    default:
      closeConfirmDialog()
  }
}

function getExpiryStatusInfo(daysLeft: number | undefined): { text: string; class: string } {
  const status = getExpiryStatus(daysLeft)

  switch (status) {
    case ExpiryStatus.已过期:
      return { text: '已过期', class: 'badge-danger' }
    case ExpiryStatus.临期:
      return { text: `临期 (${daysLeft}天)`, class: 'badge-warning' }
    case ExpiryStatus.正常:
      if (daysLeft !== undefined) {
        return { text: `正常 (${daysLeft}天)`, class: 'badge-success' }
      }
      return { text: '无', class: 'badge-info' }
    default:
      return { text: '无', class: 'badge-info' }
  }
}

function getConfirmBtnClass(actionType: ModalActionType): string {
  switch (actionType) {
    case 'expire':
      return 'btn-danger'
    case 'lend':
      return 'btn-success'
    default:
      return 'btn-primary'
  }
}

onMounted(() => {
  loadData()
})

watch(
  () => props.refreshKey,
  () => {
    loadData()
  }
)
</script>

<template>
  <div>
    <div v-if="successMessage" class="alert alert-success">
      ✅ {{ successMessage }}
    </div>

    <div
      v-if="expiringStationeries.length > 0"
      class="alert"
      :class="hasExpiredStationeries ? 'alert-danger' : 'alert-warning'"
    >
      ⚠️ 有 {{ expiringStationeries.length }} 个文具需要注意：
      {{
        hasExpiredStationeries
          ? '部分已过期，请及时处理！'
          : '部分即将过期（30天内）！'
      }}
    </div>

    <div class="card">
      <div class="card-title">🔄 文具领用与归还</div>

      <div class="tabs" style="margin-top: 0;">
        <button
          class="tab-button"
          :class="{ active: activeAction === 'lend' }"
          @click="activeAction = 'lend'"
        >
          📤 领用登记
        </button>
        <button
          class="tab-button"
          :class="{ active: activeAction === 'return' }"
          @click="activeAction = 'return'"
        >
          📥 归还入库
        </button>
        <button
          class="tab-button"
          :class="{ active: activeAction === 'expire' }"
          @click="activeAction = 'expire'"
        >
          ⏰ 过期处理
        </button>
      </div>

      <div v-if="activeAction === 'lend'" style="max-width: 600px;">
        <div class="form-group">
          <label class="form-label">选择文具 *</label>
          <select
            class="form-select"
            v-model="lendForm.stationeryId"
            :disabled="availableStationeries.length === 0"
          >
            <option value="">请选择要领用的文具</option>
            <option
              v-for="s in availableStationeries"
              :key="s.id"
              :value="s.id"
            >
              {{ s.name }} (库存: {{ s.stockQuantity }}, {{ s.categoryName }})
              {{ s.isHighQuality ? ' ⭐高品质' : '' }}
            </option>
          </select>
          <div v-if="formErrors.stationeryId" class="form-error">{{ formErrors.stationeryId }}</div>
          <div v-if="availableStationeries.length === 0" class="form-error">
            暂无可用库存的文具
          </div>
        </div>

        <div
          v-if="getSelectedLendStationery()"
          class="card"
          style="background: #f9fafb; padding: 16px; margin-bottom: 16px;"
        >
          <div style="font-weight: 600; margin-bottom: 8px;">
            📋 选中文具信息
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 14px;">
            <div>名称：<strong>{{ getSelectedLendStationery()?.name }}</strong></div>
            <div>品牌：{{ getSelectedLendStationery()?.brand }}</div>
            <div>分类：{{ getSelectedLendStationery()?.categoryName }}</div>
            <div>可用库存：<strong>{{ getSelectedLendStationery()?.stockQuantity }}</strong></div>
            <div>品质等级：{{ getSelectedLendStationery()?.qualityLevel }}</div>
            <div>
              高品质：
              <span v-if="getSelectedLendStationery()?.isHighQuality">⭐ 是（领用需确认）</span>
              <span v-else>否</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">领用数量 *</label>
          <input
            type="number"
            class="form-input"
            v-model.number="lendForm.quantity"
            :min="1"
            :max="getSelectedLendStationery()?.stockQuantity || 999"
            placeholder="1"
          />
          <div v-if="formErrors.quantity" class="form-error">{{ formErrors.quantity }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">领用班级 *</label>
          <input
            type="text"
            class="form-input"
            v-model="lendForm.classUsed"
            placeholder="例如: 高一(1)班、高三(3)班"
          />
          <div v-if="formErrors.classUsed" class="form-error">{{ formErrors.classUsed }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">经办人 *</label>
          <input
            type="text"
            class="form-input"
            v-model="lendForm.operator"
            placeholder="请输入经办人姓名（至少2个字符）"
          />
          <div v-if="formErrors.operator" class="form-error">{{ formErrors.operator }}</div>
        </div>

        <button
          class="btn btn-success"
          @click="handleLend"
          :disabled="availableStationeries.length === 0"
        >
          确认领用
        </button>
      </div>

      <div v-if="activeAction === 'return'" style="max-width: 600px;">
        <div class="form-group">
          <label class="form-label">选择文具 *</label>
          <select
            class="form-select"
            v-model="returnForm.stationeryId"
            :disabled="allStationeries.length === 0"
          >
            <option value="">请选择要归还的文具</option>
            <option
              v-for="s in allStationeries"
              :key="s.id"
              :value="s.id"
            >
              {{ s.name }} (当前库存: {{ s.stockQuantity }}, {{ s.categoryName }})
            </option>
          </select>
          <div v-if="formErrors.stationeryId" class="form-error">{{ formErrors.stationeryId }}</div>
          <div v-if="allStationeries.length === 0" class="form-error">
            暂无文具数据，请先添加文具
          </div>
        </div>

        <div
          v-if="getSelectedReturnStationery()"
          class="card"
          style="background: #f9fafb; padding: 16px; margin-bottom: 16px;"
        >
          <div style="font-weight: 600; margin-bottom: 8px;">
            📋 选中文具信息
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 14px;">
            <div>名称：<strong>{{ getSelectedReturnStationery()?.name }}</strong></div>
            <div>品牌：{{ getSelectedReturnStationery()?.brand }}</div>
            <div>分类：{{ getSelectedReturnStationery()?.categoryName }}</div>
            <div>当前库存：<strong>{{ getSelectedReturnStationery()?.stockQuantity }}</strong></div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">归还数量 *</label>
          <input
            type="number"
            class="form-input"
            v-model.number="returnForm.quantity"
            :min="1"
            :max="999"
            placeholder="1"
          />
          <div v-if="formErrors.quantity" class="form-error">{{ formErrors.quantity }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">经办人 *</label>
          <input
            type="text"
            class="form-input"
            v-model="returnForm.operator"
            placeholder="请输入经办人姓名（至少2个字符）"
          />
          <div v-if="formErrors.operator" class="form-error">{{ formErrors.operator }}</div>
        </div>

        <button
          class="btn btn-primary"
          @click="handleReturn"
          :disabled="allStationeries.length === 0"
        >
          确认归还
        </button>
      </div>

      <div v-if="activeAction === 'expire'">
        <div v-if="expiringStationeries.length === 0" class="empty-state">
          <div class="empty-state-icon">✅</div>
          <p>暂无临期或过期文具</p>
        </div>

        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>文具名称</th>
                <th>品牌</th>
                <th>分类</th>
                <th>库存数量</th>
                <th>保质期状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in expiringStationeries" :key="s.id">
                <td>
                  <strong>{{ s.name }}</strong>
                </td>
                <td>{{ s.brand }}</td>
                <td>{{ s.categoryName }}</td>
                <td>{{ s.stockQuantity }}</td>
                <td>
                  <span
                    class="badge"
                    :class="getExpiryStatusInfo(s.expiryDaysLeft).class"
                  >
                    {{ getExpiryStatusInfo(s.expiryDaysLeft).text }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-danger"
                    @click="handleExpire(s)"
                    :disabled="s.stockQuantity === 0"
                  >
                    {{ s.stockQuantity === 0 ? '已处理' : '过期处理' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showConfirmDialog" class="modal-overlay" @click.self="closeConfirmDialog">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ confirmDialogData.title }}</div>
          <button class="modal-close" @click="closeConfirmDialog">&times;</button>
        </div>

        <div
          style="margin-bottom: 20px; line-height: 1.8; white-space: pre-wrap; background: #f9fafb; padding: 16px; border-radius: 8px;"
        >
          {{ confirmDialogData.message }}
        </div>

        <div v-if="confirmDialogData.actionType === 'expire'" class="form-group">
          <label class="form-label">请输入经办人姓名确认 *</label>
          <input
            type="text"
            class="form-input"
            v-model="expireOperator"
            placeholder="请输入经办人姓名（至少2个字符）"
          />
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeConfirmDialog">取消</button>
          <button
            class="btn"
            :class="getConfirmBtnClass(confirmDialogData.actionType)"
            @click="onConfirmAction"
          >
            {{ confirmDialogData.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
