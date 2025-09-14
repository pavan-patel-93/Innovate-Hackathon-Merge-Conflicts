"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentList } from "./DocumentList";
import { StatsCards } from "./StatsCards";
import { PieChart } from "./PieChart";
import { useDocuments } from "@/hooks/useDocuments";
import { FileCheck } from "lucide-react";

export function Dashboard() {
  const { documents, loadDocuments, analyzeDocument, isAnalyzing } = useDocuments();

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

        <div className="space-y-6">
          {/* Top Stats Row - Document Count and Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCards documents={documents} showOnlyTopStats={true} />
          </div>

          {/* Pie Chart and History Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="lg:col-span-1">
              <PieChart documents={documents} />
            </div>

            {/* Document History */}
            <div className="lg:col-span-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}
