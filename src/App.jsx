import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/auth/Login";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import SalesReport from "./pages/supervisor/SalesReport";
import WorkPlan from "./pages/supervisor/WorkPlan";
import SalaryExpenses from "./pages/supervisor/SalaryExpenses";
import Profile from "./pages/supervisor/Profile";
import RSMWorkPlan from "./pages/rsm/WorkPlan";
import RSMStockMonitoring from "./pages/rsm/RSMStockMonitoring";
import PromoterDashboard from "./pages/promoter/PromoterDashboard";
import PromoterTasks from "./pages/promoter/PromoterTasks";
import PromoterSalesReport from "./pages/promoter/PromoterSalesReport";
import PromoterSalesReturn from "./pages/promoter/PromoterSalesReturn";
import PromoterIncentive from "./pages/promoter/PromoterIncentive";
import PromoterReports from "./pages/promoter/PromoterReports";
import PromoterTrainingMaterial from "./pages/promoter/PromoterTrainingMaterial";
import PromoterCustomerFeedback from "./pages/promoter/PromoterCustomerFeedback";
import PromoterProfile from "./pages/promoter/PromoterProfile";
import SuperStockistDashboard from "./pages/super-stockist/SuperStockistDashboard";
import SuperStockistProfile from "./pages/super-stockist/SuperStockistProfile";
import SuperStockistOrders from "./pages/super-stockist/SuperStockistOrders";
import SuperStockistStock from "./pages/super-stockist/SuperStockistStock";
import SuperStockistReports from "./pages/super-stockist/SuperStockistReports";
import SuperStockistClaims from "./pages/super-stockist/SuperStockistClaims";
import SuperStockistShipment from "./pages/super-stockist/SuperStockistShipment";
import SuperStockistTrainingMaterial from "./pages/super-stockist/SuperStockistTrainingMaterial";
import HRDashboard from "./pages/hr/HRDashboard";
import HRAttendance from "./pages/hr/HRAttendance";
import HRTargetManagement from "./pages/hr/HRTargetManagement";
import HRReports from "./pages/hr/HRReports";
import HRApprovals from "./pages/hr/HRApprovals";
import HRSalaryExpenses from "./pages/hr/HRSalaryExpenses";
import HRConsignment from "./pages/hr/HRConsignment";
import HRKPIReport from "./pages/hr/HRKPIReport";
import HRRewardsRefunds from "./pages/hr/HRRewardsRefunds";
import HRShopwiseOverallSalesTrackerSkuWise from "./pages/hr/HRShopwiseOverallSalesTrackerSkuWise";
import HRManagerDashboard from "./pages/hr-manager/HRManagerDashboard";
import HRManagerFinalApprovals from "./pages/hr-manager/HRManagerFinalApprovals";
import HRManagerOversight from "./pages/hr-manager/HRManagerOversight";
import HRManagerFinancialAdjustments from "./pages/hr-manager/HRManagerFinancialAdjustments";
import HRManagerProductManagement from "./pages/hr-manager/HRManagerProductManagement";
import HRManagerOperations from "./pages/hr-manager/HRManagerOperations";
import DistributorDashboard from "./pages/distributor/DistributorDashboard";
import DistributorProfile from "./pages/distributor/DistributorProfile";
import DistributorOrders from "./pages/distributor/DistributorOrders";
import DistributorStock from "./pages/distributor/DistributorStock";
import DistributorReports from "./pages/distributor/DistributorReports";
import DistributorClaims from "./pages/distributor/DistributorClaims";
import DistributorBillsReceivable from "./pages/distributor/DistributorBillsReceivable";
import DistributorConsignment from "./pages/distributor/DistributorConsignment";
import TrainingMaterial from "./pages/training/TrainingMaterial";
import Attendance from "./pages/attendance/Attendance";
import Activities from "./pages/activities/Activities";
import Targets from "./pages/targets/Targets";
import Orders from "./pages/orders/Orders";
import Manpower from "./pages/manpower/Manpower";
import Claims from "./pages/claims/Claims";
import Reports from "./pages/reports/Reports";
import Approvals from "./pages/approvals/Approvals";
import UserProfile from "./pages/profile/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const { user } = useSelector((state) => state.auth);
  const isSupervisor = user?.role === "Supervisor";
  const isPromoter = user?.role === "Promoter";
  const isSuperStockist = user?.role === "Super Stockist";
  const isDistributor = user?.role === "Distributor";
  const isHR = user?.role === "HR";
  const isHRManager = user?.role === "HR Manager";
  const isAdmin = user?.role === "Admin";

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route
                  path="/"
                  element={
                    isPromoter ? (
                      <Navigate to="/promoter/dashboard" replace />
                    ) : isSupervisor ? (
                      <Navigate to="/supervisor/dashboard" replace />
                    ) : isSuperStockist ? (
                      <Navigate to="/super-stockist/dashboard" replace />
                    ) : isDistributor ? (
                      <Navigate to="/distributor/dashboard" replace />
                    ) : isHR ? (
                      <Navigate to="/hr/dashboard" replace />
                    ) : isHRManager || isAdmin ? (
                      <Navigate to="/hr-manager/dashboard" replace />
                    ) : (
                      <Navigate to="/dashboard" replace />
                    )
                  }
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/supervisor/dashboard"
                  element={<SupervisorDashboard />}
                />
                <Route
                  path="/supervisor/sales-report"
                  element={<SalesReport />}
                />
                <Route path="/supervisor/work-plan" element={<WorkPlan />} />
                <Route
                  path="/supervisor/salary-expenses"
                  element={<SalaryExpenses />}
                />
                <Route path="/supervisor/profile" element={<Profile />} />
                <Route
                  path="/promoter/dashboard"
                  element={<PromoterDashboard />}
                />
                <Route path="/promoter/tasks" element={<PromoterTasks />} />
                <Route
                  path="/promoter/sales-report"
                  element={<PromoterSalesReport />}
                />
                <Route
                  path="/promoter/sales-return"
                  element={<PromoterSalesReturn />}
                />
                <Route
                  path="/promoter/incentive"
                  element={<PromoterIncentive />}
                />
                <Route path="/promoter/reports" element={<PromoterReports />} />
                <Route
                  path="/promoter/training-material"
                  element={<PromoterTrainingMaterial />}
                />
                <Route
                  path="/promoter/customer-feedback"
                  element={<PromoterCustomerFeedback />}
                />
                <Route path="/promoter/profile" element={<PromoterProfile />} />
                <Route
                  path="/super-stockist/dashboard"
                  element={<SuperStockistDashboard />}
                />
                <Route
                  path="/super-stockist/profile"
                  element={<SuperStockistProfile />}
                />
                <Route
                  path="/super-stockist/orders"
                  element={<SuperStockistOrders />}
                />
                <Route
                  path="/super-stockist/stock"
                  element={<SuperStockistStock />}
                />
                <Route
                  path="/super-stockist/reports"
                  element={<SuperStockistReports />}
                />
                <Route
                  path="/super-stockist/claims"
                  element={<SuperStockistClaims />}
                />
                <Route
                  path="/super-stockist/shipment"
                  element={<SuperStockistShipment />}
                />
                <Route
                  path="/super-stockist/training-material"
                  element={<SuperStockistTrainingMaterial />}
                />
                <Route path="/hr/dashboard" element={<HRDashboard />} />
                <Route path="/hr/attendance" element={<HRAttendance />} />
                <Route
                  path="/hr/target-management"
                  element={<HRTargetManagement />}
                />
                <Route path="/hr/reports" element={<HRReports />} />
                <Route path="/hr/approvals" element={<HRApprovals />} />
                <Route
                  path="/hr/salary-expenses"
                  element={<HRSalaryExpenses />}
                />
                <Route path="/hr/consignment" element={<HRConsignment />} />
                <Route path="/hr/kpi-report" element={<HRKPIReport />} />
                <Route
                  path="/hr/rewards-refunds"
                  element={<HRRewardsRefunds />}
                />
                <Route
                  path="/hr/shopwise-overall-sales-tracker-sku-wise"
                  element={<HRShopwiseOverallSalesTrackerSkuWise />}
                />
                <Route
                  path="/hr/training-material"
                  element={<TrainingMaterial />}
                />
                <Route
                  path="/hr-manager/dashboard"
                  element={<HRManagerDashboard />}
                />
                <Route
                  path="/hr-manager/final-approvals"
                  element={<HRManagerFinalApprovals />}
                />
                <Route
                  path="/hr-manager/oversight"
                  element={<HRManagerOversight />}
                />
                <Route
                  path="/hr-manager/financial-adjustments"
                  element={<HRManagerFinancialAdjustments />}
                />
                <Route
                  path="/hr-manager/product-management"
                  element={<HRManagerProductManagement />}
                />
                <Route
                  path="/hr-manager/operations"
                  element={<HRManagerOperations />}
                />
                <Route
                  path="/distributor/dashboard"
                  element={<DistributorDashboard />}
                />
                <Route
                  path="/distributor/profile"
                  element={<DistributorProfile />}
                />
                <Route
                  path="/distributor/orders"
                  element={<DistributorOrders />}
                />
                <Route
                  path="/distributor/stock"
                  element={<DistributorStock />}
                />
                <Route
                  path="/distributor/reports"
                  element={<DistributorReports />}
                />
                <Route
                  path="/distributor/claims"
                  element={<DistributorClaims />}
                />
                <Route
                  path="/distributor/bills-receivable"
                  element={<DistributorBillsReceivable />}
                />
                <Route
                  path="/distributor/consignment"
                  element={<DistributorConsignment />}
                />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/targets" element={<Targets />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/manpower" element={<Manpower />} />
                <Route path="/claims" element={<Claims />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/work-plan" element={<RSMWorkPlan />} />
                <Route
                  path="/stock-monitoring"
                  element={<RSMStockMonitoring />}
                />
                <Route
                  path="/training-material"
                  element={<TrainingMaterial />}
                />
                <Route path="/profile" element={<UserProfile />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
