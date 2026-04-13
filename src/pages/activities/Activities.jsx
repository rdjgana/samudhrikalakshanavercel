import { useState, useEffect, useRef } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchWorkAreas,
  fetchAreaDetails,
  submitActivity,
  clearSuccessMessage,
} from '../../store/slices/activitiesSlice'
import { PURPOSE_OPTIONS, SUPERVISOR_PURPOSE_OPTIONS, ISSUE_HANDLING_CATEGORIES } from '../../data/mockData'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { Plus, Mic, Square, Play, Pause, Trash2, Headphones, Image as ImageIcon, Eye, X } from 'lucide-react'

// Photo Gallery Preview Component for Table
const PhotoGalleryPreview = ({ urls, count }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  if (!urls || urls.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-xs italic">
        <ImageIcon className="h-3 w-3 opacity-30" />
        <span>No photos</span>
      </div>
    )
  }

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="flex -space-x-3 cursor-pointer hover:translate-x-1 transition-transform"
      >
        {urls.slice(0, 3).map((url, i) => (
          <div 
            key={i} 
            className="h-8 w-8 rounded-md border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
          >
            <img src={url} alt={`Preview ${i}`} className="h-full w-full object-cover" />
          </div>
        ))}
        {count > 3 && (
          <div className="h-8 w-8 rounded-md border-2 border-white bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            +{count - 3}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl bg-black/95 border-none p-6">
          <DialogHeader>
            <DialogTitle className="text-white">Photo Gallery</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 max-h-[70vh] overflow-y-auto p-2">
            {urls.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-900 border border-white/10">
                <img src={url} alt={`Photo ${i}`} className="h-full w-full object-contain" />
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Eye className="h-6 w-6" />
                </a>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Mini component for table audio playback
const TableAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const toggle = (e) => {
    e.preventDefault()
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Stop any other audio elements if necessary (optional)
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={() => setIsPlaying(false)} 
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="hidden" 
      />
      <button
        onClick={toggle}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
          isPlaying 
            ? 'bg-[#433228] text-white border-[#433228] shadow-md scale-105' 
            : 'bg-white text-gray-700 border-gray-200 hover:border-[#433228] hover:text-[#433228] shadow-sm'
        }`}
      >
        {isPlaying ? (
          <>
            <div className="flex gap-0.5 items-center h-3">
              <div className="w-0.5 bg-white rounded-full animate-[bounce_0.8s_infinite] h-3" />
              <div className="w-0.5 bg-white rounded-full animate-[bounce_1.1s_infinite] h-2" />
              <div className="w-0.5 bg-white rounded-full animate-[bounce_0.9s_infinite] h-3" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Stop</span>
          </>
        ) : (
          <>
            <Play className="h-3 w-3 fill-current group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Listen</span>
          </>
        )}
      </button>
    </div>
  )
}

const Activities = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { workAreas, selectedAreaDetails, submittedActivities, loading, error, successMessage } = useSelector(
    (state) => state.activities
  )

  const isSupervisor = user?.role === 'Supervisor'
  const isRSM = user?.role === 'RSM'
  const purposeOptions = isSupervisor ? SUPERVISOR_PURPOSE_OPTIONS : PURPOSE_OPTIONS

  const activitiesPagination = useTablePagination(submittedActivities)

  const [formData, setFormData] = useState({
    workAreaId: '',
    purpose: '',
    reason: '',
    photos: [],
    completionStatus: '', // For Primary Sale and Secondary Sales
    notCompletedReason: '', // Reason if not completed
    issueCategory: '', // For Issue Handling
    voiceOfMarket: '', // For Voice of Market
    voiceRecording: null, // For Voice Report recording
  })
  const [location, setLocation] = useState({ latitude: null, longitude: null })
  const [showFormDialog, setShowFormDialog] = useState(false)
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayTime, setCurrentPlayTime] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    dispatch(fetchWorkAreas())
    getCurrentLocation()
  }, [dispatch])

  useEffect(() => {
    if (formData.workAreaId) {
      dispatch(fetchAreaDetails(formData.workAreaId))
    }
  }, [formData.workAreaId, dispatch])

  // Cleanup and Timer management
  useEffect(() => {
    let interval = null
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording, isPaused])

  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [audioURL, isRecording])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        setFormData(prev => ({ ...prev, voiceRecording: audioBlob }))
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please grant permission.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioURL(null)
    setFormData(prev => ({ ...prev, voiceRecording: null }))
    setRecordingTime(0)
    setCurrentPlayTime(0)
    setIsPlaying(false)
    setIsRecording(false)
    setIsPaused(false)
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentPlayTime(Math.floor(audioRef.current.currentTime))
    }
  }

  const handleAudioEnd = () => {
    setIsPlaying(false)
    setCurrentPlayTime(0)
    if (audioRef.current) audioRef.current.currentTime = 0
  }

  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds || 0))
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData({ ...formData, photos: files })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.workAreaId || !formData.purpose || !formData.reason || formData.photos.length === 0 || !formData.voiceRecording) {
      alert('Please fill all required fields, record a voice report, and upload at least one photo')
      return
    }

    // Supervisor-specific validations
    if (isSupervisor) {
      // For Primary Sale and Secondary Sales, completion status is required
      if ((formData.purpose === 'Primary Sale' || formData.purpose === 'Secondary Sales') && !formData.completionStatus) {
        alert('Please select completion status')
        return
      }

      // If not completed, reason is required
      if (formData.completionStatus === 'Not Completed' && !formData.notCompletedReason) {
        alert('Please provide reason for not completing the activity')
        return
      }

      // For Issue Handling, category is required
      if (formData.purpose === 'Issue Handling' && !formData.issueCategory) {
        alert('Please select issue handling category')
        return
      }
    }

    const result = await dispatch(
      submitActivity({
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
      })
    )

    if (submitActivity.fulfilled.match(result)) {
      // Cleanup audio recording
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
      
      // Reset form
      setFormData({
        workAreaId: '',
        purpose: '',
        reason: '',
        photos: [],
        completionStatus: '',
        notCompletedReason: '',
        issueCategory: '',
        voiceOfMarket: '',
        voiceRecording: null,
      })
      
      // Reset audio states
      setAudioURL(null)
      setRecordingTime(0)
      setCurrentPlayTime(0)
      setIsPlaying(false)
      setIsRecording(false)
      setIsPaused(false)
      
      // Close dialog for RSM and Supervisor roles
      if (isRSM || isSupervisor) {
        setShowFormDialog(false)
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        dispatch(clearSuccessMessage())
      }, 5000)
    }
  }

  // Render the activity form
  const renderActivityForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="workArea">Work Area *</Label>
        <Select
          id="workArea"
          value={formData.workAreaId}
          onChange={(e) => {
            setFormData({ ...formData, workAreaId: e.target.value })
            if (e.target.value) {
              dispatch(fetchAreaDetails(e.target.value))
            }
          }}
          required
        >
          <option value="">Select Work Area (Tamil Nadu District)</option>
          {workAreas.length > 0 ? (
            workAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))
          ) : (
            <option value="" disabled>Loading districts...</option>
          )}
        </Select>
      </div>

      {selectedAreaDetails && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Area Details:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              {selectedAreaDetails.asm && (
                <div>
                  <p className="text-gray-600">ASM:</p>
                  <p className="font-medium">{selectedAreaDetails.asm}</p>
                </div>
              )}
              {selectedAreaDetails.so && (
                <div>
                  <p className="text-gray-600">SO:</p>
                  <p className="font-medium">{selectedAreaDetails.so}</p>
                </div>
              )}
              {selectedAreaDetails.supervisor && (
                <div>
                  <p className="text-gray-600">Supervisor:</p>
                  <p className="font-medium">{selectedAreaDetails.supervisor}</p>
                </div>
              )}
              {selectedAreaDetails.distributor && (
                <div>
                  <p className="text-gray-600">Distributor:</p>
                  <p className="font-medium">{selectedAreaDetails.distributor}</p>
                </div>
              )}
              {selectedAreaDetails.ss && (
                <div>
                  <p className="text-gray-600">SS:</p>
                  <p className="font-medium">{selectedAreaDetails.ss}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose of Visit *</Label>
        <Select
          id="purpose"
          value={formData.purpose}
          onChange={(e) => {
            setFormData({ 
              ...formData, 
              purpose: e.target.value,
              completionStatus: '', // Reset when purpose changes
              issueCategory: '', // Reset when purpose changes
            })
          }}
          required
        >
          <option value="">Select Purpose</option>
          {purposeOptions.map((purpose) => (
            <option key={purpose} value={purpose}>
              {purpose}
            </option>
          ))}
        </Select>
      </div>

      {/* Completion Status for Primary Sale and Secondary Sales (Supervisor only) */}
      {isSupervisor && (formData.purpose === 'Primary Sale' || formData.purpose === 'Secondary Sales') && (
        <div className="space-y-2">
          <Label>Completion Status *</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="completionStatus"
                value="Completed"
                checked={formData.completionStatus === 'Completed'}
                onChange={(e) => setFormData({ ...formData, completionStatus: e.target.value, notCompletedReason: '' })}
                required
              />
              <span>Completed</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="completionStatus"
                value="Not Completed"
                checked={formData.completionStatus === 'Not Completed'}
                onChange={(e) => setFormData({ ...formData, completionStatus: e.target.value })}
                required
              />
              <span>Not Completed</span>
            </label>
          </div>
        </div>
      )}

      {/* Reason for Not Completed (Supervisor only) */}
      {isSupervisor && formData.completionStatus === 'Not Completed' && (
        <div className="space-y-2">
          <Label htmlFor="notCompletedReason">Reason for Not Completing *</Label>
          <Textarea
            id="notCompletedReason"
            placeholder="Enter reason why the activity was not completed"
            value={formData.notCompletedReason}
            onChange={(e) => setFormData({ ...formData, notCompletedReason: e.target.value })}
            required
            rows={3}
          />
        </div>
      )}

      {/* Issue Handling Category (Supervisor only) */}
      {isSupervisor && formData.purpose === 'Issue Handling' && (
        <div className="space-y-2">
          <Label htmlFor="issueCategory">Issue Handling Category *</Label>
          <Select
            id="issueCategory"
            value={formData.issueCategory}
            onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {ISSUE_HANDLING_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Voice of Market Textarea (Supervisor only) */}
      {isSupervisor && formData.purpose === 'Voice of Market' && (
        <div className="space-y-2">
          <Label htmlFor="voiceOfMarket">Voice of Market Feedback *</Label>
          <Textarea
            id="voiceOfMarket"
            placeholder="Enter voice of market feedback summary..."
            value={formData.voiceOfMarket}
            onChange={(e) => setFormData({ ...formData, voiceOfMarket: e.target.value })}
            required
            rows={4}
          />
          <p className="text-xs text-gray-500">This should be recorded at the end of the day along with the voice recording above</p>
        </div>
      )}

      {/* Voice Report Recording (Modern Style) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Mic className="h-4 w-4 text-[#433228]" />
            Voice Report Recording *
          </Label>
          {audioURL && (
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              Ready to Upload
            </span>
          )}
        </div>
        
        <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
          isRecording 
            ? 'border-red-200 bg-red-50/30' 
            : 'border-gray-200 bg-white shadow-sm'
        }`}>
          <div className="p-4">
            {!audioURL ? (
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <>
                    <div className="h-12 w-12 rounded-full bg-[#433228] flex items-center justify-center text-white shadow-lg shadow-[#433228]/20 group transition-transform hover:scale-105 active:scale-95 cursor-pointer" onClick={startRecording}>
                      <Mic className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 leading-tight">Click to Start Recording</h4>
                      <p className="text-xs text-gray-500">Provide a brief audio summary of your visit</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></div>
                        <div className="relative h-12 w-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                          <Mic className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-red-600 uppercase tracking-tight">Recording Live</span>
                        <h4 className="text-2xl font-mono font-bold text-gray-900 leading-none">{formatTime(recordingTime)}</h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={pauseRecording}
                        size="icon"
                        variant="outline"
                        className={`h-10 w-10 rounded-full ${isPaused ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'text-gray-600'}`}
                      >
                        {isPaused ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
                      </Button>
                      <Button
                        type="button"
                        onClick={stopRecording}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 rounded-full"
                      >
                        <Square className="h-4 w-4 mr-2 fill-current" />
                        Finish
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Audio Player UX */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <Button
                    type="button"
                    onClick={togglePlayPause}
                    size="icon"
                    className="h-10 w-10 rounded-full bg-[#433228] text-white hover:bg-[#5a4238] shadow-md transition-all active:scale-95"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                  </Button>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Recorded Report</span>
                      <span>{formatTime(currentPlayTime)} / {formatTime(recordingTime)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#433228] transition-all duration-300"
                        style={{ width: `${(currentPlayTime / (recordingTime || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={deleteRecording}
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <audio
                    ref={audioRef}
                    src={audioURL}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleAudioEnd}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={deleteRecording}
                    variant="link"
                    className="text-xs text-gray-500 hover:text-[#433228] h-auto p-0"
                  >
                    Discard and Record Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason *</Label>
        <Textarea
          id="reason"
          placeholder="Enter specific reason for this visit"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photos">Upload Photos *</Label>
        <Input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          required
        />
        {formData.photos.length > 0 && (
          <p className="text-sm text-gray-600">
            {formData.photos.length} photo(s) selected
          </p>
        )}
      </div>

      {location.latitude && location.longitude && (
        <div className="text-sm text-gray-600">
          GPS Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      <Button type="submit" className="w-full bg-[#433228] hover:bg-[#5a4238] text-white" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Activity'}
      </Button>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header with Add Button for RSM and Supervisor */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Activities</h1>
          <p className="text-gray-600 mt-2">Record your field visits and activities</p>
        </div>
        {(isRSM || isSupervisor) && (
          <Button
            onClick={() => setShowFormDialog(true)}
            className="bg-[#433228] hover:bg-[#5a4238] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        )}
      </div>

      {/* Submitted Activities List - Always shown by default */}
      <Card>
        <CardHeader>
            <CardTitle>Submitted Activities</CardTitle>
            <CardDescription>List of all submitted activities</CardDescription>
          </CardHeader>
          <CardContent>
            {submittedActivities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Work Area</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Reason</TableHead>
                    {isSupervisor && <TableHead>Status</TableHead>}
                    {isSupervisor && <TableHead>Category</TableHead>}
                    <TableHead>GPS Location</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Voice Report</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activitiesPagination.paginatedItems.map((activity, index) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">
                        {(activitiesPagination.page - 1) * activitiesPagination.pageSize + index + 1}
                      </TableCell>
                      <TableCell>
                        {new Date(activity.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{activity.workAreaName}</TableCell>
                      <TableCell>{activity.purpose}</TableCell>
                      <TableCell className="max-w-xs truncate">{activity.reason}</TableCell>
                      {isSupervisor && (
                        <TableCell>
                          {activity.completionStatus ? (
                            <span className={`px-2 py-1 rounded text-xs ${
                              activity.completionStatus === 'Completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {activity.completionStatus}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      )}
                      {isSupervisor && (
                        <TableCell>
                          {activity.issueCategory || activity.voiceOfMarket ? (
                            <span className="text-sm">{activity.issueCategory || 'Voice of Market'}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-xs">
                        {activity.latitude && activity.longitude ? (
                          <span>
                            {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <PhotoGalleryPreview 
                          urls={activity.photoUrls} 
                          count={activity.photoCount} 
                        />
                      </TableCell>
                      <TableCell>
                        {activity.voiceRecordingUrl ? (
                          <TableAudioPlayer src={activity.voiceRecordingUrl} />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 text-xs italic">
                            <Headphones className="h-3 w-3 opacity-30" />
                            <span>No recording</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {activity.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">No activities submitted yet</p>
            )}
            {submittedActivities.length > 0 && (
              <TablePaginationControls {...activitiesPagination} />
            )}
          </CardContent>
        </Card>

      {/* Form Dialog for RSM and Supervisor */}
      {(isRSM || isSupervisor) && (
        <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Activity</DialogTitle>
              <DialogDescription>GPS-based work area selection and activity reporting</DialogDescription>
            </DialogHeader>
            {renderActivityForm()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default Activities
