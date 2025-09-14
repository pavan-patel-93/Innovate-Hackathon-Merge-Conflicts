"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as LucidePieChart } from "lucide-react";

export function PieChart({ documents = [], complianceDistribution = null, overviewStats = null }) {
  const analyzedCount = overviewStats?.documentsAnalyzed ?? documents.filter(d => d.status === 'analyzed').length;
  
  // Use compliance distribution data if available, otherwise calculate from documents
  const excellent = complianceDistribution?.excellent ?? documents.filter(d => d.complianceScore >= 80).length;
  const good = complianceDistribution?.good ?? documents.filter(d => d.complianceScore >= 60 && d.complianceScore < 80).length;
  const needsWork = complianceDistribution?.needsWork ?? documents.filter(d => d.complianceScore < 60).length;

  const totalDocs = excellent + good + needsWork;

  // Calculate percentages
  const excellentPercentage = totalDocs > 0 ? (excellent / totalDocs) * 100 : 0;
  const goodPercentage = totalDocs > 0 ? (good / totalDocs) * 100 : 0;
  const needsWorkPercentage = totalDocs > 0 ? (needsWork / totalDocs) * 100 : 0;

  // SVG pie chart calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  const excellentStroke = (excellentPercentage / 100) * circumference;
  const goodStroke = (goodPercentage / 100) * circumference;
  const needsWorkStroke = (needsWorkPercentage / 100) * circumference;

  const excellentOffset = 0;
  const goodOffset = excellentStroke;
  const needsWorkOffset = excellentStroke + goodStroke;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LucidePieChart className="w-5 h-5" />
          <span>Compliance Distribution</span>
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
              
              {totalDocs > 0 && (
                <>
                  {/* Excellent compliance */}
                  {excellent > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="8"
                      strokeDasharray={`${excellentStroke} ${circumference - excellentStroke}`}
                      strokeDashoffset={-excellentOffset}
                      strokeLinecap="round"
                    />
                  )}
                  
                  {/* Good compliance */}
                  {good > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="8"
                      strokeDasharray={`${goodStroke} ${circumference - goodStroke}`}
                      strokeDashoffset={-goodOffset}
                      strokeLinecap="round"
                    />
                  )}
                  
                  {/* Needs work */}
                  {needsWork > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="8"
                      strokeDasharray={`${needsWorkStroke} ${circumference - needsWorkStroke}`}
                      strokeDashoffset={-needsWorkOffset}
                      strokeLinecap="round"
                    />
                  )}
                </>
              )}
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalDocs}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Documents
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Excellent (≥80%)</span>
              </div>
              <span className="text-sm font-medium text-green-600">{excellent}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Good (60-79%)</span>
              </div>
              <span className="text-sm font-medium text-yellow-600">{good}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Needs Work (<60%)</span>
              </div>
              <span className="text-sm font-medium text-red-600">{needsWork}</span>
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
