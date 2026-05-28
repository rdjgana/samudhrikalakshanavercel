import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
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
import {
  MOCK_SUPERVISOR_PROMOTERS,
  MOCK_SHOPS,
  MOCK_HIERARCHY,
  COSMETICS_CATEGORIES,
  getProductsByCategory,
  getRsmStockDetailLines,
} from "../../data/mockData";
import { Plus, Minus } from "lucide-react";
import { useTablePagination } from "../../hooks/useTablePagination";
import TablePaginationControls from "../../components/common/TablePaginationControls";

/** Local calendar YYYY-MM-DD (avoids UTC-only `toISOString()` shifting the business date near midnight). */
function getLocalCalendarDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Shop, distributor, RSM (mock uses linked ASM name — no separate RSM entity). */
function getPromoterSalesContext(promoter) {
  if (!promoter) {
    return {
      shop: null,
      distributorName: null,
      rsmName: null,
    };
  }
  const distributor = MOCK_HIERARCHY.distributors.find(
    (d) => d.id === promoter.distributorId,
  );
  if (!distributor) {
    return {
      shop: null,
      distributorName: null,
      rsmName: null,
    };
  }

  const area = (promoter.area || "").trim().toLowerCase();
  const shopsForDist = MOCK_SHOPS.filter((s) => s.distributorId === distributor.id);
  const shopByArea =
    area &&
    shopsForDist.find((s) => (s.address || "").toLowerCase().includes(area));
  const shop = shopByArea || shopsForDist[0] || null;

  const supervisor = MOCK_HIERARCHY.supervisors.find(
    (s) => s.id === distributor.supervisorId,
  );
  const so = supervisor
    ? MOCK_HIERARCHY.sos.find((x) => x.id === supervisor.soId)
    : null;
  const asm = so
    ? MOCK_HIERARCHY.asms.find((a) => a.id === so.asmId)
    : null;

  return {
    shop,
    distributorName: distributor.name,
    rsmName: asm?.name ?? null,
  };
}

const SalesReport = () => {
  const [selectedPromoter, setSelectedPromoter] = useState("");
  const [salesReports, setSalesReports] = useState([]);
  const salesReportsPagination = useTablePagination(salesReports);
  const [showSalesFormModal, setShowSalesFormModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    COSMETICS_CATEGORIES[0]?.name || "Face Care",
  );
  const [soldProducts, setSoldProducts] = useState({});

  const selectedPromoterData = useMemo(
    () =>
      MOCK_SUPERVISOR_PROMOTERS.find((p) => p.id === parseInt(selectedPromoter, 10)),
    [selectedPromoter],
  );

  const promoterContext = useMemo(
    () => getPromoterSalesContext(selectedPromoterData),
    [selectedPromoterData],
  );

  const autoSelectedShop = promoterContext.shop;

  // Per-product available stock for the auto-selected shop (deterministic mock)
  const shopStockByProduct = useMemo(() => {
    if (!autoSelectedShop?.id) return {};
    const lines = getRsmStockDetailLines("shop", autoSelectedShop.id);
    return lines.reduce((acc, line) => {
      acc[line.productId] = line.pieces;
      return acc;
    }, {});
  }, [autoSelectedShop]);

  const getProductAvailableStock = (productId) =>
    typeof shopStockByProduct[productId] === "number" ? shopStockByProduct[productId] : 0;

  const handleOpenSalesForm = () => {
    if (!selectedPromoter) {
      alert("Please select a Promoter");
      return;
    }
    if (!autoSelectedShop) {
      alert("No shop mapped to selected promoter");
      return;
    }

    setShowSalesFormModal(true);
    setSoldProducts({});
    setSelectedCategory(COSMETICS_CATEGORIES[0]?.name || "Face Care");
  };

  const handleProductQuantityChange = (productId, direction) => {
    const currentQty = parseInt(soldProducts[productId]) || 0;
    const stock = getProductAvailableStock(productId);
    let nextQty;
    if (direction === "increment") {
      nextQty = Math.min(stock, currentQty + 1);
    } else {
      nextQty = Math.max(0, currentQty - 1);
    }
    setSoldProducts((prev) => ({
      ...prev,
      [productId]: nextQty > 0 ? nextQty : "",
    }));
  };

  const totalSalesValue = useMemo(
    () =>
      Object.entries(soldProducts).reduce((sum, [productId, quantity]) => {
        const product = COSMETICS_CATEGORIES.length
          ? getProductsByCategory("Face Care")
              .concat(getProductsByCategory("Body Care"))
              .concat(getProductsByCategory("Hair Care"))
              .concat(getProductsByCategory("Personal Care"))
              .find((p) => p.id === parseInt(productId))
          : null;
        return sum + ((parseInt(quantity) || 0) * (product?.price || 0));
      }, 0),
    [soldProducts],
  );

  const handleSalesFormSubmit = (e) => {
    e.preventDefault();

    const selectedProducts = Object.entries(soldProducts).filter(
      ([, quantity]) => parseInt(quantity) > 0,
    );
    if (selectedProducts.length === 0) {
      alert("Please select sold products and quantity");
      return;
    }

    if (!selectedPromoterData || !autoSelectedShop) {
      alert("Promoter not found");
      return;
    }

    const reportDate = getLocalCalendarDateString();

    const newReport = {
      id: Date.now(),
      promoterId: selectedPromoter,
      promoterName: selectedPromoterData.name,
      promoterCode: selectedPromoterData.code,
      shopId: autoSelectedShop.id,
      shopName: autoSelectedShop.name,
      date: reportDate,
      postedAt: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      status: "Posted",
      distributorName: promoterContext.distributorName,
      rsmName: promoterContext.rsmName,
      products: selectedProducts.map(([productId, qty]) => {
        const product = COSMETICS_CATEGORIES.length
          ? getProductsByCategory("Face Care")
              .concat(getProductsByCategory("Body Care"))
              .concat(getProductsByCategory("Hair Care"))
              .concat(getProductsByCategory("Personal Care"))
              .find((p) => p.id === parseInt(productId))
          : null;
        return {
          productId: parseInt(productId),
          productName: product?.name || "Unknown",
          category: product?.category || "",
          quantity: parseInt(qty),
          unitPrice: product?.price || 0,
          total: (parseInt(qty) || 0) * (product?.price || 0),
        };
      }),
      totalValue: totalSalesValue,
    };

    // Persist for promoter login context (keyed by promoter id)
    const promoterReportKey = `promoter_sales_reports_${selectedPromoter}`;
    const existingReports = JSON.parse(localStorage.getItem(promoterReportKey) || "[]");
    localStorage.setItem(
      promoterReportKey,
      JSON.stringify([newReport, ...existingReports]),
    );

    setSalesReports((prev) => [newReport, ...prev]);
    setSelectedPromoter("");
    setShowSalesFormModal(false);
    setSoldProducts({});
    alert("Sales report posted successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
        <p className="text-gray-600 mt-2">
          Create and post product-wise sales reports for promoters
        </p>
      </div>

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
              onChange={(e) => setSelectedPromoter(e.target.value)}
            >
              <option value="">Select Promoter</option>
              {MOCK_SUPERVISOR_PROMOTERS.map((promoter) => (
                <option key={promoter.id} value={promoter.id}>
                  {promoter.name} ({promoter.code})
                </option>
              ))}
            </Select>
          </div>

          {selectedPromoterData && (
            <div className="rounded-lg border border-[#433228]/20 bg-[#433228]/5 p-4 text-sm space-y-2">
              <p className="font-semibold text-gray-900">Mapped organisation</p>
              <div className="grid gap-1 sm:grid-cols-1">
                <p>
                  <span className="text-gray-600">Shop: </span>
                  <span className="font-medium text-gray-900">
                    {autoSelectedShop?.name || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Distributor: </span>
                  <span className="font-medium text-gray-900">
                    {promoterContext.distributorName || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">RSM: </span>
                  <span className="font-medium text-gray-900">
                    {promoterContext.rsmName || "—"}
                  </span>
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleOpenSalesForm}
            disabled={!selectedPromoter || !autoSelectedShop}
            className="w-full bg-[#433228] hover:bg-[#5a4238] disabled:opacity-50 h-12 text-lg font-semibold mt-4 transition-all active:scale-[0.98]"
          >
            Add Sales Report
          </Button>
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
                  <TableHead>Distributor</TableHead>
                  <TableHead>RSM</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Products Sold</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
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
                    <TableCell>{report.distributorName || "—"}</TableCell>
                    <TableCell>{report.rsmName || "—"}</TableCell>
                    <TableCell>{report.promoterCode}</TableCell>
                    <TableCell>
                      {new Date(report.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {report.products?.length || 0} item(s)
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{(report.totalValue || 0).toLocaleString("en-IN")}
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
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Add Sales Report</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Fill in sold products for{" "}
              {selectedPromoterData?.name || "Promoter"} at{" "}
              {autoSelectedShop?.name || "Shop"}
              {promoterContext.distributorName ? (
                <>
                  {" "}
                  · Distributor: {promoterContext.distributorName}
                </>
              ) : null}
              {promoterContext.rsmName ? (
                <>
                  {" "}
                  · RSM: {promoterContext.rsmName}
                </>
              ) : null}
            </p>
          </DialogHeader>
          <form noValidate onSubmit={handleSalesFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <div className="h-10 rounded-md border border-input bg-gray-100 px-3 py-2 text-sm">
                {new Date(`${getLocalCalendarDateString()}T12:00:00`).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {COSMETICS_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    className={
                      selectedCategory === category.name
                        ? "bg-[#433228] hover:bg-[#5a4238]"
                        : ""
                    }
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pr-1">
              {getProductsByCategory(selectedCategory).map((product) => {
                const quantity = parseInt(soldProducts[product.id]) || 0;
                const availableStock = getProductAvailableStock(product.id);
                const remainingStock = Math.max(0, availableStock - quantity);
                const isOutOfStock = availableStock === 0;
                const isAtMax = !isOutOfStock && quantity >= availableStock;
                const stockBadgeClass = isOutOfStock
                  ? "bg-red-100 text-red-700 border-red-200"
                  : remainingStock <= 5
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200";
                return (
                  <div key={product.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={
                            product.image ||
                            "https://via.placeholder.com/80?text=Product"
                          }
                          alt={product.name}
                          className="h-16 w-16 rounded-md object-cover border border-gray-200 bg-gray-50"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80?text=Product";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-medium leading-snug">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          Code: {product.code} | ₹{product.price}/{product.unit}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${stockBadgeClass}`}
                          >
                            {isOutOfStock
                              ? "Out of stock"
                              : `Available: ${remainingStock} / ${availableStock}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleProductQuantityChange(product.id, "decrement")
                          }
                          disabled={quantity === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleProductQuantityChange(product.id, "increment")
                          }
                          disabled={isOutOfStock || isAtMax}
                          title={
                            isOutOfStock
                              ? "No stock available at this shop"
                              : isAtMax
                              ? "Reached available stock"
                              : undefined
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-semibold text-green-700">
                        ₹{(quantity * product.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-md bg-green-50 border border-green-200 p-3 flex justify-between items-center">
              <span className="font-medium text-green-800">Total Sales Value</span>
              <span className="text-xl font-bold text-green-700">
                ₹{totalSalesValue.toLocaleString("en-IN")}
              </span>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSalesFormModal(false);
                  setSoldProducts({});
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
