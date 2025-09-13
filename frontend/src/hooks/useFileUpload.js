"use client";

import { useState, useCallback } from "react";
import { documentAPI } from "@/services/api";
import { useAuthStore } from "@/store/auth";

// File upload state structure
// {
//   files: File[],
//   uploading: boolean,
//   error: string | null,
//   progress: number
// }

export function useFileUpload() {
  const { user } = useAuthStore();
  const [state, setState] = useState({
    files: [],
    uploading: false,
    error: null,
    progress: 0
  });

  const addFiles = useCallback((newFiles) => {
    setState(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles],
      error: null
    }));
  }, []);

  const removeFile = useCallback((index) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  }, []);

  const clearFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      files: [],
      error: null
    }));
  }, []);

  const uploadFiles = useCallback(async () => {
    if (state.files.length === 0) return [];

    setState(prev => ({ ...prev, uploading: true, error: null, progress: 0 }));

    try {
      const uploadPromises = state.files.map(async (file, index) => {
        try {
          const result = await documentAPI.uploadDocument(file, user?.id || user?.username);
          setState(prev => ({ 
            ...prev, 
            progress: ((index + 1) / state.files.length) * 100 
          }));
          return {
            ...result,
            file,
            success: true
          };
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          return {
            file,
            error: error.message || 'Upload failed',
            success: false
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      setState(prev => ({ 
        ...prev, 
        uploading: false, 
        progress: 100 
      }));

      return results;
    } catch (error) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: error.message || 'Upload failed'
      }));
      throw error;
    }
  }, [state.files, user]);

  const reset = useCallback(() => {
    setState({
      files: [],
      uploading: false,
      error: null,
      progress: 0
    });
  }, []);

  return {
    ...state,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    reset
  };
}
