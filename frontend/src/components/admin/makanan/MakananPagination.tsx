import { Button } from '@/components/ui/button'

interface MakananPaginationProps {
  current_page: number
  last_page: number
  per_page: number
  total: number
  onPageChange: (page: number) => void
}

export function MakananPagination({ 
  current_page,
  last_page,
  per_page,
  total,
  onPageChange
}: MakananPaginationProps) {
  if (last_page <= 1) {
    return null
  }

  const startItem = (current_page - 1) * per_page + 1
  const endItem = Math.min(current_page * per_page, total)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Menampilkan {startItem} hingga {endItem} dari {total} hasil
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-700">
          Halaman {current_page} dari {last_page}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
