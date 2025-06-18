-- Check current state of conversations and messages
USE car_rental_system2;

-- Check conversations
SELECT 'Current conversations:' as info;
SELECT 
    conversation_id,
    user1_id,
    user2_id,
    created_at,
    CONCAT(user1_id, '-', user2_id) as user_pair
FROM conversations 
ORDER BY conversation_id;

-- Check for duplicate user pairs
SELECT 'Duplicate user pairs:' as info;
SELECT 
    user1_id,
    user2_id,
    COUNT(*) as count
FROM conversations
GROUP BY user1_id, user2_id
HAVING COUNT(*) > 1;

-- Check messages
SELECT 'Messages by conversation:' as info;
SELECT 
    conversation_id,
    COUNT(*) as message_count,
    MIN(sent_at) as first_message,
    MAX(sent_at) as last_message
FROM messages
GROUP BY conversation_id
ORDER BY conversation_id;

-- Check user_conversations
SELECT 'User conversations:' as info;
SELECT 
    user_id,
    conversation_id,
    last_seen_message_id,
    is_deleted,
    joined_at
FROM user_conversations
ORDER BY conversation_id, user_id;

-- Check for orphaned messages (messages without conversation)
SELECT 'Orphaned messages:' as info;
SELECT m.*
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.conversation_id
WHERE c.conversation_id IS NULL;

-- Check for orphaned user_conversations (user_conversations without conversation)
SELECT 'Orphaned user_conversations:' as info;
SELECT uc.*
FROM user_conversations uc
LEFT JOIN conversations c ON uc.conversation_id = c.conversation_id
WHERE c.conversation_id IS NULL; 