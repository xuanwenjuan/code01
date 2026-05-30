<script setup lang="ts">
import { reactive } from 'vue'

interface Props {
  modelValue: Record<string, any>
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'search'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localModel = reactive<Record<string, any>>({})

Object.assign(localModel, props.modelValue)

const handleSearch = () => {
  emit('update:modelValue', { ...localModel })
  emit('search')
}

const handleReset = () => {
  Object.keys(localModel).forEach(key => {
    localModel[key] = ''
  })
  emit('update:modelValue', { ...localModel })
  emit('reset')
}
</script>

<template>
  <el-form inline class="search-form">
    <slot name="form" :model="localModel">
      <slot />
    </slot>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.search-form {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
