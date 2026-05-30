<template>
  <div class="flex items-center">
    <button
      class="w-9 h-9 border border-gray-300 rounded-l-xl flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="modelValue <= min"
      @click="updateValue(modelValue - 1)"
    >
      <Minus class="w-4 h-4" />
    </button>
    <input
      :value="modelValue"
      type="number"
      :min="min"
      :max="max"
      class="w-14 h-9 border-t border-b border-gray-300 text-center text-base font-medium focus:outline-none"
      @change="handleChange"
    />
    <button
      class="w-9 h-9 border border-gray-300 rounded-r-xl flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="modelValue >= max"
      @click="updateValue(modelValue + 1)"
    >
      <Plus class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { Minus, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  min: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: 999
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const updateValue = (val) => {
  const newValue = Math.max(props.min, Math.min(props.max, val))
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const handleChange = (e) => {
  const val = parseInt(e.target.value) || props.min
  updateValue(val)
}
</script>
