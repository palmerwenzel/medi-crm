# Implementation Workflow
Goal: Execute the planned implementation while maintaining code quality and documentation.

## Implementation Process Guidelines

### Setup Phase
- Verify all dependencies are installed and configured
- Create necessary files and directory structure
- Set up initial boilerplate code
- Configure any required environment variables or settings

### Core Development
- Follow an iterative approach:
  1. Implement smallest complete functional unit
  2. Test the implementation
  3. Document any deviations from plan
  4. Refactor if needed
  5. Move to next unit

### UI-Specific Guidelines
- Start with component structure before styling
- Implement base functionality before animations
- Build desktop-first, then add responsive breakpoints
- Implement loading and error states early
- Document component props and usage patterns

### Backend-Specific Guidelines
- Start with data models and validation
- Implement core business logic
- Add error handling and logging
- Document API endpoints and payload structures

### Integration Points
- Document any API changes or new requirements
- Verify error handling across boundaries

### Quality Assurance During Development
- Maintain TypeScript type safety
- Follow established code style guidelines
- Document complex logic with comments

Complete implementation following these guidelines, documenting progress and decisions in either `ui-workflow.md` or `backend-workflow.md`. Use the checkpoints defined in the workflow template to track progress.
