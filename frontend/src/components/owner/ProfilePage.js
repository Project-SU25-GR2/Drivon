import React, { useState } from "react";
import "../css/ProfilePage.css";

const ProfilePage = ({ user }) => {
  // Cho phép chỉnh sửa address, bankAccount và bankName
  const [editInfo, setEditInfo] = useState({
    address: user?.address || "",
    bankAccount: user?.bankAccount || "",
    bankName: user?.bankName || "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lưu lại address, bankAccount, bankName vào localStorage (hoặc gọi API nếu có)
    const updatedUser = { ...user, ...editInfo };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
    window.location.reload(); // reload để cập nhật thông tin trên toàn app
  };

  return (
    <div className="owner-content-page">
      <div className="page-header">
        <h2>Profile</h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Info"}
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <div className="info-group">
            <label>Full Name</label>
            <p>{user?.fullName || ""}</p>
          </div>
          <div className="info-group">
            <label>Email</label>
            <p>{user?.email || ""}</p>
          </div>
        </div>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={editInfo.address}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Bank Account</label>
              <input
                type="text"
                name="bankAccount"
                value={editInfo.bankAccount}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={editInfo.bankName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-success">
              Save Info
            </button>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <label>Address</label>
              <p>
                {user?.address || (
                  <span style={{ color: "gray" }}>Chưa cập nhật</span>
                )}
              </p>
            </div>
            <div className="info-group">
              <label>Bank Account</label>
              <p>
                {user?.bankAccount || (
                  <span style={{ color: "gray" }}>Chưa cập nhật</span>
                )}
              </p>
            </div>
            <div className="info-group">
              <label>Bank Name</label>
              <p>
                {user?.bankName || (
                  <span style={{ color: "gray" }}>Chưa cập nhật</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
