<template>
  <div class="product-list-wrapper">
    <div v-if="loading" class="loading-wrapper">
      <LoadingState text="加载中..." />
    </div>
    
    <div v-else-if="products.length === 0" class="empty-wrapper">
      <EmptyState :type="emptyType" :text="emptyText">
        <template #extra>
          <slot name="empty-extra"></slot>
        </template>
      </EmptyState>
    </div>
    
    <div v-else class="product-list" :class="`grid-cols-${cols}`">
      <div 
        v-for="(product, index) in displayProducts" 
        :key="product.id"
        class="product-item"
        :style="getDelayStyle(index)"
      >
        <ProductCard :product="product" />
      </div>
    </div>
    
    <div v-if="showPagination && total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ProductCard from './ProductCard.vue'
import LoadingState from './LoadingState.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  cols: {
    type: Number,
    default: 4
  },
  emptyType: {
    type: String,
    default: 'default'
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  showPagination: {
    type: Boolean,
    default: false
  },
  pageSize: {
    type: Number,
    default: 12
  },
  pageSizes: {
    type: Array,
    default: () => [12, 24, 48, 96]
  },
  animation: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['page-change', 'size-change'])

const currentPage = ref(1)
const internalPageSize = ref(props.pageSize)

const total = computed(() => props.products.length)

const displayProducts = computed(() => {
  if (!props.showPagination) {
    return props.products
  }
  const start = (currentPage.value - 1) * internalPageSize.value
  const end = start + internalPageSize.value
  return props.products.slice(start, end)
})

function getDelayStyle(index) {
  if (!props.animation) return {}
  return {
    animationDelay: `${index * 0.05}s`
  }
}

function handleSizeChange(size) {
  internalPageSize.value = size
  currentPage.value = 1
  emit('size-change', size)
}

function handleCurrentChange(page) {
  currentPage.value = page
  emit('page-change', page)
}

watch(() => props.products, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.product-list-wrapper {
  width: 100%;
}

.loading-wrapper,
.empty-wrapper {
  width: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-list {
  display: grid;
  gap: 20px;
}

.product-list.grid-cols-1 {
  grid-template-columns: 1fr;
}

.product-list.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.product-list.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.product-list.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.product-list.grid-cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

.product-item {
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
