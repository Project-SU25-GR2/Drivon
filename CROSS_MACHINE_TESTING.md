# Cross-Machine WebSocket Testing Guide

## Overview
This guide explains how to test WebSocket communication between different machines for the Drivon messaging system.

## Prerequisites
1. Backend server running on one machine (e.g., Machine A)
2. Frontend running on multiple machines (e.g., Machine A and Machine B)
3. Both machines can access the backend server via network

## Setup Instructions

### 1. Backend Configuration
The backend is already configured to allow cross-origin WebSocket connections:
- WebSocketConfig allows all origins with `setAllowedOriginPatterns("*")`
- SecurityConfig permits WebSocket endpoints (`/ws/**`, `/topic/**`, `/user/**`, `/app/**`)

### 2. Frontend Configuration
The frontend automatically detects the backend URL based on the current hostname:
- Uses `window.location.hostname` to get the current machine's IP/hostname
- Connects to backend on port 8080
- WebSocket URL: `http://{hostname}:8080/ws`

### 3. Testing Steps

#### Step 1: Start Backend Server
On Machine A (backend server):
```bash
cd backend
./mvnw spring-boot:run
```

#### Step 2: Start Frontend on Multiple Machines
On each machine (including Machine A):
```bash
cd frontend
npm start
```

#### Step 3: Test WebSocket Connection
1. Open browser on each machine
2. Navigate to `http://{machine-ip}:3000/test-connection`
3. Login with different user accounts
4. Click "Test WebSocket Connection" button
5. Verify connection status shows "Connected"

#### Step 4: Test Message Sending
1. On Machine A: Login as User A
2. On Machine B: Login as User B
3. Send messages between users
4. Verify messages appear immediately on both machines

## Troubleshooting

### Common Issues

#### 1. WebSocket Connection Failed
**Symptoms:** "WebSocket Connection Error" in test results
**Solutions:**
- Check if backend server is running on Machine A
- Verify both machines can access `http://{machine-a-ip}:8080`
- Check firewall settings on Machine A
- Ensure backend allows all origins in WebSocketConfig

#### 2. Messages Not Received
**Symptoms:** Messages sent but not received on other machine
**Solutions:**
- Check browser console for WebSocket errors
- Verify user IDs are correct
- Check backend logs for message processing errors
- Ensure both users are logged in and WebSocket connected

#### 3. CORS Errors
**Symptoms:** CORS errors in browser console
**Solutions:**
- Verify SecurityConfig allows all origins
- Check if backend is accessible from frontend machine
- Ensure proper CORS headers are set

### Debug Commands

#### Backend Logs
Check backend console for:
- WebSocket connection logs
- Message processing logs
- Error logs

#### Frontend Console
Check browser console for:
- WebSocket connection status
- Message sending/receiving logs
- Error messages

#### Test Endpoints
Use these endpoints to test:
- `GET /api/websocket/test/{userId}` - Send test message to user
- `GET /api/test` - Test API connection

## Network Configuration

### Firewall Settings
Ensure port 8080 is open on Machine A:
```bash
# Windows
netsh advfirewall firewall add rule name="Backend Server" dir=in action=allow protocol=TCP localport=8080

# Linux
sudo ufw allow 8080
```

### IP Address Configuration
- Use machine's actual IP address, not localhost
- Example: `http://192.168.1.100:8080` instead of `http://localhost:8080`

## Performance Considerations
- WebSocket connections are persistent
- Messages are sent in real-time
- Connection automatically reconnects if lost
- Maximum 5 reconnection attempts with 5-second delays

## Security Notes
- WebSocket connections are not encrypted (HTTP/WS)
- For production, use HTTPS/WSS
- User authentication is handled via JWT tokens
- Messages are validated on backend before processing 