import dayjs from 'dayjs'
import type { CountdownInfo } from '@/types'

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`
}

export function calculateCountdown(targetTime: string, now?: string): CountdownInfo {
  const nowMs = now ? dayjs(now).valueOf() : Date.now()
  const targetMs = dayjs(targetTime).valueOf()
  const diffMs = targetMs - nowMs

  const isExpired = diffMs <= 0
  const isStarted = diffMs <= 0

  const absDiffMs = Math.abs(diffMs)
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((absDiffMs % (1000 * 60)) / 1000)

  let formatted: string
  if (days > 0) {
    formatted = `${days}天 ${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`
  } else if (hours > 0) {
    formatted = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`
  } else {
    formatted = `${padZero(minutes)}:${padZero(seconds)}`
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    total: diffMs,
    isExpired,
    isStarted,
    formatted
  }
}

export function formatCountdown(countdown: CountdownInfo, prefix: string = '距离开始'): string {
  if (countdown.isExpired) {
    return '活动已开始'
  }
  return `${prefix}：${countdown.formatted}`
}

export function isActivityFull(current: number, max: number): boolean {
  return current >= max
}

export function isActivityAlmostFull(current: number, max: number, threshold: number = 0.8): boolean {
  return current / max >= threshold && !isActivityFull(current, max)
}

export function getParticipationProgress(current: number, max: number): number {
  if (max <= 0) return 0
  return Math.round((current / max) * 100)
}

export function getParticipationStatus(
  current: number,
  max: number
): 'empty' | 'normal' | 'warning' | 'full' {
  const ratio = current / max
  if (ratio === 0) return 'empty'
  if (ratio >= 1) return 'full'
  if (ratio >= 0.8) return 'warning'
  return 'normal'
}
