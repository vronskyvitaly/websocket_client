'use client'

import {
  ChatMessage,
  ChatState,
  ChatUser,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/websocket'
import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketIOProps {
  url?: string
  autoConnect?: boolean
}

export const useSocketIO = ({
  url,
  autoConnect = false,
}: UseSocketIOProps = {}) => {
  // Use environment variable as fallback
  const socketUrl =
    url || process.env.NEXT_PUBLIC_SOCKETIO_URL || 'http://localhost:3002'
  const socket = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [chatState, setChatState] = useState<ChatState>({
    isConnected: false,
    userId: null,
    username: null,
    currentRoom: 'general',
    messages: [],
    users: [],
    typingUsers: [],
    connectionTime: null,
  })

  const [lastError, setLastError] = useState<string | null>(null)

  const connect = useCallback(() => {
    if (socket.current?.connected) return

    try {
      socket.current = io(socketUrl, {
        autoConnect: false,
        transports: ['polling'], // Используем только polling для Vercel
        timeout: 20000,
        forceNew: true,
        // Настройки для работы с прокси
        path: '/socket.io/',
        // Дополнительные настройки для стабильности
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        // Настройки для CORS
        withCredentials: false,
      })

      socket.current.on('connect', () => {
        console.log('🔗 Socket.IO connected')
        setChatState((prev) => ({
          ...prev,
          isConnected: true,
          connectionTime: new Date(),
        }))
        setLastError(null)
      })

      socket.current.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO disconnected:', reason)
        setChatState((prev) => ({
          ...prev,
          isConnected: false,
        }))
      })

      socket.current.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error)
        setLastError(`Failed to connect to chat server: ${error.message}`)
      })

      socket.current.on('connected', (data) => {
        console.log('👤 User connected:', data)
        setChatState((prev) => ({
          ...prev,
          userId: data.userId,
          username: data.username,
        }))
      })

      socket.current.on('message', (message: ChatMessage) => {
        console.log('💬 New message:', message)
        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }))
      })

      socket.current.on('messageHistory', (messages: ChatMessage[]) => {
        console.log('📜 Message history loaded:', messages.length)
        setChatState((prev) => ({
          ...prev,
          messages: messages,
        }))
      })

      socket.current.on('userJoined', (user: ChatUser) => {
        console.log('👋 User joined:', user)
        setChatState((prev) => ({
          ...prev,
          users: prev.users.some((u) => u.id === user.id)
            ? prev.users
            : [...prev.users, user],
        }))
      })

      socket.current.on('userLeft', (userId: string) => {
        console.log('👋 User left:', userId)
        setChatState((prev) => ({
          ...prev,
          users: prev.users.filter((u) => u.id !== userId),
          typingUsers: prev.typingUsers.filter((u) => u !== userId),
        }))
      })

      socket.current.on('roomUsers', (users: ChatUser[]) => {
        console.log('👥 Room users updated:', users.length)
        setChatState((prev) => ({
          ...prev,
          users: users,
        }))
      })

      socket.current.on('userTyping', (data) => {
        if (data.isTyping) {
          setChatState((prev) => ({
            ...prev,
            typingUsers: prev.typingUsers.includes(data.username)
              ? prev.typingUsers
              : [...prev.typingUsers, data.username],
          }))
        } else {
          setChatState((prev) => ({
            ...prev,
            typingUsers: prev.typingUsers.filter((u) => u !== data.username),
          }))
        }
      })

      socket.current.on('error', (error: string) => {
        console.error('❌ Socket error:', error)
        setLastError(error)
      })

      socket.current.connect()
    } catch (error) {
      console.error('❌ Failed to connect to Socket.IO:', error)
      setLastError('Failed to connect to chat server')
    }
  }, [socketUrl])

  const disconnect = useCallback(() => {
    if (socket.current) {
      socket.current.disconnect()
      socket.current = null
    }

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
  }, [])

  const setUsername = useCallback((username: string) => {
    if (socket.current?.connected) {
      socket.current.emit('setUsername', username.trim())
    }
  }, [])

  const sendMessage = useCallback(
    (content: string, type: 'text' | 'image' | 'file' = 'text') => {
      if (socket.current?.connected && content.trim()) {
        socket.current.emit('sendMessage', {
          content: content.trim(),
          type,
          roomId: chatState.currentRoom,
        })
      }
    },
    [chatState.currentRoom]
  )

  const sendTyping = useCallback((isTyping: boolean) => {
    if (socket.current?.connected) {
      socket.current.emit('typing', isTyping)

      if (isTyping) {
        // Auto stop typing after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
          if (socket.current?.connected) {
            socket.current.emit('typing', false)
          }
        }, 3000)
      } else {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = null
        }
      }
    }
  }, [])

  const joinRoom = useCallback((roomId: string) => {
    if (socket.current?.connected) {
      socket.current.emit('joinRoom', roomId)
      setChatState((prev) => ({
        ...prev,
        currentRoom: roomId,
        messages: [], // Clear messages when changing rooms
      }))
    }
  }, [])

  const leaveRoom = useCallback((roomId: string) => {
    if (socket.current?.connected) {
      socket.current.emit('leaveRoom', roomId)
    }
  }, [])

  const requestHistory = useCallback(
    (roomId?: string) => {
      if (socket.current?.connected) {
        socket.current.emit('requestHistory', roomId || chatState.currentRoom)
      }
    },
    [chatState.currentRoom]
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
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
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
