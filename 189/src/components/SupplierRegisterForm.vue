<template>
  <div class="register-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="right"
      class="form-content"
    >
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        
        <el-form-item label="企业名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入企业全称" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="统一社会信用代码" prop="creditCode">
          <el-input v-model="form.creditCode" placeholder="请输入18位统一社会信用代码" maxlength="18" />
        </el-form-item>

        <el-form-item label="企业类型" prop="companyType">
          <el-select v-model="form.companyType" placeholder="请选择企业类型" style="width: 100%">
            <el-option label="生产型企业" value="production" />
            <el-option label="贸易型企业" value="trade" />
            <el-option label="生产+贸易型" value="production_trade" />
            <el-option label="个体工商户" value="individual" />
          </el-select>
        </el-form-item>

        <el-form-item label="成立时间" prop="establishDate">
          <el-date-picker
            v-model="form.establishDate"
            type="date"
            placeholder="选择成立日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="注册资本" prop="registeredCapital">
          <el-input-number v-model="form.registeredCapital" :min="1" :max="99999" style="width: 100%">
            <template #append>万元</template>
          </el-input-number>
        </el-form-item>
      </div>

      <div class="form-section">
        <h3 class="section-title">联系人信息</h3>

        <el-form-item label="联系人姓名" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人姓名" maxlength="20" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入11位手机号码" maxlength="11" />
        </el-form-item>

        <el-form-item label="电子邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入企业邮箱" />
        </el-form-item>

        <el-form-item label="微信号" prop="wechat">
          <el-input v-model="form.wechat" placeholder="请输入微信号（选填）" />
        </el-form-item>
      </div>

      <div class="form-section">
        <h3 class="section-title">经营信息</h3>

        <el-form-item label="经营地址" prop="businessAddress">
          <el-input v-model="form.businessAddress" type="textarea" :rows="2" placeholder="请输入详细经营地址" />
        </el-form-item>

        <el-form-item label="主营品类" prop="mainCategories">
          <el-select
            v-model="form.mainCategories"
            multiple
            filterable
            placeholder="请选择主营原料品类（最多5个）"
            style="width: 100%"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="年营业额" prop="annualRevenue">
          <el-select v-model="form.annualRevenue" placeholder="请选择年营业额范围" style="width: 100%">
            <el-option label="50万以下" value="below_50w" />
            <el-option label="50-200万" value="50w_200w" />
            <el-option label="200-500万" value="200w_500w" />
            <el-option label="500-1000万" value="500w_1000w" />
            <el-option label="1000万以上" value="above_1000w" />
          </el-select>
        </el-form-item>

        <el-form-item label="企业简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入企业简介（50-500字）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </div>

      <div class="form-section">
        <h3 class="section-title">资质证明</h3>

        <el-form-item label="营业执照" prop="businessLicense">
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            accept=".jpg,.jpeg,.png,.pdf"
            :on-change="handleLicenseUpload"
          >
            <el-button type="primary">上传营业执照</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 jpg、png、pdf 格式，大小不超过 10MB</div>
            </template>
          </el-upload>
          <div v-if="form.businessLicense" class="file-name">
            <el-icon><Document /></el-icon>
            {{ form.businessLicense }}
          </div>
        </el-form-item>

        <el-form-item label="行业资质" prop="qualifications">
          <el-upload
            action="#"
            :auto-upload="false"
            :multiple="true"
            :limit="5"
            accept=".jpg,.jpeg,.png,.pdf"
            :on-change="handleQualificationUpload"
            :on-remove="handleQualificationRemove"
          >
            <el-button type="primary">上传资质文件</el-button>
            <template #tip>
              <div class="el-upload__tip">可上传多个，支持 jpg、png、pdf 格式，单个不超过 10MB</div>
            </template>
          </el-upload>
          <div v-if="form.qualifications.length > 0" class="file-list">
            <div v-for="(file, index) in form.qualifications" :key="index" class="file-name">
              <el-icon><Document /></el-icon>
              {{ file }}
            </div>
          </div>
        </el-form-item>
      </div>

      <el-form-item>
        <el-checkbox v-model="form.agreed">
          我已阅读并同意 <a href="#" class="link">《平台服务协议》</a> 和 
          <a href="#" class="link">《供应商入驻规范》</a>
        </el-checkbox>
      </el-form-item>

      <div class="form-actions">
        <el-button size="large" @click="handleReset">重置</el-button>
        <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
          提交入驻申请
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { categories } from '@/mock/data'

const emit = defineEmits(['submit', 'success'])

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  companyName: '',
  creditCode: '',
  companyType: '',
  establishDate: '',
  registeredCapital: 100,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  wechat: '',
  businessAddress: '',
  mainCategories: [],
  annualRevenue: '',
  description: '',
  businessLicense: '',
  qualifications: [],
  agreed: false
})

const validateCompanyName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入企业名称'))
  } else if (value.length < 2) {
    callback(new Error('企业名称至少2个字符'))
  } else if (value.length > 50) {
    callback(new Error('企业名称最多50个字符'))
  } else if (/[^\u4e00-\u9fa5a-zA-Z0-9（）()\-·]/.test(value)) {
    callback(new Error('企业名称只能包含中文、英文、数字和括号、连接符'))
  } else if (/^(公司|企业|集团|中心|院|所|厂|店)$/.test(value)) {
    callback(new Error('请输入完整的企业名称'))
  } else {
    callback()
  }
}

const validateCreditCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入统一社会信用代码'))
  } else if (value.length !== 18) {
    callback(new Error('统一社会信用代码必须为18位'))
  } else if (!/^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(value)) {
    callback(new Error('统一社会信用代码格式不正确'))
  } else {
    const weight = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30]
    const characters = '0123456789ABCDEFGHJKLMNPQRTUWXY'
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += characters.indexOf(value[i]) * weight[i]
    }
    const checkCode = characters.charAt((31 - sum % 31) % 31)
    if (checkCode !== value[17]) {
      callback(new Error('统一社会信用代码校验失败，请检查'))
    } else {
      callback()
    }
  }
}

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入联系电话'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入电子邮箱'))
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else if (value.length > 100) {
    callback(new Error('邮箱地址过长'))
  } else {
    callback()
  }
}

const validateWechat = (rule, value, callback) => {
  if (value && !/^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/.test(value)) {
    callback(new Error('微信号格式不正确，需以字母开头，6-20位字母数字下划线减号'))
  } else {
    callback()
  }
}

const validateEstablishDate = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择成立时间'))
  } else {
    const selectedDate = new Date(value)
    const today = new Date()
    const minDate = new Date('1900-01-01')
    if (selectedDate > today) {
      callback(new Error('成立时间不能晚于今天'))
    } else if (selectedDate < minDate) {
      callback(new Error('成立时间不能早于1900年'))
    } else {
      callback()
    }
  }
}

const validateRegisteredCapital = (rule, value, callback) => {
  if (!value && value !== 0) {
    callback(new Error('请输入注册资本'))
  } else if (value < 1) {
    callback(new Error('注册资本至少1万元'))
  } else if (value > 99999) {
    callback(new Error('注册资本最多99999万元'))
  } else {
    callback()
  }
}

const validateAddress = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入经营地址'))
  } else if (value.length < 10) {
    callback(new Error('经营地址至少10个字符，请输入详细地址'))
  } else if (value.length > 200) {
    callback(new Error('经营地址最多200个字符'))
  } else if (value.includes('测试') || value.includes('test')) {
    callback(new Error('请输入真实有效的经营地址'))
  } else {
    callback()
  }
}

const validateCategories = (rule, value, callback) => {
  if (!value || value.length === 0) {
    callback(new Error('请选择至少一个主营品类'))
  } else if (value.length > 5) {
    callback(new Error('最多选择5个主营品类'))
  } else {
    callback()
  }
}

const validateDescription = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入企业简介'))
  } else if (value.length < 50) {
    callback(new Error('企业简介至少50个字，请详细描述企业业务'))
  } else if (value.length > 500) {
    callback(new Error('企业简介最多500个字'))
  } else if (/[<>{}]/.test(value)) {
    callback(new Error('企业简介不能包含特殊字符'))
  } else {
    callback()
  }
}

const validateLicense = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请上传营业执照'))
  } else {
    callback()
  }
}

const validateAgreed = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意相关协议'))
  } else {
    callback()
  }
}

const rules = {
  companyName: [
    { validator: validateCompanyName, trigger: 'blur' }
  ],
  creditCode: [
    { validator: validateCreditCode, trigger: 'blur' }
  ],
  companyType: [
    { required: true, message: '请选择企业类型', trigger: 'change' }
  ],
  establishDate: [
    { validator: validateEstablishDate, trigger: 'change' }
  ],
  registeredCapital: [
    { validator: validateRegisteredCapital, trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2-20个字符', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z·]+$/, message: '姓名只能包含中文、英文和间隔号', trigger: 'blur' }
  ],
  contactPhone: [
    { validator: validatePhone, trigger: 'blur' }
  ],
  contactEmail: [
    { validator: validateEmail, trigger: 'blur' }
  ],
  wechat: [
    { validator: validateWechat, trigger: 'blur' }
  ],
  businessAddress: [
    { validator: validateAddress, trigger: 'blur' }
  ],
  mainCategories: [
    { validator: validateCategories, trigger: 'change' }
  ],
  annualRevenue: [
    { required: true, message: '请选择年营业额范围', trigger: 'change' }
  ],
  description: [
    { validator: validateDescription, trigger: 'blur' }
  ],
  businessLicense: [
    { validator: validateLicense, trigger: 'change' }
  ],
  agreed: [
    { validator: validateAgreed, trigger: 'change' }
  ]
}

function handleLicenseUpload(file) {
  form.businessLicense = file.name
}

function handleQualificationUpload(file) {
  if (form.qualifications.length < 5) {
    form.qualifications.push(file.name)
  }
}

function handleQualificationRemove(file) {
  const index = form.qualifications.indexOf(file.name)
  if (index > -1) {
    form.qualifications.splice(index, 1)
  }
}

function handleReset() {
  formRef.value.resetFields()
  form.businessLicense = ''
  form.qualifications = []
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      emit('submit', { ...form })
      
      setTimeout(() => {
        ElMessage.success('入驻申请提交成功！我们将在3个工作日内完成审核')
        emit('success')
        handleReset()
        submitting.value = false
      }, 1000)
    }
  })
}
</script>

<style lang="scss" scoped>
.register-form {
  max-width: 800px;
  margin: 0 auto;

  .form-content {
    background: #fff;
    padding: 40px;
    border-radius: 8px;
  }

  .form-section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px dashed $border-color;

    &:last-of-type {
      border-bottom: none;
      margin-bottom: 20px;
      padding-bottom: 0;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 24px;
      padding-left: 12px;
      border-left: 4px solid $primary-color;
    }
  }

  .file-name {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 13px;
    color: $text-light;
  }

  .file-list {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .link {
    color: $primary-color;

    &:hover {
      text-decoration: underline;
    }
  }

  .form-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding-top: 20px;

    .el-button {
      padding: 12px 40px;
      height: auto;
      font-size: 16px;
    }
  }
}
</style>
