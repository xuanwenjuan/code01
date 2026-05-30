<template>
  <div class="list-container">
    <div class="list-header" v-if="$slots.header || title">
      <h3 class="title" v-if="title">{{ title }}</h3>
      <slot name="header"></slot>
    </div>

    <div class="list-content" v-loading="loading">
      <slot v-if="!loading && data.length > 0"></slot>
      <AppEmpty v-else-if="!loading" :text="emptyText">
        <slot name="empty-action"></slot>
      </AppEmpty>
    </div>

    <div class="list-footer" v-if="showPagination && total > 0">
      <AppPagination
        v-model="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppEmpty from './AppEmpty.vue'
import AppPagination from './AppPagination.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 12
  },
  pageSizes: {
    type: Array,
    default: () => [12, 24, 48, 100]
  }
})

const emit = defineEmits(['page-change', 'update:pageSize'])

const currentPage = ref(1)

watch(() => props.data, () => {
  currentPage.value = 1
})

function handlePageChange({ page, pageSize }) {
  currentPage.value = page
  emit('page-change', { page, pageSize })
}
</script>

<style lang="scss" scoped>
.list-container {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title {
      font-size: 20px;
      font-weight: 600;
      color: $text-color;
    }
  }

  .list-content {
    min-height: 200px;
  }

  .list-footer {
    margin-top: 20px;
  }
}
</style>
