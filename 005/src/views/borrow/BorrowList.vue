<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">借阅记录</h2>
      <div class="flex gap-2">
        <button
          class="btn btn-sm"
          :class="activeTab === 'active' ? 'btn-primary' : 'btn-secondary'"
          @click="activeTab = 'active'"
        >
          借阅中 ({{ borrowStore.activeBorrows.length }})
        </button>
        <button
          class="btn btn-sm"
          :class="activeTab === 'all' ? 'btn-primary' : 'btn-secondary'"
          @click="activeTab = 'all'"
        >
          全部记录
        </button>
      </div>
    </div>

    <div v-if="borrowStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <EmptyState
      v-else-if="displayRecords.length === 0"
      :message="activeTab === 'active' ? '暂无借阅中的记录' : '暂无借阅记录'"
    />

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>标本信息</th>
            <th>借阅数量</th>
            <th>借阅人</th>
            <th>借阅原因</th>
            <th>审批人</th>
            <th>借阅日期</th>
            <th>预计归还</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in displayRecords" :key="record.id">
            <td>
              <div style="font-weight: 600;">{{ record.specimenName }}</div>
              <div style="font-size: 12px; color: #666;">{{ record.specimenCode }}</div>
            </td>
            <td>{{ record.quantity }}</td>
            <td>{{ record.borrower }}</td>
            <td>{{ record.reason }}</td>
            <td>{{ record.approver || '-' }}</td>
            <td>{{ formatDateTime(record.createdAt) }}</td>
            <td>
              <span :class="isOverdue(record) ? 'badge badge-danger' : ''">
                {{ record.expectedReturnDate || '-' }}
              </span>
            </td>
            <td>
              <span :class="['badge', getBorrowStatusColor(record.status)]">
                {{ getBorrowStatusLabel(record.status) }}
                {{ isOverdue(record) ? '(逾期)' : '' }}
              </span>
            </td>
            <td>
              <button
                v-if="record.status === 'borrowing'"
                class="btn btn-success btn-sm"
                @click="openReturnModal(record)"
              >
                归还
              </button>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="returnModalVisible" class="modal-overlay" @click.self="closeReturnModal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">归还标本</h3>
            <button class="modal-close" @click="closeReturnModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">标本名称</label>
              <input
                type="text"
                class="form-input"
                :value="currentRecord?.specimenName"
                disabled
              />
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">借阅数量</label>
                <input
                  type="number"
                  class="form-input"
                  :value="currentRecord?.quantity"
                  disabled
                />
              </div>
              <div class="form-group">
                <label class="form-label">归还数量 <span style="color: #dc3545;">*</span></label>
                <input
                  v-model.number="returnForm.quantity"
                  type="number"
                  class="form-input"
                  :class="{ 'input-error': returnErrors.quantity }"
                  placeholder="请输入归还数量"
                  min="0"
                  :max="currentRecord?.quantity"
                />
                <div v-if="returnErrors.quantity" class="form-error">{{ returnErrors.quantity }}</div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">归还状态</label>
              <select v-model="returnForm.status" class="form-select">
                <option value="normal">正常归还</option>
                <option value="damaged">损坏归还</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">归还备注</label>
              <textarea
                v-model="returnForm.notes"
                class="form-textarea"
                placeholder="请输入归还备注"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeReturnModal">取消</button>
            <button class="btn btn-primary" @click="handleReturn">确认归还</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useBorrowStore } from '../../stores/borrow'
import { useSpecimenStore } from '../../stores/specimen'
import { useAppStore } from '../../stores/app'
import { useLogStore } from '../../stores/log'
import { getBorrowStatusLabel, getBorrowStatusColor, formatDateTime } from '../../utils/helpers'
import { createRule, validateForm } from '../../utils/validators'
import EmptyState from '../../components/EmptyState.vue'

const borrowStore = useBorrowStore()
const specimenStore = useSpecimenStore()
const appStore = useAppStore()
const logStore = useLogStore()

const activeTab = ref('active')

const displayRecords = computed(() => {
  if (activeTab.value === 'active') {
    return borrowStore.activeBorrows
  }
  return borrowStore.borrowRecords
})

const isOverdue = (record) => {
  if (record.status !== 'borrowing' || !record.expectedReturnDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(record.expectedReturnDate) < today
}

const returnModalVisible = ref(false)
const currentRecord = ref(null)
const returnForm = reactive({
  quantity: '',
  status: 'normal',
  notes: ''
})
const returnErrors = reactive({})

const openReturnModal = (record) => {
  currentRecord.value = record
  returnForm.quantity = record.quantity
  returnForm.status = 'normal'
  returnForm.notes = ''
  Object.keys(returnErrors).forEach(key => delete returnErrors[key])
  returnModalVisible.value = true
}

const closeReturnModal = () => {
  returnModalVisible.value = false
  currentRecord.value = null
}

const handleReturn = async () => {
  const rules = {
    quantity: [
      createRule('required', '请输入归还数量'),
      createRule('integer', '请输入有效的数量'),
      createRule('min', 0, '归还数量不能为负数'),
      {
        validate: (v) => {
          if (v > currentRecord.value.quantity) {
            return '归还数量不能超过借阅数量'
          }
          return null
        }
      }
    ]
  }

  const { isValid, errors: validationErrors } = validateForm(returnForm, rules)
  Object.keys(returnErrors).forEach(key => delete returnErrors[key])
  Object.assign(returnErrors, validationErrors)

  if (!isValid) return

  try {
    const specimen = await specimenStore.getSpecimen(currentRecord.value.specimenId)
    const borrowedBefore = borrowStore.getBorrowedQuantity(currentRecord.value.specimenId)
    
    await borrowStore.returnBorrow(
      currentRecord.value.id,
      returnForm.quantity,
      returnForm.notes
    )

    if (specimen) {
      const quantityDiff = currentRecord.value.quantity - returnForm.quantity
      const isLostOrDamaged = quantityDiff > 0 || returnForm.status === 'damaged'
      
      if (isLostOrDamaged) {
        const stockReduction = returnForm.status === 'damaged' 
          ? currentRecord.value.quantity 
          : quantityDiff
        const newStock = specimen.stock - stockReduction
        await specimenStore.updateSpecimenStock(
          currentRecord.value.specimenId,
          Math.max(0, newStock)
        )
        
        await logStore.logOperation('status_change', `标本库存变更: ${specimen.name}`, {
          specimenName: specimen.name,
          oldStock: specimen.stock,
          newStock: Math.max(0, newStock),
          reason: returnForm.status === 'damaged' ? '归还时损坏' : '丢失',
          lostQuantity: quantityDiff
        })
      }

      const remainingBorrows = borrowStore.getActiveBorrowsBySpecimen(currentRecord.value.specimenId)
        .filter(r => r.id !== currentRecord.value.id)

      if (remainingBorrows.length === 0) {
        const targetStatus = returnForm.status === 'damaged' ? 'damaged' : 'normal'
        await specimenStore.updateSpecimenStatus(
          currentRecord.value.specimenId,
          targetStatus
        )

        if (targetStatus !== specimen.status) {
          await logStore.logOperation('status_change', `标本状态变更: ${specimen.name}`, {
            specimenName: specimen.name,
            oldStatus: specimen.status,
            newStatus: targetStatus,
            reason: returnForm.status === 'damaged' ? '归还时损坏' : '全部归还'
          })
        }
      }
    }

    const borrowedAfter = borrowStore.getBorrowedQuantity(currentRecord.value.specimenId)
    
    appStore.success('归还登记成功')
    await logStore.logOperation('specimen_return', `归还了标本: ${currentRecord.value.specimenName}`, {
      specimenName: currentRecord.value.specimenName,
      borrower: currentRecord.value.borrower,
      returnQuantity: returnForm.quantity,
      lostQuantity: currentRecord.value.quantity - returnForm.quantity,
      isDamaged: returnForm.status === 'damaged',
      borrowedBefore: borrowedBefore,
      borrowedAfter: borrowedAfter
    })
    closeReturnModal()
  } catch (error) {
    console.error('归还失败:', error)
    appStore.error('归还登记失败，请重试')
  }
}
</script>