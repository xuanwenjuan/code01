<template>
  <div class="page-container">
    <div class="page-header">
      <div class="flex-between">
        <div>
          <h2 style="margin: 0; color: #303133">房型管理</h2>
          <span style="color: #909399; font-size: 14px; margin-left: 12px">
            共 {{ hotelStore.roomTypes.length }} 种房型
          </span>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增房型
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        v-for="roomType in hotelStore.roomTypes"
        :key="roomType.id"
      >
        <el-card class="room-type-card" shadow="hover">
          <div class="card-image">
            <img :src="roomType.image" :alt="roomType.name" />
            <div class="card-badge">
              <el-tag type="primary" size="small">
                {{ getRoomTypeCount(roomType.code) }} 间
              </el-tag>
            </div>
          </div>
          <div class="card-content">
            <div class="card-header">
              <h3 class="room-type-name">{{ roomType.name }}</h3>
              <span class="room-type-price">
                {{ formatCurrency(roomType.price) }}/晚
              </span>
            </div>
            <div class="room-type-info">
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>可住{{ roomType.capacity }}人</span>
              </div>
              <div class="info-item">
                <el-icon><Bed /></el-icon>
                <span>{{ roomType.bedCount }}张床</span>
              </div>
              <div class="info-item">
                <el-icon><LocationFilled /></el-icon>
                <span>{{ roomType.area }}㎡</span>
              </div>
            </div>
            <p class="room-type-desc">{{ roomType.description }}</p>
            <div class="amenities">
              <el-tag
                v-for="amenity in roomType.amenities"
                :key="amenity"
                size="small"
                effect="plain"
              >
                {{ amenity }}
              </el-tag>
            </div>
            <div class="card-actions">
              <el-button type="primary" link @click="handleEdit(roomType)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(roomType)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑房型' : '新增房型'"
      width="650px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="房型名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入房型名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number
                v-model="formData.price"
                :min="0"
                :step="10"
                controls-position="right"
                style="width: 100%"
              />
              <span style="margin-left: 8px; color: #909399">元/晚</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积(㎡)" prop="area">
              <el-input-number
                v-model="formData.area"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入住人数" prop="capacity">
              <el-input-number
                v-model="formData.capacity"
                :min="1"
                :max="10"
                controls-position="right"
                style="width: 100%"
              />
              <span style="margin-left: 8px; color: #909399">人</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="床位数量" prop="bedCount">
              <el-input-number
                v-model="formData.bedCount"
                :min="1"
                :max="5"
                controls-position="right"
                style="width: 100%"
              />
              <span style="margin-left: 8px; color: #909399">张</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="配套设施" prop="amenities">
          <el-select
            v-model="formData.amenities"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入配套设施"
            style="width: 100%"
          >
            <el-option
              v-for="item in amenityOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房型描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入房型描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dayjs from 'dayjs'
import { RoomType, type RoomTypeConfig } from '@/types'
import { AMENITY_OPTIONS, formatCurrency, generateId } from '@/utils'
import { useHotelStore } from '@/stores/hotel'
import { useUserStore } from '@/stores/user'

const hotelStore = useHotelStore()
const userStore = useUserStore()
const formRef = ref<FormInstance>()

const dialogVisible = ref(false)
const isEdit = ref(false)

const amenityOptions = AMENITY_OPTIONS

const defaultFormData = {
  id: '',
  name: '',
  code: RoomType.DELUXE_SINGLE,
  price: 388,
  capacity: 2,
  bedCount: 1,
  area: 30,
  amenities: [] as string[],
  description: '',
  image: 'https://picsum.photos/400/300?random=' + Date.now(),
  createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
}

const formData = reactive<RoomTypeConfig>({ ...defaultFormData })

const rules: FormRules = {
  name: [{ required: true, message: '请输入房型名称', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入价格', trigger: 'change' },
    { type: 'number', min: 0, message: '价格不能为负数', trigger: 'change' }
  ],
  capacity: [
    { required: true, message: '请输入入住人数', trigger: 'change' },
    { type: 'number', min: 1, message: '入住人数至少为1', trigger: 'change' }
  ],
  bedCount: [
    { required: true, message: '请输入床位数量', trigger: 'change' },
    { type: 'number', min: 1, message: '床位数量至少为1', trigger: 'change' }
  ],
  area: [
    { required: true, message: '请输入面积', trigger: 'change' },
    { type: 'number', min: 0, message: '面积不能为负数', trigger: 'change' }
  ],
  description: [{ required: true, message: '请输入房型描述', trigger: 'blur' }]
}

const getRoomTypeCount = (typeCode: RoomType): number => {
  return hotelStore.rooms.filter((room) => room.typeCode === typeCode).length
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, defaultFormData)
  formData.image = 'https://picsum.photos/400/300?random=' + Date.now()
  formData.createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  formData.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  dialogVisible.value = true
}

const handleEdit = (roomType: RoomTypeConfig) => {
  isEdit.value = true
  Object.assign(formData, roomType)
  dialogVisible.value = true
}

const handleDelete = async (roomType: RoomTypeConfig) => {
  const roomCount = getRoomTypeCount(roomType.code)

  if (roomCount > 0) {
    ElMessage.warning(`该房型下还有 ${roomCount} 间客房，请先删除或修改这些客房`)
    return
  }

  try {
    await ElMessageBox.confirm(`确认删除房型"${roomType.name}"？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const success = hotelStore.deleteRoomType(roomType.id)
    if (success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // 用户取消
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (isEdit.value) {
      const updates: Partial<RoomTypeConfig> = {
        name: formData.name,
        code: formData.code,
        price: formData.price,
        capacity: formData.capacity,
        bedCount: formData.bedCount,
        area: formData.area,
        amenities: formData.amenities,
        description: formData.description,
        image: formData.image
      }

      const success = hotelStore.updateRoomTypeConfig(formData.id, updates)
      if (success) {
        ElMessage.success('更新成功')
      } else {
        ElMessage.error('更新失败')
      }
    } else {
      const newRoomType: Omit<RoomTypeConfig, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        code: formData.code,
        price: formData.price,
        capacity: formData.capacity,
        bedCount: formData.bedCount,
        area: formData.area,
        amenities: formData.amenities,
        description: formData.description,
        image: formData.image
      }

      const success = hotelStore.addRoomType(newRoomType)
      if (success) {
        ElMessage.success('新增成功')
      } else {
        ElMessage.error('新增失败')
      }
    }

    dialogVisible.value = false
  } catch {
    // 验证失败
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 20px;
}

.room-type-card {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding: 0;
    overflow: hidden;
  }

  .card-image {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .card-badge {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  &:hover .card-image img {
    transform: scale(1.05);
  }

  .card-content {
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .room-type-name {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }

    .room-type-price {
      font-size: 18px;
      font-weight: 700;
      color: #f56c6c;
    }
  }

  .room-type-info {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #606266;

      .el-icon {
        color: #909399;
      }
    }
  }

  .room-type-desc {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .amenities {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid #ebeef5;
    padding-top: 12px;
  }
}
</style>
