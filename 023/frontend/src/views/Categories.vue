<template>
  <div class="container">
    <div class="page-header">
      <h2>用品分类管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="categories" row-key="id" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="parent_id" label="父分类" width="150" align="center">
          <template #default="{ row }">
            {{ getParentName(row.parent_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入分类名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="父分类" prop="parent_id">
          <el-select
            v-model="form.parent_id"
            placeholder="请选择父分类"
            clearable
            style="width: 100%"
          >
            <el-option label="顶级分类" :value="null" />
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
              :disabled="isEdit && cat.id === form.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { categoryApi } from '@/api';
import type {
  Category,
  CreateCategoryForm,
  UpdateCategoryForm,
  AxiosErrorResponse
} from '@/types';

const categories = ref<Category[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const submitting = ref(false);

interface FormState {
  id: number | undefined;
  name: string;
  parent_id: number | null;
  description: string;
}

const form = reactive<FormState>({
  id: undefined,
  name: '',
  parent_id: null,
  description: ''
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ]
};

const loadCategories = async (): Promise<void> => {
  try {
    const res = await categoryApi.getAll();
    categories.value = res.data.data || [];
  } catch (error) {
    console.error('加载分类列表失败', error);
    ElMessage.error('加载分类列表失败');
  }
};

const getParentName = (parentId: number | null): string => {
  if (!parentId) return '-';
  const parent = categories.value.find((c: Category) => c.id === parentId);
  return parent?.name || '-';
};

const resetForm = (): void => {
  Object.assign(form, {
    id: undefined,
    name: '',
    parent_id: null,
    description: ''
  });
};

const handleAdd = (): void => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: Category): void => {
  isEdit.value = true;
  Object.assign(form, {
    id: row.id,
    name: row.name,
    parent_id: row.parent_id,
    description: row.description || ''
  });
  dialogVisible.value = true;
};

const handleDelete = async (row: Category): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await categoryApi.delete(row.id);
    ElMessage.success('删除成功');
    loadCategories();
  } catch (error: unknown) {
    if (error !== 'cancel' && !(error as { cancel?: boolean })?.cancel) {
      console.error('删除分类失败', error);
      const axiosError = error as AxiosErrorResponse;
      const errorMsg = axiosError?.response?.data?.message || '删除失败';
      ElMessage.error(errorMsg);
    }
  }
};

const handleSubmit = async (): Promise<void> => {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    if (isEdit.value && form.id) {
      const updateData: UpdateCategoryForm = {
        name: form.name,
        parent_id: form.parent_id,
        description: form.description || null
      };
      await categoryApi.update(form.id, updateData);
      ElMessage.success('更新成功');
    } else {
      const createData: CreateCategoryForm = {
        name: form.name,
        parent_id: form.parent_id,
        description: form.description || null
      };
      await categoryApi.create(createData);
      ElMessage.success('新增成功');
    }

    dialogVisible.value = false;
    loadCategories();
  } catch (error: unknown) {
    console.error('操作失败', error);
    const axiosError = error as AxiosErrorResponse;
    const errorMsg = axiosError?.response?.data?.message || '操作失败';
    ElMessage.error(errorMsg);
  } finally {
    submitting.value = false;
  }
};

const formatTime = (time: string): string => {
  return new Date(time).toLocaleString('zh-CN');
};

onMounted((): void => {
  loadCategories();
});
</script>
