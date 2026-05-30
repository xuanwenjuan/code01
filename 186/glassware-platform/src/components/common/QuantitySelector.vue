<template>
  <div class="quantity-selector">
    <div v-if="quickQuantities && quickQuantities.length > 0" class="quick-buttons">
      <el-button
        v-for="num in quickQuantities"
        :key="num"
        size="small"
        :type="modelValue === num ? 'primary' : 'default'"
        @click="updateValue(num)"
      >
        {{ num }}
      </el-button>
    </div>
    <el-input-number
      v-model="internalValue"
      :min="min"
      :max="max"
      :step="step"
      :size="size"
      :disabled="disabled"
      :controls="controls"
      @change="handleChange"
    />
    <span v-if="showStock && max > 0" class="stock-info">
      库存 {{ max }} 件
    </span>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

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
  },
  step: {
    type: Number,
    default: 1
  },
  size: {
    type: String,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  controls: {
    type: Boolean,
    default: true
  },
  showStock: {
    type: Boolean,
    default: false
  },
  quickQuantities: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  internalValue.value = val
})

const updateValue = (val) => {
  if (val >= props.min && val <= props.max) {
    internalValue.value = val
    emit('update:modelValue', val)
    emit('change', val)
  }
}

const handleChange = (val) => {
  if (val > props.max) {
    internalValue.value = props.max
    emit('update:modelValue', props.max)
    emit('change', props.max)
  } else if (val < props.min) {
    internalValue.value = props.min
    emit('update:modelValue', props.min)
    emit('change', props.min)
  } else {
    emit('update:modelValue', val)
    emit('change', val)
  }
}
</script>

<style lang="scss" scoped>
.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .quick-buttons {
    display: flex;
    gap: 8px;
  }

  .stock-info {
    font-size: 13px;
    color: #909399;
  }
}
</style>
