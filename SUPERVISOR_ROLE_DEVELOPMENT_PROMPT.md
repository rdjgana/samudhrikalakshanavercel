# Supervisor Role System - Development Prompt

## Overview
Implement a comprehensive Supervisor role system for the RSM ERP application. The Supervisor role sits between Promoter and SO/ASM levels and has enhanced team management capabilities while maintaining field-level operations.

## Role Hierarchy
- RSM → ASM → SO → **Supervisor** → Promoter

---

## 1. Dashboard & Team Monitoring

### Requirements:
- **Team Status Cards:**
  - Display count of "Active" promoters working today
  - Display count of "Inactive" promoters
  - Real-time status updates

- **Performance Metrics:**
  - Yesterday's Primary Sales Achieved (amount)
  - Yesterday's Secondary Sales Achieved (amount)
  - Today's Purchase Achieved (amount)
  - Today's Sales Achieved (amount)
  - Comparison indicators (up/down arrows, percentage change)

- **UI Components:**
  - KPI cards similar to promoter dashboard but with team metrics
  - Charts/graphs for performance trends
  - Team member list with status indicators

### Technical Implementation:
- Create `SupervisorDashboard.jsx` component
- Add Redux slice `supervisorDashboardSlice.js` for team status and metrics
- Fetch team promoter data and aggregate performance metrics
- Display real-time status updates

---

## 2. Attendance Module

### Requirements:
- **Clock In:**
  - Time window: 9:00 AM - 9:35 AM (strict enforcement)
  - GPS verification required (must be ON)
  - NO photo upload option
  - Show error if outside time window or GPS off

- **Clock Out:**
  - Time window: 7:30 PM - 11:50 PM (strict enforcement)
  - GPS verification required (must be ON)
  - NO photo upload option
  - Show error if outside time window or GPS off

- **Attendance Display:**
  - Show current day attendance status
  - Display clock in/out times
  - Show GPS status indicator

### Technical Implementation:
- Update `Attendance.jsx` to check user role
- Add time window validation (9:00-9:35 AM for clock in, 7:30 PM-11:50 PM for clock out)
- Remove photo upload functionality for Supervisor role
- Add GPS verification check
- Display appropriate error messages for violations

---

## 3. My Activities Module

### Requirements:
- **Activity Recording:**
  - Each activity requires photo upload with GPS verification
  - Purpose of Visit dropdown with options:
    - Primary Sale (with completion status: "Completed" or "Not Completed" + reason)
    - Secondary Sales (with completion status: "Completed" or "Not Completed" + reason)
    - Issue Handling (categorized as: "General", "With Senior", or "With SM")
    - General Visit
    - New Store Activation
    - Voice of Market (recorded at end of day)
    - Meetings

- **Activity Status:**
  - For Primary Sale and Secondary Sales:
    - Radio buttons: "Completed" / "Not Completed"
    - If "Not Completed", show mandatory reason text field

- **Voice of Market:**
  - Special section for end-of-day recording
  - Text input or voice recording option

- **Reasons for Not Completing:**
  - Mandatory text field when activity marked as "Not Completed"
  - Store reasons for future reference

### Technical Implementation:
- Update `Activities.jsx` with Supervisor-specific fields
- Add completion status radio buttons for Primary/Secondary Sales
- Add conditional reason field for incomplete activities
- Add Voice of Market section
- Implement photo upload with GPS verification
- Add Issue Handling category selection

---

## 4. My Target Module

### Requirements:
- **Target Management:**
  - View assigned targets (Primary and Secondary)
  - Assign targets to Promoters

- **Assign Target to Promoter:**
  - Dropdown: "Select Promoter" (list of assigned promoters)
  - Input: "Add Primary Target" (amount)
  - Input: "Add Secondary Target" (amount)
  - Button: "Submit"
  - Display list of assigned targets with edit/delete options

- **Target Display:**
  - Show Primary Target (Distributor Purchase)
  - Show Secondary Target (MRP)
  - Display target vs achieved comparison

### Technical Implementation:
- Create Supervisor-specific target management UI
- Add promoter selection dropdown (filter by supervisor's team)
- Add target assignment form
- Display assigned targets list
- Add edit/delete functionality for assigned targets

---

## 5. Order Module

### Requirements:
- **Create Order:**
  - Select Promoter from dropdown
  - Add Primary Order details
  - Add Secondary Order details
  - Submit order for approval

- **Shop-Level Ordering:**
  - Select "Shop Name" from dropdown
  - Assign target for the shop
  - Fill in quantities for categories:
    - Face Care (cases)
    - Body Care (cases)
    - Hair Care (cases)
    - Personal Care (cases)

- **Inventory & Value Tracking:**
  - Shop Stock Volume (display/input)
  - Distributor Available Stock (display/input)
  - Display information
  - Calculate Purchase Value (Day)

- **Submission:**
  - Button: "Submit Data For Approval"
  - Order goes to approval workflow

### Technical Implementation:
- Update `Orders.jsx` with Supervisor-specific order creation
- Add promoter selection for order assignment
- Add shop-level ordering interface
- Add inventory tracking fields
- Calculate purchase value automatically
- Integrate with approval workflow

---

## 6. Sales Report Module

### Requirements:
- **Create Sales Report:**
  - Button: "Create Sales Report"
  - Select "Promoter" from dropdown
  - Button: "Add And Post"

- **Submission Window:**
  - Report must be posted during window: 11:50 PM
  - Show warning if outside submission window
  - Display countdown timer to submission window

- **Report Details:**
  - Promoter name
  - Date of report
  - Sales data (Primary and Secondary)
  - Status (Draft/Posted)

### Technical Implementation:
- Create `SalesReport.jsx` component
- Add time window validation (11:50 PM)
- Add promoter selection dropdown
- Implement report creation and posting
- Add submission window countdown timer

---

## 7. KPI Reports Module

### Requirements:
- **Display-Only Reports:**
  - Target vs Sales (by date range, shop-wise, primary/secondary split)
  - Attendance (by date range)
  - Incentives (by date range)
  - Salary (by date range)
  - New Shops Activated (by date range)

- **Filters:**
  - Date range selection
  - Shop-wise filtering
  - Primary/Secondary split toggle
  - Promoter-wise filtering

### Technical Implementation:
- Use existing `Reports.jsx` component
- Add Supervisor-specific filters (promoter selection, shop filtering)
- Ensure read-only access
- Display filtered data based on supervisor's team

---

## 8. Work Plan Module

### Requirements:
- **Three 10-Day Periods for January:**
  - Period 1: 1st - 10th
  - Period 2: 11th - 20th
  - Period 3: 21st - 31st

- **Purpose of Visit Dropdown:**
  - Area visit
  - Distributor visit
  - New Shop visit
  - Primary Sales
  - Secondary Sales
  - Stock Verification
  - Promoter Appointment

- **Activity Details:**
  - For each activity, add specific details:
    - Shop name (if applicable)
    - Distributor name (if applicable)
    - Date and time
  - Save and submit work plan

### Technical Implementation:
- Create `WorkPlan.jsx` component
- Add period-based planning (3 periods per month)
  - Calendar view or list view for each period
- Add purpose dropdown with all options
- Add conditional fields based on purpose selection
- Save work plan data
- Display work plan calendar/list view

---

## 9. Salary/Expenses Module

### Requirements:
- **Current Month Display:**
  - Fixed Salary (amount)
  - Fixed Transport Allowance (TA) (amount)
  - Number of Working Days
  - Daily Allowance (DA): Fixed at ₹0 until 80% target achieved
  - Incentives section (amount)

- **Report Discrepancy:**
  - Button: "Report Discrepancy"
  - Text box to report issues with:
    - Salary
    - TA (Transport Allowance)
    - DA (Daily Allowance)
    - Incentives
  - Submit discrepancy report

- **Notice Period:**
  - Display: 60 days for supervisors
  - Display: 30 days for promoters (in promoter view)

- **Promoter Salary View:**
  - Dropdown: Select Promoter
  - Display individual promoter's:
    - Salary
    - TA
    - DA
    - Incentives
    - Working days

### Technical Implementation:
- Create `SalaryExpenses.jsx` component
- Display current month salary breakdown
- Add DA calculation logic (0 until 80% target achieved)
- Add discrepancy reporting form
- Add promoter selection dropdown for viewing individual salaries
- Display notice period information

---

## 10. Other Sections

### Training Material
- **Requirements:**
  - Display training materials/documents
  - Download/view options
  - Categorize by type (videos, PDFs, guides)

- **Technical Implementation:**
  - Create `TrainingMaterial.jsx` component
  - Display list of training materials
  - Add download/view functionality

### Awards/Rewards
- **Requirements:**
  - Display awards and rewards received
  - Show achievement badges
  - Display team awards

- **Technical Implementation:**
  - Create `AwardsRewards.jsx` component
  - Display awards list
  - Add badge/achievement visualization

### My Profile
- **Requirements:**
  - Display supervisor's personal details
  - Edit profile information
  - **Promoter Leave Management:**
    - View leave requests from assigned promoters
    - Approve/Reject leave requests
    - View leave history

- **Technical Implementation:**
  - Update profile component with Supervisor-specific fields
  - Add promoter leave management section
  - Add approve/reject functionality for leave requests
  - Display leave history

---

## Technical Architecture

### New Components to Create:
1. `SupervisorDashboard.jsx` - Dashboard with team monitoring
2. `SalesReport.jsx` - Sales report creation and posting
3. `WorkPlan.jsx` - Work plan management (3 periods)
4. `SalaryExpenses.jsx` - Salary and expenses management
5. `TrainingMaterial.jsx` - Training materials display
6. `AwardsRewards.jsx` - Awards and rewards display

### Components to Update:
1. `Attendance.jsx` - Add Supervisor-specific time windows and GPS-only verification
2. `Activities.jsx` - Add Supervisor-specific activity types and completion status
3. `Targets.jsx` - Add promoter target assignment functionality
4. `Orders.jsx` - Add Supervisor-specific order creation
5. `Reports.jsx` - Add Supervisor-specific filters
6. Profile component - Add promoter leave management

### Redux Slices to Create/Update:
1. `supervisorDashboardSlice.js` - Team status and metrics
2. `salesReportSlice.js` - Sales report management
3. `workPlanSlice.js` - Work plan data
4. `salaryExpensesSlice.js` - Salary and expenses data
5. `promoterLeaveSlice.js` - Promoter leave management

### Routes to Add:
- `/supervisor/dashboard` - Supervisor dashboard
- `/supervisor/sales-report` - Sales report
- `/supervisor/work-plan` - Work plan
- `/supervisor/salary-expenses` - Salary and expenses
- `/supervisor/training-material` - Training materials
- `/supervisor/awards-rewards` - Awards and rewards

### Authentication & Authorization:
- Add "Supervisor" role to authentication system
- Update route guards to allow Supervisor access
- Add role-based menu items in Sidebar

---

## UI/UX Requirements

### Design Consistency:
- Use existing shadcn/ui components
- Maintain primary color: #433228
- Follow enterprise-grade layout standards
- Responsive design (tablet + mobile)

### Form Validation:
- Time window validation for attendance
- GPS verification checks
- Mandatory fields for incomplete activities
- Date range validation for reports

### User Feedback:
- Success/error messages for all actions
- Loading states during API calls
- Confirmation dialogs for critical actions
- Toast notifications for quick feedback

---

## Mock Data Requirements

### Create Mock Data For:
1. Team promoters list with status (Active/Inactive)
2. Performance metrics (yesterday/today sales)
3. Promoter targets and achievements
4. Shop inventory data
5. Sales reports
6. Work plans (3 periods)
7. Salary/expenses data
8. Training materials list
9. Awards/rewards list
10. Promoter leave requests

---

## Testing Checklist

- [ ] Dashboard displays correct team status
- [ ] Attendance time windows enforced correctly
- [ ] GPS verification works for attendance
- [ ] Activities can be recorded with all purpose types
- [ ] Target assignment to promoters works
- [ ] Order creation with promoter selection works
- [ ] Sales report submission window enforced
- [ ] Work plan can be created for all 3 periods
- [ ] Salary/expenses display correctly
- [ ] DA calculation (0 until 80% target) works
- [ ] Promoter leave management works
- [ ] All filters in KPI reports work
- [ ] Role-based access control works

---

## Implementation Priority

### Phase 1 (Core Features):
1. Supervisor Dashboard
2. Attendance (with time windows)
3. My Activities (with all purpose types)
4. My Target (promoter assignment)

### Phase 2 (Operations):
5. Order Module (Supervisor-specific)
6. Sales Report
7. Work Plan

### Phase 3 (Management):
8. Salary/Expenses
9. Promoter Leave Management
10. KPI Reports (Supervisor filters)

### Phase 4 (Additional):
11. Training Material
12. Awards/Rewards
13. Profile updates

---

## Notes

- All time windows must be strictly enforced
- GPS verification is mandatory (no photo option for Supervisor attendance)
- Supervisor can manage only assigned promoters
- All data should be filterable by supervisor's team
- Maintain consistency with existing Promoter and RSM role implementations
- Use mock data for development and testing

---

## Questions for Clarification

1. Should Supervisor be able to edit their own work plan after submission?
2. What happens if Supervisor tries to submit sales report outside the 11:50 PM window?
3. Can Supervisor assign targets to multiple promoters at once?
4. Should work plan periods be editable or read-only after submission?
5. What is the approval workflow for Supervisor-created orders?
6. How should Voice of Market be stored (text/audio file)?

---

**End of Development Prompt**
