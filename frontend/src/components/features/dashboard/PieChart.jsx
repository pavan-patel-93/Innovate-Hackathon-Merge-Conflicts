"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as LucidePieChart } from "lucide-react";

export function PieChart({ documents }) {
  const analyzedCount = documents.filter(d => d.status === 'analyzed').length;
  
  const criticalIssues = documents.reduce((sum, doc) => 
    sum + (doc.issues?.filter(issue => issue.type === 'critical').length || 0), 0
  );
  
  const majorIssues = documents.reduce((sum, doc) => 
    sum + (doc.issues?.filter(issue => issue.type === 'major').length || 0), 0
  );
  
  const minorIssues = documents.reduce((sum, doc) => 
    sum + (doc.issues?.filter(issue => issue.type === 'minor').length || 0), 0
  );

  const totalIssues = criticalIssues + majorIssues + minorIssues;

  // Calculate percentages
  const criticalPercentage = totalIssues > 0 ? (criticalIssues / totalIssues) * 100 : 0;
  const majorPercentage = totalIssues > 0 ? (majorIssues / totalIssues) * 100 : 0;
  const minorPercentage = totalIssues > 0 ? (minorIssues / totalIssues) * 100 : 0;

  // SVG pie chart calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  const criticalStroke = (criticalPercentage / 100) * circumference;
  const majorStroke = (majorPercentage / 100) * circumference;
  const minorStroke = (minorPercentage / 100) * circumference;

  const criticalOffset = 0;
  const majorOffset = criticalStroke;
  const minorOffset = criticalStroke + majorStroke;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LucidePieChart className="w-5 h-5" />
          <span>Issues Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* SVG Pie Chart */}
          <div className="relative">
            <svg width="140" height="140" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                className="dark:stroke-gray-700"
              />
              
              {totalIssues > 0 && (
                <>
                  {/* Critical issues */}
                  {criticalIssues > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="8"
                      strokeDasharray={`${criticalStroke} ${circumference - criticalStroke}`}
                      strokeDashoffset={-criticalOffset}
                      strokeLinecap="round"
                    />
                  )}
                  
                  {/* Major issues */}
                  {majorIssues > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="8"
                      strokeDasharray={`${majorStroke} ${circumference - majorStroke}`}
                      strokeDashoffset={-majorOffset}
                      strokeLinecap="round"
                    />
                  )}
                  
                  {/* Minor issues */}
                  {minorIssues > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="8"
                      strokeDasharray={`${minorStroke} ${circumference - minorStroke}`}
                      strokeDashoffset={-minorOffset}
                      strokeLinecap="round"
                    />
                  )}
                </>
              )}
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalIssues}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total Issues
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Critical</span>
              </div>
              <span className="text-sm font-medium text-red-600">{criticalIssues}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Major</span>
              </div>
              <span className="text-sm font-medium text-yellow-600">{majorIssues}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Minor</span>
              </div>
              <span className="text-sm font-medium text-blue-600">{minorIssues}</span>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="w-full pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Documents Analyzed</span>
              <span className="font-medium">{analyzedCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
