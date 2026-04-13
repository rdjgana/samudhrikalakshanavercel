import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { MOCK_SUPERVISOR_PROMOTERS, MOCK_SHOPS } from "../../data/mockData";
import { Clock } from "lucide-react";
import { useTablePagination } from "../../hooks/useTablePagination";
import TablePaginationControls from "../../components/common/TablePaginationControls";

// Sales Slabs for categorization
const SALES_SLABS = [
  { id: "slab_a", name: "Slab A", range: "₹0 - ₹50,000" },
  { id: "slab_b", name: "Slab B", range: "₹50,001 - ₹1,00,000" },
  { id: "slab_c", name: "Slab C", range: "₹1,00,001 - ₹2,00,000" },
  { id: "slab_d", name: "Slab D", range: "₹2,00,001 - ₹5,00,000" },
  { id: "slab_e", name: "Slab E", range: "Above ₹5,00,000" },
];

const SalesReport = () => {
  const [selectedPromoter, setSelectedPromoter] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [filteredShops, setFilteredShops] = useState([]);
  const [salesReports, setSalesReports] = useState([]);
  const salesReportsPagination = useTablePagination(salesReports);
  const [timeUntilWindow, setTimeUntilWindow] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [showSalesFormModal, setShowSalesFormModal] = useState(false);
  const [salesFormData, setSalesFormData] = useState({
    primarySales: "",
    secondarySales: "",
    date: new Date().toISOString().split("T")[0],
    remarks: "",
    slab: "",
  });

  // Check submission window (Before 11:50 PM - submission closes at 11:50 PM)
  useEffect(() => {
    const checkSubmissionWindow = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinutes;

      // Submission window: Before 11:50 PM (23:50) = 1430 minutes
      const windowCloseTime = 23 * 60 + 50; // 1430 minutes

      if (currentTime < windowCloseTime) {
        setCanSubmit(true);
        const minutesUntil = windowCloseTime - currentTime;
        const hours = Math.floor(minutesUntil / 60);
        const mins = minutesUntil % 60;
        const seconds = 60 - now.getSeconds();
        setTimeUntilWindow(
          `Submission window is open (closes at 11:50 PM - ${hours}h ${mins}m ${seconds}s remaining)`,
        );
      } else {
        setCanSubmit(false);
        // Window has closed, calculate until next day
        const minutesUntil = 24 * 60 - currentTime + windowCloseTime;
        const hours = Math.floor(minutesUntil / 60);
        const mins = minutesUntil % 60;
        setTimeUntilWindow(
          `Submission window closed. Next window opens tomorrow (in ${hours}h ${mins}m)`,
        );
      }
    };

    checkSubmissionWindow();
    const interval = setInterval(checkSubmissionWindow, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle promoter selection change
  const handlePromoterChange = (promoterId) => {
    setSelectedPromoter(promoterId);
    setSelectedShop(""); // Reset shop when promoter changes

    if (promoterId) {
      const promoter = MOCK_SUPERVISOR_PROMOTERS.find(
        (p) => p.id === parseInt(promoterId),
      );
      if (promoter) {
        const shops = MOCK_SHOPS.filter(
          (s) => s.distributorId === promoter.distributorId,
        );
        setFilteredShops(shops);
      } else {
        setFilteredShops([]);
      }
    } else {
      setFilteredShops([]);
    }
  };

  const handleAddAndPost = () => {
    if (!selectedPromoter) {
      alert("Please select a Promoter");
      return;
    }

    if (!selectedShop) {
      alert("Please select a Shop");
      return;
    }

    if (!canSubmit) {
      alert(
        "Sales report can only be posted before 11:50 PM. Submission window is now closed.",
      );
      return;
    }

    // Open the sales form modal
    setShowSalesFormModal(true);
    // Reset form data
    setSalesFormData({
      primarySales: "",
      secondarySales: "",
      date: new Date().toISOString().split("T")[0],
      remarks: "",
      slab: "",
    });
  };

  const handleSalesFormSubmit = (e) => {
    e.preventDefault();

    if (!salesFormData.primarySales || !salesFormData.secondarySales) {
      alert("Please fill in Primary Sales and Secondary Sales");
      return;
    }

    const promoter = MOCK_SUPERVISOR_PROMOTERS.find(
      (p) => p.id === parseInt(selectedPromoter),
    );
    const shop = MOCK_SHOPS.find((s) => s.id === parseInt(selectedShop));

    if (!promoter) {
      alert("Promoter not found");
      return;
    }

    if (!shop) {
      alert("Shop not found");
      return;
    }

    const selectedSlabObj = SALES_SLABS.find(
      (s) => s.id === salesFormData.slab,
    );

    const newReport = {
      id: Date.now(),
      promoterId: selectedPromoter,
      promoterName: promoter.name,
      promoterCode: promoter.code,
      shopId: selectedShop,
      shopName: shop.name,
      date: salesFormData.date,
      postedAt: new Date().toLocaleTimeString(),
      status: "Posted",
      primarySales: parseFloat(salesFormData.primarySales) || 0,
      secondarySales: parseFloat(salesFormData.secondarySales) || 0,
      remarks: salesFormData.remarks || "",
      slab: salesFormData.slab,
      slabName: selectedSlabObj?.name || "-",
    };

    setSalesReports((prev) => [newReport, ...prev]);
    setSelectedPromoter("");
    setSelectedShop("");
    setFilteredShops([]);
    setShowSalesFormModal(false);
    setSalesFormData({
      primarySales: "",
      secondarySales: "",
      date: new Date().toISOString().split("T")[0],
      remarks: "",
      slab: "",
    });
    alert("Sales report posted successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
        <p className="text-gray-600 mt-2">
          Create and post sales reports for promoters
        </p>
      </div>

      {/* Submission Window Status */}
      <Card
        className={
          canSubmit
            ? "border-green-500 bg-green-50"
            : "border-yellow-500 bg-yellow-50"
        }
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Clock
              className={canSubmit ? "text-green-600" : "text-yellow-600"}
            />
            <div>
              <p
                className={`font-medium ${canSubmit ? "text-green-800" : "text-yellow-800"}`}
              >
                {canSubmit
                  ? "Submission Window Open"
                  : "Submission Window Closed"}
              </p>
              <p
                className={`text-sm ${canSubmit ? "text-green-700" : "text-yellow-700"}`}
              >
                {timeUntilWindow}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Reports must be posted before 11:50 PM. Submission closes at
                11:50 PM.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Sales Report */}
      <Card>
        <CardHeader>
          <CardTitle>Create Sales Report</CardTitle>
          <CardDescription>
            Select promoter and post sales report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Promoter *</Label>
            <Select
              value={selectedPromoter}
              onChange={(e) => handlePromoterChange(e.target.value)}
            >
              <option value="">Select Promoter</option>
              {MOCK_SUPERVISOR_PROMOTERS.map((promoter) => (
                <option key={promoter.id} value={promoter.id}>
                  {promoter.name} ({promoter.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Shop *</Label>
            <Select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              disabled={!selectedPromoter}
            >
              <option value="">Select Shop</option>
              {filteredShops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </Select>
            {selectedPromoter && filteredShops.length === 0 && (
              <p className="text-xs text-red-500">
                No shops found for this promoter's distributor.
              </p>
            )}
          </div>

          <Button
            onClick={handleAddAndPost}
            disabled={!selectedPromoter || !selectedShop || !canSubmit}
            className="w-full bg-[#433228] hover:bg-[#5a4238] disabled:opacity-50 h-12 text-lg font-semibold mt-4 transition-all active:scale-[0.98]"
          >
            Add And Post
          </Button>

          {!canSubmit && (
            <p className="text-sm text-yellow-600">
              ⚠️ Sales report can only be posted before 11:50 PM. Submission
              window is now closed.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Posted Reports List */}
      {salesReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Posted Sales Reports</CardTitle>
            <CardDescription>List of all posted sales reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promoter</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Slab</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Primary Sales</TableHead>
                  <TableHead>Secondary Sales</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Posted At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesReportsPagination.paginatedItems.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.promoterName}
                    </TableCell>
                    <TableCell>{report.shopName}</TableCell>
                    <TableCell>{report.promoterCode}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                        {report.slabName}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(report.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      ₹{report.primarySales.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      ₹{report.secondarySales.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {report.remarks || "-"}
                    </TableCell>
                    <TableCell>{report.postedAt}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {report.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePaginationControls {...salesReportsPagination} />
          </CardContent>
        </Card>
      )}

      {salesReports.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No sales reports posted yet
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sales Report Form Modal */}
      <Dialog open={showSalesFormModal} onOpenChange={setShowSalesFormModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sales Report</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Fill in the sales details for{" "}
              {MOCK_SUPERVISOR_PROMOTERS.find(
                (p) => p.id === parseInt(selectedPromoter),
              )?.name || "Promoter"}{" "}
              at{" "}
              {MOCK_SHOPS.find((s) => s.id === parseInt(selectedShop))?.name ||
                "Shop"}
            </p>
          </DialogHeader>
          <form onSubmit={handleSalesFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={salesFormData.date}
                onChange={(e) =>
                  setSalesFormData({ ...salesFormData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slab">Sales Slab (Optional)</Label>
              <Select
                id="slab"
                value={salesFormData.slab}
                onChange={(e) =>
                  setSalesFormData({ ...salesFormData, slab: e.target.value })
                }
              >
                <option value="">Select Slab</option>
                {SALES_SLABS.map((slab) => (
                  <option key={slab.id} value={slab.id}>
                    {slab.name} - {slab.range}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primarySales">Primary Sales (₹) *</Label>
              <Input
                id="primarySales"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter primary sales amount"
                value={salesFormData.primarySales}
                onChange={(e) => {
                  const value =
                    e.target.value === ""
                      ? ""
                      : Math.max(0, parseFloat(e.target.value) || 0);
                  setSalesFormData({ ...salesFormData, primarySales: value });
                }}
                onInput={(e) => {
                  if (e.target.value < 0) e.target.value = 0;
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondarySales">Secondary Sales (₹) *</Label>
              <Input
                id="secondarySales"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter secondary sales amount"
                value={salesFormData.secondarySales}
                onChange={(e) => {
                  const value =
                    e.target.value === ""
                      ? ""
                      : Math.max(0, parseFloat(e.target.value) || 0);
                  setSalesFormData({ ...salesFormData, secondarySales: value });
                }}
                onInput={(e) => {
                  if (e.target.value < 0) e.target.value = 0;
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Input
                id="remarks"
                type="text"
                placeholder="Enter any remarks or notes"
                value={salesFormData.remarks}
                onChange={(e) =>
                  setSalesFormData({
                    ...salesFormData,
                    remarks: e.target.value,
                  })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSalesFormModal(false);
                  setSalesFormData({
                    primarySales: "",
                    secondarySales: "",
                    date: new Date().toISOString().split("T")[0],
                    remarks: "",
                    slab: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#433228] hover:bg-[#5a4238] text-white"
              >
                Post Sales Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesReport;
