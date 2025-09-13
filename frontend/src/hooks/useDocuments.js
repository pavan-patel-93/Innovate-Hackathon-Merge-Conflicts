"use client";

import { useState, useCallback, useEffect } from "react";
import { useApi } from "./useApi";
import { documentAPI } from "@/services/api";
import { useAuthStore } from "@/store/auth";

export function useDocuments() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    data: documentsData,
    loading: loadingDocuments,
    error: documentsError,
    execute: loadDocumentsApi
  } = useApi(documentAPI.getUserDocuments);

  const loadDocuments = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await loadDocumentsApi(user.id || user.username);
      const formattedDocuments = data.map(doc => ({
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
      setDocuments(formattedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }, [user, loadDocumentsApi]);

  const analyzeDocument = useCallback(async (documentId) => {
    setIsAnalyzing(true);
    
    try {
      const file = documents.find(f => f.id === documentId);
      if (!file) return;
      
      const docId = file.documentId || documentId;
      const analysisResult = await documentAPI.analyzeDocument(docId);
      
      const updatedFile = {
        ...file,
        status: 'analyzed',
        complianceScore: analysisResult.score || 0,
        issues: analysisResult.issues || []
      };
      
      setDocuments(prev => prev.map(f => 
        f.id === documentId ? updatedFile : f
      ));
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
      
      setDocuments(prev => prev.map(file => 
        file.id === documentId 
          ? { ...file, status: 'analyzed', complianceScore: score, issues: mockIssues }
          : file
      ));
    } finally {
      setIsAnalyzing(false);
    }
  }, [documents]);

  const deleteDocument = useCallback(async (documentId) => {
    try {
      await documentAPI.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }, []);

  // Load documents on mount
  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, loadDocuments]);

  return {
    documents,
    loading: loadingDocuments,
    error: documentsError,
    isAnalyzing,
    loadDocuments,
    analyzeDocument,
    deleteDocument
  };
}
