import type { FormValidation, Category, Stationery, LendFormData, ReturnFormData } from '@/types'
import { QualityLevel, CategoryType, CATEGORY_TYPES, QUALITY_LEVELS } from '@/types'

export function validateCategoryForm(data: Partial<Category>): FormValidation {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim() === '') {
    errors.name = '分类名称不能为空'
  } else if (data.name.trim().length < 2) {
    errors.name = '分类名称至少2个字符'
  } else if (!CATEGORY_TYPES.includes(data.name as CategoryType)) {
    errors.name = `分类名称必须是以下之一: ${CATEGORY_TYPES.join('、')}`
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = '分类描述不能为空'
  } else if (data.description.trim().length < 5) {
    errors.description = '分类描述至少5个字符'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateStationeryForm(
  data: Partial<Stationery>,
  isEdit: boolean = false
): FormValidation {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim() === '') {
    errors.name = '文具名称不能为空'
  } else if (data.name.trim().length < 2) {
    errors.name = '文具名称至少2个字符'
  } else if (data.name.trim().length > 50) {
    errors.name = '文具名称不能超过50个字符'
  }

  if (!data.brand || data.brand.trim() === '') {
    errors.brand = '品牌不能为空'
  } else if (data.brand.trim().length < 1) {
    errors.brand = '品牌至少1个字符'
  }

  if (!data.categoryId) {
    errors.categoryId = '请选择分类'
  }

  if (!data.purchaseYear) {
    errors.purchaseYear = '请选择入库年份'
  } else {
    const currentYear = new Date().getFullYear()
    if (data.purchaseYear < 2000 || data.purchaseYear > currentYear) {
      errors.purchaseYear = `入库年份必须在2000-${currentYear}之间`
    }
  }

  if (!isEdit && data.stockQuantity === undefined) {
    errors.stockQuantity = '库存数量不能为空'
  } else if (data.stockQuantity !== undefined) {
    if (data.stockQuantity < 0) {
      errors.stockQuantity = '库存数量不能为负数'
    } else if (!Number.isInteger(data.stockQuantity)) {
      errors.stockQuantity = '库存数量必须是整数'
    } else if (data.stockQuantity > 99999) {
      errors.stockQuantity = '库存数量不能超过99999'
    }
  }

  if (!data.qualityLevel) {
    errors.qualityLevel = '请选择品质等级'
  } else if (!QUALITY_LEVELS.includes(data.qualityLevel)) {
    errors.qualityLevel = `品质等级必须是以下之一: ${QUALITY_LEVELS.join('、')}`
  }

  if (data.categoryName === CategoryType.办公耗材类) {
    if (!data.expiryDate || data.expiryDate === '') {
      errors.expiryDate = '办公耗材类必须填写保质期'
    } else {
      const expiryDate = new Date(data.expiryDate)
      if (isNaN(expiryDate.getTime())) {
        errors.expiryDate = '保质期格式不正确'
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateLendForm(data: LendFormData): FormValidation {
  const errors: Record<string, string> = {}

  if (!data.stationeryId) {
    errors.stationeryId = '请选择文具'
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.quantity = '领用数量必须大于0'
  } else if (!Number.isInteger(data.quantity)) {
    errors.quantity = '领用数量必须是整数'
  } else if (data.quantity > 999) {
    errors.quantity = '单次领用数量不能超过999'
  }

  if (!data.operator || data.operator.trim() === '') {
    errors.operator = '经办人不能为空'
  } else if (data.operator.trim().length < 2) {
    errors.operator = '经办人姓名至少2个字符'
  }

  if (!data.classUsed || data.classUsed.trim() === '') {
    errors.classUsed = '领用班级不能为空'
  } else if (data.classUsed.trim().length < 2) {
    errors.classUsed = '班级名称至少2个字符'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateReturnForm(data: ReturnFormData): FormValidation {
  const errors: Record<string, string> = {}

  if (!data.stationeryId) {
    errors.stationeryId = '请选择文具'
  }

  if (!data.quantity || data.quantity <= 0) {
    errors.quantity = '归还数量必须大于0'
  } else if (!Number.isInteger(data.quantity)) {
    errors.quantity = '归还数量必须是整数'
  } else if (data.quantity > 999) {
    errors.quantity = '单次归还数量不能超过999'
  }

  if (!data.operator || data.operator.trim() === '') {
    errors.operator = '经办人不能为空'
  } else if (data.operator.trim().length < 2) {
    errors.operator = '经办人姓名至少2个字符'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateExpireForm(operator: string): FormValidation {
  const errors: Record<string, string> = {}

  if (!operator || operator.trim() === '') {
    errors.operator = '经办人不能为空'
  } else if (operator.trim().length < 2) {
    errors.operator = '经办人姓名至少2个字符'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export function isRequiredField(fieldName: string): boolean {
  const requiredFields = ['name', 'brand', 'categoryId', 'purchaseYear', 'qualityLevel']
  return requiredFields.includes(fieldName)
}
