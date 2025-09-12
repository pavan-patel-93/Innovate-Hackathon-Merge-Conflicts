'use client'

import { cn } from '@/lib/utils'
import { ChatMessageItem } from '@/components/chatMessageItem'
import { useChatScroll } from '@/hooks/useChatScroll'
import { useRealtimeChat } from '@/hooks/useRealTimeChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const RealtimeChat = ({
  roomName,
  username,
  onMessage,
  messages: initialMessages = [],
}) => {
  const { containerRef, scrollToBottom } = useChatScroll()

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
  } = useRealtimeChat({
    roomName,
    username,
  })

  const [newMessage, setNewMessage] = useState('')

  // Merge realtime messages with initial messages
  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages]
    // Remove duplicates based on message id
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) => index === self.findIndex((m) => m.id === message.id)
    )
    // Sort by creation date
    const sortedMessages = uniqueMessages.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    return sortedMessages
  }, [initialMessages, realtimeMessages])

  useEffect(() => {
    if (onMessage) {
      onMessage(allMessages)
    }
  }, [allMessages, onMessage])

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom()
  }, [allMessages, scrollToBottom])

  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault()
      if (!newMessage.trim() || !isConnected || !username) return

      sendMessage(newMessage)
      setNewMessage('')
    },
    [newMessage, isConnected, sendMessage, username]
  )

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased">
      {/* Connection status */}
      {!username ? (
        <div className="bg-amber-100 dark:bg-amber-900 p-2 text-center text-sm">
          Please enter a username to join the chat
        </div>
      ) : !isConnected ? (
        <div className="bg-amber-100 dark:bg-amber-900 p-2 text-center text-sm">
          Connecting to chat server...
        </div>
      ) : null}
      
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : null}
        <div className="space-y-1">
          {allMessages.map((message, index) => {
            const prevMessage = index > 0 ? allMessages[index - 1] : null
            const showHeader =
              !prevMessage || prevMessage.user.name !== message.user.name

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ChatMessageItem
                  message={message}
                  isOwnMessage={message.user.name === username}
                  showHeader={showHeader}
                />
              </div>
            )
          })}
        </div>
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex w-full gap-2 border-t border-border p-4"
      >
        <Input
          className={cn(
            'rounded-full bg-background text-sm transition-all duration-300',
            isConnected && newMessage.trim() && username
              ? 'w-[calc(100%-36px)]'
              : 'w-full'
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={username ? "Type a message..." : "Enter a username first"}
          disabled={!isConnected || !username}
        />
        {isConnected && newMessage.trim() && username && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={!isConnected || !username}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </div>
  )
}