"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from '@/hooks/useUser';
import { AuthGuard } from '@/components/AuthComponents';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Shield, 
  LogOut, 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileCheck,
  BarChart3,
  Settings,
  Download,
  Eye,
  Clock,
  Users
} from "lucide-react";

export default function DashboardPage() {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [complianceScore, setComplianceScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const router = useRouter();
  const { user, isLoading, logout } = useUser({ redirectIfNotFound: true });

  // Fetch user data from API when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user && !isLoading) {
      fetchUserData();
    }
  }, [user, isLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: 'uploaded',
      complianceScore: null,
      issues: []
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const analyzeDocument = async (fileId) => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockIssues = [
      { type: 'critical', message: 'Missing Document ID (SOP-###)', severity: 3 },
      { type: 'major', message: 'Incomplete revision history table', severity: 2 },
      { type: 'minor', message: 'Missing approval signature line', severity: 1 },
      { type: 'critical', message: 'Contains placeholder text "TBD"', severity: 3 },
      { type: 'major', message: 'Stale reference: "ICH Q7" missing year', severity: 2 }
    ];

    const score = Math.max(0, 100 - (mockIssues.reduce((sum, issue) => sum + issue.severity * 10, 0)));
    
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status: 'analyzed', complianceScore: score, issues: mockIssues }
        : file
    ));
    
    setComplianceScore(score);
    setIsAnalyzing(false);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    ComplianceAI
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI-Powered Compliance Assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                      {(userData?.username || user?.username)?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData?.username || user?.username || "User"}
                  </span>
                </div>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Supports: .doc, .docx, .pdf, .txt (Max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".doc,.docx,.pdf,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      className="mt-4"
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Documents List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileCheck className="w-5 h-5" />
                    <span>Document Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Review compliance analysis results for your uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadedFiles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded yet</p>
                      <p className="text-sm">Upload documents to start compliance validation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-8 h-8 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {(file.size / 1024).toFixed(1)} KB • {file.uploadDate.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {file.status === 'uploaded' && (
                                <Button
                                  size="sm"
                                  onClick={() => analyzeDocument(file.id)}
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
                              {file.status === 'analyzed' && (
                                <div className="flex items-center space-x-2">
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBgColor(file.complianceScore)} ${getScoreColor(file.complianceScore)}`}>
                                    {file.complianceScore}/100
                                  </div>
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {file.status === 'analyzed' && file.issues.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Compliance Issues:</h4>
                              <div className="space-y-1">
                                {file.issues.slice(0, 3).map((issue, index) => (
                                  <div key={index} className="flex items-center space-x-2 text-sm">
                                    {issue.type === 'critical' && <XCircle className="w-4 h-4 text-red-500" />}
                                    {issue.type === 'major' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                    {issue.type === 'minor' && <AlertTriangle className="w-4 h-4 text-blue-500" />}
                                    <span className="text-gray-700 dark:text-gray-300">{issue.message}</span>
                                  </div>
                                ))}
                                {file.issues.length > 3 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    +{file.issues.length - 3} more issues
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreBgColor(complianceScore)} ${getScoreColor(complianceScore)}`}>
                      {complianceScore}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Compliance Score
                    </p>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-blue-600 dark:text-blue-400">Excellent (80-100)</span>
                        <span className="text-gray-500">0 docs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-600">Good (60-79)</span>
                        <span className="text-gray-500">0 docs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Needs Work (0-59)</span>
                        <span className="text-gray-500">0 docs</span>
                      </div>
                    </div>
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
                      <span className="font-medium">{uploadedFiles.filter(f => f.status === 'analyzed').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</span>
                      <span className="font-medium text-red-600">
                        {uploadedFiles.reduce((sum, file) => 
                          sum + (file.issues?.filter(issue => issue.type === 'critical')?.length || 0), 0
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Major Issues</span>
                      <span className="font-medium text-yellow-600">
                        {uploadedFiles.reduce((sum, file) => 
                          sum + (file.issues?.filter(issue => issue.type === 'major')?.length || 0), 0
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Minor Issues</span>
                      <span className="font-medium text-blue-600">
                        {uploadedFiles.reduce((sum, file) => 
                          sum + (file.issues?.filter(issue => issue.type === 'minor')?.length || 0), 0
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GxP Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>GxP Rules</span>
                  </CardTitle>
                  <CardDescription>
                    Validation rules applied to documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Document ID Format</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Mandatory Sections</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Revision History</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Reference Validation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Approval Signatures</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}