import type { DepreciationMethod, DepreciationDetail } from '@/types/asset'
import dayjs from 'dayjs'

export const calculateMonthsUsed = (purchaseDate: string): number => {
  const purchase = dayjs(purchaseDate)
  const now = dayjs()
  return Math.max(0, now.diff(purchase, 'month'))
}

export const calculateStraightLineDepreciation = (
  purchasePrice: number,
  salvageValue: number,
  usefulLifeYears: number,
  monthsUsed: number
): {
  monthlyDepreciation: number
  annualDepreciation: number
  accumulatedDepreciation: number
  currentValue: number
} => {
  const totalDepreciableValue = purchasePrice - salvageValue
  const annualDepreciation = totalDepreciableValue / usefulLifeYears
  const monthlyDepreciation = annualDepreciation / 12
  const accumulatedDepreciation = monthlyDepreciation * monthsUsed
  const currentValue = Math.max(salvageValue, purchasePrice - accumulatedDepreciation)
  
  return {
    monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100
  }
}

export const calculateAcceleratedDepreciation = (
  purchasePrice: number,
  salvageValue: number,
  usefulLifeYears: number,
  monthsUsed: number,
  depreciationRate: number = 20
): {
  monthlyDepreciation: number
  annualDepreciation: number
  accumulatedDepreciation: number
  currentValue: number
} => {
  let currentValue = purchasePrice
  let accumulatedDepreciation = 0
  let annualDepreciation = 0
  let monthlyDepreciation = 0
  
  const yearsUsed = Math.floor(monthsUsed / 12)
  const remainingMonths = monthsUsed % 12
  
  for (let year = 0; year < yearsUsed && currentValue > salvageValue; year++) {
    const yearDepreciation = currentValue * (depreciationRate / 100)
    currentValue = Math.max(salvageValue, currentValue - yearDepreciation)
    accumulatedDepreciation += yearDepreciation
    if (year === yearsUsed - 1) {
      annualDepreciation = yearDepreciation
    }
  }
  
  if (remainingMonths > 0 && currentValue > salvageValue) {
    const yearDepreciation = currentValue * (depreciationRate / 100)
    monthlyDepreciation = yearDepreciation / 12
    const partialDepreciation = monthlyDepreciation * remainingMonths
    currentValue = Math.max(salvageValue, currentValue - partialDepreciation)
    accumulatedDepreciation += partialDepreciation
  } else if (annualDepreciation > 0) {
    monthlyDepreciation = annualDepreciation / 12
  }
  
  return {
    monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100
  }
}

export const calculateCurrentValue = (
  purchasePrice: number,
  purchaseDate: string,
  depreciationRate: number,
  depreciationMethod: DepreciationMethod = 'straight_line',
  salvageValue: number = 0,
  usefulLife: number = 5
): {
  currentValue: number
  accumulatedDepreciation: number
  monthlyDepreciation: number
  monthsUsed: number
} => {
  const monthsUsed = calculateMonthsUsed(purchaseDate)
  
  if (depreciationMethod === 'accelerated') {
    const result = calculateAcceleratedDepreciation(
      purchasePrice,
      salvageValue,
      usefulLife,
      monthsUsed,
      depreciationRate
    )
    return {
      currentValue: result.currentValue,
      accumulatedDepreciation: result.accumulatedDepreciation,
      monthlyDepreciation: result.monthlyDepreciation,
      monthsUsed
    }
  }
  
  const result = calculateStraightLineDepreciation(
    purchasePrice,
    salvageValue,
    usefulLife,
    monthsUsed
  )
  
  return {
    currentValue: result.currentValue,
    accumulatedDepreciation: result.accumulatedDepreciation,
    monthlyDepreciation: result.monthlyDepreciation,
    monthsUsed
  }
}

export const generateDepreciationSchedule = (
  purchasePrice: number,
  salvageValue: number,
  usefulLifeYears: number,
  depreciationRate: number = 20,
  method: DepreciationMethod = 'straight_line'
): DepreciationDetail[] => {
  const schedule: DepreciationDetail[] = []
  let accumulatedDepreciation = 0
  let remainingValue = purchasePrice
  
  for (let year = 1; year <= usefulLifeYears; year++) {
    let annualDepreciation: number
    let monthlyDepreciation: number
    
    if (method === 'accelerated') {
      annualDepreciation = remainingValue * (depreciationRate / 100)
      monthlyDepreciation = annualDepreciation / 12
    } else {
      const totalDepreciableValue = purchasePrice - salvageValue
      annualDepreciation = totalDepreciableValue / usefulLifeYears
      monthlyDepreciation = annualDepreciation / 12
    }
    
    if (remainingValue - annualDepreciation < salvageValue) {
      annualDepreciation = remainingValue - salvageValue
      monthlyDepreciation = annualDepreciation / 12
    }
    
    accumulatedDepreciation += annualDepreciation
    remainingValue = purchasePrice - accumulatedDepreciation
    
    schedule.push({
      year,
      monthlyDepreciation: Math.round(monthlyDepreciation * 100) / 100,
      annualDepreciation: Math.round(annualDepreciation * 100) / 100,
      accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
      remainingValue: Math.round(remainingValue * 100) / 100
    })
    
    if (remainingValue <= salvageValue) {
      break
    }
  }
  
  return schedule
}

export const formatCurrency = (value: number): string => {
  return `¥${value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export const isHighValueAsset = (price: number, threshold: number = 5000): boolean => {
  return price >= threshold
}

export const getDepreciationPercentage = (purchasePrice: number, currentValue: number): number => {
  if (purchasePrice <= 0) return 0
  return Math.round(((purchasePrice - currentValue) / purchasePrice) * 10000) / 100
}
