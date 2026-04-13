import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  COSMETICS_CATEGORIES,
  MOCK_PRODUCTS,
  getProductsByCategory,
} from "../../data/mockData";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useTablePagination } from "../../hooks/useTablePagination";
import TablePaginationControls from "../../components/common/TablePaginationControls";

const SalesReportItemsTable = ({ items }) => {
  const reportItemsPagination = useTablePagination(items);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">MRP</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportItemsPagination.paginatedItems.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>{item.productCode}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">₹{item.mrp}</TableCell>
              <TableCell className="text-right">₹{item.total.toLocaleString("en-IN")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {items.length > 0 && <TablePaginationControls {...reportItemsPagination} />}
    </>
  );
};

const PromoterSalesReport = () => {
  const [selectedCategory, setSelectedCategory] = useState("Face Care");
  const [cart, setCart] = useState({}); // { productId: { product, quantity, stock } }
  const [salesReports, setSalesReports] = useState([]);

  // Mock stock data - in real app, fetch from API
  const getProductStock = (productId) => {
    // Mock stock: random between 50-200
    return Math.floor(Math.random() * 150) + 50;
  };

  const addToCart = (product) => {
    const currentStock = getProductStock(product.id);
    const cartItem = cart[product.id];
    const currentQuantity = cartItem ? cartItem.quantity : 0;

    if (currentQuantity >= currentStock) {
      alert(`Cannot add more. Available stock: ${currentStock}`);
      return;
    }

    setCart((prev) => ({
      ...prev,
      [product.id]: {
        product,
        quantity: (cartItem?.quantity || 0) + 1,
        stock: currentStock - (cartItem?.quantity || 0) - 1,
      },
    }));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 0) return;

    const cartItem = cart[productId];
    if (!cartItem) return;

    const originalStock = cartItem.stock + cartItem.quantity;
    if (newQuantity > originalStock) {
      alert(`Cannot add more. Available stock: ${originalStock}`);
      return;
    }

    setCart((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: newQuantity,
        stock: originalStock - newQuantity,
      },
    }));
  };

  const getTotalMRP = () => {
    return Object.values(cart).reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const handleSubmitReport = () => {
    if (Object.keys(cart).length === 0) {
      alert("Please add products to cart");
      return;
    }

    const newReport = {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      products: Object.values(cart).map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productCode: item.product.code,
        category: item.product.category,
        quantity: item.quantity,
        mrp: item.product.price,
        total: item.product.price * item.quantity,
      })),
      totalMRP: getTotalMRP(),
      createdAt: new Date().toISOString(),
    };

    setSalesReports((prev) => [newReport, ...prev]);
    setCart({});
    alert("Sales report submitted successfully!");
  };

  const categoryProducts = getProductsByCategory(selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
        <p className="text-gray-600 mt-2">
          Add products to cart and submit sales report
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Products</CardTitle>
              <CardDescription>
                Choose category and add products to cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <TabsList className="grid w-full grid-cols-5">
                  {COSMETICS_CATEGORIES.map((category) => (
                    <TabsTrigger key={category.id} value={category.name}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {COSMETICS_CATEGORIES.map((category) => (
                  <TabsContent
                    key={category.id}
                    value={category.name}
                    className="mt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getProductsByCategory(category.name).map((product) => {
                        const cartItem = cart[product.id];
                        const currentStock = cartItem
                          ? cartItem.stock
                          : getProductStock(product.id);

                        return (
                          <div
                            key={product.id}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Code: {product.code}
                                </p>
                                <p className="text-sm font-medium text-[#433228] mt-1">
                                  MRP: ₹{product.price}/{product.unit}
                                </p>
                              </div>
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="text-gray-600">Stock: </span>
                                <span
                                  className={`font-semibold ${currentStock > 20 ? "text-green-600" : currentStock > 10 ? "text-yellow-600" : "text-red-600"}`}
                                >
                                  {currentStock} units
                                </span>
                              </div>

                              {cartItem ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateQuantity(
                                        product.id,
                                        cartItem.quantity - 1,
                                      )
                                    }
                                    disabled={cartItem.quantity === 0}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center font-semibold">
                                    {cartItem.quantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateQuantity(
                                        product.id,
                                        cartItem.quantity + 1,
                                      )
                                    }
                                    disabled={currentStock === 0}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(product)}
                                  disabled={currentStock === 0}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({Object.keys(cart).length})
              </CardTitle>
              <CardDescription>Selected products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(cart).length === 0 ? (
                <p className="text-center text-gray-500 py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.values(cart).map((item) => (
                      <div
                        key={item.product.id}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.product.code}
                            </p>
                            <p className="text-xs text-gray-600">
                              Stock: {item.stock} units
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={item.stock === 0}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-semibold">
                            ₹
                            {(
                              item.product.price * item.quantity
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total MRP:</span>
                      <span className="text-lg text-[#433228]">
                        ₹{getTotalMRP().toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Button
                      onClick={handleSubmitReport}
                      className="w-full bg-[#433228] hover:bg-[#5a4238]"
                    >
                      Submit Sales Report
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submitted Reports */}
      {salesReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submitted Sales Reports</CardTitle>
            <CardDescription>
              List of all submitted sales reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">Report #{report.id}</p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(report.date).toLocaleDateString()} |
                        Created: {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Submitted
                    </span>
                  </div>

                  <SalesReportItemsTable items={report.products} />

                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="font-semibold">Total MRP:</span>
                    <span className="text-xl font-bold text-[#433228]">
                      ₹{report.totalMRP.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromoterSalesReport;
