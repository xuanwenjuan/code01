<template>
  <form class="base-form" @submit.prevent="handleSubmit">
    <div v-for="field in fields" :key="field.key" class="form-item">
      <label class="form-label">
        {{ field.label }}
        <span v-if="field.required" class="required">*</span>
      </label>
      <input
        v-if="field.type === 'text'"
        v-model="formData[field.key]"
        :placeholder="field.placeholder"
        class="form-input"
        :class="{ error: errors[field.key] }"
      />
      <input
        v-else-if="field.type === 'number'"
        type="number"
        v-model.number="formData[field.key]"
        :placeholder="field.placeholder"
        :min="field.min"
        :max="field.max"
        class="form-input"
        :class="{ error: errors[field.key] }"
      />
      <textarea
        v-else-if="field.type === 'textarea'"
        v-model="formData[field.key]"
        :placeholder="field.placeholder"
        class="form-textarea"
        :class="{ error: errors[field.key] }"
      ></textarea>
      <select
        v-else-if="field.type === 'select'"
        v-model="formData[field.key]"
        class="form-select"
        :class="{ error: errors[field.key] }"
      >
        <option value="">请选择</option>
        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <span v-if="errors[field.key]" class="form-error">{{ errors[field.key] }}</span>
    </div>
    <div class="form-actions">
      <slot name="actions"></slot>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { FormField } from '@/types'

const props = defineProps<{
  fields: FormField[]
  initialData?: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'submit', data: Record<string, unknown>): void
  (e: 'update:modelValue', data: Record<string, unknown>): void
}>()

const formData = reactive<Record<string, unknown>>({})
const errors = reactive<Record<string, string>>({})

function initForm() {
  props.fields.forEach(field => {
    if (props.initialData && props.initialData[field.key] !== undefined) {
      formData[field.key] = props.initialData[field.key]
    } else if (field.type === 'number') {
      formData[field.key] = ''
    } else {
      formData[field.key] = ''
    }
  })
}

function validate(): boolean {
  let isValid = true
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  props.fields.forEach(field => {
    if (field.required) {
      const value = formData[field.key]
      if (value === '' || value === null || value === undefined) {
        errors[field.key] = `${field.label}不能为空`
        isValid = false
      }
    }
  })

  return isValid
}

function handleSubmit() {
  if (validate()) {
    emit('submit', { ...formData })
  }
}

watch(
  () => props.initialData,
  () => {
    initForm()
  },
  { immediate: true }
)

watch(
  formData,
  () => {
    emit('update:modelValue', { ...formData })
  },
  { deep: true }
)

defineExpose({
  validate,
  reset: initForm,
  getFormData: () => ({ ...formData })
})
</script>

<style scoped>
.base-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.required {
  color: #f56c6c;
  margin-left: 2px;
}

.form-input,
.form-select,
.form-textarea {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #409eff;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #f56c6c;
}

.form-error {
  font-size: 12px;
  color: #f56c6c;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
