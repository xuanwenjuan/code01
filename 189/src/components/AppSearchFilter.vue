<template>
  <div class="search-filter card">
    <div class="filter-row">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          :placeholder="searchPlaceholder"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <div class="filter-tags" v-if="showFilterTags">
        <span
          v-for="tag in filterTags"
          :key="tag.value"
          class="filter-tag"
          :class="{ active: activeFilter === tag.value }"
          @click="handleTagClick(tag.value)"
        >
          {{ tag.label }}
          <span v-if="tag.count !== undefined" class="count">{{ tag.count }}</span>
        </span>
      </div>
    </div>

    <div class="filter-extra" v-if="showExtraFilters">
      <slot name="extra"></slot>
    </div>

    <div class="filter-actions" v-if="showActions">
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleSearch">筛选</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  searchPlaceholder: {
    type: String,
    default: '请输入关键词搜索'
  },
  filterTags: {
    type: Array,
    default: () => []
  },
  showFilterTags: {
    type: Boolean,
    default: true
  },
  showExtraFilters: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  },
  defaultFilter: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['search', 'filter-change', 'reset'])

const searchKeyword = ref('')
const activeFilter = ref(props.defaultFilter)

watch(() => props.defaultFilter, (val) => {
  activeFilter.value = val
})

function handleSearch() {
  emit('search', {
    keyword: searchKeyword.value,
    filter: activeFilter.value
  })
}

function handleTagClick(value) {
  activeFilter.value = value
  emit('filter-change', value)
  emit('search', {
    keyword: searchKeyword.value,
    filter: value
  })
}

function handleReset() {
  searchKeyword.value = ''
  activeFilter.value = props.defaultFilter
  emit('reset')
  emit('search', {
    keyword: '',
    filter: props.defaultFilter
  })
}
</script>

<style lang="scss" scoped>
.search-filter {
  padding: 20px;
  margin-bottom: 20px;

  .filter-row {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    flex-wrap: wrap;

    .search-box {
      width: 320px;
      flex-shrink: 0;
    }

    .filter-tags {
      flex: 1;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      padding-top: 4px;

      .filter-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        background: #f5f5f5;
        border-radius: 20px;
        font-size: 14px;
        color: $text-light;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover, &.active {
          background: $primary-color;
          color: #fff;
        }

        .count {
          background: rgba(255, 255, 255, 0.2);
          padding: 0 6px;
          border-radius: 10px;
          font-size: 12px;
        }
      }
    }
  }

  .filter-extra {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid $border-color;
  }

  .filter-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;

    .search-box {
      width: 100%;
    }
  }
}
</style>
