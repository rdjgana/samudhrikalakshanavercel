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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Receipt, FileText, Upload, Eye } from "lucide-react";

// Mock data
const MOCK_DISTRIBUTORS = [
  { id: 1, name: "Shraam", area: "Sivakasi" },
  { id: 2, name: "Raj Distributors", area: "Madurai" },
];

const MOCK_SHOPS = {
  1: [
    { id: 1, name: "Beauty Zone Sivakasi" },
    { id: 2, name: "Cosmetics Hub Sivakasi" },
  ],
  2: [
    { id: 3, name: "Beauty Zone Madurai" },
    { id: 4, name: "Cosmetics Hub Madurai" },
  ],
};

const SuperStockistClaims = () => {
  const [activeTab, setActiveTab] = useState("damage-expiry");
  const [damageExpiryData, setDamageExpiryData] = useState({
    images: [null, null, null], // 3 images
    batchDate: "",
  });
  const [extraMarginData, setExtraMarginData] = useState({
    shopId: "",
    distributorId: "",
  });
  const [creditNote, setCreditNote] = useState(null);

  const handleImageUpload = (index, file) => {
    const newImages = [...damageExpiryData.images];
    newImages[index] = file;
    setDamageExpiryData({ ...damageExpiryData, images: newImages });
  };

  const handleSubmitDamageExpiry = () => {
    if (
      !damageExpiryData.batchDate ||
      damageExpiryData.images.filter((img) => img).length === 0
    ) {
      alert("Please upload at least one image and provide batch date");
      return;
    }
    alert("Damage & Expiry Claim submitted successfully!");
    setDamageExpiryData({ images: [null, null, null], batchDate: "" });
  };

  const handleSubmitExtraMargin = () => {
    if (!extraMarginData.shopId || !extraMarginData.distributorId) {
      alert("Please select Shop and Distributor");
      return;
    }
    // Generate credit note
    setCreditNote({
      id: "CN-" + Date.now(),
      shopId: extraMarginData.shopId,
      distributorId: extraMarginData.distributorId,
      amount: 5000, // Mock amount
      date: new Date().toISOString(),
    });
    alert("Extra Margin Claim submitted successfully! Credit Note generated.");
  };

  const handleViewCreditNote = () => {
    // Open credit note view dialog
    alert("Credit Note: " + creditNote.id + "\nAmount: ₹" + creditNote.amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Claim Management</h1>
        <p className="text-gray-600 mt-2">
          Manage damage, expiry, and extra margin claims
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="damage-expiry">
            Damage & Expiry Claims
          </TabsTrigger>
          <TabsTrigger value="extra-margin">Extra Margin Claim</TabsTrigger>
        </TabsList>

        {/* Damage & Expiry Claims */}
        <TabsContent value="damage-expiry">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#433228]" />
                Damage & Expiry Claims
              </CardTitle>
              <CardDescription>
                Submit claims for damaged or expired products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="batch-date">Batch Date *</Label>
                  <Input
                    id="batch-date"
                    type="date"
                    value={damageExpiryData.batchDate}
                    onChange={(e) =>
                      setDamageExpiryData({
                        ...damageExpiryData,
                        batchDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <Label>Upload Images * (Upload at least 1 image)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`image-${index}`}>
                          Image {index + 1}
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          {damageExpiryData.images[index] ? (
                            <div className="space-y-2">
                              <img
                                src={URL.createObjectURL(
                                  damageExpiryData.images[index],
                                )}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-32 object-cover rounded"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newImages = [
                                    ...damageExpiryData.images,
                                  ];
                                  newImages[index] = null;
                                  setDamageExpiryData({
                                    ...damageExpiryData,
                                    images: newImages,
                                  });
                                }}
                                className="w-full"
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label
                              htmlFor={`image-${index}`}
                              className="flex flex-col items-center justify-center cursor-pointer"
                            >
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">
                                Click to upload
                              </span>
                              <Input
                                id={`image-${index}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    handleImageUpload(index, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSubmitDamageExpiry}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  Submit Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extra Margin Claim */}
        <TabsContent value="extra-margin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#433228]" />
                Extra Margin Claim
              </CardTitle>
              <CardDescription>
                Submit extra margin claims with automatic credit note generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distributor-claim">
                      Select Distributor *
                    </Label>
                    <Select
                      id="distributor-claim"
                      value={extraMarginData.distributorId}
                      onChange={(e) => {
                        setExtraMarginData({
                          ...extraMarginData,
                          distributorId: e.target.value,
                          shopId: "",
                        });
                      }}
                    >
                      <option value="">Select Distributor</option>
                      {MOCK_DISTRIBUTORS.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name} - {dist.area}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shop-claim">Select Shop *</Label>
                    <Select
                      id="shop-claim"
                      value={extraMarginData.shopId}
                      onChange={(e) =>
                        setExtraMarginData({
                          ...extraMarginData,
                          shopId: e.target.value,
                        })
                      }
                      disabled={!extraMarginData.distributorId}
                    >
                      <option value="">Select Shop</option>
                      {extraMarginData.distributorId &&
                        MOCK_SHOPS[
                          parseInt(extraMarginData.distributorId)
                        ]?.map((shop) => (
                          <option key={shop.id} value={shop.id}>
                            {shop.name}
                          </option>
                        ))}
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitExtraMargin}
                  className="bg-[#433228] hover:bg-[#5a4238] text-white"
                >
                  Submit Extra Margin Claim
                </Button>

                {creditNote && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800">
                        Credit Note Generated
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Credit Note ID:</span>
                          <span>{creditNote.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Amount:</span>
                          <span>
                            ₹{creditNote.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>
                            {new Date(creditNote.date).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          onClick={handleViewCreditNote}
                          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Credit Note
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperStockistClaims;
