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
import { Textarea } from "../../components/ui/textarea";
import { Select } from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Plus, Upload, X } from "lucide-react";
import { MOCK_PRODUCTS } from "../../data/mockData";
import { useTablePagination } from "../../hooks/useTablePagination";
import TablePaginationControls from "../../components/common/TablePaginationControls";

const PromoterCustomerFeedback = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    productName: "",
    rating: "",
    feedback: "",
    suggestions: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState([
    {
      id: 1,
      customerName: "Priya Sharma",
      customerPhone: "9876543210",
      customerEmail: "priya@example.com",
      productName: "Face Wash",
      rating: "5",
      feedback: "Excellent product! Very satisfied with the quality.",
      suggestions: "Would love to see more variants",
      submittedAt: "2024-01-20T10:30:00",
    },
    {
      id: 2,
      customerName: "Rajesh Kumar",
      customerPhone: "9876543211",
      customerEmail: "rajesh@example.com",
      productName: "Body Lotion",
      rating: "4",
      feedback: "Good product, but packaging could be better.",
      suggestions: "",
      submittedAt: "2024-01-19T14:20:00",
    },
  ]);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const submittedFeedbacksPagination = useTablePagination(submittedFeedbacks);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.feedback) {
      alert("Please fill in required fields");
      return;
    }

    const newFeedback = {
      id: Date.now(),
      ...formData,
      imageUrl: imagePreview, // Store image preview URL
      submittedAt: new Date().toISOString(),
    };

    setSubmittedFeedbacks((prev) => [newFeedback, ...prev]);
    setFormData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      productName: "",
      rating: "",
      feedback: "",
      suggestions: "",
      image: null,
    });
    setImagePreview(null);
    setShowFeedbackDialog(false);
    alert("Customer feedback submitted successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Feedback
          </h1>
          <p className="text-gray-600 mt-2">
            Collect and submit customer feedback
          </p>
        </div>
        <Button
          onClick={() => setShowFeedbackDialog(true)}
          className="bg-[#433228] hover:bg-[#5a4238] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      {/* Submitted Feedbacks List - Always shown by default */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Feedbacks</CardTitle>
          <CardDescription>
            List of all submitted customer feedbacks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submittedFeedbacks.length > 0 ? (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submittedFeedbacksPagination.paginatedItems.map((feedback, index) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">
                      {(submittedFeedbacksPagination.page - 1) * submittedFeedbacksPagination.pageSize + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {feedback.customerName}
                    </TableCell>
                    <TableCell>{feedback.productName || "-"}</TableCell>
                    <TableCell>
                      {feedback.rating ? (
                        <span className="flex items-center gap-1">
                          {"⭐".repeat(parseInt(feedback.rating))}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {feedback.feedback}
                    </TableCell>
                    <TableCell>
                      {feedback.imageUrl ? (
                        <img
                          src={feedback.imageUrl}
                          alt="Feedback"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(feedback.submittedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePaginationControls {...submittedFeedbacksPagination} />
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No feedbacks submitted yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Feedback Form Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Customer Feedback</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Select
                id="productName"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
              >
                <option value="">Select Product</option>
                {MOCK_PRODUCTS.map((product) => (
                  <option key={product.id} value={product.name}>
                    {product.name} ({product.code})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                id="rating"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
              >
                <option value="">Select Rating</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback *</Label>
              <Textarea
                id="feedback"
                rows={4}
                value={formData.feedback}
                onChange={(e) =>
                  setFormData({ ...formData, feedback: e.target.value })
                }
                placeholder="Enter customer feedback..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestions">Suggestions</Label>
              <Textarea
                id="suggestions"
                rows={3}
                value={formData.suggestions}
                onChange={(e) =>
                  setFormData({ ...formData, suggestions: e.target.value })
                }
                placeholder="Any suggestions or comments..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Upload Image (Optional)</Label>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#433228] hover:bg-[#5a4238]">
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromoterCustomerFeedback;
