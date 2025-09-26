import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Star, Clock, Filter } from "lucide-react";
import { DocumentUploadPanel } from "@/components/documents/DocumentUploadPanel";

const Documents = () => {
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
  
  const documents = [
    {
      title: "CNBV Regulatory Framework 2024",
      description: "Latest regulatory requirements and compliance guidelines",
      type: "PDF",
      department: "Compliance",
      lastOpened: "2 hours ago",
      favorite: true,
    },
    {
      title: "IT Security Policies Manual",
      description: "Comprehensive guide for information security protocols",
      type: "PDF",
      department: "IT",
      lastOpened: "1 day ago",
      favorite: false,
    },
    {
      title: "Accounting Procedures Handbook",
      description: "Standard operating procedures for accounting department",
      type: "DOC",
      department: "Accounting",
      lastOpened: "3 days ago",
      favorite: true,
    },
    {
      title: "Customer Onboarding Process",
      description: "Step-by-step guide for new customer registration",
      type: "PDF",
      department: "Operations",
      lastOpened: "1 week ago",
      favorite: false,
    },
  ];

  return (
    <MainLayout>
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground">Manage and access your document library</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="btn-banking-ghost">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button 
              className="btn-banking-primary"
              onClick={() => setUploadPanelOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-banking">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-banking-primary">156</div>
            </CardContent>
          </Card>
          <Card className="card-banking">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-banking-secondary">23</div>
            </CardContent>
          </Card>
          <Card className="card-banking">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-banking-accent">12</div>
            </CardContent>
          </Card>
          <Card className="card-banking">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">8</div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => (
            <Card key={index} className="card-banking group cursor-pointer hover:shadow-banking transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-banking-primary" />
                    <Badge variant="secondary" className="text-xs">
                      {doc.type}
                    </Badge>
                  </div>
                  {doc.favorite && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-banking-primary transition-colors">
                  {doc.title}
                </CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="text-xs">
                      {doc.department}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{doc.lastOpened}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Document Upload Panel */}
        <DocumentUploadPanel
          open={uploadPanelOpen}
          onOpenChange={setUploadPanelOpen}
        />
      </div>
    </MainLayout>
  );
};

export default Documents;