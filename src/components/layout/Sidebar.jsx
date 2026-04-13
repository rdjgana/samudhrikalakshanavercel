import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { logout } from "../../store/slices/authSlice";
import {
  fetchWorkPlanApprovals,
  fetchTargetApprovals,
  fetchLeaveApprovals,
  fetchClaimApprovals,
  fetchOrderApprovals,
} from "../../store/slices/approvalsSlice";
import {
  LayoutDashboard,
  Clock,
  Activity,
  Target,
  ShoppingCart,
  Users,
  Receipt,
  FileText,
  CheckCircle,
  X,
  LogOut,
  Package,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Menu items based on role
const getMenuItems = (userRole) => {
  const baseMenuItems = [
    {
      path: "/dashboard",
      label: "Executive Dashboard",
      icon: LayoutDashboard,
      roles: ["RSM"],
    },
    {
      path: "/supervisor/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["Supervisor"],
    },
    {
      path: "/promoter/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["Promoter"],
    },
    {
      path: "/super-stockist/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["Super Stockist"],
    },
    {
      path: "/distributor/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["Distributor"],
    },
    {
      path: "/hr/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["HR"],
    },
    {
      path: "/hr-manager/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["HR Manager", "Admin"],
    },
    {
      path: "/attendance",
      label: "Attendance",
      icon: Clock,
      roles: ["RSM", "Supervisor", "Promoter"],
    },
    {
      path: "/activities",
      label: "My Activities",
      icon: Activity,
      roles: ["RSM", "Supervisor"],
    },
    {
      path: "/promoter/tasks",
      label: "My Target",
      icon: Target,
      roles: ["Promoter"],
    },
    {
      path: "/targets",
      label: "My Target",
      icon: Target,
      roles: ["RSM", "Supervisor"],
    },
    {
      path: "/orders",
      label: "Orders & Entities",
      icon: ShoppingCart,
      roles: ["RSM", "Supervisor"],
    },
    {
      path: "/stock-monitoring",
      label: "Stock Monitoring",
      icon: Package,
      roles: ["RSM"],
    },
    {
      path: "/promoter/sales-report",
      label: "Sales Report",
      icon: Receipt,
      roles: ["Promoter"],
    },
    {
      path: "/promoter/sales-return",
      label: "Sales Return",
      icon: Receipt,
      roles: ["Promoter"],
    },
    {
      path: "/supervisor/sales-report",
      label: "Sales Report",
      icon: Receipt,
      roles: ["Supervisor"],
    },
    {
      path: "/supervisor/work-plan",
      label: "Work Plan",
      icon: Activity,
      roles: ["Supervisor"],
    },
    { path: "/work-plan", label: "Work Plan", icon: Activity, roles: ["RSM"] },
    {
      path: "/promoter/incentive",
      label: "Salary/Incentive",
      icon: Receipt,
      roles: ["Promoter"],
    },
    {
      path: "/supervisor/salary-expenses",
      label: "Salary & Expenses",
      icon: Receipt,
      roles: ["Supervisor"],
    },
    {
      path: "/promoter/reports",
      label: "Reports",
      icon: FileText,
      roles: ["Promoter"],
    },
    {
      path: "/training-material",
      label: "Training Material",
      icon: FileText,
      roles: ["RSM", "Supervisor"],
    },
    {
      path: "/promoter/training-material",
      label: "Training Material",
      icon: FileText,
      roles: ["Promoter"],
    },
    {
      path: "/promoter/customer-feedback",
      label: "Customer Feedback",
      icon: FileText,
      roles: ["Promoter"],
    },
    {
      path: "/super-stockist/orders",
      label: "Order Management",
      icon: ShoppingCart,
      roles: ["Super Stockist"],
    },
    {
      path: "/super-stockist/stock",
      label: "Stock Monitoring",
      icon: Package,
      roles: ["Super Stockist"],
    },
    {
      path: "/super-stockist/reports",
      label: "Sales & Purchase Reports",
      icon: FileText,
      roles: ["Super Stockist"],
    },
    {
      path: "/super-stockist/claims",
      label: "Claim Management",
      icon: Receipt,
      roles: ["Super Stockist"],
    },
    {
      path: "/super-stockist/shipment",
      label: "Shipment & Tracking",
      icon: Truck,
      roles: ["Super Stockist"],
    },
    {
      path: "/super-stockist/training-material",
      label: "Training Material",
      icon: FileText,
      roles: ["Super Stockist"],
    },
    {
      path: "/distributor/orders",
      label: "Order Management",
      icon: ShoppingCart,
      roles: ["Distributor"],
    },
    {
      path: "/distributor/stock",
      label: "Stock Monitoring",
      icon: Package,
      roles: ["Distributor"],
    },
    {
      path: "/distributor/reports",
      label: "Sales & Purchase Reports",
      icon: FileText,
      roles: ["Distributor"],
    },
    {
      path: "/distributor/claims",
      label: "Claims",
      icon: Receipt,
      roles: ["Distributor"],
    },
    {
      path: "/distributor/bills-receivable",
      label: "Bills Receivable",
      icon: Receipt,
      roles: ["Distributor"],
    },
    {
      path: "/distributor/consignment",
      label: "Consignment & Delivery",
      icon: Truck,
      roles: ["Distributor"],
    },
    {
      path: "/manpower",
      label: "Manpower & Employee",
      icon: Users,
      roles: ["RSM"],
    },
    {
      path: "/reports",
      label: "Reports",
      icon: FileText,
      roles: ["RSM", "Supervisor"],
    },
    {
      path: "/approvals",
      label: "Approvals",
      icon: CheckCircle,
      roles: ["RSM"],
    },
    {
      path: "/promoter/profile",
      label: "My Profile",
      icon: Users,
      roles: ["Promoter"],
    },
    {
      path: "/supervisor/profile",
      label: "My Profile",
      icon: Users,
      roles: ["Supervisor"],
    },
    {
      path: "/super-stockist/profile",
      label: "My Profile",
      icon: Users,
      roles: ["Super Stockist"],
    },
    {
      path: "/distributor/profile",
      label: "My Profile",
      icon: Users,
      roles: ["Distributor"],
    },
    { path: "/profile", label: "My Profile", icon: Users, roles: ["RSM"] },
    { path: "/hr/attendance", label: "Attendance", icon: Clock, roles: ["HR"] },
    {
      path: "/hr/target-management",
      label: "Target Management",
      icon: Target,
      roles: ["HR"],
    },
    { path: "/hr/reports", label: "Reports", icon: FileText, roles: ["HR"] },
    {
      path: "/hr/approvals",
      label: "Approvals",
      icon: CheckCircle,
      roles: ["HR"],
    },
    {
      path: "/hr/salary-expenses",
      label: "Salary & Expenses",
      icon: Receipt,
      roles: ["HR"],
    },
    {
      path: "/hr/consignment",
      label: "Consignment Tracking",
      icon: Truck,
      roles: ["HR"],
    },
    {
      path: "/hr/training-material",
      label: "Training Material",
      icon: FileText,
      roles: ["HR"],
    },
    {
      path: "/hr/rewards-refunds",
      label: "Rewards & Refunds",
      icon: Receipt,
      roles: ["HR"],
    },
    {
      path: "/hr/shopwise-overall-sales-tracker-sku-wise",
      label: "SHOPWISE OVER ALL SALES TRACKER - SKU WISE",
      icon: FileText,
      roles: ["HR"],
    },
    {
      path: "/hr-manager/final-approvals",
      label: "Final Approvals",
      icon: CheckCircle,
      roles: ["HR Manager", "Admin"],
    },
    {
      path: "/hr-manager/oversight",
      label: "HR Oversight",
      icon: CheckCircle,
      roles: ["HR Manager", "Admin"],
    },
    {
      path: "/hr-manager/financial-adjustments",
      label: "Incentive Management",
      icon: Receipt,
      roles: ["HR Manager", "Admin"],
    },
    {
      path: "/hr-manager/product-management",
      label: "Product Management",
      icon: Package,
      roles: ["HR Manager", "Admin"],
    },
    {
      path: "/hr-manager/operations",
      label: "Operations",
      icon: Activity,
      roles: ["HR Manager", "Admin"],
    },
  ];

  // Filter menu items based on user role
  if (!userRole)
    return baseMenuItems.filter((item) => item.roles.includes("RSM"));
  return baseMenuItems.filter((item) => item.roles.includes(userRole));
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    workPlanApprovals,
    targetApprovals,
    leaveApprovals,
    claimApprovals,
    orderApprovals,
  } = useSelector((state) => state.approvals);

  // Fetch approvals if user is RSM (only role that can see approvals)
  useEffect(() => {
    if (user?.role === "RSM") {
      dispatch(fetchWorkPlanApprovals({}));
      dispatch(fetchTargetApprovals({}));
      dispatch(fetchLeaveApprovals({}));
      dispatch(fetchClaimApprovals({}));
      dispatch(fetchOrderApprovals({}));
    }
  }, [dispatch, user?.role]);

  // Calculate pending approvals count
  const getPendingApprovalsCount = () => {
    if (user?.role !== "RSM") return 0;

    const countWorkPlan =
      workPlanApprovals?.filter((a) => a.status === "Pending").length || 0;
    const countTarget =
      targetApprovals?.filter((a) => a.status === "Pending").length || 0;
    const countLeave =
      leaveApprovals?.filter((a) => a.status === "Pending").length || 0;
    const countClaim =
      claimApprovals?.filter((a) => a.status === "Pending").length || 0;
    const countOrder =
      orderApprovals?.filter((a) => a.status === "Pending").length || 0;

    return countWorkPlan + countTarget + countLeave + countClaim + countOrder;
  };

  const pendingApprovalsCount = getPendingApprovalsCount();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white text-gray-900 border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative flex items-center justify-center p-6  border-gray-200">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-20 w-20 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute right-4 top-4 text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {getMenuItems(user?.role).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const hasNotification =
                  item.path === "/approvals" && pendingApprovalsCount > 0;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative",
                        isActive
                          ? "bg-[#433228] text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={20} />
                      <span className="flex-1">{item.label}</span>
                      {hasNotification && (
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-sm",
                            isActive
                              ? "bg-white border-2 border-[#433228]"
                              : "bg-[#433228] border-2 border-white",
                          )}
                          title={`${pendingApprovalsCount} pending approval${pendingApprovalsCount > 1 ? "s" : ""}`}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-700 hover:bg-red-100 hover:text-red-700 hover:font-bold transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
