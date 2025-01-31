# Medical Agent Essential Improvements

## Core Functionality
- [ ] Verify OPQRST implementation is complete and robust
- [ ] Add case creation capability
  - Required fields:
    - `category`: 'general' | 'followup' | 'prescription' | 'test_results' | 'emergency'
    - `description`: Detailed description from gathered medical info
    - `patient_id`: From conversation context
    - `priority`: 'low' | 'medium' | 'high' | 'urgent' (based on triage)
    - `status`: Starts as 'open'
    - `title`: Clear summary of chief complaint
  - Optional fields:
    - `assigned_to`: For staff assignment
    - `attachments`: For any relevant files
    - `department`: Based on medical context
    - `internal_notes`: For staff-only information
    - `metadata`: Additional structured data
  - Integration points:
    - Use existing `createCase` action from `src/lib/actions/cases.ts`
    - Trigger creation when sufficient OPQRST data gathered
    - Include triage decision in case metadata
- [ ] Add basic error messages for common failure cases
  - Network issues
  - Invalid responses
  - Timeout handling

## Testing
- [ ] Add test cases for complete OPQRST flow
- [ ] Add test cases for case creation
  - Test with minimum required fields
  - Test with all optional fields
  - Test error handling
- [ ] Verify structured output format
- [ ] Test error handling scenarios

## Documentation
- [ ] Document OPQRST implementation
- [ ] Document case creation logic and triggers
- [ ] Document expected data structure for case creation
- [ ] Add example flows

## Future Considerations
- Only if needed:
  - Additional medical protocols beyond OPQRST
  - Performance optimizations
  - Advanced error handling
  - Configuration options

The focus should be on:
1. Reliable information gathering using OPQRST
2. Clean data output for case creation
3. Basic error handling for good UX

Everything else is optimization that can be added if specific needs arise. 