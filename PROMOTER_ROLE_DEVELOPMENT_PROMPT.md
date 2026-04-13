# Promoter Role System - Development Prompt

## Overview
Implement a comprehensive Promoter role system for the RSM ERP application. The Promoter role is the field-level employee who manages shop-level operations, sales reporting, stock management, and customer interactions. Promoters work directly with shops and report to Supervisors.

## Role Hierarchy
- RSM → ASM → SO → Supervisor → **Promoter**

---

## 1. Login & Authentication

### Requirements:
- **Login Method:**
  - Login with shop name (instead of username)
  - Shop name should be selectable from dropdown or searchable
  - Password field (can be dummy for development)
  - Role: "Promoter" should be auto-selected or visible

- **Shop Assignment:**
  - When adding employees in dashboard, shop name should be associated
  - Promoter should see their assigned shop name after login
  - Shop name should be displayed in header/profile

### Technical Implementation:
- Update `Login.jsx` to add "Promoter" role option
- Add shop name dropdown/search in login form
- Create `dummyPromoterLogin` function in `authSlice.js`
- Store shop information in user state
- Add route: `/promoter/dashboard` for Promoter dashboard

---

## 2. Dashboard Module

### Requirements:
- **Previous Month Sales:**
  - Display previous month sales achieved value (amount in ₹)
  - Display achievement percentage
  - Visual representation: GRAPH/GRID format
  - Show comparison with target

- **Current Month Target Achievement:**
  - Display current month target
  - Show achieved amount as on date
  - Display achievement percentage
  - Progress indicator/bar

- **Attendance Metrics:**
  - Number of days present (current month)
  - Display attendance percentage
  - Show present/absent days breakdown

- **Incentive Information:**
  - Display incentive achieved (amount)
  - Show incentive breakdown
  - Display incentive percentage or status

- **UI Components:**
  - KPI cards for key metrics
  - Charts/graphs for sales trends
  - Visual progress indicators
  - Quick stats grid

### Technical Implementation:
- Create `PromoterDashboard.jsx` component
- Add Redux slice `promoterDashboardSlice.js`
- Fetch previous month sales data
- Calculate current month achievement percentage
- Display attendance and incentive metrics
- Add chart library integration (if needed) for graphs

---

## 3. Attendance Module

### Requirements:
- **Clock In:**
  - Time window: 8:00 AM - 9:30 AM (strict enforcement)
  - Selfie capture required (camera access)
  - GPS verification required (must be ON)
  - Show error if outside time window or GPS off
  - Display current time and GPS status

- **Clock Out:**
  - Time window: 10:00 AM - 11:00 AM (strict enforcement)
  - Selfie capture required (camera access)
  - GPS verification required (must be ON)
  - Show error if outside time window or GPS off
  - Display current time and GPS status

- **Attendance Display:**
  - Show current day attendance status
  - Display clock in/out times with selfies
  - Show GPS coordinates captured
  - Display attendance history (calendar view or list)

### Technical Implementation:
- Create `PromoterAttendance.jsx` component
- Add time window validation (8:00-9:30 AM for clock in, 10:00-11:00 AM for clock out)
- Implement camera access for selfie capture
- Add GPS verification check
- Store selfie images with attendance records
- Display appropriate error messages for violations
- Add attendance history view

---

## 4. My Tasks Module

### Requirements:
- **Primary Target (Shop Purchase):**
  - Display assigned Primary Target amount
  - Show achieved amount as on date
  - Display remaining balance to be achieved
  - Progress indicator/percentage

- **Secondary Target (MAP - Maximum Achievable Price):**
  - Display assigned Secondary Target amount
  - Show achieved amount as on date
  - Display remaining balance to be achieved
  - Progress indicator/percentage

- **Balance Tracking:**
  - Show balance for both Primary and Secondary targets
  - Visual GRAPH representation of balance
  - Display days remaining in month
  - Calculate daily target requirement

- **Target Achievement Display:**
  - Visual progress bars
  - Percentage indicators
  - Amount breakdown (target vs achieved vs balance)
  - Color-coded status (green/yellow/red based on progress)

### Technical Implementation:
- Create `PromoterTasks.jsx` component
- Add Redux slice `promoterTasksSlice.js`
- Fetch assigned targets (Primary and Secondary)
- Calculate achieved amounts from sales reports
- Calculate balance (target - achieved)
- Display progress graphs/charts
- Add visual indicators for target status

---

## 5. Sales Report Module

### Requirements:
- **Category-wise Sales:**
  - Categories: FACE CARE | BODY CARE | HAIR CARE | PERSONAL CARE | SUMMIT
  - Each category should be a separate section/tab

- **Product Selection (Cart-like Interface):**
  - Display all products within each category
  - Each product should show:
    - Product name
    - Product photo/image
    - Current stock available (quantity)
    - MRP (Maximum Retail Price)
  - Add to cart functionality (like e-commerce cart)

- **Stock Management:**
  - When product added to cart, stock quantity should decrease instantly
  - Display updated stock after each addition
  - Prevent adding more than available stock
  - Show warning if stock is low

- **Cart Management:**
  - Display selected products in cart
  - Show quantity for each product
  - Show total MRP value
  - Remove products from cart
  - Update quantities

- **Report Submission:**
  - Submit sales report with all selected products
  - Save report with date and time
  - Update stock levels after submission

### Technical Implementation:
- Create `PromoterSalesReport.jsx` component
- Add Redux slice `promoterSalesReportSlice.js`
- Create product catalog with images
- Implement cart functionality (add/remove products)
- Real-time stock update when products added to cart
- Category-wise product filtering
- Stock validation before adding to cart
- Save sales report with product details

---

## 6. Sales Return Module

### Requirements:
- **Category Selection:**
  - Categories: FACE CARE | BODY CARE | HAIR CARE | PERSONAL CARE
  - Select category for return

- **Reason for Return Dropdown:**
  - Options:
    - Product returned by customer
    - Product received with damage
    - No proper racking
    - Customer did not like the product after use
    - Sales entered by mistake
  - Mandatory field

- **Product Details:**
  - Select product to return
  - Enter batch number
  - Enter manufacturing month
  - Upload photo of the returned product (mandatory)

- **Submission:**
  - Submit for approval button
  - Status: "Pending Approval"
  - Show approval workflow status

- **Stock Update After Approval:**
  - Once approved by supervisor, stock should be updated instantly
  - Returned quantity should be added back to sales stock report
  - Display updated stock levels

### Technical Implementation:
- Create `PromoterSalesReturn.jsx` component
- Add Redux slice `promoterSalesReturnSlice.js`
- Add category selection
- Add reason dropdown with all options
- Implement photo upload for returned products
- Add batch number and manufacturing month fields
- Create approval workflow integration
- Update stock levels after supervisor approval
- Display approval status

---

## 7. Incentive Module

### Requirements:
- **Salary Report:**
  - Display "My Salary" section
  - Show salary breakdown

- **Incentive Display:**
  - Display "Incentive earned = Local" (or specific incentive type)
  - Show total incentive earned with amount
  - Display incentive breakdown by category/period

- **Slab Salary Display:**
  - Display salary according to slab structure
  - Show different salary slabs if applicable
  - Display current slab and next slab information

- **Total Incentive:**
  - Display total incentive earned (amount in ₹)
  - Show incentive calculation breakdown
  - Display incentive history

### Technical Implementation:
- Create `PromoterIncentive.jsx` component
- Add Redux slice `promoterIncentiveSlice.js`
- Fetch salary data with slab information
- Calculate and display incentives
- Show incentive breakdown
- Display salary slabs
- Add incentive history view

---

## 8. Reports Module

### Requirements:
- **Report Types:**
  - Opening Stock Report
  - Purchase Stock Report
  - Sales Report
  - Sales Return Report
  - Commission Report

- **Opening Stock Report:**
  - Display current month's opening stock
  - View previous month's report option
  - Calendar format for report generation

- **Calendar Format:**
  - Calendar view for selecting date range
  - Generate report for selected period
  - View reports by date

- **Report Generation:**
  - Select report type
  - Select date range (calendar)
  - Generate report button
  - Display report in table/format view
  - Export option (if needed)

- **Previous Month Reports:**
  - Button: "View Previous Month's Report"
  - Display historical reports
  - Filter by month/year

### Technical Implementation:
- Create `PromoterReports.jsx` component
- Add Redux slice `promoterReportsSlice.js`
- Implement calendar component for date selection
- Create report generation logic for each report type
- Add date range filtering
- Display reports in table format
- Add previous month report viewing
- Implement report data fetching

---

## 9. Training Material Module

### Requirements:
- **Material Types:**
  - Catalogue (product catalog)
  - Pantos (training materials/documents)
  - Videos (training videos)

- **Display:**
  - List all training materials
  - Categorize by type (Catalogue, Pantos, Videos)
  - Show material name, description, date

- **Access:**
  - View/download catalogue
  - View/download pantos
  - Play/watch videos
  - Search/filter materials

### Technical Implementation:
- Create `PromoterTrainingMaterial.jsx` component
- Add Redux slice `promoterTrainingMaterialSlice.js`
- Display materials in categorized sections
- Add download functionality for documents
- Add video player for training videos
- Implement search and filter
- Store material metadata

---

## 10. Customer Feedback Form Module

### Requirements:
- **Feedback Form:**
  - Form will be shared/provided later
  - Should be dynamic/form builder ready
  - Capture customer feedback data

- **Form Fields:**
  - To be determined based on provided form
  - Should support various input types
  - Photo upload capability

- **Submission:**
  - Submit feedback form
  - Save feedback data
  - Display submitted feedbacks

### Technical Implementation:
- Create `PromoterCustomerFeedback.jsx` component
- Add Redux slice `promoterCustomerFeedbackSlice.js`
- Create dynamic form builder (if needed)
- Implement form submission
- Store feedback data
- Display feedback history
- **Note:** Form structure to be updated once provided

---

## 11. My Information (Profile) Module

### Requirements:
- **Profile Display:**
  - Display promoter's personal information
  - Show photo (right-hand top corner)
  - Edit profile option

- **Live Feedback:**
  - Button/option to give live feedback
  - Feedback submission form
  - Real-time feedback capability

- **Profile Information:**
  - Name, employee ID, code
  - Shop name (assigned shop)
  - Contact details
  - Photo upload/display

### Technical Implementation:
- Create `PromoterProfile.jsx` component
- Update profile component with Promoter-specific fields
- Add photo upload functionality
- Display photo in header/profile section
- Add live feedback form
- Implement feedback submission
- Store profile data

---

## Technical Architecture

### New Components to Create:
1. `PromoterDashboard.jsx` - Dashboard with sales metrics and attendance
2. `PromoterAttendance.jsx` - Attendance with selfie and GPS (time windows)
3. `PromoterTasks.jsx` - Target tracking with balance graphs
4. `PromoterSalesReport.jsx` - Sales report with cart-like product selection
5. `PromoterSalesReturn.jsx` - Sales return with approval workflow
6. `PromoterIncentive.jsx` - Salary and incentive display
7. `PromoterReports.jsx` - Multiple report types with calendar
8. `PromoterTrainingMaterial.jsx` - Training materials (Catalogue, Pantos, Videos)
9. `PromoterCustomerFeedback.jsx` - Customer feedback form
10. `PromoterProfile.jsx` - Profile with photo and live feedback

### Components to Update:
1. `Login.jsx` - Add Promoter role and shop name selection
2. `Sidebar.jsx` - Add Promoter menu items
3. Profile component - Add Promoter-specific fields

### Redux Slices to Create:
1. `promoterDashboardSlice.js` - Dashboard metrics and sales data
2. `promoterAttendanceSlice.js` - Attendance with selfie and GPS
3. `promoterTasksSlice.js` - Target tracking and balance
4. `promoterSalesReportSlice.js` - Sales report and cart management
5. `promoterSalesReturnSlice.js` - Sales return and approval
6. `promoterIncentiveSlice.js` - Salary and incentive data
7. `promoterReportsSlice.js` - Report generation and viewing
8. `promoterTrainingMaterialSlice.js` - Training materials data
9. `promoterCustomerFeedbackSlice.js` - Customer feedback data
10. `promoterProfileSlice.js` - Profile and feedback data

### Routes to Add:
- `/promoter/dashboard` - Promoter dashboard
- `/promoter/attendance` - Attendance module
- `/promoter/tasks` - My Tasks (target tracking)
- `/promoter/sales-report` - Sales report
- `/promoter/sales-return` - Sales return
- `/promoter/incentive` - Incentive and salary
- `/promoter/reports` - Reports module
- `/promoter/training-material` - Training materials
- `/promoter/customer-feedback` - Customer feedback form
- `/promoter/profile` - Profile and information

### Authentication & Authorization:
- Add "Promoter" role to authentication system
- Update route guards to allow Promoter access
- Add role-based menu items in Sidebar
- Store shop name in user state

---

## UI/UX Requirements

### Design Consistency:
- Use existing shadcn/ui components
- Maintain primary color: #433228
- Follow enterprise-grade layout standards
- Responsive design (tablet + mobile)
- Mobile-first approach (Promoters work in field)

### Form Validation:
- Time window validation for attendance (8:00-9:30 AM, 10:00-11:00 AM)
- GPS verification checks
- Selfie capture validation
- Stock availability validation in sales report
- Photo upload validation for sales return
- Mandatory fields validation

### User Feedback:
- Success/error messages for all actions
- Loading states during API calls
- Confirmation dialogs for critical actions
- Toast notifications for quick feedback
- Real-time stock updates in sales report

### Mobile Optimization:
- Touch-friendly buttons and inputs
- Camera access for selfie capture
- GPS integration for location
- Optimized forms for mobile screens
- Easy navigation on small screens

---

## Mock Data Requirements

### Create Mock Data For:
1. Shop names and assignments
2. Previous month sales data
3. Current month targets (Primary and Secondary)
4. Attendance records with selfies
5. Product catalog with images (all categories)
6. Stock levels for each product
7. Sales reports history
8. Sales return requests
9. Salary and incentive data
10. Training materials (catalogue, pantos, videos)
11. Customer feedback forms
12. Profile information

### Product Data Structure:
- Product ID, Name, Code
- Category (Face Care, Body Care, Hair Care, Personal Care, Summit)
- MRP (Maximum Retail Price)
- Stock quantity
- Product image/photo
- Batch number (for returns)
- Manufacturing month (for returns)

---

## Special Features

### Stock Management:
- Real-time stock updates when products added to cart
- Stock validation before adding to cart
- Stock update after sales return approval
- Display current stock levels

### Cart Functionality:
- Add products to cart (like e-commerce)
- Remove products from cart
- Update quantities
- Show total MRP value
- Prevent adding more than available stock

### Photo/Image Handling:
- Selfie capture for attendance
- Product photo upload for sales return
- Profile photo upload
- Product images in sales report
- Image storage and display

### GPS Integration:
- GPS capture for clock in/out
- GPS verification requirement
- Display GPS coordinates
- Location validation

---

## Testing Checklist

- [ ] Login with shop name works correctly
- [ ] Dashboard displays previous month sales and current month achievement
- [ ] Attendance time windows enforced correctly (8:00-9:30 AM, 10:00-11:00 AM)
- [ ] Selfie capture works for attendance
- [ ] GPS verification works for attendance
- [ ] My Tasks shows Primary and Secondary targets with balance
- [ ] Sales report cart functionality works
- [ ] Stock decreases when product added to cart
- [ ] Sales return submission works with all required fields
- [ ] Stock updates after sales return approval
- [ ] Incentive display shows correct salary and incentives
- [ ] Reports generate correctly for all types
- [ ] Calendar format works for report generation
- [ ] Training materials display and download correctly
- [ ] Customer feedback form submission works
- [ ] Profile photo upload works
- [ ] Live feedback submission works
- [ ] All role-based access control works
- [ ] Mobile responsiveness works correctly

---

## Implementation Priority

### Phase 1 (Core Features):
1. Login with shop name
2. Promoter Dashboard (sales metrics, attendance, incentives)
3. Attendance (with selfie and GPS, time windows)
4. My Tasks (target tracking with balance)

### Phase 2 (Sales Operations):
5. Sales Report (cart-like product selection with stock management)
6. Sales Return (with approval workflow)
7. Stock management integration

### Phase 3 (Reports & Information):
8. Reports Module (all report types with calendar)
9. Incentive Module (salary and incentive display)
10. Training Material Module

### Phase 4 (Additional Features):
11. Customer Feedback Form (once form structure provided)
12. Profile with photo and live feedback
13. Mobile optimization and testing

---

## Notes

- All time windows must be strictly enforced (8:00-9:30 AM for clock in, 10:00-11:00 AM for clock out)
- Selfie capture is mandatory for attendance (both clock in and clock out)
- GPS verification is mandatory (must be ON)
- Stock management is critical - real-time updates required
- Cart functionality should work like e-commerce (add/remove products)
- Sales return requires supervisor approval before stock update
- Product images are essential for sales report and sales return
- Mobile-first design is crucial (Promoters work in field)
- Customer feedback form structure will be provided later

---

## Questions for Clarification

1. What is "SUMMIT" category in sales report? Is it a separate product category?
2. Should stock decrease happen immediately when added to cart, or only after report submission?
3. What happens if Promoter tries to clock in/out outside time windows?
4. Should sales return approval be automatic or require supervisor action?
5. What format should training videos be in (MP4, embedded links)?
6. What is the structure of the customer feedback form? (To be provided)
7. Should opening stock report show all products or only current month's opening?
8. What is "MAP" in Secondary Target? Maximum Achievable Price?
9. Should Promoter be able to edit submitted sales reports?
10. How should product photos be stored (base64, URLs, file upload)?

---

## Additional Considerations

### Performance:
- Optimize product catalog loading
- Efficient stock update mechanism
- Image compression for selfies and product photos
- Lazy loading for reports

### Security:
- Secure photo storage
- GPS data privacy
- Stock manipulation prevention
- Approval workflow security

### Offline Capability (Future):
- Consider offline mode for field work
- Sync data when online
- Cache product catalog
- Store attendance data locally

---

**End of Development Prompt**
