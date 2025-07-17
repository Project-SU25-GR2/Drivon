import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';
import './PromotionPage.css';

const getStatus = (promo) => {
    if (promo.usedCount >= promo.maxUses) return 'Expired';
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) return 'Expired';
    if (promo.usedCount > 0) return 'Active';
    return 'Unused';
};

const PromotionPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCode, setNewCode] = useState('');
    const [newDiscount, setNewDiscount] = useState('');
    const [newValidUntil, setNewValidUntil] = useState('');
    const [newMaxUsers, setNewMaxUsers] = useState('');
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ code: '', discount_percent: '', valid_until: '', maxUses: '' });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/promotions`);
            setPromotions(res.data);
        } catch (err) {
            setError('Unable to load promotion list');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPromotion = async (e) => {
        e.preventDefault();
        if (!newCode || !newDiscount || !newValidUntil) {
            showErrorToast('Please enter all information');
            return;
        }
        try {
            await axios.post(`${API_URL}/promotions`, {
                code: newCode,
                discount_percent: parseInt(newDiscount),
                valid_until: newValidUntil,
                maxUses: newMaxUsers ? parseInt(newMaxUsers) : null
            });
            showSuccessToast('Promotion added successfully!');
            setNewCode(''); setNewDiscount(''); setNewValidUntil(''); setNewMaxUsers('');
            fetchPromotions();
        } catch (err) {
            showErrorToast('Failed to add promotion');
        }
    };

    const handleDeletePromotion = async (promo_id) => {
        if (!window.confirm('Are you sure you want to delete this code?')) return;
        try {
            await axios.delete(`${API_URL}/promotions/${promo_id}`);
            showSuccessToast('Promotion deleted successfully!');
            fetchPromotions();
        } catch (err) {
            showErrorToast('Failed to delete promotion');
        }
    };

    const handleEditClick = (promo) => {
        setEditId(promo.promo_id);
        setEditData({
            code: promo.code,
            discount_percent: promo.discount_percent,
            valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 10) : '',
            maxUses: promo.maxUses ?? ''
        });
    };

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleEditSave = async (promo_id) => {
        try {
            await axios.put(`${API_URL}/promotions/${promo_id}`, {
                code: editData.code,
                discount_percent: parseInt(editData.discount_percent),
                valid_until: editData.valid_until,
                maxUses: editData.maxUses ? parseInt(editData.maxUses) : null
            });
            showSuccessToast('Promotion updated successfully!');
            setEditId(null);
            fetchPromotions();
        } catch (err) {
            showErrorToast('Failed to update promotion');
        }
    };

    const handleEditCancel = () => {
        setEditId(null);
    };

    // Stats
    const totalPromotions = promotions.length;
    const totalUsage = promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0);
    const activeCodes = promotions.filter(p => getStatus(p) === 'Active' || getStatus(p) === 'Unused').length;

    return (
        <div className="promotion-management-bg">
            <div className="promotion-card">
                <div className="promotion-header">
                    <h2>+ Create New Promotion</h2>
                    <span className="promotion-desc">Add a new promotional code with discount details and usage limits</span>
                </div>
                <form className="add-promotion-form" onSubmit={handleAddPromotion}>
                    <div className="input-icon-group">
                        <span className="input-icon"><i className="bi bi-tags-fill"></i></span>
                        <input type="text" placeholder="e.g., SUMMER25" value={newCode} onChange={e => setNewCode(e.target.value)} />
                    </div>
                    <div className="input-icon-group">
                        <span className="input-icon"><i className="bi bi-cash-coin"></i></span>
                        <input type="number" placeholder="25 %" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} min={1} max={100} />
                    </div>
                    <div className="input-icon-group">
                        <span className="input-icon"><i className="bi bi-calendar-event"></i></span>
                        <input type="date" value={newValidUntil} onChange={e => setNewValidUntil(e.target.value)} />
                    </div>
                    <div className="input-icon-group">
                        <span className="input-icon"><i className="bi bi-people-fill"></i></span>
                        <input type="number" placeholder="1000" value={newMaxUsers} onChange={e => setNewMaxUsers(e.target.value)} min={1} />
                    </div>
                    <button type="submit" className="add-promotion-btn">+ Add Promotion</button>
                </form>
            </div>
            <div className="promotion-card">
                <div className="promotion-header">
                    <h3>Active Promotions</h3>
                    <span className="promotion-desc">Manage your existing promotional codes and track their usage</span>
                </div>
                {loading ? <p>Loading...</p> : error ? <p style={{color:'red'}}>{error}</p> : (
                    <table className="promotion-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Valid Until</th>
                                <th>Usage</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map(promo => {
                                const status = getStatus(promo);
                                const usagePercent = promo.maxUses ? Math.min(100, Math.round((promo.usedCount || 0) / promo.maxUses * 100)) : 0;
                                const isEditing = editId === promo.promo_id;
                                return (
                                    <tr key={promo.promo_id} className={isEditing ? 'editing-row' : ''}>
                                        <td>#{promo.promo_id}</td>
                                        {isEditing ? (
                                            <>
                                                <td><input name="code" value={editData.code} onChange={handleEditChange} /></td>
                                                <td><input name="discount_percent" type="number" min={1} max={100} value={editData.discount_percent} onChange={handleEditChange} /> %</td>
                                                <td><input name="valid_until" type="date" value={editData.valid_until} onChange={handleEditChange} /></td>
                                                <td><input name="maxUses" type="number" min={1} value={editData.maxUses} onChange={handleEditChange} /></td>
                                                <td>{promo.usedCount ?? ''}</td>
                                                <td>
                                                    <button className="save-promotion-button" onClick={() => handleEditSave(promo.promo_id)}>
                                                        <i className="bi bi-check-lg"></i>
                                                    </button>
                                                    <button className="cancel-promotion-button" onClick={handleEditCancel}>
                                                        <i className="bi bi-x-lg"></i>
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td><span className="code-badge">{promo.code}</span></td>
                                                <td>
                                                    <span className={`discount-badge discount-${promo.discount_percent}`}>{promo.discount_percent}% OFF</span>
                                                </td>
                                                <td>{promo.valid_until ? new Date(promo.valid_until).toLocaleDateString() : ''}</td>
                                                <td>
                                                    <div className="usage-bar">
                                                        <div className="usage-bar-fill" style={{ width: `${usagePercent}%` }}></div>
                                                    </div>
                                                    <span className="usage-label">{promo.usedCount || 0} / {promo.maxUses || 0}</span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
                                                </td>
                                                <td>
                                                    <button className="edit-promotion-button" onClick={() => handleEditClick(promo)} title="Edit"><i className="bi bi-pencil-square"></i></button>
                                                    <button className="delete-promotion-button" onClick={() => handleDeletePromotion(promo.promo_id)} title="Remove"><i className="bi bi-trash"></i></button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="stats-row">
                <div className="stat-card_promotion">
                    <span className="stat-icon"><i className="bi bi-tags-fill"></i></span>
                    <div className="stat-value">{totalPromotions}</div>
                    <div className="stat-label">Total Promotions</div>
                </div>
                <div className="stat-card_promotion">
                    <span className="stat-icon"><i className="bi bi-people-fill"></i></span>
                    <div className="stat-value">{activeCodes}</div>
                    <div className="stat-label">Active Codes</div>
                </div>
                <div className="stat-card_promotion">
                    <span className="stat-icon"><i className="bi bi-percent"></i></span>
                    <div className="stat-value">{totalUsage}</div>
                    <div className="stat-label">Total Usage</div>
                </div>
            </div>
        </div>
    );
};

export default PromotionPage; 