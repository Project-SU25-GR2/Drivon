import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="owner-content-page">
            <div className="page-header">
                <h2>Earnings</h2>
                <div className="date-filter">
                    <input 
                        type="month" 
                        className="form-control"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                    />
                </div>
            </div>

            <div className="earnings-overview">
                <div className="earnings-card">
                    <h3>Total Earnings</h3>
                    <p className="amount">{formatCurrency(earnings.totalEarnings)}</p>
                </div>
                <div className="earnings-card">
                    <h3>Earnings ({selectedMonth})</h3>
                    <p className="amount">{formatCurrency(earnings.monthlyEarnings)}</p>
                </div>
                <div className="earnings-card">
                    <h3>Pending Payouts</h3>
                    <p className="amount">{formatCurrency(earnings.pendingPayouts)}</p>
                </div>
                <div className="earnings-card">
                    <h3>Last Month Earnings</h3>
                    <p className="amount">{formatCurrency(earnings.lastMonthEarnings)}</p>
                </div>
            </div>

            <div className="transactions-section">
                <h3>Recent Transactions</h3>
                <table className="table">
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
                        {transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}</td>
                                <td>{transaction.carName}</td>
                                <td>{transaction.renterName}</td>
                                <td>{formatCurrency(transaction.amount)}</td>
                                <td>
                                    <span className={`status-badge ${transaction.status?.toLowerCase()}`}>
                                        {transaction.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EarningsPage; 