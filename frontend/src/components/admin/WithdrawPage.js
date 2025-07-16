import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/configApi';
import { showSuccessToast, showErrorToast } from '../notification/notification';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Đang chờ', color: '#ffe082', text: '#b26a00' },
    { value: 'approved', label: 'Đã duyệt', color: '#b2f2bb', text: '#087f23' },
    { value: 'rejected', label: 'Từ chối', color: '#ffcdd2', text: '#c62828' },
    { value: 'completed', label: 'Hoàn thành', color: '#c8e6c9', text: '#388e3c' }
];

const WithdrawPage = () => {
    const [withdraws, setWithdraws] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editStatus, setEditStatus] = useState({});
    const [saving, setSaving] = useState({});
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        totalAmount: 0,
        totalChange: 0,
        pendingChange: 0,
        completedChange: 0,
        amountChange: 0
    });

    useEffect(() => {
        const fetchWithdraws = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/owner-withdraw`);
                const data = res.data || [];
                // Sắp xếp theo ngày yêu cầu mới nhất trên cùng
                const sortedData = data.sort((a, b) => {
                    const dateA = new Date(a.requestedAt);
                    const dateB = new Date(b.requestedAt);
                    return dateB - dateA; // Descending order (newest first)
                });
                setWithdraws(sortedData);

                // Tính thống kê
                const total = data.length;
                const pending = data.filter(w => w.status === 'pending').length;
                const completed = data.filter(w => w.status === 'completed').length;
                const totalAmount = data.reduce((sum, w) => sum + (w.amount || 0), 0);

                // Tính thống kê tháng trước
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                const lastMonthData = data.filter(w => {
                    if (!w.requestedAt) return false;
                    const reqDate = new Date(w.requestedAt);
                    return reqDate.getMonth() === lastMonth.getMonth() && reqDate.getFullYear() === lastMonth.getFullYear();
                });
                const thisMonthData = data.filter(w => {
                    if (!w.requestedAt) return false;
                    const reqDate = new Date(w.requestedAt);
                    const now = new Date();
                    return reqDate.getMonth() === now.getMonth() && reqDate.getFullYear() === now.getFullYear();
                });

                const lastMonthTotal = lastMonthData.length;
                const lastMonthPending = lastMonthData.filter(w => w.status === 'pending').length;
                const lastMonthCompleted = lastMonthData.filter(w => w.status === 'completed').length;
                const lastMonthAmount = lastMonthData.reduce((sum, w) => sum + (w.amount || 0), 0);

                const thisMonthTotal = thisMonthData.length;
                const thisMonthPending = thisMonthData.filter(w => w.status === 'pending').length;
                const thisMonthCompleted = thisMonthData.filter(w => w.status === 'completed').length;
                const thisMonthAmount = thisMonthData.reduce((sum, w) => sum + (w.amount || 0), 0);

                // Tính phần trăm thay đổi
                const calculatePercentChange = (current, previous) => {
                    if (previous === 0) return current > 0 ? 100 : 0;
                    return Math.round(((current - previous) / previous) * 100);
                };

                const totalChange = calculatePercentChange(thisMonthTotal, lastMonthTotal);
                const pendingChange = calculatePercentChange(thisMonthPending, lastMonthPending);
                const completedChange = calculatePercentChange(thisMonthCompleted, lastMonthCompleted);
                const amountChange = calculatePercentChange(thisMonthAmount, lastMonthAmount);

                setStats({ 
                    total, 
                    pending, 
                    completed, 
                    totalAmount,
                    totalChange,
                    pendingChange,
                    completedChange,
                    amountChange
                });
            } catch (err) {
                setError('Không thể tải dữ liệu rút tiền!');
            } finally {
                setLoading(false);
            }
        };
        fetchWithdraws();
    }, []);

    const handleStatusChange = (requestId, value) => {
        setEditStatus(prev => ({ ...prev, [requestId]: value }));
        handleSaveStatus(requestId, value);
    };

    const handleSaveStatus = async (requestId, statusOverride) => {
        setSaving(prev => ({ ...prev, [requestId]: true }));
        try {
            const status = statusOverride ?? editStatus[requestId];
            await axios.patch(`${API_URL}/owner-withdraw/${requestId}/status`, { status });
            setWithdraws(withdraws => withdraws.map(w => w.requestId === requestId ? { ...w, status } : w));
            showSuccessToast('Cập nhật trạng thái thành công!');
        } catch {
            showErrorToast('Cập nhật trạng thái thất bại!');
        } finally {
            setSaving(prev => ({ ...prev, [requestId]: false }));
        }
    };

    const filteredWithdraws = withdraws.filter(w =>
        (!search || (w.ownerFullName && w.ownerFullName.toLowerCase().includes(search.toLowerCase())) || (w.ownerEmail && w.ownerEmail.toLowerCase().includes(search.toLowerCase())))
        && (!filter || w.status === filter)
    );

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || isNaN(amount)) return '0 ₫';
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const exportToPDF = () => {
        try {
            const currentDate = new Date().toLocaleDateString('vi-VN');
            
            // Chuẩn bị dữ liệu bảng với đủ 9 cột
            const tableBody = [
                // Header row
                [
                    { text: 'Ngày yêu cầu', style: 'tableHeader' },
                    { text: 'Chủ xe', style: 'tableHeader' },
                    { text: 'Email', style: 'tableHeader' },
                    { text: 'Số TK', style: 'tableHeader' },
                    { text: 'Ngân hàng', style: 'tableHeader' },
                    { text: 'Số tiền', style: 'tableHeader' },
                    { text: 'Trạng thái', style: 'tableHeader' },
                    { text: 'Ghi chú', style: 'tableHeader' },
                    { text: 'Xác nhận', style: 'tableHeader' }
                ]
            ];

            // Data rows - đảm bảo mỗi row có đúng 9 cột
            filteredWithdraws.forEach(w => {
                tableBody.push([
                    { text: w.requestedAt ? new Date(w.requestedAt).toLocaleString('vi-VN') : 'N/A', alignment: 'left', margin: [4,4,4,4] },
                    { text: w.ownerFullName || w.ownerId || 'N/A', alignment: 'left', margin: [4,4,4,4] },
                    { text: w.ownerEmail || 'N/A', alignment: 'left', margin: [4,4,4,4] },
                    { text: w.accountNumber || 'Chưa cập nhật', alignment: 'left', margin: [4,4,4,4] },
                    { text: w.bankName || 'Chưa cập nhật', alignment: 'left', margin: [4,4,4,4] },
                    { text: w.amount ? (w.amount.toLocaleString('vi-VN') + ' ₫') : '0 ₫', alignment: 'left', margin: [4,4,4,4] },
                    { text: STATUS_OPTIONS.find(opt => opt.value === w.status)?.label || w.status || 'N/A', alignment: 'left', margin: [4,4,4,4] },
                    { text: w.note || 'N/A', alignment: 'left', margin: [4,4,4,4] },
                    { text: w.sign ? 'Đã xác nhận' : 'Chờ xác nhận', alignment: 'left', margin: [4,4,4,4] }
                ]);
            });

            // Nếu không có dữ liệu
            if (filteredWithdraws.length === 0) {
                tableBody.push([
                    { text: 'Không có dữ liệu', colSpan: 9, alignment: 'center', margin: [4,8,4,8] },
                    {}, {}, {}, {}, {}, {}, {}, {}
                ]);
            }

            const docDefinition = {
                content: [
                    { 
                        text: 'DANH SÁCH YÊU CẦU RÚT TIỀN', 
                        style: 'header', 
                        alignment: 'center', 
                        margin: [0, 0, 0, 20] 
                    },
                    { 
                        text: `Ngày xuất: ${currentDate}`, 
                        alignment: 'right', 
                        margin: [0, 0, 0, 10] 
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['10%', '12%', '16%', '12%', '12%', '10%', '10%', '10%', '8%'], // Đảm bảo tổng = 100%
                            body: tableBody
                        },
                        layout: {
                            fillColor: function (rowIndex) { 
                                return rowIndex === 0 ? '#f0f0f0' : null; 
                            },
                            hLineWidth: function () { return 1; },
                            vLineWidth: function () { return 1; },
                            hLineColor: function () { return '#cccccc'; },
                            vLineColor: function () { return '#cccccc'; }
                        }
                    }
                ],
                styles: {
                    header: { 
                        fontSize: 18, 
                        bold: true, 
                        color: '#2c3e50' 
                    },
                    tableHeader: { 
                        bold: true, 
                        fontSize: 11, 
                        color: '#2c3e50', 
                        alignment: 'center' 
                    }
                },
                defaultStyle: { 
                    fontSize: 9 
                },
                pageMargins: [40, 50, 40, 50],
                pageSize: 'A4',
                pageOrientation: 'landscape' // Để bảng rộng hơn
            };

            const pdfDoc = pdfMake.createPdf(docDefinition);
            const fileName = `withdraw_requests_${currentDate.replace(/\//g, '-')}.pdf`;
            
            // Vừa tải xuống vừa mở tab mới
            pdfDoc.download(fileName);
            pdfDoc.open();
            
            showSuccessToast('Đã xuất PDF thành công!');
        } catch (error) {
            console.error('PDF export error:', error);
            showErrorToast('Xuất PDF thất bại!');
        }
    };

    return (
        <div className="admin-content-page" style={{ background: '#f8f9fb', minHeight: '100vh', padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 4 }}>Quản lý rút tiền</h2>
            <div style={{ color: '#666', marginBottom: 32 }}>Theo dõi và xử lý các yêu cầu rút tiền từ chủ xe</div>
            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
                    <div style={{ color: '#888', fontWeight: 500 }}>Tổng yêu cầu</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.total}</div>
                    <div style={{ color: stats.totalChange >= 0 ? '#27ae60' : '#e74c3c', fontSize: 14, marginTop: 4 }}>
                        {stats.totalChange >= 0 ? '+' : ''}{stats.totalChange}% so với tháng trước
                    </div>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
                    <div style={{ color: '#888', fontWeight: 500 }}>Đang chờ xử lý</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.pending}</div>
                    <div style={{ color: stats.pendingChange >= 0 ? '#27ae60' : '#e74c3c', fontSize: 14, marginTop: 4 }}>
                        {stats.pendingChange >= 0 ? '+' : ''}{stats.pendingChange}% so với tháng trước
                    </div>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
                    <div style={{ color: '#888', fontWeight: 500 }}>Đã hoàn thành</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.completed}</div>
                    <div style={{ color: stats.completedChange >= 0 ? '#27ae60' : '#e74c3c', fontSize: 14, marginTop: 4 }}>
                        {stats.completedChange >= 0 ? '+' : ''}{stats.completedChange}% so với tháng trước
                    </div>
                </div>
                <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
                    <div style={{ color: '#888', fontWeight: 500 }}>Tổng tiền rút</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{formatCurrency(stats.totalAmount)}</div>
                    <div style={{ color: stats.amountChange >= 0 ? '#27ae60' : '#e74c3c', fontSize: 14, marginTop: 4 }}>
                        {stats.amountChange >= 0 ? '+' : ''}{stats.amountChange}% so với tháng trước
                    </div>
                </div>
            </div>
            {/* Table */}
            <div style={{ background: '#eaf1fb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                    />
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                    >
                        <option value="">Tất cả</option>
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <button onClick={exportToPDF} style={{ padding: '8px 16px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 500, marginLeft: 8 }}>
                        <i className="fas fa-file-pdf"></i> Xuất PDF
                    </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                    <thead>
                        <tr style={{ background: '#f5f7fa' }}>
                            <th style={{ padding: 12 }}>Ngày yêu cầu</th>
                            <th>Chủ xe</th>
                            <th>Email</th>
                            <th>Số tài khoản</th>
                            <th>Tên ngân hàng</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                            <th>Ghi chú</th>
                            <th>Xác nhận</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWithdraws.length === 0 ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: 24 }}>Không có yêu cầu rút tiền nào.</td></tr>
                        ) : filteredWithdraws.map(w => (
                            <tr key={w.requestId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: 10 }}>{w.requestedAt ? new Date(w.requestedAt).toLocaleTimeString('vi-VN') + ' ' + new Date(w.requestedAt).toLocaleDateString('vi-VN') : ''}</td>
                                <td>{w.ownerFullName || w.ownerId}</td>
                                <td>{w.ownerEmail || ''}</td>
                                <td style={{ color: '#2e7d32', fontWeight: 500 }}>{w.accountNumber || 'Chưa cập nhật'}</td>
                                <td style={{ color: '#1565c0', fontWeight: 500 }}>{w.bankName || 'Chưa cập nhật'}</td>
                                <td style={{ color: '#1976d2', fontWeight: 600 }}>{formatCurrency(w.amount)}</td>
                                <td>
                                    <select
                                        value={editStatus[w.requestId] ?? w.status}
                                        onChange={e => handleStatusChange(w.requestId, e.target.value)}
                                        style={{ padding: 6, borderRadius: 8, fontWeight: 600, fontSize: 14, border: '1px solid #ccc', background: '#f5f7fa' }}
                                        disabled={saving[w.requestId] || w.sign}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>{w.note || ''}</td>
                                <td>
                                    {w.sign ? (
                                        <span style={{ color: '#27ae60', fontWeight: 600, background: '#eafaf1', padding: '4px 12px', borderRadius: 12 }}>✓ Đã xác nhận</span>
                                    ) : (
                                        <span style={{ color: '#b26a00', fontWeight: 600, background: '#fffbe6', padding: '4px 12px', borderRadius: 12 }}>Chờ xác nhận</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WithdrawPage; 