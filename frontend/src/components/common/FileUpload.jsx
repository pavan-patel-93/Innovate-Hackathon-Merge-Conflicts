"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// FileUpload props structure
// {
//   onFileSelect: (files: File[]) => void,
//   acceptedTypes?: string,
//   maxSize?: number, // in MB
//   multiple?: boolean,
//   disabled?: boolean,
//   className?: string,
//   placeholder?: string,
//   description?: string
// }

export function FileUpload({
  onFileSelect,
  acceptedTypes = ".doc,.docx,.pdf,.txt",
  maxSize = 10, // 10MB
  multiple = true,
  disabled = false,
  className,
  placeholder = "Drag and drop files here, or click to browse",
  description = "Supports: .doc, .docx, .pdf, .txt (Max 10MB)"
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxSize}MB.`;
    }

    // Check file type
    const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypesArray.includes(fileExtension)) {
      return `File "${file.name}" has an unsupported format. Accepted types: ${acceptedTypes}`;
    }

    return null;
  };

  const handleFiles = useCallback((files) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validationErrors = [];

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    setError(null);
    onFileSelect(fileArray);
  }, [onFileSelect, maxSize, acceptedTypes]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e) => {
    if (disabled) return;
    handleFiles(e.target.files);
  }, [disabled, handleFiles]);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-upload')?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload area"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) {
              document.getElementById('file-upload')?.click();
            }
          }
        }}
      >
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {placeholder}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {description}
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        <Button 
          className="mt-4"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById('file-upload')?.click();
          }}
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
