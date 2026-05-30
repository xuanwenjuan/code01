import { useState, useMemo } from 'react'

export const usePagination = (data = [], pageSize = 8) => {
  const [current, setCurrent] = useState(1)

  const total = data.length
  const totalPages = Math.ceil(total / pageSize)

  const paginatedData = useMemo(() => {
    const start = (current - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, current, pageSize])

  const handlePageChange = (page) => {
    setCurrent(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    setCurrent(1)
  }

  return {
    current,
    pageSize,
    total,
    totalPages,
    paginatedData,
    handlePageChange,
    reset
  }
}
