"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import dashboardService from "@/services/dashboardService";

export function useDashboard() {
  const { user, isLoggedIn } = useUser();
  const isAuthenticated = isLoggedIn;
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    trends: null,
    criticalIssues: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setError(null);
      const stats = await dashboardService.getDashboardStats();
      setDashboardData(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message);
    }
  }, [isAuthenticated]);

  const fetchAnalyticsTrends = useCallback(async (days = 30) => {
    if (!isAuthenticated) return;
    
    try {
      setError(null);
      const trends = await dashboardService.getAnalyticsTrends(days);
      setDashboardData(prev => ({ ...prev, trends }));
    } catch (error) {
      console.error('Error fetching analytics trends:', error);
      setError(error.message);
    }
  }, [isAuthenticated]);

  const fetchCriticalIssues = useCallback(async (limit = 20) => {
    if (!isAuthenticated) return;
    
    try {
      setError(null);
      const criticalIssues = await dashboardService.getCriticalIssues(limit);
      setDashboardData(prev => ({ ...prev, criticalIssues }));
    } catch (error) {
      console.error('Error fetching critical issues:', error);
      setError(error.message);
    }
  }, [isAuthenticated]);

  const fetchAllDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      setError(null);
      
      // Fetch all dashboard data in parallel
      const [stats, trends, criticalIssues] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getAnalyticsTrends(30),
        dashboardService.getCriticalIssues(20)
      ]);

      setDashboardData({
        stats,
        trends,
        criticalIssues
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshDashboard = useCallback(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  // Auto-fetch dashboard data when user logs in or component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[useDashboard] User authenticated, fetching dashboard data...', { userId: user.id, username: user.username });
      fetchAllDashboardData();
    } else {
      console.log('[useDashboard] User not authenticated or no user data', { isAuthenticated, user: !!user });
    }
  }, [isAuthenticated, user, fetchAllDashboardData]);

  // Helper functions to get formatted data
  const getOverviewStats = useCallback(() => {
    if (!dashboardData.stats?.overview) return null;
    
    const { overview } = dashboardData.stats;
    return {
      totalDocuments: overview.total_documents || 0,
      averageComplianceScore: overview.average_compliance_score || 0,
      documentsAnalyzed: overview.documents_analyzed || 0,
      documentsPending: overview.documents_pending || 0
    };
  }, [dashboardData.stats]);

  const getComplianceDistribution = useCallback(() => {
    if (!dashboardData.stats?.compliance_distribution) return null;
    
    const { compliance_distribution } = dashboardData.stats;
    return {
      excellent: compliance_distribution.excellent || 0,
      good: compliance_distribution.good || 0,
      needsWork: compliance_distribution.needs_work || 0
    };
  }, [dashboardData.stats]);

  // Removed getIssuesBreakdown since we don't have issues distribution data

  const getRecentDocuments = useCallback(() => {
    if (!dashboardData.stats?.recent_documents) return [];
    
    return dashboardData.stats.recent_documents.map(doc => ({
      id: doc._id || doc.id,
      filename: doc.original_filename || doc.filename,
      status: doc.metadata?.status || doc.status || 'analyzed',
      complianceScore: doc.compliance_score,
      createdAt: new Date(doc.created_at),
      analyzedAt: doc.analyzed_at ? new Date(doc.analyzed_at) : null,
      uploadedBy: doc.uploaded_by || 'Unknown',
      sizeBytes: doc.size_bytes,
      contentType: doc.content_type
    }));
  }, [dashboardData.stats]);

  const getUploadTrends = useCallback(() => {
    if (!dashboardData.trends?.upload_trends) return [];
    
    return dashboardData.trends.upload_trends.map(trend => ({
      date: trend.date,
      documentsUploaded: trend.documents_uploaded,
      averageScore: trend.average_score
    }));
  }, [dashboardData.trends]);

  const getCriticalDocuments = useCallback(() => {
    if (!dashboardData.criticalIssues?.critical_documents) return [];
    
    return dashboardData.criticalIssues.critical_documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      complianceScore: doc.compliance_score,
      criticalIssues: doc.critical_issues || [],
      createdAt: new Date(doc.created_at),
      analyzedAt: doc.analyzed_at ? new Date(doc.analyzed_at) : null,
      sizeBytes: doc.size_bytes,
      contentType: doc.content_type
    }));
  }, [dashboardData.criticalIssues]);

  return {
    // Raw data
    dashboardData,
    
    // Loading states
    loading,
    error,
    
    // Fetch functions
    fetchDashboardStats,
    fetchAnalyticsTrends,
    fetchCriticalIssues,
    fetchAllDashboardData,
    refreshDashboard,
    
    // Formatted data getters
    getOverviewStats,
    getComplianceDistribution,
    getComplianceData: getComplianceDistribution, // Alias for backward compatibility
    getCriticalIssues: getCriticalDocuments, // Alias for backward compatibility
    getRecentDocuments,
    getUploadTrends,
    getCriticalDocuments,
    
    // Utility functions from dashboardService
    formatComplianceScore: dashboardService.formatComplianceScore,
    getSeverityColors: dashboardService.getSeverityColors,
    formatDate: dashboardService.formatDate,
    calculatePercentageChange: dashboardService.calculatePercentageChange
  };
}
