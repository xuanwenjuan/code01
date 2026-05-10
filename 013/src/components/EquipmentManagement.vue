<script setup lang="ts">import { ref, reactive, computed } from 'vue';
import BaseModal from './BaseModal.vue';
import { useDataStore } from '@/composables/useDataStore';
import { useNotification } from '@/composables/useNotification';
import { useEquipmentFilter } from '@/composables/useEquipmentFilter';
import { validateForm, commonRules, hasErrors } from '@/utils/validation';
import type { Equipment, FormErrors, FormValidationRule, QualityLevel, EquipmentStatus, EquipmentType } from '@/types';
import { QualityLevel as QualityLevelEnum, EquipmentStatus as EquipmentStatusEnum, EquipmentCategory, QualityLevelNames, EquipmentStatusNames, CategoryNames, EquipmentTypeNames } from '@/types';
const { categories, addEquipment, updateEquipment, deleteEquipment, getCategoryById, appConfig } = useDataStore();
const { success, error, warning } = useNotification();
const { filterConditions, filteredEquipments, resetFilters, hasActiveFilters, setSorting } = useEquipmentFilter();
const modalVisible = ref(false);
const confirmModalVisible = ref(false);
const editingEquipment = ref<Equipment | null>(null);
const deletingEquipmentId = ref<string | null>(null);
const formData = reactive({
 name: '',
 brand: '',
 categoryId: '',
 entryYear: new Date().getFullYear(),
 stockQuantity: 0,
 minStockThreshold: 3,
 scenarios: '',
 qualityLevel: QualityLevelEnum.GOOD as QualityLevel,
 equipmentType: 'general' as EquipmentType,
 remainingLife: undefined as number | undefined,
 status: EquipmentStatusEnum.IN_STOCK as EquipmentStatus
});
const formErrors = ref<FormErrors>({});
const formRules: Record<string, FormValidationRule[]> = {
 name: [
 commonRules.required('装备名称不能为空'),
 commonRules.minLength(2, '装备名称至少2个字符'),
 commonRules.maxLength(100, '装备名称最多100个字符')
 ],
 brand: [
 commonRules.required('品牌不能为空'),
 commonRules.minLength(1, '品牌至少1个字符'),
 commonRules.maxLength(50, '品牌最多50个字符')
 ],
 categoryId: [
 commonRules.required('请选择分类')
 ],
 entryYear: [
 commonRules.required('请输入入库年份'),
 commonRules.minValue(2000, '入库年份不能早于2000年'),
 commonRules.maxValue(new Date().getFullYear(), '入库年份不能大于当前年份')
 ],
 stockQuantity: [
 commonRules.required('请输入库存数量'),
 commonRules.minValue(0, '库存数量不能小于0')
 ],
 scenarios: [
 commonRules.maxLength(200, '适用场景最多200个字符')
 ],
 qualityLevel: [
 commonRules.required('请选择品质等级')
 ]
};
const qualityLevelOptions = Object.entries(QualityLevelNames).map(([value, label]) => ({
 value: value as QualityLevel,
 label
}));
const statusOptions = Object.entries(EquipmentStatusNames).map(([value, label]) => ({
 value: value as EquipmentStatus,
 label
}));
const equipmentTypeOptions = Object.entries(EquipmentTypeNames).map(([value, label]) => ({
 value: value as EquipmentType,
 label
}));
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);
const sortOptions = [
 { value: 'name' as const, label: '按名称排序' },
 { value: 'entryYear' as const, label: '按入库年份' },
 { value: 'stockQuantity' as const, label: '按库存数量' },
 { value: 'qualityLevel' as const, label: '按品质等级' },
 { value: 'remainingLife' as const, label: '按剩余寿命' }
];
const getCategoryName = (categoryId: string) => {
 const category = getCategoryById(categoryId);
 return category ? category.name : '-';
};
const getQualityLevelClass = (level: QualityLevel) => {
 switch (level) {
 case QualityLevelEnum.EXCELLENT:
 return 'quality-excellent';
 case QualityLevelEnum.GOOD:
 return 'quality-good';
 case QualityLevelEnum.NORMAL:
 return 'quality-normal';
 case QualityLevelEnum.POOR:
 return 'quality-poor';
 default:
 return '';
 }
};
const getStatusClass = (status: EquipmentStatus) => {
 switch (status) {
 case EquipmentStatusEnum.IN_STOCK:
 return 'status-in-stock';
 case EquipmentStatusEnum.RENTED:
 return 'status-rented';
 case EquipmentStatusEnum.SCRAPPED:
 return 'status-scrapped';
 default:
 return '';
 }
};
const isAgingWarning = (equipment: Equipment) => {
 if (equipment.remainingLife !== undefined && equipment.remainingLife <= 2) {
 return true;
 }
 if (currentYear - equipment.entryYear >= 5) {
 return true;
 }
 return false;
};
const resetForm = () => {
 formData.name = '';
 formData.brand = '';
 formData.categoryId = categories.value[0]?.id || '';
 formData.entryYear = currentYear;
 formData.stockQuantity = 0;
 formData.minStockThreshold = appConfig.value.lowStockThreshold;
 formData.scenarios = '';
 formData.qualityLevel = QualityLevelEnum.GOOD;
 formData.equipmentType = 'general';
 formData.remainingLife = undefined;
 formData.status = EquipmentStatusEnum.IN_STOCK;
 formErrors.value = {};
 editingEquipment.value = null;
};
const openAddModal = () => {
 resetForm();
 modalVisible.value = true;
};
const openEditModal = (equipment: Equipment) => {
 resetForm();
 editingEquipment.value = equipment;
 formData.name = equipment.name;
 formData.brand = equipment.brand;
 formData.categoryId = equipment.categoryId;
 formData.entryYear = equipment.entryYear;
 formData.stockQuantity = equipment.stockQuantity;
 formData.minStockThreshold = equipment.minStockThreshold ?? appConfig.value.lowStockThreshold;
 formData.scenarios = equipment.scenarios;
 formData.qualityLevel = equipment.qualityLevel;
 formData.equipmentType = equipment.equipmentType;
 formData.remainingLife = equipment.remainingLife;
 formData.status = equipment.status;
 modalVisible.value = true;
};
const openDeleteModal = (id: string) => {
 deletingEquipmentId.value = id;
 confirmModalVisible.value = true;
};
const handleSubmit = () => {
 const errors = validateForm(formData, formRules);
 formErrors.value = errors;
 if (hasErrors(errors)) {
 return;
 }
 const category = categories.value.find(c => c.id === formData.categoryId);
 if (!category) {
 error('请选择有效的分类');
 return;
 }
 if (editingEquipment.value) {
 updateEquipment(editingEquipment.value.id, {
 name: formData.name,
 brand: formData.brand,
 categoryId: formData.categoryId,
 categoryCode: category.code,
 entryYear: formData.entryYear,
 stockQuantity: formData.stockQuantity,
 minStockThreshold: formData.minStockThreshold,
 scenarios: formData.scenarios,
 qualityLevel: formData.qualityLevel,
 equipmentType: formData.equipmentType,
 remainingLife: formData.equipmentType === 'mechanical' ? formData.remainingLife : undefined,
 status: formData.status
 });
 success('装备更新成功');
 }
 else {
 addEquipment({
 name: formData.name,
 brand: formData.brand,
 categoryId: formData.categoryId,
 categoryCode: category.code,
 entryYear: formData.entryYear,
 stockQuantity: formData.stockQuantity,
 minStockThreshold: formData.minStockThreshold,
 scenarios: formData.scenarios,
 qualityLevel: formData.qualityLevel,
 equipmentType: formData.equipmentType,
 remainingLife: formData.equipmentType === 'mechanical' ? formData.remainingLife : undefined
 });
 success('装备添加成功');
 }
 modalVisible.value = false;
};
const handleDelete = () => {
 if (!deletingEquipmentId.value)
 return;
 const result = deleteEquipment(deletingEquipmentId.value);
 if (result) {
 success('装备删除成功');
 }
 else {
 error('装备删除失败');
 }
 confirmModalVisible.value = false;
 deletingEquipmentId.value = null;
};
const handleResetFilters = () => {
 resetFilters();
 success('筛选条件已重置');
};
</script>

<template>
  <div class="equipment-management">
    <div class="section-header">
      <h2>装备信息管理</h2>
      <button class="btn btn-primary" @click="openAddModal">
        + 新增装备
      </button>
    </div>

    <div class="filter-card card">
      <h3 class="filter-title">筛选条件</h3>
      <div class="filter-grid">
        <div class="filter-item">
          <label>关键词搜索</label>
          <input
            v-model="filterConditions.keyword"
            type="text"
            class="form-input"
            placeholder="搜索名称、品牌、场景..."
          />
        </div>
        
        <div class="filter-item">
          <label>装备分类</label>
          <select v-model="filterConditions.categoryId" class="form-input">
            <option :value="undefined">全部</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-item">
          <label>品质等级</label>
          <select v-model="filterConditions.qualityLevel" class="form-input">
            <option :value="undefined">全部</option>
            <option v-for="opt in qualityLevelOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-item">
          <label>装备状态</label>
          <select v-model="filterConditions.status" class="form-input">
            <option :value="undefined">全部</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-item">
          <label>库存数量 (最小)</label>
          <input
            v-model.number="filterConditions.minStock"
            type="number"
            class="form-input"
            placeholder="最小库存"
            min="0"
          />
        </div>
        
        <div class="filter-item">
          <label>库存数量 (最大)</label>
          <input
            v-model.number="filterConditions.maxStock"
            type="number"
            class="form-input"
            placeholder="最大库存"
            min="0"
          />
        </div>
        
        <div class="filter-item">
          <label>入库年份 (最早)</label>
          <select v-model.number="filterConditions.minEntryYear" class="form-input">
            <option :value="undefined">不限</option>
            <option v-for="year in yearOptions" :key="year" :value="year">
              {{ year }}年
            </option>
          </select>
        </div>
        
        <div class="filter-item">
          <label>入库年份 (最晚)</label>
          <select v-model.number="filterConditions.maxEntryYear" class="form-input">
            <option :value="undefined">不限</option>
            <option v-for="year in yearOptions" :key="year" :value="year">
              {{ year }}年
            </option>
          </select>
        </div>
        
        <div class="filter-item">
          <label>剩余寿命 (最小，年)</label>
          <input
            v-model.number="filterConditions.minRemainingLife"
            type="number"
            class="form-input"
            placeholder="最小剩余寿命"
            min="0"
          />
        </div>
      </div>
      
      <div class="filter-actions">
        <span v-if="hasActiveFilters" class="filter-info">
          筛选结果：{{ filteredEquipments.length }} 条
        </span>
        <button v-if="hasActiveFilters" class="btn btn-secondary" @click="handleResetFilters">
          重置筛选
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>装备名称</th>
              <th>品牌</th>
              <th>分类</th>
              <th>入库年份</th>
              <th>库存数量</th>
              <th>适用场景</th>
              <th>品质等级</th>
              <th>剩余寿命</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="equipment in filteredEquipments" :key="equipment.id" :class="{ 'warning-row': isAgingWarning(equipment) }">
              <td>
                <div class="equipment-name">
                  {{ equipment.name }}
                  <span v-if="isAgingWarning(equipment)" class="aging-icon" title="老化预警">⚠️</span>
                </div>
              </td>
              <td>{{ equipment.brand }}</td>
              <td>{{ getCategoryName(equipment.categoryId) }}</td>
              <td>{{ equipment.entryYear }}年</td>
              <td>
                <span class="stock-badge" :class="{ 'low-stock': equipment.stockQuantity <= 3 }">
                  {{ equipment.stockQuantity }}
                </span>
              </td>
              <td class="text-muted">{{ equipment.scenarios || '-' }}</td>
              <td>
                <span class="quality-badge" :class="getQualityLevelClass(equipment.qualityLevel)">
                  {{ QualityLevelNames[equipment.qualityLevel] }}
                </span>
              </td>
              <td>
                <span v-if="equipment.remainingLife !== undefined">
                  {{ equipment.remainingLife }}年
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(equipment.status)">
                  {{ EquipmentStatusNames[equipment.status] }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-link" @click="openEditModal(equipment)">
                    编辑
                  </button>
                  <button 
                    class="btn btn-link btn-danger" 
                    @click="openDeleteModal(equipment.id)"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredEquipments.length === 0">
              <td colspan="10" class="empty-state">
                {{ hasActiveFilters ? '没有符合条件的装备' : '暂无装备数据' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      v-model:visible="modalVisible"
      :title="editingEquipment ? '编辑装备' : '新增装备'"
      width="600px"
      @ok="handleSubmit"
    >
      <form class="form equipment-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              装备名称 <span class="required">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              :class="{ 'is-error': formErrors.name }"
              placeholder="请输入装备名称"
            />
            <p v-if="formErrors.name" class="form-error">{{ formErrors.name }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              品牌 <span class="required">*</span>
            </label>
            <input
              v-model="formData.brand"
              type="text"
              class="form-input"
              :class="{ 'is-error': formErrors.brand }"
              placeholder="请输入品牌"
            />
            <p v-if="formErrors.brand" class="form-error">{{ formErrors.brand }}</p>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              分类 <span class="required">*</span>
            </label>
            <select
              v-model="formData.categoryId"
              class="form-input"
              :class="{ 'is-error': formErrors.categoryId }"
            >
              <option value="">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <p v-if="formErrors.categoryId" class="form-error">{{ formErrors.categoryId }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              入库年份 <span class="required">*</span>
            </label>
            <select
              v-model.number="formData.entryYear"
              class="form-input"
              :class="{ 'is-error': formErrors.entryYear }"
            >
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
            <p v-if="formErrors.entryYear" class="form-error">{{ formErrors.entryYear }}</p>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              库存数量 <span class="required">*</span>
            </label>
            <input
              v-model.number="formData.stockQuantity"
              type="number"
              class="form-input"
              :class="{ 'is-error': formErrors.stockQuantity }"
              min="0"
              placeholder="请输入库存数量"
            />
            <p v-if="formErrors.stockQuantity" class="form-error">{{ formErrors.stockQuantity }}</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              品质等级 <span class="required">*</span>
            </label>
            <select
              v-model="formData.qualityLevel"
              class="form-input"
              :class="{ 'is-error': formErrors.qualityLevel }"
            >
              <option v-for="opt in qualityLevelOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <p v-if="formErrors.qualityLevel" class="form-error">{{ formErrors.qualityLevel }}</p>
          </div>
        </div>
        
        <div class="form-row" v-if="editingEquipment">
          <div class="form-group">
            <label class="form-label">装备状态</label>
            <select
              v-model="formData.status"
              class="form-input"
            >
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">剩余寿命 (年)</label>
            <input
              v-model.number="formData.remainingLife"
              type="number"
              class="form-input"
              min="0"
              placeholder="适用机械类装备"
            />
          </div>
        </div>
        
        <div class="form-row" v-else>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">剩余寿命 (年)</label>
            <input
              v-model.number="formData.remainingLife"
              type="number"
              class="form-input"
              min="0"
              placeholder="适用机械类装备（可选）"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">适用场景</label>
          <textarea
            v-model="formData.scenarios"
            class="form-input"
            :class="{ 'is-error': formErrors.scenarios }"
            rows="2"
            placeholder="请输入适用场景（可选）"
          ></textarea>
          <p v-if="formErrors.scenarios" class="form-error">{{ formErrors.scenarios }}</p>
        </div>
      </form>
    </BaseModal>

    <BaseModal
      v-model:visible="confirmModalVisible"
      title="确认删除"
      okText="删除"
      cancelText="取消"
      @ok="handleDelete"
    >
      <div class="confirm-content">
        <p>确定要删除该装备吗？</p>
        <p class="text-warning text-small">此操作不可恢复。</p>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.equipment-management {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.filter-info {
  font-size: 13px;
  color: #6b7280;
}

.equipment-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.aging-icon {
  font-size: 14px;
}

.stock-badge {
  display: inline-block;
  padding: 2px 10px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
}

.stock-badge.low-stock {
  background: #fee2e2;
  color: #991b1b;
}

.quality-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
}

.quality-excellent {
  background: #dbeafe;
  color: #1d4ed8;
}

.quality-good {
  background: #d1fae5;
  color: #065f46;
}

.quality-normal {
  background: #fef3c7;
  color: #92400e;
}

.quality-poor {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
}

.status-in-stock {
  background: #d1fae5;
  color: #065f46;
}

.status-rented {
  background: #fef3c7;
  color: #92400e;
}

.status-scrapped {
  background: #fee2e2;
  color: #991b1b;
}

.warning-row {
  background: #fffbeb;
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: #9ca3af;
}

.equipment-form {
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-label .required {
  color: #ef4444;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.is-error {
  border-color: #ef4444;
}

.form-error {
  margin: 0;
  font-size: 11px;
  color: #ef4444;
}

.confirm-content {
  text-align: center;
}

.confirm-content p {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.text-warning {
  color: #f59e0b;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
