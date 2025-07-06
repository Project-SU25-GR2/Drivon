import React, { useState, useEffect } from "react";
import "../css/ProfilePage.css";
import { API_URL } from "../../api/configApi";
import axios from "axios";

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

const ProfilePage = ({ user }) => {
  const [editInfo, setEditInfo] = useState({
    bankAccount: "",
    bankName: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [bankInfo, setBankInfo] = useState({ bankAccount: "", bankName: "" });
  const [error, setError] = useState("");

  // Fetch bank info when loading the page
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Kiểm tra Bank Account chỉ chứa số
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
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="bankAccount">Bank Account</label>
              <input
                type="text"
                name="bankAccount"
                id="bankAccount"
                value={editInfo.bankAccount}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditInfo((prev) => ({ ...prev, bankAccount: value }));
                }}
                required
                minLength={8}
                maxLength={16}
                pattern="[0-9]*"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Please enter your Account Number (numbers only)"
              />
              <small style={{ color: "#888" }}>
                Please enter your Account Number (numbers only).
              </small>
              {error && (
                <div style={{ color: "red", marginTop: 4 }}>{error}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="bankName">Bank Name</label>
              <select
                name="bankName"
                id="bankName"
                value={editInfo.bankName}
                onChange={(e) =>
                  setEditInfo((prev) => ({ ...prev, bankName: e.target.value }))
                }
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
            <button type="submit" className="btn btn-success">
              Save Info
            </button>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <label>Bank Account</label>
              <p>
                {bankInfo.bankAccount || (
                  <span style={{ color: "gray" }}>Chưa cập nhật</span>
                )}
              </p>
            </div>
            <div className="info-group">
              <label>Bank Name</label>
              <p>
                {bankInfo.bankName || (
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
