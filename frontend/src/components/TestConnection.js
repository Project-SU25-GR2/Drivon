import React, { useState, useEffect } from 'react';
import api from '../api/config';

function TestConnection() {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const testConnection = async () => {
        try {
            const response = await api.get('/api/test/hello');
            setMessage(response.data);
            setError('');
        } catch (err) {
            setError('Error connecting to backend: ' + err.message);
            setMessage('');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Test Backend Connection</h2>
            <button 
                onClick={testConnection}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Test Connection
            </button>
            
            {message && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    borderRadius: '5px'
                }}>
                    {message}
                </div>
            )}
            
            {error && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '5px'
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}

export default TestConnection; 