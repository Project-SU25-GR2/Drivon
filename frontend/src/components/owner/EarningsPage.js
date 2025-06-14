import React, { useState } from 'react';

const EarningsPage = () => {
    const [earnings, setEarnings] = useState({
        totalEarnings: '₫45,000,000',
        monthlyEarnings: '₫15,000,000',
        pendingPayouts: '₫5,000,000',
        lastPayout: '₫10,000,000'
    });

    const [transactions, setTransactions] = useState([
        {
            id: 1,
            date: '2024-03-15',
            type: 'Rental Income',
            amount: '₫7,500,000',
            status: 'Completed'
        },
        {
            id: 2,
            date: '2024-03-10',
            type: 'Rental Income',
            amount: '₫9,000,000',
            status: 'Pending'
        }
    ]);

    return (
        <div className="owner-content-page">
            <div className="page-header">
                <h2>Earnings</h2>
                <div className="date-filter">
                    <input 
                        type="month" 
                        className="form-control"
                        defaultValue="2024-03"
                    />
                </div>
            </div>

            <div className="earnings-overview">
                <div className="earnings-card">
                    <h3>Total Earnings</h3>
                    <p className="amount">{earnings.totalEarnings}</p>
                </div>
                <div className="earnings-card">
                    <h3>Monthly Earnings</h3>
                    <p className="amount">{earnings.monthlyEarnings}</p>
                </div>
                <div className="earnings-card">
                    <h3>Pending Payouts</h3>
                    <p className="amount">{earnings.pendingPayouts}</p>
                </div>
                <div className="earnings-card">
                    <h3>Last Payout</h3>
                    <p className="amount">{earnings.lastPayout}</p>
                </div>
            </div>

            <div className="transactions-section">
                <h3>Recent Transactions</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td>{transaction.date}</td>
                                <td>{transaction.type}</td>
                                <td>{transaction.amount}</td>
                                <td>
                                    <span className={`status-badge ${transaction.status.toLowerCase()}`}>
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