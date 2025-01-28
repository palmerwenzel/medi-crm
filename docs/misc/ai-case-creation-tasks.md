# AI Case Creation Implementation Tasks

## 🎯 Critical Path: Conversation to Case Pipeline

### Current Flow Status
1. ✅ User can have conversation with AI
   - Chat interface works
   - Basic message processing
   - State management

2. 🟨 AI Data Extraction (Blocking Issues)
   - ❌ Extraction prompt needs immediate fix
     - Current prompt is too basic
     - Not capturing all required case fields
   - ❌ Extracted data not properly mapped to case creation
     - Need to ensure extracted fields match case requirements

3. ✅ Case Creation from Data
   - Case creation function works
   - Consent handling exists
   - Basic validation present

### Immediate Tasks (Critical Path Only)
1. [ ] Fix AI Extraction Prompt
   - Update prompt to extract minimum required case fields:
     - Chief complaint
     - Duration
     - Severity
     - Urgency indicators
   - Ensure JSON structure matches our types

2. [ ] Connect Extraction to Case Creation
   - Verify data mapping between extraction and case creation
   - Add basic error handling for missing fields
   - Test end-to-end flow

Once these are working, we can move on to enhancements.

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

1. [ ] Database Schema
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
     confidence_score?: number; // For AI assessments
     notes?: string; // Optional provider notes
     status: 'active' | 'superseded';
   }
   ```

2. [ ] Access Control
   - Staff/Admin: Full CRUD access
   - Patients: Read-only access
   - AI: Create initial assessments

3. [ ] Integration Points
   - [ ] Update AI extraction to create assessments
   - [ ] Add provider UI for assessment management
   - [ ] Implement assessment history viewing
   - [ ] Add assessment update notifications

4. [ ] Activity Tracking
   - Add new activity types:
     - `assessment_added`
     - `assessment_updated`
   - Track assessment changes in case history

### Implementation Order
1. [ ] Create database table and migrations
2. [ ] Add validation schemas
3. [ ] Update AI extraction pipeline
4. [ ] Implement provider assessment UI
5. [ ] Add activity tracking
6. [ ] Create assessment viewing components

## Implementation Tasks

### 1. AI Data Extraction Enhancement
🟨 Partial Implementation:
- 🟨 Basic `extractStructuredData` function exists but needs enhancement
  - ✅ Basic JSON extraction
  - ❌ Comprehensive medical data extraction
  - ❌ Field-level confidence scoring
- 🟨 Medical information prompts
  - ✅ Basic extraction prompt
  - ❌ Detailed medical context prompts
  - ❌ Progressive information gathering
- 🟨 Data validation
  - ✅ Basic JSON parsing
  - ❌ Type validation
  - ❌ Medical data validation
- 🟨 Confidence scoring
  - ✅ Overall confidence score
  - ❌ Field-level confidence
  - ❌ Uncertainty handling

Required Improvements:
- [ ] Enhance extraction prompt with medical context
  - Add symptom categorization
  - Include medical terminology mapping
  - Add temporal information extraction
- [ ] Implement field-level validation
  - Add Zod schemas for each field
  - Validate against medical terminology
  - Handle partial/uncertain data
- [ ] Add confidence scoring system
  - Per-field confidence scores
  - Confidence thresholds
  - Uncertainty indicators
- [ ] Improve error handling
  - Graceful degradation
  - Partial data handling
  - Recovery strategies

### 2. Case Creation Integration
✅ Most functionality exists:
- ✅ Transformation layer (in case-from-chat.ts)
  - Chat summary generation
  - Structured data extraction
  - Priority mapping
- ✅ Case creation action
  - Consent handling
  - Metadata preservation
  - Error handling
- ✅ Validation checks
  - Required field validation
  - Confidence scoring
  - Missing info detection
- ✅ Basic rollback (error handling)

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