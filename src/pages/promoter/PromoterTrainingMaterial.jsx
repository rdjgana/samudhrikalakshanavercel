import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { FileText, Video, BookOpen, Download, Play } from "lucide-react";

const MOCK_CATALOGUE = [
  {
    id: 1,
    name: "Product Catalogue 2024",
    type: "PDF",
    size: "2.5 MB",
    url: "#",
  },
  { id: 2, name: "Face Care Products", type: "PDF", size: "1.8 MB", url: "#" },
  { id: 3, name: "Body Care Products", type: "PDF", size: "1.5 MB", url: "#" },
];

const MOCK_PANTOS = [
  {
    id: 1,
    name: "Sales Training Guide",
    type: "PDF",
    size: "3.2 MB",
    url: "#",
  },
  {
    id: 2,
    name: "Product Knowledge Manual",
    type: "PDF",
    size: "2.1 MB",
    url: "#",
  },
  {
    id: 3,
    name: "Customer Service Guide",
    type: "PDF",
    size: "1.9 MB",
    url: "#",
  },
];

const MOCK_VIDEOS = [
  { id: 1, name: "Product Demonstration", duration: "15:30", thumbnail: "#" },
  { id: 2, name: "Sales Techniques", duration: "20:45", thumbnail: "#" },
  { id: 3, name: "Customer Handling", duration: "12:20", thumbnail: "#" },
];

const PromoterTrainingMaterial = () => {
  const handleDownload = (item) => {
    alert(`Downloading ${item.name}...`);
    // In real app, trigger actual download
  };

  const handlePlayVideo = (video) => {
    alert(`Playing ${video.name}...`);
    // In real app, open video player
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Training Material</h1>
        <p className="text-gray-600 mt-2">
          Access training materials, catalogues, and videos
        </p>
      </div>

      <Tabs defaultValue="catalogue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalogue">
            <BookOpen className="h-4 w-4 mr-2" />
            Catalogue
          </TabsTrigger>
          <TabsTrigger value="pantos">
            <FileText className="h-4 w-4 mr-2" />
            Pantos
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
        </TabsList>

        {/* Catalogue Tab */}
        <TabsContent value="catalogue">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalogue</CardTitle>
              <CardDescription>Download product catalogues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_CATALOGUE.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.type} • {item.size}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(item)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pantos Tab */}
        <TabsContent value="pantos">
          <Card>
            <CardHeader>
              <CardTitle>Training Documents (Pantos)</CardTitle>
              <CardDescription>
                Download training materials and guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_PANTOS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.type} • {item.size}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(item)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Training Videos</CardTitle>
              <CardDescription>Watch training videos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_VIDEOS.map((video) => (
                  <div
                    key={video.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-200 h-48 flex items-center justify-center">
                      <Video className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium">{video.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Duration: {video.duration}
                      </p>
                      <Button
                        onClick={() => handlePlayVideo(video)}
                        className="w-full mt-3 bg-[#433228] hover:bg-[#5a4238]"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Video
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromoterTrainingMaterial;
