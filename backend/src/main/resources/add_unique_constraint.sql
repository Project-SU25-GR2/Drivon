-- Add unique constraint to prevent duplicate conversations
USE car_rental_system2;

-- First, clean up any existing duplicates
DELETE c1 FROM conversations c1
INNER JOIN conversations c2 
WHERE c1.conversation_id > c2.conversation_id
AND (
    (c1.user1_id = c2.user1_id AND c1.user2_id = c2.user2_id) OR
    (c1.user1_id = c2.user2_id AND c1.user2_id = c2.user1_id)
);

-- Add unique constraint on user1_id and user2_id
ALTER TABLE conversations 
ADD UNIQUE KEY unique_user_pair (user1_id, user2_id);

-- Also add reverse constraint to catch cases where user order is swapped
-- We'll handle this in the application logic instead

-- Show the result
SELECT 'Conversations after cleanup:' as info;
SELECT * FROM conversations ORDER BY conversation_id;

SELECT 'Unique constraint added successfully!' as result; 