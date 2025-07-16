import React, { useState, useEffect } from "react";
import "./ProfileOwner.css";
import { API_URL } from "../../api/configApi";
import axios from "axios";
import { showSuccessToast, showErrorToast } from '../notification/notification';

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

  // Fetch bank info
  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/owner-bank/${user.userId}`);
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
      await axios.post(`${API_URL}/owner-bank/update`, payload);
      setIsEditing(false);
      // Fetch the latest bank info after update
      const res = await axios.get(`${API_URL}/owner-bank/${user.userId}`);
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

  // Thêm vào đầu file:
  const handleSign = async (requestId) => {
    if (!window.confirm('Bạn đã chắc chắn nhận được tiền chưa? Hành động này sẽ không thể hoàn tác!')) return;
    try {
      await axios.patch(`${API_URL}/owner-withdraw/${requestId}/sign`, { sign: true });
      setWithdrawHistory(his => his.map(w => w.requestId === requestId ? { ...w, sign: true } : w));
      showSuccessToast('Đã xác nhận nhận tiền!');
    } catch {
      showErrorToast('Xác nhận thất bại!');
    }
  };

  // Giả lập ngày tham gia (nên lấy từ user nếu có)
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
            <div className="profile-section-title">Lịch sử rút tiền</div>
            <table className="withdraw-history-table" style={{width: '100%', borderCollapse: 'collapse', marginTop: 12}}>
              <thead>
                <tr>
                  <th>Ngày yêu cầu</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Đã nhận tiền</th>
                </tr>
              </thead>
              <tbody>
                {withdrawHistory.length === 0 ? (
                  <tr><td colSpan="5">Chưa có yêu cầu rút tiền nào.</td></tr>
                ) : withdrawHistory.map(w => (
                  <tr key={w.requestId}>
                    <td>{w.requestedAt ? new Date(w.requestedAt).toLocaleString('vi-VN') : ''}</td>
                    <td>{w.amount?.toLocaleString('vi-VN')} ₫</td>
                    <td>{w.status}</td>
                    <td>{w.note || ''}</td>
                    <td>
                      {w.sign ? (
                        <span style={{color: 'green', fontWeight: 600}}>Đã xác nhận</span>
                      ) : (
                        <input type="checkbox" onChange={() => handleSign(w.requestId)} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOwner;
