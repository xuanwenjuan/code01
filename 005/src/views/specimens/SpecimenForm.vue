<template>
  <div class="specimen-form">
    <div class="grid-2">
      <div class="form-group">
        <label class="form-label">标本名称 <span style="color: #dc3545;">*</span></label>
        <input
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ 'input-error': errors.name }"
          placeholder="请输入标本名称"
        />
        <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">科属分类 <span style="color: #dc3545;">*</span></label>
        <select
          v-model="form.categoryId"
          class="form-select"
          :class="{ 'input-error': errors.categoryId }"
        >
          <option value="">请选择科属分类</option>
          <option
            v-for="cat in categoryStore.categoryOptions"
            :key="cat.value"
            :value="cat.value"
          >
            {{ cat.label }}
          </option>
        </select>
        <div v-if="errors.categoryId" class="form-error">{{ errors.categoryId }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">采集产地</label>
        <input
          v-model="form.origin"
          type="text"
          class="form-input"
          placeholder="请输入采集产地"
        />
      </div>

      <div class="form-group">
        <label class="form-label">采集年限 <span style="color: #dc3545;">*</span></label>
        <input
          v-model.number="form.collectYear"
          type="number"
          class="form-input"
          :class="{ 'input-error': errors.collectYear }"
          placeholder="请输入采集年份"
          min="1900"
          :max="currentYear"
        />
        <div v-if="errors.collectYear" class="form-error">{{ errors.collectYear }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">库存数量 <span style="color: #dc3545;">*</span></label>
        <input
          v-model.number="form.stock"
          type="number"
          class="form-input"
          :class="{ 'input-error': errors.stock }"
          placeholder="请输入库存数量"
          min="0"
        />
        <div v-if="errors.stock" class="form-error">{{ errors.stock }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">存放柜位</label>
        <input
          v-model="form.storage"
          type="text"
          class="form-input"
          placeholder="请输入存放柜位"
        />
      </div>

      <div class="form-group">
        <label class="form-label">珍稀等级 <span style="color: #dc3545;">*</span></label>
        <select
          v-model.number="form.rareLevel"
          class="form-select"
          :class="{ 'input-error': errors.rareLevel }"
        >
          <option value="">请选择珍稀等级</option>
          <option :value="1">普通</option>
          <option :value="2">珍贵</option>
          <option :value="3">珍稀</option>
          <option :value="4">特级珍稀</option>
        </select>
        <div v-if="errors.rareLevel" class="form-error">{{ errors.rareLevel }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">标本状态</label>
        <select v-model="form.status" class="form-select">
          <option value="normal">正常</option>
          <option value="maintenance">养护中</option>
          <option value="damaged">破损</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">炮制工艺</label>
      <textarea
        v-model="form.processing"
        class="form-textarea"
        placeholder="请输入炮制工艺"
        rows="2"
      ></textarea>
    </div>

    <div class="form-group">
      <label class="form-label">备注说明</label>
      <textarea
        v-model="form.notes"
        class="form-textarea"
        placeholder="请输入备注说明"
        rows="2"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { createRule, validateForm } from '../../utils/validators'
import { useCategoryStore } from '../../stores/category'

const categoryStore = useCategoryStore()
const currentYear = new Date().getFullYear()

const props = defineProps({
  specimen: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'validate'])

const form = reactive({
  name: '',
  categoryId: '',
  origin: '',
  collectYear: '',
  stock: '',
  storage: '',
  rareLevel: '',
  status: 'normal',
  processing: '',
  notes: ''
})

const errors = reactive({})

const rules = {
  name: [
    createRule('required', '标本名称不能为空'),
    createRule('maxLength', 100, '标本名称最多100个字符')
  ],
  categoryId: [
    createRule('required', '请选择科属分类')
  ],
  collectYear: [
    createRule('required', '采集年份不能为空'),
    createRule('integer', '请输入有效的年份'),
    createRule('min', 1900, '年份不能早于1900年'),
    createRule('max', currentYear, `年份不能晚于${currentYear}年`)
  ],
  stock: [
    createRule('required', '库存数量不能为空'),
    createRule('integer', '请输入有效的数量'),
    createRule('min', 0, '库存数量不能为负数')
  ],
  rareLevel: [
    createRule('required', '请选择珍稀等级')
  ]
}

watch(
  () => props.specimen,
  (newVal) => {
    if (newVal) {
      form.name = newVal.name || ''
      form.categoryId = newVal.categoryId || ''
      form.origin = newVal.origin || ''
      form.collectYear = newVal.collectYear || ''
      form.stock = newVal.stock || ''
      form.storage = newVal.storage || ''
      form.rareLevel = newVal.rareLevel || ''
      form.status = newVal.status || 'normal'
      form.processing = newVal.processing || ''
      form.notes = newVal.notes || ''
    } else {
      Object.keys(form).forEach(key => {
        form[key] = key === 'status' ? 'normal' : (['collectYear', 'stock', 'rareLevel', 'categoryId'].includes(key) ? '' : '')
      })
    }
    Object.keys(errors).forEach(key => delete errors[key])
  },
  { immediate: true }
)

const validate = () => {
  const { isValid, errors: validationErrors } = validateForm(form, rules)
  Object.keys(errors).forEach(key => delete errors[key])
  Object.assign(errors, validationErrors)
  emit('validate', isValid)
  return isValid
}

const getFormData = () => ({
  ...form,
  categoryId: Number(form.categoryId),
  collectYear: Number(form.collectYear),
  stock: Number(form.stock),
  rareLevel: Number(form.rareLevel)
})

defineExpose({
  validate,
  getFormData
})
</script>