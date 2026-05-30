import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface VirtualListOptions {
  itemHeight: number
  containerHeight: number
  buffer?: number
}

export function useVirtualList<T = any>(list: T[], options: VirtualListOptions) {
  const { itemHeight, containerHeight, buffer = 3 } = options

  const startIndex = ref(0)
  const endIndex = ref(0)
  const containerRef = ref<HTMLElement | null>(null)

  const totalHeight = computed(() => list.length * itemHeight)

  const visibleCount = computed(() => Math.ceil(containerHeight / itemHeight))

  const offsetY = computed(() => startIndex.value * itemHeight)

  const visibleData = computed(() => {
    const start = Math.max(0, startIndex.value - buffer)
    const end = Math.min(list.length, endIndex.value + buffer)
    return list.slice(start, end).map((item, index) => ({
      index: start + index,
      data: item
    }))
  })

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    const scrollTop = target.scrollTop
    startIndex.value = Math.floor(scrollTop / itemHeight)
    endIndex.value = startIndex.value + visibleCount.value
  }

  const scrollToIndex = (index: number) => {
    if (containerRef.value) {
      containerRef.value.scrollTop = index * itemHeight
    }
  }

  const scrollToTop = () => {
    scrollToIndex(0)
  }

  const scrollToBottom = () => {
    scrollToIndex(list.length - 1)
  }

  onMounted(() => {
    if (containerRef.value) {
      endIndex.value = visibleCount.value
      containerRef.value.addEventListener('scroll', handleScroll)
    }
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    containerRef,
    visibleData,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    scrollToIndex,
    scrollToTop,
    scrollToBottom
  }
}
