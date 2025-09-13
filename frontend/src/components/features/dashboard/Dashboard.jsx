"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/common/FileUpload";
import { DocumentList } from "./DocumentList";
import { StatsCards } from "./StatsCards";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useDocuments } from "@/hooks/useDocuments";
import { Upload, FileCheck } from "lucide-react";

export function Dashboard() {
  const { files, addFiles, uploadFiles, uploading, error } = useFileUpload();
  const { documents, loadDocuments, analyzeDocument, isAnalyzing } = useDocuments();

  const handleFileSelect = async (selectedFiles) => {
    addFiles(selectedFiles);
    
    try {
      const results = await uploadFiles();
      // Reload documents to show newly uploaded ones
      await loadDocuments();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your compliance analytics and manage documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Documents</span>
                </CardTitle>
                <CardDescription>
                  Upload your regulatory documents (Word, PDF, or text) for compliance validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  disabled={uploading}
                  className={uploading ? "opacity-50" : ""}
                />
                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5" />
                  <span>Document History</span>
                </CardTitle>
                <CardDescription>
                  Review compliance analysis results for your uploaded documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentList
                  documents={documents}
                  onAnalyze={analyzeDocument}
                  isAnalyzing={isAnalyzing}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <StatsCards documents={documents} />
          </div>
        </div>
      </div>
    </div>
  );
}
