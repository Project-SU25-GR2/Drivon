import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PartnerPage.css';

const PartnerPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/admin/partners');
        setPartners(response.data);
      } catch (err) {
        console.error('Error fetching partners:', err);
        setError('Failed to fetch partners: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/admin/partners/${id}/status`, { status: newStatus });
      setPartners(prev =>
        prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSeeMore = (partner) => {
    setSelectedPartner(partner);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPartner(null);
  };

  if (loading) {
    return <div>Loading partners...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="partner-page">
      <h1>Partner Management</h1>
      <div className="table-container">
        <table className="partner-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Car Plate</th>
              <th>Car Brand</th>
              <th>Car Model</th>
              <th>Car Year</th>
              <th>Price/Day</th>
              <th>Deposit</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id}>
                <td>{partner.name}</td>
                <td>{partner.phone}</td>
                <td>{partner.email}</td>
                <td>{partner.carId}</td>
                <td>{partner.car?.brand}</td>
                <td>{partner.car?.model}</td>
                <td>{partner.car?.year}</td>
                <td>{partner.pricePerDay?.toLocaleString('vi-VN')} VND</td>
                <td>{partner.deposit?.toLocaleString('vi-VN')} VND</td>
                <td>{partner.car?.description}</td>
                <td>
                  <select
                    value={partner.status || ""}
                    onChange={e => handleStatusChange(partner.id, e.target.value)}
                    className={
                      partner.status === 'ACTIVE_LEASE' ? 'status-active' :
                      partner.status === 'CANCELLED_LEASE' ? 'status-cancelled' :
                      partner.status === 'EXPIRED_LEASE' ? 'status-expired' :
                      partner.status === 'PENDING_LEASE' ? 'status-pending' : ''
                    }
                  >
                    <option value="PENDING_LEASE">PENDING</option>
                    <option value="ACTIVE_LEASE">ACTIVE</option>
                    <option value="CANCELLED_LEASE">CANCELLED</option>
                    <option value="EXPIRED_LEASE">EXPIRED</option>
                  </select>
                </td>
                <td>
                  <button 
                    className="see-more-btn"
                    onClick={() => handleSeeMore(partner)}
                  >
                    See More
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedPartner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Car Details</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="car-images">
                {selectedPartner.car?.images?.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`Car ${index + 1}`} 
                    className="car-image"
                  />
                ))}
              </div>
              <div className="car-details">
                <h3>Car Information</h3>
                <p><strong>Brand:</strong> {selectedPartner.car?.brand}</p>
                <p><strong>Model:</strong> {selectedPartner.car?.model}</p>
                <p><strong>Year:</strong> {selectedPartner.car?.year}</p>
                <p><strong>License Plate:</strong> {selectedPartner.carId}</p>
                <p><strong>Price per Day:</strong> {selectedPartner.pricePerDay?.toLocaleString('vi-VN')} VND</p>
                <p><strong>Deposit:</strong> {selectedPartner.deposit?.toLocaleString('vi-VN')} VND</p>
                <p><strong>Description:</strong> {selectedPartner.car?.description}</p>
              </div>
              <div className="partner-details">
                <h3>Partner Information</h3>
                <p><strong>Name:</strong> {selectedPartner.name}</p>
                <p><strong>Phone:</strong> {selectedPartner.phone}</p>
                <p><strong>Email:</strong> {selectedPartner.email}</p>
                <p><strong>Status:</strong> {selectedPartner.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPage; 