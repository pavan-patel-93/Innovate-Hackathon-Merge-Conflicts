"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/common/FileUpload";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { MessageSquare, Bot } from "lucide-react";
import { useChat } from "@/hooks/useChat";

export function Chat() {
  const {
    messages,
    input,
    setInput,
    uploadedFiles,
    setUploadedFiles,
    isTyping,
    isLoading,
    sendMessage,
    handleFileUpload
  } = useChat();

  return (
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
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
                <p>Loading chat history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation by uploading files or asking a question</p>
              </div>
            ) : (
              <ChatMessages messages={messages} isTyping={isTyping} />
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <ChatInput
              input={input}
              setInput={setInput}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              onSendMessage={sendMessage}
              onFileUpload={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
