import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/configApi';
import './EarningsManagement.css';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { showErrorToast, showSuccessToast } from '../notification/notification';

const EarningsManagement = () => {
    const [wallets, setWallets] = useState([]);
    const [filteredWallets, setFilteredWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statistics, setStatistics] = useState({
        totalSystemRevenue: 0,
        totalSystemDebt: 0,
        totalTransactionVolume: 0,
        activeDrivers: 0,
        monthlyPercentageChange: 0
    });

    // Calculate total profit from wallets
    const totalSystemMoney = wallets.reduce((sum, wallet) => sum + (wallet.totalProfit || 0), 0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch wallets
                const walletsRes = await axios.get(`${API_URL}/admin/owner-wallets`);
                const walletsData = walletsRes.data || [];
                setWallets(walletsData);
                setFilteredWallets(walletsData);
                
                // Fetch system statistics
                const statsRes = await axios.get(`${API_URL}/earnings/admin/system-statistics`);
                const statsData = statsRes.data || {};
                
                setStatistics({
                    totalSystemRevenue: statsData.totalSystemRevenue || 0,
                    totalSystemDebt: statsData.totalSystemDebt || 0,
                    totalTransactionVolume: statsData.totalTransactionVolume || 0,
                    activeDrivers: statsData.activeDrivers || 0,
                    monthlyPercentageChange: statsData.monthlyPercentageChange || 0
                });
            } catch (err) {
                setError('Không thể tải dữ liệu!');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = wallets.filter(wallet =>
            (wallet.fullName && wallet.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (wallet.email && wallet.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredWallets(filtered);
    }, [searchTerm, wallets]);

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || isNaN(amount)) return '0 ₫';
        return amount.toLocaleString('vi-VN') + ' ₫';
    };

    const exportToPDF = () => {
        try {
            const currentDate = new Date().toLocaleDateString('vi-VN');
            
            // Chuẩn bị dữ liệu bảng
            const tableBody = [
                // Header row
                [
                    { text: 'Họ tên', style: 'tableHeader' },
                    { text: 'Email', style: 'tableHeader' },
                    { text: 'Tiền trên hệ thống', style: 'tableHeader' },
                    { text: 'Tiền nợ hệ thống', style: 'tableHeader' },
                    { text: 'Tổng tiền nhận từ hệ thống', style: 'tableHeader' },
                    { text: 'Trạng thái', style: 'tableHeader' }
                ]
            ];

            // Data rows
            filteredWallets.forEach(wallet => {
                const status = wallet.totalDebt > 0 ? 'Có nợ' : 
                              wallet.totalProfit > 0 ? 'Hoạt động' : 'Không hoạt động';
                
                tableBody.push([
                    { text: wallet.fullName || wallet.ownerId || 'N/A', alignment: 'left', margin: [4,4,4,4] },
                    { text: wallet.email || 'N/A', alignment: 'left', margin: [4,4,4,4] },
                    { text: formatCurrency(wallet.totalProfit), alignment: 'right', margin: [4,4,4,4] },
                    { text: formatCurrency(wallet.totalDebt), alignment: 'right', margin: [4,4,4,4] },
                    { text: formatCurrency(wallet.balance), alignment: 'right', margin: [4,4,4,4] },
                    { text: status, alignment: 'center', margin: [4,4,4,4] }
                ]);
            });

            // Nếu không có dữ liệu
            if (filteredWallets.length === 0) {
                tableBody.push([
                    { text: 'Không có dữ liệu', colSpan: 6, alignment: 'center', margin: [4,8,4,8] },
                    {}, {}, {}, {}, {}
                ]);
            }

            const docDefinition = {
                content: [
                    { 
                        text: 'BÁO CÁO QUẢN LÝ LỢI NHUẬN', 
                        style: 'header', 
                        alignment: 'center', 
                        margin: [0, 0, 0, 20] 
                    },
                    { 
                        text: `Ngày xuất: ${currentDate}`, 
                        alignment: 'right', 
                        margin: [0, 0, 0, 20] 
                    },
                    // Statistics summary
                    {
                        text: 'TỔNG QUAN HỆ THỐNG',
                        style: 'sectionHeader',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        columns: [
                            {
                                width: '50%',
                                text: [
                                    { text: 'Tổng tiền trong hệ thống: ', bold: true },
                                    { text: formatCurrency(totalSystemMoney) }
                                ]
                            },
                            {
                                width: '50%',
                                text: [
                                    { text: 'Tổng tiền web nhận được: ', bold: true },
                                    { text: formatCurrency(statistics.totalSystemRevenue) }
                                ]
                            }
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        columns: [
                            {
                                width: '50%',
                                text: [
                                    { text: 'Tổng tiền nợ: ', bold: true },
                                    { text: formatCurrency(statistics.totalSystemDebt) }
                                ]
                            },
                            {
                                width: '50%',
                                text: [
                                    { text: 'Số tài xế hoạt động: ', bold: true },
                                    { text: statistics.activeDrivers.toString() }
                                ]
                            }
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'CHI TIẾT VÍ CHỦ XE',
                        style: 'sectionHeader',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['20%', '25%', '16%', '16%', '16%', '7%'],
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
                    sectionHeader: {
                        fontSize: 14,
                        bold: true,
                        color: '#34495e',
                        margin: [0, 15, 0, 10]
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
                pageOrientation: 'landscape'
            };

            const pdfDoc = pdfMake.createPdf(docDefinition);
            const fileName = `earnings_management_${currentDate.replace(/\//g, '-')}.pdf`;
            
            // Vừa tải xuống vừa mở tab mới
            pdfDoc.download(fileName);
            pdfDoc.open();
            
            showSuccessToast('Đã xuất PDF thành công!');
        } catch (error) {
            console.error('PDF export error:', error);
            showErrorToast('Xuất PDF thất bại!');
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'ACTIVE':
                return <span className="status-badge status-active">Hoạt động</span>;
            case 'DEBT':
                return <span className="status-badge status-debt">Có nợ</span>;
            default:
                return <span className="status-badge status-inactive">Không hoạt động</span>;
        }
    };

    const getStatusFromWallet = (wallet) => {
        if (wallet.totalDebt > 0) return 'DEBT';
        if (wallet.totalProfit > 0) return 'ACTIVE';
        return 'INACTIVE';
    };

    const formatPercentageChange = (change) => {
        const isPositive = change >= 0;
        const sign = isPositive ? '+' : '';
        return {
            text: `${sign}${change.toFixed(1)}% so với tháng trước`,
            className: isPositive ? 'positive' : 'negative'
        };
    };

    return (
        <div className="earnings-management">
            <div className="earnings-header">
                <div>
                    <h1>Quản lý lợi nhuận</h1>
                    <p>Theo dõi và quản lý thu nhập, nợ và chi trả cho tài xế</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon green">
                        <span>$</span>
                    </div>
                    <div className="stat-content">
                        <h3>Tổng tiền trong hệ thống</h3>
                        <p className="stat-value">{formatCurrency(totalSystemMoney)}</p>
                        <span className={`stat-change ${formatPercentageChange(statistics.monthlyPercentageChange).className}`}>
                            {formatPercentageChange(statistics.monthlyPercentageChange).text}
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon red">
                        <span>📉</span>
                    </div>
                    <div className="stat-content">
                        <h3>Tổng tiền nợ</h3>
                        <p className="stat-value">{formatCurrency(statistics.totalSystemDebt)}</p>
                        <span className="stat-change negative">Nợ tích lũy từ giao dịch cash</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">
                        <span>📈</span>
                    </div>
                    <div className="stat-content">
                        <h3>Tổng tiền web nhận được</h3>
                        <p className="stat-value">{formatCurrency(statistics.totalSystemRevenue)}</p>
                        <span className="stat-change positive">Phí 2% từ tất cả giao dịch</span>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-section">
                <div className="table-header">
                    <h3>Quản lý lợi nhuận</h3>
                    <div className="table-controls">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="search-icon"></span>
                        </div>
                        <button className="export-btn" onClick={exportToPDF}>
                            <i className="fas fa-file-pdf"></i> Xuất PDF
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    <div className="table-container">
                        <table className="earnings-table">
                            <thead>
                                <tr>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>Tiền trên hệ thống</th>
                                    <th>Tiền nợ hệ thống</th>
                                    <th>Tổng tiền nhận từ hệ thống</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWallets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu ví owner.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWallets.map(w => (
                                        <tr key={w.ownerId}>
                                            <td className="name-cell">{w.fullName || w.ownerId}</td>
                                            <td>{w.email || ''}</td>
                                            <td className="amount-positive">{formatCurrency(w.totalProfit)}</td>
                                            <td className="amount-negative">{formatCurrency(w.totalDebt)}</td>
                                            <td className="amount-neutral">{formatCurrency(w.balance)}</td>
                                            <td>{getStatusBadge(getStatusFromWallet(w))}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EarningsManagement; 