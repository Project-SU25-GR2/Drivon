import React, { useState } from 'react';
import axios from 'axios';
import { getBackendUrl, getAuthHeader } from '../../api/notification';

const TestNotification = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      console.log('Testing authentication...');
      console.log('Auth header:', getAuthHeader());
      
      const response = await axios.get(`${getBackendUrl()}/api/notifications/test-auth`, {
        headers: getAuthHeader()
      });
      
      console.log('Auth test response:', response.data);
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Auth test error:', error.response?.data || error.message);
      setTestResult(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetNotifications = async () => {
    setLoading(true);
    try {
      console.log('Testing get notifications...');
      
      const response = await axios.get(`${getBackendUrl()}/api/notifications`, {
        headers: getAuthHeader()
      });
      
      console.log('Get notifications response:', response.data);
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Get notifications error:', error.response?.data || error.message);
      setTestResult(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUnreadCount = async () => {
    setLoading(true);
    try {
      console.log('Testing unread count...');
      
      const response = await axios.get(`${getBackendUrl()}/api/notifications/unread-count`, {
        headers: getAuthHeader()
      });
      
      console.log('Unread count response:', response.data);
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Unread count error:', error.response?.data || error.message);
      setTestResult(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    setTestResult(`
Token: ${token ? 'Present' : 'Missing'}
User Data: ${userData ? 'Present' : 'Missing'}
Token Value: ${token ? token.substring(0, 50) + '...' : 'N/A'}
User Data Value: ${userData ? JSON.stringify(JSON.parse(userData), null, 2) : 'N/A'}
    `);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Notification System Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={checkToken} style={{ marginRight: '10px' }}>
          Check Token & User Data
        </button>
        <button onClick={testAuth} style={{ marginRight: '10px' }}>
          Test Authentication
        </button>
        <button onClick={testGetNotifications} style={{ marginRight: '10px' }}>
          Test Get Notifications
        </button>
        <button onClick={testUnreadCount}>
          Test Unread Count
        </button>
      </div>

      {loading && <div style={{ color: 'blue' }}>Loading...</div>}
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {testResult || 'Click a button to test...'}
      </div>
    </div>
  );
};

export default TestNotification; 