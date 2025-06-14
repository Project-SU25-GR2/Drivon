import React, { useState } from 'react';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        fullName: 'Nguyen Van A',
        email: 'nguyenvana@example.com',
        phone: '0123456789',
        address: '123 Street, District 1, Ho Chi Minh City',
        bankAccount: '1234567890',
        bankName: 'Vietcombank'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProfile(editedProfile);
        setIsEditing(false);
    };

    return (
        <div className="owner-content-page">
            <div className="page-header">
                <h2>Profile</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <div className="profile-content">
                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={editedProfile.fullName}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={editedProfile.email}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={editedProfile.phone}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={editedProfile.address}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Bank Account</label>
                            <input
                                type="text"
                                name="bankAccount"
                                value={editedProfile.bankAccount}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Bank Name</label>
                            <input
                                type="text"
                                name="bankName"
                                value={editedProfile.bankName}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <button type="submit" className="btn btn-success">
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <div className="profile-info">
                        <div className="info-group">
                            <label>Full Name</label>
                            <p>{profile.fullName}</p>
                        </div>
                        <div className="info-group">
                            <label>Email</label>
                            <p>{profile.email}</p>
                        </div>
                        <div className="info-group">
                            <label>Phone</label>
                            <p>{profile.phone}</p>
                        </div>
                        <div className="info-group">
                            <label>Address</label>
                            <p>{profile.address}</p>
                        </div>
                        <div className="info-group">
                            <label>Bank Account</label>
                            <p>{profile.bankAccount}</p>
                        </div>
                        <div className="info-group">
                            <label>Bank Name</label>
                            <p>{profile.bankName}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage; 