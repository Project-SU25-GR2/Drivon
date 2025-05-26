import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = async () => {
    console.log('Fetching user profile...');
    if (user) {
      setEditedUser({ ...user });
      setLoading(false);
      setError(null);
    } else {
      setError('User data not available.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
    } else {
      setEditedUser({});
    }
    setLoading(false);
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      if (user) {
        setEditedUser({ ...user });
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSave = async () => {
    console.log('Saving user data:', editedUser);
    onUpdateUser(editedUser);
    setIsEditing(false);
    alert('Profile updated successfully (simulated)!');
  };

  const handleCancel = () => {
    if (user) {
      setEditedUser({ ...user });
    }
    setIsEditing(false);
  };

  const displayUser = user || editedUser;

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="profile-page-container">
      <h2>Thông tin người dùng</h2>
      {!isEditing ? (
        <div className="profile-details-box">
          <p className="profile-info-item"><strong>Họ và tên:</strong> {displayUser.fullName || 'N/A'}</p>
          <p className="profile-info-item"><strong>Email:</strong> {displayUser.email || 'N/A'}</p>
          <p className="profile-info-item"><strong>Số điện thoại:</strong> {displayUser.phone || 'N/A'}</p>
          <p className="profile-info-item"><strong>Địa chỉ:</strong> {displayUser.address || 'N/A'}</p>
          <button onClick={handleEditToggle} className="edit-profile-button">Chỉnh sửa Profile</button>
        </div>
      ) : (
        <div>
          <h3>Chỉnh sửa thông tin</h3>
          <div>
            <label htmlFor="fullName">Họ và tên:</label><br/>
            <input 
              type="text" 
              id="fullName"
              name="fullName"
              value={editedUser.fullName || ''} 
              onChange={handleInputChange} 
            /><br/>
          </div>
          <div>
            <label htmlFor="email">Email:</label><br/>
            <input 
              type="email" 
              id="email"
              name="email"
              value={editedUser.email || ''} 
              onChange={handleInputChange} 
              disabled={true}
              title="Email không thể thay đổi"
            /><br/>
          </div>
           <div>
            <label htmlFor="phone">Số điện thoại:</label><br/>
            <input 
              type="text" 
              id="phone"
              name="phone"
              value={editedUser.phone || ''} 
              onChange={handleInputChange} 
            /><br/>
          </div>
           <div>
            <label htmlFor="address">Địa chỉ:</label><br/>
            <textarea 
              id="address"
              name="address"
              value={editedUser.address || ''} 
              onChange={handleInputChange} 
            ></textarea><br/>
          </div>
          <button onClick={handleSave}>Lưu</button>
          <button onClick={handleCancel} style={{ marginLeft: '10px' }}>Hủy</button>
        </div>
      )}
       <div className="profile-actions-section">
         <h3 className="profile-actions-heading">Các thao tác khác</h3>
         <p><Link to="/change-password" className="profile-action-link">Đổi mật khẩu</Link></p>
         <p><Link to="/change-avatar" className="profile-action-link">Đổi ảnh đại diện</Link></p>
       </div>
    </div>
  );
};

export default ProfilePage; 