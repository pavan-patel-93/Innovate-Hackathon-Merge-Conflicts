"use client";

import { Bot, User, Paperclip, FileText, BarChart3 } from "lucide-react";

// Simple markdown parser for basic formatting
function parseMarkdown(text) {
  if (!text) return text;
  
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Lists
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br>');
}

export function ChatMessages({ messages, isTyping }) {
  return (
    <>
      {messages.map((message) => (
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
            
            {/* Display upload results if available */}
            {message.uploadResults && message.uploadResults.length > 0 && (
              <div className="mb-4 space-y-3">
                {message.uploadResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">{result.filename}</span>
                      {result.compliance_score !== undefined && (
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-4 h-4 text-green-500" />
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.compliance_score >= 80 ? 'bg-green-100 text-green-800' :
                            result.compliance_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Score: {result.compliance_score}/100
                          </span>
                        </div>
                      )}
                    </div>
                    {result.compliance_analysis && (
                      <div 
                        className="text-sm prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ 
                          __html: parseMarkdown(result.compliance_analysis) 
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Regular message content */}
            {message.content && (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(message.content) 
                }}
              />
            )}
          </div>
        </div>
      ))}
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
    </>
  );
}
