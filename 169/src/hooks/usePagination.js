import { useState, useMemo } from 'react'

export const usePagination = (data, pageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1)

  const total = data?.length || 0

  const paginatedData = useMemo(() => {
    if (!data) return []
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, currentPage, pageSize])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    currentPage,
    pageSize,
    total,
    paginatedData,
    handlePageChange,
    setCurrentPage
  }
}
