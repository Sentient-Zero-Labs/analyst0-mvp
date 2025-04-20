# Persistent Chat Implementation Checklist

## Backend Changes

### 1. Add Endpoint to Get Conversation by ID
- [x] Create a new endpoint in `charter_chat_controller.py` to get a specific conversation by ID

### 2. Add Conversation Title Generation
- [x] Update `CharterChatConversationModel` to include a title field
- [x] Add migration for the new title field
- [x] Add method in `CharterChatConversationService` to generate and update conversation title
- [x] Update `create_conversation` method to generate a title

### 3. Add Conversation Deletion
- [x] Add endpoint to delete a conversation
- [x] Add method in `CharterChatConversationService` to delete a conversation

## Frontend Changes

### 1. Update Chat Schema
- [x] Update chat schema to include conversation information
- [x] Add types for conversation list and individual conversations

### 2. Update Chat Service
- [x] Add method to fetch conversations list
- [x] Add method to fetch a specific conversation by ID
- [x] Add method to delete a conversation
- [x] Update chat mutation to include conversation ID

### 3. Create Conversation List Component
- [x] Create a new component to display a list of conversations
- [x] Add functionality to select a conversation
- [x] Add functionality to delete a conversation
- [x] Add "New Chat" button

### 4. Update Chat Page Component
- [x] Modify layout to include conversation list
- [x] Add state to track current conversation ID
- [x] Add local storage to persist current conversation ID
- [x] Add logic to load conversation messages

### 5. Update Chat Component
- [x] Modify Chat component to accept conversation ID and initial messages
- [x] Update chat mutation to include conversation ID when sending messages
- [x] Add loading state for conversation loading

## Testing
- [ ] Test creating new conversations
- [ ] Test loading existing conversations
- [ ] Test switching between conversations
- [ ] Test deleting conversations
- [ ] Test persistence across page refreshes
