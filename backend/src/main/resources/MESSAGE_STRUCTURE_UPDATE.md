# Message System Structure Update

## Overview
The message system has been updated from a direct sender-receiver model to a conversation-based model for better scalability and functionality.

## New Database Structure

### 1. Conversations Table
```sql
CREATE TABLE conversations (
    conversation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user1_id BIGINT NOT NULL,
    user2_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pair (user1_id, user2_id)
);
```

**Note:** The unique constraint is enforced at the application level by consistently ordering user IDs (smaller ID first) before creating conversations.

### 2. Messages Table (Updated)
```sql
CREATE TABLE messages (
    message_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### 3. User Conversations Table (New)
```sql
CREATE TABLE user_conversations (
    user_id BIGINT NOT NULL,
    conversation_id BIGINT NOT NULL,
    last_seen_message_id BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, conversation_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (last_seen_message_id) REFERENCES messages(message_id) ON DELETE SET NULL
);
```

## Key Changes

### Backend Changes

1. **New Entities:**
   - `Conversation.java` - Represents a conversation between two users
   - `UserConversation.java` - Tracks user participation in conversations
   - `UserConversationId.java` - Composite key for user_conversations table

2. **Updated Entities:**
   - `Message.java` - Now includes `conversation_id` instead of `receiver_id`
   - Removed `is_read` field (now tracked via `last_seen_message_id`)

3. **New Repositories:**
   - `ConversationRepository.java` - Manages conversations
   - `UserConversationRepository.java` - Manages user conversation relationships

4. **Updated Services:**
   - `MessageService.java` - Completely rewritten to handle conversation-based logic
   - Automatic conversation creation when users first message each other
   - Proper unread message counting based on `last_seen_message_id`

5. **Updated Controllers:**
   - `MessController.java` - Updated endpoints to work with conversation IDs
   - `WebSocketController.java` - Updated to handle new message structure

### Frontend Changes

1. **Updated Components:**
   - `Messages.js` - Updated to work with conversation-based API

2. **API Changes:**
   - `/api/messages/conversation/{userId1}/{userId2}` - Get messages between users
   - `/api/messages/conversations/{userId}` - Get user's conversations
   - `/api/messages/read/{userId}/{conversationId}` - Mark conversation as read

## Benefits of New Structure

1. **Better Performance:** Conversations are pre-created and cached
2. **Scalability:** Easier to add group conversations in the future
3. **Unread Tracking:** More accurate unread message counting
4. **Message History:** Better organization of message history
5. **Soft Delete:** Users can "leave" conversations without losing data

## Migration Notes

- The old `receiver_id` field has been replaced with `conversation_id`
- The `is_read` field has been replaced with `last_seen_message_id` tracking
- Conversations are automatically created when users first message each other
- All existing functionality is preserved with improved performance

## Troubleshooting

### Duplicate Conversations Error

If you encounter the error `query did not return a unique result: 2`, it means there are duplicate conversations in the database. This can happen during the migration or due to race conditions.

**Quick Fix:**
```bash
mysql -u your_username -p car_rental_system2 < quick_fix_conversations.sql
```

**Add Unique Constraint (Recommended):**
```bash
mysql -u your_username -p car_rental_system2 < add_unique_constraint.sql
```

**Full Cleanup (If needed):**
```bash
mysql -u your_username -p car_rental_system2 < cleanup_duplicate_conversations.sql
```

**Prevention:**
- The new database structure includes a unique constraint on (user1_id, user2_id)
- The application logic ensures consistent user ID ordering (smaller ID first)
- The updated code includes better error handling for race conditions
- Double-checking for existing conversations before creation

### Common Issues

1. **NonUniqueResultException:** Run the cleanup scripts above
2. **Duplicate entry for key 'conversations.unique_user_pair':** This is expected behavior - the constraint is working. The application will handle this automatically.
3. **Hibernate AssertionFailure with null id:** This can occur due to race conditions. Restart the application and try again.
4. **Orphaned Messages:** Messages may point to deleted conversations after cleanup
5. **WebSocket Connection Issues:** Ensure the WebSocket service is properly configured

### Complete Reset (If all else fails)

If you're experiencing persistent issues, you can completely reset the messaging system:

```bash
mysql -u your_username -p car_rental_system2 < reset_messages.sql
```

**Warning:** This will delete ALL existing conversations and messages. Only use this if you're okay with losing all messaging data.

## Testing

Use the `test_messages.sql`