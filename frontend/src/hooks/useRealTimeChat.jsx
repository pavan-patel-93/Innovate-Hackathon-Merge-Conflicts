'use client'

import { useCallback, useEffect, useState, useRef } from 'react'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'


export function useRealtimeChat({ roomName, username }) {
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  // Initialize WebSocket connection
  useEffect(() => {
    // Only connect if we have a username and room name
    if (!username || !roomName) {
      setIsConnected(false)
      return
    }

    const clientId = crypto.randomUUID()
    const wsUrl = `${WS_URL}/ws/${clientId}/${roomName}/${encodeURIComponent(username)}`
    
    const connectWebSocket = () => {
      // Close existing connection if any
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close()
      }
      
      const ws = new WebSocket(wsUrl)
      socketRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason)
        setIsConnected(false)
        
        // Attempt to reconnect unless this was a normal closure
        if (event.code !== 1000) {
          console.log('Attempting to reconnect in 3 seconds...')
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'message') {
          // Single new message
          setMessages((current) => [...current, data.data])
        } else if (data.type === 'previous_messages' && Array.isArray(data.data)) {
          // Load previous messages
          setMessages(data.data)
        } else if (data.type === 'system_message') {
          // Handle system messages if needed
          console.log('System message:', data.data)
        }
      }
    }

    connectWebSocket()

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted')
        socketRef.current = null
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [roomName, username])

  // Send message function
  const sendMessage = useCallback((content) => {
    if (!socketRef.current || !isConnected || !username) return

    const message = {
      id: crypto.randomUUID(),
      content,
      user: {
        name: username,
      },
      room_name: roomName,
      created_at: new Date().toISOString(),
    }

    // Update local state immediately for the sender
    setMessages((current) => [...current, message])

    // Send message through WebSocket
    socketRef.current.send(JSON.stringify(message))
  }, [isConnected, roomName, username])

  return { messages, sendMessage, isConnected }
}