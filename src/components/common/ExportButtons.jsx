import { Button } from '../ui/button'
import { Download } from 'lucide-react'
import { downloadCSV, downloadXLSX } from '../../lib/exportUtils'

const today = () => new Date().toISOString().split('T')[0]

export default function ExportButtons({
  rows,
  csvFilename,
  xlsxFilename,
  xlsxSheetName = 'Report',
  disabled,
  className = '',
}) {
  const isDisabled = disabled ?? (!rows || rows.length === 0)

  const csvName = csvFilename || `Report_${today()}.csv`
  const xlsxName = xlsxFilename || `Report_${today()}.xlsx`

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadCSV(rows, csvName)}
        disabled={isDisabled}
      >
        <Download className="h-4 w-4 mr-2" />
        Download CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadXLSX(rows, xlsxName, xlsxSheetName)}
        disabled={isDisabled}
      >
        <Download className="h-4 w-4 mr-2" />
        Download XLSX
      </Button>
    </div>
  )
}

