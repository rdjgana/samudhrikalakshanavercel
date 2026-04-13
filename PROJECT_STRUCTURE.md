# Complete React Project Structure

## 📁 Project Directory Structure

```
samudhrikalakshana_new/
│
├── public/                          # Static assets (served as-is)
│   ├── vite.svg                     # Vite logo
│   └── favicon.ico                  # Site favicon
│
├── src/                             # Source code
│   ├── api/                         # API configuration
│   │   └── api.js                   # Axios instance with interceptors
│   │
│   ├── components/                  # Reusable components
│   │   ├── auth/                    # Authentication components
│   │   │   └── ProtectedRoute.jsx  # Route protection component
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.jsx          # Top header bar
│   │   │   ├── MainLayout.jsx       # Main layout wrapper
│   │   │   └── Sidebar.jsx          # Sidebar navigation
│   │   │
│   │   └── ui/                      # shadcn/ui components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       ├── select.jsx
│   │       ├── table.jsx
│   │       ├── tabs.jsx
│   │       └── textarea.jsx
│   │
│   ├── lib/                         # Utility functions
│   │   └── utils.js                 # Helper functions (cn, etc.)
│   │
│   ├── pages/                       # Page components
│   │   ├── activities/              # My Activities module
│   │   │   └── Activities.jsx
│   │   │
│   │   ├── approvals/               # Approvals module
│   │   │   └── Approvals.jsx
│   │   │
│   │   ├── attendance/              # Attendance module
│   │   │   └── Attendance.jsx
│   │   │
│   │   ├── auth/                    # Authentication pages
│   │   │   └── Login.jsx
│   │   │
│   │   ├── claims/                   # Claims & Expenses module
│   │   │   └── Claims.jsx
│   │   │
│   │   ├── dashboard/               # Executive Dashboard
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── manpower/                # Manpower & Employee Info
│   │   │   └── Manpower.jsx
│   │   │
│   │   ├── orders/                  # Orders & Entity Creation
│   │   │   └── Orders.jsx
│   │   │
│   │   ├── reports/                  # Reports module
│   │   │   └── Reports.jsx
│   │   │
│   │   └── targets/                 # My Target module
│   │       └── Targets.jsx
│   │
│   ├── store/                       # Redux store
│   │   ├── slices/                  # Redux slices
│   │   │   ├── activitiesSlice.js
│   │   │   ├── approvalsSlice.js
│   │   │   ├── attendanceSlice.js
│   │   │   ├── authSlice.js
│   │   │   ├── claimsSlice.js
│   │   │   ├── dashboardSlice.js
│   │   │   ├── ordersSlice.js
│   │   │   ├── reportsSlice.js
│   │   │   └── targetsSlice.js
│   │   │
│   │   └── store.js                 # Redux store configuration
│   │
│   ├── App.jsx                      # Main App component
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Global styles
│
├── node_modules/                    # Dependencies (created after npm install)
│
├── .eslintrc.cjs                    # ESLint configuration
├── .gitignore                      # Git ignore rules
├── .env                            # Environment variables (create this)
├── index.html                      # HTML template
├── package.json                    # Dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── vite.config.js                 # Vite configuration
├── README.md                       # Project documentation
└── PROJECT_STRUCTURE.md           # This file
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```
This will create the `node_modules/` folder with all dependencies.

### 2. Create Environment File
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 📦 Key Folders Explained

- **public/**: Static files that are copied to the build output as-is
- **src/**: All source code lives here
- **node_modules/**: Auto-generated folder containing all npm packages (don't commit this)
- **src/api/**: Centralized API configuration
- **src/components/**: Reusable UI components
- **src/pages/**: Page-level components (one per route)
- **src/store/**: Redux state management
- **src/lib/**: Utility functions and helpers

## 🔧 Important Files

- **vite.config.js**: Vite bundler configuration
- **tailwind.config.js**: Tailwind CSS theme and utilities
- **package.json**: Project dependencies and scripts
- **.env**: Environment variables (API URLs, etc.)
