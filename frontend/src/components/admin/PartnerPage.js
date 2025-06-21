import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../others/loader';
import './PartnerPage.css';

const PartnerPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState({ main: null, others: [] });

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching partners from API...');
        
        const response = await axios.get('http://localhost:8080/api/admin/partners');
        console.log('Partners API response:', response.data);
        
        setPartners(response.data);
      } catch (err) {
        console.error('Error fetching partners:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        
        let errorMessage = 'Failed to fetch partners';
        
        if (err.response?.status === 500) {
          errorMessage = 'Server error (500) - Backend service might be down or database connection issue';
        } else if (err.response?.status === 404) {
          errorMessage = 'API endpoint not found (404) - Check if backend is running';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network error - Backend server is not running or not accessible';
        } else if (err.response?.data?.message) {
          errorMessage = `Server error: ${err.response.data.message}`;
        } else {
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log(`Updating partner status: ${id} to ${newStatus}`);
      await axios.put(`http://localhost:8080/api/admin/partners/${id}/status`, { status: newStatus });
      setPartners(prev =>
        prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Error updating partner status:', err);
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSeeMore = (partner) => {
    setSelectedPartner(partner);
    if (partner.car) {
      setSelectedImages({
        main: partner.car.mainImage,
        others: partner.car.otherImages || []
      });
    }
    setShowModal(true);
  };

  const handleImageClick = (clickedImage, index) => {
    setSelectedImages(prev => {
      const newOthers = [...prev.others];
      newOthers[index] = prev.main;
      return {
        main: clickedImage,
        others: newOthers
      };
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPartner(null);
  };

  if (loading) {
    return <div className="loading"><Loader text="Loading partners..." /></div>;
  }

  if (error) {
    return (
      <div className="partner-page">
        <h1>Partner Management</h1>
        <div style={{ 
          color: 'red', 
          padding: '20px', 
          backgroundColor: '#ffe6e6', 
          border: '1px solid #ff9999',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <h3>Error Loading Partners</h3>
          <p>{error}</p>
          <p><strong>Troubleshooting steps:</strong></p>
          <ul>
            <li>Make sure the backend server is running on port 8080</li>
            <li>Check if the database connection is working</li>
            <li>Verify that the contract_partners table exists and has data</li>
            <li>Check the backend logs for more detailed error information</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-page">
      <h1>Partner Management</h1>
      {partners.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px 0',
          textAlign: 'center'
        }}>
          <h3>No Partners Found</h3>
          <p>There are currently no partner contracts in the system.</p>
        </div>
      ) : (
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} onClick={() => handleSeeMore(partner)} style={{ cursor: 'pointer' }}>
                  <td>{partner.name}</td>
                  <td>{partner.phone}</td>
                  <td>{partner.email}</td>
                  <td>{partner.carId}</td>
                  <td>{partner.car?.brand}</td>
                  <td>{partner.car?.model}</td>
                  <td>{partner.car?.year}</td>
                  <td>{partner.pricePerDay?.toLocaleString('vi-VN')} VND</td>
                  <td>{partner.deposit?.toLocaleString('vi-VN')} VND</td>
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
                      onClick={e => e.stopPropagation()}
                    >
                      <option value="PENDING_LEASE">PENDING</option>
                      <option value="ACTIVE_LEASE">ACTIVE</option>
                      <option value="CANCELLED_LEASE">CANCELLED</option>
                      <option value="EXPIRED_LEASE">EXPIRED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedPartner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Car Details</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              {/* Container cho ảnh */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {/* Cột trái - Ảnh chính */}
                <div style={{ flex: '1' }}>
                  {selectedImages.main && (
                    <img 
                      src={selectedImages.main} 
                      alt="Main" 
                      style={{ 
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }} 
                    />
                  )}
                </div>
                
                {/* Cột phải - 3 ảnh phụ */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedImages.others.slice(0, 3).map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Other ${idx + 1}`} 
                      onClick={() => handleImageClick(img, idx)}
                      style={{ 
                        width: '100%',
                        height: '92px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseOver={e => e.target.style.opacity = '0.8'}
                      onMouseOut={e => e.target.style.opacity = '1'}
                    />
                  ))}
                </div>
              </div>

              <div className="car-details">
                <h3>Car Information</h3>
                <p><strong>Brand:</strong> {selectedPartner.car?.brand}</p>
                <p><strong>Model:</strong> {selectedPartner.car?.model}</p>
                <p><strong>Year:</strong> {selectedPartner.car?.year}</p>
                <p><strong>License Plate:</strong> {selectedPartner.carId}</p>
                <p><strong>Seats:</strong> {selectedPartner.car?.seats}</p>
                <p><strong>Transmission:</strong> {selectedPartner.car?.transmission === 'manual' ? 'Số sàn' : selectedPartner.car?.transmission === 'automatic' ? 'Số tự động' : selectedPartner.car?.transmission}</p>
                <p><strong>Fuel Type:</strong> {
                  selectedPartner.car?.fuelType === 'gasoline' ? 'Xăng' :
                  selectedPartner.car?.fuelType === 'diesel' ? 'Dầu' :
                  selectedPartner.car?.fuelType === 'electric' ? 'Điện' :
                  selectedPartner.car?.fuelType === 'hybrid' ? 'Hybrid' : selectedPartner.car?.fuelType
                }</p>
                <p><strong>Fuel Consumption:</strong> {selectedPartner.car?.fuelConsumption} {selectedPartner.car?.fuelType === 'electric' ? 'kWh/100km' : 'L/100km'}</p>
                <p><strong>Location:</strong> {selectedPartner.car?.location}</p>
                <p><strong>Description:</strong> {selectedPartner.car?.description}</p>
                <p><strong>Price per Day:</strong> {selectedPartner.pricePerDay?.toLocaleString('vi-VN')} VND</p>
                <p><strong>Deposit:</strong> {selectedPartner.deposit?.toLocaleString('vi-VN')} VND</p>
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