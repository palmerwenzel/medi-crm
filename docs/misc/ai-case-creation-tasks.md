# AI Case Creation Implementation Tasks

## 🎯 Critical Path: Conversation to Case Pipeline

### Current Flow Status
1. ✅ User can have conversation with AI
   - Chat interface works
   - Basic message processing
   - State management

### Recent Changes
1. ✅ Architectural Updates
   - Moved from metadata-based to structured case assessments
   - Removed confidence_score from database (now internal AI tool)
   - Enhanced type system implementation
   - Improved case creation with metadata handling

2. ✅ AI Data Extraction
   - ✅ Enhanced extraction prompt with medical context
     - Added SOAP note format
     - Improved clinical detail capture
     - Added internal confidence tracking
   - ✅ Connected extraction to case creation
     - Added validation
     - Enhanced error handling
     - Improved logging

3. ✅ Case Creation from Data
   - Case creation function works
   - Consent handling exists
   - Basic validation present
   - Added comprehensive logging

4. ✅ Case Assessment System
   - Added schema validation
   - Enhanced error handling
   - Added performance tracking
   - Implemented assessment lifecycle management

### Immediate Tasks (Critical Path Only)
1. [ ] Enhance Provider UI
   - Add assessment management interface
   - Show assessment history
   - Enable assessment updates
   - Display confidence indicators

2. [ ] Add Testing Framework
   - Unit tests for extraction
   - Integration tests for case creation
   - End-to-end conversation tests
   - Performance benchmarks

## Existing Infrastructure

### ✅ Existing Components
1. OpenAI Integration
   - Server-side OpenAI client
   - Chat completion endpoints
   - Message processing functionality
   - Triage decision-making capability

2. Data Structures
   - AI-extracted medical data types
   - Chat message handling
   - Medical information metadata

3. API Routes
   - Chat endpoint with error handling
   - Response formatting

## New Case Assessment System

### Overview
Instead of using metadata for AI-extracted medical information, we'll create a dedicated `case_assessment` table. This allows:
- Multiple assessments per case (AI, provider updates)
- Clear audit trail
- Structured querying
- Role-based access control
- Assessment versioning

### Required Components

1. ✅ Database Schema
   ```typescript
   interface CaseAssessment {
     id: string;
     case_id: string;
     created_at: string;
     created_by: string;
     created_by_type: 'ai' | 'staff' | 'admin';
     key_symptoms: string[];
     recommended_specialties: string[];
     urgency_indicators: string[];
     notes?: string; // Optional provider notes
     status: 'active' | 'superseded';
   }
   ```

2. ✅ Access Control
   - Staff/Admin: Full CRUD access
   - Patients: Read-only access
   - AI: Create initial assessments

3. [ ] Integration Points
   - [ ] Update AI extraction to create assessments
   - [ ] Add provider UI for assessment management
   - [ ] Implement assessment history viewing
   - [ ] Add assessment update notifications

4. ✅ Activity Tracking
   - Add new activity types:
     - `assessment_added`
     - `assessment_updated`
   - Track assessment changes in case history

### Implementation Order
1. ✅ Create database table and migrations
2. ✅ Add validation schemas
3. [ ] Update AI extraction pipeline
4. [ ] Implement provider assessment UI
5. ✅ Add activity tracking
6. [ ] Create assessment viewing components

## Implementation Tasks

### 1. AI Data Extraction Enhancement
🟨 Partial Implementation:
- 🟨 Basic `extractStructuredData` function exists but needs enhancement
  - ✅ Basic JSON extraction
  - ❌ Comprehensive medical data extraction
  - ❌ Internal AI confidence tracking

Important Note: AI Implementation Details vs Domain Model
- AI confidence scores, uncertainty tracking, and other AI-specific metrics should:
  - Be kept internal to the AI implementation
  - Never be exposed in the domain model or stored in the database
  - Only be used for:
    - AI decision-making logic
    - Information gathering strategies
    - Internal AI performance monitoring
    - Informing staff through meaningful UI indicators (not raw scores)

Required Improvements:
1. [ ] Enhance extraction prompt with medical context
   - Add symptom categorization
   - Include medical terminology mapping
   - Add temporal information extraction
   - Keep AI confidence tracking internal

2. [ ] Implement internal AI validation
   - Add internal confidence scoring per field
   - Use scores to guide information gathering
   - Track uncertainty without exposing raw scores
   - Trigger follow-up questions when confidence is low

3. [ ] Improve error handling
   - Graceful degradation
   - Partial data handling
   - Recovery strategies
   - Clear error messages for users

4. [ ] Add AI monitoring
   - Log confidence scores for analysis
   - Track extraction quality metrics
   - Monitor decision accuracy
   - Keep all metrics internal

Implementation Guidelines:
- AI extraction should output clean, human-readable medical data
- Confidence scoring stays within AI service layer
- Domain types remain focused on medical information
- UI shows meaningful indicators, not raw AI metrics

### 2. Case Creation Integration
✅ Complete implementation:
- ✅ Transformation layer (in case-from-chat.ts)
  - Chat summary generation
  - Structured data extraction
  - Priority mapping
  - Comprehensive logging
- ✅ Case creation action
  - Consent handling
  - Metadata preservation
  - Error handling
  - Performance tracking
- ✅ Validation checks
  - Required field validation
  - Schema validation
  - Missing info detection
- ✅ Assessment creation
  - Initial AI assessment
  - Validation layer
  - Error recovery
  - Audit logging

Potential Enhancements:
- [ ] Add more sophisticated data validation
- [ ] Implement staged case creation
- [ ] Add case template system
- [ ] Enhance error recovery

### 3. Conversation Flow Management
✅ Most functionality exists:
- ✅ State machine (in llm-controller.ts)
  - Message counting
  - Information tracking
  - Decision thresholds
- ✅ Systematic data collection
  - Structured prompts
  - Missing info detection
  - Progressive information gathering
- ✅ Recovery mechanisms
  - Error handling
  - Confidence checks
  - Fallback responses

Potential Enhancements:
- [ ] Add conversation branching logic
- [ ] Implement conversation summarization
- [ ] Add conversation analytics
- [ ] Create conversation testing framework

### 4. Handoff System
✅ Most functionality exists:
- ✅ Handoff triggers and conditions (in chat-controller.ts)
- ✅ AI-to-human handoff logic (in llm-controller.ts)
- ✅ Handoff notification system (in notifications)
- ✅ Basic state management (HandoffStatus types)

Potential Enhancements:
- [ ] Add more sophisticated handoff routing rules
- [ ] Implement handoff analytics
- [ ] Add provider availability checking
- [ ] Create handoff SLA monitoring

### 5. Validation & Safety
- [ ] Implement multi-stage validation
- [ ] Add sensitive information detection
- [ ] Create audit logging system
- [ ] Implement rate limiting and abuse prevention

## Priority Order
1. AI Data Extraction Enhancement
2. Conversation Flow Management
3. Case Creation Integration
4. Validation & Safety
5. Handoff System

## Notes
- Each task should follow type-system-rules.md guidelines
- Maintain strict separation between AI processing and case creation logic
- Ensure all AI interactions are logged and auditable
- Follow existing codebase patterns for consistency 