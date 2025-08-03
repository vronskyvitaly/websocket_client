'use client'

import { ConnectionState, WebSocketMessage } from '@/types/websocket'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseWebSocketProps {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export const useWebSocket = ({
  url,
  onMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    clientId: null,
    connectionTime: null,
    lastActivity: null,
  })

  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [lastError, setLastError] = useState<string | null>(null)

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected')
        setConnectionState((prev) => ({
          ...prev,
          isConnected: true,
          connectionTime: new Date(),
        }))
        setLastError(null)
        reconnectAttemptsRef.current = 0
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('📩 Received message:', message)

          setMessages((prev) => [...prev, message])

          if (
            message.type === 'welcome' &&
            typeof message.data === 'object' &&
            message.data &&
            'clientId' in message.data
          ) {
            setConnectionState((prev) => ({
              ...prev,
              clientId: (message.data as { clientId: string }).clientId,
              lastActivity: new Date(),
            }))
          }

          if (onMessage) {
            onMessage(message)
          }
        } catch (error) {
          console.error('❌ Error parsing message:', error)
        }
      }

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
        }))

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          console.log(
            `🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else {
          setLastError('Max reconnection attempts reached')
        }
      }

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setLastError('WebSocket connection error')
      }
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error)
      setLastError('Failed to create WebSocket connection')
    }
  }, [url, onMessage, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (ws.current) {
      ws.current.close()
      ws.current = null
    }

    setConnectionState({
      isConnected: false,
      clientId: null,
      connectionTime: null,
      lastActivity: null,
    })

    reconnectAttemptsRef.current = 0
  }, [])

  const sendMessage = useCallback(
    (message: Omit<WebSocketMessage, 'timestamp'>) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const fullMessage: WebSocketMessage = {
          ...message,
          timestamp: Date.now(),
        }

        ws.current.send(JSON.stringify(fullMessage))
        console.log('📤 Sent message:', fullMessage)

        setConnectionState((prev) => ({
          ...prev,
          lastActivity: new Date(),
        }))
      } else {
        console.error('❌ WebSocket is not connected')
        setLastError('WebSocket is not connected')
      }
    },
    []
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connectionState,
    messages,
    lastError,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    clearError,
  }
}
