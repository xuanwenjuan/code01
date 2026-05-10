<script setup lang="ts">
import { ref, reactive } from 'vue'
import { store } from '../store'
import { validateForm } from '../utils/validation'
import {
  OperationType as OT,
  OperationTypeLabel,
  ConditionLevel as CL,
  ConditionLevelLabel,
} from '../types'
import type { Equipment, OperationType, ConditionLevel } from '../types'

const showForm = ref(false)
const operationType = ref<OperationType>(OT.RECEIVE)
const selectedEquipment = ref<Equipment | null>(null)

const form = reactive({
  equipmentId: '',
  quantity: 1,
  operator: '',
  remarks: '',
})

const errors = ref<Record<string, string>>({})

const operationTypeOptions: { value: OperationType; label: string; btnClass: string }[] = [
  { value: OT.RECEIVE, label: `${OperationTypeLabel[OT.RECEIVE]}登记`, btnClass: 'btn-primary' },
  { value: OT.RETURN, label: `${OperationTypeLabel[OT.RETURN]}入库`, btnClass: 'btn-success' },
  { value: OT.SCRAP, label: `${OperationTypeLabel[OT.SCRAP]}处理`, btnClass: 'btn-danger' },
]

const conditionLevels: { value: ConditionLevel; label: string }[] = [
  { value: CL.EXCELLENT, label: ConditionLevelLabel[CL.EXCELLENT] },
  { value: CL.GOOD, label: ConditionLevelLabel[CL.GOOD] },
  { value: CL.FAIR, label: ConditionLevelLabel[CL.FAIR] },
  { value: CL.POOR, label: ConditionLevelLabel[CL.POOR] },
]

function getOperationLabel(type: OperationType): string {
  return operationTypeOptions.find((o) => o.value === type)?.label || type
}

function openOperation(type: OperationType, equipment?: Equipment) {
  operationType.value = type
  selectedEquipment.value = equipment || null
  form.equipmentId = equipment?.id || ''
  form.quantity = 1
  form.operator = ''
  form.remarks = ''
  errors.value = {}
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  selectedEquipment.value = null
}

function getEquipmentById(id: string): Equipment | undefined {
  return store.state.equipments.find((e) => e.id === id)
}

function getMaxQuantity(): number {
  const equipment = getEquipmentById(form.equipmentId)
  if (!equipment) return 0
  if (operationType.value === OT.RETURN) {
    return equipment.stockQuantity - equipment.availableQuantity
  }
  return equipment.availableQuantity
}

function validate(): boolean {
  const result = validateForm(
    form,
    {
      equipmentId: { required: true },
      quantity: { required: true, min: 1 },
      operator: { required: true, minLength: 2, maxLength: 50 },
      remarks: { maxLength: 200 },
    },
    {
      equipmentId: '设备',
      quantity: '数量',
      operator: '经办人',
      remarks: '备注',
    }
  )

  if (result.isValid) {
    const maxQty = getMaxQuantity()
    if (form.quantity > maxQty) {
      result.isValid = false
      result.errors.quantity = `数量不能超过${maxQty}`
    }
  }

  errors.value = result.errors
  return result.isValid
}

function handleSubmit() {
  if (!validate()) return

  const equipment = getEquipmentById(form.equipmentId)
  if (!equipment) {
    store.showWarning('请选择设备')
    return
  }

  if (operationType.value === OT.RECEIVE && equipment.conditionLevel === CL.EXCELLENT) {
    store.showConfirm(
      `设备"${equipment.name}"完好等级为优秀，确认领用${form.quantity}台吗？`,
      () => {
        doSubmit()
      }
    )
    return
  }

  if (operationType.value === OT.SCRAP) {
    store.showConfirm(`确认报废${form.quantity}台"${equipment.name}"吗？`, () => {
      doSubmit()
    })
    return
  }

  doSubmit()
}

function doSubmit() {
  const success = store.performOperation(
    form.equipmentId,
    operationType.value,
    form.operator,
    form.quantity,
    form.remarks
  )

  if (success) {
    store.showAlert(`${getOperationLabel(operationType.value)}成功`)
    closeForm()
  }
}
</script>

<template>
  <div class="card">
    <div class="header">
      <h2 style="font-size: 20px; font-weight: 600">设备领用与归还</h2>
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <button
          class="btn"
          :class="operationTypeOptions.find((o) => o.value === OT.RECEIVE)?.btnClass"
          @click="openOperation(OT.RECEIVE)"
        >
          + 领用登记
        </button>
        <button
          class="btn"
          :class="operationTypeOptions.find((o) => o.value === OT.RETURN)?.btnClass"
          @click="openOperation(OT.RETURN)"
        >
          + 归还入库
        </button>
        <button
          class="btn"
          :class="operationTypeOptions.find((o) => o.value === OT.SCRAP)?.btnClass"
          @click="openOperation(OT.SCRAP)"
        >
          + 报废处理
        </button>
      </div>
    </div>

    <div v-if="store.warningEquipments.length > 0" class="warning-banner">
      <div class="warning-banner-title">⚠ 老化预警提醒</div>
      <div class="warning-banner-content">
        有 {{ store.warningEquipments.length }} 台设备需要关注（剩余年限不足或状态不佳），请及时处理。
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>设备名称</th>
          <th>型号</th>
          <th>总库存</th>
          <th>可用数量</th>
          <th>使用部门</th>
          <th>完好等级</th>
          <th>剩余年限</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equipment in store.state.equipments" :key="equipment.id">
          <td>{{ equipment.name }}</td>
          <td>{{ equipment.model }}</td>
          <td>{{ equipment.stockQuantity }}</td>
          <td>
            <span
              :style="{
                fontWeight: equipment.availableQuantity === 0 ? 'bold' : 'normal',
                color: equipment.availableQuantity === 0 ? 'var(--danger-color)' : 'inherit',
              }"
            >
              {{ equipment.availableQuantity }}
            </span>
          </td>
          <td>{{ equipment.department }}</td>
          <td>{{ conditionLevels.find((l) => l.value === equipment.conditionLevel)?.label }}</td>
          <td>{{ equipment.remainingLifespanYears }}年</td>
          <td>
            <button
              v-if="equipment.availableQuantity > 0"
              class="btn btn-sm btn-primary"
              @click="openOperation(OT.RECEIVE, equipment)"
            >
              领用
            </button>
            <button
              v-if="equipment.availableQuantity < equipment.stockQuantity"
              class="btn btn-sm btn-success"
              style="margin-left: 8px"
              @click="openOperation(OT.RETURN, equipment)"
            >
              归还
            </button>
            <button
              v-if="equipment.availableQuantity > 0"
              class="btn btn-sm btn-danger"
              style="margin-left: 8px"
              @click="openOperation(OT.SCRAP, equipment)"
            >
              报废
            </button>
          </td>
        </tr>
        <tr v-if="store.state.equipments.length === 0">
          <td colspan="8">
            <div class="empty-state">暂无设备数据</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <div class="modal-title">
          {{ getOperationLabel(operationType) }}
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">选择设备 <span style="color: var(--danger-color)">*</span></label>
            <select
              class="form-select"
              :class="{ 'input-error': errors.equipmentId }"
              v-model="form.equipmentId"
              :disabled="!!selectedEquipment"
            >
              <option value="">请选择设备</option>
              <template v-if="selectedEquipment">
                <option :value="selectedEquipment.id">
                  {{ selectedEquipment.name }} ({{ selectedEquipment.model }})
                </option>
              </template>
              <template v-else>
                <option v-for="eq in store.state.equipments" :key="eq.id" :value="eq.id">
                  {{ eq.name }} ({{ eq.model }})
                </option>
              </template>
            </select>
            <div v-if="errors.equipmentId" class="form-error">{{ errors.equipmentId }}</div>
          </div>
          <div v-if="form.equipmentId && getEquipmentById(form.equipmentId)" class="form-group" style="background: #f9fafb; padding: 12px; border-radius: 6px">
            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px">设备信息</div>
            <div style="display: flex; gap: 16px; font-size: 13px">
              <span>总库存: {{ getEquipmentById(form.equipmentId)?.stockQuantity }}</span>
              <span>可用: {{ getEquipmentById(form.equipmentId)?.availableQuantity }}</span>
              <span>可操作数量: {{ getMaxQuantity() }}</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">
              {{ operationType === OT.RETURN ? '归还' : operationType === OT.SCRAP ? '报废' : '领用' }}数量
              <span style="color: var(--danger-color)">*</span>
            </label>
            <input
              class="form-input"
              :class="{ 'input-error': errors.quantity }"
              type="number"
              :min="1"
              :max="getMaxQuantity()"
              v-model.number="form.quantity"
            />
            <div v-if="errors.quantity" class="form-error">{{ errors.quantity }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">经办人 <span style="color: var(--danger-color)">*</span></label>
            <input
              class="form-input"
              :class="{ 'input-error': errors.operator }"
              v-model="form.operator"
              placeholder="请输入经办人姓名"
            />
            <div v-if="errors.operator" class="form-error">{{ errors.operator }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea
              class="form-textarea"
              :class="{ 'input-error': errors.remarks }"
              v-model="form.remarks"
              rows="3"
              placeholder="请输入备注信息（可选）"
            ></textarea>
            <div v-if="errors.remarks" class="form-error">{{ errors.remarks }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeForm">取消</button>
          <button
            class="btn"
            :class="operationTypeOptions.find((o) => o.value === operationType)?.btnClass"
            @click="handleSubmit"
          >
            确认{{ getOperationLabel(operationType).replace('登记', '').replace('入库', '').replace('处理', '') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
