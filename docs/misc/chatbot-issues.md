Analysis and Observations
From reviewing the provided code, there are several places where chat functionality could (and should) be wired up but appears to be incomplete or mismatched. Below are specific points of concern:
Missing or Incomplete "/api/chat/[conversationId]/messages" Route
In src/lib/services/chat-service.ts, the getMessages and sendMessage functions attempt to call:
• GET /api/chat/[conversationId]/messages?…
• POST /api/chat/[conversationId]/messages
However, the codebase only shows an implementation for “/api/chat/conversations/route.ts” and “/api/chat/route.ts”, while “src/app/api/chat/conversation/route.ts” is effectively empty.
This mismatch likely explains why messages are not being saved or fetched.
subscribeToConversation Function Not Found
The useChat hook references subscribeToConversation when establishing a real-time channel (subscribeToConversation(conversationId, …)).
This function is not defined (or not shown) anywhere in chat-service.ts or in the codebase snippets. If it is unimplemented, you won’t receive real-time messages or updates.
No Implementation for the “New Message” API
Because the POST route for a new message at /api/chat/[conversationId]/messages does not appear in the code, the sendMessage call in chat-service.ts will fail.
If it’s failing silently, you won’t see errors in the UI but also won’t see messages in the database.
Backend vs. Server Actions Duplication
There are server actions in src/lib/actions/chat.ts that also create conversations and insert messages (e.g., createConversation, sendMessage) via Supabase directly.
Meanwhile, the chat-service.ts is making fetch calls to /api/chat routes. This is not wrong, but if you’re mixing these two approaches, you must ensure consistent usage (server actions vs. REST fetch calls) so that messages actually get inserted one way or the other.
Potential RLS (Row-Level Security) Constraints
You have RLS policies on medical_messages and medical_conversations in your migrations. If your logged-in user JWT does not match the RLS condition (for “patient_id” or “assigned_staff_id”), insertion or fetching might silently fail.
Check the Supabase logs or the response errors to see if RLS is blocking message inserts.
Conversation vs. Messages Sync
You confirm that new conversations appear in the database, but messages do not. Since the conversation creation code is definitely being called, the primary culprit is likely the incomplete or missing messages route (or usage of the server action that never actually triggers).
---
Proposed Resolutions
Implement the “[conversationId]/messages” Route
Create a new file (for example: src/app/api/chat/[conversationId]/messages/route.ts) that handles GET (for message history) and POST (for new messages) requests.
Within that route, call the relevant server action or Supabase client logic to read/write messages from the medical_messages table.
Expose (or Implement) subscribeToConversation
In chat-service.ts, write a function to establish a Supabase Realtime channel that listens for inserts/updates on the medical_messages table for a given conversation_id.
Return the channel from that function, and use it in the useChat hook so that setMessages is updated on new or updated rows in real time.
Ensure the RLS Policies Allow the Insert/Select Calls
Verify that your roles (patient or staff or admin) match any RLS checks. With your existing policies, the user’s auth.uid() must match either the conversation’s patient_id (for a patient) or assigned_staff_id (for staff).
If your user’s role/ID mismatch is blocking inserts, consider temporarily disabling RLS or adjusting the policies to confirm the problem is not RLS-based.
Decide on a Single Approach (REST vs. Server Action)
If you’d like to use REST endpoints ("/api/chat/..."), confirm you are actually calling them in your front-end code.
If you’d like to rely on server actions from src/lib/actions/chat.ts, remove the fetch calls to /api/chat/... in chat-service.ts and call the server action directly.
Mixing them can work, but be consistent across each read/write path.
Check for Error Handling
In your useChat hook, if getMessages or sendMessage fails (for example with a 404 or 500), ensure you’re logging errors so you can see them in the console.
This will help confirm if the route is genuinely missing or if RLS is kicking in.
Implementing these changes should close the gap between newly created conversations and the corresponding messages. Once you have the [conversationId]/messages route (or updated server actions) in place and a real-time subscription function that actually listens on the messages table, you should be able to see synchronized conversations and message data as intended.