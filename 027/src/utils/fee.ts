import type { TitleLevel, TitleFeeConfig, PrescriptionItem, Prescription, Medicine } from '@/types'

export const titleFeeConfigs: TitleFeeConfig[] = [
  { title: '主任医师', registrationFee: 50 },
  { title: '副主任医师', registrationFee: 35 },
  { title: '主治医师', registrationFee: 20 },
  { title: '住院医师', registrationFee: 10 },
  { title: '医士', registrationFee: 5 }
]

export function calculateRegistrationFee(title: TitleLevel): number {
  const config = titleFeeConfigs.find(c => c.title === title)
  return config?.registrationFee || 10
}

export function getTitleByRegistrationFee(fee: number): TitleLevel {
  const config = titleFeeConfigs.find(c => c.registrationFee === fee)
  return config?.title || '住院医师'
}

export function calculatePrescriptionItemPrice(
  unitPrice: number,
  quantity: number
): number {
  return Math.round((unitPrice * quantity) * 100) / 100
}

export function calculatePrescriptionTotalPrice(
  items: PrescriptionItem[]
): number {
  return items.reduce((sum, item) => {
    return sum + calculatePrescriptionItemPrice(item.price, item.quantity)
  }, 0)
}

export function calculateTotalFee(
  registrationFee: number,
  prescriptionTotal: number
): number {
  return Math.round((registrationFee + prescriptionTotal) * 100) / 100
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

export function validateMedicinePrice(price: number): boolean {
  return price >= 0 && Number.isFinite(price)
}

export function validateMedicineQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0
}

export function validateMedicineItem(item: Partial<PrescriptionItem>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!item.medicineName?.trim()) {
    errors.push('药品名称不能为空')
  }
  
  if (!item.specification?.trim()) {
    errors.push('规格不能为空')
  }
  
  if (item.price === undefined || item.price === null || !validateMedicinePrice(item.price)) {
    errors.push('单价必须大于等于0')
  }
  
  if (!item.quantity || !validateMedicineQuantity(item.quantity)) {
    errors.push('数量必须是正整数')
  }
  
  if (!item.unit?.trim()) {
    errors.push('单位不能为空')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export interface FeeSummary {
  registrationFee: number
  medicineFee: number
  totalFee: number
}

export function calculateFeeSummary(
  registrationFee: number,
  prescription: Prescription | null
): FeeSummary {
  const medicineFee = prescription ? prescription.totalPrice : 0
  return {
    registrationFee,
    medicineFee,
    totalFee: calculateTotalFee(registrationFee, medicineFee)
  }
}
