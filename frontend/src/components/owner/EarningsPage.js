import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./EarningsPage.css";
import { API_URL } from '../../api/configApi';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { showErrorToast, showSuccessToast } from '../notification/notification';

pdfMake.vfs = pdfMake.vfs || {};

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PAID', label: 'Paid' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
const EarningsPage = () => {
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingPayouts: 0,
        lastMonthEarnings: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        const fetchEarnings = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.userId) {
                setError("User not found. Please log in.");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/earnings/owner/${user.userId}`, {
                    params: { month: selectedMonth }
                });
                const data = response.data;
                setEarnings({
                    totalEarnings: data.totalEarnings,
                    monthlyEarnings: data.monthlyEarnings,
                    pendingPayouts: data.pendingPayouts,
                    lastMonthEarnings: data.lastMonthEarnings,
                });
                setTransactions(data.transactions);
                setError(null);
            } catch (err) {
                setError("Failed to fetch earnings data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, [selectedMonth]);

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const getMonthYear = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + '-02'); // Use 2nd day to avoid timezone issues
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    const getLastMonthYear = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + '-02');
        date.setMonth(date.getMonth() - 1);
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    // Filtered transactions
    const filteredTransactions = transactions.filter((tx) => {
        // Lọc đúng tháng/năm
        const matchesMonth = !selectedMonth || (
            tx.date && new Date(tx.date).toISOString().slice(0, 7) === selectedMonth
        );
        const matchesStatus = !statusFilter || (tx.status && tx.status.toLowerCase() === statusFilter.toLowerCase());
        const matchesSearch = !search ||
            (tx.carName && tx.carName.toLowerCase().includes(search.toLowerCase())) ||
            (tx.renterName && tx.renterName.toLowerCase().includes(search.toLowerCase()));
        return matchesMonth && matchesStatus && matchesSearch;
    });

    const exportToPDF = () => {
        try {
            const currentDate = new Date().toLocaleDateString('vi-VN');
            const selectedMonthYear = getMonthYear(selectedMonth);
            
            // Prepare transactions table data
            const tableBody = [
                [
                    { text: 'Date', style: 'tableHeader' },
                    { text: 'Car', style: 'tableHeader' },
                    { text: 'Renter', style: 'tableHeader' },
                    { text: 'Amount', style: 'tableHeader' },
                    { text: 'Status', style: 'tableHeader' }
                ]
            ];

            // Add transaction data to table
            if (filteredTransactions && filteredTransactions.length > 0) {
                filteredTransactions.forEach((transaction) => {
                    tableBody.push([
                        transaction.date ? new Date(transaction.date).toLocaleDateString('vi-VN') : 'N/A',
                        transaction.carName || 'N/A',
                        transaction.renterName || 'N/A',
                        formatCurrency(transaction.amount || 0),
                        transaction.status || 'N/A'
                    ]);
                });
            } else {
                tableBody.push([
                    { text: 'No transactions for this month.', colSpan: 5, alignment: 'center' }
                ]);
            }

            // Calculate percentage change
            const percentageChange = earnings.lastMonthEarnings > 0 
                ? ((earnings.monthlyEarnings - earnings.lastMonthEarnings) / earnings.lastMonthEarnings * 100).toFixed(1)
                : 0;

            // PDF document definition
            const docDefinition = {
                content: [
                    {
                        text: 'EARNINGS REPORT',
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
                        text: `Period: ${selectedMonthYear}`,
                        style: 'subheader',
                        alignment: 'center',
                        margin: [0, 0, 0, 30]
                    },
                    {
                        text: 'Earnings Overview',
                        style: 'sectionHeader',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        columns: [
                            {
                                text: [
                                    { text: 'Total Earnings: ', bold: true },
                                    { text: formatCurrency(earnings.totalEarnings) }
                                ],
                                style: 'statText'
                            },
                            {
                                text: [
                                    { text: 'This Month: ', bold: true },
                                    { text: formatCurrency(earnings.monthlyEarnings) }
                                ],
                                style: 'statText'
                            }
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        columns: [
                            {
                                text: [
                                    { text: 'Pending Payouts: ', bold: true },
                                    { text: formatCurrency(earnings.pendingPayouts) }
                                ],
                                style: 'statText'
                            },
                            {
                                text: [
                                    { text: 'Last Month: ', bold: true },
                                    { text: formatCurrency(earnings.lastMonthEarnings) }
                                ],
                                style: 'statText'
                            }
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: `Monthly Growth: ${percentageChange}%`,
                        style: 'growthText',
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: 'Transaction Details',
                        style: 'sectionHeader',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', '*', '*', '*', '*'],
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
                        fontSize: 20,
                        bold: true,
                        color: '#2c3e50'
                    },
                    subheader: {
                        fontSize: 12,
                        color: '#7f8c8d'
                    },
                    sectionHeader: {
                        fontSize: 16,
                        bold: true,
                        color: '#34495e',
                        margin: [0, 15, 0, 10]
                    },
                    statText: {
                        fontSize: 11,
                        color: '#2c3e50'
                    },
                    growthText: {
                        fontSize: 12,
                        bold: true,
                        color: percentageChange >= 0 ? '#27ae60' : '#e74c3c'
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 10,
                        color: '#2c3e50',
                        alignment: 'center'
                    }
                },
                defaultStyle: {
                    fontSize: 9
                },
                pageMargins: [40, 60, 40, 60],
                pageSize: 'A4'
            };

            // Generate and download PDF
            const pdfDoc = pdfMake.createPdf(docDefinition);
            const fileName = `earnings_report_${selectedMonth.replace('-', '_')}_${currentDate.replace(/\//g, '-')}.pdf`;

            // Vừa tải xuống vừa mở trong tab mới
            pdfDoc.download(fileName);
            pdfDoc.open();

            showSuccessToast("Earnings PDF exported successfully!");
        } catch (error) {
            console.error('PDF export error:', error);
            showErrorToast("Failed to export PDF!");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="earnings-page">
            <div className="page-header">
                <div>
                    <h1>Earnings</h1>
                    <p className="page-subtitle">Track your rental income and transactions</p>
                </div>
                <div className="header-actions">
                    <input
                        className="searchInput"
                        type="text"
                        placeholder="Search by car or renter..."
                        value={search}
                        onChange={handleSearchChange}
                        style={{ marginRight: 8 }}
                    />
                    <select
                        className="statusSelect"
                        value={statusFilter}
                        onChange={handleStatusChange}
                        style={{ marginRight: 8 }}
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <div className="date-filter-container">
                        <i className="fas fa-calendar-alt date-icon"></i>
                        <input
                            className="date-filter"
                            type="month"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                        />
                    </div>
                    <button 
                        className="export-btn"
                        onClick={exportToPDF}
                        style={{
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginLeft: '15px'
                        }}
                    >
                        <i className="fas fa-file-pdf"></i>
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="earnings-overview">
                <div className="earnings-card total-earnings">
                    <div className="card-content">
                        <h3>Total Earnings</h3>
                        <p className="amount">{formatCurrency(earnings.totalEarnings)}</p>
                        <p className="comparison">+12% from last month</p>
                    </div>
                    <i className="fas fa-dollar-sign card-icon"></i>
                </div>
                <div className="earnings-card this-month">
                    <div className="card-content">
                        <h3>This Month</h3>
                        <p className="amount">{formatCurrency(earnings.monthlyEarnings)}</p>
                        <p className="period">{getMonthYear(selectedMonth)}</p>
                    </div>
                    <i className="fas fa-calendar-alt card-icon"></i>
                </div>
                <div className="earnings-card pending-payouts">
                    <div className="card-content">
                        <h3>Pending Payouts</h3>
                        <p className="amount">{formatCurrency(earnings.pendingPayouts)}</p>
                        <p className="comparison">All payments processed</p>
                    </div>
                    <i className="fas fa-clock card-icon"></i>
                </div>
                <div className="earnings-card last-month">
                    <div className="card-content">
                        <h3>Last Month</h3>
                        <p className="amount">{formatCurrency(earnings.lastMonthEarnings)}</p>
                        <p className="period">{getLastMonthYear(selectedMonth)}</p>
                    </div>
                    <i className="fas fa-chart-bar card-icon"></i>
                </div>
            </div>

            <div className="transactions-section">
                <div className="transactions-header">
                    <h3><i className="fas fa-credit-card"></i> Recent Transactions</h3>
                    <p>Your latest rental payments and bookings</p>
                </div>
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Car</th>
                            <th>Renter</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions && filteredTransactions.length > 0 ? filteredTransactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td>{transaction.date ? new Date(transaction.date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                <td><i className="fas fa-car icon-prefix"></i> {transaction.carName}</td>
                                <td><i className="fas fa-user icon-prefix"></i> {transaction.renterName}</td>
                                <td className="amount-cell">{formatCurrency(transaction.amount)}</td>
                                <td>
                                    <span className={`status-badge status-${transaction.status?.toLowerCase()}`}>
                                        <i className="fas fa-check-circle"></i> {transaction.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5">No transactions for this month.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EarningsPage; 