'use client'

import { useSocketIO } from '@/hooks/useSocketIO'
import { ChatMessage } from '@/types/websocket'
import {
  ArrowRight,
  MessageCircle,
  Radio,
  RefreshCw,
  Send,
  Trash2,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [echoMessage, setEchoMessage] = useState('')

  const {
    chatState,
    lastError,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    clearError,
  } = useSocketIO({
    autoConnect: false,
  })

  const handleConnect = () => {
    clearError()
    connect()
  }

  const handlePing = () => {
    // Socket.IO doesn't have ping/pong, so we'll send a test message
    sendMessage('Ping test message', 'text')
  }

  const handleEcho = () => {
    if (echoMessage.trim()) {
      sendMessage(`Echo: ${echoMessage}`, 'text')
      setEchoMessage('')
    }
  }

  const handleBroadcast = () => {
    if (broadcastMessage.trim()) {
      sendMessage(`Broadcast: ${broadcastMessage}`, 'text')
      setBroadcastMessage('')
    }
  }

  const handleGetClients = () => {
    // This will be handled by the chat state
    console.log('Connected users:', chatState.users)
  }

  const formatTime = (date: Date | null) => {
    return date ? date.toLocaleTimeString() : 'N/A'
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return '👋'
      case 'pong':
        return '🏓'
      case 'echo_response':
        return '🔊'
      case 'broadcast_message':
        return '📢'
      case 'client_connected':
        return '✅'
      case 'client_disconnected':
        return '❌'
      case 'clients_list':
        return '👥'
      case 'error':
        return '⚠️'
      default:
        return '📩'
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl text-black font-bold mb-4 text-center'>
          WebSocket & Socket.IO Demo
        </h1>

        {/* Navigation Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold text-black mb-3 flex items-center gap-2'>
              💬 Socket.IO Chat
            </h2>
            <p className='text-gray-600 mb-4'>
              Modern real-time chat application with Socket.IO featuring user
              management, typing indicators, and message history.
            </p>
            <Link
              href='/chat'
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
            >
              Open Chat <ArrowRight size={16} />
            </Link>
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold text-black mb-3 flex items-center gap-2'>
              🔧 WebSocket Tester
            </h2>
            <p className='text-gray-600 mb-4'>
              Legacy WebSocket testing interface for ping/pong, echo, broadcast
              and client management testing.
            </p>
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg'>
              Current Page <RefreshCw size={16} />
            </div>
          </div>
        </div>

        <div className='border-t pt-8'>
          <h2 className='text-2xl text-black font-bold mb-6 text-center'>
            WebSocket Client Tester (Legacy)
          </h2>

          {/* Connection Section */}
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h2 className='text-xl text-black font-semibold mb-4 flex items-center gap-2'>
              <Wifi className='text-black' size={24} />
              Connection
            </h2>

            <div className='flex gap-4 mb-4'>
              <div className='flex-1 px-4 py-2 text-black border border-gray-300 rounded-lg bg-gray-100'>
                Socket.IO Server (localhost:3002)
              </div>

              {chatState.isConnected ? (
                <button
                  onClick={disconnect}
                  className='px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2'
                >
                  <WifiOff size={20} />
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2'
                >
                  <Wifi size={20} />
                  Connect
                </button>
              )}
            </div>

            {/* Connection Status */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div className='bg-gray-50 text-black p-3 rounded'>
                <div className='font-semibold text-gray-600'>Status</div>
                <div
                  className={`font-bold ${
                    chatState.isConnected ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {chatState.isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              <div className='bg-gray-50 text-black p-3 rounded'>
                <div className='font-semibold text-gray-600'>User ID</div>
                <div className='font-mono text-sm'>
                  {chatState.userId || 'N/A'}
                </div>
              </div>
              <div className='bg-gray-50 text-black p-3 rounded'>
                <div className='font-semibold text-gray-600'>Username</div>
                <div>{chatState.username || 'N/A'}</div>
              </div>
              <div className='bg-gray-50 text-black p-3 rounded'>
                <div className='font-semibold text-gray-600'>Users Online</div>
                <div>{chatState.users.length}</div>
              </div>
            </div>

            {lastError && (
              <div className='mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700'>
                <div className='flex justify-between items-center'>
                  <span>❌ {lastError}</span>
                  <button
                    onClick={clearError}
                    className='text-red-500 hover:text-red-700'
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h2 className='text-xl text-black font-semibold mb-4 flex items-center gap-2'>
              <Send className='text-green-500' size={24} />
              Actions
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Ping */}
              <div className='space-y-2'>
                <label className='block font-semibold text-gray-700'>
                  Ping Server
                </label>
                <button
                  onClick={handlePing}
                  disabled={!chatState.isConnected}
                  className='w-full px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  <Zap size={20} />
                  Send Ping
                </button>
              </div>

              {/* Get Clients */}
              <div className='space-y-2'>
                <label className='block font-semibold text-gray-700'>
                  Get Clients List
                </label>
                <button
                  onClick={handleGetClients}
                  disabled={!chatState.isConnected}
                  className='w-full px-4 py-2 bg-purple-500 text-black rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  <Users size={20} />
                  Get Clients
                </button>
              </div>

              {/* Echo */}
              <div className='space-y-2'>
                <label className='block font-semibold text-gray-700'>
                  Echo Message
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={echoMessage}
                    onChange={(e) => setEchoMessage(e.target.value)}
                    placeholder='Message to echo'
                    className='flex-1 px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled={!chatState.isConnected}
                    onKeyPress={(e) => e.key === 'Enter' && handleEcho()}
                  />
                  <button
                    onClick={handleEcho}
                    disabled={!chatState.isConnected || !echoMessage.trim()}
                    className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    <MessageCircle size={20} />
                    Echo
                  </button>
                </div>
              </div>

              {/* Broadcast */}
              <div className='space-y-2'>
                <label className='block text-black font-semibold '>
                  Broadcast Message
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder='Message to broadcast'
                    className='flex-1 px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled={!chatState.isConnected}
                    onKeyPress={(e) => e.key === 'Enter' && handleBroadcast()}
                  />
                  <button
                    onClick={handleBroadcast}
                    disabled={
                      !chatState.isConnected || !broadcastMessage.trim()
                    }
                    className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    <Radio size={20} />
                    Broadcast
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Section */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl text-black font-semibold flex items-center gap-2'>
                <MessageCircle className='text-indigo-500' size={24} />
                Messages ({chatState.messages.length})
              </h2>
              <button
                onClick={clearMessages}
                className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2'
              >
                <Trash2 size={16} />
                Clear
              </button>
            </div>

            <div className='max-h-96 overflow-y-auto space-y-2'>
              {chatState.messages.length === 0 ? (
                <div className='text-black text-center py-8'>
                  No messages yet. Connect and start sending messages!
                </div>
              ) : (
                chatState.messages.map(
                  (message: ChatMessage, index: number) => (
                    <div
                      key={message.id || index}
                      className='border border-gray-200 rounded-lg p-3'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <div className='flex items-center gap-2'>
                          <span className='text-lg'>💬</span>
                          <span className='font-semibold text-black'>
                            {message.username}
                          </span>
                        </div>
                        <span className='text-xs text-gray-500'>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className='text-sm bg-gray-50 p-2 rounded text-black'>
                        {message.content}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
