<template>
  <div class="filter-panel">
    <div class="filter-header">
      <h3>筛选条件</h3>
      <button class="btn btn-sm btn-text" @click="handleReset">重置</button>
    </div>
    
    <div class="filter-grid">
      <div class="filter-item">
        <label>器材分类</label>
        <select v-model="localFilter.categoryId" @change="applyFilter">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="filter-item">
        <label>库存数量</label>
        <div class="range-inputs">
          <input 
            type="number" 
            v-model.number="localFilter.minStock"
            placeholder="最小"
            min="0"
            @change="applyFilter"
          />
          <span>~</span>
          <input 
            type="number" 
            v-model.number="localFilter.maxStock"
            placeholder="最大"
            min="0"
            @change="applyFilter"
          />
        </div>
      </div>

      <div class="filter-item">
        <label>入库年份</label>
        <div class="range-inputs">
          <input 
            type="number" 
            v-model.number="localFilter.minStockYear"
            placeholder="起始年"
            @change="applyFilter"
          />
          <span>~</span>
          <input 
            type="number" 
            v-model.number="localFilter.maxStockYear"
            placeholder="结束年"
            @change="applyFilter"
          />
        </div>
      </div>

      <div class="filter-item">
        <label>完好度(%)</label>
        <div class="range-inputs">
          <input 
            type="number" 
            v-model.number="localFilter.minCondition"
            placeholder="最小"
            min="0"
            max="100"
            @change="applyFilter"
          />
          <span>~</span>
          <input 
            type="number" 
            v-model.number="localFilter.maxCondition"
            placeholder="最大"
            min="0"
            max="100"
            @change="applyFilter"
          />
        </div>
      </div>

      <div class="filter-item">
        <label>寿命剩余(%)</label>
        <div class="range-inputs">
          <input 
            type="number" 
            v-model.number="localFilter.minLifeRemaining"
            placeholder="最小"
            min="0"
            max="100"
            @change="applyFilter"
          />
          <span>~</span>
          <input 
            type="number" 
            v-model.number="localFilter.maxLifeRemaining"
            placeholder="最大"
            min="0"
            max="100"
            @change="applyFilter"
          />
        </div>
      </div>
    </div>

    <div class="filter-result">
      共筛选出 <span class="highlight">{{ resultCount }}</span> 条器材记录
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { FilterOptions } from '@/types'
import { useEquipmentStore } from '@/composables/useEquipmentStore'

const props = defineProps<{
  resultCount: number
}>()

const { categories, filterOptions, resetFilter } = useEquipmentStore()

const localFilter = reactive<FilterOptions>({
  categoryId: '',
  minStock: 0,
  maxStock: 9999,
  minStockYear: 1990,
  maxStockYear: 2100,
  minCondition: 0,
  maxCondition: 100,
  minLifeRemaining: 0,
  maxLifeRemaining: 100
})

watch(
  () => filterOptions.value,
  (newVal) => {
    Object.assign(localFilter, newVal)
  },
  { immediate: true, deep: true }
)

function applyFilter() {
  Object.assign(filterOptions.value, localFilter)
}

function handleReset() {
  resetFilter()
}
</script>

<style scoped>
.filter-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.filter-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.btn {
  padding: 4px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-sm {
  padding: 4px 12px;
}

.btn-text {
  background: transparent;
  color: #409eff;
}

.btn-text:hover {
  background: #ecf5ff;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.filter-item select,
.filter-item input {
  padding: 8px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
}

.filter-item select:focus,
.filter-item input:focus {
  outline: none;
  border-color: #409eff;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-inputs input {
  flex: 1;
  min-width: 0;
}

.range-inputs span {
  color: #999;
  font-size: 13px;
}

.filter-result {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #666;
}

.highlight {
  color: #409eff;
  font-weight: 600;
  margin: 0 4px;
}
</style>
