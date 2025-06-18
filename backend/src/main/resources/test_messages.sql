-- Test script for new message structure
USE car_rental_system2;

-- Insert test users if they don't exist
INSERT IGNORE INTO users (user_id, email, full_name, role, status, email_verified) VALUES 
(1, 'test1@example.com', 'Test User 1', 'renter', 'active', 1),
(2, 'test2@example.com', 'Test User 2', 'owner', 'active', 1);

-- Test creating a conversation
INSERT INTO conversations (user1_id, user2_id) VALUES (1, 2);

-- Get the conversation ID
SET @conversation_id = LAST_INSERT_ID();

-- Insert user conversation records
INSERT INTO user_conversations (user_id, conversation_id) VALUES 
(1, @conversation_id),
(2, @conversation_id);

-- Insert test messages
INSERT INTO messages (conversation_id, sender_id, content) VALUES 
(@conversation_id, 1, 'Hello from user 1'),
(@conversation_id, 2, 'Hello from user 2'),
(@conversation_id, 1, 'How are you?'),
(@conversation_id, 2, 'I am fine, thank you!');

-- Test queries
SELECT 'Conversations:' as info;
SELECT * FROM conversations;

SELECT 'User Conversations:' as info;
SELECT * FROM user_conversations;

SELECT 'Messages:' as info;
SELECT * FROM messages;

SELECT 'Test conversation between users 1 and 2:' as info;
SELECT 
    m.message_id,
    m.content,
    m.sent_at,
    u.full_name as sender_name
FROM messages m
JOIN users u ON m.sender_id = u.user_id
WHERE m.conversation_id = @conversation_id
ORDER BY m.sent_at;

-- Test unread count for user 1
SELECT 'Unread messages for user 1:' as info;
SELECT COUNT(*) as unread_count
FROM messages m
WHERE m.conversation_id = @conversation_id 
AND m.sender_id != 1 
AND m.message_id > (
    SELECT COALESCE(uc.last_seen_message_id, 0) 
    FROM user_conversations uc 
    WHERE uc.user_id = 1 AND uc.conversation_id = @conversation_id
); 