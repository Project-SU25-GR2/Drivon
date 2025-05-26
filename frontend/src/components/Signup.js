import React, { useState } from 'react';
import api from '../api/config';

function Signup({ onSignupSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        fullName: '',
        address: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/auth/signup', formData);
            onSignupSuccess(response.data);
        } catch (err) {
            setError(err.response?.data || 'Signup failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                        placeholder="Email"
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                        placeholder="Phone"
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                        placeholder="Password"
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                        placeholder="Full Name"
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                        placeholder="Address"
                        required
                    />
                </div>
                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginBottom: '15px',
                        padding: '10px',
                        backgroundColor: '#ffebee',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}

export default Signup; 