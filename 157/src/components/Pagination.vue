<template>
  <div class="flex items-center justify-center gap-2 py-6">
    <button
      class="px-4 py-2 rounded-lg border border-gray-300 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
    >
      <ArrowLeft class="w-4 h-4 inline-block" />
      上一页
    </button>
    
    <template v-for="page in visiblePages" :key="page">
      <button
        v-if="page !== '...'"
        class="w-10 h-10 rounded-lg border transition-colors"
        :class="{
          'bg-primary text-white border-primary': page === currentPage,
          'border-gray-300 hover:border-primary hover:text-primary': page !== currentPage
        }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
      <span v-else class="px-2 text-gray-500">...</span>
    </template>
    
    <button
      class="px-4 py-2 rounded-lg border border-gray-300 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
    >
      下一页
      <ArrowRight class="w-4 h-4 inline-block" />
    </button>
    
    <span class="ml-4 text-gray-500">
      共 {{ total }} 条，第 {{ currentPage }} / {{ totalPages }} 页
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:currentPage', 'change'])

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const visiblePages = computed(() => {
  const pages = []
  const current = props.currentPage
  const total = totalPages.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  
  return pages
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('change', page)
  }
}
</script>
