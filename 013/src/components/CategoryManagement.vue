<script setup lang="ts">import { ref, reactive } from 'vue';
import BaseModal from './BaseModal.vue';
import { useDataStore } from '@/composables/useDataStore';
import { useNotification } from '@/composables/useNotification';
import { validateForm, commonRules, hasErrors } from '@/utils/validation';
import type { Category, FormErrors, FormValidationRule } from '@/types';
import { EquipmentCategory } from '@/types';
const { categories, equipments, addCategory, updateCategory, deleteCategory } = useDataStore();
const { success, error } = useNotification();
const modalVisible = ref(false);
const confirmModalVisible = ref(false);
const editingCategory = ref<Category | null>(null);
const deletingCategoryId = ref<string | null>(null);
const formData = reactive({
 name: '',
 code: EquipmentCategory.CAMPING as EquipmentCategory,
 description: ''
});
const formErrors = ref<FormErrors>({});
const formRules: Record<string, FormValidationRule[]> = {
 name: [
 commonRules.required('分类名称不能为空'),
 commonRules.minLength(2, '分类名称至少2个字符'),
 commonRules.maxLength(50, '分类名称最多50个字符')
 ],
 code: [
 commonRules.required('请选择分类编码')
 ],
 description: [
 commonRules.maxLength(200, '描述最多200个字符')
 ]
};
const categoryOptions = Object.values(EquipmentCategory).map(code => ({
 value: code,
 label: code
}));
const resetForm = () => {
 formData.name = '';
 formData.code = EquipmentCategory.CAMPING;
 formData.description = '';
 formErrors.value = {};
 editingCategory.value = null;
};
const openAddModal = () => {
 resetForm();
 modalVisible.value = true;
};
const openEditModal = (category: Category) => {
 resetForm();
 editingCategory.value = category;
 formData.name = category.name;
 formData.code = category.code;
 formData.description = category.description;
 modalVisible.value = true;
};
const openDeleteModal = (id: string) => {
 deletingCategoryId.value = id;
 confirmModalVisible.value = true;
};
const getEquipmentCount = (categoryId: string) => {
 return equipments.value.filter(eq => eq.categoryId === categoryId).length;
};
const handleSubmit = () => {
 const errors = validateForm(formData, formRules);
 formErrors.value = errors;
 if (hasErrors(errors)) {
 return;
 }
 if (editingCategory.value) {
 updateCategory(editingCategory.value.id, {
 name: formData.name,
 code: formData.code,
 description: formData.description
 });
 success('分类更新成功');
 }
 else {
 addCategory({
 name: formData.name,
 code: formData.code,
 description: formData.description
 });
 success('分类添加成功');
 }
 modalVisible.value = false;
};
const handleDelete = () => {
 if (!deletingCategoryId.value)
 return;
 const result = deleteCategory(deletingCategoryId.value);
 if (result) {
 success('分类删除成功');
 }
 else {
 error('该分类下还有装备，无法删除');
 }
 confirmModalVisible.value = false;
 deletingCategoryId.value = null;
};
const formatDate = (dateStr: string) => {
 return new Date(dateStr).toLocaleString('zh-CN');
};
</script>

<template>
  <div class="category-management">
    <div class="section-header">
      <h2>装备分类管理</h2>
      <button class="btn btn-primary" @click="openAddModal">
        + 新增分类
      </button>
    </div>
    
    <div class="card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>分类名称</th>
              <th>分类编码</th>
              <th>描述</th>
              <th>装备数量</th>
              <th>创建时间</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id">
              <td>
                <span class="category-badge">{{ category.name }}</span>
              </td>
              <td>{{ category.code }}</td>
              <td class="text-muted">{{ category.description || '-' }}</td>
              <td>
                <span class="badge badge-info">{{ getEquipmentCount(category.id) }}</span>
              </td>
              <td class="text-small">{{ formatDate(category.createdAt) }}</td>
              <td class="text-small">{{ formatDate(category.updatedAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-link" @click="openEditModal(category)">
                    编辑
                  </button>
                  <button 
                    class="btn btn-link btn-danger" 
                    @click="openDeleteModal(category.id)"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="7" class="empty-state">
                暂无分类数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      v-model:visible="modalVisible"
      :title="editingCategory ? '编辑分类' : '新增分类'"
      @ok="handleSubmit"
    >
      <form class="form">
        <div class="form-group">
          <label class="form-label">
            分类名称 <span class="required">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ 'is-error': formErrors.name }"
            placeholder="请输入分类名称"
          />
          <p v-if="formErrors.name" class="form-error">{{ formErrors.name }}</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">
            分类编码 <span class="required">*</span>
          </label>
          <select
            v-model="formData.code"
            class="form-input"
            :class="{ 'is-error': formErrors.code }"
            :disabled="!!editingCategory"
          >
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <p v-if="formErrors.code" class="form-error">{{ formErrors.code }}</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">描述</label>
          <textarea
            v-model="formData.description"
            class="form-input"
            :class="{ 'is-error': formErrors.description }"
            rows="3"
            placeholder="请输入分类描述（可选）"
          ></textarea>
          <p v-if="formErrors.description" class="form-error">{{ formErrors.description }}</p>
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
        <p>确定要删除该分类吗？</p>
        <p class="text-warning text-small">
          注意：如果该分类下还有装备，将无法删除。
        </p>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.category-management {
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

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 4px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: #9ca3af;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-label .required {
  color: #ef4444;
}

.form-input {
  padding: 10px 14px;
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
  font-size: 12px;
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
</style>
