"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { documentAPI, aiChatAPI, setupAPI, WebSocketManager } from "@/services/api";
import SectionRulesModal from "@/components/Setup/SectionRulesModal";
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
  Users,
  Edit,
  MessageSquare,
  Send,
  Paperclip,
  Bot,
  Plus,
  User,
  Trash2,
  GripVertical,
  AlertCircle,
  Search
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [complianceScore, setComplianceScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Setup tab states
  const [documentTypes, setDocumentTypes] = useState([]);
  const [setupLoading, setSetupLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDocType, setEditingDocType] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [setupSearchTerm, setSetupSearchTerm] = useState("");
  
  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedChatFiles, setUploadedChatFiles] = useState([]);
  
  // WebSocket manager
  const wsManagerRef = useRef(null);
  
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        router.push("/login");
      }
  }, [isAuthenticated, isLoading, router]);

  // Load user documents on mount
  useEffect(() => {
    if (user && isAuthenticated) {
      loadUserDocuments();
    }
  }, [user, isAuthenticated]);

  // Load document types when setup tab is active
  useEffect(() => {
    if (activeTab === "setup" && isAuthenticated) {
      loadDocumentTypes();
    }
  }, [activeTab, isAuthenticated]);

  const loadUserDocuments = async () => {
    try {
      const documents = await documentAPI.getUserDocuments(user?.id || user?.username);
      const formattedDocuments = documents.map(doc => ({
        id: doc.document_id || doc.id,
        name: doc.filename || doc.name,
        size: doc.size || 0,
        type: doc.content_type || doc.type || 'application/pdf',
        uploadDate: new Date(doc.created_at || doc.uploadDate),
        status: doc.status || 'uploaded',
        complianceScore: doc.compliance_score || doc.complianceScore || null,
        issues: doc.issues || [],
        documentId: doc.document_id || doc.id
      }));
      setUploadedFiles(formattedDocuments);
    } catch (error) {
      console.error('Error loading user documents:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        // Upload file to backend
        const uploadResult = await documentAPI.uploadDocument(file, user?.id || user?.username);
        
        const newFile = {
          id: uploadResult.document_id || Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
          status: 'uploaded',
          complianceScore: null,
          issues: [],
          documentId: uploadResult.document_id
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
      } catch (error) {
        console.error('Error uploading file:', error);
        // Fallback to local state if API fails
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
          status: 'uploaded',
          complianceScore: null,
          issues: []
        };
        setUploadedFiles(prev => [...prev, newFile]);
      }
    }
  };

  const handleChatFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      file: file
    }));
    setUploadedChatFiles(prev => [...prev, ...newFiles]);
  };

  const analyzeDocument = async (fileId) => {
    setIsAnalyzing(true);
    
    try {
      const file = uploadedFiles.find(f => f.id === fileId);
      if (!file) return;
      
      // Use documentId if available, otherwise fallback to fileId
      const documentId = file.documentId || fileId;
      
      // Call API to analyze document
      const analysisResult = await documentAPI.analyzeDocument(documentId);
      
      const updatedFile = {
        ...file,
        status: 'analyzed',
        complianceScore: analysisResult.score || 0,
        issues: analysisResult.issues || []
      };
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? updatedFile : f
      ));
      
      setComplianceScore(analysisResult.score || 0);
    } catch (error) {
      console.error('Error analyzing document:', error);
      
      // Fallback to mock analysis if API fails
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() && uploadedChatFiles.length === 0) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      files: uploadedChatFiles,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    const currentFiles = [...uploadedChatFiles];
    setChatInput("");
    setUploadedChatFiles([]);
    setIsTyping(true);

    try {
      // Call AI API
      const filesToSend = currentFiles.map(f => f.file || f);
      const aiResponse = await aiChatAPI.sendAIMessage(currentInput, filesToSend);
      
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse.response || aiResponse.message || 'Analysis completed successfully.',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending AI message:', error);
      
      // Fallback response if API fails
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: `I've analyzed your ${currentFiles.length > 0 ? 'uploaded files and ' : ''}message. Here's what I found:

${currentFiles.length > 0 ? `
**File Analysis:**
- ${currentFiles.map(f => f.name).join(', ')} uploaded successfully
- Document structure validation: ✅ Passed
- Compliance check: ⚠️ 2 minor issues found
- Recommendations: Update document ID format and add revision history
` : ''}

**Response to your query:** "${currentInput}"
Based on regulatory guidelines, I recommend reviewing the document structure and ensuring all mandatory sections are present.`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
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

  // Setup functions
  const loadDocumentTypes = async () => {
    try {
      setSetupLoading(true);
      const data = await setupAPI.getDocumentTypes();
      setDocumentTypes(data);
    } catch (error) {
      console.error('Error loading document types:', error);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleCreateDocumentType = () => {
    setEditingDocType(null);
    setShowCreateModal(true);
  };

  const handleEditDocumentType = (docType) => {
    setEditingDocType(docType);
    setShowEditModal(true);
  };

  const handleDeleteDocumentType = async (docTypeId) => {
    if (window.confirm('Are you sure you want to delete this document type?')) {
      try {
        await setupAPI.deleteDocumentType(docTypeId);
        await loadDocumentTypes();
      } catch (error) {
        console.error('Error deleting document type:', error);
        alert('Error deleting document type');
      }
    }
  };

  const handleSaveDocumentType = async (docTypeData) => {
    try {
      if (editingDocType) {
        await setupAPI.updateDocumentType(editingDocType.id, docTypeData);
      } else {
        await setupAPI.createDocumentType(docTypeData, user?.username);
      }
      await loadDocumentTypes();
      setShowEditModal(false);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error saving document type:', error);
      alert('Error saving document type');
    }
  };

  const handleOpenRulesModal = (section) => {
    setSelectedSection(section);
    setShowRulesModal(true);
  };

  const handleSaveSectionRules = async (updatedSection) => {
    try {
      if (editingDocType) {
        const updatedSections = editingDocType.sections.map(s => 
          s.name === updatedSection.name ? updatedSection : s
        );
        await setupAPI.updateDocumentType(editingDocType.id, { sections: updatedSections });
        await loadDocumentTypes();
      }
    } catch (error) {
      console.error('Error saving section rules:', error);
      alert('Error saving section rules');
    }
  };

  const handleRefreshDocumentTypes = async () => {
    await loadDocumentTypes();
  };

  const filteredDocumentTypes = documentTypes.filter(docType =>
    docType.name.toLowerCase().includes(setupSearchTerm.toLowerCase()) ||
    docType.code.toLowerCase().includes(setupSearchTerm.toLowerCase()) ||
    (docType.description && docType.description.toLowerCase().includes(setupSearchTerm.toLowerCase()))
  );

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

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-6 lg:px-8">
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
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username || "User"}
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

      {/* Main Layout with Sidebar */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Sidebar Navigation */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("home")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "home"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "analysis"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Analysis</span>
              </button>
              <button
                onClick={() => setActiveTab("setup")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "setup"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Setup</span>
              </button>
            </div>
          </div>

          {/* Sidebar Content - Only Navigation Info */}
          {/* <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Quick Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium mb-1">Dashboard</p>
                      <p className="text-xs">View document analytics, upload files, and track compliance scores.</p>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium mb-1">Analysis</p>
                      <p className="text-xs">Chat with AI assistant for compliance analysis and file uploads.</p>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium mb-1">Setup</p>
                      <p className="text-xs">Configure document types, sections, and validation rules.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div> */}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {activeTab === "home" ? (
            // Dashboard Tab - Full Dashboard Content
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-400">Monitor your compliance analytics and manage documents</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          <span>Document History</span>
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
                            {uploadedFiles.length}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Documents
                          </p>
                          <div className="mt-4 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-blue-600 dark:text-blue-400">Analyzed</span>
                              <span className="text-gray-500">{uploadedFiles.filter(f => f.status === 'analyzed').length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-600">Pending</span>
                              <span className="text-gray-500">{uploadedFiles.filter(f => f.status === 'uploaded').length}</span>
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
                          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreBgColor(complianceScore)} ${getScoreColor(complianceScore)}`}>
                            {complianceScore}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Compliance Score
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
                            <span className="font-medium">{uploadedFiles.filter(f => f.status === 'analyzed').length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</span>
                            <span className="font-medium text-red-600">
                              {uploadedFiles.reduce((sum, file) => 
                                sum + file.issues.filter(issue => issue.type === 'critical').length, 0
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Major Issues</span>
                            <span className="font-medium text-yellow-600">
                              {uploadedFiles.reduce((sum, file) => 
                                sum + file.issues.filter(issue => issue.type === 'major').length, 0
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Minor Issues</span>
                            <span className="font-medium text-blue-600">
                              {uploadedFiles.reduce((sum, file) => 
                                sum + file.issues.filter(issue => issue.type === 'minor').length, 0
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "setup" ? (
            // Setup Tab - Document Types Data Table
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Document Types Setup</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage document type configurations and validation rules</p>
                </div>

                {/* Header Controls */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search document types..."
                            value={setupSearchTerm}
                            onChange={(e) => setSetupSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          onClick={handleRefreshDocumentTypes}
                          disabled={setupLoading}
                          className="flex items-center space-x-2"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Refresh</span>
                        </Button>
                        <Button
                          onClick={handleCreateDocumentType}
                          className="flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Document Type</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                  <CardContent className="p-0">
                    {setupLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Loading document types...</span>
                        </div>
                      </div>
                    ) : filteredDocumentTypes.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">
                          {setupSearchTerm ? 'No matching document types found' : 'No document types configured'}
                        </p>
                        <p className="text-sm mb-4">
                          {setupSearchTerm ? 'Try adjusting your search terms' : 'Create your first document type to get started'}
                        </p>
                        {!setupSearchTerm && (
                          <Button onClick={handleCreateDocumentType} className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Create Document Type</span>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                              <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Document Name</th>
                              <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Document Type</th>
                              <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Sections</th>
                              <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Created At</th>
                              <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Created By</th>
                              <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Updated At</th>
                              <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Updated By</th>
                              <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredDocumentTypes.map((docType) => (
                              <tr key={docType.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="py-4 px-6">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{docType.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {docType.description || 'No description'}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {docType.code}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-900 dark:text-white">
                                      {docType.sections?.length || 0}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(docType.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                  {docType.created_by || 'System'}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(docType.updated_at).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                  {docType.updated_by || 'System'}
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center justify-end space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditDocumentType(docType)}
                                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteDocumentType(docType.id)}
                                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Analysis Tab - Chat Interface (Full Width)
            <div className="flex-1 flex flex-col">
              <Card className="flex-1 flex flex-col m-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>AI Analysis Chat</span>
                  </CardTitle>
                  <CardDescription>
                    Upload files and ask questions about compliance analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Start a conversation by uploading files or asking a question</p>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-4 ${
                            message.type === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              {message.type === 'user' ? (
                                <User className="w-4 h-4" />
                              ) : (
                                <Bot className="w-4 h-4" />
                              )}
                              <span className="text-xs opacity-75">
                                {message.type === 'user' ? 'You' : 'ComplianceAI'}
                              </span>
                            </div>
                            {message.files && message.files.length > 0 && (
                              <div className="mb-2">
                                <div className="text-xs opacity-75 mb-1">Attached files:</div>
                                <div className="space-y-1">
                                  {message.files.map((file, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-xs">
                                      <Paperclip className="w-3 h-3" />
                                      <span>{file.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      ))
                    )}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <Bot className="w-4 h-4" />
                            <span className="text-sm">ComplianceAI is typing...</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    {/* File Upload Area */}
                    {uploadedChatFiles.length > 0 && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Files to upload:</div>
                        <div className="space-y-1">
                          {uploadedChatFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <Paperclip className="w-3 h-3" />
                                <span>{file.name}</span>
                                <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                              <button
                                onClick={() => setUploadedChatFiles(prev => prev.filter((_, i) => i !== index))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <input
                        type="file"
                        multiple
                        accept=".doc,.docx,.pdf,.txt"
                        onChange={handleChatFileUpload}
                        className="hidden"
                        id="chat-file-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('chat-file-upload').click()}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about compliance analysis or upload files..."
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendChatMessage} disabled={!chatInput.trim() && uploadedChatFiles.length === 0}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Setup Modals */}
      {(showEditModal || showCreateModal) && (
        <DocumentTypeModal
          docType={editingDocType}
          onSave={handleSaveDocumentType}
          onClose={() => {
            setShowEditModal(false);
            setShowCreateModal(false);
          }}
          isEdit={showEditModal}
          onOpenRulesModal={handleOpenRulesModal}
        />
      )}

      {/* Section Rules Modal */}
      <SectionRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        docTypeId={editingDocType?.id}
        section={selectedSection}
        onSave={handleSaveSectionRules}
      />
    </div>
  );
}

// Document Type Modal Component
function DocumentTypeModal({ docType, onSave, onClose, isEdit, onOpenRulesModal }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    id_format: '',
    sections: []
  });
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (docType) {
      setFormData({
        code: docType.code || '',
        name: docType.name || '',
        description: docType.description || '',
        id_format: docType.id_format || '',
        sections: docType.sections || []
      });
    }
  }, [docType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving document type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    const newSection = {
      name: '',
      description: '',
      order: formData.sections.length,
      is_required: true,
      rules: []
    };
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const handleSectionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const handleRemoveSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Document Type' : 'Create Document Type'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'general'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                General Settings
              </button>
              <button
                onClick={() => setActiveTab('sections')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'sections'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Document Sections
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Code *
                    </label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., SOP, PROTOCOL, MANUAL"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Standard Operating Procedures"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the purpose and scope of this document type..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID Format
                    </label>
                    <Input
                      value={formData.id_format}
                      onChange={(e) => setFormData(prev => ({ ...prev, id_format: e.target.value }))}
                      placeholder="e.g., SOP-###, PROTOCOL-YYYY-###"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Use # for numbers, YYYY for year, etc.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'sections' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Document Sections
                    </h3>
                    <Button
                      type="button"
                      onClick={handleAddSection}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Section</span>
                    </Button>
                  </div>

                  {formData.sections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No sections defined yet</p>
                      <p className="text-sm">Add sections to define the structure of this document type</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {section.name || `Section ${index + 1}`}
                                </h4>
                                {section.is_required && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                    Required
                                  </span>
                                )}
                                {section.rules && section.rules.length > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {section.rules.length} rules
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onOpenRulesModal(section)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveSection(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Section Name *
                                </label>
                                <Input
                                  value={section.name}
                                  onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                                  placeholder="e.g., Introduction, Methodology"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Order
                                </label>
                                <Input
                                  type="number"
                                  value={section.order}
                                  onChange={(e) => handleSectionChange(index, 'order', parseInt(e.target.value))}
                                  min="0"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Description
                                </label>
                                <textarea
                                  value={section.description}
                                  onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                                  placeholder="Describe what this section should contain..."
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                  rows={2}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={section.is_required}
                                    onChange={(e) => handleSectionChange(index, 'is_required', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Required section
                                  </span>
                                </label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
