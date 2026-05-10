<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">标本借阅</h2>
    </div>

    <div class="grid-2">
      <div class="form-group">
        <label class="form-label">选择标本 <span style="color: #dc3545;">*</span></label>
        <select
          v-model="form.specimenId"
          class="form-select"
          :class="{ 'input-error': errors.specimenId }"
        >
          <option value="">请选择要借阅的标本</option>
          <optgroup
            v-for="cat in categoryStore.categories"
            :key="cat.id"
            :label="cat.name"
          >
            <option
              v-for="specimen in getSpecimensByCategory(cat.id)"
              :key="specimen.id"
              :value="specimen.id"
            >
              {{ specimen.name }} (编号: {{ specimen.code }}, 库存: {{ getAvailableStock(specimen.id) }})
            </option>
          </optgroup>
        </select>
        <div v-if="errors.specimenId" class="form-error">{{ errors.specimenId }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">借阅数量 <span style="color: #dc3545;">*</span></label>
        <input
          v-model.number="form.quantity"
          type="number"
          class="form-input"
          :class="{ 'input-error': errors.quantity }"
          placeholder="请输入借阅数量"
          min="1"
          :max="maxQuantity"
        />
        <div v-if="errors.quantity" class="form-error">{{ errors.quantity }}</div>
        <div v-if="maxQuantity > 0 && selectedSpecimen" class="mt-1" style="font-size: 12px; color: #666;">
          可借数量: {{ maxQuantity }}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">借阅人 <span style="color: #dc3545;">*</span></label>
        <input
          v-model="form.borrower"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.borrower }"
          placeholder="请输入借阅人姓名"
        />
        <div v-if="errors.borrower" class="form-error">{{ errors.borrower }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">预计归还日期</label>
        <input
          v-model="form.expectedReturnDate"
          type="date"
          class="form-input"
          :min="minDate"
        />
      </div>

      <div class="form-group">
        <label class="form-label">借阅原因</label>
        <select v-model="form.reason" class="form-select">
          <option value="教学研究">教学研究</option>
          <option value="展览展示">展览展示</option>
          <option value="学术交流">学术交流</option>
          <option value="其他">其他</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">审批人</label>
        <input
          v-model="form.approver"
          type="text"
          class="form-input"
          placeholder="请输入审批人姓名"
        />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">备注</label>
      <textarea
        v-model="form.notes"
        class="form-textarea"
        placeholder="请输入备注信息"
        rows="2"
      ></textarea>
    </div>

    <div v-if="selectedSpecimen && selectedSpecimen.rareLevel >= 3" class="mt-3" style="padding: 15px; background: #fff3cd; border-radius: 8px;">
      <div style="font-weight: 600; color: #856404; margin-bottom: 8px;">
        ⚠️ 高等级珍稀标本借阅管控
      </div>
      <div style="font-size: 13px; color: #856404;">
        该标本为 <strong>{{ getRareLevelLabel(selectedSpecimen.rareLevel) }}</strong> 等级，
        借阅需由 <strong>馆长或分管领导审批</strong>，并记录详细的借阅用途和归还承诺。
        单次借阅数量不得超过库存的 20%。
      </div>
    </div>

    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary" @click="handleBorrow">
        确认借阅
      </button>
      <button class="btn btn-secondary" @click="resetForm">
        重置
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useSpecimenStore } from '../../stores/specimen'
import { useCategoryStore } from '../../stores/category'
import { useBorrowStore } from '../../stores/borrow'
import { useAppStore } from '../../stores/app'
import { useLogStore } from '../../stores/log'
import { createRule, validateForm } from '../../utils/validators'
import { getRareLevelLabel, formatDate } from '../../utils/helpers'

const specimenStore = useSpecimenStore()
const categoryStore = useCategoryStore()
const borrowStore = useBorrowStore()
const appStore = useAppStore()
const logStore = useLogStore()

const today = new Date()
const minDate = formatDate(today)

const form = reactive({
  specimenId: '',
  quantity: '',
  borrower: '',
  expectedReturnDate: '',
  reason: '教学研究',
  approver: '',
  notes: ''
})

const errors = reactive({})

const selectedSpecimen = computed(() => {
  if (!form.specimenId) return null
  return specimenStore.specimens.find(s => s.id === Number(form.specimenId))
})

const maxQuantity = computed(() => {
  if (!selectedSpecimen.value) return 0
  const stock = selectedSpecimen.value.stock
  const borrowed = borrowStore.getBorrowedQuantity(selectedSpecimen.value.id)
  const available = stock - borrowed

  if (selectedSpecimen.value.rareLevel >= 3) {
    return Math.max(1, Math.floor(stock * 0.2))
  }
  return available
})

const getSpecimensByCategory = (categoryId) => {
  return specimenStore.specimens.filter(s => s.categoryId === categoryId && s.status === 'normal')
}

const getAvailableStock = (specimenId) => {
  const specimen = specimenStore.specimens.find(s => s.id === specimenId)
  if (!specimen) return 0
  const borrowed = borrowStore.getBorrowedQuantity(specimenId)
  return specimen.stock - borrowed
}

const resetForm = () => {
  form.specimenId = ''
  form.quantity = ''
  form.borrower = ''
  form.expectedReturnDate = ''
  form.reason = '教学研究'
  form.approver = ''
  form.notes = ''
  Object.keys(errors).forEach(key => delete errors[key])
}

const handleBorrow = async () => {
  const rules = {
    specimenId: [createRule('required', '请选择要借阅的标本')],
    quantity: [
      createRule('required', '请输入借阅数量'),
      createRule('integer', '请输入有效的数量'),
      createRule('min', 1, '借阅数量至少为1'),
      {
        validate: (v) => {
          if (v > maxQuantity.value) {
            return `借阅数量不能超过可借数量: ${maxQuantity.value}`
          }
          return null
        }
      }
    ],
    borrower: [
      createRule('required', '请输入借阅人姓名'),
      createRule('maxLength', 50, '借阅人姓名最多50个字符')
    ]
  }

  const { isValid, errors: validationErrors } = validateForm(form, rules)
  Object.keys(errors).forEach(key => delete errors[key])
  Object.assign(errors, validationErrors)

  if (!isValid) return

  if (selectedSpecimen.value.rareLevel >= 3 && !form.approver) {
    appStore.error('高等级珍稀标本借阅必须填写审批人')
    return
  }

  if (selectedSpecimen.value.status !== 'normal') {
    const statusLabels = {
      borrowed: '已借出',
      maintenance: '养护中',
      damaged: '破损'
    }
    appStore.error(`标本当前状态为"${statusLabels[selectedSpecimen.value.status] || selectedSpecimen.value.status}"，无法借出`)
    return
  }

  try {
    const borrowed = borrowStore.getBorrowedQuantity(Number(form.specimenId))
    const available = selectedSpecimen.value.stock - borrowed
    const remainingAvailable = available - Number(form.quantity)
    const totalBorrowedAfter = borrowed + Number(form.quantity)
    
    await borrowStore.addBorrowRecord({
      specimenId: Number(form.specimenId),
      specimenName: selectedSpecimen.value.name,
      specimenCode: selectedSpecimen.value.code,
      quantity: Number(form.quantity),
      borrower: form.borrower,
      expectedReturnDate: form.expectedReturnDate || null,
      reason: form.reason,
      approver: form.approver,
      notes: form.notes,
      previousStock: selectedSpecimen.value.stock
    })

    if (totalBorrowedAfter >= selectedSpecimen.value.stock) {
      await specimenStore.updateSpecimenStatus(Number(form.specimenId), 'borrowed')
      await logStore.logOperation('status_change', `标本状态变更为已借出: ${selectedSpecimen.value.name}`, {
        specimenName: selectedSpecimen.value.name,
        oldStatus: selectedSpecimen.value.status,
        newStatus: 'borrowed'
      })
    }

    appStore.success('借阅登记成功')
    await logStore.logOperation('specimen_borrow', `借阅了标本: ${selectedSpecimen.value.name}`, {
      specimenName: selectedSpecimen.value.name,
      borrower: form.borrower,
      quantity: form.quantity,
      totalStock: selectedSpecimen.value.stock,
      borrowedBefore: borrowed,
      borrowedAfter: totalBorrowedAfter,
      availableBefore: available,
      availableAfter: remainingAvailable
    })
    resetForm()
  } catch (error) {
    console.error('借阅失败:', error)
    appStore.error('借阅登记失败，请重试')
  }
}
</script>