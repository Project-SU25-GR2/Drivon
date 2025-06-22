import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./EarningsPage.css";
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
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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
                const response = await axios.get(`http://localhost:8080/api/earnings/owner/${user.userId}`, {
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="earnings-page">
            <div className="page-header">
                <div>
                    <h1>Earnings</h1>
                    <p className="page-subtitle">Track your rental income and transactions</p>
                </div>
                <div className="date-filter-container">
                    <i className="fas fa-calendar-alt date-icon"></i>
                    <select 
                        className="date-filter"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                    >
                        {/* You can populate this with more relevant options */}
                        <option value={new Date().toISOString().slice(0,7)}>{getMonthYear(new Date().toISOString().slice(0,7))}</option>
                        <option value="2025-06">June 2025</option>
                        <option value="2025-05">May 2025</option>
                        <option value="2025-04">April 2025</option>
                    </select>
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
                        {transactions && transactions.length > 0 ? transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td>{transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A'}</td>
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