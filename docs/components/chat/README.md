# Chat Components

This directory contains the components that make up the medical chat interface, built with Next.js, React, Shadcn UI, and Tailwind CSS.

## Component Structure

```
chat/
├── chat-container.tsx      # Main container managing state and layout
├── chat-messages.tsx       # Messages list with scroll management
├── conversation-list.tsx   # Sidebar list of conversations
├── chat-input.tsx         # Message input with typing indicators
├── chat-message.tsx       # Individual message bubble
└── chat-typing-indicator.tsx # Typing status indicator
```

## Key Features

- Real-time messaging with Supabase subscriptions
- AI integration for medical assistance
- Message status tracking (delivered/read)
- Typing indicators
- Presence tracking
- Mobile-responsive layout
- Glassmorphic design elements
- Accessibility support

## Component Details

### ChatContainer
- Main orchestrator component
- Manages conversation state and real-time subscriptions
- Handles layout and component composition
- Props:
  - `patientId: string` - Current patient's ID
  - `className?: string` - Optional styling overrides

### ConversationList
- Displays list of patient conversations
- Handles conversation selection and status updates
- Supports archiving and filtering
- Props:
  - `patientId: string` - Current patient's ID
  - `onSelect: (id: string) => void` - Conversation selection handler

### ChatMessages
- Displays message thread with scroll management
- Handles new message animations
- Shows typing indicators inline
- Props:
  - `conversationId: string` - Current conversation ID
  - `messages: Message[]` - Array of messages to display

### ChatInput
- Message composition with auto-resize
- Handles typing indicator broadcasts
- Supports message submission
- Props:
  - `conversationId: string` - Current conversation ID
  - `onSend: (content: string) => void` - Message send handler

### ChatMessage
- Individual message display
- Shows status indicators
- Supports different message types (user/AI)
- Props:
  - `message: Message` - Message data
  - `isAI?: boolean` - Whether message is from AI

### ChatTypingIndicator
- Shows typing status
- Animates dots for visual feedback
- Props:
  - `isTyping: boolean` - Typing state
  - `name?: string` - Optional name of typing user

## Usage Example

```tsx
// In a patient dashboard or medical intake page:
import { ChatContainer } from '@/components/chat/chat-container'

export function PatientDashboard() {
  const { user } = useAuth()
  
  return (
    <div className="h-full">
      <ChatContainer 
        patientId={user.id}
        className="min-h-[600px]"
      />
    </div>
  )
}
```

## State Management

The chat interface uses a combination of:
- Local React state for UI interactions
- Supabase real-time subscriptions for messages and presence
- Custom hooks for chat operations and AI integration

## Styling

Components use Shadcn UI as a base with custom Tailwind CSS for:
- Glassmorphic effects
- Dark-mode–first design
- Responsive layouts
- Smooth animations

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly message structure
- High contrast text and indicators 