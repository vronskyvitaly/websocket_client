// Legacy WebSocket types
export interface WebSocketMessage {
  type: string
  data: unknown
  timestamp: number
}

export interface ClientInfo {
  id: string
  connectedAt: Date
  lastActivity: Date
}

export interface ConnectionState {
  isConnected: boolean
  clientId: string | null
  connectionTime: Date | null
  lastActivity: Date | null
}

// Socket.IO Chat Types
export interface ChatUser {
  id: string
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
  joinedAt: Date
}

export interface ChatMessage {
  id: string
  userId: string
  username: string
  content: string
  timestamp: Date
  type: 'text' | 'system' | 'image' | 'file'
  roomId?: string
  replyTo?: string
  edited?: boolean
  editedAt?: Date
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  createdBy: string
  createdAt: Date
  isPrivate: boolean
  users: string[]
  lastMessage?: ChatMessage
}

// Socket.IO Events for Client
export interface ServerToClientEvents {
  message: (message: ChatMessage) => void
  userJoined: (user: ChatUser) => void
  userLeft: (userId: string) => void
  userTyping: (data: {
    userId: string
    username: string
    isTyping: boolean
  }) => void
  roomUsers: (users: ChatUser[]) => void
  messageHistory: (messages: ChatMessage[]) => void
  error: (error: string) => void
  connected: (data: { userId: string; username: string }) => void
}

export interface ClientToServerEvents {
  sendMessage: (data: {
    content: string
    type?: 'text' | 'image' | 'file'
    roomId?: string
  }) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  typing: (isTyping: boolean) => void
  requestHistory: (roomId?: string) => void
  setUsername: (username: string) => void
}

// Chat State
export interface ChatState {
  isConnected: boolean
  userId: string | null
  username: string | null
  currentRoom: string
  messages: ChatMessage[]
  users: ChatUser[]
  typingUsers: string[]
  connectionTime: Date | null
}
