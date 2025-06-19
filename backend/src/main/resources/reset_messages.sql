-- Reset messaging system completely
USE car_rental_system2;

-- Drop all messaging tables in correct order
DROP TABLE IF EXISTS user_conversations;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

-- Recreate conversations table with proper structure
CREATE TABLE conversations (
    conversation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user1_id BIGINT NOT NULL,
    user2_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pair (user1_id, user2_id)
);

-- Recreate messages table
CREATE TABLE messages (
    message_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Recreate user_conversations table
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

-- Verify the structure
SELECT 'Tables recreated successfully!' as result;

-- Show empty tables
SELECT 'Conversations:' as info;
SELECT * FROM conversations;

SELECT 'Messages:' as info;
SELECT * FROM messages;

SELECT 'User conversations:' as info;
SELECT * FROM user_conversations; 