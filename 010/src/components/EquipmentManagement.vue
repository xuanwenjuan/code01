<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { store } from '../store'
import { validateForm } from '../utils/validation'
import { ConditionLevel as CL, ConditionLevelLabel, ConditionLevelBadge } from '../types'
import type { Equipment, Category, ConditionLevel, EquipmentFilters } from '../types'

const showForm = ref(false)
const editingEquipment = ref<Equipment | null>(null)

const filters = reactive<EquipmentFilters>({
  categoryId: '',
  conditionLevel: '',
  stockMin: '',
  stockMax: '',
  yearMin: '',
  yearMax: '',
  lifespanMin: '',
  lifespanMax: '',
})

const form = reactive({
  name: '',
  model: '',
  categoryId: '',
  purchaseYear: new Date().getFullYear(),
  stockQuantity: 1,
  department: '',
  conditionLevel: CL.GOOD as ConditionLevel,
  remainingLifespanYears: 5,
})

const errors = ref<Record<string, string>>({})

const conditionLevels: { value: ConditionLevel; label: string; badge: string }[] = [
  { value: CL.EXCELLENT, label: ConditionLevelLabel[CL.EXCELLENT], badge: ConditionLevelBadge[CL.EXCELLENT] },
  { value: CL.GOOD, label: ConditionLevelLabel[CL.GOOD], badge: ConditionLevelBadge[CL.GOOD] },
  { value: CL.FAIR, label: ConditionLevelLabel[CL.FAIR], badge: ConditionLevelBadge[CL.FAIR] },
  { value: CL.POOR, label: ConditionLevelLabel[CL.POOR], badge: ConditionLevelBadge[CL.POOR] },
]

const filteredEquipments = computed(() => {
  return store.state.equipments.filter((e) => {
    if (filters.categoryId && e.categoryId !== filters.categoryId) return false
    if (filters.conditionLevel && e.conditionLevel !== filters.conditionLevel) return false
    if (filters.stockMin && e.stockQuantity < Number(filters.stockMin)) return false
    if (filters.stockMax && e.stockQuantity > Number(filters.stockMax)) return false
    if (filters.yearMin && e.purchaseYear < Number(filters.yearMin)) return false
    if (filters.yearMax && e.purchaseYear > Number(filters.yearMax)) return false
    if (filters.lifespanMin && e.remainingLifespanYears < Number(filters.lifespanMin)) return false
    if (filters.lifespanMax && e.remainingLifespanYears > Number(filters.lifespanMax)) return false
    return true
  })
})

function resetFilters() {
  filters.categoryId = ''
  filters.conditionLevel = ''
  filters.stockMin = ''
  filters.stockMax = ''
  filters.yearMin = ''
  filters.yearMax = ''
  filters.lifespanMin = ''
  filters.lifespanMax = ''
}

function getCategoryById(id: string): Category | undefined {
  return store.state.categories.find((c) => c.id === id)
}

function getConditionLabel(level: ConditionLevel): string {
  return ConditionLevelLabel[level] || level
}

function getConditionBadge(level: ConditionLevel): string {
  return ConditionLevelBadge[level] || 'badge-info'
}

function getLifespanStatus(years: number): { text: string; badge: string } {
  if (years <= 1) return { text: '即将过期', badge: 'badge-danger' }
  if (years <= 3) return { text: '即将老化', badge: 'badge-warning' }
  return { text: '正常', badge: 'badge-success' }
}

function openAdd() {
  editingEquipment.value = null
  form.name = ''
  form.model = ''
  form.categoryId = store.state.categories[0]?.id || ''
  form.purchaseYear = new Date().getFullYear()
  form.stockQuantity = 1
  form.department = ''
  form.conditionLevel = CL.GOOD
  form.remainingLifespanYears = 5
  errors.value = {}
  showForm.value = true
}

function openEdit(equipment: Equipment) {
  editingEquipment.value = equipment
  form.name = equipment.name
  form.model = equipment.model
  form.categoryId = equipment.categoryId
  form.purchaseYear = equipment.purchaseYear
  form.stockQuantity = equipment.stockQuantity
  form.department = equipment.department
  form.conditionLevel = equipment.conditionLevel
  form.remainingLifespanYears = equipment.remainingLifespanYears
  errors.value = {}
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingEquipment.value = null
}

function validate() {
  const result = validateForm(
    form,
    {
      name: { required: true, minLength: 2, maxLength: 100 },
      model: { required: true, minLength: 1, maxLength: 100 },
      categoryId: { required: true },
      purchaseYear: { required: true, min: 1990, max: 2100 },
      stockQuantity: { required: true, min: 0 },
      department: { required: true, minLength: 2, maxLength: 100 },
      conditionLevel: { required: true },
      remainingLifespanYears: { required: true, min: 0, max: 50 },
    },
    {
      name: '设备名称',
      model: '型号',
      categoryId: '设备分类',
      purchaseYear: '入库年限',
      stockQuantity: '库存数量',
      department: '使用部门',
      conditionLevel: '完好等级',
      remainingLifespanYears: '使用年限剩余',
    }
  )
  errors.value = result.errors
  return result.isValid
}

function handleSubmit() {
  if (!validate()) return

  const category = getCategoryById(form.categoryId)
  if (!category) {
    store.showWarning('请选择有效的设备分类')
    return
  }

  if (editingEquipment.value) {
    store.updateEquipment(editingEquipment.value.id, {
      name: form.name,
      model: form.model,
      categoryId: form.categoryId,
      categoryCode: category.code,
      purchaseYear: form.purchaseYear,
      stockQuantity: form.stockQuantity,
      department: form.department,
      conditionLevel: form.conditionLevel,
      remainingLifespanYears: form.remainingLifespanYears,
    })
    store.showAlert('设备更新成功')
  } else {
    store.addEquipment({
      name: form.name,
      model: form.model,
      categoryId: form.categoryId,
      categoryCode: category.code,
      purchaseYear: form.purchaseYear,
      stockQuantity: form.stockQuantity,
      department: form.department,
      conditionLevel: form.conditionLevel,
      remainingLifespanYears: form.remainingLifespanYears,
    })
    store.showAlert('设备添加成功')
  }
  closeForm()
}

function handleDelete(equipment: Equipment) {
  store.showConfirm(`确认删除设备"${equipment.name}"吗？`, () => {
    store.deleteEquipment(equipment.id)
    store.showAlert('设备删除成功')
  })
}
</script>

<template>
  <div class="card">
    <div class="header">
      <h2 style="font-size: 20px; font-weight: 600">设备信息管理</h2>
      <button class="btn btn-primary" @click="openAdd">+ 添加设备</button>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <span class="filter-label">设备分类</span>
        <select class="form-select" v-model="filters.categoryId">
          <option value="">全部</option>
          <option v-for="cat in store.state.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <span class="filter-label">完好等级</span>
        <select class="form-select" v-model="filters.conditionLevel">
          <option value="">全部</option>
          <option v-for="level in conditionLevels" :key="level.value" :value="level.value">
            {{ level.label }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <span class="filter-label">库存数量范围</span>
        <div style="display: flex; gap: 4px">
          <input class="form-input" type="number" placeholder="最小" v-model="filters.stockMin" style="width: 70px" />
          <input class="form-input" type="number" placeholder="最大" v-model="filters.stockMax" style="width: 70px" />
        </div>
      </div>
      <div class="filter-item">
        <span class="filter-label">入库年限范围</span>
        <div style="display: flex; gap: 4px">
          <input class="form-input" type="number" placeholder="最早" v-model="filters.yearMin" style="width: 70px" />
          <input class="form-input" type="number" placeholder="最晚" v-model="filters.yearMax" style="width: 70px" />
        </div>
      </div>
      <div class="filter-item">
        <span class="filter-label">剩余年限范围</span>
        <div style="display: flex; gap: 4px">
          <input class="form-input" type="number" placeholder="最小" v-model="filters.lifespanMin" style="width: 70px" />
          <input class="form-input" type="number" placeholder="最大" v-model="filters.lifespanMax" style="width: 70px" />
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary btn-sm" @click="resetFilters">重置筛选</button>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>设备名称</th>
          <th>型号</th>
          <th>分类</th>
          <th>入库年限</th>
          <th>库存数量</th>
          <th>可用数量</th>
          <th>使用部门</th>
          <th>完好等级</th>
          <th>剩余年限</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equipment in filteredEquipments" :key="equipment.id">
          <td>{{ equipment.name }}</td>
          <td>{{ equipment.model }}</td>
          <td>{{ getCategoryById(equipment.categoryId)?.name || '-' }}</td>
          <td>{{ equipment.purchaseYear }}</td>
          <td>{{ equipment.stockQuantity }}</td>
          <td>
            <span :style="{ fontWeight: equipment.availableQuantity === 0 ? 'bold' : 'normal', color: equipment.availableQuantity === 0 ? 'var(--danger-color)' : 'inherit' }">
              {{ equipment.availableQuantity }}
            </span>
          </td>
          <td>{{ equipment.department }}</td>
          <td>
            <span class="badge" :class="getConditionBadge(equipment.conditionLevel)">
              {{ getConditionLabel(equipment.conditionLevel) }}
            </span>
          </td>
          <td>
            <span class="badge" :class="getLifespanStatus(equipment.remainingLifespanYears).badge">
              {{ equipment.remainingLifespanYears }}年
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-primary" @click="openEdit(equipment)">编辑</button>
            <button class="btn btn-sm btn-danger" style="margin-left: 8px" @click="handleDelete(equipment)">删除</button>
          </td>
        </tr>
        <tr v-if="filteredEquipments.length === 0">
          <td colspan="10">
            <div class="empty-state">{{ store.state.equipments.length === 0 ? '暂无设备数据，请先添加设备' : '没有符合条件的设备' }}</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <div class="modal-title">{{ editingEquipment ? '编辑设备' : '添加设备' }}</div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">设备名称 <span style="color: var(--danger-color)">*</span></label>
            <input class="form-input" :class="{ 'input-error': errors.name }" v-model="form.name" placeholder="请输入设备名称" />
            <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">设备型号 <span style="color: var(--danger-color)">*</span></label>
            <input class="form-input" :class="{ 'input-error': errors.model }" v-model="form.model" placeholder="请输入设备型号" />
            <div v-if="errors.model" class="form-error">{{ errors.model }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">设备分类 <span style="color: var(--danger-color)">*</span></label>
            <select class="form-select" :class="{ 'input-error': errors.categoryId }" v-model="form.categoryId">
              <option v-for="cat in store.state.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <div v-if="errors.categoryId" class="form-error">{{ errors.categoryId }}</div>
          </div>
          <div style="display: flex; gap: 16px">
            <div class="form-group" style="flex: 1">
              <label class="form-label">入库年限 <span style="color: var(--danger-color)">*</span></label>
              <input class="form-input" :class="{ 'input-error': errors.purchaseYear }" type="number" v-model.number="form.purchaseYear" />
              <div v-if="errors.purchaseYear" class="form-error">{{ errors.purchaseYear }}</div>
            </div>
            <div class="form-group" style="flex: 1">
              <label class="form-label">库存数量 <span style="color: var(--danger-color)">*</span></label>
              <input class="form-input" :class="{ 'input-error': errors.stockQuantity }" type="number" v-model.number="form.stockQuantity" />
              <div v-if="errors.stockQuantity" class="form-error">{{ errors.stockQuantity }}</div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">使用部门 <span style="color: var(--danger-color)">*</span></label>
            <input class="form-input" :class="{ 'input-error': errors.department }" v-model="form.department" placeholder="请输入使用部门" />
            <div v-if="errors.department" class="form-error">{{ errors.department }}</div>
          </div>
          <div style="display: flex; gap: 16px">
            <div class="form-group" style="flex: 1">
              <label class="form-label">完好等级 <span style="color: var(--danger-color)">*</span></label>
              <select class="form-select" :class="{ 'input-error': errors.conditionLevel }" v-model="form.conditionLevel">
                <option v-for="level in conditionLevels" :key="level.value" :value="level.value">
                  {{ level.label }}
                </option>
              </select>
              <div v-if="errors.conditionLevel" class="form-error">{{ errors.conditionLevel }}</div>
            </div>
            <div class="form-group" style="flex: 1">
              <label class="form-label">使用年限剩余(年) <span style="color: var(--danger-color)">*</span></label>
              <input class="form-input" :class="{ 'input-error': errors.remainingLifespanYears }" type="number" v-model.number="form.remainingLifespanYears" />
              <div v-if="errors.remainingLifespanYears" class="form-error">{{ errors.remainingLifespanYears }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeForm">取消</button>
          <button class="btn btn-primary" @click="handleSubmit">{{ editingEquipment ? '更新' : '添加' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
