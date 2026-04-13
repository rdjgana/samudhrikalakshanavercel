import { useState } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { FileText, Download } from 'lucide-react'

// Mock KPI Report Data (Same as RM view)
const MOCK_KPI_REPORT = [
  {
    employeeName: 'Rajesh Kumar',
    role: 'RSM',
    primaryTarget: 5000000,
    primaryAchieved: 4200000,
    primaryPercentage: 84.0,
    secondaryTarget: 4500000,
    secondaryAchieved: 3800000,
    secondaryPercentage: 84.4,
  },
  {
    employeeName: 'Priya Menon',
    role: 'ASM',
    primaryTarget: 3000000,
    primaryAchieved: 2500000,
    primaryPercentage: 83.3,
    secondaryTarget: 2800000,
    secondaryAchieved: 2300000,
    secondaryPercentage: 82.1,
  },
]

const HRKPIReport = () => {
  const [reportData, setReportData] = useState({
    category: '',
    startDate: '',
    endDate: '',
  })
  const [showReport, setShowReport] = useState(false)

  const kpiReportPagination = useTablePagination(MOCK_KPI_REPORT)

  const handleGenerateReport = () => {
    if (!reportData.category || !reportData.startDate || !reportData.endDate) {
      alert('Please fill all required fields')
      return
    }
    setShowReport(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KPI Report</h1>
        <p className="text-gray-600 mt-2">View Key Performance Indicators (Same as RM view)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#433228]" />
            KPI Report
          </CardTitle>
          <CardDescription>Generate KPI report by category and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kpi-category">Category *</Label>
                <Select
                  id="kpi-category"
                  value={reportData.category}
                  onChange={(e) => setReportData({ ...reportData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="RSM">RSM</option>
                  <option value="ASM">ASM</option>
                  <option value="SO">SO</option>
                  <option value="Supervisor">Supervisor</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kpi-start-date">Start Date *</Label>
                <Input
                  id="kpi-start-date"
                  type="date"
                  value={reportData.startDate}
                  onChange={(e) => setReportData({ ...reportData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kpi-end-date">End Date *</Label>
                <Input
                  id="kpi-end-date"
                  type="date"
                  value={reportData.endDate}
                  onChange={(e) => setReportData({ ...reportData, endDate: e.target.value })}
                  min={reportData.startDate}
                  required
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateReport}
              className="bg-[#433228] hover:bg-[#5a4238] text-white"
            >
              View/Download KPI Report
            </Button>

            {showReport && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">KPI Report Results</h3>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Primary Target</TableHead>
                      <TableHead className="text-right">Primary Achieved</TableHead>
                      <TableHead className="text-right">Primary %</TableHead>
                      <TableHead className="text-right">Secondary Target</TableHead>
                      <TableHead className="text-right">Secondary Achieved</TableHead>
                      <TableHead className="text-right">Secondary %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpiReportPagination.paginatedItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.employeeName}</TableCell>
                        <TableCell>{item.role}</TableCell>
                        <TableCell className="text-right">₹{item.primaryTarget.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-green-600">
                          ₹{item.primaryAchieved.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.primaryPercentage.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">₹{item.secondaryTarget.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-green-600">
                          ₹{item.secondaryAchieved.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.secondaryPercentage.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {MOCK_KPI_REPORT.length > 0 && <TablePaginationControls {...kpiReportPagination} />}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HRKPIReport
