# RSM ERP System - React Frontend

A comprehensive React JS frontend application for a Regional Sales Manager (RSM) role-based ERP system.

## Tech Stack

- **React JS** (Vite)
- **Redux Toolkit** - State management
- **Axios** - HTTP client with interceptors
- **React Router DOM** - Routing
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Recharts** - Charts and graphs

## Features

### 1. Executive Dashboard
- KPI cards with performance metrics
- Charts for previous month (Primary & Secondary)
- Current month target vs achieved
- Yesterday's performance stats
- Team status (Active/Inactive) for ASM, SO, Supervisor, Trainer, Promoter

### 2. Attendance
- Clock In (11:00 AM)
- Clock Out (9:00 PM)
- Auto GPS capture
- Attendance status display

### 3. My Activities
- GPS-based work area selection
- Auto-display of ASM, SO, Supervisor, Distributor, SS
- Purpose dropdown (General Visit, Sales Development, etc.)
- Mandatory reason text field
- Photo uploads

### 4. My Target
- Primary & Secondary targets
- Level-based hierarchy assignment (ASM → SO → Supervisor → SS/Distributor → Promoter)
- Display distributor & shop count under each user
- Monthly target assignment

### 5. Orders & Entity Creation
- Order flow: SS → Distributor → Shop → Category → Quantity
- Entity creation: SS, Distributor, Shop

### 6. Manpower & Employee Info
- Hierarchy list view
- Employee profile view
- Interview & onboarding tracking

### 7. Claims & Expenses
- Claim for Myself or Employee
- Expense types: Draw Power/Additional, Salary & TA, DA
- Mandatory reason text
- Bill image upload
- Proof image upload

### 8. Reports
- Target vs Sales (Consolidated, Category-wise, Employee-wise)
- Attendance
- Incentives
- Salary
- New shop activation
- Date range filters

### 9. Approvals
- Work Plan approvals
- Monthly target approvals
- Leave approvals
- Claim approvals
- Order approvals
- Extra margin/display approvals
- Actions: Approve, Change, Reject
- Mandatory comment box for every action

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── api/              # Axios instance and API configuration
├── components/       # Reusable components
│   ├── auth/        # Authentication components
│   ├── layout/      # Layout components (Sidebar, Header)
│   └── ui/          # shadcn/ui components
├── pages/           # Page components
│   ├── auth/        # Login page
│   ├── dashboard/   # Dashboard page
│   ├── attendance/  # Attendance page
│   ├── activities/  # Activities page
│   ├── targets/     # Targets page
│   ├── orders/      # Orders page
│   ├── manpower/    # Manpower page
│   ├── claims/      # Claims page
│   ├── reports/     # Reports page
│   └── approvals/   # Approvals page
├── store/           # Redux store
│   └── slices/     # Redux slices (auth, dashboard, etc.)
└── lib/             # Utility functions
```

## Theme

Primary Color: `#433228`

Applied to:
- Sidebar background
- Primary buttons
- Active menu items
- Headers & section titles

## Authentication

- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes
- Auto logout on token expiry

## State Management

All API calls are handled through Redux Toolkit slices using `createAsyncThunk`. No direct API calls in components.

## API Integration

- Single Axios instance in `api/api.js`
- Request interceptor: Attaches JWT token
- Response interceptor: Handles 401 & global errors
- Centralized error handling

## License

MIT
