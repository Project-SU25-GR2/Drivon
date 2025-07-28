import React, { useState, useEffect } from "react";
import "./ProfileOwner.css";
import { API_URL } from "../../api/configApi";
import axios from "axios";
import { showSuccessToast, showErrorToast } from '../notification/notification';
import { Modal } from 'antd';

const BANK_LIST = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Agribank",
  "Techcombank",
  "ACB",
  "MB Bank",
  "VPBank",
  "Sacombank",
  "MSB",
  "TPBank",
  "HDBank",
  "VIB",
  "DongA Bank",
  "Nam A Bank",
  "Viet Capital",
  "Shinhan Bank",
  "HSBC",
  "Woori Bank",
  "CIMB",
];

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=ececec&color=555&size=128";

const ProfileOwner = ({ user }) => {
  // Bank info
  const [editInfo, setEditInfo] = useState({ bankAccount: "", bankName: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [bankInfo, setBankInfo] = useState({ bankAccount: "", bankName: "" });
  const [error, setError] = useState("");

  // Quick stats
  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    rating: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Withdraw history
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  
  // Modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Fetch bank info
  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/owner-wallet/${user.userId}/bank`);
        if (res.data) {
          setBankInfo({
            bankAccount: res.data.accountNumber,
            bankName: res.data.bankName,
          });
        }
      } catch {
        setBankInfo({ bankAccount: "", bankName: "" });
      }
    };
    if (user?.userId) fetchBankInfo();
  }, [user]);

  // Fetch quick stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Total cars
        const carsRes = await axios.get(`${API_URL}/cars/owner/${user.userId}`);
        const totalCars = carsRes.data?.length ?? 0;
        // Active bookings
        const bookingsRes = await axios.get(`${API_URL}/bookings/owner/${user.userId}`);
        const activeBookings = (bookingsRes.data || []).filter(
          (b) => b.status && ["ongoing", "active"].includes(b.status.toLowerCase())
        ).length;
        // Rating
        const ratingRes = await axios.get(`${API_URL}/reviews/owner/${user.userId}`);
        const rating = ratingRes.data?.averageRating ?? null;
        setStats({ totalCars, activeBookings, rating });
      } catch {
        setStats({ totalCars: 0, activeBookings: 0, rating: null });
      } finally {
        setLoadingStats(false);
      }
    };
    if (user?.userId) fetchStats();
  }, [user]);

  // Fetch withdraw history
  useEffect(() => {
    const fetchWithdraws = async () => {
      try {
        const res = await axios.get(`${API_URL}/owner-withdraw/${user.userId}`);
        setWithdrawHistory(res.data || []);
      } catch {
        setWithdrawHistory([]);
      }
    };
    if (user?.userId) fetchWithdraws();
  }, [user]);

  // Handle edit
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditInfo((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[0-9]+$/.test(editInfo.bankAccount)) {
      setError("Bank Account must contain only numbers.");
      return;
    }
    try {
      const ownerId = user.userId;
      const payload = {
        ownerId,
        accountNumber: editInfo.bankAccount,
        bankName: editInfo.bankName,
      };
      await axios.post(`${API_URL}/owner-wallet/update-bank`, payload);
      setIsEditing(false);
      // Fetch the latest bank info after update
      const res = await axios.get(`${API_URL}/owner-wallet/${user.userId}/bank`);
      if (res.data) {
        setBankInfo({
          bankAccount: res.data.accountNumber,
          bankName: res.data.bankName,
        });
      }
    } catch (error) {
      alert("Failed to update bank info!");
    }
  };

  // Show confirmation modal
  const showConfirmModal = (requestId) => {
    setSelectedRequestId(requestId);
    setConfirmModalVisible(true);
  };

  // Handle sign confirmation
  const handleSign = async () => {
    if (!selectedRequestId) return;
    try {
      await axios.patch(`${API_URL}/owner-withdraw/${selectedRequestId}/sign`, { sign: true });
      setWithdrawHistory(his => his.map(w => w.requestId === selectedRequestId ? { ...w, sign: true } : w));
      showSuccessToast('Confirmed money receipt!');
      setConfirmModalVisible(false);
      setSelectedRequestId(null);
    } catch {
      showErrorToast('Confirmation failed!');
    }
  };

  // Simulate join date (should get from user if available)
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleString("en-US", { month: "long", year: "numeric" })
    : "January 2024";

  return (
    <div className="profile-page-container">
      <div className="profile-grid">
        {/* LEFT: Avatar, Name, Badge, Member since, Quick Stats */}
        <div className="profile-left">
          <div className="profile-card" style={{ textAlign: "center" }}>
            <img
              className="profile-avatar"
              src={user?.avatarUrl || DEFAULT_AVATAR}
              alt="avatar"
            />
            <div className="profile-name">{user?.fullName || ""}</div>
            <div className="verified-badge">
              {user?.role === "verify_owner" ? " Verified Owner" : " Owner"}
            </div>
            <div className="profile-member-since">
              Member since {memberSince}
            </div>
          </div>
          <div className="profile-card quick-stats">
            <div className="quick-stats-title">Quick Stats</div>
            {loadingStats ? (
              <div style={{ color: "#888", textAlign: "center" }}>Loading...</div>
            ) : (
              <ul className="quick-stats-list">
                <li className="quick-stats-item">
                  <span>Total Cars</span>
                  <span>{stats.totalCars}</span>
                </li>
                <li className="quick-stats-item">
                  <span>Active Bookings</span>
                  <span>{stats.activeBookings}</span>
                </li>
                <li className="quick-stats-item">
                  <span>Rating</span>
                  <span className="quick-stats-rating">
                    {stats.rating !== null && stats.rating > 0 ? (
                      <>
                        {stats.rating.toFixed(1)} <span style={{ color: "#f7b731" }}>★</span>
                      </>
                    ) : (
                      <span style={{ color: "#aaa" }}>N/A</span>
                    )}
                  </span>
                </li>
              </ul>
            )}
          </div>
        </div>
        {/* RIGHT: Personal Info, Banking Info */}
        <div className="profile-right">
          <div className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-title">Personal Information</div>
              <button
                className="edit-info-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Info"}
              </button>
            </div>
            <div className="profile-info-grid">
              <div className="profile-info-group">
                <span className="profile-info-label">Full Name</span>
                <span className="profile-info-value">{user?.fullName || ""}</span>
              </div>
              <div className="profile-info-group">
                <span className="profile-info-label">Email Address</span>
                <span className="profile-info-value">{user?.email || ""}</span>
              </div>
            </div>
          </div>
          <div className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-title">Banking Information</div>
            </div>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="form-group">
                  <label htmlFor="bankAccount">Bank Account</label>
                  <input
                    type="text"
                    name="bankAccount"
                    id="bankAccount"
                    value={editInfo.bankAccount}
                    onChange={handleChange}
                    required
                    minLength={8}
                    maxLength={16}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Please enter your Account Number (numbers only)"
                  />
                  <small>Please enter your Account Number (numbers only).</small>
                  {error && <div className="error">{error}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="bankName">Bank Name</label>
                  <select
                    name="bankName"
                    id="bankName"
                    value={editInfo.bankName}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select your bank
                    </option>
                    {BANK_LIST.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="edit-info-btn" style={{ background: '#43a047' }}>
                  Save Info
                </button>
              </form>
            ) : (
              <div className="profile-info-grid">
                <div className="profile-info-group">
                  <span className="profile-info-label">Bank Account</span>
                  <span className="profile-info-value">
                    {bankInfo.bankAccount || (
                      <span style={{ color: "gray" }}>Chưa cập nhật</span>
                    )}
                  </span>
                </div>
                <div className="profile-info-group">
                  <span className="profile-info-label">Bank Name</span>
                  <span className="profile-info-value">
                    {bankInfo.bankName || (
                      <span style={{ color: "gray" }}>Chưa cập nhật</span>
                    )}
                  </span>
                </div>
              </div>
            )}
            {/* Banking warning */}
            <div className="profile-banking-warning">
              <span style={{ fontSize: 18, marginRight: 6 }}>⚠️</span>
              Please ensure your banking information is accurate for payment processing.
            </div>
          </div>
          <div className="profile-section-card">
            <div className="profile-section-title">Withdrawal History</div>
            <table className="withdraw-history-table" style={{width: '100%', borderCollapse: 'collapse', marginTop: 12}}>
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Money Received</th>
                </tr>
              </thead>
              <tbody>
                {withdrawHistory.length === 0 ? (
                  <tr><td colSpan="5">No withdrawal requests yet.</td></tr>
                ) : withdrawHistory.map(w => (
                  <tr key={w.requestId}>
                    <td>{w.requestedAt ? new Date(w.requestedAt).toLocaleString('en-US') : ''}</td>
                    <td>{w.amount?.toLocaleString('en-US')} ₫</td>
                    <td>{w.status}</td>
                    <td>{w.note || ''}</td>
                    <td>
                      {w.sign ? (
                        <span style={{color: 'green', fontWeight: 600}}>Confirmed</span>
                      ) : w.status === 'completed' ? (
                        <button 
                          type="button" 
                          onClick={() => showConfirmModal(w.requestId)}
                          style={{
                            background: '#1890ff',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Confirm Receipt
                        </button>
                      ) : (
                        <span style={{color: '#999'}}>Not completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <Modal
        title="Confirm Money Receipt"
        open={confirmModalVisible}
        onOk={handleSign}
        onCancel={() => {
          setConfirmModalVisible(false);
          setSelectedRequestId(null);
        }}
        okText="Confirm Receipt"
        cancelText="Cancel"
        okButtonProps={{ 
          style: { background: '#52c41a', borderColor: '#52c41a' },
          loading: false
        }}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '16px',
            fontSize: '16px',
            color: '#333'
          }}>
            <span style={{ 
              fontSize: '24px', 
              marginRight: '12px',
              color: '#faad14'
            }}>
              ⚠️
            </span>
            Are you sure you have received the money?
          </div>
          <p style={{ 
            color: '#666', 
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            This action confirms that you have received the withdrawal amount in your bank account. 
            This action cannot be undone once confirmed.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileOwner;
