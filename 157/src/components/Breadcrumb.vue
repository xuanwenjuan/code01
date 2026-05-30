<template>
  <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
    <div class="flex items-center text-sm text-gray-500">
      <template v-for="(item, index) in items" :key="index">
        <router-link
          v-if="item.path && index < items.length - 1"
          :to="item.path"
          class="hover:text-primary transition-colors"
        >
          {{ item.name }}
        </router-link>
        <span v-else :class="index === items.length - 1 ? 'text-gray-800 font-medium' : ''">
          {{ item.name }}
        </span>
        <CaretRight v-if="index < items.length - 1" class="w-4 h-4 mx-2 text-gray-400" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { CaretRight } from '@element-plus/icons-vue'

defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>
