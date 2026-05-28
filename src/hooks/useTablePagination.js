import { useMemo, useState, useEffect } from 'react'

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/**
 * Client-side table pagination. Default page size 10; page size is user-selectable.
 * @param {unknown[]} items - Array to paginate (stable reference recommended)
 * @param {{ defaultPageSize?: number, pageSizeOptions?: number[] }} [options]
 */
export function useTablePagination(items, options = {}) {
  const {
    defaultPageSize = 10,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  } = options

  const list = Array.isArray(items) ? items : []
  const totalItems = list.length

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1)

  useEffect(() => {
    setPage(1)
  }, [totalItems, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return list.slice(start, start + pageSize)
  }, [list, page, pageSize])

  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, totalItems)

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageSizeOptions,
    paginatedItems,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
  }
}
