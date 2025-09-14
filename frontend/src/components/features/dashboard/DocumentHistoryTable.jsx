"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function DocumentHistoryTable({ documents = [] }) {
  const formatComplianceScore = (score) => {
    if (score === null || score === undefined) return 'N/A';
    return `${Math.round(score)}%`;
  };

  const getComplianceColor = (score) => {
    if (score === null || score === undefined) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!documents || documents.length === 0) {
    return (
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No documents found. Upload some documents to see them here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Document
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Compliance Score
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Upload Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Size
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr 
                  key={doc.id || index}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                          {doc.filename || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {doc.contentType || 'Unknown type'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${getComplianceColor(doc.complianceScore)}`}>
                      {formatComplianceScore(doc.complianceScore)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {doc.createdAt ? formatDistanceToNow(doc.createdAt, { addSuffix: true }) : 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {formatFileSize(doc.sizeBytes)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doc.status === 'analyzed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : doc.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {doc.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
