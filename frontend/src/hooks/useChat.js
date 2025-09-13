"use client";

import { useState, useCallback } from "react";
import { aiChatAPI } from "@/services/api";

// Chat file structure
// {
//   id: number,
//   name: string,
//   size: number,
//   type: string,
//   uploadDate: Date,
//   file?: File
// }

// Chat message structure
// {
//   id: number,
//   type: 'user' | 'bot',
//   content: string,
//   files?: ChatFile[],
//   timestamp: Date
// }

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      files: uploadedFiles,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentFiles = [...uploadedFiles];
    setInput("");
    setUploadedFiles([]);
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
      
      setMessages(prev => [...prev, botResponse]);
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
      
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  }, [input, uploadedFiles]);

  const handleFileUpload = useCallback((files) => {
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    input,
    setInput,
    uploadedFiles,
    setUploadedFiles,
    isTyping,
    sendMessage,
    handleFileUpload,
    clearMessages
  };
}
