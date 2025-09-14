/**
 * Dashboard service for fetching analytics and statistics data
 */

class DashboardService {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session-based auth
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get analytics trends
   * @param {number} days - Number of days to get trends for
   * @returns {Promise<Object>} Analytics trends data
   */
  async getAnalyticsTrends(days = 30) {
    try {
      const response = await fetch(`/api/dashboard/trends?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session-based auth
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics trends: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics trends:', error);
      throw error;
    }
  }

  /**
   * Get critical issues
   * @param {number} limit - Maximum number of critical issues to fetch
   * @returns {Promise<Object>} Critical issues data
   */
  async getCriticalIssues(limit = 20) {
    try {
      const response = await fetch(`/api/dashboard/critical-issues?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session-based auth
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch critical issues: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching critical issues:', error);
      throw error;
    }
  }

  /**
   * Format compliance score for display
   * @param {number} score - Compliance score (0-100)
   * @returns {Object} Formatted score with color and label
   */
  formatComplianceScore(score) {
    if (score >= 80) {
      return {
        score,
        label: 'Excellent',
        color: 'blue',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-600 dark:text-blue-400'
      };
    } else if (score >= 60) {
      return {
        score,
        label: 'Good',
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-600 dark:text-yellow-400'
      };
    } else {
      return {
        score,
        label: 'Needs Work',
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-600 dark:text-red-400'
      };
    }
  }

  /**
   * Get severity color classes
   * @param {string} severity - Issue severity (critical, major, minor, info)
   * @returns {Object} Color classes for the severity
   */
  getSeverityColors(severity) {
    const colors = {
      critical: {
        icon: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-300'
      },
      major: {
        icon: 'text-yellow-500',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-700 dark:text-yellow-300'
      },
      minor: {
        icon: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300'
      },
      info: {
        icon: 'text-gray-500',
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-700 dark:text-gray-300'
      }
    };

    return colors[severity] || colors.info;
  }

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Calculate percentage change
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {Object} Percentage change with direction
   */
  calculatePercentageChange(current, previous) {
    if (!previous || previous === 0) {
      return { percentage: 0, direction: 'neutral', isPositive: false };
    }

    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      isPositive: change > 0
    };
  }
}

export default new DashboardService();
