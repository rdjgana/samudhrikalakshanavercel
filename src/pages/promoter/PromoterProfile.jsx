import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { User, Camera, MessageSquare } from 'lucide-react'

const PromoterProfile = () => {
  const { user } = useSelector((state) => state.auth)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbacks, setFeedbacks] = useState([])

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result)
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      alert('Please enter feedback')
      return
    }

    const newFeedback = {
      id: Date.now(),
      text: feedbackText,
      submittedAt: new Date().toISOString(),
      type: 'Live Feedback',
    }

    setFeedbacks(prev => [newFeedback, ...prev])
    setFeedbackText('')
    setShowFeedbackDialog(false)
    alert('Feedback submitted successfully!')
  }

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
            <CardDescription>Upload your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#433228]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#433228]">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-[#433228] text-white rounded-full p-2 cursor-pointer hover:bg-[#5a4238]"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
            {photoPreview && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPhotoPreview(null)
                  setProfilePhoto(null)
                }}
              >
                Remove Photo
              </Button>
            )}
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
