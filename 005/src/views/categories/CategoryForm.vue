<template>
  <div class="category-form">
    <div class="form-group">
      <label class="form-label">分类名称 <span style="color: #dc3545;">*</span></label>
      <input
        v-model="form.name"
        type="text"
        class="form-input"
        :class="{ 'input-error': errors.name }"
        placeholder="请输入分类名称"
      />
      <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
    </div>
    <div class="form-group">
      <label class="form-label">分类描述</label>
      <textarea
        v-model="form.description"
        class="form-textarea"
        placeholder="请输入分类描述"
        rows="3"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { createRule, validateForm } from '../utils/validators'

const props = defineProps({
  category: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'validate'])

const form = reactive({
  name: '',
  description: ''
})

const errors = reactive({})

const rules = {
  name: [
    createRule('required', '分类名称不能为空'),
    createRule('maxLength', 50, '分类名称最多50个字符')
  ]
}

watch(
  () => props.category,
  (newVal) => {
    if (newVal) {
      form.name = newVal.name || ''
      form.description = newVal.description || ''
    } else {
      form.name = ''
      form.description = ''
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

const getFormData = () => ({ ...form })

defineExpose({
  validate,
  getFormData
})
</script>