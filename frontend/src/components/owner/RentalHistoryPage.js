import React, { useState } from 'react';

const RentalHistoryPage = () => {
    const [rentals, setRentals] = useState([
        {
            id: 1,
            car: 'Toyota Camry',
            renter: 'Nguyen Van A',
            startDate: '2024-03-01',
            endDate: '2024-03-05',
            status: 'Completed',
            totalAmount: '₫7,500,000'
        },
        {
            id: 2,
            car: 'Honda CR-V',
            renter: 'Tran Thi B',
            startDate: '2024-03-10',
            endDate: '2024-03-15',
            status: 'In Progress',
            totalAmount: '₫9,000,000'
        }
    ]);

    return (
        <div className="owner-content-page">
            <div className="page-header">
                <h2>Rental History</h2>
                <div className="filters">
                    <select className="form-select">
                        <option value="">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <input 
                        type="date" 
                        className="form-control"
                        placeholder="Filter by date"
                    />
                </div>
            </div>
            
            <div className="rental-list">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Car</th>
                            <th>Renter</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Total Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentals.map(rental => (
                            <tr key={rental.id}>
                                <td>{rental.car}</td>
                                <td>{rental.renter}</td>
                                <td>{rental.startDate}</td>
                                <td>{rental.endDate}</td>
                                <td>
                                    <span className={`status-badge ${rental.status.toLowerCase().replace(' ', '-')}`}>
                                        {rental.status}
                                    </span>
                                </td>
                                <td>{rental.totalAmount}</td>
                                <td>
                                    <button className="btn btn-sm btn-info">
                                        <i className="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RentalHistoryPage; 