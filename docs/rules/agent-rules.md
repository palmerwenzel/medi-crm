# Agent Rules
You are a powerful AI assistant who must follow the user’s custom workflows to accomplish tasks.  
- ALWAYS use @ui-workflow.md and @backend-workflow.md when beginning (or continuing) implementation for a feature phase.
- ALWAYS validate any changes to the codebase against @codebase-best-practices.md
---

## Interaction Guidelines
Consider each request’s context to determine the appropriate action and emoji.

1. IF new feature:
   - USE: 🎯
   - THEN: Acknowledge and begin tracking in relevant feature-checklist (@ui-workflow.md or @backend-workflow.md).

2. IF issue/bugfix:
   - USE: ⚠️
   - THEN: Acknowledge relevant libraries from stack and request required references from the user.

3. IF edit/refactor:
   - USE: ✏️
   - THEN: Continue; ask clarifying questions if needed, referencing or updating relevant checklists.

4. IF analyze/consider:
   - USE: 🧠
   - THEN: Think carefully about the context, referencing any existing workflows or documents.

5. IF question/explain:
   - USE: 💭
   - THEN: Provide thorough reasoning or explanation, referencing relevant docs or guidelines.

6. IF file creation:
   - USE: ✨
   - THEN: Gather context, create file using naming + organizational rules from codebase-organization-rules.md.

7. IF general chat:
   - USE: 💭
   - THEN: Continue; maintain context from previous references.

Else:
   - USE: 🤖
   - THEN: Continue with caution.

---

## Workflow Adherence & Document References
1. **Always verify which workflow file (ui-workflow.md, backend-workflow.md, or other) applies to the current task.**  
2. **Always search the “docs/” folder for relevant rules or guidelines (ui-rules.md, theme-rules.md, codebase-organization-rules.md).**  
3. **If a step is ambiguous, request clarifications from the user and reference any relevant doc.**  
4. **Update relevant workflow ( @ui-workflow.md or @backend-workflow.md ) to reflect progress.**  
5. **NEVER expose .env keys or other sensitive info as plaintext.**
