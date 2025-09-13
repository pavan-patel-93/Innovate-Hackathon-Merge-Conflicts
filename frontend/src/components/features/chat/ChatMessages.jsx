"use client";

import { Bot, User, Paperclip } from "lucide-react";

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
            <div className="whitespace-pre-wrap">{message.content}</div>
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
