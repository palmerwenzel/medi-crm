# Chatbot Targets

## Initial AI Conversation Flow
- AI should aim to gather baseline context within 5 messages
- After 5 messages (or earlier if confident), AI should have enough information to:
  - Send patient to their existing provider
  - Create a ticket for a new provider
  - Escalate for emergency care
- AI uses confidence scoring (threshold 0.7) to ensure quality decisions
- Emergency cases bypass confidence threshold and are escalated immediately

## Chat-to-Case Integration
- AI should enable "Create Case" option once sufficient context is gathered
- Cases can be created:
  1. Directly by staff/admin
  2. Through AI chat with patient consent
  3. Automatically for emergency situations
- Case creation should preserve chat context:
  - Chat history
  - Symptoms and duration
  - Severity assessment
  - Existing provider information
  - Patient preferences
  - Clinical details and progression
  - Risk factors and red flags

## Access Control & Handoff
- After AI handoff, chat continues between patient and provider
- Chat window remains the same, but:
  - AI can no longer access
  - Provider gains access to full history
- Staff (provider role) can access chats through:
  1. Direct assignment
  2. Claiming an open case
  3. Emergency escalation

Implementation Status:
- [x] Chat-to-case creation with context preservation
- [x] Basic access control through RLS
- [x] Case claiming functionality
  - [x] Database updates for assignment
  - [x] UI for claiming in case management
  - [x] Real-time updates on claim status
- [x] AI-to-Staff handoff
  - [x] Detect staff first access
  - [x] Disable AI on handoff
  - [x] Transition messaging
  - [x] Message routing updates
- [x] Access verification
  - [x] Verify chat access with case assignment
  - [x] Update useChat hook with access checks
  - [x] Handle access state transitions

## Database Changes Needed
1. Link Conversations to Cases:
```sql
alter table medical_conversations
add column case_id uuid references cases(id),
add column can_create_case boolean default true;
```

2. Enhanced Case Metadata:
```typescript
interface CaseMetadata {
  source: 'chat' | 'direct' | 'emergency';
  chat_summary?: string;
  key_symptoms?: string[];
  duration?: string;
  severity?: string;
  ai_confidence?: number;
  handoff_reason?: string;
  clinical_details?: {
    progression?: string;
    impact_on_daily_life?: string;
    previous_treatments?: string[];
    medical_history?: string[];
    risk_factors?: string[];
  };
  patient_context?: {
    treatment_preferences?: string[];
    access_to_care?: string;
    support_system?: string;
  };
}
```

## Implementation Phases

### Phase 1: Core AI Enhancement ✅
- [x] Extend context gathering to 5 messages
- [x] Implement confidence scoring
- [x] Add structured data extraction
- [x] Create test provider responses

### Phase 2: Chat-to-Case Flow
- [x] Add case creation triggers in chat
- [x] Implement chat summary generation
- [x] Create case metadata extraction
- [x] Add patient consent flow

### Phase 3: Provider Integration
- [x] Add chat status to case metadata (needs_response, active, completed)
- [x] Add chat filtering in case management
- [x] Create chat status indicators and quick access
- [ ] Build split-panel case/chat interface
  - Left panel: Case details, history, metadata
  - Right panel: Chat interface
  - Preserves context during conversation
  - NOTE: Components built but integration testing needed for:
    - URL parameter handling
    - Panel toggle persistence
    - Case list chat button
    - Complete navigation flow
- [x] Implement provider notification system
  - [x] Database schema and functions
  - [x] Real-time notifications for new messages
  - [x] Configurable notification preferences
  - [x] Priority-based notification routing
  - [x] Notification grouping and batching
  - [x] Multi-channel delivery (in-app, email, browser)
  - [ ] Integration with chat and case systems
- [ ] Add real-time chat status updates
  - [ ] Provider typing indicators
  - [ ] Message read receipts
  - [ ] Online/offline presence
  - [ ] Chat activity timeline

### Phase 4: Emergency Handling
- [ ] Add emergency detection
- [ ] Create escalation workflow
- [ ] Implement urgent provider alerts
- [ ] Add emergency resource suggestions

## End Goals
- Seamless progression from chat to case
- Clear handoff between AI and providers
- Complete context preservation
- Appropriate access controls
- Emergency situation handling
- Resolution tracking (appointment/referral)

## Interface Design
### Split-Panel Layout
```
+------------------+------------------+
|                  |                  |
|   Case Details   |                  |
|   - Status       |    Chat Panel    |
|   - History      |                  |
|   - Metadata     |                  |
|   - Documents    |                  |
|                  |                  |
+------------------+------------------+
```

### Key Features
- Case context always visible during chat
- Easy reference to patient history
- Quick access to case management tools
- Real-time status updates
- Efficient screen space usage

### Navigation
- Chat panel can be toggled via:
  1. URL parameter (?panel=chat)
  2. Chat button in case list
  3. Panel toggle in case view
- Panel state persists in URL for sharing/bookmarking