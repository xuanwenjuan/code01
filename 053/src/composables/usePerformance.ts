import { ref, onMounted, onUnmounted } from 'vue'

export interface PerformanceMetrics {
  fps: number
  memory?: number
  loadTime?: number
}

export function usePerformance() {
  const metrics = ref<PerformanceMetrics>({
    fps: 60,
    memory: 0
  })

  let frameCount = 0
  let lastTime = performance.now()
  let animationId: number | null = null

  const measureFPS = () => {
    frameCount++
    const now = performance.now()
    
    if (now - lastTime >= 1000) {
      metrics.value.fps = Math.round((frameCount * 1000) / (now - lastTime))
      frameCount = 0
      lastTime = now
    }

    if ('memory' in performance) {
      const mem = (performance as any).memory
      metrics.value.memory = Math.round(mem.usedJSHeapSize / 1024 / 1024)
    }

    animationId = requestAnimationFrame(measureFPS)
  }

  const startMeasuring = () => {
    if (!animationId) {
      lastTime = performance.now()
      frameCount = 0
      animationId = requestAnimationFrame(measureFPS)
    }
  }

  const stopMeasuring = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  const measureFunction = <T extends (...args: any[]) => any>(fn: T): T => {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const start = performance.now()
      const result = fn(...args)
      const end = performance.now()
      console.log(`Function ${fn.name || 'anonymous'} executed in ${(end - start).toFixed(2)}ms`)
      return result
    }) as T
  }

  const measureAsyncFunction = async <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> => {
    const start = performance.now()
    const result = await fn(...args)
    const end = performance.now()
    console.log(`Async function ${fn.name || 'anonymous'} executed in ${(end - start).toFixed(2)}ms`)
    return result
  }

  onMounted(() => {
    if (process.env.NODE_ENV === 'development') {
      startMeasuring()
    }
  })

  onUnmounted(() => {
    stopMeasuring()
  })

  return {
    metrics,
    startMeasuring,
    stopMeasuring,
    measureFunction,
    measureAsyncFunction
  }
}

export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
