<template>
  <div class="form-field" :class="{ 'has-error': error }">
    <label v-if="label" class="form-label">
      <span v-if="required" class="required">*</span>
      {{ label }}
    </label>
    <slot :hasError="!!error" :errorMessage="error"></slot>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  required?: boolean
  error?: string
}>()
</script>

<style scoped>
.form-field {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
  margin-right: 2px;
}

.error-message {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.has-error input,
.has-error select,
.has-error textarea {
  border-color: #ef4444 !important;
}

.has-error input:focus,
.has-error select:focus,
.has-error textarea:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}
</style>