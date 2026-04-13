import { useId } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Footer controls for paginated tables. Pair with useTablePagination.
 */
export default function TablePaginationControls({
  page,
  setPage,
  pageSize,
  setPageSize,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems,
  totalPages,
  startIndex,
  endIndex,
  className = '',
}) {
  const selectId = useId()
  if (totalItems === 0) return null

  return (
    <div
      className={`flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200 ${className}`}
    >
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{startIndex}</span>–
        <span className="font-medium">{endIndex}</span> of{' '}
        <span className="font-medium">{totalItems}</span>
      </p>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor={selectId} className="text-sm whitespace-nowrap">
            Rows per page
          </Label>
          <Select
            id={selectId}
            className="w-[88px]"
            value={String(pageSize)}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-2"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700 tabular-nums min-w-[7rem] text-center">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-2"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
