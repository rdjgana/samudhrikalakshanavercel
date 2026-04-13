import { useState, useRef } from 'react'
import { useTablePagination } from '../../hooks/useTablePagination'
import TablePaginationControls from '../../components/common/TablePaginationControls'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { TAMIL_NADU_DISTRICTS } from '../../data/mockData'
import { Upload, X, User, FileText, Download } from 'lucide-react'

// Comprehensive Mock Employee Data with all form fields
const INITIAL_MOCK_EMPLOYEES = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'ASM',
    code: 'ASM001',
    status: 'Active',
    phone: '9876543210',
    email: 'rajesh.kumar@cosmetics.com',
    address: '123, MG Road, T Nagar, Chennai - 600001, Tamil Nadu, India',
    dateOfBirth: '1985-05-15',
    dateOfJoining: '2020-01-15',
    gender: 'Male',
    aadharNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    emergencyContactName: 'Lakshmi Kumar',
    emergencyContactPhone: '9876543211',
    bankAccountNumber: '1234567890123456',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    qualification: 'MBA - Marketing',
    experience: '8',
    previousCompany: 'Procter & Gamble',
    salary: '850000',
    region: 'North Tamil Nadu',
  },
  {
    id: 2,
    name: 'Priya Menon',
    role: 'ASM',
    code: 'ASM002',
    status: 'Active',
    phone: '9876543212',
    email: 'priya.menon@cosmetics.com',
    address: '456, Anna Salai, Teynampet, Chennai - 600002, Tamil Nadu, India',
    dateOfBirth: '1987-08-22',
    dateOfJoining: '2020-03-01',
    gender: 'Female',
    aadharNumber: '234567890123',
    panNumber: 'BCDEF2345G',
    emergencyContactName: 'Ramesh Menon',
    emergencyContactPhone: '9876543213',
    bankAccountNumber: '2345678901234567',
    ifscCode: 'ICIC0002345',
    bankName: 'ICICI Bank',
    qualification: 'MBA - Sales',
    experience: '7',
    previousCompany: 'L\'Oreal India',
    salary: '820000',
    region: 'South Tamil Nadu',
  },
  {
    id: 3,
    name: 'Arun Balaji',
    role: 'SO',
    code: 'SO001',
    status: 'Active',
    phone: '9876543214',
    email: 'arun.balaji@cosmetics.com',
    address: '789, T Nagar, Chennai - 600017, Tamil Nadu, India',
    dateOfBirth: '1990-03-10',
    dateOfJoining: '2021-06-15',
    gender: 'Male',
    aadharNumber: '345678901234',
    panNumber: 'CDEFG3456H',
    emergencyContactName: 'Meera Balaji',
    emergencyContactPhone: '9876543215',
    bankAccountNumber: '3456789012345678',
    ifscCode: 'SBIN0003456',
    bankName: 'State Bank of India',
    qualification: 'B.Com',
    experience: '5',
    previousCompany: 'Unilever',
    salary: '550000',
    asmId: 1,
    district: 'Chennai',
  },
  {
    id: 4,
    name: 'Divya Ramesh',
    role: 'SO',
    code: 'SO002',
    status: 'Active',
    phone: '9876543216',
    email: 'divya.ramesh@cosmetics.com',
    address: '321, Ambattur Industrial Estate, Chennai - 600053, Tamil Nadu, India',
    dateOfBirth: '1992-11-25',
    dateOfJoining: '2021-08-20',
    gender: 'Female',
    aadharNumber: '456789012345',
    panNumber: 'DEFGH4567I',
    emergencyContactName: 'Suresh Ramesh',
    emergencyContactPhone: '9876543217',
    bankAccountNumber: '4567890123456789',
    ifscCode: 'AXIS0004567',
    bankName: 'Axis Bank',
    qualification: 'BBA',
    experience: '4',
    previousCompany: 'Nivea India',
    salary: '520000',
    asmId: 1,
    district: 'Tiruvallur',
  },
  {
    id: 5,
    name: 'Mohan Raj',
    role: 'Supervisor',
    code: 'SUP001',
    status: 'Active',
    phone: '9876543218',
    email: 'mohan.raj@cosmetics.com',
    address: '654, Velachery Main Road, Chennai - 600042, Tamil Nadu, India',
    dateOfBirth: '1993-07-18',
    dateOfJoining: '2022-01-10',
    gender: 'Male',
    aadharNumber: '567890123456',
    panNumber: 'EFGHI5678J',
    emergencyContactName: 'Kavitha Raj',
    emergencyContactPhone: '9876543219',
    bankAccountNumber: '5678901234567890',
    ifscCode: 'KOTAK0005678',
    bankName: 'Kotak Mahindra Bank',
    qualification: 'Diploma in Business Management',
    experience: '3',
    previousCompany: 'Emami Ltd',
    salary: '420000',
    soId: 1,
    area: 'North Chennai',
  },
  {
    id: 6,
    name: 'Geetha Lakshmi',
    role: 'Supervisor',
    code: 'SUP002',
    status: 'Active',
    phone: '9876543220',
    email: 'geetha.lakshmi@cosmetics.com',
    address: '987, Adyar, Besant Nagar, Chennai - 600020, Tamil Nadu, India',
    dateOfBirth: '1994-02-14',
    dateOfJoining: '2022-03-15',
    gender: 'Female',
    aadharNumber: '678901234567',
    panNumber: 'FGHIJ6789K',
    emergencyContactName: 'Venkat Lakshmi',
    emergencyContactPhone: '9876543221',
    bankAccountNumber: '6789012345678901',
    ifscCode: 'PNB0006789',
    bankName: 'Punjab National Bank',
    qualification: 'B.Sc',
    experience: '3',
    previousCompany: 'HUL',
    salary: '410000',
    soId: 1,
    area: 'South Chennai',
  },
  {
    id: 7,
    name: 'Kavitha Rani',
    role: 'Promoter',
    code: 'PROM001',
    status: 'Active',
    phone: '9876543222',
    email: 'kavitha.rani@cosmetics.com',
    address: '147, T Nagar, Pondy Bazaar, Chennai - 600017, Tamil Nadu, India',
    dateOfBirth: '1995-09-30',
    dateOfJoining: '2022-05-01',
    gender: 'Female',
    aadharNumber: '789012345678',
    panNumber: 'GHIJK7890L',
    emergencyContactName: 'Ravi Rani',
    emergencyContactPhone: '9876543223',
    bankAccountNumber: '7890123456789012',
    ifscCode: 'UBI0007890',
    bankName: 'Union Bank of India',
    qualification: '12th Pass',
    experience: '2',
    previousCompany: 'Local Retail Store',
    salary: '280000',
    distributorId: 1,
    area: 'T Nagar',
  },
  {
    id: 8,
    name: 'Selvi Murugan',
    role: 'Promoter',
    code: 'PROM002',
    status: 'Active',
    phone: '9876543224',
    email: 'selvi.murugan@cosmetics.com',
    address: '258, Anna Nagar East, Chennai - 600040, Tamil Nadu, India',
    dateOfBirth: '1996-04-12',
    dateOfJoining: '2022-06-10',
    gender: 'Female',
    aadharNumber: '890123456789',
    panNumber: 'HIJKL8901M',
    emergencyContactName: 'Murugan',
    emergencyContactPhone: '9876543225',
    bankAccountNumber: '8901234567890123',
    ifscCode: 'BOI0008901',
    bankName: 'Bank of India',
    qualification: 'Diploma',
    experience: '2',
    previousCompany: 'Beauty Parlor',
    salary: '270000',
    distributorId: 1,
    area: 'Anna Nagar',
  },
  {
    id: 9,
    name: 'Ravi Shankar',
    role: 'BDE',
    code: 'BDE001',
    status: 'Active',
    phone: '9876543226',
    email: 'ravi.shankar@cosmetics.com',
    address: '369, DB Road, RS Puram, Coimbatore - 641001, Tamil Nadu, India',
    dateOfBirth: '1991-12-05',
    dateOfJoining: '2021-11-01',
    gender: 'Male',
    aadharNumber: '901234567890',
    panNumber: 'IJKLM9012N',
    emergencyContactName: 'Shanti Shankar',
    emergencyContactPhone: '9876543227',
    bankAccountNumber: '9012345678901234',
    ifscCode: 'CANARA0009012',
    bankName: 'Canara Bank',
    qualification: 'B.Tech - Mechanical',
    experience: '4',
    previousCompany: 'Marico Industries',
    salary: '480000',
  },
  {
    id: 10,
    name: 'Saranya Venkat',
    role: 'BDM',
    code: 'BDM001',
    status: 'Active',
    phone: '9876543228',
    email: 'saranya.venkat@cosmetics.com',
    address: '741, West Masi Street, Madurai - 625001, Tamil Nadu, India',
    dateOfBirth: '1989-06-20',
    dateOfJoining: '2020-09-15',
    gender: 'Female',
    aadharNumber: '012345678901',
    panNumber: 'JKLMN0123O',
    emergencyContactName: 'Venkat',
    emergencyContactPhone: '9876543229',
    bankAccountNumber: '0123456789012345',
    ifscCode: 'IOB0000123',
    bankName: 'Indian Overseas Bank',
    qualification: 'MBA - Business Development',
    experience: '6',
    previousCompany: 'ITC Limited',
    salary: '720000',
  },
  {
    id: 11,
    name: 'Ganesh Kumar',
    role: 'TSE',
    code: 'TSE001',
    status: 'Active',
    phone: '9876543230',
    email: 'ganesh.kumar@cosmetics.com',
    address: '852, Fort Main Road, Salem - 636001, Tamil Nadu, India',
    dateOfBirth: '1992-10-08',
    dateOfJoining: '2021-04-01',
    gender: 'Male',
    aadharNumber: '123450987654',
    panNumber: 'KLMNO1234P',
    emergencyContactName: 'Lakshmi Kumar',
    emergencyContactPhone: '9876543231',
    bankAccountNumber: '1234509876543210',
    ifscCode: 'VIJAYA0001234',
    bankName: 'Vijaya Bank',
    qualification: 'B.E - Electronics',
    experience: '4',
    previousCompany: 'Godrej Consumer Products',
    salary: '450000',
  },
  {
    id: 12,
    name: 'Beauty Distributors Chennai',
    role: 'Distributor',
    code: 'DIST001',
    status: 'Active',
    phone: '9876543232',
    email: 'beauty.dist@cosmetics.com',
    address: '159, Wholesale Market, Chennai - 600001, Tamil Nadu, India',
    dateOfBirth: '1980-03-15',
    dateOfJoining: '2019-01-01',
    gender: 'Male',
    aadharNumber: '234561098765',
    panNumber: 'LMNOP2345Q',
    emergencyContactName: 'Rajesh Distributors',
    emergencyContactPhone: '9876543233',
    bankAccountNumber: '2345610987654321',
    ifscCode: 'HDFC0002345',
    bankName: 'HDFC Bank',
    qualification: 'B.Com - Commerce',
    experience: '10',
    previousCompany: 'Independent Business',
    salary: '1200000',
    supervisorId: 1,
    district: 'Chennai',
  },
  {
    id: 13,
    name: 'Glow Cosmetics SS',
    role: 'SS',
    code: 'SS001',
    status: 'Active',
    phone: '9876543234',
    email: 'glow.ss@cosmetics.com',
    address: '357, Industrial Area, Chennai - 600032, Tamil Nadu, India',
    dateOfBirth: '1978-11-20',
    dateOfJoining: '2018-06-01',
    gender: 'Male',
    aadharNumber: '345672109876',
    panNumber: 'MNOPQ3456R',
    emergencyContactName: 'SS Manager',
    emergencyContactPhone: '9876543235',
    bankAccountNumber: '3456721098765432',
    ifscCode: 'ICIC0003456',
    bankName: 'ICICI Bank',
    qualification: 'MBA - Operations',
    experience: '12',
    previousCompany: 'Wholesale Business',
    salary: '1500000',
    district: 'Chennai',
  },
]

const Manpower = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    code: '',
    status: 'Active',
    phone: '',
    email: '',
    address: '',
    dateOfBirth: '',
    dateOfJoining: '',
    gender: '',
    aadharNumber: '',
    panNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    qualification: '',
    experience: '',
    previousCompany: '',
    salary: '',
    salaryExpected: '',
    areaCanCover: [], // Array of district names
    region: '',
    district: '',
    area: [], // Changed to array for multiselect
    asmId: '',
    soId: '',
    supervisorId: '',
    distributorId: '',
    profilePicture: null,
    ctcDocument: null,
    ctcDocumentName: '',
  })
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [ctcDocumentPreview, setCtcDocumentPreview] = useState(null)
  const profileFileInputRef = useRef(null)
  const ctcFileInputRef = useRef(null)
  const [createdResources, setCreatedResources] = useState(INITIAL_MOCK_EMPLOYEES)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all',
  })

  // Available roles
  const ROLES = [
    'ASM',
    'SO',
    'Supervisor',
    'Promoter',
    'BDE',
    'BDM',
    'TSE',
  ]

  // Use only created resources (which includes initial mock data)
  const hierarchyData = createdResources

  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee)
    setShowProfile(true)
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    // Populate form with employee data
    setFormData({
      name: employee.name || '',
      role: employee.role || '',
      code: employee.code || '',
      status: employee.status || 'Active',
      phone: employee.phone || '',
      email: employee.email || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth || '',
      dateOfJoining: employee.dateOfJoining || '',
      gender: employee.gender || '',
      aadharNumber: employee.aadharNumber || '',
      panNumber: employee.panNumber || '',
      emergencyContactName: employee.emergencyContactName || '',
      emergencyContactPhone: employee.emergencyContactPhone || '',
      bankAccountNumber: employee.bankAccountNumber || '',
      ifscCode: employee.ifscCode || '',
      bankName: employee.bankName || '',
      qualification: employee.qualification || '',
      experience: employee.experience || '',
      previousCompany: employee.previousCompany || '',
      salary: employee.salary || '',
      salaryExpected: employee.salaryExpected || '',
      areaCanCover: Array.isArray(employee.areaCanCover) ? employee.areaCanCover : (employee.areaCanCover ? [employee.areaCanCover] : []),
      region: employee.region || '',
      district: employee.district || '',
      area: Array.isArray(employee.area) ? employee.area : (employee.area ? [employee.area] : []),
      asmId: employee.asmId ? String(employee.asmId) : '',
      soId: employee.soId ? String(employee.soId) : '',
      supervisorId: employee.supervisorId ? String(employee.supervisorId) : '',
      distributorId: employee.distributorId ? String(employee.distributorId) : '',
      profilePicture: employee.profilePicture || null,
      ctcDocument: employee.ctcDocument || null,
      ctcDocumentName: employee.ctcDocumentName || '',
    })
    setProfilePicturePreview(employee.profilePicture || null)
    setCtcDocumentPreview(employee.ctcDocument ? { name: employee.ctcDocumentName || 'CTC Document', url: employee.ctcDocument } : null)
    setShowAddForm(true)
  }

  const handleDelete = (employee) => {
    setEmployeeToDelete(employee)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (employeeToDelete) {
      // Delete employee from created resources
      setCreatedResources(prev => prev.filter(emp => emp.id !== employeeToDelete.id))
      setSuccessMessage(`Employee "${employeeToDelete.name}" deleted successfully!`)
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    }
    setShowDeleteDialog(false)
    setEmployeeToDelete(null)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setFormData(prev => ({
          ...prev,
          profilePicture: base64String,
        }))
        setProfilePicturePreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveProfilePicture = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: null,
    }))
    setProfilePicturePreview(null)
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = ''
    }
  }

  const handleCtcDocumentChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF or Word document (PDF, DOC, DOCX)')
        return
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Document size should be less than 10MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setFormData(prev => ({
          ...prev,
          ctcDocument: base64String,
          ctcDocumentName: file.name,
        }))
        setCtcDocumentPreview({
          name: file.name,
          url: base64String,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveCtcDocument = () => {
    setFormData(prev => ({
      ...prev,
      ctcDocument: null,
      ctcDocumentName: '',
    }))
    setCtcDocumentPreview(null)
    if (ctcFileInputRef.current) {
      ctcFileInputRef.current.value = ''
    }
  }

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      // Reset role-specific fields when role changes
      region: '',
      district: '',
      area: [],
      asmId: '',
      soId: '',
      supervisorId: '',
      distributorId: '',
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      code: '',
      status: 'Active',
      phone: '',
      email: '',
      address: '',
      dateOfBirth: '',
      dateOfJoining: '',
      gender: '',
      aadharNumber: '',
      panNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      bankAccountNumber: '',
      ifscCode: '',
      bankName: '',
      qualification: '',
      experience: '',
      previousCompany: '',
      salary: '',
      salaryExpected: '',
      areaCanCover: [],
      region: '',
      district: '',
      area: [],
      asmId: '',
      soId: '',
      supervisorId: '',
      distributorId: '',
      profilePicture: null,
      ctcDocument: null,
      ctcDocumentName: '',
    })
    setProfilePicturePreview(null)
    setCtcDocumentPreview(null)
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = ''
    }
    if (ctcFileInputRef.current) {
      ctcFileInputRef.current.value = ''
    }
  }

  const generateCode = (role) => {
    const rolePrefix = {
      'ASM': 'ASM',
      'SO': 'SO',
      'Supervisor': 'SUP',
      'Promoter': 'PROM',
      'BDE': 'BDE',
      'BDM': 'BDM',
      'TSE': 'TSE',
      'Distributor': 'DIST',
      'SS': 'SS',
    }
    const prefix = rolePrefix[role] || 'EMP'
    const existingCount = hierarchyData.filter(emp => emp.role === role).length
    const nextNum = String(existingCount + 1).padStart(3, '0')
    return `${prefix}${nextNum}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Auto-generate code if not provided (only for new employees)
    const code = formData.code || (editingEmployee ? editingEmployee.code : generateCode(formData.role))
    
    const resourceData = {
      id: editingEmployee ? editingEmployee.id : Date.now(),
      name: formData.name,
      role: formData.role,
      code,
      status: formData.status,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      dateOfBirth: formData.dateOfBirth,
      dateOfJoining: formData.dateOfJoining,
      gender: formData.gender,
      aadharNumber: formData.aadharNumber,
      panNumber: formData.panNumber,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      bankAccountNumber: formData.bankAccountNumber,
      ifscCode: formData.ifscCode,
      bankName: formData.bankName,
      qualification: formData.qualification,
      experience: formData.experience,
      previousCompany: formData.previousCompany,
      salary: formData.salary,
      salaryExpected: formData.salaryExpected,
      areaCanCover: formData.areaCanCover,
      ...(formData.profilePicture && { profilePicture: formData.profilePicture }),
      ...(formData.ctcDocument && { 
        ctcDocument: formData.ctcDocument,
        ctcDocumentName: formData.ctcDocumentName || 'CTC Document'
      }),
      ...(formData.region && { region: formData.region }),
      ...(formData.district && { district: formData.district }),
      ...(formData.area && formData.area.length > 0 && { area: formData.area }),
      ...(formData.asmId && { asmId: parseInt(formData.asmId) }),
      ...(formData.soId && { soId: parseInt(formData.soId) }),
      ...(formData.supervisorId && { supervisorId: parseInt(formData.supervisorId) }),
      ...(formData.distributorId && { distributorId: parseInt(formData.distributorId) }),
    }

    if (editingEmployee) {
      // Update existing resource
      setCreatedResources(prev => 
        prev.map(emp => emp.id === editingEmployee.id ? resourceData : emp)
      )
      setSuccessMessage(`Employee "${formData.name}" updated successfully!`)
    } else {
      // Create new resource
      setCreatedResources(prev => [...prev, resourceData])
      setSuccessMessage(`Manpower resource "${formData.name}" (${formData.role}) created successfully!`)
    }
    
    // Reset form and editing state
    resetForm()
    setEditingEmployee(null)
    
    setTimeout(() => {
      setShowAddForm(false)
      setSuccessMessage('')
    }, 2000)
  }

  // Get filtered options based on role from created resources
  const getASMOptions = () => createdResources.filter(emp => emp.role === 'ASM')
  const getSOOptions = () => {
    if (formData.asmId) {
      return createdResources.filter(so => so.role === 'SO' && so.asmId === parseInt(formData.asmId))
    }
    return createdResources.filter(emp => emp.role === 'SO')
  }
  const getSupervisorOptions = () => {
    if (formData.soId) {
      return createdResources.filter(sup => sup.role === 'Supervisor' && sup.soId === parseInt(formData.soId))
    }
    return createdResources.filter(emp => emp.role === 'Supervisor')
  }
  const getDistributorOptions = () => {
    if (formData.supervisorId) {
      return createdResources.filter(dist => dist.role === 'Distributor' && dist.supervisorId === parseInt(formData.supervisorId))
    }
    return createdResources.filter(emp => emp.role === 'Distributor')
  }

  // Filter function for employee data
  const filterEmployees = (employees) => {
    return employees.filter(employee => {
      // Search filter (name, code, role)
      const matchesSearch = !filters.search || 
        employee.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (employee.code && employee.code.toLowerCase().includes(filters.search.toLowerCase())) ||
        employee.role.toLowerCase().includes(filters.search.toLowerCase())
      
      // Status filter
      const matchesStatus = filters.status === 'all' || employee.status === filters.status
      
      // Role filter
      const matchesRole = filters.role === 'all' || employee.role === filters.role
      
      return matchesSearch && matchesStatus && matchesRole
    })
  }

  // Get filtered employees
  const filteredEmployees = filterEmployees(hierarchyData)
  const employeePagination = useTablePagination(filteredEmployees)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manpower & Employee Information</h1>
          <p className="text-gray-600 mt-2">Manage employee hierarchy and information</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-[#433228] hover:bg-[#5a4238]">
          Add Manpower Resource
        </Button>
      </div>

      {successMessage && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Employee Hierarchy</CardTitle>
          <CardDescription>View all employees in the hierarchy</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Search Employee</Label>
                <Input
                  placeholder="Search by name, code, or role..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="all">All Roles</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ search: '', status: 'all', role: 'all' })}
            >
              Clear Filters
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                employeePagination.paginatedItems.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          employee.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(employee)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(employee)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No employees found matching the filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {filteredEmployees.length > 0 && (
            <TablePaginationControls {...employeePagination} />
          )}
        </CardContent>
      </Card>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Profile Picture */}
              {selectedEmployee.profilePicture && (
                <div className="flex justify-center pb-4 border-b">
                  <img
                    src={selectedEmployee.profilePicture}
                    alt={`${selectedEmployee.name}'s profile`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                  />
                </div>
              )}
              
              {/* Basic Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedEmployee.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employee Code</p>
                    <p className="font-medium">{selectedEmployee.code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium">{selectedEmployee.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEmployee.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedEmployee.status || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedEmployee.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedEmployee.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">
                      {selectedEmployee.dateOfBirth 
                        ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString('en-GB')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Joining</p>
                    <p className="font-medium">
                      {selectedEmployee.dateOfJoining 
                        ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString('en-GB')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{selectedEmployee.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Qualification</p>
                    <p className="font-medium">{selectedEmployee.qualification || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Identity Documents */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Identity Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Aadhar Number</p>
                    <p className="font-medium">{selectedEmployee.aadharNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">PAN Number</p>
                    <p className="font-medium">{selectedEmployee.panNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Contact Name</p>
                    <p className="font-medium">{selectedEmployee.emergencyContactName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="font-medium">{selectedEmployee.emergencyContactPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Bank Account Number</p>
                    <p className="font-medium">{selectedEmployee.bankAccountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IFSC Code</p>
                    <p className="font-medium">{selectedEmployee.ifscCode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-medium">{selectedEmployee.bankName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Professional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Experience (Years)</p>
                    <p className="font-medium">{selectedEmployee.experience ? `${selectedEmployee.experience} years` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Previous Company</p>
                    <p className="font-medium">{selectedEmployee.previousCompany || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Salary / CTC</p>
                    <p className="font-medium">
                      {selectedEmployee.salary 
                        ? `₹${parseInt(selectedEmployee.salary).toLocaleString('en-IN')}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Salary Expected</p>
                    <p className="font-medium">
                      {selectedEmployee.salaryExpected 
                        ? `₹${parseInt(selectedEmployee.salaryExpected).toLocaleString('en-IN')}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                {selectedEmployee.areaCanCover && Array.isArray(selectedEmployee.areaCanCover) && selectedEmployee.areaCanCover.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Area Can Cover</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmployee.areaCanCover.map((district) => (
                        <span
                          key={district}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {district}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTC Document */}
              {selectedEmployee.ctcDocument && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">CTC Document</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedEmployee.ctcDocumentName || 'CTC Document'}
                          </p>
                          <p className="text-xs text-gray-500">Document available</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = selectedEmployee.ctcDocument
                          link.download = selectedEmployee.ctcDocumentName || 'CTC_Document'
                          link.click()
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Address</h3>
                <div>
                  <p className="text-sm text-gray-600">Full Address</p>
                  <p className="font-medium">{selectedEmployee.address || 'N/A'}</p>
                </div>
              </div>

              {/* Role-Specific Information */}
              {(selectedEmployee.region || selectedEmployee.district || selectedEmployee.area || 
                selectedEmployee.asmId || selectedEmployee.soId || selectedEmployee.supervisorId || 
                selectedEmployee.distributorId) && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Role-Specific Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEmployee.region && (
                      <div>
                        <p className="text-sm text-gray-600">Region</p>
                        <p className="font-medium">{selectedEmployee.region}</p>
                      </div>
                    )}
                    {selectedEmployee.district && (
                      <div>
                        <p className="text-sm text-gray-600">District</p>
                        <p className="font-medium">{selectedEmployee.district}</p>
                      </div>
                    )}
                    {selectedEmployee.area && (
                      <div>
                        <p className="text-sm text-gray-600">Area</p>
                        {Array.isArray(selectedEmployee.area) && selectedEmployee.area.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedEmployee.area.map((district) => (
                              <span
                                key={district}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {district}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="font-medium">{selectedEmployee.area}</p>
                        )}
                      </div>
                    )}
                    {selectedEmployee.asmId && (
                      <div>
                        <p className="text-sm text-gray-600">Reporting ASM</p>
                        <p className="font-medium">
                          {createdResources.find(emp => emp.id === selectedEmployee.asmId)?.name || `ASM ID: ${selectedEmployee.asmId}`}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.soId && (
                      <div>
                        <p className="text-sm text-gray-600">Reporting SO</p>
                        <p className="font-medium">
                          {createdResources.find(emp => emp.id === selectedEmployee.soId)?.name || `SO ID: ${selectedEmployee.soId}`}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.supervisorId && (
                      <div>
                        <p className="text-sm text-gray-600">Reporting Supervisor</p>
                        <p className="font-medium">
                          {createdResources.find(emp => emp.id === selectedEmployee.supervisorId)?.name || `Supervisor ID: ${selectedEmployee.supervisorId}`}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.distributorId && (
                      <div>
                        <p className="text-sm text-gray-600">Reporting Distributor</p>
                        <p className="font-medium">
                          {createdResources.find(emp => emp.id === selectedEmployee.distributorId)?.name || `Distributor ID: ${selectedEmployee.distributorId}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Manpower Resource Dialog */}
      <Dialog open={showAddForm} onOpenChange={(open) => {
        setShowAddForm(open)
        if (!open) {
          resetForm()
          setEditingEmployee(null)
          setProfilePicturePreview(null)
          setCtcDocumentPreview(null)
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Manpower Resource' : 'Add Manpower Resource'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  required
                >
                  <option value="">Select Role</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {profilePicturePreview ? (
                    <div className="relative">
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={profileFileInputRef}
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => profileFileInputRef.current?.click()}
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Recommended: Square image, max 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining">Date of Joining</Label>
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    placeholder="e.g., B.Com, MBA, Diploma"
                  />
                </div>
              </div>
            </div>

            {/* Identity Documents Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Identity Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aadharNumber">Aadhar Number</Label>
                  <Input
                    id="aadharNumber"
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="Enter PAN number"
                    maxLength="10"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    placeholder="Enter bank account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    placeholder="Enter IFSC code"
                    maxLength="11"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Professional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    onInput={(e) => {
                      if (e.target.value < 0) e.target.value = 0
                    }}
                    placeholder="Enter years of experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousCompany">Previous Company</Label>
                  <Input
                    id="previousCompany"
                    value={formData.previousCompany}
                    onChange={(e) => handleInputChange('previousCompany', e.target.value)}
                    placeholder="Enter previous company name"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary / CTC (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    onInput={(e) => {
                      if (e.target.value < 0) e.target.value = 0
                    }}
                    placeholder="Enter salary or CTC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryExpected">Salary Expected (₹)</Label>
                  <Input
                    id="salaryExpected"
                    type="number"
                    min="0"
                    value={formData.salaryExpected}
                    onChange={(e) => handleInputChange('salaryExpected', e.target.value)}
                    onInput={(e) => {
                      if (e.target.value < 0) e.target.value = 0
                    }}
                    placeholder="Enter expected salary"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="areaCanCover">Area Can Cover</Label>
                  <div className="border border-gray-300 rounded-md bg-white p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[...TAMIL_NADU_DISTRICTS].sort().map(district => (
                        <label
                          key={district}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.areaCanCover.includes(district)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('areaCanCover', [...formData.areaCanCover, district])
                              } else {
                                handleInputChange('areaCanCover', formData.areaCanCover.filter(d => d !== district))
                              }
                            }}
                            className="w-4 h-4 text-[#433228] border-gray-300 rounded focus:ring-[#433228]"
                          />
                          <span className="text-sm text-gray-700">{district}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.areaCanCover.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2 font-medium">
                        Selected Districts ({formData.areaCanCover.length}):
                      </p>
                      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                        {formData.areaCanCover.map((district) => (
                          <span
                            key={district}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {district}
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange('areaCanCover', formData.areaCanCover.filter(d => d !== district))
                              }}
                              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                              title="Remove district"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTC Document Upload Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">CTC Document</h3>
              <div className="space-y-2">
                <Label htmlFor="ctcDocument">Upload CTC Document</Label>
                {ctcDocumentPreview ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{ctcDocumentPreview.name}</p>
                          <p className="text-xs text-gray-500">Document uploaded</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = ctcDocumentPreview.url
                            link.download = ctcDocumentPreview.name
                            link.click()
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveCtcDocument}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                      ref={ctcFileInputRef}
                      id="ctcDocument"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleCtcDocumentChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        PDF, DOC, DOCX (Max 10MB)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => ctcFileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select Document
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Address</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {formData.role === 'ASM' && (
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  required
                  placeholder="e.g., North Tamil Nadu"
                />
              </div>
            )}

            {formData.role === 'SO' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="asmId">ASM *</Label>
                  <Select
                    id="asmId"
                    value={formData.asmId}
                    onChange={(e) => handleInputChange('asmId', e.target.value)}
                    required
                  >
                    <option value="">Select ASM</option>
                    {getASMOptions().map(asm => (
                      <option key={asm.id} value={asm.id}>{asm.name} - {asm.code}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    required
                  >
                    <option value="">Select District</option>
                    {TAMIL_NADU_DISTRICTS.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </Select>
                </div>
              </>
            )}

            {formData.role === 'Supervisor' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="soId">SO *</Label>
                  <Select
                    id="soId"
                    value={formData.soId}
                    onChange={(e) => handleInputChange('soId', e.target.value)}
                    required
                  >
                    <option value="">Select SO</option>
                    {getSOOptions().map(so => (
                      <option key={so.id} value={so.id}>{so.name} - {so.code}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area *</Label>
                  <div className="border border-gray-300 rounded-md bg-white p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[...TAMIL_NADU_DISTRICTS].sort().map(district => (
                        <label
                          key={district}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.area.includes(district)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('area', [...formData.area, district])
                              } else {
                                handleInputChange('area', formData.area.filter(d => d !== district))
                              }
                            }}
                            className="w-4 h-4 text-[#433228] border-gray-300 rounded focus:ring-[#433228]"
                            required={formData.area.length === 0}
                          />
                          <span className="text-sm text-gray-700">{district}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.area.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2 font-medium">
                        Selected Areas ({formData.area.length}):
                      </p>
                      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                        {formData.area.map((district) => (
                          <span
                            key={district}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                          >
                            {district}
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange('area', formData.area.filter(d => d !== district))
                              }}
                              className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                              title="Remove area"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {formData.role === 'Distributor' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="supervisorId">Supervisor *</Label>
                  <Select
                    id="supervisorId"
                    value={formData.supervisorId}
                    onChange={(e) => handleInputChange('supervisorId', e.target.value)}
                    required
                  >
                    <option value="">Select Supervisor</option>
                    {getSupervisorOptions().map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name} - {sup.code}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    required
                  >
                    <option value="">Select District</option>
                    {TAMIL_NADU_DISTRICTS.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </Select>
                </div>
              </>
            )}

            {formData.role === 'Promoter' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="distributorId">Distributor *</Label>
                  <Select
                    id="distributorId"
                    value={formData.distributorId}
                    onChange={(e) => handleInputChange('distributorId', e.target.value)}
                    required
                  >
                    <option value="">Select Distributor</option>
                    {getDistributorOptions().map(dist => (
                      <option key={dist.id} value={dist.id}>{dist.name} - {dist.code}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area *</Label>
                  <div className="border border-gray-300 rounded-md bg-white p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[...TAMIL_NADU_DISTRICTS].sort().map(district => (
                        <label
                          key={district}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.area.includes(district)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('area', [...formData.area, district])
                              } else {
                                handleInputChange('area', formData.area.filter(d => d !== district))
                              }
                            }}
                            className="w-4 h-4 text-[#433228] border-gray-300 rounded focus:ring-[#433228]"
                            required={formData.area.length === 0}
                          />
                          <span className="text-sm text-gray-700">{district}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.area.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2 font-medium">
                        Selected Areas ({formData.area.length}):
                      </p>
                      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                        {formData.area.map((district) => (
                          <span
                            key={district}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                          >
                            {district}
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange('area', formData.area.filter(d => d !== district))
                              }}
                              className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                              title="Remove area"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {formData.role === 'SS' && (
              <div className="space-y-2">
                <Label htmlFor="district">City/District *</Label>
                <Select
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  required
                >
                  <option value="">Select City/District</option>
                  {TAMIL_NADU_DISTRICTS.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                  setEditingEmployee(null)
                  setProfilePicturePreview(null)
                  setCtcDocumentPreview(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#433228] hover:bg-[#5a4238]">
                {editingEmployee ? 'Update Resource' : 'Create Resource'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
          </DialogHeader>
          {employeeToDelete && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{employeeToDelete.name}</span> ({employeeToDelete.role})?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setEmployeeToDelete(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Manpower
