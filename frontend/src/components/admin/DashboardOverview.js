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
            <div style={valueStyle}>1,234</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <span style={trendStyle(true)}>+8%</span>
            </div>
          </div>
          <div style={metricCard}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ ...metricIcon, color: '#f59e42', background: '#fff7e6' }}><i className="fas fa-chart-line"></i></span>
              <span style={labelStyle}>Fleet Utilization</span>
            </div>
            <div style={valueStyle}>87%</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <span style={trendStyle(false)}>-3%</span>
            </div>
          </div>
          <div style={metricCard}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ ...metricIcon, color: '#a855f7', background: '#f3e8ff' }}><i className="fas fa-dollar-sign"></i></span>
              <span style={labelStyle}>Revenue</span>
            </div>
            <div style={valueStyle}>$45,678</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <span style={trendStyle(true)}>+15%</span>
            </div>
          </div>
        </div>
        {/* Booking Locations */}
        <div style={{ ...cardStyle, marginBottom: 32 }}>
          <div style={sectionTitle}><i className="fas fa-map-marker-alt"></i> Booking Locations</div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'stretch' }}>
            <div style={{ flex: 1, background: '#e8f0fe', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
              <i className="fas fa-globe-americas" style={{ fontSize: 48, color: '#4f8cff', marginBottom: 12 }}></i>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 4 }}>Interactive Map</div>
              <div style={{ color: '#6b7280', fontSize: 15 }}>Booking distribution across cities</div>
            </div>
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
              {[{v:'2.5K',l:'Bookings from New York',p:85,c:'#4f8cff'},{v:'1.8K',l:'Bookings from Los Angeles',p:70,c:'#22c55e'},{v:'1.2K',l:'Bookings from Chicago',p:55,c:'#f59e42'},{v:'950',l:'Bookings from Miami',p:40,c:'#a855f7'}].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ minWidth: 48, fontWeight: 700, color: '#222', fontSize: 16 }}>{item.v}</div>
                  <div style={{ flex: 1, color: '#6b7280', fontSize: 15 }}>{item.l}</div>
                  <div style={{ flex: 2, background: '#f0f1f6', borderRadius: 6, height: 8, marginRight: 8 }}>
                    <div style={progressBar(item.p, item.c)}></div>
                  </div>
                  <div style={{ minWidth: 36, textAlign: 'right', fontWeight: 600, color: '#222' }}>{item.p}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Business Metrics */}
        <div style={{ ...cardStyle, marginBottom: 32 }}>
          <div style={sectionTitle}>Business Metrics</div>
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', alignItems: 'center' }}>
            {[{v:75,l:'New Customers',c:'#4f8cff'},{v:60,l:'Repeat Bookings',c:'#22c55e'},{v:45,l:'Fleet Available',c:'#f59e42'}].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <svg style={circleChart(item.c)} viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#f0f1f6" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke={item.c} strokeWidth="4" strokeDasharray={`${item.v},100`} strokeLinecap="round" />
                  <text x="18" y="22" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#222">{item.v}%</text>
                </svg>
                <div style={{ marginTop: 8, color: '#6b7280', fontWeight: 600 }}>{item.l}</div>
              </div>
            ))}
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
            <div style={{ fontWeight: 700, fontSize: 22, color: '#22c55e', marginBottom: 18 }}>$12,450 Today</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              {[
                {name:'BMW X5 2023',date:'Dec 15',status:'Available',price:'$89/day',c:'#22c55e',bg:'#d1fae5'},
                {name:'Mercedes C-Class',date:'Dec 14',status:'Rented',price:'$75/day',c:'#4f8cff',bg:'#dbeafe'},
                {name:'Audi A4 2022',date:'Dec 13',status:'Maintenance',price:'$65/day',c:'#f59e42',bg:'#fef9c3'},
                {name:'Tesla Model 3',date:'Dec 12',status:'Available',price:'$95/day',c:'#22c55e',bg:'#d1fae5'},
                {name:'Toyota Camry',date:'Dec 11',status:'Rented',price:'$45/day',c:'#4f8cff',bg:'#dbeafe'},
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f8fb', borderRadius: 8, padding: '10px 14px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{item.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', background: item.bg, color: item.c, fontWeight: 700, borderRadius: 6, padding: '2px 10px', fontSize: 13, marginBottom: 2 }}>{item.status}</span>
                    <div style={{ fontWeight: 600, color: '#222', fontSize: 14 }}>{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ width: '100%', background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>View All Vehicles</button>
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