<template>
  <div class="manager-card">
    <div class="card-header">
      <h2>器材信息管理</h2>
      <button class="btn btn-primary" @click="openAddModal">
        + 新增器材
      </button>
    </div>

    <div class="table-wrapper">
      <table class="equipment-table">
        <thead>
          <tr>
            <th>器材名称</th>
            <th>品牌</th>
            <th>分类</th>
            <th>入库年份</th>
            <th>库存</th>
            <th>单价</th>
            <th>完好度</th>
            <th>寿命剩余</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="equipment in displayEquipments" 
            :key="equipment.id"
            :class="{ 'warning-row': isWarning(equipment) }"
          >
            <td>{{ equipment.name }}</td>
            <td>{{ equipment.brand }}</td>
            <td>{{ equipment.categoryName }}</td>
            <td>{{ equipment.stockYear }}</td>
            <td>{{ equipment.stock }}</td>
            <td>¥{{ equipment.price.toFixed(2) }}</td>
            <td>
              <span 
                class="condition-badge"
                :class="getConditionClass(equipment.condition)"
              >
                {{ equipment.condition }}%
              </span>
            </td>
            <td>
              <span 
                class="life-badge"
                :class="getLifeClass(equipment.lifeRemaining)"
              >
                {{ equipment.lifeRemaining }}%
              </span>
            </td>
            <td>
              <span 
                class="status-badge"
                :class="getStatusClass(equipment.status)"
              >
                {{ equipment.status }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn btn-sm btn-secondary" @click="openEditModal(equipment)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(equipment)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="displayEquipments.length === 0" class="empty-state">
        暂无器材数据
      </div>
    </div>

    <BaseModal
      :visible="modalVisible"
      :title="isEdit ? '编辑器材' : '新增器材'"
      width="600px"
      @close="closeModal"
      @confirm="handleSubmit"
    >
      <BaseForm
        ref="formRef"
        :fields="formFields"
        :initialData="formData"
        @submit="handleSubmit"
      />
    </BaseModal>

    <BaseModal
      :visible="confirmVisible"
      title="确认删除"
      width="400px"
      @close="confirmVisible = false"
      @confirm="confirmDelete"
    >
      <p>确定要删除器材「{{ equipmentToDelete?.name }}」吗？</p>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Equipment, FormField, EquipmentStatus } from '@/types'
import { EquipmentStatus as Status } from '@/types'
import { useEquipmentStore } from '@/composables/useEquipmentStore'
import { EQUIPMENT_STATUS_OPTIONS } from '@/utils/constants'
import BaseModal from './BaseModal.vue'
import BaseForm from './BaseForm.vue'

const props = defineProps<{
  equipments: Equipment[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const { categories, addEquipment, updateEquipment, deleteEquipment } = useEquipmentStore()

const displayEquipments = computed(() => props.equipments)

const modalVisible = ref(false)
const confirmVisible = ref(false)
const isEdit = ref(false)
const equipmentToDelete = ref<Equipment | null>(null)

const formData = reactive({
  name: '',
  brand: '',
  categoryId: '',
  stockYear: new Date().getFullYear(),
  stock: 0,
  price: 0,
  condition: 100,
  lifeRemaining: 100,
  status: Status.IN_STOCK
})

const formFields = computed<FormField[]>(() => [
  { key: 'name', label: '器材名称', type: 'text', placeholder: '请输入器材名称', required: true },
  { key: 'brand', label: '品牌', type: 'text', placeholder: '请输入品牌', required: true },
  { 
    key: 'categoryId', 
    label: '分类', 
    type: 'select', 
    required: true,
    options: categories.value.map(c => ({ label: c.name as string, value: c.id }))
  },
  { key: 'stockYear', label: '入库年份', type: 'number', required: true, min: 1990, max: 2100 },
  { key: 'stock', label: '库存数量', type: 'number', required: true, min: 0 },
  { key: 'price', label: '单价(元)', type: 'number', required: true, min: 0 },
  { key: 'condition', label: '完好度(%)', type: 'number', required: true, min: 0, max: 100 },
  { key: 'lifeRemaining', label: '寿命剩余(%)', type: 'number', required: true, min: 0, max: 100 },
  { 
    key: 'status', 
    label: '状态', 
    type: 'select', 
    required: true,
    options: EQUIPMENT_STATUS_OPTIONS
  }
])

function isWarning(eq: Equipment): boolean {
  return eq.lifeRemaining <= 20 || eq.condition <= 60
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

function getStatusClass(status: EquipmentStatus): string {
  const classes: Record<EquipmentStatus, string> = {
    [Status.IN_STOCK]: 'in-stock',
    [Status.IN_USE]: 'in-use',
    [Status.MAINTENANCE]: 'maintenance',
    [Status.SCRAPPED]: 'scrapped'
  }
  return classes[status]
}

function openAddModal() {
  isEdit.value = false
  Object.assign(formData, {
    name: '',
    brand: '',
    categoryId: '',
    stockYear: new Date().getFullYear(),
    stock: 0,
    price: 0,
    condition: 100,
    lifeRemaining: 100,
    status: Status.IN_STOCK
  })
  modalVisible.value = true
}

function openEditModal(equipment: Equipment) {
  isEdit.value = true
  equipmentToDelete.value = equipment
  Object.assign(formData, {
    name: equipment.name,
    brand: equipment.brand,
    categoryId: equipment.categoryId,
    stockYear: equipment.stockYear,
    stock: equipment.stock,
    price: equipment.price,
    condition: equipment.condition,
    lifeRemaining: equipment.lifeRemaining,
    status: equipment.status
  })
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  equipmentToDelete.value = null
}

function handleSubmit(data: Record<string, unknown>) {
  const equipmentData = {
    name: data.name as string,
    brand: data.brand as string,
    categoryId: data.categoryId as string,
    stockYear: data.stockYear as number,
    stock: data.stock as number,
    price: data.price as number,
    condition: data.condition as number,
    lifeRemaining: data.lifeRemaining as number,
    status: data.status as EquipmentStatus
  }

  if (isEdit.value && equipmentToDelete.value) {
    updateEquipment(equipmentToDelete.value.id, equipmentData)
  } else {
    addEquipment(equipmentData)
  }

  closeModal()
  emit('refresh')
}

function handleDelete(equipment: Equipment) {
  equipmentToDelete.value = equipment
  confirmVisible.value = true
}

function confirmDelete() {
  if (equipmentToDelete.value) {
    deleteEquipment(equipmentToDelete.value.id)
  }
  confirmVisible.value = false
  equipmentToDelete.value = null
  emit('refresh')
}
</script>

<style scoped>
.manager-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.table-wrapper {
  overflow-x: auto;
}

.equipment-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.equipment-table th,
.equipment-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.equipment-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.equipment-table tbody tr:hover {
  background-color: #f5f7fa;
}

.equipment-table .warning-row {
  background-color: #fff8e6;
}

.equipment-table .warning-row:hover {
  background-color: #fff3d9;
}

.condition-badge,
.life-badge,
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.condition-badge.good,
.life-badge.good {
  background-color: #f0f9eb;
  color: #67c23a;
}

.condition-badge.normal,
.life-badge.normal {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.condition-badge.bad,
.life-badge.bad {
  background-color: #fef0f0;
  color: #f56c6c;
}

.status-badge.in-stock {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-badge.in-use {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-badge.maintenance {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-badge.scrapped {
  background-color: #fef0f0;
  color: #f56c6c;
}

.actions-cell {
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-secondary {
  background-color: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-secondary:hover {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
  margin-left: 8px;
}

.btn-danger:hover {
  background-color: #f78989;
}
</style>
