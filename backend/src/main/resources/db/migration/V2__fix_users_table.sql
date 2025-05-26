-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_verification;
DROP TABLE IF EXISTS users;

-- Create users table with correct structure
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(100),
    avatar_url TEXT,
    address TEXT,
    role ENUM('renter', 'owner', 'admin') DEFAULT 'renter',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user_verification table
CREATE TABLE user_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    otp_code VARCHAR(10),
    type ENUM('email', 'phone', 'reset_password'),
    expires_at DATETIME,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
); 