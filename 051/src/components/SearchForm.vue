<template>
  <el-form :inline="true" :model="filters" class="search-form">
    <slot />
    <el-form-item>
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      <el-button :icon="Refresh" @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { Search, Refresh } from '@element-plus/icons-vue'

interface Props {
  filters: Record<string, unknown>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
}>()

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped lang="scss">
.search-form {
  margin-bottom: 16px;

  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
