import { useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { User, Building2 } from 'lucide-react'

const DistributorProfile = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Personal and business information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#433228]" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-lg font-semibold">{user?.name || 'Distributor User'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Code</label>
              <p className="text-lg font-semibold">{user?.code || 'DIST001'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{user?.email || 'distributor@example.com'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Username</label>
              <p className="text-lg">{user?.username || 'distributor_user'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#433228]" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Area</label>
              <p className="text-lg font-semibold">{user?.area || 'Sivakasi'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Distributor ID</label>
              <p className="text-lg font-semibold">{user?.distributorId || '1'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DistributorProfile
