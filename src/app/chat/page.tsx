'use client'

import { useSocketIO } from '@/hooks/useSocketIO'
import {
  Loader2,
  MessageCircle,
  Send,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function ChatPage() {
  const [messageInput, setMessageInput] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [showUsernameModal, setShowUsernameModal] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    chatState,
    lastError,
    connect,
    disconnect,
    setUsername,
    sendMessage,
    sendTyping,
    clearError,
  } = useSocketIO()

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatState.messages])

  // Handle username submission
  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameInput.trim() && !isConnecting) {
      setIsConnecting(true)
      connect()
      // Don't close modal yet - wait for connection
    }
  }

  // Auto-set username once connected
  useEffect(() => {
    if (
      chatState.isConnected &&
      usernameInput.trim() &&
      showUsernameModal &&
      isConnecting
    ) {
      setUsername(usernameInput.trim())
      setShowUsernameModal(false)
      setIsConnecting(false)
    }
  }, [
    chatState.isConnected,
    usernameInput,
    showUsernameModal,
    isConnecting,
    setUsername,
  ])

  // Reset connecting state on error
  useEffect(() => {
    if (lastError && isConnecting) {
      setIsConnecting(false)
    }
  }, [lastError, isConnecting])

  // Handle message submission
  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim() && chatState.isConnected) {
      sendMessage(messageInput)
      setMessageInput('')
      sendTyping(false)
      setIsTyping(false)
    }
  }

  // Handle typing indicator
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      sendTyping(true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        sendTyping(false)
      }
    }, 1000)
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get message style based on sender
  const getMessageStyle = (userId: string) => {
    if (userId === chatState.userId) {
      return 'bg-blue-500 text-white ml-auto'
    }
    return 'bg-gray-200 text-gray-800'
  }

  // Username modal
  if (showUsernameModal) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-md p-6 w-full max-w-md'>
          <h1 className='text-2xl font-bold text-center mb-6 text-gray-800'>
            💬 Welcome to Chat
          </h1>
          <form onSubmit={handleUsernameSubmit}>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Choose your username
              </label>
              <input
                type='text'
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder='Enter your username'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800'
                required
                autoFocus
              />
            </div>
            <button
              type='submit'
              disabled={!usernameInput.trim() || isConnecting}
              className='w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {isConnecting ? (
                <>
                  <Loader2 size={20} className='animate-spin' />
                  Connecting...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Join Chat
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b p-4'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <MessageCircle className='text-blue-500' size={24} />
            <h1 className='text-xl font-bold text-gray-800'>Chat Room</h1>
            <span className='text-sm text-gray-500'>
              #{chatState.currentRoom}
            </span>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              {chatState.isConnected ? (
                <Wifi className='text-green-500' size={20} />
              ) : (
                <WifiOff className='text-red-500' size={20} />
              )}
              <span
                className={`text-sm font-medium ${
                  chatState.isConnected ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {chatState.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Users className='text-gray-500' size={16} />
              <span className='text-sm text-gray-600'>
                {chatState.users.length} online
              </span>
            </div>

            <button
              onClick={disconnect}
              className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600'
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {lastError && (
        <div className='bg-red-100 border border-red-300 p-3'>
          <div className='max-w-4xl mx-auto flex justify-between items-center'>
            <span className='text-red-700'>❌ {lastError}</span>
            <button
              onClick={clearError}
              className='text-red-500 hover:text-red-700'
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className='flex-1 flex max-w-4xl mx-auto w-full'>
        {/* Main chat area */}
        <div className='flex-1 flex flex-col'>
          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {chatState.messages.length === 0 ? (
              <div className='text-center text-gray-500 py-8'>
                <MessageCircle
                  size={48}
                  className='mx-auto mb-4 text-gray-300'
                />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatState.messages.map((message, index) => (
                <div key={message.id || index} className='flex flex-col'>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageStyle(
                      message.userId
                    )}`}
                  >
                    {message.userId !== chatState.userId && (
                      <div className='text-xs font-semibold mb-1 opacity-75'>
                        {message.username}
                      </div>
                    )}
                    <div className='break-words'>{message.content}</div>
                    <div className='text-xs opacity-75 mt-1'>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {chatState.typingUsers.length > 0 && (
              <div className='flex items-center gap-2 text-sm text-gray-500 italic'>
                <Loader2 size={16} className='animate-spin' />
                {chatState.typingUsers.join(', ')}{' '}
                {chatState.typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className='p-4 bg-white border-t'>
            <form onSubmit={handleMessageSubmit} className='flex gap-2'>
              <input
                ref={messageInputRef}
                type='text'
                value={messageInput}
                onChange={handleTyping}
                placeholder='Type your message...'
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800'
                disabled={!chatState.isConnected}
              />
              <button
                type='submit'
                disabled={!chatState.isConnected || !messageInput.trim()}
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2'
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Users sidebar */}
        <div className='w-64 bg-white border-l p-4'>
          <h3 className='font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <Users size={20} />
            Online Users ({chatState.users.length})
          </h3>

          <div className='space-y-2'>
            {chatState.users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-2 rounded ${
                  user.id === chatState.userId
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600'>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className='flex-1'>
                  <div className='text-sm font-medium text-gray-800'>
                    {user.username}
                    {user.id === chatState.userId && (
                      <span className='text-xs text-blue-600 ml-1'>(You)</span>
                    )}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {user.isOnline ? '🟢 Online' : '🔴 Offline'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
