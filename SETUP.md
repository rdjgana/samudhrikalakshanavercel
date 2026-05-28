# Setup Guide - RSM ERP System

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This will:
- Create `node_modules/` folder
- Install all dependencies listed in `package.json`
- Set up the project structure

### Step 2: Configure Environment

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Replace `http://localhost:3000/api` with your actual backend API URL.

### Step 3: Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (default Vite port)

### Step 4: Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

## 📁 Folder Structure Overview

```
samudhrikalakshana_new/
├── public/          # Static assets (images, icons, etc.)
├── src/             # All source code
│   ├── api/         # API configuration
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── store/       # Redux store & slices
│   └── lib/         # Utilities
├── node_modules/    # Dependencies (created after npm install)
└── dist/            # Production build (created after npm run build)
```

## 🔍 Important Notes

1. **node_modules/**: This folder is auto-generated when you run `npm install`. Don't commit it to git.

2. **public/**: Contains static files that are served directly (favicon, images, etc.)

3. **src/**: All your React code goes here. This is where you'll do most of your work.

4. **.env**: Contains environment variables. Add `.env` to `.gitignore` to keep secrets safe.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 Next Steps

1. Run `npm install` to install dependencies
2. Create `.env` file with your API URL
3. Run `npm run dev` to start development
4. Open browser to `http://localhost:5173`
5. Login with RSM credentials

## 🐛 Troubleshooting

**Issue**: `node_modules` folder not found
**Solution**: Run `npm install`

**Issue**: Port already in use
**Solution**: Change port in `vite.config.js` or kill the process using the port

**Issue**: API calls failing
**Solution**: Check `.env` file has correct `VITE_API_BASE_URL`
