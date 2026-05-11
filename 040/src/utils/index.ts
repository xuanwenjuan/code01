import type { Device, DeviceWithLoadRate, LoadLevel } from '@/types'
import { LOAD_THRESHOLDS, VOLTAGE_THRESHOLDS } from '@/constants'

export function calculateLoadRate(currentPower: number, ratedPower: number): number {
  if (ratedPower <= 0) return 0
  const rate = currentPower / ratedPower
  return Math.round(rate * 10000) / 100
}

export function getLoadLevel(loadRate: number): LoadLevel {
  if (loadRate >= LOAD_THRESHOLDS.OVERLOAD * 100) return 'overload'
  if (loadRate >= LOAD_THRESHOLDS.HIGH * 100) return 'high'
  if (loadRate <= LOAD_THRESHOLDS.LOW * 100) return 'low'
  return 'normal'
}

export function getDeviceWithLoadRate(device: Device): DeviceWithLoadRate {
  const loadRate = calculateLoadRate(device.currentPower, device.ratedPower)
  const loadLevel = getLoadLevel(loadRate)
  return {
    ...device,
    loadRate,
    loadLevel,
  }
}

export function getDevicesWithLoadRate(devices: Device[]): DeviceWithLoadRate[] {
  return devices.map(getDeviceWithLoadRate)
}

export function isVoltageAbnormal(voltage: number): boolean {
  return voltage < VOLTAGE_THRESHOLDS.MIN || voltage > VOLTAGE_THRESHOLDS.MAX
}

export function isHighLoad(device: Device): boolean {
  const loadRate = calculateLoadRate(device.currentPower, device.ratedPower)
  return loadRate >= LOAD_THRESHOLDS.HIGH * 100
}

export function isOverload(device: Device): boolean {
  const loadRate = calculateLoadRate(device.currentPower, device.ratedPower)
  return loadRate >= LOAD_THRESHOLDS.OVERLOAD * 100
}

export function formatPower(power: number): string {
  if (power >= 1000) {
    return `${(power / 1000).toFixed(2)} MW`
  }
  return `${power.toFixed(1)} kW`
}

export function formatEnergy(energy: number): string {
  if (energy >= 1000) {
    return `${(energy / 1000).toFixed(2)} MWh`
  }
  return `${energy.toFixed(2)} kWh`
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatLoadRate(loadRate: number): string {
  return `${loadRate.toFixed(1)}%`
}

export function getAverageLoadRate(devices: Device[]): number {
  const onlineDevices = devices.filter(d => d.status === 'online' && d.ratedPower > 0)
  if (onlineDevices.length === 0) return 0
  
  const totalLoadRate = onlineDevices.reduce((sum, device) => {
    return sum + calculateLoadRate(device.currentPower, device.ratedPower)
  }, 0)
  
  return Math.round((totalLoadRate / onlineDevices.length) * 100) / 100
}

export function getHighLoadDeviceCount(devices: Device[]): number {
  return devices.filter(d => isHighLoad(d)).length
}

export function getOverloadDeviceCount(devices: Device[]): number {
  return devices.filter(d => isOverload(d)).length
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function isDateInRange(date: string, startTime: string | null, endTime: string | null): boolean {
  if (!startTime && !endTime) return true
  
  const dateTime = new Date(date).getTime()
  const start = startTime ? new Date(startTime).getTime() : 0
  const end = endTime ? new Date(endTime).getTime() : Infinity
  
  return dateTime >= start && dateTime <= end
}

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const pad = (n: number) => n.toString().padStart(2, '0')
  
  return format
    .replace('YYYY', d.getFullYear().toString())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()))
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
