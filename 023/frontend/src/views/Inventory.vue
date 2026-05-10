<template>
  <div class="container">
    <div class="page-header">
      <h2>出入库管理</h2>
      <div class="header-actions">
        <el-button type="success" @click="openInboundDialog">
          <el-icon><Plus /></el-icon>
          新增入库
        </el-button>
        <el-button type="warning" @click="openSaleDialog">
          <el-icon><Minus /></el-icon>
          新增售卖
        </el-button>
        <el-button type="danger" @click="openDefectiveDialog">
          <el-icon><Delete /></el-icon>
          残次下架
        </el-button>
      </div>
    </div>

    <div class="filter-panel">
      <el-form :inline="true" :model="filter" class="filter-row">
        <el-form-item label="操作类型">
          <el-select v-model="filter.type" placeholder="全部" clearable style="width: 160px">
            <el-option v-for="type in INVENTORY_TYPES" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
        <el-form-item label="用品名称">
          <el-select
            v-model="filter.product_id"
            filterable
            placeholder="选择用品"
            clearable
            style="width: 250px"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="applyFilter">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="paginatedLogs" row-key="id" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="product_name" label="用品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="操作类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small" effect="light">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" align="right" />
        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.type !== '残次下架'">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row.type !== '残次下架'">¥{{ row.price.toFixed(2) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因/备注" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.reason || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="操作时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="filteredLogs.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredLogs.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" :rules="currentRules" ref="formRef" label-width="100px">
        <el-form-item label="用品" prop="product_id">
          <el-select
            v-model="form.product_id"
            filterable
            placeholder="请选择用品"
            style="width: 100%"
            @change="handleProductChange"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="`${product.name} (库存: ${product.stock})`"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.product_id" label="当前库存">
          <el-input :model-value="selectedProduct?.stock" disabled />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="form.quantity"
            :min="1"
            :max="operationType === 'inbound' ? undefined : (selectedProduct?.stock || 0)"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="operationType !== 'defective'" label="单价" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item
          v-if="operationType === 'defective'"
          label="下架原因"
          prop="reason"
        >
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入残次下架原因（必填）"
          />
        </el-form-item>
        <el-form-item v-else label="备注原因">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="2"
            placeholder="请输入原因或备注（可选）"
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
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { inventoryApi, productApi, INVENTORY_TYPES } from '@/api';
import type {
  InventoryLog,
  Product,
  InventoryFilter,
  InboundForm,
  SaleForm,
  DefectiveForm,
  InventoryType,
  AxiosErrorResponse
} from '@/types';

type OperationType = 'inbound' | 'sale' | 'defective';

const logs = ref<InventoryLog[]>([]);
const products = ref<Product[]>([]);
const dialogVisible = ref(false);
const operationType = ref<OperationType>('inbound');
const formRef = ref<FormInstance>();
const selectedProduct = ref<Product | null>(null);
const submitting = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);

const filter = reactive<InventoryFilter>({
  type: undefined,
  product_id: undefined
});

const form = reactive<{
  product_id: number | undefined;
  quantity: number;
  price: number;
  reason: string;
}>({
  product_id: undefined,
  quantity: 1,
  price: 0,
  reason: ''
});

const baseRules: FormRules = {
  product_id: [
    { required: true, message: '请选择用品', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' }
  ]
};

const priceRules: FormRules = {
  ...baseRules,
  price: [
    { required: true, message: '请输入单价', trigger: 'blur' }
  ]
};

const defectiveRules: FormRules = {
  ...baseRules,
  reason: [
    { required: true, message: '请输入残次下架原因', trigger: 'blur' }
  ]
};

const currentRules = computed<FormRules>(() => {
  if (operationType.value === 'defective') {
    return defectiveRules;
  }
  if (operationType.value === 'sale' || operationType.value === 'inbound') {
    return priceRules;
  }
  return baseRules;
});

const dialogTitle = computed((): string => {
  const titles: Record<OperationType, string> = {
    inbound: '新增入库',
    sale: '新增售卖',
    defective: '残次下架'
  };
  return titles[operationType.value];
});

const filteredLogs = computed<InventoryLog[]>(() => {
  let result = [...logs.value];
  if (filter.type) {
    result = result.filter(l => l.type === filter.type);
  }
  if (filter.product_id) {
    result = result.filter(l => l.product_id === filter.product_id);
  }
  return result;
});

const paginatedLogs = computed<InventoryLog[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredLogs.value.slice(start, end);
});

const getTypeTagType = (type: InventoryType): string => {
  const types: Record<InventoryType, string> = {
    '入库': 'success',
    '售卖': 'warning',
    '残次下架': 'danger'
  };
  return types[type] || 'info';
};

const loadProducts = async (): Promise<void> => {
  try {
    const res = await productApi.getAll();
    products.value = res.data.data || [];
  } catch (error) {
    console.error('加载用品列表失败', error);
    ElMessage.error('加载用品列表失败');
  }
};

const loadLogs = async (): Promise<void> => {
  try {
    const res = await inventoryApi.getAll();
    logs.value = res.data.data || [];
    currentPage.value = 1;
  } catch (error) {
    console.error('加载出入库记录失败', error);
    ElMessage.error('加载出入库记录失败');
  }
};

const applyFilter = (): void => {
  currentPage.value = 1;
};

const resetFilter = (): void => {
  Object.assign(filter, {
    type: undefined,
    product_id: undefined
  });
  currentPage.value = 1;
};

const handleSizeChange = (val: number): void => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number): void => {
  currentPage.value = val;
};

const openDialog = (type: OperationType): void => {
  operationType.value = type;
  Object.assign(form, {
    product_id: undefined,
    quantity: 1,
    price: 0,
    reason: ''
  });
  selectedProduct.value = null;
  dialogVisible.value = true;
};

const openInboundDialog = (): void => openDialog('inbound');
const openSaleDialog = (): void => openDialog('sale');
const openDefectiveDialog = (): void => openDialog('defective');

const handleProductChange = (productId: number): void => {
  selectedProduct.value = products.value.find(p => p.id === productId) || null;
  if (selectedProduct.value) {
    form.price = operationType.value === 'sale'
      ? selectedProduct.value.price
      : selectedProduct.value.cost_price;
  }
};

const handleSubmit = async (): Promise<void> => {
  try {
    await formRef.value?.validate();
    if (!form.product_id) {
      ElMessage.warning('请选择用品');
      return;
    }

    if (operationType.value === 'defective' && !form.reason.trim()) {
      ElMessage.warning('请输入残次下架原因');
      return;
    }

    submitting.value = true;

    const apiMap: Record<OperationType, () => Promise<unknown>> = {
      inbound: () => {
        const data: InboundForm = {
          product_id: form.product_id!,
          quantity: form.quantity,
          price: form.price,
          reason: form.reason
        };
        return inventoryApi.inbound(data);
      },
      sale: () => {
        const data: SaleForm = {
          product_id: form.product_id!,
          quantity: form.quantity,
          price: form.price,
          reason: form.reason
        };
        return inventoryApi.sale(data);
      },
      defective: () => {
        const data: DefectiveForm = {
          product_id: form.product_id!,
          quantity: form.quantity,
          reason: form.reason
        };
        return inventoryApi.defective(data);
      }
    };

    await apiMap[operationType.value]();
    ElMessage.success('操作成功');
    dialogVisible.value = false;
    loadLogs();
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

const formatTime = (time: string): string => {
  return new Date(time).toLocaleString('zh-CN');
};

onMounted((): void => {
  loadProducts();
  loadLogs();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
