import React, { useState } from 'react';
import axios from 'axios';
import webSocketService from '../../services/WebSocketService';

const TestConnection = () => {
  const [testResult, setTestResult] = useState('');
  const [wsStatus, setWsStatus] = useState('Not connected');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const testApiConnection = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/test');
      setTestResult(`API Connection: ${response.data}`);
    } catch (error) {
      setTestResult(`API Connection Error: ${error.message}`);
    }
  };

  const testWebSocketConnection = async () => {
    if (!currentUser) {
      setTestResult('No user logged in');
      return;
    }

    try {
      // Test WebSocket connection
      setWsStatus('Connecting...');
      
      webSocketService.connect(currentUser.userId, () => {
        setWsStatus('Connected');
        
        // Subscribe to messages
        webSocketService.subscribe('messages', (message) => {
          console.log('Test received message:', message);
          setTestResult(`WebSocket Message Received: ${JSON.stringify(message)}`);
        });

        // Subscribe to errors
        webSocketService.subscribe('errors', (error) => {
          console.log('Test received error:', error);
          setTestResult(`WebSocket Error: ${JSON.stringify(error)}`);
        });

        // Test sending a message via API
        setTimeout(async () => {
          try {
            const response = await axios.get(`http://localhost:8080/api/websocket/test/${currentUser.userId}`);
            setTestResult(`WebSocket Test: ${response.data}`);
          } catch (error) {
            setTestResult(`WebSocket Test Error: ${error.message}`);
          }
        }, 1000);
      });
    } catch (error) {
      setWsStatus('Connection failed');
      setTestResult(`WebSocket Connection Error: ${error.message}`);
    }
  };

  const sendTestMessage = async () => {
    if (!currentUser) {
      setTestResult('No user logged in');
      return;
    }

    try {
      const testMessage = {
        sender_id: currentUser.userId,
        receiver_id: currentUser.userId, // Send to self for testing
        content: 'Test message from ' + new Date().toLocaleTimeString()
      };

      const success = webSocketService.sendMessage(testMessage);
      if (success) {
        setTestResult('Test message sent successfully');
      } else {
        setTestResult('Failed to send test message');
      }
    } catch (error) {
      setTestResult(`Send Test Message Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current User: {currentUser ? currentUser.email : 'Not logged in'}</h3>
        <h3>User ID: {currentUser ? currentUser.userId : 'N/A'}</h3>
        <h3>WebSocket Status: {wsStatus}</h3>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={testApiConnection} style={{ padding: '10px' }}>
          Test API Connection
        </button>
        
        <button onClick={testWebSocketConnection} style={{ padding: '10px' }}>
          Test WebSocket Connection
        </button>
        
        <button onClick={sendTestMessage} style={{ padding: '10px' }}>
          Send Test Message
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        minHeight: '100px',
        whiteSpace: 'pre-wrap'
      }}>
        <strong>Test Results:</strong>
        <br />
        {testResult || 'No tests run yet'}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Instructions for Cross-Machine Testing:</h4>
        <ol>
          <li>Make sure both machines can access the backend server</li>
          <li>Update the backend URL in frontend if needed</li>
          <li>Test WebSocket connection on both machines</li>
          <li>Send messages between different users on different machines</li>
        </ol>
      </div>
    </div>
  );
};

export default TestConnection; 