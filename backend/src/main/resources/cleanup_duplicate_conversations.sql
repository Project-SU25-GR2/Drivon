-- Script to clean up duplicate conversations
USE car_rental_system2;

-- First, let's see what duplicate conversations exist
SELECT 
    'Duplicate conversations found:' as info;
    
SELECT 
    c1.conversation_id as conv1_id,
    c1.user1_id as conv1_user1,
    c1.user2_id as conv1_user2,
    c2.conversation_id as conv2_id,
    c2.user1_id as conv2_user1,
    c2.user2_id as conv2_user2
FROM conversations c1
JOIN conversations c2 ON c1.conversation_id < c2.conversation_id
WHERE 
    (c1.user1_id = c2.user1_id AND c1.user2_id = c2.user2_id) OR
    (c1.user1_id = c2.user2_id AND c1.user2_id = c2.user1_id);

-- Count messages in each conversation
SELECT 
    'Messages count per conversation:' as info;
    
SELECT 
    conversation_id,
    COUNT(*) as message_count
FROM messages
GROUP BY conversation_id
ORDER BY conversation_id;

-- Strategy: Keep the conversation with more messages, or the older one if equal
-- First, let's identify which conversations to keep and which to delete

-- Create a temporary table to store conversations to delete
CREATE TEMPORARY TABLE conversations_to_delete AS
SELECT 
    c1.conversation_id
FROM conversations c1
JOIN conversations c2 ON c1.conversation_id < c2.conversation_id
WHERE 
    (c1.user1_id = c2.user1_id AND c1.user2_id = c2.user2_id) OR
    (c1.user1_id = c2.user2_id AND c1.user2_id = c2.user1_id)
AND (
    -- Keep the conversation with more messages
    (SELECT COUNT(*) FROM messages WHERE conversation_id = c1.conversation_id) < 
    (SELECT COUNT(*) FROM messages WHERE conversation_id = c2.conversation_id)
    OR
    -- If equal messages, keep the older conversation
    ((SELECT COUNT(*) FROM messages WHERE conversation_id = c1.conversation_id) = 
     (SELECT COUNT(*) FROM messages WHERE conversation_id = c2.conversation_id)
     AND c1.conversation_id > c2.conversation_id)
);

-- Show what will be deleted
SELECT 
    'Conversations to be deleted:' as info;
    
SELECT * FROM conversations_to_delete;

-- Move messages from conversations to be deleted to the conversation to keep
-- This is a complex operation, so we'll do it step by step

-- First, let's create a mapping of which conversation to move messages to
CREATE TEMPORARY TABLE conversation_mapping AS
SELECT 
    c1.conversation_id as from_conversation_id,
    c2.conversation_id as to_conversation_id
FROM conversations c1
JOIN conversations c2 ON c1.conversation_id < c2.conversation_id
WHERE 
    (c1.user1_id = c2.user1_id AND c1.user2_id = c2.user2_id) OR
    (c1.user1_id = c2.user2_id AND c1.user2_id = c2.user1_id)
AND c1.conversation_id IN (SELECT conversation_id FROM conversations_to_delete);

-- Show the mapping
SELECT 
    'Conversation mapping (from -> to):' as info;
    
SELECT * FROM conversation_mapping;

-- Update messages to point to the conversation to keep
UPDATE messages m
JOIN conversation_mapping cm ON m.conversation_id = cm.from_conversation_id
SET m.conversation_id = cm.to_conversation_id;

-- Update user_conversations to point to the conversation to keep
UPDATE user_conversations uc
JOIN conversation_mapping cm ON uc.conversation_id = cm.from_conversation_id
SET uc.conversation_id = cm.to_conversation_id;

-- Delete the duplicate conversations
DELETE FROM conversations 
WHERE conversation_id IN (SELECT conversation_id FROM conversations_to_delete);

-- Clean up temporary tables
DROP TEMPORARY TABLE IF EXISTS conversations_to_delete;
DROP TEMPORARY TABLE IF EXISTS conversation_mapping;

-- Verify the cleanup
SELECT 
    'After cleanup - conversations:' as info;
    
SELECT * FROM conversations ORDER BY conversation_id;

SELECT 
    'After cleanup - messages count per conversation:' as info;
    
SELECT 
    conversation_id,
    COUNT(*) as message_count
FROM messages
GROUP BY conversation_id
ORDER BY conversation_id;

SELECT 
    'After cleanup - user_conversations:' as info;
    
SELECT * FROM user_conversations ORDER BY conversation_id, user_id; 