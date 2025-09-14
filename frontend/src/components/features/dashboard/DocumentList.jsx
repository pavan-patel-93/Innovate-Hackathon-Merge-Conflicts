"use client";

import { Button } from "@/components/ui/button";
import { 
  FileText, 
  BarChart3, 
  Eye, 
  XCircle, 
  AlertTriangle, 
  CheckCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Document structure
// {
//   id: string,
//   name: string,
//   size: number,
//   type: string,
//   uploadDate: Date,
//   status: 'uploaded' | 'analyzed',
//   complianceScore?: number,
//   issues?: Array<{
//     type: 'critical' | 'major' | 'minor',
//     message: string,
//     severity: number
//   }>
// }

export function DocumentList({ documents, onAnalyze, isAnalyzing }) {
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

  const getIssueIcon = (type) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'major':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'minor':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No documents uploaded yet</p>
        <p className="text-sm">Upload documents to start compliance validation</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div 
          key={document.id} 
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {document.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(document.size / 1024).toFixed(1)} KB • {document.uploadDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {document.status === 'uploaded' && (
                <Button
                  size="sm"
                  onClick={() => onAnalyze(document.id)}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              )}
              {document.status === 'analyzed' && (
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getScoreBgColor(document.complianceScore || 0),
                    getScoreColor(document.complianceScore || 0)
                  )}>
                    {document.complianceScore}/100
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {document.status === 'analyzed' && document.issues && document.issues.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Compliance Issues:
              </h4>
              <div className="space-y-1">
                {document.issues.slice(0, 3).map((issue, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    {getIssueIcon(issue.type)}
                    <span className="text-gray-700 dark:text-gray-300">
                      {issue.message}
                    </span>
                  </div>
                ))}
                {document.issues.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    +{document.issues.length - 3} more issues
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
