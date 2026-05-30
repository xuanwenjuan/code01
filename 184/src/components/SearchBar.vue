<template>
  <div class="search-bar">
    <el-input
      v-model="searchText"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="size"
      class="search-input"
      @keyup.enter="handleSearch"
      @clear="handleClear"
    >
      <template #prefix>
        <el-icon color="#909399"><Search /></el-icon>
      </template>
      <template #append v-if="showButton">
        <el-button :type="buttonType" @click="handleSearch">
          {{ buttonText }}
        </el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入搜索内容'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'default'
  },
  showButton: {
    type: Boolean,
    default: true
  },
  buttonText: {
    type: String,
    default: '搜索'
  },
  buttonType: {
    type: String,
    default: 'primary'
  },
  modelValue: {
    type: String,
    default: ''
  },
  immediate: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const searchText = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  searchText.value = val
})

watch(searchText, (val) => {
  emit('update:modelValue', val)
  if (props.immediate && val !== '') {
    emit('search', val)
  }
})

function handleSearch() {
  emit('search', searchText.value)
}

function handleClear() {
  searchText.value = ''
  emit('clear')
  emit('search', '')
}
</script>

<style scoped lang="scss">
.search-bar {
  .search-input {
    width: 100%;
    max-width: 400px;
  }
}
</style>
