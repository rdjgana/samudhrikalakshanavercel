import { useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { User } from 'lucide-react'

const PromoterProfile = () => {
  const { user } = useSelector((state) => state.auth)
  const profileImage = user?.profileImage || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Information</h1>
        <p className="text-gray-600 mt-2">View and update your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>Profile photo is view only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#433228]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#433228]">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={user?.name || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Employee Code</Label>
                <Input value={user?.code || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user?.role || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Shop Name</Label>
                <Input value={user?.shopName || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Input value={user?.area || ''} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Feedback Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Live Feedback
          </CardTitle>
          <CardDescription>Submit live feedback or suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowFeedbackDialog(true)}
            className="bg-[#433228] hover:bg-[#5a4238]"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Give Live Feedback
          </Button>

          {feedbacks.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold">Previous Feedbacks</h4>
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{feedback.type}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{feedback.text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card> */}
      
      {/* Feedback Dialog */}
      {/* <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Live Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Feedback *</Label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                placeholder="Enter your feedback, suggestions, or concerns..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              className="bg-[#433228] hover:bg-[#5a4238]"
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}

export default PromoterProfile
