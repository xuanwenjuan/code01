import { useState, useRef, useCallback, useEffect } from 'react'

interface VirtualListOptions<T> {
  itemHeight: number
  overscan?: number
  data: T[]
}

interface VirtualListResult<T> {
  virtualItems: Array<{
    index: number
    item: T
    offsetTop: number
    height: number
  }>
  listProps: {
    ref: React.RefObject<HTMLDivElement>
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void
    style: React.CSSProperties
  }
  containerHeight: number
  totalHeight: number
}

export function useVirtualList<T>({
  itemHeight,
  overscan = 5,
  data
}: VirtualListOptions<T>): VirtualListResult<T> {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight)
    }
  }, [])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop)
  }, [])

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    data.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const virtualItems = []
  for (let i = startIndex; i < endIndex; i++) {
    virtualItems.push({
      index: i,
      item: data[i],
      offsetTop: i * itemHeight,
      height: itemHeight
    })
  }

  return {
    virtualItems,
    listProps: {
      ref: containerRef,
      onScroll: handleScroll,
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }
    },
    containerHeight,
    totalHeight: data.length * itemHeight
  }
}
