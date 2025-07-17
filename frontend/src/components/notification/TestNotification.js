import React, { useState } from 'react';
import { createNotification } from '../../api/notification';
import { showErrorToast, showSuccessToast } from './notification';

const TestNotification = () => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('SYSTEM');
  const [targetType, setTargetType] = useState('ALL_USERS');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setMessage('Please enter content');
      showErrorToast('Please enter notification content');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      await createNotification(content, type, targetType);

      setMessage('Notification sent successfully!');
      showSuccessToast('Notification sent successfully!');
      setContent('');
      // Call reload notification if available
      if (window.reloadNotifications) {
        window.reloadNotifications();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('An error occurred while sending notification');
      showErrorToast('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Test Send Notification</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter notification content..."
            rows="4"
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label>Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="SYSTEM">System</option>
              <option value="PROMO">Promotion</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label>Target:</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="ALL_USERS">All users</option>
              <option value="OWNER_ONLY">Car owners only</option>
            </select>
          </div>
        </div>

        {message && (
          <div style={{ 
            padding: '10px', 
            borderRadius: '4px',
            backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
            color: message.includes('successfully') ? '#155724' : '#721c24'
          }}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
};

export default TestNotification; 