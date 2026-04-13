# Mock Data Documentation

This folder contains all mock data for the RSM ERP System - Cosmetics Manufacturing.

## Data Files

### `mockData.js`
Contains all mock data including:

1. **Tamil Nadu Districts** - All 38 districts for work area selection
2. **Cosmetics Categories** - Face Care, Body Care, Hair Care, Personal Care
3. **Work Areas** - District-based work areas
4. **Hierarchy Data** - ASM, SO, Supervisor, Distributor, Promoter structure
5. **Super Stockists (SS)** - 5 major SS locations
6. **Shops** - 8 sample shops across districts
7. **Employees** - Complete employee list
8. **Dashboard Data** - KPI metrics and charts data
9. **Approvals Data** - Sample pending approvals for all types

## Usage

All modules automatically use mock data when API calls fail (for development). This allows the application to work without a backend.

## Business Context

- **Industry**: Cosmetics Manufacturing
- **Order Type**: Bulk orders (cases)
- **Region**: Tamil Nadu, India
- **Product Categories**: Face Care, Body Care, Hair Care, Personal Care

## Data Structure

- **Hierarchy**: RSM → ASM → SO → Supervisor → Distributor/SS → Promoter
- **Districts**: All 38 Tamil Nadu districts available for selection
- **Categories**: 4 main cosmetics categories with sub-products
