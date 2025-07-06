import React, { useState, useEffect } from 'react';
import { getNotifications, getUnreadCount } from '../../api/notification';
import { showErrorToast } from '../toast/notification';

const DebugAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user and token from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
        showErrorToast('Error parsing user data');
      }
    }
    
    setToken(storedToken);
  }, []);

  const testNotificationsAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing notifications API...');
      const response = await getNotifications();
      console.log('Notifications response:', response);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Notifications API error:', error);
      setError(error.message || 'Unknown error');
      showErrorToast('Notifications API error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const testUnreadCountAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing unread count API...');
      const response = await getUnreadCount();
      console.log('Unread count response:', response);
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Unread count API error:', error);
      setError(error.message || 'Unknown error');
      showErrorToast('Unread count API error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Debug Authentication & API</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>User Information</h3>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Token</h3>
        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', wordBreak: 'break-all' }}>
          {token ? token.substring(0, 50) + '...' : 'No token found'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testNotificationsAPI}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Notifications API
        </button>
        
        <button 
          onClick={testUnreadCountAPI}
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Unread Count API
        </button>
      </div>

      {loading && (
        <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '10px' }}>
          Loading...
        </div>
      )}

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Notifications ({notifications.length})</h3>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '300px' }}>
          {JSON.stringify(notifications, null, 2)}
        </pre>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Unread Count</h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
          {unreadCount}
        </div>
      </div>
    </div>
  );
};

export default DebugAuth; 