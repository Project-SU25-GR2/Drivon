import React, { useState, useEffect } from "react";
import "./BookingManager.css";
import { useRentalHistory } from "../../contexts/RentalHistoryContext";
import {
  FaCar,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../api/configApi';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { showErrorToast, showSuccessToast } from '../notification/notification';

pdfMake.vfs = pdfMake.vfs || {};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];
const RentalStats = ({ stats }) => (
  <div className="statsGrid">
    <div className="statCard">
      <div className="statIcon">
        <FaCar />
      </div>
      <div>
        <div className="statValue">{stats.totalRentals}</div>
        <div className="statLabel">Total Rentals</div>
      </div>
    </div>
    <div className="statCard">
      <div className="statIcon">
        <FaClipboardCheck />
      </div>
      <div>
        <div className="statValue" style={{ color: "#27ae60" }}>
          {stats.completed}
        </div>
        <div className="statLabel">Completed</div>
      </div>
    </div>
    <div className="statCard">
      <div className="statIcon">
        <FaMoneyBillWave />
      </div>
      <div>
        <div className="statValue" style={{ color: "#f1c40f" }}>
          {stats.totalRevenue?.toLocaleString("en-US")} ₫
        </div>
        <div className="statLabel">Total Revenue</div>
      </div>
    </div>
    <div className="statCard">
      <div className="statIcon">
        <FaCalendarAlt />
      </div>
      <div>
        <div className="statValue">{stats.thisMonth}</div>
        <div className="statLabel">This Month</div>
      </div>
    </div>
  </div>
);

const RentalFilters = ({
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  date,
  setDate,
  onFilter,
  onExport,
}) => (
  <div className="filtersBar">
    <input
      className="searchInput"
      type="text"
      placeholder="Search by car, renter, or location..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <select
      className="statusSelect"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="">All Status</option>
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <input
      className="dateInput"
      type="month"
      value={date}
      onChange={(e) => setDate(e.target.value)}
    />
    <button className="exportBtn" onClick={onExport}>
      Export
    </button>
  </div>
);

const RentalHistoryPage = () => {
  const { rentalsData, loading, error, fetchRentalsData, updateRentalStatus } =
    useRentalHistory();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 7));
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isLicenseModalVisible, setIsLicenseModalVisible] = useState(false);
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [licenseImages, setLicenseImages] = useState([]);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.userId) {
      fetchRentalsData(user.userId);
    }
  }, [fetchRentalsData]);

  // Stats calculation (exclude PENDING payments)
  const validRentalsData = rentalsData.filter((r) => r.paymentStatus?.toUpperCase() !== 'PENDING');
  const stats = {
    totalRentals: validRentalsData.length,
    completed: validRentalsData.filter((r) => r.status === "completed").length,
    totalRevenue: validRentalsData.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
    thisMonth: validRentalsData.filter(
      (r) => new Date(r.startTime).getMonth() === new Date().getMonth()
    ).length,
  };

  // Filtered and sorted data (newest bookings first)
  const filteredData = rentalsData
    .filter((rental) => {
    const matchesStatus =
      !statusFilter || rental.status?.toLowerCase() === statusFilter;
    const matchesSearch =
      !search ||
      rental.car?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      rental.car?.model?.toLowerCase().includes(search.toLowerCase()) ||
      rental.renter?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      rental.pickupLocation?.toLowerCase().includes(search.toLowerCase()) ||
      rental.dropoffLocation?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !date || (rental.startTime && rental.startTime.slice(0, 7) === date);
      // Hide bookings with PENDING payment status
      const hasValidPayment = rental.paymentStatus?.toUpperCase() !== 'PENDING';
      return matchesStatus && matchesSearch && matchesDate && hasValidPayment;
    })
    .sort((a, b) => {
      // Sort by booking creation time (newest first)
      // If no booking creation time, fallback to startTime
      const timeA = a.createdAt || a.startTime || '0';
      const timeB = b.createdAt || b.startTime || '0';
      return new Date(timeB) - new Date(timeA);
  });

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      await updateRentalStatus(rentalId, newStatus);
      showSuccessToast("Status updated successfully!");
    } catch (err) {
      showErrorToast("Failed to update status!");
    }
  };

  const fetchLicenseImages = async (userId) => {
    try {
      setLoadingLicense(true);
      const response = await fetch(`${API_URL}/user/image?userId=${userId}`);
      if (response.ok) {
        const images = await response.json();
        const licenseOnly = images.filter(img => img.documentType === 'license');
        setLicenseImages(licenseOnly);
      } else {
        showErrorToast("Không thể tải hình ảnh bằng lái!");
        setLicenseImages([]);
      }
    } catch (error) {
      console.error("Error fetching license images:", error);
      showErrorToast("Lỗi khi tải hình ảnh bằng lái!");
      setLicenseImages([]);
    } finally {
      setLoadingLicense(false);
    }
  };

  const handleRowClick = (rental) => {
    const renterId = rental.renter?.userId || rental.renter?.id || rental.renter?._id;
    if (renterId) {
      setSelectedRenter(rental.renter);
      setIsLicenseModalVisible(true);
      fetchLicenseImages(renterId);
    } else {
      showErrorToast("Không tìm thấy thông tin người thuê!");
    }
  };

  const handleCloseLicenseModal = () => {
    setIsLicenseModalVisible(false);
    setSelectedRenter(null);
    setLicenseImages([]);
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return { color: "green", fontWeight: "bold" };
      case "PENDING":
      case "Not Paid":
        return { color: "red", fontWeight: "bold" };
      default:
        return {};
    }
  };

  const exportToPDF = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const currentDate = new Date().toLocaleDateString('en-US');
      
      // Prepare table data
      const tableBody = [
        [
          { text: 'Car', style: 'tableHeader' },
          { text: 'Renter', style: 'tableHeader' },
          { text: 'Start Date', style: 'tableHeader' },
          { text: 'End Date', style: 'tableHeader' },
          { text: 'Pickup Location', style: 'tableHeader' },
          { text: 'Dropoff Location', style: 'tableHeader' },
          { text: 'Status', style: 'tableHeader' },
          { text: 'Total Amount', style: 'tableHeader' }
        ]
      ];

      // Add rental data to table
      filteredData.forEach((rental) => {
        tableBody.push([
          `${rental.car?.brand} ${rental.car?.model}\n${rental.car?.licensePlate}`,
          rental.renter?.fullName || rental.renter?.email || rental.renter?.id,
          rental.startTime ? new Date(rental.startTime).toLocaleDateString('en-US') : '',
          rental.endTime ? new Date(rental.endTime).toLocaleDateString('en-US') : '',
          rental.pickupLocation || '',
          rental.dropoffLocation || '',
          rental.status || '',
                      `${rental.totalPrice?.toLocaleString("en-US")} ₫` || '0 ₫'
        ]);
      });

      // PDF document definition
      const docDefinition = {
        content: [
          {
            text: 'RENTAL HISTORY REPORT',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          {
            text: `Generated on: ${currentDate}`,
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Summary Statistics',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10]
          },
          {
            columns: [
              {
                text: `Total Rentals: ${stats.totalRentals}`,
                style: 'statText'
              },
              {
                text: `Completed: ${stats.completed}`,
                style: 'statText'
              },
              {
                text: `This Month: ${stats.thisMonth}`,
                style: 'statText'
              },
              {
                text: `Total Revenue: ${stats.totalRevenue?.toLocaleString("en-US")} ₫`,
                style: 'statText'
              }
            ],
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Rental Details',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
              body: tableBody
            },
            layout: {
              fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex === 0) ? '#f0f0f0' : null;
              }
            }
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            color: '#2c3e50'
          },
          subheader: {
            fontSize: 12,
            color: '#7f8c8d'
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#34495e',
            margin: [0, 10, 0, 5]
          },
          statText: {
            fontSize: 10,
            color: '#2c3e50'
          },
          tableHeader: {
            bold: true,
            fontSize: 9,
            color: '#2c3e50',
            alignment: 'center'
          }
        },
        defaultStyle: {
          fontSize: 8
        },
        pageMargins: [40, 60, 40, 60],
        pageSize: 'A4'
      };

      // Generate and download PDF
      const pdfDoc = pdfMake.createPdf(docDefinition);
      const fileName = `rental_history_${currentDate.replace(/\//g, '-')}.pdf`;

      // Vừa tải xuống vừa mở trong tab mới
      pdfDoc.download(fileName);
      pdfDoc.open();

      showSuccessToast("PDF exported successfully!");
    } catch (error) {
      console.error('PDF export error:', error);
      showErrorToast("Failed to export PDF!");
    }
  };

  return (
    <div className="mainContent">
      <h2 className="h2Title">Rental History</h2>
      <p className="subtitle">Manage and track all your rental bookings</p>
      <RentalStats stats={stats} />
      <RentalFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        search={search}
        setSearch={setSearch}
        date={date}
        setDate={setDate}
        onFilter={() => {}}
        onExport={exportToPDF}
      />
      <div className="rentalList">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <table className="rentalTable">
            <thead>
              <tr>
                <th>Car</th>
                <th>Renter</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Pickup Location</th>
                <th>Dropoff Location</th>
                <th>Status</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((rental) => (
                <tr
                  key={rental.id}
                  onMouseEnter={() => setHoveredRow(rental.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => handleRowClick(rental)}
                  style={{ 
                    position: "relative", 
                    cursor: "pointer",
                    backgroundColor: hoveredRow === rental.id ? "#f0f8ff" : "transparent",
                    transition: "background-color 0.2s ease"
                  }}
                  title="Click để xem bằng lái của người thuê"
                >
                  <td>
                    <b>
                      {rental.car?.brand} {rental.car?.model}
                    </b>
                    <div className="licensePlate">
                      {rental.car?.licensePlate}
                    </div>
                  </td>
                  <td style={{ position: "relative" }}>
                    <button
                      className="chatIconBtn"
                      style={{
                        background: "none",
                        border: "none",
                        marginRight: 8,
                        cursor: "pointer",
                        verticalAlign: "middle",
                        fontSize: 20,
                        color: "#6c63ff"
                      }}
                      title="Message with renter"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Renter info:', rental.renter);
                        navigate("/messages", {
                          state: {
                            selectedUser: {
                              id: rental.renter?.userId || rental.renter?.id || rental.renter?._id,
                              name: rental.renter?.fullName || rental.renter?.email || rental.renter?.id,
                              avatar: rental.renter?.avatar || undefined,
                            },
                          },
                        });
                      }}
                    >
                      <i className="bi bi-chat-dots"></i>
                    </button>
                    {rental.renter?.fullName ||
                      rental.renter?.email ||
                      rental.renter?.id}
                  </td>
                  <td>{rental.startTime ? new Date(rental.startTime).toLocaleDateString('en-US') : ''}</td>
                  <td>{rental.endTime ? new Date(rental.endTime).toLocaleDateString('en-US') : ''}</td>
                  <td>
                    <span className="locationTag">{rental.pickupLocation}</span>
                  </td>
                  <td>
                    <span className="locationTag">
                      {rental.dropoffLocation}
                    </span>
                  </td>
                  <td>
                    <select
                      className={`${"statusBadge"} ${
                        "statusBadge" + rental.status?.toLowerCase()
                      }`}
                      value={rental.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(rental.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={getPaymentStatusStyle(rental.paymentStatus)}>
                    {rental.totalPrice?.toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal hiển thị bằng lái */}
      {isLicenseModalVisible && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={handleCloseLicenseModal}
        >
          <div 
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              maxWidth: "800px",
              maxHeight: "80vh",
              overflow: "auto",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#2c3e50" }}>
                Bằng lái xe - {selectedRenter?.fullName || selectedRenter?.email || "Người thuê"}
              </h3>
              <button 
                onClick={handleCloseLicenseModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            {loadingLicense ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Đang tải hình ảnh...</p>
              </div>
            ) : licenseImages.length > 0 ? (
              <div>
                {licenseImages.map((image, index) => (
                  <div key={index} style={{ marginBottom: "20px" }}>
                    {image.description && (
                      <p style={{ marginBottom: "10px", fontWeight: "bold", color: "#555" }}>
                        {image.description}
                      </p>
                    )}
                    <img 
                      src={image.imageUrl} 
                      alt={`Bằng lái ${index + 1}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        borderRadius: "4px"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <div style={{ display: "none", padding: "20px", textAlign: "center", color: "#999" }}>
                      Không thể tải hình ảnh
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                <p>Người thuê chưa tải lên bằng lái xe</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalHistoryPage;
