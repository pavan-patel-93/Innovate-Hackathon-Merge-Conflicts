"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentHistoryTable } from "./DocumentHistoryTable";
import { StatsCards } from "./StatsCards";
import { useDocuments } from "@/hooks/useDocuments";
import { useDashboard } from "@/hooks/useDashboard";
import { FileCheck } from "lucide-react";
import { useEffect } from 'react';

export function Dashboard() {
  const { documents, loadDocuments, analyzeDocument, isAnalyzing } = useDocuments();
  const { 
    dashboardData, 
    loading, 
    error, 
    refreshDashboard,
    getOverviewStats,
    getComplianceData,
    getCriticalIssues,
    getRecentDocuments
  } = useDashboard();

  // Debug logging
  useEffect(() => {
    console.log('[Dashboard] Component state:', {
      loading,
      error,
      hasStats: !!dashboardData.stats,
      hasTrends: !!dashboardData.trends,
      hasCriticalIssues: !!dashboardData.criticalIssues,
      overviewStats: getOverviewStats(),
      complianceData: getComplianceData()
    });
  }, [dashboardData, loading, error, getOverviewStats, getComplianceData]);

  // Get dashboard data
  const overviewStats = getOverviewStats();
  const complianceDistribution = getComplianceData();
  const recentDocuments = getRecentDocuments() || [];

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

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Loading dashboard data...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="text-red-700 dark:text-red-300">Error loading dashboard: {error}</div>
            <button 
              onClick={refreshDashboard}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Top Stats Row - Document Count and Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCards 
              documents={documents} 
              overviewStats={overviewStats}
              showOnlyTopStats={true} 
            />
          </div>

          {/* Document History */}
          <div className="w-full">
            <DocumentHistoryTable
              documents={recentDocuments.length > 0 ? recentDocuments : documents}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
