import React, { useState, useEffect } from 'react';
import axios from 'axios';
import onlineStatusService from '../../services/OnlineStatusService';

const TestOnlineStatus = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [testUserId, setTestUserId] = useState('');
  const [userOnlineStatus, setUserOnlineStatus] = useState(false);
  const [serviceStatus, setServiceStatus] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    // Update service status every second
    const interval = setInterval(() => {
      setServiceStatus(onlineStatusService.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startHeartbeat = () => {
    if (currentUser) {
      onlineStatusService.startHeartbeat(currentUser.userId);
      alert('Heartbeat started for user: ' + currentUser.userId);
    } else {
      alert('Please login first');
    }
  };

  const stopHeartbeat = () => {
    onlineStatusService.stopHeartbeat();
    alert('Heartbeat stopped');
  };

  const getOnlineUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/online-status/online-users');
      setOnlineUsers(response.data.onlineUserIds);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const checkUserStatus = async () => {
    if (!testUserId) {
      alert('Please enter a user ID');
      return;
    }

    try {
      const isOnline = await onlineStatusService.checkUserOnlineStatus(parseInt(testUserId));
      setUserOnlineStatus(isOnline);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const markOffline = () => {
    if (currentUser) {
      onlineStatusService.markOffline();
      alert('User marked as offline');
    } else {
      alert('Please login first');
    }
  };

  const forceCleanup = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/online-status/force-cleanup');
      alert(`Force cleanup completed: ${response.data.cleanedCount} users marked as offline`);
      // Refresh online users list
      getOnlineUsers();
    } catch (error) {
      console.error('Error force cleanup:', error);
      alert('Error during force cleanup');
    }
  };

  const debugOnlineStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/online-status/debug');
      console.log('Debug Online Status:', response.data);
      alert(`Debug info logged to console. Total records: ${response.data.totalRecords}`);
    } catch (error) {
      console.error('Error getting debug info:', error);
      alert('Error getting debug info');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Online Status Test</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Current User</h3>
        {currentUser ? (
          <div>
            <p><strong>ID:</strong> {currentUser.userId}</p>
            <p><strong>Name:</strong> {currentUser.fullName}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
          </div>
        ) : (
          <p>Not logged in</p>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h3>Service Status</h3>
        <p><strong>Running:</strong> {serviceStatus.isRunning ? 'Yes' : 'No'}</p>
        <p><strong>Current User ID:</strong> {serviceStatus.currentUserId || 'None'}</p>
        <p><strong>Active:</strong> {serviceStatus.isActive ? 'Yes' : 'No'}</p>
        <p><strong>Cache Size:</strong> {serviceStatus.cacheSize || 0}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Heartbeat Controls</h3>
        <button 
          onClick={startHeartbeat}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Start Heartbeat
        </button>
        <button 
          onClick={stopHeartbeat}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Stop Heartbeat
        </button>
        <button 
          onClick={markOffline}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Mark Offline
        </button>
        <button 
          onClick={forceCleanup}
          style={{ padding: '8px 16px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Force Cleanup
        </button>
        <button 
          onClick={debugOnlineStatus}
          style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Debug Status
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Online Users</h3>
        <button 
          onClick={getOnlineUsers}
          style={{ marginBottom: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Get Online Users
        </button>
        <div>
          <strong>Online User IDs:</strong> {onlineUsers.length > 0 ? onlineUsers.join(', ') : 'None'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Check User Status</h3>
        <input
          type="number"
          placeholder="Enter User ID"
          value={testUserId}
          onChange={(e) => setTestUserId(e.target.value)}
          style={{ marginRight: '10px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button 
          onClick={checkUserStatus}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Check Status
        </button>
        <div style={{ marginTop: '10px' }}>
          <strong>Status:</strong> {userOnlineStatus ? 'Online' : 'Offline'}
        </div>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h3>Instructions</h3>
        <ol>
          <li>Login to start heartbeat for current user</li>
          <li>Open another browser/tab to test with different user</li>
          <li>Use "Get Online Users" to see who's online</li>
          <li>Use "Check User Status" to check specific user</li>
          <li>Close tab/browser to see user go offline after 30 seconds</li>
        </ol>
      </div>
    </div>
  );
};

export default TestOnlineStatus; 