<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { Medicine, MedicineCategory } from '@/types'
import { MedicineCategoryLabels } from '@/types'
import { useMedicineStore } from '@/stores/medicine'

interface MedicineFormData {
  name: string
  category: MedicineCategory
  manufacturer: string
  spec: string
  quantity: number
  unit: string
  expireDate: string
}

interface CategoryOption {
  value: MedicineCategory
  label: string
}

interface Props {
  visible: boolean
  medicine?: Medicine | null
}

const props = withDefaults(defineProps<Props>(), {
  medicine: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const medicineStore = useMedicineStore()

const isEdit = computed<boolean>(() => !!props.medicine)
const dialogTitle = computed<string>(() => isEdit.value ? '编辑药品' : '新增药品')

const formData = ref<MedicineFormData>({
  name: '',
  category: 'cold',
  manufacturer: '',
  spec: '',
  quantity: 1,
  unit: '盒',
  expireDate: ''
})

const categoryOptions = computed<CategoryOption[]>(() => 
  Object.entries(MedicineCategoryLabels).map(([value, label]) => ({
    value: value as MedicineCategory,
    label
  }))
)

const unitOptions: string[] = ['盒', '瓶', '片', '粒', '支', '袋']

const formRef = ref<FormInstance>()

const rules: FormRules = {
  name: [{ required: true, message: '请输入药品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择药品分类', trigger: 'change' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  spec: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
  expireDate: [{ required: true, message: '请选择保质期', trigger: 'change' }]
}

function resetForm(): void {
  formData.value = {
    name: '',
    category: 'cold',
    manufacturer: '',
    spec: '',
    quantity: 1,
    unit: '盒',
    expireDate: ''
  }
}

watch(
  () => props.visible,
  (val: boolean) => {
    if (val) {
      resetForm()
      if (props.medicine) {
        formData.value = {
          name: props.medicine.name,
          category: props.medicine.category,
          manufacturer: props.medicine.manufacturer,
          spec: props.medicine.spec,
          quantity: props.medicine.quantity,
          unit: props.medicine.unit,
          expireDate: props.medicine.expireDate
        }
      }
    }
  }
)

function handleClose(): void {
  emit('update:visible', false)
  resetForm()
}

async function handleSubmit(): Promise<void> {
  if (!formRef.value) return
  await formRef.value.validate()
  
  if (isEdit.value && props.medicine) {
    medicineStore.updateMedicine(props.medicine.id, formData.value)
    ElMessage.success('药品信息更新成功')
  } else {
    medicineStore.addMedicine(formData.value)
    ElMessage.success('药品添加成功')
  }
  
  emit('success')
  handleClose()
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="500px"
    @update:model-value="(val: boolean) => emit('update:visible', val)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="药品名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入药品名称" />
      </el-form-item>
      <el-form-item label="药品分类" prop="category">
        <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生产厂家" prop="manufacturer">
        <el-input v-model="formData.manufacturer" placeholder="请输入生产厂家" />
      </el-form-item>
      <el-form-item label="规格" prop="spec">
        <el-input v-model="formData.spec" placeholder="请输入规格" />
      </el-form-item>
      <el-form-item label="库存数量">
        <el-row :gutter="10">
          <el-col :span="16">
            <el-form-item prop="quantity">
              <el-input-number v-model="formData.quantity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="unit">
              <el-select v-model="formData.unit" style="width: 100%">
                <el-option v-for="unit in unitOptions" :key="unit" :label="unit" :value="unit" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="保质期" prop="expireDate">
        <el-date-picker
          v-model="formData.expireDate"
          type="date"
          placeholder="选择保质期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
