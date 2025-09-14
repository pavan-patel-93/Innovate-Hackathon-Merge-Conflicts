"use client";

import { useState, useCallback, useEffect } from "react";
import { setupAPI } from "@/services/api";
import { useAuthStore } from "@/store/auth";

export function useSetup() {
  const { user } = useAuthStore();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDocumentTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await setupAPI.getDocumentTypes();
      setDocumentTypes(data);
    } catch (error) {
      console.error('Error loading document types:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocumentType = useCallback(async (documentType) => {
    setLoading(true);
    try {
      await setupAPI.createDocumentType(documentType, user?.username);
      await loadDocumentTypes();
    } catch (error) {
      console.error('Error creating document type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, loadDocumentTypes]);

  const updateDocumentType = useCallback(async (docTypeId, documentType) => {
    setLoading(true);
    try {
      await setupAPI.updateDocumentType(docTypeId, documentType);
      await loadDocumentTypes();
    } catch (error) {
      console.error('Error updating document type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadDocumentTypes]);

  const deleteDocumentType = useCallback(async (docTypeId) => {
    setLoading(true);
    try {
      await setupAPI.deleteDocumentType(docTypeId);
      await loadDocumentTypes();
    } catch (error) {
      console.error('Error deleting document type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadDocumentTypes]);

  const getDocumentType = useCallback(async (docTypeId) => {
    try {
      return await setupAPI.getDocumentType(docTypeId);
    } catch (error) {
      console.error('Error fetching document type:', error);
      throw error;
    }
  }, []);

  const getDocumentTypeByCode = useCallback(async (code) => {
    try {
      return await setupAPI.getDocumentTypeByCode(code);
    } catch (error) {
      console.error('Error fetching document type by code:', error);
      throw error;
    }
  }, []);

  const addSectionRule = useCallback(async (docTypeId, sectionName, ruleData) => {
    try {
      await setupAPI.addSectionRule(docTypeId, sectionName, ruleData);
      await loadDocumentTypes();
    } catch (error) {
      console.error('Error adding section rule:', error);
      throw error;
    }
  }, [loadDocumentTypes]);

  const updateSectionRule = useCallback(async (docTypeId, sectionName, ruleId, ruleData) => {
    try {
      await setupAPI.updateSectionRule(docTypeId, sectionName, ruleId, ruleData);
      await loadDocumentTypes();
    } catch (error) {
      console.error('Error updating section rule:', error);
      throw error;
    }
  }, [loadDocumentTypes]);

  const deleteSectionRule = useCallback(async (docTypeId, sectionName, ruleId) => {
    try {
      await setupAPI.deleteSectionRule(docTypeId, sectionName, ruleId);
      await loadDocumentTypes();
    } catch (error) {
      console.error('Error deleting section rule:', error);
      throw error;
    }
  }, [loadDocumentTypes]);

  const getPredefinedRules = useCallback(async () => {
    try {
      return await setupAPI.getPredefinedRules();
    } catch (error) {
      console.error('Error fetching predefined rules:', error);
      throw error;
    }
  }, []);

  // Load document types on mount
  useEffect(() => {
    loadDocumentTypes();
  }, [loadDocumentTypes]);

  return {
    documentTypes,
    loading,
    error,
    loadDocumentTypes,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
    getDocumentType,
    getDocumentTypeByCode,
    addSectionRule,
    updateSectionRule,
    deleteSectionRule,
    getPredefinedRules
  };
}
