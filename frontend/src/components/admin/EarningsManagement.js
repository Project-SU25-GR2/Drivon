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
                setError('Unable to load data!');
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
                    { text: 'Full Name', style: 'tableHeader' },
                    { text: 'Email', style: 'tableHeader' },
                    { text: 'Money in System', style: 'tableHeader' },
                    { text: 'System Debt', style: 'tableHeader' },
                    { text: 'Total Received from System', style: 'tableHeader' },
                    { text: 'Status', style: 'tableHeader' }
                ]
            ];

            // Data rows
            filteredWallets.forEach(wallet => {
                const status = wallet.totalDebt > 0 ? 'Has Debt' : 
                              wallet.totalProfit > 0 ? 'Active' : 'Inactive';
                
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
                    { text: 'No data available', colSpan: 6, alignment: 'center', margin: [4,8,4,8] },
                    {}, {}, {}, {}, {}
                ]);
            }

            const docDefinition = {
                content: [
                    { 
                        text: 'EARNINGS MANAGEMENT REPORT', 
                        style: 'header', 
                        alignment: 'center', 
                        margin: [0, 0, 0, 20] 
                    },
                    { 
                        text: `Export date: ${currentDate}`, 
                        alignment: 'right', 
                        margin: [0, 0, 0, 20] 
                    },
                    // Statistics summary
                    {
                        text: 'SYSTEM OVERVIEW',
                        style: 'sectionHeader',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        columns: [
                            {
                                width: '50%',
                                text: [
                                    { text: 'Total money in system: ', bold: true },
                                    { text: formatCurrency(totalSystemMoney) }
                                ]
                            },
                            {
                                width: '50%',
                                text: [
                                    { text: 'Total website revenue: ', bold: true },
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
                                    { text: 'Total debt: ', bold: true },
                                    { text: formatCurrency(statistics.totalSystemDebt) }
                                ]
                            },
                            {
                                width: '50%',
                                text: [
                                    { text: 'Active drivers: ', bold: true },
                                    { text: statistics.activeDrivers.toString() }
                                ]
                            }
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'CAR OWNER WALLET DETAILS',
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
            
            showSuccessToast('PDF exported successfully!');
        } catch (error) {
            console.error('PDF export error:', error);
            showErrorToast('PDF export failed!');
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'ACTIVE':
                return <span className="status-badge status-active">No Debt</span>;
            case 'DEBT':
                return <span className="status-badge status-debt">Has Debt</span>;
            default:
                return <span className="status-badge status-inactive">Paid</span>;
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
            text: `${sign}${change.toFixed(1)}% compared to last month`,
            className: isPositive ? 'positive' : 'negative'
        };
    };

    return (
        <div className="earnings-management">
            <div className="earnings-header">
                <div>
                    <h1>Earnings Management</h1>
                    <p>Monitor and manage income, debt and payments for drivers</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon green">
                        <span>$</span>
                    </div>
                    <div className="stat-content">
                        <h3>Total Money in System</h3>
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
                        <h3>Total Debt</h3>
                        <p className="stat-value">{formatCurrency(statistics.totalSystemDebt)}</p>
                        <span className="stat-change negative">Accumulated debt from cash transactions</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">
                        <span>📈</span>
                    </div>
                    <div className="stat-content">
                        <h3>Total Website Revenue</h3>
                        <p className="stat-value">{formatCurrency(statistics.totalSystemRevenue)}</p>
                        <span className="stat-change positive">2% fee from all transactions</span>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-section">
                <div className="table-header">
                    <h3>Earnings Management</h3>
                    <div className="table-controls">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="search-icon"></span>
                        </div>
                        <button className="export-btn" onClick={exportToPDF}>
                            <i className="fas fa-file-pdf"></i> Export PDF
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    <div className="table-container">
                        <table className="earnings-table">
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Money in System</th>
                                    <th>System Debt</th>
                                    <th>Total Received from System</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWallets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            {searchTerm ? 'No matching results found' : 'No owner wallet data available.'}
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