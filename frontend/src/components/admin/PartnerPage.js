import React, { useState, useEffect } from 'react';
import Loader from '../others/loader';
import './PartnerPage.css';
import { usePartnerData } from '../../contexts/PartnerDataContext';
import { useUserData } from '../../contexts/UserDataContext';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const PartnerPage = () => {
  const { partnersData, loading, error, fetchPartnersData, updatePartnerStatus } = usePartnerData();
  const { updateUserRole } = useUserData();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState({ main: null, others: [] });
  const [cavetImages, setCavetImages] = useState([]);
  const [otherDocImages, setOtherDocImages] = useState([]);
  const [cccdImages, setCccdImages] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    // Fetch partners data using context
    fetchPartnersData();
  }, [fetchPartnersData]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updatePartnerStatus(id, newStatus);
      
      // Get partner info to have userId
      const partner = partnersData.find(p => p.id === id);
      if (partner && partner.userId) {
        try {
          if (newStatus === 'ACTIVE_LEASE') {
            // If status is changed to ACTIVE_LEASE, update user role to owner
            await updateUserRole(partner.userId, 'owner');
            console.log(`Updated user ${partner.userId} role to owner`);
            showSuccessToast(`Updated user ${partner.userId} role to owner`);
          } else if (newStatus === 'EXPIRED_LEASE' || newStatus === 'CANCELLED_LEASE') {
            // If status is changed to EXPIRED_LEASE or CANCELLED_LEASE, change role back to renter
            await updateUserRole(partner.userId, 'renter');
            console.log(`Updated user ${partner.userId} role back to renter (due to ${newStatus})`);
            showSuccessToast(`Updated user ${partner.userId} role back to renter`);
          }
        } catch (roleError) {
          console.error('Error updating user role:', roleError);
          showErrorToast('Error updating user role: ' + (roleError.response?.data?.message || roleError.message));
          // Don't throw error to not affect partner status update
        }
      }
      
      showSuccessToast(`Partner status updated to ${newStatus}`);
      // Sau khi update status, fetch lại dữ liệu mới nhất
      const newData = await fetchPartnersData(true);
      // Nếu đang mở popup chủ xe, cập nhật lại selectedOwner theo dữ liệu mới
      if (showOwnerModal && selectedOwner) {
        const key = selectedOwner.owner.userId || selectedOwner.owner.email;
        const grouped = groupByOwner(newData);
        const newOwnerGroup = grouped.find(g => (g.owner.userId || g.owner.email) === key);
        if (newOwnerGroup) setSelectedOwner(newOwnerGroup);
      }
    } catch (err) {
      console.error('Error updating partner status:', err);
      showErrorToast('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSeeMore = async (partner) => {
    setSelectedPartner(partner);
    if (partner.car) {
      setSelectedImages({
        main: partner.car.mainImage,
        others: partner.car.otherImages || []
      });
      // Fetch cavet images for this car
      try {
        const res = await axios.get(`${API_URL}/cars/images/cavet/${partner.carId}`);
        if (res.data && Array.isArray(res.data.cavetImages)) {
          setCavetImages(res.data.cavetImages);
        } else {
          setCavetImages([]);
        }
      } catch (err) {
        setCavetImages([]);
      }
      // Fetch other document images for this car
      try {
        const res = await axios.get(`${API_URL}/cars/images/other/${partner.carId}`);
        if (res.data && Array.isArray(res.data.otherDocImages)) {
          setOtherDocImages(res.data.otherDocImages);
        } else {
          setOtherDocImages([]);
        }
      } catch (err) {
        setOtherDocImages([]);
      }
    } else {
      setCavetImages([]);
      setOtherDocImages([]);
    }
    // Fetch CCCD images for this partner (user)
    if (partner.userId) {
      try {
        const res = await axios.get(`${API_URL}/user/image`, { params: { userId: partner.userId } });
        if (Array.isArray(res.data)) {
          const cccdImgs = res.data.filter(img => img.documentType === 'cccd').map(img => img.imageUrl);
          setCccdImages(cccdImgs);
        } else {
          setCccdImages([]);
        }
      } catch (err) {
        setCccdImages([]);
      }
    } else {
      setCccdImages([]);
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
    setCavetImages([]);
    setOtherDocImages([]);
    setCccdImages([]);
  };

  // Thêm hàm đóng modal zoom
  const closeZoom = () => setZoomedImage(null);

  const groupByOwner = (partners) => {
    const groups = {};
    partners.forEach((p) => {
      const key = p.userId || p.email;
      if (!groups[key]) {
        groups[key] = {
          owner: {
            userId: p.userId,
            name: p.name,
            email: p.email,
            phone: p.phone,
          },
          cars: [],
        };
      }
      groups[key].cars.push(p);
    });
    return Object.values(groups);
  };

  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarModal, setShowCarModal] = useState(false);

  const groupedOwners = groupByOwner(partnersData);

  const handleOpenOwnerModal = (ownerGroup) => {
    setSelectedOwner(ownerGroup);
    setShowOwnerModal(true);
  };
  const closeOwnerModal = () => {
    setShowOwnerModal(false);
    setSelectedOwner(null);
  };
  const handleOpenCarModal = async (carContract) => {
    setSelectedCar(carContract);
    // Reuse logic cũ để fetch ảnh, cavet, cccd...
    await handleSeeMore(carContract);
    setShowCarModal(true);
  };
  const closeCarModal = () => {
    setShowCarModal(false);
    setSelectedPartner(null);
    setCavetImages([]);
    setOtherDocImages([]);
    setCccdImages([]);
  };

  const navigate = useNavigate();

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
            onClick={() => fetchPartnersData(true)} 
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
      {groupedOwners.length === 0 ? (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', margin: '20px 0', textAlign: 'center' }}>
          <h3>No Partners Found</h3>
          <p>There are currently no partner contracts in the system.</p>
        </div>
      ) : (
        <div className="partner-list">
          {groupedOwners.map((group, idx) => (
            <div className="partner-card" key={group.owner.userId || group.owner.email} onClick={() => handleOpenOwnerModal(group)}>
              <div className="partner-main-info">
                <div className="partner-name">{group.owner.name}</div>
                <div className="partner-id">ID: #{group.owner.userId ? String(group.owner.userId).padStart(4, '0') : ''}</div>
              </div>
              <div className="partner-contact">
                <span className="icon">📞</span> {group.owner.phone}
                <span className="icon">✉️</span> {group.owner.email}
              </div>
              <div className="partner-car-count">Số lượng xe: {group.cars.length}</div>
              <button
                className="chatIconBtn"
                style={{
                  background: 'none',
                  border: 'none',
                  marginLeft: 12,
                  cursor: 'pointer',
                  verticalAlign: 'middle',
                  fontSize: 20,
                  color: '#6c63ff',
                }}
                title="Nhắn tin với partner"
                onClick={e => {
                  e.stopPropagation();
                  navigate('/messages', {
                    state: {
                      selectedUser: {
                        id: group.owner.userId,
                        name: group.owner.name || group.owner.email || group.owner.userId,
                        avatar: undefined,
                      },
                    },
                  });
                }}
              >
                <i className="bi bi-chat-dots"></i>
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Popup list xe của chủ xe */}
      {showOwnerModal && selectedOwner && (
        <div className="partner-modal-overlay">
          <div className="partner-modal-content">
            <div className="partner-modal-header">
              <h2>Danh sách xe của {selectedOwner.owner.name}</h2>
              <button className="partner-close-btn" onClick={closeOwnerModal}>&times;</button>
            </div>
            <div className="partner-modal-body">
              <div className="partner-list">
                {selectedOwner.cars.map((carContract) => (
                  <div className="partner-card" key={carContract.id} onClick={() => handleOpenCarModal(carContract)}>
                    <div className="partner-col vehicle-info">
                      <div className="vehicle-name">{carContract.car?.brand} {carContract.car?.model}</div>
                      <div className="vehicle-detail">Plate: {carContract.carId}</div>
                      <div className="vehicle-detail">Year: {carContract.car?.year}</div>
                    </div>
                    <div className="partner-col pricing-info">
                      <div className="price">{carContract.pricePerDay?.toLocaleString('vi-VN')} VND/day</div>
                      <div className="deposit">Deposit: {carContract.deposit?.toLocaleString('vi-VN')} VND</div>
                    </div>
                    <div className="partner-col status-col" onClick={e => e.stopPropagation()}>
                      <select
                        value={carContract.status || ""}
                        onChange={e => handleStatusChange(carContract.id, e.target.value)}
                        className={
                          carContract.status === 'ACTIVE_LEASE' ? 'status-active' :
                          carContract.status === 'CANCELLED_LEASE' ? 'status-cancelled' :
                          carContract.status === 'EXPIRED_LEASE' ? 'status-expired' :
                          carContract.status === 'PENDING_LEASE' ? 'status-pending' : ''
                        }
                        style={{ minWidth: 80, maxWidth: 110 }}
                        disabled={carContract.status === 'CANCELLED_LEASE'}
                      >
                        <option value="PENDING_LEASE">PENDING</option>
                        <option value="ACTIVE_LEASE">ACTIVE</option>
                        <option value="CANCELLED_LEASE">CANCELLED</option>
                        <option value="EXPIRED_LEASE">EXPIRED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginTop: 16, textAlign: 'right'}}>
                <button className="see-more-btn" onClick={closeOwnerModal}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Popup chi tiết xe (reuse modal cũ) */}
      {showCarModal && selectedPartner && (
        <div className="partner-modal-overlay">
          <div className="partner-modal-content">
            <div className="partner-modal-header">
              <h2>Car Details</h2>
              <button className="partner-close-btn" onClick={closeCarModal}>&times;</button>
            </div>
            <div className="partner-modal-body">
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
                      onClick={e => { e.stopPropagation(); setZoomedImage(selectedImages.main); }}
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
                      onClick={e => { e.stopPropagation(); setZoomedImage(img); }}
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
              {/* Thêm phần hiển thị ảnh cavet */}
              {/* ĐÃ XOÁ PHẦN HIỂN THỊ ẢNH CÀ VẸT XE (Cavet) VÌ ĐÃ CÓ PHẦN Cavet Information BÊN DƯỚI */}

              <div className="car-details">
                <h3>Car Information</h3>
                <p><strong>Brand:</strong> {selectedPartner.car?.brand}</p>
                <p><strong>Model:</strong> {selectedPartner.car?.model}</p>
                <p><strong>Year:</strong> {selectedPartner.car?.year}</p>
                <p><strong>License Plate:</strong> {selectedPartner.carId}</p>
                <p><strong>Seats:</strong> {selectedPartner.car?.seats}</p>
                <p><strong>Transmission:</strong> {selectedPartner.car?.transmission === 'manual' ? 'Manual' : selectedPartner.car?.transmission === 'automatic' ? 'Automatic' : selectedPartner.car?.transmission}</p>
                <p><strong>Fuel Type:</strong> {
                  selectedPartner.car?.fuelType === 'gasoline' ? 'Gasoline' :
                  selectedPartner.car?.fuelType === 'diesel' ? 'Diesel' :
                  selectedPartner.car?.fuelType === 'electric' ? 'Electric' :
                  selectedPartner.car?.fuelType === 'hybrid' ? 'Hybrid' : selectedPartner.car?.fuelType
                }</p>
                <p><strong>Fuel Consumption:</strong> {selectedPartner.car?.fuelConsumption} {selectedPartner.car?.fuelType === 'electric' ? 'kWh/100km' : 'L/100km'}</p>
                <p><strong>Location:</strong> {selectedPartner.car?.location}</p>
                <p><strong>Description:</strong> {selectedPartner.car?.description}</p>
                <p><strong>Price per Day:</strong> {selectedPartner.pricePerDay?.toLocaleString('vi-VN')} VND</p>
                <p><strong>Deposit:</strong> {selectedPartner.deposit?.toLocaleString('vi-VN')} VND</p>
              </div>
              {/* Cavet Information section */}
              <div className="cavet-details">
                <h3>Cavet Information</h3>
                {cavetImages.length > 0 ? (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {cavetImages.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Cavet ${idx + 1}`}
                        style={{ width: '160px', height: '110px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); setZoomedImage(url); }}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888' }}>No cavet images available.</p>
                )}
              </div>
              {/* Other Documents section */}
              <div className="other-doc-details">
                <h3>Other Documents</h3>
                {otherDocImages.length > 0 ? (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {otherDocImages.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Other Document ${idx + 1}`}
                        style={{ width: '160px', height: '110px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); setZoomedImage(url); }}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888' }}>No other document images available.</p>
                )}
              </div>
              <div className="partner-details">
                <h3>Partner Information</h3>
                <p><strong>Name:</strong> {selectedPartner.name}</p>
                <p><strong>Phone:</strong> {selectedPartner.phone}</p>
                <p><strong>Email:</strong> {selectedPartner.email}</p>
                <p><strong>Status:</strong> {selectedPartner.status}</p>
              </div>
              {/* CCCD Information section */}
              <div className="cccd-details">
                <h3>CCCD Information</h3>
                {cccdImages.length > 0 ? (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {cccdImages.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`CCCD ${idx + 1}`}
                        style={{ width: '160px', height: '110px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); setZoomedImage(url); }}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888' }}>No CCCD images available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal phóng to ảnh giữ nguyên */}
      {zoomedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={closeZoom}
        >
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '10px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
              background: '#fff',
            }}
            onClick={e => e.stopPropagation()}
          />
          <button 
            onClick={closeZoom}
            style={{
              position: 'fixed',
              top: 24,
              right: 32,
              fontSize: 32,
              color: '#fff',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10000
            }}
            aria-label="Close zoomed image"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default PartnerPage; 