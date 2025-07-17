import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/configApi';

const cardStyle = {
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 2px 16px 0 rgba(60,72,100,.08)',
  padding: '28px 32px',
  marginBottom: '24px',
  border: '1px solid #f0f1f6',
};
const sectionTitle = {
  fontSize: '1.1rem',
  fontWeight: 700,
  marginBottom: 18,
  color: '#222',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
const metricCard = {
  ...cardStyle,
  flex: 1,
  minWidth: 180,
  marginRight: 24,
  marginBottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
};
const metricIcon = {
  fontSize: 28,
  borderRadius: '50%',
  padding: 10,
  marginRight: 12,
  background: '#f5f7fa',
  color: '#4f8cff',
};
const progressBar = (percent, color) => ({
  width: percent + '%',
  height: 8,
  borderRadius: 6,
  background: color,
  transition: 'width 1s',
});
const circleChart = (color) => ({
  width: 80,
  height: 80,
  display: 'inline-block',
});
const labelStyle = { fontWeight: 500, color: '#555', fontSize: 14 };
const valueStyle = { fontWeight: 700, fontSize: 28, color: '#222' };
const trendStyle = (positive) => ({ color: positive ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: 15, marginLeft: 6 });

export default function DashboardOverview() {
  // State cho tổng số booking
  const [totalBookings, setTotalBookings] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorBookings, setErrorBookings] = useState(null);

  // State cho Active Rentals
  const [activeRentals, setActiveRentals] = useState(null);
  const [loadingActiveRentals, setLoadingActiveRentals] = useState(true);
  const [errorActiveRentals, setErrorActiveRentals] = useState(null);

  // State cho Fleet Utilization
  const [fleetUtilization, setFleetUtilization] = useState(null);
  const [loadingFleetUtilization, setLoadingFleetUtilization] = useState(true);
  const [errorFleetUtilization, setErrorFleetUtilization] = useState(null);

  // State cho Revenue
  const [revenue, setRevenue] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [errorRevenue, setErrorRevenue] = useState(null);

  // State cho Booking Locations
  const [bookingLocations, setBookingLocations] = useState([]);
  const [loadingBookingLocations, setLoadingBookingLocations] = useState(true);
  const [errorBookingLocations, setErrorBookingLocations] = useState(null);

  // State cho Fleet Status
  const [fleetStatus, setFleetStatus] = useState([]);
  const [loadingFleetStatus, setLoadingFleetStatus] = useState(true);
  const [errorFleetStatus, setErrorFleetStatus] = useState(null);

  useEffect(() => {
    // Fetch tổng số booking từ API
    const fetchTotalBookings = async () => {
      setLoadingBookings(true);
      setErrorBookings(null);
      try {
        // Gọi API lấy danh sách booking
        const res = await axios.get(`${API_URL}/bookings`);
        // Nếu trả về mảng booking
        if (Array.isArray(res.data)) {
          setTotalBookings(res.data.length);
        } else if (Array.isArray(res.data.bookings)) {
          setTotalBookings(res.data.bookings.length);
        } else {
          setTotalBookings(0);
        }
      } catch (err) {
        setErrorBookings('Không thể tải tổng số booking');
        setTotalBookings(0);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchTotalBookings();
  }, []);

  useEffect(() => {
    // Fetch tổng số booking và active rentals từ API
    const fetchActiveRentals = async () => {
      setLoadingActiveRentals(true);
      setErrorActiveRentals(null);
      try {
        const res = await axios.get(`${API_URL}/bookings`);
        let count = 0;
        if (Array.isArray(res.data)) {
          // Đếm số booking có status là 'ongoing' hoặc 'approved'
          count = res.data.filter(b => {
            const status = (b.status || '').toLowerCase();
            return status === 'ongoing' || status === 'approved';
          }).length;
        } else if (Array.isArray(res.data.bookings)) {
          count = res.data.bookings.filter(b => {
            const status = (b.status || '').toLowerCase();
            return status === 'ongoing' || status === 'approved';
          }).length;
        }
        setActiveRentals(count);
      } catch (err) {
        setErrorActiveRentals('Không thể tải số lượng active rentals');
        setActiveRentals(0);
      } finally {
        setLoadingActiveRentals(false);
      }
    };
    fetchActiveRentals();
  }, []);

  useEffect(() => {
    // Fetch danh sách xe để tính Fleet Utilization
    const fetchFleetUtilization = async () => {
      setLoadingFleetUtilization(true);
      setErrorFleetUtilization(null);
      try {
        const res = await axios.get(`${API_URL}/cars`);
        let percent = 0;
        if (Array.isArray(res.data)) {
          const total = res.data.length;
          const rented = res.data.filter(car => (car.status || '').toLowerCase() === 'rented').length;
          percent = total > 0 ? Math.round((rented / total) * 100) : 0;
        } else if (Array.isArray(res.data.cars)) {
          const total = res.data.cars.length;
          const rented = res.data.cars.filter(car => (car.status || '').toLowerCase() === 'rented').length;
          percent = total > 0 ? Math.round((rented / total) * 100) : 0;
        }
        setFleetUtilization(percent);
      } catch (err) {
        setErrorFleetUtilization('Không thể tải dữ liệu xe');
        setFleetUtilization(0);
      } finally {
        setLoadingFleetUtilization(false);
      }
    };
    fetchFleetUtilization();
  }, []);

  useEffect(() => {
    // Fetch doanh thu hệ thống
    const fetchRevenue = async () => {
      setLoadingRevenue(true);
      setErrorRevenue(null);
      try {
        const res = await axios.get(`${API_URL}/earnings/admin/system-statistics`);
        if (res.data && typeof res.data.totalSystemRevenue !== 'undefined') {
          setRevenue(res.data.totalSystemRevenue);
        } else {
          setRevenue(0);
        }
      } catch (err) {
        setErrorRevenue('Không thể tải doanh thu');
        setRevenue(0);
      } finally {
        setLoadingRevenue(false);
      }
    };
    fetchRevenue();
  }, []);

  useEffect(() => {
    // Fetch danh sách booking để tính phân bố theo thành phố
    const fetchBookingLocations = async () => {
      setLoadingBookingLocations(true);
      setErrorBookingLocations(null);
      try {
        const res = await axios.get(`${API_URL}/bookings`);
        let bookings = [];
        if (Array.isArray(res.data)) {
          bookings = res.data;
        } else if (Array.isArray(res.data.bookings)) {
          bookings = res.data.bookings;
        }
        // Đếm số booking theo pickupLocation (hoặc location)
        const locationCount = {};
        bookings.forEach(b => {
          // Ưu tiên pickupLocation, fallback sang location
          const loc = (b.pickupLocation || b.location || 'Khác').trim();
          if (!loc) return;
          locationCount[loc] = (locationCount[loc] || 0) + 1;
        });
        // Sắp xếp theo số lượng giảm dần
        const sorted = Object.entries(locationCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4); // Lấy top 4
        const total = bookings.length;
        // Tính phần trăm
        const result = sorted.map(([loc, count]) => ({
          location: loc,
          count,
          percent: total > 0 ? Math.round((count / total) * 100) : 0
        }));
        setBookingLocations(result);
      } catch (err) {
        setErrorBookingLocations('Không thể tải dữ liệu booking location');
        setBookingLocations([]);
      } finally {
        setLoadingBookingLocations(false);
      }
    };
    fetchBookingLocations();
  }, []);

  useEffect(() => {
    // Fetch danh sách xe cho Fleet Status
    const fetchFleetStatus = async () => {
      setLoadingFleetStatus(true);
      setErrorFleetStatus(null);
      try {
        const res = await axios.get(`${API_URL}/cars`);
        let cars = [];
        if (Array.isArray(res.data)) {
          cars = res.data;
        } else if (Array.isArray(res.data.cars)) {
          cars = res.data.cars;
        }
        // Lấy 5 xe đầu tiên, lấy giá từ contract nếu có, nếu không thì kiểm tra pricePerDay, nếu không có thì N/A
        const topCars = cars.slice(0, 5).map(car => {
          let price = 'N/A';
          if (car.contract && typeof car.contract.pricePerDay !== 'undefined' && car.contract.pricePerDay !== null) {
            price = formatCurrency(car.contract.pricePerDay) + '/day';
          } else if (typeof car.pricePerDay !== 'undefined' && car.pricePerDay !== null && !isNaN(car.pricePerDay)) {
            price = formatCurrency(car.pricePerDay) + '/day';
          }
          return {
            name: `${car.brand || ''} ${car.model || ''} ${car.year || ''}`.trim(),
            date: car.updatedAt ? new Date(car.updatedAt).toLocaleDateString() : '',
            status: car.status || 'Unknown',
            price,
          };
        });
        setFleetStatus(topCars);
      } catch (err) {
        setErrorFleetStatus('Không thể tải dữ liệu xe');
        setFleetStatus([]);
      } finally {
        setLoadingFleetStatus(false);
      }
    };
    fetchFleetStatus();
  }, []);

  // Hàm format tiền VND
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  // Thêm logo Google Maps dạng SVG (inline, không cần import file ngoài)
  const googleMapsLogo = (
    <svg width="28" height="28" viewBox="0 0 48 48" style={{ verticalAlign: 'middle', marginLeft: 8 }}>
      <g>
        <circle cx="24" cy="24" r="24" fill="#fff"/>
        <path d="M24 8a8 8 0 0 1 8 8c0 5.25-8 16-8 16s-8-10.75-8-16a8 8 0 0 1 8-8z" fill="#34A853"/>
        <circle cx="24" cy="16" r="5" fill="#4285F4"/>
        <path d="M24 8a8 8 0 0 1 8 8c0 2.5-1.5 6.5-4 11.5V24h-8v3.5C17.5 22.5 16 18.5 16 16a8 8 0 0 1 8-8z" fill="#EA4335"/>
        <path d="M24 8a8 8 0 0 1 8 8c0 2.5-1.5 6.5-4 11.5V24h-8v3.5C17.5 22.5 16 18.5 16 16a8 8 0 0 1 8-8z" fill="#FBBC05" fillOpacity=".5"/>
      </g>
    </svg>
  );

  return (
    <div style={{ background: '#f6f8fb', minHeight: '100vh', padding: '32px 0', height: '100vh', overflow: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#222', marginBottom: 6 }}>Rental Car Dashboard</h1>
          <div style={{ color: '#6b7280', fontSize: 16 }}>Monitor your fleet performance and bookings</div>
        </div>
        {/* Metrics */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <div style={metricCard}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={metricIcon}><i className="fas fa-car"></i></span>
              <span style={labelStyle}>Total Bookings</span>
            </div>
            <div style={valueStyle}>
              {loadingBookings ? '...' : (errorBookings ? 'Error' : totalBookings)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              {/* Trend có thể fetch sau, tạm để trống */}
              <span style={trendStyle(true)}></span>
            </div>
          </div>
          <div style={metricCard}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ ...metricIcon, color: '#22c55e', background: '#e7fbe9' }}><i className="fas fa-users"></i></span>
              <span style={labelStyle}>Active Rentals</span>
            </div>
            <div style={valueStyle}>
              {loadingActiveRentals ? '...' : (errorActiveRentals ? 'Error' : activeRentals)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              {/* Trend có thể fetch sau, tạm để trống */}
              <span style={trendStyle(true)}></span>
            </div>
          </div>
          <div style={metricCard}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ ...metricIcon, color: '#f59e42', background: '#fff7e6' }}><i className="fas fa-chart-line"></i></span>
              <span style={labelStyle}>Fleet Utilization</span>
            </div>
            <div style={valueStyle}>
              {loadingFleetUtilization ? '...' : (errorFleetUtilization ? 'Error' : `${fleetUtilization}%`)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              {/* Trend có thể fetch sau, tạm để trống */}
              <span style={trendStyle(false)}></span>
            </div>
          </div>
          <div style={metricCard}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ ...metricIcon, color: '#a855f7', background: '#f3e8ff' }}><i className="fas fa-dollar-sign"></i></span>
              <span style={labelStyle}>Revenue</span>
            </div>
            <div style={valueStyle}>
              {loadingRevenue ? '...' : (errorRevenue ? 'Error' : formatCurrency(revenue))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              {/* Trend có thể fetch sau, tạm để trống */}
              <span style={trendStyle(true)}></span>
            </div>
          </div>
        </div>
        {/* Booking Locations */}
        <div style={{ ...cardStyle, marginBottom: 32 }}>
          <div style={sectionTitle}>
            <i className="fas fa-map-marker-alt"></i> Booking Locations
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'stretch' }}>
            <div style={{ flex: 1, background: '#e8f0fe', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <i className="fas fa-globe-americas" style={{ fontSize: 48, color: '#4f8cff' }}></i>
                {googleMapsLogo}
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 4 }}>Interactive Map</div>
              <div style={{ color: '#6b7280', fontSize: 15 }}>Booking distribution across cities</div>
            </div>
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
              {loadingBookingLocations ? (
                <div>Loading...</div>
              ) : errorBookingLocations ? (
                <div style={{ color: 'red' }}>{errorBookingLocations}</div>
              ) : bookingLocations.length === 0 ? (
                <div>No data</div>
              ) : (
                bookingLocations.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ minWidth: 48, fontWeight: 700, color: '#222', fontSize: 16 }}>{item.count}</div>
                    {/* Gắn link Google Maps vào tên thành phố, css lại */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        color: '#1565c0',
                        fontWeight: 600,
                        fontSize: 16,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        position: 'relative',
                      }}
                      onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {item.location}
                    </a>
                    <div style={{ flex: 2, background: '#f0f1f6', borderRadius: 6, height: 8, marginRight: 8 }}>
                      <div style={progressBar(item.percent, '#4f8cff')}></div>
                    </div>
                    <div style={{ minWidth: 36, textAlign: 'right', fontWeight: 600, color: '#222' }}>{item.percent}%</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {/* Bottom Widgets */}
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Task Management */}
          <div style={{ ...cardStyle, flex: 1, minWidth: 260 }}>
            <div style={sectionTitle}><i className="fas fa-tasks"></i> Task Management</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                {label:'Inspect Vehicle #BMW-2023',p:'high',done:false},
                {label:'Process Insurance Claim',p:'high',done:false},
                {label:'Schedule Maintenance for Fleet',p:'medium',done:true},
                {label:'Update Pricing for Weekend',p:'low',done:false},
                {label:'Review Customer Feedback',p:'medium',done:true},
                {label:'Prepare Monthly Report',p:'high',done:false},
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: item.done ? 0.6 : 1, textDecoration: item.done ? 'line-through' : 'none' }}>
                  <input type="checkbox" checked={item.done} readOnly style={{ accentColor: '#4f8cff', width: 18, height: 18 }} />
                  <span style={{ flex: 1, fontSize: 15 }}>{item.label}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 6, fontWeight: 600, fontSize: 13, background: item.p==='high'?'#fee2e2':item.p==='medium'?'#fef9c3':'#d1fae5', color: item.p==='high'?'#ef4444':item.p==='medium'?'#eab308':'#22c55e' }}>{item.p.charAt(0).toUpperCase()+item.p.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Fleet Status */}
          <div style={{ ...cardStyle, flex: 1.2, minWidth: 320 }}>
            <div style={sectionTitle}><i className="fas fa-car"></i> Fleet Status</div>
            {/* Có thể hiển thị tổng số xe hoặc tổng số xe đang hoạt động ở đây nếu muốn */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              {loadingFleetStatus ? (
                <div>Loading...</div>
              ) : errorFleetStatus ? (
                <div style={{ color: 'red' }}>{errorFleetStatus}</div>
              ) : fleetStatus.length === 0 ? (
                <div>No data</div>
              ) : (
                fleetStatus.map((item, idx) => {
                  // Màu sắc theo trạng thái
                  let c = '#22c55e', bg = '#d1fae5';
                  if ((item.status || '').toLowerCase() === 'rented') { c = '#4f8cff'; bg = '#dbeafe'; }
                  else if ((item.status || '').toLowerCase() === 'maintenance') { c = '#f59e42'; bg = '#fef9c3'; }
                  else if ((item.status || '').toLowerCase() === 'available') { c = '#22c55e'; bg = '#d1fae5'; }
                  else { c = '#6b7280'; bg = '#f3f4f6'; }
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f8fb', borderRadius: 8, padding: '10px 14px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{item.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'inline-block', background: bg, color: c, fontWeight: 700, borderRadius: 6, padding: '2px 10px', fontSize: 13, marginBottom: 2 }}>{item.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              style={{ width: '100%', background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              onClick={() => window.location.href = 'http://localhost:3000/rent-car'}
            >
              View All Vehicles
            </button>
          </div>
          {/* Weather & Quick Actions */}
          <div style={{ ...cardStyle, flex: 1, minWidth: 260, background: 'linear-gradient(135deg,#e0e7ff 0%,#f0f1f6 100%)' }}>
            <div style={sectionTitle}><i className="fas fa-sun"></i> Weather & Quick Actions</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#4f8cff' }}>72°F</div>
              <div>
                <div style={{ fontWeight: 600, color: '#222', fontSize: 15 }}>Partly Cloudy</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Perfect weather for car rentals!</div>
              </div>
              <i className="fas fa-cloud-sun" style={{ fontSize: 32, color: '#4f8cff' }}></i>
            </div>
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 18 }}><i className="fas fa-wind"></i> Wind: 8 mph</div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 12, marginBottom: 18 }}>
              <div style={{ fontWeight: 600, color: '#222', fontSize: 15, marginBottom: 6 }}><i className="fas fa-comments"></i> Customer Support</div>
              <div style={{ color: '#222', fontSize: 14, marginBottom: 4 }}><strong>John D.</strong> Need help with booking extension</div>
              <div style={{ color: '#222', fontSize: 14 }}><strong>Sarah M.</strong> Thank you for the great service!</div>
            </div>
            <button style={{ width: '100%', background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Open Chat Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
} 