import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser, dummyLogin, dummySupervisorLogin, dummyPromoterLogin, dummySuperStockistLogin, dummyDistributorLogin, dummyHRLogin, dummyHRManagerLogin, dummyAdminLogin } from '../../store/slices/authSlice'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { User, Lock } from 'lucide-react'

const ROLES = [
  { value: 'RSM', label: 'RSM (Regional Sales Manager)', dashboard: '/dashboard' },
  { value: 'Supervisor', label: 'Supervisor', dashboard: '/supervisor/dashboard' },
  { value: 'Promoter', label: 'Promoter', dashboard: '/promoter/dashboard' },
  { value: 'Super Stockist', label: 'Super Stockist (SS)', dashboard: '/super-stockist/dashboard' },
  { value: 'Distributor', label: 'Distributor', dashboard: '/distributor/dashboard' },
  { value: 'HR', label: 'HR (Human Resources)', dashboard: '/hr/dashboard' },
  { value: 'HR Manager', label: 'HR Manager', dashboard: '/hr-manager/dashboard' },
  { value: 'Admin', label: 'Admin', dashboard: '/hr-manager/dashboard' },
]

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [logoError, setLogoError] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedRole) {
      alert('Please select your role')
      return
    }

    // For Promoter role
    if (selectedRole === 'Promoter') {
      if (!username || !password) {
        alert('Please enter username and password')
        return
      }
      dispatch(dummyPromoterLogin())
      setTimeout(() => {
        navigate('/promoter/dashboard', { replace: true })
      }, 100)
    } else if (selectedRole === 'Supervisor') {
      if (!username || !password) {
        alert('Please enter username and password')
        return
      }
      dispatch(dummySupervisorLogin())
      setTimeout(() => {
        navigate('/supervisor/dashboard', { replace: true })
      }, 100)
    } else if (selectedRole === 'RSM') {
      // For RSM - use regular dummy login with role
      if (!username || !password) {
        alert('Please enter username and password')
        return
      }
      dispatch(dummyLogin({ role: selectedRole }))
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 100)
    } else if (selectedRole === 'Super Stockist') {
      // For Super Stockist
      if (!username || !password) {
        alert('Please enter username and password')
        return
      }
      dispatch(dummySuperStockistLogin())
      setTimeout(() => {
        navigate('/super-stockist/dashboard', { replace: true })
      }, 100)
    } else if (selectedRole === 'Distributor') {
      // For Distributor
      if (!username || !password) {
        alert('Please enter username and password')
        return
      }
      dispatch(dummyDistributorLogin())
      setTimeout(() => {
        navigate('/distributor/dashboard', { replace: true })
      }, 100)
    } else if (selectedRole === 'HR') {
      // For HR
      if (!username || !password) {
        alert('Please enter username and password')
        return
      }
      dispatch(dummyHRLogin())
      setTimeout(() => {
        navigate('/hr/dashboard', { replace: true })
      }, 100)
    } else if (selectedRole === 'HR Manager') {
      // For HR Manager
      if (!username || !password) {
        alert('Please enter username and password')
        return
      }
      dispatch(dummyHRManagerLogin())
      setTimeout(() => {
        navigate('/hr-manager/dashboard', { replace: true })
      }, 100)
    } else if (selectedRole === 'Admin') {
      // For Admin (same modules as HR Manager)
      if (!username || !password) {
        alert('Please enter username and password')
        return
      }
      dispatch(dummyAdminLogin())
      setTimeout(() => {
        navigate('/hr-manager/dashboard', { replace: true })
      }, 100)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-20 h-20 flex items-center justify-center">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Logo"
                className="h-20 w-20 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-16 h-16 bg-[#433228] rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">RSM ERP System</CardTitle>
          <CardDescription>
            Role-Based Login System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Select Your Role *</Label>
              <Select
                id="role"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value)
                  setUsername('')
                  setPassword('')
                }}
                required
              >
                <option value="">Choose your role</option>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
            </div>


            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#433228] hover:bg-[#5a4238] text-white"
              disabled={loading || !selectedRole || !username || !password}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
