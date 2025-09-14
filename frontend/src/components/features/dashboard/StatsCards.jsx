"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, Clock } from "lucide-react";

export function StatsCards({ documents = [], overviewStats = null, issuesBreakdown = null, showOnlyTopStats = false }) {
  // Use dashboard stats if available, otherwise fall back to documents array
  const totalDocuments = overviewStats?.totalDocuments ?? documents.length;
  const analyzedCount = overviewStats?.documentsAnalyzed ?? documents.filter(d => d.status === 'analyzed').length;
  const pendingCount = overviewStats?.documentsPending ?? documents.filter(d => d.status === 'uploaded').length;
  const averageScore = Math.round(overviewStats?.averageComplianceScore ?? (
    analyzedCount > 0 
      ? documents
          .filter(d => d.complianceScore !== undefined)
          .reduce((sum, doc) => sum + (doc.complianceScore || 0), 0) / analyzedCount
      : 0
  ));
  
  const criticalIssues = issuesBreakdown?.critical ?? documents.reduce((sum, doc) => 
    sum + (doc.issues?.filter(issue => issue.type === 'critical').length || 0), 0
  );
  
  const majorIssues = issuesBreakdown?.major ?? documents.reduce((sum, doc) => 
    sum + (doc.issues?.filter(issue => issue.type === 'major').length || 0), 0
  );
  
  const minorIssues = issuesBreakdown?.minor ?? documents.reduce((sum, doc) => 
    sum + (doc.issues?.filter(issue => issue.type === 'minor').length || 0), 0
  );

  const getScoreColor = (score) => {
    if (score >= 80) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-blue-100 dark:bg-blue-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  if (showOnlyTopStats) {
    return (
      <>
        {/* Document Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Document Count</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {totalDocuments}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Documents
              </p>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-600 dark:text-blue-400">Analyzed</span>
                  <span className="text-gray-500">{analyzedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Pending</span>
                  <span className="text-gray-500">{pendingCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Overall Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreBgColor(averageScore)} ${getScoreColor(averageScore)}`}>
                {averageScore}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Average Compliance Score
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Document Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Document Count</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalDocuments}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Documents
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-600 dark:text-blue-400">Analyzed</span>
                <span className="text-gray-500">{analyzedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Pending</span>
                <span className="text-gray-500">{pendingCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Overall Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreBgColor(averageScore)} ${getScoreColor(averageScore)}`}>
              {averageScore}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Average Compliance Score
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Documents Analyzed</span>
              <span className="font-medium">{analyzedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</span>
              <span className="font-medium text-red-600">{criticalIssues}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Major Issues</span>
              <span className="font-medium text-yellow-600">{majorIssues}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Minor Issues</span>
              <span className="font-medium text-blue-600">{minorIssues}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
