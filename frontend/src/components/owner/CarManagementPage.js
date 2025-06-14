import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CarManagementPage.css';

const CarManagementPage = ({ user }) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/cars/owner/${user.userId}`);
                setCars(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cars:', error);
                setError('Failed to load cars. Please try again later.');
                setLoading(false);
            }
        };

        if (user && user.userId) {
            fetchCars();
        }
    }, [user]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="car-management">
            <div className="car-management-header">
                <h2>Car Management</h2>
                <button className="add-car-btn">Add New Car</button>
            </div>

            <div className="cars-grid">
                {cars.map((car) => (
                    <div key={car.licensePlate} className="car-card">
                        <div className="car-image">
                            {car.images && car.images.length > 0 ? (
                                <img src={car.images[0]} alt={`${car.brand} ${car.model}`} />
                            ) : (
                                <div className="no-image">No Image Available</div>
                            )}
                        </div>
                        <div className="car-info">
                            <h3>{car.brand} {car.model}</h3>
                            <p className="license-plate">License: {car.licensePlate}</p>
                            <p className="year">Year: {car.year}</p>
                            <p className="type">Type: {car.type}</p>
                            <p className="status">Status: {car.status}</p>
                            <p className="location">Location: {car.location}</p>
                        </div>
                        <div className="car-actions">
                            <button className="edit-btn">Edit</button>
                            <button className="delete-btn">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {cars.length === 0 && (
                <div className="no-cars">
                    <p>You haven't added any cars yet.</p>
                    <button className="add-car-btn">Add Your First Car</button>
                </div>
            )}
        </div>
    );
};

export default CarManagementPage; 