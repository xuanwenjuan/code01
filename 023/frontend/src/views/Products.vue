<template>
  <div class="container">
    <div class="page-header">
      <h2>用品信息管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用品
      </el-button>
    </div>

    <div class="filter-panel">
      <el-collapse v-model="activeFilterPanels">
        <el-collapse-item title="筛选条件" name="basic">
          <el-form :inline="true" :model="filter" class="filter-row">
            <el-row :gutter="16" style="width: 100%">
              <el-col :span="6">
                <el-form-item label="关键词" label-position="top" style="display: block">
                  <el-input
                    v-model="filter.keyword"
                    placeholder="搜索名称/描述/供应商"
                    clearable
                    prefix-icon="Search"
                    @keyup.enter="loadProducts"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item label="分类" label-position="top" style="display: block">
                  <el-select v-model="filter.category_id" placeholder="请选择分类" clearable style="width: 100%">
                    <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="品质等级" label-position="top" style="display: block">
                  <el-select v-model="filter.quality_level" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="level in QUALITY_LEVELS" :key="level" :label="level" :value="level" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="价格范围" label-position="top" style="display: block">
                  <el-input-number
                    v-model="filter.min_price"
                    :min="0"
                    placeholder="最低价"
                    controls-position="right"
                    style="width: 45%"
                  />
                  <span style="display: inline-block; width: 10%; text-align: center">-</span>
                  <el-input-number
                    v-model="filter.max_price"
                    :min="0"
                    placeholder="最高价"
                    controls-position="right"
                    style="width: 45%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="库存范围" label-position="top" style="display: block">
                  <el-input-number
                    v-model="filter.min_stock"
                    :min="0"
                    placeholder="最低"
                    controls-position="right"
                    style="width: 45%"
                  />
                  <span style="display: inline-block; width: 10%; text-align: center">-</span>
                  <el-input-number
                    v-model="filter.max_stock"
                    :min="0"
                    placeholder="最高"
                    controls-position="right"
                    style="width: 45%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item label="供应商" label-position="top" style="display: block">
                  <el-input
                    v-model="filter.supplier"
                    placeholder="搜索供应商"
                    clearable
                    @keyup.enter="loadProducts"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <div class="filter-actions">
              <el-checkbox v-model="filter.is_low_stock" style="margin-right: 16px">
                <el-icon style="color: #f56c6c"><Warning /></el-icon>
                仅显示低库存
              </el-checkbox>
              <el-checkbox v-model="filter.is_aging" style="margin-right: 24px">
                <el-icon style="color: #e6a23c"><Clock /></el-icon>
                仅显示临期
              </el-checkbox>
              <el-button type="primary" @click="loadProducts">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetFilter">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </div>
          </el-form>
        </el-collapse-item>
      </el-collapse>
      
      <div class="active-filters" v-if="hasActiveFilters">
        <span class="filter-label">当前筛选：</span>
        <el-tag
          v-for="(label, key) in activeFilterTags"
          :key="key"
          :closable="true"
          size="small"
          @close="clearFilter(key as keyof ProductFilter)"
          effect="light"
        >
          {{ label }}
        </el-tag>
        <el-button type="text" size="small" @click="resetFilter">
          <el-icon><Close /></el-icon>
          清除全部
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="products" row-key="id" border stripe>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="用品名称" min-width="150" show-overflow-tooltip />
        <el-table-column label="分类" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.parent_category_name ? row.parent_category_name + ' / ' : '' }}{{ row.category_name }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="售价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="cost_price" label="成本价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.cost_price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="库存" width="140" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.is_low_stock }">
              {{ row.stock }}
            </span>
            / {{ row.min_stock }} {{ row.unit }}
            <el-tag v-if="row.is_low_stock" type="danger" size="small" effect="light" style="margin-left: 8px">库存不足</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quality_level" label="品质等级" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getQualityTagType(row.quality_level)" size="small" effect="light">
              {{ row.quality_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expiry_date" label="过期日期" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-warning': row.is_aging }">
              {{ row.expiry_date || '-' }}
            </span>
            <el-tag v-if="row.is_aging" type="warning" size="small" effect="light" style="margin-left: 8px">临期</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleInbound(row)">入库</el-button>
            <el-button type="warning" link @click="handleSale(row)">售卖</el-button>
            <el-button type="danger" link @click="handleDefective(row)">残次</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="productDialogVisible"
      :title="isEdit ? '编辑用品' : '新增用品'"
      width="700px"
      destroy-on-close
    >
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用品名称" prop="name">
              <el-input v-model="productForm.name" placeholder="请输入用品名称" maxlength="200" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select v-model="productForm.category_id" placeholder="请选择分类" style="width: 100%">
                <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="售价" prop="price">
              <el-input-number v-model="productForm.price" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="成本价" prop="cost_price">
              <el-input-number v-model="productForm.cost_price" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="productForm.unit" placeholder="个/袋/件等" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="productForm.stock" :min="0" :controls="false" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最低库存" prop="min_stock">
              <el-input-number v-model="productForm.min_stock" :min="0" :controls="false" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="品质等级" prop="quality_level">
              <el-select v-model="productForm.quality_level" style="width: 100%">
                <el-option v-for="level in QUALITY_LEVELS" :key="level" :label="level" :value="level" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产日期">
              <el-date-picker
                v-model="productForm.manufacturing_date"
                type="date"
                placeholder="选择生产日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期日期">
              <el-date-picker
                v-model="productForm.expiry_date"
                type="date"
                placeholder="选择过期日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="供应商">
          <el-input v-model="productForm.supplier" placeholder="请输入供应商" maxlength="200" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="productForm.description" type="textarea" :rows="2" placeholder="请输入描述" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleProductSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="inventoryDialogVisible"
      :title="inventoryTitle"
      width="500px"
      destroy-on-close
    >
      <el-form :model="inventoryForm" :rules="inventoryRules" ref="inventoryFormRef" label-width="100px">
        <el-form-item label="用品名称">
          <el-input v-model="currentProduct?.name" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :model-value="currentProduct?.stock" disabled />
        </el-form-item>
        <el-form-item label="操作数量" prop="quantity">
          <el-input-number
            v-model="inventoryForm.quantity"
            :min="1"
            :max="inventoryType === 'inbound' ? undefined : (currentProduct?.stock || 0)"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="inventoryType !== 'defective'" label="单价" prop="price">
          <el-input-number v-model="inventoryForm.price" :min="0" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="inventoryType === 'defective'" label="下架原因" prop="reason">
          <el-input v-model="inventoryForm.reason" type="textarea" :rows="3" placeholder="请输入残次下架原因" />
        </el-form-item>
        <el-form-item v-else label="备注原因">
          <el-input v-model="inventoryForm.reason" type="textarea" :rows="2" placeholder="请输入原因或备注（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inventoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleInventorySubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { productApi, categoryApi, inventoryApi, QUALITY_LEVELS } from '@/api';
import type {
  Product,
  Category,
  ProductFilter,
  CreateProductForm,
  UpdateProductForm,
  QualityLevel,
  InboundForm,
  SaleForm,
  DefectiveForm,
  AxiosErrorResponse
} from '@/types';

type InventoryOperationType = 'inbound' | 'sale' | 'defective';

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const productDialogVisible = ref(false);
const inventoryDialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const productFormRef = ref<FormInstance>();
const inventoryFormRef = ref<FormInstance>();
const inventoryType = ref<InventoryOperationType>('inbound');
const currentProduct = ref<Product | null>(null);
const activeFilterPanels = ref<string[]>(['basic']);

const filter = reactive<ProductFilter>({
  keyword: undefined,
  category_id: undefined,
  quality_level: undefined,
  min_price: undefined,
  max_price: undefined,
  min_stock: undefined,
  max_stock: undefined,
  supplier: undefined,
  is_low_stock: false,
  is_aging: false
});

const productForm = reactive<CreateProductForm & { id?: number }>({
  id: undefined,
  name: '',
  category_id: undefined,
  price: 0,
  cost_price: 0,
  stock: 0,
  min_stock: 10,
  unit: '个',
  description: '',
  quality_level: '普通',
  warranty_period: 0,
  manufacturing_date: null,
  expiry_date: null,
  supplier: ''
});

const inventoryForm = reactive<{ quantity: number; price: number; reason: string }>({
  quantity: 1,
  price: 0,
  reason: ''
});

const productRules: FormRules = {
  name: [
    { required: true, message: '请输入用品名称', trigger: 'blur' },
    { min: 1, max: 200, message: '名称长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入售价', trigger: 'blur' }
  ],
  cost_price: [
    { required: true, message: '请输入成本价', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ],
  min_stock: [
    { required: true, message: '请输入最低库存', trigger: 'blur' }
  ],
  quality_level: [
    { required: true, message: '请选择品质等级', trigger: 'change' }
  ]
};

const inventoryRules: FormRules = {
  quantity: [
    { required: true, message: '请输入操作数量', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入单价', trigger: 'blur' }
  ],
  reason: inventoryType.value === 'defective'
    ? [{ required: true, message: '请输入残次下架原因', trigger: 'blur' }]
    : []
};

const inventoryTitle = computed((): string => {
  const titles: Record<InventoryOperationType, string> = {
    inbound: '入库',
    sale: '售卖',
    defective: '残次下架'
  };
  return titles[inventoryType.value];
});

const loadCategories = async (): Promise<void> => {
  try {
    const res = await categoryApi.getAll();
    categories.value = res.data.data || [];
  } catch (error) {
    console.error('加载分类失败', error);
    ElMessage.error('加载分类列表失败');
  }
};

const loadProducts = async (): Promise<void> => {
  try {
    const res = await productApi.getAll(filter);
    products.value = res.data.data || [];
  } catch (error) {
    console.error('加载用品列表失败', error);
    ElMessage.error('加载用品列表失败');
  }
};

const resetFilter = (): void => {
  Object.assign(filter, {
    keyword: undefined,
    category_id: undefined,
    quality_level: undefined,
    min_price: undefined,
    max_price: undefined,
    min_stock: undefined,
    max_stock: undefined,
    supplier: undefined,
    is_low_stock: false,
    is_aging: false
  });
  loadProducts();
};

const hasActiveFilters = computed((): boolean => {
  return (
    filter.keyword !== undefined && filter.keyword !== '' ||
    filter.category_id !== undefined ||
    filter.quality_level !== undefined ||
    filter.min_price !== undefined ||
    filter.max_price !== undefined ||
    filter.min_stock !== undefined ||
    filter.max_stock !== undefined ||
    filter.supplier !== undefined && filter.supplier !== '' ||
    filter.is_low_stock ||
    filter.is_aging
  );
});

const activeFilterTags = computed((): Record<string, string> => {
  const tags: Record<string, string> = {};
  if (filter.keyword) tags.keyword = `关键词: ${filter.keyword}`;
  if (filter.category_id) {
    const cat = categories.value.find((c: Category) => c.id === filter.category_id);
    tags.category_id = `分类: ${cat?.name || filter.category_id}`;
  }
  if (filter.quality_level) tags.quality_level = `品质: ${filter.quality_level}`;
  if (filter.min_price !== undefined) tags.min_price = `最低价: ¥${filter.min_price}`;
  if (filter.max_price !== undefined) tags.max_price = `最高价: ¥${filter.max_price}`;
  if (filter.min_stock !== undefined) tags.min_stock = `最低库存: ${filter.min_stock}`;
  if (filter.max_stock !== undefined) tags.max_stock = `最高库存: ${filter.max_stock}`;
  if (filter.supplier) tags.supplier = `供应商: ${filter.supplier}`;
  if (filter.is_low_stock) tags.is_low_stock = '仅低库存';
  if (filter.is_aging) tags.is_aging = '仅临期';
  return tags;
});

const clearFilter = (key: keyof ProductFilter): void => {
  if (key === 'is_low_stock' || key === 'is_aging') {
    filter[key] = false;
  } else {
    filter[key] = undefined;
  }
  loadProducts();
};

const getQualityTagType = (level: QualityLevel): string => {
  const types: Record<QualityLevel, string> = {
    '普通': 'info',
    '优质': 'success',
    '精品': 'warning',
    '特级': 'danger'
  };
  return types[level] || 'info';
};

const resetProductForm = (): void => {
  Object.assign(productForm, {
    id: undefined,
    name: '',
    category_id: undefined,
    price: 0,
    cost_price: 0,
    stock: 0,
    min_stock: 10,
    unit: '个',
    description: '',
    quality_level: '普通' as QualityLevel,
    warranty_period: 0,
    manufacturing_date: null,
    expiry_date: null,
    supplier: ''
  });
};

const handleAdd = (): void => {
  isEdit.value = false;
  resetProductForm();
  productDialogVisible.value = true;
};

const handleEdit = (row: Product): void => {
  isEdit.value = true;
  Object.assign(productForm, { ...row });
  productDialogVisible.value = true;
};

const handleDelete = async (row: Product): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用品「${row.name}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    await productApi.delete(row.id);
    ElMessage.success('删除成功');
    loadProducts();
  } catch (error: unknown) {
    if (error !== 'cancel' && !(error as { cancel?: boolean })?.cancel) {
      console.error('删除失败', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleProductSubmit = async (): Promise<void> => {
  try {
    await productFormRef.value?.validate();
    submitting.value = true;

    if (isEdit.value && productForm.id) {
      const updateData: UpdateProductForm = { ...productForm } as UpdateProductForm;
      await productApi.update(productForm.id, updateData);
      ElMessage.success('更新成功');
    } else {
      const createData: CreateProductForm = { ...productForm } as CreateProductForm;
      await productApi.create(createData);
      ElMessage.success('新增成功');
    }
    productDialogVisible.value = false;
    loadProducts();
  } catch (error) {
    if (error !== 'cancel' && !error?.cancel) {
      console.error('操作失败', error);
      ElMessage.error('操作失败');
    }
  } finally {
    submitting.value = false;
  }
};

const openInventoryDialog = (type: InventoryOperationType, product: Product): void => {
  inventoryType.value = type;
  currentProduct.value = product;
  Object.assign(inventoryForm, {
    quantity: 1,
    price: type === 'sale' ? product.price : product.cost_price,
    reason: ''
  });
  inventoryDialogVisible.value = true;
};

const handleInbound = (row: Product): void => openInventoryDialog('inbound', row);
const handleSale = (row: Product): void => openInventoryDialog('sale', row);
const handleDefective = (row: Product): void => openInventoryDialog('defective', row);

const handleInventorySubmit = async (): Promise<void> => {
  try {
    await inventoryFormRef.value?.validate();
    if (!currentProduct.value) return;

    submitting.value = true;

    if (inventoryType.value === 'defective' && !inventoryForm.reason.trim()) {
      ElMessage.warning('请输入残次下架原因');
      return;
    }

    const apiMap: Record<InventoryOperationType, () => Promise<unknown>> = {
      inbound: () => {
        const data: InboundForm = {
          product_id: currentProduct.value!.id,
          quantity: inventoryForm.quantity,
          price: inventoryForm.price,
          reason: inventoryForm.reason
        };
        return inventoryApi.inbound(data);
      },
      sale: () => {
        const data: SaleForm = {
          product_id: currentProduct.value!.id,
          quantity: inventoryForm.quantity,
          price: inventoryForm.price,
          reason: inventoryForm.reason
        };
        return inventoryApi.sale(data);
      },
      defective: () => {
        const data: DefectiveForm = {
          product_id: currentProduct.value!.id,
          quantity: inventoryForm.quantity,
          reason: inventoryForm.reason
        };
        return inventoryApi.defective(data);
      }
    };

    await apiMap[inventoryType.value]();
    ElMessage.success('操作成功');
    inventoryDialogVisible.value = false;
    loadProducts();
  } catch (error: unknown) {
    console.error('操作失败', error);
    const axiosError = error as AxiosErrorResponse;
    const errorMsg = axiosError?.response?.data?.message || '操作失败';
    ElMessage.error(errorMsg);
  } finally {
    submitting.value = false;
  }
};

onMounted((): void => {
  loadCategories();
  loadProducts();
});
</script>

<style scoped>
.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
.text-warning {
  color: #e6a23c;
  font-weight: bold;
}
.filter-panel {
  margin-bottom: 20px;
}
.filter-panel :deep(.el-collapse-item__header) {
  background-color: #f5f7fa;
  padding-left: 20px;
  font-weight: 600;
}
.filter-panel :deep(.el-collapse-item__wrap) {
  background-color: #fff;
}
.filter-actions {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px;
  margin-top: 12px;
  background-color: #fafbfc;
  border-radius: 4px;
}
.active-filters .filter-label {
  color: #606266;
  font-size: 14px;
}
</style>
