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
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0 ₫';
    }
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Format currency without rounding for exact display
const formatCurrencyExact = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0 ₫';
    }
    // Keep exact decimal places to avoid rounding issues
    return Math.floor(amount).toLocaleString('vi-VN') + ' ₫';
};

const formatPaymentMethod = (paymentMethod) => {
    if (!paymentMethod) return 'N/A';
    
    switch (paymentMethod.toUpperCase()) {
        case 'CASH':
            return 'Cash';
        case 'BANKING':
        case 'BANK_TRANSFER':
            return 'Bank Transfer';
        case 'CREDIT_CARD':
            return 'Credit Card';
        case 'DEBIT_CARD':
            return 'Debit Card';
        case 'E_WALLET':
            return 'E-Wallet';
        default:
            return paymentMethod;
    }
};

const getPaymentMethodIcon = (paymentMethod) => {
    if (!paymentMethod) return 'fa-question-circle';
    
    switch (paymentMethod.toUpperCase()) {
        case 'CASH':
            return 'fa-money-bill-wave';
        case 'BANKING':
        case 'BANK':
            return 'fa-university';
        case 'CREDIT_CARD':
        case 'DEBIT_CARD':
            return 'fa-credit-card';
        case 'E_WALLET':
            return 'fa-wallet';
        default:
            return 'fa-question-circle';
    }
};
const EarningsPage = () => {
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingPayouts: 0,
        lastMonthEarnings: 0,
        totalCash: 0,
        totalBanking: 0,
        totalProfit: 0, // Added for profit
        totalDebt: 0 // Added for debt
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawNote, setWithdrawNote] = useState('');
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [showDebtPaymentModal, setShowDebtPaymentModal] = useState(false);
    const [showConfirmDebtModal, setShowConfirmDebtModal] = useState(false);
    const [pendingOrderCode, setPendingOrderCode] = useState(null);

    // Check for debt payment result
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const debtPaymentResult = urlParams.get('debt_payment');
        
        if (debtPaymentResult === 'success') {
            showSuccessToast('Thanh toán nợ thành công! Số nợ đã được cập nhật.');
            // Remove the parameter from URL
            const newUrl = window.location.pathname;
            window.history.replaceState(null, null, newUrl);
        } else if (debtPaymentResult === 'cancel') {
            showErrorToast('Thanh toán nợ đã bị hủy.');
            // Remove the parameter from URL
            const newUrl = window.location.pathname;
            window.history.replaceState(null, null, newUrl);
        }
    }, []);

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
                    totalEarnings: data.totalEarnings || 0,
                    monthlyEarnings: data.monthlyEarnings || 0,
                    pendingPayouts: data.pendingPayouts || 0,
                    lastMonthEarnings: data.lastMonthEarnings || 0,
                    totalCash: data.totalCash || 0,
                    totalBanking: data.totalBanking || 0,
                    totalProfit: data.totalProfit || 0, // Set profit
                    totalDebt: data.totalDebt || 0, // Set debt
                    balance: data.balance || 0 // Lấy số dư thực tế
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
                    { text: 'Payment Method', style: 'tableHeader' },
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
                        formatPaymentMethod(transaction.paymentMethod),
                        transaction.status || 'N/A'
                    ]);
                });
            } else {
                tableBody.push([
                    { text: 'No transactions for this month.', colSpan: 6, alignment: 'center' }
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
                        margin: [0, 0, 0, 10]
                    },
                    {
                        columns: [
                            {
                                text: [
                                    { text: 'Total Cash: ', bold: true },
                                    { text: formatCurrency(earnings.totalCash) }
                                ],
                                style: 'statText'
                            },
                            {
                                text: [
                                    { text: 'Total Banking: ', bold: true },
                                    { text: formatCurrency(earnings.totalBanking) }
                                ],
                                style: 'statText'
                            }
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    {
                        columns: [
                            {
                                text: [
                                    { text: 'Total Profit (Lãi): ', bold: true },
                                    { text: formatCurrency(earnings.totalProfit) }
                                ],
                                style: 'statText'
                            },
                            {
                                text: [
                                    { text: 'Total Debt (Nợ): ', bold: true },
                                    { text: formatCurrency(earnings.totalDebt) }
                                ],
                                style: 'statText'
                            }
                        ],
                        margin: [0, 0, 0, 10]
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
                            widths: ['*', '*', '*', '*', '*', '*'],
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

    const handleWithdraw = async () => {
        // Kiểm tra có tiền để rút không (dùng balance thay vì totalProfit)
        if (earnings.balance <= 0) {
            showErrorToast("Không có tiền để rút! Tổng tiền thu qua hệ thống: " + formatCurrency(earnings.balance));
            return;
        }

        // Kiểm tra số tiền rút có vượt quá không
        const withdrawAmountFloat = parseFloat(withdrawAmount);
        const availableAmount = Math.floor(earnings.balance); // Sử dụng balance thay vì totalProfit
        if (withdrawAmountFloat > availableAmount) {
            showErrorToast(`Số tiền rút vượt quá tổng tiền thu qua hệ thống! Tối đa: ${availableAmount} ₫`);
            return;
        }

        setWithdrawLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            await axios.post(`${API_URL}/owner-withdraw`, {
                ownerId: user.userId,
                amount: withdrawAmountFloat,
                note: withdrawNote
            });
            showSuccessToast("Yêu cầu rút tiền đã được gửi!");
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            setWithdrawNote('');
        } catch {
            showErrorToast("Gửi yêu cầu thất bại!");
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleDebtPayment = () => {
        if (earnings.totalDebt <= 0) {
            showErrorToast("Không có nợ cần thanh toán!");
            return;
        }
        setShowDebtPaymentModal(true);
    };

    const processDebtPayment = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            // Gửi request tạo link thanh toán nợ, backend trả về orderCode
            const debtPaymentRequest = {
                ownerId: user.userId,
                amount: earnings.totalDebt,
                description: `Tra no he thong`,
                // returnUrl/cancelUrl sẽ được set sau khi có orderCode
            };
            // Gọi backend để lấy orderCode trước
            const tempOrderCode = Date.now().toString();
            debtPaymentRequest.orderCode = tempOrderCode;
            debtPaymentRequest.returnUrl = `${window.location.origin}/owner?tab=earnings&debt_payment=success&orderCode=${tempOrderCode}`;
            debtPaymentRequest.cancelUrl = `${window.location.origin}/owner?tab=earnings&debt_payment=cancel&orderCode=${tempOrderCode}`;
            const paymentResponse = await axios.post(`${API_URL}/debt-payment/create`, debtPaymentRequest);
            if (paymentResponse.data.data && paymentResponse.data.data.checkoutUrl) {
                window.location.href = paymentResponse.data.data.checkoutUrl;
            } else {
                showErrorToast('Không thể chuyển hướng đến trang thanh toán. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Debt payment error:', error);
            showErrorToast('Có lỗi xảy ra khi thanh toán nợ!');
        }
    };

    const handleConfirmDebt = async () => {
        if (!pendingOrderCode) return;
        try {
            await axios.post(`${API_URL}/debt-payment/confirm`, { orderCode: pendingOrderCode });
            showSuccessToast('Đã xác nhận thanh toán nợ!');
            setShowConfirmDebtModal(false);
            setPendingOrderCode(null);
            // Xóa param khỏi URL và reload earnings
            window.history.replaceState(null, null, window.location.pathname);
            window.location.reload();
        } catch {
            showErrorToast('Xác nhận thất bại!');
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const debtPaymentResult = urlParams.get('debt_payment');
        const orderCode = urlParams.get('orderCode');
        if (debtPaymentResult === 'success' && orderCode) {
            setShowConfirmDebtModal(true);
            setPendingOrderCode(orderCode);
        } else if (debtPaymentResult === 'cancel') {
            showErrorToast('Thanh toán nợ đã bị hủy.');
            const newUrl = window.location.pathname;
            window.history.replaceState(null, null, newUrl);
        }
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Tính phần trăm tăng/giảm thực tế giữa tháng này và tháng trước
    const percentageChange = earnings.lastMonthEarnings > 0
        ? ((earnings.monthlyEarnings - earnings.lastMonthEarnings) / earnings.lastMonthEarnings * 100).toFixed(1)
        : (earnings.monthlyEarnings > 0 ? 100 : 0);

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
            <div className="earnings-summary">
                
            </div>

            <div className="earnings-overview">
                <div className="earnings-card total-earnings">
                    <div className="card-content">
                        <h3>Total Earnings</h3>
                        <p className="amount">{formatCurrency(earnings.totalEarnings)}</p>
                        <p className="comparison" style={{ color: percentageChange >= 0 ? '#fff' : '#e74c3c', fontWeight: 'bold' }}>
                            {percentageChange > 0 ? '+' : ''}{percentageChange}% from last month
                        </p>
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
                <div className="earnings-card total-cash">
                    <div className="card-content">
                        <h3>Total Cash</h3>
                        <p className="amount">{formatCurrency(earnings.totalCash)}</p>
                        <p className="comparison">Cash collected</p>
                    </div>
                    <i className="fas fa-money-bill-wave card-icon"></i>
                </div>
                <div className="earnings-card total-banking">
                    <div className="card-content">
                        <h3>Total Banking</h3>
                        <p className="amount">{formatCurrency(earnings.totalBanking)}</p>
                        <p className="comparison">Bank transfers</p>
                    </div>
                    <i className="fas fa-university card-icon"></i>
                </div>
                <div className="earnings-card total-profit">
                    <div className="card-content">
                        <h3 style={{color: '#000'}}> Tiền trên hệ thống</h3>
                        <p className="amount" style={{color: '#27ae60', fontWeight: 'bold'}}>{formatCurrency(earnings.totalProfit)}</p>
                        <p style={{color: '#000'}}className="comparison">Lợi nhuận banking sau khi trừ phí 2% mỗi giao dịch</p>
                    </div>
                    <i style={{color: '#000'}}className="fas fa-piggy-bank card-icon"></i>
                </div>                
                <div className="earnings-card total-debt">
                    <div className="card-content">
                        <h3 style={{color: '#000'}}> Tiền nợ hệ thống</h3>
                        <p className="amount" style={{color: '#e74c3c', fontWeight: 'bold'}}>{formatCurrency(earnings.totalDebt)}</p>
                        <p style={{color: '#000'}}className="comparison">Nợ hệ thống sau 2% mỗi giao dịch cash</p>
                    </div>
                    <i style={{color: '#000'}} className="fas fa-exclamation-triangle card-icon"></i>
                </div>
                <div className="earnings-card total-profit">
                    <div className="card-content">
                        <h3 style={{color: '#000'}}> Tổng tiền thu qua hệ thống </h3>
                        <p className="amount" style={{color: '#27ae60', fontWeight: 'bold'}}>{formatCurrency(earnings.balance)}</p>
                        <p style={{color: '#000'}}className="comparison">Tổng tiền thu qua hệ thống sau khi trừ nợ</p>
                    </div>
                    <i style={{color: '#000'}} className="fas fa-piggy-bank card-icon"></i>
                </div>
            </div>
            
            {/* Action buttons section */}
            <div style={{marginBottom: 10, display: 'flex', gap: '10px', alignItems: 'center'}}>
                {earnings.balance > 0 ? (
                    <button 
                        className="withdraw-btn" 
                        onClick={() => setShowWithdrawModal(true)} 
                        style={{background: '#27ae60', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 500, cursor: 'pointer'}}
                    >
                        Rút tiền
                    </button>
                ) : (
                    <button 
                        className="withdraw-btn-disabled" 
                        disabled
                        style={{background: '#ccc', color: '#666', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 500, cursor: 'not-allowed'}}
                    >
                        Không thể rút tiền
                    </button>
                )}
                
                {earnings.totalDebt > 0 && (
                    <button 
                        className="debt-payment-btn" 
                        onClick={handleDebtPayment}
                        style={{background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 500, cursor: 'pointer'}}
                    >
                        Trả nợ ({formatCurrency(earnings.totalDebt)})
                    </button>
                )}
                
                {earnings.balance <= 0 && earnings.totalDebt > 0 && (
                    <div style={{color: '#e74c3c', fontWeight: 500, fontSize: '14px'}}>
                        ⚠️ Bạn cần thanh toán nợ trước khi có thể rút tiền
                    </div>
                )}
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
                            <th>Payment Method</th>
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
                                    <span className={`payment-method-badge payment-${transaction.paymentMethod?.toLowerCase()}`}>
                                        <i className={`fas ${getPaymentMethodIcon(transaction.paymentMethod)}`}></i> 
                                        {formatPaymentMethod(transaction.paymentMethod)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge status-${transaction.status?.toLowerCase()}`}>
                                        <i className="fas fa-check-circle"></i> {transaction.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6">No transactions for this month.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showWithdrawModal && (
      <div className="modal-backdrop" style={{position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="modal-content" style={{background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.15)'}}>
          <h3>Yêu cầu rút tiền</h3>
          <input
            type="number"
            min="1000"
            max={Math.floor(earnings.balance)}
            placeholder={`Số tiền muốn rút (Tối đa: ${formatCurrencyExact(earnings.balance)})`}
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            style={{width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #ccc'}}
          />
          <div style={{fontSize: '12px', color: '#666', marginBottom: 12}}>
            Tổng tiền thu qua hệ thống: {formatCurrencyExact(earnings.balance)} (chính xác: {earnings.balance} ₫)
          </div>
          <textarea
            placeholder="Ghi chú (nếu có)"
            value={withdrawNote}
            onChange={e => setWithdrawNote(e.target.value)}
            style={{width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #ccc'}}
          />
          <button onClick={handleWithdraw} disabled={withdrawLoading || !withdrawAmount} style={{background: '#27ae60', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 500, marginRight: 8}}>
            {withdrawLoading ? "Đang gửi..." : "Xác nhận rút tiền"}
          </button>
          <button onClick={() => setShowWithdrawModal(false)} style={{background: '#eee', color: '#333', border: 'none', borderRadius: 5, padding: '8px 18px', fontWeight: 500}}>Hủy</button>
        </div>
      </div>
    )}

    {/* Debt Payment Modal */}
    {showDebtPaymentModal && (
      <div className="modal-backdrop" style={{position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="modal-content" style={{background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.15)'}}>
          <h3 style={{color: '#e74c3c'}}>Thanh toán nợ hệ thống</h3>
          <div style={{marginBottom: 16}}>
            <strong>Số tiền nợ: {formatCurrency(earnings.totalDebt)}</strong>
          </div>
          <p style={{color: '#666', marginBottom: 20}}>
            Bạn sẽ được chuyển hướng đến trang thanh toán ngân hàng để thanh toán số nợ này. 
            Sau khi thanh toán thành công, số nợ sẽ được xóa khỏi tài khoản của bạn.
          </p>
          <button 
            onClick={processDebtPayment} 
            style={{background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 5, padding: '10px 20px', fontWeight: 500, marginRight: 8}}
          >
            Thanh toán ngay
          </button>
          <button 
            onClick={() => setShowDebtPaymentModal(false)} 
            style={{background: '#eee', color: '#333', border: 'none', borderRadius: 5, padding: '10px 20px', fontWeight: 500}}
          >
            Hủy
          </button>
        </div>
      </div>
    )}

    {showConfirmDebtModal && (
      <div className="modal-backdrop" style={{position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="modal-content" style={{background: '#fff', borderRadius: 10, padding: 36, minWidth: 350, boxShadow: '0 2px 24px rgba(0,0,0,0.18)'}}>
          <h2 style={{color: '#e74c3c', marginBottom: 16, textAlign: 'center'}}>Xác nhận thanh toán nợ</h2>
          <div style={{background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', borderRadius: 6, padding: 12, marginBottom: 18, fontSize: 15, textAlign: 'center'}}>
            <b>Thanh toán nợ thành công qua PayOS!</b><br/>
            Số tiền nợ sẽ chỉ được trừ khỏi tài khoản khi bạn bấm <b>Xác nhận</b>.<br/>
            <span style={{color: '#e74c3c', fontWeight: 600}}>Số tiền nợ: {formatCurrency(earnings.totalDebt)}</span>
          </div>
          <p style={{marginBottom: 20, color: '#333', textAlign: 'center'}}>Vui lòng kiểm tra lại số tiền và bấm <b>Xác nhận thanh toán nợ</b> để hoàn tất trừ nợ trên hệ thống.</p>
          <div style={{display: 'flex', justifyContent: 'center', gap: 12}}>
            <button onClick={handleConfirmDebt} style={{background: '#27ae60', color: '#fff', border: 'none', borderRadius: 5, padding: '10px 28px', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px rgba(39,174,96,0.08)', cursor: 'pointer'}}>
              Xác nhận thanh toán nợ
            </button>
            <button onClick={() => setShowConfirmDebtModal(false)} style={{background: '#eee', color: '#333', border: 'none', borderRadius: 5, padding: '10px 22px', fontWeight: 500, fontSize: 15, cursor: 'pointer'}}>Đóng</button>
          </div>
        </div>
      </div>
    )}
        </div>
    );
};

export default EarningsPage; 