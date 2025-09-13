"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, XCircle } from "lucide-react";

interface ChatFile {
  id: number;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  file?: File;
}

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  uploadedFiles: ChatFile[];
  setUploadedFiles: (files: ChatFile[]) => void;
  onSendMessage: () => void;
  onFileUpload: (files: File[]) => void;
}

export function ChatInput({
  input,
  setInput,
  uploadedFiles,
  setUploadedFiles,
  onSendMessage,
  onFileUpload
}: ChatInputProps) {
  const handleFileSelect = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      file: file
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="space-y-3">
      {/* File Upload Area */}
      {uploadedFiles.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Files to upload:</div>
          <div className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-3 h-3" />
                  <span>{file.name}</span>
                  <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Remove ${file.name}`}
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
          onChange={(e) => e.target.files && handleFileSelect(Array.from(e.target.files))}
          className="hidden"
          id="chat-file-upload"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('chat-file-upload')?.click()}
          aria-label="Upload files"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about compliance analysis or upload files..."
          className="flex-1"
        />
        <Button 
          onClick={onSendMessage} 
          disabled={!input.trim() && uploadedFiles.length === 0}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
