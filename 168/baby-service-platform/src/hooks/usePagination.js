import { useState, useMemo } from 'react'

export const usePagination = (data, pageSize = 8) => {
  const [currentPage, setCurrentPage] = useState(1)

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return data.slice(startIndex, startIndex + pageSize)
  }, [data, currentPage, pageSize])

  const total = data.length

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    paginatedData,
    currentPage,
    total,
    pageSize,
    handlePageChange
  }
}
