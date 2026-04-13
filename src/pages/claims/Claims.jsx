import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEmployees, submitClaim } from '../../store/slices/claimsSlice'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'

const CLAIM_TYPES = ['myself', 'employee']
const EXPENSE_TYPES = ['Draw Power / Additional', 'Salary & TA', 'DA']

const Claims = () => {
  const dispatch = useDispatch()
  const { employees, loading, error } = useSelector((state) => state.claims)

  const [formData, setFormData] = useState({
    claimType: 'myself',
    employeeId: '',
    expenseType: '',
    reason: '',
    amount: '',
    billImages: [],
    proofImages: [],
  })

  useEffect(() => {
    dispatch(fetchEmployees())
  }, [dispatch])

  const handleBillImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData({ ...formData, billImages: files })
  }

  const handleProofImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData({ ...formData, proofImages: files })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.expenseType || !formData.reason || formData.billImages.length === 0 || formData.proofImages.length === 0) {
      alert('Please fill all required fields and upload bill and proof images')
      return
    }

    await dispatch(submitClaim(formData))

    // Reset form
    setFormData({
      claimType: 'myself',
      employeeId: '',
      expenseType: '',
      reason: '',
      amount: '',
      billImages: [],
      proofImages: [],
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Claims & Expenses</h1>
        <p className="text-gray-600 mt-2">Submit claims for yourself or employees</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Claim</CardTitle>
          <CardDescription>Fill in the claim details and upload required documents</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Claim For</Label>
              <Select
                value={formData.claimType}
                onChange={(e) =>
                  setFormData({ ...formData, claimType: e.target.value, employeeId: '' })
                }
                required
              >
                {CLAIM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'myself' ? 'Myself' : 'Employee'}
                  </option>
                ))}
              </Select>
            </div>

            {formData.claimType === 'employee' && (
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.role}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Expense Type</Label>
              <Select
                value={formData.expenseType}
                onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
                required
              >
                <option value="">Select Expense Type</option>
                {EXPENSE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (if applicable)</Label>
              <Input
                type="number"
                min="0"
                onInput={(e) => {
                  if (e.target.value < 0) e.target.value = 0
                }}
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0)
                  setFormData({ ...formData, amount: value })
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="Enter reason for this claim"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Bill Images *</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBillImageChange}
                required
              />
              {formData.billImages.length > 0 && (
                <p className="text-sm text-gray-600">
                  {formData.billImages.length} bill image(s) selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Proof Images (Damage/Expiry) *</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleProofImageChange}
                required
              />
              {formData.proofImages.length > 0 && (
                <p className="text-sm text-gray-600">
                  {formData.proofImages.length} proof image(s) selected
                </p>
              )}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Claims
