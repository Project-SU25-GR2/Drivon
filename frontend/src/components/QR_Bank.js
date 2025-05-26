import React from 'react';

function QR_Bank({ user, onLogout }) {
    return (
        <div className="qr-bank">
            <header className="qr-bank-header">
                <h1>QR Bank</h1>
                <div className="user-info">
                    <span>Welcome, {user.fullName}</span>
                    <button
                        onClick={onLogout}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '10px'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>
            <main className="qr-bank-content">
                {/* Add your QR Bank content here */}
                <h2>QR Bank Dashboard</h2>
                {/* Add more components and features as needed */}
            </main>
        </div>
    );
}

export default QR_Bank; 