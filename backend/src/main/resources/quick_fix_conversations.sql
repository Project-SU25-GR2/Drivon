-- Quick fix for duplicate conversations
USE car_rental_system2;

-- Show current state
SELECT 'Current conversations:' as info;
SELECT * FROM conversations ORDER BY conversation_id;

SELECT 'Current messages:' as info;
SELECT * FROM messages ORDER BY conversation_id;

-- Delete duplicate conversations (keep the first one)
DELETE c1 FROM conversations c1
INNER JOIN conversations c2 
WHERE c1.conversation_id > c2.conversation_id
AND (
    (c1.user1_id = c2.user1_id AND c1.user2_id = c2.user2_id) OR
    (c1.user1_id = c2.user2_id AND c1.user2_id = c2.user1_id)
);

-- Show result after cleanup
SELECT 'After cleanup - conversations:' as info;
SELECT * FROM conversations ORDER BY conversation_id;

-- Note: This will leave orphaned messages and user_conversations
-- You may need to manually clean those up or run the full cleanup script 