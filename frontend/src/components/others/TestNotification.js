import React, { useState } from 'react';
import { createNotification } from '../../api/notification';
import { showErrorToast, showSuccessToast } from '../toast/notification';

const TestNotification = () => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('SYSTEM');
  const [targetType, setTargetType] = useState('ALL_USERS');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setMessage('Vui lòng nhập nội dung');
      showErrorToast('Please enter notification content');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      await createNotification(content, type, targetType);

      setMessage('Thông báo đã được gửi thành công!');
      showSuccessToast('Notification sent successfully!');
      setContent('');
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('Có lỗi xảy ra khi gửi thông báo');
      showErrorToast('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Test Gửi Thông Báo</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Nội dung:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung thông báo..."
            rows="4"
            style={{ width: '100%', padding: '10px' }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label>Loại:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="SYSTEM">Hệ thống</option>
              <option value="PROMO">Khuyến mãi</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label>Đối tượng:</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="ALL_USERS">Tất cả người dùng</option>
              <option value="OWNER_ONLY">Chỉ chủ xe</option>
            </select>
          </div>
        </div>

        {message && (
          <div style={{ 
            padding: '10px', 
            borderRadius: '4px',
            backgroundColor: message.includes('thành công') ? '#d4edda' : '#f8d7da',
            color: message.includes('thành công') ? '#155724' : '#721c24'
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
          {loading ? 'Đang gửi...' : 'Gửi thông báo'}
        </button>
      </form>
    </div>
  );
};

export default TestNotification; 