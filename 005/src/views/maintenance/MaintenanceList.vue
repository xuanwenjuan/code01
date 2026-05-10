<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">标本养护</h2>
      <div class="flex gap-2">
        <button class="btn btn-warning btn-sm" @click="openDamageModal">
          <span>+</span> 破损登记
        </button>
        <button class="btn btn-primary btn-sm" @click="openScheduleModal">
          <span>+</span> 新建养护计划
        </button>
      </div>
    </div>

    <div v-if="maintenanceStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <EmptyState
      v-else-if="maintenanceStore.maintenanceRecords.length === 0"
      message="暂无养护记录"
    />

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>类型</th>
            <th>标本信息</th>
            <th>养护类型</th>
            <th>破损程度</th>
            <th>计划日期</th>
            <th>完成日期</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in maintenanceStore.maintenanceRecords" :key="record.id">
            <td>
              <span :class="['badge', record.isDamage ? 'badge-danger' : 'badge-primary']">
                {{ record.isDamage ? '破损养护' : '常规养护' }}
              </span>
            </td>
            <td>
              <div style="font-weight: 600;">{{ record.specimenName }}</div>
            </td>
            <td>{{ record.maintenanceType }}</td>
            <td>
              <span v-if="record.damageLevel" :class="['badge', getDamageLevelBadge(record.damageLevel)]">
                {{ record.damageLevel }}
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ record.maintenanceDate }}</td>
            <td>{{ record.completedDate ? formatDate(record.completedDate) : '-' }}</td>
            <td>
              <span
                :class="['badge', record.status === 'completed' ? 'badge-success' : (isOverdue(record) ? 'badge-danger' : 'badge-warning')]"
              >
                {{ record.status === 'completed' ? '已完成' : (isOverdue(record) ? '已逾期' : '待处理') }}
              </span>
            </td>
            <td>
              <button
                v-if="record.status !== 'completed'"
                class="btn btn-success btn-sm"
                @click="openCompleteModal(record)"
              >
                完成养护
              </button>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="maintenanceStore.overdueMaintenance.length > 0" class="mt-3" style="padding: 15px; background: #f8d7da; border-radius: 8px;">
      <div style="font-weight: 600; color: #721c24; margin-bottom: 8px;">
        ⚠️ 有 {{ maintenanceStore.overdueMaintenance.length }} 个养护计划已逾期
      </div>
      <div style="font-size: 13px; color: #721c24;">
        请及时处理逾期的养护任务，确保标本保存完好。
      </div>
    </div>

    <div v-if="maintenanceStore.upcomingMaintenance.length > 0" class="mt-3" style="padding: 15px; background: #fff3cd; border-radius: 8px;">
      <div style="font-weight: 600; color: #856404; margin-bottom: 8px;">
        🔔 有 {{ maintenanceStore.upcomingMaintenance.length }} 个养护计划即将到期
      </div>
      <div style="font-size: 13px; color: #856404;">
        未来30天内有养护任务需要执行，请提前做好准备。
      </div>
    </div>

    <Teleport to="body">
      <div v-if="damageModalVisible" class="modal-overlay" @click.self="closeDamageModal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">破损登记</h3>
            <button class="modal-close" @click="closeDamageModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">选择标本 <span style="color: #dc3545;">*</span></label>
              <select
                v-model="damageForm.specimenId"
                class="form-select"
                :class="{ 'input-error': damageErrors.specimenId }"
              >
                <option value="">请选择破损的标本</option>
                <optgroup
                  v-for="cat in categoryStore.categories"
                  :key="cat.id"
                  :label="cat.name"
                >
                  <option
                    v-for="specimen in specimenStore.specimens.filter(s => s.categoryId === cat.id && s.status !== 'damaged')"
                    :key="specimen.id"
                    :value="specimen.id"
                  >
                    {{ specimen.name }} (编号: {{ specimen.code }})
                  </option>
                </optgroup>
              </select>
              <div v-if="damageErrors.specimenId" class="form-error">{{ damageErrors.specimenId }}</div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">破损程度 <span style="color: #dc3545;">*</span></label>
                <select
                  v-model="damageForm.damageLevel"
                  class="form-select"
                  :class="{ 'input-error': damageErrors.damageLevel }"
                >
                  <option value="">请选择破损程度</option>
                  <option value="轻微">轻微</option>
                  <option value="中等">中等</option>
                  <option value="严重">严重</option>
                  <option value="损毁">损毁</option>
                </select>
                <div v-if="damageErrors.damageLevel" class="form-error">{{ damageErrors.damageLevel }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">养护类型 <span style="color: #dc3545;">*</span></label>
                <select
                  v-model="damageForm.maintenanceType"
                  class="form-select"
                  :class="{ 'input-error': damageErrors.maintenanceType }"
                >
                  <option value="">请选择养护类型</option>
                  <option value="修复养护">修复养护</option>
                  <option value="清洁处理">清洁处理</option>
                  <option value="消毒处理">消毒处理</option>
                  <option value="密封处理">密封处理</option>
                  <option value="重新装订">重新装订</option>
                </select>
                <div v-if="damageErrors.maintenanceType" class="form-error">{{ damageErrors.maintenanceType }}</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">破损原因</label>
              <textarea
                v-model="damageForm.damageReason"
                class="form-textarea"
                placeholder="请描述破损原因"
                rows="2"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">养护计划日期 <span style="color: #dc3545;">*</span></label>
              <input
                v-model="damageForm.maintenanceDate"
                type="date"
                class="form-input"
                :class="{ 'input-error': damageErrors.maintenanceDate }"
                :min="minDate"
              />
              <div v-if="damageErrors.maintenanceDate" class="form-error">{{ damageErrors.maintenanceDate }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">经办人</label>
              <input
                v-model="damageForm.operator"
                type="text"
                class="form-input"
                placeholder="请输入经办人姓名"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDamageModal">取消</button>
            <button class="btn btn-warning" @click="handleDamage">登记破损</button>
          </div>
        </div>
      </div>

      <div v-if="scheduleModalVisible" class="modal-overlay" @click.self="closeScheduleModal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">新建养护计划</h3>
            <button class="modal-close" @click="closeScheduleModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">选择标本 <span style="color: #dc3545;">*</span></label>
              <select
                v-model="scheduleForm.specimenId"
                class="form-select"
                :class="{ 'input-error': scheduleErrors.specimenId }"
              >
                <option value="">请选择需要养护的标本</option>
                <optgroup
                  v-for="cat in categoryStore.categories"
                  :key="cat.id"
                  :label="cat.name"
                >
                  <option
                    v-for="specimen in specimenStore.specimens.filter(s => s.categoryId === cat.id)"
                    :key="specimen.id"
                    :value="specimen.id"
                  >
                    {{ specimen.name }} (编号: {{ specimen.code }})
                  </option>
                </optgroup>
              </select>
              <div v-if="scheduleErrors.specimenId" class="form-error">{{ scheduleErrors.specimenId }}</div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">养护类型 <span style="color: #dc3545;">*</span></label>
                <select
                  v-model="scheduleForm.maintenanceType"
                  class="form-select"
                  :class="{ 'input-error': scheduleErrors.maintenanceType }"
                >
                  <option value="">请选择养护类型</option>
                  <option value="日常检查">日常检查</option>
                  <option value="环境调整">环境调整</option>
                  <option value="消毒处理">消毒处理</option>
                  <option value="防潮处理">防潮处理</option>
                  <option value="虫害防治">虫害防治</option>
                  <option value="修复养护">修复养护</option>
                </select>
                <div v-if="scheduleErrors.maintenanceType" class="form-error">{{ scheduleErrors.maintenanceType }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">计划日期 <span style="color: #dc3545;">*</span></label>
                <input
                  v-model="scheduleForm.maintenanceDate"
                  type="date"
                  class="form-input"
                  :class="{ 'input-error': scheduleErrors.maintenanceDate }"
                  :min="minDate"
                />
                <div v-if="scheduleErrors.maintenanceDate" class="form-error">{{ scheduleErrors.maintenanceDate }}</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">养护说明</label>
              <textarea
                v-model="scheduleForm.notes"
                class="form-textarea"
                placeholder="请输入养护说明"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeScheduleModal">取消</button>
            <button class="btn btn-primary" @click="handleSchedule">创建计划</button>
          </div>
        </div>
      </div>

      <div v-if="completeModalVisible" class="modal-overlay" @click.self="closeCompleteModal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">完成养护</h3>
            <button class="modal-close" @click="closeCompleteModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">标本名称</label>
              <input
                type="text"
                class="form-input"
                :value="currentRecord?.specimenName"
                disabled
              />
            </div>
            <div v-if="currentRecord?.isDamage" class="form-group">
              <label class="form-label">破损程度</label>
              <input
                type="text"
                class="form-input"
                :value="currentRecord?.damageLevel"
                disabled
              />
            </div>
            <div class="form-group">
              <label class="form-label">养护记录 <span style="color: #dc3545;">*</span></label>
              <textarea
                v-model="completeForm.notes"
                class="form-textarea"
                :class="{ 'input-error': completeErrors.notes }"
                placeholder="请详细记录养护过程和结果"
                rows="4"
              ></textarea>
              <div v-if="completeErrors.notes" class="form-error">{{ completeErrors.notes }}</div>
            </div>
            <div v-if="currentRecord?.isDamage" class="form-group">
              <label class="form-label">养护后状态</label>
              <select v-model="completeForm.afterStatus" class="form-select">
                <option value="normal">恢复正常</option>
                <option value="damaged">仍需持续观察</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeCompleteModal">取消</button>
            <button class="btn btn-primary" @click="handleComplete">确认完成</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMaintenanceStore } from '../../stores/maintenance'
import { useSpecimenStore } from '../../stores/specimen'
import { useCategoryStore } from '../../stores/category'
import { useAppStore } from '../../stores/app'
import { useLogStore } from '../../stores/log'
import { createRule, validateForm } from '../../utils/validators'
import { formatDate } from '../../utils/helpers'
import EmptyState from '../../components/EmptyState.vue'

const maintenanceStore = useMaintenanceStore()
const specimenStore = useSpecimenStore()
const categoryStore = useCategoryStore()
const appStore = useAppStore()
const logStore = useLogStore()

const minDate = formatDate(new Date())

const isOverdue = (record) => {
  if (record.status === 'completed' || !record.maintenanceDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(record.maintenanceDate) < today
}

const getDamageLevelBadge = (level) => {
  if (level === '严重' || level === '损毁') return 'badge-danger'
  if (level === '中等') return 'badge-warning'
  return 'badge-info'
}

const damageModalVisible = ref(false)
const damageForm = reactive({
  specimenId: '',
  damageLevel: '',
  maintenanceType: '',
  damageReason: '',
  maintenanceDate: '',
  operator: ''
})
const damageErrors = reactive({})

const scheduleModalVisible = ref(false)
const scheduleForm = reactive({
  specimenId: '',
  maintenanceType: '',
  maintenanceDate: '',
  notes: ''
})
const scheduleErrors = reactive({})

const completeModalVisible = ref(false)
const currentRecord = ref(null)
const completeForm = reactive({
  notes: '',
  afterStatus: 'normal'
})
const completeErrors = reactive({})

const openDamageModal = () => {
  damageForm.specimenId = ''
  damageForm.damageLevel = ''
  damageForm.maintenanceType = ''
  damageForm.damageReason = ''
  damageForm.maintenanceDate = ''
  damageForm.operator = ''
  Object.keys(damageErrors).forEach(key => delete damageErrors[key])
  damageModalVisible.value = true
}

const closeDamageModal = () => {
  damageModalVisible.value = false
}

const handleDamage = async () => {
  const rules = {
    specimenId: [createRule('required', '请选择破损的标本')],
    damageLevel: [createRule('required', '请选择破损程度')],
    maintenanceType: [createRule('required', '请选择养护类型')],
    maintenanceDate: [createRule('required', '请选择养护计划日期')]
  }

  const { isValid, errors: validationErrors } = validateForm(damageForm, rules)
  Object.keys(damageErrors).forEach(key => delete damageErrors[key])
  Object.assign(damageErrors, validationErrors)

  if (!isValid) return

  try {
    const specimen = specimenStore.specimens.find(s => s.id === Number(damageForm.specimenId))
    
    await specimenStore.updateSpecimenStatus(Number(damageForm.specimenId), 'maintenance')
    
    await maintenanceStore.addMaintenanceRecord({
      specimenId: Number(damageForm.specimenId),
      specimenName: specimen?.name,
      maintenanceType: damageForm.maintenanceType,
      maintenanceDate: damageForm.maintenanceDate,
      notes: damageForm.damageReason,
      isDamage: true,
      damageLevel: damageForm.damageLevel,
      damageReason: damageForm.damageReason,
      operator: damageForm.operator
    })

    await logStore.logOperation('status_change', `标本状态变更为养护中: ${specimen?.name}`, {
      specimenName: specimen?.name,
      oldStatus: specimen?.status,
      newStatus: 'maintenance',
      reason: `破损登记: ${damageForm.damageLevel}`
    })

    appStore.success('破损登记成功')
    await logStore.logOperation('damage_report', `登记了标本破损: ${specimen?.name}`, {
      specimenName: specimen?.name,
      damageLevel: damageForm.damageLevel,
      damageReason: damageForm.damageReason,
      operator: damageForm.operator
    })
    closeDamageModal()
  } catch (error) {
    console.error('破损登记失败:', error)
    appStore.error('破损登记失败，请重试')
  }
}

const openScheduleModal = () => {
  scheduleForm.specimenId = ''
  scheduleForm.maintenanceType = ''
  scheduleForm.maintenanceDate = ''
  scheduleForm.notes = ''
  Object.keys(scheduleErrors).forEach(key => delete scheduleErrors[key])
  scheduleModalVisible.value = true
}

const closeScheduleModal = () => {
  scheduleModalVisible.value = false
}

const handleSchedule = async () => {
  const rules = {
    specimenId: [createRule('required', '请选择需要养护的标本')],
    maintenanceType: [createRule('required', '请选择养护类型')],
    maintenanceDate: [createRule('required', '请选择计划日期')]
  }

  const { isValid, errors: validationErrors } = validateForm(scheduleForm, rules)
  Object.keys(scheduleErrors).forEach(key => delete scheduleErrors[key])
  Object.assign(scheduleErrors, validationErrors)

  if (!isValid) return

  try {
    const specimen = specimenStore.specimens.find(s => s.id === Number(scheduleForm.specimenId))
    await maintenanceStore.addMaintenanceRecord({
      specimenId: Number(scheduleForm.specimenId),
      specimenName: specimen?.name,
      maintenanceType: scheduleForm.maintenanceType,
      maintenanceDate: scheduleForm.maintenanceDate,
      notes: scheduleForm.notes
    })

    appStore.success('养护计划创建成功')
    await logStore.logOperation('maintenance_schedule', `创建了养护计划: ${specimen?.name}`, {
      specimenName: specimen?.name,
      maintenanceType: scheduleForm.maintenanceType,
      maintenanceDate: scheduleForm.maintenanceDate
    })
    closeScheduleModal()
  } catch (error) {
    console.error('创建养护计划失败:', error)
    appStore.error('创建养护计划失败，请重试')
  }
}

const openCompleteModal = (record) => {
  currentRecord.value = record
  completeForm.notes = ''
  Object.keys(completeErrors).forEach(key => delete completeErrors[key])
  completeModalVisible.value = true
}

const closeCompleteModal = () => {
  completeModalVisible.value = false
  currentRecord.value = null
}

const handleComplete = async () => {
  const rules = {
    notes: [createRule('required', '请填写养护记录')]
  }

  const { isValid, errors: validationErrors } = validateForm(completeForm, rules)
  Object.keys(completeErrors).forEach(key => delete completeErrors[key])
  Object.assign(completeErrors, validationErrors)

  if (!isValid) return

  try {
    await maintenanceStore.completeMaintenance(
      currentRecord.value.id,
      completeForm.notes
    )

    const specimen = await specimenStore.getSpecimen(currentRecord.value.specimenId)
    
    if (currentRecord.value.isDamage) {
      const newStatus = completeForm.afterStatus === 'normal' ? 'normal' : 'damaged'
      await specimenStore.updateSpecimenStatus(currentRecord.value.specimenId, newStatus)
      
      await logStore.logOperation('maintenance_complete', `完成了破损养护: ${currentRecord.value.specimenName}`, {
        specimenName: currentRecord.value.specimenName,
        maintenanceType: currentRecord.value.maintenanceType,
        damageLevel: currentRecord.value.damageLevel,
        afterStatus: completeForm.afterStatus
      })

      if (specimen && newStatus !== specimen.status) {
        await logStore.logOperation('status_change', `标本状态变更: ${specimen.name}`, {
          specimenName: specimen.name,
          oldStatus: specimen.status,
          newStatus: newStatus,
          reason: '破损养护完成'
        })
      }

      if (newStatus === 'normal') {
        appStore.success('破损养护完成，标本已恢复正常')
      } else {
        appStore.warning('破损养护完成，标本需持续观察')
      }
    } else {
      if (specimen && specimen.status === 'maintenance') {
        await specimenStore.updateSpecimenStatus(currentRecord.value.specimenId, 'normal')
        await logStore.logOperation('status_change', `标本状态变更为正常: ${specimen.name}`, {
          specimenName: specimen.name,
          oldStatus: 'maintenance',
          newStatus: 'normal'
        })
      }

      appStore.success('养护记录完成')
      await logStore.logOperation('maintenance_complete', `完成了养护: ${currentRecord.value.specimenName}`, {
        specimenName: currentRecord.value.specimenName,
        maintenanceType: currentRecord.value.maintenanceType
      })
    }

    closeCompleteModal()
  } catch (error) {
    console.error('完成养护失败:', error)
    appStore.error('操作失败，请重试')
  }
}
</script>