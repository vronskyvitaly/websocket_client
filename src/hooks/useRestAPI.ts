'use client'

import { ChatState } from '@/types/websocket'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseRestAPIProps {
  url?: string
  autoConnect?: boolean
}

export const useRestAPI = ({
  url,
  autoConnect = false,
}: UseRestAPIProps = {}) => {
  const apiUrl =
    url || process.env.NEXT_PUBLIC_REST_API_URL || 'https://websocket-server-khaki.vercel.app'
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [chatState, setChatState] = useState<ChatState>({
    isConnected: true, // Always connected for REST API
    userId: null,
    username: null,
    currentRoom: 'general',
    messages: [],
    users: [],
    typingUsers: [],
    connectionTime: new Date(),
  })

  const [lastError, setLastError] = useState<string | null>(null)

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/messages`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setChatState((prev) => ({
        ...prev,
        messages: data.messages || [],
      }))
      setLastError(null)
    } catch (error) {
      console.error('❌ Error fetching messages:', error)
      setLastError(
        `Failed to fetch messages: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }, [apiUrl])

  // Send message via API
  const sendMessage = useCallback(
    async (
      content: string,
      type: 'text' | 'image' | 'file' = 'text',
      username?: string
    ) => {
      if (!content.trim() || !username) {
        setLastError('Content and username are required')
        return
      }

      try {
        const response = await fetch(`${apiUrl}/api/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: content.trim(),
            username,
            type,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const newMessage = await response.json()

        // Add the new message to the state
        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, newMessage],
        }))

        setLastError(null)
      } catch (error) {
        console.error('❌ Error sending message:', error)
        setLastError(
          `Failed to send message: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        )
      }
    },
    [apiUrl]
  )

  // Set username
  const setUsername = useCallback((username: string) => {
    setChatState((prev) => ({
      ...prev,
      username: username.trim(),
      userId: username.trim(), // Use username as userId for REST API
    }))
  }, [])

  // Start polling for messages
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Fetch messages immediately
    fetchMessages()

    // Then poll every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages()
    }, 3000)
  }, [fetchMessages])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  // Connect (start polling)
  const connect = useCallback(() => {
    console.log('🔗 Starting REST API polling')
    startPolling()
    setChatState((prev) => ({
      ...prev,
      isConnected: true,
      connectionTime: new Date(),
    }))
  }, [startPolling])

  // Disconnect (stop polling)
  const disconnect = useCallback(() => {
    console.log('🔌 Stopping REST API polling')
    stopPolling()
    setChatState({
      isConnected: false,
      userId: null,
      username: null,
      currentRoom: 'general',
      messages: [],
      users: [],
      typingUsers: [],
      connectionTime: null,
    })
  }, [stopPolling])

  // Mock functions for compatibility with Socket.IO interface
  const sendTyping = useCallback((isTyping: boolean) => {
    // Not implemented for REST API
    console.log('Typing indicator not supported in REST API mode')
  }, [])

  const joinRoom = useCallback((roomId: string) => {
    setChatState((prev) => ({
      ...prev,
      currentRoom: roomId,
    }))
  }, [])

  const leaveRoom = useCallback((roomId: string) => {
    // Not implemented for REST API
    console.log('Room management not supported in REST API mode')
  }, [])

  const requestHistory = useCallback(
    (roomId?: string) => {
      fetchMessages()
    },
    [fetchMessages]
  )

  const clearMessages = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      messages: [],
    }))
  }, [])

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      stopPolling()
    }
  }, [autoConnect, connect, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  return {
    chatState,
    lastError,
    connect,
    disconnect,
    setUsername,
    sendMessage,
    sendTyping,
    joinRoom,
    leaveRoom,
    requestHistory,
    clearMessages,
    clearError,
  }
}
